import { X, Search, Sparkles, ShoppingBag, ArrowUpRight } from 'lucide-react';
import { useState, useMemo, useEffect, useRef } from 'react';
import { MOCK_PRODUCTS, MOCK_SERVICES } from '../data';
import { Product, Service } from '../types';

interface SearchOverlayProps {
  onClose: () => void;
  onNavigateToProduct: (id: string) => void;
  onNavigateToService: (id: string) => void;
  onNavigateToCategory: (category: string) => void;
}

export default function SearchOverlay({
  onClose,
  onNavigateToProduct,
  onNavigateToService,
  onNavigateToCategory
}: SearchOverlayProps) {
  const [query, setQuery] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  // Auto-focus input
  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.focus();
    }
  }, []);

  // Filter products and services based on query
  const results = useMemo(() => {
    if (!query.trim()) {
      return { products: [], services: [] };
    }
    const cleanQuery = query.toLowerCase();

    const filteredProducts = MOCK_PRODUCTS.filter((p) =>
      p.name.toLowerCase().includes(cleanQuery) ||
      p.category.toLowerCase().includes(cleanQuery) ||
      p.description.toLowerCase().includes(cleanQuery)
    );

    const filteredServices = MOCK_SERVICES.filter((s) =>
      s.name.toLowerCase().includes(cleanQuery) ||
      s.category.toLowerCase().includes(cleanQuery) ||
      s.description.toLowerCase().includes(cleanQuery)
    );

    return { products: filteredProducts, services: filteredServices };
  }, [query]);

  const hasResults = results.products.length > 0 || results.services.length > 0;

  return (
    <div className="fixed inset-0 z-50 bg-bananur-clay/90 backdrop-blur-md flex flex-col justify-start">
      {/* Top close button */}
      <div className="max-w-7xl mx-auto w-full px-6 py-6 flex justify-end">
        <button
          id="search-btn-close"
          onClick={onClose}
          className="p-3 bg-white/10 hover:bg-white/20 text-white rounded-full transition-all cursor-pointer"
        >
          <X className="w-6 h-6" />
        </button>
      </div>

      <div className="max-w-4xl mx-auto w-full px-6 flex-1 flex flex-col justify-start pt-10">
        
        {/* Subtitle / Label */}
        <span className="text-[11px] font-mono tracking-widest text-bananur-gold uppercase block text-center mb-3">
          ¿Qué estás buscando hoy?
        </span>

        {/* Big Search Input wrapper */}
        <div className="relative border-b-2 border-white/20 focus-within:border-bananur-gold py-4 transition-all mb-10">
          <input
            id="search-overlay-input"
            ref={inputRef}
            type="text"
            placeholder="Escribe para buscar agendas, botánica, servicios..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="w-full bg-transparent text-white font-serif text-2xl md:text-4xl placeholder-white/30 text-center focus:outline-none focus:ring-0 select-text"
          />
          <Search className="absolute right-4 top-1/2 -translate-y-1/2 text-white/40 w-6 h-6 pointer-events-none" />
        </div>

        {/* Live dynamic results panel */}
        <div className="flex-1 overflow-y-auto max-h-[60vh] pr-2 scrollbar-hidden">
          {query.trim() === '' ? (
            /* Suggestions view when empty */
            <div className="text-center text-white/80 space-y-6 max-w-lg mx-auto py-10 animate-fade-in">
              <h3 className="text-base font-serif italic text-bananur-gold">Sugerencias recomendadas</h3>
              <div className="flex flex-wrap justify-center gap-2.5">
                {['Papelería', 'Accesorios', 'Arte & Decoración', 'Diseño', 'Digital', 'Asesoría'].map((cat) => (
                  <button
                    id={`search-suggest-${cat}`}
                    key={cat}
                    onClick={() => {
                      onNavigateToCategory(cat);
                      onClose();
                    }}
                    className="px-4 py-2 bg-white/5 hover:bg-bananur-gold hover:text-bananur-clay text-white/95 text-xs font-semibold rounded-full border border-white/10 transition-all cursor-pointer"
                  >
                    {cat}
                  </button>
                ))}
              </div>
              <p className="text-xs text-white/50 font-light">
                Encuentra papelería fina hecha a mano, soportes de notebook ergonómicos y consultorías de diseño.
              </p>
            </div>
          ) : !hasResults ? (
            /* No results template */
            <div className="text-center py-12 space-y-4 animate-fade-in">
              <div className="text-bananur-gold text-sm font-semibold uppercase tracking-wider">No se encontraron resultados</div>
              <p className="text-sm text-white/60 max-w-md mx-auto font-light">
                No pudimos encontrar coincidencias para "<span className="italic text-white">{query}</span>". Intenta buscar conceptos más generales.
              </p>
              <div className="pt-2">
                <span className="text-xs text-white/40 block mb-3">O quizás te interese revisar:</span>
                <div className="flex justify-center gap-2">
                  <button
                    id="search-no-results-btn-tienda"
                    onClick={() => {
                      onNavigateToCategory('Impresión 3D');
                      onClose();
                    }}
                    className="text-xs text-bananur-gold hover:underline"
                  >
                    Ver piezas en 3D
                  </button>
                  <span className="text-white/30">•</span>
                  <button
                    id="search-no-results-btn-servicios"
                    onClick={() => {
                      onNavigateToService('serv-1');
                      onClose();
                    }}
                    className="text-xs text-bananur-gold hover:underline"
                  >
                    Servicio de Branding
                  </button>
                </div>
              </div>
            </div>
          ) : (
            /* Grouped results */
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 py-4 text-white">
              
              {/* Products Found Column */}
              <div className="space-y-4">
                <div className="flex items-center gap-2 border-b border-white/10 pb-2">
                  <ShoppingBag className="w-4 h-4 text-bananur-gold" />
                  <h4 className="text-xs font-mono uppercase tracking-widest text-bananur-gold">Productos Físicos ({results.products.length})</h4>
                </div>
                {results.products.length === 0 ? (
                  <p className="text-xs text-white/40 italic">Ningún producto coincide.</p>
                ) : (
                  <div className="space-y-3">
                    {results.products.map((p) => (
                      <div
                        key={p.id}
                        onClick={() => {
                          onNavigateToProduct(p.id);
                          onClose();
                        }}
                        className="flex items-center gap-3 p-2 bg-white/5 hover:bg-white/10 rounded-xl cursor-pointer transition-all"
                      >
                        <img src={p.images[0]} alt={p.name} className="w-12 h-12 object-cover rounded-md flex-shrink-0 bg-bananur-clay" />
                        <div className="min-w-0 flex-1">
                          <span className="text-xs text-bananur-gold font-medium">{p.category}</span>
                          <p className="text-sm font-medium text-white truncate">{p.name}</p>
                          <p className="text-xs text-white/60 font-mono">${p.price.toLocaleString('es-CL')}</p>
                        </div>
                        <ArrowUpRight className="w-4 h-4 text-white/40 flex-shrink-0" />
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Services Found Column */}
              <div className="space-y-4">
                <div className="flex items-center gap-2 border-b border-white/10 pb-2">
                  <Sparkles className="w-4 h-4 text-bananur-gold" />
                  <h4 className="text-xs font-mono uppercase tracking-widest text-bananur-gold">Servicios & Marcas ({results.services.length})</h4>
                </div>
                {results.services.length === 0 ? (
                  <p className="text-xs text-white/40 italic">Ningún servicio coincide.</p>
                ) : (
                  <div className="space-y-3">
                    {results.services.map((s) => (
                      <div
                        key={s.id}
                        onClick={() => {
                          onNavigateToService(s.id);
                          onClose();
                        }}
                        className="p-3 bg-white/5 hover:bg-white/10 rounded-xl cursor-pointer transition-all flex justify-between items-center"
                      >
                        <div>
                          <span className="text-[10px] font-mono uppercase text-bananur-gold bg-bananur-gold/20 px-1.5 py-0.5 rounded">
                            {s.category}
                          </span>
                          <p className="text-sm font-medium text-white mt-1">{s.name}</p>
                          <p className="text-xs text-white/60">Desde ${s.price.toLocaleString('es-CL')}</p>
                        </div>
                        <ArrowUpRight className="w-4 h-4 text-white/40 flex-shrink-0" />
                      </div>
                    ))}
                  </div>
                )}
              </div>

            </div>
          )}
        </div>
      </div>
    </div>
  );
}
