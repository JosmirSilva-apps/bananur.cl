import React, { useState, useMemo } from 'react';
import { 
  Coins, 
  TrendingUp, 
  TrendingDown, 
  DollarSign, 
  Plus, 
  Search, 
  Download, 
  FileText, 
  ShoppingBag, 
  Percent, 
  Store, 
  Calculator, 
  Calendar, 
  Check, 
  ChevronRight, 
  Sparkles, 
  Printer, 
  Layers, 
  Users, 
  Trash2,
  FileSpreadsheet,
  Scan,
  Barcode
} from 'lucide-react';
import { Order, Product, Service, PortfolioItem } from '../types';
import AdminOrders from './AdminOrders';
import { playScanSuccessSound } from '../services/barcodeService';

interface AdminSalesProps {
  orders: Order[];
  onAddOrder: (order: Order) => void;
  products: Product[];
  onShowToast?: (title: string, description: string, type?: 'success' | 'info' | 'warning' | 'error') => void;
  services?: Service[];
  portfolioItems?: PortfolioItem[];
  onUpdateOrderStatus?: (orderId: string, status: 'En preparación' | 'Enviado' | 'Entregado') => void;
  onOpenScannerModal?: () => void;
}

interface QuoteItem {
  name: string;
  price: number;
  quantity: number;
}

