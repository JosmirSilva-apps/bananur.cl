import React, { useState, useEffect } from 'react';
import { 
  Palette, 
  Type, 
  Plus, 
  Trash2, 
  Eye, 
  Check, 
  RotateCcw, 
  FileText, 
  Sparkles, 
  Layout, 
  Save, 
  Settings,
  Heading,
  FileCode,
  Languages,
  Image as ImageIcon,
  Sliders,
  Shapes,
  Maximize2,
  Smartphone,
  Monitor,
  CheckCircle2,
  Brush,
  Layers,
  ArrowRight
} from 'lucide-react';
import { ClientCustomization, CustomPage } from '../types';

interface AdminPersonalizadorProps {
  customization: ClientCustomization;
  onUpdateCustomization: React.Dispatch<React.SetStateAction<ClientCustomization>>;
  onShowToast: (title: string, message: string, type?: 'success' | 'info' | 'warning' | 'error') => void;
}

const PRESETS = [
  {
    id: 'minimal-nordic',
    name: 'Minimalista Nórdico',
    primary: '#18181B', // zinc-900
    accent: '#B58455',  // terracotta warm
    background: '#FBFBFA', // warm pure white
    surface: '#FFFFFF',
    text: '#18181B',
    border: '#E4E4E7',
    fontFamily: 'font-sans' as const,
    borderRadius: 'minimal' as const,
    description: 'Estética arquitectónica escandinava: contrastes sobrios, espacio negativo generoso y elegancia neutra.'
  },
  {
    id: 'terracotta-boutique',
    name: 'Boutique Viña del Mar',
    primary: '#2D2522', // arcilla profunda
    accent: '#B58455',  // oro cálido
    background: '#FAF8F5', // arena boutique
    surface: '#FFFFFF',
    text: '#2D2522',
    border: '#EFECE6',
    fontFamily: 'font-serif' as const,
    borderRadius: 'rounded' as const,
    description: 'Nuestra identidad icónica de Viña del Mar con tonos terracota, papel lino y acentos dorados.'
  },
  {
    id: 'neo-studio',
    name: 'Neo-Studio Salvia & Bosque',
    primary: '#1B4332', // verde bosque profundo
    accent: '#52B788',  // salvia fresco
    background: '#F8FAF9', // blanco verdoso sutil
    surface: '#FFFFFF',
    text: '#081C15',
    border: '#D8F3DC',
    fontFamily: 'font-jakarta' as const,
    borderRadius: 'rounded' as const,
    description: 'Inspirado en la botánica y el oficio textil consciente. Fresco, limpio y profundamente contemporáneo.'
  },
  {
    id: 'luxury-monolith',
    name: 'Ébano & Champagne Luxury',
    primary: '#09090B', // negro profundo
    accent: '#D4AF37',  // oro champagne
    background: '#FAFAF9', // piedra caliza
    surface: '#FFFFFF',
    text: '#09090B',
    border: '#E7E5E4',
    fontFamily: 'font-cinzel' as const,
    borderRadius: 'sharp' as const,
    description: 'Lujo editorial de galería de arte y atelier exclusivo. Líneas puras, esquinas rectas y alta distinción.'
  },
  {
    id: 'cyber-industrial',
    name: 'Cyber Taller & Grafito',
    primary: '#27272A', // grafito técnico
    accent: '#84CC16',  // lima fluorescente
    background: '#F4F4F5', // titanio claro
    surface: '#FFFFFF',
    text: '#18181B',
    border: '#E4E4E7',
    fontFamily: 'font-space' as const,
    borderRadius: 'minimal' as const,
    description: 'Brutalismo técnico y minimalista, concebido para manufactura 3D, código y prototipado.'
  },
  {
    id: 'ocean-pacific',
    name: 'Brisa del Pacífico',
    primary: '#0F172A', // azul noche oceánico
    accent: '#38BDF8',  // cielo costero
    background: '#F8FAFC', // espuma de mar
    surface: '#FFFFFF',
    text: '#0F172A',
    border: '#E2E8F0',
    fontFamily: 'font-outfit' as const,
    borderRadius: 'pill' as const,
    description: 'Inspiración costera de la bahía de Valparaíso y Viña del Mar. Luminoso, ligero y geométrico.'
  }
];

const FONTS = [
  { id: 'font-sans', name: 'Inter', category: 'Sans-serif Suizo', preview: 'El rápido murciélago hindú' },
  { id: 'font-jakarta', name: 'Plus Jakarta Sans', category: 'Neo-Grotesque Moderna', preview: 'Manufactura consciente en Viña' },
  { id: 'font-outfit', name: 'Outfit', category: 'Geométrica Contemporánea', preview: 'Diseño boutique y proporciones' },
  { id: 'font-serif', name: 'Playfair Display', category: 'Serif Editorial Clásica', preview: 'Atelier y Moldería Fina' },
  { id: 'font-cinzel', name: 'Cinzel', category: 'Serif Clásica de Galería', preview: 'ARTE & OFICIO CHILENO' },
  { id: 'font-space', name: 'Space Grotesk', category: 'Técnica Industrial', preview: 'Tecnología 3D & Artesanía' },
  { id: 'font-montserrat', name: 'Montserrat', category: 'Urbana & Arquitectónica', preview: 'Espacio Creativo 1 Norte 450' },
  { id: 'font-mono', name: 'JetBrains Mono', category: 'Monoespaciada de Taller', preview: 'G-code: M104 S215 T0' }
];

