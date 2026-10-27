import { Product, Service, PortfolioItem, Order, Consultation, ClothingLot, Workstation, TechnicalSketch } from './types';

export const MOCK_CLOTHING_LOTS: ClothingLot[] = [
  {
    id: 'lot-1',
    code: 'FRD-DNM-90S',
    name: 'Fardo Chaquetas & Denim 90s USA',
    totalPrice: 1260000,
    totalWeightKg: 45,
    pricePerKg: 28000,
    origin: 'Importación Directa USA - Grado A',
    itemsCount: 60,
    dateAdded: '2026-06-10',
    notes: 'Selección de denim pesado, chaquetas Levi\'s y Wrangler vintage.'
  },
  {
    id: 'lot-2',
    code: 'FRD-KNIT-CL',
    name: 'Fardo Sweaters & Lana Retro Chilena',
    totalPrice: 555000,
    totalWeightKg: 30,
    pricePerKg: 18500,
    origin: 'Curaduría Nacional - Sur de Chile',
    itemsCount: 45,
    dateAdded: '2026-06-15',
    notes: 'Tejidos gruesos de lana natural y acrílico vintage.'
  },
  {
    id: 'lot-3',
    code: 'FRD-CAS-MIX',
    name: 'Fardo Camisas & Polerones Vintage Mix',
    totalPrice: 745000,
    totalWeightKg: 50,
    pricePerKg: 14900,
    origin: 'Selección Europea Italia / Alemania',
    itemsCount: 95,
    dateAdded: '2026-06-18',
    notes: 'Camisas leñadoras franela y polerones oversize 80s/90s.'
  }
];

