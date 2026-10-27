import { EmailMessage } from '../services/gmailService';

export const MOCK_COMPANY_EMAILS: EmailMessage[] = [
  {
    id: 'msg-local-1',
    threadId: 'thread-1',
    snippet: 'Hola equipo Bananur, quisiéramos coordinar el retiro presencial de los soportes 3D en el taller de 1 Norte en Viña del Mar...',
    internalDate: '1780512000000',
    labelIds: ['INBOX', 'UNREAD'],
    from: 'Camila Valenzuela <camila.valenzuela@estudiovina.cl>',
    fromName: 'Camila Valenzuela',
    fromEmail: 'camila.valenzuela@estudiovina.cl',
    to: 'contacto@bananur.cl',
    subject: 'Coordinación Retiro en Taller de Viña del Mar (Pedido #PED-4021)',
    date: 'Hoy, 10:14 hrs',
    bodyHtml: `
      <p>Estimado equipo de <strong>Bananur</strong>,</p>
      <p>Espero que se encuentren muy bien. Les escribo porque recibimos la confirmación de que nuestro pedido de soportes de escritorio geométricos en PLA terracota ya pasó por la etapa de manufactura y empaque.</p>
      <p>Quisiéramos saber si podemos pasar a retirar hoy viernes antes de las 18:00 hrs a su taller principal ubicado en <strong>1 Norte 450 (Sector Poniente), Viña del Mar</strong>.</p>
      <p>Quedo atenta a sus indicaciones y al código PIN para el acceso.</p>
      <br/>
      <p>Saludos cordiales,<br/><strong>Camila Valenzuela</strong><br/>Directora Creativa • Estudio Viña</p>
    `,
    bodyText: 'Estimado equipo de Bananur,\n\nEspero que se encuentren muy bien. Les escribo porque recibimos la confirmación...',
    isUnread: true,
    isStarred: true,
    hasAttachment: false
  },
  {
    id: 'msg-local-2',
    threadId: 'thread-2',
    snippet: 'Adjunto las especificaciones de moldería y las medidas requeridas para el lote de bolsas organizadoras en lona de algodón...',
    internalDate: '1780490000000',
    labelIds: ['INBOX', 'UNREAD'],
    from: 'Felipe Correa <felipe@textilesdelvalle.cl>',
    fromName: 'Felipe Correa',
    fromEmail: 'felipe@textilesdelvalle.cl',
    to: 'contacto@bananur.cl',
    subject: 'Cotización Lote 80 Estuches de Costura con vivo en contraste',
    date: 'Ayer, 16:42 hrs',
    bodyHtml: `
      <p>Hola Nicolás y equipo de taller Bananur,</p>
      <p>Vimos las piezas confeccionadas en su estación de costura fina y nos encantó la terminación de costura francesa reforzada con hilo torzal #40.</p>
      <p>Necesitamos cotizar la confección de 80 estuches con cierre metálico empotrado para la convención de diseño boutique en Valparaíso.</p>
      <p>¿Tienen disponibilidad en su línea de confección textil para entrega durante la última semana de este mes?</p>
      <br/>
      <p>Un abrazo,<br/><strong>Felipe Correa</strong></p>
    `,
    bodyText: 'Hola Nicolás y equipo de taller Bananur,\n\nVimos las piezas confeccionadas en su estación de costura...',
    isUnread: true,
    isStarred: false,
    hasAttachment: true
  },
  {
    id: 'msg-local-3',
    threadId: 'thread-3',
    snippet: 'El comprobante de transferencia por la consultoría de UX e Identidad Digital fue procesado exitosamente por nuestro departamento de finanzas...',
    internalDate: '1780410000000',
    labelIds: ['INBOX'],
    from: 'Loreto San Martín <loreto@cafetinletras.cl>',
    fromName: 'Loreto San Martín',
    fromEmail: 'loreto@cafetinletras.cl',
    to: 'contacto@bananur.cl',
    subject: 'Comprobante de Transferencia • Consultoría Branding Cafetín',
    date: '28 Sep, 11:20 hrs',
    bodyHtml: `
      <p>Hola Constanza,</p>
      <p>Adjuntamos el comprobante bancario correspondiente al 50% de anticipo para el inicio del proyecto de rediseño identitario y papelería ecológica de nuestra cafetería en Viña del Mar.</p>
      <p>Quedamos muy contentos con el moodboard que nos presentaron y esperamos con ansias la primera sesión de revisión de bocetos.</p>
      <br/>
      <p>Muchos cariños,<br/><strong>Loreto San Martín</strong></p>
    `,
    bodyText: 'Hola Constanza,\n\nAdjuntamos el comprobante bancario correspondiente al 50% de anticipo...',
    isUnread: false,
    isStarred: true,
    hasAttachment: true
  },
  {
    id: 'msg-local-4',
    threadId: 'thread-4',
    snippet: 'Notificación de emisión de Factura Electrónica N° 48192 por parte de Proveedor Cartones Viña SpA...',
    internalDate: '1780300000000',
    labelIds: ['INBOX'],
    from: 'Facturación Electrónica <dte@cartonesvina.cl>',
    fromName: 'Cartones Viña SpA',
    fromEmail: 'dte@cartonesvina.cl',
    to: 'contacto@bananur.cl',
    subject: 'DTE Factura Electrónica N° 48192 • Insumos de Embalaje Kraft',
    date: '26 Sep, 09:15 hrs',
    bodyHtml: `
      <p>Señores <strong>Papelería, Diseño & Tecnología SpA (Bananur)</strong>:</p>
      <p>Se ha emitido el Documento Tributario Electrónico correspondiente a su orden de compra de cajas autoarmables microcorrugadas recicladas.</p>
      <p>RUT Receptor: 76.844.200-K<br/>Monto Total: $78.000 CLP (IVA Incluido)<br/>Lugar de entrega: Taller 1 Norte 450, Viña del Mar.</p>
    `,
    bodyText: 'Señores Papelería, Diseño & Tecnología SpA (Bananur)...',
    isUnread: false,
    isStarred: false,
    hasAttachment: true
  }
];