const CURATED_HERO_IMAGES = [
  {
    id: 'studio-textile',
    name: 'Taller de Confección & Hilos',
    url: 'https://images.unsplash.com/photo-1558769132-cb1aea458c5e?auto=format&fit=crop&w=1600&q=80',
    description: 'Máquinas de coser industriales, bobinas y lona de algodón natural.'
  },
  {
    id: 'studio-ceramic',
    name: 'Cerámica Gres & Fuego',
    url: 'https://images.unsplash.com/photo-1565193566173-7a0ee3dbe261?auto=format&fit=crop&w=1600&q=80',
    description: 'Esmaltes minerales y arcillas modeladas a mano.'
  },
  {
    id: 'studio-3d',
    name: 'Granja de Impresión 3D & PLA',
    url: 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=1600&q=80',
    description: 'Prototipado aditivo de precisión en filamento biodegradable.'
  },
  {
    id: 'studio-paper',
    name: 'Papelería & Encuadernación',
    url: 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&w=1600&q=80',
    description: 'Cuadernos cosidos a mano con hojas libres de ácido.'
  },
  {
    id: 'studio-workshop',
    name: 'Atelier Creativo Viña del Mar',
    url: 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?auto=format&fit=crop&w=1600&q=80',
    description: 'Tienda principal y mesa de diseño luminosa en 1 Norte 450.'
  }
];

