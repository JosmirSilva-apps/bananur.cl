import React, { useState } from 'react';
import { Mail, ShieldCheck, Instagram, ArrowRight } from 'lucide-react';

interface FooterProps {
  onNavigate: (view: string) => void;
}

export default function Footer({ onNavigate }: FooterProps) {
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState('');

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !email.includes('@')) {
      setError('Por favor, ingresa un correo electrónico válido.');
      return;
    }
    setError('');
    setSubmitted(true);
    setEmail('');
  };

  return (
    <footer className="bg-bananur-clay text-bananur-cream border-t border-bananur-clay-light/30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12">
          
          {/* Brand Info */}
          <div className="space-y-4">
            <span className="font-serif text-3xl font-bold tracking-tight text-white flex items-center gap-1">
              Bananur<span className="text-bananur-gold text-lg">.</span>
            </span>
            <p className="text-sm text-bananur-sand/80 leading-relaxed max-w-xs font-light">
              Modernidad orgánica para marcas boutique. Curación selecta de papelería, accesorios y soluciones web integrales diseñadas desde Viña del Mar, Chile.
            </p>
            <div className="flex space-x-4 pt-2">
              <a href="#" className="p-2 bg-white/5 hover:bg-bananur-gold hover:text-bananur-clay rounded-full transition-all duration-200">
                <Instagram className="w-4 h-4" />
              </a>
              <a href="#" className="p-2 bg-white/5 hover:bg-bananur-gold hover:text-bananur-clay rounded-full transition-all duration-200">
                <Mail className="w-4 h-4" />
              </a>
            </div>
          </div>

          {/* Links: Explorer */}
          <div>
            <h3 className="text-xs font-mono uppercase tracking-widest text-bananur-gold mb-6">Explorar</h3>
            <ul className="space-y-3.5 text-sm font-light text-bananur-sand/90">
              <li>
                <button onClick={() => onNavigate('tienda')} className="hover:text-bananur-gold hover:translate-x-1 duration-155 transition-all cursor-pointer">
                  Colección de Objetos (Tienda)
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('servicios')} className="hover:text-bananur-gold hover:translate-x-1 duration-155 transition-all cursor-pointer">
                  Servicios y Consultoría
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('portafolio')} className="hover:text-bananur-gold hover:translate-x-1 duration-155 transition-all cursor-pointer">
                  Proyectos & Portafolio
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('nosotros')} className="hover:text-bananur-gold hover:translate-x-1 duration-155 transition-all cursor-pointer">
                  Historia de la Marca
                </button>
              </li>
            </ul>
          </div>

          {/* Contact / Taller */}
          <div>
            <h3 className="text-xs font-mono uppercase tracking-widest text-bananur-gold mb-6">Ubicación y Soporte</h3>
            <ul className="space-y-3.5 text-sm font-light text-bananur-sand/90">
              <li>
                <span className="block text-white font-medium">Tienda & Taller Principal</span>
                <span className="text-xs text-bananur-sand/70">1 Norte 450, Viña del Mar, Chile (Previa cita / Retiro en Tienda)</span>
              </li>
              <li>
                <span className="block text-white font-medium">Horario de Atención</span>
                <span className="text-xs text-bananur-sand/70">Lun a Vie / 09:00 - 18:30 hrs</span>
              </li>
              <li>
                <button onClick={() => onNavigate('contacto')} className="hover:text-bananur-gold hover:translate-x-1 duration-155 transition-all text-left cursor-pointer">
                  Formulario de Contacto & FAQ
                </button>
              </li>
            </ul>
          </div>

          {/* Newsletter Column */}
          <div className="space-y-5">
            <h3 className="text-xs font-mono uppercase tracking-widest text-bananur-gold mb-1">Boletín Editorial</h3>
            <p className="text-xs font-light text-bananur-sand/70 leading-relaxed">
              Inscríbete para enterarte de nuevos lanzamientos en impresión 3D, costura fina, piezas tejidas a crochet y artículos de diseño exclusivo.
            </p>
            
            {submitted ? (
              <div className="bg-emerald-950/40 border border-emerald-500/30 p-4 rounded-xl space-y-2">
                <div className="flex items-center gap-2 text-emerald-400 font-medium text-xs">
                  <ShieldCheck className="w-4 h-4 flex-shrink-0" />
                  ¡Inscripción Exitosa!
                </div>
                <p className="text-[11px] text-bananur-sand/80">Recibirás nuestras cápsulas de diseño.</p>
              </div>
            ) : (
              <form onSubmit={handleSubscribe} className="space-y-2">
                <div className="flex border border-white/20 hover:border-bananur-gold rounded-xl overflow-hidden focus-within:border-bananur-gold bg-white/5 p-1 transition-all">
                  <input
                    type="email"
                    placeholder="Tu correo"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="bg-transparent text-sm text-white placeholder-bananur-sand/40 focus:outline-none px-3 py-1.5 w-full font-light"
                  />
                  <button
                    id="footer-btn-subscribe"
                    type="submit"
                    className="bg-bananur-gold hover:bg-bananur-gold-dark text-bananur-clay p-2 rounded-lg transition-all duration-150 cursor-pointer"
                  >
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
                {error && <span className="text-xs text-rose-300 block font-light">{error}</span>}
              </form>
            )}
          </div>

        </div>

        {/* Bottom copyright */}
        <div className="mt-16 pt-8 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between text-xs text-bananur-sand/50 font-light space-y-4 sm:space-y-0">
          <p>© 2026 Bananur Estudio. Todos los derechos reservados. Hecho en Chile.</p>
          <div className="flex space-x-6">
            <button onClick={() => onNavigate('privacidad')} className="hover:text-bananur-gold cursor-pointer transition-colors bg-transparent border-none p-0 text-xs font-light text-bananur-sand/50">Políticas de Privacidad</button>
            <button onClick={() => onNavigate('terminos')} className="hover:text-bananur-gold cursor-pointer transition-colors bg-transparent border-none p-0 text-xs font-light text-bananur-sand/50">Términos de Servicio</button>
          </div>
        </div>
      </div>
    </footer>
  );
}