export default function AdminSales({
  orders,
  onAddOrder,
  products,
  onShowToast,
  services = [],
  portfolioItems = [],
  onUpdateOrderStatus = () => {},
  onOpenScannerModal
}: AdminSalesProps) {
  // Navigation tabs within Sales module: 'dashboard' (KPIs), 'manual-sale' (POS Terminal), 'quotes' (B2B Cotizador), 'ledger' (Libro de Ventas), 'orders' (Pedidos)
  const [salesTab, setSalesTab] = useState<'dashboard' | 'manual-sale' | 'quotes' | 'ledger' | 'orders'>('dashboard');

  // Barcode Gun & Code Scanner State in POS
  const [barcodeScannerInput, setBarcodeScannerInput] = useState('');
  const [lastScannedItemAlert, setLastScannedItemAlert] = useState<string | null>(null);

  // Search & Filter state for the ledger
  const [searchQuery, setSearchQuery] = useState('');
  const [channelFilter, setChannelFilter] = useState<'Todos' | 'Sitio Web' | 'Instagram' | 'WhatsApp' | 'Feria Presencial' | 'Reunión/Asesoría'>('Todos');
  const [paymentStatusFilter, setPaymentStatusFilter] = useState<'Todos' | 'Pagado' | 'Pendiente' | 'Reembolsado'>('Todos');
  const [docTypeFilter, setDocTypeFilter] = useState<'Todos' | 'boleta' | 'factura'>('Todos');

  // Sales Goal state
  const [monthlySalesGoal, setMonthlySalesGoal] = useState<number>(2500000); // 2.5 Million CLP target

  // Manual Sale Form state
  const [selectedProduct, setSelectedProduct] = useState<string>('');
  const [customProductName, setCustomProductName] = useState<string>('');
  const [manualPrice, setManualPrice] = useState<number>(0);
  const [manualQty, setManualQty] = useState<number>(1);
  const [manualVariant, setManualVariant] = useState<string>('Arena');
  
  const [manualCart, setManualCart] = useState<{
    productId: string;
    productName: string;
    price: number;
    quantity: number;
    variant: string;
  }[]>([]);

  const [customerName, setCustomerName] = useState('');
  const [customerEmail, setCustomerEmail] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [isExpressClient, setIsExpressClient] = useState(false);
  
  const [manualDocType, setManualDocType] = useState<'boleta' | 'factura'>('boleta');
  const [manualTaxId, setManualTaxId] = useState('');
  const [manualBusinessName, setManualBusinessName] = useState('');
  const [manualBusinessLine, setManualBusinessLine] = useState('');
  
  const [manualAddress, setManualAddress] = useState('Despacho en Tienda / Feria');
  const [manualCommune, setManualCommune] = useState('Viña del Mar');
  const [manualCity, setManualCity] = useState('Viña del Mar');
  const [manualShippingFee, setManualShippingFee] = useState<number>(0);
  const [manualPaymentMethod, setManualPaymentMethod] = useState<'Transferencia' | 'Tarjeta de Crédito/Débito' | 'Efectivo' | 'Mercado Pago'>('Efectivo');
  const [cashReceived, setCashReceived] = useState<number>(0);
  const [manualSalesChannel, setManualSalesChannel] = useState<'Sitio Web' | 'Instagram' | 'WhatsApp' | 'Feria Presencial' | 'Reunión/Asesoría'>('Feria Presencial');
  const [manualSellerNotes, setManualSellerNotes] = useState('');

  // B2B Quote Generator state
  const [quoteClientCompany, setQuoteClientCompany] = useState('');
  const [quoteClientTaxId, setQuoteClientTaxId] = useState('');
  const [quoteClientContact, setQuoteClientContact] = useState('');
  const [quoteClientEmail, setQuoteClientEmail] = useState('');
  const [quoteClientPhone, setQuoteClientPhone] = useState('');
  const [quoteValidity, setQuoteValidity] = useState('15 días');
  const [quoteDiscount, setQuoteDiscount] = useState<number>(0);
  const [quoteNotes, setQuoteNotes] = useState('Condiciones: Requiere abono del 50% para iniciar producción artesanal.');
  const [quoteItems, setQuoteItems] = useState<QuoteItem[]>([
    { name: 'Soporte Geométrico 3D Reciclado (Mayorista)', price: 12500, quantity: 20 }
  ]);
  const [newQuoteItemName, setNewQuoteItemName] = useState('');
  const [newQuoteItemPrice, setNewQuoteItemPrice] = useState<number>(0);
  const [newQuoteItemQty, setNewQuoteItemQty] = useState<number>(1);
  const [generatedQuote, setGeneratedQuote] = useState<any | null>(null);

  // --- STATS COMPUTATION ---
  const stats = useMemo(() => {
    const validOrders = orders.filter(o => o.paymentStatus !== 'Reembolsado');
    const totalSales = validOrders.reduce((sum, o) => sum + o.total, 0);
    const totalSubtotal = validOrders.reduce((sum, o) => sum + o.subtotal, 0);
    const totalShipping = validOrders.reduce((sum, o) => sum + o.shippingFee, 0);
    
    // Taxes: 19% IVA on the subtotal of physical products
    const totalIVA = Math.round(totalSubtotal * (19 / 119)); // Included inside total subtotal
    const totalNet = totalSubtotal - totalIVA;

    const ticketsCount = validOrders.length || 1;
    const averageTicket = Math.round(totalSales / ticketsCount);

    // Distribution by Sales Channel
    const channels: Record<string, number> = {
      'Sitio Web': 0,
      'Instagram': 0,
      'WhatsApp': 0,
      'Feria Presencial': 0,
      'Reunión/Asesoría': 0
    };

    // Distribution by Payment Method
    const payments: Record<string, number> = {
      'Transferencia': 0,
      'Tarjeta de Crédito/Débito': 0,
      'Efectivo': 0,
      'Mercado Pago': 0
    };

    validOrders.forEach(o => {
      if (o.salesChannel && channels[o.salesChannel] !== undefined) {
        channels[o.salesChannel] += o.total;
      } else if (o.salesChannel) {
        channels[o.salesChannel] = o.total;
      } else {
        channels['Sitio Web'] += o.total; // Default
      }

      if (o.paymentMethod && payments[o.paymentMethod] !== undefined) {
        payments[o.paymentMethod] += o.total;
      }
    });

    return {
      totalSales,
      totalSubtotal,
      totalNet,
      totalIVA,
      totalShipping,
      averageTicket,
      ticketsCount: validOrders.length,
      channels,
      payments
    };
  }, [orders]);

  // --- LEDGER FILTERING ---
  const filteredOrders = useMemo(() => {
    return orders.filter(o => {
      // Search text matches ID, Customer Name, City or Product Name
      const matchesSearch = 
        o.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
        o.customerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        o.city.toLowerCase().includes(searchQuery.toLowerCase()) ||
        o.items.some(item => item.productName.toLowerCase().includes(searchQuery.toLowerCase()));

      const matchesChannel = channelFilter === 'Todos' || o.salesChannel === channelFilter;
      const matchesStatus = paymentStatusFilter === 'Todos' || o.paymentStatus === paymentStatusFilter;
      const matchesDoc = docTypeFilter === 'Todos' || o.type === docTypeFilter;

      return matchesSearch && matchesChannel && matchesStatus && matchesDoc;
    });
  }, [orders, searchQuery, channelFilter, paymentStatusFilter, docTypeFilter]);

  // --- ACTIONS HANDLERS ---
  const handleAddProductToManualCart = () => {
    let pName = '';
    let price = manualPrice;

    if (selectedProduct === 'custom') {
      pName = customProductName.trim();
      if (!pName) {
        if (onShowToast) onShowToast('Error', 'Por favor escribe el nombre del producto personalizado', 'warning');
        return;
      }
    } else {
      const prod = products.find(p => p.id === selectedProduct);
      if (!prod) return;
      pName = prod.name;
      if (price === 0) price = prod.price;
    }

    if (price <= 0) {
      if (onShowToast) onShowToast('Precio inválido', 'Por favor ingresa un precio mayor a 0', 'warning');
      return;
    }

    const newItem = {
      productId: selectedProduct === 'custom' ? `custom-${Date.now()}` : selectedProduct,
      productName: pName,
      price,
      quantity: manualQty,
      variant: manualVariant
    };

    setManualCart([...manualCart, newItem]);
    
    // Reset product selection
    setSelectedProduct('');
    setCustomProductName('');
    setManualPrice(0);
    setManualQty(1);

    if (onShowToast) {
      onShowToast('Producto añadido', `Se agregó ${pName} al terminal de venta.`, 'success');
    }
  };

  // Escaneo rápido de código único / código de barras en POS
  const handleBarcodeScanSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const code = barcodeScannerInput.trim().toUpperCase();
    if (!code) return;

    // Buscar en productos físicos por código único o ID
    const prod = products.find(p => 
      p.code?.toUpperCase() === code || 
      p.sku?.toUpperCase() === code || 
      p.id.toUpperCase() === code
    );

    if (prod) {
      playScanSuccessSound();
      setManualCart(prev => {
        const existingIdx = prev.findIndex(item => item.productId === prod.id);
        if (existingIdx >= 0) {
          const updated = [...prev];
          updated[existingIdx].quantity += 1;
          return updated;
        } else {
          return [
            ...prev,
            {
              productId: prod.id,
              productName: prod.name,
              price: prod.price,
              quantity: 1,
              variant: (prod.variants && prod.variants[0]) || 'Estándar'
            }
          ];
        }
      });

      setLastScannedItemAlert(`✅ ¡${prod.name} (${prod.code || prod.id}) escaneado y añadido!`);
      setTimeout(() => setLastScannedItemAlert(null), 3500);
      setBarcodeScannerInput('');
      if (onShowToast) {
        onShowToast('Código Escaneado', `Se agregó ${prod.name} al carro.`, 'success');
      }
      return;
    }

    // Buscar en servicios
    const serv = services.find(s => 
      s.code?.toUpperCase() === code || 
      s.id.toUpperCase() === code
    );

    if (serv) {
      playScanSuccessSound();
      setManualCart(prev => {
        const existingIdx = prev.findIndex(item => item.productId === serv.id);
        if (existingIdx >= 0) {
          const updated = [...prev];
          updated[existingIdx].quantity += 1;
          return updated;
        } else {
          return [
            ...prev,
            {
              productId: serv.id,
              productName: `[Servicio] ${serv.name}`,
              price: serv.price,
              quantity: 1,
              variant: serv.category
            }
          ];
        }
      });

      setLastScannedItemAlert(`✅ ¡Servicio "${serv.name}" añadido al carro!`);
      setTimeout(() => setLastScannedItemAlert(null), 3500);
      setBarcodeScannerInput('');
      if (onShowToast) {
        onShowToast('Servicio Escaneado', `Se agregó "${serv.name}" al carro.`, 'success');
      }
      return;
    }

    if (onShowToast) {
      onShowToast('Código no encontrado', `No se encontró ningún producto o servicio con el código "${code}".`, 'warning');
    }
  };

  const handleRemoveItemFromManualCart = (index: number) => {
    const updated = [...manualCart];
    updated.splice(index, 1);
    setManualCart(updated);
  };

  const handleRegisterManualSaleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (manualCart.length === 0) {
      if (onShowToast) onShowToast('Carro vacío', 'Debes añadir al menos un producto al carro para registrar la venta.', 'warning');
      return;
    }

    if (!isExpressClient && (!customerName.trim() || !customerEmail.trim())) {
      if (onShowToast) onShowToast('Campos obligatorios', 'Completa el nombre y correo del cliente, o marca "Cliente Express".', 'warning');
      return;
    }

    if (manualDocType === 'factura' && (!manualTaxId || !manualBusinessName)) {
      if (onShowToast) onShowToast('Faltan datos de factura', 'Para Facturas, el RUT y Razón Social son requeridos.', 'warning');
      return;
    }

    const finalSubtotal = manualCart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const finalTotal = finalSubtotal + manualShippingFee;
    const finalId = `OR-${Math.floor(1000 + Math.random() * 9000)}`;

    const newOrder: Order = {
      id: finalId,
      date: new Date().toISOString().split('T')[0],
      customerName: isExpressClient ? 'Cliente Express Presencial' : customerName,
      customerEmail: isExpressClient ? 'ventas.tienda@bananur.cl' : customerEmail,
      customerPhone: customerPhone || undefined,
      type: manualDocType,
      taxId: manualDocType === 'factura' ? manualTaxId : undefined,
      businessName: manualDocType === 'factura' ? manualBusinessName : undefined,
      businessLine: manualDocType === 'factura' ? manualBusinessLine : undefined,
      address: manualAddress,
      commune: manualCommune,
      city: manualCity,
      subtotal: finalSubtotal,
      shippingFee: manualShippingFee,
      total: finalTotal,
      status: 'Entregado', // manual sales in terminal are delivered
      paymentMethod: manualPaymentMethod,
      paymentStatus: 'Pagado',
      salesChannel: manualSalesChannel,
      sellerNotes: manualSellerNotes || 'Venta presencial/directa registrada manualmente en el departamento de Ventas.',
      items: manualCart.map(item => ({
        productId: item.productId,
        productName: item.productName,
        quantity: item.quantity,
        price: item.price,
        variant: item.variant
      }))
    };

    onAddOrder(newOrder);

    // Reset Form
    setManualCart([]);
    setCustomerName('');
    setCustomerEmail('');
    setCustomerPhone('');
    setIsExpressClient(false);
    setManualTaxId('');
    setManualBusinessName('');
    setManualBusinessLine('');
    setManualSellerNotes('');
    setManualDocType('boleta');

    if (onShowToast) {
      onShowToast('Venta Registrada', `La venta ${finalId} se guardó exitosamente y se rebajará del catálogo.`, 'success');
    }
    
    // Navigate to ledger to view
    setSalesTab('ledger');
  };

  // --- B2B QUOTATION FUNCTIONS ---
  const handleAddQuoteItem = () => {
    if (!newQuoteItemName.trim() || newQuoteItemPrice <= 0) {
      if (onShowToast) onShowToast('Error', 'Completa el nombre del ítem y asigna un precio válido.', 'warning');
      return;
    }
    setQuoteItems([...quoteItems, {
      name: newQuoteItemName,
      price: newQuoteItemPrice,
      quantity: newQuoteItemQty
    }]);
    setNewQuoteItemName('');
    setNewQuoteItemPrice(0);
    setNewQuoteItemQty(1);
  };

  const handleRemoveQuoteItem = (idx: number) => {
    const updated = [...quoteItems];
    updated.splice(idx, 1);
    setQuoteItems(updated);
  };

  const handleGenerateQuote = (e: React.FormEvent) => {
    e.preventDefault();
    if (!quoteClientCompany.trim() || quoteItems.length === 0) {
      if (onShowToast) onShowToast('Campos vacíos', 'Ingresa la Razón Social y añade al menos un ítem al cotizador.', 'warning');
      return;
    }

    const subtotal = quoteItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const discountAmount = Math.round(subtotal * (quoteDiscount / 100));
    const net = subtotal - discountAmount;
    const iva = Math.round(net * 0.19);
    const total = net + iva;

    const quoteCode = `COT-2026-${Math.floor(100 + Math.random() * 900)}`;

    const quoteObj = {
      code: quoteCode,
      date: new Date().toISOString().split('T')[0],
      clientCompany: quoteClientCompany,
      clientTaxId: quoteClientTaxId,
      clientContact: quoteClientContact,
      clientEmail: quoteClientEmail,
      clientPhone: quoteClientPhone,
      validity: quoteValidity,
      items: [...quoteItems],
      subtotal,
      discount: discountAmount,
      discountPercent: quoteDiscount,
      net,
      iva,
      total,
      notes: quoteNotes
    };

    setGeneratedQuote(quoteObj);
    if (onShowToast) {
      onShowToast('Cotización Generada', `Cotización ${quoteCode} lista para presentación ejecutiva B2B.`, 'success');
    }
  };

  const handlePrintQuote = () => {
    window.print();
  };

  // Export ledger to formatted CSV
  const handleExportCSV = () => {
    if (filteredOrders.length === 0) {
      if (onShowToast) onShowToast('Sin datos', 'No hay registros de venta para exportar con los filtros actuales.', 'warning');
      return;
    }

    const headers = ['ID Orden', 'Fecha', 'Cliente', 'Email', 'Canal de Venta', 'Método Pago', 'Estado Pago', 'Neto', 'IVA (19%)', 'Costo Despacho', 'Total (CLP)'];
    const csvRows = [headers.join(',')];

    filteredOrders.forEach(o => {
      const net = Math.round(o.subtotal * (100 / 119));
      const iva = o.subtotal - net;
      const row = [
        o.id,
        o.date,
        `"${o.customerName.replace(/"/g, '""')}"`,
        o.customerEmail,
        o.salesChannel || 'Sitio Web',
        o.paymentMethod || 'Transferencia',
        o.paymentStatus || 'Pagado',
        net,
        iva,
        o.shippingFee,
        o.total
      ];
      csvRows.push(row.join(','));
    });

    const csvContent = "data:text/csv;charset=utf-8," + csvRows.join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `Libro_Ventas_Bananur_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    if (onShowToast) {
      onShowToast('Libro Exportado', 'Se descargó el Libro de Ventas en formato CSV.', 'success');
    }
  };

  return (
    <div id="admin-sales-root" className="p-6 sm:p-10 space-y-8 animate-fade-in bg-bananur-cream min-h-screen text-bananur-clay">
      
      {/* Title & Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-bananur-sand/80 pb-6">
        <div>
          <span className="text-xs font-mono uppercase tracking-widest text-[#B58455] font-bold">Dirección Comercial</span>
          <h1 className="text-3xl font-serif font-extrabold text-bananur-clay mt-1 flex items-center gap-2">
            <Coins className="w-8 h-8 text-[#B58455]" />
            Departamento de Ventas y Cotizaciones
          </h1>
          <p className="text-xs text-bananur-clay-light mt-1">
            Administra el desempeño de canales, genera presupuestos y cotizaciones corporativas, emite boletas manuales en ferias y audita el Libro de Ventas de Bananur.
          </p>
        </div>

        {/* Quick Actions Panel */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            id="sales-nav-dashboard"
            onClick={() => setSalesTab('dashboard')}
            className={`px-4 py-2 rounded-xl text-xs font-semibold font-mono tracking-wide transition-all cursor-pointer ${
              salesTab === 'dashboard'
                ? 'bg-bananur-clay text-white shadow-xs'
                : 'bg-white border border-bananur-sand text-bananur-clay hover:bg-bananur-cream'
            }`}
          >
            📊 Cuadro de Mandos
          </button>
          <button
            id="sales-nav-manual"
            onClick={() => setSalesTab('manual-sale')}
            className={`px-4 py-2 rounded-xl text-xs font-semibold font-mono tracking-wide transition-all cursor-pointer ${
              salesTab === 'manual-sale'
                ? 'bg-bananur-clay text-white shadow-xs'
                : 'bg-white border border-bananur-sand text-bananur-clay hover:bg-bananur-cream'
            }`}
          >
            🛒 Venta Directa / POS
          </button>
          <button
            id="sales-nav-quotes"
            onClick={() => setSalesTab('quotes')}
            className={`px-4 py-2 rounded-xl text-xs font-semibold font-mono tracking-wide transition-all cursor-pointer ${
              salesTab === 'quotes'
                ? 'bg-bananur-clay text-white shadow-xs'
                : 'bg-white border border-bananur-sand text-bananur-clay hover:bg-bananur-cream'
            }`}
          >
            💼 Cotizaciones B2B
          </button>
          <button
            id="sales-nav-ledger"
            onClick={() => setSalesTab('ledger')}
            className={`px-4 py-2 rounded-xl text-xs font-semibold font-mono tracking-wide transition-all cursor-pointer ${
              salesTab === 'ledger'
                ? 'bg-bananur-clay text-white shadow-xs'
                : 'bg-white border border-bananur-sand text-bananur-clay hover:bg-bananur-cream'
            }`}
          >
            📓 Libro de Ventas
          </button>
          <button
            id="sales-nav-orders"
            onClick={() => setSalesTab('orders')}
            className={`px-4 py-2 rounded-xl text-xs font-semibold font-mono tracking-wide transition-all cursor-pointer ${
              salesTab === 'orders'
                ? 'bg-bananur-clay text-white shadow-xs'
                : 'bg-white border border-bananur-sand text-bananur-clay hover:bg-bananur-cream'
            }`}
          >
            📦 Control de Pedidos
          </button>
        </div>
      </div>

      {/* --- DASHBOARD VIEW --- */}
      {salesTab === 'dashboard' && (
        <div className="space-y-8 animate-fade-in">
          
          {/* Key KPI Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-white p-6 rounded-2xl border border-bananur-sand shadow-xs">
              <span className="text-[10px] font-mono uppercase text-bananur-clay-light/70 font-bold block">Ventas Consolidadas</span>
              <div className="flex items-baseline gap-1 mt-1">
                <span className="text-3xl font-mono font-extrabold text-bananur-clay">${stats.totalSales.toLocaleString('es-CL')}</span>
                <span className="text-xs text-bananur-gold-dark font-bold font-mono">CLP</span>
              </div>
              <p className="text-[10px] text-[#40916C] font-bold font-mono mt-2 flex items-center gap-1">
                <TrendingUp className="w-3.5 h-3.5" />
                Incluye IVA y envíos recaudados
              </p>
            </div>

            <div className="bg-white p-6 rounded-2xl border border-bananur-sand shadow-xs">
              <span className="text-[10px] font-mono uppercase text-bananur-clay-light/70 font-bold block">Base Imponible (Neto)</span>
              <div className="flex items-baseline gap-1 mt-1">
                <span className="text-3xl font-mono font-extrabold text-[#40916C]">${stats.totalNet.toLocaleString('es-CL')}</span>
                <span className="text-xs text-bananur-clay-light font-bold font-mono">Neto</span>
              </div>
              <p className="text-[10px] text-bananur-clay-light mt-2 font-mono uppercase">
                IVA (19%): ${stats.totalIVA.toLocaleString('es-CL')}
              </p>
            </div>

            <div className="bg-white p-6 rounded-2xl border border-bananur-sand shadow-xs">
              <span className="text-[10px] font-mono uppercase text-bananur-clay-light/70 font-bold block">Ticket Promedio CLP</span>
              <div className="flex items-baseline gap-1 mt-1">
                <span className="text-3xl font-mono font-extrabold text-bananur-clay">${stats.averageTicket.toLocaleString('es-CL')}</span>
              </div>
              <p className="text-[10px] text-bananur-clay-light mt-2 font-mono">
                De un total de {stats.ticketsCount} transacciones
              </p>
            </div>

            <div className="bg-white p-6 rounded-2xl border border-bananur-sand shadow-xs">
              <span className="text-[10px] font-mono uppercase text-bananur-clay-light/70 font-bold block">Fletes de Despacho</span>
              <div className="flex items-baseline gap-1 mt-1">
                <span className="text-3xl font-mono font-extrabold text-[#B58455]">${stats.totalShipping.toLocaleString('es-CL')}</span>
              </div>
              <p className="text-[10px] text-bananur-clay-light mt-2 font-mono">
                Recaudado para Starken / Courriers
              </p>
            </div>
          </div>

          {/* Goal Tracker Component */}
          <div className="bg-white p-6 rounded-3xl border border-bananur-sand shadow-xs space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h3 className="font-serif text-lg font-bold text-bananur-clay flex items-center gap-1.5">
                  <Sparkles className="w-5 h-5 text-bananur-gold-dark" />
                  Meta Mensual de Ventas: Junio 2026
                </h3>
                <p className="text-xs text-bananur-clay-light">Fijación de objetivos financieros y medición del rendimiento comercial.</p>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-mono font-semibold">Ajustar Objetivo:</span>
                <input
                  id="sales-goal-slider"
                  type="range"
                  min={1000000}
                  max={5000000}
                  step={100000}
                  value={monthlySalesGoal}
                  onChange={(e) => setMonthlySalesGoal(Number(e.target.value))}
                  className="w-32 h-2 bg-bananur-cream rounded-lg appearance-none cursor-pointer accent-bananur-clay"
                />
                <span className="text-xs font-mono font-bold bg-bananur-cream px-2.5 py-1 rounded-md text-bananur-clay">
                  ${(monthlySalesGoal / 1000000).toFixed(1)}M
                </span>
              </div>
            </div>

            {/* Progress Bar */}
            <div className="space-y-2">
              <div className="flex justify-between items-baseline text-xs">
                <span className="text-bananur-clay-light">Rendimiento Actual: <strong className="text-bananur-clay font-mono">${stats.totalSales.toLocaleString('es-CL')}</strong></span>
                <span className="font-mono font-bold text-bananur-gold-dark">
                  {Math.round((stats.totalSales / monthlySalesGoal) * 100)}% Completado
                </span>
              </div>
              <div className="w-full bg-bananur-cream rounded-full h-4 border border-bananur-sand/40 overflow-hidden p-0.5">
                <div 
                  className="h-full rounded-full bg-[#B58455] transition-all duration-500 relative"
                  style={{ width: `${Math.min(100, (stats.totalSales / monthlySalesGoal) * 100)}%` }}
                >
                  <div className="absolute inset-0 bg-white/10 animate-pulse" />
                </div>
              </div>
              <p className="text-[10px] text-bananur-clay-light text-right">
                Meta de Ventas: ${monthlySalesGoal.toLocaleString('es-CL')} CLP
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            {/* Sales by Channel Visual List */}
            <div className="lg:col-span-6 bg-white p-6 rounded-3xl border border-bananur-sand shadow-xs space-y-4">
              <h3 className="font-serif text-base font-bold text-bananur-clay flex items-center gap-1.5 border-b border-bananur-sand/50 pb-3">
                <Store className="w-5 h-5 text-bananur-clay-light" />
                Rendimiento por Canal de Ventas
              </h3>
              <div className="space-y-4 pt-2">
                {Object.entries(stats.channels).map(([channel, total]) => {
                  const totalNum = Number(total);
                  const percent = stats.totalSales > 0 ? Math.round((totalNum / stats.totalSales) * 100) : 0;
                  return (
                    <div key={channel} className="space-y-1">
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-semibold text-bananur-clay">{channel}</span>
                        <span className="font-mono text-bananur-clay-light">
                          ${totalNum.toLocaleString('es-CL')} <strong className="text-bananur-gold-dark">({percent}%)</strong>
                        </span>
                      </div>
                      <div className="w-full bg-bananur-cream rounded-full h-2.5 overflow-hidden border border-bananur-sand/20">
                        <div 
                          className="h-full bg-bananur-clay rounded-full"
                          style={{ width: `${percent}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* AI Commercial Optimizer Suggestions */}
            <div className="lg:col-span-6 bg-[#FAF9F5] p-6 rounded-3xl border border-bananur-sand shadow-xs space-y-4">
              <h3 className="font-serif text-base font-bold text-bananur-clay flex items-center gap-2 border-b border-bananur-sand/50 pb-3">
                <Sparkles className="w-5 h-5 text-bananur-gold" />
                Sugerencias de Optimización IA Comercial
              </h3>
              
              <div className="space-y-3 pt-2 text-xs">
                
                {stats.channels['Instagram'] > stats.channels['Sitio Web'] && (
                  <div className="p-3.5 bg-white border border-bananur-sand/50 rounded-2xl shadow-2xs space-y-1">
                    <span className="font-mono text-[9px] font-bold text-bananur-gold-dark uppercase tracking-wider block">OPORTUNIDAD: REDES SOCIALES</span>
                    <h4 className="font-serif font-bold text-bananur-clay text-xs">Acelerar Checkout en Instagram</h4>
                    <p className="text-bananur-clay-light text-[11px] leading-relaxed">
                      Tus ventas de Instagram superan al catálogo web oficial. Sugerimos integrar links directos de pago Mercado Pago o botón rápido de WhatsApp para no enfriar la intención de compra de tus seguidores.
                    </p>
                  </div>
                )}

                <div className="p-3.5 bg-white border border-bananur-sand/50 rounded-2xl shadow-2xs space-y-1">
                  <span className="font-mono text-[9px] font-bold text-[#40916C] uppercase tracking-wider block">RECOMENDACIÓN DE MIX</span>
                  <h4 className="font-serif font-bold text-bananur-clay text-xs">Impulsar Venta Cruzada Corporativa</h4>
                  <p className="text-bananur-clay-light text-[11px] leading-relaxed">
                    Las asesorías representan un excelente gancho comercial. Ofrece a tus clientes de consultorías un 15% de descuento en pedidos de "Soportes de Escritorio 3D" o "Libretas a Medida" en el reporte final para aumentar el Ticket Promedio.
                  </p>
                </div>

                <div className="p-3.5 bg-white border border-bananur-sand/50 rounded-2xl shadow-2xs space-y-1">
                  <span className="font-mono text-[9px] font-bold text-bananur-clay-light uppercase tracking-wider block">ANALÍTICA DE TEMPORADA</span>
                  <h4 className="font-serif font-bold text-bananur-clay text-xs">Campañas en Ferias Pop-up</h4>
                  <p className="text-bananur-clay-light text-[11px] leading-relaxed">
                    Las ferias presenciales muestran un ticket promedio más impulsivo de pago en efectivo. Considera ofrecer packs con "descuento por segunda unidad" para liquidar excedentes de catálogo antes de fin de mes.
                  </p>
                </div>

              </div>
            </div>
          </div>

        </div>
      )}

      {/* --- RETAIL TERMINAL / POS MANUAL SALE VIEW --- */}
      {salesTab === 'manual-sale' && (
        <form onSubmit={handleRegisterManualSaleSubmit} className="grid grid-cols-1 lg:grid-cols-12 gap-8 animate-fade-in">
          
          {/* Left Side: Product Selector & Sale Cart */}
          <div className="lg:col-span-7 space-y-6">

            {/* Lector de Código de Barras / Escáner POS */}
            <div className="bg-[#FAF8F5] p-5 rounded-3xl border-2 border-bananur-sand shadow-2xs space-y-3">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <Scan className="w-5 h-5 text-bananur-gold-dark animate-pulse" />
                  <span className="font-serif text-sm font-bold text-bananur-clay">
                    Lector de Código de Barras & Código Único (POS)
                  </span>
                </div>
                {onOpenScannerModal && (
                  <button
                    type="button"
                    onClick={onOpenScannerModal}
                    className="px-2.5 py-1 bg-white hover:bg-bananur-sand/30 border border-bananur-sand rounded-lg text-[10px] font-mono font-bold text-bananur-clay flex items-center gap-1 cursor-pointer transition-all"
                  >
                    <Barcode className="w-3.5 h-3.5 text-bananur-gold-dark" />
                    <span>Lector Visual</span>
                  </button>
                )}
              </div>

              <div className="flex items-center gap-2">
                <div className="relative flex-1">
                  <input
                    type="text"
                    value={barcodeScannerInput}
                    onChange={(e) => setBarcodeScannerInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        handleBarcodeScanSubmit();
                      }
                    }}
                    placeholder="Escanea con pistola de códigos o tipea el código (ej. BNN-3D-0101)..."
                    className="w-full pl-9 pr-3 py-2.5 bg-white border border-bananur-sand rounded-xl text-xs font-mono uppercase font-bold text-bananur-clay focus:outline-none focus:border-bananur-gold"
                  />
                  <Barcode className="w-4 h-4 text-bananur-clay-light absolute left-3 top-3" />
                </div>
                <button
                  type="button"
                  onClick={() => handleBarcodeScanSubmit()}
                  className="px-4 py-2.5 bg-bananur-clay hover:bg-bananur-gold hover:text-black text-white rounded-xl text-xs font-mono font-bold uppercase transition-all cursor-pointer shadow-2xs"
                >
                  Escanear
                </button>
              </div>

              {lastScannedItemAlert && (
                <div className="text-xs font-mono font-bold text-emerald-800 bg-emerald-100/90 border border-emerald-300 px-3 py-1.5 rounded-xl animate-fade-in flex items-center gap-2">
                  <Check className="w-4 h-4 text-emerald-600" />
                  <span>{lastScannedItemAlert}</span>
                </div>
              )}

              {/* Quick test buttons for demonstration */}
              <div className="flex flex-wrap items-center gap-1.5 pt-1">
                <span className="text-[9px] font-mono uppercase text-bananur-clay-light font-bold">Probar escaneo:</span>
                {products.slice(0, 3).map(p => (
                  <button
                    key={p.id}
                    type="button"
                    onClick={() => {
                      const code = (p.code || p.id).toUpperCase();
                      playScanSuccessSound();
                      setManualCart(prev => {
                        const existingIdx = prev.findIndex(item => item.productId === p.id);
                        if (existingIdx >= 0) {
                          const updated = [...prev];
                          updated[existingIdx].quantity += 1;
                          return updated;
                        } else {
                          return [
                            ...prev,
                            {
                              productId: p.id,
                              productName: p.name,
                              price: p.price,
                              quantity: 1,
                              variant: (p.variants && p.variants[0]) || 'Estándar'
                            }
                          ];
                        }
                      });
                      setLastScannedItemAlert(`✅ ¡${p.name} (${p.code || p.id}) escaneado!`);
                      setTimeout(() => setLastScannedItemAlert(null), 3000);
                      setBarcodeScannerInput('');
                    }}
                    className="px-2 py-0.5 bg-white hover:bg-bananur-sand/30 border border-bananur-sand rounded text-[9px] font-mono font-bold text-bananur-clay cursor-pointer"
                  >
                    {p.code || p.id}
                  </button>
                ))}
              </div>
            </div>

            <div className="bg-white p-6 rounded-3xl border border-bananur-sand shadow-xs space-y-4">
              <h3 className="font-serif text-base font-bold text-bananur-clay border-b border-bananur-sand/50 pb-3">
                1. Seleccionar Productos para el Carro
              </h3>

              <div className="space-y-4 text-xs">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] font-bold uppercase tracking-wider text-bananur-clay-light mb-1 font-mono">Seleccionar Ítem</label>
                    <select
                      id="pos-product-select"
                      value={selectedProduct}
                      onChange={(e) => {
                        const val = e.target.value;
                        setSelectedProduct(val);
                        if (val !== 'custom') {
                          const prod = products.find(p => p.id === val);
                          if (prod) {
                            setManualPrice(prod.price);
                          }
                        } else {
                          setManualPrice(0);
                        }
                      }}
                      className="w-full p-2.5 bg-white border border-bananur-sand rounded-xl font-medium"
                    >
                      <option value="">-- Elige un producto catalogado --</option>
                      {products.map(p => (
                        <option key={p.id} value={p.id}>{p.name} (${p.price.toLocaleString('es-CL')})</option>
                      ))}
                      <option value="custom">✨ Producto Personalizado / No Catalogado</option>
                    </select>
                  </div>

                  {selectedProduct === 'custom' && (
                    <div>
                      <label className="block text-[10px] font-bold uppercase tracking-wider text-bananur-clay-light mb-1 font-mono">Nombre Ítem Personalizado</label>
                      <input
                        id="pos-custom-name"
                        type="text"
                        required
                        placeholder="e.g. Saco de Lana Trenzada XXL"
                        value={customProductName}
                        onChange={(e) => setCustomProductName(e.target.value)}
                        className="w-full p-2.5 border border-bananur-sand rounded-xl bg-white"
                      />
                    </div>
                  )}
                </div>

                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <label className="block text-[10px] font-bold uppercase tracking-wider text-bananur-clay-light mb-1 font-mono">Precio Unitario CLP</label>
                    <input
                      id="pos-item-price"
                      type="number"
                      value={manualPrice}
                      onChange={(e) => setManualPrice(Number(e.target.value))}
                      className="w-full p-2 border border-bananur-sand rounded-xl bg-white font-mono font-bold"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold uppercase tracking-wider text-bananur-clay-light mb-1 font-mono">Cantidad</label>
                    <input
                      id="pos-item-qty"
                      type="number"
                      min={1}
                      value={manualQty}
                      onChange={(e) => setManualQty(Number(e.target.value))}
                      className="w-full p-2 border border-bananur-sand rounded-xl bg-white font-mono font-bold"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold uppercase tracking-wider text-bananur-clay-light mb-1 font-mono">Variante / Tonalidad</label>
                    <select
                      id="pos-item-variant"
                      value={manualVariant}
                      onChange={(e) => setManualVariant(e.target.value)}
                      className="w-full p-2 bg-white border border-bananur-sand rounded-xl text-[11px]"
                    >
                      <option value="Arena">Arena (Beige)</option>
                      <option value="Terracota">Terracota (Clay)</option>
                      <option value="Oliva">Oliva (Verde)</option>
                      <option value="Noche">Noche (Negro)</option>
                      <option value="Natural">Fibras Naturales</option>
                    </select>
                  </div>
                </div>

                <button
                  id="pos-add-to-cart-btn"
                  type="button"
                  onClick={handleAddProductToManualCart}
                  className="w-full py-2.5 bg-bananur-gold text-bananur-clay font-bold rounded-xl text-xs hover:bg-[#B58455] hover:text-white transition-all duration-150 cursor-pointer flex items-center justify-center gap-1"
                >
                  <Plus className="w-4 h-4" /> Añadir Ítem al Carro
                </button>
              </div>
            </div>

            {/* Manual Sale Cart review */}
            <div className="bg-white p-6 rounded-3xl border border-bananur-sand shadow-xs space-y-4">
              <h3 className="font-serif text-base font-bold text-bananur-clay border-b border-bananur-sand/50 pb-3 flex items-center justify-between">
                <span>Items en Carro POS</span>
                <span className="font-mono text-xs text-bananur-gold-dark bg-bananur-cream px-2 py-0.5 rounded-full font-bold">
                  {manualCart.length} Ítem(s)
                </span>
              </h3>

              {manualCart.length === 0 ? (
                <div className="text-center py-10 text-bananur-clay-light text-xs font-light">
                  No hay productos en el carro. Selecciona productos arriba para facturar.
                </div>
              ) : (
                <div className="space-y-3.5 max-h-[300px] overflow-y-auto pr-1">
                  {manualCart.map((item, index) => (
                    <div key={index} className="flex items-center justify-between border-b border-bananur-sand/30 pb-3 last:border-0 last:pb-0">
                      <div className="space-y-0.5 max-w-[70%]">
                        <h4 className="font-semibold text-xs text-bananur-clay truncate" title={item.productName}>
                          {item.productName}
                        </h4>
                        <p className="text-[10px] text-bananur-clay-light font-mono">
                          Precio: ${item.price.toLocaleString('es-CL')} | Var: <span className="bg-bananur-cream px-1 py-0.2 rounded font-sans text-[9px] font-bold text-bananur-clay">{item.variant}</span>
                        </p>
                      </div>

                      <div className="flex items-center gap-4">
                        <span className="font-mono font-bold text-xs bg-bananur-cream/80 px-2 py-1 rounded">
                          x{item.quantity}
                        </span>
                        <span className="font-mono font-bold text-xs text-bananur-clay min-w-[75px] text-right">
                          ${(item.price * item.quantity).toLocaleString('es-CL')}
                        </span>
                        <button
                          type="button"
                          onClick={() => handleRemoveItemFromManualCart(index)}
                          className="p-1 text-bananur-coral hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Right Side: Client Info & Confirm Sale */}
          <div className="lg:col-span-5 space-y-6">
            <div className="bg-white p-6 rounded-3xl border border-bananur-sand shadow-xs space-y-5">
              <h3 className="font-serif text-base font-bold text-bananur-clay border-b border-bananur-sand/50 pb-3">
                2. Datos de Facturación y Pago
              </h3>

              <div className="space-y-4 text-xs">
                
                {/* Express client toggle */}
                <div className="flex items-center gap-2.5 p-3 bg-bananur-cream/30 border border-bananur-sand/50 rounded-xl">
                  <input
                    id="pos-express-client"
                    type="checkbox"
                    checked={isExpressClient}
                    onChange={(e) => setIsExpressClient(e.target.checked)}
                    className="w-4 h-4 text-bananur-clay border-bananur-sand focus:ring-bananur-gold rounded"
                  />
                  <label htmlFor="pos-express-client" className="font-bold text-bananur-clay select-none cursor-pointer text-[11px]">
                    ⚡ Registrar como "Cliente Express" (Sin datos)
                  </label>
                </div>

                {!isExpressClient && (
                  <div className="space-y-3">
                    <div>
                      <label className="block text-[10px] font-bold uppercase tracking-wider text-bananur-clay-light mb-1 font-mono">Nombre Completo *</label>
                      <input
                        id="pos-client-name"
                        type="text"
                        required={!isExpressClient}
                        placeholder="e.g. Sebastián Edwards"
                        value={customerName}
                        onChange={(e) => setCustomerName(e.target.value)}
                        className="w-full p-2 border border-bananur-sand rounded-xl bg-white"
                      />
                    </div>
                    
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-[10px] font-bold uppercase tracking-wider text-bananur-clay-light mb-1 font-mono">Email *</label>
                        <input
                          id="pos-client-email"
                          type="email"
                          required={!isExpressClient}
                          placeholder="sedwards@correo.cl"
                          value={customerEmail}
                          onChange={(e) => setCustomerEmail(e.target.value)}
                          className="w-full p-2 border border-bananur-sand rounded-xl bg-white"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] font-bold uppercase tracking-wider text-bananur-clay-light mb-1 font-mono">Teléfono</label>
                        <input
                          id="pos-client-phone"
                          type="text"
                          placeholder="+56 9 8441 2299"
                          value={customerPhone}
                          onChange={(e) => setCustomerPhone(e.target.value)}
                          className="w-full p-2 border border-bananur-sand rounded-xl bg-white"
                        />
                      </div>
                    </div>
                  </div>
                )}

                {/* Doc Type selection */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[10px] font-bold uppercase tracking-wider text-bananur-clay-light mb-1 font-mono">Tipo Documento</label>
                    <select
                      id="pos-doctype"
                      value={manualDocType}
                      onChange={(e) => setManualDocType(e.target.value as any)}
                      className="w-full p-2.5 bg-white border border-bananur-sand rounded-xl font-bold"
                    >
                      <option value="boleta">Boleta de Ventas</option>
                      <option value="factura">Factura de Empresas</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold uppercase tracking-wider text-bananur-clay-light mb-1 font-mono">Medio de Pago</label>
                    <select
                      id="pos-paymethod"
                      value={manualPaymentMethod}
                      onChange={(e) => setManualPaymentMethod(e.target.value as any)}
                      className="w-full p-2.5 bg-white border border-bananur-sand rounded-xl font-bold"
                    >
                      <option value="Transferencia">Transferencia</option>
                      <option value="Tarjeta de Crédito/Débito">Tarjeta Bancaria</option>
                      <option value="Efectivo">Efectivo</option>
                      <option value="Mercado Pago">Mercado Pago Link</option>
                    </select>
                  </div>

                  {manualPaymentMethod === 'Efectivo' && (
                    <div className="col-span-2 grid grid-cols-2 gap-3 bg-bananur-cream/30 p-3 rounded-xl border border-bananur-sand/30">
                      <div>
                        <label className="block text-[10px] font-bold uppercase tracking-wider text-bananur-clay-light mb-1 font-mono">Efectivo Recibido ($ CLP)</label>
                        <input
                          id="pos-cash-received"
                          type="number"
                          min={0}
                          value={cashReceived === 0 ? '' : cashReceived}
                          placeholder="e.g. 10000"
                          onChange={(e) => setCashReceived(Number(e.target.value))}
                          className="w-full p-2 border border-bananur-sand rounded-xl bg-white font-mono font-bold"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] font-bold uppercase tracking-wider text-bananur-clay-light mb-1 font-mono">Vuelto a Entregar</label>
                        <div className="w-full p-2 bg-bananur-sand/15 border border-bananur-sand/30 rounded-xl font-mono font-extrabold text-[#40916C] flex items-center h-[38px]">
                          ${Math.max(0, cashReceived - (manualCart.reduce((sum, item) => sum + (item.price * item.quantity), 0) + manualShippingFee)).toLocaleString('es-CL')} CLP
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* Conditional Factura fields */}
                {manualDocType === 'factura' && (
                  <div className="space-y-3 bg-bananur-cream/30 p-3.5 rounded-xl border border-bananur-sand/50">
                    <span className="text-[10px] font-mono font-bold text-bananur-gold-dark uppercase block">Datos Corporativos Factura</span>
                    <div>
                      <label className="block text-[9px] font-bold uppercase text-bananur-clay-light mb-1">RUT Empresa *</label>
                      <input
                        id="pos-taxid"
                        type="text"
                        required
                        placeholder="76.120.340-K"
                        value={manualTaxId}
                        onChange={(e) => setManualTaxId(e.target.value)}
                        className="w-full p-1.5 border border-bananur-sand rounded-lg bg-white font-mono"
                      />
                    </div>
                    <div>
                      <label className="block text-[9px] font-bold uppercase text-bananur-clay-light mb-1">Razón Social *</label>
                      <input
                        id="pos-businessname"
                        type="text"
                        required
                        placeholder="Inversiones El Plomo SpA"
                        value={manualBusinessName}
                        onChange={(e) => setManualBusinessName(e.target.value)}
                        className="w-full p-1.5 border border-bananur-sand rounded-lg bg-white"
                      />
                    </div>
                    <div>
                      <label className="block text-[9px] font-bold uppercase text-bananur-clay-light mb-1">Giro Comercial</label>
                      <input
                        id="pos-businessline"
                        type="text"
                        placeholder="Servicios de Publicidad o Diseño"
                        value={manualBusinessLine}
                        onChange={(e) => setManualBusinessLine(e.target.value)}
                        className="w-full p-1.5 border border-bananur-sand rounded-lg bg-white"
                      />
                    </div>
                  </div>
                )}

                {/* Channel selection & Logistic */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[10px] font-bold uppercase tracking-wider text-bananur-clay-light mb-1 font-mono">Canal de Ventas</label>
                    <select
                      id="pos-saleschannel"
                      value={manualSalesChannel}
                      onChange={(e) => setManualSalesChannel(e.target.value as any)}
                      className="w-full p-2 bg-white border border-bananur-sand rounded-xl font-medium"
                    >
                      <option value="Feria Presencial">Feria Presencial</option>
                      <option value="Instagram">Instagram DM</option>
                      <option value="WhatsApp">WhatsApp Chat</option>
                      <option value="Reunión/Asesoría">Reunión / Consultoría</option>
                      <option value="Sitio Web">Sitio Web</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold uppercase tracking-wider text-bananur-clay-light mb-1 font-mono">Costo Envío (Si aplica)</label>
                    <input
                      id="pos-shipping"
                      type="number"
                      value={manualShippingFee}
                      onChange={(e) => setManualShippingFee(Number(e.target.value))}
                      className="w-full p-2 border border-bananur-sand rounded-xl bg-white font-mono"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-bananur-clay-light mb-1 font-mono">Notas Internas de Venta</label>
                  <textarea
                    id="pos-notes"
                    rows={2}
                    placeholder="e.g. Entregado de inmediato en stand. Cliente solicita empaquetado de tela."
                    value={manualSellerNotes}
                    onChange={(e) => setManualSellerNotes(e.target.value)}
                    className="w-full p-2 border border-bananur-sand rounded-xl bg-white"
                  />
                </div>

                {/* Live total display */}
                <div className="border-t border-bananur-sand/50 pt-4 space-y-1.5 bg-bananur-cream/15 p-3.5 rounded-2xl border border-bananur-sand/40">
                  <div className="flex justify-between font-mono text-xs">
                    <span className="text-bananur-clay-light">Subtotal:</span>
                    <span>
                      ${manualCart.reduce((sum, item) => sum + (item.price * item.quantity), 0).toLocaleString('es-CL')}
                    </span>
                  </div>
                  {manualShippingFee > 0 && (
                    <div className="flex justify-between font-mono text-xs">
                      <span className="text-bananur-clay-light">Envío:</span>
                      <span>+${manualShippingFee.toLocaleString('es-CL')}</span>
                    </div>
                  )}
                  <div className="flex justify-between font-mono text-xs text-bananur-clay-light">
                    <span>IVA (19% Incluido):</span>
                    <span>
                      ${Math.round(manualCart.reduce((sum, item) => sum + (item.price * item.quantity), 0) * (19 / 119)).toLocaleString('es-CL')}
                    </span>
                  </div>
                  <div className="flex justify-between font-mono text-sm font-extrabold text-bananur-clay border-t border-bananur-sand/30 pt-2">
                    <span>Monto Total:</span>
                    <span className="text-bananur-gold-dark text-base">
                      ${(manualCart.reduce((sum, item) => sum + (item.price * item.quantity), 0) + manualShippingFee).toLocaleString('es-CL')} CLP
                    </span>
                  </div>
                </div>

                <button
                  id="pos-submit-btn"
                  type="submit"
                  className="w-full py-3 bg-[#B58455] hover:bg-bananur-clay text-white font-extrabold rounded-xl transition-all shadow-xs cursor-pointer flex items-center justify-center gap-1.5 text-xs font-mono uppercase tracking-wider"
                >
                  <Check className="w-4 h-4" /> Confirmar y Registrar Transacción
                </button>
              </div>

            </div>
          </div>
        </form>
      )}

      {/* --- B2B QUOTE GENERATOR VIEW --- */}
      {salesTab === 'quotes' && (
        <div className="space-y-8 animate-fade-in">
          
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            
            {/* Quote Editor Form */}
            <div className="lg:col-span-5 space-y-6">
              <form onSubmit={handleGenerateQuote} className="bg-white p-6 rounded-3xl border border-bananur-sand shadow-xs space-y-4">
                <h3 className="font-serif text-base font-bold text-bananur-clay border-b border-bananur-sand/50 pb-3 flex items-center gap-1.5">
                  <FileText className="w-5 h-5 text-bananur-gold-dark" />
                  Creador de Cotizaciones B2B
                </h3>

                <div className="space-y-3.5 text-xs">
                  <div>
                    <label className="block text-[10px] font-bold uppercase tracking-wider text-bananur-clay-light mb-1 font-mono">Razón Social del Cliente Corporativo *</label>
                    <input
                      id="quote-company"
                      type="text"
                      required
                      placeholder="e.g. Inmobiliaria & Constructora El Arrayán SpA"
                      value={quoteClientCompany}
                      onChange={(e) => setQuoteClientCompany(e.target.value)}
                      className="w-full p-2 border border-bananur-sand rounded-xl bg-white"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[10px] font-bold uppercase tracking-wider text-bananur-clay-light mb-1 font-mono">RUT Cliente (Opcional)</label>
                      <input
                        id="quote-taxid"
                        type="text"
                        placeholder="e.g. 77.421.990-1"
                        value={quoteClientTaxId}
                        onChange={(e) => setQuoteClientTaxId(e.target.value)}
                        className="w-full p-2 border border-bananur-sand rounded-xl bg-white font-mono"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold uppercase tracking-wider text-bananur-clay-light mb-1 font-mono">Persona de Contacto</label>
                      <input
                        id="quote-contact"
                        type="text"
                        placeholder="Guillermo Silva"
                        value={quoteClientContact}
                        onChange={(e) => setQuoteClientContact(e.target.value)}
                        className="w-full p-2 border border-bananur-sand rounded-xl bg-white"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[10px] font-bold uppercase tracking-wider text-bananur-clay-light mb-1 font-mono">Correo Contacto</label>
                      <input
                        id="quote-email"
                        type="email"
                        placeholder="gsilva@arrayan.cl"
                        value={quoteClientEmail}
                        onChange={(e) => setQuoteClientEmail(e.target.value)}
                        className="w-full p-2 border border-bananur-sand rounded-xl bg-white"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold uppercase tracking-wider text-bananur-clay-light mb-1 font-mono">Teléfono Contacto</label>
                      <input
                        id="quote-phone"
                        type="text"
                        placeholder="+56 9 7221 4401"
                        value={quoteClientPhone}
                        onChange={(e) => setQuoteClientPhone(e.target.value)}
                        className="w-full p-2 border border-bananur-sand rounded-xl bg-white font-mono"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[10px] font-bold uppercase tracking-wider text-bananur-clay-light mb-1 font-mono">Vigencia de la Oferta</label>
                      <select
                        id="quote-validity"
                        value={quoteValidity}
                        onChange={(e) => setQuoteValidity(e.target.value)}
                        className="w-full p-2 bg-white border border-bananur-sand rounded-xl font-medium"
                      >
                        <option value="15 días">15 días de corrido</option>
                        <option value="30 días">30 días de corrido</option>
                        <option value="7 días">7 días de corrido</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-[10px] font-bold uppercase tracking-wider text-bananur-clay-light mb-1 font-mono">Descuento Especial (%)</label>
                      <input
                        id="quote-discount"
                        type="number"
                        min={0}
                        max={90}
                        value={quoteDiscount}
                        onChange={(e) => setQuoteDiscount(Number(e.target.value))}
                        className="w-full p-2 border border-bananur-sand rounded-xl bg-white font-mono"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold uppercase tracking-wider text-bananur-clay-light mb-1 font-mono">Cláusulas / Notas Legales</label>
                    <textarea
                      id="quote-notes"
                      rows={2}
                      value={quoteNotes}
                      onChange={(e) => setQuoteNotes(e.target.value)}
                      className="w-full p-2 border border-bananur-sand rounded-xl bg-white leading-relaxed text-[11px]"
                    />
                  </div>

                  {/* Add Item to Quote builder */}
                  <div className="border-t border-bananur-sand/50 pt-3 space-y-2.5">
                    <span className="text-[10px] font-mono font-bold text-bananur-gold-dark uppercase block">Agregar Ítem a Cotizar</span>
                    
                    <div>
                      <input
                        id="quote-newitem-name"
                        type="text"
                        placeholder="Nombre del servicio o producto mayorista"
                        value={newQuoteItemName}
                        onChange={(e) => setNewQuoteItemName(e.target.value)}
                        className="w-full p-2 border border-bananur-sand rounded-lg bg-white"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <input
                          id="quote-newitem-price"
                          type="number"
                          placeholder="Precio Unitario ($ NETO)"
                          value={newQuoteItemPrice || ''}
                          onChange={(e) => setNewQuoteItemPrice(Number(e.target.value))}
                          className="w-full p-2 border border-bananur-sand rounded-lg bg-white font-mono"
                        />
                      </div>
                      <div>
                        <input
                          id="quote-newitem-qty"
                          type="number"
                          min={1}
                          placeholder="Cantidad"
                          value={newQuoteItemQty}
                          onChange={(e) => setNewQuoteItemQty(Number(e.target.value))}
                          className="w-full p-2 border border-bananur-sand rounded-lg bg-white font-mono"
                        />
                      </div>
                    </div>

                    <button
                      id="quote-additem-btn"
                      type="button"
                      onClick={handleAddQuoteItem}
                      className="w-full py-2 bg-bananur-cream hover:bg-bananur-sand/40 border border-bananur-sand text-bananur-clay font-bold rounded-lg text-xs cursor-pointer flex items-center justify-center gap-1"
                    >
                      <Plus className="w-4 h-4" /> Agregar Ítem
                    </button>
                  </div>

                  {/* Current Items List */}
                  {quoteItems.length > 0 && (
                    <div className="space-y-2 border-t border-bananur-sand/30 pt-3">
                      <span className="text-[10px] font-mono font-bold text-bananur-clay-light uppercase block">Detalle de Cotización</span>
                      <div className="space-y-1.5 max-h-[150px] overflow-y-auto pr-1">
                        {quoteItems.map((item, idx) => (
                          <div key={idx} className="flex items-center justify-between p-2 bg-bananur-cream/30 border border-bananur-sand/30 rounded-lg text-[11px]">
                            <div className="truncate max-w-[60%] font-medium" title={item.name}>
                              {item.name}
                            </div>
                            <div className="flex items-center gap-3">
                              <span className="font-mono text-bananur-clay-light">x{item.quantity}</span>
                              <span className="font-mono font-bold">${item.price.toLocaleString('es-CL')}</span>
                              <button
                                type="button"
                                onClick={() => handleRemoveQuoteItem(idx)}
                                className="text-bananur-coral hover:text-rose-700"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  <button
                    id="quote-generate-btn"
                    type="submit"
                    className="w-full py-2.5 bg-bananur-clay hover:bg-bananur-gold text-white hover:text-bananur-clay font-extrabold rounded-xl transition-all font-mono text-xs uppercase cursor-pointer flex items-center justify-center gap-1.5"
                  >
                    <Calculator className="w-4 h-4" /> Calcular y Generar Cotización B2B
                  </button>
                </div>
              </form>
            </div>

            {/* Quote Document Preview */}
            <div className="lg:col-span-7">
              {generatedQuote ? (
                <div id="quotation-print-area" className="bg-white p-8 sm:p-10 rounded-3xl border border-bananur-sand shadow-sm space-y-6 relative overflow-hidden">
                  
                  {/* Watermark brand style */}
                  <div className="absolute right-0 top-0 w-44 h-44 bg-bananur-cream/15 rounded-full -mr-16 -mt-16 border border-bananur-sand/10 pointer-events-none" />

                  {/* Quote Header */}
                  <div className="flex justify-between items-start border-b border-bananur-sand/50 pb-5">
                    <div className="space-y-1">
                      <span className="font-serif text-xl font-bold tracking-tight text-bananur-clay flex items-center gap-1">
                        Bananur <span className="text-bananur-gold text-[10px] font-mono font-medium tracking-widest uppercase bg-bananur-clay text-white px-1 py-0.2 rounded">B2B</span>
                      </span>
                      <p className="text-[10px] text-bananur-clay-light font-mono leading-relaxed">
                        Taller Artesanal & Diseño Consciente<br />
                        Viña del Mar, Chile | bananur.cl@gmail.com
                      </p>
                    </div>

                    <div className="text-right space-y-0.5">
                      <span className="text-[10px] font-mono font-bold text-bananur-gold-dark bg-bananur-cream px-2 py-0.5 rounded-md uppercase">
                        Cotización Formal
                      </span>
                      <h4 className="text-sm font-mono font-bold text-bananur-clay mt-1">{generatedQuote.code}</h4>
                      <p className="text-[10px] text-bananur-clay-light font-mono">Fecha Emisión: {generatedQuote.date}</p>
                    </div>
                  </div>

                  {/* Customer Block & Terms */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs bg-bananur-cream/20 p-4 rounded-2xl border border-bananur-sand/30">
                    <div className="space-y-1 border-r border-bananur-sand/30 pr-4">
                      <span className="text-[9px] font-mono uppercase text-bananur-clay-light font-bold">CLIENTE DESTINATARIO</span>
                      <h5 className="font-serif font-bold text-bananur-clay">{generatedQuote.clientCompany}</h5>
                      {generatedQuote.clientTaxId && <p className="font-mono text-[10px]">RUT: {generatedQuote.clientTaxId}</p>}
                      {generatedQuote.clientContact && <p className="font-light">Contacto: {generatedQuote.clientContact}</p>}
                    </div>

                    <div className="space-y-1 sm:pl-4">
                      <span className="text-[9px] font-mono uppercase text-bananur-clay-light font-bold">CONDICIONES COMERCIALES</span>
                      <p className="text-bananur-clay font-medium">Vigencia: {generatedQuote.validity}</p>
                      {generatedQuote.clientEmail && <p className="font-mono text-[10px]">Email: {generatedQuote.clientEmail}</p>}
                      {generatedQuote.clientPhone && <p className="font-mono text-[10px]">Fono: {generatedQuote.clientPhone}</p>}
                    </div>
                  </div>

                  {/* Table detail of elements */}
                  <div className="space-y-2">
                    <span className="text-[9px] font-mono uppercase text-bananur-clay-light font-bold block">ELEMENTOS COTIZADOS</span>
                    <table className="w-full text-xs text-left text-bananur-clay">
                      <thead>
                        <tr className="border-b border-bananur-sand font-mono text-[10px] text-bananur-clay-light uppercase">
                          <th className="py-2">Ítem / Descripción del Servicio</th>
                          <th className="py-2 text-center">Cantidad</th>
                          <th className="py-2 text-right">Precio Unitario</th>
                          <th className="py-2 text-right">Subtotal</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-bananur-sand/30">
                        {generatedQuote.items.map((item: any, idx: number) => (
                          <tr key={idx} className="font-light">
                            <td className="py-2.5 font-medium">{item.name}</td>
                            <td className="py-2.5 text-center font-mono">{item.quantity}</td>
                            <td className="py-2.5 text-right font-mono">${item.price.toLocaleString('es-CL')}</td>
                            <td className="py-2.5 text-right font-mono font-bold">${(item.price * item.quantity).toLocaleString('es-CL')}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  {/* Summary calculations block */}
                  <div className="border-t border-bananur-sand/60 pt-4 flex justify-end">
                    <div className="w-64 space-y-1.5 text-xs">
                      <div className="flex justify-between font-mono text-bananur-clay-light">
                        <span>Subtotal Bruto:</span>
                        <span>${generatedQuote.subtotal.toLocaleString('es-CL')}</span>
                      </div>
                      {generatedQuote.discount > 0 && (
                        <div className="flex justify-between font-mono text-bananur-coral font-semibold">
                          <span>Descuento ({generatedQuote.discountPercent}%):</span>
                          <span>-${generatedQuote.discount.toLocaleString('es-CL')}</span>
                        </div>
                      )}
                      <div className="flex justify-between font-mono">
                        <span>Neto Afecto:</span>
                        <span>${generatedQuote.net.toLocaleString('es-CL')}</span>
                      </div>
                      <div className="flex justify-between font-mono text-bananur-clay-light">
                        <span>IVA Debito (19%):</span>
                        <span>${generatedQuote.iva.toLocaleString('es-CL')}</span>
                      </div>
                      <div className="flex justify-between font-mono font-bold text-bananur-clay border-t border-bananur-sand/40 pt-1.5 text-sm">
                        <span>Total Neto + IVA:</span>
                        <span className="text-bananur-gold-dark font-extrabold">${generatedQuote.total.toLocaleString('es-CL')} CLP</span>
                      </div>
                    </div>
                  </div>

                  {/* Notes & Signatures */}
                  <div className="border-t border-bananur-sand/40 pt-4 space-y-3">
                    <div className="text-[10px] leading-relaxed text-bananur-clay-light">
                      <strong>Observaciones:</strong><br />
                      {generatedQuote.notes}
                    </div>

                    <div className="pt-6 grid grid-cols-2 gap-8 text-center text-[10px] border-t border-bananur-sand/20">
                      <div className="space-y-1">
                        <div className="h-10 border-b border-bananur-sand/30 w-32 mx-auto" />
                        <span className="font-bold uppercase tracking-wider block text-bananur-clay">Representante Bananur</span>
                        <span className="text-bananur-clay-light">Dirección Comercial</span>
                      </div>

                      <div className="space-y-1">
                        <div className="h-10 border-b border-bananur-sand/30 w-32 mx-auto" />
                        <span className="font-bold uppercase tracking-wider block text-bananur-clay">Aceptación de Presupuesto</span>
                        <span className="text-bananur-clay-light">Firma Cliente / RUT</span>
                      </div>
                    </div>
                  </div>

                  {/* Tools to export/print */}
                  <div className="pt-4 flex justify-end gap-2 border-t border-bananur-sand/30 no-print">
                    <button
                      id="quote-print-action-btn"
                      onClick={handlePrintQuote}
                      className="px-4 py-2 bg-bananur-clay hover:bg-bananur-gold text-white hover:text-bananur-clay duration-150 rounded-xl text-xs font-bold font-mono tracking-wide flex items-center gap-1.5 cursor-pointer shadow-xs"
                    >
                      <Printer className="w-4 h-4" /> Imprimir / PDF
                    </button>
                  </div>

                </div>
              ) : (
                <div className="bg-white p-12 rounded-3xl border border-bananur-sand/80 shadow-2xs text-center flex flex-col items-center justify-center space-y-3 h-full min-h-[400px]">
                  <div className="p-4 bg-bananur-cream/40 rounded-full text-bananur-clay-light">
                    <FileText className="w-10 h-10" />
                  </div>
                  <h4 className="font-serif text-base font-bold text-bananur-clay">Previsualizador de Cotizaciones B2B</h4>
                  <p className="text-xs text-bananur-clay-light max-w-sm font-light">
                    Ingresa los datos del cliente corporativo y los ítems requeridos en el panel izquierdo para generar el documento de oferta comercial formalizable.
                  </p>
                </div>
              )}
            </div>

          </div>

        </div>
      )}

      {/* --- SALES LEDGER (LIBRO DE VENTAS) VIEW --- */}
      {salesTab === 'ledger' && (
        <div className="space-y-6 animate-fade-in">
          
          {/* Filters Bar */}
          <div className="bg-white p-5 rounded-3xl border border-bananur-sand shadow-xs space-y-4 text-xs">
            
            <div className="text-[10px] font-bold uppercase tracking-wider text-bananur-gold-dark font-mono flex items-center gap-1.5">
              <span>🔍 Filtros de Auditoría Financiera</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
              <div className="relative">
                <input
                  id="ledger-search-input"
                  type="text"
                  placeholder="Buscar venta (Cliente, ID)..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 bg-white border border-bananur-sand rounded-xl text-xs"
                />
                <Search className="w-3.5 h-3.5 text-bananur-clay-light absolute left-3 top-1/2 -translate-y-1/2" />
              </div>

              <div>
                <select
                  id="ledger-channel-filter"
                  value={channelFilter}
                  onChange={(e) => setChannelFilter(e.target.value as any)}
                  className="w-full p-2 bg-white border border-bananur-sand rounded-xl text-xs"
                >
                  <option value="Todos">Todos los Canales</option>
                  <option value="Sitio Web">Sitio Web</option>
                  <option value="Instagram">Instagram DM</option>
                  <option value="WhatsApp">WhatsApp Chat</option>
                  <option value="Feria Presencial">Feria Presencial</option>
                  <option value="Reunión/Asesoría">Reunión/Asesoría</option>
                </select>
              </div>

              <div>
                <select
                  id="ledger-status-filter"
                  value={paymentStatusFilter}
                  onChange={(e) => setPaymentStatusFilter(e.target.value as any)}
                  className="w-full p-2 bg-white border border-bananur-sand rounded-xl text-xs"
                >
                  <option value="Todos">Todos los Estados de Pago</option>
                  <option value="Pagado">Pagado / Transacción Cerrada</option>
                  <option value="Pendiente">Pendiente de Abono</option>
                  <option value="Reembolsado">Reembolsado / Anulado</option>
                </select>
              </div>

              <div>
                <select
                  id="ledger-doctype-filter"
                  value={docTypeFilter}
                  onChange={(e) => setDocTypeFilter(e.target.value as any)}
                  className="w-full p-2 bg-white border border-bananur-sand rounded-xl text-xs"
                >
                  <option value="Todos">Boletas & Facturas</option>
                  <option value="boleta">Solo Boletas</option>
                  <option value="factura">Solo Facturas</option>
                </select>
              </div>
            </div>

            <div className="flex justify-between items-center border-t border-bananur-sand/30 pt-3 flex-wrap gap-2">
              <span className="text-[11px] text-bananur-clay-light font-medium">
                Se encontraron <strong className="text-bananur-clay font-mono">{filteredOrders.length}</strong> registro(s) de ventas bajo este criterio.
              </span>

              <button
                id="ledger-export-btn"
                onClick={handleExportCSV}
                className="px-4 py-1.5 border border-bananur-sand bg-bananur-cream/35 hover:bg-bananur-sand/20 rounded-xl text-[11px] font-bold font-mono text-bananur-clay flex items-center gap-1.5 cursor-pointer transition-colors"
              >
                <FileSpreadsheet className="w-3.5 h-3.5" /> Exportar Libro CSV (Excel)
              </button>
            </div>
          </div>

          {/* Ledger table */}
          <div className="bg-white rounded-3xl border border-bananur-sand shadow-xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-bananur-clay">
                <thead>
                  <tr className="bg-bananur-cream/40 border-b border-bananur-sand font-mono text-[10px] text-bananur-clay-light uppercase">
                    <th className="py-4 px-6">ID Venta</th>
                    <th className="py-4 px-3">Fecha</th>
                    <th className="py-4 px-3">Cliente</th>
                    <th className="py-4 px-3">Canal</th>
                    <th className="py-4 px-3">Documento</th>
                    <th className="py-4 px-3">Medio Pago</th>
                    <th className="py-4 px-3 text-right">Monto Neto</th>
                    <th className="py-4 px-3 text-right">Monto IVA</th>
                    <th className="py-4 px-6 text-right">Total Recaudado</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-bananur-sand/40 font-light">
                  {filteredOrders.length === 0 ? (
                    <tr>
                      <td colSpan={9} className="py-12 text-center text-bananur-clay-light font-light text-xs">
                        No se encontraron registros de ventas que coincidan con los filtros seleccionados.
                      </td>
                    </tr>
                  ) : (
                    filteredOrders.map((sale) => {
                      const net = Math.round(sale.subtotal * (100 / 119));
                      const iva = sale.subtotal - net;
                      return (
                        <tr key={sale.id} className="hover:bg-bananur-cream/15 transition-colors">
                          <td className="py-4 px-6 font-mono font-bold text-bananur-gold-dark">
                            {sale.id}
                          </td>
                          <td className="py-4 px-3 font-mono text-[10px] text-bananur-clay-light">
                            {sale.date}
                          </td>
                          <td className="py-4 px-3">
                            <div className="flex flex-col">
                              <span className="font-semibold text-bananur-clay">{sale.customerName}</span>
                              <span className="text-[9px] text-bananur-clay-light font-mono italic truncate max-w-[150px]" title={sale.customerEmail}>
                                {sale.customerEmail}
                              </span>
                            </div>
                          </td>
                          <td className="py-4 px-3">
                            <span className="px-2 py-0.5 bg-bananur-cream border border-bananur-sand text-[10px] font-medium rounded-md font-mono text-bananur-clay">
                              {sale.salesChannel || 'Sitio Web'}
                            </span>
                          </td>
                          <td className="py-4 px-3 font-mono uppercase text-[10px] font-bold">
                            {sale.type} {sale.taxId && <span className="text-[8px] text-bananur-clay-light block">RUT: {sale.taxId}</span>}
                          </td>
                          <td className="py-4 px-3 text-[10px] font-medium text-bananur-clay-light">
                            {sale.paymentMethod || 'Transferencia'}
                          </td>
                          <td className="py-4 px-3 text-right font-mono text-bananur-clay-light">
                            ${net.toLocaleString('es-CL')}
                          </td>
                          <td className="py-4 px-3 text-right font-mono text-bananur-clay-light">
                            ${iva.toLocaleString('es-CL')}
                          </td>
                          <td className="py-4 px-6 text-right font-mono font-extrabold text-bananur-clay">
                            ${sale.total.toLocaleString('es-CL')}
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>

        </div>
      )}

      {salesTab === 'orders' && (
        <div className="animate-fade-in">
          <AdminOrders
            orders={orders}
            onUpdateOrderStatus={onUpdateOrderStatus}
            onShowToast={onShowToast}
            products={products}
            services={services}
            portfolioItems={portfolioItems}
            onAddOrder={onAddOrder}
          />
        </div>
      )}

    </div>
  );
}
