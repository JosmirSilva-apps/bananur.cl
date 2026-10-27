import { useState, useMemo } from 'react';
import { 
  ShoppingBag, 
  Hourglass, 
  Sparkles, 
  Calendar, 
  TrendingUp, 
  AlertCircle, 
  ArrowUpRight, 
  BarChart2, 
  Layers, 
  LayoutDashboard, 
  Building2, 
  Wrench, 
  Users, 
  ClipboardList, 
  ShieldCheck, 
  Video, 
  Clock, 
  User, 
  Package, 
  Truck, 
  CheckCircle, 
  Flame,
  FileCheck2
} from 'lucide-react';
import { Order, Consultation, Product, ProductionBatch } from '../types';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell
} from 'recharts';

interface AdminDashboardProps {
  orders: Order[];
  products: Product[];
  consultations: Consultation[];
  onNavigateToTab: (tab: string) => void;
  onUpdateOrderStatus: (id: string, status: 'En preparación' | 'Enviado' | 'Entregado') => void;
  onShowToast?: (title: string, description: string, type?: 'success' | 'info' | 'warning' | 'error') => void;
  clientCategories?: string[];
  supplierCategories?: string[];
  activeModule?: 'analytics' | 'kpi' | 'mrp' | 'plm' | 'fa' | 'crm';
  onModuleChange?: (mod: 'analytics' | 'kpi' | 'mrp' | 'plm' | 'fa' | 'crm') => void;
}

const COLORS = ['#28402F', '#C86A50', '#A4BC9F', '#314E38', '#516256'];

