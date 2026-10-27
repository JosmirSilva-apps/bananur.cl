import React, { useState } from 'react';
import { Order, Product, Service, PortfolioItem } from '../types';
import { Search, ReceiptText, ArrowUpRight, X, Printer, ShieldCheck, Mail, RefreshCw, Package, Truck, CheckCircle, Plus, Trash, Globe, Layers, Laptop } from 'lucide-react';
import { MOCK_PRODUCTS, MOCK_SERVICES, MOCK_REVIEW_PROJECTS } from '../data';

const REGISTERED_CLIENTS = [
  {
    id: 'cli-1',
    customerName: 'Catalina Sepúlveda',
    customerEmail: 'catasep@gmail.com',
    customerPhone: '+56 9 8452 1192',
    address: 'Avenida Libertad 1045, Depto 502',
    commune: 'Viña del Mar',
    city: 'Viña del Mar',
    type: 'boleta'
  },
  {
    id: 'cli-2',
    customerName: 'Roberto Fuentes',
    customerEmail: 'roberto@estudiosigma.cl',
    customerPhone: '+56 9 9331 4055',
    address: 'Falcón 2011, Bodega B4',
    commune: 'Las Condes',
    city: 'Santiago',
    type: 'factura',
    taxId: '76.492.311-K',
    businessName: 'Inversiones y Estudios Sigma SpA',
    businessLine: 'Servicios de Diseño e Informática'
  },
  {
    id: 'cli-3',
    customerName: 'Manuel Sanhueza',
    customerEmail: 'manuelsanhueza@gmail.com',
    customerPhone: '+56 9 7220 1833',
    address: 'Camino El Venado 3120',
    commune: 'San Pedro de la Paz',
    city: 'Concepción',
    type: 'boleta'
  },
  {
    id: 'cli-4',
    customerName: 'Daniela Almonacid',
    customerEmail: 'daniela.a@boutiqueflor.cl',
    customerPhone: '+56 9 4488 2021',
    address: 'Av. El Bosque 450, Piso 12',
    commune: 'Las Condes',
    city: 'Santiago',
    type: 'boleta'
  },
  {
    id: 'cli-5',
    customerName: 'Andrés Vicuña',
    customerEmail: 'av@vicunavinos.cl',
    customerPhone: '+56 9 5551 0920',
    address: 'Camino Los Viñedos 45',
    commune: 'San Fernando',
    city: 'Colchagua',
    type: 'factura',
    taxId: '78.552.120-4',
    businessName: 'Viñedos de San Fernando SpA',
    businessLine: 'Producción y Venta de Vinos'
  }
];

interface AdminOrdersProps {
  orders: Order[];
  onUpdateOrderStatus: (orderId: string, status: 'En preparación' | 'Enviado' | 'Entregado') => void;
  onShowToast?: (title: string, description: string, type?: 'success' | 'info' | 'warning' | 'error') => void;
  products?: Product[];
  services?: Service[];
  portfolioItems?: PortfolioItem[];
  onAddOrder?: (newOrder: Order) => void;
}

