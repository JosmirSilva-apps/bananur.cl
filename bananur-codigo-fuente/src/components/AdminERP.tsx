import React, { useState, useMemo, useEffect } from 'react';
import { 
  Building2, 
  Layers, 
  Coins, 
  Users, 
  Wrench, 
  Plus, 
  Trash2, 
  ShoppingBag, 
  TrendingUp, 
  TrendingDown, 
  Scale, 
  Download, 
  FileCheck2, 
  UserPlus, 
  ArrowRightLeft, 
  Flame, 
  PackageCheck,
  PackageCheck as AssemblyIcon,
  Sparkles,
  ClipboardList,
  AlertTriangle,
  Pencil,
  Search,
  Filter,
  ArrowUpDown,
  Check,
  X,
  Boxes,
  Package,
  Calculator,
  Tag,
  Info,
  LayoutGrid,
  List,
  ChevronLeft,
  ChevronRight,
  Terminal,
  Settings as SettingsIcon,
  Wifi,
  WifiOff,
  Sliders,
  PlayCircle,
  Scissors,
  PenTool,
  ExternalLink,
  Power,
  Ruler,
  Gauge,
  FileCode
} from 'lucide-react';
import { Order, ProductionBatch, ClothingLot, SupplyRequest, Workstation, TechnicalSketch } from '../types';
import { MOCK_CLOTHING_LOTS, MOCK_WORKSTATIONS, MOCK_TECHNICAL_SKETCHES } from '../data';
import {
  getOctoPrintConfig,
  saveOctoPrintConfig,
  sendOctoPrintCommand,
  OCTOPRINT_CALIBRATION_ACTIONS,
  OctoPrintConfig
} from '../services/octoprint';

interface AdminERPProps {
  orders: Order[];
  onUpdateOrderStatus: (id: string, status: 'En preparación' | 'Enviado' | 'Entregado') => void;
  onShowToast?: (title: string, description: string, type?: 'success' | 'info' | 'warning' | 'error') => void;
  activeTab?: 'kpi' | 'mrp' | 'plm' | 'fa' | 'crm';
  onTabChange?: (tab: 'kpi' | 'mrp' | 'plm' | 'fa' | 'crm') => void;
  isEmbedded?: boolean;
  clientCategories?: string[];
  supplierCategories?: string[];
  
  // Dynamic settings props
  productionStages?: Record<string, string[]>;
  responsables?: string[];
  materials?: RawMaterial[];
  onUpdateMaterials?: React.Dispatch<React.SetStateAction<RawMaterial[]>>;
  supplyRequests?: any[];
  onAddSupplyRequest?: (req: any) => void;
  clothingLots?: ClothingLot[];
  onUpdateClothingLots?: (lots: ClothingLot[]) => void;
  workstations?: Workstation[];
  onUpdateWorkstations?: (stations: Workstation[]) => void;
  onOpenWorkstationsConfig?: () => void;
}

// Interfaz para Materias Primas / Insumos de Producción
interface RawMaterial {
  id: string;
  code?: string;
  name: string;
  category: string;
  stock: number;
  unit: string;
  unitCost: number;     // Costo Unitario Promedio
  supplierName: string;
  lowStockAlert: number;
}

// Interfaz de Clientes del CRM Ejecutivo
interface ClientCRM {
  id: string;
  name: string;
  company: string;
  email: string;
  phone: string;
  segment: string;
  totalSpend: number;
  projectDescription: string;
  internalNotes: string;
  status: 'Activo' | 'Inactivo' | 'En Espera' | 'Cerrado';
}

// Interfaz para Proveedores del CRM
interface SupplierCRM {
  id: string;
  name: string;
  company: string;
  email: string;
  phone: string;
  category: string;
  totalPurchases: number;
  supplyItem: string;
  internalNotes: string;
  status: 'Activo' | 'Inactivo' | 'En Espera';
}



