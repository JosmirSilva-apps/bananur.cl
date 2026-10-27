import React, { useState } from 'react';
import { Purchase } from '../types';
import { Search, ReceiptText, ArrowUpRight, X, FileText, Calendar, ShoppingCart, UserPlus, HelpCircle, CheckCircle, Clock, Truck, Ban, Trash, Plus, FileSpreadsheet } from 'lucide-react';

const REGISTERED_DISTRIBUTORS = [
  {
    id: 'dist-1',
    name: 'Sofía Pinilla',
    company: 'Seda & Algodones Chilenos Ltda',
    email: 'spinilla@algodones.cl',
    phone: '+56 9 7411 2588',
    category: 'Costura' as const,
    supplyItem: "Tela de Algodón d'Ischia Premium",
    unitCost: 8900
  },
  {
    id: 'dist-2',
    name: 'Guillermo Matte',
    company: 'Impresiones 3D Filamentos SpA',
    email: 'gmatte@filamentos3d.cl',
    phone: '+56 9 8211 4455',
    category: 'Impresión 3D' as const,
    supplyItem: 'Filamento PLA Biodegradable de autor',
    unitCost: 14500
  },
  {
    id: 'dist-3',
    name: 'Patricia Alcaíno',
    company: 'Crochet de la Cordillera',
    email: 'palcaino@crochetcordillera.cl',
    phone: '+56 9 9133 8844',
    category: 'Crochet' as const,
    supplyItem: 'Lanas orgánicas hiladas a mano',
    unitCost: 2450
  },
  {
    id: 'dist-4',
    name: 'Estudio de Diseño Cartonera de Chile',
    company: 'Embalajes Sustentables S.A.',
    email: 'contacto@embalajeschile.cl',
    phone: '+56 2 2844 7799',
    category: 'Embalaje' as const,
    supplyItem: 'Bolsas compostables y cajas kraft de autor',
    unitCost: 1200
  }
];

const INITIAL_PURCHASES: Purchase[] = [
  {
    id: 'COM-9021',
    date: '2026-06-15',
    supplierName: 'Sofía Pinilla',
    supplierCompany: 'Seda & Algodones Chilenos Ltda',
    supplierEmail: 'spinilla@algodones.cl',
    supplierPhone: '+56 9 7411 2588',
    category: 'Costura',
    itemName: "Tela de Algodón d'Ischia Premium",
    unitCost: 8900,
    quantity: 15,
    subtotal: 133500,
    shippingCost: 5000,
    tax: 25365,
    total: 163865,
    status: 'Recibido',
    paymentMethod: 'Transferencia',
    estimatedDeliveryDate: '2026-06-17',
    internalNotes: 'Hilado fino premium recibido en perfectas condiciones.',
    attachedDocs: [
      { name: 'factura_electronica_sii_COM9021.pdf', size: '148 KB', dateAttached: '2026-06-15' },
      { name: 'comprobante_transferencia_banco.pdf', size: '312 KB', dateAttached: '2026-06-15' }
    ]
  },
  {
    id: 'COM-9022',
    date: '2026-06-18',
    supplierName: 'Guillermo Matte',
    supplierCompany: 'Impresiones 3D Filamentos SpA',
    supplierEmail: 'gmatte@filamentos3d.cl',
    supplierPhone: '+56 9 8211 4455',
    category: 'Impresión 3D',
    itemName: 'Filamento PLA Biodegradable de autor',
    unitCost: 14500,
    quantity: 10,
    subtotal: 145000,
    shippingCost: 3990,
    tax: 27550,
    total: 176540,
    status: 'En Camino',
    paymentMethod: 'Tarjeta de Crédito/Débito',
    estimatedDeliveryDate: '2026-06-25',
    internalNotes: 'Lote de filamentos terracota y ocre para la producción de julio.',
    attachedDocs: [
      { name: 'cotizacion_respaldo_filamento.pdf', size: '204 KB', dateAttached: '2026-06-18' }
    ]
  },
  {
    id: 'COM-9023',
    date: '2026-06-21',
    supplierName: 'Patricia Alcaíno',
    supplierCompany: 'Crochet de la Cordillera',
    supplierEmail: 'palcaino@crochetcordillera.cl',
    supplierPhone: '+56 9 9133 8844',
    category: 'Crochet',
    itemName: 'Lanas orgánicas hiladas a mano',
    unitCost: 2450,
    quantity: 50,
    subtotal: 122500,
    shippingCost: 0,
    tax: 23275,
    total: 145775,
    status: 'Pendiente',
    paymentMethod: 'Crédito Proveedor',
    estimatedDeliveryDate: '2026-06-28',
    internalNotes: 'Teñido natural de plantas cordilleranas.',
    attachedDocs: []
  }
];

interface AdminPurchasesProps {
  onShowToast?: (title: string, desc: string, type: 'success' | 'warning' | 'info' | 'error') => void;
  materials?: any[];
  onUpdateMaterialStock?: (materialId: any, qty: any) => void;
  supplyRequests?: any[];
  onUpdateSupplyRequests?: React.Dispatch<React.SetStateAction<any[]>>;
  onApproveSupplyRequest?: (reqId: any) => void;
  onRejectSupplyRequest?: (reqId: any) => void;
}