export default function AdminDashboard({
  orders,
  products,
  consultations,
  onNavigateToTab,
  onUpdateOrderStatus,
  onShowToast,
  clientCategories,
  supplierCategories
}: AdminDashboardProps) {

  const [pieMode, setPieMode] = useState<'sales' | 'inventory'>('sales');
  
  // June 2026 Interactive Calendar states
  const [selectedDay, setSelectedDay] = useState<number>(22);
  const [blockedDays, setBlockedDays] = useState<number[]>([15, 16, 21]);

  const totalDays = 30;
  const daysArray = Array.from({ length: totalDays }, (_, i) => i + 1);

  // Raw Materials Mock (for ERP Alerts & KPI calculation, matching AdminERP)
  const mockMaterials = [
    { id: 'mat-1', name: 'Filamento PLA (1.75mm)', stock: 5, lowStockAlert: 8 },
    { id: 'mat-2', name: "Tela de Algodón d'Ischia", stock: 1, lowStockAlert: 4 },
    { id: 'mat-3', name: 'Hilado de Algodón Orgánico', stock: 120, lowStockAlert: 150 },
    { id: 'mat-4', name: 'Caja de Envío Ecológica Bananur S', stock: 65, lowStockAlert: 15 },
    { id: 'mat-5', name: 'Filamento PETG Industrial', stock: 0, lowStockAlert: 3 }
  ];

  const lowStockInsumosCount = mockMaterials.filter(m => m.stock <= m.lowStockAlert).length;

  // Production Batches Mock (for ERP alerts and Calendar representation)
  const [productionBatches, setProductionBatches] = useState<ProductionBatch[]>([
    { id: 'batch-101', orderId: 'OR-5221', clientName: 'Roberto Fuentes', productName: 'Soporte Geométrico 3D Reciclado', quantity: 15, artisan: 'Yo (Creador & Artesano Único)', progress: 65, currentStage: 'Procesamiento en Cama', scheduledDay: 15 },
    { id: 'batch-102', orderId: 'OR-5223', clientName: 'Daniela Almonacid', productName: "Estuche de Costura con Algodón d'Ischia", quantity: 5, artisan: 'Yo (Creador & Artesano Único)', progress: 30, currentStage: 'Corte & Confección', scheduledDay: 20 },
    { id: 'batch-103', orderId: 'OR-5224', clientName: 'Guillermo Schmidt', productName: 'Soportes de Filamento PETG Reforzados', quantity: 50, artisan: 'Yo (Creador & Artesano Único)', progress: 15, currentStage: 'Modelado / Diseño', scheduledDay: 24 },
    { id: 'batch-104', orderId: 'OR-5198', clientName: 'María Ignacia Valenzuela', productName: 'Amigurumi de Jirafa "Tierra Dulce"', quantity: 10, artisan: 'Yo (Creador & Artesano Único)', progress: 90, currentStage: 'Tejido Manual', scheduledDay: 10 }
  ]);

  // Calculations for KPIs
  const monthlySalesTotal = orders.reduce((sum, o) => sum + o.total, 0);
  const pendingOrdersCount = orders.filter(o => o.status === 'En preparación').length;
  const activeConsultationsCount = consultations.filter(c => c.status === 'Agendada').length;
  
  // Net estimated utility (Gross - simulated taxes/costs)
  const netEstimatedUtility = Math.round(monthlySalesTotal * 0.62);

  // Process Daily Sales for Line/Area Chart
  const dailySalesData = useMemo(() => {
    const salesMap: Record<string, { total: number; count: number }> = {};
    
    orders.forEach(o => {
      const d = o.date;
      if (!salesMap[d]) {
        salesMap[d] = { total: 0, count: 0 };
      }
      salesMap[d].total += o.total;
      salesMap[d].count += 1;
    });

    const sortedDates = Object.keys(salesMap).sort();

    return sortedDates.map(d => {
      let label = d;
      try {
        const parts = d.split('-');
        if (parts.length === 3) {
          const monthNum = parseInt(parts[1], 10);
          const day = parseInt(parts[2], 10);
          const months = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];
          label = `${day} ${months[monthNum - 1]}`;
        }
      } catch (e) {}

      return {
        date: d,
        label,
        "Ventas": salesMap[d].total,
        "Cantidad": salesMap[d].count
      };
    });
  }, [orders]);

  // Process Category Sales and Inventory data
  const categorySalesData = useMemo(() => {
    const salesMap: Record<string, { total: number; qty: number }> = {};
    
    orders.forEach(order => {
      order.items.forEach(item => {
        const prod = products.find(p => p.id === item.productId || p.name === item.productName);
        const cat = prod?.category || 'Otros';
        if (!salesMap[cat]) {
          salesMap[cat] = { total: 0, qty: 0 };
        }
        salesMap[cat].total += item.price * item.quantity;
        salesMap[cat].qty += item.quantity;
      });
    });

    if (Object.keys(salesMap).length === 0) {
      return [
        { name: 'Papelería', value: 120000, cantidad: 5 },
        { name: 'Accesorios', value: 85000, cantidad: 3 },
        { name: 'Arte & Decoración', value: 45000, cantidad: 1 }
      ];
    }

    return Object.entries(salesMap).map(([name, stats]) => ({
      name,
      value: stats.total,
      cantidad: stats.qty
    }));
  }, [orders, products]);

  const categoryInventoryData = useMemo(() => {
    const invMap: Record<string, { count: number; stock: number; totalValue: number }> = {};
    
    products.forEach(p => {
      const cat = p.category || 'Otros';
      if (!invMap[cat]) {
        invMap[cat] = { count: 0, stock: 0, totalValue: 0 };
      }
      invMap[cat].count += 1;
      invMap[cat].stock += p.stock;
      invMap[cat].totalValue += (p.price * p.stock);
    });

    if (Object.keys(invMap).length === 0) {
      return [
        { name: 'Papelería', value: 4, stock: 45, valorInventario: 1124500 },
        { name: 'Accesorios', value: 3, stock: 24, valorInventario: 540000 },
        { name: 'Arte & Decoración', value: 5, stock: 15, valorInventario: 980000 }
      ];
    }

    return Object.entries(invMap).map(([name, stats]) => ({
      name,
      value: stats.count,
      stock: stats.stock,
      valorInventario: stats.totalValue
    }));
  }, [products]);

  const totalCategorySalesSum = useMemo(() => {
    return categorySalesData.reduce((sum, item) => sum + item.value, 0);
  }, [categorySalesData]);

  const totalCategoryStockSum = useMemo(() => {
    return categoryInventoryData.reduce((sum, item) => sum + item.value, 0);
  }, [categoryInventoryData]);

  // Integrated Event Resolver for June 2026
  const getEventsForDay = (dayNum: number) => {
    const formattedDate = `2026-06-${dayNum.toString().padStart(2, '0')}`;
    
    const dayCons = consultations.filter(c => c.date === formattedDate);
    const dayOrders = orders.filter(o => o.date === formattedDate);
    const dayBatches = productionBatches.filter(b => b.scheduledDay === dayNum);

    const list: {
      id: string;
      category: 'asesoria' | 'venta' | 'produccion';
      title: string;
      subtitle: string;
      status: string;
      time?: string;
      meta: any;
    }[] = [];

    // 1. Advisories
    dayCons.forEach(c => {
      list.push({
        id: c.id,
        category: 'asesoria',
        title: c.topic,
        subtitle: `Asesoría Virtual con ${c.clientName}`,
        status: c.status,
        time: c.time,
        meta: c
      });
    });

    // 2. Scheduled Sales / Deliveries
    dayOrders.forEach(o => {
      list.push({
        id: o.id,
        category: 'venta',
        title: `Venta & Despacho - ${o.customerName}`,
        subtitle: `${o.items.map(it => `${it.quantity}x ${it.productName}`).join(', ')}`,
        status: o.status,
        meta: o
      });
    });

    // 3. Production lots
    dayBatches.forEach(b => {
      list.push({
        id: b.id,
        category: 'produccion',
        title: `Lote en Taller: ${b.productName}`,
        subtitle: `Artesano: ${b.artisan} | Cant: ${b.quantity} un.`,
        status: b.currentStage,
        meta: b
      });
    });

    return list;
  };

  const selectedDayEvents = getEventsForDay(selectedDay);

  const toggleDayBlock = (day: number) => {
    if (blockedDays.includes(day)) {
      setBlockedDays(blockedDays.filter(d => d !== day));
    } else {
      setBlockedDays([...blockedDays, day]);
    }
  };

  const handleToggleConsultationStatus = (consId: string) => {
    const updated = consultations.map(c => {
      if (c.id === consId) {
        const nextStatus = c.status === 'Agendada' ? 'Bloqueada' : 'Agendada';
        return { ...c, status: nextStatus as any };
      }
      return c;
    });
    // Triggers local notification
    if (onShowToast) {
      onShowToast('Estado Actualizado', 'El estatus del bloque horario ha sido modificado.', 'success');
    }
  };

  // Custom tooltips for Recharts
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white border border-bananur-sand p-3.5 rounded-xl shadow-lg font-sans space-y-1">
          <p className="text-[10px] font-mono text-bananur-clay-light uppercase tracking-wider font-semibold">{label}</p>
          <p className="text-xs font-bold text-bananur-sage font-mono">
            Ventas: ${payload[0].value.toLocaleString('es-CL')} CLP
          </p>
          <p className="text-[9px] text-bananur-clay-light/70 font-mono">
            Pedidos del día: {payload[0].payload.Cantidad}
          </p>
        </div>
      );
    }
    return null;
  };

  const CustomPieTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-white border border-bananur-sand p-3.5 rounded-xl shadow-lg font-sans space-y-0.5">
          <p className="text-xs font-bold text-bananur-clay">{data.name}</p>
          <p className="text-xs font-semibold text-bananur-coral font-mono">
            Monto: ${data.value.toLocaleString('es-CL')} CLP
          </p>
          <p className="text-[10px] text-bananur-clay-light font-mono">
            Unidades vendidas: {data.cantidad} un.
          </p>
        </div>
      );
    }
    return null;
  };

  const CustomPieInventoryTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-white border border-bananur-sand p-3.5 rounded-xl shadow-lg font-sans space-y-0.5">
          <p className="text-xs font-bold text-bananur-clay">{data.name}</p>
          <p className="text-xs font-semibold text-bananur-sage font-mono">
            Tipos de Producto/SKU: {data.value}
          </p>
          <p className="text-[10px] text-bananur-clay-light font-mono">
            Stock en taller: {data.stock} un.
          </p>
          <p className="text-[10px] text-bananur-clay-light font-mono">
            Valorización: ${data.valorInventario.toLocaleString('es-CL')} CLP
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="space-y-8 animate-fade-in p-6 sm:p-10 bg-bananur-cream min-h-screen">
      
      {/* Top Welcome Title Row */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-mono uppercase tracking-widest text-[#B58455] font-bold">Matriz Unificada Corporativa</span>
          <h1 className="text-3xl font-serif font-extrabold text-bananur-clay mt-1">
            Buenos días, Bananur Estudio
          </h1>
          <p className="text-xs text-bananur-clay-light/80 font-light mt-0.5">
            ERP Integrado de Control General: Monitor de Ventas, Resumen Operativo, Alertas de Taller y Agenda de Eventos Unificada en una sola pantalla.
          </p>
        </div>
        <div className="text-right shrink-0">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-bananur-sage-light text-bananur-sage text-xs font-semibold rounded-full border border-bananur-sage/20 font-mono">
            <span className="w-1.5 h-1.5 rounded-full bg-bananur-sage animate-ping" />
            SISTEMA UNIFICADO ACTIVO
          </span>
        </div>
      </div>

      {/* SECTION 1: ERP BENTO SUMMARY CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        
        <div className="bg-white p-5 rounded-2xl border border-bananur-sand shadow-xs flex flex-col justify-between">
          <div>
            <span className="text-[9px] font-mono uppercase text-bananur-clay-light/60 font-bold block">Flujo Bruto Consolidado (SII)</span>
            <div className="flex items-baseline gap-1.5 mt-1.5">
              <span className="text-2xl font-mono font-extrabold text-bananur-clay">${monthlySalesTotal.toLocaleString('es-CL')}</span>
              <span className="text-[10px] text-emerald-600 font-bold font-mono">CLP</span>
            </div>
          </div>
          <div className="text-[10px] text-emerald-600 font-bold font-mono mt-3 flex items-center gap-1">
            <TrendingUp className="w-3.5 h-3.5" />
            +18.4% vs Mes Anterior
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-bananur-sand shadow-xs flex flex-col justify-between">
          <div>
            <span className="text-[9px] font-mono uppercase text-bananur-clay-light/60 font-bold block">Utilidad Operativa Estimada</span>
            <div className="flex items-baseline gap-1.5 mt-1.5">
              <span className="text-2xl font-mono font-extrabold text-[#40916C]">${netEstimatedUtility.toLocaleString('es-CL')}</span>
              <span className="text-[10px] text-[#40916C] font-bold font-mono">NETO</span>
            </div>
          </div>
          <p className="text-[9px] text-bananur-clay-light/60 mt-3 font-light">Descontando insumos y 13.75% de retención fiscal.</p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-bananur-sand shadow-xs flex flex-col justify-between">
          <div>
            <span className="text-[9px] font-mono uppercase text-bananur-clay-light/60 font-bold block">Materiales Taller Críticos (MRP)</span>
            <div className="flex items-baseline gap-1.5 mt-1.5">
              <span className="text-2xl font-mono font-extrabold text-bananur-coral">
                {lowStockInsumosCount} Insumos
              </span>
            </div>
          </div>
          <div className="text-[10px] text-bananur-coral font-bold font-mono mt-3 flex items-center gap-1">
            <AlertCircle className="w-3.5 h-3.5" />
            Revisar stock en Taller de Encuadernación
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-bananur-sand shadow-xs flex flex-col justify-between">
          <div>
            <span className="text-[9px] font-mono uppercase text-bananur-clay-light/60 font-bold block">Lotes de Confección Activos (PLM)</span>
            <div className="flex items-baseline gap-1.5 mt-1.5">
              <span className="text-2xl font-mono font-extrabold text-bananur-gold-dark">
                {productionBatches.length} Lotes
              </span>
            </div>
          </div>
          <p className="text-[9px] text-bananur-clay-light/60 mt-3 font-light">Manufacturados éticamente a nivel individual.</p>
        </div>

      </div>

      {/* SECTION 2: MONITOR DE VENTAS (CHARTS & DISTRIBUTION) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Sales Daily Chart (Left - lg:col-span-8) */}
        <div className="lg:col-span-8 bg-white p-6 rounded-2xl border border-bananur-sand shadow-sm space-y-4 flex flex-col justify-between">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-bananur-sand/50 pb-4">
            <div>
              <h3 className="font-serif text-lg font-bold text-bananur-clay flex items-center gap-2">
                <BarChart2 className="w-5 h-5 text-bananur-sage" />
                Histórico de Venta Diaria
              </h3>
              <p className="text-xs text-bananur-clay-light/70 font-light">Evolución de facturación del comercio y asesorías (CLP)</p>
            </div>
            <div className="flex items-center gap-1.5 bg-bananur-cream/50 border border-bananur-sand rounded-lg px-2 py-1 select-none font-mono text-[10px] text-bananur-clay-light shrink-0">
              <span className="w-2 h-2 rounded-full bg-bananur-sage block" />
              Sincronizado con SII Chile
            </div>
          </div>

          <div className="w-full h-64 pt-4">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart
                data={dailySalesData}
                margin={{ top: 10, right: 10, left: 0, bottom: 0 }}
              >
                <defs>
                  <linearGradient id="salesGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#28402F" stopOpacity={0.15}/>
                    <stop offset="95%" stopColor="#28402F" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#E6EFE6" opacity={0.6} />
                <XAxis 
                  dataKey="label" 
                  tickLine={false}
                  axisLine={false}
                  stroke="#516256"
                  fontSize={10}
                  fontFamily="JetBrains Mono, monospace"
                />
                <YAxis 
                  tickLine={false}
                  axisLine={false}
                  stroke="#516256"
                  fontSize={10}
                  fontFamily="JetBrains Mono, monospace"
                  tickFormatter={(val) => `$${(val / 1000)}k`}
                />
                <Tooltip content={<CustomTooltip />} />
                <Area 
                  type="monotone" 
                  dataKey="Ventas" 
                  stroke="#28402F" 
                  strokeWidth={2.5}
                  fillOpacity={1} 
                  fill="url(#salesGradient)" 
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Product Categories Pie Chart (Right - lg:col-span-4) */}
        <div className="lg:col-span-4 bg-white p-6 rounded-2xl border border-bananur-sand shadow-sm space-y-4 flex flex-col justify-between">
          <div className="border-b border-bananur-sand/50 pb-4 flex flex-col gap-2">
            <h3 className="font-serif text-lg font-bold text-bananur-clay flex items-center gap-2">
              <Layers className="w-4 h-4 text-bananur-coral hover:rotate-45 transition-transform" />
              Categorías Boutique
            </h3>
            
            {/* Display Switcher Toggle buttons */}
            <div className="flex bg-bananur-cream/80 p-0.5 rounded-lg border border-bananur-sand/60">
              <button
                type="button"
                onClick={() => setPieMode('sales')}
                className={`flex-1 text-center py-1 rounded text-[10px] uppercase tracking-wider font-mono font-bold cursor-pointer transition-all ${
                  pieMode === 'sales'
                    ? 'bg-white text-bananur-clay shadow-xs border border-bananur-sand/40'
                    : 'text-bananur-clay-light hover:text-bananur-clay'
                }`}
              >
                Ventas CLP
              </button>
              <button
                type="button"
                onClick={() => setPieMode('inventory')}
                className={`flex-1 text-center py-1 rounded text-[10px] uppercase tracking-wider font-mono font-bold cursor-pointer transition-all ${
                  pieMode === 'inventory'
                    ? 'bg-white text-bananur-clay shadow-xs border border-bananur-sand/40'
                    : 'text-bananur-clay-light hover:text-bananur-clay'
                }`}
              >
                SKUs Catálogo
              </button>
            </div>
          </div>

          <div className="relative h-44 flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={pieMode === 'sales' ? categorySalesData : categoryInventoryData}
                  cx="50%"
                  cy="50%"
                  innerRadius={55}
                  outerRadius={75}
                  paddingAngle={3}
                  dataKey="value"
                >
                  {(pieMode === 'sales' ? categorySalesData : categoryInventoryData).map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip content={pieMode === 'sales' ? <CustomPieTooltip /> : <CustomPieInventoryTooltip />} />
              </PieChart>
            </ResponsiveContainer>

            <div className="absolute text-center select-none pointer-events-none mt-1">
              <span className="text-[8px] font-mono text-bananur-clay-light/50 uppercase tracking-widest block font-bold">
                {pieMode === 'sales' ? 'Facturado' : 'Productos'}
              </span>
              <span className="text-xs font-extrabold text-bananur-clay font-mono block">
                {pieMode === 'sales'
                  ? `$${totalCategorySalesSum.toLocaleString('es-CL')}`
                  : `${totalCategoryStockSum} SKUs`
                }
              </span>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-2 border-t border-bananur-sand/30 pt-3 text-[9px] font-mono leading-tight">
            {(pieMode === 'sales' ? categorySalesData : categoryInventoryData).map((item, idx) => (
              <div key={item.name} className="flex flex-col items-start gap-0.5">
                <span className="inline-flex items-center gap-1 font-semibold text-bananur-clay whitespace-nowrap truncate max-w-full">
                  <span className="w-1.5 h-1.5 rounded-full shrink-0" style={{ backgroundColor: COLORS[idx % COLORS.length] }} />
                  {item.name}
                </span>
                <span className="text-[8px] text-bananur-clay-light/60 pl-2.5">
                  {pieMode === 'sales' 
                    ? `$${item.value.toLocaleString('es-CL')}`
                    : `${item.value} SKUs`
                  }
                </span>
              </div>
            ))}
          </div>

        </div>

      </div>

      {/* SECTION 3: ERP ALERTS & RECENT NOTIFICATIONS */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left: Estado de Automatización & Alertas de Flujo Operativo ERP */}
        <div className="lg:col-span-7 bg-white p-6 rounded-2xl border border-bananur-sand shadow-xs space-y-4">
          <div>
            <h3 className="font-serif text-lg font-bold text-bananur-clay flex items-center gap-2">
              <ClipboardList className="w-5 h-5 text-bananur-gold" />
              Estado de Automatización & Diagnóstico ERP
            </h3>
            <p className="text-xs text-bananur-clay-light font-light mt-0.5">Alertas y sincronización de infraestructura del taller Bananur.</p>
          </div>

          <div className="space-y-3 pt-2 text-xs text-bananur-clay">
            
            <div className="flex items-center justify-between p-3.5 bg-bananur-cream/30 border border-bananur-sand/40 rounded-xl">
              <div className="space-y-0.5">
                <div className="font-semibold flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-[#40916C] animate-pulse" />
                  Facturación Electrónica SII Integrada
                </div>
                <p className="text-[10px] text-bananur-clay-light/80">Conectado de forma segura para timbrar Boletas y Facturas.</p>
              </div>
              <span className="px-2.5 py-0.5 bg-emerald-50 text-emerald-700 text-[10px] font-bold rounded-full font-mono">ACTIVO</span>
            </div>

            <div className="flex items-center justify-between p-3.5 bg-bananur-cream/30 border border-bananur-sand/40 rounded-xl">
              <div className="space-y-0.5">
                <div className="font-semibold flex items-center gap-1.5 text-bananur-clay">
                  <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
                  Matriz de Abastecimiento Crítico (MRP)
                </div>
                <p className="text-[10px] text-bananur-clay-light/80">Alerta de bajo stock activa para sábanas y filamento PLA.</p>
              </div>
              <span className="px-2.5 py-0.5 bg-amber-50 text-amber-700 text-[10px] font-bold rounded-full font-mono">REVISAR Stock</span>
            </div>

            <div className="flex items-center justify-between p-3.5 bg-bananur-cream/30 border border-bananur-sand/40 rounded-xl">
              <div className="space-y-0.5">
                <div className="font-semibold flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-[#40916C]" />
                  Courier Starken API de Envíos
                </div>
                <p className="text-[10px] text-bananur-clay-light/80">Generación automática de órdenes de flete para pedidos chilenos.</p>
              </div>
              <span className="px-2.5 py-0.5 bg-emerald-50 text-emerald-700 text-[10px] font-bold rounded-full font-mono">CONECTADO</span>
            </div>

          </div>
        </div>

        {/* Right: Operating Notifications */}
        <div className="lg:col-span-5 bg-white p-6 rounded-2xl border border-bananur-sand shadow-sm space-y-4">
          <div>
            <h3 className="font-serif text-lg font-bold text-bananur-clay">Notificaciones del Local</h3>
            <p className="text-[10px] text-bananur-clay-light/60 font-light">Registro de eventos recientes del negocio boutique</p>
          </div>
          
          <div className="space-y-4 max-h-[220px] overflow-y-auto scrollbar-hidden">
            
            <div className="flex gap-3 items-start border-l-2 border-bananur-coral pl-3 py-0.5">
              <AlertCircle className="w-4 h-4 text-bananur-coral mt-0.5 flex-shrink-0" />
              <div>
                <span className="text-[9px] font-mono font-bold uppercase text-bananur-coral block">Alerta de Inventario</span>
                <p className="text-xs font-semibold text-bananur-clay leading-tight">Quedan sábanas críticas de Agenda Minimalista 2026</p>
                <span className="text-[9px] text-bananur-clay-light/50 font-mono">Hace 13 min</span>
              </div>
            </div>

            <div className="flex gap-3 items-start border-l-2 border-bananur-gold pl-3 py-0.5">
              <Sparkles className="w-4 h-4 text-[#7C9A74] mt-0.5 flex-shrink-0" />
              <div>
                <span className="text-[9px] font-mono font-bold uppercase text-[#7C9A74] block">Cotización Nueva</span>
                <p className="text-xs font-medium text-bananur-clay leading-tight">Daniela Almonacid envió cotización (Branding - $850.000)</p>
                <span className="text-[9px] text-bananur-clay-light/50 font-mono">Hace 1 hora</span>
              </div>
            </div>

            <div className="flex gap-3 items-start border-l-2 border-bananur-clay pl-3 py-0.5">
              <ShoppingBag className="w-4 h-4 text-bananur-sage mt-0.5 flex-shrink-0" />
              <div>
                <span className="text-[9px] font-mono font-bold uppercase text-bananur-sage block">Pedido Pagado</span>
                <p className="text-xs font-medium text-bananur-clay leading-tight">Roberto Fuentes (Estudios Sigma SpA) emitió Factura SII</p>
                <span className="text-[9px] text-bananur-clay-light/50 font-mono">Hace 4 horas</span>
              </div>
            </div>

          </div>
        </div>

      </div>
    </div>
  );
}