export default function AdminOrders({
  orders,
  onUpdateOrderStatus,
  onShowToast,
  products = MOCK_PRODUCTS,
  services = MOCK_SERVICES,
  portfolioItems = MOCK_REVIEW_PROJECTS,
  onAddOrder
}: AdminOrdersProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [docTypeFilter, setDocTypeFilter] = useState<'todos' | 'boleta' | 'factura'>('todos');
  const [statusFilter, setStatusFilter] = useState('todos');
  const [dateFilter, setDateFilter] = useState('');
  const [activeOrder, setActiveOrder] = useState<Order | null>(null);
  
  // SII sync simulation state
  const [siiSyncStatus, setSiiSyncStatus] = useState<Record<string, 'pending' | 'success'>>({});
  const [syncingId, setSyncingId] = useState<string | null>(null);

  const handleSyncSII = (id: string, type?: string) => {
    setSyncingId(id);
    setTimeout(() => {
      setSyncingId(null);
      setSiiSyncStatus(prev => ({ ...prev, [id]: 'success' }));
      if (onShowToast) {
        onShowToast(
          'SII Sincronizado',
          `El documento asociado a la orden ${id} (${type === 'factura' ? 'Factura' : 'Boleta'}) ha sido timbrado y declarado ante el SII de forma exitosa.`,
          'success'
        );
      }
    }, 1500);
  };

  const filteredOrders = orders.filter(o => {
    const matchesQuery = o.customerName.toLowerCase().includes(searchQuery.toLowerCase()) || o.id.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesDoc = docTypeFilter === 'todos' || o.type === docTypeFilter;
    const matchesStatus = statusFilter === 'todos' || o.status === statusFilter;
    const matchesDate = !dateFilter || o.date === dateFilter;
    return matchesQuery && matchesDoc && matchesStatus && matchesDate;
  });

  // Create Manual Order form states
  const [showCreateForm, setShowCreateForm] = useState(false);
  
  // Form fields
  const [customerName, setCustomerName] = useState('');
  const [customerEmail, setCustomerEmail] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [address, setAddress] = useState('');
  const [commune, setCommune] = useState('Viña del Mar');
  const [city, setCity] = useState('Viña del Mar');
  const [docType, setDocType] = useState<'boleta' | 'factura'>('boleta');
  
  // Factura fields
  const [taxId, setTaxId] = useState('');
  const [businessName, setBusinessName] = useState('');
  const [businessLine, setBusinessLine] = useState('');

  // Sales Department Fields
  const [paymentMethod, setPaymentMethod] = useState<'Transferencia' | 'Tarjeta de Crédito/Débito' | 'Efectivo' | 'Mercado Pago'>('Transferencia');
  const [paymentStatus, setPaymentStatus] = useState<'Pagado' | 'Pendiente' | 'Reembolsado'>('Pagado');
  const [salesChannel, setSalesChannel] = useState<'Sitio Web' | 'Instagram' | 'WhatsApp' | 'Feria Presencial' | 'Reunión/Asesoría'>('Instagram');
  const [trackingNumber, setTrackingNumber] = useState('');
  const [sellerNotes, setSellerNotes] = useState('');

  // Cart builder states
  const [cartItems, setCartItems] = useState<{
    productId: string;
    productName: string;
    quantity: number;
    price: number;
    variant: string;
    type: 'fisico' | 'servicio' | 'digital';
  }[]>([]);

  // Selected item builder state
  const [addItemType, setAddItemType] = useState<'fisico' | 'servicio' | 'digital'>('fisico');
  const [selectedPhysicalId, setSelectedPhysicalId] = useState(products[0]?.id || '');
  const [selectedPhysicalVariant, setSelectedPhysicalVariant] = useState(products[0]?.variants[0] || 'Original');
  
  const [selectedServiceId, setSelectedServiceId] = useState(services[0]?.id || '');
  
  const [selectedDigitalId, setSelectedDigitalId] = useState(portfolioItems[0]?.id || '');
  const [digitalVariantDesc, setDigitalVariantDesc] = useState('Licencia Estándar');
  
  const [addItemQty, setAddItemQty] = useState(1);
  const [addItemPrice, setAddItemPrice] = useState(0);

  // Active items for price auto-fill
  const activePhysicalProduct = products.find(p => p.id === selectedPhysicalId);
  const activeServiceItem = services.find(s => s.id === selectedServiceId);
  const activeDigitalItem = portfolioItems.find(p => p.id === selectedDigitalId);

  const getDefaultPrice = () => {
    if (addItemType === 'fisico' && activePhysicalProduct) return activePhysicalProduct.price;
    if (addItemType === 'servicio' && activeServiceItem) return activeServiceItem.price;
    if (addItemType === 'digital') return 350000; // default digital licensing price
    return 0;
  };

  const handleAddItemToOrder = () => {
    let productId = '';
    let productName = '';
    let variant = 'Única';
    let finalPrice = addItemPrice || getDefaultPrice();

    if (addItemType === 'fisico') {
      if (!activePhysicalProduct) return;
      productId = activePhysicalProduct.id;
      productName = `[Físico] ${activePhysicalProduct.name}`;
      variant = selectedPhysicalVariant;
    } else if (addItemType === 'servicio') {
      if (!activeServiceItem) return;
      productId = activeServiceItem.id;
      productName = `[Servicio] ${activeServiceItem.name}`;
      variant = 'Servicio Profesional';
    } else {
      if (!activeDigitalItem) return;
      productId = activeDigitalItem.id;
      productName = `[Digital] ${activeDigitalItem.name}`;
      variant = digitalVariantDesc;
    }

    setCartItems([
      ...cartItems,
      {
        productId,
        productName,
        quantity: addItemQty,
        price: finalPrice,
        variant,
        type: addItemType
      }
    ]);

    setAddItemQty(1);
    setAddItemPrice(0);
    if (onShowToast) {
      onShowToast('Artículo Agregado', `${productName} se añadió al pedido temporal.`, 'info');
    }
  };

  const handleCreateOrder = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customerName.trim() || !customerEmail.trim() || !address.trim()) {
      if (onShowToast) onShowToast('Campos vacíos', 'Por favor rellena el nombre, email y dirección del cliente.', 'warning');
      return;
    }
    if (cartItems.length === 0) {
      if (onShowToast) onShowToast('Sin artículos', 'Debes agregar al menos un artículo para registrar el pedido.', 'warning');
      return;
    }

    const subtotal = cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const shippingFee = 3990;
    const total = subtotal + shippingFee;
    const nextIdNum = orders.length + 4021;
    const orderId = `${docType === 'factura' ? 'FAC' : 'PED'}-${nextIdNum}`;

    const newOrder: Order = {
      id: orderId,
      date: new Date().toISOString().split('T')[0],
      customerName,
      customerEmail,
      customerPhone: customerPhone || undefined,
      type: docType,
      taxId: docType === 'factura' ? taxId : undefined,
      businessName: docType === 'factura' ? businessName : undefined,
      businessLine: docType === 'factura' ? businessLine : undefined,
      address,
      commune,
      city,
      subtotal,
      shippingFee,
      total,
      status: 'En preparación',
      paymentMethod,
      paymentStatus,
      salesChannel,
      trackingNumber: trackingNumber || undefined,
      sellerNotes: sellerNotes || undefined,
      items: cartItems.map(item => ({
        productId: item.productId,
        productName: item.productName,
        quantity: item.quantity,
        price: item.price,
        variant: item.variant
      }))
    };

    if (onAddOrder) {
      onAddOrder(newOrder);
    } else {
      orders.unshift(newOrder);
    }

    // Reset states
    setShowCreateForm(false);
    setCustomerName('');
    setCustomerEmail('');
    setCustomerPhone('');
    setAddress('');
    setTaxId('');
    setBusinessName('');
    setBusinessLine('');
    setCartItems([]);
    setPaymentMethod('Transferencia');
    setPaymentStatus('Pagado');
    setSalesChannel('Instagram');
    setTrackingNumber('');
    setSellerNotes('');

    if (onShowToast) {
      onShowToast(
        'Pedido Creado',
        `El pedido ${orderId} ha sido registrado de forma exitosa en el sistema ERP.`,
        'success'
      );
    }
  };

  return (
    <div className="p-6 sm:p-10 space-y-8 animate-fade-in bg-bananur-cream min-h-screen">
      
      {/* Editorial top section */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-mono uppercase tracking-widest text-[#40916C] font-bold">SII Integrado</span>
          <h1 className="text-3xl font-serif font-extrabold text-bananur-clay">Pedidos & Control Tributario</h1>
          <p className="text-xs text-bananur-clay-light font-light">
            Monitorea el estatus de despacho de tus ventas y sincroniza boletas y facturas timbradas con el Servicio de Impuestos Internos.
          </p>
        </div>
        <button
          id="orders-btn-create-manual"
          onClick={() => setShowCreateForm(!showCreateForm)}
          className="px-5 py-2.5 bg-bananur-clay hover:bg-bananur-gold text-bananur-cream hover:text-bananur-clay duration-150 rounded-xl text-xs font-bold font-mono tracking-wide flex items-center gap-2 shadow-xs cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          {showCreateForm ? 'Cerrar Formulario' : 'Registrar Pedido Manual'}
        </button>
      </div>

      {/* Manual order form */}
      {showCreateForm && (
        <form onSubmit={handleCreateOrder} className="bg-white p-6 sm:p-8 rounded-2xl border border-bananur-sand shadow-sm space-y-6 animate-scale-up">
          <div className="flex items-center justify-between border-b border-bananur-sand/50 pb-4">
            <div>
              <h3 className="font-serif text-lg font-bold text-bananur-clay flex items-center gap-2">
                <ReceiptText className="w-5 h-5 text-bananur-gold-dark" />
                Registrar Nuevo Pedido (Boleta o Factura SII)
              </h3>
              <p className="text-xs text-bananur-clay-light">Rellena los datos para emitir un documento oficial en tiempo real.</p>
            </div>
            <span className="text-xs font-mono font-bold text-bananur-gold-dark uppercase bg-bananur-cream px-2 py-1 rounded">
              MODO OPERADOR ERP
            </span>
          </div>

          {/* Cliente Registrado - Autocompletar */}
          <div className="bg-bananur-cream/30 p-4 rounded-xl border border-bananur-sand/60 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <span className="text-[10px] font-mono uppercase text-bananur-gold-dark font-bold block">Acceso Rápido Clientes</span>
              <h4 className="text-xs font-bold text-bananur-clay">Buscar datos desde cliente registrado para agilizar el registro:</h4>
            </div>
            <div className="w-full sm:w-80">
              <select
                id="orders-autocomplete-client"
                onChange={(e) => {
                  const val = e.target.value;
                  if (!val) return;
                  const client = REGISTERED_CLIENTS.find(c => c.id === val);
                  if (client) {
                    setCustomerName(client.customerName);
                    setCustomerEmail(client.customerEmail);
                    setCustomerPhone(client.customerPhone || '');
                    setAddress(client.address);
                    setCommune(client.commune);
                    setCity(client.city);
                    setDocType(client.type as any);
                    if (client.type === 'factura') {
                      setTaxId(client.taxId || '');
                      setBusinessName(client.businessName || '');
                      setBusinessLine(client.businessLine || '');
                    } else {
                      setTaxId('');
                      setBusinessName('');
                      setBusinessLine('');
                    }
                    if (onShowToast) {
                      onShowToast(
                        'Cliente Cargado',
                        `Datos de ${client.customerName} importados con éxito.`,
                        'success'
                      );
                    }
                  }
                }}
                className="w-full p-2 bg-white border border-bananur-sand rounded-lg text-xs"
                defaultValue=""
              >
                <option value="">-- Seleccionar Cliente Registrado --</option>
                {REGISTERED_CLIENTS.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.customerName} ({c.customerEmail})
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-bananur-clay mb-1.5 font-mono">Nombre del Cliente *</label>
              <input
                type="text"
                required
                placeholder="Nombre completo"
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
                className="w-full px-3 py-2 bg-bananur-cream/30 border border-bananur-sand rounded-lg text-xs"
              />
            </div>
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-bananur-clay mb-1.5 font-mono">Email Cliente *</label>
              <input
                type="email"
                required
                placeholder="correo@ejemplo.cl"
                value={customerEmail}
                onChange={(e) => setCustomerEmail(e.target.value)}
                className="w-full px-3 py-2 bg-bananur-cream/30 border border-bananur-sand rounded-lg text-xs"
              />
            </div>
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-bananur-clay mb-1.5 font-mono">Teléfono Cliente</label>
              <input
                type="text"
                placeholder="+56 9 XXXX XXXX"
                value={customerPhone}
                onChange={(e) => setCustomerPhone(e.target.value)}
                className="w-full px-3 py-2 bg-bananur-cream/30 border border-bananur-sand rounded-lg text-xs"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-bananur-clay mb-1.5 font-mono">Dirección Despacho *</label>
              <input
                type="text"
                required
                placeholder="Calle, número, depto"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                className="w-full px-3 py-2 bg-bananur-cream/30 border border-bananur-sand rounded-lg text-xs"
              />
            </div>
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-bananur-clay mb-1.5 font-mono">Comuna Despacho *</label>
              <input
                type="text"
                required
                value={commune}
                onChange={(e) => setCommune(e.target.value)}
                className="w-full px-3 py-2 bg-bananur-cream/30 border border-bananur-sand rounded-lg text-xs"
              />
            </div>
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-bananur-clay mb-1.5 font-mono">Ciudad Despacho *</label>
              <input
                type="text"
                required
                value={city}
                onChange={(e) => setCity(e.target.value)}
                className="w-full px-3 py-2 bg-bananur-cream/30 border border-bananur-sand rounded-lg text-xs"
              />
            </div>
          </div>

          <div className="p-4 bg-bananur-cream/50 rounded-xl border border-bananur-sand space-y-4">
            <div className="flex items-center gap-4">
              <span className="text-xs font-bold uppercase tracking-wider font-mono text-bananur-clay">Tipo de Documento Tributario:</span>
              <div className="flex gap-2">
                {(['boleta', 'factura'] as const).map((type) => (
                  <button
                    key={type}
                    type="button"
                    onClick={() => setDocType(type)}
                    className={`px-3 py-1 text-xs font-bold uppercase rounded-md cursor-pointer transition-colors ${
                      docType === type 
                        ? 'bg-bananur-clay text-white' 
                        : 'bg-white border border-bananur-sand text-bananur-clay hover:bg-bananur-cream'
                    }`}
                  >
                    {type}
                  </button>
                ))}
              </div>
            </div>

            {docType === 'factura' && (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2 animate-scale-up">
                <div>
                  <label className="block text-[10px] font-bold uppercase text-bananur-clay-light mb-1 font-mono">R.U.T. Empresa *</label>
                  <input
                    type="text"
                    required
                    placeholder="XX.XXX.XXX-X"
                    value={taxId}
                    onChange={(e) => setTaxId(e.target.value)}
                    className="w-full px-2.5 py-1.5 bg-white border border-bananur-sand rounded-lg text-xs"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold uppercase text-bananur-clay-light mb-1 font-mono">Razón Social *</label>
                  <input
                    type="text"
                    required
                    placeholder="Nombre legal"
                    value={businessName}
                    onChange={(e) => setBusinessName(e.target.value)}
                    className="w-full px-2.5 py-1.5 bg-white border border-bananur-sand rounded-lg text-xs"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold uppercase text-bananur-clay-light mb-1 font-mono">Giro Comercial *</label>
                  <input
                    type="text"
                    required
                    placeholder="Actividad económica"
                    value={businessLine}
                    onChange={(e) => setBusinessLine(e.target.value)}
                    className="w-full px-2.5 py-1.5 bg-white border border-bananur-sand rounded-lg text-xs"
                  />
                </div>
              </div>
            )}
          </div>

          {/* DYNAMIC CART BUILDER: PHYSICAL, SERVICES, DIGITAL PORTFOLIO */}
          <div className="border border-bananur-sand rounded-xl p-4 space-y-4">
            <h4 className="text-xs font-bold uppercase tracking-wider font-mono text-bananur-clay">
              Añadir Ítems al Pedido (Catálogo Web Unificado)
            </h4>

            {/* Catalogue Type Switcher */}
            <div className="grid grid-cols-3 gap-2 p-1 bg-bananur-cream rounded-xl">
              {[
                { id: 'fisico', label: '📦 Prod. Físicos', color: 'text-bananur-clay' },
                { id: 'servicio', label: '💼 Servicios', color: 'text-[#40916C]' },
                { id: 'digital', label: '🌐 Portafolio Digital', color: 'text-blue-700' }
              ].map((t) => (
                <button
                  key={t.id}
                  type="button"
                  onClick={() => {
                    setAddItemType(t.id as any);
                    setAddItemPrice(0);
                  }}
                  className={`py-2 text-center text-xs font-bold rounded-lg cursor-pointer transition-all ${
                    addItemType === t.id
                      ? 'bg-white shadow-xs border border-bananur-sand/40 font-extrabold'
                      : 'text-bananur-clay-light hover:text-bananur-clay'
                  }`}
                >
                  <span className={t.color}>{t.label}</span>
                </button>
              ))}
            </div>

            {/* Selection inputs based on type */}
            <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-end">
              {addItemType === 'fisico' && (
                <>
                  <div className="md:col-span-5">
                    <label className="block text-[10px] font-bold uppercase text-bananur-clay-light mb-1 font-mono">Seleccionar Producto</label>
                    <select
                      value={selectedPhysicalId}
                      onChange={(e) => {
                        setSelectedPhysicalId(e.target.value);
                        const found = products.find(p => p.id === e.target.value);
                        if (found) setSelectedPhysicalVariant(found.variants[0] || 'Original');
                      }}
                      className="w-full p-2 bg-white border border-bananur-sand rounded-lg text-xs"
                    >
                      {products.map(p => (
                        <option key={p.id} value={p.id}>{p.name} - ${p.price.toLocaleString('es-CL')}</option>
                      ))}
                    </select>
                  </div>
                  <div className="md:col-span-3">
                    <label className="block text-[10px] font-bold uppercase text-bananur-clay-light mb-1 font-mono">Variante</label>
                    <select
                      value={selectedPhysicalVariant}
                      onChange={(e) => setSelectedPhysicalVariant(e.target.value)}
                      className="w-full p-2 bg-white border border-bananur-sand rounded-lg text-xs"
                    >
                      {activePhysicalProduct?.variants.map(v => (
                        <option key={v} value={v}>{v}</option>
                      )) || <option value="Original">Original</option>}
                    </select>
                  </div>
                </>
              )}

              {addItemType === 'servicio' && (
                <div className="md:col-span-8">
                  <label className="block text-[10px] font-bold uppercase text-bananur-clay-light mb-1 font-mono">Seleccionar Servicio</label>
                  <select
                    value={selectedServiceId}
                    onChange={(e) => setSelectedServiceId(e.target.value)}
                    className="w-full p-2 bg-white border border-bananur-sand rounded-lg text-xs"
                  >
                    {services.map(s => (
                      <option key={s.id} value={s.id}>{s.name} - ${s.price.toLocaleString('es-CL')}</option>
                    ))}
                  </select>
                </div>
              )}

              {addItemType === 'digital' && (
                <>
                  <div className="md:col-span-5">
                    <label className="block text-[10px] font-bold uppercase text-bananur-clay-light mb-1 font-mono">Solución Digital del Portafolio</label>
                    <select
                      value={selectedDigitalId}
                      onChange={(e) => setSelectedDigitalId(e.target.value)}
                      className="w-full p-2 bg-white border border-bananur-sand rounded-lg text-xs"
                    >
                      {portfolioItems.map(p => (
                        <option key={p.id} value={p.id}>{p.name} (Cliente: {p.client})</option>
                      ))}
                    </select>
                  </div>
                  <div className="md:col-span-3">
                    <label className="block text-[10px] font-bold uppercase text-bananur-clay-light mb-1 font-mono">Variante / Alcance</label>
                    <input
                      type="text"
                      value={digitalVariantDesc}
                      onChange={(e) => setDigitalVariantDesc(e.target.value)}
                      className="w-full p-2 bg-white border border-bananur-sand rounded-lg text-xs"
                      placeholder="e.g. Código & Licencia"
                    />
                  </div>
                </>
              )}

              <div className="md:col-span-1">
                <label className="block text-[10px] font-bold uppercase text-bananur-clay-light mb-1 font-mono">Cant</label>
                <input
                  type="number"
                  min="1"
                  value={addItemQty}
                  onChange={(e) => setAddItemQty(Number(e.target.value))}
                  className="w-full p-2 bg-white border border-bananur-sand rounded-lg text-xs text-center"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-[10px] font-bold uppercase text-bananur-clay-light mb-1 font-mono">Precio ($)</label>
                <input
                  type="number"
                  placeholder={getDefaultPrice().toString()}
                  value={addItemPrice || ''}
                  onChange={(e) => setAddItemPrice(Number(e.target.value))}
                  className="w-full p-2 bg-white border border-bananur-sand rounded-lg text-xs"
                />
              </div>

              <div className="md:col-span-1">
                <button
                  type="button"
                  onClick={handleAddItemToOrder}
                  className="w-full py-2 bg-bananur-clay text-bananur-cream hover:bg-bananur-gold hover:text-bananur-clay duration-150 font-bold rounded-lg text-xs cursor-pointer text-center"
                >
                  +
                </button>
              </div>
            </div>

            {/* List of currently added items */}
            <div className="pt-4 border-t border-bananur-sand/40">
              <span className="text-[10px] font-bold uppercase font-mono text-bananur-clay-light/80 block mb-2">Artículos a Listar en Boleta/Factura:</span>
              {cartItems.length === 0 ? (
                <div className="p-4 bg-bananur-cream/30 text-center text-xs text-bananur-clay-light border border-dashed border-bananur-sand rounded-xl">
                  No hay artículos agregados todavía. Utiliza los selectores superiores para armar el pedido.
                </div>
              ) : (
                <div className="space-y-2 max-h-[160px] overflow-y-auto scrollbar-hidden">
                  {cartItems.map((item, idx) => (
                    <div key={idx} className="flex justify-between items-center text-xs p-3 bg-bananur-cream/40 rounded-xl border border-bananur-sand/60">
                      <div>
                        <span className="font-semibold text-bananur-clay block">{item.productName}</span>
                        <span className="text-[10px] text-bananur-clay-light/80 font-mono">
                          Variante: {item.variant} | Cantidad: {item.quantity} | Unitario: ${item.price.toLocaleString('es-CL')}
                        </span>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="font-mono font-bold text-bananur-clay">${(item.price * item.quantity).toLocaleString('es-CL')}</span>
                        <button
                          type="button"
                          onClick={() => setCartItems(cartItems.filter((_, i) => i !== idx))}
                          className="p-1 hover:bg-rose-100 hover:text-rose-700 text-bananur-clay-light rounded duration-150 cursor-pointer"
                        >
                          <Trash className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* INFORMACIÓN COMPLEMENTARIA DE VENTAS */}
          <div className="bg-[#FAF8F5] p-5 rounded-xl border border-bananur-sand space-y-4">
            <h4 className="text-xs font-bold uppercase tracking-wider font-mono text-bananur-clay flex items-center gap-1.5">
              <span className="w-2 h-2 bg-[#B58455] rounded-full inline-block" />
              Complemento de Ventas (Información para el Departamento de Ventas)
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
              <div>
                <label className="block text-[10px] font-bold uppercase text-bananur-clay mb-1.5 font-mono">Canal de Venta *</label>
                <select
                  id="orders-create-sales-channel"
                  value={salesChannel}
                  onChange={(e) => setSalesChannel(e.target.value as any)}
                  className="w-full p-2 bg-white border border-bananur-sand rounded-lg text-xs"
                >
                  <option value="Sitio Web">Sitio Web</option>
                  <option value="Instagram">Instagram / RRSS</option>
                  <option value="WhatsApp">WhatsApp Negocio</option>
                  <option value="Feria Presencial">Feria o Showroom</option>
                  <option value="Reunión/Asesoría">Reunión de Asesoría</option>
                </select>
              </div>

              <div>
                <label className="block text-[10px] font-bold uppercase text-bananur-clay mb-1.5 font-mono">Método de Pago *</label>
                <select
                  id="orders-create-payment-method"
                  value={paymentMethod}
                  onChange={(e) => setPaymentMethod(e.target.value as any)}
                  className="w-full p-2 bg-white border border-bananur-sand rounded-lg text-xs"
                >
                  <option value="Transferencia">Transferencia Bancaria</option>
                  <option value="Tarjeta de Crédito/Débito">Tarjeta de Crédito/Débito</option>
                  <option value="Efectivo">Efectivo</option>
                  <option value="Mercado Pago">Mercado Pago</option>
                </select>
              </div>

              <div>
                <label className="block text-[10px] font-bold uppercase text-bananur-clay mb-1.5 font-mono">Estado del Pago *</label>
                <select
                  id="orders-create-payment-status"
                  value={paymentStatus}
                  onChange={(e) => setPaymentStatus(e.target.value as any)}
                  className="w-full p-2 bg-white border border-bananur-sand rounded-lg text-xs"
                >
                  <option value="Pagado">Pagado / Aprobado</option>
                  <option value="Pendiente">Pendiente de Confirmación</option>
                  <option value="Reembolsado">Reembolsado</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
              <div className="md:col-span-1">
                <label className="block text-[10px] font-bold uppercase text-bananur-clay mb-1.5 font-mono">Nº de Seguimiento Starken (Opcional)</label>
                <input
                  id="orders-create-tracking"
                  type="text"
                  placeholder="e.g. STR-9281923"
                  value={trackingNumber}
                  onChange={(e) => setTrackingNumber(e.target.value)}
                  className="w-full p-2 bg-white border border-bananur-sand rounded-lg font-mono text-xs"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-[10px] font-bold uppercase text-bananur-clay mb-1.5 font-mono">Notas Internas de Venta</label>
                <textarea
                  id="orders-create-notes"
                  placeholder="Especificaciones de empaque, regalos promocionales, etc."
                  value={sellerNotes}
                  onChange={(e) => setSellerNotes(e.target.value)}
                  className="w-full p-2 bg-white border border-bananur-sand rounded-lg text-xs h-[38px] resize-none"
                />
              </div>
            </div>
          </div>

          {/* Totals & Submit */}
          <div className="flex flex-col sm:flex-row items-center justify-between border-t border-bananur-sand/50 pt-4 gap-4">
            <div className="text-left">
              <span className="text-xs text-bananur-clay-light/60 font-mono">VALOR NETO AFECTO:</span>
              <div className="text-xl font-mono font-extrabold text-bananur-clay">
                ${cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0).toLocaleString('es-CL')} CLP
              </div>
              <p className="text-[10px] text-bananur-clay-light/60 font-light mt-0.5">IVA (19%) incluido. Flete por Starken Chile: $3.990</p>
            </div>
            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => {
                  setShowCreateForm(false);
                  setCartItems([]);
                }}
                className="px-5 py-2.5 bg-white border border-bananur-sand text-bananur-clay font-bold text-xs rounded-xl hover:bg-bananur-cream cursor-pointer duration-150"
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="px-6 py-2.5 bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs rounded-xl cursor-pointer duration-150 shadow-xs"
              >
                Confirmar y Emitir Documento SII
              </button>
            </div>
          </div>
        </form>
      )}

      {/* Search filters toolbar */}
      <div className="bg-white p-4 rounded-xl border border-bananur-sand grid grid-cols-1 md:grid-cols-4 gap-4">
        {/* Search */}
        <div className="relative">
          <input
            id="orders-search"
            type="text"
            placeholder="Buscar por código o cliente..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-bananur-cream/30 border border-bananur-sand rounded-lg text-xs"
          />
          <Search className="w-4 h-4 text-bananur-clay-light absolute left-3 top-1/2 -translate-y-1/2" />
        </div>

        {/* Doc type check */}
        <div className="flex items-center gap-2">
          <span className="text-xs font-mono text-bananur-clay-light shrink-0">Documento:</span>
          <div className="flex bg-bananur-sand/50 rounded-lg p-0.5 w-full">
            {(['todos', 'boleta', 'factura'] as const).map((type) => (
              <button
                id={`orders-filter-doc-${type}`}
                key={type}
                onClick={() => setDocTypeFilter(type)}
                className={`flex-1 text-center py-1.5 text-[10px] font-bold uppercase rounded-md cursor-pointer transition-colors ${
                  docTypeFilter === type 
                    ? 'bg-white text-bananur-clay shadow-xs' 
                    : 'text-bananur-clay-light hover:text-bananur-clay'
                }`}
              >
                {type}
              </button>
            ))}
          </div>
        </div>

        {/* Status filter */}
        <div className="flex items-center gap-2">
          <span className="text-xs font-mono text-bananur-clay-light shrink-0">Estatus:</span>
          <select
            id="orders-filter-status"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="w-full p-2 bg-white border border-bananur-sand rounded-lg text-xs"
          >
            <option value="todos">Todos los estados</option>
            <option value="En preparación">En preparación</option>
            <option value="Enviado">Enviado</option>
            <option value="Entregado">Entregado</option>
          </select>
        </div>

        {/* Date Filter */}
        <div className="flex items-center gap-2">
          <span className="text-xs font-mono text-bananur-clay-light shrink-0">Fecha:</span>
          <div className="relative w-full">
            <input
              id="orders-filter-date"
              type="date"
              value={dateFilter}
              onChange={(e) => setDateFilter(e.target.value)}
              className="w-full p-2 bg-white border border-bananur-sand rounded-lg text-xs font-mono"
            />
            {dateFilter && (
              <button
                type="button"
                onClick={() => setDateFilter('')}
                className="absolute right-2 top-1/2 -translate-y-1/2 text-[10px] text-rose-600 font-mono hover:underline font-bold"
              >
                Limpiar
              </button>
            )}
          </div>
        </div>

      </div>

      {/* Grid listing table */}
      <div className="bg-white rounded-2xl border border-bananur-sand overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse font-sans">
            <thead>
              <tr className="bg-bananur-cream/50 border-b border-bananur-sand text-[10px] font-mono uppercase tracking-widest text-bananur-clay-light/80">
                <th className="py-4 px-6">Orden / Código</th>
                <th className="py-4">Fecha</th>
                <th className="py-4">Cliente / Despacho</th>
                <th className="py-4">Lo Vendido (Descripción & Cantidad)</th>
                <th className="py-4">Estatus Despacho</th>
                <th className="py-4">Tipo Doc.</th>
                <th className="py-4">IVA (19%)</th>
                <th className="py-4">Monto Total</th>
                <th className="py-4">Estado SII</th>
                <th className="py-4 px-6 text-right">Detalle</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-bananur-sand/40 text-xs text-bananur-clay">
              {filteredOrders.map((order) => {
                const getStatusBadge = (s: string) => {
                  if (s === 'En preparación') return 'bg-amber-50 text-amber-700 border-amber-200';
                  if (s === 'Enviado') return 'bg-blue-50 text-blue-700 border-blue-200';
                  return 'bg-emerald-50 text-emerald-700 border-emerald-200';
                };

                const isSynced = siiSyncStatus[order.id] === 'success';

                return (
                  <tr key={order.id} className="hover:bg-bananur-sand/10 transition-colors">
                    <td className="py-4 px-6 font-mono font-bold text-bananur-clay">{order.id}</td>
                    <td className="py-4 text-bananur-clay-light">{order.date}</td>
                    <td className="py-4">
                      <span className="font-semibold block">{order.customerName}</span>
                      <span className="text-[10px] text-bananur-clay-light/60 font-mono italic">{order.commune}, {order.city}</span>
                    </td>
                    <td className="py-4">
                      <div className="max-w-[220px] space-y-1">
                        {order.items.map((it, idx) => (
                          <div key={idx} className="flex items-center justify-between gap-3 text-[11px] border-b border-bananur-sand/20 last:border-0 pb-0.5 last:pb-0">
                            <span className="truncate text-bananur-clay-light font-medium" title={it.productName}>
                              {it.productName}
                            </span>
                            <span className="font-mono font-bold text-bananur-gold-dark shrink-0 bg-bananur-cream px-1.5 py-0.2 rounded-md">
                              x{it.quantity}
                            </span>
                          </div>
                        ))}
                      </div>
                    </td>
                    <td className="py-4">
                      <span className={`px-2.5 py-1 text-[10px] font-bold rounded-full border inline-flex items-center gap-1.5 uppercase font-mono ${getStatusBadge(order.status)}`}>
                        {order.status === 'En preparación' && <Package className="w-3.5 h-3.5 shrink-0" />}
                        {order.status === 'Enviado' && <Truck className="w-3.5 h-3.5 shrink-0" />}
                        {order.status === 'Entregado' && <CheckCircle className="w-3.5 h-3.5 shrink-0" />}
                        {order.status}
                      </span>
                    </td>
                    <td className="py-4">
                      <span className={`px-2 py-0.5 text-[9px] font-bold rounded uppercase font-mono ${
                        order.type === 'factura' 
                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' 
                          : 'bg-sky-50 text-sky-700 border border-sky-200'
                      }`}>
                        {order.type}
                      </span>
                    </td>
                    <td className="py-4 font-mono text-bananur-clay-light/80">
                      ${Math.round(order.subtotal * 0.19).toLocaleString('es-CL')}
                    </td>
                    <td className="py-4 font-mono font-bold">${order.total.toLocaleString('es-CL')}</td>
                    <td className="py-4">
                      {isSynced ? (
                        <span className="inline-flex items-center gap-1 text-emerald-600 font-semibold text-[10px]">
                          <ShieldCheck className="w-3.5 h-3.5" />
                          Declarada SII
                        </span>
                      ) : (
                        <button
                          id={`orders-btn-sync-${order.id}`}
                          onClick={() => handleSyncSII(order.id, order.type)}
                          disabled={syncingId === order.id}
                          className="text-[10px] text-bananur-gold-dark hover:text-bananur-gold flex items-center gap-1 font-bold cursor-pointer disabled:opacity-50"
                        >
                          <RefreshCw className={`w-3 h-3 ${syncingId === order.id ? 'animate-spin' : ''}`} />
                          Sincronizar SII
                        </button>
                      )}
                    </td>
                    <td className="py-4 px-6 text-right">
                      <button
                        id={`orders-btn-detail-${order.id}`}
                        onClick={() => setActiveOrder(order)}
                        className="text-xs text-bananur-clay font-bold hover:underline inline-flex items-center gap-1 cursor-pointer"
                      >
                        Revisar
                        <ArrowUpRight className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* DETALLE COMPLETO MODAL DRAWER */}
      {activeOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-bananur-clay/75 backdrop-blur-xs" onClick={() => setActiveOrder(null)}></div>
          <div className="relative bg-white max-w-lg w-full rounded-2xl shadow-xl overflow-hidden z-15 border border-bananur-sand animate-scale-up">
            
            {/* Header */}
            <div className="p-6 bg-bananur-cream border-b border-bananur-sand flex items-center justify-between">
              <div>
                <span className="font-mono text-[10px] text-bananur-clay-light/60 uppercase tracking-wider block">ID Transacción</span>
                <div className="flex items-center gap-2 mt-0.5">
                  <span className="font-serif text-lg font-bold text-bananur-clay">{activeOrder.id}</span>
                  <span className={`px-2.5 py-0.5 text-[9px] font-bold rounded-full border inline-flex items-center gap-1 uppercase font-mono ${
                    activeOrder.status === 'En preparación' ? 'bg-amber-100 text-amber-800 border-amber-300' :
                    activeOrder.status === 'Enviado' ? 'bg-blue-100 text-blue-800 border-blue-300' :
                    'bg-emerald-100 text-emerald-850 border-emerald-300'
                  }`}>
                    {activeOrder.status === 'En preparación' && <Package className="w-2.5 h-2.5 shrink-0" />}
                    {activeOrder.status === 'Enviado' && <Truck className="w-2.5 h-2.5 shrink-0" />}
                    {activeOrder.status === 'Entregado' && <CheckCircle className="w-2.5 h-2.5 shrink-0" />}
                    {activeOrder.status}
                  </span>
                </div>
              </div>
              <button onClick={() => setActiveOrder(null)} className="text-bananur-clay hover:text-bananur-gold p-1 cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Inner detailed specs */}
            <div className="p-6 space-y-6 max-h-[60vh] overflow-y-auto scrollbar-hidden">
              
              {/* SII Tributary Box */}
              <div className="p-4 bg-bananur-sand/30 rounded-xl border border-bananur-clay/5 space-y-3">
                <div className="flex items-center gap-2">
                  <ReceiptText className="w-5 h-5 text-bananur-gold-dark" />
                  <h4 className="font-serif text-sm font-bold text-bananur-clay">
                    Detalles Tributarios del Documento
                  </h4>
                </div>

                {activeOrder.type === 'factura' ? (
                  /* FACTURA DATA */
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-2.5 gap-x-4 text-xs font-sans pt-1">
                    <div>
                      <span className="text-[10px] text-bananur-clay-light/50 font-mono block">R.U.T. Empresa</span>
                      <span className="font-mono font-bold text-bananur-clay">{activeOrder.taxId || '76.492.311-K'}</span>
                    </div>
                    <div>
                      <span className="text-[10px] text-bananur-clay-light/50 font-mono block">Razón Social</span>
                      <span className="font-semibold text-bananur-clay">{activeOrder.businessName || 'Estudios Sigma SpA'}</span>
                    </div>
                    <div>
                      <span className="text-[10px] text-bananur-clay-light/50 font-mono block">Giro Comercial</span>
                      <span className="text-bananur-clay">{activeOrder.businessLine || 'Diseño Web e Informática'}</span>
                    </div>
                    <div>
                      <span className="text-[10px] text-bananur-clay-light/50 font-mono block">Dirección Tributaria</span>
                      <span className="text-bananur-clay">{activeOrder.address}</span>
                    </div>
                  </div>
                ) : (
                  /* BOLETA DATA */
                  <div className="text-xs text-bananur-clay-light font-light leading-relaxed">
                    Este pedido fue cerrado como <span className="font-semibold text-sky-800">Boleta de Ventas y Servicios Nominativa</span>. Se emite exenta de RUT empresa para consumo directo de cliente final.
                  </div>
                )}
              </div>

              {/* Items grid */}
              <div className="space-y-2.5">
                <h4 className="text-[10px] font-mono uppercase tracking-widest text-bananur-clay-light">Artículos listados</h4>
                <div className="space-y-2">
                  {activeOrder.items.map((it, idx) => (
                    <div key={idx} className="flex justify-between items-center text-xs p-3 bg-bananur-cream/30 rounded-xl border border-bananur-sand/40">
                      <div>
                        <span className="font-semibold block text-bananur-clay">{it.productName}</span>
                        <span className="text-[10px] text-bananur-clay-light/60 font-mono">Variante: {it.variant} x {it.quantity} unidades</span>
                      </div>
                      <span className="font-mono font-bold text-bananur-clay">${(it.price * it.quantity).toLocaleString('es-CL')}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Sales Department details card */}
              <div className="p-4 bg-sky-50/40 rounded-xl border border-sky-100 space-y-3 text-xs">
                <div className="flex items-center gap-1.5 text-[#3a86c8] font-bold">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#3a86c8] inline-block" />
                  Información para el Departamento de Ventas
                </div>
                <div className="grid grid-cols-2 gap-3 text-xs">
                  <div>
                    <span className="text-[10px] text-bananur-clay-light/60 font-mono block">Canal de Venta</span>
                    <span className="font-semibold text-bananur-clay">{activeOrder.salesChannel || 'Sitio Web'}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-bananur-clay-light/60 font-mono block">Método de Pago</span>
                    <span className="font-semibold text-bananur-clay">{activeOrder.paymentMethod || 'Transferencia'}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-bananur-clay-light/60 font-mono block">Estado de Pago</span>
                    <span className={`inline-block font-bold font-mono text-[10px] px-2 py-0.5 rounded-md ${
                      (activeOrder.paymentStatus || 'Pagado') === 'Pagado' ? 'bg-emerald-100 text-emerald-850' :
                      (activeOrder.paymentStatus || 'Pagado') === 'Pendiente' ? 'bg-amber-100 text-amber-850' :
                      'bg-rose-100 text-rose-850'
                    }`}>
                      {activeOrder.paymentStatus || 'Pagado'}
                    </span>
                  </div>
                  <div>
                    <span className="text-[10px] text-bananur-clay-light/60 font-mono block">Nº Seguimiento</span>
                    <span className="font-mono font-semibold text-bananur-clay">{activeOrder.trackingNumber || 'No asignado'}</span>
                  </div>
                </div>
                {activeOrder.sellerNotes && (
                  <div className="pt-2 border-t border-sky-100">
                    <span className="text-[10px] text-bananur-clay-light/60 font-mono block">Notas del Vendedor:</span>
                    <p className="text-bananur-clay mt-0.5 font-light leading-relaxed bg-white/70 p-2 rounded-lg border border-sky-50">
                      {activeOrder.sellerNotes}
                    </p>
                  </div>
                )}
              </div>

              {/* Delivery logs */}
              <div className="grid grid-cols-2 gap-4 text-xs">
                <div>
                  <h5 className="text-[10px] font-mono uppercase text-bananur-clay-light/70 mb-1">Destinatario despacho</h5>
                  <p className="font-semibold text-bananur-clay">{activeOrder.customerName}</p>
                  <p className="text-bananur-clay-light font-light">{activeOrder.customerPhone || 'N/A'}</p>
                  <p className="text-[10px] text-bananur-clay-light/60">{activeOrder.customerEmail}</p>
                </div>
                <div>
                  <h5 className="text-[10px] font-mono uppercase text-bananur-clay-light/70 mb-1">Dirección despacho</h5>
                  <p className="text-bananur-clay">{activeOrder.address}</p>
                  <p className="text-bananur-clay-light font-light">{activeOrder.commune}, {activeOrder.city}</p>
                  <p className="text-[10px] text-bananur-gold-dark font-mono font-semibold">Starken Courier</p>
                </div>
              </div>

              {/* Order Status editor */}
              <div className="pt-4 border-t border-bananur-sand/50 space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-xs font-bold uppercase tracking-wider font-mono text-bananur-clay">Actualizar Estatus Operativo</span>
                  <span className="text-[10px] text-bananur-clay-light/60">Haz clic para cambiar el estado inmediatamente</span>
                </div>
                <div className="grid grid-cols-3 gap-2">
                  {(['En preparación', 'Enviado', 'Entregado'] as const).map((st) => {
                    const isActive = activeOrder.status === st;
                    const stStyles = {
                      'En preparación': {
                        active: 'bg-amber-100 text-amber-850 border-2 border-amber-400 ring-2 ring-amber-200/50',
                        inactive: 'bg-amber-50/40 text-amber-600 border border-amber-200/50 hover:bg-amber-50 hover:text-amber-700 hover:border-amber-300'
                      },
                      'Enviado': {
                        active: 'bg-blue-100 text-blue-850 border-2 border-blue-400 ring-2 ring-blue-200/50',
                        inactive: 'bg-blue-50/40 text-blue-600 border border-blue-200/50 hover:bg-blue-50 hover:text-blue-700 hover:border-blue-300'
                      },
                      'Entregado': {
                        active: 'bg-emerald-100 text-emerald-850 border-2 border-emerald-400 ring-2 ring-emerald-200/50',
                        inactive: 'bg-emerald-50/40 text-emerald-600 border border-emerald-200/50 hover:bg-emerald-50 hover:text-emerald-700 hover:border-emerald-300'
                      }
                    }[st];

                    return (
                      <button
                        id={`orders-status-btn-${st}`}
                        key={st}
                        type="button"
                        onClick={() => {
                          onUpdateOrderStatus(activeOrder.id, st);
                          setActiveOrder(prev => prev ? { ...prev, status: st } : null);
                        }}
                        className={`flex flex-col items-center justify-center p-3 rounded-xl text-center font-bold tracking-wide transition-all duration-150 cursor-pointer ${
                          isActive ? stStyles.active : stStyles.inactive
                        }`}
                      >
                        {st === 'En preparación' && <Package className={`w-5 h-5 mb-1.5 ${isActive ? 'text-amber-800 scale-110' : 'text-amber-500'}`} />}
                        {st === 'Enviado' && <Truck className={`w-5 h-5 mb-1.5 ${isActive ? 'text-blue-800 scale-110' : 'text-blue-500'}`} />}
                        {st === 'Entregado' && <CheckCircle className={`w-5 h-5 mb-1.5 ${isActive ? 'text-emerald-800 scale-110' : 'text-emerald-500'}`} />}
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
                id="orders-drawer-btn-print"
                onClick={() => alert('Simulando envío de comando de impresión de PDF de boleta autorizada al terminal local.')}
                className="flex-1 py-3 px-4 rounded-xl text-xs font-bold border border-bananur-sand bg-white text-bananur-clay hover:bg-bananur-cream flex items-center justify-center gap-2 cursor-pointer"
              >
                <Printer className="w-4 h-4" />
                Imprimir Documento
              </button>
              <button
                id="orders-drawer-btn-email"
                onClick={() => alert(`Enviando correo con copia boleta/factura firmada electrónicamente a ${activeOrder.customerEmail}`)}
                className="flex-1 py-3 px-4 rounded-xl text-xs font-bold bg-bananur-clay text-bananur-cream hover:bg-bananur-gold hover:text-bananur-clay duration-150 transition-colors flex items-center justify-center gap-2 cursor-pointer"
              >
                <Mail className="w-4 h-4" />
                Reenviar Copia Cliente
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}
