import React, { useState, useEffect, useRef } from 'react';
import { 
  Scan, 
  Search, 
  X, 
  ShoppingBag, 
  Plus, 
  Minus, 
  Check, 
  AlertCircle, 
  Printer, 
  Boxes, 
  Layers, 
  Sparkles, 
  ArrowRight, 
  Barcode, 
  Volume2, 
  VolumeX,
  Tag
} from 'lucide-react';
import { Product, Service, ClothingLot } from '../types';
import { playScanSuccessSound, IdentifiedItem, generateUniqueCode } from '../services/barcodeService';
import BarcodeBadge from './BarcodeBadge';

interface ScannerModalProps {
  isOpen: boolean;
  onClose: () => void;
  products: Product[];
  services?: Service[];
  clothingLots?: ClothingLot[];
  rawMaterials?: any[];
  onSelectForSale?: (item: { productId: string; productName: string; price: number; quantity: number; variant: string }) => void;
  onUpdateProductStock?: (productId: string, newStock: number) => void;
  onShowToast?: (title: string, message: string, type?: 'success' | 'error' | 'info') => void;
  onNavigateToPOS?: () => void;
}

export default function ScannerModal({
  isOpen,
  onClose,
  products,
  services = [],
  clothingLots = [],
  rawMaterials = [],
  onSelectForSale,
  onUpdateProductStock,
  onShowToast,
  onNavigateToPOS
}: ScannerModalProps) {
  const [scannedCode, setScannedCode] = useState('');
  const [identifiedItem, setIdentifiedItem] = useState<IdentifiedItem | null>(null);
  const [scanStatus, setScanStatus] = useState<'idle' | 'success' | 'not-found'>('idle');
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [lastScannedTime, setLastScannedTime] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Auto-focus input when modal opens
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => {
        inputRef.current?.focus();
      }, 100);
      setScanStatus('idle');
    }
  }, [isOpen]);

  const handleLookup = (codeToSearch: string) => {
    const clean = codeToSearch.trim().toUpperCase();
    if (!clean) return;

    // Search in Products
    const prod = products.find(p => 
      p.code?.toUpperCase() === clean || 
      p.sku?.toUpperCase() === clean || 
      p.id.toUpperCase() === clean
    );

    if (prod) {
      if (soundEnabled) playScanSuccessSound();
      setIdentifiedItem({
        type: 'product',
        id: prod.id,
        code: prod.code || prod.id,
        name: prod.name,
        category: prod.category,
        price: prod.price,
        stock: prod.stock,
        image: prod.images?.[0],
        description: prod.description,
        sourceItem: prod
      });
      setScanStatus('success');
      setLastScannedTime(new Date().toLocaleTimeString('es-CL'));
      return;
    }

    // Search in Services
    const serv = services.find(s => 
      s.code?.toUpperCase() === clean || 
      s.id.toUpperCase() === clean
    );

    if (serv) {
      if (soundEnabled) playScanSuccessSound();
      setIdentifiedItem({
        type: 'service',
        id: serv.id,
        code: serv.code || serv.id,
        name: serv.name,
        category: serv.category,
        price: serv.price,
        description: serv.description,
        sourceItem: serv
      });
      setScanStatus('success');
      setLastScannedTime(new Date().toLocaleTimeString('es-CL'));
      return;
    }

    // Search in Raw Materials
    const mat = rawMaterials.find(m => 
      m.code?.toUpperCase() === clean || 
      m.id?.toUpperCase() === clean
    );

    if (mat) {
      if (soundEnabled) playScanSuccessSound();
      setIdentifiedItem({
        type: 'material',
        id: mat.id,
        code: mat.code || mat.id,
        name: mat.name,
        category: mat.category,
        price: mat.unitCost,
        stock: mat.stock,
        unit: mat.unit,
        description: `Insumo de taller proveído por ${mat.supplierName || 'Proveedor local'}`,
        sourceItem: mat
      });
      setScanStatus('success');
      setLastScannedTime(new Date().toLocaleTimeString('es-CL'));
      return;
    }

    // Search in Clothing Lots
    const lot = clothingLots.find(l => 
      l.code?.toUpperCase() === clean || 
      l.id.toUpperCase() === clean
    );

    if (lot) {
      if (soundEnabled) playScanSuccessSound();
      setIdentifiedItem({
        type: 'lot',
        id: lot.id,
        code: lot.code,
        name: lot.name,
        category: 'Fardos & Ropa por Peso',
        price: lot.pricePerKg,
        stock: lot.totalWeightKg,
        unit: 'kg',
        description: `${lot.origin || 'Curaduría'} • ${lot.notes || 'Lote Textil'}`,
        sourceItem: lot
      });
      setScanStatus('success');
      setLastScannedTime(new Date().toLocaleTimeString('es-CL'));
      return;
    }

    setIdentifiedItem(null);
    setScanStatus('not-found');
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleLookup(scannedCode);
    }
  };

  // Adjust stock on the spot
  const handleStockChange = (delta: number) => {
    if (!identifiedItem || identifiedItem.type !== 'product') return;
    const currentStock = identifiedItem.stock || 0;
    const newStock = Math.max(0, currentStock + delta);
    
    if (onUpdateProductStock) {
      onUpdateProductStock(identifiedItem.id, newStock);
    }
    
    setIdentifiedItem(prev => prev ? { ...prev, stock: newStock } : null);
    if (onShowToast) {
      onShowToast('Stock Actualizado', `Nuevo stock para ${identifiedItem.name}: ${newStock} unidades.`, 'info');
    }
  };

  // Add to POS
  const handleAddToPOS = () => {
    if (!identifiedItem) return;
    
    if (onSelectForSale) {
      onSelectForSale({
        productId: identifiedItem.id,
        productName: identifiedItem.name,
        price: identifiedItem.price || 0,
        quantity: 1,
        variant: (identifiedItem.sourceItem?.variants && identifiedItem.sourceItem.variants[0]) || 'Estándar'
      });
    }

    if (onShowToast) {
      onShowToast('Agregado al Carro', `Se agregó ${identifiedItem.name} a la Venta Directa.`, 'success');
    }

    if (onNavigateToPOS) {
      onClose();
      onNavigateToPOS();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 animate-fade-in">
      <div className="bg-white rounded-3xl border border-bananur-sand shadow-2xl max-w-xl w-full p-6 sm:p-8 space-y-6 animate-scale-up">
        
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-bananur-sand/70">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-[#FAF8F5] border border-bananur-sand text-bananur-clay">
              <Scan className="w-6 h-6 text-bananur-gold-dark animate-pulse" />
            </div>
            <div>
              <h2 className="font-serif text-lg font-bold text-bananur-clay">
                Lector & Escáner de Código Único
              </h2>
              <p className="text-xs text-bananur-clay-light">
                Identificación inmediata para inventarios y venta directa en taller
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setSoundEnabled(!soundEnabled)}
              className={`p-2 rounded-xl border transition-colors cursor-pointer ${
                soundEnabled 
                  ? 'border-emerald-300 bg-emerald-50 text-emerald-800' 
                  : 'border-bananur-sand bg-white text-bananur-clay-light'
              }`}
              title={soundEnabled ? 'Sonido POS activado' : 'Silenciado'}
            >
              {soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
            </button>
            <button
              type="button"
              onClick={onClose}
              className="p-2 text-bananur-clay-light hover:text-black rounded-xl cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Barcode Scanner Input */}
        <div className="space-y-2">
          <div className="relative">
            <input
              ref={inputRef}
              type="text"
              value={scannedCode}
              onChange={(e) => setScannedCode(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Escanea con pistola de código de barras o escribe el código (ej. BNN-3D-0101)..."
              className="w-full pl-11 pr-24 py-3.5 bg-[#FAF8F5] border-2 border-bananur-sand rounded-2xl text-sm font-mono text-bananur-clay focus:outline-none focus:border-bananur-gold uppercase tracking-wider font-bold shadow-inner"
            />
            <Barcode className="w-5 h-5 text-bananur-gold-dark absolute left-3.5 top-4" />
            <button
              type="button"
              onClick={() => handleLookup(scannedCode)}
              className="absolute right-2 top-2 px-3.5 py-2 bg-bananur-clay hover:bg-bananur-gold hover:text-black text-white rounded-xl text-xs font-bold font-mono uppercase tracking-wider transition-all cursor-pointer shadow-2xs"
            >
              Identificar
            </button>
          </div>

          <div className="flex flex-wrap items-center justify-between text-[11px] text-bananur-clay-light px-1">
            <span>Compatible con cualquier lector USB/Bluetooth o tipeo rápido.</span>
            {lastScannedTime && <span>Última lectura: {lastScannedTime}</span>}
          </div>
        </div>

        {/* Quick Sample Chips to Test Scanning */}
        <div className="space-y-1.5 pt-1">
          <span className="text-[10px] font-mono uppercase font-bold text-bananur-clay-light">
            Códigos de Prueba Rápida (1 Clic para Probar):
          </span>
          <div className="flex flex-wrap gap-1.5">
            {products.slice(0, 4).map(p => (
              <button
                key={p.id}
                type="button"
                onClick={() => {
                  setScannedCode(p.code || p.id);
                  handleLookup(p.code || p.id);
                }}
                className="px-2.5 py-1 bg-white hover:bg-bananur-sand/30 border border-bananur-sand rounded-lg text-[10px] font-mono font-bold text-bananur-clay transition-all cursor-pointer"
              >
                🏷️ {p.code || p.id} ({p.name.slice(0, 18)}...)
              </button>
            ))}
            {services.slice(0, 1).map(s => (
              <button
                key={s.id}
                type="button"
                onClick={() => {
                  setScannedCode(s.code || s.id);
                  handleLookup(s.code || s.id);
                }}
                className="px-2.5 py-1 bg-white hover:bg-bananur-sand/30 border border-bananur-sand rounded-lg text-[10px] font-mono font-bold text-bananur-clay transition-all cursor-pointer"
              >
                ✨ {s.code || s.id} (Servicio)
              </button>
            ))}
          </div>
        </div>

        {/* Result Area */}
        {scanStatus === 'not-found' && (
          <div className="p-4 bg-amber-50 border border-amber-200 rounded-2xl flex items-center gap-3 text-amber-800 text-xs animate-fade-in">
            <AlertCircle className="w-5 h-5 text-amber-600 shrink-0" />
            <div>
              <p className="font-bold">Código no identificado</p>
              <p>No se encontró ningún producto, servicio o insumo con el código "{scannedCode}". Verifica que esté registrado.</p>
            </div>
          </div>
        )}

        {identifiedItem && scanStatus === 'success' && (
          <div className="p-5 bg-[#FAF8F5] border-2 border-emerald-300 rounded-3xl space-y-4 animate-scale-up">
            <div className="flex items-start justify-between gap-4">
              <div className="flex items-center gap-3">
                {identifiedItem.image ? (
                  <img
                    src={identifiedItem.image}
                    alt={identifiedItem.name}
                    className="w-16 h-16 rounded-2xl object-cover border border-bananur-sand shrink-0 shadow-2xs"
                  />
                ) : (
                  <div className="w-16 h-16 rounded-2xl bg-white border border-bananur-sand flex items-center justify-center shrink-0">
                    <Tag className="w-8 h-8 text-bananur-gold-dark" />
                  </div>
                )}
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="px-2 py-0.5 rounded-full text-[9px] font-mono font-bold bg-bananur-clay text-white uppercase">
                      {identifiedItem.type === 'product' ? 'Producto Físico' : identifiedItem.type === 'service' ? 'Servicio de Diseño' : identifiedItem.type === 'material' ? 'Materia Prima' : 'Fardo'}
                    </span>
                    <span className="text-[10px] font-mono text-bananur-clay-light">
                      {identifiedItem.category}
                    </span>
                  </div>
                  <h3 className="font-serif text-base font-bold text-bananur-clay leading-snug">
                    {identifiedItem.name}
                  </h3>
                  <div className="mt-1">
                    <BarcodeBadge 
                      code={identifiedItem.code} 
                      name={identifiedItem.name} 
                      price={identifiedItem.price} 
                      category={identifiedItem.category}
                      size="sm"
                    />
                  </div>
                </div>
              </div>

              {identifiedItem.price !== undefined && (
                <div className="text-right shrink-0">
                  <div className="text-[10px] font-mono text-bananur-clay-light uppercase">Precio</div>
                  <div className="font-mono text-xl font-black text-bananur-clay">
                    ${identifiedItem.price.toLocaleString('es-CL')}
                  </div>
                </div>
              )}
            </div>

            {/* Quick Actions: Stock & POS */}
            <div className="pt-3 border-t border-bananur-sand/70 flex flex-wrap items-center justify-between gap-3">
              {identifiedItem.type === 'product' && identifiedItem.stock !== undefined && (
                <div className="flex items-center gap-2">
                  <span className="text-xs font-mono text-bananur-clay">
                    Stock: <strong>{identifiedItem.stock}</strong> {identifiedItem.unit || 'u.'}
                  </span>
                  <div className="flex items-center border border-bananur-sand rounded-xl bg-white overflow-hidden shadow-2xs">
                    <button
                      type="button"
                      onClick={() => handleStockChange(-1)}
                      className="p-1.5 hover:bg-bananur-sand/30 text-bananur-clay cursor-pointer"
                      title="Restar 1 al stock de inventario"
                    >
                      <Minus className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => handleStockChange(1)}
                      className="p-1.5 hover:bg-bananur-sand/30 text-bananur-clay border-l border-bananur-sand cursor-pointer"
                      title="Sumar 1 al stock de inventario"
                    >
                      <Plus className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              )}

              <div className="flex items-center gap-2 ml-auto">
                <button
                  type="button"
                  onClick={handleAddToPOS}
                  className="px-4 py-2.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs font-bold font-mono uppercase tracking-wider flex items-center gap-2 shadow-xs transition-all cursor-pointer"
                >
                  <ShoppingBag className="w-4 h-4" />
                  <span>Agregar a Venta Directa</span>
                </button>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
