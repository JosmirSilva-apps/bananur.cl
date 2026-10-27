import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import Header from './components/Header';
import Footer from './components/Footer';
import SearchOverlay from './components/SearchOverlay';
import CartSlideOver from './components/CartSlideOver';
import AdminSidebar from './components/AdminSidebar';
import SkeletonLoader from './components/SkeletonLoader';
import QuoteStepper from './components/QuoteStepper';
import ClientProductDetail from './components/ClientProductDetail';
import ClientPortfolio from './components/ClientPortfolio';
import DispatchMap from './components/DispatchMap';
import { subscribeAdmin, adminSignIn, adminSignOut } from './services/adminAuth';

// Admin Imports
import AdminDashboard from './components/AdminDashboard';
import AdminInventory from './components/AdminInventory';
import AdminOrders from './components/AdminOrders';
import AdminPurchases from './components/AdminPurchases';
import AdminAgenda from './components/AdminAgenda';
import AdminERP from './components/AdminERP';
import AdminSales from './components/AdminSales';
import AdminPersonalizador from './components/AdminPersonalizador';
import AdminWorkstationsConfig from './components/AdminWorkstationsConfig';
import AdminEmailManager from './components/AdminEmailManager';
import AdminEmailServerConfig from './components/AdminEmailServerConfig';
import ScannerModal from './components/ScannerModal';
import { saveOrderToFirestore, saveWorkstationsToFirestore } from './services/firebaseSync';

// Data and Types
import { MOCK_PRODUCTS, MOCK_SERVICES, MOCK_ORDERS, MOCK_CONSULTATIONS, MOCK_FAQ, MOCK_REVIEW_PROJECTS, MOCK_CLOTHING_LOTS, MOCK_WORKSTATIONS } from './data';
import { Product, CartItem, Order, Consultation, Service, PortfolioItem, ClientCustomization, CustomPage, ClothingLot, Workstation } from './types';

// Icons
import { 
  Heart, 
  Sparkles, 
  ArrowRight, 
  User, 
  ChevronRight, 
  ShieldCheck, 
  X, 
  Briefcase, 
  MapPin, 
  BookOpen, 
  Mail, 
  Phone, 
  ArrowUpRight, 
  Settings, 
  Layers, 
  Terminal, 
  AlertTriangle,
  Wrench,
  Eye,
  EyeOff,
  Scale,
  FileText,
  CheckCircle,
  Trash2,
  Copy,
  Package,
  Truck
} from 'lucide-react';