export const MOCK_PRODUCTS: Product[] = [
  {
    id: 'prod-1',
    code: 'BNN-3D-0101',
    name: 'Soporte de Escritorio Geométrico - Impresión 3D',
    price: 24990,
    description: 'Soporte de diseño minimalista para celular y tablet, impreso en 3D de alta definición con filamento PLA biodegradable. Estructura optimizada para ventilación de dispositivos con terminación terracota mate.',
    category: 'Impresión 3D',
    images: [
      'https://images.unsplash.com/photo-1544816155-12df9643f363?auto=format&fit=crop&q=80&w=800',
      'https://images.unsplash.com/photo-1531346878377-a5be20888e57?auto=format&fit=crop&q=80&w=800',
      'https://images.unsplash.com/photo-1457369804613-52c61a468e7d?auto=format&fit=crop&q=80&w=800'
    ],
    variants: ['PLA Terracota', 'PLA Oliva', 'PETG Negro Carbono'],
    stock: 4, // low stock trigger
    lowStockThreshold: 5,
    details: [
      'Inclinación de 60 grados para óptima ergonomía de pantalla.',
      'Soportes de goma antideslizamiento en la base.',
      'Impreso con un patrón de relleno del 20% para alta durabilidad.',
      'Diseño exclusivo registrado en nuestro catálogo 3D.'
    ]
  },
  {
    id: 'prod-2',
    code: 'BNN-CST-0204',
    name: 'Bolsa Organizadora de Costura "Bananur Taller"',
    price: 15990,
    description: 'La compañera perfecta para organizar tus ovillos de lana, agujas de crochet y retazos de telas. Confeccionada éticamente en tela de algodón resistente y con bolsillos laterales de costura reforzada en cruz.',
    category: 'Costura',
    images: [
      'https://images.unsplash.com/photo-1544816155-12df9643f363?auto=format&fit=crop&q=80&w=800',
      'https://images.unsplash.com/photo-1531346878377-a5be20888e57?auto=format&fit=crop&q=80&w=800'
    ],
    variants: ['Algodón Crudo', 'Humo Verde', 'Estampado Silvestre'],
    stock: 18,
    lowStockThreshold: 5,
    details: [
      '100% lona de algodón orgánico teñida a mano.',
      'Bolsillo especial para juego de 8 ganchillos de crochet.',
      'Asas acolchadas de alta resistencia para llevar tus proyectos.',
      'Hecho con retazos textiles upcycled para menor huella ambiental.'
    ]
  },
  {
    id: 'prod-3',
    code: 'BNN-CRO-0309',
    name: 'Amigurumi de Jirafa "Tierra Dulce" - Crochet Premium',
    price: 18500,
    description: 'Tierno amigo amigurumi de jirafa, tejido minuciosamente a mano con hilo de algodón hipoalergénico de primer nivel. Relleno con vellón siliconado súper suave y ojos bordados para mayor seguridad infantil.',
    category: 'Crochet',
    images: [
      'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?auto=format&fit=crop&q=80&w=800',
      'https://images.unsplash.com/photo-1531346878377-a5be20888e57?auto=format&fit=crop&q=80&w=800'
    ],
    variants: ['Mostaza & Arena', 'Jade & Crema', 'Oliva & Natural'],
    stock: 2, // low stock trigger
    lowStockThreshold: 3,
    details: [
      'Altura aproximada de 25 cm.',
      'Tejido con hilo de algodón orgánico lavado de 4 hebras.',
      'Lavable a mano con agua tibia.',
      'Cada amigurumi posee sutiles variantes que certifican su confección humana.'
    ]
  },
  {
    id: 'prod-4',
    code: 'BNN-3D-0412',
    name: 'Organizador de Carretes Modular - Impresión 3D',
    price: 32000,
    description: 'Tríptico de organizadores de carretes de hilo para colgar en pared. Estructura modular súper resistente que encastra a la perfección, impresa en 3D con filamento reciclado para mantener tu taller en perfecto orden.',
    category: 'Impresión 3D',
    images: [
      'https://images.unsplash.com/photo-1513519245088-0e12902e5a38?auto=format&fit=crop&q=80&w=800',
      'https://images.unsplash.com/photo-1579783902614-a3fb3927b6a5?auto=format&fit=crop&q=80&w=800'
    ],
    variants: ['Set Modular 3 Paneles', 'Módulo Individual Negro', 'Módulo Individual Blanco'],
    stock: 12,
    lowStockThreshold: 5,
    details: [
      'Capacidad para 20 carretes medianos por panel.',
      'Sistemas de encaje invisible de alta precisión geométrica.',
      'Incluye tarugos y tornillos de sujeción para muro.',
      'Material PETG extra duro para evitar quiebres.'
    ]
  },
  {
    id: 'prod-5',
    code: 'BNN-CST-0515',
    name: 'Estuche de Costura de Autor en Algodón d\'Ischia',
    price: 48990,
    description: 'Estuche enrollable de colección para tus herramientas más preciadas del arte textil. Cosido minuciosamente a máquina con forro interior de algodón estampado italiano d\'Ischia, cordolería de sujeción ajustable.',
    category: 'Costura',
    images: [
      'https://images.unsplash.com/photo-1531346878377-a5be20888e57?auto=format&fit=crop&q=80&w=800',
      'https://images.unsplash.com/photo-1527443154391-507e9dc6c5cc?auto=format&fit=crop&q=80&w=800'
    ],
    variants: ['Estampado Ischia Azul', 'Monocromo Terracota'],
    stock: 8,
    lowStockThreshold: 3,
    details: [
      'Diseño inteligente con solapa interior protectora anticaídas.',
      '12 ranuras hechas a medida para ganchillos, pinceles o reglas.',
      'Bolsillo con broche metálico para tijeras y elásticos.',
      'Compacto y perfectamente lavable en lavadoras.'
    ]
  },
  {
    id: 'prod-6',
    code: 'BNN-CRO-0618',
    name: 'Muñeco de Crochet "Cactus Alegre" Amigurumi',
    price: 11990,
    description: 'Pequeño macetero con cactus alegre tejido a crochet para decorar tu escritorio u obsequiar. Viene con su base de maceta real de arcilla modelada y un diseño adorable que sacará sonrisas.',
    category: 'Crochet',
    images: [
      'https://images.unsplash.com/photo-1531346878377-a5be20888e57?auto=format&fit=crop&q=80&w=800',
      'https://images.unsplash.com/photo-1457369804613-52c61a468e7d?auto=format&fit=crop&q=80&w=800'
    ],
    variants: ['Cactus Oliva Alegre', 'Cactus Jade Flor Amarilla'],
    stock: 3, // low stock trigger
    lowStockThreshold: 4,
    details: [
      'Dimensiones: 12 cm de alto por 6 cm de diámetro.',
      'Materiales: Hilo 100% de algodón y relleno sintético premium.',
      'Soportado en maceta rústica reciclada.',
      'Detalles de caritas bordadas con especial dedicación.'
    ]
  },
  {
    id: 'prod-7',
    code: 'BNN-VNT-0721',
    name: 'Chaqueta Denim Vintage 90s Recuperada',
    price: 21000,
    description: 'Chaqueta vaquera de corte retro clásico seleccionada pieza por pieza. Tratamiento artesanal de lavado suave y detalles de costura reforzada en el taller Bananur.',
    category: 'Ropa',
    clothingType: 'vintage',
    weightGrams: 750,
    pricePerKg: 28000,
    lotId: 'lot-1',
    lotCode: 'FRD-DNM-90S',
    lotName: 'Fardo Chaquetas & Denim 90s USA',
    images: [
      'https://images.unsplash.com/photo-1544816155-12df9643f363?auto=format&fit=crop&q=80&w=800',
      'https://images.unsplash.com/photo-1527443154391-507e9dc6c5cc?auto=format&fit=crop&q=80&w=800'
    ],
    variants: ['Talla M Vintage', 'Talla L Vintage'],
    stock: 2,
    lowStockThreshold: 2,
    details: [
      'Clasificación: Ropa Vintage por Peso.',
      'Peso neto de la prenda: 750 gramos (0.75 kg).',
      'Tarifa de tasación textil: $28.000 / kg.',
      'Pieza única curada y sanitizada con ozono ecológico.'
    ]
  },
  {
    id: 'prod-8',
    code: 'BNN-ROPA-0824',
    name: 'Polera Algodón Pima de Autor "Bananur Botánica"',
    price: 18990,
    description: 'Polera nueva confeccionada en 100% algodón pima peinado con serigrafía al agua de ilustración botánica chilena. Tacto ultra suave y corte regular.',
    category: 'Ropa',
    clothingType: 'nueva',
    images: [
      'https://images.unsplash.com/photo-1527443154391-507e9dc6c5cc?auto=format&fit=crop&q=80&w=800'
    ],
    variants: ['Blanco Crudo - S', 'Blanco Crudo - M', 'Blanco Crudo - L'],
    stock: 14,
    lowStockThreshold: 4,
    details: [
      'Clasificación: Ropa Nueva de Colección.',
      '100% Algodón Pima Peruano de 180 gramos.',
      'Estampado serigráfico artesanal ecológico.',
      'Corte unisex holgado.'
    ]
  }
];

