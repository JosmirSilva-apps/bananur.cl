export interface Product {
  id: string;
  code?: string; // Código único / SKU / Barcode para escaneo directo e inventario
  sku?: string;
  barcode?: string;
  name: string;
  price: number;
  description: string;
  category: string;
  images: string[];
  variants: string[]; // e.g. Earthy colors like 'Arena', 'Terracota', 'Oliva'
  stock: number;
  lowStockThreshold: number;
  details: string[];
  clothingType?: 'nueva' | 'vintage';
  weightGrams?: number;
  pricePerKg?: number;
  lotId?: string;
  lotCode?: string;
  lotName?: string;
}

export interface ClothingLot {
  id: string;
  code: string;
  name: string;
  totalPrice?: number;
  totalWeightKg?: number;
  pricePerKg: number;
  origin?: string;
  itemsCount?: number;
  notes?: string;
  dateAdded?: string;
}

export interface Service {
  id: string;
  code?: string; // Código único de servicio para escaneo y cotizaciones rápidas
  name: string;
  description: string;
  price: number;
  category: string;
  iconName: string;
  details: string[];
}

export interface PortfolioItem {
  id: string;
  name: string;
  client: string;
  category: string;
  description: string;
  image: string;
  problem: string;
  solution: string;
  stack: string[];
  result: string;
  mockType: 'notebook' | 'mobile';
}

export interface CartItem {
  product: Product;
  quantity: number;
  variant: string;
}

export interface Order {
  id: string;
  date: string;
  customerName: string;
  customerEmail: string;
  customerPhone?: string;
  type: 'boleta' | 'factura';
  taxId?: string;       // RUT (for Factura)
  businessName?: string; // Razón Social (for Factura)
  businessLine?: string; // Giro (for Factura)
  address: string;
  commune: string;
  city: string;
  subtotal: number;
  shippingFee: number;
  total: number;
  status: 'En preparación' | 'Enviado' | 'Entregado';
  paymentMethod?: 'Transferencia' | 'Tarjeta de Crédito/Débito' | 'Efectivo' | 'Mercado Pago';
  paymentStatus?: 'Pagado' | 'Pendiente' | 'Reembolsado';
  mpPaymentId?: string;
  mpStatus?: string;
  mpInstallments?: number;
  salesChannel?: 'Sitio Web' | 'Instagram' | 'WhatsApp' | 'Feria Presencial' | 'Reunión/Asesoría';
  trackingNumber?: string;
  sellerNotes?: string;
  items: {
    productId: string;
    productName: string;
    quantity: number;
    price: number;
    variant: string;
  }[];
}

export interface Consultation {
  id: string;
  clientName: string;
  clientEmail: string;
  clientPhone?: string;
  date: string; // YYYY-MM-DD
  time: string; // HH:MM
  duration: string; // e.g. "60 min"
  topic: string; // e.g., "Auditoría de UX"
  status: 'Agendada' | 'Bloqueada';
  videoLink: string;
}

export interface ProductionBatch {
  id: string;
  orderId: string;
  clientName: string;
  productName: string;
  quantity: number;
  artisan: string;
  progress: number;
  currentStage: string;
  scheduledDay?: number; // e.g. 10, 15, 20, 24 for calendar integration
}

export interface Purchase {
  id: string;
  date: string;
  supplierName: string;
  supplierCompany: string;
  supplierEmail: string;
  supplierPhone?: string;
  category: 'Impresión 3D' | 'Costura' | 'Crochet' | 'Embalaje' | 'Herramientas';
  itemName: string;
  unitCost: number;
  quantity: number;
  subtotal: number;
  shippingCost: number;
  tax: number;
  total: number;
  status: 'Pendiente' | 'En Camino' | 'Recibido' | 'Cancelado';
  paymentMethod: 'Transferencia' | 'Tarjeta de Crédito/Débito' | 'Efectivo' | 'Crédito Proveedor';
  estimatedDeliveryDate?: string;
  internalNotes?: string;
  attachedDocs?: { name: string; size?: string; dateAttached?: string }[];
}