export default function App() {
  // Navigation Routing States
  // Matches: 'home' | 'tienda' | 'producto' | 'servicios' | 'portafolio' | 'cotizar' | 'checkout' | 'gracias' | 'login' | 'registro' | 'cuenta' | 'nosotros' | 'contacto' | '404'
  const [currentView, setCurrentView] = useState<string>('home');
  const [selectedProductId, setSelectedProductId] = useState<string>('prod-1');
  
  // Admin Navigation Root
  const [isAdminMode, setIsAdminMode] = useState<boolean>(false);
  const [currentAdminView, setCurrentAdminView] = useState<string>('dashboard');
  const [localProduccionTab, setLocalProduccionTab] = useState<'mrp' | 'plm'>('plm');
  const [localClientesProveedoresTab, setLocalClientesProveedoresTab] = useState<'crm' | 'proveedores'>('crm');

  // App Layout States
  const [searchOpen, setSearchOpen] = useState(false);
  const [cartOpen, setCartOpen] = useState(false);
  const [isScannerOpen, setIsScannerOpen] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState(false); // Skeletons loading simulator

  // Hotkey listener Ctrl+B or Cmd+B to open the Barcode Scanner
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'b') {
        e.preventDefault();
        setIsScannerOpen(prev => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // E-commerce & Interactive states
  const [cart, setCart] = useState<CartItem[]>([]);
  const [favorites, setFavorites] = useState<string[]>(['prod-1', 'prod-3']);
  const [orders, setOrders] = useState<Order[]>(MOCK_ORDERS);
  const [consultations, setConsultations] = useState<Consultation[]>(MOCK_CONSULTATIONS);
  const [products, setProducts] = useState<Product[]>(MOCK_PRODUCTS);
  const [services, setServices] = useState<Service[]>(MOCK_SERVICES);
  const [portfolioItems, setPortfolioItems] = useState<PortfolioItem[]>(MOCK_REVIEW_PROJECTS);
  const [clothingLots, setClothingLots] = useState<ClothingLot[]>(MOCK_CLOTHING_LOTS);
  const [workstations, setWorkstations] = useState<Workstation[]>(MOCK_WORKSTATIONS);
  const [configActiveTab, setConfigActiveTab] = useState<'general' | 'estaciones' | 'correo_servidor'>('general');

  const [productCategories, setProductCategories] = useState<string[]>(['Papelería', 'Accesorios', 'Arte & Decoración', 'Ropa', 'Impresión 3D', 'Costura', 'Crochet']);
  const [serviceCategories, setServiceCategories] = useState<string[]>(['Diseño', 'Digital', 'Consultoría', 'Packaging', 'Branding', 'Asesoría']);
  const [portfolioCategories, setPortfolioCategories] = useState<string[]>(['Diseño & E-commerce', 'Branding', 'Branding & Packaging', 'Desarrollo Web']);
  const [clientCategories, setClientCategories] = useState<string[]>(['VIP Corporativo', 'Boutique Patrón', 'Cliente Regular']);
  const [supplierCategories, setSupplierCategories] = useState<string[]>(['Impresión 3D', 'Costura', 'Crochet', 'Embalaje', 'Herramientas']);

  const [newProductCategoryInput, setNewProductCategoryInput] = useState('');
  const [newServiceCategoryInput, setNewServiceCategoryInput] = useState('');
  const [newPortfolioCategoryInput, setNewPortfolioCategoryInput] = useState('');
  const [newClientCategoryInput, setNewClientCategoryInput] = useState('');
  const [newSupplierCategoryInput, setNewSupplierCategoryInput] = useState('');
  const [editingCatIndex, setEditingCatIndex] = useState<{ type: 'product' | 'service' | 'portfolio' | 'client' | 'supplier', index: number } | null>(null);
  const [editingCatValue, setEditingCatValue] = useState('');

  // Local states for Responsables and Stages config inside Settings
  const [newResponsableInput, setNewResponsableInput] = useState('');
  const [editingResponsableIndex, setEditingResponsableIndex] = useState<number | null>(null);
  const [editingResponsableValue, setEditingResponsableValue] = useState('');

  const [selectedConfigLine, setSelectedConfigLine] = useState<string>('diseño');
  const [newStageInput, setNewStageInput] = useState<string>('');
  const [editingStageIndex, setEditingStageIndex] = useState<number | null>(null);
  const [editingStageValue, setEditingStageValue] = useState<string>('');

  // --- RAW MATERIALS STATE ---
  const [materials, setMaterials] = useState<any[]>([
    { id: 'mat-1', name: 'Filamento PLA de Alta Resolución (1.75mm)', category: 'Impresión 3D', stock: 5, unit: 'bobinas', unitCost: 14500, supplierName: '3D América SpA', lowStockAlert: 8 },
    { id: 'mat-2', name: "Tela de Algodón d'Ischia Premium", category: 'Costura', stock: 1, unit: 'metros', unitCost: 8900, supplierName: 'Telas Costa Valparaíso S.A.', lowStockAlert: 4 },
    { id: 'mat-3', name: 'Hilado de Algodón Orgánico Chilote (4 Hebras)', category: 'Crochet', stock: 120, unit: 'madejas', unitCost: 2450, supplierName: 'Cordones de la Costa', lowStockAlert: 150 },
    { id: 'mat-4', name: 'Caja de Envío Ecológica Bananur S', category: 'Embalaje', stock: 65, unit: 'unidades', unitCost: 1200, supplierName: 'Cartones Viña SpA', lowStockAlert: 15 },
    { id: 'mat-5', name: 'Filamento PETG de Resistencia Industrial', category: 'Impresión 3D', stock: 0, unit: 'bobinas', unitCost: 18500, supplierName: '3D América SpA', lowStockAlert: 3 },
    { id: 'mat-6', name: 'Vellón Siliconado Súper Soft (Relleno)', category: 'Crochet', stock: 2, unit: 'kilos', unitCost: 5200, supplierName: 'Distribuidora Textil Sur', lowStockAlert: 3 },
    { id: 'mat-7', name: 'Cintas Elásticas y Botones Surtidos', category: 'Costura', stock: 320, unit: 'unidades', unitCost: 150, supplierName: 'Botonería El Sol', lowStockAlert: 50 }
  ]);

  // --- SUPPLY REQUESTS STATE ---
  const [supplyRequests, setSupplyRequests] = useState<any[]>([
    { 
      id: 'REQ-101', 
      date: '2026-06-21', 
      materialId: 'mat-1', 
      materialName: 'Filamento PLA de Alta Resolución (1.75mm)', 
      quantityRequested: 10, 
      reason: 'Aumento de demanda en impresión de Soportes Geométricos', 
      status: 'Pendiente',
      attachedDocs: []
    },
    { 
      id: 'REQ-102', 
      date: '2026-06-22', 
      materialId: 'mat-2', 
      materialName: "Tela de Algodón d'Ischia Premium", 
      quantityRequested: 5, 
      reason: 'Se requiere para estuches de costura d\'Ischia', 
      status: 'Aprobado',
      attachedDocs: [
        { name: 'requisicion_suministro_algodon.pdf', size: '185 KB', dateAttached: '2026-06-22' }
      ]
    }
  ]);

  // --- CLIENT ENVIRONMENT CUSTOMIZATION STATE ---
  const [customization, setCustomization] = useState<ClientCustomization>({
    presetName: 'default',
    primaryColor: '#15803d', // beautiful forest green
    accentColor: '#eab308',  // yellow accent
    backgroundColor: '#fafafa', // light gray / white background
    fontFamily: 'font-sans',
    heroTitle: 'Transformación Digital con el Oficio Justo de Siempre',
    heroSubtitle: 'Diseño boutique de papelería corporativa, gres cerámico y soportes industriales de autor, manufacturados éticamente en Chile.',
    aboutTitle: 'Filosofía Bananur',
    aboutText: 'Rechazamos la uniformidad de la masa industrial y priorizamos procesos de producción pausados y conscientes: encuadernaciones manuales de costura expuesta, cerámica gres cocida a fuego lento con fórmulas minerales propias y soportes de madera nativa recuperada.',
    customPages: [
      {
        id: 'custom-taller-tour',
        title: 'Tour Virtual Taller',
        contentMarkdown: '# Tour de nuestra Tienda Principal & Taller en Viña del Mar\n\nBienvenido a nuestro espacio de diseño. En Viña del Mar operamos nuestra tienda principal y taller creativo, donde procesamos cada solicitud con cuidado artesanal chileno.\n\n### Nuestro equipamiento técnico:\n- **Fórmulas Minerales Propias**: Desarrollamos esmaltes gres exclusivos utilizando tierras arcillosas nacionales.\n- **Impresión PLA biodegradable**: Fabricamos bobinas d\'Ischia con soportes reutilizables.\n- **Encuadernación Copta**: Hilos de algodón encerado con costura expuesta a la vista.',
        enabled: true
      }
    ]
  });

  // --- RESPONSABLES (ARTESANOS RENAMED) STATE ---
  const [responsables, setResponsables] = useState<string[]>([
    'Yo (Creador & Responsable Único)',
    'Constanza Silva',
    'Carlos Ruiz',
    'Francisca Leiva'
  ]);

  // --- PRODUCTION STAGES STATE ---
  const [productionStages, setProductionStages] = useState<Record<string, string[]>>({
    'diseño': ['Modelado / Diseño', 'Boceto Inicial', 'Aprobación Cliente', 'Listo para Taller'],
    'impresion3d': ['Modelado 3D', 'Preparación G-code', 'Procesamiento en Cama', 'Post-procesado', 'Listo para Starken'],
    'costura': ['Corte de Lona/Algodón', 'Corte & Confección', 'Planchado', 'Listo para Starken'],
    'crochet': ['Tejido Manual', 'Ensamblado Amigurumi', 'Detalles / Ojos', 'Listo para Starken'],
  });

  const handleAddSupplyRequest = (req: any) => {
    setSupplyRequests(prev => [req, ...prev]);
  };

  // Product Categories CRUD
  const handleAddProductCategory = (catName: string) => {
    if (!catName.trim()) return;
    if (productCategories.includes(catName.trim())) {
      addToast('Categoría Duplicada', 'Esta categoría ya existe.', 'warning');
      return;
    }
    setProductCategories(prev => [...prev, catName.trim()]);
    addToast('Categoría Añadida', `Categoría de Productos "${catName}" creada.`, 'success');
  };

  const handleEditProductCategory = (index: number, newVal: string) => {
    if (!newVal.trim()) return;
    const oldVal = productCategories[index];
    if (productCategories.includes(newVal.trim()) && oldVal !== newVal.trim()) {
      addToast('Categoría Duplicada', 'Esta categoría ya existe.', 'warning');
      return;
    }
    setProductCategories(prev => {
      const next = [...prev];
      next[index] = newVal.trim();
      return next;
    });
    setProducts(prev => prev.map(p => p.category === oldVal ? { ...p, category: newVal.trim() } : p));
    addToast('Categoría Actualizada', `Se actualizó la categoría a "${newVal}".`, 'success');
  };

  const handleRemoveProductCategory = (index: number) => {
    const catToRemove = productCategories[index];
    setProductCategories(prev => prev.filter((_, i) => i !== index));
    addToast('Categoría Eliminada', `Categoría de Productos "${catToRemove}" eliminada.`, 'info');
  };

  // Service Categories CRUD
  const handleAddServiceCategory = (catName: string) => {
    if (!catName.trim()) return;
    if (serviceCategories.includes(catName.trim())) {
      addToast('Categoría Duplicada', 'Esta categoría ya existe.', 'warning');
      return;
    }
    setServiceCategories(prev => [...prev, catName.trim()]);
    addToast('Categoría Añadida', `Categoría de Servicios "${catName}" creada.`, 'success');
  };

  const handleEditServiceCategory = (index: number, newVal: string) => {
    if (!newVal.trim()) return;
    const oldVal = serviceCategories[index];
    if (serviceCategories.includes(newVal.trim()) && oldVal !== newVal.trim()) {
      addToast('Categoría Duplicada', 'Esta categoría ya existe.', 'warning');
      return;
    }
    setServiceCategories(prev => {
      const next = [...prev];
      next[index] = newVal.trim();
      return next;
    });
    setServices(prev => prev.map(s => s.category === oldVal ? { ...s, category: newVal.trim() } : s));
    addToast('Categoría Actualizada', `Se actualizó la categoría a "${newVal}".`, 'success');
  };

  const handleRemoveServiceCategory = (index: number) => {
    const catToRemove = serviceCategories[index];
    setServiceCategories(prev => prev.filter((_, i) => i !== index));
    addToast('Categoría Eliminada', `Categoría de Servicios "${catToRemove}" eliminada.`, 'info');
  };

  // Portfolio Categories CRUD
  const handleAddPortfolioCategory = (catName: string) => {
    if (!catName.trim()) return;
    if (portfolioCategories.includes(catName.trim())) {
      addToast('Categoría Duplicada', 'Esta categoría ya existe.', 'warning');
      return;
    }
    setPortfolioCategories(prev => [...prev, catName.trim()]);
    addToast('Categoría Añadida', `Categoría de Portafolio "${catName}" creada.`, 'success');
  };

  const handleEditPortfolioCategory = (index: number, newVal: string) => {
    if (!newVal.trim()) return;
    const oldVal = portfolioCategories[index];
    if (portfolioCategories.includes(newVal.trim()) && oldVal !== newVal.trim()) {
      addToast('Categoría Duplicada', 'Esta categoría ya existe.', 'warning');
      return;
    }
    setPortfolioCategories(prev => {
      const next = [...prev];
      next[index] = newVal.trim();
      return next;
    });
    setPortfolioItems(prev => prev.map(p => p.category === oldVal ? { ...p, category: newVal.trim() } : p));
    addToast('Categoría Actualizada', `Se actualizó la categoría a "${newVal}".`, 'success');
  };

  const handleRemovePortfolioCategory = (index: number) => {
    const catToRemove = portfolioCategories[index];
    setPortfolioCategories(prev => prev.filter((_, i) => i !== index));
    addToast('Categoría Eliminada', `Categoría de Portafolio "${catToRemove}" eliminada.`, 'info');
  };

  // Client Categories CRUD
  const handleAddClientCategory = (catName: string) => {
    if (!catName.trim()) return;
    if (clientCategories.includes(catName.trim())) {
      addToast('Categoría Duplicada', 'Esta categoría ya existe.', 'warning');
      return;
    }
    setClientCategories(prev => [...prev, catName.trim()]);
    addToast('Categoría Añadida', `Categoría de Clientes "${catName}" creada.`, 'success');
  };

  const handleEditClientCategory = (index: number, newVal: string) => {
    if (!newVal.trim()) return;
    const oldVal = clientCategories[index];
    if (clientCategories.includes(newVal.trim()) && oldVal !== newVal.trim()) {
      addToast('Categoría Duplicada', 'Esta categoría ya existe.', 'warning');
      return;
    }
    setClientCategories(prev => {
      const next = [...prev];
      next[index] = newVal.trim();
      return next;
    });
    addToast('Categoría Actualizada', `Se actualizó la categoría a "${newVal}".`, 'success');
  };

  const handleRemoveClientCategory = (index: number) => {
    const catToRemove = clientCategories[index];
    setClientCategories(prev => prev.filter((_, i) => i !== index));
    addToast('Categoría Eliminada', `Categoría de Clientes "${catToRemove}" eliminada.`, 'info');
  };

  // Supplier Categories CRUD
  const handleAddSupplierCategory = (catName: string) => {
    if (!catName.trim()) return;
    if (supplierCategories.includes(catName.trim())) {
      addToast('Categoría Duplicada', 'Esta categoría ya existe.', 'warning');
      return;
    }
    setSupplierCategories(prev => [...prev, catName.trim()]);
    addToast('Categoría Añadida', `Categoría de Proveedores "${catName}" creada.`, 'success');
  };

  const handleEditSupplierCategory = (index: number, newVal: string) => {
    if (!newVal.trim()) return;
    const oldVal = supplierCategories[index];
    if (supplierCategories.includes(newVal.trim()) && oldVal !== newVal.trim()) {
      addToast('Categoría Duplicada', 'Esta categoría ya existe.', 'warning');
      return;
    }
    setSupplierCategories(prev => {
      const next = [...prev];
      next[index] = newVal.trim();
      return next;
    });
    addToast('Categoría Actualizada', `Se actualizó la categoría a "${newVal}".`, 'success');
  };

  const handleRemoveSupplierCategory = (index: number) => {
    const catToRemove = supplierCategories[index];
    setSupplierCategories(prev => prev.filter((_, i) => i !== index));
    addToast('Categoría Eliminada', `Categoría de Proveedores "${catToRemove}" eliminada.`, 'info');
  };

  const handleAddService = (newServ: Service) => {
    setServices(prev => [newServ, ...prev]);
    addToast('Servicio Creado', `El servicio "${newServ.name}" se agregó exitosamente.`, 'success');
  };

  const handleAddPortfolioItem = (newPort: PortfolioItem) => {
    setPortfolioItems(prev => [newPort, ...prev]);
    addToast('Proyecto Publicado', `"${newPort.name}" se ha añadido al portafolio de proyectos.`, 'success');
  };

  const handleDeleteService = (id: string) => {
    const s = services.find(srv => srv.id === id);
    setServices(prev => prev.filter(s => s.id !== id));
    addToast('Servicio Eliminado', `El servicio "${s ? s.name : id}" fue removido con éxito.`, 'info');
  };

  const handleDeletePortfolioItem = (id: string) => {
    const p = portfolioItems.find(item => item.id === id);
    setPortfolioItems(prev => prev.filter(p => p.id !== id));
    addToast('Proyecto Retirado', `El caso de estudio "${p ? p.name : id}" fue eliminado.`, 'info');
  };

  // Authenticated states
  const [isClientLoggedIn, setIsClientLoggedIn] = useState(false);
  const [loggedInClientEmail, setLoggedInClientEmail] = useState('');
  // Sesión real de administrador (Firebase Auth). Nada del panel se muestra sin ella.
  const [adminUser, setAdminUser] = useState<{ email: string } | null>(null);
  const [adminAuthReady, setAdminAuthReady] = useState(false);
  const [adminSigningIn, setAdminSigningIn] = useState(false);
  const [adminLoginError, setAdminLoginError] = useState('');
  const isAdminLoggedIn = adminUser !== null;

  useEffect(() => {
    const unsubscribe = subscribeAdmin((user) => {
      setAdminUser(user && user.email ? { email: user.email } : null);
      if (user?.email) setAdminEmail(user.email);
      setAdminAuthReady(true);
    });
    return unsubscribe;
  }, []);

  const handleAdminGoogleLogin = async () => {
    setAdminLoginError('');
    setAdminSigningIn(true);
    try {
      const user = await adminSignIn();
      if (user) setCurrentAdminView('dashboard');
    } catch (err: any) {
      setAdminLoginError(err?.message || 'No se pudo iniciar sesión. Inténtalo de nuevo.');
    } finally {
      setAdminSigningIn(false);
    }
  };

  const handleAdminLogout = async () => {
    await adminSignOut();
    setIsAdminMode(false);
    setCurrentAdminView('dashboard');
  };
  const [adminEmail, setAdminEmail] = useState('');

  // Client Profile for "Mi Cuenta" editable details
  const [profileName, setProfileName] = useState('Constanza Silva');
  const [profilePhone, setProfilePhone] = useState('+56 9 8452 1192');
  const [profileAddress, setProfileAddress] = useState('Av. Libertad 1045, Depto 502');
  const [profileCommune, setProfileCommune] = useState('Viña del Mar');
  const [profileCity, setProfileCity] = useState('Viña del Mar');
  // Temp registration state
  const [regName, setRegName] = useState('');

  // Editing states for real-time validation in Account profile view
  const [editName, setEditName] = useState('');
  const [editPhone, setEditPhone] = useState('');
  const [editAddress, setEditAddress] = useState('');
  const [editCommune, setEditCommune] = useState('');
  const [editCity, setEditCity] = useState('');

  useEffect(() => {
    if (isClientLoggedIn) {
      setEditName(profileName);
      setEditPhone(profilePhone);
      setEditAddress(profileAddress);
      setEditCommune(profileCommune);
      setEditCity(profileCity);
    }
  }, [isClientLoggedIn, profileName, profilePhone, profileAddress, profileCommune, profileCity]);

  // Client Account Active Tab State
  const [accountActiveTab, setAccountActiveTab] = useState<'personal' | 'orders' | 'push'>('personal');

  // Web Push API Notification States & Simulated Backend setup
  const [pushPermissionState, setPushPermissionState] = useState<'default' | 'granted' | 'denied' | 'unsupported'>(() => {
    if (typeof window !== 'undefined' && 'Notification' in window) {
      return Notification.permission as ('default' | 'granted' | 'denied');
    }
    return 'unsupported';
  });
  const [pushEnabled, setPushEnabled] = useState<boolean>(true);
  const [isRegisteringPush, setIsRegisteringPush] = useState<boolean>(false);
  const [simulatedVapidKey] = useState('BHz4-K-GypF5dD3D8XfO-g27pDCl3U815b_81_6v7iP1b9G');
  const [pushSubscriptionState, setPushSubscriptionState] = useState<{
    endpoint: string;
    keys: { p256dh: string; auth: string };
  } | null>(() => {
    const s = localStorage.getItem('bananur_push_sub');
    return s ? JSON.parse(s) : null;
  });
  const [pushHistory, setPushHistory] = useState<Array<{ id: string; time: string; title: string; body: string; type: string }>>([
    {
      id: 'NTF-1',
      time: '20:30:15',
      title: 'Sistema de Notificaciones Activo',
      body: 'Tu canal de alertas para despachos de autor se ha inicializado correctamente.',
      type: 'sistema'
    }
  ]);

  // Checkout billing inputs
  const [billingType, setBillingType] = useState<'boleta' | 'factura'>('boleta');
  const [taxId, setTaxId] = useState('');       // RUT
  const [businessName, setBusinessName] = useState(''); // Razón Social
  const [businessLine, setBusinessLine] = useState(''); // Giro Comercial
  const [checkoutName, setCheckoutName] = useState('');
  const [checkoutEmail, setCheckoutEmail] = useState('');
  const [checkoutPhone, setCheckoutPhone] = useState('');
  const [checkoutAddress, setCheckoutAddress] = useState('');
  const [checkoutCommune, setCheckoutCommune] = useState('Viña del Mar');
  const [checkoutCity, setCheckoutCity] = useState('Viña del Mar');
  const [invoiceErrors, setInvoiceErrors] = useState<Record<string, string>>({});

  // Toast notifications state and trigger
  const [toasts, setToasts] = useState<{
    id: string;
    title: string;
    description: string;
    type: 'success' | 'info' | 'warning' | 'error';
  }[]>([]);

  const addToast = (title: string, description: string, type: 'success' | 'info' | 'warning' | 'error' = 'success') => {
    const id = `toast-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    setToasts(prev => [...prev, { id, title, description, type }]);
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 4500);
  };

  const removeToast = (id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  };

  // Real-time account profile validations
  const valNameError = editName.trim().length === 0 
    ? 'El nombre es obligatorio.' 
    : editName.trim().length < 3 
      ? 'Debe tener al menos 3 caracteres.' 
      : '';

  const valPhoneClean = editPhone.replace(/\s+/g, '');
  const valPhoneError = editPhone.trim().length === 0
    ? 'El teléfono es obligatorio para coordinar despachos.'
    : valPhoneClean.length < 9
      ? 'Debe contener al menos 9 dígitos.'
      : !/^\+?[0-9\s-]+$/.test(editPhone)
        ? 'Caracteres de teléfono inválidos.'
        : '';

  const valAddressError = editAddress.trim().length === 0
    ? 'La dirección de despacho es obligatoria.'
    : editAddress.trim().length < 5
      ? 'Especifica una dirección más descriptiva (+6 caracteres).'
      : '';

  const valCommuneError = editCommune.trim().length === 0
    ? 'La comuna es obligatoria.'
    : editCommune.trim().length < 3
      ? 'Ingresa una comuna válida.'
      : '';

  const valCityError = editCity.trim().length === 0
    ? 'La ciudad es obligatoria.'
    : editCity.trim().length < 3
      ? 'Ingresa una ciudad válida.'
      : '';

  const isProfileFormValid = !valNameError && !valPhoneError && !valAddressError && !valCommuneError && !valCityError;

  // Trigger web/push browser notification
  const triggerWebNotification = (title: string, body: string, isTest = false) => {
    // 1. Add to local notifications history list
    const newNotice = {
      id: `NTF-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      time: new Date().toLocaleTimeString('es-CL', { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
      title,
      body,
      type: isTest ? 'test' : 'pedido'
    };
    setPushHistory(prev => [newNotice, ...prev]);

    // Respect client preference toggle
    if (!pushEnabled) {
      console.log('Se omitió la entrega de la notificación push por estar deshabilitada en la configuración del cliente.');
      return;
    }

    // 2. Play a cool high-end sound effect (synthesized through the Web Audio API)
    try {
      const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
      if (AudioContextClass) {
        const audioCtx = new AudioContextClass();
        
        // Custom bell chime
        const playTone = (frequency: number, startTime: number, duration: number) => {
          const osc = audioCtx.createOscillator();
          const gain = audioCtx.createGain();
          osc.type = 'sine';
          osc.frequency.setValueAtTime(frequency, startTime);
          
          gain.gain.setValueAtTime(0.06, startTime);
          gain.gain.exponentialRampToValueAtTime(0.0001, startTime + duration);
          
          osc.connect(gain);
          gain.connect(audioCtx.destination);
          
          osc.start(startTime);
          osc.stop(startTime + duration);
        };

        const now = audioCtx.currentTime;
        // Two subtle premium harmonic bells (similar to standard messaging)
        playTone(659.25, now, 0.4);       // E5
        playTone(880.00, now + 0.12, 0.6); // A5
      }
    } catch (soundErr) {
      console.log('Web Audio notification block triggered or blocked:', soundErr);
    }

    // 3. Fire real standard navigator/HTML5 desktop notification if authorized
    if (typeof window !== 'undefined' && 'Notification' in window) {
      if (Notification.permission === 'granted') {
        try {
          const options = {
            body,
            icon: 'https://styles.redditmedia.com/t5_2qi4j/styles/communityIcon_v0hwhuawp7v51.png',
            tag: 'bananur-push-api-v2',
            vibrate: [200, 100, 150]
          };
          new Notification(title, options);
        } catch (apiErr) {
          console.warn('Notification failed inside sandboxed sandbox preview iframe context:', apiErr);
        }
      }
    }
  };

  // Quote pre-selection parameter
  const [quoteInitialServiceId, setQuoteInitialServiceId] = useState<string>('');
  const [lastSubmittedQuote, setLastSubmittedQuote] = useState<any | null>(null);

  // FAQ expanding state
  const [expandedFaq, setExpandedFaq] = useState<string | null>('faq-1');

  // Filter Catalog State
  const [catalogCategory, setCatalogCategory] = useState<string>('Todas');
  const [catalogMaxPrice, setCatalogMaxPrice] = useState<number>(55000);
  const [catalogSort, setCatalogSort] = useState<string>('default');

  // Scroll to top on view changes
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' as any });
  }, [currentView, currentAdminView, isAdminMode]);

  // Trigger brief simulation load screen when changing routes
  const navigateTo = (view: string) => {
    setIsLoading(true);
    setCurrentView(view);
    setTimeout(() => {
      setIsLoading(false);
    }, 450);
  };

  const navigateToProductDetail = (id: string) => {
    setSelectedProductId(id);
    navigateTo('producto');
  };

  // Cart operations
  const handleAddToCart = (product: Product, variant: string, qty: number) => {
    setCart(prev => {
      const matchIndex = prev.findIndex(item => item.product.id === product.id && item.variant === variant);
      if (matchIndex > -1) {
        const copy = [...prev];
        copy[matchIndex].quantity += qty;
        return copy;
      }
      return [...prev, { product, variant, quantity: qty }];
    });
    setCartOpen(true);
  };

  const handleUpdateCartQty = (productId: string, variant: string, change: number) => {
    setCart(prev => {
      return prev.map(item => {
        if (item.product.id === productId && item.variant === variant) {
          const newQty = item.quantity + change;
          return { ...item, quantity: newQty > 0 ? newQty : 1 };
        }
        return item;
      });
    });
  };

  const handleRemoveCartItem = (productId: string, variant: string) => {
    setCart(prev => prev.filter(item => !(item.product.id === productId && item.variant === variant)));
  };

  const handleToggleFavorite = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setFavorites(prev => 
      prev.includes(id) ? prev.filter(pId => pId !== id) : [...prev, id]
    );
  };

  // Chilean RUT Formatting helper as user types: adds dots and dashes
  const handleRUTChange = (value: string) => {
    let clean = value.replace(/[^0-9kK]/g, '');
    if (clean.length > 9) clean = clean.slice(0, 9);
    
    if (clean.length > 1) {
      const dv = clean.slice(-1);
      const rutNum = clean.slice(0, -1);
      
      let formatted = rutNum;
      if (rutNum.length > 3) {
        formatted = rutNum.slice(0, -3) + '.' + rutNum.slice(-3);
      }
      if (rutNum.length > 6) {
        formatted = rutNum.slice(0, -6) + '.' + rutNum.slice(-6, -3) + '.' + rutNum.slice(-3);
      }
      
      setTaxId(formatted + '-' + dv.toUpperCase());
    } else {
      setTaxId(clean.toUpperCase());
    }

    if (value.trim()) {
      setInvoiceErrors(prev => ({ ...prev, taxId: '' }));
    }
  };

  // Checkout Validation
  const handleConfirmOrder = (e: React.FormEvent) => {
    e.preventDefault();
    const errs: Record<string, string> = {};
    
    if (!checkoutName.trim()) errs.name = 'El nombre es requerido.';
    if (!checkoutEmail.trim() || !checkoutEmail.includes('@')) errs.email = 'Email inválido.';
    if (!checkoutAddress.trim()) errs.address = 'Dirección de envío requerida.';

    if (billingType === 'factura') {
      if (!taxId.trim() || taxId.length < 9) {
        errs.taxId = 'R.U.T. inválido o incompleto (ej. 12.345.678-K).';
      }
      if (!businessName.trim()) errs.businessName = 'Razón Social de empresa requerida.';
      if (!businessLine.trim()) errs.businessLine = 'Giro comercial requerido por SII.';
    }

    if (Object.keys(errs).length > 0) {
      setInvoiceErrors(errs);
      return;
    }

    setInvoiceErrors({});
    
    // Create new order
    const subtotal = cart.reduce((s, item) => s + item.product.price * item.quantity, 0);
    const orderId = billingType === 'factura' ? `FAC-${4024 + orders.length}` : `PED-${4024 + orders.length}`;

    const newOrder: Order = {
      id: orderId,
      date: new Date().toISOString().split('T')[0],
      customerName: checkoutName,
      customerEmail: checkoutEmail,
      customerPhone: checkoutPhone || '+56 9 1234 5678',
      type: billingType,
      taxId: billingType === 'factura' ? taxId : undefined,
      businessName: billingType === 'factura' ? businessName : undefined,
      businessLine: billingType === 'factura' ? businessLine : undefined,
      address: checkoutAddress,
      commune: checkoutCommune,
      city: checkoutCity,
      subtotal,
      shippingFee: 3990,
      total: subtotal + 3990,
      status: 'En preparación',
      items: cart.map(it => ({
        productId: it.product.id,
        productName: it.product.name,
        quantity: it.quantity,
        price: it.product.price,
        variant: it.variant
      }))
    };

    setOrders([newOrder, ...orders]);
    saveOrderToFirestore(newOrder).catch((err) => console.warn('Sync order to Firestore:', err));
    setCart([]); // Clear cart
    triggerWebNotification(
      `🛍️ ¡Pedido ${newOrder.id} Recibido!`,
      `Tu compra por un total de $${newOrder.total.toLocaleString('es-CL')} CLP ha ingresado al taller textil Bananur. Te notificaremos tus avances.`
    );
    navigateTo('gracias');
  };

  // Admin adjustments
  const handleAddProduct = (p: Product) => {
    setProducts([p, ...products]);
    addToast('Producto Creado', `"${p.name}" ha sido agregado al catálogo físico boutique.`, 'success');
  };
  const handleEditProduct = (updatedProduct: Product) => {
    setProducts(prev => prev.map(p => p.id === updatedProduct.id ? updatedProduct : p));
    addToast('Producto Actualizado', `Los cambios en "${updatedProduct.name}" han sido guardados correctamente.`, 'success');
  };
  const handleEditService = (updatedService: Service) => {
    setServices(prev => prev.map(s => s.id === updatedService.id ? updatedService : s));
    addToast('Servicio Actualizado', `Los cambios en "${updatedService.name}" han sido guardados correctamente.`, 'success');
  };
  const handleEditPortfolioItem = (updatedItem: PortfolioItem) => {
    setPortfolioItems(prev => prev.map(item => item.id === updatedItem.id ? updatedItem : item));
    addToast('Proyecto Actualizado', `Los cambios en "${updatedItem.name}" han sido guardados correctamente.`, 'success');
  };
  const handleDeleteProduct = (id: string) => {
    const p = products.find(prod => prod.id === id);
    setProducts(products.filter(p => p.id !== id));
    addToast('Producto Eliminado', `El producto "${p ? p.name : id}" fue retirado con éxito.`, 'info');
  };
  const handleToggleProductActive = (id: string) => {
    addToast('Configuración Guardada', 'Se actualizó la visibilidad del producto.', 'info');
  };
  const handleDuplicateProduct = (id: string) => {
    const orig = products.find(p => p.id === id);
    if (orig) {
      const dup: Product = {
        ...orig,
        id: `prod-dup-${Date.now()}`,
        name: `${orig.name} (Copia)`
      };
      setProducts([dup, ...products]);
      addToast('Producto Duplicado', `Copia de "${orig.name}" creada correctamente.`, 'success');
    }
  };

  const handleUpdateWorkstations = (newStations: Workstation[]) => {
    setWorkstations(newStations);
    saveWorkstationsToFirestore(newStations).catch((err) => console.warn('Sync workstations to Firestore:', err));
  };

  const handleUpdateOrderStatus = (orderId: string, status: 'En preparación' | 'Enviado' | 'Entregado') => {
    setOrders(prev => prev.map(o => o.id === orderId ? { ...o, status } : o));
    
    // Find customer and order info
    const matchedOrder = orders.find(o => o.id === orderId);
    const customerSegment = matchedOrder ? ` (${matchedOrder.customerName})` : '';
    
    // Trigger web notification
    triggerWebNotification(
      `📦 Pedido ${orderId} actualizado: ${status}`,
      `El despacho de tu pedido${customerSegment} ahora se encuentra: "${status}".`
    );

    addToast('Estatus de Pedido Actualizado', `El pedido ${orderId} ahora tiene el estatus operativo: "${status}".`, 'success');
  };

  const handleToggleTimeSlot = (id: string) => {
    setConsultations(prev => prev.map(c => {
      if (c.id === id) {
        return { ...c, status: c.status === 'Agendada' ? 'Bloqueada' : 'Agendada' };
      }
      return c;
    }));
  };

  // Find currently active product page
  const activeProduct = useMemo(() => {
    return products.find(p => p.id === selectedProductId) || products[0];
  }, [selectedProductId, products]);

  // Related products based on category excluding currently active
  const relatedProducts = useMemo(() => {
    return products.filter(p => p.category === activeProduct.category && p.id !== activeProduct.id);
  }, [activeProduct, products]);

  // Catalog Filtration
  const filteredCatalogProducts = useMemo(() => {
    let result = [...products];
    if (catalogCategory !== 'Todas') {
      result = result.filter(p => p.category === catalogCategory);
    }
    result = result.filter(p => p.price <= catalogMaxPrice);

    if (catalogSort === 'low') {
      result.sort((a, b) => a.price - b.price);
    } else if (catalogSort === 'high') {
      result.sort((a, b) => b.price - a.price);
    }
    return result;
  }, [products, catalogCategory, catalogMaxPrice, catalogSort]);

  // Floating Dev Controller Panel Toggle
  const [showDemoController, setShowDemoController] = useState(true);

  // Dynamic client font mapping class based on customization state
  const clientFontClass = 
    customization.fontFamily === 'font-serif' ? 'font-serif' :
    customization.fontFamily === 'font-mono' ? 'font-mono' :
    customization.fontFamily === 'font-space' ? 'font-sans tracking-tight' : 'font-sans';

  return (
    <div className={`min-h-screen flex flex-col bg-bananur-cream selection:bg-bananur-yellow selection:text-bananur-clay ${!isAdminMode ? clientFontClass : ''}`}>
      
      {/* Global CSS overrides for the client customization */}
      <style>{`
        :root {
          --color-bananur-primary-dynamic: ${customization.primaryColor};
          --color-bananur-accent-dynamic: ${customization.accentColor};
          --color-bananur-bg-dynamic: ${customization.backgroundColor};
        }
      `}</style>
      
      {/* ------------------------- CLIENT ENVIRONMENT HEADERS & CONTROLS ------------------------- */}
      {!isAdminMode ? (
        <>
          <Header
            currentView={currentView}
            onNavigate={(view) => {
              if (view === 'admin') {
                setIsAdminMode(true);
                setCurrentAdminView('dashboard');
              } else {
                navigateTo(view);
              }
            }}
            cartCount={cart.reduce((sum, item) => sum + item.quantity, 0)}
            onToggleCart={() => setCartOpen(!cartOpen)}
            onToggleSearch={() => setSearchOpen(true)}
            isLoggedIn={isClientLoggedIn}
            customPages={customization.customPages}
          />

          <CartSlideOver
            isOpen={cartOpen}
            onClose={() => setCartOpen(false)}
            items={cart}
            onUpdateQuantity={handleUpdateCartQty}
            onRemoveItem={handleRemoveCartItem}
            onGoToCheckout={() => navigateTo('checkout')}
            onGoToShop={() => navigateTo('tienda')}
          />

          {searchOpen && (
            <SearchOverlay
              onClose={() => setSearchOpen(false)}
              onNavigateToProduct={(id) => navigateToProductDetail(id)}
              onNavigateToService={(id) => {
                setQuoteInitialServiceId(id);
                navigateTo('cotizar');
              }}
              onNavigateToCategory={(cat) => {
                setCatalogCategory(cat);
                navigateTo('tienda');
              }}
            />
          )}
        </>
      ) : null}

      {/* CORE WORKSPACE SCREEN ROUTING */}
      <main className="flex-1">
        
        {/* Render Skeleton load state if trigger active */}
        {isLoading ? (
          <div className="max-w-7xl mx-auto px-4 py-20">
            <SkeletonLoader type={currentView === 'producto' ? 'detail' : 'grid'} />
          </div>
        ) : (
          <>
            {/* ------------------------- REGULAR CLIENT ROUTING VIEWS (14 pantallas) ------------------------- */}
            {!isAdminMode ? (
              <>
                
                {/* 1. Home View */}
                {currentView === 'home' && (
                  <div className="animate-fade-in space-y-20 pb-20">
                    {/* Public Hero Area */}
                    <section 
                      className="relative overflow-hidden rounded-3xl p-8 sm:p-14 border max-w-7xl mx-auto mt-6"
                      style={{ 
                        backgroundColor: customization.backgroundColor,
                        borderColor: `${customization.primaryColor}20`
                      }}
                    >
                      <div className="absolute -bottom-10 -right-10 w-64 h-64 rounded-full opacity-20 pointer-events-none" style={{ backgroundColor: customization.accentColor }}></div>
                      <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
                        <div className="lg:col-span-7 space-y-6 text-left">
                          <span className="text-[10px] uppercase tracking-[0.3em] font-bold block" style={{ color: customization.primaryColor }}>
                            Transformación Digital & Oficio
                          </span>
                          <h1 className="text-4xl sm:text-5xl font-serif font-light text-bananur-clay leading-[1.15] tracking-tight">
                            {customization.heroTitle}
                          </h1>
                          <p className="text-sm sm:text-base text-bananur-clay-light/95 leading-relaxed font-light max-w-xl">
                            {customization.heroSubtitle}
                          </p>
                          <div className="flex flex-wrap gap-4 pt-2">
                            <button
                              id="hero-btn-shop"
                              onClick={() => navigateTo('tienda')}
                              className="px-8 py-3 text-[#FAF8F5] rounded-full text-xs font-bold uppercase tracking-widest transition-all shadow-sm cursor-pointer hover:opacity-90"
                              style={{ backgroundColor: customization.primaryColor }}
                            >
                              Ver Catálogo
                            </button>
                            <button
                              id="hero-btn-services"
                              onClick={() => navigateTo('servicios')}
                              className="px-8 py-3 bg-transparent border rounded-full text-xs font-bold uppercase tracking-widest transition-all cursor-pointer hover:bg-white/40"
                              style={{ borderColor: customization.primaryColor, color: customization.primaryColor }}
                            >
                              Cotizar
                            </button>
                          </div>
                        </div>
                        <div className="lg:col-span-5 relative flex justify-center">
                          {/* Floating aesthetic image */}
                          <div className="aspect-[4/5] w-full max-w-sm rounded-[32px] overflow-hidden border border-bananur-clay/5 shadow-2xl relative bg-bananur-sand">
                            <img 
                              referrerPolicy="no-referrer"
                              src="https://images.unsplash.com/photo-1544816155-12df9643f363?auto=format&fit=crop&q=80&w=800" 
                              alt="Insumos Creativos" 
                              className="w-full h-full object-cover transition-transform hover:scale-102 duration-300"
                            />
                            <div className="absolute top-4 left-4 bg-[#FDFCF8]/95 backdrop-blur-md p-3 rounded-2xl text-xs space-y-0.5 border border-bananur-clay/5">
                              <p className="font-serif font-bold text-bananur-clay">Oficio & Tecnología</p>
                              <p className="text-[10px] text-bananur-sage font-mono">100% Hecho a Mano en Chile</p>
                            </div>
                          </div>
                        </div>
                      </div>
                    </section>

                    {/* Dual Block section: Esenciales vs Soluciones */}
                    <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        {/* Esenciales block */}
                        <div className="bg-white p-8 sm:p-12 rounded-3xl border border-bananur-clay/10 flex flex-col justify-between space-y-6">
                          <div className="space-y-3">
                            <span className="text-[10px] font-mono uppercase tracking-widest text-bananur-sage font-bold">Objetos Coleccionables</span>
                            <h2 className="text-3xl font-serif font-bold text-bananur-clay leading-tight">
                              Esenciales para tu taller creativo
                            </h2>
                            <p className="text-xs text-bananur-clay-light leading-relaxed font-light">
                              Materiales y diseños que elevan tu pasión creativa: filamentos ecológicos para impresión 3D de alta resolución, insumos textiles finos para costura y amigurumis tejidos a ganchillo.
                            </p>
                          </div>
                          <button
                            id="home-btn-go-tienda"
                            onClick={() => navigateTo('tienda')}
                            className="text-xs font-bold text-bananur-clay hover:text-bananur-sage flex items-center gap-1.5 pt-4 transition-all duration-150"
                          >
                            Ir a la tienda chilena
                            <ChevronRight className="w-4 h-4" />
                          </button>
                        </div>
                        
                        {/* Soluciones Digitales block */}
                        <div className="bg-bananur-sage text-white p-8 sm:p-12 rounded-3xl flex flex-col justify-between space-y-6">
                          <div className="space-y-3">
                            <span className="text-[10px] font-mono uppercase tracking-widest text-bananur-sand font-bold">Estudio Creativo</span>
                            <h2 className="text-3xl font-serif font-bold text-white leading-tight">
                              Soluciones digitales y branding a medida
                            </h2>
                            <p className="text-xs text-bananur-sand/80 leading-relaxed font-light">
                              Acompañamos a estudios, tiendas y profesionales independientes en la modernización de sus marcas. Diseñamos con un foco minimalista y responsivo que ensalza tu propuesta de valor de nicho.
                            </p>
                          </div>
                          <button
                            id="home-btn-go-servicios"
                            onClick={() => navigateTo('servicios')}
                            className="text-xs font-bold text-bananur-sand hover:text-white flex items-center gap-1.5 pt-4 transition-all duration-150"
                          >
                            Ver servicios de branding
                            <ChevronRight className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </section>

                    {/* Featured items grid */}
                    <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
                      <div className="text-center space-y-1">
                        <span className="text-xs font-mono uppercase text-bananur-sage font-bold">Edición Muy Selecta</span>
                        <h2 className="text-3xl font-serif font-bold text-bananur-clay">Productos Destacados</h2>
                      </div>

                      <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
                        {products.slice(0, 4).map((p) => {
                          const loved = favorites.includes(p.id);
                          const isLow = p.stock <= p.lowStockThreshold;
                          return (
                            <div 
                              key={p.id}
                              onClick={() => navigateToProductDetail(p.id)}
                              className="group cursor-pointer bg-white p-4 rounded-3xl border border-bananur-sand hover:border-bananur-gold-dark/30 duration-200 transition-all flex flex-col justify-between relative shadow-xs"
                            >
                              <div className="aspect-square rounded-2xl overflow-hidden bg-bananur-sand relative">
                                <img src={p.images[0]} alt={p.name} className="w-full h-full object-cover group-hover:scale-102 duration-200" />
                                
                                {/* Loved Button inside overlay */}
                                <button
                                  id={`fav-heart-${p.id}`}
                                  onClick={(e) => handleToggleFavorite(p.id, e)}
                                  className="absolute top-2.5 right-2.5 p-2 bg-white/95 backdrop-blur-md rounded-full shadow-xs text-bananur-clay hover:scale-110 active:scale-90 duration-150 transition-all cursor-pointer"
                                  title={loved ? 'Remover de favoritos' : 'Añadir a favoritos'}
                                >
                                  <Heart className={`w-4 h-4 ${loved ? 'fill-bananur-coral text-bananur-coral' : 'text-bananur-clay-light'}`} />
                                </button>

                                {isLow && (
                                  <span className="absolute bottom-2 left-2 bg-amber-100 text-amber-900 border border-amber-300 text-[9px] font-mono tracking-wide px-2 py-0.5 rounded font-bold animate-pulse">
                                    Bajo Stock ({p.stock})
                                  </span>
                                )}
                              </div>

                              <div className="space-y-1 pt-3">
                                <div className="flex items-center justify-between gap-1">
                                  <span className="text-[10px] font-mono text-bananur-gold-dark font-semibold uppercase">{p.category}</span>
                                  {p.category.toLowerCase() === 'ropa' && (
                                    <span className="text-[9px] font-mono font-bold px-1.5 py-0.2 rounded bg-bananur-sand/50 text-bananur-clay">
                                      {p.clothingType === 'vintage' ? `⚖️ Vintage ${p.weightGrams ? `${p.weightGrams}g` : ''}` : '✨ Nueva'}
                                    </span>
                                  )}
                                </div>
                                <h4 className="font-serif text-sm font-bold text-bananur-clay leading-snug line-clamp-1 group-hover:underline">
                                  {p.name}
                                </h4>
                                <p className="font-mono text-xs font-bold text-bananur-clay-light">
                                  ${p.price.toLocaleString('es-CL')} CLP
                                </p>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </section>

                    {/* Recent Portfolio studies block */}
                    <section className="bg-bananur-sand/20 py-16 border-y border-bananur-sand/30">
                      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
                        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                          <div className="space-y-1 text-left">
                            <span className="text-xs font-mono uppercase text-bananur-gold-dark font-bold">Mirada Integral</span>
                            <h2 className="text-3xl font-serif font-bold text-bananur-clay">Portafolio Destacado</h2>
                          </div>
                          <button
                            id="home-btn-go-portfolio"
                            onClick={() => navigateTo('portafolio')}
                            className="text-xs font-bold text-bananur-clay hover:underline flex items-center gap-1.5"
                          >
                            Ver todos los casos de estudio
                            <ArrowRight className="w-4 h-4" />
                          </button>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                          {portfolioItems.slice(0, 2).map((proj) => (
                            <div
                              key={proj.id}
                              onClick={() => navigateTo('portafolio')}
                              className="bg-white p-5 rounded-3xl border border-bananur-sand duration-200 hover:border-bananur-gold cursor-pointer flex gap-4 overflow-hidden"
                            >
                              <img src={proj.image} alt={proj.name} className="w-24 h-24 object-cover rounded-2xl bg-bananur-sand flex-shrink-0" />
                              <div className="min-w-0 space-y-1.5">
                                <span className="text-[9px] font-mono uppercase text-bananur-gold-dark font-bold bg-bananur-sand px-2 py-0.5 rounded inline-block">
                                  {proj.category}
                                </span>
                                <h4 className="font-serif text-base font-bold text-bananur-clay leading-snug truncate">{proj.name}</h4>
                                <p className="text-xs text-bananur-clay-light/85 font-light line-clamp-2 leading-relaxed">{proj.description}</p>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </section>

                  </div>
                )}

                {/* 2. Catálogo View */}
                {currentView === 'tienda' && (
                  <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 animate-fade-in space-y-10">
                    <div className="flex flex-col md:flex-row md:items-end justify-between border-b border-bananur-sand pb-4 gap-4">
                      <div className="space-y-2">
                        <span className="text-xs font-mono tracking-widest text-[#5A5A40] uppercase block font-semibold">Tienda Online</span>
                        <h1 className="text-4xl font-serif font-extrabold text-bananur-clay">Colección de Objetos</h1>
                        <p className="text-xs font-light text-bananur-clay-light">Productos refinados y funcionales diseñados y fabricados con conciencia material.</p>
                      </div>
                      
                      {/* Counter */}
                      <span className="font-mono text-xs text-bananur-clay-light">
                        Mostrando <span className="font-bold">{filteredCatalogProducts.length}</span> objetos
                      </span>
                    </div>

                    {/* Filters Toolbar */}
                    <div className="flex flex-wrap items-center justify-between gap-4 bg-white p-4 rounded-3xl shadow-xs">
                      <div className="flex flex-wrap gap-2">
                        {['Todas', ...productCategories].map((cat) => (
                          <button
                            id={`catalog-filter-${cat}`}
                            key={cat}
                            onClick={() => setCatalogCategory(cat)}
                            className={`px-4 py-2 text-xs font-semibold rounded-full transition-all cursor-pointer ${
                              catalogCategory === cat 
                                ? 'bg-bananur-clay text-bananur-cream shadow-sm' 
                                : 'bg-[#FAF8F5] text-bananur-clay-light hover:bg-[#FAF8F5]/80'
                            }`}
                          >
                            {cat}
                          </button>
                        ))}
                      </div>

                      <div className="flex flex-wrap items-center gap-4 text-xs">
                        {/* Price Filter slider */}
                        <div className="flex items-center gap-3 bg-[#FAF8F5] px-3.5 py-1.5 rounded-xl">
                          <label className="font-mono text-[10px] font-bold text-bananur-clay-light tracking-wider uppercase">Filtro Precio:</label>
                          <input
                            type="range"
                            min="10000"
                            max="55000"
                            step="2000"
                            value={catalogMaxPrice}
                            onChange={(e) => setCatalogMaxPrice(Number(e.target.value))}
                            className="w-24 accent-bananur-gold"
                          />
                          <span className="font-mono font-bold text-bananur-gold-dark">${catalogMaxPrice.toLocaleString('es-CL')} CLP</span>
                        </div>

                        {/* Sort selector */}
                        <div className="flex items-center gap-2">
                          <label className="font-mono text-[10px] text-bananur-clay-light font-bold">Ordenar:</label>
                          <select
                            id="catalog-sort"
                            value={catalogSort}
                            onChange={(e) => setCatalogSort(e.target.value)}
                            className="p-2 bg-white text-xs font-medium text-bananur-clay rounded-xl cursor-pointer shadow-3xs border-none"
                          >
                            <option value="default">Por defecto</option>
                            <option value="low">Menor precio</option>
                            <option value="high">Mayor precio</option>
                          </select>
                        </div>
                      </div>
                    </div>

                    {/* Catalog Grid of Products */}
                    {filteredCatalogProducts.length === 0 ? (
                      /* Catálogo Vacío State */
                      <div className="text-center py-20 bg-white rounded-3xl border border-bananur-sand p-8 space-y-4 max-w-md mx-auto">
                        <div className="text-4xl">🌵</div>
                        <h3 className="font-serif text-lg font-bold text-bananur-clay">Ningún objeto coincide con la búsqueda</h3>
                        <p className="text-xs text-bananur-clay-light font-light leading-relaxed">
                          Intenta extender el filtro de precios o selecciona otra categoría de diseño de autor.
                        </p>
                        <button
                          id="catalog-btn-reset-filters"
                          onClick={() => {
                            setCatalogCategory('Todas');
                            setCatalogMaxPrice(55000);
                            setCatalogSort('default');
                          }}
                          className="px-5 py-2.5 bg-bananur-clay text-bananur-cream rounded-full text-xs font-bold hover:bg-bananur-gold hover:text-bananur-clay cursor-pointer"
                        >
                          Limpiar Todos los Filtros
                        </button>
                      </div>
                    ) : (
                      <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-6">
                        {filteredCatalogProducts.map((p) => {
                          const loved = favorites.includes(p.id);
                          const isLow = p.stock <= p.lowStockThreshold;
                          return (
                            <div 
                              key={p.id}
                              onClick={() => navigateToProductDetail(p.id)}
                              className="group cursor-pointer bg-[#FAF8F5]/45 hover:bg-[#FAF8F5]/85 p-4 rounded-3xl duration-200 transition-all flex flex-col justify-between shadow-xs relative"
                            >
                              <div className="aspect-square rounded-2xl overflow-hidden bg-bananur-sand relative">
                                <img src={p.images[0]} alt={p.name} className="w-full h-full object-cover group-hover:scale-102 duration-200" />
                                
                                {/* Loved Button */}
                                <button
                                  id={`catalog-fav-${p.id}`}
                                  onClick={(e) => handleToggleFavorite(p.id, e)}
                                  className="absolute top-2.5 right-2.5 p-2 bg-white/95 backdrop-blur-md rounded-full text-bananur-clay hover:scale-110 active:scale-95 duration-100 transition-all cursor-pointer"
                                >
                                  <Heart className={`w-4 h-4 ${loved ? 'fill-bananur-coral text-bananur-coral' : 'text-bananur-clay-light'}`} />
                                </button>

                                {isLow && (
                                  <span className="absolute bottom-2.5 left-2.5 bg-amber-50 text-amber-900 text-[9px] font-mono tracking-wider px-2 py-0.5 rounded font-bold">
                                    ¡Últimas {p.stock} unids!
                                  </span>
                                )}
                              </div>

                              <div className="space-y-1 pt-3">
                                <div className="flex items-center justify-between gap-1">
                                  <span className="text-[10px] font-mono text-bananur-gold-dark font-semibold uppercase">{p.category}</span>
                                  {p.category.toLowerCase() === 'ropa' && (
                                    <span className="text-[9px] font-mono font-bold px-1.5 py-0.2 rounded bg-bananur-sand/50 text-bananur-clay">
                                      {p.clothingType === 'vintage' ? `⚖️ Vintage ${p.weightGrams ? `${p.weightGrams}g` : ''}` : '✨ Nueva'}
                                    </span>
                                  )}
                                </div>
                                <h4 className="font-serif text-sm font-bold text-bananur-clay leading-snug line-clamp-1 group-hover:underline">
                                  {p.name}
                                </h4>
                                <p className="font-mono text-xs font-bold text-bananur-clay-light">
                                  ${p.price.toLocaleString('es-CL')} CLP
                                </p>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}

                  </div>
                )}

                {/* 3. Ficha de Producto View (Vertical gallery, dynamic components mapped from detail list) */}
                {currentView === 'producto' && (
                  <ClientProductDetail
                    product={activeProduct}
                    onBack={() => navigateTo('tienda')}
                    onAddToCart={handleAddToCart}
                    relatedProducts={relatedProducts}
                    onNavigateToProduct={(id) => navigateToProductDetail(id)}
                  />
                )}

                {/* 4. Hub de Servicios View */}
                {currentView === 'servicios' && (
                  <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 animate-fade-in space-y-16">
                    <div className="text-center max-w-2xl mx-auto space-y-3">
                      <span className="text-xs font-mono uppercase text-[#5A5A40] font-semibold tracking-widest">Procesos de Autor</span>
                      <h1 className="text-4xl sm:text-5xl font-serif font-bold text-bananur-clay">Servicios del Estudio</h1>
                      <p className="text-sm text-bananur-clay-light font-light leading-relaxed">
                        Modernizamos la propuesta de marca e imagen de corporaciones independientes y tiendas chilenas, con metodologías de diseño probadas y de gran rigor técnico.
                      </p>
                    </div>

                    {/* Services display Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                      {services.map((serv) => (
                        <div 
                          key={serv.id}
                          className="bg-white p-8 rounded-3xl shadow-xs flex flex-col justify-between space-y-8 hover:bg-[#FAF8F5]/50 duration-200 transition-all overflow-hidden"
                        >
                          <div className="space-y-4">
                            <span className="text-xs font-mono font-bold uppercase text-bananur-gold-dark bg-bananur-sand/40 px-3 py-1 rounded inline-block">
                              {serv.category}
                            </span>
                            <h3 className="font-serif text-2xl font-bold text-bananur-clay">
                              {serv.name}
                            </h3>
                            <p className="text-xs text-[#524742] leading-relaxed font-light">
                              {serv.description}
                            </p>

                            {/* Bullet specs summary */}
                            <ul className="text-xs text-[#524742]/90 space-y-1.5 list-disc pl-4 font-light">
                              {serv.details.map((bullet, idx) => (
                                <li key={idx}>{bullet}</li>
                              ))}
                            </ul>
                          </div>

                          <div className="bg-[#FAF8F5] p-5 -mx-8 -mb-8 flex items-center justify-between gap-4">
                            <div>
                              <span className="text-[10px] text-[#524742]/40 block uppercase font-mono mb-0.5">Inversión Estimada</span>
                              <span className="font-mono text-base font-bold text-bananur-clay">Desde ${serv.price.toLocaleString('es-CL')} CLP</span>
                            </div>
                            
                            <button
                              id={`services-btn-quote-${serv.id}`}
                              onClick={() => {
                                setQuoteInitialServiceId(serv.id);
                                navigateTo('cotizar');
                              }}
                              className="px-6 py-3 bg-bananur-clay text-bananur-cream rounded-full text-xs font-semibold hover:bg-bananur-gold hover:text-bananur-clay duration-150 transition-all cursor-pointer"
                            >
                              Cotizar Servicio
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* 5. Portafolio View */}
                {currentView === 'portafolio' && (
                  <ClientPortfolio portfolioItems={portfolioItems} />
                )}

                {/* 6. Cotizador View ( Barra de progreso + 3 pasos ) */}
                {currentView === 'cotizar' && (
                  <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 animate-fade-in">
                    
                    {lastSubmittedQuote ? (
                      /* Cotizador success page */
                      <div className="max-w-xl mx-auto bg-white p-8 sm:p-12 rounded-3xl border border-bananur-sand text-center space-y-5">
                        <div className="w-16 h-16 bg-bananur-sage-light border border-bananur-sage/20 text-bananur-sage rounded-full flex items-center justify-center mx-auto text-3xl font-bold p-2">
                          ✔
                        </div>
                        <div className="space-y-2">
                          <span className="text-[10px] font-mono text-bananur-gold-dark font-extrabold uppercase tracking-wide">Paso final: Envío exitoso</span>
                          <h2 className="font-serif text-2xl font-bold text-bananur-clay leading-snug">¡Solicitud Procesada en Viña del Mar!</h2>
                          <p className="text-xs text-[#524742]/90 leading-relaxed font-light">
                            Hola <span className="font-semibold text-bananur-clay">{lastSubmittedQuote.name}</span>, hemos recibido las pautas para tu proyecto "<span className="italic font-medium">{lastSubmittedQuote.serviceName}</span>".
                          </p>
                        </div>

                        {/* Summary panel */}
                        <div className="bg-bananur-sand/30 p-4 rounded-2xl text-left text-xs font-mono text-bananur-clay space-y-1.5 border border-bananur-clay/5">
                          <div>• Presupuesto objetivo: <span className="font-bold text-bananur-gold-dark">${lastSubmittedQuote.budget.toLocaleString('es-CL')} CLP</span></div>
                          <div>• Plazo planteado: <span className="font-semibold">{lastSubmittedQuote.timeline}</span></div>
                          <div>• Teléfono contacto: <span className="font-semibold">{lastSubmittedQuote.phone}</span></div>
                        </div>

                        <p className="text-xs text-bananur-coral font-sans font-semibold">
                          * Un ejecutivo técnico de Bananur te contactará en un plazo menor a 24 horas hábiles.
                        </p>

                        <div className="pt-2">
                          <button
                            id="quote-success-btn-home"
                            onClick={() => {
                              setLastSubmittedQuote(null);
                              navigateTo('home');
                            }}
                            className="px-6 py-3 bg-bananur-clay text-bananur-cream rounded-full text-xs font-bold hover:bg-bananur-gold hover:text-bananur-clay transition-all cursor-pointer"
                          >
                            Volver al Inicio
                          </button>
                        </div>
                      </div>
                    ) : (
                      <QuoteStepper
                        initialServiceId={quoteInitialServiceId}
                        onBackToServices={() => navigateTo('servicios')}
                        onSuccess={(summary) => setLastSubmittedQuote(summary)}
                      />
                    )}

                  </div>
                )}

                {/* 7. Checkout View (Con switch Boleta / Factura que abre campos dinámicos de RUT, Razón Social, Giro tributario) */}
                {currentView === 'checkout' && (
                  <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 animate-fade-in space-y-8">
                    <h1 className="text-3xl font-serif font-extrabold text-[#2D2522] border-b border-bananur-sand pb-4">
                      Formulario de Checkout & Envío
                    </h1>

                    {cart.length === 0 ? (
                      /* Checkout Vacío state */
                      <div className="text-center py-20 bg-white rounded-3xl border border-bananur-sand max-w-sm mx-auto p-8 space-y-4">
                        <div className="text-4xl text-bananur-gold">💼</div>
                        <h4 className="font-serif text-lg font-bold text-bananur-clay">No tienes artículos para pagar</h4>
                        <p className="text-xs text-bananur-clay-light font-light leading-relaxed">
                          Visita nuestra colección para agregar bellas agendas encuadernadas u tazas de cerámica gres.
                        </p>
                        <button
                          id="checkout-empty-go-shop"
                          onClick={() => navigateTo('tienda')}
                          className="px-6 py-3.5 bg-bananur-clay text-bananur-cream rounded-full text-xs font-bold hover:bg-bananur-gold hover:text-bananur-clay transition-all cursor-pointer"
                        >
                          Ir a la Tienda Boutique
                        </button>
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
                        
                        {/* Checkout fields form */}
                        <form onSubmit={handleConfirmOrder} className="lg:col-span-7 bg-white p-6 sm:p-10 rounded-3xl border border-bananur-sand space-y-6">
                          <h3 className="font-serif text-xl font-bold text-bananur-clay border-b border-bananur-sand pb-3">Detalles de Envío</h3>
                          
                          <div className="space-y-4">
                            <div>
                              <label className="block text-xs font-mono font-bold uppercase text-bananur-clay-light mb-1.5">Nombre Destinatario *</label>
                              <input
                                id="checkout-name"
                                type="text"
                                required
                                placeholder="Ej. Francisco Sepúlveda"
                                value={checkoutName}
                                onChange={(e) => setCheckoutName(e.target.value)}
                                className={`w-full p-3 bg-bananur-cream/30 border rounded-xl text-xs focus:outline-none focus:border-bananur-gold ${
                                  invoiceErrors.name ? 'border-bananur-coral' : 'border-bananur-sand'
                                }`}
                              />
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                              <div>
                                <label className="block text-xs font-mono font-bold uppercase text-bananur-clay-light mb-1.5">Correo *</label>
                                <input
                                  id="checkout-email"
                                  type="email"
                                  required
                                  placeholder="ejemplo@correo.cl"
                                  value={checkoutEmail}
                                  onChange={(e) => setCheckoutEmail(e.target.value)}
                                  className={`w-full p-3 bg-bananur-cream/30 border rounded-xl text-xs focus:outline-none focus:border-bananur-gold ${
                                    invoiceErrors.email ? 'border-bananur-coral' : 'border-bananur-sand'
                                  }`}
                                />
                              </div>
                              <div>
                                <label className="block text-xs font-mono font-bold uppercase text-bananur-clay-light mb-1.5">Teléfono Movil</label>
                                <input
                                  id="checkout-phone"
                                  type="text"
                                  placeholder="+56 9 1234 5678"
                                  value={checkoutPhone}
                                  onChange={(e) => setCheckoutPhone(e.target.value)}
                                  className="w-full p-3 bg-bananur-cream/30 border border-bananur-sand rounded-xl text-xs focus:outline-none focus:border-bananur-gold"
                                />
                              </div>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                              <div className="sm:col-span-2">
                                <label className="block text-xs font-mono font-bold uppercase text-bananur-clay-light mb-1.5">Calle y Número de Calle *</label>
                                <input
                                  id="checkout-address"
                                  type="text"
                                  required
                                  placeholder="Ej. Av. Libertad 1045, Depto 502"
                                  value={checkoutAddress}
                                  onChange={(e) => setCheckoutAddress(e.target.value)}
                                  className={`w-full p-3 bg-bananur-cream/30 border rounded-xl text-xs focus:outline-none focus:border-bananur-gold ${
                                    invoiceErrors.address ? 'border-bananur-coral' : 'border-bananur-sand'
                                  }`}
                                />
                              </div>
                              <div>
                                <label className="block text-xs font-mono font-bold uppercase text-bananur-clay-light mb-1.5">Comuna</label>
                                <input
                                  id="checkout-commune"
                                  type="text"
                                  value={checkoutCommune}
                                  onChange={(e) => setCheckoutCommune(e.target.value)}
                                  className="w-full p-3 bg-bananur-cream/30 border border-bananur-sand rounded-xl text-xs focus:outline-none"
                                />
                              </div>
                            </div>
                          </div>

                          {/* DYNAMIC BILLING SELECTOR TABS (Boleta vs Factura) */}
                          <div className="pt-4 border-t border-bananur-sand/60 space-y-4">
                            <div className="flex justify-between items-center bg-bananur-sand/30 p-1 rounded-xl">
                              <button
                                id="checkout-billing-boleta"
                                type="button"
                                onClick={() => {
                                  setBillingType('boleta');
                                  setInvoiceErrors({});
                                }}
                                className={`flex-1 py-3 text-center text-xs font-bold uppercase rounded-lg cursor-pointer ${
                                  billingType === 'boleta' 
                                    ? 'bg-white text-bananur-clay shadow-xs' 
                                    : 'text-bananur-clay-light hover:text-bananur-clay'
                                }`}
                              >
                                Emitir Boleta
                              </button>
                              <button
                                id="checkout-billing-factura"
                                type="button"
                                onClick={() => setBillingType('factura')}
                                className={`flex-1 py-3 text-center text-xs font-bold uppercase rounded-lg cursor-pointer ${
                                  billingType === 'factura' 
                                    ? 'bg-[#2D2522] text-[#FAF8F5]' 
                                    : 'text-bananur-clay-light hover:text-bananur-clay'
                                }`}
                              >
                                Emitir Factura de Empresa
                              </button>
                            </div>

                            {/* Factura Fields: desplegables con suave transición */}
                            {billingType === 'factura' && (
                              <div className="bg-[#FAF8F5] p-5 rounded-2xl border border-bananur-sand space-y-3.5 transition-all duration-300 animate-slide-down">
                                <p className="text-[11px] text-[#524742] font-semibold leading-relaxed mb-2 flex items-center gap-1.5">
                                  <ShieldCheck className="w-4 h-4 text-[#40916C]" />
                                  Se habilitarán los campos tributarios para la sincronización con el SII de Chile.
                                </p>

                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                  {/* R.U.T. */}
                                  <div>
                                    <label className="block text-[10px] font-mono uppercase text-bananur-clay-light mb-1">R.U.T. de Empresa *</label>
                                    <input
                                      id="checkout-taxid"
                                      type="text"
                                      required
                                      placeholder="Ej. 76.241.980-4"
                                      value={taxId}
                                      onChange={(e) => handleRUTChange(e.target.value)}
                                      className={`w-full p-2.5 bg-white border rounded-lg text-xs font-mono focus:outline-none ${
                                        invoiceErrors.taxId ? 'border-bananur-coral animate-shake' : 'border-bananur-sand'
                                      }`}
                                    />
                                    {invoiceErrors.taxId && <span className="text-[10px] text-bananur-coral block mt-1">{invoiceErrors.taxId}</span>}
                                  </div>

                                  {/* Razón Social */}
                                  <div>
                                    <label className="block text-[10px] font-mono uppercase text-bananur-clay-light mb-1">Razón Social *</label>
                                    <input
                                      id="checkout-bizname"
                                      type="text"
                                      required
                                      placeholder="Ej. Inversiones Kreativa SpA"
                                      value={businessName}
                                      onChange={(e) => {
                                        setBusinessName(e.target.value);
                                        if (e.target.value.trim()) setInvoiceErrors(prev => ({ ...prev, businessName: '' }));
                                      }}
                                      className={`w-full p-2.5 bg-white border rounded-lg text-xs focus:outline-none ${
                                        invoiceErrors.businessName ? 'border-bananur-coral animate-shake' : 'border-bananur-sand'
                                      }`}
                                    />
                                    {invoiceErrors.businessName && <span className="text-[10px] text-bananur-coral block mt-1">{invoiceErrors.businessName}</span>}
                                  </div>
                                </div>

                                {/* Giro comercial */}
                                <div>
                                  <label className="block text-[10px] font-mono uppercase text-bananur-clay-light mb-1">Giro de Actividad Comercial *</label>
                                  <input
                                    id="checkout-bizline"
                                    type="text"
                                    required
                                    placeholder="Ej. Servicios de Diseño e Informática"
                                    value={businessLine}
                                    onChange={(e) => {
                                      setBusinessLine(e.target.value);
                                      if (e.target.value.trim()) setInvoiceErrors(prev => ({ ...prev, businessLine: '' }));
                                    }}
                                    className={`w-full p-2.5 bg-white border rounded-lg text-xs focus:outline-none ${
                                      invoiceErrors.businessLine ? 'border-bananur-coral animate-shake' : 'border-bananur-sand'
                                    }`}
                                  />
                                  {invoiceErrors.businessLine && <span className="text-[10px] text-bananur-coral block mt-1">{invoiceErrors.businessLine}</span>}
                                </div>
                              </div>
                            )}
                          </div>

                          <div className="pt-4 flex justify-end">
                            <button
                              id="checkout-btn-confirm"
                              type="submit"
                              className="w-full sm:w-auto bg-bananur-clay text-bananur-cream hover:bg-bananur-gold-dark hover:scale-101 py-4 px-10 rounded-xl text-xs font-bold transition-all shadow-sm cursor-pointer"
                            >
                              Confirmar Pedido (Pagar)
                            </button>
                          </div>

                        </form>

                        {/* Cart Sidebar Recap */}
                        <div className="lg:col-span-5 bg-bananur-sage-light p-6 rounded-3xl border border-bananur-sand space-y-4 h-fit">
                          <h3 className="font-serif text-lg font-bold text-bananur-clay border-b border-bananur-sand/80 pb-3">Resumen de Compra</h3>
                          
                          <div className="divide-y divide-bananur-sand/50">
                            {cart.map((item, idx) => (
                              <div key={idx} className="py-3 flex justify-between items-center text-xs">
                                <div className="min-w-0 pr-3">
                                  <span className="font-semibold block text-bananur-clay truncate max-w-[200px]">{item.product.name}</span>
                                  <span className="text-[10px] text-bananur-clay-light/60 font-mono">Variante: {item.variant} x {item.quantity}</span>
                                </div>
                                <span className="font-mono font-bold text-bananur-clay shrink-0">
                                  ${(item.product.price * item.quantity).toLocaleString('es-CL')}
                                </span>
                              </div>
                            ))}
                          </div>

                          {/* Calculations */}
                          <div className="border-t border-bananur-sand pt-4 space-y-2 text-xs">
                            <div className="flex justify-between text-bananur-clay-light">
                              <span>Subtotal Neto</span>
                              <span className="font-mono">${Math.round(cart.reduce((s, it) => s + it.product.price * it.quantity, 0) * 0.81).toLocaleString('es-CL')} CLP</span>
                            </div>
                            <div className="flex justify-between text-bananur-clay-light">
                              <span>I.V.A. (19%)</span>
                              <span className="font-mono">${Math.round(cart.reduce((s, it) => s + it.product.price * it.quantity, 0) * 0.19).toLocaleString('es-CL')} CLP</span>
                            </div>
                            <div className="flex justify-between text-bananur-clay-light">
                              <span>Gastos de Despacho</span>
                              <span className="font-mono">$3.990 CLP</span>
                            </div>
                            <div className="flex justify-between text-bananur-clay font-bold text-sm pt-2 border-t border-bananur-sand">
                              <span>Total Bruto</span>
                              <span className="font-mono">${(cart.reduce((s, it) => s + it.product.price * it.quantity, 0) + 3990).toLocaleString('es-CL')} CLP</span>
                            </div>
                          </div>

                        </div>

                      </div>
                    )}

                  </div>
                )}

                {/* 8. Página de Éxito Gracias */}
                {currentView === 'gracias' && (
                  <div className="max-w-2xl mx-auto px-4 py-16 animate-fade-in">
                    
                    {/* Receipts template */}
                    <div className="bg-white rounded-3xl border border-bananur-sand overflow-hidden shadow-sm">
                      
                      {/* Top banner success */}
                      <div className="bg-bananur-sand/50 p-8 sm:p-12 text-center border-b border-bananur-sand relative">
                        <div className="w-16 h-16 bg-[#40916C]/10 border border-[#40916C]/25 text-[#40916C] rounded-full flex items-center justify-center mx-auto mb-4 p-2 text-3xl font-extrabold">
                          ✔
                        </div>
                        <span className="text-[10px] font-mono uppercase text-[#B58455] font-bold">Transacción Autorizada</span>
                        <h1 className="text-3xl font-serif font-bold text-bananur-clay leading-snug">¡Muchas Gracias por tu Compra!</h1>
                        <p className="text-xs text-[#524742] leading-relaxed max-w-sm mx-auto font-light mt-1">
                          Tu pedido se ha integrado con Starken y se despachará en menos de 48 horas a tu domicilio.
                        </p>
                      </div>

                      {/* Receipt receipt logs */}
                      <div className="p-6 sm:p-10 space-y-6">
                        <div className="flex justify-between items-baseline border-b border-bananur-sand/50 pb-3">
                          <span className="text-xs font-mono uppercase tracking-widest text-[#524742]/50">Número de Pedido</span>
                          <span className="font-serif text-lg font-bold text-bananur-clay">
                            {orders[0] ? orders[0].id : '#PED-4024'}
                          </span>
                        </div>

                        {orders[0] && (
                          <div className="space-y-4">
                            <div className="text-xs text-bananur-clay space-y-1">
                              <div>• Cliente: <span className="font-bold">{orders[0].customerName}</span></div>
                              <div>• Coreo: <span className="font-mono">{orders[0].customerEmail}</span></div>
                              <div>• Destino: <span className="font-semibold">{orders[0].address}, {orders[0].commune}</span></div>
                              <div>• Documento fiscal: <span className="font-mono uppercase font-bold text-bananur-gold-dark">{orders[0].type}</span></div>
                            </div>

                            <div className="border-t border-bananur-sand pt-4">
                              <span className="text-[10px] font-mono text-bananur-clay-light/50 uppercase block mb-2">Desglose de Compra</span>
                              <div className="space-y-1.5 font-mono text-[11px] text-bananur-clay">
                                {orders[0].items.map((item, idx) => (
                                  <div key={idx} className="flex justify-between">
                                    <span>{item.productName} ({item.variant}) x{item.quantity}</span>
                                    <span>${(item.price * item.quantity).toLocaleString('es-CL')} CLP</span>
                                  </div>
                                ))}
                                <div className="border-t border-bananur-sand/50 pt-1.5 flex justify-between font-bold">
                                  <span>Total Abonado</span>
                                  <span>${orders[0].total.toLocaleString('es-CL')} CLP</span>
                                </div>
                              </div>
                            </div>
                          </div>
                        )}

                        <div className="pt-4 flex justify-center">
                          <button
                            id="success-btn-home"
                            onClick={() => navigateTo('home')}
                            className="bg-bananur-clay hover:bg-bananur-gold hover:text-bananur-clay text-bananur-cream py-3.5 px-8 rounded-xl font-bold text-xs transition-all cursor-pointer"
                          >
                            Volver al inicio de Bananur
                          </button>
                        </div>

                      </div>

                    </div>

                  </div>
                )}

                {/* 9. Login Client */}
                {currentView === 'login' && (
                  <div className="max-w-md mx-auto px-4 py-16 animate-fade-in">
                    <div className="bg-white p-8 rounded-3xl border border-bananur-sand space-y-6 shadow-xs">
                      <div className="text-center space-y-1">
                        <span className="text-[10px] font-mono uppercase text-[#B58455] font-bold">Bananur Miembros</span>
                        <h2 className="text-2xl font-serif font-bold text-bananur-clay">Iniciar Sesión</h2>
                        <p className="text-xs font-light text-bananur-clay-light/80">Ingresa tus datos para revisar pedidos y descargas.</p>
                      </div>

                      <form onSubmit={(e) => {
                        e.preventDefault();
                        setIsClientLoggedIn(true);
                        setLoggedInClientEmail(checkoutEmail || 'cliente@bananur.cl');
                        // Autofill checkout details from profile for convenience
                        setCheckoutName(profileName);
                        setCheckoutPhone(profilePhone);
                        setCheckoutAddress(profileAddress);
                        setCheckoutCommune(profileCommune);
                        setCheckoutCity(profileCity);
                        navigateTo('cuenta');
                      }} className="space-y-4">
                        <div>
                          <label className="block text-xs font-mono font-bold uppercase text-bananur-clay-light mb-1">Correo Electrónico</label>
                          <input
                            id="login-client-email"
                            type="email"
                            required
                            placeholder="cliente@correo.cl"
                            value={checkoutEmail}
                            onChange={(e) => setCheckoutEmail(e.target.value)}
                            className="w-full p-2.5 bg-bananur-cream/30 border border-bananur-sand rounded-xl text-xs focus:outline-none"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-mono font-bold uppercase text-bananur-clay-light mb-1">Contraseña</label>
                          <input
                            id="login-client-password"
                            type="password"
                            required
                            placeholder="••••••••"
                            className="w-full p-2.5 bg-bananur-cream/30 border border-bananur-sand rounded-xl text-xs focus:outline-none"
                          />
                        </div>

                        <button
                          id="login-client-btn"
                          type="submit"
                          className="w-full bg-[#2D2522] hover:bg-bananur-gold hover:text-black py-3 rounded-xl text-xs font-bold text-white transition-all cursor-pointer"
                        >
                          Acceder a mi Cuenta
                        </button>
                      </form>

                      <div className="text-center text-xs text-[#524742]/70 space-y-1 mt-4">
                        <p>¿No estás registrado? <button onClick={() => navigateTo('registro')} className="underline font-bold text-bananur-gold-dark">Crea una cuenta gratis</button></p>
                        <p><button onClick={() => alert('¡Simulador! Se ha enviado un enlace de recuperación de clave a tu email registrado.')} className="hover:underline text-[11px]">¿Olvidaste tu contraseña?</button></p>
                      </div>
                    </div>
                  </div>
                )}

                {/* 10. Registro Client */}
                {currentView === 'registro' && (
                  <div className="max-w-md mx-auto px-4 py-16 animate-fade-in">
                    <div className="bg-white p-8 rounded-3xl border border-bananur-sand space-y-6 shadow-xs">
                      <div className="text-center space-y-1">
                        <span className="text-[10px] font-mono uppercase text-[#B58455] font-bold font-bold">Formulario Digital</span>
                        <h2 className="text-2xl font-serif font-bold text-bananur-clay">Crear Cuenta</h2>
                        <p className="text-xs font-light text-[#524742]/80">Sé el primero en acceder a preventas de colecciones exclusivas.</p>
                      </div>

                      <form onSubmit={(e) => {
                        e.preventDefault();
                        setIsClientLoggedIn(true);
                        setLoggedInClientEmail(checkoutEmail || 'cliente@bananur.cl');
                        if (regName) {
                          setProfileName(regName);
                          setCheckoutName(regName);
                        }
                        // Default values for new members
                        setCheckoutPhone(profilePhone);
                        setCheckoutAddress(profileAddress);
                        setCheckoutCommune(profileCommune);
                        setCheckoutCity(profileCity);
                        navigateTo('cuenta');
                      }} className="space-y-4">
                        <div>
                          <label className="block text-xs font-mono font-bold uppercase text-bananur-clay-light mb-1">Nombre Completo</label>
                          <input
                            id="reg-client-name"
                            type="text"
                            required
                            placeholder="Ej. Constanza Silva"
                            value={regName}
                            onChange={(e) => setRegName(e.target.value)}
                            className="w-full p-2.5 bg-bananur-cream/30 border border-bananur-sand rounded-xl text-xs"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-mono font-bold uppercase text-bananur-clay-light mb-1">Correo Electrónico</label>
                          <input
                            id="reg-client-email"
                            type="email"
                            required
                            placeholder="ejemplo@correo.cl"
                            value={checkoutEmail}
                            onChange={(e) => setCheckoutEmail(e.target.value)}
                            className="w-full p-2.5 bg-bananur-cream/30 border border-bananur-sand rounded-xl text-xs"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-mono font-bold uppercase text-bananur-clay-light mb-1">Contraseña</label>
                          <input
                            id="reg-client-pwd"
                            type="password"
                            required
                            placeholder="••••••••"
                            className="w-full p-2.5 bg-bananur-cream/30 border border-bananur-sand rounded-xl text-xs"
                          />
                        </div>

                        {/* Checkbox */}
                        <label className="flex items-start gap-2 text-[11px] text-[#524742]/80 font-light pt-1 cursor-pointer">
                          <input type="checkbox" required className="accent-bananur-gold mt-0.5 rounded" />
                          <span>Acepto los términos de servicio, políticas de despacho nacional y de protección de datos de Bananur.</span>
                        </label>

                        <button
                          id="reg-client-btn"
                          type="submit"
                          className="w-full bg-[#2D2522] hover:bg-bananur-gold hover:text-black py-3 rounded-xl text-xs font-bold text-white transition-all cursor-pointer"
                        >
                          Registrarme Gratis
                        </button>
                      </form>

                      <p className="text-center text-xs text-[#524742]/70">¿Ya tienes cuenta? <button onClick={() => navigateTo('login')} className="underline font-bold text-bananur-gold-dark">Inicia sesión</button></p>
                    </div>
                  </div>
                )}

                {/* 11. Mi Cuenta Client (Tabulado) */}
                {currentView === 'cuenta' && (
                  <div className="max-w-4xl mx-auto px-4 py-12 animate-fade-in space-y-8">
                    
                    {/* Guard redirect block if logged out */}
                    {!isClientLoggedIn ? (
                      <div className="bg-white p-10 rounded-3xl border border-bananur-sand text-center space-y-5 max-w-sm mx-auto">
                        <div className="w-12 h-12 bg-amber-50 text-bananur-gold-dark rounded-full border border-bananur-gold flex items-center justify-center mx-auto text-xl font-bold">
                          ⚠️
                        </div>
                        <h3 className="font-serif text-lg font-bold text-bananur-clay">Sesión Requerida</h3>
                        <p className="text-xs text-[#524742] font-light leading-relaxed">
                          La sección Mi Cuenta está resguardada para usuarios autorizados con claves de acceso vigentes.
                        </p>
                        <button
                          id="guard-btn-login"
                          onClick={() => navigateTo('login')}
                          className="px-5 py-2.5 bg-[#2D2522] text-[#FAF8F5] font-bold text-xs rounded-xl hover:bg-bananur-gold hover:text-black cursor-pointer"
                        >
                          Ir a Iniciar Sesión
                        </button>
                      </div>
                    ) : (
                      /* Active account layout */
                      <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
                        {/* Sidebar tabs list */}
                        <div className="md:col-span-3 bg-white p-4 rounded-2xl border border-bananur-sand h-fit space-y-1">
                          <div className="p-3 text-center border-b border-bananur-sand mb-3">
                            <span className="w-10 h-10 rounded-full bg-bananur-sand font-mono font-bold text-[#524742] flex items-center justify-center mx-auto text-sm">
                              C
                            </span>
                            <span className="font-serif text-sm font-bold block text-bananur-clay mt-1 truncate max-w-[150px]" title={loggedInClientEmail}>
                              {loggedInClientEmail}
                            </span>
                          </div>
                          
                          <button
                            id="account-tab-btn-data"
                            onClick={() => setAccountActiveTab('personal')}
                            className={`w-full text-left p-2.5 rounded-lg text-xs transition-all cursor-pointer flex items-center gap-2 ${
                              accountActiveTab === 'personal'
                                ? 'bg-[#524742] text-white font-bold'
                                : 'text-bananur-clay-light hover:bg-bananur-sand/40'
                            }`}
                          >
                            <span>👤</span> Mis Datos Personales
                          </button>
                          
                          <button
                            id="account-tab-btn-orders"
                            onClick={() => setAccountActiveTab('orders')}
                            className={`w-full text-left p-2.5 rounded-lg text-xs transition-all cursor-pointer flex items-center justify-between ${
                              accountActiveTab === 'orders'
                                ? 'bg-[#524742] text-white font-bold'
                                : 'text-bananur-clay-light hover:bg-bananur-sand/40'
                            }`}
                          >
                            <span className="flex items-center gap-2"><span>📦</span> Mis Pedidos</span>
                            <span className="bg-bananur-yellow/30 text-[10px] font-bold px-1.5 py-0.5 rounded text-bananur-gold-dark font-mono">
                              {orders.filter(o => o.customerEmail === loggedInClientEmail).length}
                            </span>
                          </button>

                          <button
                            id="account-tab-btn-push"
                            onClick={() => {
                              setAccountActiveTab('push');
                              // Read native permission
                              if (typeof window !== 'undefined' && 'Notification' in window) {
                                setPushPermissionState(Notification.permission as any);
                              }
                            }}
                            className={`w-full text-left p-2.5 rounded-lg text-xs transition-all cursor-pointer flex items-center justify-between ${
                              accountActiveTab === 'push'
                                ? 'bg-[#524742] text-white font-bold'
                                : 'text-bananur-clay-light hover:bg-bananur-sand/40'
                            }`}
                          >
                            <span className="flex items-center gap-2"><span>🔔</span> Alertas Push</span>
                            <span className={`w-2 h-2 rounded-full ${pushEnabled ? 'bg-emerald-500 animate-pulse' : 'bg-gray-300'}`}></span>
                          </button>

                          <div className="border-t border-bananur-sand my-2 pt-2"></div>

                          <button
                            id="account-tab-btn-logout"
                            onClick={() => {
                              setIsClientLoggedIn(false);
                              setLoggedInClientEmail('');
                              navigateTo('login');
                            }}
                            className="w-full text-left p-2.5 rounded-lg text-xs text-bananur-coral font-bold hover:bg-rose-50 flex items-center gap-2 cursor-pointer transition-colors"
                          >
                            <span>🚪</span> Cerrar Sesión
                          </button>
                        </div>

                        {/* Content viewport area */}
                        <div className="md:col-span-9 bg-white p-6 sm:p-8 rounded-3xl border border-bananur-sand space-y-6">
                          
                          {/* VIEW 1: DATOS PERSONALES */}
                          {accountActiveTab === 'personal' && (
                            <div className="space-y-6 animate-fade-in text-left">
                              <h3 className="font-serif text-lg font-bold text-bananur-clay border-b border-bananur-sand/60 pb-3">
                                Información de Perfil de Autor
                              </h3>
                              
                              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs font-sans">
                                <div>
                                  <span className="text-[#524742]/50 block uppercase font-mono mb-1 text-[10px]">Tu Correo Registrado</span>
                                  <span className="font-mono font-semibold text-bananur-clay block bg-[#FAF8F5] p-2.5 rounded border border-bananur-sand/50">{loggedInClientEmail}</span>
                                </div>
                                <div>
                                  <span className="text-[#524742]/50 block uppercase font-mono mb-1 text-[10px]">Categoría Miembro</span>
                                  <span className="font-bold text-bananur-gold-dark block bg-bananur-yellow/15 p-2.5 rounded border border-bananur-gold/20">Socio VIP Colección 2026</span>
                                </div>
                              </div>

                              {/* Real-time validated Profile Edit form */}
                              <div className="border border-bananur-sand/80 rounded-2xl p-5 bg-[#FAF8F4]/50 space-y-4 shadow-xs">
                                <div>
                                  <h4 className="font-serif text-sm font-bold text-bananur-clay flex items-center gap-1.5">
                                    <span>✏️</span> Datos de Despacho & Contacto
                                  </h4>
                                  <p className="text-[10px] text-bananur-clay-light/80 font-light mt-0.5">
                                    Modifica tu información registrada. El formulario valida el formato en tiempo real y habilitará el botón de guardado únicamente cuando los datos sean coherentes.
                                  </p>
                                </div>

                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                                  {/* Input Nombre */}
                                  <div className="space-y-1">
                                    <label className="block text-[10px] uppercase font-mono font-bold text-bananur-clay-light">Nombre Completo *</label>
                                    <input
                                      type="text"
                                      id="profile-edit-name"
                                      value={editName}
                                      onChange={(e) => setEditName(e.target.value)}
                                      className={`w-full p-2.5 bg-white border rounded-xl text-xs focus:outline-none transition-all ${
                                        valNameError ? 'border-amber-400 focus:border-amber-500' : 'border-bananur-sand/80 focus:border-bananur-gold/60'
                                      }`}
                                      placeholder="Ej. Constanza Silva"
                                    />
                                    {valNameError ? (
                                      <span style={{ color: '#D97706' }} className="text-[10px] font-mono block">⚠️ {valNameError}</span>
                                    ) : (
                                      <span className="text-[10px] text-emerald-600 font-mono block">✓ Nombre válido</span>
                                    )}
                                  </div>

                                  {/* Input Teléfono */}
                                  <div className="space-y-1">
                                    <label className="block text-[10px] uppercase font-mono font-bold text-bananur-clay-light">Teléfono de Despacho *</label>
                                    <input
                                      type="text"
                                      id="profile-edit-phone"
                                      value={editPhone}
                                      onChange={(e) => setEditPhone(e.target.value)}
                                      className={`w-full p-2.5 bg-white border rounded-xl text-xs focus:outline-none transition-all ${
                                        valPhoneError ? 'border-amber-400 focus:border-amber-500' : 'border-bananur-sand/80 focus:border-bananur-gold/60'
                                      }`}
                                      placeholder="Ej. +56 9 8452 1192"
                                    />
                                    {valPhoneError ? (
                                      <span style={{ color: '#D97706' }} className="text-[10px] font-mono block">⚠️ {valPhoneError}</span>
                                    ) : (
                                      <span className="text-[10px] text-emerald-600 font-mono block">✓ Formato correcto</span>
                                    )}
                                  </div>

                                  {/* Input Dirección */}
                                  <div className="sm:col-span-2 space-y-1">
                                    <label className="block text-[10px] uppercase font-mono font-bold text-bananur-clay-light">Dirección (Calle y Número) *</label>
                                    <input
                                      type="text"
                                      id="profile-edit-address"
                                      value={editAddress}
                                      onChange={(e) => setEditAddress(e.target.value)}
                                      className={`w-full p-2.5 bg-white border rounded-xl text-xs focus:outline-none transition-all ${
                                        valAddressError ? 'border-amber-400 focus:border-amber-500' : 'border-bananur-sand/80 focus:border-bananur-gold/60'
                                      }`}
                                      placeholder="Ej. Av. Libertad 1045, Depto 502"
                                    />
                                    {valAddressError ? (
                                      <span style={{ color: '#D97706' }} className="text-[10px] font-mono block">⚠️ {valAddressError}</span>
                                    ) : (
                                      <span className="text-[10px] text-emerald-600 font-mono block">✓ Dirección descriptiva</span>
                                    )}
                                  </div>

                                  {/* Input Comuna */}
                                  <div className="space-y-1">
                                    <label className="block text-[10px] uppercase font-mono font-bold text-bananur-clay-light">Comuna *</label>
                                    <input
                                      type="text"
                                      id="profile-edit-commune"
                                      value={editCommune}
                                      onChange={(e) => setEditCommune(e.target.value)}
                                      className={`w-full p-2.5 bg-white border rounded-xl text-xs focus:outline-none transition-all ${
                                        valCommuneError ? 'border-amber-400 focus:border-amber-500' : 'border-bananur-sand/80 focus:border-bananur-gold/60'
                                      }`}
                                      placeholder="Ej. Viña del Mar"
                                    />
                                    {valCommuneError ? (
                                      <span style={{ color: '#D97706' }} className="text-[10px] font-mono block">⚠️ {valCommuneError}</span>
                                    ) : (
                                      <span className="text-[10px] text-emerald-600 font-mono block">✓ Comuna válida</span>
                                    )}
                                  </div>

                                  {/* Input Ciudad */}
                                  <div className="space-y-1">
                                    <label className="block text-[10px] uppercase font-mono font-bold text-bananur-clay-light">Ciudad *</label>
                                    <input
                                      type="text"
                                      id="profile-edit-city"
                                      value={editCity}
                                      onChange={(e) => setEditCity(e.target.value)}
                                      className={`w-full p-2.5 bg-white border rounded-xl text-xs focus:outline-none transition-all ${
                                        valCityError ? 'border-amber-400 focus:border-amber-500' : 'border-bananur-sand/80 focus:border-bananur-gold/60'
                                      }`}
                                      placeholder="Ej. Viña del Mar"
                                    />
                                    {valCityError ? (
                                      <span style={{ color: '#D97706' }} className="text-[10px] font-mono block">⚠️ {valCityError}</span>
                                    ) : (
                                      <span className="text-[10px] text-emerald-600 font-mono block">✓ Ciudad válida</span>
                                    )}
                                  </div>
                                </div>

                                {/* Action buttons */}
                                <div className="flex flex-col sm:flex-row justify-between items-center gap-3 pt-3 border-t border-bananur-sand/50">
                                  <p className="text-[11px] text-bananur-clay-light/85 italic font-light order-2 sm:order-1 text-center sm:text-left">
                                    {!isProfileFormValid ? (
                                      <span className="text-amber-655 font-semibold">⚠️ Por favor corrige los campos marcados</span>
                                    ) : (
                                      <span className="text-emerald-700 font-medium">✓ Todos los campos están correctos y listos</span>
                                    )}
                                  </p>
                                  <div className="flex gap-2 w-full sm:w-auto order-1 sm:order-2 justify-end">
                                    <button
                                      type="button"
                                      onClick={() => {
                                        setEditName(profileName);
                                        setEditPhone(profilePhone);
                                        setEditAddress(profileAddress);
                                        setEditCommune(profileCommune);
                                        setEditCity(profileCity);
                                        addToast('Edición Descartada', 'Se restauraron los datos vigentes.', 'info');
                                      }}
                                      className="flex-1 sm:flex-none px-4 py-2 text-xs font-bold text-bananur-clay bg-bananur-sand/30 hover:bg-bananur-sand/60 rounded-xl transition-all cursor-pointer"
                                    >
                                      Restablecer
                                    </button>
                                    <button
                                      type="button"
                                      disabled={!isProfileFormValid}
                                      onClick={() => {
                                        if (isProfileFormValid) {
                                          setProfileName(editName);
                                          setProfilePhone(editPhone);
                                          setProfileAddress(editAddress);
                                          setProfileCommune(editCommune);
                                          setProfileCity(editCity);
                                          
                                          // Auto-sync client shopping/checkout states
                                          setCheckoutName(editName);
                                          setCheckoutPhone(editPhone);
                                          setCheckoutAddress(editAddress);
                                          setCheckoutCommune(editCommune);
                                          setCheckoutCity(editCity);

                                          addToast('Datos Actualizados', 'Tus datos fueron guardados con éxito.', 'success');
                                        }
                                      }}
                                      className="flex-1 sm:flex-none px-5 py-2 text-xs font-bold text-white bg-[#2D2522] hover:bg-[#403531] rounded-xl disabled:opacity-40 disabled:cursor-not-allowed transition-all cursor-pointer"
                                    >
                                      Guardar Cambios
                                    </button>
                                  </div>
                                </div>
                              </div>
                            </div>
                          )}

                          {/* VIEW 2: MIS PEDIDOS */}
                          {accountActiveTab === 'orders' && (
                            <div className="space-y-6 animate-fade-in text-left">
                              <h3 className="font-serif text-lg font-bold text-bananur-clay border-b border-bananur-sand/60 pb-3">
                                Mis Pedidos & Estatus de Envío
                              </h3>
                              
                              <p className="text-xs text-bananur-clay-light/90 leading-relaxed font-light">
                                Aquí se listan las adquisiciones vigentes en fabricación artesanal. Al integrar las <strong>Notificaciones Web (Push API)</strong>, ante cualquier cambio de estado procesado en el gestor administrativo, un banner interactivo se disparará al instante en este dispositivo.
                              </p>

                              <div className="space-y-4">
                                {orders.filter(o => o.customerEmail === loggedInClientEmail).length === 0 ? (
                                  <div className="text-center py-10 bg-[#FAF8F5] border border-bananur-sand/40 rounded-2xl text-xs text-bananur-clay-light italic">
                                    No se registran compras todavía con tu cuenta {loggedInClientEmail}. No dudes en explorar la boutique textil.
                                  </div>
                                ) : (
                                  orders.filter(o => o.customerEmail === loggedInClientEmail).map((o) => (
                                    <div key={o.id} className="p-4 sm:p-5 bg-bananur-cream/20 border border-bananur-sand/70 rounded-2xl space-y-3 shadow-xs">
                                      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
                                        <div>
                                          <span className="font-mono font-bold text-[#2D2522] block text-sm">{o.id}</span>
                                          <span className="text-[10px] text-bananur-clay-light/80 font-mono">Generado el: {o.date}</span>
                                        </div>
                                        <div className="flex gap-2">
                                          <span className="text-[10px] font-mono text-[#524742]/70 bg-bananur-sand/40 px-2 py-0.5 rounded">
                                            Doc: {o.type}
                                          </span>
                                          <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                                            o.status === 'Entregado'
                                              ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                                              : o.status === 'Enviado'
                                                ? 'bg-blue-50 text-blue-800 border border-blue-200'
                                                : 'bg-amber-50 text-amber-800 border border-amber-200'
                                          }`}>
                                            ● {o.status}
                                          </span>
                                        </div>
                                      </div>

                                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 text-xs border-t border-bananur-sand/30">
                                        <div>
                                          <span className="block text-[10px] text-[#524742]/60 uppercase font-mono">Dirección Despacho:</span>
                                          <p className="font-medium text-bananur-clay text-[11px] leading-tight mt-0.5">{o.address}, {o.commune}, {o.city}</p>
                                        </div>
                                        <div className="sm:text-right">
                                          <span className="block text-[10px] text-[#524742]/60 uppercase font-mono">Total de la Compra:</span>
                                          <p className="font-bold text-bananur-gold-dark text-sm mt-0.5 font-mono">${o.total.toLocaleString('es-CL')} CLP</p>
                                        </div>
                                      </div>

                                      {/* Visualización de mapa estático de despacho */}
                                      <div className="pt-1">
                                        <DispatchMap
                                          address={o.address}
                                          commune={o.commune}
                                          city={o.city}
                                          orderId={o.id}
                                        />
                                      </div>

                                      <div className="bg-white p-3 rounded-xl border border-bananur-sand/40 flex flex-col sm:flex-row justify-between items-center gap-2 text-left">
                                        <p className="text-[10px] text-bananur-clay-light italic">
                                          📣 Prueba el servicio Push obligando una simulación de cambio de estado en este pedido:
                                        </p>
                                        <button
                                          type="button"
                                          onClick={() => {
                                            const nextStatus = o.status === 'En preparación' ? 'Enviado' : o.status === 'Enviado' ? 'Entregado' : 'En preparación';
                                            handleUpdateOrderStatus(o.id, nextStatus);
                                          }}
                                          className="text-[10px] font-bold bg-[#2D2522] hover:bg-[#B58455] text-white hover:text-black py-1.5 px-3 rounded-lg transition-all cursor-pointer whitespace-nowrap"
                                        >
                                          Simular Update ⚡
                                        </button>
                                      </div>
                                    </div>
                                  ))
                                )}
                              </div>
                            </div>
                          )}

                          {/* VIEW 3: NOTIFICACIONES WEB PUSH API */}
                          {accountActiveTab === 'push' && (
                            <div className="space-y-6 animate-fade-in text-left">
                              <h3 className="font-serif text-lg font-bold text-bananur-clay border-b border-bananur-sand/60 pb-3">
                                Servicio de Notificaciones Web (Push API)
                              </h3>
                              
                              <p className="text-xs text-bananur-clay-light/90 leading-relaxed font-light">
                                W3C Push API es una tecnología web nativa que permite enlazar de forma segura tu dispositivo de despacho. De este modo, recibirás avisos sonoros e interactivos al instante sobre transacciones y estado de despachos de tus pedidos creativos.
                              </p>

                              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                                
                                {/* Permisos y Configs (Col-7) */}
                                <div className="lg:col-span-7 border border-bananur-sand rounded-2xl p-5 bg-[#FAF8F5]/30 space-y-4">
                                  <div>
                                    <h4 className="font-serif text-sm font-bold text-bananur-clay">
                                      Canal de Alertas Push
                                    </h4>
                                    <p className="text-[10px] text-bananur-clay-light font-light mt-0.5">
                                      Conecta o desactiva las alertas del navegador para este dispositivo de despacho.
                                    </p>
                                  </div>

                                  <div className="space-y-2">
                                    <span className="text-[10px] font-mono text-[#524742]/60 uppercase block">Estado del Permiso:</span>
                                    <div className="flex items-center gap-2">
                                      {pushPermissionState === 'granted' && (
                                        <span className="bg-emerald-50 text-emerald-800 border border-emerald-200 text-xs font-bold px-3 py-1.5 rounded-xl flex items-center gap-1.5 shadow-3xs">
                                          <span className="w-2 h-2 rounded-full bg-emerald-600 animate-pulse"></span>
                                          Conectado (Granted)
                                        </span>
                                      )}
                                      {pushPermissionState === 'default' && (
                                        <span className="bg-amber-55 text-amber-800 border border-amber-200 text-xs font-bold px-3 py-1.5 rounded-xl flex items-center gap-1.5 shadow-3xs">
                                          🔔 Pendiente de registro
                                        </span>
                                      )}
                                      {pushPermissionState === 'denied' && (
                                        <span className="bg-rose-50 text-rose-800 border border-rose-200 text-xs font-bold px-3 py-1.5 rounded-xl flex items-center gap-1.5 shadow-3xs">
                                          🚫 Bloqueado por Usuario (Denied)
                                        </span>
                                      )}
                                      {pushPermissionState === 'unsupported' && (
                                        <span className="bg-gray-100 text-gray-800 border border-gray-200 text-xs font-bold px-3 py-1.5 rounded-xl flex items-center gap-1.5 shadow-3xs">
                                          ⚠️ Iframe / No Compatible
                                        </span>
                                      )}
                                    </div>
                                    <p className="text-[10px] text-bananur-clay-light italic leading-tight">
                                      * Las normas de la industria impiden que se muestre el permiso nativo si el navegador bloquea ventanas secundarias dentro de un iframe. En tal caso, nuestro despachador de sonido fallback garantiza la entrega visual.
                                    </p>
                                  </div>

                                  {/* Preference Switch */}
                                  <div className="flex items-center justify-between p-3.5 bg-white border border-bananur-sand/50 rounded-xl shadow-3xs">
                                    <div className="pr-2">
                                      <p className="text-xs font-bold text-bananur-clay">Recibir Notificaciones</p>
                                      <p className="text-[10px] text-bananur-clay-light">Reproducir acordes premium y recibir avisos visuales sobre cambios.</p>
                                    </div>
                                    <label className="relative inline-flex items-center cursor-pointer">
                                      <input
                                        type="checkbox"
                                        checked={pushEnabled}
                                        onChange={(e) => {
                                          setPushEnabled(e.target.checked);
                                          addToast(
                                            e.target.checked ? 'Notificaciones Operativas' : 'Notificaciones Silenciadas',
                                            e.target.checked ? 'Se reproducirá una campana cuando varíe el despacho.' : 'Se silenciaron las notificaciones.',
                                            'info'
                                          );
                                        }}
                                        className="sr-only peer"
                                      />
                                      <div className="w-9 h-5 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-[#524742]"></div>
                                    </label>
                                  </div>

                                  {/* Actions */}
                                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
                                    <button
                                      type="button"
                                      onClick={async () => {
                                        setIsRegisteringPush(true);
                                        const perm = await Notification.requestPermission();
                                        setPushPermissionState(perm as any);
                                        setIsRegisteringPush(false);
                                        if (perm === 'granted') {
                                          triggerWebNotification(
                                            '🔔 Suscripción Vinculada', 
                                            '¡Excelente! Las alertas web de nuestro laboratorio textil de autor han quedado resguardadas.'
                                          );
                                        } else {
                                          addToast('Permiso de Push', `Se actualizó el estado del permiso a: ${perm}`, 'info');
                                        }
                                      }}
                                      disabled={pushPermissionState === 'granted' || isRegisteringPush}
                                      className="py-2 px-3 bg-[#2D2522] hover:bg-[#403531] text-white disabled:opacity-50 disabled:cursor-not-allowed font-medium text-xs rounded-xl cursor-pointer block text-center transition-all"
                                    >
                                      {isRegisteringPush ? 'Registrando...' : pushPermissionState === 'granted' ? '✓ Canal Registrado' : 'Solicitar Autorización'}
                                    </button>

                                    <button
                                      type="button"
                                      onClick={() => {
                                        triggerWebNotification(
                                          '🔔 Notificación Web: Test Exitoso',
                                          'Bananur informa: Tu canal acústico y visual de sincronización funciona perfectamente.'
                                        );
                                        addToast('Aviso de Prueba Despachado', 'Se simuló el envío de una petición mediante la Push API.', 'success');
                                      }}
                                      className="py-2 px-3 bg-bananur-sand/30 hover:bg-bananur-sand/65 text-bananur-clay border border-bananur-sand font-bold text-xs rounded-xl cursor-pointer block text-center transition-all"
                                    >
                                      Simular Alerta de Test ⚡
                                    </button>
                                  </div>
                                </div>

                                {/* Historial Log (Col-5) */}
                                <div className="lg:col-span-5 border border-bananur-sand rounded-2xl p-5 bg-[#FAF8F5]/30 flex flex-col justify-between h-full space-y-4">
                                  <div className="space-y-3">
                                    <div>
                                      <h4 className="font-serif text-sm font-bold text-bananur-clay">
                                        Historial de Alertas (Logs)
                                      </h4>
                                      <p className="text-[10px] text-bananur-clay-light font-light mt-0.5">
                                        Registro detallado de notificaciones transmitidas por TLS.
                                      </p>
                                    </div>

                                    <div className="space-y-2 overflow-y-auto max-h-[220px] pr-1">
                                      {pushHistory.map((log) => (
                                        <div key={log.id} className="p-2.5 bg-white border border-bananur-sand/40 rounded-xl space-y-1 shadow-3xs">
                                          <div className="flex justify-between items-center text-[8px] font-mono text-[#524742]/50">
                                            <span>{log.id}</span>
                                            <span>{log.time}</span>
                                          </div>
                                          <p className="text-xs font-bold text-bananur-clay leading-tight">{log.title}</p>
                                          <p className="text-[10px] text-[#524742] font-light leading-normal">{log.body}</p>
                                        </div>
                                      ))}
                                    </div>
                                  </div>

                                  <div className="border-t border-bananur-sand/45 pt-3 flex justify-between items-center text-[9px] font-mono text-bananur-clay-light">
                                    <span>CONEXIÓN CENTRAL</span>
                                    <span className="text-emerald-700 font-bold flex items-center gap-1">
                                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-600"></span>
                                      SSL ACTIVO
                                    </span>
                                  </div>
                                </div>

                              </div>
                            </div>
                          )}

                        </div>
                      </div>
                    )}

                  </div>
                )}

                {/* 12. Nosotros View (Format editorial) */}
                {currentView === 'nosotros' && (
                  <div className="animate-fade-in space-y-20 pb-20">
                    
                    {/* Header profile */}
                    <div className="max-w-4xl mx-auto px-4 pt-16 text-center space-y-4">
                      <span className="text-xs font-mono uppercase text-[#B58455] font-bold">La Filosofía Detrás</span>
                      <h1 className="text-5xl font-serif font-black text-bananur-clay tracking-tight leading-none">Nuestra Historia</h1>
                      <div className="h-0.5 bg-bananur-gold w-24 mx-auto mt-4" />
                    </div>

                    {/* Editorial columns */}
                    <div className="max-w-4xl mx-auto px-4 grid grid-cols-1 md:grid-cols-2 gap-10 font-sans text-sm font-light text-bananur-clay-light/95 leading-relaxed">
                      <div className="space-y-4">
                        <p className="first-letter:font-serif first-letter:text-5xl first-letter:font-bold first-letter:text-bananur-gold-dark first-letter:float-left first-letter:mr-2">
                          Bananur nace en Viña del Mar en el año 2018 como una pequeña cooperativa de diseñadores e ilustradores motivados por devolver el rigor y la nobleza a los productos cotidianos de papelería e identidad corporativa.
                        </p>
                        <p>
                          {customization.aboutText}
                        </p>
                      </div>
                      <div className="space-y-4">
                        <p className="font-serif italic text-base text-bananur-clay leading-snug">
                          "Diseñamos objetos utilitarios y marcas de autor que no solo cumplen una labor funcional, sino que narran una historia de procedencia, material y técnica justa."
                        </p>
                        <p>
                          Actualmente operamos nuestra tienda principal y taller creativo en la ciudad de Viña del Mar, donde despachamos colecciones boutique hacia todas las regiones de Chile e impartimos consultorías de diseño UX e identidad visual corporativa.
                        </p>
                      </div>
                    </div>

                    {/* Team grid block */}
                    <div className="max-w-5xl mx-auto px-4 text-center space-y-10">
                      <h3 className="font-serif text-2xl font-bold text-bananur-clay">El Taller de Autor</h3>
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 text-center text-xs text-[#524742]">
                        <div className="space-y-2">
                          <span className="text-4xl">🌻</span>
                          <p className="font-serif font-bold text-bananur-clay text-sm">Constanza Silva</p>
                          <p className="text-[10px] text-bananur-gold-dark font-mono uppercase tracking-wider">Dirección de Diseño & Encuadernación</p>
                        </div>
                        <div className="space-y-2">
                          <span className="text-4xl">☕</span>
                          <p className="font-serif font-bold text-bananur-clay text-sm">Nicolás Fuentes</p>
                          <p className="text-[10px] text-bananur-gold-dark font-mono uppercase tracking-wider">Desarrollo Web & UX Integrado</p>
                        </div>
                        <div className="space-y-2">
                          <span className="text-4xl">🎨</span>
                          <p className="font-serif font-bold text-bananur-clay text-sm">Macarena Almonacid</p>
                          <p className="text-[10px] text-bananur-gold-dark font-mono uppercase tracking-wider">Ilustración & Serigrafía Manual</p>
                        </div>
                      </div>
                    </div>

                  </div>
                )}

                {/* 13. Contacto / FAQ View (Formulario + Acordeón de FAQ de mín. 6 preguntas descriptivas) */}
                {currentView === 'contacto' && (
                  <div className="max-w-6xl mx-auto px-4 py-16 animate-fade-in space-y-16">
                    <div className="text-center max-w-2xl mx-auto space-y-3">
                      <span className="text-xs font-mono uppercase text-[#B58455] font-bold">Puertas Abiertas</span>
                      <h1 className="text-4xl sm:text-5xl font-serif font-black text-bananur-clay text-center">Contacto & Preguntas Frecuentes</h1>
                      <p className="text-sm text-bananur-clay-light font-light leading-relaxed">
                        ¿Tienes dudas sobre los despachos de insumos, necesitas facturar una compra o evaluar un servicio técnico? Escríbenos directamente o consulta nuestro prontuario de ayuda.
                      </p>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
                      
                      {/* Left Column: Form */}
                      <div className="lg:col-span-5 bg-white p-6 sm:p-8 rounded-3xl border border-bananur-sand space-y-6 shrink-0 h-fit">
                        <h4 className="font-serif text-lg font-bold text-bananur-clay border-b border-bananur-sand pb-3">Formulario Directo</h4>
                        
                        <form onSubmit={(e) => {
                          e.preventDefault();
                          alert('¡Mensaje enviado en simulación! Contestaremos en breve.');
                        }} className="space-y-4">
                          <div>
                            <label className="block text-[10px] font-mono font-bold uppercase text-[#524742] mb-1">Tu Nombre</label>
                            <input type="text" required placeholder="Ej. Francisco Sepúlveda" className="w-full text-xs p-2.5 bg-bananur-cream/30 border border-bananur-sand rounded-xl" />
                          </div>
                          <div>
                            <label className="block text-[10px] font-mono font-bold uppercase text-[#524742] mb-1">Tu Correo</label>
                            <input type="email" required placeholder="Francisco@gmail.com" className="w-full text-xs p-2.5 bg-bananur-cream/30 border border-bananur-sand rounded-xl" />
                          </div>
                          <div>
                            <label className="block text-[10px] font-mono font-bold uppercase text-[#524742] mb-1">Tu Mensaje</label>
                            <textarea rows={4} required placeholder="¿En qué te podemos asesorar hoy...?" className="w-full text-xs p-2.5 bg-bananur-cream/30 border border-bananur-sand rounded-xl" />
                          </div>

                          <button type="submit" className="w-full bg-[#2D2522] hover:bg-bananur-gold hover:text-black py-3 rounded-xl font-bold text-xs text-white transition-all cursor-pointer">
                            Enviar Mensaje Directo
                          </button>
                        </form>
                      </div>

                      {/* Right Column: FAQ Accordion of 6 elements */}
                      <div className="lg:col-span-7 space-y-4">
                        <h4 className="font-serif text-xl font-bold text-bananur-clay flex items-center gap-2">
                          <BookOpen className="w-5 h-5 text-bananur-gold-dark" />
                          Preguntas Frecuentes (FAQ)
                        </h4>

                        <div className="space-y-2">
                          {MOCK_FAQ.map((faq) => {
                            const isExpanded = expandedFaq === faq.id;
                            return (
                              <div 
                                key={faq.id} 
                                className="bg-white border rounded-2xl border-bananur-sand overflow-hidden transition-all"
                              >
                                <button
                                  id={`faq-btn-trigger-${faq.id}`}
                                  type="button"
                                  onClick={() => setExpandedFaq(isExpanded ? null : faq.id)}
                                  className="w-full text-left p-4 pr-10 font-serif text-sm font-bold text-bananur-clay flex justify-between items-center bg-bananur-cream/20 hover:bg-bananur-sand/15 transition-colors relative cursor-pointer"
                                >
                                  <span>{faq.question}</span>
                                  <span className="font-mono text-bananur-gold-dark text-lg font-light shrink-0">
                                    {isExpanded ? '−' : '+'}
                                  </span>
                                </button>
                                
                                {isExpanded && (
                                  <div className="p-4 pt-1 border-t border-bananur-sand text-xs text-bananur-clay-light leading-relaxed font-light animate-fade-in bg-white select-text">
                                    {faq.answer}
                                  </div>
                                )}
                              </div>
                            );
                          })}
                        </div>
                      </div>

                    </div>
                  </div>
                )}

                {/* 15. Políticas de Privacidad View */}
                {currentView === 'privacidad' && (
                  <div className="max-w-4xl mx-auto px-4 py-16 animate-fade-in space-y-12">
                    <div className="space-y-4 text-center max-w-3xl mx-auto">
                      <div className="inline-flex items-center gap-2 px-3 py-1 bg-bananur-sand/30 border border-bananur-sand rounded-full text-[10px] font-mono uppercase tracking-widest text-[#516256] font-bold">
                        <ShieldCheck className="w-3.5 h-3.5 text-bananur-gold-dark" />
                        Privacidad Garantizada • Ley 19.628
                      </div>
                      <h1 className="text-4xl sm:text-5xl font-serif font-bold text-bananur-clay">
                        Políticas de Privacidad
                      </h1>
                      <p className="text-sm text-bananur-clay-light font-light leading-relaxed">
                        En Bananur (Papelería & Diseño SpA), valoramos profundamente la confianza que depositas en nosotros. Esta declaración describe cómo recopilamos, resguardamos y procesamos tus datos de carácter personal en nuestro portal de comercio electrónico, de acuerdo con la legislación vigente en la República de Chile.
                      </p>
                    </div>

                    <div className="bg-white rounded-3xl p-8 sm:p-12 border border-bananur-sand/70 space-y-8 shadow-sm">
                      <div className="flex justify-between items-center border-b border-bananur-sand pb-4 text-xs text-bananur-clay-light font-mono">
                        <span>Origen: Viña del Mar, Chile</span>
                        <span>Última actualización: Junio de 2026</span>
                      </div>

                      <div className="space-y-6 text-xs text-bananur-clay-light leading-relaxed font-light select-text">
                        <section className="space-y-2">
                          <h3 className="font-serif text-base font-bold text-bananur-clay flex items-center gap-2">
                            <span className="text-bananur-gold-dark font-mono text-xs">01.</span> Responsable del Tratamiento de Datos
                          </h3>
                          <p>
                            Bananur es operado comercial y técnicamente por <strong>Papelería, Diseño & Tecnología SpA</strong>, sociedad constituida en Chile con RUT provisional o legal debidamente registrado. Nuestro domicilio legal principal para notificaciones físicas y la coordinación del taller de distribución se encuentra ubicado en la comuna de <strong>Viña del Mar, Región de Valparaíso, Chile</strong>.
                          </p>
                          <p>
                            Para consultas, ejercicio de tus derechos o solicitudes relacionadas con esta política, puedes dirigirte a nuestro delegado de privacidad al correo electrónico <span className="font-semibold text-bananur-clay">privacidad@bananur.cl</span> o coordinar una atención en oficina técnica previa cita.
                          </p>
                        </section>

                        <section className="space-y-2">
                          <h3 className="font-serif text-base font-bold text-bananur-clay flex items-center gap-2">
                            <span className="text-bananur-gold-dark font-mono text-xs">02.</span> Marco Legal Aplicable (Ley Nº 19.628)
                          </h3>
                          <p>
                            Nuestras operaciones se rigen estrictamente por la <strong>Ley Nº 19.628 sobre Protección de la Vida Privada</strong> y las respectivas normativas del Servicio Nacional del Consumidor (SERNAC) asociadas a transacciones digitales. Nos comprometemos a que el tratamiento de tus datos personales se realice siempre de manera lícita, leal y transparente.
                          </p>
                        </section>

                        <section className="space-y-2">
                          <h3 className="font-serif text-base font-bold text-bananur-clay flex items-center gap-2">
                            <span className="text-bananur-gold-dark font-mono text-xs">03.</span> Datos que Recopilamos y Finalidad
                          </h3>
                          <p>
                            Únicamente recopilamos la información indispensable para brindarte nuestros servicios de diseño, tramitar las compras de insumos boutique, coordinar envíos de encomiendas o sincronizar cotizaciones progresivas mediante las siguientes vías:
                          </p>
                          <ul className="list-disc pl-5 space-y-1">
                            <li><strong>Formulario de Registro y Cuenta de Socio:</strong> Recopilamos nombre completo, dirección de despacho, comuna de residencia, correo electrónico y número de teléfono celular para la correcta emisión de boletas/facturas electrónicas y despacho de mercancías.</li>
                            <li><strong>Proceso de Cotización Progresivo:</strong> Almacenamos el RUT o los requerimientos de branding/paquetes digitales con el fin exclusivo de emitir presupuestos formalizados.</li>
                            <li><strong>Gestión de Transacciones de Pago (Webpay/Transbank):</strong> Todos los pagos con tarjetas chilenas se procesan de manera segura y encriptada por pasarelas externas que cumplen con certificación PCI-DSS. Bananur jamás almacena claves de tarjetas de débito o crédito.</li>
                          </ul>
                        </section>

                        <section className="space-y-2">
                          <h3 className="font-serif text-base font-bold text-bananur-clay flex items-center gap-2">
                            <span className="text-bananur-gold-dark font-mono text-xs">04.</span> Envío de Productos y Proveedores de Despacho
                          </h3>
                          <p>
                            Para llevar a cabo el despacho de tus piezas de impresión 3D, costura o crochet de autor, compartimos exclusivamente tus datos de contacto (Nombre, Comuna, Dirección, Teléfono) con proveedores logísticos acreditados en Chile, principalmente <strong>Starken</strong> y <strong>Chilexpress</strong>. Estos terceros están prohibidos por contrato de utilizar estos datos para fines publicitarios u otros distintos de la entrega encomendada.
                          </p>
                        </section>

                        <section className="space-y-2">
                          <h3 className="font-serif text-base font-bold text-bananur-clay flex items-center gap-2">
                            <span className="text-bananur-gold-dark font-mono text-xs">05.</span> Tus Derechos ARCO de Acceso e Información
                          </h3>
                          <p>
                            De acuerdo con la legislación de protección de datos en Chile, tienes derecho a solicitar en cualquier momento la confirmación del tratamiento de tus datos, el acceso a los mismos, la rectificación de antecedentes obsoletos o erróneos, y la eliminación de tus registros de socio cuando ya no exista obligación legal de conservarlos.
                          </p>
                          <p>
                            Para ejercer cualquiera de estas facultades de forma directa y expedita, basta con redactar una breve solicitud dirigida a <span className="font-semibold text-bananur-clay">contacto@bananur.cl</span> adjuntando una copia legible de tu cédula de identidad por ambos lados para verificar que eres el titular del perfil.
                          </p>
                        </section>

                        <section className="space-y-2 font-mono text-[10px] bg-bananur-sage-light p-4 rounded-2xl border border-bananur-sand text-bananur-clay-light max-w-full">
                          <p className="font-bold text-bananur-clay uppercase mb-1">🔍 Resolución de Disputas & Jurisdicción</p>
                          Cualquier controversia derivada de la interpretación o ejecución de la presente política de privacidad será sometida a la competencia de los tribunales ordinarios de justicia pertenecientes a la jurisdicción de <strong>Viña del Mar, Quinta Región, Chile</strong>.
                        </section>
                      </div>
                    </div>

                    <div className="flex justify-center">
                      <button
                        onClick={() => navigateTo('home')}
                        className="px-8 py-3 bg-bananur-clay text-bananur-cream rounded-full text-xs font-bold uppercase tracking-widest hover:bg-bananur-sage hover:text-white transition-all shadow-sm cursor-pointer"
                      >
                        Volver al Taller
                      </button>
                    </div>
                  </div>
                )}

                {/* 16. Términos de Servicio View */}
                {currentView === 'terminos' && (
                  <div className="max-w-4xl mx-auto px-4 py-16 animate-fade-in space-y-12">
                    <div className="space-y-4 text-center max-w-3xl mx-auto">
                      <div className="inline-flex items-center gap-2 px-3 py-1 bg-bananur-sand/30 border border-bananur-sand rounded-full text-[10px] font-mono uppercase tracking-widest text-[#516256] font-bold">
                        <Scale className="w-3.5 h-3.5 text-bananur-gold-dark" />
                        Garantía Legal Chilena • SERNAC
                      </div>
                      <h1 className="text-4xl sm:text-5xl font-serif font-bold text-bananur-clay">
                        Términos de Servicio
                      </h1>
                      <p className="text-sm text-bananur-clay-light font-light leading-relaxed">
                        Este contrato regula el uso de los servicios del estudio creativo Bananur y la adquisición de objetos artísticos en nuestra tienda web. Al navegar o registrar una compra, declaras aceptar estos términos bajo las normativas vigentes en Chile.
                      </p>
                    </div>

                    <div className="bg-white rounded-3xl p-8 sm:p-12 border border-bananur-sand/70 space-y-8 shadow-sm">
                      <div className="flex justify-between items-center border-b border-bananur-sand pb-4 text-xs text-bananur-clay-light font-mono">
                        <span>Sede Social: Viña del Mar, Chile</span>
                        <span>Última revisión: Junio de 2026</span>
                      </div>

                      <div className="space-y-6 text-xs text-bananur-clay-light leading-relaxed font-light select-text">
                        
                        <section className="space-y-2">
                          <h3 className="font-serif text-base font-bold text-bananur-clay flex items-center gap-2">
                            <span className="text-bananur-gold-dark font-mono text-xs">01.</span> Ámbito y Aceptación de las Partes
                          </h3>
                          <p>
                            Los términos comerciales aquí estipulados regulan en forma exclusiva todas las ofertas, transacciones de venta de piezas de impresión 3D, costura, crochet y accesorios de autor, reserva de bloques de consultoría, y desarrollo creativo web contratados en esta applet de <strong>Bananur</strong>. Nuestra oficina técnica de operaciones y logística ejerce labores en la comuna de <strong>Viña del Mar, Región de Valparaíso, Chile</strong>.
                          </p>
                        </section>

                        <section className="space-y-2">
                          <h3 className="font-serif text-base font-bold text-bananur-clay flex items-center gap-2">
                            <span className="text-bananur-gold-dark font-mono text-xs">02.</span> Precios, Moneda y Transacciones Seguras
                          </h3>
                          <p>
                            Todos los precios publicados en este catálogo son expresados en <strong>Pesos Chilenos (CLP)</strong> y ya incluyen el Impuesto al Valor Agregado (I.V.A.) chileno equivalente al 19%, a menos que expresamente se indique lo contrario. Bananur emitirá de forma automatizada e integrada la correspondiente Boleta de Ventas y Servicios Electrónica o Factura comercial timbrada bajo las directrices fiscales del <strong>SII (Servicio de Impuestos Internos) de Chile</strong>.
                          </p>
                        </section>

                        <section className="space-y-2">
                          <h3 className="font-serif text-base font-bold text-bananur-clay flex items-center gap-2">
                            <span className="text-bananur-gold-dark font-mono text-xs">03.</span> Envíos, Despachos y Seguro de Daños
                          </h3>
                          <p>
                            Los despachos de piezas tridimensionales, textil y ganchillo se originan directamente desde nuestra tienda boutique principal y taller creativo ubicado en la ciudad de <strong>Viña del Mar, Región de Valparaíso</strong>, y se dirigen a todas las comunas continentales de Chile. 
                          </p>
                          <ul className="list-disc pl-5 space-y-1">
                            <li><strong>Plazos de entrega:</strong> Los envíos dentro de Viña del Mar y la Región de Valparaíso demoran entre 24 y 48 horas hábiles, y hacia la Región Metropolitana y demás regiones de Chile fluctúan entre 48 y 72 horas hábiles tras la verificación del pago.</li>
                            <li><strong>Courier Responsable:</strong> Trabajamos en convenio con Starken (con retiros en agencia o entregas directas a domicilio).</li>
                            <li><strong>Pérdida o Daños:</strong> Al tratarse de productos exclusivos elaborados de forma artesanal o mediante impresión tridimensional, garantizamos que toda encomienda viaja resguardada con empaques ecológicos de alta seguridad. Si un objeto llegara quebrado o dañado, el comprador tendrá un límite de 48 horas desde su recepción para contactarnos y exigir el reenvío inmediato sin costos anexos.</li>
                          </ul>
                        </section>

                        <section className="space-y-2">
                          <h3 className="font-serif text-base font-bold text-bananur-clay flex items-center gap-2">
                            <span className="text-bananur-gold-dark font-mono text-xs">04.</span> Derecho a Retracto y Garantía de Consumo
                          </h3>
                          <p>
                            En concordancia con el artículo 3 bis literal b de la <strong>Ley de Protección al Consumidor Nº 19.496 chilena</strong>, y debido a la naturaleza exclusiva, de stock limitado o confeccionada bajo demanda (made-to-order) de nuestros productos de diseño y servicios personalizados, <strong>Bananur excluye expresamente la facultad de retracto discrecional</strong> para compras online.
                          </p>
                          <p>
                            No obstante lo anterior, asiste plenamente al comprador la <strong>Garantía de Satisfacción Técnica o Legal de 6 meses</strong> reglamentada por SERNAC. Si un producto presentara desperfectos de fabricación o fallas estructurales de costura, el cliente podrá optar entre la reparación gratuita, la reposición por un objeto idéntico o la devolución del dinero abonado, contactando a soporte con su boleta.
                          </p>
                        </section>

                        <section className="space-y-2">
                          <h3 className="font-serif text-base font-bold text-bananur-clay flex items-center gap-2">
                            <span className="text-bananur-gold-dark font-mono text-xs">05.</span> Propiedad Intelectual e Industrial
                          </h3>
                          <p>
                            Las marcas registradas, logotipos, bocetos conceptuales, tipografías creadas a medida y el código de esta herramienta son propiedad industrial reservada de <strong>Bananur Estudio Creativo</strong>. Está prohibida la reproducción parcial, comercialización o copia de nuestros diseños sin previa licencia contractual firmada ante notaría pública chilena.
                          </p>
                        </section>

                        <section className="space-y-2 font-mono text-[10px] bg-bananur-sage-light p-4 rounded-2xl border border-bananur-sand text-bananur-clay-light max-w-full">
                          <p className="font-bold text-[#1B2A1E] uppercase mb-1">⚖️ Domicilio Legal y Tribunales Competentes</p>
                          Para todos los efectos legales emergentes del uso de este sitio web o de la compraventa formalizada por medios electrónicos de telecomunicación, las partes se fijan domicilio especial en la ciudad y comuna de <strong>Viña del Mar, Quinta Región, República de Chile</strong>, sometiéndose a la competencia exclusiva de sus tribunales ordinarios de justicia.
                        </section>

                      </div>
                    </div>

                    <div className="flex justify-center">
                      <button
                        onClick={() => navigateTo('home')}
                        className="px-8 py-3 bg-bananur-clay text-bananur-cream rounded-full text-xs font-bold uppercase tracking-widest hover:bg-bananur-sage hover:text-white transition-all shadow-sm cursor-pointer"
                      >
                        Entendido, Volver al Taller
                      </button>
                    </div>
                  </div>
                )}

                {/* Custom Page Routing Engine */}
                {customization.customPages.some(page => page.id === currentView && page.enabled) && (
                  <div className="max-w-4xl mx-auto px-4 py-16 animate-fade-in space-y-10">
                    {(() => {
                      const activePage = customization.customPages.find(page => page.id === currentView);
                      if (!activePage) return null;
                      return (
                        <div className="space-y-6 text-left">
                          <button
                            onClick={() => navigateTo('home')}
                            className="text-xs font-mono text-bananur-clay-light hover:underline flex items-center gap-1 cursor-pointer"
                          >
                            ← Volver a la Portada
                          </button>
                          
                          <div className="bg-white rounded-3xl p-8 sm:p-12 border border-bananur-sand/70 space-y-8 shadow-3xs">
                            <h1 className="text-3xl sm:text-4xl font-serif font-bold text-bananur-clay border-b border-bananur-sand/60 pb-5">
                              {activePage.title}
                            </h1>
                            
                            <div className="text-sm text-bananur-clay-light/95 leading-relaxed font-light space-y-4 select-text">
                              {activePage.contentMarkdown.split('\n').map((line, idx) => {
                                if (line.startsWith('# ')) {
                                  return null; // Skip redundant top title
                                } else if (line.startsWith('### ')) {
                                  return <h4 key={idx} className="font-bold text-bananur-clay pt-3 text-base">{line.replace('### ', '')}</h4>;
                                } else if (line.startsWith('- ')) {
                                  return <li key={idx} className="ml-4 list-disc pl-1">{line.replace('- ', '')}</li>;
                                } else if (line.trim() === '') {
                                  return <div key={idx} className="h-2" />;
                                } else {
                                  return <p key={idx}>{line}</p>;
                                }
                              })}
                            </div>
                          </div>
                        </div>
                      );
                    })()}
                  </div>
                )}

                {/* 14. Página 404 */}
                {currentView === '404' && (
                  <div className="max-w-md mx-auto py-20 px-4 text-center space-y-6 animate-fade-in">
                    <div className="text-6xl animate-bounce">🍌</div>
                    <div className="space-y-2">
                      <span className="text-[10px] font-mono uppercase text-bananur-coral font-bold bg-rose-50 px-2 py-0.5 rounded">Código de Error: RUTA_404</span>
                      <h1 className="text-4xl font-serif font-extrabold text-[#2F2522]">Esta página tomó otro rumbo</h1>
                      <p className="text-xs text-[#524742]/85 leading-relaxed font-light">
                        El plátano boutique no se encuentra aquí. La dirección que ingresaste puede estar obsoleta o haber cambiado de lugar en la tienda de Viña del Mar.
                      </p>
                    </div>
                    <button
                      id="404-btn-home"
                      onClick={() => navigateTo('home')}
                      className="px-6 py-3 bg-bananur-clay text-bananur-cream rounded-full text-xs font-bold hover:bg-bananur-gold hover:text-bananur-clay cursor-pointer"
                    >
                      Volver al Inicio Sano
                    </button>
                  </div>
                )}

              </>
            ) : (
              /* ------------------------- SECURE ADMINISTRATOR PANEL (6 pantallas) ------------------------- */
              <div className="flex bg-[#FAF8F5] min-h-screen">
                
                {/* 14. Admin Login Portal */}
                {(currentAdminView === 'admin-login' || !isAdminLoggedIn) ? (
                  <div className="max-w-md mx-auto px-4 py-32 animate-fade-in w-full">
                    <div className="bg-white p-8 rounded-3xl border border-bananur-sand space-y-6 shadow-sm">
                      <div className="text-center space-y-1">
                        <span className="text-[10px] font-mono uppercase text-bananur-gold-dark font-extrabold tracking-widest bg-bananur-sand px-2 py-0.5 rounded">PORTAL DE ACCESO</span>
                        <h2 className="text-2xl font-serif font-bold text-bananur-clay">Administrador Bananur</h2>
                        <p className="text-xs font-light text-[#524742]/80">Accede al panel central de inventario y sincronizaciones SII.</p>
                      </div>

                      <div className="space-y-4">
                        {adminLoginError && (
                          <p role="alert" className="text-xs text-rose-700 bg-rose-50 border border-rose-200 rounded-xl p-3">{adminLoginError}</p>
                        )}
                        <button
                          id="admin-login-btn-google"
                          type="button"
                          onClick={handleAdminGoogleLogin}
                          disabled={adminSigningIn || !adminAuthReady}
                          className="w-full bg-[#2D2522] hover:bg-bananur-gold text-white hover:text-black py-3 rounded-xl text-xs font-bold transition-all cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
                        >
                          {adminSigningIn ? 'Verificando…' : 'Ingresar con Google'}
                        </button>
                        <p className="text-[11px] text-center text-[#524742]/70">Solo cuentas autorizadas de administración.</p>
                      </div>

                      <div className="text-center">
                        <button onClick={() => setIsAdminMode(false)} className="text-xs text-[#524742] hover:underline">Volver a página pública</button>
                      </div>
                    </div>
                  </div>
                ) : (
                  /* Admin views with persistent left sidebar */
                  <>
                    <AdminSidebar
                      currentAdminView={currentAdminView}
                      onNavigateAdmin={(tab) => {
                        if (tab === 'produccion') {
                          setLocalProduccionTab('plm');
                        } else if (tab === 'insumos') {
                          setLocalProduccionTab('mrp');
                        }
                        setCurrentAdminView(tab);
                      }}
                      onExitAdmin={handleAdminLogout}
                      adminEmail={adminEmail}
                    />

                    {/* Admin central viewports router (5 screens) */}
                    <div className="flex-1 overflow-x-hidden">
                      
                      {/* Admin Tab 1: Dashboard Analytics & Integrated ERP Module */}
                      {(currentAdminView === 'dashboard' || currentAdminView.startsWith('erp-')) && (
                        <AdminDashboard
                          orders={orders}
                          products={products}
                          consultations={consultations}
                          onNavigateToTab={(tab) => setCurrentAdminView(tab)}
                          activeModule={currentAdminView === 'dashboard' ? 'analytics' : (currentAdminView.replace('erp-', '') as any)}
                          onModuleChange={(mod) => setCurrentAdminView(mod === 'analytics' ? 'dashboard' : `erp-${mod}`)}
                          onUpdateOrderStatus={handleUpdateOrderStatus}
                          onShowToast={addToast}
                          clientCategories={clientCategories}
                          supplierCategories={supplierCategories}
                        />
                      )}

                      {/* Admin Tab: Insumos (MRP Insumos) */}
                      {currentAdminView === 'insumos' && (
                        <AdminERP
                          orders={orders}
                          onUpdateOrderStatus={handleUpdateOrderStatus}
                          onShowToast={addToast}
                          activeTab="mrp"
                          onTabChange={() => {}}
                          isEmbedded={false}
                          clientCategories={clientCategories}
                          supplierCategories={supplierCategories}
                          productionStages={productionStages}
                          responsables={responsables}
                          materials={materials}
                          onUpdateMaterials={setMaterials}
                          supplyRequests={supplyRequests}
                          onAddSupplyRequest={handleAddSupplyRequest}
                          clothingLots={clothingLots}
                          onUpdateClothingLots={setClothingLots}
                          workstations={workstations}
                          onUpdateWorkstations={handleUpdateWorkstations}
                          onOpenWorkstationsConfig={() => {
                            setCurrentAdminView('configuracion');
                            setConfigActiveTab('estaciones');
                          }}
                        />
                      )}

                      {/* Admin Tab: Producción (Estaciones & Manufactura PLM) */}
                      {currentAdminView === 'produccion' && (
                        <AdminERP
                          orders={orders}
                          onUpdateOrderStatus={handleUpdateOrderStatus}
                          onShowToast={addToast}
                          activeTab="plm"
                          onTabChange={() => {}}
                          isEmbedded={false}
                          clientCategories={clientCategories}
                          supplierCategories={supplierCategories}
                          productionStages={productionStages}
                          responsables={responsables}
                          materials={materials}
                          onUpdateMaterials={setMaterials}
                          supplyRequests={supplyRequests}
                          onAddSupplyRequest={handleAddSupplyRequest}
                          clothingLots={clothingLots}
                          onUpdateClothingLots={setClothingLots}
                          workstations={workstations}
                          onUpdateWorkstations={handleUpdateWorkstations}
                          onOpenWorkstationsConfig={() => {
                            setCurrentAdminView('configuracion');
                            setConfigActiveTab('estaciones');
                          }}
                        />
                      )}

                      {/* Admin Tab: Clientes y Proveedores (CRM Clientes & Proveedores Logística) */}
                      {currentAdminView === 'clientes_proveedores' && (
                        <AdminERP
                          orders={orders}
                          onUpdateOrderStatus={handleUpdateOrderStatus}
                          onShowToast={addToast}
                          activeTab={localClientesProveedoresTab}
                          onTabChange={(tab) => setLocalClientesProveedoresTab(tab as any)}
                          isEmbedded={false}
                          clientCategories={clientCategories}
                          supplierCategories={supplierCategories}
                          productionStages={productionStages}
                          responsables={responsables}
                          materials={materials}
                          onUpdateMaterials={setMaterials}
                          supplyRequests={supplyRequests}
                          onAddSupplyRequest={handleAddSupplyRequest}
                          clothingLots={clothingLots}
                          onUpdateClothingLots={setClothingLots}
                          workstations={workstations}
                          onUpdateWorkstations={handleUpdateWorkstations}
                          onOpenWorkstationsConfig={() => {
                            setCurrentAdminView('configuracion');
                            setConfigActiveTab('estaciones');
                          }}
                        />
                      )}

                      {/* Admin Tab 2: Gestor de Inventario & Contenido */}
                      {currentAdminView === 'inventario' && (
                       <AdminInventory
                          products={products}
                          services={services}
                          portfolioItems={portfolioItems}
                          onAddProduct={handleAddProduct}
                          onEditProduct={handleEditProduct}
                          onDeleteProduct={handleDeleteProduct}
                          onToggleProductActive={handleToggleProductActive}
                          onDuplicateProduct={handleDuplicateProduct}
                          onAddService={handleAddService}
                          onEditService={handleEditService}
                          onAddPortfolioItem={handleAddPortfolioItem}
                          onEditPortfolioItem={handleEditPortfolioItem}
                          onDeleteService={handleDeleteService}
                          onDeletePortfolioItem={handleDeletePortfolioItem}
                          productCategories={productCategories}
                          serviceCategories={serviceCategories}
                          portfolioCategories={portfolioCategories}
                          clothingLots={clothingLots}
                          onUpdateClothingLots={setClothingLots}
                        />
                      )}

                      {/* Admin Tab 3.5: Compras y Abastecimiento */}
                      {currentAdminView === 'compras' && (
                        <AdminPurchases
                          onShowToast={addToast}
                          materials={materials}
                          onUpdateMaterialStock={(materialId, qty) => {
                            setMaterials(prev => prev.map(m => m.id === materialId ? { ...m, stock: m.stock + qty } : m));
                          }}
                          supplyRequests={supplyRequests}
                          onUpdateSupplyRequests={setSupplyRequests}
                          onApproveSupplyRequest={(reqId) => {
                            setSupplyRequests(prev => prev.map(r => r.id === reqId ? { ...r, status: 'Aprobado' } : r));
                          }}
                          onRejectSupplyRequest={(reqId) => {
                            setSupplyRequests(prev => prev.map(r => r.id === reqId ? { ...r, status: 'Rechazado' } : r));
                          }}
                        />
                      )}

                      {/* Admin Tab 3.7: Ventas y Cotizaciones Corporativas */}
                      {currentAdminView === 'ventas' && (
                        <AdminSales
                          orders={orders}
                          onAddOrder={(newOrder) => setOrders([newOrder, ...orders])}
                          products={products}
                          services={services}
                          portfolioItems={portfolioItems}
                          onUpdateOrderStatus={handleUpdateOrderStatus}
                          onShowToast={addToast}
                        />
                      )}

                      {/* Admin Tab 4: Agenda de Consultorías Calendario June 26 */}
                      {currentAdminView === 'agenda' && (
                        <AdminAgenda
                          consultations={consultations}
                          onToggleTimeSlot={handleToggleTimeSlot}
                          onAddConsultation={(cons) => setConsultations([cons, ...consultations])}
                          onAddOrder={(newOrd) => setOrders([newOrd, ...orders])}
                          onShowToast={addToast}
                          responsables={responsables}
                          products={products}
                          orders={orders}
                        />
                      )}

                      {/* Admin Tab 4.5: Personalizar Entorno Cliente */}
                      {currentAdminView === 'personalizador' && (
                        <AdminPersonalizador
                          customization={customization}
                          onUpdateCustomization={setCustomization}
                          onShowToast={addToast}
                        />
                      )}

                      {/* Admin Tab: Correo Corporativo (Dominio Propio & Plantillas) */}
                      {currentAdminView === 'correo' && (
                        <AdminEmailManager 
                          onShowToast={addToast}
                          onNavigateToSettings={() => {
                            setCurrentAdminView('configuracion');
                            setConfigActiveTab('correo_servidor');
                          }}
                        />
                      )}

                      {/* Admin Tab 5: Configuración de Empresa */}
                      {currentAdminView === 'configuracion' && (
                        <div className="p-6 sm:p-10 space-y-8 animate-fade-in bg-[#FAF8F5] min-h-screen max-w-5xl">
                          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-bananur-sand/40 pb-5">
                            <div>
                              <span className="text-xs font-mono uppercase tracking-widest text-[#B58455] font-bold">Panel de Administración</span>
                              <h1 className="text-3xl font-serif font-extrabold text-bananur-clay">Centro de Configuración</h1>
                              <p className="text-xs text-bananur-clay-light font-light">Gestiona parámetros del taller, estaciones de manufactura, categorías y tributación.</p>
                            </div>

                            {/* Config Tabs Switcher */}
                            <div className="flex flex-wrap gap-2 bg-white p-1.5 rounded-2xl border border-bananur-sand shadow-3xs">
                              <button
                                type="button"
                                onClick={() => setConfigActiveTab('general')}
                                className={`px-4 py-2 rounded-xl text-xs font-mono font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                                  configActiveTab === 'general'
                                    ? 'bg-bananur-clay text-white shadow-xs'
                                    : 'text-bananur-clay hover:bg-bananur-sand/30'
                                }`}
                              >
                                <Settings className="w-3.5 h-3.5" />
                                <span>Ajustes Generales</span>
                              </button>
                              <button
                                type="button"
                                onClick={() => setConfigActiveTab('estaciones')}
                                className={`px-4 py-2 rounded-xl text-xs font-mono font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                                  configActiveTab === 'estaciones'
                                    ? 'bg-[#B58455] text-white shadow-xs'
                                    : 'text-[#B58455] hover:bg-[#B58455]/10'
                                }`}
                              >
                                <Wrench className="w-3.5 h-3.5" />
                                <span>Estaciones de Trabajo ({workstations.filter(w => w.isActive).length} Activas)</span>
                              </button>
                              <button
                                type="button"
                                onClick={() => setConfigActiveTab('correo_servidor')}
                                className={`px-4 py-2 rounded-xl text-xs font-mono font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                                  configActiveTab === 'correo_servidor'
                                    ? 'bg-bananur-clay text-white shadow-xs'
                                    : 'text-bananur-clay hover:bg-bananur-sand/30'
                                }`}
                              >
                                <Mail className="w-3.5 h-3.5" />
                                <span>Servidor Correo & DNS</span>
                              </button>
                            </div>
                          </div>

                          {/* SUBTAB 3: CONFIGURACIÓN SERVIDOR CORREO & DNS */}
                          {configActiveTab === 'correo_servidor' && (
                            <AdminEmailServerConfig onShowToast={addToast} />
                          )}

                          {/* SUBTAB 2: CONFIGURACIÓN CENTRALIZADA DE ESTACIONES DE TRABAJO */}
                          {configActiveTab === 'estaciones' && (
                            <AdminWorkstationsConfig
                              workstations={workstations}
                              onUpdateWorkstations={handleUpdateWorkstations}
                              onShowToast={addToast}
                              onNavigateToProduction={() => {
                                setCurrentAdminView('produccion');
                              }}
                            />
                          )}

                          {/* SUBTAB 1: AJUSTES GENERALES & CATEGORÍAS */}
                          {configActiveTab === 'general' && (
                            <div className="space-y-8 animate-fade-in">
                              {/* Gestor de Categorías Integrado */}
                          <div className="bg-white p-6 sm:p-8 rounded-3xl shadow-xs space-y-6">
                            <div className="border-b border-bananur-sand/35 pb-3">
                              <h3 className="font-serif text-lg font-bold text-bananur-clay">Gestor de Categorías</h3>
                              <p className="text-xs text-bananur-clay-light font-light">Añade, edita o elimina categorías para tus Productos, Servicios, Portafolio Digital, Clientes y Proveedores de forma diferenciada.</p>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                              
                              {/* 1. Categorías de Productos */}
                              <div className="space-y-4 bg-[#FAF8F5]/85 p-5 rounded-2xl">
                                <h4 className="text-xs font-mono font-bold text-[#B58455] uppercase tracking-wider flex items-center gap-1.5 pb-2 border-b border-bananur-sand/40">
                                  📦 Productos Físicos
                                </h4>
                                
                                {/* Form Add */}
                                <div className="flex gap-2">
                                  <input
                                    type="text"
                                    value={newProductCategoryInput}
                                    onChange={(e) => setNewProductCategoryInput(e.target.value)}
                                    placeholder="Nueva cat..."
                                    className="flex-1 p-2 bg-white text-xs text-bananur-clay rounded-lg border-none focus:ring-1 focus:ring-bananur-gold shadow-xs"
                                  />
                                  <button
                                    type="button"
                                    onClick={() => {
                                      handleAddProductCategory(newProductCategoryInput);
                                      setNewProductCategoryInput('');
                                    }}
                                    className="px-3 bg-bananur-clay hover:bg-bananur-gold text-white hover:text-black rounded-lg text-xs font-bold font-mono transition-colors cursor-pointer"
                                  >
                                    +
                                  </button>
                                </div>

                                {/* List */}
                                <div className="space-y-2 max-h-[160px] overflow-y-auto scrollbar-hidden">
                                  {productCategories.map((cat, i) => (
                                    <div key={cat + i} className="flex justify-between items-center text-xs p-2 bg-white rounded-lg shadow-xs">
                                      {editingCatIndex?.type === 'product' && editingCatIndex?.index === i ? (
                                        <input
                                          type="text"
                                          value={editingCatValue}
                                          onChange={(e) => setEditingCatValue(e.target.value)}
                                          onBlur={() => {
                                            handleEditProductCategory(i, editingCatValue);
                                            setEditingCatIndex(null);
                                          }}
                                          onKeyDown={(e) => {
                                            if (e.key === 'Enter') {
                                              handleEditProductCategory(i, editingCatValue);
                                              setEditingCatIndex(null);
                                            }
                                          }}
                                          className="flex-1 p-1 bg-[#FAF8F5] text-xs font-bold text-bananur-clay rounded"
                                          autoFocus
                                        />
                                      ) : (
                                        <span 
                                          className="font-semibold text-bananur-clay truncate cursor-pointer hover:text-bananur-gold"
                                          onClick={() => {
                                            setEditingCatIndex({ type: 'product', index: i });
                                            setEditingCatValue(cat);
                                          }}
                                        >
                                          {cat}
                                        </span>
                                      )}
                                      
                                      <div className="flex items-center gap-1 flex-shrink-0">
                                        <button
                                          type="button"
                                          onClick={() => {
                                            setEditingCatIndex({ type: 'product', index: i });
                                            setEditingCatValue(cat);
                                          }}
                                          className="p-1 hover:bg-bananur-sand rounded text-xs cursor-pointer"
                                          title="Editar nombre"
                                        >
                                          ✏️
                                        </button>
                                        <button
                                          type="button"
                                          onClick={() => handleRemoveProductCategory(i)}
                                          className="p-1 hover:bg-red-50 rounded text-red-500 font-bold cursor-pointer"
                                          title="Eliminar categoría"
                                        >
                                          ✕
                                        </button>
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              </div>

                              {/* 2. Categorías de Servicios */}
                              <div className="space-y-4 bg-[#FAF8F5]/85 p-5 rounded-2xl">
                                <h4 className="text-xs font-mono font-bold text-bananur-sage uppercase tracking-wider flex items-center gap-1.5 pb-2 border-b border-bananur-sand/40">
                                  🛠️ Servicios
                                </h4>
                                
                                {/* Form Add */}
                                <div className="flex gap-2">
                                  <input
                                    type="text"
                                    value={newServiceCategoryInput}
                                    onChange={(e) => setNewServiceCategoryInput(e.target.value)}
                                    placeholder="Nueva cat..."
                                    className="flex-1 p-2 bg-white text-xs text-bananur-clay rounded-lg border-none focus:ring-1 focus:ring-bananur-gold shadow-xs"
                                  />
                                  <button
                                    type="button"
                                    onClick={() => {
                                      handleAddServiceCategory(newServiceCategoryInput);
                                      setNewServiceCategoryInput('');
                                    }}
                                    className="px-3 bg-bananur-clay hover:bg-bananur-gold text-white hover:text-black rounded-lg text-xs font-bold font-mono transition-colors cursor-pointer"
                                  >
                                    +
                                  </button>
                                </div>

                                {/* List */}
                                <div className="space-y-2 max-h-[160px] overflow-y-auto scrollbar-hidden">
                                  {serviceCategories.map((cat, i) => (
                                    <div key={cat + i} className="flex justify-between items-center text-xs p-2 bg-white rounded-lg shadow-xs">
                                      {editingCatIndex?.type === 'service' && editingCatIndex?.index === i ? (
                                        <input
                                          type="text"
                                          value={editingCatValue}
                                          onChange={(e) => setEditingCatValue(e.target.value)}
                                          onBlur={() => {
                                            handleEditServiceCategory(i, editingCatValue);
                                            setEditingCatIndex(null);
                                          }}
                                          onKeyDown={(e) => {
                                            if (e.key === 'Enter') {
                                              handleEditServiceCategory(i, editingCatValue);
                                              setEditingCatIndex(null);
                                            }
                                          }}
                                          className="flex-1 p-1 bg-[#FAF8F5] text-xs font-bold text-bananur-clay rounded"
                                          autoFocus
                                        />
                                      ) : (
                                        <span 
                                          className="font-semibold text-bananur-clay truncate cursor-pointer hover:text-bananur-gold"
                                          onClick={() => {
                                            setEditingCatIndex({ type: 'service', index: i });
                                            setEditingCatValue(cat);
                                          }}
                                        >
                                          {cat}
                                        </span>
                                      )}
                                      
                                      <div className="flex items-center gap-1 flex-shrink-0">
                                        <button
                                          type="button"
                                          onClick={() => {
                                            setEditingCatIndex({ type: 'service', index: i });
                                            setEditingCatValue(cat);
                                          }}
                                          className="p-1 hover:bg-bananur-sand rounded text-xs cursor-pointer"
                                          title="Editar nombre"
                                        >
                                          ✏️
                                        </button>
                                        <button
                                          type="button"
                                          onClick={() => handleRemoveServiceCategory(i)}
                                          className="p-1 hover:bg-red-50 rounded text-red-500 font-bold cursor-pointer"
                                          title="Eliminar categoría"
                                        >
                                          ✕
                                        </button>
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              </div>

                              {/* 3. Categorías de Portafolio Digital */}
                              <div className="space-y-4 bg-[#FAF8F5]/85 p-5 rounded-2xl">
                                <h4 className="text-xs font-mono font-bold text-bananur-coral uppercase tracking-wider flex items-center gap-1.5 pb-2 border-b border-bananur-sand/40">
                                  🎨 Portafolio Digital
                                </h4>
                                
                                {/* Form Add */}
                                <div className="flex gap-2">
                                  <input
                                    type="text"
                                    value={newPortfolioCategoryInput}
                                    onChange={(e) => setNewPortfolioCategoryInput(e.target.value)}
                                    placeholder="Nueva cat..."
                                    className="flex-1 p-2 bg-white text-xs text-bananur-clay rounded-lg border-none focus:ring-1 focus:ring-bananur-gold shadow-xs"
                                  />
                                  <button
                                    type="button"
                                    onClick={() => {
                                      handleAddPortfolioCategory(newPortfolioCategoryInput);
                                      setNewPortfolioCategoryInput('');
                                    }}
                                    className="px-3 bg-bananur-clay hover:bg-bananur-gold text-white hover:text-black rounded-lg text-xs font-bold font-mono transition-colors cursor-pointer"
                                  >
                                    +
                                  </button>
                                </div>

                                {/* List */}
                                <div className="space-y-2 max-h-[160px] overflow-y-auto scrollbar-hidden">
                                  {portfolioCategories.map((cat, i) => (
                                    <div key={cat + i} className="flex justify-between items-center text-xs p-2 bg-white rounded-lg shadow-xs">
                                      {editingCatIndex?.type === 'portfolio' && editingCatIndex?.index === i ? (
                                        <input
                                          type="text"
                                          value={editingCatValue}
                                          onChange={(e) => setEditingCatValue(e.target.value)}
                                          onBlur={() => {
                                            handleEditPortfolioCategory(i, editingCatValue);
                                            setEditingCatIndex(null);
                                          }}
                                          onKeyDown={(e) => {
                                            if (e.key === 'Enter') {
                                              handleEditPortfolioCategory(i, editingCatValue);
                                              setEditingCatIndex(null);
                                            }
                                          }}
                                          className="flex-1 p-1 bg-[#FAF8F5] text-xs font-bold text-bananur-clay rounded"
                                          autoFocus
                                        />
                                      ) : (
                                        <span 
                                          className="font-semibold text-bananur-clay truncate cursor-pointer hover:text-bananur-gold"
                                          onClick={() => {
                                            setEditingCatIndex({ type: 'portfolio', index: i });
                                            setEditingCatValue(cat);
                                          }}
                                        >
                                          {cat}
                                        </span>
                                      )}
                                      
                                      <div className="flex items-center gap-1 flex-shrink-0">
                                        <button
                                          type="button"
                                          onClick={() => {
                                            setEditingCatIndex({ type: 'portfolio', index: i });
                                            setEditingCatValue(cat);
                                          }}
                                          className="p-1 hover:bg-bananur-sand rounded text-xs cursor-pointer"
                                          title="Editar nombre"
                                        >
                                          ✏️
                                        </button>
                                        <button
                                          type="button"
                                          onClick={() => handleRemovePortfolioCategory(i)}
                                          className="p-1 hover:bg-red-50 rounded text-red-500 font-bold cursor-pointer"
                                          title="Eliminar categoría"
                                        >
                                          ✕
                                        </button>
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              </div>

                              {/* 4. Categorías de Clientes (Categoría Miembro) */}
                              <div className="space-y-4 bg-[#FAF8F5]/85 p-5 rounded-2xl">
                                <h4 className="text-xs font-mono font-bold text-[#8A7968] uppercase tracking-wider flex items-center gap-1.5 pb-2 border-b border-bananur-sand/40">
                                  👥 Categoría Miembro
                                </h4>
                                
                                {/* Form Add */}
                                <div className="flex gap-2">
                                  <input
                                    type="text"
                                    value={newClientCategoryInput}
                                    onChange={(e) => setNewClientCategoryInput(e.target.value)}
                                    placeholder="Nueva cat..."
                                    className="flex-1 p-2 bg-white text-xs text-bananur-clay rounded-lg border-none focus:ring-1 focus:ring-bananur-gold shadow-xs"
                                  />
                                  <button
                                    type="button"
                                    onClick={() => {
                                      handleAddClientCategory(newClientCategoryInput);
                                      setNewClientCategoryInput('');
                                    }}
                                    className="px-3 bg-bananur-clay hover:bg-bananur-gold text-white hover:text-black rounded-lg text-xs font-bold font-mono transition-colors cursor-pointer"
                                  >
                                    +
                                  </button>
                                </div>

                                {/* List */}
                                <div className="space-y-2 max-h-[160px] overflow-y-auto scrollbar-hidden">
                                  {clientCategories.map((cat, i) => (
                                    <div key={cat + i} className="flex justify-between items-center text-xs p-2 bg-white rounded-lg shadow-xs">
                                      {editingCatIndex?.type === 'client' && editingCatIndex?.index === i ? (
                                        <input
                                          type="text"
                                          value={editingCatValue}
                                          onChange={(e) => setEditingCatValue(e.target.value)}
                                          onBlur={() => {
                                            handleEditClientCategory(i, editingCatValue);
                                            setEditingCatIndex(null);
                                          }}
                                          onKeyDown={(e) => {
                                            if (e.key === 'Enter') {
                                              handleEditClientCategory(i, editingCatValue);
                                              setEditingCatIndex(null);
                                            }
                                          }}
                                          className="flex-1 p-1 bg-[#FAF8F5] text-xs font-bold text-bananur-clay rounded"
                                          autoFocus
                                        />
                                      ) : (
                                        <span 
                                          className="font-semibold text-bananur-clay truncate cursor-pointer hover:text-bananur-gold"
                                          onClick={() => {
                                            setEditingCatIndex({ type: 'client', index: i });
                                            setEditingCatValue(cat);
                                          }}
                                        >
                                          {cat}
                                        </span>
                                      )}
                                      
                                      <div className="flex items-center gap-1 flex-shrink-0">
                                        <button
                                          type="button"
                                          onClick={() => {
                                            setEditingCatIndex({ type: 'client', index: i });
                                            setEditingCatValue(cat);
                                          }}
                                          className="p-1 hover:bg-bananur-sand rounded text-xs cursor-pointer"
                                          title="Editar nombre"
                                        >
                                          ✏️
                                        </button>
                                        <button
                                          type="button"
                                          onClick={() => handleRemoveClientCategory(i)}
                                          className="p-1 hover:bg-red-50 rounded text-red-500 font-bold cursor-pointer"
                                          title="Eliminar categoría"
                                        >
                                          ✕
                                        </button>
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              </div>

                              {/* 5. Categorías de Proveedores / Insumos */}
                              <div className="space-y-4 bg-[#FAF8F5]/85 p-5 rounded-2xl">
                                <h4 className="text-xs font-mono font-bold text-[#A37B5C] uppercase tracking-wider flex items-center gap-1.5 pb-2 border-b border-bananur-sand/40">
                                  🏭 Categoría Proveedor
                                </h4>
                                
                                {/* Form Add */}
                                <div className="flex gap-2">
                                  <input
                                    type="text"
                                    value={newSupplierCategoryInput}
                                    onChange={(e) => setNewSupplierCategoryInput(e.target.value)}
                                    placeholder="Nueva cat..."
                                    className="flex-1 p-2 bg-white text-xs text-bananur-clay rounded-lg border-none focus:ring-1 focus:ring-bananur-gold shadow-xs"
                                  />
                                  <button
                                    type="button"
                                    onClick={() => {
                                      handleAddSupplierCategory(newSupplierCategoryInput);
                                      setNewSupplierCategoryInput('');
                                    }}
                                    className="px-3 bg-bananur-clay hover:bg-bananur-gold text-white hover:text-black rounded-lg text-xs font-bold font-mono transition-colors cursor-pointer"
                                  >
                                    +
                                  </button>
                                </div>

                                {/* List */}
                                <div className="space-y-2 max-h-[160px] overflow-y-auto scrollbar-hidden">
                                  {supplierCategories.map((cat, i) => (
                                    <div key={cat + i} className="flex justify-between items-center text-xs p-2 bg-white rounded-lg shadow-xs">
                                      {editingCatIndex?.type === 'supplier' && editingCatIndex?.index === i ? (
                                        <input
                                          type="text"
                                          value={editingCatValue}
                                          onChange={(e) => setEditingCatValue(e.target.value)}
                                          onBlur={() => {
                                            handleEditSupplierCategory(i, editingCatValue);
                                            setEditingCatIndex(null);
                                          }}
                                          onKeyDown={(e) => {
                                            if (e.key === 'Enter') {
                                              handleEditSupplierCategory(i, editingCatValue);
                                              setEditingCatIndex(null);
                                            }
                                          }}
                                          className="flex-1 p-1 bg-[#FAF8F5] text-xs font-bold text-bananur-clay rounded"
                                          autoFocus
                                        />
                                      ) : (
                                        <span 
                                          className="font-semibold text-bananur-clay truncate cursor-pointer hover:text-bananur-gold"
                                          onClick={() => {
                                            setEditingCatIndex({ type: 'supplier', index: i });
                                            setEditingCatValue(cat);
                                          }}
                                        >
                                          {cat}
                                        </span>
                                      )}
                                      
                                      <div className="flex items-center gap-1 flex-shrink-0">
                                        <button
                                          type="button"
                                          onClick={() => {
                                            setEditingCatIndex({ type: 'supplier', index: i });
                                            setEditingCatValue(cat);
                                          }}
                                          className="p-1 hover:bg-bananur-sand rounded text-xs cursor-pointer"
                                          title="Editar nombre"
                                        >
                                          ✏️
                                        </button>
                                        <button
                                          type="button"
                                          onClick={() => handleRemoveSupplierCategory(i)}
                                          className="p-1 hover:bg-red-50 rounded text-red-500 font-bold cursor-pointer"
                                          title="Eliminar categoría"
                                        >
                                          ✕
                                        </button>
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              </div>

                            </div>
                          </div>

                          {/* --- GESTIÓN DE RESPONSABLES --- */}
                          <div className="bg-white p-6 sm:p-8 rounded-3xl shadow-xs space-y-6">
                            <div className="border-b border-bananur-sand/35 pb-3">
                              <h3 className="font-serif text-lg font-bold text-bananur-clay">Gestión de Responsables de Producción</h3>
                              <p className="text-xs text-bananur-clay-light font-light font-sans">Añade, edita y elimina los Responsables que se asignan a cargo de los lotes de confección en el taller.</p>
                            </div>

                            <div className="space-y-4">
                              {/* Form Add */}
                              <div className="flex gap-2 max-w-md">
                                <input
                                  type="text"
                                  value={newResponsableInput}
                                  onChange={(e) => setNewResponsableInput(e.target.value)}
                                  placeholder="Nombre del nuevo responsable..."
                                  className="flex-1 p-2 bg-[#FAF8F5] text-xs text-bananur-clay rounded-lg border border-bananur-sand/65 focus:ring-1 focus:ring-bananur-gold"
                                />
                                <button
                                  type="button"
                                  onClick={() => {
                                    if (!newResponsableInput.trim()) return;
                                    if (responsables.includes(newResponsableInput.trim())) {
                                      addToast('Responsable Duplicado', 'Este responsable ya está registrado.', 'warning');
                                      return;
                                    }
                                    setResponsables(prev => [...prev, newResponsableInput.trim()]);
                                    setNewResponsableInput('');
                                    addToast('Responsable Añadido', `Responsable "${newResponsableInput.trim()}" creado.`, 'success');
                                  }}
                                  className="px-4 bg-bananur-clay hover:bg-bananur-gold text-white hover:text-black rounded-lg text-xs font-bold font-mono transition-colors cursor-pointer"
                                >
                                  Agregar
                                </button>
                              </div>

                              {/* List */}
                              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-w-2xl">
                                {responsables.map((resp, i) => (
                                  <div key={resp + i} className="flex justify-between items-center text-xs p-3 bg-[#FAF8F5] rounded-xl border border-bananur-sand/35">
                                    {editingResponsableIndex === i ? (
                                      <input
                                        type="text"
                                        value={editingResponsableValue}
                                        onChange={(e) => setEditingResponsableValue(e.target.value)}
                                        onBlur={() => {
                                          if (editingResponsableValue.trim()) {
                                            setResponsables(prev => {
                                              const next = [...prev];
                                              next[i] = editingResponsableValue.trim();
                                              return next;
                                            });
                                            addToast('Responsable Modificado', 'El nombre se actualizó correctamente.', 'success');
                                          }
                                          setEditingResponsableIndex(null);
                                        }}
                                        onKeyDown={(e) => {
                                          if (e.key === 'Enter') {
                                            if (editingResponsableValue.trim()) {
                                              setResponsables(prev => {
                                                const next = [...prev];
                                                next[i] = editingResponsableValue.trim();
                                                return next;
                                              });
                                              addToast('Responsable Modificado', 'El nombre se actualizó correctamente.', 'success');
                                            }
                                            setEditingResponsableIndex(null);
                                          }
                                        }}
                                        className="flex-1 p-1 bg-white text-xs font-bold text-bananur-clay rounded border border-bananur-sand"
                                        autoFocus
                                      />
                                    ) : (
                                      <span 
                                        className="font-semibold text-bananur-clay truncate cursor-pointer hover:text-bananur-gold font-sans"
                                        onClick={() => {
                                          setEditingResponsableIndex(i);
                                          setEditingResponsableValue(resp);
                                        }}
                                      >
                                        👤 {resp}
                                      </span>
                                    )}

                                    <div className="flex items-center gap-1 flex-shrink-0">
                                      <button
                                        type="button"
                                        onClick={() => {
                                          setEditingResponsableIndex(i);
                                          setEditingResponsableValue(resp);
                                        }}
                                        className="p-1 hover:bg-bananur-sand rounded text-xs cursor-pointer text-sans"
                                        title="Editar"
                                      >
                                        ✏️
                                      </button>
                                      <button
                                        type="button"
                                        onClick={() => {
                                          const removed = responsables[i];
                                          setResponsables(prev => prev.filter((_, idx) => idx !== i));
                                          addToast('Responsable Eliminado', `Responsable "${removed}" eliminado de la lista.`, 'info');
                                        }}
                                        className="p-1 hover:bg-red-50 rounded text-red-500 font-bold cursor-pointer text-sans"
                                        title="Eliminar"
                                        disabled={responsables.length <= 1}
                                      >
                                        ✕
                                      </button>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </div>
                          </div>

                          {/* --- CONFIGURADOR DE ETAPAS DE ENSAMBLAJE --- */}
                          <div className="bg-white p-6 sm:p-8 rounded-3xl shadow-xs space-y-6">
                            <div className="border-b border-bananur-sand/35 pb-3">
                              <h3 className="font-serif text-lg font-bold text-bananur-clay font-serif">Configurador de Etapas de Ensamblaje</h3>
                              <p className="text-xs text-bananur-clay-light font-light font-sans">Configura las diferentes etapas del pipeline de producción de forma totalmente personalizada para cada una de tus líneas de trabajo.</p>
                            </div>

                            {/* Production Lines tabs */}
                            <div className="flex gap-2 border-b border-bananur-sand/30 pb-2 overflow-x-auto">
                              {[
                                { key: 'diseño', label: '🎨 Línea Diseño', color: 'border-orange-500' },
                                { key: 'impresion3d', label: '⚙️ Impresión 3D', color: 'border-blue-500' },
                                { key: 'costura', label: '🧵 Costura Fina', color: 'border-amber-600' },
                                { key: 'crochet', label: '🧶 Crochet & Tejidos', color: 'border-indigo-500' },
                              ].map(line => (
                                <button
                                  key={line.key}
                                  type="button"
                                  onClick={() => {
                                    setSelectedConfigLine(line.key);
                                    setEditingStageIndex(null);
                                    setNewStageInput('');
                                  }}
                                  className={`py-2 px-4 text-xs font-bold rounded-lg transition-all cursor-pointer whitespace-nowrap font-sans ${
                                    selectedConfigLine === line.key
                                      ? 'bg-bananur-clay text-white'
                                      : 'bg-[#FAF8F5] border border-bananur-sand/50 text-bananur-clay hover:bg-bananur-cream/30'
                                  }`}
                                >
                                  {line.label}
                                </button>
                              ))}
                            </div>

                            <div className="space-y-4">
                              {/* Add stage form */}
                              <div className="flex gap-2 max-w-md">
                                <input
                                  type="text"
                                  value={newStageInput}
                                  onChange={(e) => setNewStageInput(e.target.value)}
                                  placeholder="Ej: Curado UV, Lavado, Empacado especial"
                                  className="flex-1 p-2 bg-[#FAF8F5] text-xs text-bananur-clay rounded-lg border border-bananur-sand/65 focus:ring-1 focus:ring-bananur-gold"
                                />
                                <button
                                  type="button"
                                  onClick={() => {
                                    if (!newStageInput.trim()) return;
                                    const currentStages = productionStages[selectedConfigLine] || [];
                                    if (currentStages.includes(newStageInput.trim())) {
                                      addToast('Etapa Duplicada', 'Esta etapa ya existe para esta línea.', 'warning');
                                      return;
                                    }
                                    setProductionStages(prev => ({
                                      ...prev,
                                      [selectedConfigLine]: [...currentStages, newStageInput.trim()]
                                    }));
                                    setNewStageInput('');
                                    addToast('Etapa Añadida', `Etapa "${newStageInput.trim()}" agregada a la línea.`, 'success');
                                  }}
                                  className="px-4 bg-bananur-clay hover:bg-bananur-gold text-white hover:text-black rounded-lg text-xs font-bold font-mono transition-colors cursor-pointer"
                                >
                                  Añadir Etapa
                                </button>
                              </div>

                              {/* Stages list with order buttons */}
                              <div className="space-y-2 max-w-xl">
                                {(productionStages[selectedConfigLine] || []).map((stage, idx) => (
                                  <div key={stage + idx} className="flex justify-between items-center text-xs p-3 bg-[#FAF8F5] rounded-xl border border-bananur-sand/35 font-sans">
                                    <div className="flex items-center gap-3">
                                      <span className="font-mono text-[10px] bg-bananur-sand/30 px-1.5 py-0.5 rounded text-bananur-clay-light font-bold">
                                        Paso {idx + 1}
                                      </span>
                                      
                                      {editingStageIndex === idx ? (
                                        <input
                                          type="text"
                                          value={editingStageValue}
                                          onChange={(e) => setEditingStageValue(e.target.value)}
                                          onBlur={() => {
                                            if (editingStageValue.trim()) {
                                              setProductionStages(prev => {
                                                const list = [...(prev[selectedConfigLine] || [])];
                                                list[idx] = editingStageValue.trim();
                                                return { ...prev, [selectedConfigLine]: list };
                                              });
                                              addToast('Etapa Actualizada', 'Se modificó el nombre de la etapa.', 'success');
                                            }
                                            setEditingStageIndex(null);
                                          }}
                                          onKeyDown={(e) => {
                                            if (e.key === 'Enter') {
                                              if (editingStageValue.trim()) {
                                                setProductionStages(prev => {
                                                  const list = [...(prev[selectedConfigLine] || [])];
                                                  list[idx] = editingStageValue.trim();
                                                  return { ...prev, [selectedConfigLine]: list };
                                                });
                                                addToast('Etapa Actualizada', 'Se modificó el nombre de la etapa.', 'success');
                                              }
                                              setEditingStageIndex(null);
                                            }
                                          }}
                                          className="p-1 bg-white text-xs font-bold text-bananur-clay rounded border border-bananur-sand"
                                          autoFocus
                                        />
                                      ) : (
                                        <span className="font-semibold text-bananur-clay">{stage}</span>
                                      )}
                                    </div>

                                    <div className="flex items-center gap-1.5">
                                      {/* Move up */}
                                      <button
                                        type="button"
                                        disabled={idx === 0}
                                        onClick={() => {
                                          setProductionStages(prev => {
                                            const list = [...(prev[selectedConfigLine] || [])];
                                            const temp = list[idx];
                                            list[idx] = list[idx - 1];
                                            list[idx - 1] = temp;
                                            return { ...prev, [selectedConfigLine]: list };
                                          });
                                        }}
                                        className="p-1 hover:bg-bananur-sand rounded disabled:opacity-20 cursor-pointer"
                                        title="Subir orden"
                                      >
                                        ▲
                                      </button>
                                      
                                      {/* Move down */}
                                      <button
                                        type="button"
                                        disabled={idx === (productionStages[selectedConfigLine] || []).length - 1}
                                        onClick={() => {
                                          setProductionStages(prev => {
                                            const list = [...(prev[selectedConfigLine] || [])];
                                            const temp = list[idx];
                                            list[idx] = list[idx + 1];
                                            list[idx + 1] = temp;
                                            return { ...prev, [selectedConfigLine]: list };
                                          });
                                        }}
                                        className="p-1 hover:bg-bananur-sand rounded disabled:opacity-20 cursor-pointer"
                                        title="Bajar orden"
                                      >
                                        ▼
                                      </button>

                                      {/* Edit */}
                                      <button
                                        type="button"
                                        onClick={() => {
                                          setEditingStageIndex(idx);
                                          setEditingStageValue(stage);
                                        }}
                                        className="p-1 hover:bg-bananur-sand rounded text-xs cursor-pointer font-bold"
                                        title="Renombrar etapa"
                                      >
                                        ✏️
                                      </button>

                                      {/* Delete */}
                                      <button
                                        type="button"
                                        disabled={(productionStages[selectedConfigLine] || []).length <= 1}
                                        onClick={() => {
                                          const removed = (productionStages[selectedConfigLine] || [])[idx];
                                          setProductionStages(prev => ({
                                            ...prev,
                                            [selectedConfigLine]: (prev[selectedConfigLine] || []).filter((_, i) => i !== idx)
                                          }));
                                          addToast('Etapa Eliminada', `Etapa "${removed}" eliminada de la línea de producción.`, 'info');
                                        }}
                                        className="p-1 hover:bg-red-50 rounded text-red-500 font-bold disabled:opacity-20 cursor-pointer"
                                        title="Eliminar etapa"
                                      >
                                        ✕
                                      </button>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </div>
                          </div>

                          <div className="bg-white p-6 sm:p-8 rounded-3xl shadow-xs space-y-6">
                            <h3 className="font-serif text-lg font-bold text-bananur-clay border-b border-bananur-sand pb-2">Información de Operación</h3>
                            
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs font-sans">
                              <div>
                                <label className="block text-[10px] font-mono uppercase text-[#524742]/60 mb-1">Nombre Fantasía</label>
                                <span className="p-2.5 bg-[#FAF8F5] rounded border border-bananur-sand/40 block font-semibold text-bananur-clay">Bananur Estudio Chile</span>
                              </div>
                              <div>
                                <label className="block text-[10px] font-mono uppercase text-[#524742]/60 mb-1">RUT Empresa Emisor</label>
                                <span className="p-2.5 bg-[#FAF8F5] rounded border border-bananur-sand/40 block font-mono text-bananur-clay">76.844.200-K (Papelería & Diseño SpA)</span>
                              </div>
                              <div>
                                <label className="block text-[10px] font-mono uppercase text-[#524742]/60 mb-1">Tienda Principal & Taller Central</label>
                                <span className="p-2.5 bg-[#FAF8F5] rounded border border-bananur-sand/40 block font-semibold text-bananur-clay">1 Norte 450 (Sector Poniente), Viña del Mar</span>
                              </div>
                              <div>
                                <label className="block text-[10px] font-mono uppercase text-[#524742]/60 mb-1">Comuna & Jurisdicción</label>
                                <span className="p-2.5 bg-[#FAF8F5] rounded border border-bananur-sand/40 block font-semibold text-bananur-clay">Viña del Mar, Región de Valparaíso</span>
                              </div>
                            </div>

                            <div className="space-y-2">
                              <h4 className="text-xs font-mono font-bold text-[#524742]/80 uppercase">Métodos de Cobro Sincronizados</h4>
                              <div className="bg-bananur-sand/20 border border-bananur-clay/5 p-4 rounded-xl flex items-center justify-between text-xs font-mono text-bananur-clay">
                                <span className="font-bold">E-Commerce Webpay Plus (Transbank)</span>
                                <span className="text-emerald-700 font-semibold bg-emerald-50 px-2 py-0.5 rounded uppercase text-[10px]">Verificado</span>
                              </div>
                            </div>

                            <button
                              id="config-btn-save"
                              onClick={() => alert('¡Configuraciones almacenadas correctamente en simulación!')}
                              className="px-6 py-2.5 bg-[#2D2522] hover:bg-bananur-gold text-[#FAF8F5] hover:text-black rounded-lg text-xs font-bold transition-all cursor-pointer"
                            >
                              Guardar cambios operacionales/tributarios
                            </button>
                          </div>
                        </div>
                          )}
                        </div>
                      )}

                    </div>
                  </>
                )}

              </div>
            )}
          </>
        )}

      </main>

      {/* ------------------------- REGULAR CLIENT FOOTER (Only when not in Admin Sidebar mode) ------------------------- */}
      {!isAdminMode && <Footer onNavigate={(view) => navigateTo(view)} />}

      {/* ------------------------ 🎛️ FLOATING DEV SCREEN SELECTOR PANEL ------------------------ */}
      {import.meta.env.DEV && (
      <div className="fixed bottom-4 left-4 z-50">
        {showDemoController ? (
          <div className="glass-panel text-bananur-clay max-w-md rounded-2xl p-4 shadow-2xl space-y-3.5 border border-bananur-clay/10 bg-white/95 backdrop-blur-md animate-scale-up">
            <div className="flex justify-between items-center border-b border-bananur-clay/10 pb-2">
              <span className="font-serif text-sm font-bold text-bananur-clay flex items-center gap-1">
                🎛️ Bananur Demo Controller
              </span>
              <button
                id="dev-panel-close"
                onClick={() => setShowDemoController(false)}
                className="p-1 hover:bg-bananur-sand rounded-full text-bananur-clay-light hover:text-bananur-clay cursor-pointer"
                title="Minimizar panel demo"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-2">
              <div>
                <span className="text-[9px] font-mono tracking-widest text-bananur-gold-dark font-extrabold uppercase block mb-1">Entorno Cliente (18 pantallas)</span>
                <div className="flex flex-wrap gap-1">
                  {[
                    { key: 'home', label: '1. Home / Inicio' },
                    { key: 'tienda', label: '2. Tienda / Catálogo' },
                    { key: 'overlay-search', label: '3. Buscador overlay' },
                    { key: 'producto', label: '4. Ficha de Producto' },
                    { key: 'servicios', label: '5. Hub de Servicios' },
                    { key: 'portafolio', label: '6. Portafolio Proy' },
                    { key: 'cotizar', label: '7. Cotizador progresivo' },
                    { key: 'overlay-cart', label: '8. Carrito Bolsa overlay' },
                    { key: 'checkout', label: '9. Formulario Checkout' },
                    { key: 'gracias', label: '10. Pantalla Éxito Recibo' },
                    { key: 'login', label: '11. Login Socio' },
                    { key: 'registro', label: '12. Registro Socio' },
                    { key: 'cuenta', label: '13. Mi Cuenta Guard' },
                    { key: 'nosotros', label: '14. Nosotros / Estudio' },
                    { key: 'contacto', label: '15. Contacto / FAQ' },
                    { key: 'privacidad', label: '16. Politica Privacidad' },
                    { key: 'terminos', label: '17. Términos Servicio' },
                    { key: '404', label: '18. Fallback / 404' },
                  ].map((target) => {
                    const active = !isAdminMode && (
                      target.key === 'overlay-search' ? searchOpen :
                      target.key === 'overlay-cart' ? cartOpen :
                      currentView === target.key
                    );

                    return (
                      <button
                        id={`demo-client-btn-${target.key}`}
                        key={target.key}
                        onClick={() => {
                          setIsAdminMode(false);
                          if (target.key === 'overlay-search') {
                            setSearchOpen(true);
                          } else if (target.key === 'overlay-cart') {
                            setCartOpen(true);
                          } else {
                            if (target.key === 'cuenta') setIsClientLoggedIn(true); // Auto logins to inspect
                            navigateTo(target.key);
                          }
                        }}
                        className={`px-2 py-1 text-[9px] font-semibold rounded transition-all cursor-pointer ${
                          active 
                            ? 'bg-bananur-gold text-bananur-clay font-bold ring-1 ring-bananur-gold-dark' 
                            : 'bg-bananur-sand/40 text-[#524742] hover:bg-bananur-sand hover:text-black font-mono'
                        }`}
                      >
                        {target.label}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Secure control panels navigation */}
              <div className="pt-2 border-t border-bananur-clay/10">
                <span className="text-[9px] font-mono tracking-widest text-[#B58455] font-extrabold uppercase block mb-1">Entorno Admin (5 pantallas)</span>
                <div className="flex flex-wrap gap-1">
                  {[
                    { key: 'admin-login', label: 'Login de Admin' },
                    { key: 'dashboard', label: 'Dashboard stats' },
                    { key: 'erp-kpi', label: 'ERP Resumen' },
                    { key: 'erp-mrp', label: 'ERP Insumos (MRP)' },
                    { key: 'erp-plm', label: 'ERP PLM Taller' },
                    { key: 'erp-fa', label: 'ERP Finanzas' },
                    { key: 'erp-crm', label: 'ERP Clientes' },
                    { key: 'inventario', label: 'Gestor Inventario' },
                    { key: 'pedidos', label: 'Tributaria SII' },
                    { key: 'agenda', label: 'Calendario Agenda' },
                    { key: 'correo', label: 'Correo Corporativo' },
                    { key: 'configuracion', label: 'Configuración Empresa' }
                  ].map((target) => {
                    const active = isAdminMode && (currentAdminView === target.key || (target.key.startsWith('erp-') && currentAdminView === target.key));
                    return (
                      <button
                        id={`demo-admin-btn-${target.key}`}
                        key={target.key}
                        onClick={() => {
                          setIsAdminMode(true);
                          setCurrentAdminView(target.key);
                        }}
                        className={`px-2 py-1 text-[9px] font-semibold rounded transition-all cursor-pointer ${
                          active 
                            ? 'bg-bananur-clay text-bananur-cream font-bold' 
                            : 'bg-bananur-sand/30 text-bananur-clay-light hover:bg-bananur-sand/70 hover:text-black font-mono'
                        }`}
                      >
                        {target.label}
                      </button>
                    );
                  })}
                </div>
              </div>

            </div>
          </div>
        ) : (
          /* Minimized Dev button */
          <button
            id="dev-panel-open"
            onClick={() => setShowDemoController(true)}
            className="w-10 h-10 bg-bananur-clay text-bananur-cream rounded-full flex items-center justify-center hover:bg-bananur-gold hover:text-bananur-clay duration-150 transition-all shadow-xl cursor-pointer"
            title="Abrir Selector Demo de 19 Pantallas"
          >
            🎛️
          </button>
        )}
      </div>
      )}

      {/* Floating Toast Notification Center */}
      <div className="fixed bottom-6 right-6 z-[9999] flex flex-col gap-3 max-w-sm w-full pointer-events-none">
        <AnimatePresence>
          {toasts.map((t) => {
            const borderStyle = {
              success: 'border-l-4 border-l-emerald-600 bg-white border border-bananur-sand shadow-lg shadow-bananur-clay/5',
              info: 'border-l-4 border-l-blue-500 bg-white border border-bananur-sand shadow-lg shadow-bananur-clay/5',
              warning: 'border-l-4 border-l-amber-500 bg-white border border-bananur-sand shadow-lg shadow-bananur-clay/5',
              error: 'border-l-4 border-l-rose-500 bg-white border border-bananur-sand shadow-lg shadow-bananur-clay/5',
            }[t.type];

            return (
              <motion.div
                key={t.id}
                initial={{ opacity: 0, y: 30, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -20, scale: 0.9, transition: { duration: 0.15 } }}
                transition={{ type: 'spring', stiffness: 300, damping: 25 }}
                className={`p-4 rounded-xl flex gap-3 pointer-events-auto selection:bg-bananur-sand ${borderStyle}`}
              >
                <div className="shrink-0 mt-0.5">
                  {t.type === 'success' && <CheckCircle className="w-5 h-5 text-emerald-600 animate-pulse" />}
                  {t.type === 'info' && <Sparkles className="w-5 h-5 text-blue-500 animate-pulse" />}
                  {t.type === 'warning' && <AlertTriangle className="w-5 h-5 text-amber-500 animate-bounce" />}
                  {t.type === 'error' && <AlertTriangle className="w-5 h-5 text-rose-500 animate-bounce" />}
                </div>
                <div className="flex-1">
                  <h4 className="font-serif text-sm font-bold text-bananur-clay">{t.title}</h4>
                  <p className="text-xs text-bananur-clay-light mt-0.5 leading-relaxed font-light">{t.description}</p>
                </div>
                <button
                  onClick={() => removeToast(t.id)}
                  className="shrink-0 text-bananur-clay-light/40 hover:text-bananur-clay transition-colors p-0.5 self-start cursor-pointer"
                  title="Cerrar notificación"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>

    </div>
  );
}