export const MOCK_SERVICES: Service[] = [
  {
    id: 'serv-1',
    code: 'BNN-SRV-1001',
    name: 'Identidad de Marca & Branding Editorial',
    description: 'Transformamos tu marca en una obra editorial. Creación de logotipo, tipografía corporativa, paleta de colores orgánica, papelería fina, manual de uso y activos estructurados para redes sociales.',
    price: 850000,
    category: 'Diseño',
    iconName: 'Sparkles',
    details: [
      '3 propuestas iniciales conceptuales.',
      'Manual de marca interactivo digital.',
      'Diseño de tarjetas de presentación y papelería corporativa.',
      'Guía tipográfica y kit de publicaciones de redes sociales (Figma/Canva).'
    ]
  },
  {
    id: 'serv-2',
    code: 'BNN-SRV-2002',
    name: 'Desarrollo Web E-Commerce & Portafolios a Medida',
    description: 'Desarrollamos tiendas interactivas en Shopify y sitios a medida optimizados para SEO y altas conversiones. Diseñamos con un foco minimalista y responsivo que ensalza tu marca boutique.',
    price: 1250000,
    category: 'Digital',
    iconName: 'Globe',
    details: [
      'Diseño UX/UI totalmente personalizado desde cero.',
      'Configuración e integración total de Webpay, envíos chilenos e IVA.',
      'Panel autoadministrable intuitivo.',
      'Optimización de carga ultra rápida móvil.'
    ]
  },
  {
    id: 'serv-3',
    code: 'BNN-SRV-3003',
    name: 'Diseño de Packaging Sustentable',
    description: 'Dale una primera impresión inolvidable a tus productos físicos. Diseñamos empaques, bolsas, etiquetas, fajas y pegatinas optimizadas para troquelado y producción con materiales ecológicos.',
    price: 490000,
    category: 'Branding',
    iconName: 'Package',
    details: [
      'Dos sistemas de empaque diferenciados.',
      'Archivos vectoriales troquelados finales listos para imprenta.',
      'Maquetas virtuales 3D hiperrealistas de presentación.',
      'Asesoría técnica de materiales con imprentas locales.'
    ]
  },
  {
    id: 'serv-4',
    code: 'BNN-SRV-4004',
    name: 'Consultoría y Asesoría Estratégica Digital',
    description: 'Asesoría directa 1-a-1 de 2 de horas para analizar la experiencia de usuario de tu e-commerce actual, revisar tu consistencia de marca y estructurar un plan estratégico de modernización.',
    price: 180000,
    category: 'Asesoría',
    iconName: 'Compass',
    details: [
      'Análisis profundo en vivo vía Google Meet o presencial en nuestro taller.',
      'Informe ejecutivo en PDF con diagnóstico y 10 pasos de mejora inmediata.',
      'Herramientas y referencias tipográficas / visuales recomendadas.',
      'Grabación completa de la sesión para revisión futura.'
    ]
  }
];

