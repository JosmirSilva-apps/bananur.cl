import { useState } from 'react';
import { Sparkles, Calendar, DollarSign, Send, ArrowRight, ArrowLeft } from 'lucide-react';
import { MOCK_SERVICES } from '../data';

interface QuoteStepperProps {
  initialServiceId?: string;
  onSuccess: (summary: any) => void;
  onBackToServices: () => void;
}

export default function QuoteStepper({
  initialServiceId = '',
  onSuccess,
  onBackToServices
}: QuoteStepperProps) {
  const [step, setStep] = useState(1);
  const [selectedService, setSelectedService] = useState(initialServiceId || MOCK_SERVICES[0].id);
  const [budget, setBudget] = useState(850000);
  const [timeline, setTimeline] = useState('1 mes');
  
  // Contacts state
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [details, setDetails] = useState('');
  
  // Error state
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validateStep3 = () => {
    const errs: Record<string, string> = {};
    if (!name.trim()) errs.name = 'El nombre es obligatorio.';
    if (!email.trim()) {
      errs.email = 'El correo electrónico es obligatorio.';
    } else if (!email.includes('@')) {
      errs.email = 'El correo no tiene un formato válido.';
    }
    if (!phone.trim()) {
      errs.phone = 'Por favor, ingresa un número telefónico de contacto.';
    }
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleNext = () => {
    if (step === 1) {
      setStep(2);
    } else if (step === 2) {
      setStep(3);
    } else if (step === 3) {
      if (validateStep3()) {
        const chosen = MOCK_SERVICES.find(s => s.id === selectedService);
        onSuccess({
          serviceName: chosen ? chosen.name : 'Varios / No definido',
          budget,
          timeline,
          name,
          email,
          phone,
          details
        });
      }
    }
  };

  const handlePrev = () => {
    if (step > 1) {
      setStep(step - 1);
    } else {
      onBackToServices();
    }
  };

  const totalSteps = 3;
  const progressPercent = (step / totalSteps) * 100;

  return (
    <div className="max-w-3xl mx-auto bg-white rounded-3xl p-6 sm:p-10 shadow-sm border border-bananur-clay/5">
      
      {/* Step Progress indicators */}
      <div className="mb-10">
        <div className="flex justify-between items-center mb-4">
          <span className="text-xs font-mono uppercase tracking-widest text-bananur-clay-light">
            Formulario de Cotización
          </span>
          <span className="text-xs font-mono font-bold text-bananur-gold">
            Paso {step} de {totalSteps}
          </span>
        </div>
        <div className="w-full h-1.5 bg-bananur-sand rounded-full overflow-hidden">
          <div 
            className="h-full bg-bananur-gold transition-all duration-300"
            style={{ width: `${progressPercent}%` }}
          />
        </div>
      </div>

      {/* STEP 1: SELECT REQUIREMENT */}
      {step === 1 && (
        <div className="space-y-6 animate-fade-in">
          <div className="space-y-2">
            <h2 className="text-2xl font-serif text-bananur-clay font-bold">¿Qué tipo de proyecto sueñas crear?</h2>
            <p className="text-sm text-bananur-clay-light font-light">
              Selecciona el servicio principal que requiere tu marca para comenzar el análisis técnico.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {MOCK_SERVICES.map((s) => {
              const checked = selectedService === s.id;
              return (
                <div
                  key={s.id}
                  onClick={() => setSelectedService(s.id)}
                  className={`p-5 rounded-2xl border transition-all cursor-pointer flex flex-col justify-between ${
                    checked 
                      ? 'border-bananur-gold bg-bananur-yellow/20 ring-1 ring-bananur-gold' 
                      : 'border-bananur-clay/10 hover:border-bananur-gold bg-bananur-cream/30'
                  }`}
                >
                  <div>
                    <div className="flex justify-between items-center mb-3">
                      <span className="text-xs font-mono font-semibold uppercase text-bananur-gold-dark bg-bananur-sand px-2 py-0.5 rounded">
                        {s.category}
                      </span>
                      <input
                        type="radio"
                        checked={checked}
                        onChange={() => setSelectedService(s.id)}
                        className="accent-bananur-gold w-4 h-4 cursor-pointer"
                      />
                    </div>
                    <h3 className="font-serif text-base font-semibold text-bananur-clay leading-snug mb-2">
                      {s.name}
                    </h3>
                    <p className="text-xs text-bananur-clay-light/80 line-clamp-2 leading-relaxed font-light mb-4">
                      {s.description}
                    </p>
                  </div>
                  <span className="text-xs font-mono font-bold text-bananur-clay-light block">
                    Desde ${s.price.toLocaleString('es-CL')} CLP
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* STEP 2: BUDGETS & DELAY */}
      {step === 2 && (
        <div className="space-y-8 animate-fade-in">
          <div className="space-y-2">
            <h2 className="text-2xl font-serif text-bananur-clay font-bold">Presupuesto y Plazos</h2>
            <p className="text-sm text-bananur-clay-light font-light">
              Dinos tu rango de inversión objetivo y la velocidad con la que requieres tu entrega para acotar la escala.
            </p>
          </div>

          {/* Budget Range Slider */}
          <div className="space-y-4">
            <div className="flex justify-between items-baseline">
              <label className="text-sm font-medium text-bananur-clay flex items-center gap-1.5">
                <DollarSign className="w-4 h-4 text-bananur-gold" />
                Inversión Estimada:
              </label>
              <span className="font-mono text-xl font-bold text-bananur-gold-dark bg-bananur-sand/40 px-3 py-1 rounded-lg">
                ${budget.toLocaleString('es-CL')} CLP
              </span>
            </div>
            
            <input
              type="range"
              min="150000"
              max="5000000"
              step="50000"
              value={budget}
              onChange={(e) => setBudget(Number(e.target.value))}
              className="w-full h-2 bg-bananur-sand rounded-lg appearance-none cursor-pointer accent-bananur-gold"
            />
            
            <div className="flex justify-between text-[11px] text-bananur-clay-light font-mono">
              <span>$150.000 CLP</span>
              <span>$2.500.000 CLP</span>
              <span>$5.000.000+ CLP</span>
            </div>
          </div>

          {/* Timeline choices */}
          <div className="space-y-4">
            <label className="text-sm font-medium text-bananur-clay flex items-center gap-1.5">
              <Calendar className="w-4 h-4 text-bananur-gold" />
              Plazo deseado de entrega:
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {[
                { val: '2 semanas', label: 'Express (15 días)', desc: 'Prioridad de faena' },
                { val: '1 mes', label: 'Estándar (30 días)', desc: 'Calendario regular' },
                { val: '2 meses+', label: 'Flexible (60+ días)', desc: 'Etapas extendidas' }
              ].map((t) => {
                const active = timeline === t.val;
                return (
                  <button
                    id={`timeline-choice-${t.val}`}
                    key={t.val}
                    type="button"
                    onClick={() => setTimeline(t.val)}
                    className={`p-4 rounded-xl border text-left cursor-pointer transition-all ${
                      active 
                        ? 'border-bananur-gold bg-bananur-yellow/10' 
                        : 'border-bananur-clay/10 hover:border-bananur-gold'
                    }`}
                  >
                    <span className="block font-serif text-sm font-bold text-bananur-clay">{t.label}</span>
                    <span className="block text-[10px] text-bananur-clay-light font-light mt-0.5">{t.desc}</span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* STEP 3: CONTACT DATA WITH INLINE VALIDATIONS */}
      {step === 3 && (
        <div className="space-y-6 animate-fade-in">
          <div className="space-y-2">
            <h2 className="text-2xl font-serif text-bananur-clay font-bold">Datos de Contacto</h2>
            <p className="text-sm text-bananur-clay-light font-light">
              Ingresa tus credenciales para asignarte un diseñador del equipo Bananur y enviarte la confirmación.
            </p>
          </div>

          <div className="space-y-4">
            {/* Input Name */}
            <div>
              <label className="block text-xs font-medium uppercase tracking-wider text-bananur-clay-light mb-1.5">
                Nombre Completo *
              </label>
              <input
                id="quote-input-name"
                type="text"
                placeholder="Ej. Constanza Silva"
                value={name}
                onChange={(e) => {
                  setName(e.target.value);
                  if (e.target.value.trim()) {
                    setErrors(prev => ({ ...prev, name: '' }));
                  }
                }}
                className={`w-full p-3 bg-bananur-cream/40 border rounded-xl text-sm focus:outline-none focus:border-bananur-gold ${
                  errors.name ? 'border-bananur-coral animate-shake' : 'border-bananur-clay/15'
                }`}
              />
              {errors.name && <span className="text-xs text-bananur-coral block mt-1 font-light">{errors.name}</span>}
            </div>

            {/* Email and Phone Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium uppercase tracking-wider text-bananur-clay-light mb-1.5">
                  Correo Electrónico *
                </label>
                <input
                  id="quote-input-email"
                  type="email"
                  placeholder="ejemplo@correo.cl"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    if (e.target.value.trim() && e.target.value.includes('@')) {
                      setErrors(prev => ({ ...prev, email: '' }));
                    }
                  }}
                  className={`w-full p-3 bg-bananur-cream/40 border rounded-xl text-sm focus:outline-none focus:border-bananur-gold ${
                    errors.email ? 'border-bananur-coral animate-shake' : 'border-bananur-clay/15'
                  }`}
                />
                {errors.email && <span className="text-xs text-bananur-coral block mt-1 font-light">{errors.email}</span>}
              </div>

              <div>
                <label className="block text-xs font-medium uppercase tracking-wider text-bananur-clay-light mb-1.5">
                  Número Telefónico de Contacto *
                </label>
                <input
                  id="quote-input-phone"
                  type="text"
                  placeholder="Ej. +56 9 1234 5678"
                  value={phone}
                  onChange={(e) => {
                    setPhone(e.target.value);
                    if (e.target.value.trim()) {
                      setErrors(prev => ({ ...prev, phone: '' }));
                    }
                  }}
                  className={`w-full p-3 bg-bananur-cream/40 border rounded-xl text-sm focus:outline-none focus:border-bananur-gold ${
                    errors.phone ? 'border-bananur-coral animate-shake' : 'border-bananur-clay/15'
                  }`}
                />
                {errors.phone && <span className="text-xs text-bananur-coral block mt-1 font-light">{errors.phone}</span>}
              </div>
            </div>

            {/* Detail input */}
            <div>
              <label className="block text-xs font-medium uppercase tracking-wider text-bananur-clay-light mb-1.5">
                Cuéntanos brevemente sobre tu marca u objetivos (Opcional)
              </label>
              <textarea
                id="quote-input-details"
                rows={4}
                placeholder="¿Qué valores busca transmitir la marca? ¿Tienes referencias estéticas que te inspiren?"
                value={details}
                onChange={(e) => setDetails(e.target.value)}
                className="w-full p-3 bg-bananur-cream/40 border border-bananur-clay/15 rounded-xl text-sm focus:outline-none focus:border-bananur-gold"
              />
            </div>
          </div>
        </div>
      )}

      {/* FOOTER BUTTON BAR */}
      <div className="mt-10 pt-6 border-t border-bananur-clay/5 flex justify-between items-center">
        <button
          id="quote-btn-back"
          type="button"
          onClick={handlePrev}
          className="flex items-center gap-1.5 text-xs font-bold text-bananur-clay hover:text-bananur-gold duration-150 transition-colors cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          Atrás
        </button>

        <button
          id="quote-btn-next"
          type="button"
          onClick={handleNext}
          className="flex items-center gap-2 bg-bananur-clay text-bananur-cream px-6 py-3 rounded-full text-xs font-semibold hover:bg-bananur-gold hover:text-bananur-clay transition-all shadow-sm cursor-pointer"
        >
          {step === 3 ? (
            <>
              Confirmar y Enviar Solicitud
              <Send className="w-4 h-4" />
            </>
          ) : (
            <>
              Siguiente Paso
              <ArrowRight className="w-4 h-4" />
            </>
          )}
        </button>
      </div>

    </div>
  );
}