export default function AdminPersonalizador({
  customization,
  onUpdateCustomization,
  onShowToast
}: AdminPersonalizadorProps) {
  // Main sub-tabs: 'estilo' | 'tipografia' | 'imagenes' | 'geometria' | 'contenido' | 'paginas'
  const [editorTab, setEditorTab] = useState<'estilo' | 'tipografia' | 'imagenes' | 'geometria' | 'contenido' | 'paginas'>('estilo');

  // Preview device mode: 'desktop' | 'mobile'
  const [previewDevice, setPreviewDevice] = useState<'desktop' | 'mobile'>('desktop');

  // Local state for custom page addition
  const [newPageTitle, setNewPageTitle] = useState('');
  const [newPageMarkdown, setNewPageMarkdown] = useState('');

  // Custom image input state
  const [customImageUrl, setCustomImageUrl] = useState('');

  // Inject CSS variables to document head for instant site-wide application
  useEffect(() => {
    const root = document.documentElement;
    if (customization.primaryColor) {
      root.style.setProperty('--color-primary-custom', customization.primaryColor);
    }
    if (customization.accentColor) {
      root.style.setProperty('--color-accent-custom', customization.accentColor);
    }
    if (customization.backgroundColor) {
      root.style.setProperty('--color-background-custom', customization.backgroundColor);
    }
  }, [customization]);

  // Apply a full preset
  const applyPreset = (preset: typeof PRESETS[number]) => {
    onUpdateCustomization(prev => ({
      ...prev,
      presetName: preset.id,
      primaryColor: preset.primary,
      accentColor: preset.accent,
      backgroundColor: preset.background,
      surfaceColor: preset.surface,
      textColor: preset.text,
      borderColor: preset.border,
      fontFamily: preset.fontFamily,
      borderRadius: preset.borderRadius
    }));
    onShowToast(
      'Estilo Aplicado', 
      `Se configuró la paleta "${preset.name}". Todo el sitio se ha actualizado.`, 
      'success'
    );
  };

  // Add custom client page
  const handleAddPage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPageTitle.trim()) return;

    const pageId = 'custom-' + newPageTitle.trim().toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)+/g, '');

    if (customization.customPages.some(p => p.id === pageId)) {
      onShowToast('Error', 'Ya existe una página con ese nombre o identificador.', 'error');
      return;
    }

    const newPage: CustomPage = {
      id: pageId,
      title: newPageTitle.trim(),
      contentMarkdown: newPageMarkdown.trim() || `# ${newPageTitle}\n\nEscribe aquí el contenido personalizado que desees para tu nueva página pública.`,
      enabled: true
    };

    onUpdateCustomization(prev => ({
      ...prev,
      customPages: [...prev.customPages, newPage]
    }));

    onShowToast('Página Creada', `La página "${newPage.title}" se agregó al menú de navegación.`, 'success');
    setNewPageTitle('');
    setNewPageMarkdown('');
  };

  const handleDeletePage = (id: string, title: string) => {
    onUpdateCustomization(prev => ({
      ...prev,
      customPages: prev.customPages.filter(p => p.id !== id)
    }));
    onShowToast('Página Eliminada', `Se removió la página "${title}".`, 'warning');
  };

  const handleTogglePage = (id: string, currentState: boolean, title: string) => {
    onUpdateCustomization(prev => ({
      ...prev,
      customPages: prev.customPages.map(p => p.id === id ? { ...p, enabled: !currentState } : p)
    }));
    onShowToast(
      currentState ? 'Página Oculta' : 'Página Visible', 
      `La página "${title}" ahora está ${currentState ? 'oculta' : 'visible'} para los clientes.`, 
      'info'
    );
  };

  const handleResetToDefaults = () => {
    const defaultPreset = PRESETS[0];
    onUpdateCustomization({
      presetName: defaultPreset.id,
      primaryColor: defaultPreset.primary,
      accentColor: defaultPreset.accent,
      backgroundColor: defaultPreset.background,
      surfaceColor: defaultPreset.surface,
      textColor: defaultPreset.text,
      borderColor: defaultPreset.border,
      fontFamily: 'font-sans',
      borderRadius: 'minimal',
      heroTitle: 'Transformación Digital con el Oficio Justo de Siempre',
      heroSubtitle: 'Diseño boutique de papelería corporativa, gres cerámico y soportes industriales de autor, manufacturados éticamente en Viña del Mar, Chile.',
      aboutTitle: 'Filosofía Bananur',
      aboutText: 'Rechazamos la uniformidad de la masa industrial y priorizamos procesos de producción pausados y conscientes en nuestra tienda principal de Viña del Mar.',
      customPages: [
        {
          id: 'custom-taller-tour',
          title: 'Tour Virtual Taller',
          contentMarkdown: '# Tour de nuestra Tienda Principal & Taller en Viña del Mar\n\nBienvenido a nuestro espacio de diseño en 1 Norte 450, Viña del Mar.',
          enabled: true
        }
      ]
    });
    onShowToast('Valores Restablecidos', 'Se ha vuelto a la apariencia minimalista original.', 'info');
  };

  return (
    <div className="p-6 sm:p-10 space-y-8 animate-fade-in bg-[#FAF8F5] min-h-screen font-sans text-bananur-clay">
      
      {/* Top Header */}
      <div className="border-b border-bananur-sand pb-6 flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <span className="text-xs font-mono text-bananur-gold-dark font-extrabold uppercase tracking-widest block mb-1">
            ESTUDIO DE DISEÑO & IDENTIDAD
          </span>
          <h1 className="font-serif text-3xl sm:text-4xl font-extrabold text-bananur-clay leading-tight">
            Personalizador de Apariencia
          </h1>
          <p className="text-xs sm:text-sm text-bananur-clay-light max-w-2xl mt-1 leading-relaxed">
            Personaliza cada aspecto visual de la aplicación con un diseño moderno, minimalista y refinado: paletas de color a medida, tipografías elegantes, banners de taller e iconografía.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleResetToDefaults}
            className="px-4 py-2.5 border border-bananur-sand rounded-xl text-xs font-bold font-mono text-bananur-clay hover:bg-white hover:text-black transition-all flex items-center gap-1.5 cursor-pointer shadow-3xs"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Restablecer</span>
          </button>
        </div>
      </div>

      {/* Main Grid: Control Panel (Left) & Real-time Live Preview (Right) */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-8 items-start">
        
        {/* LEFT COLUMN: THE CONTROLS */}
        <div className="xl:col-span-7 bg-white rounded-3xl border border-bananur-sand/80 shadow-xs overflow-hidden flex flex-col">
          
          {/* Sub-tabs bar */}
          <div className="flex flex-wrap border-b border-bananur-sand/80 bg-[#FCFBF9]">
            <button
              type="button"
              onClick={() => setEditorTab('estilo')}
              className={`flex-1 py-3.5 px-3 text-xs font-bold font-mono uppercase tracking-wider border-b-2 transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                editorTab === 'estilo'
                  ? 'border-bananur-clay text-bananur-clay bg-white'
                  : 'border-transparent text-bananur-clay-light/70 hover:text-bananur-clay'
              }`}
            >
              <Palette className="w-3.5 h-3.5 text-bananur-gold-dark" />
              <span>Colores</span>
            </button>

            <button
              type="button"
              onClick={() => setEditorTab('tipografia')}
              className={`flex-1 py-3.5 px-3 text-xs font-bold font-mono uppercase tracking-wider border-b-2 transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                editorTab === 'tipografia'
                  ? 'border-bananur-clay text-bananur-clay bg-white'
                  : 'border-transparent text-bananur-clay-light/70 hover:text-bananur-clay'
              }`}
            >
              <Type className="w-3.5 h-3.5" />
              <span>Tipografías</span>
            </button>

            <button
              type="button"
              onClick={() => setEditorTab('imagenes')}
              className={`flex-1 py-3.5 px-3 text-xs font-bold font-mono uppercase tracking-wider border-b-2 transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                editorTab === 'imagenes'
                  ? 'border-bananur-clay text-bananur-clay bg-white'
                  : 'border-transparent text-bananur-clay-light/70 hover:text-bananur-clay'
              }`}
            >
              <ImageIcon className="w-3.5 h-3.5" />
              <span>Imágenes</span>
            </button>

            <button
              type="button"
              onClick={() => setEditorTab('geometria')}
              className={`flex-1 py-3.5 px-3 text-xs font-bold font-mono uppercase tracking-wider border-b-2 transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                editorTab === 'geometria'
                  ? 'border-bananur-clay text-bananur-clay bg-white'
                  : 'border-transparent text-bananur-clay-light/70 hover:text-bananur-clay'
              }`}
            >
              <Shapes className="w-3.5 h-3.5" />
              <span>Geometría</span>
            </button>

            <button
              type="button"
              onClick={() => setEditorTab('contenido')}
              className={`flex-1 py-3.5 px-3 text-xs font-bold font-mono uppercase tracking-wider border-b-2 transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                editorTab === 'contenido'
                  ? 'border-bananur-clay text-bananur-clay bg-white'
                  : 'border-transparent text-bananur-clay-light/70 hover:text-bananur-clay'
              }`}
            >
              <Heading className="w-3.5 h-3.5" />
              <span>Textos</span>
            </button>

            <button
              type="button"
              onClick={() => setEditorTab('paginas')}
              className={`flex-1 py-3.5 px-3 text-xs font-bold font-mono uppercase tracking-wider border-b-2 transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                editorTab === 'paginas'
                  ? 'border-bananur-clay text-bananur-clay bg-white'
                  : 'border-transparent text-bananur-clay-light/70 hover:text-bananur-clay'
              }`}
            >
              <FileText className="w-3.5 h-3.5" />
              <span>Páginas ({customization.customPages.length})</span>
            </button>
          </div>

          <div className="p-6 sm:p-8 space-y-6">
            
            {/* SUBTAB 1: PALETAS & COLORES */}
            {editorTab === 'estilo' && (
              <div className="space-y-6">
                <div>
                  <h3 className="font-serif text-base font-bold text-bananur-clay">
                    Paletas de Estilo Minimalista
                  </h3>
                  <p className="text-xs text-bananur-clay-light mt-0.5">
                    Selecciona una combinación prediseñada o personaliza cada código de color.
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                  {PRESETS.map((p) => {
                    const isSelected = customization.presetName === p.id;
                    return (
                      <div
                        key={p.id}
                        onClick={() => applyPreset(p)}
                        className={`p-4 rounded-2xl border transition-all cursor-pointer flex flex-col justify-between space-y-3 ${
                          isSelected 
                            ? 'border-bananur-clay ring-2 ring-bananur-clay/20 bg-[#FAF8F5] shadow-xs' 
                            : 'border-bananur-sand/80 hover:border-bananur-clay/40 bg-white'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-xs text-bananur-clay">{p.name}</span>
                          {isSelected && (
                            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                          )}
                        </div>

                        {/* Color swatches */}
                        <div className="flex items-center gap-2">
                          <span className="w-6 h-6 rounded-lg shadow-2xs border border-black/10" style={{ backgroundColor: p.primary }} title="Primario" />
                          <span className="w-6 h-6 rounded-lg shadow-2xs border border-black/10" style={{ backgroundColor: p.accent }} title="Acento" />
                          <span className="w-6 h-6 rounded-lg shadow-2xs border border-black/10" style={{ backgroundColor: p.background }} title="Fondo" />
                          <span className="w-6 h-6 rounded-lg shadow-2xs border border-black/10" style={{ backgroundColor: p.text }} title="Texto" />
                        </div>

                        <p className="text-[10px] text-bananur-clay-light leading-relaxed line-clamp-2">
                          {p.description}
                        </p>
                      </div>
                    );
                  })}
                </div>

                {/* Custom Hex Pickers */}
                <div className="pt-4 border-t border-bananur-sand/60 space-y-4">
                  <h4 className="text-xs font-mono font-bold uppercase text-bananur-clay tracking-wider">
                    Ajuste Fino de Colores Hexadecimales
                  </h4>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-[10px] font-mono font-bold uppercase text-bananur-clay-light mb-1">
                        Color Primario
                      </label>
                      <div className="flex items-center gap-2 p-1.5 bg-[#FAF8F5] border border-bananur-sand rounded-xl">
                        <input
                          type="color"
                          value={customization.primaryColor}
                          onChange={(e) => onUpdateCustomization(prev => ({ ...prev, primaryColor: e.target.value, presetName: 'custom' }))}
                          className="w-7 h-7 rounded-lg cursor-pointer border-0 bg-transparent"
                        />
                        <input
                          type="text"
                          value={customization.primaryColor}
                          onChange={(e) => onUpdateCustomization(prev => ({ ...prev, primaryColor: e.target.value, presetName: 'custom' }))}
                          className="w-full text-xs font-mono text-bananur-clay bg-transparent border-0 focus:outline-none"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-[10px] font-mono font-bold uppercase text-bananur-clay-light mb-1">
                        Color de Acento
                      </label>
                      <div className="flex items-center gap-2 p-1.5 bg-[#FAF8F5] border border-bananur-sand rounded-xl">
                        <input
                          type="color"
                          value={customization.accentColor}
                          onChange={(e) => onUpdateCustomization(prev => ({ ...prev, accentColor: e.target.value, presetName: 'custom' }))}
                          className="w-7 h-7 rounded-lg cursor-pointer border-0 bg-transparent"
                        />
                        <input
                          type="text"
                          value={customization.accentColor}
                          onChange={(e) => onUpdateCustomization(prev => ({ ...prev, accentColor: e.target.value, presetName: 'custom' }))}
                          className="w-full text-xs font-mono text-bananur-clay bg-transparent border-0 focus:outline-none"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-[10px] font-mono font-bold uppercase text-bananur-clay-light mb-1">
                        Color de Fondo
                      </label>
                      <div className="flex items-center gap-2 p-1.5 bg-[#FAF8F5] border border-bananur-sand rounded-xl">
                        <input
                          type="color"
                          value={customization.backgroundColor}
                          onChange={(e) => onUpdateCustomization(prev => ({ ...prev, backgroundColor: e.target.value, presetName: 'custom' }))}
                          className="w-7 h-7 rounded-lg cursor-pointer border-0 bg-transparent"
                        />
                        <input
                          type="text"
                          value={customization.backgroundColor}
                          onChange={(e) => onUpdateCustomization(prev => ({ ...prev, backgroundColor: e.target.value, presetName: 'custom' }))}
                          className="w-full text-xs font-mono text-bananur-clay bg-transparent border-0 focus:outline-none"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* SUBTAB 2: TIPOGRAFÍAS */}
            {editorTab === 'tipografia' && (
              <div className="space-y-6">
                <div>
                  <h3 className="font-serif text-base font-bold text-bananur-clay">
                    Tipografías Modernas del Sistema
                  </h3>
                  <p className="text-xs text-bananur-clay-light mt-0.5">
                    Selecciona la fuente que gobernará títulos, botones y contenidos editoriales.
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                  {FONTS.map((f) => {
                    const isSelected = customization.fontFamily === f.id;
                    return (
                      <div
                        key={f.id}
                        onClick={() => {
                          onUpdateCustomization(prev => ({ ...prev, fontFamily: f.id as any }));
                          onShowToast('Tipografía Cambiada', `Fuente establecida en ${f.name}.`, 'info');
                        }}
                        className={`p-4 rounded-2xl border transition-all cursor-pointer flex flex-col justify-between space-y-2 ${
                          isSelected 
                            ? 'border-bananur-clay ring-2 ring-bananur-clay/20 bg-[#FAF8F5]' 
                            : 'border-bananur-sand/80 hover:border-bananur-clay/40 bg-white'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-xs text-bananur-clay">{f.name}</span>
                          <span className="text-[9px] font-mono uppercase bg-bananur-sand/50 text-bananur-clay px-1.5 py-0.5 rounded">
                            {f.category}
                          </span>
                        </div>

                        <p className={`text-sm text-bananur-clay pt-1 font-medium ${f.id}`}>
                          {f.preview}
                        </p>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* SUBTAB 3: IMÁGENES & BANNER DE PORTADA */}
            {editorTab === 'imagenes' && (
              <div className="space-y-6">
                <div>
                  <h3 className="font-serif text-base font-bold text-bananur-clay">
                    Banner Principal del Taller & Portada
                  </h3>
                  <p className="text-xs text-bananur-clay-light mt-0.5">
                    Selecciona una fotografía curada de alta resolución de nuestro taller o ingresa tu propio enlace.
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {CURATED_HERO_IMAGES.map((img) => {
                    const isSelected = customization.heroImageUrl === img.url;
                    return (
                      <div
                        key={img.id}
                        onClick={() => {
                          onUpdateCustomization(prev => ({ ...prev, heroImageUrl: img.url }));
                          onShowToast('Imagen de Portada Actualizada', `Se cargó: ${img.name}.`, 'success');
                        }}
                        className={`group relative rounded-2xl overflow-hidden border-2 transition-all cursor-pointer ${
                          isSelected ? 'border-bananur-clay ring-2 ring-bananur-clay/30' : 'border-transparent hover:border-bananur-sand'
                        }`}
                      >
                        <img 
                          src={img.url} 
                          alt={img.name} 
                          className="w-full h-32 object-cover group-hover:scale-105 transition-transform duration-300" 
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent p-3 flex flex-col justify-end text-white">
                          <span className="font-bold text-xs">{img.name}</span>
                          <span className="text-[10px] text-white/80 line-clamp-1">{img.description}</span>
                        </div>
                        {isSelected && (
                          <div className="absolute top-2 right-2 bg-emerald-500 text-white p-1 rounded-full">
                            <Check className="w-3 h-3" />
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>

                {/* Custom URL input */}
                <div className="pt-4 border-t border-bananur-sand/60 space-y-2">
                  <label className="block text-[10px] font-mono font-bold uppercase text-bananur-clay-light">
                    O ingresa una URL personalizada de imagen
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="url"
                      value={customImageUrl}
                      onChange={(e) => setCustomImageUrl(e.target.value)}
                      placeholder="https://ejemplo.com/mi-taller-vina.jpg"
                      className="flex-1 p-2.5 bg-[#FAF8F5] border border-bananur-sand rounded-xl text-xs text-bananur-clay font-mono"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        if (customImageUrl.trim()) {
                          onUpdateCustomization(prev => ({ ...prev, heroImageUrl: customImageUrl.trim() }));
                          onShowToast('Imagen Cargada', 'Se actualizó la portada con la URL ingresada.', 'success');
                        }
                      }}
                      className="px-4 py-2.5 bg-bananur-clay text-white rounded-xl text-xs font-bold font-mono uppercase tracking-wider cursor-pointer hover:bg-bananur-gold hover:text-black transition-all"
                    >
                      Aplicar
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* SUBTAB 4: GEOMETRÍA & GRÁFICOS */}
            {editorTab === 'geometria' && (
              <div className="space-y-6">
                <div>
                  <h3 className="font-serif text-base font-bold text-bananur-clay">
                    Geometría de Bordes & Tramas Gráficas
                  </h3>
                  <p className="text-xs text-bananur-clay-light mt-0.5">
                    Modifica el radio de curvatura y detalles gráficos de fondo.
                  </p>
                </div>

                {/* Border Radius Options */}
                <div className="space-y-2">
                  <span className="text-[10px] font-mono font-bold uppercase text-bananur-clay-light">
                    Radio de Esquinas (Border Radius)
                  </span>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    {[
                      { id: 'sharp', label: 'Recto (0px)', class: 'rounded-none', desc: 'Minimalismo suizo puro' },
                      { id: 'minimal', label: 'Sutil (8px)', class: 'rounded-lg', desc: 'Bordes discretos' },
                      { id: 'rounded', label: 'Moderno (16px)', class: 'rounded-2xl', desc: 'Suave y contemporáneo' },
                      { id: 'pill', label: 'Cápsula (24px)', class: 'rounded-3xl', desc: 'Boutique amigable' }
                    ].map((rad) => {
                      const isSelected = (customization.borderRadius || 'rounded') === rad.id;
                      return (
                        <button
                          key={rad.id}
                          type="button"
                          onClick={() => {
                            onUpdateCustomization(prev => ({ ...prev, borderRadius: rad.id as any }));
                            onShowToast('Esquinas Actualizadas', `Estilo cambiado a ${rad.label}.`, 'info');
                          }}
                          className={`p-3.5 border text-center transition-all cursor-pointer flex flex-col items-center justify-between gap-2 ${rad.class} ${
                            isSelected 
                              ? 'border-bananur-clay ring-2 ring-bananur-clay/20 bg-[#FAF8F5]' 
                              : 'border-bananur-sand/80 bg-white hover:border-bananur-clay/40'
                          }`}
                        >
                          <span className="font-bold text-xs text-bananur-clay">{rad.label}</span>
                          <span className="text-[9px] text-bananur-clay-light">{rad.desc}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Background Pattern */}
                <div className="pt-4 border-t border-bananur-sand/60 space-y-2">
                  <span className="text-[10px] font-mono font-bold uppercase text-bananur-clay-light">
                    Tramas Gráficas de Fondo
                  </span>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    {[
                      { id: 'clean', label: 'Limpio Puro', desc: 'Sin tramas decorativas' },
                      { id: 'dots', label: 'Puntos Arquitectónicos', desc: 'Sutileza de cuadrícula' },
                      { id: 'grid', label: 'Malla Técnica', desc: 'Cuadrícula de taller' },
                      { id: 'warm-paper', label: 'Papel Artesanal', desc: 'Textura orgánica suave' }
                    ].map((pat) => {
                      const isSelected = (customization.bannerPattern || 'clean') === pat.id;
                      return (
                        <button
                          key={pat.id}
                          type="button"
                          onClick={() => onUpdateCustomization(prev => ({ ...prev, bannerPattern: pat.id as any }))}
                          className={`p-3 border rounded-xl text-center transition-all cursor-pointer ${
                            isSelected ? 'border-bananur-clay ring-2 ring-bananur-clay/20 bg-[#FAF8F5]' : 'border-bananur-sand/80 bg-white hover:border-bananur-clay/40'
                          }`}
                        >
                          <span className="font-bold text-xs text-bananur-clay block">{pat.label}</span>
                          <span className="text-[9px] text-bananur-clay-light">{pat.desc}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>
            )}

            {/* SUBTAB 5: TEXTOS & FILOSOFÍA */}
            {editorTab === 'contenido' && (
              <div className="space-y-4">
                <div>
                  <h3 className="font-serif text-base font-bold text-bananur-clay">
                    Textos de Portada & Filosofía de Taller
                  </h3>
                  <p className="text-xs text-bananur-clay-light mt-0.5">
                    Modifica el lema principal y la historia de Bananur en Viña del Mar.
                  </p>
                </div>

                <div>
                  <label className="block text-[10px] font-mono font-bold uppercase text-bananur-clay-light mb-1">
                    Título Principal de Portada (Hero Title)
                  </label>
                  <input
                    type="text"
                    value={customization.heroTitle}
                    onChange={(e) => onUpdateCustomization(prev => ({ ...prev, heroTitle: e.target.value }))}
                    className="w-full p-2.5 bg-[#FAF8F5] border border-bananur-sand rounded-xl text-xs text-bananur-clay font-medium"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-mono font-bold uppercase text-bananur-clay-light mb-1">
                    Subtítulo Descriptivo
                  </label>
                  <textarea
                    rows={3}
                    value={customization.heroSubtitle}
                    onChange={(e) => onUpdateCustomization(prev => ({ ...prev, heroSubtitle: e.target.value }))}
                    className="w-full p-2.5 bg-[#FAF8F5] border border-bananur-sand rounded-xl text-xs text-bananur-clay font-medium leading-relaxed"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-mono font-bold uppercase text-bananur-clay-light mb-1">
                    Texto Filosofía Bananur
                  </label>
                  <textarea
                    rows={4}
                    value={customization.aboutText}
                    onChange={(e) => onUpdateCustomization(prev => ({ ...prev, aboutText: e.target.value }))}
                    className="w-full p-2.5 bg-[#FAF8F5] border border-bananur-sand rounded-xl text-xs text-bananur-clay leading-relaxed"
                  />
                </div>
              </div>
            )}

            {/* SUBTAB 6: PÁGINAS ADICIONALES */}
            {editorTab === 'paginas' && (
              <div className="space-y-6">
                <div>
                  <h3 className="font-serif text-base font-bold text-bananur-clay">
                    Páginas Personalizadas Públicas
                  </h3>
                  <p className="text-xs text-bananur-clay-light mt-0.5">
                    Añade páginas informativas adicionales que se integran a la barra de navegación del cliente.
                  </p>
                </div>

                {/* Form to add page */}
                <form onSubmit={handleAddPage} className="p-4 bg-[#FAF8F5] rounded-2xl border border-bananur-sand/80 space-y-3">
                  <div className="flex gap-2">
                    <input
                      type="text"
                      required
                      value={newPageTitle}
                      onChange={(e) => setNewPageTitle(e.target.value)}
                      placeholder="Título de la nueva página (ej. Taller de Cerámica)..."
                      className="flex-1 p-2 bg-white border border-bananur-sand rounded-xl text-xs text-bananur-clay"
                    />
                    <button
                      type="submit"
                      className="px-4 py-2 bg-bananur-clay hover:bg-bananur-gold hover:text-black text-white rounded-xl text-xs font-bold font-mono uppercase tracking-wider cursor-pointer transition-all"
                    >
                      + Crear
                    </button>
                  </div>
                  <textarea
                    rows={3}
                    value={newPageMarkdown}
                    onChange={(e) => setNewPageMarkdown(e.target.value)}
                    placeholder="Contenido en formato Markdown (opcional)..."
                    className="w-full p-2 bg-white border border-bananur-sand rounded-xl text-xs text-bananur-clay"
                  />
                </form>

                {/* List of existing custom pages */}
                <div className="space-y-2">
                  {customization.customPages.map((page) => (
                    <div 
                      key={page.id}
                      className="p-3 bg-white rounded-xl border border-bananur-sand/80 flex items-center justify-between gap-3 shadow-3xs"
                    >
                      <div>
                        <span className="font-bold text-xs text-bananur-clay block">{page.title}</span>
                        <span className="text-[10px] font-mono text-bananur-clay-light">/{page.id}</span>
                      </div>

                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => handleTogglePage(page.id, page.enabled, page.title)}
                          className={`px-2.5 py-1 rounded-lg text-[10px] font-mono font-bold cursor-pointer ${
                            page.enabled ? 'bg-emerald-100 text-emerald-800' : 'bg-gray-100 text-gray-600'
                          }`}
                        >
                          {page.enabled ? 'Visible' : 'Oculta'}
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDeletePage(page.id, page.title)}
                          className="p-1 hover:bg-red-50 text-bananur-clay-light hover:text-red-600 rounded cursor-pointer"
                          title="Eliminar página"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

          </div>
        </div>

        {/* RIGHT COLUMN: LIVE INTERACTIVE PREVIEW */}
        <div className="xl:col-span-5 space-y-4 sticky top-6">
          <div className="bg-white rounded-3xl border border-bananur-sand/80 shadow-xs p-5 space-y-4">
            <div className="flex items-center justify-between border-b border-bananur-sand/60 pb-3">
              <div className="flex items-center gap-2">
                <Eye className="w-4 h-4 text-bananur-gold-dark" />
                <span className="font-serif text-xs font-bold text-bananur-clay uppercase tracking-wider">
                  Vista Previa en Vivo
                </span>
              </div>

              {/* Device switcher */}
              <div className="flex items-center gap-1 bg-[#FAF8F5] p-1 rounded-xl border border-bananur-sand">
                <button
                  type="button"
                  onClick={() => setPreviewDevice('desktop')}
                  className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                    previewDevice === 'desktop' ? 'bg-bananur-clay text-white shadow-2xs' : 'text-bananur-clay-light hover:text-black'
                  }`}
                  title="Vista Escritorio"
                >
                  <Monitor className="w-3.5 h-3.5" />
                </button>
                <button
                  type="button"
                  onClick={() => setPreviewDevice('mobile')}
                  className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                    previewDevice === 'mobile' ? 'bg-bananur-clay text-white shadow-2xs' : 'text-bananur-clay-light hover:text-black'
                  }`}
                  title="Vista Móvil"
                >
                  <Smartphone className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* Simulated Miniature Storefront Preview Card */}
            <div 
              className={`border border-bananur-sand/70 overflow-hidden shadow-inner transition-all mx-auto ${
                previewDevice === 'mobile' ? 'max-w-[280px] rounded-3xl' : 'w-full rounded-2xl'
              }`}
              style={{ 
                backgroundColor: customization.backgroundColor,
                color: customization.textColor || customization.primaryColor
              }}
            >
              {/* Simulated mini header */}
              <div className="p-3 border-b border-black/5 bg-white/70 flex items-center justify-between text-[10px]">
                <span className="font-serif font-black tracking-wider text-xs">BANANUR</span>
                <div className="flex gap-2 text-[9px] font-mono">
                  <span>Tienda</span>
                  <span>Taller</span>
                  <span>Viña del Mar</span>
                </div>
              </div>

              {/* Simulated Hero */}
              <div className="relative p-5 text-center space-y-2 overflow-hidden">
                {customization.heroImageUrl && (
                  <div className="absolute inset-0 opacity-15">
                    <img src={customization.heroImageUrl} alt="" className="w-full h-full object-cover" />
                  </div>
                )}
                <div className="relative z-10 space-y-2">
                  <span 
                    className="text-[8px] font-mono font-bold uppercase tracking-widest px-2 py-0.5 rounded-full inline-block"
                    style={{ backgroundColor: `${customization.accentColor}25`, color: customization.primaryColor }}
                  >
                    Atelier 1 Norte 450
                  </span>
                  <h4 className="font-serif text-base font-black leading-tight">
                    {customization.heroTitle}
                  </h4>
                  <p className="text-[10px] opacity-80 line-clamp-2 leading-relaxed">
                    {customization.heroSubtitle}
                  </p>
                  <div className="pt-1">
                    <button
                      type="button"
                      className="px-4 py-1.5 text-[10px] font-bold font-mono uppercase tracking-wider rounded-xl transition-all shadow-2xs"
                      style={{ 
                        backgroundColor: customization.primaryColor, 
                        color: '#FFFFFF' 
                      }}
                    >
                      Explorar Catálogo
                    </button>
                  </div>
                </div>
              </div>

              {/* Simulated Product Card */}
              <div className="p-3 bg-white/80 border-t border-black/5 space-y-2">
                <span className="text-[9px] font-mono uppercase font-bold text-bananur-clay-light block">
                  Pieza Destacada
                </span>
                <div className="p-2.5 rounded-xl border border-black/5 flex items-center gap-3 bg-white shadow-3xs">
                  <div className="w-10 h-10 rounded-lg bg-bananur-sand/40 flex items-center justify-center font-bold text-xs">
                    🍌
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[11px] font-bold truncate">Soporte Geométrico PLA Terracota</p>
                    <p className="text-[9px] text-bananur-clay-light font-mono">$18.900 CLP • Taller Viña</p>
                  </div>
                  <span 
                    className="w-2.5 h-2.5 rounded-full" 
                    style={{ backgroundColor: customization.accentColor }} 
                  />
                </div>
              </div>
            </div>

            <div className="p-3 bg-[#FAF8F5] rounded-2xl border border-bananur-sand/60 text-[11px] text-bananur-clay-light flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>Los cambios se reflejan automáticamente en vivo en toda la plataforma.</span>
            </div>
          </div>
        </div>

      </div>

    </div>
  );
}
