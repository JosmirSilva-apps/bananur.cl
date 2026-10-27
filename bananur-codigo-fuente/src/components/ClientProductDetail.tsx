import { useState } from 'react';
import { Product } from '../types';
import { ChevronDown, ChevronUp, ShoppingBag, ArrowLeft, Star, AlertTriangle, Check } from 'lucide-react';

interface ClientProductDetailProps {
  product: Product;
  onBack: () => void;
  onAddToCart: (product: Product, variant: string, quantity: number) => void;
  relatedProducts: Product[];
  onNavigateToProduct: (id: string) => void;
}

export default function ClientProductDetail({
  product,
  onBack,
  onAddToCart,
  relatedProducts,
  onNavigateToProduct
}: ClientProductDetailProps) {
  const [activeImage, setActiveImage] = useState(product.images[0]);
  const [selectedVariant, setSelectedVariant] = useState(product.variants[0]);
  const [quantity, setQuantity] = useState(1);
  const [openSection, setOpenSection] = useState<'desc' | 'details' | 'envio'>('desc');
  const [addedMessage, setAddedMessage] = useState(false);

  const handleAdd = () => {
    onAddToCart(product, selectedVariant, quantity);
    setAddedMessage(true);
    setTimeout(() => {
      setAddedMessage(false);
    }, 2500);
  };

  const isLowStock = product.stock <= product.lowStockThreshold;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 animate-fade-in">
      {/* Back button */}
      <button
        id="detail-btn-back"
        onClick={onBack}
        className="flex items-center gap-1.5 text-xs font-bold text-bananur-clay hover:text-bananur-gold mb-8 transition-colors cursor-pointer"
      >
        <ArrowLeft className="w-4 h-4" />
        Volver a la tienda
      </button>

      {/* Main product columns */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-16">
        
        {/* Left Column: Image Gallery Stack */}
        <div className="lg:col-span-7 flex flex-col-reverse md:flex-row gap-4">
          
          {/* Vertical Gallery list */}
          <div className="flex md:flex-col gap-3 justify-start overflow-x-auto md:overflow-y-auto scrollbar-hidden">
            {product.images.map((img, idx) => (
              <button
                id={`detail-thumb-${idx}`}
                key={idx}
                onClick={() => setActiveImage(img)}
                className={`w-16 h-16 md:w-20 md:h-20 rounded-xl overflow-hidden bg-bananur-sand flex-shrink-0 transition-all cursor-pointer ${
                  activeImage === img 
                    ? 'ring-2 ring-bananur-gold-dark/40 opacity-100' 
                    : 'opacity-70 hover:opacity-100'
                }`}
              >
                <img src={img} alt={`Vista ${idx}`} className="w-full h-full object-cover" />
              </button>
            ))}
          </div>

          {/* Featured Large Active Image */}
          <div className="flex-1 bg-white rounded-3xl overflow-hidden aspect-square flex items-center justify-center shadow-xs">
            <img 
              referrerPolicy="no-referrer"
              src={activeImage} 
              alt={product.name} 
              className="w-full h-full object-cover transition-all duration-300 hover:scale-105" 
            />
          </div>

        </div>

        {/* Right Column: Informative Controls */}
        <div className="lg:col-span-5 space-y-6">
          <div className="space-y-2">
            <span className="text-xs font-mono uppercase tracking-widest text-bananur-gold font-semibold block">
              {product.category}
            </span>
            <h1 className="text-3xl sm:text-4xl font-serif font-bold text-bananur-clay tracking-tight leading-tight">
              {product.name}
            </h1>
            
            {/* Simple Rating Stars */}
            <div className="flex items-center gap-1 text-bananur-gold pt-1">
              {[1, 2, 3, 4, 5].map((s) => (
                <Star key={s} className="w-4 h-4 fill-current" />
              ))}
              <span className="text-xs text-bananur-clay-light/80 font-medium ml-2">4.9 (18 reseñas)</span>
            </div>
          </div>

          {/* Pricing CLP */}
          <div className="py-2.5 flex items-baseline justify-between bg-bananur-sand/25 px-4 rounded-xl">
            <span className="text-xs text-bananur-clay-light/70 uppercase font-mono">
              {product.clothingType === 'vintage' ? 'Precio por Gramaje' : 'Precio Unitario'}
            </span>
            <span className="text-2xl font-mono font-bold text-bananur-clay">
              ${product.price.toLocaleString('es-CL')} CLP
            </span>
          </div>

          {/* Clothing Vintage / Nueva Badge Info */}
          {product.category.toLowerCase() === 'ropa' && (
            <div className="p-3.5 rounded-xl border border-bananur-sand/60 bg-bananur-cream/50 space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="text-xs font-mono font-bold uppercase tracking-wider text-bananur-clay flex items-center gap-1.5">
                  {product.clothingType === 'vintage' ? '⚖️ Prenda Vintage' : '✨ Prenda Nueva'}
                </span>
                {product.clothingType === 'vintage' && product.weightGrams && (
                  <span className="text-xs font-mono font-bold text-amber-900 bg-amber-100/80 px-2 py-0.5 rounded border border-amber-300">
                    Peso: {product.weightGrams}g ({(product.weightGrams / 1000).toFixed(2)} kg)
                  </span>
                )}
              </div>
              {product.clothingType === 'vintage' && product.pricePerKg && (
                <p className="text-[11px] font-mono text-bananur-clay-light">
                  Tasación de autor: ${(product.pricePerKg).toLocaleString('es-CL')}/kg textil. Pieza única curada.
                </p>
              )}
              {product.clothingType === 'vintage' && product.lotCode && (
                <div className="flex items-center gap-1.5 pt-1 text-[11px] font-mono text-amber-900 flex-wrap">
                  <span className="font-bold">Lote / Fardo:</span>
                  <span className="bg-amber-200/70 text-amber-950 px-1.5 py-0.5 rounded border border-amber-300 font-bold">
                    {product.lotCode}
                  </span>
                  {product.lotName && <span className="text-bananur-clay-light">({product.lotName})</span>}
                </div>
              )}
            </div>
          )}

          {/* Color & Variant Selection circles */}
          <div className="space-y-3">
            <div className="flex justify-between text-xs">
              <span className="font-bold text-bananur-clay">Variante Seleccionada:</span>
              <span className="text-bananur-gold font-mono font-semibold">{selectedVariant}</span>
            </div>
            
            <div className="flex flex-wrap gap-2.5">
              {product.variants.map((v, i) => {
                const isSelected = selectedVariant === v;
                return (
                  <button
                    id={`detail-variant-${v}`}
                    key={v}
                    onClick={() => setSelectedVariant(v)}
                    className={`px-4 py-2 text-xs font-semibold rounded-full border transition-all cursor-pointer ${
                      isSelected 
                        ? 'bg-bananur-clay text-bananur-cream border-bananur-clay' 
                        : 'bg-white text-bananur-clay border-bananur-clay/15 hover:border-bananur-gold'
                    }`}
                  >
                    {v}
                  </button>
                );
              })}
            </div>
          </div>
          {/* LOW STOCK TRIGGER */}
          {isLowStock && (
            <div className="bg-amber-550/10 p-4 rounded-xl flex items-start gap-3 text-amber-900 animate-pulse shadow-xs">
              <AlertTriangle className="w-5 h-5 text-bananur-coral mt-0.5 flex-shrink-0" />
              <div className="text-xs font-light">
                <span className="font-semibold block text-bananur-clay">¡Stock crítico en Viña del Mar!</span>
                Quedan escasas <span className="font-bold text-bananur-coral">{product.stock} unidades</span> en esta colección. Asegura tu diseño de autor hoy.
              </div>
            </div>
          )}

          {/* Quantity and Cart button Row */}
          <div className="space-y-4">
            <div className="flex flex-wrap items-center gap-4">
              
              {/* Spinner */}
              <div className="flex items-center rounded-xl bg-bananur-sand/30 p-1">
                <button
                  id="detail-qty-decrease"
                  onClick={() => quantity > 1 && setQuantity(quantity - 1)}
                  className="p-2 text-bananur-clay-light hover:text-bananur-clay hover:bg-bananur-sand rounded-lg cursor-pointer"
                >
                  -
                </button>
                <span className="font-mono text-sm w-8 text-center font-bold text-bananur-clay">
                  {quantity}
                </span>
                <button
                  id="detail-qty-increase"
                  onClick={() => quantity < product.stock && setQuantity(quantity + 1)}
                  className="p-2 text-bananur-clay-light hover:text-bananur-clay hover:bg-bananur-sand rounded-lg cursor-pointer"
                >
                  +
                </button>
              </div>

              {/* Add to Cart button */}
              <button
                id="detail-btn-add-to-cart"
                onClick={handleAdd}
                className="flex-1 bg-bananur-clay hover:bg-bananur-gold hover:text-bananur-clay text-bananur-cream py-4 px-6 rounded-xl font-semibold text-xs transition-all flex items-center justify-center gap-2 shadow-xs cursor-pointer"
              >
                <ShoppingBag className="w-5 h-5" />
                Añadir a la bolsa
              </button>

            </div>

            {/* Added modal feedback */}
            {addedMessage && (
              <div className="bg-bananur-sage-light text-bananur-sage p-3.5 rounded-xl font-semibold text-xs text-center animate-slide-up flex items-center justify-center gap-2">
                <Check className="w-4 h-4" />
                Añadido exitosamente a tu bolsa de compras.
              </div>
            )}
          </div>

          {/* Description Collapsible Accordeon */}
          <div className="pt-4 mt-6 space-y-3">
            
            {/* Accordion 1 */}
            <div className="bg-[#FAF8F5]/85 p-3.5 rounded-xl">
              <button
                id="detail-acc-desc"
                onClick={() => setOpenSection(openSection === 'desc' ? '' as any : 'desc')}
                className="w-full flex justify-between items-center text-left py-2 font-serif text-sm font-bold text-bananur-clay"
              >
                <span>Descripción del Objeto</span>
                {openSection === 'desc' ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
              </button>
              {openSection === 'desc' && (
                <p className="text-xs text-bananur-clay-light/90 leading-relaxed font-light mt-2 animate-fade-in">
                  {product.description}
                </p>
              )}
            </div>

            {/* Accordion 2 */}
            <div className="bg-[#FAF8F5]/85 p-3.5 rounded-xl">
              <button
                id="detail-acc-details"
                onClick={() => setOpenSection(openSection === 'details' ? '' as any : 'details')}
                className="w-full flex justify-between items-center text-left py-2 font-serif text-sm font-bold text-bananur-clay"
              >
                <span>Especificaciones Finas</span>
                {openSection === 'details' ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
              </button>
              {openSection === 'details' && (
                <ul className="text-xs text-bananur-clay-light/90 space-y-2 list-disc pl-4 font-light mt-2 animate-fade-in">
                  {product.details.map((detail, index) => (
                    <li key={index}>{detail}</li>
                  ))}
                </ul>
              )}
            </div>

            {/* Accordion 3 */}
            <div className="bg-[#FAF8F5]/85 p-3.5 rounded-xl">
              <button
                id="detail-acc-envio"
                onClick={() => setOpenSection(openSection === 'envio' ? '' as any : 'envio')}
                className="w-full flex justify-between items-center text-left py-2 font-serif text-sm font-bold text-bananur-clay"
              >
                <span>Envíos, Boletas e IVA</span>
                {openSection === 'envio' ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
              </button>
              {openSection === 'envio' && (
                <p className="text-xs text-bananur-clay-light/85 leading-relaxed font-light mt-2 animate-fade-in">
                  Realizamos despachos diarios por Starken y Chilexpress de lunes a viernes. Emitimos boletas tradicionales integradas a Transbank, y si tienes una empresa o estudio de branding, puedes marcar Factura en el checkout para deducir IVA indicando tu RUT y giro comercial.
                </p>
              )}
            </div>

          </div>

        </div>

      </div>

      {/* Related Products Shelf */}
      <div className="mt-20 pt-10">
        <h3 className="font-serif text-2xl font-bold text-bananur-clay text-center mb-10">
          Objetos de diseño relacionados
        </h3>
        
        <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-6">
          {relatedProducts.slice(0, 4).map((rp) => (
            <div 
              key={rp.id}
              onClick={() => {
                onNavigateToProduct(rp.id);
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              className="group cursor-pointer space-y-3 bg-[#FAF8F5] p-4 rounded-2xl hover:bg-bananur-sand/35 hover:shadow-xs duration-200 transition-all"
            >
              <div className="aspect-square bg-bananur-sand rounded-xl overflow-hidden">
                <img src={rp.images[0]} alt={rp.name} className="w-full h-full object-cover group-hover:scale-105 duration-200" />
              </div>
              <div className="space-y-1">
                <span className="text-[10px] font-mono text-bananur-gold uppercase tracking-wider">{rp.category}</span>
                <h4 className="font-bold text-xs text-bananur-clay truncate">{rp.name}</h4>
                <p className="font-mono text-xs font-semibold text-bananur-clay-light">${rp.price.toLocaleString('es-CL')}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
}