export interface CustomPageSection {
  id: string;
  type: 'text' | 'image' | 'callout' | 'gallery' | 'features';
  title?: string;
  text?: string;
  imageUrl?: string;
  imageCaption?: string;
  imagePosition?: 'left' | 'right' | 'full' | 'center';
  images?: { url: string; caption?: string }[];
  features?: { icon?: string; title: string; desc: string }[];
}

export interface CustomPage {
  id: string;
  title: string;
  subtitle?: string;
  bannerImage?: string;
  contentMarkdown: string;
  enabled: boolean;
  images?: string[];
  sections?: CustomPageSection[];
  layoutStyle?: 'editorial' | 'magazine' | 'minimal' | 'cards' | 'grid';
}

export interface MercadoPagoConfig {
  enabled: boolean;
  publicKey: string;
  accessToken: string;
  isSandbox: boolean;
  webhookUrl: string;
  installmentsEnabled: boolean;
  maxInstallments: number;
}

export interface CustomMailbox {
  id: string;
  name: string;
  category: string;
  color: string;
  icon?: string;
  description?: string;
  createdAt?: string;
}

export interface EmailTemplate {
  id: string;
  title: string;
  category: string;
  subject: string;
  body: string;
  isSystem?: boolean;
  lastEdited?: string;
}

export interface ClientCustomization {
  presetName: string;
  primaryColor: string; // Hex for primary actions (green tones)
  accentColor: string;  // Hex for accents (yellow/gold tones)
  backgroundColor: string; // Hex for backgrounds (white/light gray)
  surfaceColor?: string; // Hex for cards / surfaces
  textColor?: string;    // Hex for text
  borderColor?: string;  // Hex for borders
  fontFamily: 'font-sans' | 'font-serif' | 'font-mono' | 'font-outfit' | 'font-space' | 'font-jakarta' | 'font-cinzel' | 'font-montserrat' | string;
  borderRadius?: 'sharp' | 'minimal' | 'rounded' | 'pill';
  heroTitle: string;
  heroSubtitle: string;
  heroImageUrl?: string;
  logoUrl?: string;
  bannerPattern?: 'clean' | 'dots' | 'grid' | 'warm-paper';
  graphicAccents?: boolean;
  buttonStyle?: 'solid' | 'minimal' | 'glass';
  aboutTitle: string;
  aboutText: string;
  customPages: CustomPage[];
}

export interface SupplyRequestDoc {
  name: string;
  size: string;
  dateAttached: string;
}

export interface SupplyRequest {
  id: string;
  date: string;
  materialId: string;
  materialName: string;
  quantityRequested: number;
  reason: string;
  status: 'Pendiente' | 'Aprobado' | 'Recibido' | 'Rechazado';
  attachedDocs?: SupplyRequestDoc[];
}

export type WorkstationType = 'impresion3d' | 'costura' | 'crochet' | 'diseno' | 'personalizada';

export interface Workstation {
  id: string;
  code: string;
  name: string;
  type: WorkstationType;
  responsible: string;
  description: string;
  isActive: boolean;
  icon?: string;
  badge?: string;
  octoConfig?: {
    url: string;
    apiKey: string;
    printerModel?: string;
    baudRate?: string;
  };
  sewingConfig?: {
    machineModel: string;
    defaultNeedle: string;
    defaultTension: number;
    presserFoot: string;
    stitchLength?: string;
    feedDogPressure?: string;
    operatingHours?: number;
    lastServiceDate?: string;
  };
  crochetConfig?: {
    defaultHook: string;
    preferredYarnWeight?: string;
  };
  designConfig?: {
    softwareEnvironment?: string;
    defaultCanvasScale?: string;
    defaultFileFormat?: string;
  };
  customConfig?: {
    craftTechnique: string;
    safetyEquipment?: string;
    customNotes?: string;
  };
}

export interface TechnicalSketch {
  id: string;
  name: string;
  format: '.sketch' | '.dxf' | '.svg' | '.pdf' | '.blend';
  category: 'Patrón de Moldería' | 'Ficha Técnica' | 'Corte Láser' | 'Boceto Conceptual' | 'Prototipo 3D';
  scale: string;
  date: string;
  size: string;
  status: 'Boceto Activo' | 'Listo para Plotter' | 'Aprobado para Taller' | 'En Revisión';
  notes?: string;
}