export default function AdminPurchases({ 
  onShowToast,
  materials = [],
  onUpdateMaterialStock = () => {},
  supplyRequests = [],
  onUpdateSupplyRequests = () => {},
  onApproveSupplyRequest = () => {},
  onRejectSupplyRequest = () => {}
}: AdminPurchasesProps) {
  const [purchases, setPurchases] = useState<Purchase[]>(INITIAL_PURCHASES);
  const [activeTab, setActiveTab] = useState<'compras' | 'suministros'>('compras');
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('Todos');
  const [categoryFilter, setCategoryFilter] = useState<string>('Todos');
  const [dateFilter, setDateFilter] = useState('');

  // Form states
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [supplierName, setSupplierName] = useState('');
  const [supplierCompany, setSupplierCompany] = useState('');
  const [supplierEmail, setSupplierEmail] = useState('');
  const [supplierPhone, setSupplierPhone] = useState('');
  const [category, setCategory] = useState<'Impresión 3D' | 'Costura' | 'Crochet' | 'Embalaje' | 'Herramientas'>('Impresión 3D');
  const [itemName, setItemName] = useState('');
  const [unitCost, setUnitCost] = useState<number>(0);
  const [quantity, setQuantity] = useState<number>(1);
  const [shippingCost, setShippingCost] = useState<number>(0);
  const [paymentMethod, setPaymentMethod] = useState<'Transferencia' | 'Tarjeta de Crédito/Débito' | 'Efectivo' | 'Crédito Proveedor'>('Transferencia');
  const [estimatedDeliveryDate, setEstimatedDeliveryDate] = useState('');
  const [internalNotes, setInternalNotes] = useState('');

  const [activePurchase, setActivePurchase] = useState<Purchase | null>(null);

  // Subtotal, tax, total calculations for current form state
  const currentSubtotal = unitCost * quantity;
  const currentTax = Math.round(currentSubtotal * 0.19); // 19% IVA standard
  const currentTotal = currentSubtotal + shippingCost + currentTax;

  const handleCreatePurchase = (e: React.FormEvent) => {
    e.preventDefault();
    if (!supplierName.trim() || !supplierCompany.trim() || !itemName.trim()) {
      if (onShowToast) onShowToast('Campos vacíos', 'Por favor complete los campos obligatorios del proveedor y el insumo.', 'warning');
      return;
    }

    const subtotal = unitCost * quantity;
    const tax = Math.round(subtotal * 0.19);
    const total = subtotal + shippingCost + tax;
    const purchaseId = `COM-${purchases.length + 9024}`;

    const newPurchase: Purchase = {
      id: purchaseId,
      date: new Date().toISOString().split('T')[0],
      supplierName,
      supplierCompany,
      supplierEmail,
      supplierPhone: supplierPhone || undefined,
      category,
      itemName,
      unitCost,
      quantity,
      subtotal,
      shippingCost,
      tax,
      total,
      status: 'Pendiente',
      paymentMethod,
      estimatedDeliveryDate: estimatedDeliveryDate || undefined,
      internalNotes: internalNotes || undefined
    };

    setPurchases([newPurchase, ...purchases]);

    // Reset Form
    setShowCreateForm(false);
    setSupplierName('');
    setSupplierCompany('');
    setSupplierEmail('');
    setSupplierPhone('');
    setCategory('Impresión 3D');
    setItemName('');
    setUnitCost(0);
    setQuantity(1);
    setShippingCost(0);
    setPaymentMethod('Transferencia');
    setEstimatedDeliveryDate('');
    setInternalNotes('');

    if (onShowToast) {
      onShowToast(
        'Orden de Compra Registrada',
        `La compra ${purchaseId} para ${supplierCompany} ha sido registrada con éxito.`,
        'success'
      );
    }
  };

  const handleUpdatePurchaseStatus = (purchaseId: string, nextStatus: Purchase['status']) => {
    setPurchases(prev => prev.map(p => p.id === purchaseId ? { ...p, status: nextStatus } : p));
    if (onShowToast) {
      onShowToast(
        'Estado Actualizado',
        `La orden ${purchaseId} ahora se encuentra en estado "${nextStatus}".`,
        'success'
      );
    }
  };

  // Filter logic
  const filteredPurchases = purchases.filter(p => {
    const matchesSearch = 
      p.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.supplierName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.supplierCompany.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.itemName.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesStatus = statusFilter === 'Todos' || p.status === statusFilter;
    const matchesCategory = categoryFilter === 'Todos' || p.category === categoryFilter;
    const matchesDate = !dateFilter || p.date === dateFilter;

    return matchesSearch && matchesStatus && matchesCategory && matchesDate;
  });

  return (
    <div className="p-6 sm:p-10 space-y-8 animate-fade-in bg-bananur-cream min-h-screen">
      
      {/* Editorial top section */}
      <div className="border-b border-bananur-sand pb-6 flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <span className="text-xs font-mono text-bananur-gold-dark font-extrabold uppercase tracking-widest block mb-2">MÓDULO DE ABASTECIMIENTO</span>
          <h1 className="font-serif text-3xl sm:text-4xl font-extrabold text-bananur-clay leading-tight">Compras & Órdenes de Suministro</h1>
          <p className="text-xs sm:text-sm text-bananur-clay-light font-light max-w-xl mt-2 leading-relaxed">
            Planifica tus requerimientos, gestiona las facturas y despachos de tus proveedores clave para impresión 3D, telas d'Ischia y lanas orgánicas.
          </p>
        </div>
        {activeTab === 'compras' && (
          <div>
            <button
              id="purchases-btn-toggle-form"
              onClick={() => setShowCreateForm(!showCreateForm)}
              className="w-full sm:w-auto px-5 py-3 rounded-xl text-xs font-bold font-sans tracking-wide bg-bananur-clay text-[#FAF8F5] hover:bg-bananur-gold hover:text-bananur-clay duration-200 transition-colors shadow-xs flex items-center justify-center gap-2 cursor-pointer"
            >
              {showCreateForm ? <X className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
              {showCreateForm ? 'Cerrar Registro' : 'Registrar Nueva Compra'}
            </button>
          </div>
        )}
      </div>

      {/* MODULE TABS */}
      <div className="flex border-b border-bananur-sand gap-2">
        <button
          id="purchases-tab-compras"
          onClick={() => {
            setActiveTab('compras');
            setActivePurchase(null);
          }}
          className={`px-6 py-3 text-xs font-bold font-mono uppercase tracking-widest border-b-2 transition-all cursor-pointer ${
            activeTab === 'compras'
              ? 'border-bananur-clay text-bananur-clay'
              : 'border-transparent text-bananur-clay-light/60 hover:text-bananur-clay hover:border-bananur-sand'
          }`}
        >
          💳 Compras Registradas (${purchases.reduce((sum, p) => sum + p.total, 0).toLocaleString('es-CL')} CLP)
        </button>
        <button
          id="purchases-tab-suministros"
          onClick={() => {
            setActiveTab('suministros');
            setActivePurchase(null);
          }}
          className={`px-6 py-3 text-xs font-bold font-mono uppercase tracking-widest border-b-2 transition-all cursor-pointer ${
            activeTab === 'suministros'
              ? 'border-bananur-clay text-bananur-clay'
              : 'border-transparent text-bananur-clay-light/60 hover:text-bananur-clay hover:border-bananur-sand'
          }`}
        >
          📋 Órdenes de Suministro ({supplyRequests.length} Solicitudes)
        </button>
      </div>

      {/* REGISTRO NUEVA COMPRA FORM */}
      {showCreateForm && (
        <form onSubmit={handleCreatePurchase} className="bg-white rounded-2xl p-6 border border-bananur-sand shadow-lg space-y-6 animate-scale-up">
          <div className="border-b border-bananur-sand pb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <h3 className="font-serif text-base font-bold text-bananur-clay">Formulario de Orden de Compra y Gasto</h3>
              <p className="text-[11px] text-bananur-clay-light/80">Registra un nuevo pedido a tus distribuidores para actualizar costos y stock.</p>
            </div>
            
            {/* ACCESO RÁPIDO DISTRIBUIDORES */}
            <div className="flex flex-col sm:flex-row sm:items-center gap-2">
              <span className="text-[10px] font-bold uppercase text-bananur-gold-dark font-mono shrink-0">Prefijo Distribuidor:</span>
              <select
                id="purchases-autocomplete-supplier"
                onChange={(e) => {
                  const val = e.target.value;
                  if (!val) return;
                  const supplier = REGISTERED_DISTRIBUTORS.find(d => d.id === val);
                  if (supplier) {
                    setSupplierName(supplier.name);
                    setSupplierCompany(supplier.company);
                    setSupplierEmail(supplier.email);
                    setSupplierPhone(supplier.phone || '');
                    setCategory(supplier.category);
                    setItemName(supplier.supplyItem);
                    setUnitCost(supplier.unitCost);
                    if (onShowToast) {
                      onShowToast(
                        'Distribuidor Cargado',
                        `Datos de ${supplier.company} importados con éxito para auto-completar el formulario.`,
                        'info'
                      );
                    }
                  }
                }}
                className="p-1.5 bg-bananur-cream/55 border border-bananur-sand rounded-lg text-xs"
                defaultValue=""
              >
                <option value="">-- Autocompletar Distribuidor --</option>
                {REGISTERED_DISTRIBUTORS.map((d) => (
                  <option key={d.id} value={d.id}>
                    {d.company} ({d.name})
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-bananur-clay mb-1.5 font-mono">Nombre del Distribuidor (Representante) *</label>
              <input
                id="purchase-supplier-name"
                type="text"
                required
                placeholder="Ej. Sofía Pinilla"
                value={supplierName}
                onChange={(e) => setSupplierName(e.target.value)}
                className="w-full px-3 py-2 bg-bananur-cream/30 border border-bananur-sand rounded-lg text-xs text-bananur-clay"
              />
            </div>
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-bananur-clay mb-1.5 font-mono">Marca / Distribuidora Legal *</label>
              <input
                id="purchase-supplier-company"
                type="text"
                required
                placeholder="Ej. Seda & Algodones Ltda"
                value={supplierCompany}
                onChange={(e) => setSupplierCompany(e.target.value)}
                className="w-full px-3 py-2 bg-bananur-cream/30 border border-bananur-sand rounded-lg text-xs text-bananur-clay"
              />
            </div>
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-bananur-clay mb-1.5 font-mono">Email de Contacto *</label>
              <input
                id="purchase-supplier-email"
                type="email"
                required
                placeholder="correo@distribuidor.cl"
                value={supplierEmail}
                onChange={(e) => setSupplierEmail(e.target.value)}
                className="w-full px-3 py-2 bg-bananur-cream/30 border border-bananur-sand rounded-lg text-xs text-bananur-clay font-mono"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-bananur-clay mb-1.5 font-mono">Teléfono Directo</label>
              <input
                id="purchase-supplier-phone"
                type="text"
                placeholder="+56 9 XXXX XXXX"
                value={supplierPhone}
                onChange={(e) => setSupplierPhone(e.target.value)}
                className="w-full px-3 py-2 bg-bananur-cream/30 border border-bananur-sand rounded-lg text-xs text-bananur-clay"
              />
            </div>
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-bananur-clay mb-1.5 font-mono">Categoría Técnica de Abastecimiento *</label>
              <select
                id="purchase-category"
                value={category}
                onChange={(e) => setCategory(e.target.value as any)}
                className="w-full px-3 py-2 bg-white border border-bananur-sand rounded-lg text-xs text-bananur-clay font-semibold"
              >
                <option value="Impresión 3D">Impresión 3D</option>
                <option value="Costura">Costura</option>
                <option value="Crochet">Crochet</option>
                <option value="Embalaje">Embalaje</option>
                <option value="Herramientas">Herramientas</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-bananur-clay mb-1.5 font-mono">Insumo Clave Comprado *</label>
              <input
                id="purchase-item-name"
                type="text"
                required
                placeholder="Ej. Filamento PLA de autor"
                value={itemName}
                onChange={(e) => setItemName(e.target.value)}
                className="w-full px-3 py-2 bg-bananur-cream/30 border border-bananur-sand rounded-lg text-xs text-bananur-clay"
              />
            </div>
          </div>

          {/* ITEM COST AND CALCULATION MODULE */}
          <div className="p-4 bg-bananur-cream/40 rounded-xl border border-bananur-sand grid grid-cols-1 md:grid-cols-3 gap-6 items-end">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-bananur-clay mb-1.5 font-mono">Costo Unitario Neto ($) *</label>
              <input
                id="purchase-unit-cost"
                type="number"
                min="0"
                required
                value={unitCost || ''}
                onChange={(e) => setUnitCost(Number(e.target.value))}
                className="w-full p-2 bg-white border border-bananur-sand rounded-lg text-xs"
              />
            </div>
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-bananur-clay mb-1.5 font-mono">Cantidad Solicitada *</label>
              <input
                id="purchase-quantity"
                type="number"
                min="1"
                required
                value={quantity}
                onChange={(e) => setQuantity(Number(e.target.value))}
                className="w-full p-2 bg-white border border-bananur-sand rounded-lg text-xs text-center"
              />
            </div>
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-bananur-clay mb-1.5 font-mono">Costo Despacho / Flete ($)</label>
              <input
                id="purchase-shipping-cost"
                type="number"
                min="0"
                value={shippingCost || ''}
                onChange={(e) => setShippingCost(Number(e.target.value))}
                className="w-full p-2 bg-white border border-bananur-sand rounded-lg text-xs"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-xs">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-bananur-clay mb-1.5 font-mono">Método de Pago Acordado</label>
              <select
                id="purchase-payment-method"
                value={paymentMethod}
                onChange={(e) => setPaymentMethod(e.target.value as any)}
                className="w-full p-2 bg-white border border-bananur-sand rounded-lg"
              >
                <option value="Transferencia">Transferencia Bancaria</option>
                <option value="Tarjeta de Crédito/Débito">Tarjeta de Crédito/Débito</option>
                <option value="Efectivo">Efectivo</option>
                <option value="Crédito Proveedor">Crédito del Proveedor (30 días)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-bananur-clay mb-1.5 font-mono">Estimación Fecha Entrega</label>
              <input
                id="purchase-estimated-date"
                type="date"
                value={estimatedDeliveryDate}
                onChange={(e) => setEstimatedDeliveryDate(e.target.value)}
                className="w-full p-2 bg-white border border-bananur-sand rounded-lg"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-bananur-clay mb-1.5 font-mono">Notas Internas y Acuerdos</label>
              <input
                id="purchase-notes"
                type="text"
                placeholder="Ej. Despacho gratuito por compras mayoristas"
                value={internalNotes}
                onChange={(e) => setInternalNotes(e.target.value)}
                className="w-full p-2 bg-white border border-bananur-sand rounded-lg"
              />
            </div>
          </div>

          {/* Subtotal metrics summary */}
          <div className="flex flex-col sm:flex-row items-center justify-between border-t border-bananur-sand pt-4 gap-4">
            <div className="text-left space-y-1">
              <div className="text-xs text-bananur-clay-light/60 font-mono">CÁLCULO RESUMEN DE GASTOS:</div>
              <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs">
                <div>
                  <span className="font-mono text-bananur-clay-light">Subtotal:</span>{' '}
                  <span className="font-semibold text-bananur-clay">${currentSubtotal.toLocaleString('es-CL')}</span>
                </div>
                <div>
                  <span className="font-mono text-bananur-clay-light">IVA Cred. Fiscal (19%):</span>{' '}
                  <span className="font-semibold text-bananur-clay">${currentTax.toLocaleString('es-CL')}</span>
                </div>
                <div>
                  <span className="font-mono text-bananur-clay-light">Flete:</span>{' '}
                  <span className="font-semibold text-bananur-clay">${shippingCost.toLocaleString('es-CL')}</span>
                </div>
              </div>
              <div className="text-xl font-mono font-extrabold text-bananur-clay mt-1">
                Total Compra: ${currentTotal.toLocaleString('es-CL')} CLP
              </div>
            </div>

            <div className="flex gap-3 w-full sm:w-auto">
              <button
                type="button"
                onClick={() => {
                  setShowCreateForm(false);
                }}
                className="flex-1 sm:flex-initial px-5 py-2.5 bg-white border border-bananur-sand text-bananur-clay font-bold text-xs rounded-xl hover:bg-bananur-cream cursor-pointer duration-150"
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="flex-1 sm:flex-initial px-6 py-2.5 bg-emerald-750 hover:bg-emerald-850 text-white font-bold text-xs rounded-xl cursor-pointer duration-150 shadow-xs"
              >
                Emitir Orden y Registrar Gasto
              </button>
            </div>
          </div>
        </form>
      )}

      {/* FILTER AND SEARCH BAR FOR PURCHASES */}
      {activeTab === 'compras' && (
        <>
          <div className="bg-white p-5 rounded-2xl border border-bananur-sand/80 shadow-xs space-y-4">
            <div className="flex items-center gap-2 text-bananur-gold-dark">
              <ShoppingCart className="w-5 h-5 shrink-0" />
              <h4 className="font-serif text-sm font-extrabold text-bananur-clay">Panel de Filtros & Auditoría de Compras</h4>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              
              {/* SEARCH BAR */}
              <div className="relative">
                <label className="block text-[10px] font-bold uppercase tracking-wider text-bananur-clay-light/80 mb-1 font-mono">Buscar en Compras</label>
                <div className="relative">
                  <input
                    id="purchases-search-input"
                    type="text"
                    placeholder="Buscar por código, distribuidor o insumo..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 bg-bananur-cream/30 border border-bananur-sand rounded-xl text-xs focus:outline-none focus:border-bananur-gold text-bananur-clay font-sans"
                  />
                  <Search className="w-3.5 h-3.5 text-bananur-clay-light/80 absolute left-3 top-1/2 -translate-y-1/2" />
                </div>
              </div>

              {/* STATUS FILTER */}
              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider text-bananur-clay-light/80 mb-1 font-mono">Estado de Despacho</label>
                <select
                  id="purchases-filter-status"
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="w-full p-2 bg-white border border-bananur-sand rounded-xl text-xs font-semibold text-bananur-clay cursor-pointer"
                >
                  <option value="Todos">Todos los estados</option>
                  <option value="Pendiente">🟡 Pendiente</option>
                  <option value="En Camino">🔵 En Camino</option>
                  <option value="Recibido">🟢 Recibido</option>
                  <option value="Cancelado">🔴 Cancelado</option>
                </select>
              </div>

              {/* CATEGORY FILTER */}
              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider text-bananur-clay-light/80 mb-1 font-mono">Línea de Suministro</label>
                <select
                  id="purchases-filter-category"
                  value={categoryFilter}
                  onChange={(e) => setCategoryFilter(e.target.value)}
                  className="w-full p-2 bg-white border border-bananur-sand rounded-xl text-xs font-semibold text-bananur-clay cursor-pointer"
                >
                  <option value="Todos">Todas las categorías</option>
                  <option value="Impresión 3D">Impresión 3D</option>
                  <option value="Costura">Costura</option>
                  <option value="Crochet">Crochet</option>
                  <option value="Embalaje">Embalaje</option>
                  <option value="Herramientas">Herramientas</option>
                </select>
              </div>

              {/* DATE FILTER */}
              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider text-bananur-clay-light/80 mb-1 font-mono">Filtrar por Fecha</label>
                <div className="relative">
                  <input
                    id="purchases-filter-date"
                    type="date"
                    value={dateFilter}
                    onChange={(e) => setDateFilter(e.target.value)}
                    className="w-full p-2 bg-white border border-bananur-sand rounded-xl text-xs text-bananur-clay font-medium cursor-pointer"
                  />
                  {dateFilter && (
                    <button
                      type="button"
                      onClick={() => setDateFilter('')}
                      className="absolute right-2.5 top-1/2 -translate-y-1/2 text-rose-600 hover:text-rose-800 text-[10px] font-mono font-bold cursor-pointer"
                    >
                      Limpiar
                    </button>
                  )}
                </div>
              </div>

            </div>
          </div>

          {/* LIST OF PURCHASES */}
          <div className="bg-white rounded-2xl border border-bananur-sand overflow-hidden shadow-xs">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse font-sans">
                <thead>
                  <tr className="bg-bananur-cream/80 text-[10px] font-mono uppercase text-bananur-clay-light/90 border-b border-bananur-sand/70">
                    <th className="py-4 px-6 font-bold">Código</th>
                    <th className="py-4 px-6 font-bold">Fecha</th>
                    <th className="py-4 px-6 font-bold">Distribuidor / Empresa</th>
                    <th className="py-4 px-6 font-bold">Línea Suministro</th>
                    <th className="py-4 px-6 font-bold">Insumo Clave</th>
                    <th className="py-4 px-6 font-bold">Cantidad</th>
                    <th className="py-4 px-6 font-bold">Total Gasto</th>
                    <th className="py-4 px-6 font-bold text-center">Estado</th>
                    <th className="py-4 px-6 font-bold text-right">Detalle</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-bananur-sand/40 text-xs text-bananur-clay">
                  {filteredPurchases.length === 0 ? (
                    <tr>
                      <td colSpan={9} className="py-12 text-center text-bananur-clay-light font-light text-xs">
                        No se encontraron órdenes de compra registradas con los filtros actuales.
                      </td>
                    </tr>
                  ) : (
                    filteredPurchases.map((purchase) => {
                      return (
                        <tr key={purchase.id} className="hover:bg-bananur-cream/20 transition-colors">
                          <td className="py-4 px-6 font-mono font-extrabold text-bananur-clay-light">{purchase.id}</td>
                          <td className="py-4 px-6 font-light font-mono text-[10px]">{purchase.date}</td>
                          <td className="py-4 px-6">
                            <span className="font-semibold block">{purchase.supplierCompany}</span>
                            <span className="text-[10px] text-bananur-clay-light/70">{purchase.supplierName}</span>
                          </td>
                          <td className="py-4 px-6">
                            <span className="px-2 py-0.5 text-[9px] font-bold rounded-full border bg-bananur-cream text-bananur-clay border-bananur-sand uppercase tracking-wider font-mono">
                              {purchase.category}
                            </span>
                          </td>
                          <td className="py-4 px-6 font-light">
                            {purchase.itemName}
                          </td>
                          <td className="py-4 px-6 font-mono font-bold text-bananur-gold-dark">
                            x{purchase.quantity}
                          </td>
                          <td className="py-4 px-6 font-mono font-bold text-bananur-clay">
                            ${purchase.total.toLocaleString('es-CL')}
                          </td>
                          <td className="py-4 px-6 text-center">
                            <span className={`px-2.5 py-0.5 text-[9px] font-bold rounded-full border uppercase font-mono inline-flex items-center gap-1 ${
                              purchase.status === 'Pendiente' ? 'bg-amber-100 text-amber-800 border-amber-300' :
                              purchase.status === 'En Camino' ? 'bg-blue-100 text-blue-800 border-blue-300' :
                              purchase.status === 'Recibido' ? 'bg-emerald-100 text-emerald-850 border-emerald-300' :
                              'bg-rose-100 text-rose-800 border-rose-300'
                            }`}>
                              {purchase.status === 'Pendiente' && <Clock className="w-2.5 h-2.5" />}
                              {purchase.status === 'En Camino' && <Truck className="w-2.5 h-2.5" />}
                              {purchase.status === 'Recibido' && <CheckCircle className="w-2.5 h-2.5" />}
                              {purchase.status === 'Cancelado' && <Ban className="w-2.5 h-2.5" />}
                              {purchase.status}
                            </span>
                          </td>
                          <td className="py-4 px-6 text-right">
                            <button
                              id={`purchases-btn-detail-${purchase.id}`}
                              onClick={() => setActivePurchase(purchase)}
                              className="p-1.5 rounded-lg border border-bananur-sand/70 text-bananur-clay hover:bg-bananur-clay hover:text-white duration-150 inline-flex items-center gap-1 cursor-pointer font-bold text-[10px]"
                            >
                              Ver
                              <ArrowUpRight className="w-3 h-3" />
                            </button>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}

      {/* activeTab === 'suministros' */}
      {activeTab === 'suministros' && (
        <div className="space-y-6 animate-fade-in">
          {/* Header & explanation of the MRP subsystem */}
          <div className="bg-white p-5 rounded-2xl border border-bananur-sand/80 shadow-xs flex items-start gap-4">
            <div className="p-3 bg-bananur-cream rounded-xl text-bananur-gold shrink-0">
              <ReceiptText className="w-6 h-6 text-bananur-gold" />
            </div>
            <div>
              <h3 className="font-serif text-sm font-extrabold text-bananur-clay">Subsistema de Requerimientos y Suministros Chilenos (MRP)</h3>
              <p className="text-xs text-bananur-clay-light/80 mt-1 leading-relaxed font-sans">
                Cuando tu inventario baja del umbral crítico de stock de seguridad, el sistema genera de forma automática o manual una orden de suministro (requisición). 
                Aquí puedes auditar cada requerimiento, adjuntar cotizaciones, facturas de respaldo proforma y gatillar la compra formal.
              </p>
            </div>
          </div>

          {/* List of supply requests */}
          <div className="bg-white rounded-2xl border border-bananur-sand overflow-hidden shadow-xs">
            <div className="p-5 border-b border-bananur-sand bg-bananur-cream/40 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <h4 className="font-serif text-sm font-bold text-bananur-clay">Órdenes de Requisición y Respaldos</h4>
              <span className="text-[10px] font-mono font-bold uppercase text-bananur-gold bg-bananur-sage-light px-2.5 py-1 rounded-full border border-bananur-sand">
                {supplyRequests.filter(r => r.status === 'Pendiente').length} Requerimientos Pendientes
              </span>
            </div>

            <div className="divide-y divide-bananur-sand/40">
              {supplyRequests.length === 0 ? (
                <div className="py-12 text-center text-bananur-clay-light font-light text-xs">
                  No hay órdenes de suministro registradas en el sistema.
                </div>
              ) : (
                supplyRequests.map((req) => {
                  return (
                    <div key={req.id} className="p-5 sm:p-6 hover:bg-[#F9FAFB]/50 transition-colors flex flex-col lg:flex-row lg:items-center justify-between gap-6">
                      
                      {/* Left: Metadata & Material Details */}
                      <div className="space-y-2 lg:max-w-md w-full">
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-xs font-extrabold text-bananur-clay bg-bananur-cream px-2 py-0.5 rounded border border-bananur-sand">
                            {req.id}
                          </span>
                          <span className="text-[10px] text-bananur-clay-light/60 font-mono">
                            📅 Solicitado: {req.date}
                          </span>
                          <span className={`px-2.5 py-0.5 text-[9px] font-bold rounded-full border uppercase font-mono inline-flex items-center gap-1 ${
                            req.status === 'Pendiente' ? 'bg-amber-100 text-amber-800 border-amber-300' :
                            req.status === 'Aprobado' ? 'bg-emerald-100 text-emerald-850 border-emerald-300' :
                            'bg-rose-100 text-rose-800 border-rose-300'
                          }`}>
                            {req.status}
                          </span>
                        </div>
                        <div>
                          <h5 className="font-sans font-bold text-sm text-bananur-clay">{req.materialName}</h5>
                          <p className="text-xs text-bananur-clay-light italic mt-0.5 font-light">"Motivo: {req.reason}"</p>
                        </div>
                        <div className="flex items-center gap-4 text-xs font-mono">
                          <div>
                            <span className="text-bananur-clay-light">Cantidad Crítica:</span>{' '}
                            <span className="font-extrabold text-bananur-gold-dark text-sm">x{req.quantityRequested}</span>
                          </div>
                        </div>
                      </div>

                      {/* Middle: Beautiful, dedicated PDF/XML attachment panel for this specific supply request */}
                      <div className="bg-white p-4 rounded-xl border border-bananur-sand/80 max-w-sm w-full space-y-2.5">
                        <div className="flex items-center justify-between text-[10px] font-mono uppercase font-bold text-bananur-clay-light">
                          <span>📂 Documentos de Suministro ({req.attachedDocs?.length || 0})</span>
                          <span className="text-bananur-gold">Soporte Tributario</span>
                        </div>

                        {(!req.attachedDocs || req.attachedDocs.length === 0) ? (
                          <p className="text-[10px] text-bananur-clay-light/50 italic text-center py-2 bg-[#F9FAFB] rounded-lg border border-dashed border-bananur-sand/50">
                            Sin respaldos (cotización/boleta) adjuntos.
                          </p>
                        ) : (
                          <div className="space-y-1 max-h-[80px] overflow-y-auto pr-1">
                            {req.attachedDocs.map((doc: any, dIdx: number) => (
                              <div key={dIdx} className="flex items-center justify-between bg-[#F9FAFB] p-1.5 rounded border border-bananur-sand text-[10px] font-mono shadow-3xs">
                                <span className="truncate max-w-[160px] text-bananur-clay font-medium" title={doc.name}>{doc.name}</span>
                                <div className="flex items-center gap-1.5 text-[9px]">
                                  <button
                                    type="button"
                                    onClick={() => {
                                      alert(`Abriendo documento simulado: ${doc.name}`);
                                      if (onShowToast) onShowToast('Abriendo Documento', `Visualizando archivo "${doc.name}" en nueva pestaña simulada.`, 'info');
                                    }}
                                    className="text-bananur-clay font-bold hover:text-bananur-gold underline cursor-pointer"
                                  >
                                    Ver
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => {
                                      const updatedDocs = req.attachedDocs.filter((_: any, i: number) => i !== dIdx);
                                      onUpdateSupplyRequests(prev => prev.map(r => r.id === req.id ? { ...r, attachedDocs: updatedDocs } : r));
                                      if (onShowToast) onShowToast('Documento Eliminado', `Se removió el archivo "${doc.name}" de la orden ${req.id}`, 'warning');
                                    }}
                                    className="text-rose-600 font-bold hover:text-rose-800 cursor-pointer"
                                  >
                                    Eliminar
                                  </button>
                                </div>
                              </div>
                            ))}
                          </div>
                        )}

                        {/* Direct simulated file upload input */}
                        <div className="relative group">
                          <input
                            type="file"
                            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                            onChange={(e) => {
                              const files = e.target.files;
                              if (files && files.length > 0) {
                                const file = files[0];
                                const newDoc = {
                                  name: file.name,
                                  size: `${(file.size / 1024).toFixed(0)} KB`,
                                  dateAttached: new Date().toISOString().split('T')[0]
                                };
                                const updatedDocs = [...(req.attachedDocs || []), newDoc];
                                onUpdateSupplyRequests(prev => prev.map(r => r.id === req.id ? { ...r, attachedDocs: updatedDocs } : r));
                                if (onShowToast) onShowToast('Archivo Adjuntado', `Se adjuntó "${file.name}" a la orden de suministro ${req.id}`, 'success');
                              }
                            }}
                          />
                          <div className="p-1.5 bg-[#F9FAFB] border border-dashed border-bananur-gold rounded text-center group-hover:bg-[#F0FDF4] duration-150 transition-colors">
                            <p className="text-[10px] text-bananur-clay">
                              📎 <span className="text-bananur-gold underline font-bold">Adjuntar cotización o factura</span>
                            </p>
                          </div>
                        </div>

                      </div>

                      {/* Right: State actions (Aprobar / Rechazar) */}
                      <div className="flex items-center gap-2 shrink-0 self-end lg:self-center">
                        {req.status === 'Pendiente' ? (
                          <>
                            <button
                              id={`req-btn-approve-${req.id}`}
                              onClick={() => {
                                onApproveSupplyRequest(req.id);
                                if (onShowToast) onShowToast('Requerimiento Aprobado', `La solicitud ${req.id} para ${req.materialName} ha sido aprobada.`, 'success');
                              }}
                              className="px-4 py-2 bg-bananur-clay hover:bg-bananur-gold hover:text-bananur-clay text-[#FAF8F5] text-xs font-bold rounded-xl shadow-xs cursor-pointer transition-colors"
                            >
                              Aprobar
                            </button>
                            <button
                              id={`req-btn-reject-${req.id}`}
                              onClick={() => {
                                onRejectSupplyRequest(req.id);
                                if (onShowToast) onShowToast('Requerimiento Rechazado', `La solicitud ${req.id} para ${req.materialName} ha sido rechazada.`, 'error');
                              }}
                              className="px-4 py-2 border border-rose-300 text-rose-700 bg-rose-50 hover:bg-rose-100 text-xs font-bold rounded-xl cursor-pointer transition-colors"
                            >
                              Rechazar
                            </button>
                          </>
                        ) : (
                          <span className="text-[11px] font-mono text-bananur-clay-light/50 italic">
                            No requiere acción adicional
                          </span>
                        )}
                      </div>

                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>
      )}

      {/* PURCHASE DETAIL SIDEBAR / MODAL DRAWER */}
      {activePurchase && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-bananur-clay/75 backdrop-blur-xs" onClick={() => setActivePurchase(null)}></div>
          <div className="relative bg-white max-w-lg w-full rounded-2xl shadow-xl overflow-hidden z-15 border border-bananur-sand animate-scale-up">
            
            {/* Header */}
            <div className="p-6 bg-bananur-cream border-b border-bananur-sand flex items-center justify-between">
              <div>
                <span className="font-mono text-[10px] text-bananur-clay-light/60 uppercase tracking-wider block">Orden de Abastecimiento</span>
                <div className="flex items-center gap-2 mt-0.5">
                  <span className="font-serif text-lg font-bold text-bananur-clay">{activePurchase.id}</span>
                  <span className={`px-2.5 py-0.5 text-[9px] font-bold rounded-full border inline-flex items-center gap-1 uppercase font-mono ${
                    activePurchase.status === 'Pendiente' ? 'bg-amber-100 text-amber-800 border-amber-300' :
                    activePurchase.status === 'En Camino' ? 'bg-blue-100 text-blue-800 border-blue-300' :
                    activePurchase.status === 'Recibido' ? 'bg-emerald-100 text-emerald-850 border-emerald-300' :
                    'bg-rose-100 text-rose-800 border-rose-300'
                  }`}>
                    {activePurchase.status}
                  </span>
                </div>
              </div>
              <button onClick={() => setActivePurchase(null)} className="text-bananur-clay hover:text-bananur-gold p-1 cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Content body */}
            <div className="p-6 space-y-6 max-h-[60vh] overflow-y-auto scrollbar-hidden">
              
              {/* Distributor profile info */}
              <div className="p-4 bg-bananur-sand/20 rounded-xl border border-bananur-sand/50 space-y-3">
                <div className="flex items-center gap-2 text-bananur-clay">
                  <FileText className="w-5 h-5 text-bananur-gold-dark" />
                  <h4 className="font-serif text-sm font-extrabold">Distribuidor & Datos de Contacto</h4>
                </div>
                <div className="grid grid-cols-2 gap-y-2 text-xs font-sans">
                  <div>
                    <span className="text-[10px] text-bananur-clay-light/50 font-mono block">Distribuidora / Razón</span>
                    <span className="font-semibold text-bananur-clay">{activePurchase.supplierCompany}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-bananur-clay-light/50 font-mono block">Representante</span>
                    <span className="text-bananur-clay">{activePurchase.supplierName}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-bananur-clay-light/50 font-mono block">Email</span>
                    <span className="text-bananur-clay font-mono">{activePurchase.supplierEmail}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-bananur-clay-light/50 font-mono block">Teléfono Directo</span>
                    <span className="text-bananur-clay">{activePurchase.supplierPhone || 'No registrado'}</span>
                  </div>
                </div>
              </div>

              {/* Items detail */}
              <div className="space-y-3">
                <h5 className="text-[10px] font-mono uppercase tracking-wider text-bananur-clay-light">Insumo Clave Detallado</h5>
                <div className="p-4 bg-[#FAF8F5] rounded-xl border border-bananur-sand/80 text-xs">
                  <div className="flex justify-between items-center mb-2">
                    <span className="font-bold text-bananur-clay">{activePurchase.itemName}</span>
                    <span className="font-mono text-bananur-gold-dark font-semibold text-[10px] bg-bananur-cream px-2 py-0.5 rounded border border-bananur-sand">{activePurchase.category}</span>
                  </div>
                  <div className="grid grid-cols-3 gap-2 text-[11px] pt-2 border-t border-bananur-sand/30 font-mono text-bananur-clay-light/80">
                    <div>
                      <span>Precio Unit:</span>
                      <p className="font-bold text-bananur-clay">${activePurchase.unitCost.toLocaleString('es-CL')}</p>
                    </div>
                    <div>
                      <span>Cantidad:</span>
                      <p className="font-bold text-bananur-clay">x {activePurchase.quantity}</p>
                    </div>
                    <div>
                      <span>Subtotal Neto:</span>
                      <p className="font-bold text-bananur-clay">${activePurchase.subtotal.toLocaleString('es-CL')}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Financial & Delivery specifications */}
              <div className="grid grid-cols-2 gap-4 text-xs font-sans">
                <div>
                  <h6 className="text-[10px] font-mono uppercase text-bananur-clay-light/70 mb-1">Logística del Abastecimiento</h6>
                  <p className="text-bananur-clay font-semibold">Método: {activePurchase.paymentMethod}</p>
                  <p className="text-bananur-clay-light font-light">Estimación despacho:</p>
                  <p className="font-mono text-bananur-gold-dark font-bold">{activePurchase.estimatedDeliveryDate || 'Sin programar'}</p>
                </div>
                <div>
                  <h6 className="text-[10px] font-mono uppercase text-bananur-clay-light/70 mb-1">Gasto Tributario (IVA Cred.)</h6>
                  <p className="font-mono text-bananur-clay-light">Subtotal: ${activePurchase.subtotal.toLocaleString('es-CL')}</p>
                  <p className="font-mono text-bananur-clay-light">IVA Crédito (19%): ${activePurchase.tax.toLocaleString('es-CL')}</p>
                  <p className="font-mono text-bananur-clay-light">Flete: ${activePurchase.shippingCost.toLocaleString('es-CL')}</p>
                  <div className="font-mono font-extrabold text-bananur-clay mt-1 text-[13px] border-t border-bananur-sand/40 pt-1">
                    Total: ${activePurchase.total.toLocaleString('es-CL')}
                  </div>
                </div>
              </div>

              {/* Supplier internal notes */}
              {activePurchase.internalNotes && (
                <div className="p-3 bg-bananur-cream/40 rounded-xl border border-bananur-sand/50 text-xs">
                  <span className="text-[10px] font-mono uppercase text-bananur-clay-light block mb-1">Notas de Suministro:</span>
                  <p className="text-bananur-clay font-light leading-relaxed">{activePurchase.internalNotes}</p>
                </div>
              )}

              {/* Documentos de Respaldo */}
              <div className="p-4 bg-white rounded-xl border border-bananur-sand space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-mono font-bold uppercase text-bananur-clay-light">📄 Documentos de Respaldo ({activePurchase.attachedDocs?.length || 0})</span>
                  <span className="text-[9px] text-bananur-clay-light/65 font-mono">Facturas / Boletas / XML</span>
                </div>

                {/* List of current attachments */}
                {(!activePurchase.attachedDocs || activePurchase.attachedDocs.length === 0) ? (
                  <p className="text-[11px] text-bananur-clay-light/60 font-light italic text-center py-2 bg-[#F9FAFB] rounded-lg border border-dashed border-bananur-sand/60">
                    No hay documentos de respaldo adjuntos para esta compra.
                  </p>
                ) : (
                  <div className="space-y-1.5 max-h-[100px] overflow-y-auto pr-1">
                    {activePurchase.attachedDocs.map((doc, dIdx) => (
                      <div key={dIdx} className="flex items-center justify-between bg-[#F9FAFB] p-2 rounded-lg border border-bananur-sand text-[11px] font-mono shadow-2xs hover:bg-bananur-sage-light duration-100">
                        <div className="flex items-center gap-1.5 truncate text-bananur-clay max-w-[70%]">
                          <FileText className="w-3.5 h-3.5 text-bananur-gold shrink-0" />
                          <span className="truncate font-semibold text-xs text-bananur-clay" title={doc.name}>{doc.name}</span>
                          <span className="text-[9px] text-bananur-clay-light/50 shrink-0">({doc.size})</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <button
                            type="button"
                            onClick={() => {
                              alert(`Abriendo documento simulado: ${doc.name}`);
                              if (onShowToast) onShowToast('Abriendo Documento', `Visualizando archivo "${doc.name}" en nueva pestaña simulada.`, 'info');
                            }}
                            className="text-[10px] font-bold text-bananur-clay hover:text-bananur-gold duration-100 cursor-pointer"
                          >
                            Ver
                          </button>
                          <span className="text-bananur-sand">|</span>
                          <button
                            type="button"
                            onClick={() => {
                              const updatedDocs = activePurchase.attachedDocs?.filter((_, i) => i !== dIdx) || [];
                              const updatedPurchase = { ...activePurchase, attachedDocs: updatedDocs };
                              setPurchases(prev => prev.map(p => p.id === activePurchase.id ? updatedPurchase : p));
                              setActivePurchase(updatedPurchase);
                              if (onShowToast) onShowToast('Documento Eliminado', `Se removió el archivo "${doc.name}"`, 'warning');
                            }}
                            className="text-[10px] font-bold text-rose-600 hover:text-rose-800 duration-100 cursor-pointer"
                          >
                            Eliminar
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* Simulated File upload dropzone */}
                <div className="relative group">
                  <input
                    type="file"
                    id="purchase-file-upload-input"
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                    onChange={(e) => {
                      const files = e.target.files;
                      if (files && files.length > 0) {
                        const file = files[0];
                        const newDoc = {
                          name: file.name,
                          size: `${(file.size / 1024).toFixed(0)} KB`,
                          dateAttached: new Date().toISOString().split('T')[0]
                        };
                        const updatedDocs = [...(activePurchase.attachedDocs || []), newDoc];
                        const updatedPurchase = { ...activePurchase, attachedDocs: updatedDocs };
                        setPurchases(prev => prev.map(p => p.id === activePurchase.id ? updatedPurchase : p));
                        setActivePurchase(updatedPurchase);
                        if (onShowToast) onShowToast('Archivo Adjuntado', `Se adjuntó "${file.name}" de forma exitosa.`, 'success');
                      }
                    }}
                  />
                  <div className="p-3 bg-[#F9FAFB] border border-dashed border-bananur-gold rounded-lg text-center group-hover:bg-[#F0FDF4] duration-150 transition-colors">
                    <ArrowUpRight className="w-5 h-5 text-bananur-gold mx-auto mb-1 animate-bounce" />
                    <p className="text-[10px] font-bold text-bananur-clay">
                      Arrastra tu factura / boleta o <span className="text-bananur-gold underline">busca un archivo</span>
                    </p>
                    <p className="text-[8px] text-bananur-clay-light/60 font-mono mt-0.5">Soporta PDF, XML, JPG, PNG (Max 10MB)</p>
                  </div>
                </div>
              </div>

              {/* Order Status Editor */}
              <div className="pt-4 border-t border-bananur-sand/50 space-y-3">
                <span className="text-xs font-bold uppercase tracking-wider font-mono text-bananur-clay block">Actualizar Estado Operativo de la Compra</span>
                <div className="grid grid-cols-4 gap-2">
                  {(['Pendiente', 'En Camino', 'Recibido', 'Cancelado'] as const).map((st) => {
                    const isActive = activePurchase.status === st;
                    const stStyles = {
                      'Pendiente': {
                        active: 'bg-amber-100 text-amber-850 border-2 border-amber-400 ring-2 ring-amber-200/50',
                        inactive: 'bg-amber-50/40 text-amber-600 border border-amber-200/50 hover:bg-amber-50 hover:text-amber-700 hover:border-amber-300'
                      },
                      'En Camino': {
                        active: 'bg-blue-100 text-blue-850 border-2 border-blue-400 ring-2 ring-blue-200/50',
                        inactive: 'bg-blue-50/40 text-blue-600 border border-blue-200/50 hover:bg-blue-50 hover:text-blue-700 hover:border-blue-300'
                      },
                      'Recibido': {
                        active: 'bg-emerald-100 text-emerald-850 border-2 border-emerald-400 ring-2 ring-emerald-200/50',
                        inactive: 'bg-emerald-50/40 text-emerald-600 border border-emerald-200/50 hover:bg-emerald-50 hover:text-emerald-700 hover:border-emerald-300'
                      },
                      'Cancelado': {
                        active: 'bg-rose-100 text-rose-850 border-2 border-rose-400 ring-2 ring-rose-200/50',
                        inactive: 'bg-rose-50/40 text-rose-600 border border-rose-200/50 hover:bg-rose-50 hover:text-rose-700 hover:border-rose-300'
                      }
                    }[st];

                    return (
                      <button
                        id={`purchases-status-btn-${st}`}
                        key={st}
                        type="button"
                        onClick={() => {
                          handleUpdatePurchaseStatus(activePurchase.id, st);
                          setActivePurchase(prev => prev ? { ...prev, status: st } : null);
                        }}
                        className={`flex flex-col items-center justify-center p-2 rounded-xl text-center font-bold tracking-wide transition-all duration-150 cursor-pointer ${
                          isActive ? stStyles.active : stStyles.inactive
                        }`}
                      >
                        <span className="text-[10px] uppercase font-mono tracking-wider">{st}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

            </div>

            {/* Print and Actions footer */}
            <div className="p-4 bg-bananur-cream border-t border-bananur-sand flex gap-3">
              <button
                id="purchase-drawer-btn-export"
                onClick={() => alert('Simulando exportación de factura de insumos en formato digital XLS/PDF para el contador.')}
                className="flex-1 py-3 px-4 rounded-xl text-xs font-bold border border-bananur-sand bg-white text-bananur-clay hover:bg-bananur-cream flex items-center justify-center gap-2 cursor-pointer"
              >
                <FileSpreadsheet className="w-4 h-4" />
                Exportar Reporte
              </button>
              <button
                id="purchase-drawer-btn-close"
                onClick={() => setActivePurchase(null)}
                className="flex-1 py-3 px-4 rounded-xl text-xs font-bold bg-bananur-clay text-bananur-cream hover:bg-bananur-gold hover:text-bananur-clay duration-150 transition-colors flex items-center justify-center cursor-pointer"
              >
                Cerrar Panel
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}