export const MOCK_REVIEW_PROJECTS: PortfolioItem[] = [
  {
    id: 'port-1',
    name: 'E-Commerce La Sombra',
    client: 'La Sombra Sombreros de Autor',
    category: 'Diseño & E-commerce',
    description: 'Rediseño de sistema identitario y desarrollo de tienda Shopify premium para la afamada sombrerería de autor de Viña del Mar.',
    image: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&q=80&w=800',
    problem: 'La tienda anterior no reflejaba el carácter artesanal y sofisticado de sombreros de alto valor. Se sentía fría e idéntica a cualquier otra e-commerce común de plantillas.',
    solution: 'Implementamos un concepto editorial minimalista tipo "editorial de moda", con una tipografía serif generosa, márgenes amplios de respiración y una paleta color arcilla cálido que destaca los pliegues y telas del producto.',
    stack: ['Shopify Liquid', 'Figma', 'Playfair', 'Tailwind CSS'],
    result: 'Aumento del 42% en el ticket promedio por compra y una tasa de rebote reducida a la mitad en el primer mes de lanzamiento de la nueva web.',
    mockType: 'notebook'
  },
  {
    id: 'port-2',
    name: 'Identidad y Packaging Licores del Sur',
    client: 'Destilería Mapuche-Fusión',
    category: 'Branding & Packaging',
    description: 'Creación de marca y set de etiquetas premium ilustradas para licores nativos chilenos con toques frutales silvestres.',
    image: 'https://images.unsplash.com/photo-1511556532299-8f662fc26c06?auto=format&fit=crop&q=80&w=800',
    problem: 'Necesitaban ingresar a hoteles boutique y tiendas de aeropuerto, por lo que el antiguo envase rústico quedaba desalineado con el nicho de lujo extranjero.',
    solution: 'Desarrollamos ilustraciones xilográficas digitales de aves endémicas, impresas con relieve táctil plateado y hot stamping cobre sobre papel anti-humedad texturizado.',
    stack: ['Adobe Illustrator', 'Grabado Digital', 'Diseño de Troquel', 'Papel Arconvert'],
    result: 'Seleccionado en los premios de diseño de packaging chilenos y posicionamiento exitoso en 12 restaurantes de primer nivel en el sur de Chile.',
    mockType: 'mobile'
  },
  {
    id: 'port-3',
    name: 'Plataforma Digital Estudio Coihue',
    client: 'Coihue Arquitectura y Territorio',
    category: 'Desarrollo Web',
    description: 'Portafolio minimalista interactivo con carga diferida e interacción 2D para un reconocido estudio sureño de bioconstrucción.',
    image: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&q=80&w=800',
    problem: 'El portafolio era sumamente pesado en imágenes de obra terminada, provocando lentitud crítica en dispositivos móviles que arruinaba la retención de clientes.',
    solution: 'Diseño interactivo basado en transiciones suaves, compresión webp automática y un portafolio de baja latencia con planos técnicos superpuestos con hover dinámico.',
    stack: ['Next.js', 'React', 'Framer Motion', 'Tailwind CSS'],
    result: 'Puntuación Lighthouse móvil del 98/100 y navegación de obras de forma ininterrumpida sin recargas, optimizando su embudo de cotizaciones premium.',
    mockType: 'notebook'
  },
  {
    id: 'port-4',
    name: 'Branding Completo "Cafetín"',
    client: 'Cafetín Especialidad & Letras',
    category: 'Branding',
    description: 'Desarrollo de ecosistema de marca para cafetería-librería en el casco histórico y costero de Viña del Mar.',
    image: 'https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?auto=format&fit=crop&q=80&w=800',
    problem: 'Un mercado saturado de cafeterías industriales requería levantar una impronta con personalidad, que hiciera énfasis directo en la literatura y la pausa analógica.',
    solution: 'Creamos un monograma tipográfico retro-moderno elegante, servilletas impresas con poesías breves y un sistema de vasos sustentables teñidos con pigmentos naturales de siena.',
    stack: ['Identidad Visual', 'Tipografía Editorial', 'Impresión Sustentable'],
    result: 'Establecimiento convertido en epicentro cultural de la comuna, con colas de espera los fines de semana y viralización natural en Instagram.',
    mockType: 'mobile'
  }
];

