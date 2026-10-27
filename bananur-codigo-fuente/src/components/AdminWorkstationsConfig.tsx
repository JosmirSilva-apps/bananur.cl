import React, { useState } from 'react';
import { 
  Wrench, 
  Plus, 
  Edit3, 
  Trash2, 
  CheckCircle2, 
  XCircle, 
  Wifi, 
  Settings, 
  Scissors, 
  PenTool, 
  HelpCircle,
  ExternalLink,
  Power
} from 'lucide-react';
import { Workstation, WorkstationType } from '../types';

interface AdminWorkstationsConfigProps {
  workstations: Workstation[];
  onUpdateWorkstations: (stations: Workstation[]) => void;
  onShowToast?: (title: string, message: string, type?: 'success' | 'error' | 'info') => void;
  onNavigateToProduction?: () => void;
}

export default function AdminWorkstationsConfig({
  workstations,
  onUpdateWorkstations,
  onShowToast,
  onNavigateToProduction
}: AdminWorkstationsConfigProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'inactive'>('all');

  // Modal create/edit states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingStation, setEditingStation] = useState<Workstation | null>(null);

  // Form states
  const [formCode, setFormCode] = useState('');
  const [formName, setFormName] = useState('');
  const [formType, setFormType] = useState<WorkstationType>('impresion3d');
  const [formResponsible, setFormResponsible] = useState('Yo • Operador Único');
  const [formDescription, setFormDescription] = useState('');
  const [formIsActive, setFormIsActive] = useState(true);

  // Type-specific form fields
  const [octoUrl, setOctoUrl] = useState('http://octopi.local:5000');
  const [octoApiKey, setOctoApiKey] = useState('');
  const [octoPrinterModel, setOctoPrinterModel] = useState('Creality Ender 3 S1 Pro Direct Drive');
  const [octoBaudRate, setOctoBaudRate] = useState('115200');

  const [sewingMachineModel, setSewingMachineModel] = useState('Juki DDL-8700 Industrial Recta');
  const [sewingDefaultNeedle, setSewingDefaultNeedle] = useState('Universal 90/14 (Lona y Algodón)');
  const [sewingDefaultTension, setSewingDefaultTension] = useState(4.5);
  const [sewingPresserFoot, setSewingPresserFoot] = useState('Prensatelas Estándar de Acero');
  const [sewingStitchLength, setSewingStitchLength] = useState('3.0 mm (Pespunte de Carga)');

  const [crochetDefaultHook, setCrochetDefaultHook] = useState('3.5 mm');
  const [crochetYarnWeight, setCrochetYarnWeight] = useState('Algodón 4 Hebras (Chilote)');

  const [designSoftware, setDesignSoftware] = useState('VectorCAD & Inkscape Studio');
  const [designScale, setDesignScale] = useState('Escala 1:1 (mm)');
  const [designFileFormat, setDesignFileFormat] = useState('SVG / DXF / Sketch');

  const [customTechnique, setCustomTechnique] = useState('Encuadernación & Serigrafía');
  const [customNotes, setCustomNotes] = useState('Mesa de secado textil y prensa térmica de 38x38 cm.');

  const openCreateModal = () => {
    setEditingStation(null);
    setFormCode(`WS-${Date.now().toString().slice(-4)}`);
    setFormName('');
    setFormType('impresion3d');
    setFormResponsible('Yo • Operador Único');
    setFormDescription('');
    setFormIsActive(true);
    setOctoUrl('http://octopi.local:5000');
    setOctoApiKey('');
    setOctoPrinterModel('Creality Ender 3 S1 Pro Direct Drive');
    setOctoBaudRate('115200');
    setSewingMachineModel('Juki DDL-8700 Industrial Recta');
    setSewingDefaultNeedle('Universal 90/14 (Lona y Algodón)');
    setSewingDefaultTension(4.5);
    setSewingPresserFoot('Prensatelas Estándar de Acero');
    setSewingStitchLength('3.0 mm (Pespunte de Carga)');
    setCrochetDefaultHook('3.5 mm');
    setCrochetYarnWeight('Algodón 4 Hebras (Chilote)');
    setDesignSoftware('VectorCAD & Inkscape Studio');
    setDesignScale('Escala 1:1 (mm)');
    setDesignFileFormat('SVG / DXF / Sketch');
    setCustomTechnique('Técnica Artesanal de Autor');
    setCustomNotes('');
    setIsModalOpen(true);
  };

  const openEditModal = (station: Workstation) => {
    setEditingStation(station);
    setFormCode(station.code);
    setFormName(station.name);
    setFormType(station.type);
    setFormResponsible(station.responsible);
    setFormDescription(station.description);
    setFormIsActive(station.isActive);

    if (station.octoConfig) {
      setOctoUrl(station.octoConfig.url);
      setOctoApiKey(station.octoConfig.apiKey);
      setOctoPrinterModel(station.octoConfig.printerModel || 'Creality Ender 3 S1 Pro Direct Drive');
      setOctoBaudRate(station.octoConfig.baudRate || '115200');
    }
    if (station.sewingConfig) {
      setSewingMachineModel(station.sewingConfig.machineModel);
      setSewingDefaultNeedle(station.sewingConfig.defaultNeedle);
      setSewingDefaultTension(station.sewingConfig.defaultTension);
      setSewingPresserFoot(station.sewingConfig.presserFoot);
      setSewingStitchLength(station.sewingConfig.stitchLength || '3.0 mm');
    }
    if (station.crochetConfig) {
      setCrochetDefaultHook(station.crochetConfig.defaultHook);
      setCrochetYarnWeight(station.crochetConfig.preferredYarnWeight || 'Algodón 4 Hebras');
    }
    if (station.designConfig) {
      setDesignSoftware(station.designConfig.softwareEnvironment || 'VectorCAD Studio');
      setDesignScale(station.designConfig.defaultCanvasScale || 'Escala 1:1 (mm)');
      setDesignFileFormat(station.designConfig.defaultFileFormat || 'SVG / DXF / Sketch');
    }
    if (station.customConfig) {
      setCustomTechnique(station.customConfig.craftTechnique);
      setCustomNotes(station.customConfig.customNotes || '');
    }
    setIsModalOpen(true);
  };

  const handleSaveStation = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formName.trim() || !formCode.trim()) {
      onShowToast?.('Datos Incompletos', 'Ingresa al menos el nombre y código de la estación.', 'error');
      return;
    }

    const typeIcons: Record<WorkstationType, string> = {
      impresion3d: '🖨️',
      diseno: '✏️',
      costura: '🧵',
      crochet: '🧶',
      personalizada: '🛠️'
    };

    const typeBadges: Record<WorkstationType, string> = {
      impresion3d: 'OctoPrint & Marlin',
      diseno: 'Mesa Vectorial 1:1',
      costura: 'Lona & Algodón',
      crochet: 'Labor Manual',
      personalizada: customTechnique || 'Taller Artesanal'
    };

    const updatedStation: Workstation = {
      id: editingStation ? editingStation.id : `ws-${Date.now()}`,
      code: formCode.trim().toUpperCase(),
      name: formName.trim(),
      type: formType,
      responsible: formResponsible.trim(),
      description: formDescription.trim(),
      isActive: formIsActive,
      icon: typeIcons[formType],
      badge: typeBadges[formType],
      ...(formType === 'impresion3d' ? {
        octoConfig: {
          url: octoUrl.trim(),
          apiKey: octoApiKey.trim(),
          printerModel: octoPrinterModel.trim(),
          baudRate: octoBaudRate
        }
      } : {}),
      ...(formType === 'costura' ? {
        sewingConfig: {
          machineModel: sewingMachineModel.trim(),
          defaultNeedle: sewingDefaultNeedle.trim(),
          defaultTension: Number(sewingDefaultTension),
          presserFoot: sewingPresserFoot.trim(),
          stitchLength: sewingStitchLength.trim(),
          operatingHours: editingStation?.sewingConfig?.operatingHours || 0,
          lastServiceDate: editingStation?.sewingConfig?.lastServiceDate || new Date().toISOString().split('T')[0]
        }
      } : {}),
      ...(formType === 'crochet' ? {
        crochetConfig: {
          defaultHook: crochetDefaultHook.trim(),
          preferredYarnWeight: crochetYarnWeight.trim()
        }
      } : {}),
      ...(formType === 'diseno' ? {
        designConfig: {
          softwareEnvironment: designSoftware.trim(),
          defaultCanvasScale: designScale.trim(),
          defaultFileFormat: designFileFormat.trim()
        }
      } : {}),
      ...(formType === 'personalizada' ? {
        customConfig: {
          craftTechnique: customTechnique.trim(),
          customNotes: customNotes.trim()
        }
      } : {})
    };

    if (editingStation) {
      onUpdateWorkstations(workstations.map(w => w.id === editingStation.id ? updatedStation : w));
      onShowToast?.(
        'Estación Actualizada',
        `Se actualizó la configuración técnica de "${updatedStation.name}".`,
        'success'
      );
    } else {
      onUpdateWorkstations([...workstations, updatedStation]);
      onShowToast?.(
        'Estación Registrada',
        `Se añadió "${updatedStation.name}" al taller. ${updatedStation.isActive ? 'Ya está activa en el módulo de Producción.' : 'Está guardada como inactiva.'}`,
        'success'
      );
    }

    setIsModalOpen(false);
  };

  const handleToggleActive = (stationId: string) => {
    const target = workstations.find(w => w.id === stationId);
    if (!target) return;
    const newStatus = !target.isActive;

    onUpdateWorkstations(workstations.map(w => w.id === stationId ? { ...w, isActive: newStatus } : w));
    onShowToast?.(
      newStatus ? 'Estación Activada en Producción' : 'Estación Desactivada',
      `"${target.name}" ahora ${newStatus ? 'aparece activa en el módulo de Producción (PLM).' : 'ha sido oculta del módulo de Producción.'}`,
      newStatus ? 'success' : 'info'
    );
  };

  const handleDeleteStation = (stationId: string, stationName: string) => {
    if (workstations.length <= 1) {
      onShowToast?.('Acción Bloqueada', 'Debes mantener al menos una estación configurada en el taller.', 'error');
      return;
    }
    if (confirm(`¿Estás seguro de que deseas eliminar permanentemente la estación "${stationName}"?`)) {
      onUpdateWorkstations(workstations.filter(w => w.id !== stationId));
      onShowToast?.('Estación Eliminada', `Se retiró "${stationName}" del registro de taller.`, 'info');
    }
  };

  // Filter logic
  const filteredStations = workstations.filter(w => {
    const matchesSearch = w.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          w.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          w.responsible.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          w.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesType = typeFilter === 'all' || w.type === typeFilter;
    const matchesStatus = statusFilter === 'all' || 
                          (statusFilter === 'active' && w.isActive) ||
                          (statusFilter === 'inactive' && !w.isActive);
    return matchesSearch && matchesType && matchesStatus;
  });

  const activeCount = workstations.filter(w => w.isActive).length;
  const inactiveCount = workstations.length - activeCount;

  return (
    <div className="space-y-6 animate-fade-in text-bananur-clay">
      
      {/* Top Header Card */}
      <div className="bg-white p-6 sm:p-8 rounded-3xl border border-bananur-sand/80 shadow-xs space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-bananur-sand/60 pb-5">
          <div className="space-y-1">
            <span className="text-xs font-mono uppercase tracking-widest text-[#B58455] font-bold flex items-center gap-1.5">
              <Wrench className="w-3.5 h-3.5" />
              Gestión Maestra de Recursos de Manufactura
            </span>
            <h2 className="text-2xl sm:text-3xl font-serif font-extrabold text-bananur-clay">
              Estaciones de Trabajo & Maquinaria (Taller PLM)
            </h2>
            <p className="text-xs text-bananur-clay-light max-w-2xl">
              Configura, edita y activa de forma centralizada todas las estaciones del taller (Impresión 3D con integración OctoPrint Daemon, Costura Fina, Crochet, Diseño y técnicas personalizadas). Cada cambio o activación se refleja en tiempo real en el módulo de Producción.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5 self-start md:self-auto shrink-0">
            {onNavigateToProduction && (
              <button
                type="button"
                onClick={onNavigateToProduction}
                className="px-3.5 py-2.5 bg-[#FAF8F5] hover:bg-bananur-sand/50 text-[#B58455] border border-bananur-sand rounded-xl font-mono text-xs font-bold uppercase transition-all flex items-center gap-1.5 cursor-pointer shadow-3xs"
                title="Volver al módulo de Producción para ver las estaciones en vivo"
              >
                <ExternalLink className="w-3.5 h-3.5" />
                <span>Ver en Producción</span>
              </button>
            )}
            <button
              type="button"
              onClick={openCreateModal}
              className="px-4 py-2.5 bg-bananur-clay hover:bg-[#B58455] text-white font-mono text-xs font-bold uppercase rounded-xl transition-all shadow-xs flex items-center gap-2 cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Registrar Nueva Estación</span>
            </button>
          </div>
        </div>

        {/* Quick Metrics */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-1">
          <div className="bg-[#FAF8F5] p-3.5 rounded-2xl border border-bananur-sand/60">
            <span className="text-[10px] font-mono uppercase text-bananur-clay-light block">Total Estaciones</span>
            <span className="text-2xl font-serif font-bold text-bananur-clay mt-0.5 block">{workstations.length}</span>
            <span className="text-[10px] text-bananur-clay-light/80 block mt-0.5">En inventario de taller</span>
          </div>

          <div className="bg-emerald-50/70 p-3.5 rounded-2xl border border-emerald-200">
            <span className="text-[10px] font-mono uppercase text-emerald-800 font-bold block flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              Activas en Producción
            </span>
            <span className="text-2xl font-serif font-bold text-emerald-900 mt-0.5 block">{activeCount}</span>
            <span className="text-[10px] text-emerald-700 block mt-0.5">Desplegadas en PLM</span>
          </div>

          <div className="bg-amber-50/70 p-3.5 rounded-2xl border border-amber-200">
            <span className="text-[10px] font-mono uppercase text-amber-800 font-bold block">Inactivas / Standby</span>
            <span className="text-2xl font-serif font-bold text-amber-900 mt-0.5 block">{inactiveCount}</span>
            <span className="text-[10px] text-amber-700 block mt-0.5">Ocultas de Producción</span>
          </div>

          <div className="bg-sky-50/70 p-3.5 rounded-2xl border border-sky-200">
            <span className="text-[10px] font-mono uppercase text-sky-800 font-bold block">OctoPrint Integrado</span>
            <span className="text-2xl font-serif font-bold text-sky-900 mt-0.5 block">
              {workstations.filter(w => w.type === 'impresion3d').length}
            </span>
            <span className="text-[10px] text-sky-700 block mt-0.5">Servidor FDM Marlin</span>
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-bananur-sand/80 shadow-3xs flex flex-col md:flex-row items-center justify-between gap-3 text-xs">
        <div className="w-full md:w-80">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Buscar por nombre, código, responsable o equipo..."
            className="w-full p-2 bg-[#FAF8F5] border border-bananur-sand/80 rounded-xl text-xs text-bananur-clay focus:outline-none focus:border-[#B58455]"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2 w-full md:w-auto justify-end">
          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="p-2 bg-[#FAF8F5] border border-bananur-sand/80 rounded-xl font-mono text-xs text-bananur-clay cursor-pointer"
          >
            <option value="all">Todas las Técnicas</option>
            <option value="impresion3d">🖨️ Impresión 3D con OctoPrint</option>
            <option value="diseno">✏️ Diseño & Moldería</option>
            <option value="costura">🧵 Costura Fina</option>
            <option value="crochet">🧶 Crochet & Tejidos</option>
            <option value="personalizada">🛠️ Técnicas Personalizadas</option>
          </select>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as any)}
            className="p-2 bg-[#FAF8F5] border border-bananur-sand/80 rounded-xl font-mono text-xs text-bananur-clay cursor-pointer"
          >
            <option value="all">Todos los Estados</option>
            <option value="active">Solo Activas (en Producción)</option>
            <option value="inactive">Solo Inactivas (Ocultas)</option>
          </select>
        </div>
      </div>

      {/* Workstations Grid / Cards Listing */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredStations.length === 0 ? (
          <div className="col-span-2 text-center py-12 bg-white rounded-3xl border border-dashed border-bananur-sand text-bananur-clay-light text-xs space-y-2">
            <span className="text-3xl block">🔍</span>
            <p className="font-bold">No se encontraron estaciones con los filtros seleccionados.</p>
            <button
              type="button"
              onClick={() => { setSearchQuery(''); setTypeFilter('all'); setStatusFilter('all'); }}
              className="text-[#B58455] underline font-mono text-xs cursor-pointer"
            >
              Restablecer filtros
            </button>
          </div>
        ) : (
          filteredStations.map((station) => (
            <div 
              key={station.id}
              className={`p-5 rounded-2xl border transition-all flex flex-col justify-between space-y-4 ${
                station.isActive 
                  ? 'bg-white border-bananur-sand/80 shadow-xs hover:border-[#B58455]/60' 
                  : 'bg-zinc-50/80 border-zinc-200 opacity-75'
              }`}
            >
              <div className="space-y-3">
                {/* Header row */}
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-2.5">
                    <span className="text-2xl p-2 rounded-xl bg-[#FAF8F5] border border-bananur-sand/60">
                      {station.icon || '⚙️'}
                    </span>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-[10px] font-bold px-2 py-0.5 rounded bg-bananur-sand/40 text-bananur-clay">
                          {station.code}
                        </span>
                        <span className={`text-[10px] font-mono px-2 py-0.5 rounded-full font-bold flex items-center gap-1 ${
                          station.isActive 
                            ? 'bg-emerald-100 text-emerald-800 border border-emerald-300' 
                            : 'bg-zinc-200 text-zinc-700'
                        }`}>
                          <span className={`w-1.5 h-1.5 rounded-full ${station.isActive ? 'bg-emerald-600 animate-pulse' : 'bg-zinc-500'}`}></span>
                          {station.isActive ? 'Activa en Producción' : 'Inactiva / Oculta'}
                        </span>
                      </div>
                      <h4 className="font-serif text-base font-bold text-bananur-clay mt-1">
                        {station.name}
                      </h4>
                    </div>
                  </div>

                  {/* Quick toggle switch */}
                  <button
                    type="button"
                    onClick={() => handleToggleActive(station.id)}
                    className={`p-2 rounded-xl border transition-colors cursor-pointer flex items-center gap-1 font-mono text-[10px] font-bold ${
                      station.isActive 
                        ? 'bg-emerald-50 text-emerald-800 border-emerald-300 hover:bg-emerald-100' 
                        : 'bg-zinc-100 text-zinc-600 border-zinc-300 hover:bg-zinc-200'
                    }`}
                    title={station.isActive ? 'Desactivar en Producción' : 'Activar en Producción'}
                  >
                    <Power className="w-3.5 h-3.5" />
                    <span>{station.isActive ? 'ON' : 'OFF'}</span>
                  </button>
                </div>

                {/* Description */}
                <p className="text-xs text-bananur-clay-light leading-relaxed">
                  {station.description}
                </p>

                {/* Technical Configuration Summary */}
                <div className="bg-[#FAF8F5] p-3 rounded-xl border border-bananur-sand/60 space-y-1.5 text-[11px] font-mono">
                  <div className="flex justify-between text-bananur-clay">
                    <span className="text-bananur-clay-light">Responsable:</span>
                    <strong className="text-bananur-clay">{station.responsible}</strong>
                  </div>

                  {station.type === 'impresion3d' && station.octoConfig && (
                    <>
                      <div className="flex justify-between text-bananur-clay">
                        <span className="text-bananur-clay-light">OctoPrint Daemon:</span>
                        <span className="font-bold text-emerald-700 flex items-center gap-1">
                          <Wifi className="w-3 h-3" />
                          {station.octoConfig.url}
                        </span>
                      </div>
                      <div className="flex justify-between text-bananur-clay">
                        <span className="text-bananur-clay-light">Impresora FDM:</span>
                        <span className="truncate max-w-[200px]">{station.octoConfig.printerModel}</span>
                      </div>
                    </>
                  )}

                  {station.type === 'costura' && station.sewingConfig && (
                    <>
                      <div className="flex justify-between text-bananur-clay">
                        <span className="text-bananur-clay-light">Máquina:</span>
                        <strong className="truncate max-w-[200px]">{station.sewingConfig.machineModel}</strong>
                      </div>
                      <div className="flex justify-between text-bananur-clay">
                        <span className="text-bananur-clay-light">Aguja & Prensatelas:</span>
                        <span className="text-[#B58455] font-bold">{station.sewingConfig.defaultNeedle}</span>
                      </div>
                    </>
                  )}

                  {station.type === 'crochet' && station.crochetConfig && (
                    <>
                      <div className="flex justify-between text-bananur-clay">
                        <span className="text-bananur-clay-light">Ganchillo Calibrado:</span>
                        <strong className="text-[#B58455]">{station.crochetConfig.defaultHook}</strong>
                      </div>
                      <div className="flex justify-between text-bananur-clay">
                        <span className="text-bananur-clay-light">Hilado Maestro:</span>
                        <span>{station.crochetConfig.preferredYarnWeight}</span>
                      </div>
                    </>
                  )}

                  {station.type === 'diseno' && station.designConfig && (
                    <>
                      <div className="flex justify-between text-bananur-clay">
                        <span className="text-bananur-clay-light">Entorno CAD:</span>
                        <strong>{station.designConfig.softwareEnvironment}</strong>
                      </div>
                      <div className="flex justify-between text-bananur-clay">
                        <span className="text-bananur-clay-light">Escala de Trabajo:</span>
                        <span>{station.designConfig.defaultCanvasScale} ({station.designConfig.defaultFileFormat})</span>
                      </div>
                    </>
                  )}

                  {station.type === 'personalizada' && station.customConfig && (
                    <div className="flex justify-between text-bananur-clay">
                      <span className="text-bananur-clay-light">Técnica:</span>
                      <strong>{station.customConfig.craftTechnique}</strong>
                    </div>
                  )}
                </div>
              </div>

              {/* Actions row */}
              <div className="flex items-center justify-between pt-3 border-t border-bananur-sand/40">
                <span className="text-[10px] font-mono text-bananur-clay-light">
                  {station.isActive ? '✓ Visible en módulo Producción' : '✕ Oculta del módulo Producción'}
                </span>

                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={() => openEditModal(station)}
                    className="px-2.5 py-1 bg-white hover:bg-bananur-cream/80 text-bananur-clay border border-bananur-sand rounded-lg text-xs font-mono font-bold flex items-center gap-1 transition-colors cursor-pointer"
                  >
                    <Edit3 className="w-3.5 h-3.5 text-[#B58455]" />
                    <span>Editar</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleDeleteStation(station.id, station.name)}
                    className="p-1.5 hover:bg-red-50 text-red-600 rounded-lg transition-colors cursor-pointer"
                    title="Eliminar Estación"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Create / Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl border border-bananur-sand shadow-2xl max-w-2xl w-full p-6 sm:p-8 space-y-6 my-8 animate-scale-up max-h-[90vh] overflow-y-auto">
            
            <div className="flex items-center justify-between border-b border-bananur-sand/60 pb-3">
              <div className="flex items-center gap-2">
                <span className="text-xl">⚙️</span>
                <h3 className="font-serif text-lg font-bold text-bananur-clay">
                  {editingStation ? 'Editar Estación de Trabajo' : 'Registrar Nueva Estación de Trabajo'}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="p-1.5 hover:bg-bananur-sand/30 rounded-full text-bananur-clay cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveStation} className="space-y-5 text-xs">
              
              {/* Basic Info */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-mono uppercase text-bananur-clay-light font-bold mb-1">
                    Código de Estación *
                  </label>
                  <input
                    type="text"
                    required
                    value={formCode}
                    onChange={(e) => setFormCode(e.target.value)}
                    placeholder="Ej. WS-3D-02, WS-SEW-02"
                    className="w-full p-2.5 bg-[#FAF8F5] border border-bananur-sand rounded-xl font-mono text-xs font-bold text-bananur-clay"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-mono uppercase text-bananur-clay-light font-bold mb-1">
                    Tipo de Estación / Técnica *
                  </label>
                  <select
                    value={formType}
                    onChange={(e) => setFormType(e.target.value as WorkstationType)}
                    className="w-full p-2.5 bg-[#FAF8F5] border border-bananur-sand rounded-xl text-xs font-bold text-bananur-clay cursor-pointer"
                  >
                    <option value="impresion3d">🖨️ Impresión 3D (con OctoPrint Daemon)</option>
                    <option value="diseno">✏️ Diseño Creativo & Moldería Digital</option>
                    <option value="costura">🧵 Costura Fina & Moldería</option>
                    <option value="crochet">🧶 Crochet & Tejidos Manuales</option>
                    <option value="personalizada">🛠️ Técnica Personalizada / Taller</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-mono uppercase text-bananur-clay-light font-bold mb-1">
                  Nombre Público de la Estación *
                </label>
                <input
                  type="text"
                  required
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                  placeholder="Ej. Estación Impresión 3D con OctoPrint"
                  className="w-full p-2.5 bg-[#FAF8F5] border border-bananur-sand rounded-xl text-xs font-bold text-bananur-clay"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-mono uppercase text-bananur-clay-light font-bold mb-1">
                    Operador Responsable
                  </label>
                  <input
                    type="text"
                    value={formResponsible}
                    onChange={(e) => setFormResponsible(e.target.value)}
                    placeholder="Yo • Operador Único"
                    className="w-full p-2.5 bg-[#FAF8F5] border border-bananur-sand rounded-xl text-xs text-bananur-clay"
                  />
                </div>

                <div className="flex items-center gap-3 pt-6">
                  <label className="flex items-center gap-2 cursor-pointer font-bold text-xs">
                    <input
                      type="checkbox"
                      checked={formIsActive}
                      onChange={(e) => setFormIsActive(e.target.checked)}
                      className="w-4 h-4 rounded text-emerald-600 accent-emerald-600 cursor-pointer"
                    />
                    <span>Activa inmediatamente en Producción (PLM)</span>
                  </label>
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-mono uppercase text-bananur-clay-light font-bold mb-1">
                  Descripción Técnica y Alcance Operativo
                </label>
                <textarea
                  rows={2}
                  value={formDescription}
                  onChange={(e) => setFormDescription(e.target.value)}
                  placeholder="Describe las tareas, materiales y tolerancias que se procesan en esta estación..."
                  className="w-full p-2.5 bg-[#FAF8F5] border border-bananur-sand rounded-xl text-xs text-bananur-clay"
                />
              </div>

              {/* DYNAMIC TECHNICAL SETTINGS */}
              <div className="border-t border-bananur-sand/60 pt-4 space-y-4">
                <h4 className="font-mono text-xs font-bold text-[#B58455] uppercase flex items-center gap-1.5">
                  <Settings className="w-3.5 h-3.5" />
                  Parámetros Técnicos Específicos ({formType.toUpperCase()})
                </h4>

                {/* 1. IMPRESIÓN 3D & OCTOPRINT */}
                {formType === 'impresion3d' && (
                  <div className="bg-sky-50/60 p-4 rounded-2xl border border-sky-200 space-y-3">
                    <div className="flex items-center gap-2 text-sky-950 font-bold font-mono text-xs">
                      <Wifi className="w-4 h-4 text-sky-600" />
                      <span>Conexión OctoPrint Daemon / Marlin G-Code</span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-[10px] font-mono uppercase text-sky-900 font-bold mb-1">
                          URL del Servidor OctoPrint *
                        </label>
                        <input
                          type="text"
                          required
                          value={octoUrl}
                          onChange={(e) => setOctoUrl(e.target.value)}
                          placeholder="http://octopi.local:5000"
                          className="w-full p-2 bg-white border border-sky-300 rounded-lg text-xs font-mono text-bananur-clay"
                        />
                      </div>

                      <div>
                        <label className="block text-[10px] font-mono uppercase text-sky-900 font-bold mb-1">
                          API Key de OctoPrint (X-Api-Key)
                        </label>
                        <input
                          type="password"
                          value={octoApiKey}
                          onChange={(e) => setOctoApiKey(e.target.value)}
                          placeholder="OCTO-BANANUR-KEY..."
                          className="w-full p-2 bg-white border border-sky-300 rounded-lg text-xs font-mono text-bananur-clay"
                        />
                      </div>

                      <div>
                        <label className="block text-[10px] font-mono uppercase text-sky-900 font-bold mb-1">
                          Modelo de Impresora 3D
                        </label>
                        <input
                          type="text"
                          value={octoPrinterModel}
                          onChange={(e) => setOctoPrinterModel(e.target.value)}
                          placeholder="Creality Ender 3 S1 Pro Direct Drive"
                          className="w-full p-2 bg-white border border-sky-300 rounded-lg text-xs text-bananur-clay"
                        />
                      </div>

                      <div>
                        <label className="block text-[10px] font-mono uppercase text-sky-900 font-bold mb-1">
                          Velocidad Baud Rate
                        </label>
                        <select
                          value={octoBaudRate}
                          onChange={(e) => setOctoBaudRate(e.target.value)}
                          className="w-full p-2 bg-white border border-sky-300 rounded-lg text-xs font-mono text-bananur-clay"
                        >
                          <option value="115200">115200 (Estándar Marlin)</option>
                          <option value="250000">250000 (Alta velocidad)</option>
                        </select>
                      </div>
                    </div>
                  </div>
                )}

                {/* 2. COSTURA FINA */}
                {formType === 'costura' && (
                  <div className="bg-amber-50/60 p-4 rounded-2xl border border-amber-200 space-y-3">
                    <div className="flex items-center gap-2 text-amber-950 font-bold font-mono text-xs">
                      <Scissors className="w-4 h-4 text-[#B58455]" />
                      <span>Configuración de Máquina & Parámetros Textiles</span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-[10px] font-mono uppercase text-amber-900 font-bold mb-1">
                          Modelo de Máquina de Coser Industrial
                        </label>
                        <input
                          type="text"
                          value={sewingMachineModel}
                          onChange={(e) => setSewingMachineModel(e.target.value)}
                          placeholder="Juki DDL-8700 Industrial Recta"
                          className="w-full p-2 bg-white border border-amber-300 rounded-lg text-xs text-bananur-clay"
                        />
                      </div>

                      <div>
                        <label className="block text-[10px] font-mono uppercase text-amber-900 font-bold mb-1">
                          Tipo de Aguja Predeterminada
                        </label>
                        <input
                          type="text"
                          value={sewingDefaultNeedle}
                          onChange={(e) => setSewingDefaultNeedle(e.target.value)}
                          placeholder="Universal 90/14 (Lona y Algodón)"
                          className="w-full p-2 bg-white border border-amber-300 rounded-lg text-xs text-bananur-clay"
                        />
                      </div>

                      <div>
                        <label className="block text-[10px] font-mono uppercase text-amber-900 font-bold mb-1">
                          Prensatelas Activo
                        </label>
                        <input
                          type="text"
                          value={sewingPresserFoot}
                          onChange={(e) => setSewingPresserFoot(e.target.value)}
                          placeholder="Prensatelas Estándar de Acero"
                          className="w-full p-2 bg-white border border-amber-300 rounded-lg text-xs text-bananur-clay"
                        />
                      </div>

                      <div>
                        <label className="block text-[10px] font-mono uppercase text-amber-900 font-bold mb-1">
                          Largo de Puntada Habitual
                        </label>
                        <input
                          type="text"
                          value={sewingStitchLength}
                          onChange={(e) => setSewingStitchLength(e.target.value)}
                          placeholder="3.0 mm (Pespunte de Carga)"
                          className="w-full p-2 bg-white border border-amber-300 rounded-lg text-xs text-bananur-clay"
                        />
                      </div>
                    </div>
                  </div>
                )}

                {/* 3. CROCHET */}
                {formType === 'crochet' && (
                  <div className="bg-purple-50/60 p-4 rounded-2xl border border-purple-200 space-y-3">
                    <div className="flex items-center gap-2 text-purple-950 font-bold font-mono text-xs">
                      <span>🧶 Parámetros de Crochet y Ganchillos</span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-[10px] font-mono uppercase text-purple-900 font-bold mb-1">
                          Medida de Ganchillo Principal
                        </label>
                        <input
                          type="text"
                          value={crochetDefaultHook}
                          onChange={(e) => setCrochetDefaultHook(e.target.value)}
                          placeholder="3.5 mm"
                          className="w-full p-2 bg-white border border-purple-300 rounded-lg text-xs text-bananur-clay"
                        />
                      </div>

                      <div>
                        <label className="block text-[10px] font-mono uppercase text-purple-900 font-bold mb-1">
                          Tipo de Hilado Preferido
                        </label>
                        <input
                          type="text"
                          value={crochetYarnWeight}
                          onChange={(e) => setCrochetYarnWeight(e.target.value)}
                          placeholder="Algodón 4 Hebras (Chilote)"
                          className="w-full p-2 bg-white border border-purple-300 rounded-lg text-xs text-bananur-clay"
                        />
                      </div>
                    </div>
                  </div>
                )}

                {/* 4. DISEÑO */}
                {formType === 'diseno' && (
                  <div className="bg-emerald-50/60 p-4 rounded-2xl border border-emerald-200 space-y-3">
                    <div className="flex items-center gap-2 text-emerald-950 font-bold font-mono text-xs">
                      <PenTool className="w-4 h-4 text-emerald-600" />
                      <span>Entorno de Diseño Vectorial & Moldería</span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-[10px] font-mono uppercase text-emerald-900 font-bold mb-1">
                          Software / Entorno de Dibujo
                        </label>
                        <input
                          type="text"
                          value={designSoftware}
                          onChange={(e) => setDesignSoftware(e.target.value)}
                          placeholder="VectorCAD & Inkscape Studio"
                          className="w-full p-2 bg-white border border-emerald-300 rounded-lg text-xs text-bananur-clay"
                        />
                      </div>

                      <div>
                        <label className="block text-[10px] font-mono uppercase text-emerald-900 font-bold mb-1">
                          Formatos Técnicos Soportados
                        </label>
                        <input
                          type="text"
                          value={designFileFormat}
                          onChange={(e) => setDesignFileFormat(e.target.value)}
                          placeholder="SVG / DXF / Sketch / PDF"
                          className="w-full p-2 bg-white border border-emerald-300 rounded-lg text-xs text-bananur-clay"
                        />
                      </div>
                    </div>
                  </div>
                )}

                {/* 5. PERSONALIZADA */}
                {formType === 'personalizada' && (
                  <div className="bg-stone-50 p-4 rounded-2xl border border-stone-300 space-y-3">
                    <div>
                      <label className="block text-[10px] font-mono uppercase text-stone-700 font-bold mb-1">
                        Nombre de la Técnica Artesanal *
                      </label>
                      <input
                        type="text"
                        value={customTechnique}
                        onChange={(e) => setCustomTechnique(e.target.value)}
                        placeholder="Ej. Serigrafía Textil, Joyería en Plata, Encuadernación"
                        className="w-full p-2 bg-white border border-stone-300 rounded-lg text-xs text-bananur-clay"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-mono uppercase text-stone-700 font-bold mb-1">
                        Notas Técnicas y Maquinaria
                      </label>
                      <input
                        type="text"
                        value={customNotes}
                        onChange={(e) => setCustomNotes(e.target.value)}
                        placeholder="Prensa térmica, mallas de serigrafía, horno de curado..."
                        className="w-full p-2 bg-white border border-stone-300 rounded-lg text-xs text-bananur-clay"
                      />
                    </div>
                  </div>
                )}

              </div>

              {/* Modal Buttons */}
              <div className="flex items-center justify-end gap-2 pt-4 border-t border-bananur-sand/60">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 bg-white hover:bg-bananur-cream/80 text-bananur-clay border border-bananur-sand rounded-xl font-mono text-xs font-bold transition-colors cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-[#B58455] hover:bg-[#8A7968] text-white rounded-xl font-mono text-xs font-bold transition-colors cursor-pointer shadow-xs"
                >
                  {editingStation ? 'Guardar Cambios' : 'Registrar Estación'}
                </button>
              </div>

            </form>

          </div>
        </div>
      )}

    </div>
  );
}
