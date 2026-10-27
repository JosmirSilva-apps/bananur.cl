import { useState, useMemo } from 'react';
import { PortfolioItem } from '../types';
import { MOCK_REVIEW_PROJECTS } from '../data';
import { X, ExternalLink, Monitor, Smartphone, Sparkles, BookOpen } from 'lucide-react';

interface ClientPortfolioProps {
  portfolioItems?: PortfolioItem[];
}

export default function ClientPortfolio({ portfolioItems = MOCK_REVIEW_PROJECTS }: ClientPortfolioProps) {
  const [filter, setFilter] = useState('Todos');
  const [activeItem, setActiveItem] = useState<PortfolioItem | null>(null);

  const categories = ['Todos', 'Diseño & E-commerce', 'Branding', 'Branding & Packaging', 'Desarrollo Web'];

  const filteredItems = useMemo(() => {
    if (filter === 'Todos') return portfolioItems;
    return portfolioItems.filter(item => item.category === filter);
  }, [filter, portfolioItems]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 animate-fade-in">
      
      {/* Editorial intro section */}
      <div className="text-center max-w-3xl mx-auto space-y-4 mb-16">
        <span className="text-xs font-mono uppercase tracking-widest text-bananur-gold bg-bananur-sand px-3 py-1 rounded-full font-semibold">
          Nuestros Trabajo Reciente
        </span>
        <h1 className="text-4xl sm:text-5xl font-serif font-extrabold text-bananur-clay tracking-tight">
          Portafolio de Casos de Estudio
        </h1>
        <p className="text-sm font-light text-bananur-clay-light/90 leading-relaxed">
          Diseñamos soluciones digitales, branding editorial y packaging sofisticados para marcas y proyectos de autor de gran carácter en Chile y el mundo.
        </p>
      </div>

      {/* Category Filter Chips */}
      <div className="flex flex-wrap justify-center gap-2 mb-12">
        {categories.map((cat) => (
          <button
            id={`port-filter-${cat}`}
            key={cat}
            onClick={() => setFilter(cat)}
            className={`px-5 py-2.5 rounded-full text-xs font-semibold transition-all cursor-pointer ${
              filter === cat 
                ? 'bg-bananur-clay text-bananur-cream shadow-sm' 
                : 'bg-[#FAF8F5] text-bananur-clay-light hover:bg-bananur-sand/50'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Grid of Projects */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
        {filteredItems.map((item) => (
          <div
            key={item.id}
            onClick={() => setActiveItem(item)}
            className="group cursor-pointer bg-bananur-sand/30 hover:bg-bananur-sand/65 p-6 rounded-3xl duration-300 transition-all flex flex-col justify-between shadow-xs"
          >
            {/* Mockup wrapper */}
            <div className={`relative bg-bananur-sand rounded-2xl p-4 flex items-center justify-center overflow-hidden mb-6 aspect-[16/10] ${
              item.mockType === 'mobile' ? 'max-w-xs mx-auto w-full' : ''
            }`}>
              {/* Notebook Screen frame */}
              {item.mockType === 'notebook' ? (
                <div className="w-full h-full border-4 border-bananur-clay bg-bananur-clay rounded-lg shadow-lg overflow-hidden flex flex-col relative">
                  <div className="h-3.5 bg-bananur-clay flex items-center gap-1.5 px-2.5 border-b border-white/5">
                    <span className="w-1.5 h-1.5 rounded-full bg-red-400"></span>
                    <span className="w-1.5 h-1.5 rounded-full bg-yellow-400"></span>
                    <span className="w-1.5 h-1.5 rounded-full bg-green-400"></span>
                  </div>
                  <img src={item.image} alt={item.name} className="flex-1 object-cover w-full group-hover:scale-102 duration-300" />
                  <div className="absolute top-2 right-2 bg-bananur-clay/70 p-1.5 rounded-md text-white">
                    <Monitor className="w-3.5 h-3.5" />
                  </div>
                </div>
              ) : (
                /* Mobile Phone Screen frame */
                <div className="w-[190px] h-full border-6 border-bananur-clay bg-bananur-clay rounded-2xl shadow-xl overflow-hidden flex flex-col relative">
                  <div className="h-4 bg-bananur-clay flex justify-center items-center">
                    <span className="w-12 h-2.5 bg-bananur-clay-light rounded-full" />
                  </div>
                  <img src={item.image} alt={item.name} className="flex-1 object-cover w-full group-hover:scale-102 duration-300" />
                  <div className="absolute top-2 right-2 bg-bananur-clay/70 p-1.5 rounded-md text-white">
                    <Smartphone className="w-3.5 h-3.5" />
                  </div>
                </div>
              )}
            </div>

            {/* Typography info text */}
            <div className="space-y-2">
              <span className="text-[10px] font-mono uppercase tracking-widest text-bananur-gold bg-bananur-clay px-2 py-0.5 rounded font-semibold inline-block">
                {item.category}
              </span>
              <div className="flex justify-between items-baseline">
                <h3 className="font-serif text-xl font-bold text-bananur-clay group-hover:underline">
                  {item.name}
                </h3>
                <span className="text-xs font-mono text-bananur-clay-light/70">{item.client}</span>
              </div>
              <p className="text-xs font-light text-bananur-clay-light/95 leading-relaxed line-clamp-2">
                {item.description}
              </p>
              
              {/* Stack tags */}
              <div className="flex flex-wrap gap-1.5 pt-2">
                {item.stack.map((tech) => (
                  <span key={tech} className="text-[9px] font-mono text-bananur-clay bg-white px-2.5 py-1 rounded-full shadow-3xs">
                    {tech}
                  </span>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* MODAL CASE STUDY: Problema -> Solución -> Stack -> Resultado */}
      {activeItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-y-auto">
          {/* Backdrop */}
          <div 
            onClick={() => setActiveItem(null)}
            className="fixed inset-0 bg-bananur-clay/75 backdrop-blur-md"
          ></div>

          {/* Modal box */}
          <div className="relative bg-white max-w-3xl w-full rounded-3xl overflow-hidden shadow-2xl animate-scale-up z-10">
            
            {/* Top Close */}
            <button
              id="port-modal-close"
              onClick={() => setActiveItem(null)}
              className="absolute top-4 right-4 p-2 bg-bananur-sand/60 hover:bg-bananur-sand text-bananur-clay rounded-full transition-colors z-20 cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Hero Image in Modal */}
            <div className="h-48 md:h-64 relative bg-bananur-clay">
              <img src={activeItem.image} alt={activeItem.name} className="w-full h-full object-cover opacity-85" />
              <div className="absolute inset-0 bg-gradient-to-t from-bananur-clay to-transparent" />
              <div className="absolute bottom-6 left-6 right-6 text-white space-y-1">
                <span className="text-[10px] font-mono uppercase tracking-widest text-bananur-yellow bg-white/15 px-2 py-0.5 rounded font-semibold">
                  {activeItem.category}
                </span>
                <h2 className="text-2xl md:text-3xl font-serif font-bold text-white leading-tight">
                  {activeItem.name}
                </h2>
                <p className="text-xs text-bananur-sand/70">Proyecto de marca para: {activeItem.client}</p>
              </div>
            </div>

            {/* Case study study contents */}
            <div className="p-6 md:p-8 space-y-6 max-h-[50vh] overflow-y-auto scrollbar-hidden">
              
              {/* Section: Problema */}
              <div className="space-y-2">
                <h4 className="text-xs font-mono uppercase tracking-widest text-bananur-coral font-bold flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-bananur-coral" />
                  El Desafío / El Problema
                </h4>
                <p className="text-xs text-bananur-clay-light leading-relaxed font-light">
                  {activeItem.problem}
                </p>
              </div>

              {/* Section: Solución */}
              <div className="space-y-2">
                <h4 className="text-xs font-mono uppercase tracking-widest text-bananur-sage font-bold flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-bananur-sage" />
                  La Solución Aplicada
                </h4>
                <p className="text-xs text-bananur-clay-light leading-relaxed font-light">
                  {activeItem.solution}
                </p>
              </div>

              {/* Download App and Visit Site Actions Section */}
              <div className="pt-4">
                <div className="flex flex-col sm:flex-row gap-4 bg-[#FAF8F5]/85 p-4 rounded-2xl">
                  <button
                    id="port-modal-download-app"
                    onClick={() => alert(`Simulación: Iniciando descarga de la App móvil del caso ${activeItem.name}.`)}
                    className="flex-1 py-3 px-5 bg-bananur-clay hover:bg-bananur-gold text-[#FAF8F5] hover:text-bananur-clay rounded-xl font-bold text-xs transition-all flex items-center justify-center gap-2 cursor-pointer shadow-xs"
                  >
                    <Smartphone className="w-4 h-4" />
                    Descargar App Móvil
                  </button>
                  <a
                    id="port-modal-visit-site"
                    href="https://bananur.cl"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex-1 py-3 px-5 bg-bananur-sand/40 text-bananur-clay hover:bg-bananur-sand/75 rounded-xl font-bold text-xs transition-all flex items-center justify-center gap-2 text-center decoration-transparent"
                  >
                    <span>Visitar Sitio Web Oficial</span>
                    <ExternalLink className="w-4 h-4" />
                  </a>
                </div>
              </div>

            </div>

            {/* Footer with CTA */}
            <div className="p-4 md:px-8 bg-[#FAF8F5] flex items-center justify-end">
              <button
                id="port-modal-footer-close"
                onClick={() => setActiveItem(null)}
                className="px-5 py-2 bg-bananur-clay hover:bg-bananur-gold text-[#FAF8F5] hover:text-bananur-clay text-xs font-bold rounded-xl transition-all cursor-pointer"
              >
                Cerrar Caso
              </button>
            </div>

          </div>

        </div>
      )}

    </div>
  );
}