export const MOCK_ORDERS: Order[] = [
  {
    id: 'PED-4021',
    date: '2026-06-19',
    customerName: 'Catalina Sepúlveda',
    customerEmail: 'catasep@gmail.com',
    customerPhone: '+56 9 8452 1192',
    type: 'boleta',
    address: 'Avenida Libertad 1045, Depto 502',
    commune: 'Viña del Mar',
    city: 'Viña del Mar',
    subtotal: 40980,
    shippingFee: 3990,
    total: 44970,
    status: 'En preparación',
    items: [
      {
        productId: 'prod-1',
        productName: 'Soporte de Escritorio Geométrico - Impresión 3D',
        quantity: 1,
        price: 24990,
        variant: 'PLA Terracota'
      },
      {
        productId: 'prod-2',
        productName: 'Bolsa Organizadora de Costura "Bananur Taller"',
        quantity: 1,
        price: 15990,
        variant: 'Algodón Crudo'
      }
    ]
  },
  {
    id: 'FAC-4022',
    date: '2026-06-18',
    customerName: 'Roberto Fuentes',
    customerEmail: 'roberto@estudiosigma.cl',
    customerPhone: '+56 9 9331 4055',
    type: 'factura',
    taxId: '76.492.311-K',
    businessName: 'Inversiones y Estudios Sigma SpA',
    businessLine: 'Servicios de Diseño e Informática',
    address: 'Falcón 2011, Bodega B4',
    commune: 'Las Condes',
    city: 'Santiago',
    subtotal: 195960,
    shippingFee: 4990,
    total: 200950,
    status: 'Enviado',
    items: [
      {
        productId: 'prod-5',
        productName: "Estuche de Costura de Autor en Algodón d'Ischia",
        quantity: 4,
        price: 48990,
        variant: 'Estampado Ischia Azul'
      }
    ]
  },
  {
    id: 'PED-4023',
    date: '2026-06-16',
    customerName: 'Manuel Sanhueza',
    customerEmail: 'manuelsanhueza@gmail.com',
    customerPhone: '+56 9 7220 1833',
    type: 'boleta',
    address: 'Camino El Venado 3120',
    commune: 'San Pedro de la Paz',
    city: 'Concepción',
    subtotal: 37000,
    shippingFee: 6500,
    total: 43500,
    status: 'Entregado',
    items: [
      {
        productId: 'prod-3',
        productName: 'Amigurumi de Jirafa "Tierra Dulce" - Crochet Premium',
        quantity: 2,
        price: 18500,
        variant: 'Mostaza & Arena'
      }
    ]
  }
];

export const MOCK_CONSULTATIONS: Consultation[] = [
  {
    id: 'con-1',
    clientName: 'Daniela Almonacid',
    clientEmail: 'daniela.a@boutiqueflor.cl',
    clientPhone: '+56 9 4488 2021',
    date: '2026-06-22',
    time: '11:00',
    duration: '60 min',
    topic: 'Identidad Visual & Packaging Cosmética Orgánica',
    status: 'Agendada',
    videoLink: 'https://meet.google.com/abc-defg-hij'
  },
  {
    id: 'con-2',
    clientName: 'Andrés Vicuña',
    clientEmail: 'av@vicunavinos.cl',
    clientPhone: '+56 9 5551 0920',
    date: '2026-06-24',
    time: '15:30',
    duration: '60 min',
    topic: 'E-commerce Migración Shopify & Pasarela',
    status: 'Agendada',
    videoLink: 'https://meet.google.com/xyz-lmno-pqr'
  },
  {
    id: 'con-3',
    clientName: 'María Paz Silva',
    clientEmail: 'mpaz.silva@outlook.com',
    date: '2026-06-20', // today/past
    time: '17:00',
    duration: '60 min',
    topic: 'Asesoría Rápida: Redes & Tipografías',
    status: 'Bloqueada',
    videoLink: ''
  }
];