export default function AdminERP({
  orders,
  onUpdateOrderStatus,
  onShowToast,
  activeTab,
  onTabChange,
  isEmbedded,
  clientCategories = ['VIP Corporativo', 'Boutique Patrón', 'Cliente Regular'],
  supplierCategories = ['Impresión 3D', 'Costura', 'Crochet', 'Embalaje', 'Herramientas'],
  productionStages = {
    'diseño': ['Modelado / Diseño', 'Boceto Inicial', 'Aprobación Cliente', 'Listo para Taller'],
    'impresion3d': ['Modelado 3D', 'Preparación G-code', 'Procesamiento en Cama', 'Post-procesado', 'Listo para Starken'],
    'costura': ['Corte de Lona/Algodón', 'Corte & Confección', 'Planchado', 'Listo para Starken'],
    'crochet': ['Tejido Manual', 'Ensamblado Amigurumi', 'Detalles / Ojos', 'Listo para Starken'],
  },
  responsables = [
    'Yo (Creador & Responsable Único)',
    'Constanza Silva',
    'Carlos Ruiz',
    'Francisca Leiva'
  ],
  materials: externalMaterials,
  onUpdateMaterials,
  supplyRequests: externalSupplyRequests,
  onAddSupplyRequest,
  clothingLots: externalClothingLots,
  onUpdateClothingLots,
  workstations: externalWorkstations,
  onUpdateWorkstations,
  onOpenWorkstationsConfig
}: AdminERPProps) {
  const [internalWorkstations, setInternalWorkstations] = useState<Workstation[]>(MOCK_WORKSTATIONS);
  const workstations = externalWorkstations || internalWorkstations;
  const setWorkstations = onUpdateWorkstations || setInternalWorkstations;
  const activeWorkstations = useMemo(() => workstations.filter(w => w.isActive), [workstations]);

  const [localErpTab, setLocalErpTab] = useState<'kpi' | 'mrp' | 'plm' | 'fa' | 'crm'>('kpi');
  const [editingClient, setEditingClient] = useState<ClientCRM | null>(null);
  const [editingSupplier, setEditingSupplier] = useState<SupplierCRM | null>(null);
  
  const erpTab = activeTab || localErpTab;
  const setErpTab = onTabChange || setLocalErpTab;

  // --- MATERIAS PRIMAS (MRP) ---
  const [internalMaterials, setInternalMaterials] = useState<RawMaterial[]>([
    { id: 'mat-1', code: 'BNN-MAT-101', name: 'Filamento PLA de Alta Resolución (1.75mm)', category: 'Impresión 3D', stock: 5, unit: 'bobinas', unitCost: 14500, supplierName: '3D América SpA', lowStockAlert: 8 },
    { id: 'mat-2', code: 'BNN-MAT-102', name: "Tela de Algodón d'Ischia Premium", category: 'Costura', stock: 1, unit: 'metros', unitCost: 8900, supplierName: 'Telas Costa Valparaíso S.A.', lowStockAlert: 4 },
    { id: 'mat-3', code: 'BNN-MAT-103', name: 'Hilado de Algodón Orgánico Chilote (4 Hebras)', category: 'Crochet', stock: 120, unit: 'madejas', unitCost: 2450, supplierName: 'Cordones de la Costa', lowStockAlert: 150 },
    { id: 'mat-4', code: 'BNN-MAT-104', name: 'Caja de Envío Ecológica Bananur S', category: 'Embalaje', stock: 65, unit: 'unidades', unitCost: 1200, supplierName: 'Cartones Viña SpA', lowStockAlert: 15 },
    { id: 'mat-5', code: 'BNN-MAT-105', name: 'Filamento PETG de Resistencia Industrial', category: 'Impresión 3D', stock: 0, unit: 'bobinas', unitCost: 18500, supplierName: '3D América SpA', lowStockAlert: 3 },
    { id: 'mat-6', code: 'BNN-MAT-106', name: 'Vellón Siliconado Súper Soft (Relleno)', category: 'Crochet', stock: 2, unit: 'kilos', unitCost: 5200, supplierName: 'Distribuidora Textil Sur', lowStockAlert: 3 },
    { id: 'mat-7', code: 'BNN-MAT-107', name: 'Cintas Elásticas y Botones Surtidos', category: 'Costura', stock: 320, unit: 'unidades', unitCost: 150, supplierName: 'Botonería El Sol', lowStockAlert: 50 }
  ]);

  const materials = externalMaterials || internalMaterials;
  const setMaterials = onUpdateMaterials || setInternalMaterials;

  // --- FARDOS Y LOTES DE ROPA VINTAGE (MATERIAS PRIMAS) ---
  const [internalClothingLots, setInternalClothingLots] = useState<ClothingLot[]>(MOCK_CLOTHING_LOTS);
  const availableLots = externalClothingLots || internalClothingLots;
  const setAvailableLots = onUpdateClothingLots || setInternalClothingLots;

  // Sub-sección activa dentro de MRP: Insumos de Taller vs Fardos de Ropa Vintage
  const [mrpSection, setMrpSection] = useState<'insumos' | 'fardos'>('insumos');

  // Formulario de Alta de Nuevo Fardo
  const [showAddLot, setShowAddLot] = useState(false);
  const [lotCode, setLotCode] = useState('');
  const [lotName, setLotName] = useState('');
  const [lotOrigin, setLotOrigin] = useState('');
  const [lotTotalPrice, setLotTotalPrice] = useState('1260000');
  const [lotTotalWeightKg, setLotTotalWeightKg] = useState('45');
  const [lotPricePerKg, setLotPricePerKg] = useState('28000');
  const [lotItemsCount, setLotItemsCount] = useState('60');
  const [lotNotes, setLotNotes] = useState('');
  const [isRateManuallyOverridden, setIsRateManuallyOverridden] = useState(false);

  // Filtros y Búsqueda de Fardos
  const [lotSearchQuery, setLotSearchQuery] = useState('');
  const [lotSortBy, setLotSortBy] = useState<'date-desc' | 'name-asc' | 'rate-desc' | 'rate-asc' | 'price-desc' | 'weight-desc'>('date-desc');

  // Edición de Fardo
  const [editingLotId, setEditingLotId] = useState<string | null>(null);
  const [editLotCode, setEditLotCode] = useState('');
  const [editLotName, setEditLotName] = useState('');
  const [editLotOrigin, setEditLotOrigin] = useState('');
  const [editLotTotalPrice, setEditLotTotalPrice] = useState('');
  const [editLotTotalWeightKg, setEditLotTotalWeightKg] = useState('');
  const [editLotPricePerKg, setEditLotPricePerKg] = useState('');
  const [editLotItemsCount, setEditLotItemsCount] = useState('');
  const [editLotNotes, setEditLotNotes] = useState('');

  // Tasador Rápido de Prenda: cada fardo tiene su propio gramaje de simulación independiente (en gramos)
  const [simWeightsByLot, setSimWeightsByLot] = useState<Record<string, string>>({
    'lot-vintage-01': '380',
    'lot-vintage-02': '720',
    'lot-vintage-03': '220',
    'lot-vintage-04': '950',
  });
  const [activeSimLotId, setActiveSimLotId] = useState<string | null>(null);

  const getSimWeightForLot = (lotId: string) => {
    return simWeightsByLot[lotId] ?? '380';
  };

  const setSimWeightForLot = (lotId: string, grams: string) => {
    setSimWeightsByLot(prev => ({
      ...prev,
      [lotId]: grams
    }));
  };

  // Recálculo automático de la tarifa por kilo al cambiar precio total o peso total en registro de fardo
  useEffect(() => {
    const price = Number(lotTotalPrice) || 0;
    const weight = Number(lotTotalWeightKg) || 0;
    if (price > 0 && weight > 0 && !isRateManuallyOverridden) {
      const calcRate = Math.round(price / weight);
      setLotPricePerKg(String(calcRate));
    }
  }, [lotTotalPrice, lotTotalWeightKg, isRateManuallyOverridden]);

  // Recálculo automático de tarifa por kilo en edición de fardo
  useEffect(() => {
    if (editingLotId) {
      const price = Number(editLotTotalPrice) || 0;
      const weight = Number(editLotTotalWeightKg) || 0;
      if (price > 0 && weight > 0) {
        const calcRate = Math.round(price / weight);
        setEditLotPricePerKg(String(calcRate));
      }
    }
  }, [editLotTotalPrice, editLotTotalWeightKg, editingLotId]);

  // Métricas consolidadas de fardos
  const lotMetrics = useMemo(() => {
    const totalLots = availableLots.length;
    const totalInvestment = availableLots.reduce((sum, l) => sum + (l.totalPrice || ((l.totalWeightKg || 0) * l.pricePerKg)), 0);
    const totalWeight = availableLots.reduce((sum, l) => sum + (l.totalWeightKg || 0), 0);
    const weightedAvgRate = totalWeight > 0 ? Math.round(totalInvestment / totalWeight) : 
      (totalLots > 0 ? Math.round(availableLots.reduce((sum, l) => sum + l.pricePerKg, 0) / totalLots) : 0);
    const totalItemsCount = availableLots.reduce((sum, l) => sum + (l.itemsCount || 0), 0);

    return {
      totalLots,
      totalInvestment,
      totalWeight,
      weightedAvgRate,
      totalItemsCount
    };
  }, [availableLots]);

  // Filtrado y ordenamiento de fardos
  const filteredLots = useMemo(() => {
    let result = [...availableLots];
    if (lotSearchQuery.trim()) {
      const q = lotSearchQuery.toLowerCase();
      result = result.filter(l => 
        l.code.toLowerCase().includes(q) ||
        l.name.toLowerCase().includes(q) ||
        (l.origin && l.origin.toLowerCase().includes(q)) ||
        (l.notes && l.notes.toLowerCase().includes(q))
      );
    }

    result.sort((a, b) => {
      if (lotSortBy === 'date-desc') {
        return (b.dateAdded || '').localeCompare(a.dateAdded || '');
      }
      if (lotSortBy === 'name-asc') {
        return a.name.localeCompare(b.name);
      }
      if (lotSortBy === 'rate-desc') {
        return b.pricePerKg - a.pricePerKg;
      }
      if (lotSortBy === 'rate-asc') {
        return a.pricePerKg - b.pricePerKg;
      }
      if (lotSortBy === 'price-desc') {
        const pA = a.totalPrice || ((a.totalWeightKg || 0) * a.pricePerKg);
        const pB = b.totalPrice || ((b.totalWeightKg || 0) * b.pricePerKg);
        return pB - pA;
      }
      if (lotSortBy === 'weight-desc') {
        return (b.totalWeightKg || 0) - (a.totalWeightKg || 0);
      }
      return 0;
    });

    return result;
  }, [availableLots, lotSearchQuery, lotSortBy]);

  const handleAddLotSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!lotCode.trim() || !lotName.trim()) {
      if (onShowToast) {
        onShowToast('Campos requeridos', 'Por favor ingresa al menos el código y nombre del fardo.', 'warning');
      }
      return;
    }
    const priceNum = Number(lotTotalPrice) || 0;
    const weightNum = Number(lotTotalWeightKg) || 0;
    const calcRate = (priceNum > 0 && weightNum > 0) ? Math.round(priceNum / weightNum) : (Number(lotPricePerKg) || 0);
    const finalRate = Number(lotPricePerKg) > 0 ? Number(lotPricePerKg) : calcRate;

    const newLot: ClothingLot = {
      id: `lot-${Date.now()}`,
      code: lotCode.trim().toUpperCase(),
      name: lotName.trim(),
      origin: lotOrigin.trim() || 'Importación Especial',
      totalPrice: priceNum > 0 ? priceNum : undefined,
      totalWeightKg: weightNum > 0 ? weightNum : undefined,
      pricePerKg: finalRate,
      itemsCount: Number(lotItemsCount) || undefined,
      notes: lotNotes.trim() || undefined,
      dateAdded: new Date().toISOString().split('T')[0]
    };

    const updated = [newLot, ...availableLots];
    setAvailableLots(updated);

    // Reset
    setLotCode('');
    setLotName('');
    setLotOrigin('');
    setLotTotalPrice('1260000');
    setLotTotalWeightKg('45');
    setLotPricePerKg('28000');
    setLotItemsCount('60');
    setLotNotes('');
    setShowAddLot(false);
    setIsRateManuallyOverridden(false);

    if (onShowToast) {
      onShowToast(
        'Fardo Textil Registrado',
        `Se registró el fardo [${newLot.code}] "${newLot.name}" con tarifa fija de $${newLot.pricePerKg.toLocaleString('es-CL')}/kg.`,
        'success'
      );
    }
  };

  const startEditingLot = (lot: ClothingLot) => {
    setEditingLotId(lot.id);
    setEditLotCode(lot.code);
    setEditLotName(lot.name);
    setEditLotOrigin(lot.origin || '');
    setEditLotTotalPrice(lot.totalPrice ? String(lot.totalPrice) : (lot.totalWeightKg ? String(lot.totalWeightKg * lot.pricePerKg) : ''));
    setEditLotTotalWeightKg(lot.totalWeightKg ? String(lot.totalWeightKg) : '');
    setEditLotPricePerKg(String(lot.pricePerKg));
    setEditLotItemsCount(lot.itemsCount ? String(lot.itemsCount) : '');
    setEditLotNotes(lot.notes || '');
  };

  const handleSaveLotEdit = (lotId: string) => {
    const priceNum = Number(editLotTotalPrice) || 0;
    const weightNum = Number(editLotTotalWeightKg) || 0;
    const calcRate = (priceNum > 0 && weightNum > 0) ? Math.round(priceNum / weightNum) : (Number(editLotPricePerKg) || 0);
    const finalRate = Number(editLotPricePerKg) > 0 ? Number(editLotPricePerKg) : calcRate;

    const updated = availableLots.map(l => {
      if (l.id === lotId) {
        return {
          ...l,
          code: editLotCode.trim().toUpperCase(),
          name: editLotName.trim(),
          origin: editLotOrigin.trim() || undefined,
          totalPrice: priceNum > 0 ? priceNum : undefined,
          totalWeightKg: weightNum > 0 ? weightNum : undefined,
          pricePerKg: finalRate,
          itemsCount: Number(editLotItemsCount) || undefined,
          notes: editLotNotes.trim() || undefined
        };
      }
      return l;
    });

    setAvailableLots(updated);
    setEditingLotId(null);
    if (onShowToast) {
      onShowToast('Fardo Actualizado', `Se guardaron los cambios del fardo [${editLotCode.toUpperCase()}].`, 'success');
    }
  };

  const handleDeleteLot = (lotId: string, code: string) => {
    const updated = availableLots.filter(l => l.id !== lotId);
    setAvailableLots(updated);
    if (onShowToast) {
      onShowToast('Fardo Eliminado', `Se dio de baja el fardo [${code}].`, 'info');
    }
  };

  // --- METRICAS DE PLANIFICACIÓN DE RECURSOS (MRP) BASADO EN MOCK_ORDERS Activas ('En preparación') ---
  const activeOrdersInPreparation = useMemo(() => {
    return orders.filter(o => o.status === 'En preparación');
  }, [orders]);

  const mrpDemand = useMemo(() => {
    // Calculamos el consumo de insumos proyectado
    const demand: Record<string, number> = {
      'mat-1': 0, // PLA
      'mat-2': 0, // Algodón
      'mat-3': 0, // Hilado
      'mat-4': 0, // Cajas de Envío
      'mat-5': 0, // PETG
      'mat-6': 0, // Vellón
      'mat-7': 0  // Cintas & botones
    };

    activeOrdersInPreparation.forEach(o => {
      o.items.forEach(item => {
        const nameLower = item.productName.toLowerCase();
        const qty = item.quantity;

        // Impresión 3D
        if (nameLower.includes('impresión') || nameLower.includes('3d') || nameLower.includes('soporte') || nameLower.includes('organizador')) {
          demand['mat-1'] += 0.3 * qty; // 0.3 bobinas PLA por unidad
          demand['mat-5'] += 0.1 * qty; // 0.1 bobinas PETG por unidad
        }
        // Costura
        if (nameLower.includes('bolsa') || nameLower.includes('estuche') || nameLower.includes('costura') || nameLower.includes('confección')) {
          demand['mat-2'] += 0.75 * qty; // 0.75 metros por unidad
          demand['mat-7'] += 4 * qty;    // 4 botones o cintas
        }
        // Crochet
        if (nameLower.includes('amigurumi') || nameLower.includes('crochet') || nameLower.includes('cactus') || nameLower.includes('jirafa') || nameLower.includes('tejido')) {
          demand['mat-3'] += 2.5 * qty;  // 2.5 madejas por amigurumi
          demand['mat-6'] += 0.1 * qty;  // 0.1 kg de vellón por amigurumi
        }
        // Despacho: Caja de envío por item
        demand['mat-4'] += qty;
      });
    });

    return demand;
  }, [activeOrdersInPreparation]);

  // Handler para abastecimiento automático inteligente
  const handleAutoReplenishAll = () => {
    setMaterials(prev => prev.map(m => {
      const demandVal = mrpDemand[m.id] || 0;
      const isCritical = m.stock - demandVal <= m.lowStockAlert;
      if (isCritical) {
        // Abastecemos hasta tener el triple del límite crítico o demanda, lo que sea primario
        const safetyAmount = Math.ceil(Math.max(m.lowStockAlert * 3, demandVal * 2.5));
        return {
          ...m,
          stock: m.stock + safetyAmount
        };
      }
      return m;
    }));
    if (onShowToast) {
      onShowToast(
        'Abastecimiento MRP Automatizado',
        'Se han generado órdenes de compra digitales con tus proveedores de filamento 3D, telas d\'Ischia, lanas y vellón siliconado. El stock ha sido reabastecido al rango de seguridad.',
        'success'
      );
    }
  };

  // -- Material edit/create state --
  const [showAddMaterial, setShowAddMaterial] = useState(false);
  const [mName, setMName] = useState('');
  const [mCat, setMCat] = useState<string>('Impresión 3D');
  const [mStock, setMStock] = useState('15');
  const [mUnit, setMUnit] = useState('unidades');
  const [mCost, setMCost] = useState('3500');
  const [mSupplier, setMSupplier] = useState('');
  const [mLowStockAlert, setMLowStockAlert] = useState('5');

  // Submit handler for adding a new raw material to the MRP system
  const handleAddMaterialSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!mName.trim()) {
      if (onShowToast) {
        onShowToast('Campo requerido', 'Ingresa el nombre del insumo o materia prima.', 'warning');
      }
      return;
    }

    const stockNum = Number(mStock) || 0;
    const costNum = Number(mCost) || 0;
    const alertNum = Number(mLowStockAlert) || 5;

    const newMaterial: RawMaterial = {
      id: `mat-${Date.now().toString().slice(-4)}`,
      name: mName.trim(),
      category: mCat || 'Impresión 3D',
      stock: stockNum,
      unit: mUnit.trim() || 'unidades',
      unitCost: costNum,
      supplierName: mSupplier.trim() || 'Proveedor Local',
      lowStockAlert: alertNum
    };

    setMaterials(prev => [newMaterial, ...prev]);

    // Reset form & close
    setMName('');
    setMStock('15');
    setMUnit('unidades');
    setMCost('3500');
    setMSupplier('');
    setMLowStockAlert('5');
    setShowAddMaterial(false);

    if (onShowToast) {
      onShowToast(
        'Insumo Registrado con Éxito',
        `Se agregó "${newMaterial.name}" al inventario de taller con stock inicial de ${newMaterial.stock} ${newMaterial.unit}.`,
        'success'
      );
    }
  };

  // Handler para transferir registro de Alerta de Stock Crítico a Órdenes de Suministro
  const handleCreatePurchaseOrderFromAlert = (m: RawMaterial) => {
    const suggestedQty = Math.max(m.lowStockAlert * 3, 10);
    const orderId = `OC-${Date.now().toString().slice(-5)}`;
    const newReq: SupplyRequest = {
      id: orderId,
      date: new Date().toISOString().split('T')[0],
      materialId: m.id,
      materialName: m.name,
      quantityRequested: suggestedQty,
      reason: `Reabastecimiento urgente de taller por alerta de stock crítico (${m.stock} ${m.unit} disponibles vs umbral ${m.lowStockAlert} ${m.unit}).`,
      status: 'Pendiente',
      attachedDocs: [
        {
          name: `orden_suministro_${m.id}_${orderId}.pdf`,
          size: '142 KB',
          dateAttached: new Date().toISOString().split('T')[0]
        }
      ]
    };

    if (onAddSupplyRequest) {
      onAddSupplyRequest(newReq);
    }

    if (onShowToast) {
      onShowToast(
        'Orden de Compra Generada',
        `Se creó la orden de compra ${orderId} por ${suggestedQty} ${m.unit} de "${m.name}" y se transfirió a Órdenes de Suministro.`,
        'success'
      );
    }
  };

  // Synchronize category inputs with the parent categories
  useEffect(() => {
    if (supplierCategories && supplierCategories.length > 0) {
      if (!supplierCategories.includes(mCat)) {
        setMCat(supplierCategories[0]);
      }
      if (!supplierCategories.includes(pCategory)) {
        setPCategory(supplierCategories[0]);
      }
    }
  }, [supplierCategories]);

  useEffect(() => {
    if (clientCategories && clientCategories.length > 0) {
      if (!clientCategories.includes(cSegment)) {
        setCSegment(clientCategories[0]);
      }
    }
  }, [clientCategories]);

  // Category filter state for Critical Stock alerts component
  const [stockAlertCategory, setStockAlertCategory] = useState<string>('Todas');

  // --- MRP SEARCH AND EDIT STATES ---
  const [mrpSearchQuery, setMrpSearchQuery] = useState('');
  const [mrpCategoryFilter, setMrpCategoryFilter] = useState<string>('Todas');
  const [mrpStockFilter, setMrpStockFilter] = useState<'Todos' | 'Bajo Alerta / Crítico' | 'Normal'>('Todos');
  const [mrpSortBy, setMrpSortBy] = useState<'name-asc' | 'stock-asc' | 'stock-desc' | 'cost-desc' | 'value-desc'>('name-asc');

  // Inline Editing states for materials
  const [editingMaterialId, setEditingMaterialId] = useState<string | null>(null);
  const [editMatName, setEditMatName] = useState('');
  const [editMatCategory, setEditMatCategory] = useState<string>('Impresión 3D');
  const [editMatStock, setEditMatStock] = useState('0');
  const [editMatUnit, setEditMatUnit] = useState('');
  const [editMatCost, setEditMatCost] = useState('0');
  const [editMatSupplier, setEditMatSupplier] = useState('');
  const [editMatLowStockAlert, setEditMatLowStockAlert] = useState('0');

  // Workstation states for the interactive workspaces
  const [selectedWorkstation, setSelectedWorkstation] = useState<string>('all');
  
  // 1. Diseño Station States (Mesa de Moldería Vectorial & Archivos Técnicos Unificados)
  const [technicalSketches, setTechnicalSketches] = useState<TechnicalSketch[]>(MOCK_TECHNICAL_SKETCHES);
  const [sketchNameInput, setSketchNameInput] = useState<string>('');
  const [sketchFormatInput, setSketchFormatInput] = useState<'.sketch' | '.dxf' | '.svg' | '.pdf' | '.blend'>('.sketch');
  const [sketchCategoryInput, setSketchCategoryInput] = useState<'Patrón de Moldería' | 'Ficha Técnica' | 'Corte Láser' | 'Boceto Conceptual' | 'Prototipo 3D'>('Patrón de Moldería');
  const [sketchScaleInput, setSketchScaleInput] = useState<string>('1:1 Real (mm)');
  const [sketchFilterFormat, setSketchFilterFormat] = useState<string>('all');
  const [sketchSearchQuery, setSketchSearchQuery] = useState<string>('');

  const handleAddTechnicalSketch = () => {
    if (!sketchNameInput.trim()) {
      onShowToast?.('Nombre Requerido', 'Por favor ingresa un nombre para el nuevo boceto técnico.', 'error');
      return;
    }
    let finalName = sketchNameInput.trim();
    if (!finalName.endsWith(sketchFormatInput)) {
      finalName += sketchFormatInput;
    }
    const newSketch: TechnicalSketch = {
      id: `sk-${Date.now()}`,
      name: finalName,
      format: sketchFormatInput,
      category: sketchCategoryInput,
      scale: sketchScaleInput,
      date: new Date().toISOString().split('T')[0],
      size: `${(Math.random() * 2 + 1.2).toFixed(1)} MB`,
      status: 'Boceto Activo',
      notes: 'Mesa digital para manufactura de autor.'
    };
    setTechnicalSketches(prev => [newSketch, ...prev]);
    setSketchNameInput('');
    onShowToast?.(
      'Boceto Técnico Registrado',
      `Se agregó "${newSketch.name}" a los archivos de diseño en escala ${newSketch.scale}.`,
      'success'
    );
  };

  const handleToggleSketchStatus = (sketchId: string) => {
    setTechnicalSketches(prev => prev.map(s => {
      if (s.id !== sketchId) return s;
      const nextStatus = s.status === 'Boceto Activo' ? 'Listo para Plotter' :
                         s.status === 'Listo para Plotter' ? 'Aprobado para Taller' : 'Boceto Activo';
      return { ...s, status: nextStatus };
    }));
  };

  const handleDeleteSketch = (sketchId: string, sketchName: string) => {
    setTechnicalSketches(prev => prev.filter(s => s.id !== sketchId));
    onShowToast?.('Boceto Eliminado', `Se archivó el archivo técnico "${sketchName}".`, 'info');
  };

  const filteredSketches = useMemo(() => {
    return technicalSketches.filter(s => {
      const matchesQuery = s.name.toLowerCase().includes(sketchSearchQuery.toLowerCase()) ||
                           s.category.toLowerCase().includes(sketchSearchQuery.toLowerCase());
      const matchesFormat = sketchFilterFormat === 'all' || s.format === sketchFilterFormat;
      return matchesQuery && matchesFormat;
    });
  }, [technicalSketches, sketchSearchQuery, sketchFilterFormat]);

  // 2. Impresión 3D Station States & OctoPrint Integration
  const [extruderTemp, setExtruderTemp] = useState<number>(215);
  const [bedTemp, setBedTemp] = useState<number>(60);
  const [filamentType, setFilamentType] = useState<string>('PLA ecológico');
  const [isCalibrating, setIsCalibrating] = useState<boolean>(false);
  const [printerLog, setPrinterLog] = useState<string[]>([
    '[SYSTEM]: OctoPrint Daemon conectado en http://octopi.local:5000',
    '[OCTOPRINT]: Status Operational (Marlin 2.1.2 firm).',
    '[SYSTEM]: Cama nivelada con sensor de inducción OK.'
  ]);
  const [octoConfig, setOctoConfig] = useState<OctoPrintConfig>(getOctoPrintConfig);
  const [showOctoSettings, setShowOctoSettings] = useState<boolean>(false);
  const [customGcode, setCustomGcode] = useState<string>('');
  const [octoLoadingCmd, setOctoLoadingCmd] = useState<string | null>(null);

  // View modes and pagination across admin lists
  const [materialsViewMode, setMaterialsViewMode] = useState<'cards' | 'table'>('table');
  const [materialsPage, setMaterialsPage] = useState<number>(1);
  const materialsPerPage = 6;

  const [fardosViewMode, setFardosViewMode] = useState<'cards' | 'table'>('table');
  const [fardosPage, setFardosPage] = useState<number>(1);
  const fardosPerPage = 6;

  const [batchesViewMode, setBatchesViewMode] = useState<'cards' | 'table'>('table');
  const [batchesPage, setBatchesPage] = useState<number>(1);
  const batchesPerPage = 6;

  const [clientsViewMode, setClientsViewMode] = useState<'cards' | 'table'>('table');
  const [clientsPage, setClientsPage] = useState<number>(1);
  const clientsPerPage = 6;

  const [suppliersViewMode, setSuppliersViewMode] = useState<'cards' | 'table'>('table');
  const [suppliersPage, setSuppliersPage] = useState<number>(1);
  const suppliersPerPage = 6;

  // Handler for executing OctoPrint G-Code commands
  const handleExecuteOctoCommand = async (actionKey: string, cmd: string | string[], label: string) => {
    setOctoLoadingCmd(actionKey);
    setIsCalibrating(true);
    const displayCmd = Array.isArray(cmd) ? cmd.join('; ') : cmd;
    setPrinterLog(prev => [...prev, `[G-CODE -> OCTOPRINT]: ${displayCmd} (${label})`]);

    try {
      const result = await sendOctoPrintCommand(cmd, octoConfig);
      setPrinterLog(prev => [...prev, result.log]);
      if (onShowToast) {
        onShowToast('Comando OctoPrint Enviado', `${label}: ${result.response}`, 'success');
      }
    } catch (err: any) {
      setPrinterLog(prev => [...prev, `[ERROR]: Falló envío a OctoPrint: ${err?.message || 'Error de conexión'}`]);
      if (onShowToast) {
        onShowToast('Error OctoPrint', 'No se pudo comunicar con el servidor OctoPrint.', 'error');
      }
    } finally {
      setIsCalibrating(false);
      setOctoLoadingCmd(null);
    }
  };

  // Handler for custom G-Code command from the terminal input
  const handleSendCustomGcode = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!customGcode.trim()) return;
    const gcode = customGcode.trim().toUpperCase();
    setCustomGcode('');
    await handleExecuteOctoCommand('custom', gcode, `Comando manual ${gcode}`);
  };

  // 3. Costura Fina Station States (Herramientas Reales de Sastrería & Atelier Industrial)
  const [threadTension, setThreadTension] = useState<number>(4.5);
  const [needleType, setNeedleType] = useState<string>('Universal 90/14 (Lona y Algodón)');
  const [presserFoot, setPresserFoot] = useState<string>('Prensatelas Estándar de Acero');
  const [stitchLength, setStitchLength] = useState<string>('3.0 mm (Pespunte de Carga)');
  const [presserPressure, setPresserPressure] = useState<string>('Firme (3.5 kg para lona)');
  const [autoBackstitch, setAutoBackstitch] = useState<boolean>(true);
  const [rollWidth, setRollWidth] = useState<string>('1.50 m (Ancho Estándar Lona)');
  const [garmentModel, setGarmentModel] = useState<string>('Bolso Tote Lona 14oz');
  const [seamAllowance, setSeamAllowance] = useState<string>('1.5 cm (Costura Francesa Reforzada)');
  const [fabricShrinkage, setFabricShrinkage] = useState<string>('3% (Algodón Prelavado)');
  const [needleHours, setNeedleHours] = useState<number>(6.5);
  const [isOilOk, setIsOilOk] = useState<boolean>(true);
  const [cutPieces, setCutPieces] = useState<{ id: string; name: string; fabric: string; cut: boolean }[]>([
    { id: 'cp-1', name: 'Cuerpo Delantero Principal', fabric: 'Lona 14oz Cruda', cut: true },
    { id: 'cp-2', name: 'Cuerpo Espalda Reforzado', fabric: 'Lona 14oz Cruda', cut: true },
    { id: 'cp-3', name: 'Bolsillo Frontal Parche', fabric: 'Denim 90s Vintage', cut: false },
    { id: 'cp-4', name: 'Vistas & Cuello Anatómico', fabric: "Algodón d'Ischia", cut: false },
    { id: 'cp-5', name: 'Forro Interior Transpirable', fabric: 'Popelín 100% Algodón', cut: false },
    { id: 'cp-6', name: 'Asas de Carga Pesada (x2)', fabric: 'Cinta Algodón Trenzado', cut: true }
  ]);
  const [newPieceName, setNewPieceName] = useState<string>('');
  const [newPieceFabric, setNewPieceFabric] = useState<string>('Lona 14oz');

  const handleResetNeedleHours = () => {
    setNeedleHours(0);
    onShowToast?.('Aguja Reemplazada', 'Se instaló una nueva aguja y el contador de horas de perforación se reinició a 0 horas.', 'success');
  };

  const handleAddCutPiece = () => {
    if (!newPieceName.trim()) return;
    const newPiece = {
      id: `cp-${Date.now()}`,
      name: newPieceName.trim(),
      fabric: newPieceFabric.trim(),
      cut: false
    };
    setCutPieces(prev => [...prev, newPiece]);
    setNewPieceName('');
    onShowToast?.('Pieza de Moldería Añadida', `Se incorporó "${newPiece.name}" al checklist de corte.`, 'success');
  };

  const handleToggleCutPiece = (pieceId: string) => {
    setCutPieces(prev => prev.map(p => p.id === pieceId ? { ...p, cut: !p.cut } : p));
  };

  const handleDeleteCutPiece = (pieceId: string) => {
    setCutPieces(prev => prev.filter(p => p.id !== pieceId));
  };

  // 4. Crochet & Tejidos Station States
  const [crochetRowsCount, setCrochetRowsCount] = useState<number>(24);
  const [crochetStitchesCount, setCrochetStitchesCount] = useState<number>(128);
  const [crochetHookSize, setCrochetHookSize] = useState<string>('3.5 mm');

  // Proceso memorizado para filtrar y ordenar materiales (módulo MRP)
  const filteredMaterials = useMemo(() => {
    let result = [...materials];

    // Filtro por búsqueda de Texto (nombre, ID, proveedor)
    if (mrpSearchQuery.trim()) {
      const q = mrpSearchQuery.toLowerCase();
      result = result.filter(m => 
        m.name.toLowerCase().includes(q) || 
        m.id.toLowerCase().includes(q) || 
        (m.supplierName && m.supplierName.toLowerCase().includes(q))
      );
    }

    // Filtro por Categorías MRP
    if (mrpCategoryFilter !== 'Todas') {
      result = result.filter(m => m.category === mrpCategoryFilter);
    }

    // Filtro por Estado de Reservas (Bajo Stock Alerta vs Normal)
    if (mrpStockFilter === 'Bajo Alerta / Crítico') {
      result = result.filter(m => m.stock <= m.lowStockAlert);
    } else if (mrpStockFilter === 'Normal') {
      result = result.filter(m => m.stock > m.lowStockAlert);
    }

    // Clasificación / Ordenamiento
    result.sort((a, b) => {
      switch (mrpSortBy) {
        case 'name-asc':
          return a.name.localeCompare(b.name);
        case 'stock-asc':
          return a.stock - b.stock;
        case 'stock-desc':
          return b.stock - a.stock;
        case 'cost-desc':
          return b.unitCost - a.unitCost;
        case 'value-desc':
          return (b.stock * b.unitCost) - (a.stock * a.unitCost);
        default:
          return 0;
      }
    });

    return result;
  }, [materials, mrpSearchQuery, mrpCategoryFilter, mrpStockFilter, mrpSortBy]);

  // Paginación y vistas de Insumos (MRP)
  const totalMaterialsPages = Math.max(1, Math.ceil(filteredMaterials.length / materialsPerPage));
  const paginatedMaterials = useMemo(() => {
    const start = (materialsPage - 1) * materialsPerPage;
    return filteredMaterials.slice(start, start + materialsPerPage);
  }, [filteredMaterials, materialsPage, materialsPerPage]);

  // Paginación y vistas de Fardos Vintage (Materias Primas)
  const totalFardosPages = Math.max(1, Math.ceil(filteredLots.length / fardosPerPage));
  const paginatedFardos = useMemo(() => {
    const start = (fardosPage - 1) * fardosPerPage;
    return filteredLots.slice(start, start + fardosPerPage);
  }, [filteredLots, fardosPage, fardosPerPage]);

  // --- MANUFACTURING LINE / PLM TAB ---
  const [productionBatches, setProductionBatches] = useState<ProductionBatch[]>([
    { id: 'batch-101', orderId: 'OR-5221', clientName: 'Roberto Fuentes', productName: 'Soporte Geométrico 3D Reciclado', quantity: 15, artisan: 'Yo (Creador & Artesano Único)', progress: 65, currentStage: 'Procesamiento en Cama' },
    { id: 'batch-102', orderId: 'OR-5223', clientName: 'Daniela Almonacid', productName: "Estuche de Costura con Algodón d'Ischia", quantity: 5, artisan: 'Yo (Creador & Artesano Único)', progress: 30, currentStage: 'Corte & Confección' },
    { id: 'batch-103', orderId: 'OR-5224', clientName: 'Guillermo Schmidt', productName: 'Soportes de Filamento PETG Reforzados', quantity: 50, artisan: 'Yo (Creador & Artesano Único)', progress: 15, currentStage: 'Modelado / Diseño' },
    { id: 'batch-104', orderId: 'OR-5198', clientName: 'María Ignacia Valenzuela', productName: 'Amigurumi de Jirafa "Tierra Dulce"', quantity: 10, artisan: 'Yo (Creador & Artesano Único)', progress: 90, currentStage: 'Tejido Manual' }
  ]);

  // Paginación y vistas de Lotes de Confección (PLM)
  const totalBatchesPages = Math.max(1, Math.ceil(productionBatches.length / batchesPerPage));
  const paginatedBatches = useMemo(() => {
    const start = (batchesPage - 1) * batchesPerPage;
    return productionBatches.slice(start, start + batchesPerPage);
  }, [productionBatches, batchesPage, batchesPerPage]);

  // --- CRM CLIENTS TAB ---
  const [crmClients, setCrmClients] = useState<ClientCRM[]>([
    { id: 'crm-1', name: 'Guillermo Schmidt', company: 'Schmidt & Edwards Arquitectos', email: 'g.schmidt@schmidt.cl', phone: '+56 9 8455 1255', segment: 'VIP Corporativo', totalSpend: 2450000, projectDescription: '50 Soportes Geométricos Impresos en 3D con branding corporativo y filamento PLA Terracota.', internalNotes: 'Prefiere tonos terracota. Se entregará el 15 de Julio para su aniversario.', status: 'Activo' },
    { id: 'crm-2', name: 'María Ignacia Valenzuela', company: 'Atelier Valenzuela Flores', email: 'mivalenzuela@vflores.com', phone: '+56 9 9122 7543', segment: 'Boutique Patrón', totalSpend: 890000, projectDescription: 'Set de bolsas organizadoras para costura estampadas a mano y amigurumis decorativos.', internalNotes: 'Solicitó empaque especial sin burbuja de plástico. Muy sensible a la estética de fibras naturales.', status: 'Activo' },
    { id: 'crm-3', name: 'Ignacio Larraín', company: 'Inversiones El Plomo SpA', email: 'ilarrain@plomoinv.cl', phone: '+56 9 7541 3320', segment: 'VIP Corporativo', totalSpend: 4120000, projectDescription: 'Asesoría de Re-branding Integral y diseño de mascotas amigurumi para pack de bienvenida.', internalNotes: 'Consultoría UX del portal de inversionistas completada con éxito en semana 2.', status: 'Activo' },
    { id: 'crm-4', name: 'Francisca Astaburuaga', company: 'Astaburuaga Joyas d\'Autor', email: 'contacto@astaburuagajoyas.cl', phone: '+56 9 6608 1147', segment: 'Boutique Patrón', totalSpend: 620000, projectDescription: 'Organizadores de carretes modulares impresos en 3D a medida para su catálogo de orfebrería.', internalNotes: 'Revisar si queda stock de filamento PETG de resistencia industrial para su proyecto.', status: 'En Espera' }
  ]);

  // Client setup fields
  const [showClientModal, setShowClientModal] = useState(false);
  const [cName, setCName] = useState('');
  const [cCompany, setCCompany] = useState('');
  const [cEmail, setCEmail] = useState('');
  const [cPhone, setCPhone] = useState('');
  const [cSegment, setCSegment] = useState<string>('Boutique Patrón');
  const [cSpend, setCSpend] = useState('250000');
  const [cDesc, setCDesc] = useState('');
  const [cNotes, setCNotes] = useState('');

  // Search/Filters for Clients
  const [clientSearchQuery, setClientSearchQuery] = useState('');
  const [clientSegmentFilter, setClientSegmentFilter] = useState('Todos');

  // --- CRM SUPPLIERS TAB ---
  const [crmSuppliers, setCrmSuppliers] = useState<SupplierCRM[]>([
    { id: 'prov-1', name: 'Sofía Pinilla', company: 'Seda & Algodones Chilenos Ltda', email: 'spinilla@algodones.cl', phone: '+56 9 7411 2588', category: 'Costura', totalPurchases: 1200000, supplyItem: 'Hilado de cáñamo e hilos d\'Ischia', internalNotes: 'Despachan en 48 horas a Viña del Mar. Excelente fidelidad.', status: 'Activo' },
    { id: 'prov-2', name: 'Guillermo Matte', company: 'Impresiones 3D Filamentos SpA', email: 'gmatte@filamentos3d.cl', phone: '+56 9 8211 4455', category: 'Impresión 3D', totalPurchases: 1850000, supplyItem: 'Filamento PLA Biodegradable de autor', internalNotes: 'Ofrece descuento del 10% para compras mayoristas sobre 20kg.', status: 'Activo' },
    { id: 'prov-3', name: 'Patricia Alcaíno', company: 'Crochet de la Cordillera', email: 'palcaino@crochetcordillera.cl', phone: '+56 9 9133 8844', category: 'Crochet', totalPurchases: 540000, supplyItem: 'Lanas orgánicas hiladas a mano', internalNotes: 'Artesana local de Pirque. Abastecimiento estacional.', status: 'Activo' },
    { id: 'prov-4', name: 'Estudio de Diseño Cartonera de Chile', company: 'Embalajes Sustentables S.A.', email: 'contacto@embalajeschile.cl', phone: '+56 2 2844 7799', category: 'Embalaje', totalPurchases: 980000, supplyItem: 'Bolsas compostables y cajas kraft de autor', internalNotes: 'Despacho gratuito los días miércoles.', status: 'Activo' }
  ]);

  // Supplier setup fields
  const [showSupplierModal, setShowSupplierModal] = useState(false);
  const [pName, setPName] = useState('');
  const [pCompany, setPCompany] = useState('');
  const [pEmail, setPEmail] = useState('');
  const [pPhone, setPPhone] = useState('');
  const [pCategory, setPCategory] = useState<string>('Impresión 3D');
  const [pPurchases, setPPurchases] = useState('250000');
  const [pItem, setPItem] = useState('');
  const [pNotes, setPNotes] = useState('');

  // Search/Filters for Suppliers
  const [supplierSearchQuery, setSupplierSearchQuery] = useState('');
  const [supplierCategoryFilter, setSupplierCategoryFilter] = useState('Todos');

  // --- FINANCIAL PLANNING (F&A) STATES ---
  const [selectedMonth, setSelectedMonth] = useState<'current' | 'forecast_july' | 'forecast_august'>('current');
  const [netSimulatorAmount, setNetSimulatorAmount] = useState<number>(1000000);
  const [netType, setNetType] = useState<'venta_producto' | 'boleta_honorarios'>('venta_producto');

  // Calculations for Net vs Gross
  const grossCalculatorResult = useMemo(() => {
    if (netType === 'venta_producto') {
      const iva = Math.round(netSimulatorAmount * 0.19);
      const total = netSimulatorAmount + iva;
      return {
        base: netSimulatorAmount,
        tax: iva,
        taxLabel: 'IVA (19% Débito)',
        total,
        retentionLabel: 'Impuesto Neto Declarable'
      };
    } else {
      // Boleta Honorarios 2026: Retention fee is 13.75%
      const retentionRate = 0.1375;
      const gross = Math.round(netSimulatorAmount / (1 - retentionRate));
      const textCollected = gross - netSimulatorAmount;
      return {
        base: netSimulatorAmount,
        tax: textCollected,
        taxLabel: 'Retención de Impuestos (13.75% SII)',
        total: gross,
        retentionLabel: 'Bruto de la Boleta de Honorarios'
      };
    }
  }, [netSimulatorAmount, netType]);

  // Simulated P&L data
  const plData = useMemo(() => {
    const defaultVentasFisicos = orders.reduce((sum, o) => sum + o.total, 0);
    const costOfMaterials = materials.reduce((sum, m) => sum + (m.unitCost * (m.lowStockAlert * 1.5)), 0) * 0.35; // Simulated cost allocation

    if (selectedMonth === 'current') {
      return {
        ventas_servicios: 2450000,
        ventas_productos: defaultVentasFisicos,
        ingresos_totales: 2450000 + defaultVentasFisicos,
        costos_insumos: Math.round(costOfMaterials),
        gastos_taller: 620000,
        marketing_hosting: 145000,
        impuestos_mes: Math.round((2450000 + defaultVentasFisicos) * 0.12),
        utilidad_neta: Math.round((2450000 + defaultVentasFisicos) - costOfMaterials - 620000 - 145000 - ((2450000 + defaultVentasFisicos) * 0.12))
      };
    } else if (selectedMonth === 'forecast_july') {
      return {
        ventas_servicios: 3800000,
        ventas_productos: defaultVentasFisicos * 1.35,
        ingresos_totales: 3800000 + (defaultVentasFisicos * 1.35),
        costos_insumos: Math.round(costOfMaterials * 1.25),
        gastos_taller: 650000,
        marketing_hosting: 180000,
        impuestos_mes: Math.round((3800000 + (defaultVentasFisicos * 1.35)) * 0.12),
        utilidad_neta: Math.round((3800000 + (defaultVentasFisicos * 1.35)) - (costOfMaterials * 1.25) - 650000 - 180000 - ((3800000 + (defaultVentasFisicos * 1.35)) * 0.12))
      };
    } else {
      return {
        ventas_servicios: 4500000,
        ventas_productos: defaultVentasFisicos * 1.6,
        ingresos_totales: 4500000 + (defaultVentasFisicos * 1.6),
        costos_insumos: Math.round(costOfMaterials * 1.4),
        gastos_taller: 650000,
        marketing_hosting: 180000,
        impuestos_mes: Math.round((4500000 + (defaultVentasFisicos * 1.6)) * 0.12),
        utilidad_neta: Math.round((4500000 + (defaultVentasFisicos * 1.6)) - (costOfMaterials * 1.4) - 650000 - 180000 - ((4500000 + (defaultVentasFisicos * 1.6)) * 0.12))
      };
    }
  }, [selectedMonth, orders, materials]);

  // MRP Actions Handlers
  const handleDeleteMaterial = (id: string, name: string) => {
    setMaterials(prev => prev.filter(m => m.id !== id));
    if (onShowToast) {
      onShowToast('Insumo Quitado', `Has dado de baja el material "${name}" del registro MRP.`, 'info');
    }
  };

  const handleRestockMaterialSim = (id: string, name: string) => {
    setMaterials(prev => prev.map(m => {
      if (m.id === id) {
        const addedStock = m.lowStockAlert * 3;
        return { ...m, stock: m.stock + addedStock };
      }
      return m;
    }));
    if (onShowToast) {
      onShowToast('Orden de Compra Simulada', `Se ingresó la llegada de stock adicional para ${name}. Saldo bancario del taller actualizado correspondientemente.`, 'success');
    }
  };

  // --- Handlers for Material In-line Editing ---
  const startEditingMaterial = (m: RawMaterial) => {
    setEditingMaterialId(m.id);
    setEditMatName(m.name);
    setEditMatCategory(m.category);
    setEditMatStock(String(m.stock));
    setEditMatUnit(m.unit);
    setEditMatCost(String(m.unitCost));
    setEditMatSupplier(m.supplierName || '');
    setEditMatLowStockAlert(String(m.lowStockAlert || 5));
  };

  const handleCancelMaterialEdit = () => {
    setEditingMaterialId(null);
  };

  const handleSaveMaterialEdit = (id: string) => {
    if (!editMatName.trim()) return;
    setMaterials(prev => prev.map(m => {
      if (m.id === id) {
        return {
          ...m,
          name: editMatName,
          category: editMatCategory,
          stock: Number(editMatStock) || 0,
          unit: editMatUnit,
          unitCost: Number(editMatCost) || 0,
          supplierName: editMatSupplier || 'Proveedor Mayorista Directo',
          lowStockAlert: Number(editMatLowStockAlert) || 0
        };
      }
      return m;
    }));
    setEditingMaterialId(null);
    if (onShowToast) {
      onShowToast('Insumo Modificado', `Los cambios para "${editMatName}" se han guardado exitosamente en el módulo MRP.`, 'success');
    }
  };

  const getWorkstationKey = (productName: string): string => {
    const lower = productName.toLowerCase();
    if (lower.includes('diseño') || lower.includes('boceto') || lower.includes('modelado')) return 'diseño';
    if (lower.includes('3d') || lower.includes('impresión') || lower.includes('pla') || lower.includes('petg') || lower.includes('soporte') || lower.includes('organizador')) return 'impresion3d';
    if (lower.includes('costura') || lower.includes('tela') || lower.includes('estuche') || lower.includes('lona') || lower.includes('algodón')) return 'costura';
    if (lower.includes('crochet') || lower.includes('tejido') || lower.includes('amigurumi') || lower.includes('jirafa')) return 'crochet';
    return 'diseño';
  };

  const getStagesList = (productName: string): string[] => {
    const key = getWorkstationKey(productName);
    return productionStages?.[key] || [
      'Modelado / Diseño', 
      'Procesamiento en Cama', 
      'Corte & Confección', 
      'Tejido Manual', 
      'Control de Calidad', 
      'Listo para Starken'
    ];
  };

  // PLM Stage Transition Handlers
  const handleAdvanceStage = (batchId: string, currentStage: string, productName: string) => {
    const stages = getStagesList(productName);
    const currentIndex = stages.indexOf(currentStage);
    if (currentIndex !== -1 && currentIndex < stages.length - 1) {
      const nextStage = stages[currentIndex + 1];
      const nextProgress = Math.min(100, Math.round(((currentIndex + 2) / stages.length) * 100));
      
      setProductionBatches(prev => prev.map(b => {
        if (b.id === batchId) {
          return { ...b, currentStage: nextStage, progress: nextProgress };
        }
        return b;
      }));

      // If it moves to the end, update order status as well
      if (nextStage === stages[stages.length - 1] && onShowToast) {
        onShowToast(
          'Lote Listo para Despacho',
          `El lote de producción ${batchId} completó la etapa final de confección. La orden asociada está lista para la etiqueta de transporte Starken.`,
          'success'
        );
      }
    }
  };

  // CRM Create Client
  const handleAddClientSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!cName.trim()) return;
    const newC: ClientCRM = {
      id: `crm-${Date.now()}`,
      name: cName,
      company: cCompany || 'Persona Natural',
      email: cEmail,
      phone: cPhone || 'N/A',
      segment: cSegment,
      totalSpend: Number(cSpend) || 0,
      projectDescription: cDesc || 'Suministro de encuadernación artesanal o branding cooperativo.',
      internalNotes: cNotes || 'Sin observaciones estéticas críticas.',
      status: 'Activo'
    };
    setCrmClients(prev => [...prev, newC]);
    setShowClientModal(false);
    setCName('');
    setCEmail('');
    setCCompany('');
    setCPhone('');
    setCNotes('');
    setCDesc('');
    if (onShowToast) {
      onShowToast('Cliente Registrado', `${cName} ha sido catalogado en tu matriz CRM con perfil de segmento ${cSegment}.`, 'success');
    }
  };

  // CRM Create Supplier
  const handleAddSupplierSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!pName.trim()) return;
    const newP: SupplierCRM = {
      id: `prov-${Date.now()}`,
      name: pName,
      company: pCompany || 'Proveedor General',
      email: pEmail,
      phone: pPhone || 'N/A',
      category: pCategory,
      totalPurchases: Number(pPurchases) || 0,
      supplyItem: pItem || 'Materiales e Insumos varios',
      internalNotes: pNotes || 'Sin observaciones de abastecimiento estables.',
      status: 'Activo'
    };
    setCrmSuppliers(prev => [...prev, newP]);
    setShowSupplierModal(false);
    setPName('');
    setPEmail('');
    setPCompany('');
    setPPhone('');
    setPNotes('');
    setPItem('');
    if (onShowToast) {
      onShowToast('Proveedor Registrado', `${pName} ha sido agregado exitosamente a tu matriz de proveedores.`, 'success');
    }
  };

  const filteredClients = useMemo(() => {
    return crmClients.filter(c => {
      const matchesQuery = c.name.toLowerCase().includes(clientSearchQuery.toLowerCase()) ||
                           c.company.toLowerCase().includes(clientSearchQuery.toLowerCase()) ||
                           c.projectDescription.toLowerCase().includes(clientSearchQuery.toLowerCase());
      const matchesSegment = clientSegmentFilter === 'Todos' || c.segment === clientSegmentFilter;
      return matchesQuery && matchesSegment;
    });
  }, [crmClients, clientSearchQuery, clientSegmentFilter]);

  const filteredSuppliers = useMemo(() => {
    return crmSuppliers.filter(p => {
      const matchesQuery = p.name.toLowerCase().includes(supplierSearchQuery.toLowerCase()) ||
                           p.company.toLowerCase().includes(supplierSearchQuery.toLowerCase()) ||
                           p.supplyItem.toLowerCase().includes(supplierSearchQuery.toLowerCase());
      const matchesCategory = supplierCategoryFilter === 'Todos' || p.category === supplierCategoryFilter;
      return matchesQuery && matchesCategory;
    });
  }, [crmSuppliers, supplierSearchQuery, supplierCategoryFilter]);

  // Paginación y vistas de Clientes (CRM)
  const totalClientsPages = Math.max(1, Math.ceil(filteredClients.length / clientsPerPage));
  const paginatedClients = useMemo(() => {
    const start = (clientsPage - 1) * clientsPerPage;
    return filteredClients.slice(start, start + clientsPerPage);
  }, [filteredClients, clientsPage, clientsPerPage]);

  // Paginación y vistas de Proveedores (CRM Logística)
  const totalSuppliersPages = Math.max(1, Math.ceil(filteredSuppliers.length / suppliersPerPage));
  const paginatedSuppliers = useMemo(() => {
    const start = (suppliersPage - 1) * suppliersPerPage;
    return filteredSuppliers.slice(start, start + suppliersPerPage);
  }, [filteredSuppliers, suppliersPage, suppliersPerPage]);

  // Reset de página al cambiar filtros de búsqueda
  useEffect(() => {
    setClientsPage(1);
  }, [clientSearchQuery, clientSegmentFilter]);

  useEffect(() => {
    setSuppliersPage(1);
  }, [supplierSearchQuery, supplierCategoryFilter]);

  return (
    <div className={isEmbedded ? "space-y-8 animate-fade-in" : "p-6 sm:p-10 space-y-8 animate-fade-in bg-bananur-cream min-h-screen"}>
      
      {/* Dynamic Header */}
      {!isEmbedded && (
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-bananur-sand/80 pb-6">
          <div>
            <span className="text-xs font-mono uppercase tracking-widest text-[#B58455] font-bold">Matriz Unificada Corporativa</span>
            <h1 className="text-3xl font-serif font-extrabold text-bananur-clay mt-1">
              {erpTab === 'mrp' ? 'Módulo de Insumos & Materias Primas' :
               erpTab === 'plm' ? 'Módulo de Producción (PLM & Estaciones)' :
               'Módulo de Clientes & Proveedores'}
            </h1>
            <p className="text-xs text-bananur-clay-light mt-1">
              {erpTab === 'mrp' 
                ? 'Inventario de materias primas críticas de taller, fardos textiles vintage de autor y alertas de stock de reposición.' 
                : erpTab === 'plm'
                ? 'Supervisión de líneas de manufactura artesanal, lotes activos de confección y estaciones de trabajo calibradas (Diseño, Impresión 3D con OctoPrint, Costura y Crochet).'
                : 'Fideliza y monitorea requerimientos ejecutivos VIP corporativos junto con tu directorio estratégico de proveedores de abastecimiento.'}
            </p>
          </div>
        </div>
      )}


      {/* Sub-tab selection bar ONLY for Clientes & Proveedores */}
      {!isEmbedded && (erpTab === 'crm' || erpTab === 'proveedores') && (
        <div className="flex bg-white/60 p-1 rounded-xl border border-bananur-sand max-w-md gap-1">
          <button
            id="subtab-crm"
            type="button"
            onClick={() => setErpTab('crm')}
            className={`flex-1 py-2 px-4 rounded-lg font-mono text-[11px] font-bold uppercase transition-all cursor-pointer ${
              erpTab === 'crm'
                ? 'bg-bananur-clay text-white shadow-xs'
                : 'text-bananur-clay-light hover:text-bananur-clay hover:bg-bananur-sand/30'
            }`}
          >
            Clientes
          </button>
          <button
            id="subtab-proveedores"
            type="button"
            onClick={() => setErpTab('proveedores')}
            className={`flex-1 py-2 px-4 rounded-lg font-mono text-[11px] font-bold uppercase transition-all cursor-pointer ${
              erpTab === 'proveedores'
                ? 'bg-bananur-clay text-white shadow-xs'
                : 'text-bananur-clay-light hover:text-bananur-clay hover:bg-bananur-sand/30'
            }`}
          >
            Proveedores
          </button>
        </div>
      )}

      {/* --- PESTAÑA KPI: DEEP METRICS & HEALTH MONITOR --- */}
      {erpTab === 'kpi' && (
        <div className="space-y-6 animate-fade-in">
          
          {/* Bento grid summary */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="bg-white p-5 rounded-2xl border border-bananur-sand shadow-xs">
              <span className="text-[9px] font-mono uppercase text-bananur-clay-light/60">Flujo Bruto Consolidado</span>
              <div className="flex items-baseline gap-1.5 mt-1">
                <span className="text-2xl font-mono font-extrabold text-bananur-clay">${plData.ingresos_totales.toLocaleString('es-CL')}</span>
                <span className="text-[10px] text-emerald-600 font-bold font-mono">CLP</span>
              </div>
              <div className="text-[10px] text-emerald-600 font-bold font-mono mt-1 flex items-center gap-1">
                <TrendingUp className="w-3.5 h-3.5" />
                +18.4% vs Mes Anterior
              </div>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-bananur-sand shadow-xs">
              <span className="text-[9px] font-mono uppercase text-bananur-clay-light/60">Utilidad Operativa Estimada</span>
              <div className="flex items-baseline gap-1.5 mt-1">
                <span className="text-2xl font-mono font-extrabold text-[#40916C]">${plData.utilidad_neta.toLocaleString('es-CL')}</span>
                <span className="text-[10px] text-emerald-600 font-bold font-mono">NETO</span>
              </div>
              <p className="text-[9px] text-bananur-clay-light/60 mt-1">Descontando insumos, arriendo de taller central e impuestos.</p>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-bananur-sand shadow-xs">
              <span className="text-[9px] font-mono uppercase text-bananur-clay-light/60">Nivel de Alerta Materiales (MRP)</span>
              <div className="flex items-baseline gap-1.5 mt-1">
                <span className="text-2xl font-mono font-extrabold text-bananur-coral">
                  {materials.filter(m => m.stock <= m.lowStockAlert).length}
                </span>
                <span className="text-xs text-bananur-clay-light font-medium">insumos en quiebra</span>
              </div>
              <p className="text-[10px] text-bananur-clay-light/60 mt-1">Sábanas de papel ecológico y broches registran bajo nivel.</p>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-bananur-sand shadow-xs">
              <span className="text-[9px] font-mono uppercase text-bananur-clay-light/60">Lotes en Confección Activos (PLM)</span>
              <div className="flex items-baseline gap-1.5 mt-1">
                <span className="text-2xl font-mono font-extrabold text-bananur-gold-dark">
                  {productionBatches.length} Lotes
                </span>
              </div>
              <p className="text-[9px] text-bananur-clay-light/60 mt-1">Procesados éticamente a nivel individual.</p>
            </div>
          </div>

          {/* Quick-Stats Detail Visualizer */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            
            {/* Health Monitor Checklist */}
            <div className="lg:col-span-7 bg-white p-6 rounded-2xl border border-bananur-sand shadow-xs space-y-4">
              <div className="flex items-center justify-between border-b border-bananur-sand/50 pb-3">
                <div>
                  <h3 className="font-serif text-lg font-bold text-bananur-clay flex items-center gap-2">
                    <ClipboardList className="w-5 h-5 text-bananur-gold" />
                    Estado de Automatización & Flujo Operativo
                  </h3>
                  <p className="text-xs text-bananur-clay-light font-light mt-0.5">Diagnóstico y telemetría de tus flujos de taller y facturación.</p>
                </div>
              </div>

              <div className="space-y-3 pt-2 text-xs text-bananur-clay">
                
                <div className="flex items-center justify-between p-3 bg-bananur-cream/30 border border-bananur-sand/40 rounded-xl">
                  <div className="space-y-0.5">
                    <div className="font-semibold flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-[#40916C] animate-pulse" />
                      Pasarela de Boleta/Factura Electrónica SII
                    </div>
                    <p className="text-[10px] text-bananur-clay-light">Conectado mediante certificado digital del representante legal de Bananur.</p>
                  </div>
                  <span className="px-2 py-0.5 bg-emerald-50 text-emerald-700 text-[10px] font-bold rounded-full font-mono">ACTIVO</span>
                </div>

                <div className="flex items-center justify-between p-3 bg-bananur-cream/30 border border-bananur-sand/40 rounded-xl">
                  <div className="space-y-0.5">
                    <div className="font-semibold flex items-center gap-1.5 text-bananur-clay">
                      <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
                      Matriz de Abastecimiento Crítico
                    </div>
                    <p className="text-[10px] text-bananur-clay-light">Alerta automática de bajo stock ligada a la reposición de materiales en taller.</p>
                  </div>
                  <span className="px-2 py-0.5 bg-amber-50 text-amber-700 text-[10px] font-bold rounded-full font-mono">REVISAR Stock</span>
                </div>

                <div className="flex items-center justify-between p-3 bg-bananur-cream/30 border border-bananur-sand/40 rounded-xl">
                  <div className="space-y-0.5">
                    <div className="font-semibold flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-[#40916C]" />
                      Integración Starken / Courier API
                    </div>
                    <p className="text-[10px] text-bananur-clay-light">Generación automática de órdenes de flete en Starken para pedidos chilenos.</p>
                  </div>
                  <span className="px-2 py-0.5 bg-emerald-50 text-emerald-700 text-[10px] font-bold rounded-full font-mono">ACTIVO</span>
                </div>

              </div>
            </div>

            {/* Quick materials progress */}
            <div className="lg:col-span-5 bg-white p-6 rounded-2xl border border-bananur-sand shadow-xs space-y-4">
              <h3 className="font-serif text-lg font-bold text-bananur-clay border-b border-bananur-sand/50 pb-3">Resumen Consumo de Insumos</h3>
              <div className="space-y-3.5 pt-2">
                {materials.slice(0, 4).map((m) => {
                  const percent = Math.min(105, Math.max(5, Math.round((m.stock / (m.lowStockAlert * 4)) * 100)));
                  const isLow = m.stock <= m.lowStockAlert;
                  return (
                    <div key={m.id} className="space-y-1">
                      <div className="flex justify-between items-center text-xs">
                        <span className="font-semibold text-bananur-clay">{m.name}</span>
                        <span className={`font-mono text-[11px] font-bold ${isLow ? 'text-bananur-coral' : 'text-bananur-clay'}`}>
                          {m.stock} {m.unit}
                        </span>
                      </div>
                      <div className="w-full bg-bananur-cream rounded-full h-2 overflow-hidden border border-bananur-sand/40">
                        <div 
                          className={`h-full rounded-full transition-all duration-300 ${isLow ? 'bg-bananur-coral' : 'bg-bananur-sage'}`}
                          style={{ width: `${percent}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

          </div>

        </div>
      )}

      {/* --- PESTAÑA MRP: MATERIAL RESOURCE PLANNING --- */}
      {erpTab === 'mrp' && (
        <div className="space-y-6 animate-fade-in text-bananur-clay">
          
          {/* NAVEGACIÓN DE SUB-PESTAÑAS MRP: INSUMOS DE TALLER VS FARDOS VINTAGE */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-bananur-sand/60 pb-3">
            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                id="mrp-subtab-insumos"
                onClick={() => setMrpSection('insumos')}
                className={`px-4 py-2 rounded-xl text-xs font-mono font-bold transition-all flex items-center gap-2 cursor-pointer ${
                  mrpSection === 'insumos'
                    ? 'bg-bananur-clay text-white shadow-xs'
                    : 'bg-white text-bananur-clay hover:bg-bananur-cream/60 border border-bananur-sand'
                }`}
              >
                <Layers className="w-4 h-4" />
                Insumos & Materiales de Taller ({materials.length})
              </button>
              <button
                type="button"
                id="mrp-subtab-fardos"
                onClick={() => setMrpSection('fardos')}
                className={`px-4 py-2 rounded-xl text-xs font-mono font-bold transition-all flex items-center gap-2 cursor-pointer ${
                  mrpSection === 'fardos'
                    ? 'bg-amber-900 text-amber-50 shadow-xs ring-2 ring-amber-500/40'
                    : 'bg-amber-50 text-amber-900 hover:bg-amber-100/80 border border-amber-300/80'
                }`}
              >
                <Boxes className="w-4 h-4 text-amber-600" />
                Fardos de Ropa Vintage (Materias Primas) ({availableLots.length})
              </button>
            </div>

            {mrpSection === 'fardos' && (
              <button
                type="button"
                id="erp-btn-toggle-add-lot"
                onClick={() => setShowAddLot(!showAddLot)}
                className="flex items-center gap-2 bg-amber-800 text-white px-4 py-2 rounded-xl text-xs font-mono font-bold hover:bg-amber-900 transition-all shadow-xs cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                {showAddLot ? 'Ocultar Formulario' : 'Registrar Nuevo Fardo'}
              </button>
            )}
          </div>

          {/* ======================================================== */}
          {/* SECCIÓN 1: INSUMOS Y MATERIALES GENERALES DE TALLER */}
          {/* ======================================================== */}
          {mrpSection === 'insumos' && (
            <div className="space-y-6 animate-fade-in">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h3 className="font-serif text-lg font-bold text-bananur-clay">Inventario de Materias Primas de Taller</h3>
                  <p className="text-xs text-bananur-clay-light">Listado de insumos críticos de producción (filamentos, telas, lanas y cajas) con costo unitario.</p>
                </div>
                
                <button
                  id="erp-mrp-btn-new-material"
                  type="button"
                  onClick={() => setShowAddMaterial(prev => !prev)}
                  className="flex items-center gap-2 bg-bananur-clay text-white px-4 py-2 rounded-xl text-xs font-semibold hover:bg-bananur-gold hover:text-bananur-clay transition-all shadow-xs cursor-pointer"
                >
                  {showAddMaterial ? <X className="w-4 h-4 text-bananur-coral" /> : <Plus className="w-4 h-4" />}
                  {showAddMaterial ? 'Cerrar Formulario' : 'Nuevo Insumo'}
                </button>
              </div>

              {/* FORMULARIO AGREGAR NUEVO INSUMO DOCKED INMEDIATAMENTE BAJO EL HEADER */}
              {showAddMaterial && (
                <form onSubmit={handleAddMaterialSubmit} className="bg-white p-5 rounded-2xl border-2 border-bananur-gold border-dashed space-y-4 animate-scale-up shadow-md">
                  <div className="flex items-center justify-between border-b pb-2">
                    <span className="text-xs font-mono uppercase font-bold text-bananur-gold-dark">Registrar Entrada de Materia Prima</span>
                    <button type="button" onClick={() => setShowAddMaterial(false)} className="text-xs text-bananur-coral font-bold hover:underline cursor-pointer">✕ Cerrar</button>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs font-sans">
                    <div>
                      <label className="block text-[10px] font-mono uppercase font-semibold text-bananur-clay-light mb-1">Nombre Insumo *</label>
                      <input
                        id="new-mat-name"
                        type="text"
                        required
                        placeholder="Ej. Broche de Cuero Trenzado"
                        value={mName}
                        onChange={(e) => setMName(e.target.value)}
                        className="w-full p-2 bg-bananur-cream/30 border border-bananur-sand rounded-lg text-bananur-clay"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-mono uppercase font-semibold text-bananur-clay-light mb-1">Categoría MRP</label>
                      <select
                        id="new-mat-cat"
                        value={mCat}
                        onChange={(e) => setMCat(e.target.value)}
                        className="w-full p-2 bg-white border border-bananur-sand rounded-lg cursor-pointer font-medium text-bananur-clay"
                      >
                        {supplierCategories.map(cat => (
                          <option key={cat} value={cat}>{cat}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-[10px] font-mono uppercase font-semibold text-bananur-clay-light mb-1">Nombre del Proveedor</label>
                      <input
                        id="new-mat-supplier"
                        type="text"
                        placeholder="Ej. Curtidos Sierras del Maule"
                        value={mSupplier}
                        onChange={(e) => setMSupplier(e.target.value)}
                        className="w-full p-2 bg-bananur-cream/30 border border-bananur-sand rounded-lg text-bananur-clay"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs font-sans">
                    <div>
                      <label className="block text-[10px] font-mono uppercase font-semibold text-bananur-clay-light mb-1">Cantidad Inicial / Stock</label>
                      <input
                        id="new-mat-stock"
                        type="number"
                        min="1"
                        placeholder="25"
                        value={mStock}
                        onChange={(e) => setMStock(e.target.value)}
                        className="w-full p-2 bg-bananur-cream/30 border border-bananur-sand rounded-lg text-bananur-clay font-mono"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-mono uppercase font-semibold text-bananur-clay-light mb-1">Unidad de Medida</label>
                      <input
                        id="new-mat-unit"
                        type="text"
                        required
                        placeholder="Ej. metros, hojas, pliegos, unidades"
                        value={mUnit}
                        onChange={(e) => setMUnit(e.target.value)}
                        className="w-full p-2 bg-bananur-cream/30 border border-bananur-sand rounded-lg text-bananur-clay"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-mono uppercase font-semibold text-bananur-clay-light mb-1">Costo Unitario ($ CLP)</label>
                      <input
                        id="new-mat-cost"
                        type="number"
                        min="1"
                        placeholder="4500"
                        value={mCost}
                        onChange={(e) => setMCost(e.target.value)}
                        className="w-full p-2 bg-bananur-cream/30 border border-bananur-sand rounded-lg text-bananur-clay font-mono"
                      />
                    </div>
                  </div>

                  <div className="flex justify-end gap-3 pt-2">
                    <button type="button" onClick={() => setShowAddMaterial(false)} className="px-4 py-2 border border-bananur-sand rounded-xl text-xs font-semibold text-bananur-clay hover:bg-bananur-cream/50 cursor-pointer">
                      Cancelar
                    </button>
                    <button type="submit" className="bg-bananur-clay text-white px-5 py-2 rounded-xl font-bold text-xs hover:bg-bananur-gold hover:text-bananur-clay cursor-pointer">
                      Guardar Insumo en Inventario
                    </button>
                  </div>
                </form>
              )}

          {/* ----- COMPONENTE NUEVO: ALERTAS DE STOCK CRÍTICO CON FILTROS EN BANANUR ----- */}
          <div className="bg-[#FAF9F5] p-5 rounded-2xl border border-bananur-sand shadow-xs space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-bananur-sand/50 pb-3">
              <div className="flex items-center gap-2">
                <div className="p-1.5 bg-bananur-coral/10 rounded-lg text-bananur-coral">
                  <AlertTriangle className="w-5 h-5 animate-pulse text-bananur-coral" />
                </div>
                <div>
                  <h4 className="font-serif text-sm font-bold text-bananur-clay">Alertas de Stock Crítico de Taller</h4>
                  <p className="text-[11px] text-bananur-clay-light">Monitoreo activo para insumos de Impresión 3D, Costura y Crochet.</p>
                </div>
              </div>

              {/* Selector de filtros de categoría */}
              <div className="flex flex-wrap items-center gap-1.5">
                <span className="text-[10px] font-mono text-bananur-clay-light/85 mr-1 uppercase">Filtrar por:</span>
                {['Todas', ...supplierCategories].map((cat) => (
                  <button
                    key={cat}
                    id={`stock-alert-filter-${cat.replace(/\s+/g, '-')}`}
                    onClick={() => setStockAlertCategory(cat)}
                    className={`px-2.5 py-1 rounded-lg text-[10px] font-mono font-bold transition-all ${
                      stockAlertCategory === cat
                        ? 'bg-[#B58455] text-white shadow-xs'
                        : 'bg-white border border-bananur-sand/60 hover:bg-bananur-sand/20 text-bananur-clay-light'
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>

            {/* Obtener y renderizar los materiales con bajo stock */}
            {(() => {
              const lowStockMaterials = materials.filter(m => {
                const isUnderThreshold = m.stock <= m.lowStockAlert;
                const isTargetCategory = supplierCategories.includes(m.category);
                if (!isUnderThreshold || !isTargetCategory) return false;
                
                if (stockAlertCategory === 'Todas') return true;
                return m.category === stockAlertCategory;
              });

              if (lowStockMaterials.length === 0) {
                return (
                  <div className="bg-emerald-50/45 border border-emerald-200/60 rounded-xl p-4 text-center space-y-1">
                    <span className="text-xl">✅</span>
                    <h5 className="font-serif text-xs font-semibold text-emerald-800">¡Reservas Óptimas en el Taller!</h5>
                    <p className="text-[11px] text-emerald-700/80 max-w-md mx-auto">
                      No se registran insumos {stockAlertCategory !== 'Todas' ? `de la categoría "${stockAlertCategory}"` : 'textiles, de crochet o filamentos 3D'} con stock menor o igual a su umbral mínimo configurado.
                    </p>
                  </div>
                );
              }

              return (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {lowStockMaterials.map(m => {
                    const isOutOfStock = m.stock === 0;
                    const stockRatio = m.stock / (m.lowStockAlert || 1);
                    const isExtremeDanger = isOutOfStock || stockRatio <= 0.35;
                    
                    // Colores visuales en base al nivel de urgencia o peligro
                    let cardBg = "bg-amber-50/20 border-amber-200 hover:border-amber-300";
                    let badgeStyles = "bg-amber-50 text-amber-800 border-amber-200";
                    let stateTitle = "Bajo Stock";
                    let indicatorColor = "bg-amber-500";
                    
                    if (isOutOfStock) {
                      cardBg = "bg-rose-50/30 border-rose-300 hover:border-rose-450";
                      badgeStyles = "bg-rose-100 text-rose-800 border-rose-250 font-extrabold";
                      stateTitle = "QUIEBRE ABSOLUTO";
                      indicatorColor = "bg-rose-600 animate-ping";
                    } else if (isExtremeDanger) {
                      cardBg = "bg-orange-50/20 border-orange-300 hover:border-orange-400";
                      badgeStyles = "bg-orange-100 text-orange-950 border-orange-200 font-bold";
                      stateTitle = "STOCK CRÍTICO";
                      indicatorColor = "bg-orange-500";
                    }

                    return (
                      <div key={m.id} className={`flex flex-col justify-between p-4 rounded-xl border transition-all ${cardBg}`}>
                        <div className="space-y-2">
                          <div className="flex items-center justify-between gap-2 text-[10px]">
                            <span className="font-mono text-bananur-clay-light uppercase tracking-wider">{m.category}</span>
                            <span className={`px-2 py-0.5 rounded-full border text-[9px] font-mono uppercase flex items-center gap-1 font-bold ${badgeStyles}`}>
                              <span className={`w-1.5 h-1.5 rounded-full ${indicatorColor}`} />
                              {stateTitle}
                            </span>
                          </div>

                          <div>
                            <h5 className="font-serif text-xs font-bold text-bananur-clay line-clamp-1">{m.name}</h5>
                            <p className="text-[10px] font-mono text-bananur-clay-light/80 mt-0.5">Cód. ERP: {m.id} • Proveedor: {m.supplierName}</p>
                          </div>

                          <div className="flex items-center justify-between pt-1.5 text-xs">
                            <div className="space-y-0.5">
                              <span className="text-[10px] text-bananur-clay-light block">Stock Actual</span>
                              <span className={`font-mono font-black text-sm ${isOutOfStock ? 'text-rose-600' : 'text-bananur-clay'}`}>
                                {m.stock} {m.unit}
                              </span>
                            </div>
                            
                            <div className="text-right space-y-0.5">
                              <span className="text-[10px] text-bananur-clay-light block">Umbral de Alerta</span>
                              <span className="font-mono text-bananur-clay-light/95">
                                {m.lowStockAlert} {m.unit}
                              </span>
                            </div>
                          </div>
                        </div>

                        <div className="pt-3 border-t border-bananur-sand/40 mt-3 flex items-center justify-between gap-1.5">
                          <span className="text-[9px] font-mono text-bananur-clay-light/75">Costo Unit: ${m.unitCost.toLocaleString('es-CL')}</span>
                          
                          <button
                            id={`quick-purchase-alert-${m.id}`}
                            onClick={() => handleCreatePurchaseOrderFromAlert(m)}
                            className="flex items-center gap-1.5 bg-[#40916C] text-white hover:bg-emerald-700 px-3 py-1.5 rounded-lg text-[10px] font-bold shadow-xs hover:shadow-xs transition-colors cursor-pointer"
                            title="Generar orden de compra oficial y transferir a Órdenes de Suministro"
                          >
                            <ShoppingBag className="w-3.5 h-3.5 text-white" />
                            Crear orden de compra
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              );
            })()}
          </div>

          {/* ----- SECCIÓN AVANZADA: PLANIFICACIÓN DE RECURSOS (MRP) BASADA EN DEMANDA DE ÓRDENES ----- */}
          <div className="bg-white p-6 rounded-2xl border border-bananur-sand shadow-sm space-y-6">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-bananur-sand/50 pb-4">
              <div>
                <div className="flex items-center gap-1.5 text-xs font-mono uppercase tracking-widest text-[#B58455] font-bold">
                  <span className="w-2 h-2 rounded-full bg-bananur-gold-dark animate-pulse" />
                  Módulo de Planificación de Recursos (MRP)
                </div>
                <h4 className="text-xl font-serif font-bold text-bananur-clay mt-1">Estimación de Demanda para Órdenes en Preparación</h4>
                <p className="text-xs text-bananur-clay-light">
                  Se analizan automáticamente las {activeOrdersInPreparation.length} órdenes en estado <strong className="font-semibold text-bananur-gold-dark">"En preparación"</strong> para prever faltantes de Lino, Cerámica Gres, etc., calculando el stock crítico proyectado.
                </p>
              </div>

              {materials.some(m => m.stock - (mrpDemand[m.id] || 0) <= m.lowStockAlert) && (
                <button
                  id="erp-mrp-replenish-action-btn"
                  onClick={handleAutoReplenishAll}
                  className="flex items-center gap-2 bg-gradient-to-r from-bananur-coral to-bananur-clay text-white px-4 py-2.5 rounded-xl text-xs font-bold hover:shadow-md hover:from-bananur-gold hover:to-bananur-clay hover:text-white transition-all duration-300 cursor-pointer shrink-0"
                >
                  <Sparkles className="w-4 h-4 text-white" />
                  Reabastecer Insumos Críticos
                </button>
              )}
            </div>

            {/* Grid de planificación de stock crítico */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {materials.map((m) => {
                const demandValue = mrpDemand[m.id] || 0;
                const projectedStock = m.stock - demandValue;
                const isCriticalBreak = projectedStock < 0;
                const isCriticalLow = !isCriticalBreak && projectedStock <= m.lowStockAlert;
                
                // Color configuration
                let statusBg = "bg-emerald-50 border-emerald-200 text-emerald-800";
                let statusLabel = "Stock Saludable";
                let statusIcon = "🟢";

                if (isCriticalBreak) {
                  statusBg = "bg-rose-50 border-rose-200 text-rose-700 animate-pulse";
                  statusLabel = "CRÍTICO: Quiebre Proyectado";
                  statusIcon = "🚨";
                } else if (projectedStock <= 0) {
                  statusBg = "bg-rose-50 border-rose-200 text-rose-700";
                  statusLabel = "Faltante Exacto";
                  statusIcon = "🔴";
                } else if (isCriticalLow) {
                  statusBg = "bg-amber-50 border-amber-200 text-amber-700";
                  statusLabel = "Alerta: Stock Crítico";
                  statusIcon = "⚠️";
                }

                return (
                  <div 
                    key={m.id} 
                    className={`p-4 rounded-xl border flex flex-col justify-between transition-all hover:shadow-xs space-y-4 ${
                      isCriticalBreak ? 'border-rose-300 bg-rose-50/20' : 'border-bananur-sand/60 bg-bananur-cream/10'
                    }`}
                  >
                    <div>
                      <div className="flex justify-between items-start gap-1">
                        <span className="text-[10px] uppercase font-mono font-bold text-bananur-clay-light">{m.category}</span>
                        <span className={`px-2 py-0.5 rounded-full border text-[10px] font-mono font-medium ${statusBg}`}>
                          {statusIcon} {statusLabel}
                        </span>
                      </div>

                      <h5 className="font-serif text-sm font-bold text-bananur-clay mt-1.5 leading-snug">{m.name}</h5>
                      <span className="text-[10px] font-mono text-bananur-clay-light block mt-0.5">ID ERP: {m.id}</span>
                    </div>

                    {/* Stock Math Breakdown */}
                    <div className="bg-white/85 rounded-lg p-2.5 border border-bananur-sand/40 space-y-2 text-[11px] font-mono">
                      <div className="flex justify-between">
                        <span className="text-bananur-clay-light font-sans">Stock Físico Central:</span>
                        <span className="font-bold text-bananur-clay">{m.stock} {m.unit}</span>
                      </div>
                      <div className="flex justify-between text-[#A63A2B]">
                        <span className="text-bananur-clay-light font-sans">Consumo Comprometido:</span>
                        <span className="font-bold">- {demandValue} {m.unit}</span>
                      </div>
                      <hr className="border-dashed border-bananur-sand" />
                      <div className="flex justify-between">
                        <span className="text-bananur-clay-light font-sans">Stock Disponible Final:</span>
                        <span className={`font-bold ${isCriticalBreak ? 'text-bananur-coral font-extrabold' : 'text-bananur-clay'}`}>
                          {projectedStock} {m.unit}
                        </span>
                      </div>
                      <div className="flex justify-between text-bananur-clay-light">
                        <span className="font-sans">Límite Crítico Configurado:</span>
                        <span>{m.lowStockAlert} {m.unit}</span>
                      </div>
                    </div>

                    {/* Visual bar container */}
                    <div className="space-y-1">
                      <div className="flex justify-between items-center text-[10px]">
                        <span className="text-bananur-clay-light">Porcentaje de Seguridad</span>
                        <span className="font-mono font-bold">
                          {Math.max(0, Math.min(100, Math.round((projectedStock / (m.lowStockAlert || 1)) * 100)))}%
                        </span>
                      </div>
                      <div className="w-full bg-bananur-sand/30 rounded-full h-1.5 overflow-hidden">
                        <div 
                          className={`h-full rounded-full transition-all duration-350 ${
                            isCriticalBreak ? 'bg-bananur-coral' : isCriticalLow ? 'bg-bananur-gold-dark' : 'bg-[#40916C]'
                          }`}
                          style={{ width: `${Math.max(5, Math.min(100, (projectedStock / (m.stock || 1)) * 100))}%` }}
                        />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* List representing the actual orders creating this demand */}
            <div className="bg-bananur-cream/30 border border-bananur-sand rounded-xl p-4 space-y-3">
              <h5 className="font-serif text-sm font-semibold text-bananur-clay flex items-center gap-1.5">
                <ClipboardList className="w-4 h-4 text-[#B58455]" />
                Detalle Analítico de Órdenes en Preparación que demandan Materiales
              </h5>

              {activeOrdersInPreparation.length === 0 ? (
                <p className="text-xs text-bananur-clay-light/80 italic">No hay órdenes con estado "En preparación" en este momento. Los insumos se encuentran en completo reposo.</p>
              ) : (
                <div className="divide-y divide-bananur-sand/50">
                  {activeOrdersInPreparation.map(order => {
                    return (
                      <div key={order.id} className="py-2.5 flex flex-col sm:flex-row sm:items-center justify-between text-xs gap-2">
                        <div className="space-y-0.5">
                          <span className="font-mono font-bold text-bananur-gold-dark">{order.id}</span>
                          <span className="text-bananur-clay font-medium ml-2">Cliente: {order.customerName}</span>
                          <span className="text-[10px] text-bananur-clay-light font-light block">Comuna: {order.commune} / Tipo: {order.type.toUpperCase()}</span>
                        </div>
                        
                        {/* Requirement badge breakdown */}
                        <div className="flex flex-wrap gap-1.5">
                          {order.items.map(item => {
                            const nameLower = item.productName.toLowerCase();
                            const matches = [];
                            if (nameLower.includes('impresión') || nameLower.includes('3d') || nameLower.includes('soporte') || nameLower.includes('organizador')) {
                              matches.push(`${0.3 * item.quantity}b PLA`);
                            }
                            if (nameLower.includes('bolsa') || nameLower.includes('estuche') || nameLower.includes('costura') || nameLower.includes('confección')) {
                              matches.push(`${0.75 * item.quantity}m Algodón`);
                            }
                            if (nameLower.includes('amigurumi') || nameLower.includes('crochet') || nameLower.includes('cactus') || nameLower.includes('jirafa') || nameLower.includes('tejido')) {
                              matches.push(`${2.5 * item.quantity}m. Hilo`);
                            }
                            
                            return (
                              <div key={item.productId} className="px-2 py-0.5 bg-white border border-bananur-sand rounded text-[10px] flex items-center gap-1 font-mono text-bananur-clay-light">
                                <span className="font-bold text-bananur-clay-light/80">{item.quantity}x {item.productName}:</span>
                                <span className="text-[#B58455] font-bold">{matches.join(' + ') || 'Embalaje'}</span>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>

          {/* ----- SECCIÓN DE BÚSQUEDA Y FILTROS AVANZADOS ----- */}
          <div className="bg-white p-5 rounded-2xl border border-bananur-sand shadow-xs space-y-4 text-xs">
            <div className="flex flex-col md:flex-row items-center justify-between gap-4">
              <div>
                <h4 className="font-serif text-sm font-bold text-bananur-clay flex items-center gap-2">
                  <Filter className="w-4 h-4 text-bananur-clay-light" />
                  Panel de Filtros y Búsqueda Activa (MRP)
                </h4>
                <p className="text-[11px] text-bananur-clay-light/80">Busca insumos, filtra por categoría, nivel de stock o cambia el ordenamiento de los ítems en tiempo real.</p>
              </div>
              
              {(mrpSearchQuery || mrpCategoryFilter !== 'Todas' || mrpStockFilter !== 'Todos') && (
                <button
                  onClick={() => {
                    setMrpSearchQuery('');
                    setMrpCategoryFilter('Todas');
                    setMrpStockFilter('Todos');
                  }}
                  className="px-2.5 py-1 text-[10px] bg-red-50 text-red-750 hover:bg-red-100 border border-red-200 rounded-lg font-mono font-bold transition-all cursor-pointer"
                >
                  Limpiar Filtros ×
                </button>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {/* 1. Bar de Búsqueda */}
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-bananur-clay-light/60">
                  <Search className="w-4 h-4 text-bananur-clay-light" />
                </span>
                <input
                  type="text"
                  value={mrpSearchQuery}
                  onChange={(e) => setMrpSearchQuery(e.target.value)}
                  placeholder="Buscar insumo, ID o proveedor..."
                  className="w-full pl-9 pr-8 p-2.5 bg-bananur-cream/35 border border-bananur-sand rounded-xl text-xs text-bananur-clay focus:outline-none focus:ring-1 focus:ring-bananur-clay-light"
                />
                {mrpSearchQuery && (
                  <button
                    onClick={() => setMrpSearchQuery('')}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-bananur-clay-light/50 hover:text-bananur-clay text-lg"
                  >
                    ×
                  </button>
                )}
              </div>

              {/* 2. Filtro Categoría */}
              <div>
                <select
                  value={mrpCategoryFilter}
                  onChange={(e) => setMrpCategoryFilter(e.target.value as any)}
                  className="w-full p-2.5 bg-white border border-bananur-sand rounded-xl cursor-pointer text-xs text-bananur-clay focus:outline-none"
                >
                  <option value="Todas">📁 Categoría: Todas</option>
                  <option value="Impresión 3D">📁 Impresión 3D</option>
                  <option value="Costura">📁 Costura</option>
                  <option value="Crochet">📁 Crochet</option>
                  <option value="Embalaje">📁 Embalaje</option>
                  <option value="Herramientas">📁 Herramientas</option>
                </select>
              </div>

              {/* 3. Filtro Estado de Reservas */}
              <div>
                <select
                  value={mrpStockFilter}
                  onChange={(e) => setMrpStockFilter(e.target.value as any)}
                  className="w-full p-2.5 bg-white border border-bananur-sand rounded-xl cursor-pointer text-xs text-bananur-clay focus:outline-none"
                >
                  <option value="Todos">📊 Nivel de Reservas: Todos</option>
                  <option value="Bajo Alerta / Crítico">📊 Críticos / Bajo Umbral</option>
                  <option value="Normal">📊 Stock Seguro / Normal</option>
                </select>
              </div>

              {/* 4. Ordenamiento */}
              <div>
                <select
                  value={mrpSortBy}
                  onChange={(e) => setMrpSortBy(e.target.value as any)}
                  className="w-full p-2.5 bg-white border border-bananur-sand rounded-xl cursor-pointer text-xs text-bananur-clay focus:outline-none"
                >
                  <option value="name-asc">↕️ Ordenar por: Nombre A-Z</option>
                  <option value="stock-asc">↕️ Ordenar por: Menor Stock primero</option>
                  <option value="stock-desc">↕️ Ordenar por: Mayor Stock primero</option>
                  <option value="cost-desc">↕️ Ordenar por: Mayor Costo unitario</option>
                  <option value="value-desc">↕️ Ordenar por: Mayor Valor de almacén</option>
                </select>
              </div>
            </div>
            
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-[11px] text-bananur-clay-light/80 font-mono bg-bananur-cream/35 p-3 rounded-xl border border-bananur-sand/40">
              <div className="flex flex-wrap items-center gap-2">
                <span>Mostrando <strong className="font-bold text-bananur-clay">{filteredMaterials.length === 0 ? 0 : (materialsPage - 1) * materialsPerPage + 1}-{Math.min(materialsPage * materialsPerPage, filteredMaterials.length)}</strong> de <strong className="font-semibold">{filteredMaterials.length}</strong> materiales del inventario de taller.</span>
                {totalMaterialsPages > 1 && (
                  <span className="text-[10px] bg-bananur-sand/40 text-bananur-clay px-2 py-0.5 rounded-full font-sans font-semibold">
                    Página {materialsPage} de {totalMaterialsPages}
                  </span>
                )}
              </div>

              {/* Selector de visualización: Tarjeta vs Lista */}
              <div className="flex items-center gap-1 bg-white p-1 rounded-xl border border-bananur-sand/60 shadow-3xs self-end sm:self-auto">
                <button
                  type="button"
                  id="erp-mrp-view-table-btn"
                  onClick={() => setMaterialsViewMode('table')}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-sans font-bold transition-all cursor-pointer ${
                    materialsViewMode === 'table'
                      ? 'bg-bananur-clay text-white shadow-xs'
                      : 'text-bananur-clay-light hover:text-bananur-clay hover:bg-bananur-cream/50'
                  }`}
                  title="Vista en Lista / Tabla"
                >
                  <List className="w-3.5 h-3.5" />
                  <span>Lista</span>
                </button>
                <button
                  type="button"
                  id="erp-mrp-view-cards-btn"
                  onClick={() => setMaterialsViewMode('cards')}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-sans font-bold transition-all cursor-pointer ${
                    materialsViewMode === 'cards'
                      ? 'bg-bananur-clay text-white shadow-xs'
                      : 'text-bananur-clay-light hover:text-bananur-clay hover:bg-bananur-cream/50'
                  }`}
                  title="Vista en Tarjetas"
                >
                  <LayoutGrid className="w-3.5 h-3.5" />
                  <span>Tarjetas</span>
                </button>
              </div>
            </div>
          </div>

          {/* VISTA 1: MODO TARJETAS (CARDS) */}
          {materialsViewMode === 'cards' ? (
            <div className="space-y-4">
              {filteredMaterials.length === 0 ? (
                <div className="bg-white rounded-2xl border border-bananur-sand p-12 text-center text-bananur-clay-light italic shadow-xs">
                  <div className="max-w-md mx-auto space-y-2">
                    <span className="text-2xl">🔍</span>
                    <p className="font-serif font-bold text-base text-bananur-clay text-center">Sin coincidencias para los filtros aplicados</p>
                    <p className="text-xs font-sans leading-relaxed">
                      No posees insumos registrados en este taller que correspondan a la búsqueda "{mrpSearchQuery}" seleccionada. ¡Prueba reiniciando los filtros!
                    </p>
                  </div>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {paginatedMaterials.map((m) => {
                    const isLow = m.stock <= m.lowStockAlert;
                    const isEditing = editingMaterialId === m.id;

                    if (isEditing) {
                      return (
                        <div key={m.id} className="bg-amber-50/70 border-2 border-amber-300 rounded-2xl p-5 shadow-xs space-y-3 animate-fade-in">
                          <div className="flex items-center justify-between border-b border-amber-200 pb-2">
                            <span className="font-mono text-xs font-bold text-[#B58455]">Editando [{m.id}]</span>
                            <span className="text-[10px] font-mono text-amber-900 bg-amber-100 px-2 py-0.5 rounded">Insumo</span>
                          </div>
                          
                          <div className="space-y-2">
                            <div>
                              <label className="block text-[10px] font-mono uppercase text-bananur-clay-light font-bold">Nombre</label>
                              <input
                                type="text"
                                value={editMatName}
                                onChange={(e) => setEditMatName(e.target.value)}
                                className="w-full p-2 bg-white border border-amber-300 rounded-lg text-xs text-bananur-clay font-bold"
                              />
                            </div>
                            <div>
                              <label className="block text-[10px] font-mono uppercase text-bananur-clay-light font-bold">Categoría</label>
                              <select
                                value={editMatCategory}
                                onChange={(e) => setEditMatCategory(e.target.value)}
                                className="w-full p-2 bg-white border border-amber-300 rounded-lg text-xs text-bananur-clay font-mono"
                              >
                                {supplierCategories.map(cat => (
                                  <option key={cat} value={cat}>{cat}</option>
                                ))}
                              </select>
                            </div>
                            <div className="grid grid-cols-2 gap-2">
                              <div>
                                <label className="block text-[10px] font-mono uppercase text-bananur-clay-light font-bold">Stock</label>
                                <input
                                  type="number"
                                  value={editMatStock}
                                  onChange={(e) => setEditMatStock(e.target.value)}
                                  className="w-full p-2 bg-white border border-amber-300 rounded-lg text-xs font-mono font-bold"
                                />
                              </div>
                              <div>
                                <label className="block text-[10px] font-mono uppercase text-bananur-clay-light font-bold">Unidad</label>
                                <input
                                  type="text"
                                  value={editMatUnit}
                                  onChange={(e) => setEditMatUnit(e.target.value)}
                                  className="w-full p-2 bg-white border border-amber-300 rounded-lg text-xs font-mono"
                                />
                              </div>
                            </div>
                            <div className="grid grid-cols-2 gap-2">
                              <div>
                                <label className="block text-[10px] font-mono uppercase text-bananur-clay-light font-bold">Costo Neto ($)</label>
                                <input
                                  type="number"
                                  value={editMatCost}
                                  onChange={(e) => setEditMatCost(e.target.value)}
                                  className="w-full p-2 bg-white border border-amber-300 rounded-lg text-xs font-mono"
                                />
                              </div>
                              <div>
                                <label className="block text-[10px] font-mono uppercase text-bananur-clay-light font-bold">Alerta Mínima</label>
                                <input
                                  type="number"
                                  value={editMatLowStockAlert}
                                  onChange={(e) => setEditMatLowStockAlert(e.target.value)}
                                  className="w-full p-2 bg-white border border-amber-300 rounded-lg text-xs font-mono"
                                />
                              </div>
                            </div>
                            <div>
                              <label className="block text-[10px] font-mono uppercase text-bananur-clay-light font-bold">Proveedor</label>
                              <input
                                type="text"
                                value={editMatSupplier}
                                onChange={(e) => setEditMatSupplier(e.target.value)}
                                className="w-full p-2 bg-white border border-amber-300 rounded-lg text-xs"
                              />
                            </div>
                          </div>

                          <div className="flex items-center justify-end gap-2 pt-2 border-t border-amber-200">
                            <button
                              type="button"
                              onClick={handleCancelMaterialEdit}
                              className="px-3 py-1.5 text-xs font-mono border border-bananur-sand rounded-lg text-bananur-clay hover:bg-white cursor-pointer"
                            >
                              Cancelar
                            </button>
                            <button
                              type="button"
                              onClick={() => handleSaveMaterialEdit(m.id)}
                              className="px-3 py-1.5 text-xs font-mono font-bold bg-[#2D2522] hover:bg-[#B58455] text-white rounded-lg cursor-pointer"
                            >
                              Guardar
                            </button>
                          </div>
                        </div>
                      );
                    }

                    return (
                      <div 
                        key={m.id}
                        className={`bg-white rounded-2xl border p-5 shadow-xs transition-all hover:shadow-md flex flex-col justify-between space-y-4 ${
                          isLow ? 'border-rose-300 bg-rose-50/20' : 'border-bananur-sand/80'
                        }`}
                      >
                        <div className="space-y-3">
                          <div className="flex items-center justify-between gap-2">
                            <span className="font-mono text-xs font-bold text-[#B58455] bg-bananur-cream/60 px-2 py-0.5 rounded-md border border-bananur-sand/50">
                              {m.id}
                            </span>
                            <div className="flex items-center gap-1.5">
                              <span className="font-mono text-[10px] text-bananur-clay-light/90 bg-bananur-sand/30 px-2 py-0.5 rounded-full font-medium">
                                {m.category}
                              </span>
                              {isLow && (
                                <span className="inline-flex items-center gap-1 text-[9px] text-[#A63A2B] bg-[#FFF2F0] border border-[#FFD0C8] font-bold px-2 py-0.5 rounded-full uppercase font-mono animate-pulse">
                                  Crítico
                                </span>
                              )}
                            </div>
                          </div>

                          <div>
                            <h4 className="font-serif text-base font-bold text-bananur-clay leading-snug">
                              {m.name}
                            </h4>
                            <p className="text-[11px] text-bananur-clay-light font-light mt-0.5">
                              Proveedor: <span className="font-medium text-bananur-clay">{m.supplierName || 'Sin asignar'}</span>
                            </p>
                          </div>

                          <div className="grid grid-cols-2 gap-2 bg-[#FAF8F5] p-3 rounded-xl border border-bananur-sand/40">
                            <div>
                              <span className="block text-[9px] font-mono uppercase text-bananur-clay-light">Stock en Taller</span>
                              <span className={`text-base font-mono font-bold ${isLow ? 'text-bananur-coral' : 'text-bananur-clay'}`}>
                                {m.stock.toLocaleString('es-CL')} <span className="text-xs font-normal text-bananur-clay-light">{m.unit}</span>
                              </span>
                              <span className="block text-[9px] font-mono text-bananur-clay-light/80">
                                Mínimo: {m.lowStockAlert} {m.unit}
                              </span>
                            </div>
                            <div>
                              <span className="block text-[9px] font-mono uppercase text-bananur-clay-light">Costo Unitario</span>
                              <span className="text-base font-mono font-bold text-bananur-clay">
                                ${m.unitCost.toLocaleString('es-CL')}
                              </span>
                              <span className="block text-[9px] font-mono text-bananur-clay-light/80">
                                Total: ${(m.stock * m.unitCost).toLocaleString('es-CL')}
                              </span>
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center justify-between pt-3 border-t border-bananur-sand/40 gap-2">
                          <button
                            type="button"
                            onClick={() => handleRestockMaterialSim(m.id, m.name)}
                            className="flex-1 py-2 px-3 text-[10px] font-mono font-bold bg-bananur-cream/80 hover:bg-bananur-yellow border border-bananur-sand text-bananur-clay rounded-xl transition-all cursor-pointer text-center"
                          >
                            + Simular Compra
                          </button>
                          <div className="flex items-center gap-1">
                            <button
                              type="button"
                              onClick={() => startEditingMaterial(m)}
                              className="p-2 bg-white border border-bananur-sand hover:border-bananur-clay hover:bg-bananur-cream/30 text-bananur-clay-light hover:text-bananur-clay rounded-xl transition-all cursor-pointer"
                              title="Editar Insumo"
                            >
                              <Pencil className="w-3.5 h-3.5" />
                            </button>
                            <button
                              type="button"
                              onClick={() => handleDeleteMaterial(m.id, m.name)}
                              className="p-2 hover:bg-rose-50 border border-transparent hover:border-rose-200 text-bananur-clay-light hover:text-bananur-coral rounded-xl transition-colors cursor-pointer"
                              title="Baja de Insumo"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          ) : (
            /* VISTA 2: MODO LISTA / TABLA TRADICIONAL */
            <div className="bg-white rounded-2xl border border-bananur-sand overflow-hidden shadow-xs">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-bananur-cream/50 border-b border-bananur-sand text-[10px] font-mono uppercase tracking-widest text-bananur-clay-light">
                      <th className="py-4 px-6">Código ERP</th>
                      <th className="py-4">Nombre Insumo</th>
                      <th className="py-4">Categoría</th>
                      <th className="py-4">Stock de Taller</th>
                      <th className="py-4">Costo Neto Unitario</th>
                      <th className="py-4">Umbral Mínimo</th>
                      <th className="py-4">Proveedor Habitual</th>
                      <th className="py-4 px-6 text-right">Acciones de Control</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-bananur-sand/50 text-xs text-bananur-clay">
                    {filteredMaterials.length === 0 ? (
                      <tr>
                        <td colSpan={8} className="py-12 text-center text-bananur-clay-light italic bg-bananur-cream/10">
                          <div className="max-w-md mx-auto space-y-2">
                            <span className="text-xl">🔍</span>
                            <p className="font-serif font-bold text-sm text-bananur-clay text-center">Sin coincidencias para los filtros aplicados</p>
                            <p className="text-[11px] leading-relaxed">
                              No posees insumos registrados en este taller que correspondan a la búsqueda "{mrpSearchQuery}" seleccionada. ¡Prueba reiniciando los filtros!
                            </p>
                          </div>
                        </td>
                      </tr>
                    ) : (
                      paginatedMaterials.map((m) => {
                        const isLow = m.stock <= m.lowStockAlert;
                        const isEditing = editingMaterialId === m.id;

                        if (isEditing) {
                          return (
                            <tr key={m.id} className="bg-bananur-sage-light border-y border-[#FEF08A] hover:bg-bananur-sage-light/80 transition-colors">
                              <td className="py-3 px-6 font-mono font-bold text-[#B58455]">{m.id}</td>
                              
                              {/* Editar Nombre */}
                              <td className="py-3 pr-2">
                                <input
                                  type="text"
                                  value={editMatName}
                                  onChange={(e) => setEditMatName(e.target.value)}
                                  className="w-full text-xs p-1.5 border border-bananur-sand rounded-lg bg-white font-medium text-bananur-clay focus:ring-1 focus:ring-bananur-clay focus:outline-none"
                                  placeholder="Nombre de insumo..."
                                />
                              </td>

                              {/* Editar Categoría */}
                              <td className="py-3 pr-2">
                                <select
                                  value={editMatCategory}
                                  onChange={(e) => setEditMatCategory(e.target.value)}
                                  className="w-full text-xs p-1.5 border border-bananur-sand rounded-lg bg-white font-mono cursor-pointer focus:outline-none"
                                >
                                  {supplierCategories.map(cat => (
                                    <option key={cat} value={cat}>{cat}</option>
                                  ))}
                                </select>
                              </td>

                              {/* Editar Stock y Unidad */}
                              <td className="py-3 pr-2">
                                <div className="flex items-center gap-1">
                                  <input
                                    type="number"
                                    value={editMatStock}
                                    onChange={(e) => setEditMatStock(e.target.value)}
                                    className="w-14 text-xs p-1.5 border border-bananur-sand rounded-lg bg-white font-mono font-bold text-center focus:outline-none"
                                  />
                                  <input
                                    type="text"
                                    value={editMatUnit}
                                    onChange={(e) => setEditMatUnit(e.target.value)}
                                    className="w-16 text-xs p-1.5 border border-bananur-sand rounded-lg bg-white font-mono text-center focus:outline-none"
                                    placeholder="unidad"
                                  />
                                </div>
                              </td>

                              {/* Editar Costo */}
                              <td className="py-3 pr-2">
                                <div className="relative flex items-center">
                                  <span className="absolute left-2.5 font-mono text-bananur-clay-light">$</span>
                                  <input
                                    type="number"
                                    value={editMatCost}
                                    onChange={(e) => setEditMatCost(e.target.value)}
                                    className="w-20 text-xs pl-5 p-1.5 border border-bananur-sand rounded-lg bg-white font-mono text-right focus:outline-none"
                                  />
                                </div>
                              </td>

                              {/* Editar Umbral de Alerta */}
                              <td className="py-3 pr-2">
                                <input
                                  type="number"
                                  value={editMatLowStockAlert}
                                  onChange={(e) => setEditMatLowStockAlert(e.target.value)}
                                  className="w-16 text-xs p-1.5 border border-bananur-sand rounded-lg bg-white font-mono text-center focus:outline-none"
                                />
                              </td>

                              {/* Editar Proveedor */}
                              <td className="py-3 pr-2">
                                <input
                                  type="text"
                                  value={editMatSupplier}
                                  onChange={(e) => setEditMatSupplier(e.target.value)}
                                  className="w-full text-xs p-1.5 border border-bananur-sand rounded-lg bg-white focus:outline-none"
                                  placeholder="Proveedor..."
                                />
                              </td>

                              {/* Acciones de edición */}
                              <td className="py-3 px-6 text-right">
                                <div className="flex items-center justify-end gap-1.5">
                                  <button
                                    onClick={() => handleSaveMaterialEdit(m.id)}
                                    className="p-1 px-2.5 bg-bananur-clay hover:bg-bananur-gold-dark text-white font-bold rounded-lg text-[10px] flex items-center gap-0.5 cursor-pointer"
                                    title="Guardar Cambios"
                                  >
                                    <Check className="w-3 h-3 text-white" />
                                    Listo
                                  </button>
                                  <button
                                    onClick={handleCancelMaterialEdit}
                                    className="p-1 px-2.5 bg-white hover:bg-gray-150 text-gray-700 border border-bananur-sand font-bold rounded-lg text-[10px] flex items-center gap-0.5 cursor-pointer"
                                    title="Cancelar"
                                  >
                                    <X className="w-3 h-3 text-gray-500" />
                                    Salir
                                  </button>
                                </div>
                              </td>
                            </tr>
                          );
                        }

                        return (
                          <tr key={m.id} className="hover:bg-bananur-sand/10 transition-colors">
                            <td className="py-4 px-6 font-mono font-bold text-[#B58455]">{m.id}</td>
                            <td className="py-4 font-semibold text-bananur-clay">
                              {m.name}
                              {isLow && (
                                <span className="ml-2 inline-flex items-center gap-1 text-[9px] text-[#A63A2B] bg-[#FFF2F0] border border-[#FFD0C8] font-bold px-1.5 py-0.5 rounded-full uppercase font-mono animate-pulse">
                                  Abastecer urgente
                                </span>
                              )}
                            </td>
                            <td className="py-4 font-mono font-medium text-bananur-clay-light/80">{m.category}</td>
                            <td className="py-4">
                              <span className={`font-mono font-bold ${isLow ? 'text-bananur-coral' : 'text-bananur-clay'}`}>
                                {m.stock.toLocaleString('es-CL')} {m.unit}
                              </span>
                            </td>
                            <td className="py-4 font-mono">${m.unitCost.toLocaleString('es-CL')}</td>
                            <td className="py-4">
                              <span className="font-mono text-bananur-clay hover:text-bananur-sage block hover:underline" title="Umbral por debajo del cual se activa la alerta en el ERP">
                                {m.lowStockAlert} {m.unit}
                              </span>
                            </td>
                            <td className="py-4 font-light text-bananur-clay-light">{m.supplierName}</td>
                            <td className="py-4 px-6 text-right">
                              <div className="flex items-center justify-end gap-1.5 text-xs">
                                <button
                                  onClick={() => startEditingMaterial(m)}
                                  className="p-1.5 bg-white border border-bananur-sand hover:border-bananur-clay hover:bg-bananur-cream/30 text-bananur-clay-light hover:text-bananur-clay rounded-lg transition-all cursor-pointer"
                                  title="Editar Insumo (Nombre, stock, categoría, costo, alerta)"
                                >
                                  <Pencil className="w-3.5 h-3.5" />
                                </button>
                                <button
                                  id={`erp-mrp-restock-btn-${m.id}`}
                                  onClick={() => handleRestockMaterialSim(m.id, m.name)}
                                  className="px-2.5 py-1 text-[10px] bg-bananur-cream border border-bananur-sand rounded-lg font-bold hover:bg-bananur-yellow hover:text-bananur-clay transition-all cursor-pointer inline-flex items-center gap-1"
                                >
                                  Simular Compra
                                </button>
                                <button
                                  id={`erp-mrp-del-btn-${m.id}`}
                                  onClick={() => handleDeleteMaterial(m.id, m.name)}
                                  className="p-1 hover:bg-rose-50 text-bananur-clay-light hover:text-bananur-coral rounded transition-colors cursor-pointer"
                                  title="Baja de Insumo"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* BARRA DE PAGINACIÓN DE INSUMOS */}
          {totalMaterialsPages > 1 && (
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2 px-1">
              <span className="text-xs text-bananur-clay-light font-mono">
                Mostrando página <strong className="text-bananur-clay">{materialsPage}</strong> de <strong className="text-bananur-clay">{totalMaterialsPages}</strong> ({filteredMaterials.length} insumos totales)
              </span>
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  id="erp-mrp-pagination-prev"
                  disabled={materialsPage <= 1}
                  onClick={() => setMaterialsPage(prev => Math.max(1, prev - 1))}
                  className="px-3 py-1.5 rounded-xl border border-bananur-sand text-xs font-mono font-bold bg-white hover:bg-bananur-cream text-bananur-clay disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer flex items-center gap-1 shadow-3xs"
                >
                  <ChevronLeft className="w-3.5 h-3.5" />
                  Anterior
                </button>
                <div className="flex items-center gap-1">
                  {Array.from({ length: totalMaterialsPages }).map((_, pIdx) => {
                    const pageNum = pIdx + 1;
                    return (
                      <button
                        key={pageNum}
                        type="button"
                        onClick={() => setMaterialsPage(pageNum)}
                        className={`w-8 h-8 rounded-xl text-xs font-mono font-bold transition-all cursor-pointer ${
                          materialsPage === pageNum
                            ? 'bg-[#2D2522] text-white shadow-xs'
                            : 'bg-white border border-bananur-sand text-bananur-clay hover:bg-bananur-cream'
                        }`}
                      >
                        {pageNum}
                      </button>
                    );
                  })}
                </div>
                <button
                  type="button"
                  id="erp-mrp-pagination-next"
                  disabled={materialsPage >= totalMaterialsPages}
                  onClick={() => setMaterialsPage(prev => Math.min(totalMaterialsPages, prev + 1))}
                  className="px-3 py-1.5 rounded-xl border border-bananur-sand text-xs font-mono font-bold bg-white hover:bg-bananur-cream text-bananur-clay disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer flex items-center gap-1 shadow-3xs"
                >
                  Siguiente
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ======================================================== */}
      {/* SECCIÓN 2: FARDOS DE ROPA VINTAGE (MATERIAS PRIMAS) */}
      {/* ======================================================== */}
      {mrpSection === 'fardos' && (
        <div className="space-y-6 animate-fade-in">
          {/* ENCABEZADO Y ACCIÓN PRINCIPAL */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h3 className="font-serif text-lg font-bold text-amber-950 flex items-center gap-2">
                <Boxes className="w-5 h-5 text-amber-700" />
                Fardos & Lotes de Ropa Vintage (Materias Primas)
              </h3>
              <p className="text-xs text-bananur-clay-light mt-0.5">
                Control de materias primas textiles importadas. Registra el precio total del fardo y su peso total para derivar automáticamente la tarifa fija por kilo ($ CLP/kg).
              </p>
            </div>

            <button
              type="button"
              id="erp-mrp-btn-new-lot"
              onClick={() => setShowAddLot(!showAddLot)}
              className="flex items-center gap-2 bg-amber-800 text-white px-4 py-2 rounded-xl text-xs font-mono font-bold hover:bg-amber-900 transition-all shadow-xs cursor-pointer shrink-0"
            >
              <Plus className="w-4 h-4" />
              {showAddLot ? 'Cerrar Formulario' : 'Registrar Nuevo Fardo'}
            </button>
          </div>

          {/* TARJETAS DE MÉTRICAS CONSOLIDADAS DE FARDOS */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white p-4.5 rounded-2xl border border-amber-200/80 shadow-xs space-y-1">
              <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-amber-900 block flex items-center justify-between">
                <span>Fardos Registrados</span>
                <Boxes className="w-4 h-4 text-amber-700" />
              </span>
              <div className="flex items-baseline gap-2">
                <span className="text-2xl font-serif font-bold text-amber-950">{lotMetrics.totalLots}</span>
                <span className="text-xs text-amber-800 font-mono">lotes activos</span>
              </div>
              <p className="text-[11px] text-bananur-clay-light">~{lotMetrics.totalItemsCount} prendas estimadas en inventario</p>
            </div>

            <div className="bg-white p-4.5 rounded-2xl border border-amber-200/80 shadow-xs space-y-1">
              <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-amber-900 block flex items-center justify-between">
                <span>Inversión Total en Fardos</span>
                <Coins className="w-4 h-4 text-amber-700" />
              </span>
              <div className="flex items-baseline gap-2">
                <span className="text-2xl font-serif font-bold text-amber-950">
                  ${lotMetrics.totalInvestment.toLocaleString('es-CL')}
                </span>
                <span className="text-xs text-amber-800 font-mono">CLP</span>
              </div>
              <p className="text-[11px] text-bananur-clay-light">Costo total de adquisición en fardos</p>
            </div>

            <div className="bg-white p-4.5 rounded-2xl border border-amber-200/80 shadow-xs space-y-1">
              <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-amber-900 block flex items-center justify-between">
                <span>Peso Neto Acumulado</span>
                <Scale className="w-4 h-4 text-amber-700" />
              </span>
              <div className="flex items-baseline gap-2">
                <span className="text-2xl font-serif font-bold text-amber-950">
                  {lotMetrics.totalWeight.toLocaleString('es-CL')}
                </span>
                <span className="text-xs text-amber-800 font-mono">Kg</span>
              </div>
              <p className="text-[11px] text-bananur-clay-light">Masa textil total disponible para curaduría</p>
            </div>

            <div className="bg-amber-900 text-amber-50 p-4.5 rounded-2xl border border-amber-800 shadow-xs space-y-1">
              <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-amber-200/90 block flex items-center justify-between">
                <span>Tarifa Promedio Ponderada</span>
                <Calculator className="w-4 h-4 text-amber-300" />
              </span>
              <div className="flex items-baseline gap-2">
                <span className="text-2xl font-serif font-bold text-amber-100">
                  ${lotMetrics.weightedAvgRate.toLocaleString('es-CL')}
                </span>
                <span className="text-xs text-amber-300 font-mono">/ Kg</span>
              </div>
              <p className="text-[11px] text-amber-200/80 font-mono">
                ≈ ${(lotMetrics.weightedAvgRate / 1000).toFixed(1)} CLP por gramo
              </p>
            </div>
          </div>

          {/* FORMULARIO DE REGISTRO DE NUEVO FARDO */}
          {showAddLot && (
            <form 
              onSubmit={handleAddLotSubmit}
              className="bg-amber-50/70 border-2 border-amber-300/80 rounded-2xl p-5 sm:p-6 shadow-xs space-y-5 animate-fade-in"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-amber-200 pb-3">
                <div className="flex items-center gap-2">
                  <div className="p-2 bg-amber-200/80 rounded-xl text-amber-900">
                    <Boxes className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="font-serif text-base font-bold text-amber-950">
                      Alta de Fardo / Lote de Ropa Vintage (Materia Prima)
                    </h4>
                    <p className="text-xs text-amber-900/80">
                      Ingresa el precio total y el peso total del fardo. La tarifa fija por kilo se calculará de forma automática.
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setShowAddLot(false)}
                  className="text-amber-800 hover:text-amber-950 text-xs font-mono self-start sm:self-auto p-1"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-mono font-bold text-amber-950 mb-1">
                    Código de Lote / Fardo *
                  </label>
                  <input
                    id="new-lot-code-input"
                    type="text"
                    required
                    placeholder="Ej. FRD-2024-04 o FRD-DNM-90S"
                    value={lotCode}
                    onChange={(e) => setLotCode(e.target.value.toUpperCase())}
                    className="w-full p-2.5 bg-white border border-amber-300 rounded-xl text-xs font-mono font-bold text-amber-950 focus:ring-2 focus:ring-amber-500"
                  />
                  <span className="text-[10px] text-amber-800/80 font-mono mt-0.5 block">Identificador único del fardo</span>
                </div>

                <div>
                  <label className="block text-xs font-mono font-bold text-amber-950 mb-1">
                    Nombre / Tipo de Fardo *
                  </label>
                  <input
                    id="new-lot-name-input"
                    type="text"
                    required
                    placeholder="Ej. Fardo Chaquetas Cuero & Denim Vintage USA"
                    value={lotName}
                    onChange={(e) => setLotName(e.target.value)}
                    className="w-full p-2.5 bg-white border border-amber-300 rounded-xl text-xs text-amber-950 focus:ring-2 focus:ring-amber-500 font-medium"
                  />
                  <span className="text-[10px] text-amber-800/80 font-mono mt-0.5 block">Descripción de la selección textil</span>
                </div>

                <div>
                  <label className="block text-xs font-mono font-bold text-amber-950 mb-1">
                    Origen / Curaduría / Proveedor
                  </label>
                  <input
                    id="new-lot-origin-input"
                    type="text"
                    placeholder="Ej. Importación Directa USA / Grado A"
                    value={lotOrigin}
                    onChange={(e) => setLotOrigin(e.target.value)}
                    className="w-full p-2.5 bg-white border border-amber-300 rounded-xl text-xs text-amber-950 focus:ring-2 focus:ring-amber-500"
                  />
                  <span className="text-[10px] text-amber-800/80 font-mono mt-0.5 block">Procedencia y grado de selección</span>
                </div>
              </div>

              {/* BLOQUE CLAVE: PRECIO TOTAL, PESO TOTAL Y TARIFA FIJA POR KILO RESULTANTE */}
              <div className="bg-white/95 p-4 rounded-xl border border-amber-300 space-y-4">
                <div className="flex items-center gap-2 text-xs font-mono font-bold text-amber-950 border-b border-amber-200/70 pb-2">
                  <Calculator className="w-4 h-4 text-amber-800" />
                  <span>Cálculo Automático de Tarifa por Kilo (Costo de Materia Prima)</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  {/* CAMPO 1: PRECIO TOTAL DEL FARDO */}
                  <div>
                    <label className="block text-xs font-mono font-bold text-amber-950 mb-1">
                      1. Precio Total del Fardo ($ CLP) *
                    </label>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs font-mono text-amber-800 font-bold">$</span>
                      <input
                        id="new-lot-total-price-input"
                        type="number"
                        min="0"
                        step="any"
                        required
                        placeholder="1260000"
                        value={lotTotalPrice}
                        onChange={(e) => {
                          setLotTotalPrice(e.target.value);
                          setIsRateManuallyOverridden(false);
                        }}
                        className="w-full p-2.5 pl-7 bg-amber-50/50 border border-amber-400 rounded-xl text-xs font-mono font-bold text-amber-950 focus:ring-2 focus:ring-amber-500"
                      />
                    </div>
                    <span className="text-[10px] text-amber-800/80 font-mono mt-0.5 block">Valor total facturado por el fardo completo</span>
                  </div>

                  {/* CAMPO 2: PESO TOTAL DEL FARDO */}
                  <div>
                    <label className="block text-xs font-mono font-bold text-amber-950 mb-1">
                      2. Peso Total del Fardo (Kg) *
                    </label>
                    <div className="relative">
                      <input
                        id="new-lot-total-weight-input"
                        type="number"
                        min="0.1"
                        step="any"
                        required
                        placeholder="45"
                        value={lotTotalWeightKg}
                        onChange={(e) => {
                          setLotTotalWeightKg(e.target.value);
                          setIsRateManuallyOverridden(false);
                        }}
                        className="w-full p-2.5 pr-10 bg-amber-50/50 border border-amber-400 rounded-xl text-xs font-mono font-bold text-amber-950 focus:ring-2 focus:ring-amber-500"
                      />
                      <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-mono text-amber-800 font-bold">Kg</span>
                    </div>
                    <span className="text-[10px] text-amber-800/80 font-mono mt-0.5 block">Peso neto registrado en báscula</span>
                  </div>

                  {/* CAMPO 3: TARIFA FIJA POR KILO RESULTANTE */}
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <label className="block text-xs font-mono font-bold text-amber-950">
                        3. Tarifa Fija por Kilo ($ CLP/kg) *
                      </label>
                      {isRateManuallyOverridden && (
                        <span className="text-[9px] bg-amber-200 text-amber-950 font-mono px-1.5 py-0.5 rounded font-bold">
                          Manual
                        </span>
                      )}
                    </div>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs font-mono text-emerald-800 font-bold">$</span>
                      <input
                        id="new-lot-rate-kg-input"
                        type="number"
                        min="0"
                        step="any"
                        required
                        placeholder="28000"
                        value={lotPricePerKg}
                        onChange={(e) => {
                          setLotPricePerKg(e.target.value);
                          setIsRateManuallyOverridden(true);
                        }}
                        className="w-full p-2.5 pl-7 pr-12 bg-emerald-50/70 border-2 border-emerald-500 rounded-xl text-xs font-mono font-bold text-emerald-950 focus:ring-2 focus:ring-emerald-500"
                      />
                      <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-mono text-emerald-800 font-bold">/kg</span>
                    </div>
                    <span className="text-[10px] text-emerald-800 font-mono mt-0.5 block">
                      Resultado de: Precio Total ÷ Peso Total
                    </span>
                  </div>
                </div>

                {/* BANNER VISUAL CON EL DESGLOSE DE LA FÓRMULA */}
                <div className="bg-amber-100/70 p-3 rounded-lg border border-amber-300 text-xs font-mono text-amber-950 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-amber-900 bg-amber-200 px-2 py-0.5 rounded">Fórmula de Tarifa:</span>
                    <span>
                      ${(Number(lotTotalPrice) || 0).toLocaleString('es-CL')} CLP ÷ {(Number(lotTotalWeightKg) || 0)} kg
                    </span>
                  </div>
                  <div className="font-bold text-emerald-900 bg-emerald-200/80 px-3 py-1 rounded border border-emerald-400">
                    = ${(Number(lotPricePerKg) || 0).toLocaleString('es-CL')} CLP / kg (≈ ${( (Number(lotPricePerKg) || 0) / 1000 ).toFixed(2)} CLP/gramo)
                  </div>
                </div>
              </div>

              {/* CAMPOS ADICIONALES: ESTIMACIÓN DE PRENDAS Y NOTAS */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-mono font-bold text-amber-950 mb-1">
                    Cantidad Estimada de Prendas en el Fardo (Opcional)
                  </label>
                  <input
                    id="new-lot-items-count-input"
                    type="number"
                    min="1"
                    placeholder="Ej. 60"
                    value={lotItemsCount}
                    onChange={(e) => setLotItemsCount(e.target.value)}
                    className="w-full p-2.5 bg-white border border-amber-300 rounded-xl text-xs font-mono text-amber-950"
                  />
                  {Number(lotItemsCount) > 0 && Number(lotTotalPrice) > 0 && (
                    <span className="text-[10px] text-amber-900 font-mono mt-1 block">
                      Costo promedio estimado: ≈ ${Math.round(Number(lotTotalPrice) / Number(lotItemsCount)).toLocaleString('es-CL')} CLP por prenda
                    </span>
                  )}
                </div>

                <div>
                  <label className="block text-xs font-mono font-bold text-amber-950 mb-1">
                    Notas y Observaciones de Curaduría
                  </label>
                  <input
                    id="new-lot-notes-input"
                    type="text"
                    placeholder="Ej. Lote incluye 40% denims pesados, 30% cueros y 30% chaquetas ligeras."
                    value={lotNotes}
                    onChange={(e) => setLotNotes(e.target.value)}
                    className="w-full p-2.5 bg-white border border-amber-300 rounded-xl text-xs text-amber-950"
                  />
                </div>
              </div>

              {/* BOTONES DE ACCIÓN */}
              <div className="flex items-center justify-end gap-3 pt-2 border-t border-amber-200">
                <button
                  type="button"
                  onClick={() => setShowAddLot(false)}
                  className="px-4 py-2 text-xs font-mono border border-bananur-sand rounded-xl text-bananur-clay hover:bg-bananur-sand/30 transition-all cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  id="btn-save-new-lot"
                  className="px-5 py-2 text-xs font-mono font-bold bg-amber-800 hover:bg-amber-900 text-white rounded-xl shadow-xs transition-all flex items-center gap-2 cursor-pointer"
                >
                  <Check className="w-4 h-4" />
                  Guardar Fardo en Insumos
                </button>
              </div>
            </form>
          )}

          {/* HERRAMIENTAS DE BÚSQUEDA Y ORDENAMIENTO DE FARDOS */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-white p-3.5 rounded-2xl border border-bananur-sand/80 shadow-xs">
            <div className="relative w-full sm:w-80">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-bananur-clay-light" />
              <input
                id="fardos-search-input"
                type="text"
                placeholder="Buscar por código, nombre u origen..."
                value={lotSearchQuery}
                onChange={(e) => setLotSearchQuery(e.target.value)}
                className="w-full pl-9 pr-3 py-1.5 bg-bananur-cream/30 border border-bananur-sand rounded-xl text-xs focus:ring-1 focus:ring-amber-800 text-bananur-clay font-mono"
              />
              {lotSearchQuery && (
                <button
                  onClick={() => setLotSearchQuery('')}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-bananur-clay-light hover:text-bananur-clay text-xs"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto justify-between sm:justify-end">
              <div className="flex items-center gap-1.5">
                <ArrowUpDown className="w-3.5 h-3.5 text-bananur-clay-light" />
                <span className="text-[11px] font-mono text-bananur-clay-light">Ordenar:</span>
                <select
                  id="fardos-sort-select"
                  value={lotSortBy}
                  onChange={(e) => setLotSortBy(e.target.value as any)}
                  className="p-1.5 bg-white border border-bananur-sand rounded-lg text-xs font-mono text-bananur-clay focus:ring-1 focus:ring-amber-800 cursor-pointer"
                >
                  <option value="date-desc">Más Recientes Primero</option>
                  <option value="name-asc">Nombre (A - Z)</option>
                  <option value="rate-desc">Tarifa $/kg (Mayor a Menor)</option>
                  <option value="rate-asc">Tarifa $/kg (Menor a Mayor)</option>
                  <option value="price-desc">Mayor Inversión ($ Total)</option>
                  <option value="weight-desc">Mayor Peso (Kg Total)</option>
                </select>
              </div>

              {/* Selector de visualización: Tarjeta vs Lista */}
              <div className="flex items-center gap-1 bg-white p-1 rounded-xl border border-bananur-sand/60 shadow-3xs">
                <button
                  type="button"
                  id="erp-fardos-view-table-btn"
                  onClick={() => setFardosViewMode('table')}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-sans font-bold transition-all cursor-pointer ${
                    fardosViewMode === 'table'
                      ? 'bg-amber-800 text-white shadow-xs'
                      : 'text-bananur-clay-light hover:text-bananur-clay hover:bg-bananur-cream/50'
                  }`}
                  title="Vista en Lista / Tabla"
                >
                  <List className="w-3.5 h-3.5" />
                  <span>Lista</span>
                </button>
                <button
                  type="button"
                  id="erp-fardos-view-cards-btn"
                  onClick={() => setFardosViewMode('cards')}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-sans font-bold transition-all cursor-pointer ${
                    fardosViewMode === 'cards'
                      ? 'bg-amber-800 text-white shadow-xs'
                      : 'text-bananur-clay-light hover:text-bananur-clay hover:bg-bananur-cream/50'
                  }`}
                  title="Vista en Tarjetas"
                >
                  <LayoutGrid className="w-3.5 h-3.5" />
                  <span>Tarjetas</span>
                </button>
              </div>

              <span className="text-[11px] font-mono text-bananur-clay-light bg-bananur-cream/50 px-2 py-1 rounded-lg border border-bananur-sand/50">
                {filteredLots.length} {filteredLots.length === 1 ? 'fardo' : 'fardos'}
              </span>
            </div>
          </div>

          {/* VISTA EN TARJETAS PARA FARDOS */}
          {fardosViewMode === 'cards' ? (
            <div className="space-y-4">
              {filteredLots.length === 0 ? (
                <div className="bg-white rounded-2xl border border-bananur-sand p-12 text-center text-bananur-clay-light font-mono shadow-xs">
                  No se encontraron fardos con los filtros actuales.
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {paginatedFardos.map((lot) => {
                    const isEditing = editingLotId === lot.id;
                    const displayPrice = lot.totalPrice || ((lot.totalWeightKg || 0) * lot.pricePerKg);
                    const displayWeight = lot.totalWeightKg || 0;
                    const isSimActive = activeSimLotId === lot.id;

                    if (isEditing) {
                      return (
                        <div key={lot.id} className="bg-amber-50/80 border-2 border-amber-300 rounded-2xl p-5 shadow-xs space-y-3 animate-fade-in">
                          <div className="flex items-center justify-between border-b border-amber-200 pb-2">
                            <span className="font-mono text-xs font-bold text-amber-950">Editando [{lot.code}]</span>
                            <div className="flex items-center gap-1.5">
                              <button
                                type="button"
                                onClick={() => setEditingLotId(null)}
                                className="px-2.5 py-1 text-[10px] font-mono border border-bananur-sand rounded-lg text-bananur-clay hover:bg-white cursor-pointer"
                              >
                                Cancelar
                              </button>
                              <button
                                type="button"
                                onClick={() => handleSaveLotEdit(lot.id)}
                                className="px-3 py-1 text-[10px] font-mono font-bold bg-amber-800 text-white rounded-lg hover:bg-amber-900 cursor-pointer"
                              >
                                Guardar
                              </button>
                            </div>
                          </div>

                          <div className="space-y-2 text-xs">
                            <div>
                              <label className="block text-[10px] font-mono font-bold text-amber-950 mb-0.5">Código</label>
                              <input
                                type="text"
                                value={editLotCode}
                                onChange={(e) => setEditLotCode(e.target.value.toUpperCase())}
                                className="w-full p-2 bg-white border border-amber-300 rounded-lg font-mono font-bold"
                              />
                            </div>
                            <div>
                              <label className="block text-[10px] font-mono font-bold text-amber-950 mb-0.5">Nombre</label>
                              <input
                                type="text"
                                value={editLotName}
                                onChange={(e) => setEditLotName(e.target.value)}
                                className="w-full p-2 bg-white border border-amber-300 rounded-lg"
                              />
                            </div>
                            <div className="grid grid-cols-2 gap-2">
                              <div>
                                <label className="block text-[10px] font-mono font-bold text-amber-950 mb-0.5">Precio Total ($)</label>
                                <input
                                  type="number"
                                  value={editLotTotalPrice}
                                  onChange={(e) => setEditLotTotalPrice(e.target.value)}
                                  className="w-full p-2 bg-white border border-amber-300 rounded-lg font-mono font-bold"
                                />
                              </div>
                              <div>
                                <label className="block text-[10px] font-mono font-bold text-amber-950 mb-0.5">Peso (Kg)</label>
                                <input
                                  type="number"
                                  value={editLotTotalWeightKg}
                                  onChange={(e) => setEditLotTotalWeightKg(e.target.value)}
                                  className="w-full p-2 bg-white border border-amber-300 rounded-lg font-mono font-bold"
                                />
                              </div>
                            </div>
                            <div>
                              <label className="block text-[10px] font-mono font-bold text-emerald-950 mb-0.5">Tarifa ($/kg)</label>
                              <input
                                type="number"
                                value={editLotPricePerKg}
                                onChange={(e) => setEditLotPricePerKg(e.target.value)}
                                className="w-full p-2 bg-emerald-50 border-2 border-emerald-500 rounded-lg font-mono font-bold text-emerald-950"
                              />
                            </div>
                          </div>
                        </div>
                      );
                    }

                    return (
                      <div
                        key={lot.id}
                        className={`bg-white rounded-2xl border p-5 shadow-xs transition-all hover:shadow-md flex flex-col justify-between space-y-4 ${
                          isSimActive ? 'border-amber-500 ring-2 ring-amber-400/30' : 'border-amber-200/80'
                        }`}
                      >
                        <div className="space-y-3">
                          <div className="flex items-center justify-between gap-2">
                            <span className="font-mono text-xs font-bold bg-amber-200/90 text-amber-950 px-2 py-0.5 rounded-md border border-amber-300">
                              {lot.code}
                            </span>
                            <span className="font-mono text-[10px] text-bananur-clay-light/90 bg-bananur-sand/30 px-2 py-0.5 rounded-full font-medium">
                              {lot.origin || 'Importación Estándar'}
                            </span>
                          </div>

                          <div>
                            <h4 className="font-serif text-base font-bold text-bananur-clay leading-snug">
                              {lot.name}
                            </h4>
                            {lot.notes && (
                              <p className="text-[11px] text-bananur-clay-light mt-1 font-sans line-clamp-2">
                                {lot.notes}
                              </p>
                            )}
                          </div>

                          <div className="grid grid-cols-2 gap-2 bg-[#FAF8F5] p-3 rounded-xl border border-bananur-sand/40 font-mono">
                            <div>
                              <span className="block text-[9px] uppercase text-bananur-clay-light">Inversión Fardo</span>
                              <span className="text-base font-bold text-amber-950">
                                {displayPrice > 0 ? `$${displayPrice.toLocaleString('es-CL')}` : '—'}
                              </span>
                              <span className="block text-[9px] text-bananur-clay-light">
                                Peso: {displayWeight > 0 ? `${displayWeight} kg` : '—'}
                              </span>
                            </div>
                            <div className="bg-amber-100/50 p-2 rounded-lg border border-amber-200">
                              <span className="block text-[9px] uppercase text-amber-900 font-bold">Tarifa Fija</span>
                              <span className="text-sm font-bold text-amber-950">
                                ${lot.pricePerKg.toLocaleString('es-CL')} <span className="text-[10px] font-normal">/kg</span>
                              </span>
                              <span className="block text-[9px] text-amber-800">
                                ≈ ${(lot.pricePerKg / 1000).toFixed(2)}/g
                              </span>
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center justify-between pt-3 border-t border-bananur-sand/40 gap-2">
                          <button
                            type="button"
                            onClick={() => setActiveSimLotId(isSimActive ? null : lot.id)}
                            className={`flex-1 py-2 px-3 text-[10px] font-mono font-bold rounded-xl transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                              isSimActive
                                ? 'bg-amber-900 text-white shadow-xs'
                                : 'bg-amber-50 hover:bg-amber-200 text-amber-950 border border-amber-300'
                            }`}
                          >
                            <Scale className="w-3.5 h-3.5" />
                            {isSimActive ? 'Tasador Activo ✓' : 'Tasar Prenda'}
                          </button>
                          <div className="flex items-center gap-1">
                            <button
                              type="button"
                              onClick={() => startEditingLot(lot)}
                              className="p-2 bg-white border border-bananur-sand hover:border-amber-800 hover:bg-amber-50 text-bananur-clay-light hover:text-amber-900 rounded-xl transition-all cursor-pointer"
                              title="Editar Fardo"
                            >
                              <Pencil className="w-3.5 h-3.5" />
                            </button>
                            <button
                              type="button"
                              onClick={() => handleDeleteLot(lot.id, lot.code)}
                              className="p-2 hover:bg-rose-50 border border-transparent hover:border-rose-200 text-bananur-clay-light hover:text-bananur-coral rounded-xl transition-colors cursor-pointer"
                              title="Eliminar Fardo"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          ) : (
            /* TABLA DE FARDOS REGISTRADOS */
            <div className="bg-white rounded-2xl border border-bananur-sand/80 shadow-xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="bg-amber-50/50 border-b border-bananur-sand font-mono text-[10px] text-amber-950 uppercase tracking-wider">
                    <th className="py-3.5 px-4 font-bold">Código & Nombre del Fardo</th>
                    <th className="py-3.5 px-3 font-bold">Origen / Curaduría</th>
                    <th className="py-3.5 px-3 font-bold">Precio Total ($ CLP)</th>
                    <th className="py-3.5 px-3 font-bold">Peso Total (Kg)</th>
                    <th className="py-3.5 px-4 font-bold bg-amber-100/60 text-amber-950">
                      Tarifa Fija ($ CLP/kg)
                    </th>
                    <th className="py-3.5 px-3 font-bold">Prendas Est.</th>
                    <th className="py-3.5 px-3 font-bold">Fecha Alta</th>
                    <th className="py-3.5 px-4 text-right font-bold">Acciones</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-bananur-sand/40">
                  {filteredLots.length === 0 ? (
                    <tr>
                      <td colSpan={8} className="py-8 text-center text-xs text-bananur-clay-light font-mono">
                        No se encontraron fardos con los filtros actuales.
                      </td>
                    </tr>
                  ) : (
                    paginatedFardos.map((lot) => {
                      const isEditing = editingLotId === lot.id;
                      const hasDetails = Boolean(lot.totalPrice && lot.totalWeightKg);
                      const displayPrice = lot.totalPrice || ((lot.totalWeightKg || 0) * lot.pricePerKg);
                      const displayWeight = lot.totalWeightKg || 0;
                      const isSimActive = activeSimLotId === lot.id;

                      if (isEditing) {
                        return (
                          <tr key={lot.id} className="bg-amber-50/80 animate-fade-in">
                            <td className="py-3 px-4" colSpan={8}>
                              <div className="space-y-3 p-2 bg-white rounded-xl border border-amber-300">
                                <div className="flex items-center justify-between border-b border-amber-200 pb-2">
                                  <span className="font-mono text-xs font-bold text-amber-950 flex items-center gap-1.5">
                                    <Pencil className="w-3.5 h-3.5 text-amber-700" />
                                    Editando Fardo [{lot.code}]
                                  </span>
                                  <div className="flex items-center gap-2">
                                    <button
                                      type="button"
                                      onClick={() => setEditingLotId(null)}
                                      className="px-2 py-1 text-[10px] font-mono border border-bananur-sand rounded text-bananur-clay"
                                    >
                                      Cancelar
                                    </button>
                                    <button
                                      type="button"
                                      onClick={() => handleSaveLotEdit(lot.id)}
                                      className="px-3 py-1 text-[10px] font-mono font-bold bg-amber-800 text-white rounded hover:bg-amber-900"
                                    >
                                      Guardar Cambios
                                    </button>
                                  </div>
                                </div>

                                <div className="grid grid-cols-1 sm:grid-cols-3 lg:grid-cols-6 gap-2 text-xs">
                                  <div>
                                    <label className="block text-[10px] font-mono font-bold text-amber-950 mb-0.5">Código</label>
                                    <input
                                      type="text"
                                      value={editLotCode}
                                      onChange={(e) => setEditLotCode(e.target.value.toUpperCase())}
                                      className="w-full p-1.5 bg-white border border-amber-300 rounded text-xs font-mono font-bold"
                                    />
                                  </div>
                                  <div className="sm:col-span-2">
                                    <label className="block text-[10px] font-mono font-bold text-amber-950 mb-0.5">Nombre</label>
                                    <input
                                      type="text"
                                      value={editLotName}
                                      onChange={(e) => setEditLotName(e.target.value)}
                                      className="w-full p-1.5 bg-white border border-amber-300 rounded text-xs"
                                    />
                                  </div>
                                  <div>
                                    <label className="block text-[10px] font-mono font-bold text-amber-950 mb-0.5">Precio Total ($)</label>
                                    <input
                                      type="number"
                                      value={editLotTotalPrice}
                                      onChange={(e) => setEditLotTotalPrice(e.target.value)}
                                      className="w-full p-1.5 bg-amber-50 border border-amber-400 rounded text-xs font-mono font-bold"
                                    />
                                  </div>
                                  <div>
                                    <label className="block text-[10px] font-mono font-bold text-amber-950 mb-0.5">Peso Total (Kg)</label>
                                    <input
                                      type="number"
                                      value={editLotTotalWeightKg}
                                      onChange={(e) => setEditLotTotalWeightKg(e.target.value)}
                                      className="w-full p-1.5 bg-amber-50 border border-amber-400 rounded text-xs font-mono font-bold"
                                    />
                                  </div>
                                  <div>
                                    <label className="block text-[10px] font-mono font-bold text-emerald-950 mb-0.5">Tarifa ($/kg)</label>
                                    <input
                                      type="number"
                                      value={editLotPricePerKg}
                                      onChange={(e) => setEditLotPricePerKg(e.target.value)}
                                      className="w-full p-1.5 bg-emerald-50 border-2 border-emerald-500 rounded text-xs font-mono font-bold text-emerald-950"
                                    />
                                  </div>
                                </div>
                              </div>
                            </td>
                          </tr>
                        );
                      }

                      return (
                        <tr key={lot.id} className="hover:bg-amber-50/40 transition-colors">
                          <td className="py-3.5 px-4 font-mono">
                            <div className="flex items-center gap-2">
                              <span className="font-bold bg-amber-200/90 text-amber-950 px-2 py-0.5 rounded text-[11px] border border-amber-300">
                                {lot.code}
                              </span>
                              <div className="font-semibold text-bananur-clay">
                                {lot.name}
                                {lot.notes && (
                                  <span className="block text-[10px] text-bananur-clay-light font-normal font-sans truncate max-w-xs">
                                    {lot.notes}
                                  </span>
                                )}
                              </div>
                            </div>
                          </td>

                          <td className="py-3.5 px-3 text-bananur-clay-light text-[11px]">
                            {lot.origin || 'Importación Estándar'}
                          </td>

                          <td className="py-3.5 px-3 font-mono font-bold text-amber-950">
                            {displayPrice > 0 ? `$${displayPrice.toLocaleString('es-CL')}` : '—'}
                          </td>

                          <td className="py-3.5 px-3 font-mono font-bold text-amber-900">
                            {displayWeight > 0 ? `${displayWeight} kg` : '—'}
                          </td>

                          <td className="py-3.5 px-4 font-mono bg-amber-100/40">
                            <div className="flex flex-col">
                              <span className="font-bold text-amber-950 text-xs">
                                ${lot.pricePerKg.toLocaleString('es-CL')} / kg
                              </span>
                              <span className="text-[10px] text-amber-800">
                                ≈ ${(lot.pricePerKg / 1000).toFixed(2)} / g
                              </span>
                            </div>
                          </td>

                          <td className="py-3.5 px-3 font-mono text-[11px] text-bananur-clay">
                            {lot.itemsCount ? (
                              <div>
                                <span className="font-bold">{lot.itemsCount} u.</span>
                                {displayPrice > 0 && (
                                  <span className="block text-[10px] text-bananur-clay-light">
                                    ~${Math.round(displayPrice / lot.itemsCount).toLocaleString('es-CL')}/u
                                  </span>
                                )}
                              </div>
                            ) : (
                              <span className="text-bananur-clay-light/60">—</span>
                            )}
                          </td>

                          <td className="py-3.5 px-3 font-mono text-[11px] text-bananur-clay-light">
                            {lot.dateAdded || '2024-01-10'}
                          </td>

                          <td className="py-3.5 px-4 text-right">
                            <div className="flex items-center justify-end gap-1.5 text-xs">
                              <button
                                type="button"
                                onClick={() => setActiveSimLotId(isSimActive ? null : lot.id)}
                                className={`p-1.5 rounded-lg border text-[10px] font-mono font-bold transition-all cursor-pointer flex items-center gap-1 ${
                                  isSimActive 
                                    ? 'bg-amber-800 text-white border-amber-900 shadow-xs' 
                                    : 'bg-amber-50 text-amber-950 border-amber-300 hover:bg-amber-100'
                                }`}
                                title="Tasador rápido de prenda por peso para este fardo"
                              >
                                <Scale className="w-3.5 h-3.5" />
                                Tasar
                              </button>

                              <button
                                type="button"
                                onClick={() => startEditingLot(lot)}
                                className="p-1.5 bg-white border border-bananur-sand hover:border-amber-800 text-bananur-clay-light hover:text-amber-950 rounded-lg transition-all cursor-pointer"
                                title="Editar datos del fardo y recálculo de tarifa"
                              >
                                <Pencil className="w-3.5 h-3.5" />
                              </button>

                              <button
                                type="button"
                                onClick={() => handleDeleteLot(lot.id, lot.code)}
                                className="p-1.5 hover:bg-rose-50 text-bananur-clay-light hover:text-bananur-coral rounded-lg transition-colors cursor-pointer"
                                title="Eliminar fardo"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>

            {/* TASADOR RÁPIDO INTERACTIVO POR PRENDA INTEGRADO AL FARDO SELECCIONADO */}
            {activeSimLotId && (() => {
              const activeSimLot = availableLots.find(l => l.id === activeSimLotId);
              if (!activeSimLot) return null;
              const currentSimWeight = getSimWeightForLot(activeSimLot.id);
              const wGrams = Number(currentSimWeight) || 0;
              const wKg = wGrams / 1000;
              const calculatedPrice = Math.round(wKg * activeSimLot.pricePerKg);

              const presets = [
                { label: 'Polera / Top', weight: '200' },
                { label: 'Camisa / Blusa', weight: '320' },
                { label: 'Pantalón / Jeans', weight: '650' },
                { label: 'Polerón / Hoodie', weight: '750' },
                { label: 'Chaqueta / Denim', weight: '950' },
                { label: 'Abrigo de Lana', weight: '1400' },
              ];

              return (
                <div className="p-4 bg-amber-950 text-amber-50 border-t border-amber-800 animate-fade-in space-y-3">
                  <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div className="p-2.5 bg-amber-800 rounded-xl text-amber-200 shadow-inner">
                        <Scale className="w-5 h-5" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-mono text-xs font-bold text-amber-950 bg-amber-300 px-2 py-0.5 rounded shadow-xs">
                            {activeSimLot.code}
                          </span>
                          <span className="font-serif font-bold text-sm text-white">
                            Tasador Rápido de Prenda: {activeSimLot.name}
                          </span>
                          <span className="text-[10px] font-mono bg-amber-900/90 text-amber-300 px-2 py-0.5 rounded-full border border-amber-700">
                            Cálculo Independiente
                          </span>
                        </div>
                        <p className="text-[11px] text-amber-200/90 font-mono mt-0.5">
                          Tarifa fija exclusiva de este fardo: <strong className="text-amber-300">${activeSimLot.pricePerKg.toLocaleString('es-CL')} / kg</strong> (~${(activeSimLot.pricePerKg / 1000).toFixed(2)}/g)
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 w-full md:w-auto justify-end">
                      <button
                        type="button"
                        onClick={() => setActiveSimLotId(null)}
                        className="text-amber-300 hover:text-white p-1.5 rounded-lg hover:bg-amber-900 transition-colors flex items-center gap-1 text-xs font-mono cursor-pointer"
                      >
                        <X className="w-4 h-4" />
                        <span className="hidden sm:inline">Cerrar Tasador</span>
                      </button>
                    </div>
                  </div>

                  {/* CONTROLES DE GRAMAJE Y PRESETS */}
                  <div className="bg-amber-900/60 p-3 rounded-xl border border-amber-800/80 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-3">
                    <div className="space-y-1.5">
                      <div className="text-[10px] font-mono uppercase tracking-wider text-amber-300/80 font-bold">
                        Pesos Referenciales Rápidos (Presets):
                      </div>
                      <div className="flex flex-wrap gap-1.5">
                        {presets.map((p) => {
                          const isSelected = currentSimWeight === p.weight;
                          return (
                            <button
                              key={p.label}
                              type="button"
                              onClick={() => setSimWeightForLot(activeSimLot.id, p.weight)}
                              className={`px-2.5 py-1 text-[11px] font-mono rounded-lg border transition-all cursor-pointer ${
                                isSelected
                                  ? 'bg-amber-400 text-amber-950 font-bold border-amber-300 shadow-xs'
                                  : 'bg-amber-950/70 text-amber-200 border-amber-800 hover:bg-amber-900 hover:text-white'
                              }`}
                            >
                              {p.label} <span className="opacity-75">({p.weight}g)</span>
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    <div className="flex flex-wrap items-center gap-3 w-full lg:w-auto justify-between lg:justify-end shrink-0 pt-2 lg:pt-0 border-t lg:border-t-0 border-amber-800/60">
                      <div className="flex items-center gap-2">
                        <label className="text-xs font-mono text-amber-200 font-bold">Gramaje exacto:</label>
                        <div className="relative">
                          <input
                            type="number"
                            min="1"
                            step="any"
                            value={currentSimWeight}
                            onChange={(e) => setSimWeightForLot(activeSimLot.id, e.target.value)}
                            className="w-24 p-1.5 bg-amber-950 border border-amber-500 rounded-lg text-xs font-mono font-bold text-white text-right pr-6 focus:ring-1 focus:ring-amber-400 focus:outline-none"
                          />
                          <span className="absolute right-2 top-1/2 -translate-y-1/2 text-[10px] font-mono text-amber-400 font-bold">g</span>
                        </div>
                        <span className="text-xs font-mono text-amber-300">({wKg.toFixed(3)} kg)</span>
                      </div>

                      <div className="bg-amber-950 px-3.5 py-2 rounded-xl border border-emerald-500/50 flex items-center gap-2 shadow-inner">
                        <span className="text-xs font-mono text-amber-200">Costo Base Unitario:</span>
                        <span className="text-base font-mono font-bold text-emerald-400">
                          ${calculatedPrice.toLocaleString('es-CL')} CLP
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="text-[10px] font-mono text-amber-300/80 bg-amber-900/30 px-3 py-1.5 rounded-lg border border-amber-800/40 flex items-center gap-2">
                    <span className="text-amber-400 font-bold">ℹ️ Referencia Independiente:</span>
                    <span>
                      Cada prenda tiene un gramaje individual según su confección. Este tasador calcula el costo orientativo para este fardo específico y no afecta a los demás fardos registrados.
                    </span>
                  </div>
                </div>
              );
            })()}
          </div>
          )}

          {/* BARRA DE PAGINACIÓN DE FARDOS */}
          {totalFardosPages > 1 && (
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2 px-1">
              <span className="text-xs text-bananur-clay-light font-mono">
                Mostrando página <strong className="text-bananur-clay">{fardosPage}</strong> de <strong className="text-bananur-clay">{totalFardosPages}</strong> ({filteredLots.length} fardos totales)
              </span>
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  id="erp-fardos-pagination-prev"
                  disabled={fardosPage <= 1}
                  onClick={() => setFardosPage(prev => Math.max(1, prev - 1))}
                  className="px-3 py-1.5 rounded-xl border border-bananur-sand text-xs font-mono font-bold bg-white hover:bg-bananur-cream text-bananur-clay disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer flex items-center gap-1 shadow-3xs"
                >
                  <ChevronLeft className="w-3.5 h-3.5" />
                  Anterior
                </button>
                <div className="flex items-center gap-1">
                  {Array.from({ length: totalFardosPages }).map((_, pIdx) => {
                    const pageNum = pIdx + 1;
                    return (
                      <button
                        key={pageNum}
                        type="button"
                        onClick={() => setFardosPage(pageNum)}
                        className={`w-8 h-8 rounded-xl text-xs font-mono font-bold transition-all cursor-pointer ${
                          fardosPage === pageNum
                            ? 'bg-amber-800 text-white shadow-xs'
                            : 'bg-white border border-bananur-sand text-bananur-clay hover:bg-bananur-cream'
                        }`}
                      >
                        {pageNum}
                      </button>
                    );
                  })}
                </div>
                <button
                  type="button"
                  id="erp-fardos-pagination-next"
                  disabled={fardosPage >= totalFardosPages}
                  onClick={() => setFardosPage(prev => Math.min(totalFardosPages, prev + 1))}
                  className="px-3 py-1.5 rounded-xl border border-bananur-sand text-xs font-mono font-bold bg-white hover:bg-bananur-cream text-bananur-clay disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer flex items-center gap-1 shadow-3xs"
                >
                  Siguiente
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          )}
        </div>
      )}
        </div>
      )}

      {/* --- PESTAÑA PLM: MANUFACTURING PIPELINE TRACKER --- */}
      {erpTab === 'plm' && (
        <div className="space-y-6 animate-fade-in text-bananur-clay">
          <div>
            <h3 className="font-serif text-lg font-bold text-bananur-clay">Taller de Manufactura de Autor (PLM)</h3>
            <p className="text-xs text-bananur-clay-light">Gestión técnica y avance de cada lote desarrollado de forma 100% individual y artesanal por mí, desde mi mesa de diseño hasta el despacho final.</p>
          </div>

          {/* TARJETAS RESUMEN DE ESTACIONES DE TRABAJO ACTIVAS */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
            {activeWorkstations.map((st) => (
              <div 
                key={st.id}
                className={`bg-white p-4.5 rounded-2xl border transition-all flex flex-col justify-between text-center min-h-[160px] ${
                  selectedWorkstation === st.id || selectedWorkstation === st.type ? 'border-[#B58455] ring-2 ring-[#B58455]/30 shadow-md' : 'border-bananur-sand'
                }`}
              >
                <div className="space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-bold text-bananur-clay block flex items-center justify-center gap-1">
                      <span>{st.name}</span>
                      {st.type === 'impresion3d' && (
                        <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" title="OctoPrint Conectado"></span>
                      )}
                    </span>
                    {selectedWorkstation === 'all' && (
                      <span className="text-[9px] font-mono font-bold bg-emerald-100 text-emerald-800 px-1.5 py-0.5 rounded">En pantalla ✓</span>
                    )}
                    {(selectedWorkstation === st.id || selectedWorkstation === st.type) && (
                      <span className="text-[9px] font-mono font-bold bg-[#B58455] text-white px-1.5 py-0.5 rounded">Enfocada 🔍</span>
                    )}
                  </div>
                  <span className="text-[10px] uppercase font-mono block text-[#B58455] font-bold">{st.badge || st.responsible}</span>
                  <p className="text-[10px] text-bananur-clay-light/60 mt-0.5 line-clamp-2">{st.description}</p>
                </div>
                <button
                  type="button"
                  onClick={() => setSelectedWorkstation(prev => (prev === st.id || prev === st.type) ? 'all' : st.id)}
                  className={`w-full mt-3 py-1.5 px-3 font-mono text-[9px] font-bold uppercase rounded-lg transition-all cursor-pointer ${
                    selectedWorkstation === st.id || selectedWorkstation === st.type
                      ? 'bg-[#B58455] text-white shadow-xs'
                      : 'bg-[#FAF8F5] border border-[#B58455]/35 hover:border-bananur-gold text-[#524742] hover:bg-bananur-gold hover:text-black'
                  }`}
                >
                  {(selectedWorkstation === st.id || selectedWorkstation === st.type) ? 'Mostrando • Ver Todas' : 'Área de Trabajo ⚙️'}
                </button>
              </div>
            ))}

            {/* Capacidad Personal */}
            <div className="bg-white p-4.5 rounded-2xl border border-bananur-sand/80 text-left flex flex-col justify-between min-h-[160px]">
              <div>
                <span className="text-xs font-bold text-bananur-clay block">Mi Capacidad Personal</span>
                <span className="text-[10px] text-bananur-clay-light font-light mt-0.5">Límite para asegurar calidad de autor.</span>
              </div>
              <div>
                <div className="w-full bg-bananur-cream rounded-full h-1.5 mt-2">
                  <div className="bg-bananur-sage h-full rounded-full" style={{ width: '42%' }}></div>
                </div>
                <span className="text-[9px] font-mono text-bananur-clay-light mt-1 block text-right">42% de mi tiempo utilizado</span>
              </div>
            </div>
          </div>

          {/* BARRA DE SELECCIÓN Y FILTRO DE ESTACIONES */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 bg-white/80 p-3 rounded-2xl border border-bananur-sand/80 shadow-3xs">
            <div className="flex items-center gap-2">
              <span className="flex h-2.5 w-2.5 relative">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
              </span>
              <span className="text-xs font-mono font-bold text-bananur-clay">
                Estaciones de Trabajo de Manufactura Artesanal
              </span>
              <span className="text-[10px] font-mono text-emerald-800 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full font-bold">
                {selectedWorkstation === 'all' ? `Mostrando las ${activeWorkstations.length} estaciones activas` : '1 estación enfocada'}
              </span>
            </div>

            <div className="flex flex-wrap items-center gap-1.5">
              <button
                type="button"
                id="btn-station-all"
                onClick={() => setSelectedWorkstation('all')}
                className={`px-3 py-1.5 rounded-xl text-xs font-mono font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                  selectedWorkstation === 'all'
                    ? 'bg-bananur-clay text-white shadow-xs'
                    : 'bg-white border border-bananur-sand text-bananur-clay hover:bg-bananur-cream/60'
                }`}
              >
                <span>🌟 Ver Todas ({activeWorkstations.length})</span>
              </button>

              {activeWorkstations.map(st => (
                <button
                  key={st.id}
                  type="button"
                  id={`btn-station-${st.id}`}
                  onClick={() => setSelectedWorkstation(st.id)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-mono font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                    selectedWorkstation === st.id || selectedWorkstation === st.type
                      ? 'bg-[#B58455] text-white shadow-xs'
                      : 'bg-white border border-bananur-sand text-bananur-clay hover:bg-bananur-cream/60'
                  }`}
                >
                  <span>{st.icon || '⚙️'} {st.name.replace('Estación de ', '').replace('Estación ', '')}</span>
                  {st.type === 'impresion3d' && (
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                  )}
                </button>
              ))}

              {onOpenWorkstationsConfig && (
                <button
                  type="button"
                  onClick={onOpenWorkstationsConfig}
                  className="px-2.5 py-1.5 bg-[#FAF8F5] hover:bg-bananur-sand/50 text-[#B58455] border border-bananur-sand rounded-xl text-xs font-mono font-bold transition-colors cursor-pointer flex items-center gap-1"
                  title="Configurar y activar estaciones de trabajo en el panel administrativo"
                >
                  <SettingsIcon className="w-3.5 h-3.5" />
                  <span>Configurar</span>
                </button>
              )}
            </div>
          </div>

          {/* INTERACTIVE WORKSTATION AREA CONTROL CENTERS */}
          <div id="workstations-container" className="bg-[#FAF8F5] p-6 rounded-3xl border border-[#B58455]/40 space-y-8 animate-scale-up shadow-sm">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 border-b border-[#B58455]/20 pb-4">
              <div className="flex items-center gap-2.5">
                <span className="text-2xl">⚙️</span>
                <div>
                  <h4 className="font-serif text-base font-bold text-bananur-clay uppercase flex items-center gap-2">
                    {selectedWorkstation === 'all' 
                      ? `Estaciones de Manufactura Artesanal (${activeWorkstations.length} Activas)`
                      : (activeWorkstations.find(w => w.id === selectedWorkstation || w.type === selectedWorkstation)?.name || 'Estación de Trabajo')}
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-300 font-bold lowercase">
                      {selectedWorkstation === 'all' ? `${activeWorkstations.length} en pantalla` : 'estación enfocada'}
                    </span>
                  </h4>
                  <p className="text-xs text-bananur-clay-light mt-0.5">
                    {selectedWorkstation === 'all'
                      ? 'Monitorea y calibra todas tus herramientas en tiempo real: Servidor OctoPrint, moldería digital, máquina recta con arrastre de precisión y contadores de tejido.'
                      : 'Herramientas de control directo calibradas para producción unipersonal de autor.'}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                {selectedWorkstation !== 'all' ? (
                  <button
                    type="button"
                    onClick={() => setSelectedWorkstation('all')}
                    className="py-1.5 px-3 bg-white border border-[#B58455] text-bananur-clay hover:bg-bananur-cream/80 text-xs font-bold font-mono rounded-lg transition-colors cursor-pointer flex items-center gap-1 shadow-3xs"
                  >
                    <span>← Ver Todas ({activeWorkstations.length})</span>
                  </button>
                ) : (
                  <span className="text-[11px] font-mono text-[#B58455] font-semibold bg-white/70 px-3 py-1 rounded-lg border border-bananur-sand/60">
                    Modo Completo: {activeWorkstations.length} Estaciones Desplegadas
                  </span>
                )}
              </div>
            </div>

              {/* 1. ESTACIÓN DISEÑO */}
              {(selectedWorkstation === 'all' || selectedWorkstation === 'diseño' || selectedWorkstation === 'diseno' || selectedWorkstation === 'ws-design' || activeWorkstations.some(w => (w.type === 'diseno' || w.type === 'diseño' as any) && (selectedWorkstation === w.id || selectedWorkstation === w.type))) && activeWorkstations.some(w => w.type === 'diseno' || w.type === 'diseño' as any) && (
                <div id="station-diseno" className="space-y-4 bg-white/70 p-5 rounded-2xl border border-bananur-sand/80 shadow-3xs">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-bananur-sand/60 pb-3">
                    <div className="flex items-center gap-2.5">
                      <span className="text-xl">✏️</span>
                      <div>
                        <h5 className="font-serif text-sm font-bold text-bananur-clay uppercase flex items-center gap-2">
                          Estación de Diseño Creativo & Moldería Digital
                          <span className="text-[9px] font-mono bg-amber-100 text-amber-800 px-2 py-0.5 rounded font-bold">
                            MESA DE CORTE DIGITAL 1:1
                          </span>
                        </h5>
                        <p className="text-[11px] text-bananur-clay-light">
                          Trazado de moldería vectorial, preparación de patrones en escala 1:1 y gestor unificado de archivos técnicos para confección.
                        </p>
                      </div>
                    </div>
                    {selectedWorkstation === 'all' ? (
                      <button
                        type="button"
                        onClick={() => setSelectedWorkstation('diseno')}
                        className="self-start sm:self-auto px-2.5 py-1 text-[10px] font-mono font-bold text-[#B58455] hover:text-white bg-white hover:bg-[#B58455] border border-[#B58455]/40 rounded-lg transition-colors cursor-pointer"
                      >
                        Enfocar solo Diseño ↗
                      </button>
                    ) : (
                      <button
                        type="button"
                        onClick={() => setSelectedWorkstation('all')}
                        className="self-start sm:self-auto px-2.5 py-1 text-[10px] font-mono font-bold text-bananur-clay hover:text-white bg-white hover:bg-bananur-clay border border-bananur-sand rounded-lg transition-colors cursor-pointer"
                      >
                        ← Ver todas las estaciones
                      </button>
                    )}
                  </div>

                  {/* GESTOR UNIFICADO DE BOCETOS TÉCNICOS & MOLDERÍA */}
                  <div className="space-y-5">
                    {/* Barra Superior de Creación Directa */}
                    <div className="bg-white p-4.5 rounded-2xl border border-bananur-sand/70 shadow-3xs space-y-3">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-bananur-sand/40 pb-2.5">
                        <div className="flex items-center gap-2">
                          <span className="text-base">📐</span>
                          <div>
                            <h6 className="font-mono text-xs font-bold text-[#B58455] uppercase tracking-wider">
                              Crear & Registrar Nuevo Boceto Técnico
                            </h6>
                            <p className="text-[10px] text-bananur-clay-light">
                              Agrega moldes, patrones o fichas técnicas listos para plotter, corte láser y confección en taller.
                            </p>
                          </div>
                        </div>
                        <span className="text-[10px] font-mono bg-bananur-sand/30 px-2 py-0.5 rounded text-bananur-clay font-semibold">
                          Total en Memoria: {technicalSketches.length} bocetos
                        </span>
                      </div>

                      {/* Formulario Principal de Nuevo Boceto */}
                      <form
                        onSubmit={(e) => {
                          e.preventDefault();
                          handleAddTechnicalSketch();
                        }}
                        className="flex flex-col md:flex-row gap-2.5 items-stretch"
                      >
                        <div className="flex-1 relative">
                          <input
                            type="text"
                            value={sketchNameInput}
                            onChange={(e) => setSketchNameInput(e.target.value)}
                            placeholder="Nombre del boceto o molde (ej. Molde_Bolso_Lona_V2)"
                            className="w-full p-2.5 bg-[#FAF8F5] border border-bananur-sand rounded-xl text-xs text-bananur-clay focus:outline-none focus:ring-1 focus:ring-[#B58455]"
                          />
                        </div>

                        <select
                          value={sketchFormatInput}
                          onChange={(e) => setSketchFormatInput(e.target.value as any)}
                          className="p-2.5 bg-[#FAF8F5] border border-bananur-sand rounded-xl text-xs font-mono text-bananur-clay cursor-pointer"
                        >
                          <option value=".sketch">.sketch (Vectorial Taller)</option>
                          <option value=".dxf">.dxf (CAD Moldería Industrial)</option>
                          <option value=".svg">.svg (Corte Láser / Plotter)</option>
                          <option value=".pdf">.pdf (Patrón 1:1 Imprimible)</option>
                          <option value=".blend">.blend (3D Prototipo Textil)</option>
                        </select>

                        <select
                          value={sketchCategoryInput}
                          onChange={(e) => setSketchCategoryInput(e.target.value as any)}
                          className="p-2.5 bg-[#FAF8F5] border border-bananur-sand rounded-xl text-xs text-bananur-clay cursor-pointer font-medium"
                        >
                          <option value="Patrón de Moldería">Patrón de Moldería</option>
                          <option value="Ficha Técnica">Ficha Técnica</option>
                          <option value="Corte Láser">Corte Láser</option>
                          <option value="Boceto Conceptual">Boceto Conceptual</option>
                          <option value="Prototipo 3D">Prototipo 3D</option>
                        </select>

                        <select
                          value={sketchScaleInput}
                          onChange={(e) => setSketchScaleInput(e.target.value)}
                          className="p-2.5 bg-[#FAF8F5] border border-bananur-sand rounded-xl text-xs text-bananur-clay cursor-pointer font-mono"
                        >
                          <option value="1:1 Real (mm)">Escala 1:1 Real (mm)</option>
                          <option value="1:10 Escala Taller">Escala 1:10 Taller</option>
                          <option value="1:1 Calibrado Plotter">Calibrado Plotter</option>
                        </select>

                        <button
                          type="submit"
                          className="px-4 py-2.5 bg-bananur-clay hover:bg-[#B58455] text-white font-mono text-xs font-bold uppercase rounded-xl transition-all shadow-xs flex items-center justify-center gap-1.5 cursor-pointer shrink-0"
                          title="Guardar y registrar nuevo boceto"
                        >
                          <Plus className="w-4 h-4" />
                          <span>Agregar Boceto</span>
                        </button>
                      </form>

                      {/* Plantillas rápidas sugeridas */}
                      <div className="flex flex-wrap items-center gap-1.5 pt-1 text-[10px] font-mono">
                        <span className="text-bananur-clay-light/70 mr-1">Plantillas rápidas:</span>
                        {[
                          { name: 'Patron_Polera_Oversize', format: '.sketch' as const, cat: 'Patrón de Moldería' as const },
                          { name: 'Molderia_Bolso_Tote_14oz', format: '.dxf' as const, cat: 'Patrón de Moldería' as const },
                          { name: 'Ficha_Tecnica_Pantalon_Wide', format: '.pdf' as const, cat: 'Ficha Técnica' as const },
                          { name: 'Corte_Laser_Apliques_Cuero', format: '.svg' as const, cat: 'Corte Láser' as const },
                        ].map((preset) => (
                          <button
                            key={preset.name}
                            type="button"
                            onClick={() => {
                              setSketchNameInput(preset.name);
                              setSketchFormatInput(preset.format);
                              setSketchCategoryInput(preset.cat);
                            }}
                            className="px-2 py-0.5 bg-[#FAF8F5] hover:bg-bananur-sand/50 text-bananur-clay border border-bananur-sand rounded-lg transition-colors cursor-pointer"
                          >
                            + {preset.name.replace(/_/g, ' ')}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Archivo Unificado de Bocetos Técnicos */}
                    <div className="bg-white p-5 rounded-2xl border border-bananur-sand/70 shadow-3xs space-y-4">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-bananur-sand/40 pb-3">
                        <div>
                          <h6 className="font-bold text-[#B58455] uppercase text-xs tracking-wider flex items-center gap-2">
                            <span>Archivo de Diseños & Bocetos Técnicos</span>
                            <span className="text-[10px] font-mono bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded font-bold">
                              {filteredSketches.length} Archivos
                            </span>
                          </h6>
                          <p className="text-[10px] text-bananur-clay-light">
                            Planos vectoriales, patrones de corte y especificaciones de moldería digital activas.
                          </p>
                        </div>

                        {/* Buscador & Filtros de Formato */}
                        <div className="flex flex-wrap items-center gap-2">
                          <input
                            type="text"
                            value={sketchSearchQuery}
                            onChange={(e) => setSketchSearchQuery(e.target.value)}
                            placeholder="Buscar boceto o molde..."
                            className="p-1.5 px-3 bg-[#FAF8F5] border border-bananur-sand rounded-lg text-xs text-bananur-clay w-44 focus:outline-none"
                          />
                          <div className="flex gap-1">
                            {['all', '.sketch', '.dxf', '.svg', '.pdf'].map(fmt => (
                              <button
                                key={fmt}
                                type="button"
                                onClick={() => setSketchFilterFormat(fmt)}
                                className={`px-2 py-1 rounded-lg text-[10px] font-mono font-bold cursor-pointer transition-colors ${
                                  sketchFilterFormat === fmt
                                    ? 'bg-[#B58455] text-white'
                                    : 'bg-[#FAF8F5] text-bananur-clay hover:bg-bananur-sand/40 border border-bananur-sand/40'
                                }`}
                              >
                                {fmt === 'all' ? 'Todos' : fmt}
                              </button>
                            ))}
                          </div>
                        </div>
                      </div>

                      {/* Cuadrícula de Bocetos */}
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
                        {filteredSketches.map((sketch) => (
                          <div
                            key={sketch.id}
                            className="p-3.5 bg-[#FAF8F5] hover:bg-white border border-bananur-sand/80 rounded-xl transition-all shadow-3xs flex flex-col justify-between space-y-2.5"
                          >
                            <div className="space-y-1.5">
                              <div className="flex items-start justify-between gap-1.5">
                                <span className="font-mono text-xs font-bold text-bananur-clay break-all flex items-center gap-1.5">
                                  <span>{sketch.format === '.dxf' ? '📐' : sketch.format === '.svg' ? '⚡' : sketch.format === '.pdf' ? '📄' : '✏️'}</span>
                                  <span>{sketch.name}</span>
                                </span>
                                <button
                                  type="button"
                                  onClick={() => handleDeleteSketch(sketch.id, sketch.name)}
                                  className="text-red-400 hover:text-red-600 p-1 text-xs cursor-pointer rounded hover:bg-red-50"
                                  title="Eliminar archivo técnico"
                                >
                                  ✕
                                </button>
                              </div>

                              <div className="flex flex-wrap items-center gap-1 text-[9px] font-mono">
                                <span className="bg-amber-100 text-amber-900 px-1.5 py-0.5 rounded font-bold">
                                  {sketch.category}
                                </span>
                                <span className="bg-blue-100 text-blue-800 px-1.5 py-0.5 rounded font-bold">
                                  {sketch.scale}
                                </span>
                                <span className="bg-bananur-sand/40 text-bananur-clay px-1.5 py-0.5 rounded">
                                  {sketch.size}
                                </span>
                              </div>
                            </div>

                            <div className="flex items-center justify-between pt-2 border-t border-bananur-sand/30 text-[10px]">
                              <button
                                type="button"
                                onClick={() => handleToggleSketchStatus(sketch.id)}
                                className={`px-2 py-0.5 rounded font-mono font-bold cursor-pointer transition-colors text-[9px] ${
                                  sketch.status === 'Aprobado para Taller'
                                    ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                                    : sketch.status === 'Listo para Plotter'
                                    ? 'bg-blue-100 text-blue-800 border border-blue-300'
                                    : 'bg-amber-100 text-amber-800 border border-amber-300'
                                }`}
                                title="Clic para alternar estado de aprobación"
                              >
                                {sketch.status} ↻
                              </button>

                              <span className="text-bananur-clay-light/60 font-mono text-[9px]">
                                {sketch.date}
                              </span>
                            </div>
                          </div>
                        ))}

                        {filteredSketches.length === 0 && (
                          <div className="col-span-full py-8 text-center bg-[#FAF8F5] rounded-xl border border-dashed border-bananur-sand text-bananur-clay-light text-xs space-y-1">
                            <span>🔍 No se encontraron bocetos técnicos que coincidan con la búsqueda.</span>
                            <span className="block text-[10px]">Utiliza el formulario superior para crear y registrar uno nuevo.</span>
                          </div>
                        )}
                      </div>

                      {/* Calibración de Mesa Digital */}
                      <div className="p-3 bg-bananur-sand/15 rounded-xl border border-bananur-sand/40 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
                        <div className="flex items-center gap-2">
                          <span className="text-base">📏</span>
                          <span className="text-[11px] text-bananur-clay font-medium">
                            Mesa Vectorial calibrada en <strong className="font-mono text-[#B58455]">Escala 1:1 (300 DPI)</strong> para trazado de piezas sin deformación geométrica.
                          </span>
                        </div>
                        <div className="flex items-center gap-2 self-start sm:self-auto shrink-0">
                          <span className="text-[10px] font-mono text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200 font-bold">
                            Margen Costura: 1.0 cm / 1.5 cm
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* 2. ESTACIÓN IMPRESIÓN 3D & OCTOPRINT */}
              {(selectedWorkstation === 'all' || selectedWorkstation === 'impresion3d' || selectedWorkstation === 'ws-3d' || activeWorkstations.some(w => w.type === 'impresion3d' && (selectedWorkstation === w.id || selectedWorkstation === w.type))) && activeWorkstations.some(w => w.type === 'impresion3d') && (
                <div id="station-impresion3d" className="space-y-4 bg-white/70 p-5 rounded-2xl border border-bananur-sand/80 shadow-3xs">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-bananur-sand/60 pb-3">
                    <div className="flex items-center gap-2.5">
                      <span className="text-xl">🖨️</span>
                      <div>
                        <h5 className="font-serif text-sm font-bold text-bananur-clay uppercase flex items-center gap-2">
                          Estación de Impresión 3D con Servidor OctoPrint
                          <span className="text-[9px] font-mono bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded font-bold">
                            CALIBRACIÓN & G-CODE ACTIVA
                          </span>
                        </h5>
                        <p className="text-[11px] text-bananur-clay-light">
                          Servidor OctoPrint conectado para control de temperaturas Marlin, calibración por pasos, nivelación y terminal G-code.
                        </p>
                      </div>
                    </div>
                    {selectedWorkstation === 'all' ? (
                      <button
                        type="button"
                        onClick={() => setSelectedWorkstation('impresion3d')}
                        className="self-start sm:self-auto px-2.5 py-1 text-[10px] font-mono font-bold text-[#B58455] hover:text-white bg-white hover:bg-[#B58455] border border-[#B58455]/40 rounded-lg transition-colors cursor-pointer"
                      >
                        Enfocar solo Impresión 3D ↗
                      </button>
                    ) : (
                      <button
                        type="button"
                        onClick={() => setSelectedWorkstation('all')}
                        className="self-start sm:self-auto px-2.5 py-1 text-[10px] font-mono font-bold text-bananur-clay hover:text-white bg-white hover:bg-bananur-clay border border-bananur-sand rounded-lg transition-colors cursor-pointer"
                      >
                        ← Ver todas las estaciones
                      </button>
                    )}
                  </div>
                <div className="space-y-4">
                  {/* OctoPrint Status Bar */}
                  <div className="bg-white p-3 rounded-xl border border-bananur-sand/70 flex flex-wrap items-center justify-between gap-3 shadow-3xs text-xs">
                    <div className="flex items-center gap-2">
                      <span className="flex h-2.5 w-2.5 relative">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
                      </span>
                      <div>
                        <span className="font-mono font-bold text-bananur-clay text-xs flex items-center gap-1.5">
                          <Wifi className="w-3.5 h-3.5 text-emerald-600" />
                          OctoPrint Daemon: {octoConfig.url}
                        </span>
                        <span className="text-[10px] text-bananur-clay-light block">
                          Estado: <strong className="text-emerald-700 font-mono font-bold">{octoConfig.state}</strong> • Boquilla: <span className="font-mono font-bold text-red-600">{extruderTemp}°C</span> • Cama: <span className="font-mono font-bold text-[#B58455]">{bedTemp}°C</span>
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => setShowOctoSettings(prev => !prev)}
                        className="px-2.5 py-1.5 bg-bananur-cream/60 hover:bg-bananur-sand/50 text-bananur-clay border border-bananur-sand rounded-lg text-xs font-mono font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
                        title="Configurar URL y API Key de OctoPrint"
                      >
                        <SettingsIcon className="w-3.5 h-3.5 text-[#B58455]" />
                        <span>Ajustes Conexión</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => handleExecuteOctoCommand('emergencyStop', OCTOPRINT_CALIBRATION_ACTIONS.emergencyStop.command, OCTOPRINT_CALIBRATION_ACTIONS.emergencyStop.name)}
                        className="px-3 py-1.5 bg-rose-600 hover:bg-rose-700 text-white rounded-lg text-xs font-mono font-bold flex items-center gap-1 shadow-xs transition-colors cursor-pointer"
                        title="Envía M112 para apagar calentadores y motores de inmediato"
                      >
                        <AlertTriangle className="w-3.5 h-3.5" />
                        <span>M112 Stop</span>
                      </button>
                    </div>
                  </div>

                  {/* OctoPrint Settings Panel (collapsible) */}
                  {showOctoSettings && (
                    <div className="bg-amber-50/70 border border-amber-300 rounded-xl p-4 animate-scale-up space-y-3 text-xs">
                      <div className="flex items-center justify-between border-b border-amber-200 pb-2">
                        <span className="font-mono font-bold text-amber-950 flex items-center gap-1.5">
                          <SettingsIcon className="w-4 h-4 text-amber-700" />
                          Configuración del Servidor OctoPrint / Klipper
                        </span>
                        <button
                          type="button"
                          onClick={() => setShowOctoSettings(false)}
                          className="text-amber-800 hover:text-amber-950 font-mono font-bold text-xs"
                        >
                          ✕ Cerrar
                        </button>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div>
                          <label className="block text-[10px] font-mono uppercase text-amber-900 font-bold mb-1">
                            URL del Daemon OctoPrint (Host / IP)
                          </label>
                          <input
                            type="text"
                            value={octoConfig.url}
                            onChange={(e) => setOctoConfig(prev => ({ ...prev, url: e.target.value }))}
                            placeholder="http://octopi.local:5000 o http://192.168.1.100:5000"
                            className="w-full p-2 bg-white border border-amber-300 rounded-lg text-xs font-mono text-bananur-clay"
                          />
                        </div>
                        <div>
                          <label className="block text-[10px] font-mono uppercase text-amber-900 font-bold mb-1">
                            API Key de OctoPrint (X-Api-Key)
                          </label>
                          <input
                            type="password"
                            value={octoConfig.apiKey}
                            onChange={(e) => setOctoConfig(prev => ({ ...prev, apiKey: e.target.value }))}
                            placeholder="Ej. OCTO-BANANUR-KEY..."
                            className="w-full p-2 bg-white border border-amber-300 rounded-lg text-xs font-mono text-bananur-clay"
                          />
                        </div>
                      </div>

                      <div className="flex justify-end gap-2 pt-1">
                        <button
                          type="button"
                          onClick={() => {
                            saveOctoPrintConfig(octoConfig);
                            setPrinterLog(prev => [...prev, `[SYSTEM]: Configuración guardada para ${octoConfig.url}`]);
                            onShowToast?.('Configuración Guardada', 'Se actualizaron los parámetros de red de OctoPrint.', 'success');
                            setShowOctoSettings(false);
                          }}
                          className="px-3 py-1.5 bg-bananur-clay hover:bg-bananur-gold hover:text-bananur-clay text-white rounded-lg text-xs font-bold transition-all cursor-pointer"
                        >
                          Guardar Parámetros
                        </button>
                      </div>
                    </div>
                  )}

                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 text-xs">
                    {/* PANEL 1: SENSORES TÉRMICOS & PRESETS */}
                    <div className="space-y-4 bg-white p-4.5 rounded-xl border border-bananur-sand/55 flex flex-col justify-between shadow-3xs">
                      <div>
                        <div className="flex items-center justify-between border-b border-bananur-sand/40 pb-2 mb-3">
                          <h5 className="font-bold text-[#B58455] uppercase text-[10px] tracking-wider flex items-center gap-1.5">
                            <Flame className="w-3.5 h-3.5 text-rose-500" />
                            Control Térmico (Nozzle & Bed)
                          </h5>
                          <span className="text-[10px] font-mono font-bold text-bananur-clay-light">M104 / M140</span>
                        </div>

                        <div className="space-y-3">
                          <div>
                            <div className="flex justify-between font-mono text-[10px] mb-1 text-bananur-clay">
                              <span>Boquilla (Nozzle):</span>
                              <span className="font-bold text-red-600">{extruderTemp}°C / 250°C</span>
                            </div>
                            <input
                              type="range"
                              min="0"
                              max="260"
                              value={extruderTemp}
                              onChange={(e) => setExtruderTemp(Number(e.target.value))}
                              className="w-full accent-red-600 cursor-pointer"
                            />
                          </div>

                          <div>
                            <div className="flex justify-between font-mono text-[10px] mb-1 text-bananur-clay">
                              <span>Cama Caliente (Bed):</span>
                              <span className="font-bold text-[#B58455]">{bedTemp}°C / 90°C</span>
                            </div>
                            <input
                              type="range"
                              min="0"
                              max="100"
                              value={bedTemp}
                              onChange={(e) => setBedTemp(Number(e.target.value))}
                              className="w-full accent-[#B58455] cursor-pointer"
                            />
                          </div>
                        </div>

                        {/* Presets rápidos de calentamiento */}
                        <div className="mt-4 pt-3 border-t border-bananur-sand/40 space-y-2">
                          <span className="block text-[9px] font-mono uppercase text-bananur-clay-light/80 font-bold">
                            Perfiles Térmicos Rápidos:
                          </span>
                          <div className="grid grid-cols-3 gap-1.5 font-mono text-[10px]">
                            <button
                              type="button"
                              onClick={() => {
                                setExtruderTemp(210);
                                setBedTemp(60);
                                handleExecuteOctoCommand('heatPLA', ['M104 S210', 'M140 S60'], 'Precalentar PLA');
                              }}
                              className="p-1.5 bg-bananur-cream/50 hover:bg-[#B58455] hover:text-white border border-bananur-sand rounded-lg text-center transition-all cursor-pointer font-bold"
                            >
                              PLA 210°
                            </button>
                            <button
                              type="button"
                              onClick={() => {
                                setExtruderTemp(235);
                                setBedTemp(75);
                                handleExecuteOctoCommand('heatPETG', ['M104 S235', 'M140 S75'], 'Precalentar PETG');
                              }}
                              className="p-1.5 bg-bananur-cream/50 hover:bg-[#B58455] hover:text-white border border-bananur-sand rounded-lg text-center transition-all cursor-pointer font-bold"
                            >
                              PETG 235°
                            </button>
                            <button
                              type="button"
                              onClick={() => {
                                setExtruderTemp(0);
                                setBedTemp(0);
                                handleExecuteOctoCommand('cool', ['M104 S0', 'M140 S0'], 'Enfriar Impresora');
                              }}
                              className="p-1.5 bg-rose-50 hover:bg-rose-600 hover:text-white text-rose-700 border border-rose-200 rounded-lg text-center transition-all cursor-pointer font-bold"
                            >
                              Enfriar 0°
                            </button>
                          </div>
                        </div>
                      </div>

                      <div className="pt-2">
                        <label className="block text-[9px] font-mono uppercase text-bananur-clay-light/80 mb-1">Tipo de Filamento Cargado</label>
                        <select
                          value={filamentType}
                          onChange={(e) => {
                            setFilamentType(e.target.value);
                            setPrinterLog(prev => [...prev, `[SYSTEM]: Filamento configurado a ${e.target.value}`]);
                            onShowToast?.('Filamento Sincronizado', `Parámetros actualizados para ${e.target.value}.`, 'success');
                          }}
                          className="w-full p-2 bg-[#FAF8F5] border border-bananur-sand rounded-lg cursor-pointer font-mono text-[10px] text-bananur-clay"
                        >
                          <option value="PLA ecológico">PLA Ecológico (Biodegradable)</option>
                          <option value="PETG Industrial">PETG Reciclado Industrial</option>
                          <option value="TPU Flexible">TPU Flexible Avanzado</option>
                        </select>
                      </div>
                    </div>

                    {/* PANEL 2: SUITE DE CALIBRACIÓN COMPLETA */}
                    <div className="space-y-3 bg-white p-4.5 rounded-xl border border-bananur-sand/55 flex flex-col justify-between shadow-3xs">
                      <div>
                        <div className="flex items-center justify-between border-b border-bananur-sand/40 pb-2 mb-2">
                          <h5 className="font-bold text-[#B58455] uppercase text-[10px] tracking-wider flex items-center gap-1.5">
                            <Wrench className="w-3.5 h-3.5 text-[#B58455]" />
                            Suite Calibración OctoPrint
                          </h5>
                          {octoLoadingCmd && (
                            <span className="text-[9px] text-amber-700 bg-amber-100 px-2 py-0.5 rounded font-mono animate-pulse">
                              Enviando...
                            </span>
                          )}
                        </div>

                        {/* Homing & Axes */}
                        <div className="space-y-1.5 mb-3">
                          <span className="text-[9px] font-mono uppercase text-bananur-clay-light/80 block font-bold">
                            1. Autohome & Alineación de Ejes:
                          </span>
                          <div className="grid grid-cols-2 gap-1.5 font-mono text-[10px]">
                            <button
                              type="button"
                              disabled={isCalibrating}
                              onClick={() => handleExecuteOctoCommand('homeAll', OCTOPRINT_CALIBRATION_ACTIONS.homeAll.command, OCTOPRINT_CALIBRATION_ACTIONS.homeAll.name)}
                              className="p-1.5 bg-bananur-cream/40 hover:bg-[#B58455] hover:text-white border border-bananur-sand rounded-lg transition-all text-left font-bold disabled:opacity-50 cursor-pointer"
                              title={OCTOPRINT_CALIBRATION_ACTIONS.homeAll.desc}
                            >
                              📍 Home Todo (G28)
                            </button>
                            <button
                              type="button"
                              disabled={isCalibrating}
                              onClick={() => handleExecuteOctoCommand('bedLeveling', OCTOPRINT_CALIBRATION_ACTIONS.bedLeveling.command, OCTOPRINT_CALIBRATION_ACTIONS.bedLeveling.name)}
                              className="p-1.5 bg-bananur-cream/40 hover:bg-[#B58455] hover:text-white border border-bananur-sand rounded-lg transition-all text-left font-bold disabled:opacity-50 cursor-pointer"
                              title={OCTOPRINT_CALIBRATION_ACTIONS.bedLeveling.desc}
                            >
                              📐 Auto-Nivelar (G29)
                            </button>
                          </div>
                        </div>

                        {/* Z-Offset Babystepping */}
                        <div className="space-y-1.5 mb-3">
                          <span className="text-[9px] font-mono uppercase text-bananur-clay-light/80 block font-bold">
                            2. Micro-Ajuste Z-Offset (Babystepping):
                          </span>
                          <div className="grid grid-cols-3 gap-1.5 font-mono text-[10px]">
                            <button
                              type="button"
                              disabled={isCalibrating}
                              onClick={() => handleExecuteOctoCommand('zPlus', OCTOPRINT_CALIBRATION_ACTIONS.zPlus.command, OCTOPRINT_CALIBRATION_ACTIONS.zPlus.name)}
                              className="p-1.5 bg-white hover:bg-bananur-cream border border-bananur-sand rounded-lg transition-all text-center font-bold disabled:opacity-50 cursor-pointer"
                              title={OCTOPRINT_CALIBRATION_ACTIONS.zPlus.desc}
                            >
                              Z+ 0.05mm
                            </button>
                            <button
                              type="button"
                              disabled={isCalibrating}
                              onClick={() => handleExecuteOctoCommand('zMinus', OCTOPRINT_CALIBRATION_ACTIONS.zMinus.command, OCTOPRINT_CALIBRATION_ACTIONS.zMinus.name)}
                              className="p-1.5 bg-white hover:bg-bananur-cream border border-bananur-sand rounded-lg transition-all text-center font-bold disabled:opacity-50 cursor-pointer"
                              title={OCTOPRINT_CALIBRATION_ACTIONS.zMinus.desc}
                            >
                              Z- 0.05mm
                            </button>
                            <button
                              type="button"
                              disabled={isCalibrating}
                              onClick={() => handleExecuteOctoCommand('saveEEPROM', OCTOPRINT_CALIBRATION_ACTIONS.saveEEPROM.command, OCTOPRINT_CALIBRATION_ACTIONS.saveEEPROM.name)}
                              className="p-1.5 bg-bananur-cream/60 hover:bg-emerald-600 hover:text-white border border-bananur-sand rounded-lg transition-all text-center font-bold disabled:opacity-50 cursor-pointer text-emerald-800"
                              title={OCTOPRINT_CALIBRATION_ACTIONS.saveEEPROM.desc}
                            >
                              Guardar M500
                            </button>
                          </div>
                        </div>

                        {/* Extrusión & Carga */}
                        <div className="space-y-1.5">
                          <span className="text-[9px] font-mono uppercase text-bananur-clay-light/80 block font-bold">
                            3. Control de Extrusor & Flujo:
                          </span>
                          <div className="grid grid-cols-3 gap-1.5 font-mono text-[10px]">
                            <button
                              type="button"
                              disabled={isCalibrating}
                              onClick={() => handleExecuteOctoCommand('extrude5', OCTOPRINT_CALIBRATION_ACTIONS.extrude5.command, OCTOPRINT_CALIBRATION_ACTIONS.extrude5.name)}
                              className="p-1.5 bg-white hover:bg-bananur-cream border border-bananur-sand rounded-lg transition-all text-center font-medium disabled:opacity-50 cursor-pointer"
                              title={OCTOPRINT_CALIBRATION_ACTIONS.extrude5.desc}
                            >
                              Purgar 5mm
                            </button>
                            <button
                              type="button"
                              disabled={isCalibrating}
                              onClick={() => handleExecuteOctoCommand('extrude15', OCTOPRINT_CALIBRATION_ACTIONS.extrude15.command, OCTOPRINT_CALIBRATION_ACTIONS.extrude15.name)}
                              className="p-1.5 bg-white hover:bg-bananur-cream border border-bananur-sand rounded-lg transition-all text-center font-medium disabled:opacity-50 cursor-pointer"
                              title={OCTOPRINT_CALIBRATION_ACTIONS.extrude15.desc}
                            >
                              Cargar 15mm
                            </button>
                            <button
                              type="button"
                              disabled={isCalibrating}
                              onClick={() => handleExecuteOctoCommand('retract10', OCTOPRINT_CALIBRATION_ACTIONS.retract10.command, OCTOPRINT_CALIBRATION_ACTIONS.retract10.name)}
                              className="p-1.5 bg-white hover:bg-bananur-cream border border-bananur-sand rounded-lg transition-all text-center font-medium disabled:opacity-50 cursor-pointer"
                              title={OCTOPRINT_CALIBRATION_ACTIONS.retract10.desc}
                            >
                              Retraer 10mm
                            </button>
                          </div>
                        </div>
                      </div>

                      <div className="pt-2 border-t border-bananur-sand/30 flex justify-between items-center text-[10px] font-mono text-bananur-clay-light">
                        <span>Autotune PID:</span>
                        <div className="flex gap-1.5">
                          <button
                            type="button"
                            disabled={isCalibrating}
                            onClick={() => handleExecuteOctoCommand('pidHotend', OCTOPRINT_CALIBRATION_ACTIONS.pidHotend.command, OCTOPRINT_CALIBRATION_ACTIONS.pidHotend.name)}
                            className="px-2 py-0.5 bg-bananur-sand/30 hover:bg-bananur-sand text-bananur-clay rounded font-bold cursor-pointer"
                          >
                            Hotend (M303)
                          </button>
                          <button
                            type="button"
                            disabled={isCalibrating}
                            onClick={() => handleExecuteOctoCommand('loadMesh', OCTOPRINT_CALIBRATION_ACTIONS.loadMesh.command, OCTOPRINT_CALIBRATION_ACTIONS.loadMesh.name)}
                            className="px-2 py-0.5 bg-bananur-sand/30 hover:bg-bananur-sand text-bananur-clay rounded font-bold cursor-pointer"
                          >
                            Malla (M420)
                          </button>
                        </div>
                      </div>
                    </div>

                    {/* PANEL 3: CMD CONSOLE TERMINAL & ENTRADA G-CODE */}
                    <div className="space-y-2 bg-[#121110] text-[#5AF85A] p-4.5 rounded-xl font-mono text-[9px] flex flex-col justify-between shadow-md border border-neutral-800">
                      <div>
                        <div className="flex justify-between items-center border-b border-white/15 pb-1 text-[8px] text-white/60 mb-2">
                          <span className="flex items-center gap-1 font-bold">
                            <Terminal className="w-3 h-3 text-[#5AF85A]" />
                            CONSOLA OCTOPRINT / KLIPPER
                          </span>
                          <div className="flex items-center gap-2">
                            <span className="px-1.5 py-0.2 bg-emerald-950 text-[#5AF85A] border border-emerald-800 rounded font-bold">
                              BUFFER ONLINE
                            </span>
                            <button
                              type="button"
                              onClick={() => setPrinterLog([`[SYSTEM]: Consola reiniciada a las ${new Date().toLocaleTimeString('es-CL')}`])}
                              className="text-white/40 hover:text-white cursor-pointer"
                              title="Limpiar Consola"
                            >
                              Limpiar
                            </button>
                          </div>
                        </div>

                        <div className="space-y-1 max-h-[140px] overflow-y-auto pr-1 scrollbar-hidden">
                          {printerLog.map((log, i) => (
                            <p key={i} className="leading-relaxed break-all font-mono opacity-90">{log}</p>
                          ))}
                        </div>
                      </div>

                      {/* G-Code Command Input Form */}
                      <form onSubmit={handleSendCustomGcode} className="pt-2 border-t border-white/10 space-y-1.5">
                        <div className="flex gap-1.5">
                          <input
                            type="text"
                            value={customGcode}
                            onChange={(e) => setCustomGcode(e.target.value)}
                            placeholder="Comando G-Code (Ej. G28, M105, M503)..."
                            className="flex-1 bg-black/80 border border-white/20 rounded px-2 py-1.5 text-[10px] text-emerald-300 font-mono focus:outline-none focus:border-[#5AF85A]"
                          />
                          <button
                            type="submit"
                            disabled={!customGcode.trim() || isCalibrating}
                            className="px-2.5 py-1.5 bg-[#5AF85A] text-black hover:bg-emerald-400 font-mono font-bold text-[10px] rounded transition-colors disabled:opacity-40 cursor-pointer shrink-0"
                          >
                            Enviar
                          </button>
                        </div>
                        <div className="flex flex-wrap gap-1 text-[8px] text-white/50">
                          <span>Sugeridos:</span>
                          {['M105', 'G28', 'M503', 'M114', 'M420 S1'].map(cmd => (
                            <button
                              key={cmd}
                              type="button"
                              onClick={() => setCustomGcode(cmd)}
                              className="px-1 bg-white/10 hover:bg-white/20 rounded text-white/80 cursor-pointer"
                            >
                              {cmd}
                            </button>
                          ))}
                        </div>
                      </form>
                    </div>
                  </div>
                </div>
              </div>
              )}

              {/* 3. ESTACIÓN COSTURA FINA */}
              {(selectedWorkstation === 'all' || selectedWorkstation === 'costura' || selectedWorkstation === 'ws-sewing' || activeWorkstations.some(w => w.type === 'costura' && (selectedWorkstation === w.id || selectedWorkstation === w.type))) && activeWorkstations.some(w => w.type === 'costura') && (
                <div id="station-costura" className="space-y-4 bg-white/70 p-5 rounded-2xl border border-bananur-sand/80 shadow-3xs">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-bananur-sand/60 pb-3">
                    <div className="flex items-center gap-2.5">
                      <span className="text-xl">🧵</span>
                      <div>
                        <h5 className="font-serif text-sm font-bold text-bananur-clay uppercase flex items-center gap-2">
                          Estación de Costura Fina & Moldería Industrial
                          <span className="text-[9px] font-mono bg-blue-100 text-blue-800 px-2 py-0.5 rounded font-bold">
                            JUKI DDL-8700 • LONA 14OZ & ALGODÓN
                          </span>
                        </h5>
                        <p className="text-[11px] text-bananur-clay-light">
                          Calibración milimétrica de arrastre, prensatelas técnicos de taller, control de merma textil y bitácora de mantenimiento de máquina.
                        </p>
                      </div>
                    </div>
                    {selectedWorkstation === 'all' ? (
                      <button
                        type="button"
                        onClick={() => setSelectedWorkstation('costura')}
                        className="self-start sm:self-auto px-2.5 py-1 text-[10px] font-mono font-bold text-[#B58455] hover:text-white bg-white hover:bg-[#B58455] border border-[#B58455]/40 rounded-lg transition-colors cursor-pointer"
                      >
                        Enfocar solo Costura ↗
                      </button>
                    ) : (
                      <button
                        type="button"
                        onClick={() => setSelectedWorkstation('all')}
                        className="self-start sm:self-auto px-2.5 py-1 text-[10px] font-mono font-bold text-bananur-clay hover:text-white bg-white hover:bg-bananur-clay border border-bananur-sand rounded-lg transition-colors cursor-pointer"
                      >
                        ← Ver todas las estaciones
                      </button>
                    )}
                  </div>

                  {/* HERRAMIENTAS REALES DE SASTRERÍA Y COSTURA */}
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 text-xs">
                    
                    {/* 1. Calibración Fina de Puntada & Arrastre */}
                    <div className="space-y-3 bg-white p-4.5 rounded-xl border border-bananur-sand/55 flex flex-col justify-between">
                      <div>
                        <div className="flex items-center justify-between border-b border-bananur-sand/40 pb-2 mb-3">
                          <h6 className="font-bold text-[#B58455] uppercase text-[10px] tracking-wider flex items-center gap-1.5">
                            <span>⚙️</span>
                            <span>Ajuste de Máquina Recta</span>
                          </h6>
                          <span className="text-[9px] font-mono bg-blue-50 text-blue-700 px-1.5 py-0.5 rounded font-bold">
                            Servomotor Directo
                          </span>
                        </div>

                        <div className="space-y-3.5">
                          {/* Largo de puntada */}
                          <div>
                            <div className="flex justify-between font-mono text-[10px] mb-1 text-bananur-clay">
                              <span>Largo de Puntada:</span>
                              <span className="font-bold text-[#B58455]">{stitchLength}</span>
                            </div>
                            <select
                              value={stitchLength}
                              onChange={(e) => {
                                setStitchLength(e.target.value);
                                onShowToast?.('Largo de Puntada Calibrado', `Largo fijado a: ${e.target.value}`, 'info');
                              }}
                              className="w-full p-2 bg-[#FAF8F5] border border-bananur-sand rounded-lg text-xs font-semibold text-bananur-clay cursor-pointer"
                            >
                              <option value="1.5 mm (Costura de Seguridad / Curvas)">1.5 mm (Costura de Seguridad / Curvas cerradas)</option>
                              <option value="2.5 mm (Pespunte Estándar Confección)">2.5 mm (Pespunte Estándar Confección Fina)</option>
                              <option value="3.0 mm (Pespunte de Carga Lona)">3.0 mm (Pespunte de Carga Lona 14oz)</option>
                              <option value="4.0 mm (Costura Reforzada Exterior)">4.0 mm (Costura Reforzada Exterior / Canvas)</option>
                              <option value="5.0 mm (Hilván de Montaje & Frunce)">5.0 mm (Hilván de Montaje & Frunce)</option>
                            </select>
                          </div>

                          {/* Tensión hilo superior */}
                          <div>
                            <div className="flex justify-between font-mono text-[10px] mb-1 text-bananur-clay">
                              <span>Tensión Hilo Superior:</span>
                              <span className="font-bold text-[#B58455]">{threadTension} / 9.0</span>
                            </div>
                            <input
                              type="range"
                              min="1"
                              max="9"
                              step="0.1"
                              value={threadTension}
                              onChange={(e) => setThreadTension(Number(e.target.value))}
                              className="w-full accent-[#B58455] cursor-pointer"
                            />
                            <div className="flex justify-between text-[8px] font-mono text-bananur-clay-light">
                              <span>1.0 Suelto</span>
                              <span className="text-emerald-700 font-bold">4.0-5.0 Óptimo Lona</span>
                              <span>9.0 Tenso</span>
                            </div>
                          </div>

                          {/* Tipo de Aguja */}
                          <div>
                            <label className="block text-[9px] font-mono uppercase text-bananur-clay-light/80 mb-1">
                              Aguja Industrial Instalada
                            </label>
                            <select
                              value={needleType}
                              onChange={(e) => {
                                setNeedleType(e.target.value);
                                onShowToast?.('Aguja Cambiada', `Se calibró la máquina para usar aguja ${e.target.value}.`, 'info');
                              }}
                              className="w-full p-2 bg-[#FAF8F5] border border-bananur-sand rounded-lg cursor-pointer font-semibold text-bananur-clay text-xs"
                            >
                              <option value="Universal 90/14 (Lona y Algodón)">Universal 90/14 (Lona y Algodón)</option>
                              <option value="Denim 100/16 (Telas Gruesas y Canvas)">Denim 100/16 (Telas Gruesas y Canvas)</option>
                              <option value="Microtex 80/12 (Fibras finas y Seda)">Microtex 80/12 (Fibras finas y Seda)</option>
                              <option value="Ballpoint 90/14 (Punto y Elásticos)">Ballpoint 90/14 (Punto y Elásticos)</option>
                              <option value="Leather 110/18 (Cuero y Lonas Tratadas)">Leather 110/18 (Cuero y Lonas Tratadas)</option>
                            </select>
                          </div>
                        </div>
                      </div>

                      {/* Remate Automático & Presión */}
                      <div className="pt-2 border-t border-bananur-sand/30 flex items-center justify-between">
                        <button
                          type="button"
                          onClick={() => {
                            setAutoBackstitch(!autoBackstitch);
                            onShowToast?.('Remate Automático', `Remate de inicio/fin: ${!autoBackstitch ? 'ACTIVADO ✓' : 'DESACTIVADO'}`, 'info');
                          }}
                          className={`px-2.5 py-1 rounded-lg text-[10px] font-mono font-bold transition-all border cursor-pointer ${
                            autoBackstitch
                              ? 'bg-emerald-50 text-emerald-800 border-emerald-300'
                              : 'bg-gray-100 text-gray-600 border-gray-300'
                          }`}
                        >
                          Remate Automático: {autoBackstitch ? 'Activado ✓' : 'Manual'}
                        </button>
                        <span className="text-[9px] font-mono text-bananur-clay-light">
                          Presión: 3.5 kg
                        </span>
                      </div>
                    </div>

                    {/* 2. Selector de Prensatelas Profesionales */}
                    <div className="space-y-3 bg-white p-4.5 rounded-xl border border-bananur-sand/55 flex flex-col justify-between">
                      <div>
                        <div className="flex items-center justify-between border-b border-bananur-sand/40 pb-2 mb-3">
                          <h6 className="font-bold text-[#B58455] uppercase text-[10px] tracking-wider flex items-center gap-1.5">
                            <span>🔩</span>
                            <span>Prensatelas de Atelier & Confección</span>
                          </h6>
                          <span className="text-[9px] font-mono bg-amber-50 text-amber-800 px-1.5 py-0.5 rounded font-bold">
                            Herrajes
                          </span>
                        </div>

                        <p className="text-[10px] text-bananur-clay-light mb-2.5">
                          Selecciona el prensatelas montado en la barra para evitar frenado en materiales técnicos.
                        </p>

                        <div className="space-y-1.5 max-h-[220px] overflow-y-auto pr-1">
                          {[
                            { name: 'Prensatelas Estándar de Acero', desc: 'Costuras rectas generales y uniones simples', icon: '🪡' },
                            { name: 'Prensatelas de Teflón Antiadherente', desc: 'Lonas resinadas, eco-cuero y vinilos impermeables', icon: '🛡️' },
                            { name: 'Prensatelas de Doble Arrastre / Walking Foot', desc: 'Multicapas pesadas, acolchados y telas deslizantes', icon: '👟' },
                            { name: 'Prensatelas de Cierre Invisible', desc: 'Inserción al ras de cremalleras sin holgura', icon: '🤐' },
                            { name: 'Pespunte de Compensación 1/16"', desc: 'Guía de borde para sobrepespuntes rectos y paralelos', icon: '📐' },
                            { name: 'Prensatelas de Rodillo de Rodamiento', desc: 'Pieles gruesas, toldos y telas náuticas plastificadas', icon: '🎡' }
                          ].map((foot) => (
                            <button
                              key={foot.name}
                              type="button"
                              onClick={() => {
                                setPresserFoot(foot.name);
                                onShowToast?.('Prensatelas Configurado', `Máquina montada con: ${foot.name}`, 'success');
                              }}
                              className={`w-full text-left p-2 rounded-lg border text-xs flex items-center justify-between transition-all cursor-pointer ${
                                presserFoot === foot.name
                                  ? 'border-[#B58455] bg-bananur-cream/40 font-bold text-bananur-clay shadow-3xs ring-1 ring-[#B58455]/20'
                                  : 'border-bananur-sand/40 hover:bg-bananur-sand/20 text-bananur-clay'
                              }`}
                            >
                              <div className="space-y-0.5">
                                <span className="flex items-center gap-1.5 text-[11px]">
                                  <span>{foot.icon}</span>
                                  <span>{foot.name}</span>
                                </span>
                                <span className="text-[9px] text-bananur-clay-light block">{foot.desc}</span>
                              </div>
                              {presserFoot === foot.name && (
                                <span className="font-mono text-[9px] text-[#B58455] font-bold">✓ Montado</span>
                              )}
                            </button>
                          ))}
                        </div>
                      </div>

                      <div className="pt-2 border-t border-bananur-sand/30 text-[9px] font-mono text-bananur-clay-light flex items-center justify-between">
                        <span>Prensador Activo:</span>
                        <span className="font-bold text-[#B58455] truncate max-w-[150px]">{presserFoot}</span>
                      </div>
                    </div>

                    {/* 3. Bitácora de Mantenimiento & Control Textil */}
                    <div className="space-y-3 bg-white p-4.5 rounded-xl border border-bananur-sand/55 flex flex-col justify-between">
                      <div>
                        <div className="flex items-center justify-between border-b border-bananur-sand/40 pb-2 mb-3">
                          <h6 className="font-bold text-[#B58455] uppercase text-[10px] tracking-wider flex items-center gap-1.5">
                            <span>🛠️</span>
                            <span>Mantenimiento & Horas de Aguja</span>
                          </h6>
                          <span className={`text-[9px] font-mono px-1.5 py-0.5 rounded font-bold ${
                            needleHours > 7 ? 'bg-amber-100 text-amber-800' : 'bg-emerald-100 text-emerald-800'
                          }`}>
                            {needleHours > 7 ? 'Cambio Sugerido' : 'En Norma'}
                          </span>
                        </div>

                        {/* Contador de horas de perforación */}
                        <div className="p-3 bg-[#FAF8F5] rounded-xl border border-bananur-sand/60 space-y-2">
                          <div className="flex justify-between items-center text-xs font-mono">
                            <span className="text-bananur-clay">Horas de Costura de Aguja:</span>
                            <span className="font-bold text-sm text-[#B58455]">{needleHours} hrs / 8.0 hrs</span>
                          </div>
                          
                          {/* Progress bar */}
                          <div className="w-full bg-bananur-sand/30 h-2 rounded-full overflow-hidden">
                            <div
                              className={`h-full transition-all ${
                                needleHours > 7 ? 'bg-amber-500' : 'bg-emerald-500'
                              }`}
                              style={{ width: `${Math.min(100, (needleHours / 8.0) * 100)}%` }}
                            ></div>
                          </div>

                          <div className="flex items-center justify-between pt-1">
                            <span className="text-[9px] text-bananur-clay-light">
                              {needleHours > 7 ? '⚠️ Punta con micro-desgaste' : '✓ Perforación limpia de fibras'}
                            </span>
                            <button
                              type="button"
                              onClick={handleResetNeedleHours}
                              className="px-2 py-0.5 bg-bananur-clay hover:bg-[#B58455] text-white rounded text-[9px] font-mono font-bold transition-colors cursor-pointer"
                            >
                              Reset Aguja Nueva
                            </button>
                          </div>
                        </div>

                        {/* Chequeos de Lubricación & Garfio */}
                        <div className="mt-3 space-y-2 text-xs">
                          <div className="flex items-center justify-between p-2 bg-emerald-50/60 border border-emerald-200 rounded-lg text-[10px] font-mono">
                            <span className="text-emerald-900 font-medium">Bomba de Aceite y Garfio:</span>
                            <span className="text-emerald-800 font-bold">Óptimo (Flujo OK) ✓</span>
                          </div>
                          <div className="flex items-center justify-between p-2 bg-[#FAF8F5] border border-bananur-sand/60 rounded-lg text-[10px] font-mono">
                            <span className="text-bananur-clay">Dientes de Arrastre & Plancha:</span>
                            <span className="text-bananur-clay-light font-bold">Limpio sin pelusas ✓</span>
                          </div>
                        </div>
                      </div>

                      {/* Consumo Textil Rápido */}
                      <div className="pt-2 border-t border-bananur-sand/30 space-y-1 text-[10px] font-mono text-bananur-clay-light">
                        <div className="flex justify-between">
                          <span>Ancho de Rollo:</span>
                          <span className="text-bananur-clay font-bold">{rollWidth}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Merma & Encogimiento Prelavado:</span>
                          <span className="text-[#B58455] font-bold">{fabricShrinkage}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Margen de Costura:</span>
                          <span className="text-bananur-clay font-bold">{seamAllowance}</span>
                        </div>
                      </div>
                    </div>

                  </div>

                  {/* 4. Checklist & Registro de Moldería y Piezas Cortadas */}
                  <div className="bg-white p-5 rounded-2xl border border-bananur-sand/70 shadow-3xs space-y-3.5">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-bananur-sand/40 pb-2.5">
                      <div>
                        <h6 className="font-bold text-[#B58455] uppercase text-xs tracking-wider flex items-center gap-2">
                          <span>Checklist de Moldería & Piezas Cortadas del Lote</span>
                          <span className="text-[10px] font-mono bg-blue-100 text-blue-800 px-2 py-0.5 rounded font-bold">
                            {cutPieces.filter(p => p.cut).length} de {cutPieces.length} Piezas Listas ({Math.round((cutPieces.filter(p => p.cut).length / (cutPieces.length || 1)) * 100)}%)
                          </span>
                        </h6>
                        <p className="text-[10px] text-bananur-clay-light">
                          Seguimiento paso a paso del despiece textil para ensamble en la máquina industrial.
                        </p>
                      </div>

                      {/* Formulario para añadir nueva pieza al corte */}
                      <div className="flex gap-2">
                        <input
                          type="text"
                          value={newPieceName}
                          onChange={(e) => setNewPieceName(e.target.value)}
                          placeholder="Nueva pieza (ej. Tapeta_Bolsillo)..."
                          className="p-1.5 px-2.5 bg-[#FAF8F5] border border-bananur-sand rounded-lg text-xs text-bananur-clay w-48 focus:outline-none"
                        />
                        <button
                          type="button"
                          onClick={handleAddCutPiece}
                          className="px-3 py-1.5 bg-bananur-clay hover:bg-[#B58455] text-white font-mono text-xs font-bold rounded-lg transition-colors cursor-pointer shrink-0"
                        >
                          + Añadir Pieza
                        </button>
                      </div>
                    </div>

                    {/* Barra de progreso de corte */}
                    <div className="w-full bg-bananur-sand/30 h-1.5 rounded-full overflow-hidden">
                      <div
                        className="bg-emerald-500 h-full transition-all duration-300"
                        style={{ width: `${Math.round((cutPieces.filter(p => p.cut).length / (cutPieces.length || 1)) * 100)}%` }}
                      ></div>
                    </div>

                    {/* Grid de Piezas */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5 font-mono text-[10px]">
                      {cutPieces.map((piece) => (
                        <div
                          key={piece.id}
                          className={`p-2.5 rounded-xl border flex items-center justify-between transition-all ${
                            piece.cut
                              ? 'bg-emerald-50/50 border-emerald-200'
                              : 'bg-[#FAF8F5] border-bananur-sand/70'
                          }`}
                        >
                          <div className="space-y-0.5">
                            <span className={`block font-bold ${piece.cut ? 'line-through text-bananur-clay-light' : 'text-bananur-clay'}`}>
                              {piece.name}
                            </span>
                            <span className="text-[9px] text-bananur-clay-light/80 block">
                              Tela: {piece.fabric}
                            </span>
                          </div>

                          <div className="flex items-center gap-1.5">
                            <button
                              type="button"
                              onClick={() => {
                                handleToggleCutPiece(piece.id);
                                onShowToast?.('Corte de Pieza Actualizado', `Modificaste el estado para ${piece.name}.`, 'success');
                              }}
                              className={`px-2 py-0.5 text-[9px] rounded-lg font-mono font-bold transition-all border cursor-pointer ${
                                piece.cut
                                  ? 'bg-emerald-100 border-emerald-300 text-emerald-800'
                                  : 'bg-amber-100 border-amber-300 text-amber-800'
                              }`}
                            >
                              {piece.cut ? 'Cortado ✓' : 'Pendiente ✄'}
                            </button>
                            <button
                              type="button"
                              onClick={() => handleDeleteCutPiece(piece.id)}
                              className="text-red-400 hover:text-red-600 p-1 text-xs cursor-pointer rounded"
                              title="Eliminar pieza"
                            >
                              ✕
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                </div>
              )}

              {/* 4. ESTACIÓN CROCHET & TEJIDOS */}
              {(selectedWorkstation === 'all' || selectedWorkstation === 'crochet' || selectedWorkstation === 'ws-crochet' || activeWorkstations.some(w => w.type === 'crochet' && (selectedWorkstation === w.id || selectedWorkstation === w.type))) && activeWorkstations.some(w => w.type === 'crochet') && (
                <div id="station-crochet" className="space-y-4 bg-white/70 p-5 rounded-2xl border border-bananur-sand/80 shadow-3xs">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-bananur-sand/60 pb-3">
                    <div className="flex items-center gap-2.5">
                      <span className="text-xl">🧶</span>
                      <div>
                        <h5 className="font-serif text-sm font-bold text-bananur-clay uppercase flex items-center gap-2">
                          Estación de Crochet & Tejidos Artesanales
                          <span className="text-[9px] font-mono bg-purple-100 text-purple-800 px-2 py-0.5 rounded font-bold">
                            LABOR MANUAL DE AUTOR
                          </span>
                        </h5>
                        <p className="text-[11px] text-bananur-clay-light">
                          Contador digital de vueltas e hileras, contador de puntos y especificación de ganchillos para amigurumis y tapices.
                        </p>
                      </div>
                    </div>
                    {selectedWorkstation === 'all' ? (
                      <button
                        type="button"
                        onClick={() => setSelectedWorkstation('crochet')}
                        className="self-start sm:self-auto px-2.5 py-1 text-[10px] font-mono font-bold text-[#B58455] hover:text-white bg-white hover:bg-[#B58455] border border-[#B58455]/40 rounded-lg transition-colors cursor-pointer"
                      >
                        Enfocar solo Crochet ↗
                      </button>
                    ) : (
                      <button
                        type="button"
                        onClick={() => setSelectedWorkstation('all')}
                        className="self-start sm:self-auto px-2.5 py-1 text-[10px] font-mono font-bold text-bananur-clay hover:text-white bg-white hover:bg-bananur-clay border border-bananur-sand rounded-lg transition-colors cursor-pointer"
                      >
                        ← Ver todas las estaciones
                      </button>
                    )}
                  </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-xs">
                  <div className="space-y-3 bg-white p-4.5 rounded-xl border border-bananur-sand/55 flex flex-col justify-between text-center">
                    <div>
                      <h5 className="font-bold text-[#B58455] uppercase text-[10px] tracking-wider text-bananur-clay">Contador de Vueltas / Hileras</h5>
                      <span className="text-[10px] text-bananur-clay-light block mb-2">Ideal para no perder el patrón del amigurumi</span>
                      <div className="flex items-center justify-center gap-4 py-2">
                        <button
                          type="button"
                          onClick={() => {
                            if (crochetRowsCount <= 0) return;
                            setCrochetRowsCount(prev => prev - 1);
                          }}
                          className="w-10 h-10 rounded-full border border-bananur-sand hover:bg-bananur-sand/30 font-bold font-mono text-lg flex items-center justify-center cursor-pointer text-bananur-clay"
                        >
                          -
                        </button>
                        <span className="text-3xl font-serif font-bold text-[#B58455]">{crochetRowsCount}</span>
                        <button
                          type="button"
                          onClick={() => {
                            setCrochetRowsCount(prev => prev + 1);
                          }}
                          className="w-10 h-10 rounded-full border border-bananur-sand hover:bg-bananur-sand/30 font-bold font-mono text-lg flex items-center justify-center cursor-pointer text-bananur-clay"
                        >
                          +
                        </button>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        setCrochetRowsCount(0);
                        onShowToast?.('Contador de Hileras Reiniciado', 'Se reseteó el contador a cero.', 'info');
                      }}
                      className="text-[10px] text-bananur-coral hover:underline font-mono cursor-pointer"
                    >
                      Reiniciar Contador de Vueltas
                    </button>
                  </div>

                  <div className="space-y-3 bg-white p-4.5 rounded-xl border border-bananur-sand/55 flex flex-col justify-between text-center">
                    <div>
                      <h5 className="font-bold text-[#B58455] uppercase text-[10px] tracking-wider text-bananur-clay">Contador Global de Puntos</h5>
                      <span className="text-[10px] text-bananur-clay-light block mb-2">Registra el avance exacto de la labor artesanal</span>
                      <div className="flex items-center justify-center gap-4 py-2">
                        <button
                          type="button"
                          onClick={() => {
                            if (crochetStitchesCount <= 0) return;
                            setCrochetStitchesCount(prev => prev - 1);
                          }}
                          className="w-10 h-10 rounded-full border border-bananur-sand hover:bg-bananur-sand/30 font-bold font-mono text-lg flex items-center justify-center cursor-pointer text-bananur-clay"
                        >
                          -
                        </button>
                        <span className="text-3xl font-serif font-bold text-[#B58455]">{crochetStitchesCount}</span>
                        <button
                          type="button"
                          onClick={() => {
                            setCrochetStitchesCount(prev => prev + 1);
                          }}
                          className="w-10 h-10 rounded-full border border-bananur-sand hover:bg-bananur-sand/30 font-bold font-mono text-lg flex items-center justify-center cursor-pointer text-bananur-clay"
                        >
                          +
                        </button>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        setCrochetStitchesCount(0);
                        onShowToast?.('Contador de Puntos Reiniciado', 'Se reseteó el contador a cero.', 'info');
                      }}
                      className="text-[10px] text-bananur-coral hover:underline font-mono cursor-pointer"
                    >
                      Reiniciar Contador de Puntos
                    </button>
                  </div>

                  <div className="space-y-4 bg-white p-4.5 rounded-xl border border-bananur-sand/55">
                    <h5 className="font-bold text-[#B58455] uppercase text-[10px] tracking-wider text-bananur-clay">Especificación de Ganchillo</h5>
                    <div>
                      <label className="block text-[9px] font-mono uppercase text-bananur-clay-light/80 mb-1">Tamaño del Ganchillo de Crochet</label>
                      <select
                        value={crochetHookSize}
                        onChange={(e) => {
                          setCrochetHookSize(e.target.value);
                          onShowToast?.('Medida de Crochet Cambiada', `Ganchillo configurado para usar aguja de ${e.target.value}.`, 'info');
                        }}
                        className="w-full p-2.5 bg-[#FAF8F5] border border-bananur-sand rounded-lg cursor-pointer font-semibold text-bananur-clay"
                      >
                        <option value="2.0 mm">2.0 mm (Hilos Finos y Encajes)</option>
                        <option value="3.5 mm">3.5 mm (Lanas delgadas amigurumis)</option>
                        <option value="5.0 mm">5.0 mm (Fibras Gruesas y Trapillo)</option>
                        <option value="7.0 mm">7.0 mm (Lanas Giant y Mantas)</option>
                      </select>
                    </div>
                    <div className="bg-bananur-cream/30 p-3 rounded-lg text-[10px] text-bananur-clay-light leading-tight italic">
                      💡 Sintonía: El tamaño de aguja adecuado garantiza la tensión de puntada óptima para evitar fugas de vellón de relleno en amigurumis.
                    </div>
                  </div>
                </div>
              </div>
              )}

              {/* 5. ESTACIONES PERSONALIZADAS REGISTRADAS DINÁMICAMENTE */}
              {activeWorkstations.filter(w => w.type === 'personalizada').map(customWs => {
                const isFocused = selectedWorkstation === customWs.id || selectedWorkstation === customWs.type;
                if (selectedWorkstation !== 'all' && !isFocused) return null;
                return (
                  <div key={customWs.id} id={`station-${customWs.id}`} className="space-y-4 bg-white/70 p-5 rounded-2xl border border-bananur-sand/80 shadow-3xs">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-bananur-sand/60 pb-3">
                      <div className="flex items-center gap-2.5">
                        <span className="text-xl">{customWs.icon || '🛠️'}</span>
                        <div>
                          <h5 className="font-serif text-sm font-bold text-bananur-clay uppercase flex items-center gap-2">
                            {customWs.name}
                            <span className="text-[9px] font-mono bg-amber-100 text-amber-800 px-2 py-0.5 rounded font-bold">
                              {customWs.badge || 'TÉCNICA PERSONALIZADA'}
                            </span>
                          </h5>
                          <p className="text-[11px] text-bananur-clay-light">
                            {customWs.description || 'Estación de manufactura especializada registrada en el panel central de configuración.'}
                          </p>
                        </div>
                      </div>
                      {selectedWorkstation === 'all' ? (
                        <button
                          type="button"
                          onClick={() => setSelectedWorkstation(customWs.id)}
                          className="self-start sm:self-auto px-2.5 py-1 text-[10px] font-mono font-bold text-[#B58455] hover:text-white bg-white hover:bg-[#B58455] border border-[#B58455]/40 rounded-lg transition-colors cursor-pointer"
                        >
                          Enfocar ↗
                        </button>
                      ) : (
                        <button
                          type="button"
                          onClick={() => setSelectedWorkstation('all')}
                          className="self-start sm:self-auto px-2.5 py-1 text-[10px] font-mono font-bold text-bananur-clay hover:text-white bg-white hover:bg-bananur-clay border border-bananur-sand rounded-lg transition-colors cursor-pointer"
                        >
                          ← Ver todas las estaciones
                        </button>
                      )}
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                      <div className="bg-white p-4 rounded-xl border border-bananur-sand/60 space-y-2">
                        <span className="font-bold text-[#B58455] uppercase text-[10px] tracking-wider block">Parámetros Operativos</span>
                        <div className="text-[11px] space-y-1 font-mono">
                          <div><span className="text-bananur-clay-light">Código Estación:</span> <strong className="text-bananur-clay">{customWs.code}</strong></div>
                          <div><span className="text-bananur-clay-light">Responsable:</span> <strong className="text-bananur-clay">{customWs.responsible}</strong></div>
                          <div><span className="text-bananur-clay-light">Técnica Artesanal:</span> <strong className="text-[#B58455]">{customWs.customConfig?.craftTechnique || 'Técnica de Autor'}</strong></div>
                        </div>
                      </div>
                      <div className="bg-white p-4 rounded-xl border border-bananur-sand/60 space-y-2">
                        <span className="font-bold text-[#B58455] uppercase text-[10px] tracking-wider block">Notas & Protocolos de Calidad</span>
                        <p className="text-[11px] text-bananur-clay-light italic">
                          {customWs.customConfig?.customNotes || 'Sin notas especiales asignadas para este puesto.'}
                        </p>
                      </div>
                    </div>
                  </div>
                );
              })}

              {/* Si no hay estaciones activas */}
              {activeWorkstations.length === 0 && (
                <div className="bg-white p-10 rounded-2xl border border-dashed border-bananur-sand text-center space-y-3">
                  <span className="text-4xl block">🛠️</span>
                  <h4 className="font-serif text-lg font-bold text-bananur-clay">No hay estaciones de trabajo activas</h4>
                  <p className="text-xs text-bananur-clay-light max-w-md mx-auto">
                    Actualmente no hay estaciones activas para el módulo de producción. Puedes registrar nuevas estaciones o reactivarlas en cualquier momento desde la configuración centralizada.
                  </p>
                  {onOpenWorkstationsConfig && (
                    <button
                      type="button"
                      onClick={onOpenWorkstationsConfig}
                      className="px-4 py-2 bg-[#B58455] text-white rounded-xl text-xs font-mono font-bold hover:bg-bananur-clay transition-colors cursor-pointer"
                    >
                      Abrir Configuración de Estaciones
                    </button>
                  )}
                </div>
              )}
            </div>

          {/* High-fidelity Assembly Line steps progress list */}
          <div className="bg-white p-6 rounded-2xl border border-bananur-sand space-y-6 shadow-xs">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <h3 className="font-serif text-base font-bold text-bananur-clay flex items-center gap-2">
                <Wrench className="w-5 h-5 text-bananur-gold-dark" />
                Lotes en Proceso de Confección
              </h3>

              <div className="flex items-center gap-3">
                {/* Selector de visualización: Tarjetas vs Tabla */}
                <div className="flex items-center gap-1 bg-[#FAF8F5] p-1 rounded-xl border border-bananur-sand/60 shadow-3xs">
                  <button
                    type="button"
                    id="erp-batches-view-cards-btn"
                    onClick={() => setBatchesViewMode('cards')}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-sans font-bold transition-all cursor-pointer ${
                      batchesViewMode === 'cards'
                        ? 'bg-bananur-clay text-white shadow-xs'
                        : 'text-bananur-clay-light hover:text-bananur-clay hover:bg-bananur-cream/50'
                    }`}
                    title="Vista en Tarjetas"
                  >
                    <LayoutGrid className="w-3.5 h-3.5" />
                    <span>Tarjetas</span>
                  </button>
                  <button
                    type="button"
                    id="erp-batches-view-table-btn"
                    onClick={() => setBatchesViewMode('table')}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-sans font-bold transition-all cursor-pointer ${
                      batchesViewMode === 'table'
                        ? 'bg-bananur-clay text-white shadow-xs'
                        : 'text-bananur-clay-light hover:text-bananur-clay hover:bg-bananur-cream/50'
                    }`}
                    title="Vista en Tabla"
                  >
                    <List className="w-3.5 h-3.5" />
                    <span>Tabla</span>
                  </button>
                </div>

                <span className="text-[11px] font-mono text-bananur-clay-light bg-bananur-cream/50 px-2 py-1 rounded-lg border border-bananur-sand/50">
                  {productionBatches.length} {productionBatches.length === 1 ? 'lote' : 'lotes'}
                </span>
              </div>
            </div>

            {/* VISTA EN TARJETAS PARA LOTES */}
            {batchesViewMode === 'cards' ? (
              <div className="space-y-6">
                {paginatedBatches.map((batch) => {
                  const getStageBadgeColor = (stage: ProductionBatch['currentStage']) => {
                    if (stage === 'Modelado / Diseño') return 'bg-purple-50 text-purple-700 border-purple-200';
                    if (stage === 'Procesamiento en Cama') return 'bg-cyan-50 text-cyan-700 border-cyan-200';
                    if (stage === 'Corte & Confección') return 'bg-amber-50 text-amber-700 border-amber-200';
                    if (stage === 'Tejido Manual') return 'bg-indigo-50 text-indigo-700 border-indigo-200';
                    if (stage === 'Control de Calidad') return 'bg-rose-50 text-rose-700 border-rose-200';
                    return 'bg-emerald-50 text-emerald-750 border-emerald-300';
                  };

                  return (
                    <div key={batch.id} className="p-4 border border-bananur-sand/60 bg-bananur-cream/10 rounded-2xl grid grid-cols-1 lg:grid-cols-12 gap-4 items-center">
                      
                      <div className="lg:col-span-3">
                        <div className="flex items-center gap-1 text-[10px] font-mono text-bananur-gold-dark uppercase font-bold">
                          <Flame className="w-3 h-3 text-[#B58455] animate-pulse" />
                          Código Lote: {batch.id}
                        </div>
                        <h4 className="font-serif text-sm font-bold text-bananur-clay mt-0.5">{batch.productName}</h4>
                        <p className="text-[11px] text-bananur-clay-light font-medium truncate max-w-[200px]" title={batch.clientName}>
                          Cliente: {batch.clientName}
                        </p>
                        <span className="text-[10px] text-bananur-clay-light/60 font-mono">Volumen: {batch.quantity} unidades</span>
                      </div>

                      <div className="lg:col-span-3 space-y-1">
                        <span className="text-[9px] font-mono uppercase text-bananur-clay-light/60 block">Especialista Encargado</span>
                        <span className="text-xs font-semibold text-bananur-clay block">{batch.artisan}</span>
                        <span className="text-[10px] text-bananur-clay-light/60 bg-bananur-cream border border-bananur-sand px-1.5 py-0.2 rounded font-mono inline-block">Mesa de Trabajo 4A</span>
                      </div>

                      <div className="lg:col-span-3 space-y-1.5">
                        <div className="flex justify-between items-center text-[10px]">
                          <span className="font-mono text-bananur-clay-light/60">Etapa de Ensamblaje</span>
                          <span className="font-mono font-bold">{batch.progress}%</span>
                        </div>
                        <span className={`px-2.5 py-0.5 text-[10px] rounded-full border inline-block font-mono font-bold uppercase tracking-wide text-center w-full ${getStageBadgeColor(batch.currentStage)}`}>
                          {batch.currentStage}
                        </span>
                        {/* Bar */}
                        <div className="w-full bg-bananur-sand/40 rounded-full h-1.5 overflow-hidden">
                          <div className="bg-[#40916C] h-full rounded-full transition-all duration-300" style={{ width: `${batch.progress}%` }} />
                        </div>
                      </div>

                      <div className="lg:col-span-3 text-right">
                        {batch.currentStage !== 'Listo para Starken' ? (
                          <button
                            id={`erp-plm-btn-advance-${batch.id}`}
                            onClick={() => handleAdvanceStage(batch.id, batch.currentStage, batch.productName)}
                            className="w-full text-center py-2.5 px-4 bg-bananur-clay text-[#FAF8F5] text-xs font-semibold hover:bg-bananur-gold hover:text-bananur-clay rounded-xl border border-transparent shadow-xs transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
                          >
                            <AssemblyIcon className="w-4 h-4" />
                            Avanzar Etapa
                          </button>
                        ) : (
                          <div className="w-full text-center py-2.5 border border-emerald-200 bg-emerald-50 text-emerald-800 text-xs font-bold rounded-xl flex items-center justify-center gap-1.5 select-none font-mono font-bold">
                            <PackageCheck className="w-4 h-4 text-emerald-650" />
                            CONFECCIÓN FINALIZADA
                          </div>
                        )}
                      </div>

                    </div>
                  );
                })}
              </div>
            ) : (
              /* VISTA EN TABLA PARA LOTES */
              <div className="overflow-x-auto rounded-xl border border-bananur-sand/70">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="bg-bananur-cream/40 border-b border-bananur-sand text-[10px] font-mono text-bananur-clay uppercase tracking-wider">
                      <th className="py-3 px-4 font-bold">Código Lote</th>
                      <th className="py-3 px-3 font-bold">Producto</th>
                      <th className="py-3 px-3 font-bold">Cliente</th>
                      <th className="py-3 px-3 font-bold">Volumen</th>
                      <th className="py-3 px-3 font-bold">Especialista</th>
                      <th className="py-3 px-3 font-bold">Etapa & Progreso</th>
                      <th className="py-3 px-4 text-right font-bold">Acción</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-bananur-sand/40">
                    {paginatedBatches.map((batch) => {
                      const getStageBadgeColor = (stage: ProductionBatch['currentStage']) => {
                        if (stage === 'Modelado / Diseño') return 'bg-purple-50 text-purple-700 border-purple-200';
                        if (stage === 'Procesamiento en Cama') return 'bg-cyan-50 text-cyan-700 border-cyan-200';
                        if (stage === 'Corte & Confección') return 'bg-amber-50 text-amber-700 border-amber-200';
                        if (stage === 'Tejido Manual') return 'bg-indigo-50 text-indigo-700 border-indigo-200';
                        if (stage === 'Control de Calidad') return 'bg-rose-50 text-rose-700 border-rose-200';
                        return 'bg-emerald-50 text-emerald-750 border-emerald-300';
                      };

                      return (
                        <tr key={batch.id} className="hover:bg-bananur-cream/20 transition-colors">
                          <td className="py-3 px-4 font-mono font-bold text-bananur-gold-dark text-[11px]">
                            {batch.id}
                          </td>
                          <td className="py-3 px-3 font-semibold text-bananur-clay">
                            {batch.productName}
                          </td>
                          <td className="py-3 px-3 text-bananur-clay-light text-[11px]">
                            {batch.clientName}
                          </td>
                          <td className="py-3 px-3 font-mono text-[11px] text-bananur-clay">
                            {batch.quantity} un.
                          </td>
                          <td className="py-3 px-3 text-bananur-clay text-[11px]">
                            {batch.artisan}
                          </td>
                          <td className="py-3 px-3">
                            <div className="space-y-1 min-w-[140px]">
                              <span className={`px-2 py-0.5 text-[9px] rounded-full border font-mono font-bold uppercase inline-block ${getStageBadgeColor(batch.currentStage)}`}>
                                {batch.currentStage} ({batch.progress}%)
                              </span>
                              <div className="w-full bg-bananur-sand/40 rounded-full h-1.5 overflow-hidden">
                                <div className="bg-[#40916C] h-full rounded-full transition-all duration-300" style={{ width: `${batch.progress}%` }} />
                              </div>
                            </div>
                          </td>
                          <td className="py-3 px-4 text-right">
                            {batch.currentStage !== 'Listo para Starken' ? (
                              <button
                                type="button"
                                onClick={() => handleAdvanceStage(batch.id, batch.currentStage, batch.productName)}
                                className="px-3 py-1.5 bg-bananur-clay text-white hover:bg-bananur-gold hover:text-bananur-clay rounded-lg text-xs font-semibold cursor-pointer transition-colors inline-flex items-center gap-1"
                              >
                                <AssemblyIcon className="w-3.5 h-3.5" />
                                Avanzar
                              </button>
                            ) : (
                              <span className="text-[10px] font-mono font-bold text-emerald-700 bg-emerald-50 px-2 py-1 rounded border border-emerald-200 inline-flex items-center gap-1">
                                <PackageCheck className="w-3.5 h-3.5" />
                                Finalizado
                              </span>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}

            {/* BARRA DE PAGINACIÓN DE LOTES */}
            {totalBatchesPages > 1 && (
              <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2 px-1 border-t border-bananur-sand/40">
                <span className="text-xs text-bananur-clay-light font-mono">
                  Mostrando página <strong className="text-bananur-clay">{batchesPage}</strong> de <strong className="text-bananur-clay">{totalBatchesPages}</strong> ({productionBatches.length} lotes totales)
                </span>
                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    id="erp-batches-pagination-prev"
                    disabled={batchesPage <= 1}
                    onClick={() => setBatchesPage(prev => Math.max(1, prev - 1))}
                    className="px-3 py-1.5 rounded-xl border border-bananur-sand text-xs font-mono font-bold bg-white hover:bg-bananur-cream text-bananur-clay disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer flex items-center gap-1 shadow-3xs"
                  >
                    <ChevronLeft className="w-3.5 h-3.5" />
                    Anterior
                  </button>
                  <div className="flex items-center gap-1">
                    {Array.from({ length: totalBatchesPages }).map((_, pIdx) => {
                      const pageNum = pIdx + 1;
                      return (
                        <button
                          key={pageNum}
                          type="button"
                          onClick={() => setBatchesPage(pageNum)}
                          className={`w-8 h-8 rounded-xl text-xs font-mono font-bold transition-all cursor-pointer ${
                            batchesPage === pageNum
                              ? 'bg-bananur-clay text-white shadow-xs'
                              : 'bg-white border border-bananur-sand text-bananur-clay hover:bg-bananur-cream'
                          }`}
                        >
                          {pageNum}
                        </button>
                      );
                    })}
                  </div>
                  <button
                    type="button"
                    id="erp-batches-pagination-next"
                    disabled={batchesPage >= totalBatchesPages}
                    onClick={() => setBatchesPage(prev => Math.min(totalBatchesPages, prev + 1))}
                    className="px-3 py-1.5 rounded-xl border border-bananur-sand text-xs font-mono font-bold bg-white hover:bg-bananur-cream text-bananur-clay disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer flex items-center gap-1 shadow-3xs"
                  >
                    Siguiente
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            )}
          </div>

        </div>
      )}

      {/* --- PESTAÑA CRM: PATRON CLIENTS DIRECTORY --- */}
      {erpTab === 'crm' && (
        <div className="space-y-6 animate-fade-in text-bananur-clay">
          
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h3 className="font-serif text-lg font-bold text-bananur-clay">Directorio CRM de Clientes VIP Bananur</h3>
              <p className="text-xs text-bananur-clay-light">Fideliza y monitorea los requerimientos técnicos especiales, cotizaciones archivadas y facturación histórica corporativa.</p>
            </div>
            
            <button
              id="erp-crm-btn-new-client"
              onClick={() => setShowClientModal(true)}
              className="flex items-center gap-2 bg-bananur-clay text-white px-4 py-2 rounded-xl text-xs font-semibold hover:bg-bananur-gold hover:text-bananur-clay transition-all shadow-xs cursor-pointer"
            >
              <UserPlus className="w-4 h-4" />
              Nuevo Cliente
            </button>
          </div>

          {/* SEARCH AND FILTERS BAR FOR CLIENTS */}
          <div className="bg-white p-4 rounded-xl border border-bananur-sand flex flex-col md:flex-row gap-4 items-center shadow-xs">
            <div className="relative flex-1 w-full">
              <input
                id="crm-client-search"
                type="text"
                placeholder="Buscar cliente por nombre, empresa o proyecto solicitado..."
                value={clientSearchQuery}
                onChange={(e) => setClientSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-bananur-cream/30 border border-bananur-sand/80 rounded-lg text-xs focus:outline-none focus:border-bananur-gold text-bananur-clay"
              />
              <Search className="w-4 h-4 text-bananur-clay-light absolute left-3 top-1/2 -translate-y-1/2" />
            </div>
            <div className="flex items-center gap-2 w-full md:w-auto text-xs">
              <label className="text-xs font-mono text-bananur-clay-light shrink-0">Categoría:</label>
              <select
                id="crm-client-segment-filter"
                value={clientSegmentFilter}
                onChange={(e) => setClientSegmentFilter(e.target.value)}
                className="w-full md:w-44 p-2 bg-white border border-bananur-sand rounded-lg text-xs font-medium text-bananur-clay cursor-pointer"
              >
                <option value="Todos">Todas las categorías</option>
                {clientCategories.map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>
          </div>

          {/* CRM CLIENTS ADD FORM INLINE/MODAL */}
          {showClientModal && (
            <form onSubmit={handleAddClientSubmit} className="bg-white p-5 rounded-2xl border-2 border-bananur-gold border-dashed space-y-4 animate-scale-up">
              <div className="flex items-center justify-between border-b pb-2 shrink-0">
                <span className="text-xs font-mono uppercase font-bold text-bananur-gold-dark">Fidelizar Nueva Cuenta en CRM</span>
                <button type="button" onClick={() => setShowClientModal(false)} className="text-xs text-bananur-coral font-bold hover:underline">Cerrar</button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs font-sans">
                <div>
                  <label className="block text-[10px] font-mono uppercase font-semibold text-bananur-clay-light mb-1">Nombre Completo</label>
                  <input
                    id="new-cli-name"
                    type="text"
                    required
                    placeholder="Ej. Francisca Astaburuaga"
                    value={cName}
                    onChange={(e) => setCName(e.target.value)}
                    className="w-full p-2 bg-bananur-cream/30 border border-bananur-sand rounded-lg text-bananur-clay"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-mono uppercase font-semibold text-bananur-clay-light mb-1">Empresa / Razón Social</label>
                  <input
                    id="new-cli-company"
                    type="text"
                    placeholder="Ej. Astaburuaga Joyería"
                    value={cCompany}
                    onChange={(e) => setCCompany(e.target.value)}
                    className="w-full p-2 bg-bananur-cream/30 border border-bananur-sand rounded-lg text-bananur-clay"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-mono uppercase font-semibold text-[#524742]/65 mb-1">Correo Electrónico</label>
                  <input
                    id="new-cli-email"
                    type="email"
                    required
                    placeholder="f.asta@joyas.cl"
                    value={cEmail}
                    onChange={(e) => setCEmail(e.target.value)}
                    className="w-full p-2 bg-bananur-cream/30 border border-bananur-sand rounded-lg font-mono text-bananur-clay"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs font-sans">
                <div>
                  <label className="block text-[10px] font-mono uppercase font-semibold text-bananur-clay-light mb-1">Teléfono Contacto</label>
                  <input
                    id="new-cli-phone"
                    type="text"
                    placeholder="+56 9 6608..."
                    value={cPhone}
                    onChange={(e) => setCPhone(e.target.value)}
                    className="w-full p-2 bg-bananur-cream/30 border border-bananur-sand rounded-lg text-bananur-clay"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-mono uppercase font-semibold text-bananur-clay-light mb-1">Categoría Miembro</label>
                  <select
                    id="new-cli-seg"
                    value={cSegment}
                    onChange={(e) => setCSegment(e.target.value)}
                    className="w-full p-2 bg-white border border-bananur-sand rounded-lg cursor-pointer font-semibold text-bananur-clay"
                  >
                    {clientCategories.map(cat => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-[10px] font-mono uppercase font-semibold text-[#524742]/65 mb-1">Inversión Inicial de Proyecto ($)</label>
                  <input
                    id="new-cli-spend"
                    type="number"
                    min="0"
                    placeholder="650000"
                    value={cSpend}
                    onChange={(e) => setCSpend(e.target.value)}
                    className="w-full p-2 bg-bananur-cream/30 border border-bananur-sand rounded-lg text-bananur-clay"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs font-sans">
                <div>
                  <label className="block text-[10px] font-mono uppercase font-semibold text-bananur-clay-light mb-1">Descripción de Proyecto Solicitado</label>
                  <textarea
                    id="new-cli-desc"
                    rows={2}
                    placeholder="Indica el encargo estético/corporativo."
                    value={cDesc}
                    onChange={(e) => setCDesc(e.target.value)}
                    className="w-full p-2 bg-bananur-cream/30 border border-bananur-sand rounded-lg text-bananur-clay"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-mono uppercase font-semibold text-bananur-clay-light mb-1">Notas Sensoriales / Observaciones Críticas</label>
                  <textarea
                    id="new-cli-notes"
                    rows={2}
                    placeholder="Detalles de texturas, paleta de colores preferida de la marca, etc."
                    value={cNotes}
                    onChange={(e) => setCNotes(e.target.value)}
                    className="w-full p-2 bg-bananur-cream/30 border border-bananur-sand rounded-lg text-bananur-clay"
                  />
                </div>
              </div>

              <button type="submit" className="bg-bananur-clay text-white px-5 py-2.5 rounded-xl font-bold text-xs hover:bg-bananur-gold hover:text-bananur-clay cursor-pointer">
                Confirmar Fidelización CRM
              </button>
            </form>
          )}

          {/* CRM CLIENTS EDIT FORM INLINE */}
          {editingClient && (
            <form 
              onSubmit={(e) => {
                e.preventDefault();
                setCrmClients(prev => prev.map(c => c.id === editingClient.id ? editingClient : c));
                setEditingClient(null);
                if (onShowToast) {
                  onShowToast('Cliente Actualizado', `La información de ${editingClient.name} se ha guardado correctamente.`, 'success');
                }
              }} 
              className="bg-white p-5 rounded-2xl border-2 border-bananur-gold space-y-4 animate-scale-up"
            >
              <div className="flex items-center justify-between border-b pb-2 shrink-0">
                <span className="text-xs font-mono uppercase font-bold text-bananur-gold-dark">Editar Cuenta de Cliente CRM</span>
                <button type="button" onClick={() => setEditingClient(null)} className="text-xs text-bananur-coral font-bold hover:underline">Cancelar</button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs font-sans">
                <div>
                  <label className="block text-[10px] font-mono uppercase font-semibold text-bananur-clay-light mb-1">Nombre Completo</label>
                  <input
                    type="text"
                    required
                    value={editingClient.name}
                    onChange={(e) => setEditingClient({ ...editingClient, name: e.target.value })}
                    className="w-full p-2 bg-bananur-cream/30 border border-bananur-sand rounded-lg text-bananur-clay"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-mono uppercase font-semibold text-bananur-clay-light mb-1">Empresa / Razón Social</label>
                  <input
                    type="text"
                    value={editingClient.company}
                    onChange={(e) => setEditingClient({ ...editingClient, company: e.target.value })}
                    className="w-full p-2 bg-bananur-cream/30 border border-bananur-sand rounded-lg text-bananur-clay"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-mono uppercase font-semibold text-[#524742]/65 mb-1">Correo Electrónico</label>
                  <input
                    type="email"
                    required
                    value={editingClient.email}
                    onChange={(e) => setEditingClient({ ...editingClient, email: e.target.value })}
                    className="w-full p-2 bg-bananur-cream/30 border border-bananur-sand rounded-lg font-mono text-bananur-clay"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 text-xs font-sans">
                <div>
                  <label className="block text-[10px] font-mono uppercase font-semibold text-bananur-clay-light mb-1">Teléfono Contacto</label>
                  <input
                    type="text"
                    value={editingClient.phone}
                    onChange={(e) => setEditingClient({ ...editingClient, phone: e.target.value })}
                    className="w-full p-2 bg-bananur-cream/30 border border-bananur-sand rounded-lg text-bananur-clay"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-mono uppercase font-semibold text-bananur-clay-light mb-1">Categoría Miembro</label>
                  <select
                    value={editingClient.segment}
                    onChange={(e) => setEditingClient({ ...editingClient, segment: e.target.value })}
                    className="w-full p-2 bg-white border border-bananur-sand rounded-lg cursor-pointer font-semibold text-bananur-clay"
                  >
                    {clientCategories.map(cat => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-[10px] font-mono uppercase font-semibold text-[#524742]/65 mb-1">Inversión Proyecto ($)</label>
                  <input
                    type="number"
                    min="0"
                    value={editingClient.totalSpend}
                    onChange={(e) => setEditingClient({ ...editingClient, totalSpend: Number(e.target.value) || 0 })}
                    className="w-full p-2 bg-bananur-cream/30 border border-bananur-sand rounded-lg text-bananur-clay"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-mono uppercase font-semibold text-bananur-clay-light mb-1">Estado de Cuenta</label>
                  <select
                    value={editingClient.status}
                    onChange={(e) => setEditingClient({ ...editingClient, status: e.target.value as any })}
                    className="w-full p-2 bg-white border border-bananur-sand rounded-lg cursor-pointer font-bold text-bananur-clay"
                  >
                    <option value="Activo">🟢 Activo</option>
                    <option value="Inactivo">🔴 Inactivo</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs font-sans">
                <div>
                  <label className="block text-[10px] font-mono uppercase font-semibold text-bananur-clay-light mb-1">Descripción de Proyecto Solicitado</label>
                  <textarea
                    rows={2}
                    value={editingClient.projectDescription}
                    onChange={(e) => setEditingClient({ ...editingClient, projectDescription: e.target.value })}
                    className="w-full p-2 bg-bananur-cream/30 border border-bananur-sand rounded-lg text-bananur-clay"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-mono uppercase font-semibold text-bananur-clay-light mb-1">Notas Sensoriales / Observaciones Críticas</label>
                  <textarea
                    rows={2}
                    value={editingClient.internalNotes}
                    onChange={(e) => setEditingClient({ ...editingClient, internalNotes: e.target.value })}
                    className="w-full p-2 bg-bananur-cream/30 border border-bananur-sand rounded-lg text-bananur-clay"
                  />
                </div>
              </div>

              <div className="flex gap-2 justify-end pt-2">
                <button type="button" onClick={() => setEditingClient(null)} className="px-4 py-2 bg-bananur-sand/35 hover:bg-bananur-sand/65 text-bananur-clay rounded-xl text-xs font-semibold cursor-pointer">
                  Cancelar
                </button>
                <button type="submit" className="bg-bananur-clay text-white px-5 py-2.5 rounded-xl font-bold text-xs hover:bg-bananur-gold hover:text-bananur-clay cursor-pointer">
                  Guardar Cambios
                </button>
              </div>
            </form>
          )}

          {/* BARRA DE VISTA Y CONTADOR PARA CLIENTES */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-[11px] text-bananur-clay-light/80 font-mono bg-bananur-cream/35 p-3 rounded-xl border border-bananur-sand/40">
            <div className="flex flex-wrap items-center gap-2">
              <span>
                Mostrando <strong className="font-bold text-bananur-clay">{filteredClients.length === 0 ? 0 : (clientsPage - 1) * clientsPerPage + 1}-{Math.min(clientsPage * clientsPerPage, filteredClients.length)}</strong> de <strong className="font-semibold">{filteredClients.length}</strong> clientes de la cartera VIP.
              </span>
              {totalClientsPages > 1 && (
                <span className="text-[10px] bg-bananur-sand/40 text-bananur-clay px-2 py-0.5 rounded-full font-sans font-semibold">
                  Página {clientsPage} de {totalClientsPages}
                </span>
              )}
            </div>

            {/* Selector de visualización: Tarjeta vs Lista */}
            <div className="flex items-center gap-1 bg-white p-1 rounded-xl border border-bananur-sand/60 shadow-3xs self-end sm:self-auto">
              <button
                type="button"
                id="crm-clients-view-table-btn"
                onClick={() => setClientsViewMode('table')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-sans font-bold transition-all cursor-pointer ${
                  clientsViewMode === 'table'
                    ? 'bg-bananur-clay text-white shadow-xs'
                    : 'text-bananur-clay-light hover:text-bananur-clay hover:bg-bananur-cream/50'
                }`}
                title="Vista en Lista / Tabla"
              >
                <List className="w-3.5 h-3.5" />
                <span>Lista</span>
              </button>
              <button
                type="button"
                id="crm-clients-view-cards-btn"
                onClick={() => setClientsViewMode('cards')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-sans font-bold transition-all cursor-pointer ${
                  clientsViewMode === 'cards'
                    ? 'bg-bananur-clay text-white shadow-xs'
                    : 'text-bananur-clay-light hover:text-bananur-clay hover:bg-bananur-cream/50'
                }`}
                title="Vista en Tarjetas"
              >
                <LayoutGrid className="w-3.5 h-3.5" />
                <span>Tarjetas</span>
              </button>
            </div>
          </div>

          {/* VISTA 1: MODO TARJETAS (CARDS) */}
          {clientsViewMode === 'cards' ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {filteredClients.length === 0 ? (
                <div className="col-span-2 text-center py-8 text-xs text-bananur-clay-light/80 bg-white rounded-xl border border-bananur-sand">
                  No hay clientes con los filtros de búsqueda y categoría actuales.
                </div>
              ) : (
                paginatedClients.map((client) => {
                  const getSegmentStyle = (seg: ClientCRM['segment']) => {
                    if (seg === 'VIP Corporativo') return 'bg-purple-50 text-purple-700 border-purple-200';
                    if (seg === 'Boutique Patrón') return 'bg-emerald-50 text-emerald-750 border-emerald-200';
                    return 'bg-bananur-cream text-bananur-clay-light border-bananur-sand/80';
                  };

                  return (
                    <div key={client.id} className="bg-white p-6 rounded-2xl border border-bananur-sand shadow-xs space-y-4 flex flex-col justify-between">
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <span className={`px-2 py-0.5 text-[9px] font-mono font-bold rounded-full border uppercase tracking-wide ${getSegmentStyle(client.segment)}`}>
                            {client.segment}
                          </span>
                          
                          <div className="flex items-center gap-1.5">
                            <button
                              type="button"
                              onClick={() => setEditingClient(client)}
                              className="px-1.5 py-0.5 bg-bananur-sand/30 hover:bg-bananur-sand/70 text-bananur-clay text-[10px] font-bold rounded-sm transition-colors cursor-pointer"
                              title="Editar Datos & Estado"
                            >
                              ✏️ Editar
                            </button>
                            <span className="text-[10px] font-mono text-bananur-clay-light/50 font-bold">{client.id}</span>
                          </div>
                        </div>

                        <div>
                          <h4 className="font-serif text-lg font-bold text-bananur-clay leading-snug">{client.name}</h4>
                          <p className="text-xs text-bananur-gold-dark font-semibold mt-0.5">{client.company}</p>
                        </div>

                        <div className="grid grid-cols-2 gap-2 text-[11px] font-medium pt-1.5 leading-normal">
                          <div>
                            <span className="text-[9px] text-[#524742]/50 font-mono block">Email corporativo</span>
                            <span className="text-bananur-clay truncate max-w-full font-mono block">{client.email}</span>
                          </div>
                          <div>
                            <span className="text-[9px] text-[#524742]/50 font-mono block">Teléfono directo</span>
                            <span className="text-bananur-clay flex items-center font-mono block">{client.phone}</span>
                          </div>
                        </div>

                        <div className="p-3 bg-bananur-cream/30 border border-bananur-sand/40 rounded-xl space-y-1.5 text-xs">
                          <div>
                            <span className="text-[9px] uppercase font-mono text-bananur-clay-light/60 font-bold block">Proyecto Acordado:</span>
                            <p className="text-bananur-clay mt-0.5 font-light">{client.projectDescription}</p>
                          </div>
                          <div>
                            <span className="text-[9px] uppercase font-mono text-bananur-clay-light/60 font-bold block">Fórmulas o Notas Especiales:</span>
                            <p className="text-bananur-clay-light italic text-[11px] font-light mt-0.5">{client.internalNotes}</p>
                          </div>
                        </div>
                      </div>

                      <div className="flex justify-between items-center border-t border-bananur-sand/40 pt-3 text-xs mt-2 shrink-0">
                        <div>
                          <span className="text-[9px] font-mono text-bananur-clay-light/60 uppercase block">Inversión Histórica</span>
                          <span className="font-mono text-xs font-bold text-bananur-clay">${client.totalSpend.toLocaleString('es-CL')} CLP</span>
                        </div>

                        {client.status !== 'Inactivo' ? (
                          <span className="inline-flex items-center gap-1 text-[10px] text-emerald-600 font-bold bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                            <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse"></span>
                            Activo
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-[10px] text-red-500 font-bold bg-red-50 px-2 py-0.5 rounded border border-red-200">
                            <span className="w-1.5 h-1.5 bg-red-400 rounded-full"></span>
                            Inactivo
                          </span>
                        )}
                      </div>

                    </div>
                  );
                })
              )}
            </div>
          ) : (
            /* VISTA 2: MODO LISTA / TABLA TRADICIONAL */
            <div className="bg-white rounded-2xl border border-bananur-sand overflow-hidden shadow-xs">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-bananur-cream/50 border-b border-bananur-sand text-[10px] font-mono uppercase tracking-widest text-bananur-clay-light">
                      <th className="py-4 px-6">Código CRM</th>
                      <th className="py-4">Cliente / Razón Social</th>
                      <th className="py-4">Categoría / Segmento</th>
                      <th className="py-4">Contacto (Email / Fono)</th>
                      <th className="py-4">Proyecto Acordado</th>
                      <th className="py-4">Inversión Histórica</th>
                      <th className="py-4">Estado</th>
                      <th className="py-4 px-6 text-right">Acciones</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-bananur-sand/50 text-xs text-bananur-clay">
                    {filteredClients.length === 0 ? (
                      <tr>
                        <td colSpan={8} className="py-12 text-center text-bananur-clay-light italic bg-bananur-cream/10">
                          <div className="max-w-md mx-auto space-y-2">
                            <span className="text-xl">🔍</span>
                            <p className="font-serif font-bold text-sm text-bananur-clay text-center">Sin clientes registrados</p>
                            <p className="text-[11px] leading-relaxed">
                              No se encontraron registros de clientes para los filtros seleccionados.
                            </p>
                          </div>
                        </td>
                      </tr>
                    ) : (
                      paginatedClients.map((client) => {
                        const getSegmentBadge = (seg: ClientCRM['segment']) => {
                          if (seg === 'VIP Corporativo') return 'bg-purple-50 text-purple-700 border-purple-200';
                          if (seg === 'Boutique Patrón') return 'bg-emerald-50 text-emerald-750 border-emerald-200';
                          return 'bg-bananur-cream text-bananur-clay-light border-bananur-sand/80';
                        };

                        return (
                          <tr key={client.id} className="hover:bg-bananur-sand/10 transition-colors">
                            <td className="py-4 px-6 font-mono font-bold text-bananur-clay-light">{client.id}</td>
                            <td className="py-4">
                              <span className="font-serif font-bold text-bananur-clay block">{client.name}</span>
                              <span className="text-[11px] text-bananur-gold-dark font-medium">{client.company}</span>
                            </td>
                            <td className="py-4">
                              <span className={`px-2 py-0.5 text-[9px] font-mono font-bold rounded-full border uppercase tracking-wide ${getSegmentBadge(client.segment)}`}>
                                {client.segment}
                              </span>
                            </td>
                            <td className="py-4 font-mono text-[11px]">
                              <span className="text-bananur-clay block">{client.email}</span>
                              <span className="text-bananur-clay-light text-[10px]">{client.phone}</span>
                            </td>
                            <td className="py-4 max-w-xs pr-4">
                              <p className="line-clamp-2 text-[11px] text-bananur-clay font-light">{client.projectDescription}</p>
                            </td>
                            <td className="py-4 font-mono font-bold text-bananur-clay">
                              ${client.totalSpend.toLocaleString('es-CL')} CLP
                            </td>
                            <td className="py-4">
                              {client.status !== 'Inactivo' ? (
                                <span className="inline-flex items-center gap-1 text-[10px] text-emerald-600 font-bold bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                                  <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse"></span>
                                  Activo
                                </span>
                              ) : (
                                <span className="inline-flex items-center gap-1 text-[10px] text-red-500 font-bold bg-red-50 px-2 py-0.5 rounded border border-red-200">
                                  <span className="w-1.5 h-1.5 bg-red-400 rounded-full"></span>
                                  Inactivo
                                </span>
                              )}
                            </td>
                            <td className="py-4 px-6 text-right">
                              <button
                                type="button"
                                onClick={() => setEditingClient(client)}
                                className="p-1.5 bg-white border border-bananur-sand hover:border-bananur-clay hover:bg-bananur-cream/30 text-bananur-clay rounded-lg transition-all cursor-pointer font-bold text-xs inline-flex items-center gap-1"
                                title="Editar Cliente"
                              >
                                <Pencil className="w-3.5 h-3.5" />
                                <span>Editar</span>
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
          )}

          {/* BARRA DE PAGINACIÓN DE CLIENTES */}
          {totalClientsPages > 1 && (
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2 px-1">
              <span className="text-xs text-bananur-clay-light font-mono">
                Mostrando página <strong className="text-bananur-clay">{clientsPage}</strong> de <strong className="text-bananur-clay">{totalClientsPages}</strong> ({filteredClients.length} clientes totales)
              </span>
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  id="crm-clients-pagination-prev"
                  disabled={clientsPage <= 1}
                  onClick={() => setClientsPage(prev => Math.max(1, prev - 1))}
                  className="px-3 py-1.5 rounded-xl border border-bananur-sand text-xs font-mono font-bold bg-white hover:bg-bananur-cream text-bananur-clay disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer flex items-center gap-1 shadow-3xs"
                >
                  <ChevronLeft className="w-3.5 h-3.5" />
                  Anterior
                </button>
                <div className="flex items-center gap-1">
                  {Array.from({ length: totalClientsPages }).map((_, pIdx) => {
                    const pageNum = pIdx + 1;
                    return (
                      <button
                        key={pageNum}
                        type="button"
                        onClick={() => setClientsPage(pageNum)}
                        className={`w-8 h-8 rounded-xl text-xs font-mono font-bold transition-all cursor-pointer ${
                          clientsPage === pageNum
                            ? 'bg-bananur-clay text-white shadow-xs'
                            : 'bg-white border border-bananur-sand text-bananur-clay hover:bg-bananur-cream'
                        }`}
                      >
                        {pageNum}
                      </button>
                    );
                  })}
                </div>
                <button
                  type="button"
                  id="crm-clients-pagination-next"
                  disabled={clientsPage >= totalClientsPages}
                  onClick={() => setClientsPage(prev => Math.min(totalClientsPages, prev + 1))}
                  className="px-3 py-1.5 rounded-xl border border-bananur-sand text-xs font-mono font-bold bg-white hover:bg-bananur-cream text-bananur-clay disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer flex items-center gap-1 shadow-3xs"
                >
                  Siguiente
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          )}

        </div>
      )}

      {/* --- PESTAÑA PROVEEDORES: CRM SUPPLIERS LOGISTICS --- */}
      {erpTab === 'proveedores' && (
        <div className="space-y-6 animate-fade-in text-bananur-clay">
          
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h3 className="font-serif text-lg font-bold text-bananur-clay">Directorio y Matriz de Proveedores Críticos</h3>
              <p className="text-xs text-bananur-clay-light">Monitorea y cataloga tus proveedores de insumos del taller (3D, lanas, hilos, embalajes) y gestiona órdenes de compra históricas.</p>
            </div>
            
            <button
              id="erp-prov-btn-new-supplier"
              onClick={() => setShowSupplierModal(true)}
              className="flex items-center gap-2 bg-bananur-clay text-white px-4 py-2 rounded-xl text-xs font-semibold hover:bg-bananur-gold hover:text-bananur-clay transition-all shadow-xs cursor-pointer"
            >
              <UserPlus className="w-4 h-4" />
              Nuevo Proveedor
            </button>
          </div>

          {/* SEARCH AND FILTERS BAR FOR SUPPLIERS */}
          <div className="bg-white p-4 rounded-xl border border-bananur-sand flex flex-col md:flex-row gap-4 items-center shadow-xs">
            <div className="relative flex-1 w-full">
              <input
                id="crm-supplier-search"
                type="text"
                placeholder="Buscar proveedor por nombre, empresa o insumo crítico..."
                value={supplierSearchQuery}
                onChange={(e) => setSupplierSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-bananur-cream/30 border border-bananur-sand/80 rounded-lg text-xs focus:outline-none focus:border-bananur-gold text-bananur-clay"
              />
              <Search className="w-4 h-4 text-bananur-clay-light absolute left-3 top-1/2 -translate-y-1/2" />
            </div>
            <div className="flex items-center gap-2 w-full md:w-auto text-xs">
              <label className="text-xs font-mono text-bananur-clay-light shrink-0">Categoría:</label>
              <select
                id="crm-supplier-category-filter"
                value={supplierCategoryFilter}
                onChange={(e) => setSupplierCategoryFilter(e.target.value)}
                className="w-full md:w-44 p-2 bg-white border border-bananur-sand rounded-lg text-xs font-medium text-bananur-clay cursor-pointer"
              >
                <option value="Todos">Todas las categorías</option>
                <option value="Impresión 3D">Impresión 3D</option>
                <option value="Costura">Costura</option>
                <option value="Crochet">Crochet</option>
                <option value="Embalaje">Embalaje</option>
                <option value="Herramientas">Herramientas</option>
              </select>
            </div>
          </div>

          {/* CRM SUPPLIERS REGISTER FORM */}
          {showSupplierModal && (
            <form onSubmit={handleAddSupplierSubmit} className="bg-white p-5 rounded-2xl border-2 border-[#B58455] border-dashed space-y-4 animate-scale-up">
              <div className="flex items-center justify-between border-b pb-2 shrink-0">
                <span className="text-xs font-mono uppercase font-bold text-[#B58455]">Asociar Nueva Cadena de Suministro (Proveedor)</span>
                <button type="button" onClick={() => setShowSupplierModal(false)} className="text-xs text-bananur-coral font-bold hover:underline">Cerrar</button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs font-sans">
                <div>
                  <label className="block text-[10px] font-mono uppercase font-semibold text-bananur-clay-light mb-1">Nombre Representante</label>
                  <input
                    id="new-prov-name"
                    type="text"
                    required
                    placeholder="Ej. Sofía Pinilla"
                    value={pName}
                    onChange={(e) => setPName(e.target.value)}
                    className="w-full p-2 bg-bananur-cream/30 border border-bananur-sand rounded-lg text-bananur-clay"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-mono uppercase font-semibold text-bananur-clay-light mb-1">Distribuidora / Marca</label>
                  <input
                    id="new-prov-company"
                    type="text"
                    placeholder="Ej. Seda & Algodones Chilenos"
                    value={pCompany}
                    onChange={(e) => setPCompany(e.target.value)}
                    className="w-full p-2 bg-bananur-cream/30 border border-bananur-sand rounded-lg text-bananur-clay"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-mono uppercase font-semibold text-[#524742]/65 mb-1">Correo Electrónico</label>
                  <input
                    id="new-prov-email"
                    type="email"
                    required
                    placeholder="spinilla@algodones.cl"
                    value={pEmail}
                    onChange={(e) => setPEmail(e.target.value)}
                    className="w-full p-2 bg-bananur-cream/30 border border-bananur-sand rounded-lg font-mono text-bananur-clay"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs font-sans">
                <div>
                  <label className="block text-[10px] font-mono uppercase font-semibold text-bananur-clay-light mb-1">Teléfono Directo</label>
                  <input
                    id="new-prov-phone"
                    type="text"
                    placeholder="+56 9 7411..."
                    value={pPhone}
                    onChange={(e) => setPPhone(e.target.value)}
                    className="w-full p-2 bg-bananur-cream/30 border border-bananur-sand rounded-lg text-bananur-clay"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-mono uppercase font-semibold text-bananur-clay-light mb-1">Categoría Técnica de Suministro</label>
                  <select
                    id="new-prov-category"
                    value={pCategory}
                    onChange={(e) => setPCategory(e.target.value)}
                    className="w-full p-2 bg-white border border-bananur-sand rounded-lg cursor-pointer font-semibold text-bananur-clay"
                  >
                    {supplierCategories.map(cat => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-[10px] font-mono uppercase font-semibold text-[#524742]/65 mb-1">Inversión Compra Histórica ($)</label>
                  <input
                    id="new-prov-purchases"
                    type="number"
                    min="0"
                    placeholder="250000"
                    value={pPurchases}
                    onChange={(e) => setPPurchases(e.target.value)}
                    className="w-full p-2 bg-bananur-cream/30 border border-bananur-sand rounded-lg text-bananur-clay"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs font-sans">
                <div>
                  <label className="block text-[10px] font-mono uppercase font-semibold text-bananur-clay-light mb-1">Insumo Clave Abastecido (Ej. filamentos, bobinas, lanas, cajas, etc.)</label>
                  <input
                    id="new-prov-item"
                    type="text"
                    required
                    placeholder="Ej. Hilado de cáñamo e hilos d'Ischia"
                    value={pItem}
                    onChange={(e) => setPItem(e.target.value)}
                    className="w-full p-2 bg-bananur-cream/30 border border-bananur-sand rounded-lg text-bananur-clay"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-mono uppercase font-semibold text-bananur-clay-light mb-1">Acuerdos de Despacho y Notas Internas</label>
                  <textarea
                    id="new-prov-notes"
                    rows={2}
                    placeholder="Tiempos promedio de despacho, plazos para emitir facturas, etc."
                    value={pNotes}
                    onChange={(e) => setPNotes(e.target.value)}
                    className="w-full p-2 bg-bananur-cream/30 border border-bananur-sand rounded-lg text-bananur-clay"
                  />
                </div>
              </div>

              <button type="submit" className="bg-bananur-clay text-white px-5 py-2.5 rounded-xl font-bold text-xs hover:bg-bananur-gold hover:text-bananur-clay cursor-pointer">
                Guardar Proveedor Asociado
              </button>
            </form>
          )}

          {/* CRM SUPPLIERS EDIT FORM INLINE */}
          {editingSupplier && (
            <form 
              onSubmit={(e) => {
                e.preventDefault();
                setCrmSuppliers(prev => prev.map(s => s.id === editingSupplier.id ? editingSupplier : s));
                setEditingSupplier(null);
                if (onShowToast) {
                  onShowToast('Proveedor Actualizado', `La información de ${editingSupplier.name} se ha guardado correctamente.`, 'success');
                }
              }} 
              className="bg-white p-5 rounded-2xl border-2 border-[#B58455] space-y-4 animate-scale-up"
            >
              <div className="flex items-center justify-between border-b pb-2 shrink-0">
                <span className="text-xs font-mono uppercase font-bold text-[#B58455]">Editar Proveedor</span>
                <button type="button" onClick={() => setEditingSupplier(null)} className="text-xs text-bananur-coral font-bold hover:underline">Cancelar</button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs font-sans">
                <div>
                  <label className="block text-[10px] font-mono uppercase font-semibold text-bananur-clay-light mb-1">Nombre Representante</label>
                  <input
                    type="text"
                    required
                    value={editingSupplier.name}
                    onChange={(e) => setEditingSupplier({ ...editingSupplier, name: e.target.value })}
                    className="w-full p-2 bg-bananur-cream/30 border border-bananur-sand rounded-lg text-bananur-clay"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-mono uppercase font-semibold text-bananur-clay-light mb-1">Distribuidora / Marca</label>
                  <input
                    type="text"
                    value={editingSupplier.company}
                    onChange={(e) => setEditingSupplier({ ...editingSupplier, company: e.target.value })}
                    className="w-full p-2 bg-bananur-cream/30 border border-bananur-sand rounded-lg text-bananur-clay"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-mono uppercase font-semibold text-[#524742]/65 mb-1">Correo Electrónico</label>
                  <input
                    type="email"
                    required
                    value={editingSupplier.email}
                    onChange={(e) => setEditingSupplier({ ...editingSupplier, email: e.target.value })}
                    className="w-full p-2 bg-bananur-cream/30 border border-bananur-sand rounded-lg font-mono text-bananur-clay"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 text-xs font-sans">
                <div>
                  <label className="block text-[10px] font-mono uppercase font-semibold text-bananur-clay-light mb-1">Teléfono Directo</label>
                  <input
                    type="text"
                    value={editingSupplier.phone}
                    onChange={(e) => setEditingSupplier({ ...editingSupplier, phone: e.target.value })}
                    className="w-full p-2 bg-bananur-cream/30 border border-bananur-sand rounded-lg text-bananur-clay"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-mono uppercase font-semibold text-bananur-clay-light mb-1">Categoría Técnica</label>
                  <select
                    value={editingSupplier.category}
                    onChange={(e) => setEditingSupplier({ ...editingSupplier, category: e.target.value })}
                    className="w-full p-2 bg-white border border-bananur-sand rounded-lg cursor-pointer font-semibold text-bananur-clay"
                  >
                    {supplierCategories.map(cat => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-[10px] font-mono uppercase font-semibold text-[#524742]/65 mb-1">Inversión Compra Histórica ($)</label>
                  <input
                    type="number"
                    min="0"
                    value={editingSupplier.totalPurchases}
                    onChange={(e) => setEditingSupplier({ ...editingSupplier, totalPurchases: Number(e.target.value) || 0 })}
                    className="w-full p-2 bg-bananur-cream/30 border border-bananur-sand rounded-lg text-bananur-clay"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-mono uppercase font-semibold text-bananur-clay-light mb-1">Estado de Distribuidor</label>
                  <select
                    value={editingSupplier.status}
                    onChange={(e) => setEditingSupplier({ ...editingSupplier, status: e.target.value as any })}
                    className="w-full p-2 bg-white border border-bananur-sand rounded-lg cursor-pointer font-bold text-bananur-clay"
                  >
                    <option value="Activo">🟢 Activo</option>
                    <option value="Inactivo">🔴 Inactivo</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs font-sans">
                <div>
                  <label className="block text-[10px] font-mono uppercase font-semibold text-bananur-clay-light mb-1">Insumo Clave Suministrado</label>
                  <input
                    type="text"
                    required
                    value={editingSupplier.supplyItem}
                    onChange={(e) => setEditingSupplier({ ...editingSupplier, supplyItem: e.target.value })}
                    className="w-full p-2 bg-bananur-cream/30 border border-bananur-sand rounded-lg text-bananur-clay"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-mono uppercase font-semibold text-bananur-clay-light mb-1">Acuerdos de Despacho y Notas Internas</label>
                  <textarea
                    rows={2}
                    value={editingSupplier.internalNotes}
                    onChange={(e) => setEditingSupplier({ ...editingSupplier, internalNotes: e.target.value })}
                    className="w-full p-2 bg-bananur-cream/30 border border-bananur-sand rounded-lg text-bananur-clay"
                  />
                </div>
              </div>

              <div className="flex gap-2 justify-end pt-2">
                <button type="button" onClick={() => setEditingSupplier(null)} className="px-4 py-2 bg-bananur-sand/35 hover:bg-bananur-sand/65 text-bananur-clay rounded-xl text-xs font-semibold cursor-pointer">
                  Cancelar
                </button>
                <button type="submit" className="bg-bananur-clay text-white px-5 py-2.5 rounded-xl font-bold text-xs hover:bg-bananur-gold hover:text-bananur-clay cursor-pointer">
                  Guardar Cambios
                </button>
              </div>
            </form>
          )}

          {/* BARRA DE VISTA Y CONTADOR PARA PROVEEDORES */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-[11px] text-bananur-clay-light/80 font-mono bg-bananur-cream/35 p-3 rounded-xl border border-bananur-sand/40">
            <div className="flex flex-wrap items-center gap-2">
              <span>
                Mostrando <strong className="font-bold text-bananur-clay">{filteredSuppliers.length === 0 ? 0 : (suppliersPage - 1) * suppliersPerPage + 1}-{Math.min(suppliersPage * suppliersPerPage, filteredSuppliers.length)}</strong> de <strong className="font-semibold">{filteredSuppliers.length}</strong> proveedores estratégicos registrados.
              </span>
              {totalSuppliersPages > 1 && (
                <span className="text-[10px] bg-bananur-sand/40 text-bananur-clay px-2 py-0.5 rounded-full font-sans font-semibold">
                  Página {suppliersPage} de {totalSuppliersPages}
                </span>
              )}
            </div>

            {/* Selector de visualización: Tarjeta vs Lista */}
            <div className="flex items-center gap-1 bg-white p-1 rounded-xl border border-bananur-sand/60 shadow-3xs self-end sm:self-auto">
              <button
                type="button"
                id="crm-suppliers-view-table-btn"
                onClick={() => setSuppliersViewMode('table')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-sans font-bold transition-all cursor-pointer ${
                  suppliersViewMode === 'table'
                    ? 'bg-bananur-clay text-white shadow-xs'
                    : 'text-bananur-clay-light hover:text-bananur-clay hover:bg-bananur-cream/50'
                }`}
                title="Vista en Lista / Tabla"
              >
                <List className="w-3.5 h-3.5" />
                <span>Lista</span>
              </button>
              <button
                type="button"
                id="crm-suppliers-view-cards-btn"
                onClick={() => setSuppliersViewMode('cards')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-sans font-bold transition-all cursor-pointer ${
                  suppliersViewMode === 'cards'
                    ? 'bg-bananur-clay text-white shadow-xs'
                    : 'text-bananur-clay-light hover:text-bananur-clay hover:bg-bananur-cream/50'
                }`}
                title="Vista en Tarjetas"
              >
                <LayoutGrid className="w-3.5 h-3.5" />
                <span>Tarjetas</span>
              </button>
            </div>
          </div>

          {/* VISTA 1: MODO TARJETAS (CARDS) */}
          {suppliersViewMode === 'cards' ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {filteredSuppliers.length === 0 ? (
                <div className="col-span-2 text-center py-8 text-xs text-bananur-clay-light/80 bg-white rounded-xl border border-bananur-sand">
                  No hay proveedores registrados con los filtros de búsqueda actuales.
                </div>
              ) : (
                paginatedSuppliers.map((supplier) => {
                  const getSupplierCategoryStyle = (cat: SupplierCRM['category']) => {
                    if (cat === 'Impresión 3D') return 'bg-cyan-50 text-cyan-800 border-cyan-200';
                    if (cat === 'Costura') return 'bg-rose-50 text-rose-800 border-rose-200';
                    if (cat === 'Crochet') return 'bg-amber-50 text-amber-800 border-amber-200';
                    if (cat === 'Embalaje') return 'bg-emerald-50 text-emerald-800 border-emerald-200';
                    return 'bg-bananur-cream text-bananur-clay-light border-bananur-sand/80';
                  };

                  return (
                    <div key={supplier.id} className="bg-white p-6 rounded-2xl border border-bananur-sand shadow-xs space-y-4 flex flex-col justify-between">
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <span className={`px-2 py-0.5 text-[9px] font-mono font-bold rounded-full border uppercase tracking-wide ${getSupplierCategoryStyle(supplier.category)}`}>
                            {supplier.category}
                          </span>
                          
                          <div className="flex items-center gap-1.5">
                            <button
                              type="button"
                              onClick={() => setEditingSupplier(supplier)}
                              className="px-1.5 py-0.5 bg-bananur-sand/30 hover:bg-bananur-sand/70 text-bananur-clay text-[10px] font-bold rounded-sm transition-colors cursor-pointer"
                              title="Editar Datos & Estado"
                            >
                              ✏️ Editar
                            </button>
                            <span className="text-[10px] font-mono text-bananur-clay-light/50 font-bold">{supplier.id}</span>
                          </div>
                        </div>

                        <div>
                          <h4 className="font-serif text-lg font-bold text-bananur-clay leading-snug">{supplier.name}</h4>
                          <p className="text-xs text-[#B58455] font-semibold mt-0.5">{supplier.company}</p>
                        </div>

                        <div className="grid grid-cols-2 gap-2 text-[11px] font-medium pt-1.5 leading-normal">
                          <div>
                            <span className="text-[9px] text-[#524742]/50 font-mono block">Correo de Ventas</span>
                            <span className="text-bananur-clay truncate max-w-full font-mono block">{supplier.email}</span>
                          </div>
                          <div>
                            <span className="text-[9px] text-[#524742]/50 font-mono block">Contacto Telefónico</span>
                            <span className="text-bananur-clay flex items-center font-mono block">{supplier.phone}</span>
                          </div>
                        </div>

                        <div className="p-3 bg-bananur-cream/30 border border-bananur-sand/40 rounded-xl space-y-1.5 text-xs">
                          <div>
                            <span className="text-[9px] uppercase font-mono text-bananur-clay-light/60 font-bold block">Insumo Clave Suministrado:</span>
                            <p className="text-bananur-clay mt-0.5 font-semibold">{supplier.supplyItem}</p>
                          </div>
                          <div>
                            <span className="text-[9px] uppercase font-mono text-bananur-clay-light/60 font-bold block">Acuerdos y Logística:</span>
                            <p className="text-bananur-clay-light italic text-[11px] font-light mt-0.5">{supplier.internalNotes}</p>
                          </div>
                        </div>
                      </div>

                      <div className="flex justify-between items-center border-t border-bananur-sand/40 pt-3 text-xs mt-2 shrink-0">
                        <div>
                          <span className="text-[9px] font-mono text-bananur-clay-light/60 uppercase block">Compra Histórica Acumulada</span>
                          <span className="font-mono text-xs font-bold text-bananur-clay">${supplier.totalPurchases.toLocaleString('es-CL')} CLP</span>
                        </div>

                        {supplier.status !== 'Inactivo' ? (
                          <span className="inline-flex items-center gap-1 text-[10px] text-emerald-600 font-bold bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                            <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse"></span>
                            Activo
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-[10px] text-red-500 font-bold bg-red-50 px-2 py-0.5 rounded border border-red-200">
                            <span className="w-1.5 h-1.5 bg-red-400 rounded-full"></span>
                            Inactivo
                          </span>
                        )}
                      </div>

                    </div>
                  );
                })
              )}
            </div>
          ) : (
            /* VISTA 2: MODO LISTA / TABLA TRADICIONAL */
            <div className="bg-white rounded-2xl border border-bananur-sand overflow-hidden shadow-xs">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-bananur-cream/50 border-b border-bananur-sand text-[10px] font-mono uppercase tracking-widest text-bananur-clay-light">
                      <th className="py-4 px-6">ID Proveedor</th>
                      <th className="py-4">Representante & Empresa</th>
                      <th className="py-4">Categoría Técnica</th>
                      <th className="py-4">Insumo Clave Suministrado</th>
                      <th className="py-4">Contacto (Email / Teléfono)</th>
                      <th className="py-4">Compra Histórica</th>
                      <th className="py-4">Estado</th>
                      <th className="py-4 px-6 text-right">Acciones</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-bananur-sand/50 text-xs text-bananur-clay">
                    {filteredSuppliers.length === 0 ? (
                      <tr>
                        <td colSpan={8} className="py-12 text-center text-bananur-clay-light italic bg-bananur-cream/10">
                          <div className="max-w-md mx-auto space-y-2">
                            <span className="text-xl">🔍</span>
                            <p className="font-serif font-bold text-sm text-bananur-clay text-center">Sin proveedores registrados</p>
                            <p className="text-[11px] leading-relaxed">
                              No se encontraron registros de distribuidores o talleres para los filtros seleccionados.
                            </p>
                          </div>
                        </td>
                      </tr>
                    ) : (
                      paginatedSuppliers.map((supplier) => {
                        const getCatBadge = (cat: SupplierCRM['category']) => {
                          if (cat === 'Impresión 3D') return 'bg-cyan-50 text-cyan-800 border-cyan-200';
                          if (cat === 'Costura') return 'bg-rose-50 text-rose-800 border-rose-200';
                          if (cat === 'Crochet') return 'bg-amber-50 text-amber-800 border-amber-200';
                          if (cat === 'Embalaje') return 'bg-emerald-50 text-emerald-800 border-emerald-200';
                          return 'bg-bananur-cream text-bananur-clay-light border-bananur-sand/80';
                        };

                        return (
                          <tr key={supplier.id} className="hover:bg-bananur-sand/10 transition-colors">
                            <td className="py-4 px-6 font-mono font-bold text-bananur-clay-light">{supplier.id}</td>
                            <td className="py-4">
                              <span className="font-serif font-bold text-bananur-clay block">{supplier.name}</span>
                              <span className="text-[11px] text-[#B58455] font-medium">{supplier.company}</span>
                            </td>
                            <td className="py-4">
                              <span className={`px-2 py-0.5 text-[9px] font-mono font-bold rounded-full border uppercase tracking-wide ${getCatBadge(supplier.category)}`}>
                                {supplier.category}
                              </span>
                            </td>
                            <td className="py-4 max-w-xs pr-4">
                              <span className="font-semibold text-bananur-clay block text-xs">{supplier.supplyItem}</span>
                              {supplier.internalNotes && (
                                <span className="text-[10px] text-bananur-clay-light italic line-clamp-1">{supplier.internalNotes}</span>
                              )}
                            </td>
                            <td className="py-4 font-mono text-[11px]">
                              <span className="text-bananur-clay block">{supplier.email}</span>
                              <span className="text-bananur-clay-light text-[10px]">{supplier.phone}</span>
                            </td>
                            <td className="py-4 font-mono font-bold text-bananur-clay">
                              ${supplier.totalPurchases.toLocaleString('es-CL')} CLP
                            </td>
                            <td className="py-4">
                              {supplier.status !== 'Inactivo' ? (
                                <span className="inline-flex items-center gap-1 text-[10px] text-emerald-600 font-bold bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                                  <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse"></span>
                                  Activo
                                </span>
                              ) : (
                                <span className="inline-flex items-center gap-1 text-[10px] text-red-500 font-bold bg-red-50 px-2 py-0.5 rounded border border-red-200">
                                  <span className="w-1.5 h-1.5 bg-red-400 rounded-full"></span>
                                  Inactivo
                                </span>
                              )}
                            </td>
                            <td className="py-4 px-6 text-right">
                              <button
                                type="button"
                                onClick={() => setEditingSupplier(supplier)}
                                className="p-1.5 bg-white border border-bananur-sand hover:border-bananur-clay hover:bg-bananur-cream/30 text-bananur-clay rounded-lg transition-all cursor-pointer font-bold text-xs inline-flex items-center gap-1"
                                title="Editar Proveedor"
                              >
                                <Pencil className="w-3.5 h-3.5" />
                                <span>Editar</span>
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
          )}

          {/* BARRA DE PAGINACIÓN DE PROVEEDORES */}
          {totalSuppliersPages > 1 && (
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2 px-1">
              <span className="text-xs text-bananur-clay-light font-mono">
                Mostrando página <strong className="text-bananur-clay">{suppliersPage}</strong> de <strong className="text-bananur-clay">{totalSuppliersPages}</strong> ({filteredSuppliers.length} proveedores totales)
              </span>
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  id="crm-suppliers-pagination-prev"
                  disabled={suppliersPage <= 1}
                  onClick={() => setSuppliersPage(prev => Math.max(1, prev - 1))}
                  className="px-3 py-1.5 rounded-xl border border-bananur-sand text-xs font-mono font-bold bg-white hover:bg-bananur-cream text-bananur-clay disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer flex items-center gap-1 shadow-3xs"
                >
                  <ChevronLeft className="w-3.5 h-3.5" />
                  Anterior
                </button>
                <div className="flex items-center gap-1">
                  {Array.from({ length: totalSuppliersPages }).map((_, pIdx) => {
                    const pageNum = pIdx + 1;
                    return (
                      <button
                        key={pageNum}
                        type="button"
                        onClick={() => setSuppliersPage(pageNum)}
                        className={`w-8 h-8 rounded-xl text-xs font-mono font-bold transition-all cursor-pointer ${
                          suppliersPage === pageNum
                            ? 'bg-bananur-clay text-white shadow-xs'
                            : 'bg-white border border-bananur-sand text-bananur-clay hover:bg-bananur-cream'
                        }`}
                      >
                        {pageNum}
                      </button>
                    );
                  })}
                </div>
                <button
                  type="button"
                  id="crm-suppliers-pagination-next"
                  disabled={suppliersPage >= totalSuppliersPages}
                  onClick={() => setSuppliersPage(prev => Math.min(totalSuppliersPages, prev + 1))}
                  className="px-3 py-1.5 rounded-xl border border-bananur-sand text-xs font-mono font-bold bg-white hover:bg-bananur-cream text-bananur-clay disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer flex items-center gap-1 shadow-3xs"
                >
                  Siguiente
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          )}

        </div>
      )}

    </div>
  );
}
