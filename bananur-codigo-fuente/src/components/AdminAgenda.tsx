import React, { useState, useMemo } from 'react';
import { Consultation, Order, ProductionBatch, Product } from '../types';
import { 
  CalendarDays, 
  Video, 
  Clock, 
  Check, 
  AlertTriangle, 
  Plus, 
  X, 
  User, 
  Calendar, 
  Truck, 
  Sparkles, 
  Activity,
  Search
} from 'lucide-react';

interface AdminAgendaProps {
  consultations: Consultation[];
  onToggleTimeSlot: (id: string) => void;
  onAddConsultation: (cons: Consultation) => void;
  orders?: Order[];
  onAddOrder?: (order: Order) => void;
  onUpdateOrderStatus?: (id: string, status: 'En preparación' | 'Enviado' | 'Entregado') => void;
  onShowToast?: (title: string, description: string, type?: 'success' | 'info' | 'warning' | 'error') => void;
  responsables?: string[];
  products?: Product[];
}

export default function AdminAgenda({
  consultations,
  onToggleTimeSlot,
  onAddConsultation,
  orders = [],
  onAddOrder,
  onUpdateOrderStatus,
  onShowToast,
  responsables = [
    'Yo (Creador & Responsable Único)',
    'Constanza Silva',
    'Carlos Ruiz',
    'Francisca Leiva'
  ],
  products = []
}: AdminAgendaProps) {
  // June 2026 Interactive Calendar states
  const [selectedDay, setSelectedDay] = useState<number>(22);
  const [blockedDays, setBlockedDays] = useState<number[]>([15, 16, 21]);

  // Dynamic Month and Year states
  const [currentYear, setCurrentYear] = useState<number>(2026);
  const [currentMonth, setCurrentMonth] = useState<number>(5); // 0-indexed, 5 is June
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<'Todos' | 'asesoria' | 'venta' | 'produccion'>('Todos');

  const MONTH_NAMES = [
    'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
    'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
  ];

  const totalDays = new Date(currentYear, currentMonth + 1, 0).getDate();
  const daysArray = Array.from({ length: totalDays }, (_, i) => i + 1);
  
  // Create Consultation / Event Modal State
  const [showAddModal, setShowAddModal] = useState(false);
  const [eventType, setEventType] = useState<'asesoria' | 'venta' | 'produccion'>('asesoria');

  // Unique customers list from orders & consultations
  const registeredClients = useMemo(() => {
    const clientsMap = new Map<string, { name: string; email: string; phone?: string }>();
    
    // Add from orders
    orders.forEach(o => {
      if (o.customerName && !clientsMap.has(o.customerName.toLowerCase())) {
        clientsMap.set(o.customerName.toLowerCase(), {
          name: o.customerName,
          email: o.customerEmail,
          phone: o.customerPhone
        });
      }
    });
    
    // Add from consultations
    consultations.forEach(c => {
      if (c.clientName && !clientsMap.has(c.clientName.toLowerCase())) {
        clientsMap.set(c.clientName.toLowerCase(), {
          name: c.clientName,
          email: c.clientEmail,
          phone: c.clientPhone
        });
      }
    });

    return Array.from(clientsMap.values());
  }, [orders, consultations]);

  // Registered products list
  const registeredProducts = useMemo(() => {
    const prods = new Map<string, number>(); // name -> price
    
    // From props products
    if (products) {
      products.forEach(p => {
        prods.set(p.name, p.price);
      });
    }
    
    // Also from order items
    orders.forEach(o => {
      o.items.forEach(it => {
        prods.set(it.productName, it.price);
      });
    });
    
    return Array.from(prods.entries()).map(([name, price]) => ({ name, price }));
  }, [products, orders]);

  // Common fields
  const [newTopic, setNewTopic] = useState(''); // serves as topic, item name, or product name
  const [newClientName, setNewClientName] = useState('');
  const [newClientEmail, setNewClientEmail] = useState('');
  const [newClientPhone, setNewClientPhone] = useState('');
  const [newTime, setNewTime] = useState('11:00');
  const [newDate, setNewDate] = useState('2026-06-22');

  const [selectedClientId, setSelectedClientId] = useState<string>('new');
  const [selectedProductSelector, setSelectedProductSelector] = useState<string>('custom');

  // Venta (Order) specific fields
  const [productPrice, setProductPrice] = useState<number>(4500);
  const [productQty, setProductQty] = useState<number>(1);
  const [commune, setCommune] = useState('Viña del Mar');
  const [city, setCity] = useState('Viña del Mar');
  const [docType, setDocType] = useState<'boleta' | 'factura'>('boleta');
  const [paymentMethod, setPaymentMethod] = useState<'Transferencia' | 'Tarjeta de Crédito/Débito' | 'Efectivo' | 'Mercado Pago'>('Transferencia');
  const [salesChannel, setSalesChannel] = useState<'Sitio Web' | 'Instagram' | 'WhatsApp' | 'Feria Presencial' | 'Reunión/Asesoría'>('Reunión/Asesoría');

  // Producción (Production Batch) specific fields
  const [artisan, setArtisan] = useState(responsables[0] || 'Yo (Creador & Responsable Único)');
  const [currentStage, setCurrentStage] = useState('Modelado / Diseño');

  // Local production batches mock inside the agenda to provide complete production visualizer
  const [productionBatches, setProductionBatches] = useState<ProductionBatch[]>([
    { id: 'batch-101', orderId: 'OR-5221', clientName: 'Roberto Fuentes', productName: 'Soporte Geométrico 3D Reciclado', quantity: 15, artisan: responsables[0] || 'Yo (Creador & Responsable Único)', progress: 65, currentStage: 'Procesamiento en Cama', scheduledDay: 15 },
    { id: 'batch-102', orderId: 'OR-5223', clientName: 'Daniela Almonacid', productName: "Estuche de Costura con Algodón d'Ischia", quantity: 5, artisan: responsables[0] || 'Yo (Creador & Responsable Único)', progress: 30, currentStage: 'Corte & Confección', scheduledDay: 20 },
    { id: 'batch-103', orderId: 'OR-5224', clientName: 'Guillermo Schmidt', productName: 'Soportes de Filamento PETG Reforzados', quantity: 50, artisan: responsables[0] || 'Yo (Creador & Responsable Único)', progress: 15, currentStage: 'Modelado / Diseño', scheduledDay: 24 },
    { id: 'batch-104', orderId: 'OR-5198', clientName: 'María Ignacia Valenzuela', productName: 'Amigurumi de Jirafa "Tierra Dulce"', quantity: 10, artisan: responsables[0] || 'Yo (Creador & Responsable Único)', progress: 90, currentStage: 'Tejido Manual', scheduledDay: 10 }
  ]);

  // Integrated Event Resolver
  const getEventsForDay = (dayNum: number) => {
    const formattedDate = `${currentYear}-${(currentMonth + 1).toString().padStart(2, '0')}-${dayNum.toString().padStart(2, '0')}`;
    
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
        subtitle: `Responsable: ${b.artisan} | Cant: ${b.quantity} un.`,
        status: b.currentStage,
        meta: b
      });
    });

    // Apply Search and Category Filter
    let filteredList = list;
    if (categoryFilter !== 'Todos') {
      filteredList = filteredList.filter(item => item.category === categoryFilter);
    }
    if (searchQuery.trim() !== '') {
      const q = searchQuery.toLowerCase();
      filteredList = filteredList.filter(item => 
        item.title.toLowerCase().includes(q) || 
        item.subtitle.toLowerCase().includes(q) ||
        item.id.toLowerCase().includes(q)
      );
    }

    return filteredList;
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
    onToggleTimeSlot(consId);
  };

  const handleCreateEventSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTopic.trim() || !newClientName.trim()) {
      if (onShowToast) onShowToast('Campos vacíos', 'Por favor rellena el tema/producto y el nombre del cliente.', 'warning');
      return;
    }

    const scheduledDayParsed = Number(newDate.split('-')[2]) || 1;

    if (eventType === 'asesoria') {
      if (!newClientEmail) {
        if (onShowToast) onShowToast('Falta Email', 'Por favor ingresa el correo del cliente.', 'warning');
        return;
      }
      const cons: Consultation = {
        id: `con-${Date.now()}`,
        clientName: newClientName,
        clientEmail: newClientEmail,
        clientPhone: newClientPhone || undefined,
        date: newDate,
        time: newTime,
        duration: '60 min',
        topic: newTopic,
        status: 'Agendada',
        videoLink: 'https://meet.google.com/abc-defg-hij'
      };

      onAddConsultation(cons);
      if (onShowToast) {
        onShowToast('Asesoría Agendada', `Asesoría virtual con ${cons.clientName} registrada para el ${cons.date}.`, 'success');
      }
    } else if (eventType === 'venta') {
      const subtotal = productPrice * productQty;
      const total = subtotal + 3990; // Starken standard shipping
      const orderId = `OR-${Math.floor(1000 + Math.random() * 9000)}`;

      const newOrder: Order = {
        id: orderId,
        customerName: newClientName,
        customerEmail: newClientEmail || 'manual@cliente.cl',
        customerPhone: newClientPhone || undefined,
        date: newDate,
        status: 'En preparación',
        subtotal,
        shippingFee: 3990,
        total,
        address: 'Dirección Despacho Manual',
        commune,
        city,
        type: docType,
        paymentMethod,
        paymentStatus: 'Pagado',
        salesChannel,
        items: [
          {
            productId: `prod-${Date.now()}`,
            productName: newTopic,
            quantity: productQty,
            price: productPrice,
            variant: 'Personalizado'
          }
        ]
      };

      if (onAddOrder) {
        onAddOrder(newOrder);
      }

      if (onShowToast) {
        onShowToast('Venta Registrada', `Pedido ${orderId} para ${newOrder.customerName} registrado para despacho.`, 'success');
      }
    } else if (eventType === 'produccion') {
      const batchId = `batch-${Date.now().toString().slice(-4)}`;
      const batch: ProductionBatch = {
        id: batchId,
        orderId: `OR-${Math.floor(1000 + Math.random() * 9000)}`,
        clientName: newClientName,
        productName: newTopic,
        quantity: productQty,
        artisan: artisan,
        progress: 10,
        currentStage: currentStage,
        scheduledDay: scheduledDayParsed
      };

      setProductionBatches([batch, ...productionBatches]);
      if (onShowToast) {
        onShowToast('Lote de Producción Creado', `El lote de ${batch.productName} ha sido programado en el taller.`, 'success');
      }
    }

    // Reset fields
    setNewTopic('');
    setNewClientName('');
    setNewClientEmail('');
    setNewClientPhone('');
    setProductQty(1);
    setProductPrice(4500);
    setShowAddModal(false);
  };

  // Stats calculation
  const totalConsultationsCount = consultations.length;
  const totalOrdersCount = orders.length;
  const totalBatchesCount = productionBatches.length;

  return (
    <div className="p-6 sm:p-10 space-y-8 animate-fade-in bg-bananur-cream min-h-screen">
      
      {/* Editorial top info */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-mono uppercase tracking-widest text-[#40916C] font-bold">Agenda Unificada Corporativa</span>
          <h1 className="text-3xl font-serif font-extrabold text-bananur-clay">Control de Operaciones, Comercio y Producción</h1>
          <p className="text-xs text-bananur-clay-light font-light">
            Monitorea asesorías virtuales, planifica despachos comerciales de pedidos chilenos y supervisa lotes de manufactura activos desde una vista consolidada.
          </p>
        </div>
        <div className="flex gap-2">
          <button
            id="agenda-btn-new-cons"
            onClick={() => setShowAddModal(true)}
            className="px-5 py-2.5 bg-bananur-clay hover:bg-bananur-gold text-bananur-cream hover:text-bananur-clay duration-150 rounded-xl text-xs font-bold font-mono tracking-wide flex items-center gap-2 shadow-xs cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            Registrar Nuevo Evento (Manual)
          </button>
        </div>
      </div>

      {/* Quick stats grid */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <div className="bg-white p-5 rounded-2xl border border-bananur-sand shadow-xs flex items-center gap-4">
          <div className="p-3 bg-rose-50 text-rose-600 rounded-xl">
            <CalendarDays className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[10px] font-mono text-bananur-clay-light/60 uppercase block font-bold">Asesorías Totales</span>
            <span className="text-xl font-mono font-extrabold text-bananur-clay">{totalConsultationsCount} Reuniones</span>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-bananur-sand shadow-xs flex items-center gap-4">
          <div className="p-3 bg-emerald-50 text-emerald-600 rounded-xl">
            <Truck className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[10px] font-mono text-bananur-clay-light/60 uppercase block font-bold">Despachos & Ventas</span>
            <span className="text-xl font-mono font-extrabold text-bananur-clay">{totalOrdersCount} Envíos</span>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-bananur-sand shadow-xs flex items-center gap-4">
          <div className="p-3 bg-amber-50 text-amber-600 rounded-xl">
            <Activity className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[10px] font-mono text-bananur-clay-light/60 uppercase block font-bold">Lotes de Producción</span>
            <span className="text-xl font-mono font-extrabold text-bananur-clay">{totalBatchesCount} Lotes Activos</span>
          </div>
        </div>
      </div>

      {/* Calendar Area */}
      <div id="unified-calendar-agenda" className="bg-white p-6 rounded-2xl border border-bananur-sand shadow-sm space-y-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-bananur-sand/50 pb-5">
          <div>
            <span className="text-xs font-mono uppercase tracking-widest text-[#B58455] font-bold">Vista de Matriz de Tiempos</span>
            <h2 className="text-xl font-serif font-bold text-bananur-clay mt-1">
              Calendario Unificado: {MONTH_NAMES[currentMonth]} {currentYear}
            </h2>
            <p className="text-xs text-bananur-clay-light font-light mt-0.5">
              Haz clic en cualquier casillero diario para revisar las actividades asignadas.
            </p>
          </div>
          
          {/* Legend and stats */}
          <div className="flex flex-wrap gap-4 text-[10px] font-mono">
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-rose-500 block" /> Asesoría Virtual
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 block" /> Venta / Despacho
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-amber-500 block" /> Lote Producción
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-rose-200 block" /> Bloqueado
            </span>
          </div>
        </div>

        {/* SEARCH BAR & FILTER COMPONENT FOR EVENTS */}
        <div className="bg-bananur-cream/25 p-4 rounded-xl border border-bananur-sand/60 space-y-3">
          <div className="text-[10px] font-bold uppercase tracking-wider text-bananur-gold-dark font-mono">🔍 Barra de Búsqueda y Filtro de Eventos de la Agenda</div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div className="relative">
              <input
                id="agenda-event-search"
                type="text"
                placeholder="Buscar evento por tema, cliente o código..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-3 py-2 bg-white border border-bananur-sand rounded-lg text-xs text-bananur-clay"
              />
              <Search className="w-3.5 h-3.5 text-bananur-clay-light absolute left-3 top-1/2 -translate-y-1/2" />
            </div>
            <select
              id="agenda-event-category-filter"
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value as any)}
              className="p-2 bg-white border border-bananur-sand rounded-lg text-xs text-bananur-clay font-medium"
            >
              <option value="Todos">Todos los tipos de evento</option>
              <option value="asesoria">Asesorías Virtuales</option>
              <option value="venta">Ventas & Despachos</option>
              <option value="produccion">Lotes en Taller / Producción</option>
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* Left: The Dynamic Month/Year Grid Matrix */}
          <div className="lg:col-span-8 space-y-6">
            
            {/* MONTH / YEAR NAVIGATOR */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between bg-bananur-cream/45 p-4 rounded-xl border border-bananur-sand/35 gap-4">
              <div className="flex items-center gap-2">
                <button
                  id="agenda-prev-month-btn"
                  type="button"
                  onClick={() => {
                    if (currentMonth === 0) {
                      setCurrentMonth(11);
                      setCurrentYear(currentYear - 1);
                    } else {
                      setCurrentMonth(currentMonth - 1);
                    }
                  }}
                  className="px-3 py-1.5 border border-bananur-sand rounded-lg bg-white text-bananur-clay hover:bg-bananur-cream font-bold text-[10px] cursor-pointer"
                >
                  ◀ Mes Anterior
                </button>
                <div className="px-3 py-1.5 bg-white border border-bananur-sand rounded-lg text-center min-w-[120px]">
                  <span className="font-serif font-bold text-xs text-bananur-clay">
                    {MONTH_NAMES[currentMonth]} {currentYear}
                  </span>
                </div>
                <button
                  id="agenda-next-month-btn"
                  type="button"
                  onClick={() => {
                    if (currentMonth === 11) {
                      setCurrentMonth(0);
                      setCurrentYear(currentYear + 1);
                    } else {
                      setCurrentMonth(currentMonth + 1);
                    }
                  }}
                  className="px-3 py-1.5 border border-bananur-sand rounded-lg bg-white text-bananur-clay hover:bg-bananur-cream font-bold text-[10px] cursor-pointer"
                >
                  Siguiente Mes ▶
                </button>
              </div>

              {/* Direct Year Selector */}
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-mono text-bananur-clay-light uppercase font-bold">Año:</span>
                <select
                  id="agenda-year-selector"
                  value={currentYear}
                  onChange={(e) => setCurrentYear(Number(e.target.value))}
                  className="p-1 bg-white border border-bananur-sand rounded-lg text-[10px] font-semibold text-bananur-clay"
                >
                  {[2025, 2026, 2027, 2028, 2029].map((yr) => (
                    <option key={yr} value={yr}>{yr}</option>
                  ))}
                </select>
                <p className="text-[10px] text-bananur-clay-light font-mono shrink-0 ml-2">Viña del Mar (GMT-4)</p>
              </div>
            </div>

            {/* Week labels */}
            <div className="grid grid-cols-7 gap-2 text-center font-mono text-[10px] font-bold text-bananur-clay-light uppercase tracking-wider">
              <span>Lun</span>
              <span>Mar</span>
              <span>Mié</span>
              <span>Jue</span>
              <span>Vie</span>
              <span>Sáb</span>
              <span>Dom</span>
            </div>

            {/* June 30 Days Grid */}
            <div className="grid grid-cols-7 gap-2.5">
              {daysArray.map((day) => {
                const dayEvents = getEventsForDay(day);
                const isBlocked = blockedDays.includes(day);
                const isSelected = selectedDay === day;

                // Detect event categories for color coding
                const hasAsesoria = dayEvents.some(e => e.category === 'asesoria');
                const hasVenta = dayEvents.some(e => e.category === 'venta');
                const hasProduccion = dayEvents.some(e => e.category === 'produccion');

                return (
                  <div
                    key={day}
                    onClick={() => setSelectedDay(day)}
                    className={`aspect-square p-2 border rounded-xl flex flex-col justify-between items-start transition-all cursor-pointer relative ${
                      isSelected 
                        ? 'border-bananur-clay ring-3 ring-bananur-gold-dark/40 bg-white shadow-xs' 
                        : 'border-bananur-sand/80 hover:border-bananur-gold hover:bg-white bg-bananur-cream/30'
                    } ${isBlocked ? 'bg-rose-50/70 border-rose-200 text-rose-300' : ''}`}
                  >
                    <span className={`text-xs font-mono font-bold ${isBlocked ? 'text-rose-400' : 'text-bananur-clay'}`}>
                      {day}
                    </span>

                    {/* Badge indicator dots */}
                    <div className="w-full flex gap-1 justify-end">
                      {hasAsesoria && !isBlocked && (
                        <span className="w-1.5 h-1.5 rounded-full bg-rose-500 block" title="Asesoría programada" />
                      )}
                      {hasVenta && !isBlocked && (
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 block" title="Venta / Despacho programado" />
                      )}
                      {hasProduccion && !isBlocked && (
                        <span className="w-1.5 h-1.5 rounded-full bg-amber-500 block" title="Manufactura taller en proceso" />
                      )}
                      {isBlocked && (
                        <span className="text-[8px] font-mono text-rose-400 uppercase leading-none">Bloq</span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="text-[11px] text-bananur-clay-light/75 bg-bananur-cream p-3 rounded-xl flex items-center gap-2 border border-bananur-sand/30">
              <span className="font-bold text-bananur-gold-dark font-mono">💡 Administración Unificada:</span>
              <span>Haz clic en un día del calendario para revisar todos los eventos programados en esa fecha y despachar pedidos o avanzar lotes.</span>
            </div>
          </div>

          {/* Right: Selected Day Events Details panel */}
          <div className="lg:col-span-4 bg-bananur-cream/10 p-5 rounded-2xl border border-bananur-sand/80 space-y-4">
            <div className="border-b border-bananur-sand/50 pb-3 flex items-center justify-between">
              <h3 className="font-serif text-base font-bold text-bananur-clay flex items-center gap-1.5">
                <Calendar className="w-5 h-5 text-bananur-clay-light" />
                Eventos del Día {selectedDay} de {MONTH_NAMES[currentMonth]}
              </h3>
              <button
                type="button"
                onClick={() => toggleDayBlock(selectedDay)}
                className={`text-[9px] font-mono font-bold uppercase tracking-wider px-2 py-1 rounded cursor-pointer duration-150 border ${
                  blockedDays.includes(selectedDay)
                    ? 'bg-rose-50 text-rose-700 border-rose-200'
                    : 'bg-white text-bananur-clay border-bananur-sand hover:bg-bananur-cream'
                }`}
              >
                {blockedDays.includes(selectedDay) ? 'Habilitar Día' : 'Bloquear Día'}
              </button>
            </div>

            {blockedDays.includes(selectedDay) ? (
              <div className="text-center py-10 space-y-2 bg-rose-50/40 rounded-xl border border-rose-200/50">
                <span className="text-2xl block">🚫</span>
                <h4 className="font-serif text-sm font-bold text-rose-800">Bloqueo de Día Completo</h4>
                <p className="text-[11px] text-rose-600 px-4 leading-relaxed">
                  Este día ha sido bloqueado manualmente. No se recibirán asesorías ni se programarán despachos en esta fecha.
                </p>
              </div>
            ) : selectedDayEvents.length === 0 ? (
              <div className="text-center py-12 space-y-3 bg-bananur-cream/40 rounded-xl border border-bananur-sand/40">
                <span className="text-2xl block text-bananur-clay-light/50">⏳</span>
                <div>
                  <h4 className="font-serif text-sm font-bold text-bananur-clay">Día Libre de Operaciones</h4>
                  <p className="text-[11px] text-bananur-clay-light/80 px-4 mt-0.5 leading-relaxed">
                    No hay despachos comerciales, asesorías agendadas ni hitos de producción asignados para esta fecha.
                  </p>
                </div>
              </div>
            ) : (
              <div className="space-y-4 max-h-[420px] overflow-y-auto scrollbar-hidden">
                {selectedDayEvents.map((evt) => (
                  <div 
                    key={`${evt.category}-${evt.id}`} 
                    className={`p-4 rounded-xl border transition-all ${
                      evt.category === 'asesoria' ? 'bg-rose-50/55 border-rose-200' :
                      evt.category === 'venta' ? 'bg-emerald-50/50 border-emerald-200' :
                      'bg-amber-50/50 border-amber-200'
                    }`}
                  >
                    {/* Header Tag */}
                    <div className="flex justify-between items-center mb-2">
                      <span className={`text-[8px] font-mono font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${
                        evt.category === 'asesoria' ? 'bg-rose-100 text-rose-800' :
                        evt.category === 'venta' ? 'bg-emerald-100 text-emerald-800' :
                        'bg-amber-100 text-amber-800'
                      }`}>
                        {evt.category === 'asesoria' ? 'Asesoría Virtual' :
                         evt.category === 'venta' ? 'Comercio / Despacho' :
                         'Producción / Taller'}
                      </span>
                      <span className="text-[9px] font-mono text-bananur-clay-light/80">Código: {evt.id}</span>
                    </div>

                    <h4 className="font-serif text-sm font-extrabold text-bananur-clay leading-snug">{evt.title}</h4>
                    <p className="text-[11px] text-bananur-clay-light mt-1 leading-snug font-light">{evt.subtitle}</p>

                    {/* Specific category elements */}
                    {evt.category === 'asesoria' && (
                      <div className="mt-3 space-y-2 border-t border-rose-200/40 pt-2 text-[11px]">
                        <div className="flex items-center gap-1.5 text-bananur-clay">
                          <Clock className="w-3.5 h-3.5 text-rose-700" />
                          <span className="font-semibold font-mono">{evt.time} ({evt.meta.duration})</span>
                        </div>
                        {evt.meta.videoLink && (
                          <a 
                            href={evt.meta.videoLink}
                            target="_blank"
                            rel="noreferrer"
                            className="flex items-center justify-between p-2 bg-white hover:bg-rose-100 text-rose-800 rounded-lg text-[10px] font-bold duration-150 border border-rose-200"
                          >
                            <span className="flex items-center gap-1.5">
                              <Video className="w-3.5 h-3.5 text-rose-600" />
                              Entrar a Google Meet
                            </span>
                            <span className="underline">Unirse</span>
                          </a>
                        )}
                        <div className="flex gap-2 pt-1.5">
                          <button
                            type="button"
                            onClick={() => handleToggleConsultationStatus(evt.id)}
                            className="flex-1 py-1.5 text-center text-[10px] font-mono font-bold border rounded bg-white hover:bg-rose-100/50 text-bananur-clay cursor-pointer"
                          >
                            {evt.status === 'Bloqueada' ? 'Desbloquear Bloque' : 'Bloquear Bloque'}
                          </button>
                        </div>
                      </div>
                    )}

                    {evt.category === 'venta' && (
                      <div className="mt-3 space-y-2 border-t border-emerald-200/40 pt-2 text-[11px] text-bananur-clay">
                        <div className="flex justify-between font-mono font-semibold">
                          <span>Importe Facturado:</span>
                          <span className="text-emerald-800">${evt.meta.total.toLocaleString('es-CL')} CLP</span>
                        </div>
                        <div className="flex items-center gap-1.5 text-[10px] text-bananur-clay-light font-mono">
                          <Truck className="w-3.5 h-3.5 text-emerald-700" />
                          <span>Despacho Starken Courier ({evt.meta.commune})</span>
                        </div>
                        {evt.status === 'En preparación' && onUpdateOrderStatus && (
                          <div className="flex gap-2 pt-1">
                            <button
                              type="button"
                              onClick={() => {
                                onUpdateOrderStatus(evt.id, 'Enviado');
                                if (onShowToast) onShowToast('Pedido Despachado', `El pedido ${evt.id} fue marcado como enviado por Starken.`, 'success');
                              }}
                              className="w-full py-1.5 bg-emerald-750 hover:bg-emerald-800 text-white rounded text-[10px] font-bold cursor-pointer transition-colors text-center"
                            >
                              Despachar Starken 📦
                            </button>
                          </div>
                        )}
                        {evt.status !== 'En preparación' && (
                          <div className="mt-1 text-[10px] font-mono text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded inline-block">
                            Estatus: {evt.status}
                          </div>
                        )}
                      </div>
                    )}

                    {evt.category === 'produccion' && (
                      <div className="mt-3 space-y-2 border-t border-amber-200/40 pt-2 text-[11px] text-bananur-clay">
                        <div className="flex justify-between text-[10px]">
                          <span className="font-bold text-bananur-gold-dark uppercase font-mono">Etapa Taller:</span>
                          <span className="font-semibold font-mono">{evt.status}</span>
                        </div>
                        
                        {/* Progress Bar */}
                        <div className="space-y-1">
                          <div className="flex justify-between text-[9px] font-mono font-bold text-bananur-clay-light">
                            <span>Progreso Confección</span>
                            <span>{evt.meta.progress}%</span>
                          </div>
                          <div className="w-full bg-bananur-sand/40 h-2 rounded-full overflow-hidden border border-bananur-sand/30">
                            <div 
                              className="bg-amber-500 h-full rounded-full transition-all duration-300"
                              style={{ width: `${evt.meta.progress}%` }}
                            />
                          </div>
                        </div>

                        <div className="flex gap-1.5 pt-1">
                          <button
                            type="button"
                            onClick={() => {
                              const updatedBatches = productionBatches.map(b => {
                                if (b.id === evt.id) {
                                  const nextProg = Math.min(b.progress + 15, 100);
                                  const nextStage = nextProg === 100 ? 'Lote Terminado' : b.currentStage;
                                  return { ...b, progress: nextProg, currentStage: nextStage };
                                }
                                return b;
                              });
                              setProductionBatches(updatedBatches);
                              if (onShowToast) onShowToast('Hito Avanzado', `Lote ${evt.id} avanzó de etapa en el taller de encuadernación.`, 'info');
                            }}
                            className="w-full py-1.5 bg-amber-600 hover:bg-amber-700 text-white rounded text-[10px] font-bold cursor-pointer transition-colors text-center"
                          >
                            Avanzar Etapa 🛠
                          </button>
                        </div>
                      </div>
                    )}

                  </div>
                ))}
              </div>
            )}
          </div>

        </div>

      </div>

      {/* Booking / Event Creation Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-bananur-clay/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 overflow-y-auto">
          <div className="bg-white rounded-2xl border border-bananur-sand shadow-xl max-w-lg w-full p-6 space-y-4 animate-scale-up my-8 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-bananur-sand/50 pb-3">
              <h3 className="font-serif text-base font-bold text-bananur-clay flex items-center gap-2">
                <CalendarDays className="w-5 h-5 text-bananur-gold-dark" />
                Registrar Nuevo Evento en la Agenda
              </h3>
              <button 
                onClick={() => setShowAddModal(false)}
                className="p-1 hover:bg-bananur-cream rounded-full text-bananur-clay-light duration-150 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateEventSubmit} className="space-y-4 text-xs text-bananur-clay">
              {/* Event type selection */}
              <div className="bg-bananur-cream/40 p-3 rounded-xl border border-bananur-sand/30">
                <label className="block text-[10px] font-bold uppercase text-bananur-gold-dark mb-1.5 font-mono">Tipo de Evento corporativo *</label>
                <select
                  id="agenda-create-event-type"
                  value={eventType}
                  onChange={(e) => setEventType(e.target.value as any)}
                  className="w-full p-2 bg-white border border-bananur-sand rounded-lg font-bold text-xs"
                >
                  <option value="asesoria">💻 Asesoría Virtual (Operaciones / Asesorías)</option>
                  <option value="venta">🛒 Venta & Despacho (Comercio / Pedido)</option>
                  <option value="produccion">🛠 Lote en Taller / Producción (Manufactura)</option>
                </select>
              </div>

              {eventType !== 'asesoria' && (
                <div>
                  <label className="block text-[10px] font-bold uppercase text-bananur-clay-light mb-1 font-mono">Seleccionar Producto Registrado</label>
                  <select
                    id="agenda-select-product-dropdown"
                    value={selectedProductSelector}
                    onChange={(e) => {
                      const val = e.target.value;
                      setSelectedProductSelector(val);
                      if (val === 'custom') {
                        setNewTopic('');
                        if (eventType === 'venta') {
                          setProductPrice(4500);
                        }
                      } else {
                        const prod = registeredProducts.find(p => p.name === val);
                        if (prod) {
                          setNewTopic(prod.name);
                          if (eventType === 'venta') {
                            setProductPrice(prod.price);
                          }
                        }
                      }
                    }}
                    className="w-full p-2.5 border border-bananur-sand rounded-lg bg-[#FAF8F5] mb-2 text-xs font-semibold focus:ring-1 focus:ring-bananur-gold"
                  >
                    <option value="custom">✨ --- Personalizar Nombre / Ítem ---</option>
                    {registeredProducts.map((p, idx) => (
                      <option key={p.name + idx} value={p.name}>
                        📦 {p.name} (${p.price.toLocaleString('es-CL')})
                      </option>
                    ))}
                  </select>
                </div>
              )}

              <div>
                <label className="block text-[10px] font-bold uppercase text-bananur-clay-light mb-1 font-mono">
                  {eventType === 'asesoria' && 'Tema de la Asesoría *'}
                  {eventType === 'venta' && 'Producto / Ítem Vendido *'}
                  {eventType === 'produccion' && 'Nombre del Producto o Lote *'}
                </label>
                <input
                  id="agenda-create-topic"
                  type="text"
                  required
                  placeholder={
                    eventType === 'asesoria' ? 'e.g. Auditoría de Identidad Digital' :
                    eventType === 'venta' ? 'e.g. Libreta Flora Silvestre Costura Copiada' :
                    'e.g. Lote Soportes de Filamento PETG'
                  }
                  value={newTopic}
                  onChange={(e) => setNewTopic(e.target.value)}
                  className="w-full p-2.5 border border-bananur-sand rounded-lg bg-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-bold uppercase text-bananur-clay-light mb-1 font-mono">Fecha *</label>
                  <input
                    id="agenda-create-date"
                    type="date"
                    required
                    value={newDate}
                    onChange={(e) => setNewDate(e.target.value)}
                    className="w-full p-2.5 border border-bananur-sand rounded-lg bg-white font-mono"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold uppercase text-bananur-clay-light mb-1 font-mono">Hora *</label>
                  <input
                    id="agenda-create-time"
                    type="time"
                    required
                    value={newTime}
                    onChange={(e) => setNewTime(e.target.value)}
                    className="w-full p-2.5 border border-bananur-sand rounded-lg bg-white font-mono"
                  />
                </div>
              </div>

              {/* Conditional sections */}
              <div className="border-t border-bananur-sand/30 pt-3 space-y-3">
                <span className="text-[10px] font-mono uppercase text-bananur-gold-dark block font-bold">Datos de Ejecución</span>
                
                <div>
                  <label className="block text-[10px] font-bold uppercase text-bananur-clay-light mb-1 font-mono">Seleccionar Cliente Registrado</label>
                  <select
                    id="agenda-select-client-dropdown"
                    value={selectedClientId}
                    onChange={(e) => {
                      const val = e.target.value;
                      setSelectedClientId(val);
                      if (val === 'new') {
                        setNewClientName('');
                        setNewClientEmail('');
                        setNewClientPhone('');
                      } else {
                        const cl = registeredClients.find(c => c.name === val);
                        if (cl) {
                          setNewClientName(cl.name);
                          setNewClientEmail(cl.email);
                          setNewClientPhone(cl.phone || '');
                        }
                      }
                    }}
                    className="w-full p-2.5 border border-bananur-sand rounded-lg bg-[#FAF8F5] mb-2 text-xs font-semibold focus:ring-1 focus:ring-bananur-gold"
                  >
                    <option value="new">🆕 --- Registrar Cliente Nuevo ---</option>
                    {registeredClients.map((cl, idx) => (
                      <option key={cl.name + idx} value={cl.name}>
                        👤 {cl.name} ({cl.email || 'Sin correo'})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-[10px] font-bold uppercase text-bananur-clay-light mb-1 font-mono">Cliente / Solicitante *</label>
                  <input
                    id="agenda-create-client"
                    type="text"
                    required
                    placeholder="e.g. Constanza Valdebenito"
                    value={newClientName}
                    onChange={(e) => setNewClientName(e.target.value)}
                    className="w-full p-2.5 border border-bananur-sand rounded-lg bg-white"
                  />
                </div>

                {/* Email and Phone for advisory/sale */}
                {eventType !== 'produccion' && (
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[10px] font-bold uppercase text-bananur-clay-light mb-1 font-mono">
                        Email {eventType === 'asesoria' ? '*' : '(Opcional)'}
                      </label>
                      <input
                        id="agenda-create-email"
                        type="email"
                        required={eventType === 'asesoria'}
                        placeholder="correo@ejemplo.cl"
                        value={newClientEmail}
                        onChange={(e) => setNewClientEmail(e.target.value)}
                        className="w-full p-2.5 border border-bananur-sand rounded-lg bg-white"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold uppercase text-bananur-clay-light mb-1 font-mono">Teléfono (Opcional)</label>
                      <input
                        id="agenda-create-phone"
                        type="text"
                        placeholder="+56 9 ..."
                        value={newClientPhone}
                        onChange={(e) => setNewClientPhone(e.target.value)}
                        className="w-full p-2.5 border border-bananur-sand rounded-lg bg-white"
                      />
                    </div>
                  </div>
                )}

                {/* Sale specific fields */}
                {eventType === 'venta' && (
                  <div className="space-y-3 bg-bananur-cream/30 p-3 rounded-xl border border-bananur-sand/30">
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-[10px] font-bold uppercase text-bananur-clay mb-1 font-mono">Precio Unitario ($ CLP)</label>
                        <input
                          id="agenda-create-price"
                          type="number"
                          value={productPrice}
                          onChange={(e) => setProductPrice(Number(e.target.value))}
                          className="w-full p-2 border border-bananur-sand rounded-lg bg-white font-mono"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] font-bold uppercase text-bananur-clay mb-1 font-mono">Cantidad de Items</label>
                        <input
                          id="agenda-create-qty"
                          type="number"
                          value={productQty}
                          min={1}
                          onChange={(e) => setProductQty(Number(e.target.value))}
                          className="w-full p-2 border border-bananur-sand rounded-lg bg-white font-mono"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-[10px] font-bold uppercase text-bananur-clay mb-1 font-mono">Comuna Despacho</label>
                        <input
                          id="agenda-create-commune"
                          type="text"
                          value={commune}
                          onChange={(e) => setCommune(e.target.value)}
                          className="w-full p-2 border border-bananur-sand rounded-lg bg-white"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] font-bold uppercase text-bananur-clay mb-1 font-mono">Ciudad</label>
                        <input
                          id="agenda-create-city"
                          type="text"
                          value={city}
                          onChange={(e) => setCity(e.target.value)}
                          className="w-full p-2 border border-bananur-sand rounded-lg bg-white"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-3 gap-2">
                      <div>
                        <label className="block text-[10px] font-bold uppercase text-bananur-clay mb-1 font-mono">Documento</label>
                        <select
                          id="agenda-create-doctype"
                          value={docType}
                          onChange={(e) => setDocType(e.target.value as any)}
                          className="w-full p-1.5 border border-bananur-sand rounded-lg bg-white text-[10px] font-semibold"
                        >
                          <option value="boleta">Boleta</option>
                          <option value="factura">Factura</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-[10px] font-bold uppercase text-bananur-clay mb-1 font-mono">Medio Pago</label>
                        <select
                          id="agenda-create-pay"
                          value={paymentMethod}
                          onChange={(e) => setPaymentMethod(e.target.value as any)}
                          className="w-full p-1.5 border border-bananur-sand rounded-lg bg-white text-[10px] font-semibold"
                        >
                          <option value="Transferencia">Transferencia</option>
                          <option value="Tarjeta de Crédito/Débito">Tarjeta</option>
                          <option value="Efectivo">Efectivo</option>
                          <option value="Mercado Pago">Mercado Pago</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-[10px] font-bold uppercase text-bananur-clay mb-1 font-mono">Canal</label>
                        <select
                          id="agenda-create-channel"
                          value={salesChannel}
                          onChange={(e) => setSalesChannel(e.target.value as any)}
                          className="w-full p-1.5 border border-bananur-sand rounded-lg bg-white text-[10px] font-semibold"
                        >
                          <option value="Reunión/Asesoría">Asesoría</option>
                          <option value="Sitio Web">Sitio Web</option>
                          <option value="Instagram">Instagram</option>
                          <option value="WhatsApp">WhatsApp</option>
                          <option value="Feria Presencial">Feria</option>
                        </select>
                      </div>
                    </div>
                  </div>
                )}

                {/* Production specific fields */}
                {eventType === 'produccion' && (
                  <div className="space-y-3 bg-bananur-cream/30 p-3 rounded-xl border border-bananur-sand/30">
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-[10px] font-bold uppercase text-bananur-clay mb-1 font-mono">Unidades del Lote</label>
                        <input
                          id="agenda-create-prod-qty"
                          type="number"
                          min={1}
                          value={productQty}
                          onChange={(e) => setProductQty(Number(e.target.value))}
                          className="w-full p-2 border border-bananur-sand rounded-lg bg-white font-mono"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] font-bold uppercase text-bananur-clay mb-1 font-mono">Responsable a Cargo</label>
                        <select
                          id="agenda-create-artisan"
                          value={artisan}
                          onChange={(e) => setArtisan(e.target.value)}
                          className="w-full p-2 border border-bananur-sand rounded-lg bg-white text-xs font-semibold focus:ring-1 focus:ring-bananur-gold"
                        >
                          {responsables.map((r, idx) => (
                            <option key={r + idx} value={r}>
                              👤 {r}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>

                    <div>
                      <label className="block text-[10px] font-bold uppercase text-bananur-clay mb-1 font-mono">Etapa Inicial del Lote</label>
                      <select
                        id="agenda-create-stage"
                        value={currentStage}
                        onChange={(e) => setCurrentStage(e.target.value)}
                        className="w-full p-2 border border-bananur-sand rounded-lg bg-white font-bold"
                      >
                        <option value="Modelado / Diseño">Modelado / Diseño</option>
                        <option value="Tejido Manual">Tejido Manual</option>
                        <option value="Corte & Confección">Corte & Confección</option>
                        <option value="Procesamiento en Cama">Procesamiento en Cama</option>
                        <option value="Encolado & Prensado">Encolado & Prensado</option>
                      </select>
                    </div>
                  </div>
                )}

              </div>

              <div className="pt-4 border-t border-bananur-sand/50 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 border border-bananur-sand rounded-xl hover:bg-bananur-cream font-bold cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-[#B58455] hover:bg-bananur-clay text-white rounded-xl font-bold cursor-pointer"
                >
                  Registrar Actividad
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
