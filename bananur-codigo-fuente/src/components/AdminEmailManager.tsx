import React, { useState, useEffect, useMemo } from 'react';
import { 
  Mail, 
  Inbox, 
  Send, 
  Star, 
  Trash2, 
  Archive, 
  RefreshCw, 
  Search, 
  Plus, 
  Reply, 
  Forward, 
  Check, 
  X, 
  AlertCircle, 
  Paperclip, 
  Clock, 
  ExternalLink, 
  ShieldCheck, 
  Sparkles, 
  UserCheck, 
  LogOut,
  ChevronLeft,
  FileText,
  Settings,
  Server,
  Key,
  Globe,
  CheckCircle2,
  Lock,
  Eye,
  EyeOff,
  User,
  Sliders,
  HelpCircle,
  MessageSquare,
  Copy,
  Terminal,
  Info,
  Shield,
  CheckCheck,
  FolderPlus,
  Folder,
  Tag,
  Edit2,
  Bookmark,
  Layers,
  ArrowRight
} from 'lucide-react';
import { User as FirebaseUser } from 'firebase/auth';
import { 
  initAuth, 
  googleSignIn, 
  logout, 
  getAccessToken, 
  getCurrentUser 
} from '../services/googleAuth';
import { 
  EmailMessage, 
  fetchGmailMessages, 
  fetchGmailMessageDetail, 
  sendGmailMessage, 
  trashGmailMessage, 
  markGmailAsRead, 
  toggleGmailStar 
} from '../services/gmailService';
import { MOCK_COMPANY_EMAILS } from '../data/mockEmails';
import { CustomMailbox, EmailTemplate } from '../types';

export interface CustomDomainEmailConfig {
  email: string;
  displayName: string;
  replyTo: string;
  incomingHost: string;
  incomingPort: number;
  incomingSecurity: 'SSL/TLS' | 'STARTTLS';
  outgoingHost: string;
  outgoingPort: number;
  outgoingSecurity: 'SSL/TLS' | 'STARTTLS' | 'NONE';
  username: string;
  password: string;
  signature: string;
  isConnected: boolean;
  lastTested?: string;
}

export interface DnsRecordItem {
  id: string;
  type: 'TXT' | 'MX' | 'CNAME';
  name: string;
  value: string;
  priority?: number;
  description: string;
  status: 'valid' | 'warning' | 'pending';
  tag: 'SPF' | 'DKIM' | 'DMARC' | 'MX';
  details: string;
}

const DEFAULT_DOMAIN_CONFIG: CustomDomainEmailConfig = {
  email: 'contacto@bananur.cl',
  displayName: 'Bananur Chile • Taller & Boutique Viña del Mar',
  replyTo: 'contacto@bananur.cl',
  incomingHost: 'mail.bananur.cl',
  incomingPort: 993,
  incomingSecurity: 'SSL/TLS',
  outgoingHost: 'mail.bananur.cl',
  outgoingPort: 465,
  outgoingSecurity: 'SSL/TLS',
  username: 'contacto@bananur.cl',
  password: '••••••••••••',
  signature: `--
Equipo Bananur Chile
📍 Taller Creativo & Tienda Principal: 1 Norte 450 (Sector Poniente), Viña del Mar, Región de Valparaíso
📞 Teléfono / WhatsApp: +56 9 8472 9104 | ✉️ contacto@bananur.cl
🌐 https://bananur.cl`,
  isConnected: true,
  lastTested: 'Hoy a las 09:30 hrs'
};

const DEFAULT_TEMPLATES: EmailTemplate[] = [
  {
    id: 'tpl-1',
    title: '📦 Retiro en Taller Viña del Mar',
    category: 'Clientes & Retiro',
    subject: 'Indicaciones de Retiro en Taller • Bananur Viña del Mar',
    body: `Hola {cliente},\n\n¡Tu pedido ya está listo para ser retirado en nuestra tienda principal y taller creativo!\n\n📍 Dirección: 1 Norte 450 (Sector Poniente), Viña del Mar, Región de Valparaíso\n🕒 Horario de Atención: Lunes a Viernes de 09:00 a 18:30 hrs\n🔑 Código PIN de Retiro: {pin}\n\nAl llegar, favor timbrar en recepción técnica. ¡Te esperamos con gusto!\n\nAtentamente,\nEquipo Bananur Chile\ncontacto@bananur.cl`,
    isSystem: true,
    lastEdited: 'Original'
  },
  {
    id: 'tpl-2',
    title: '📐 Cotización de Moldería & Confección',
    category: 'Ventas & Cotizaciones',
    subject: 'Propuesta Técnica y Cotización • Bananur Taller Textil',
    body: `Estimad@ {cliente},\n\nMuchas gracias por contactar a Bananur Viña del Mar. Hemos evaluado tu requerimiento de moldería digital y confección para tu lote de prendas.\n\nContamos con capacidad operativa en nuestra estación de costura fina para corte, remache e hilvanado industrial con hilos torzal certificados. ¿Podríamos coordinar una breve llamada o visita técnica a nuestro taller en Viña del Mar esta semana?\n\nSaludos cordiales,\nConstanza Silva • Dirección de Diseño\nBananur SpA`,
    isSystem: true,
    lastEdited: 'Original'
  },
  {
    id: 'tpl-3',
    title: '🧵 Estado de Producción & Despacho',
    category: 'Producción & Taller',
    subject: 'Actualización de Producción • Taller Bananur Viña del Mar',
    body: `Hola {cliente},\n\nTe informamos que tu partida ya entró a la fase de ensamblado y control de calidad en nuestras estaciones de trabajo.\n\nEl despacho hacia tu dirección está programado dentro de las próximas 24 a 48 horas hábiles con número de seguimiento asignado.\n\nQuedamos a tu entera disposición.\n\nTaller de Confección Bananur`,
    isSystem: true,
    lastEdited: 'Original'
  },
  {
    id: 'tpl-4',
    title: '🚚 Confirmación de Envío Courier',
    category: 'Envíos & Logística',
    subject: 'Tu pedido Bananur va en camino • Código de Seguimiento',
    body: `Hola {cliente},\n\nTe confirmamos que tu paquete fue entregado al courier Starken / Chilexpress desde nuestro centro de despacho en Viña del Mar.\n\n📦 Número de Transporte: STK-849204\n🚚 Destino: {comuna}, Región {region}\n\nPuedes hacer seguimiento directo en el portal del transportista con este número.\n\n¡Muchas gracias por apoyar la manufactura artesanal chilena!\nEquipo Bananur`,
    isSystem: false,
    lastEdited: 'Reciente'
  }
];

const DEFAULT_CUSTOM_MAILBOXES: CustomMailbox[] = [
  {
    id: 'mbx-cotizaciones',
    name: 'Cotizaciones Viña',
    category: 'Clientes',
    color: '#B58455',
    icon: 'Bookmark',
    description: 'Solicitudes de presupuestos para diseño y manufactura',
    createdAt: 'Sistema'
  },
  {
    id: 'mbx-proveedores',
    name: 'Proveedores Telas & 3D',
    category: 'Proveedores',
    color: '#22C55E',
    icon: 'Layers',
    description: 'Facturas e insumos de materias primas',
    createdAt: 'Sistema'
  },
  {
    id: 'mbx-urgentes',
    name: 'Urgentes Taller',
    category: 'Taller',
    color: '#EF4444',
    icon: 'AlertCircle',
    description: 'Avisos con prioridad alta para producción inmediata',
    createdAt: 'Sistema'
  }
];

const PRESET_ACCOUNTS = [
  { email: 'contacto@bananur.cl', label: 'Contacto General & Clientes' },
  { email: 'taller@bananur.cl', label: 'Taller de Confección & 3D' },
  { email: 'ventas@bananur.cl', label: 'Cotizaciones & Ventas Corporativas' }
];

const MAILBOX_COLORS = [
  { name: 'Terracota Bananur', hex: '#B58455' },
  { name: 'Verde Bosque', hex: '#166534' },
  { name: 'Oro Estudio', hex: '#D97706' },
  { name: 'Coral Urgente', hex: '#EF4444' },
  { name: 'Azul Marino', hex: '#1E3A8A' },
  { name: 'Carbón Minimal', hex: '#27272A' },
  { name: 'Púrpura Boutique', hex: '#7E22CE' }
];

interface AdminEmailManagerProps {
  onShowToast?: (title: string, message: string, type?: 'success' | 'error' | 'info') => void;
  onNavigateToSettings?: (subtab?: string) => void;
}