export const MOCK_FAQ = [
  {
    id: 'faq-1',
    question: '¿Cuánto tardan los despachos a regiones en Chile y qué empresa utilizan?',
    answer: 'Nuestros envíos se despachan directamente desde nuestra tienda principal y taller en Viña del Mar. Para las comunas de Viña del Mar y la Región de Valparaíso demoran entre 24 y 48 horas hábiles. Para la Región Metropolitana y demás regiones de Chile utilizamos Starken y Blue Express, con un plazo promedio de 48 a 72 horas hábiles, entregando siempre un enlace de seguimiento en tiempo real al correo registrado.'
  },
  {
    id: 'faq-3',
    question: '¿Efectúan facturas comerciales con IVA a empresas (Factura Exenta/Afecta)?',
    answer: 'Sí, absolutamente. En el paso final del checkout puedes conmutar el switch de Boleta a Factura. Deberás completar el RUT de la empresa, Razón Social, Giro de actividad y domicilio tributario. El documento fiscal se emite automáticamente integrado con el SII y llega a tu casilla fiscal.'
  },
  {
    id: 'faq-4',
    question: '¿Cómo funciona el Cotizador Digital para proyectos de diseño o desarrollo?',
    answer: 'Es muy simple e interactivo. Dirígete a la sección "Cotizar", selecciona el tipo de requerimiento o servicio que necesitas (Branding, Web, Packaging, Asesoría), define tu presupuesto estimado junto a los plazos requeridos de entrega, y añade tu información de contacto. El depto. técnico de Bananur analizará la solicitud y te contactará con una propuesta detallada en un plazo menor a 24 horas.'
  },
  {
    id: 'faq-5',
    question: '¿Son productos importados o los manufacturan a nivel local?',
    answer: 'Tenemos un compromiso irrestricto con la producción ética local. El 100% de los insumos y piezas de impresión 3D, confección de costura y tejidos crochet de Bananur se manufactura de forma semi-artesanal en nuestro taller central de Viña del Mar, apoyando a operarios e hilanderas locales de la Región de Valparaíso.'
  },
  {
    id: 'faq-6',
    question: '¿Puedo cambiar o devolver un artículo si compré por error?',
    answer: 'Claro que sí. Ofrecemos una garantía de satisfacción de 30 días para todos nuestros productos físicos. Para solicitar el cambio o devolución, el artículo debe estar sin uso, en su empaque original de tela o cartón kraft protector de fábrica. Contáctanos a contacto@bananur.cl indicando el número de tu boleta.'
  },
  {
    id: 'faq-2',
    question: '¿Tienen una tienda boutique física o taller donde pueda retirar gratis?',
    answer: 'Nuestra tienda boutique principal y taller creativo opera en la ciudad de Viña del Mar (sector poniente / 1 Norte). Puedes seleccionar "Retiro en Tienda / Taller" de manera gratuita en checkout. Una vez que tu pedido esté listo, recibirás un correo dándote las indicaciones con el pin de acceso y el horario de atención.'
  }
];