export default function AdminEmailManager({ onShowToast, onNavigateToSettings }: AdminEmailManagerProps) {
  // Main View: 'mail' (Bandeja / Lector) or 'templates' (Gestor de Plantillas)
  const [currentView, setCurrentView] = useState<'mail' | 'templates'>('mail');

  // Mode selection: 'domain' (Dominio Propio Bananur) or 'google' (Google Workspace)
  const [providerMode, setProviderMode] = useState<'domain' | 'google'>('domain');

  // Custom Domain Configuration State with persistent local storage
  const [domainConfig, setDomainConfig] = useState<CustomDomainEmailConfig>(() => {
    try {
      const saved = localStorage.getItem('bananur_domain_email_config');
      return saved ? JSON.parse(saved) : DEFAULT_DOMAIN_CONFIG;
    } catch {
      return DEFAULT_DOMAIN_CONFIG;
    }
  });

  // Google Authentication states
  const [currentUser, setCurrentUser] = useState<FirebaseUser | null>(() => getCurrentUser());
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [isAuthenticating, setIsAuthenticating] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);

  // Folder and view navigation: supports standard folders or custom mailbox ID
  const [activeFolder, setActiveFolder] = useState<string>('INBOX');
  const [selectedMessage, setSelectedMessage] = useState<EmailMessage | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  // Messages list state with localStorage persistence
  const [messages, setMessages] = useState<EmailMessage[]>(() => {
    try {
      const saved = localStorage.getItem('bananur_corporate_emails');
      if (saved) {
        return JSON.parse(saved);
      }
    } catch {
      // fallback
    }
    return MOCK_COMPANY_EMAILS;
  });

  const [isLoadingMessages, setIsLoadingMessages] = useState(false);

  // Compose / Reply modal states
  const [isComposeOpen, setIsComposeOpen] = useState(false);
  const [composeFrom, setComposeFrom] = useState(domainConfig.email);
  const [composeTo, setComposeTo] = useState('');
  const [composeSubject, setComposeSubject] = useState('');
  const [composeBody, setComposeBody] = useState('');
  const [composeThreadId, setComposeThreadId] = useState<string | undefined>(undefined);
  const [isSending, setIsSending] = useState(false);

  // ==========================================
  // CUSTOM MAILBOXES STATE & CRUD
  // ==========================================
  const [customMailboxes, setCustomMailboxes] = useState<CustomMailbox[]>(() => {
    try {
      const saved = localStorage.getItem('bananur_custom_mailboxes');
      return saved ? JSON.parse(saved) : DEFAULT_CUSTOM_MAILBOXES;
    } catch {
      return DEFAULT_CUSTOM_MAILBOXES;
    }
  });

  const [isMailboxModalOpen, setIsMailboxModalOpen] = useState(false);
  const [editingMailbox, setEditingMailbox] = useState<CustomMailbox | null>(null);
  const [newMailboxName, setNewMailboxName] = useState('');
  const [newMailboxCategory, setNewMailboxCategory] = useState('Clientes');
  const [newMailboxColor, setNewMailboxColor] = useState('#B58455');
  const [newMailboxDescription, setNewMailboxDescription] = useState('');

  // Save custom mailboxes to localStorage
  useEffect(() => {
    try {
      localStorage.setItem('bananur_custom_mailboxes', JSON.stringify(customMailboxes));
    } catch (e) {
      console.warn('Could not save custom mailboxes', e);
    }
  }, [customMailboxes]);

  // ==========================================
  // EMAIL TEMPLATES STATE & CRUD
  // ==========================================
  const [templates, setTemplates] = useState<EmailTemplate[]>(() => {
    try {
      const saved = localStorage.getItem('bananur_email_templates');
      return saved ? JSON.parse(saved) : DEFAULT_TEMPLATES;
    } catch {
      return DEFAULT_TEMPLATES;
    }
  });

  const [isTemplateModalOpen, setIsTemplateModalOpen] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState<EmailTemplate | null>(null);
  const [templateTitle, setTemplateTitle] = useState('');
  const [templateCategory, setTemplateCategory] = useState('General');
  const [templateSubject, setTemplateSubject] = useState('');
  const [templateBody, setTemplateBody] = useState('');
  const [templateSearch, setTemplateSearch] = useState('');

  // Save templates to localStorage
  useEffect(() => {
    try {
      localStorage.setItem('bananur_email_templates', JSON.stringify(templates));
    } catch (e) {
      console.warn('Could not save templates', e);
    }
  }, [templates]);

  // Mandatory confirmation dialog states
  const [confirmDialog, setConfirmDialog] = useState<{
    isOpen: boolean;
    title: string;
    description: string;
    actionLabel: string;
    isDestructive?: boolean;
    onConfirm: () => void;
  }>({
    isOpen: false,
    title: '',
    description: '',
    actionLabel: 'Confirmar',
    onConfirm: () => {}
  });

  // Save messages to localStorage whenever they change
  useEffect(() => {
    try {
      localStorage.setItem('bananur_corporate_emails', JSON.stringify(messages));
    } catch (e) {
      console.warn('Could not save emails to localStorage:', e);
    }
  }, [messages]);

  // Synchronize composeFrom with domainConfig email when config changes
  useEffect(() => {
    if (providerMode === 'domain') {
      setComposeFrom(domainConfig.email);
    } else if (currentUser?.email) {
      setComposeFrom(currentUser.email);
    }
  }, [domainConfig.email, providerMode, currentUser]);

  // Google Login listener
  useEffect(() => {
    const unsubscribe = initAuth(
      (user, token) => {
        setCurrentUser(user);
        setAccessToken(token);
        if (providerMode === 'google') {
          loadLiveGmailMessages(token, activeFolder);
        }
      },
      () => {
        setCurrentUser(null);
        setAccessToken(null);
      }
    );

    return () => {
      unsubscribe();
    };
  }, [providerMode]);

  const loadLiveGmailMessages = async (token: string, folder: string) => {
    setIsLoadingMessages(true);
    try {
      let labelParam = 'INBOX';
      if (folder === 'SENT') labelParam = 'SENT';
      if (folder === 'STARRED') labelParam = 'STARRED';
      if (folder === 'DRAFT') labelParam = 'DRAFT';
      if (folder === 'TRASH') labelParam = 'TRASH';

      const list = await fetchGmailMessages(token, {
        label: labelParam,
        query: searchQuery,
        maxResults: 20
      });

      setMessages(list);
    } catch (err: any) {
      console.warn('Error cargando correos Gmail:', err);
    } finally {
      setIsLoadingMessages(false);
    }
  };

  const handleRefresh = () => {
    setIsLoadingMessages(true);
    if (providerMode === 'google' && accessToken) {
      loadLiveGmailMessages(accessToken, activeFolder);
    } else {
      setTimeout(() => {
        setIsLoadingMessages(false);
        if (onShowToast) {
          onShowToast('Bandeja Sincronizada', `Sincronización con ${domainConfig.incomingHost} completada.`, 'info');
        }
      }, 400);
    }
  };

  const handleSelectMessage = async (msg: EmailMessage) => {
    setSelectedMessage(msg);
    if (msg.isUnread) {
      setMessages(prev => prev.map(m => m.id === msg.id ? { ...m, isUnread: false } : m));
      if (providerMode === 'google' && accessToken) {
        try {
          await markGmailAsRead(accessToken, msg.id);
        } catch (e) {
          console.warn('Error marcando leído en Gmail:', e);
        }
      }
    }
  };

  const handleToggleStar = async (e: React.MouseEvent, msg: EmailMessage) => {
    e.stopPropagation();
    const newStar = !msg.isStarred;
    setMessages(prev => prev.map(m => m.id === msg.id ? { ...m, isStarred: newStar } : m));
    if (selectedMessage && selectedMessage.id === msg.id) {
      setSelectedMessage(prev => prev ? { ...prev, isStarred: newStar } : null);
    }
  };

  // Open Compose Modal
  const handleOpenCompose = (initialTo = '', initialSubject = '', initialBody = '', threadId?: string) => {
    setComposeTo(initialTo);
    setComposeSubject(initialSubject);
    setComposeBody(initialBody || `\n\n${domainConfig.signature}`);
    setComposeThreadId(threadId);
    setComposeFrom(providerMode === 'domain' ? domainConfig.email : (currentUser?.email || domainConfig.email));
    setIsComposeOpen(true);
  };

  // Reply handler
  const handleReplyMessage = (msg: EmailMessage) => {
    const to = msg.fromEmail || msg.from;
    const subject = msg.subject.startsWith('Re:') ? msg.subject : `Re: ${msg.subject}`;
    const quoted = `\n\n--- El ${msg.date}, ${msg.fromName || msg.from} escribió: ---\n> ${msg.bodyText || msg.snippet}\n\n${domainConfig.signature}`;
    handleOpenCompose(to, subject, quoted, msg.threadId);
  };

  // Move or tag message to custom mailbox
  const handleMoveToCustomMailbox = (msgId: string, mailboxId: string) => {
    setMessages(prev => prev.map(m => {
      if (m.id === msgId) {
        // Add or switch custom mailbox label
        const currentLabels = m.labelIds.filter(l => !l.startsWith('mbx-'));
        return {
          ...m,
          labelIds: [...currentLabels, mailboxId]
        };
      }
      return m;
    }));
    const targetMbx = customMailboxes.find(b => b.id === mailboxId);
    if (onShowToast) {
      onShowToast('Mensaje Asignado', `El correo fue movido al buzón "${targetMbx?.name || 'Personalizado'}".`, 'success');
    }
  };

  // Send Email with Confirmation Dialog
  const triggerSendConfirmation = (e: React.FormEvent) => {
    e.preventDefault();
    if (!composeTo.trim()) {
      if (onShowToast) onShowToast('Destinatario Requerido', 'Debes ingresar un correo de destino válido.', 'error');
      return;
    }

    setConfirmDialog({
      isOpen: true,
      title: '¿Confirmar envío de correo corporativo?',
      description: `Estás enviando desde "${composeFrom}" hacia "${composeTo}" mediante el servidor SMTP "${domainConfig.outgoingHost}:${domainConfig.outgoingPort}". ¿Deseas despachar el mensaje?`,
      actionLabel: 'Sí, Enviar Correo',
      isDestructive: false,
      onConfirm: async () => {
        setConfirmDialog(prev => ({ ...prev, isOpen: false }));
        await executeSendEmail();
      }
    });
  };

  const executeSendEmail = async () => {
    setIsSending(true);
    try {
      if (providerMode === 'google' && accessToken) {
        await sendGmailMessage(accessToken, {
          to: composeTo,
          subject: composeSubject,
          body: composeBody.replace(/\n/g, '<br/>'),
          fromEmail: currentUser?.email || domainConfig.email,
          threadId: composeThreadId
        });
      }

      const newSentMsg: EmailMessage = {
        id: `sent-${Date.now()}`,
        threadId: composeThreadId || `thread-${Date.now()}`,
        snippet: composeBody.slice(0, 90),
        internalDate: Date.now().toString(),
        labelIds: ['SENT'],
        from: `${domainConfig.displayName} <${composeFrom}>`,
        fromName: domainConfig.displayName,
        fromEmail: composeFrom,
        to: composeTo,
        subject: composeSubject || '(Sin Asunto)',
        date: 'Recién enviado',
        bodyHtml: `<p style="white-space: pre-wrap;">${composeBody}</p>`,
        bodyText: composeBody,
        isUnread: false,
        isStarred: false
      };

      setMessages(prev => [newSentMsg, ...prev]);
      setIsComposeOpen(false);
      setComposeTo('');
      setComposeSubject('');
      setComposeBody('');
      setComposeThreadId(undefined);

      if (onShowToast) {
        onShowToast('Correo Despachado', `Mensaje enviado satisfactoriamente a ${composeTo} vía SMTP ${domainConfig.outgoingHost}.`, 'success');
      }
    } catch (err: any) {
      console.error('Error enviando correo:', err);
      if (onShowToast) {
        onShowToast('Error al Enviar', err.message || 'No se pudo enviar el correo.', 'error');
      }
    } finally {
      setIsSending(false);
    }
  };

  // Delete Email with Confirmation Dialog
  const triggerDeleteConfirmation = (msg: EmailMessage) => {
    setConfirmDialog({
      isOpen: true,
      title: '¿Mover correo a la papelera?',
      description: `¿Estás seguro de mover a la papelera el correo "${msg.subject}" de ${msg.fromName || msg.from}?`,
      actionLabel: 'Mover a Papelera',
      isDestructive: true,
      onConfirm: async () => {
        setConfirmDialog(prev => ({ ...prev, isOpen: false }));
        setMessages(prev => prev.map(m => m.id === msg.id ? { ...m, labelIds: ['TRASH'] } : m));
        if (selectedMessage && selectedMessage.id === msg.id) {
          setSelectedMessage(null);
        }
        if (onShowToast) {
          onShowToast('Correo en Papelera', 'El mensaje fue trasladado a la papelera.', 'info');
        }
      }
    });
  };

  // ==========================================
  // CUSTOM MAILBOX ACTIONS (CREATE, EDIT, DELETE)
  // ==========================================
  const handleOpenCreateMailbox = () => {
    setEditingMailbox(null);
    setNewMailboxName('');
    setNewMailboxCategory('Clientes');
    setNewMailboxColor('#B58455');
    setNewMailboxDescription('');
    setIsMailboxModalOpen(true);
  };

  const handleOpenEditMailbox = (mbx: CustomMailbox) => {
    setEditingMailbox(mbx);
    setNewMailboxName(mbx.name);
    setNewMailboxCategory(mbx.category);
    setNewMailboxColor(mbx.color);
    setNewMailboxDescription(mbx.description || '');
    setIsMailboxModalOpen(true);
  };

  const handleSaveMailbox = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMailboxName.trim()) return;

    if (editingMailbox) {
      setCustomMailboxes(prev => prev.map(m => m.id === editingMailbox.id ? {
        ...m,
        name: newMailboxName.trim(),
        category: newMailboxCategory.trim(),
        color: newMailboxColor,
        description: newMailboxDescription.trim()
      } : m));
      if (onShowToast) onShowToast('Buzón Actualizado', `El buzón "${newMailboxName}" ha sido modificado.`, 'success');
    } else {
      const id = `mbx-${Date.now()}`;
      const newMbx: CustomMailbox = {
        id,
        name: newMailboxName.trim(),
        category: newMailboxCategory.trim(),
        color: newMailboxColor,
        description: newMailboxDescription.trim(),
        createdAt: 'Reciente'
      };
      setCustomMailboxes(prev => [...prev, newMbx]);
      if (onShowToast) onShowToast('Buzón Creado', `Se creó el buzón "${newMailboxName}" en la categoría ${newMailboxCategory}.`, 'success');
    }

    setIsMailboxModalOpen(false);
  };

  const handleDeleteMailbox = (mbx: CustomMailbox) => {
    setConfirmDialog({
      isOpen: true,
      title: `¿Eliminar el buzón "${mbx.name}"?`,
      description: `Esta acción removerá el buzón personalizado "${mbx.name}". Todos los correos asociados permanecerán seguros en tu bandeja general de entrada.`,
      actionLabel: 'Eliminar Buzón',
      isDestructive: true,
      onConfirm: () => {
        setCustomMailboxes(prev => prev.filter(m => m.id !== mbx.id));
        setMessages(prev => prev.map(m => ({
          ...m,
          labelIds: m.labelIds.filter(l => l !== mbx.id)
        })));
        if (activeFolder === mbx.id) {
          setActiveFolder('INBOX');
          setSelectedMessage(null);
        }
        setConfirmDialog(prev => ({ ...prev, isOpen: false }));
        if (onShowToast) onShowToast('Buzón Eliminado', `El buzón "${mbx.name}" fue eliminado con éxito.`, 'info');
      }
    });
  };

  // ==========================================
  // TEMPLATES ACTIONS (CREATE, EDIT, DELETE, USE)
  // ==========================================
  const handleOpenCreateTemplate = () => {
    setEditingTemplate(null);
    setTemplateTitle('');
    setTemplateCategory('Clientes & Retiro');
    setTemplateSubject('');
    setTemplateBody('');
    setIsTemplateModalOpen(true);
  };

  const handleOpenEditTemplate = (tpl: EmailTemplate) => {
    setEditingTemplate(tpl);
    setTemplateTitle(tpl.title);
    setTemplateCategory(tpl.category);
    setTemplateSubject(tpl.subject);
    setTemplateBody(tpl.body);
    setIsTemplateModalOpen(true);
  };

  const handleSaveTemplate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!templateTitle.trim() || !templateSubject.trim()) return;

    if (editingTemplate) {
      setTemplates(prev => prev.map(t => t.id === editingTemplate.id ? {
        ...t,
        title: templateTitle.trim(),
        category: templateCategory.trim(),
        subject: templateSubject.trim(),
        body: templateBody,
        lastEdited: new Date().toLocaleDateString('es-CL')
      } : t));
      if (onShowToast) onShowToast('Plantilla Guardada', `La plantilla "${templateTitle}" fue actualizada.`, 'success');
    } else {
      const newTpl: EmailTemplate = {
        id: `tpl-${Date.now()}`,
        title: templateTitle.trim(),
        category: templateCategory.trim(),
        subject: templateSubject.trim(),
        body: templateBody,
        isSystem: false,
        lastEdited: 'Recién creada'
      };
      setTemplates(prev => [...prev, newTpl]);
      if (onShowToast) onShowToast('Plantilla Creada', `Nueva plantilla "${templateTitle}" lista para ser utilizada.`, 'success');
    }

    setIsTemplateModalOpen(false);
  };

  const handleDeleteTemplate = (tpl: EmailTemplate) => {
    setConfirmDialog({
      isOpen: true,
      title: `¿Eliminar plantilla "${tpl.title}"?`,
      description: `Esta acción borrará la plantilla. No podrás recuperarla automáticamente.`,
      actionLabel: 'Eliminar Plantilla',
      isDestructive: true,
      onConfirm: () => {
        setTemplates(prev => prev.filter(t => t.id !== t.id));
        setConfirmDialog(prev => ({ ...prev, isOpen: false }));
        if (onShowToast) onShowToast('Plantilla Eliminada', `La plantilla fue borrada del catálogo.`, 'info');
      }
    });
  };

  const handleUseTemplate = (tpl: EmailTemplate) => {
    handleOpenCompose('', tpl.subject, tpl.body);
    setCurrentView('mail');
  };

  // Simulation: Add incoming test email
  const handleSimulateIncomingEmail = () => {
    const clients = [
      {
        name: 'Matías Oyarzún',
        email: 'm.oyarzun@marinasvina.cl',
        subject: 'Consulta por mantelería bordada e insumos náuticos',
        snippet: 'Estimados Bananur, requerimos cotizar 24 manteles impermeables para nuestra marina en Viña del Mar...',
        body: `Estimado equipo Bananur Viña del Mar,\n\nRequerimos cotizar la confección de 24 manteles en lona impermeable con bordado de logotipo para el club náutico en Reñaca / Viña del Mar.\n\n¿Nos podrían indicar los tiempos de confección y opciones de tela disponibles en su taller de 1 Norte 450?\n\nSaludos cordiales,\nMatías Oyarzún`
      },
      {
        name: 'Valentina Pizarro',
        email: 'valepizarro@disenovalpo.com',
        subject: 'Solicitud prototipado rápido 3D en filamento biodegradable',
        snippet: 'Hola Nico, tenemos los archivos STL listos para imprimir en sus equipos de Viña del Mar...',
        body: `Hola Nico y taller Bananur,\n\nTenemos 3 archivos STL de luminarias geométricas listas para imprimir en PLA beige.\n\n¿Tienen cupo en la granja de impresión 3D esta semana para retiro presencial en su taller?\n\nAbrazo,\nValentina Pizarro`
      }
    ];

    const randomClient = clients[Math.floor(Math.random() * clients.length)];
    const newMsg: EmailMessage = {
      id: `incoming-${Date.now()}`,
      threadId: `thread-inc-${Date.now()}`,
      snippet: randomClient.snippet,
      internalDate: Date.now().toString(),
      labelIds: ['INBOX', 'UNREAD'],
      from: `${randomClient.name} <${randomClient.email}>`,
      fromName: randomClient.name,
      fromEmail: randomClient.email,
      to: domainConfig.email,
      subject: randomClient.subject,
      date: 'Recién recibido',
      bodyHtml: `<p style="white-space: pre-wrap;">${randomClient.body}</p>`,
      bodyText: randomClient.body,
      isUnread: true,
      isStarred: false,
      hasAttachment: true
    };

    setMessages(prev => [newMsg, ...prev]);
    if (onShowToast) {
      onShowToast('Nuevo Correo Entrante', `Nuevo correo recibido de ${randomClient.name} a ${domainConfig.email}.`, 'info');
    }
  };

  // Filter messages based on search, standard folder or custom mailbox
  const filteredMessages = useMemo(() => {
    return messages.filter(m => {
      // Custom mailbox check
      if (activeFolder.startsWith('mbx-')) {
        if (!m.labelIds.includes(activeFolder)) return false;
      } else {
        // Standard folders
        if (activeFolder === 'STARRED' && !m.isStarred) return false;
        if (activeFolder === 'SENT' && !m.labelIds.includes('SENT')) return false;
        if (activeFolder === 'DRAFT' && !m.labelIds.includes('DRAFT')) return false;
        if (activeFolder === 'TRASH' && !m.labelIds.includes('TRASH')) return false;
        if (activeFolder === 'INBOX' && (m.labelIds.includes('TRASH') || (!m.labelIds.includes('INBOX') && !m.labelIds.includes('UNREAD')))) return false;
      }

      if (!searchQuery.trim()) return true;
      const q = searchQuery.toLowerCase();
      return (
        m.subject.toLowerCase().includes(q) ||
        m.from.toLowerCase().includes(q) ||
        m.fromName.toLowerCase().includes(q) ||
        m.snippet.toLowerCase().includes(q)
      );
    });
  }, [messages, activeFolder, searchQuery]);

  const unreadCount = useMemo(() => {
    return messages.filter(m => m.isUnread && !m.labelIds.includes('TRASH')).length;
  }, [messages]);

  // Filter templates
  const filteredTemplates = useMemo(() => {
    if (!templateSearch.trim()) return templates;
    const q = templateSearch.toLowerCase();
    return templates.filter(t => 
      t.title.toLowerCase().includes(q) ||
      t.subject.toLowerCase().includes(q) ||
      t.category.toLowerCase().includes(q) ||
      t.body.toLowerCase().includes(q)
    );
  }, [templates, templateSearch]);

  return (
    <div className="p-6 sm:p-10 space-y-6 animate-fade-in bg-[#FAF8F5] min-h-screen">
      
      {/* Top Header & Corporate Identity */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-6 border-b border-bananur-sand/80">
        <div>
          <div className="flex flex-wrap items-center gap-2 mb-1.5">
            <span className="text-[11px] font-mono tracking-widest text-[#B58455] font-extrabold uppercase flex items-center gap-1.5">
              <Mail className="w-3.5 h-3.5" /> Correo Corporativo Oficial • Viña del Mar
            </span>

            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-emerald-100 text-emerald-800 border border-emerald-300 flex items-center gap-1.5 shadow-2xs">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
              {domainConfig.email} (SMTP {domainConfig.outgoingHost}:{domainConfig.outgoingPort})
            </span>
          </div>
          
          <h1 className="text-3xl sm:text-4xl font-serif font-black text-bananur-clay tracking-tight">
            Gestor de Correo Corporativo
          </h1>
          <p className="text-xs text-bananur-clay-light mt-1 max-w-2xl">
            Bandeja centralizada, buzones categorizados y plantillas de respuesta rápida para clientes y taller de Viña del Mar.
          </p>
        </div>

        {/* Action Bar: Presets, Compose & Settings Link */}
        <div className="flex flex-wrap items-center gap-2.5">
          {/* Link to Settings for Server Config */}
          <button
            type="button"
            onClick={() => {
              if (onNavigateToSettings) {
                onNavigateToSettings('correo_servidor');
              } else {
                if (onShowToast) onShowToast('Configuración en Ajustes', 'Ve al módulo "Ajustes" para editar credenciales SMTP y registros DNS.', 'info');
              }
            }}
            className="px-3.5 py-2.5 bg-white hover:bg-bananur-sand/30 text-bananur-clay border border-bananur-sand rounded-xl text-xs font-semibold shadow-2xs flex items-center gap-2 transition-all cursor-pointer"
            title="Ir a Ajustes para configurar el servidor SMTP y DNS SPF/DKIM"
          >
            <Settings className="w-4 h-4 text-bananur-gold-dark" />
            <span>Servidor en Ajustes</span>
          </button>

          {/* Simulate incoming test email */}
          <button
            type="button"
            onClick={handleSimulateIncomingEmail}
            className="px-3 py-2.5 bg-white hover:bg-bananur-sand/20 text-bananur-clay-light hover:text-bananur-clay border border-bananur-sand/80 rounded-xl text-xs font-medium transition-all cursor-pointer flex items-center gap-1.5"
            title="Simular llegada de un nuevo correo de cliente a contacto@bananur.cl"
          >
            <MessageSquare className="w-3.5 h-3.5 text-bananur-gold" />
            <span className="hidden sm:inline">Simular Entrada</span>
          </button>

          {/* New Email Compose button */}
          <button
            type="button"
            id="email-compose-btn"
            onClick={() => handleOpenCompose()}
            className="px-4 sm:px-5 py-2.5 bg-bananur-clay hover:bg-bananur-clay/90 text-[#FAF8F5] rounded-xl text-xs font-bold font-mono uppercase tracking-wider shadow-sm flex items-center gap-2 transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4 text-bananur-gold" />
            <span>Redactar Correo</span>
          </button>
        </div>
      </div>

      {/* Primary Navigation Tabs: Bandeja vs Gestor de Plantillas */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-bananur-sand/70 pb-3">
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setCurrentView('mail')}
            className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-2 ${
              currentView === 'mail'
                ? 'bg-bananur-clay text-white shadow-xs'
                : 'bg-white hover:bg-bananur-sand/30 text-bananur-clay border border-bananur-sand/70'
            }`}
          >
            <Inbox className="w-4 h-4" />
            <span>Bandeja de Correo</span>
            {unreadCount > 0 && (
              <span className={`px-2 py-0.5 rounded-full text-[10px] font-mono font-bold ${
                currentView === 'mail' ? 'bg-bananur-gold text-bananur-clay' : 'bg-bananur-clay text-white'
              }`}>
                {unreadCount}
              </span>
            )}
          </button>

          <button
            type="button"
            id="tab-email-templates"
            onClick={() => setCurrentView('templates')}
            className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-2 ${
              currentView === 'templates'
                ? 'bg-bananur-clay text-white shadow-xs'
                : 'bg-white hover:bg-bananur-sand/30 text-bananur-clay border border-bananur-sand/70'
            }`}
          >
            <FileText className="w-4 h-4 text-bananur-gold-dark" />
            <span>Plantillas de Correo ({templates.length})</span>
          </button>
        </div>

        {/* Server status chip */}
        <div className="flex items-center gap-2 text-xs font-mono text-bananur-clay-light bg-white px-3 py-1.5 rounded-xl border border-bananur-sand/70 shadow-2xs">
          <Server className="w-3.5 h-3.5 text-bananur-gold-dark" />
          <span>SMTP: <strong>{domainConfig.outgoingHost}:{domainConfig.outgoingPort}</strong></span>
          <span className="text-emerald-600 font-bold">● Conectado</span>
        </div>
      </div>

      {/* ========================================================= */}
      {/* VIEW 1: BANDEJA DE CORREO + BUZONES PERSONALIZADOS        */}
      {/* ========================================================= */}
      {currentView === 'mail' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 bg-white rounded-3xl border border-bananur-sand/80 shadow-xs overflow-hidden min-h-[640px] animate-fade-in">
          
          {/* Left Column: Folders & Custom Mailboxes */}
          <div className="lg:col-span-3 border-r border-bananur-sand/70 p-5 space-y-6 bg-[#FCFBF9]">
            
            {/* Standard Mailboxes */}
            <div className="space-y-1">
              <span className="text-[10px] font-mono uppercase font-bold text-bananur-clay-light px-2 tracking-wider">
                Buzones Principales
              </span>
              <div className="space-y-1 pt-1">
                <button
                  type="button"
                  id="folder-inbox"
                  onClick={() => { setActiveFolder('INBOX'); setSelectedMessage(null); }}
                  className={`w-full flex items-center justify-between p-2.5 px-3 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                    activeFolder === 'INBOX'
                      ? 'bg-bananur-clay text-white shadow-xs'
                      : 'text-bananur-clay hover:bg-bananur-sand/30'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <Inbox className="w-4 h-4" />
                    <span>Recibidos</span>
                  </div>
                  {unreadCount > 0 && (
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-mono font-bold ${
                      activeFolder === 'INBOX' ? 'bg-bananur-gold text-bananur-clay' : 'bg-bananur-clay text-white'
                    }`}>
                      {unreadCount}
                    </span>
                  )}
                </button>

                <button
                  type="button"
                  id="folder-starred"
                  onClick={() => { setActiveFolder('STARRED'); setSelectedMessage(null); }}
                  className={`w-full flex items-center justify-between p-2.5 px-3 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                    activeFolder === 'STARRED'
                      ? 'bg-bananur-clay text-white shadow-xs'
                      : 'text-bananur-clay hover:bg-bananur-sand/30'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <Star className="w-4 h-4" />
                    <span>Destacados</span>
                  </div>
                </button>

                <button
                  type="button"
                  id="folder-sent"
                  onClick={() => { setActiveFolder('SENT'); setSelectedMessage(null); }}
                  className={`w-full flex items-center justify-between p-2.5 px-3 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                    activeFolder === 'SENT'
                      ? 'bg-bananur-clay text-white shadow-xs'
                      : 'text-bananur-clay hover:bg-bananur-sand/30'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <Send className="w-4 h-4" />
                    <span>Enviados</span>
                  </div>
                </button>

                <button
                  type="button"
                  id="folder-draft"
                  onClick={() => { setActiveFolder('DRAFT'); setSelectedMessage(null); }}
                  className={`w-full flex items-center justify-between p-2.5 px-3 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                    activeFolder === 'DRAFT'
                      ? 'bg-bananur-clay text-white shadow-xs'
                      : 'text-bananur-clay hover:bg-bananur-sand/30'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <FileText className="w-4 h-4" />
                    <span>Borradores</span>
                  </div>
                </button>

                <button
                  type="button"
                  id="folder-trash"
                  onClick={() => { setActiveFolder('TRASH'); setSelectedMessage(null); }}
                  className={`w-full flex items-center justify-between p-2.5 px-3 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                    activeFolder === 'TRASH'
                      ? 'bg-bananur-clay text-white shadow-xs'
                      : 'text-bananur-clay hover:bg-bananur-sand/30'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <Trash2 className="w-4 h-4" />
                    <span>Papelera</span>
                  </div>
                </button>
              </div>
            </div>

            {/* Custom Mailboxes by Category */}
            <div className="space-y-2 pt-2 border-t border-bananur-sand/60">
              <div className="flex items-center justify-between px-2">
                <span className="text-[10px] font-mono uppercase font-bold text-bananur-clay-light tracking-wider">
                  Buzones Personalizados
                </span>
                <button
                  type="button"
                  id="add-custom-mailbox-btn"
                  onClick={handleOpenCreateMailbox}
                  className="p-1 hover:bg-bananur-sand/40 text-bananur-clay rounded-lg transition-colors cursor-pointer flex items-center gap-1 text-[10px] font-mono font-bold"
                  title="Crear nuevo buzón personalizado"
                >
                  <Plus className="w-3.5 h-3.5 text-bananur-gold-dark" />
                  <span>Nuevo</span>
                </button>
              </div>

              <div className="space-y-1">
                {customMailboxes.map((mbx) => {
                  const countInMbx = messages.filter(m => m.labelIds.includes(mbx.id)).length;
                  const isSelected = activeFolder === mbx.id;
                  return (
                    <div 
                      key={mbx.id}
                      className={`group flex items-center justify-between p-2 rounded-xl text-xs transition-all cursor-pointer ${
                        isSelected 
                          ? 'bg-bananur-clay text-white font-bold shadow-2xs' 
                          : 'text-bananur-clay hover:bg-bananur-sand/30'
                      }`}
                      onClick={() => { setActiveFolder(mbx.id); setSelectedMessage(null); }}
                    >
                      <div className="flex items-center gap-2 min-w-0 flex-1">
                        <span 
                          className="w-2.5 h-2.5 rounded-full shrink-0" 
                          style={{ backgroundColor: mbx.color }}
                        />
                        <span className="truncate">{mbx.name}</span>
                      </div>

                      <div className="flex items-center gap-1 shrink-0">
                        {countInMbx > 0 && (
                          <span className={`px-1.5 py-0.5 rounded text-[9px] font-mono ${
                            isSelected ? 'bg-white/20 text-white' : 'bg-bananur-sand/60 text-bananur-clay'
                          }`}>
                            {countInMbx}
                          </span>
                        )}
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleOpenEditMailbox(mbx);
                          }}
                          className={`p-1 rounded cursor-pointer transition-opacity ${
                            isSelected ? 'text-white/80 hover:text-white hover:bg-white/10' : 'text-bananur-clay-light hover:text-bananur-clay hover:bg-bananur-sand/40 opacity-60 group-hover:opacity-100'
                          }`}
                          title="Editar buzón"
                        >
                          <Edit2 className="w-3 h-3" />
                        </button>
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteMailbox(mbx);
                          }}
                          className={`p-1 rounded cursor-pointer transition-opacity ${
                            isSelected ? 'text-red-200 hover:text-white hover:bg-red-500/40' : 'text-bananur-clay-light hover:text-red-600 hover:bg-red-50 opacity-60 group-hover:opacity-100'
                          }`}
                          title="Eliminar buzón personalizado"
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Quick Templates Widget */}
            <div className="p-3 bg-bananur-sand/20 rounded-2xl border border-bananur-sand/60 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-mono uppercase font-bold text-bananur-clay-light block">
                  Plantillas Rápidas
                </span>
                <button
                  type="button"
                  onClick={() => setCurrentView('templates')}
                  className="text-[10px] font-mono text-bananur-gold-dark hover:underline cursor-pointer"
                >
                  Ver todas
                </button>
              </div>
              <div className="space-y-1">
                {templates.slice(0, 3).map((t) => (
                  <button
                    key={t.id}
                    type="button"
                    onClick={() => handleUseTemplate(t)}
                    className="w-full text-left p-2 rounded-lg text-[11px] font-medium text-bananur-clay hover:bg-white hover:shadow-2xs transition-all truncate block cursor-pointer"
                    title={t.title}
                  >
                    {t.title}
                  </button>
                ))}
              </div>
            </div>

          </div>

          {/* Center / Right Column: Email List or Message Detail */}
          <div className="lg:col-span-9 flex flex-col">
            
            {/* Top Search & Toolbar */}
            <div className="p-4 border-b border-bananur-sand/70 flex flex-wrap items-center justify-between gap-3 bg-white">
              <div className="relative flex-1 min-w-[240px]">
                <Search className="w-4 h-4 text-bananur-clay-light absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  id="email-search-input"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Buscar por cliente, asunto, Viña del Mar, taller o cotización..."
                  className="w-full pl-9 pr-4 py-2 bg-[#FAF8F5] border border-bananur-sand/80 rounded-xl text-xs text-bananur-clay placeholder:text-bananur-clay-light/60 focus:outline-none focus:border-bananur-gold"
                />
                {searchQuery && (
                  <button
                    type="button"
                    onClick={() => setSearchQuery('')}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-bananur-clay-light hover:text-black cursor-pointer"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  id="email-refresh-btn"
                  onClick={handleRefresh}
                  disabled={isLoadingMessages}
                  className="p-2 px-3 rounded-xl border border-bananur-sand/80 hover:bg-bananur-sand/20 text-bananur-clay transition-all cursor-pointer flex items-center gap-1.5 text-xs font-semibold"
                  title="Sincronizar bandeja con el servidor"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${isLoadingMessages ? 'animate-spin text-bananur-gold-dark' : ''}`} />
                  <span className="hidden sm:inline">Actualizar</span>
                </button>
              </div>
            </div>

            {/* Custom Mailbox Action Banner when inside a custom mailbox */}
            {activeFolder.startsWith('mbx-') && !selectedMessage && (() => {
              const currentMbx = customMailboxes.find(m => m.id === activeFolder);
              if (!currentMbx) return null;
              return (
                <div className="px-5 py-3 bg-[#FCFBF9] border-b border-bananur-sand/70 flex flex-wrap items-center justify-between gap-3 animate-fade-in">
                  <div className="flex items-center gap-2.5">
                    <span className="w-3.5 h-3.5 rounded-full shrink-0 shadow-2xs" style={{ backgroundColor: currentMbx.color }} />
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="font-serif text-sm font-bold text-bananur-clay">{currentMbx.name}</h3>
                        <span className="px-2 py-0.5 rounded text-[9px] font-mono font-bold bg-bananur-sand/50 text-bananur-clay uppercase">
                          {currentMbx.category}
                        </span>
                      </div>
                      {currentMbx.description && (
                        <p className="text-[11px] text-bananur-clay-light mt-0.5">{currentMbx.description}</p>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => handleOpenEditMailbox(currentMbx)}
                      className="px-3 py-1.5 bg-white hover:bg-bananur-sand/30 border border-bananur-sand/80 rounded-xl text-xs font-semibold text-bananur-clay flex items-center gap-1.5 transition-colors cursor-pointer"
                    >
                      <Edit2 className="w-3.5 h-3.5 text-bananur-gold-dark" />
                      <span>Editar</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDeleteMailbox(currentMbx)}
                      className="px-3 py-1.5 bg-red-50 hover:bg-red-100 border border-red-200 text-red-700 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
                      title="Eliminar este buzón personalizado"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>Eliminar Buzón</span>
                    </button>
                  </div>
                </div>
              );
            })()}

            {/* Reader or List Split view */}
            {selectedMessage ? (
              /* ================= MESSAGE DETAIL READER ================= */
              <div className="flex-1 p-6 space-y-6 overflow-y-auto animate-fade-in bg-white">
                <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-bananur-sand/70">
                  <button
                    type="button"
                    id="email-back-btn"
                    onClick={() => setSelectedMessage(null)}
                    className="px-3 py-1.5 bg-[#FAF8F5] hover:bg-bananur-sand/40 border border-bananur-sand/70 rounded-xl text-xs font-semibold text-bananur-clay flex items-center gap-1.5 transition-all cursor-pointer"
                  >
                    <ChevronLeft className="w-4 h-4" />
                    <span>Volver a la lista</span>
                  </button>

                  <div className="flex flex-wrap items-center gap-2">
                    {/* Move to custom mailbox dropdown */}
                    <div className="flex items-center gap-1.5">
                      <span className="text-[10px] font-mono text-bananur-clay-light uppercase font-bold">Mover a:</span>
                      <select
                        onChange={(e) => {
                          if (e.target.value) {
                            handleMoveToCustomMailbox(selectedMessage.id, e.target.value);
                            e.target.value = '';
                          }
                        }}
                        defaultValue=""
                        className="p-1 px-2.5 bg-[#FAF8F5] border border-bananur-sand rounded-xl text-xs text-bananur-clay font-medium cursor-pointer"
                      >
                        <option value="" disabled>Seleccionar buzón...</option>
                        {customMailboxes.map(b => (
                          <option key={b.id} value={b.id}>{b.name} ({b.category})</option>
                        ))}
                      </select>
                    </div>

                    <button
                      type="button"
                      onClick={(e) => handleToggleStar(e, selectedMessage)}
                      className="p-2 rounded-xl hover:bg-bananur-sand/30 text-bananur-clay cursor-pointer"
                      title={selectedMessage.isStarred ? 'Quitar destacado' : 'Destacar'}
                    >
                      <Star className={`w-4 h-4 ${selectedMessage.isStarred ? 'fill-amber-400 text-amber-500' : 'text-bananur-clay-light'}`} />
                    </button>

                    <button
                      type="button"
                      id="email-detail-reply-btn"
                      onClick={() => handleReplyMessage(selectedMessage)}
                      className="px-3.5 py-1.5 bg-[#2D2522] hover:bg-bananur-gold text-[#FAF8F5] hover:text-black rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer"
                    >
                      <Reply className="w-3.5 h-3.5" />
                      <span>Responder</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => triggerDeleteConfirmation(selectedMessage)}
                      className="p-2 rounded-xl hover:bg-red-50 text-bananur-clay-light hover:text-red-600 transition-all cursor-pointer"
                      title="Mover a papelera"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Message Header Details */}
                <div className="space-y-3">
                  <div className="flex flex-wrap items-center gap-2">
                    <h2 className="text-xl sm:text-2xl font-serif font-bold text-bananur-clay">
                      {selectedMessage.subject}
                    </h2>
                    {selectedMessage.labelIds.map(lbl => {
                      const foundMbx = customMailboxes.find(m => m.id === lbl);
                      if (foundMbx) {
                        return (
                          <span 
                            key={lbl}
                            className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold text-white shadow-2xs"
                            style={{ backgroundColor: foundMbx.color }}
                          >
                            {foundMbx.name}
                          </span>
                        );
                      }
                      return null;
                    })}
                  </div>

                  <div className="flex flex-wrap items-center justify-between gap-3 text-xs bg-[#FAF8F5] p-4 rounded-2xl border border-bananur-sand/60">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-bananur-clay text-white flex items-center justify-center font-serif font-bold text-base">
                        {selectedMessage.fromName?.charAt(0).toUpperCase() || 'U'}
                      </div>
                      <div>
                        <p className="font-bold text-bananur-clay text-sm">{selectedMessage.fromName}</p>
                        <p className="font-mono text-[11px] text-bananur-clay-light">
                          De: &lt;{selectedMessage.fromEmail || selectedMessage.from}&gt;
                        </p>
                        <p className="font-mono text-[10px] text-bananur-clay-light/70">
                          Para: {selectedMessage.to}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <span className="font-mono text-[11px] text-bananur-clay-light">{selectedMessage.date}</span>
                    </div>
                  </div>
                </div>

                {/* Message Body Content */}
                <div className="pt-2 text-sm text-[#2D2522] leading-relaxed">
                  {selectedMessage.bodyHtml ? (
                    <div 
                      className="prose prose-sm max-w-none text-[#2D2522] [&_p]:mb-3 [&_a]:text-bananur-clay [&_a]:underline"
                      dangerouslySetInnerHTML={{ __html: selectedMessage.bodyHtml }} 
                    />
                  ) : (
                    <p className="whitespace-pre-wrap font-sans text-xs sm:text-sm text-bananur-clay">
                      {selectedMessage.bodyText || selectedMessage.snippet}
                    </p>
                  )}
                </div>

                {/* Bottom Quick Reply Action Banner */}
                <div className="pt-6 border-t border-bananur-sand/70 flex items-center justify-between">
                  <span className="text-xs text-bananur-clay-light font-mono">
                    Enrutado vía {domainConfig.email} ({domainConfig.outgoingHost})
                  </span>
                  <button
                    type="button"
                    onClick={() => handleReplyMessage(selectedMessage)}
                    className="px-4 py-2 bg-bananur-clay hover:bg-bananur-gold hover:text-black text-white rounded-xl text-xs font-bold font-mono uppercase tracking-wider flex items-center gap-1.5 transition-all cursor-pointer"
                  >
                    <Reply className="w-4 h-4" />
                    <span>Responder a {selectedMessage.fromName || 'Remitente'}</span>
                  </button>
                </div>
              </div>
            ) : (
              /* ================= EMAIL LIST VIEW ================= */
              <div className="flex-1 overflow-y-auto divide-y divide-bananur-sand/60">
                {isLoadingMessages ? (
                  <div className="py-24 text-center space-y-3">
                    <RefreshCw className="w-8 h-8 mx-auto text-bananur-gold-dark animate-spin" />
                    <p className="text-xs font-mono font-bold text-bananur-clay">
                      Sincronizando correos corporativos...
                    </p>
                  </div>
                ) : filteredMessages.length === 0 ? (
                  <div className="py-24 text-center space-y-3 max-w-sm mx-auto px-4">
                    <div className="w-14 h-14 bg-bananur-sand/30 rounded-full flex items-center justify-center mx-auto text-bananur-clay">
                      <Inbox className="w-7 h-7" />
                    </div>
                    <h3 className="font-serif text-base font-bold text-bananur-clay">
                      No hay correos en este buzón
                    </h3>
                    <p className="text-xs text-bananur-clay-light leading-relaxed">
                      {searchQuery 
                        ? `No encontramos mensajes que coincidan con "${searchQuery}".`
                        : 'Este buzón está completamente al día sin mensajes pendientes.'}
                    </p>
                    <button
                      type="button"
                      onClick={() => handleOpenCompose()}
                      className="mt-2 px-4 py-2 bg-bananur-clay text-white rounded-xl text-xs font-bold transition-all cursor-pointer hover:bg-bananur-gold hover:text-black"
                    >
                      Redactar Nuevo Mensaje
                    </button>
                  </div>
                ) : (
                  filteredMessages.map((msg) => (
                    <div
                      key={msg.id}
                      id={`email-row-${msg.id}`}
                      onClick={() => handleSelectMessage(msg)}
                      className={`p-4 sm:p-5 flex items-start sm:items-center justify-between gap-4 transition-colors cursor-pointer group hover:bg-[#F9F7F2] ${
                        msg.isUnread ? 'bg-[#FCFBF8] font-semibold' : 'bg-white'
                      }`}
                    >
                      <div className="flex items-start sm:items-center gap-3 min-w-0 flex-1">
                        {/* Star Button */}
                        <button
                          type="button"
                          onClick={(e) => handleToggleStar(e, msg)}
                          className="pt-0.5 sm:pt-0 p-1 hover:scale-110 transition-transform cursor-pointer shrink-0"
                        >
                          <Star className={`w-4 h-4 ${msg.isStarred ? 'fill-amber-400 text-amber-500' : 'text-bananur-sand hover:text-bananur-clay'}`} />
                        </button>

                        {/* Unread dot */}
                        {msg.isUnread && (
                          <span className="w-2 h-2 rounded-full bg-bananur-gold-dark shrink-0 mt-1 sm:mt-0" title="No leído"></span>
                        )}

                        {/* Sender Info & Subject */}
                        <div className="min-w-0 flex-1 sm:flex sm:items-baseline sm:gap-4">
                          <span className={`text-xs block sm:w-44 truncate shrink-0 ${
                            msg.isUnread ? 'font-bold text-bananur-clay' : 'text-bananur-clay-light'
                          }`}>
                            {msg.fromName || msg.from}
                          </span>

                          <div className="min-w-0 flex-1 flex items-baseline gap-2">
                            <span className={`text-xs truncate ${
                              msg.isUnread ? 'font-bold text-black' : 'text-bananur-clay font-medium'
                            }`}>
                              {msg.subject}
                            </span>
                            
                            {/* Badges for custom mailboxes */}
                            {msg.labelIds.map(lbl => {
                              const b = customMailboxes.find(m => m.id === lbl);
                              if (b) {
                                return (
                                  <span 
                                    key={lbl} 
                                    className="px-1.5 py-0.2 rounded text-[8px] font-mono font-bold text-white shrink-0"
                                    style={{ backgroundColor: b.color }}
                                  >
                                    {b.name}
                                  </span>
                                );
                              }
                              return null;
                            })}

                            <span className="hidden md:inline text-xs text-bananur-clay-light/70 truncate font-normal">
                              — {msg.snippet}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Date and hover actions */}
                      <div className="flex items-center gap-3 shrink-0">
                        {msg.hasAttachment && (
                          <Paperclip className="w-3.5 h-3.5 text-bananur-clay-light" title="Contiene archivos adjuntos" />
                        )}
                        <span className="font-mono text-[10px] text-bananur-clay-light whitespace-nowrap">
                          {msg.date}
                        </span>
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            triggerDeleteConfirmation(msg);
                          }}
                          className="p-1 hover:bg-red-50 text-bananur-clay-light hover:text-red-600 rounded opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
                          title="Eliminar correo"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}

          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* VIEW 2: GESTOR DE PLANTILLAS DE CORREO (CRUD)             */}
      {/* ========================================================= */}
      {currentView === 'templates' && (
        <div className="space-y-6 animate-fade-in">
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-bananur-sand/80 shadow-xs space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-bananur-sand/70">
              <div>
                <h3 className="font-serif text-lg font-bold text-bananur-clay flex items-center gap-2">
                  <FileText className="w-5 h-5 text-bananur-gold-dark" />
                  Catálogo de Plantillas de Correo Corporativo
                </h3>
                <p className="text-xs text-bananur-clay-light mt-0.5">
                  Crea y edita respuestas predeterminadas para despachos, retiros en taller, cotizaciones y estados de confección.
                </p>
              </div>

              <div className="flex items-center gap-3">
                <input
                  type="text"
                  value={templateSearch}
                  onChange={(e) => setTemplateSearch(e.target.value)}
                  placeholder="Buscar plantillas..."
                  className="p-2 px-3 bg-[#FAF8F5] border border-bananur-sand rounded-xl text-xs text-bananur-clay w-48"
                />

                <button
                  type="button"
                  id="create-template-btn"
                  onClick={handleOpenCreateTemplate}
                  className="px-4 py-2 bg-bananur-clay hover:bg-bananur-gold hover:text-black text-white rounded-xl text-xs font-bold font-mono uppercase tracking-wider flex items-center gap-1.5 transition-all cursor-pointer shadow-xs"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Nueva Plantilla</span>
                </button>
              </div>
            </div>

            {/* Templates Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {filteredTemplates.map((tpl) => (
                <div 
                  key={tpl.id}
                  className="p-5 rounded-2xl border border-bananur-sand/80 bg-[#FAF8F5] hover:bg-white hover:shadow-xs transition-all flex flex-col justify-between space-y-4"
                >
                  <div className="space-y-2">
                    <div className="flex items-center justify-between gap-2">
                      <span className="px-2 py-0.5 rounded-full text-[9px] font-mono font-bold bg-bananur-sand/50 text-bananur-clay uppercase">
                        {tpl.category}
                      </span>
                      <div className="flex items-center gap-1">
                        <button
                          type="button"
                          onClick={() => handleOpenEditTemplate(tpl)}
                          className="p-1 hover:bg-bananur-sand/40 text-bananur-clay rounded-lg cursor-pointer"
                          title="Editar plantilla"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDeleteTemplate(tpl)}
                          className="p-1 hover:bg-red-50 text-bananur-clay-light hover:text-red-600 rounded-lg cursor-pointer"
                          title="Eliminar plantilla"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>

                    <h4 className="font-serif text-base font-bold text-bananur-clay">
                      {tpl.title}
                    </h4>
                    <p className="font-mono text-xs text-bananur-clay-light font-medium">
                      Asunto: {tpl.subject}
                    </p>
                    <p className="text-xs text-bananur-clay-light/80 line-clamp-3 leading-relaxed whitespace-pre-wrap font-sans">
                      {tpl.body}
                    </p>
                  </div>

                  <div className="pt-3 border-t border-bananur-sand/50 flex items-center justify-between">
                    <span className="text-[10px] font-mono text-bananur-clay-light">
                      Modificado: {tpl.lastEdited || 'Sistema'}
                    </span>
                    <button
                      type="button"
                      onClick={() => handleUseTemplate(tpl)}
                      className="px-3 py-1.5 bg-bananur-clay hover:bg-bananur-gold hover:text-black text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer"
                    >
                      <span>Usar en Redacción</span>
                      <ArrowRight className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* MODAL: CREAR / EDITAR BUZÓN PERSONALIZADO                 */}
      {/* ========================================================= */}
      {isMailboxModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-white rounded-3xl border border-bananur-sand shadow-2xl max-w-md w-full p-6 space-y-5 animate-scale-up">
            <div className="flex items-center justify-between pb-3 border-b border-bananur-sand/70">
              <div className="flex items-center gap-2">
                <FolderPlus className="w-5 h-5 text-bananur-gold-dark" />
                <h3 className="font-serif text-base font-bold text-bananur-clay">
                  {editingMailbox ? 'Editar Buzón Personalizado' : 'Crear Nuevo Buzón'}
                </h3>
              </div>
              <button 
                type="button" 
                onClick={() => setIsMailboxModalOpen(false)}
                className="p-1 text-bananur-clay-light hover:text-black rounded cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveMailbox} className="space-y-4">
              <div>
                <label className="block text-[10px] font-mono font-bold uppercase text-bananur-clay-light mb-1">
                  Nombre del Buzón *
                </label>
                <input
                  type="text"
                  required
                  value={newMailboxName}
                  onChange={(e) => setNewMailboxName(e.target.value)}
                  placeholder="ej. Cotizaciones Viña, Proveedores..."
                  className="w-full p-2.5 bg-[#FAF8F5] border border-bananur-sand rounded-xl text-xs text-bananur-clay focus:outline-none focus:border-bananur-gold font-medium"
                />
              </div>

              <div>
                <label className="block text-[10px] font-mono font-bold uppercase text-bananur-clay-light mb-1">
                  Categoría
                </label>
                <select
                  value={newMailboxCategory}
                  onChange={(e) => setNewMailboxCategory(e.target.value)}
                  className="w-full p-2.5 bg-[#FAF8F5] border border-bananur-sand rounded-xl text-xs text-bananur-clay focus:outline-none focus:border-bananur-gold"
                >
                  <option value="Clientes">Clientes & Atención</option>
                  <option value="Proveedores">Proveedores & Facturas</option>
                  <option value="Taller">Taller & Manufactura</option>
                  <option value="Finanzas">Finanzas & DTE</option>
                  <option value="General">General</option>
                </select>
              </div>

              <div>
                <label className="block text-[10px] font-mono font-bold uppercase text-bananur-clay-light mb-1">
                  Color Distintivo
                </label>
                <div className="flex flex-wrap gap-2 pt-1">
                  {MAILBOX_COLORS.map((c) => (
                    <button
                      key={c.hex}
                      type="button"
                      onClick={() => setNewMailboxColor(c.hex)}
                      className={`w-7 h-7 rounded-full border-2 transition-all cursor-pointer ${
                        newMailboxColor === c.hex ? 'border-black scale-110 shadow-xs' : 'border-transparent hover:scale-105'
                      }`}
                      style={{ backgroundColor: c.hex }}
                      title={c.name}
                    />
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-mono font-bold uppercase text-bananur-clay-light mb-1">
                  Descripción (Opcional)
                </label>
                <input
                  type="text"
                  value={newMailboxDescription}
                  onChange={(e) => setNewMailboxDescription(e.target.value)}
                  placeholder="Finalidad del buzón..."
                  className="w-full p-2 bg-[#FAF8F5] border border-bananur-sand rounded-xl text-xs text-bananur-clay"
                />
              </div>

              <div className="flex items-center justify-between gap-3 pt-3 border-t border-bananur-sand/70">
                {editingMailbox ? (
                  <button
                    type="button"
                    onClick={() => {
                      const mbxToDelete = editingMailbox;
                      setIsMailboxModalOpen(false);
                      handleDeleteMailbox(mbxToDelete);
                    }}
                    className="px-3.5 py-2 text-xs font-bold text-red-600 hover:bg-red-50 border border-red-200 rounded-xl flex items-center gap-1.5 transition-colors cursor-pointer"
                    title="Eliminar permanentemente este buzón"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Eliminar Buzón</span>
                  </button>
                ) : (
                  <div />
                )}

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setIsMailboxModalOpen(false)}
                    className="px-4 py-2 border border-bananur-sand rounded-xl text-xs font-semibold text-bananur-clay hover:bg-bananur-sand/30 cursor-pointer"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 bg-bananur-clay hover:bg-bananur-gold hover:text-black text-white rounded-xl text-xs font-bold font-mono uppercase tracking-wider transition-all cursor-pointer shadow-xs"
                  >
                    {editingMailbox ? 'Actualizar Buzón' : 'Crear Buzón'}
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* MODAL: CREAR / EDITAR PLANTILLA DE CORREO                 */}
      {/* ========================================================= */}
      {isTemplateModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-white rounded-3xl border border-bananur-sand shadow-2xl max-w-xl w-full p-6 space-y-5 animate-scale-up">
            <div className="flex items-center justify-between pb-3 border-b border-bananur-sand/70">
              <div className="flex items-center gap-2">
                <FileText className="w-5 h-5 text-bananur-gold-dark" />
                <h3 className="font-serif text-base font-bold text-bananur-clay">
                  {editingTemplate ? 'Editar Plantilla de Correo' : 'Nueva Plantilla de Correo'}
                </h3>
              </div>
              <button 
                type="button" 
                onClick={() => setIsTemplateModalOpen(false)}
                className="p-1 text-bananur-clay-light hover:text-black rounded cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveTemplate} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-mono font-bold uppercase text-bananur-clay-light mb-1">
                    Título de la Plantilla *
                  </label>
                  <input
                    type="text"
                    required
                    value={templateTitle}
                    onChange={(e) => setTemplateTitle(e.target.value)}
                    placeholder="ej. Retiro en Taller Viña"
                    className="w-full p-2.5 bg-[#FAF8F5] border border-bananur-sand rounded-xl text-xs text-bananur-clay focus:outline-none focus:border-bananur-gold font-medium"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-mono font-bold uppercase text-bananur-clay-light mb-1">
                    Categoría
                  </label>
                  <input
                    type="text"
                    value={templateCategory}
                    onChange={(e) => setTemplateCategory(e.target.value)}
                    placeholder="ej. Clientes & Retiro"
                    className="w-full p-2.5 bg-[#FAF8F5] border border-bananur-sand rounded-xl text-xs text-bananur-clay focus:outline-none focus:border-bananur-gold"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-mono font-bold uppercase text-bananur-clay-light mb-1">
                  Asunto del Correo *
                </label>
                <input
                  type="text"
                  required
                  value={templateSubject}
                  onChange={(e) => setTemplateSubject(e.target.value)}
                  placeholder="Asunto predeterminado del correo..."
                  className="w-full p-2.5 bg-[#FAF8F5] border border-bananur-sand rounded-xl text-xs text-bananur-clay focus:outline-none focus:border-bananur-gold"
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-[10px] font-mono font-bold uppercase text-bananur-clay-light">
                    Cuerpo del Mensaje *
                  </label>
                  <span className="text-[9px] font-mono text-bananur-clay-light/70">
                    Variables útiles: {'{cliente}'}, {'{pin}'}, {'{pedido}'}
                  </span>
                </div>
                <textarea
                  required
                  rows={8}
                  value={templateBody}
                  onChange={(e) => setTemplateBody(e.target.value)}
                  placeholder="Escribe el texto de la plantilla..."
                  className="w-full p-3 bg-[#FAF8F5] border border-bananur-sand rounded-xl text-xs text-bananur-clay focus:outline-none focus:border-bananur-gold leading-relaxed font-sans"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-bananur-sand/70">
                <button
                  type="button"
                  onClick={() => setIsTemplateModalOpen(false)}
                  className="px-4 py-2 border border-bananur-sand rounded-xl text-xs font-semibold text-bananur-clay hover:bg-bananur-sand/30 cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-bananur-clay hover:bg-bananur-gold hover:text-black text-white rounded-xl text-xs font-bold font-mono uppercase tracking-wider transition-all cursor-pointer shadow-xs"
                >
                  {editingTemplate ? 'Actualizar Plantilla' : 'Guardar Plantilla'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ================= MODAL: REDACTAR NUEVO CORREO / RESPUESTA ================= */}
      {isComposeOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-white rounded-3xl border border-bananur-sand shadow-2xl max-w-2xl w-full overflow-hidden flex flex-col max-h-[90vh] animate-scale-up">
            
            {/* Modal Header */}
            <div className="p-4 px-6 bg-[#2D2522] text-[#FAF8F5] flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Mail className="w-4 h-4 text-bananur-gold" />
                <h3 className="font-serif text-sm font-bold tracking-wide">
                  {composeThreadId ? 'Responder Correo Corporativo' : 'Redactar Nuevo Mensaje'}
                </h3>
              </div>
              <button
                type="button"
                id="compose-close-btn"
                onClick={() => setIsComposeOpen(false)}
                className="p-1 text-bananur-sand/80 hover:text-white rounded-lg transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Modal Body: Form */}
            <form onSubmit={triggerSendConfirmation} className="p-6 space-y-4 flex-1 overflow-y-auto">
              
              {/* Remitente Info */}
              <div className="flex items-center justify-between p-2.5 px-3 bg-[#FAF8F5] rounded-xl border border-bananur-sand/70 text-xs">
                <span className="text-[10px] font-mono uppercase font-bold text-bananur-clay-light">
                  De (Remitente):
                </span>
                <span className="font-mono font-bold text-bananur-clay">
                  {domainConfig.displayName} &lt;{composeFrom}&gt;
                </span>
              </div>

              <div>
                <label className="block text-[10px] font-mono font-bold uppercase text-bananur-clay-light mb-1">
                  Para (Destinatario) *
                </label>
                <input
                  type="email"
                  id="compose-input-to"
                  required
                  value={composeTo}
                  onChange={(e) => setComposeTo(e.target.value)}
                  placeholder="cliente@ejemplo.cl"
                  className="w-full p-2.5 bg-[#FAF8F5] border border-bananur-sand rounded-xl text-xs text-bananur-clay focus:outline-none focus:border-bananur-gold font-mono"
                />
              </div>

              <div>
                <label className="block text-[10px] font-mono font-bold uppercase text-bananur-clay-light mb-1">
                  Asunto *
                </label>
                <input
                  type="text"
                  id="compose-input-subject"
                  required
                  value={composeSubject}
                  onChange={(e) => setComposeSubject(e.target.value)}
                  placeholder="Asunto del correo..."
                  className="w-full p-2.5 bg-[#FAF8F5] border border-bananur-sand rounded-xl text-xs text-bananur-clay font-medium focus:outline-none focus:border-bananur-gold"
                />
              </div>

              {/* Plantillas selector */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-[10px] font-mono font-bold uppercase text-bananur-clay-light">
                    Insertar Plantilla Rápida
                  </label>
                  <button
                    type="button"
                    onClick={() => {
                      setIsComposeOpen(false);
                      setCurrentView('templates');
                    }}
                    className="text-[10px] font-mono text-bananur-gold-dark hover:underline"
                  >
                    Administrar plantillas →
                  </button>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {templates.map((tpl) => (
                    <button
                      key={tpl.id}
                      type="button"
                      onClick={() => {
                        setComposeSubject(tpl.subject);
                        setComposeBody(tpl.body);
                      }}
                      className="px-2.5 py-1 rounded-lg text-[10px] font-mono font-semibold bg-bananur-sand/30 hover:bg-bananur-sand text-bananur-clay transition-all cursor-pointer"
                    >
                      {tpl.title}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-mono font-bold uppercase text-bananur-clay-light mb-1">
                  Cuerpo del Mensaje *
                </label>
                <textarea
                  id="compose-input-body"
                  required
                  rows={9}
                  value={composeBody}
                  onChange={(e) => setComposeBody(e.target.value)}
                  placeholder="Escribe tu mensaje aquí..."
                  className="w-full p-3 bg-[#FAF8F5] border border-bananur-sand rounded-xl text-xs text-bananur-clay focus:outline-none focus:border-bananur-gold font-sans leading-relaxed"
                />
              </div>

              {/* Submit Buttons */}
              <div className="pt-2 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsComposeOpen(false)}
                  className="px-4 py-2 border border-bananur-sand rounded-xl text-xs font-semibold text-bananur-clay hover:bg-bananur-sand/30 transition-all cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  id="compose-submit-btn"
                  disabled={isSending}
                  className="px-6 py-2 bg-bananur-clay hover:bg-bananur-gold hover:text-black text-white rounded-xl text-xs font-bold font-mono uppercase tracking-wider flex items-center gap-2 transition-all shadow-sm cursor-pointer disabled:opacity-50"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>{isSending ? 'Enviando...' : 'Enviar Correo'}</span>
                </button>
              </div>
            </form>

          </div>
        </div>
      )}

      {/* ================= MANDATORY USER CONFIRMATION DIALOG ================= */}
      {confirmDialog.isOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-white rounded-3xl border border-bananur-sand shadow-2xl max-w-md w-full p-6 space-y-5 animate-scale-up">
            <div className="flex items-center gap-3">
              <div className={`w-10 h-10 rounded-2xl flex items-center justify-center shrink-0 ${
                confirmDialog.isDestructive ? 'bg-red-100 text-red-600' : 'bg-bananur-sand/40 text-bananur-clay'
              }`}>
                {confirmDialog.isDestructive ? <Trash2 className="w-5 h-5" /> : <Send className="w-5 h-5" />}
              </div>
              <div>
                <h3 className="font-serif text-base font-bold text-bananur-clay">
                  {confirmDialog.title}
                </h3>
                <span className="text-[10px] font-mono text-bananur-clay-light uppercase tracking-wider">
                  Acción en Correo Corporativo
                </span>
              </div>
            </div>

            <p className="text-xs text-bananur-clay-light leading-relaxed">
              {confirmDialog.description}
            </p>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                id="confirm-dialog-cancel"
                onClick={() => setConfirmDialog(prev => ({ ...prev, isOpen: false }))}
                className="px-4 py-2 border border-bananur-sand rounded-xl text-xs font-semibold text-bananur-clay hover:bg-bananur-sand/30 transition-all cursor-pointer"
              >
                Cancelar
              </button>
              <button
                type="button"
                id="confirm-dialog-proceed"
                onClick={confirmDialog.onConfirm}
                className={`px-5 py-2 rounded-xl text-xs font-bold font-mono uppercase tracking-wider transition-all cursor-pointer shadow-sm ${
                  confirmDialog.isDestructive
                    ? 'bg-red-600 hover:bg-red-700 text-white'
                    : 'bg-bananur-clay hover:bg-bananur-gold hover:text-black text-white'
                }`}
              >
                {confirmDialog.actionLabel}
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