export const MOCK_WORKSTATIONS: Workstation[] = [
  {
    id: 'ws-3d',
    code: 'WS-3D-01',
    name: 'Estación de Impresión 3D con OctoPrint',
    type: 'impresion3d',
    responsible: 'Yo • Operador Único',
    description: 'Manufactura aditiva FDM de alta resolución con conexión a servidor OctoPrint Daemon, calibración Marlin y perfiles térmicos PLA/PETG.',
    isActive: true,
    icon: '🖨️',
    badge: 'OctoPrint & Marlin',
    octoConfig: {
      url: 'http://octopi.local:5000',
      apiKey: '',
      printerModel: 'Creality Ender 3 S1 Pro Direct Drive',
      baudRate: '115200'
    }
  },
  {
    id: 'ws-design',
    code: 'WS-DSN-01',
    name: 'Estación de Diseño Creativo & Moldería Digital',
    type: 'diseno',
    responsible: 'Yo • Operador Único',
    description: 'Mesa digital de moldería, dibujo técnico vectorial 1:1, preparación de patrones y archivos técnicos listos para corte láser y plotter.',
    isActive: true,
    icon: '✏️',
    badge: 'Mesa Vectorial 1:1',
    designConfig: {
      softwareEnvironment: 'VectorCAD & Inkscape Studio',
      defaultCanvasScale: 'Escala 1:1 (mm)',
      defaultFileFormat: 'SVG / DXF / Sketch'
    }
  },
  {
    id: 'ws-sewing',
    code: 'WS-SEW-01',
    name: 'Estación de Costura Fina & Moldería',
    type: 'costura',
    responsible: 'Yo • Operador Único',
    description: 'Pespuntes de carga pesada, unión de lonas de 14oz, calibración de barra de prensatelas, control de arrastre y consumo textil.',
    isActive: true,
    icon: '🧵',
    badge: 'Lona & Algodón',
    sewingConfig: {
      machineModel: 'Juki DDL-8700 Industrial Recta Servomotor',
      defaultNeedle: 'Universal 90/14 (Lona y Algodón)',
      defaultTension: 4.5,
      presserFoot: 'Prensatelas Estándar de Acero',
      stitchLength: '3.0 mm (Pespunte de Carga)',
      feedDogPressure: 'Firme (3.5 kg para lona)',
      operatingHours: 42,
      lastServiceDate: '2026-09-15'
    }
  },
  {
    id: 'ws-crochet',
    code: 'WS-CRO-01',
    name: 'Estación de Crochet & Tejidos Artesanales',
    type: 'crochet',
    responsible: 'Yo • Operador Único',
    description: 'Tejido manual minucioso de ganchillo crochet, amigurumis de autor, contadores digitales de hileras y puntos.',
    isActive: true,
    icon: '🧶',
    badge: 'Labor Manual',
    crochetConfig: {
      defaultHook: '3.5 mm',
      preferredYarnWeight: 'Algodón 4 Hebras (Chilote)'
    }
  }
];

export const MOCK_TECHNICAL_SKETCHES: TechnicalSketch[] = [
  {
    id: 'sk-1',
    name: 'Boceto_Bolso_Tote_Lona_V2.sketch',
    format: '.sketch',
    category: 'Patrón de Moldería',
    scale: '1:1 Real (mm)',
    date: '2026-09-28',
    size: '2.4 MB',
    status: 'Listo para Plotter',
    notes: 'Incluye despiece con margen de costura de 1.5 cm francesa y refuerzo de asas.'
  },
  {
    id: 'sk-2',
    name: 'Soporte_Geometrico_Modular_3D.dxf',
    format: '.dxf',
    category: 'Corte Láser',
    scale: '1:1 Real (mm)',
    date: '2026-09-25',
    size: '1.8 MB',
    status: 'Aprobado para Taller',
    notes: 'Vector cerrado optimizado para corte en acrílico 3mm o corte en cuero.'
  },
  {
    id: 'sk-3',
    name: 'Chaqueta_Kimono_Vintage_Despiece.svg',
    format: '.svg',
    category: 'Patrón de Moldería',
    scale: '1:1 Real (mm)',
    date: '2026-09-20',
    size: '3.6 MB',
    status: 'Boceto Activo',
    notes: 'Gradación de moldería unisex y marcas de piquetes para canesú delantero.'
  },
  {
    id: 'sk-4',
    name: 'Organizador_Ganchillo_Pro_Ficha.pdf',
    format: '.pdf',
    category: 'Ficha Técnica',
    scale: '1:2 Prototipo',
    date: '2026-09-18',
    size: '890 KB',
    status: 'Aprobado para Taller',
    notes: 'Ficha de producción con secuencia operacional de costura y tolerancias.'
  },
  {
    id: 'sk-5',
    name: 'Carcasa_Amigurumi_Base_Solid.blend',
    format: '.blend',
    category: 'Prototipo 3D',
    scale: '1:1 Real (mm)',
    date: '2026-09-15',
    size: '5.2 MB',
    status: 'En Revisión',
    notes: 'Esqueleto interno impreso en PLA para articulación de amigurumis grandes.'
  }
];
