import { X, Plus, Minus, Trash2, ShoppingBag, ArrowRight } from 'lucide-react';
import { CartItem } from '../types';

interface CartSlideOverProps {
  isOpen: boolean;
  onClose: () => void;
  items: CartItem[];
  onUpdateQuantity: (productId: string, variant: string, change: number) => void;
  onRemoveItem: (productId: string, variant: string) => void;
  onGoToCheckout: () => void;
  onGoToShop: () => void;
}

export default function CartSlideOver({
  isOpen,
  onClose,
  items,
  onUpdateQuantity,
  onRemoveItem,
  onGoToCheckout,
  onGoToShop
}: CartSlideOverProps) {
  if (!isOpen) return null;

  const subtotal = items.reduce((sum, item) => sum + item.product.price * item.quantity, 0);

  return (
    <div className="fixed inset-0 z-50 overflow-hidden" aria-labelledby="slide-over-title" role="dialog" aria-modal="true">
      {/* Background backdrop */}
      <div 
        onClick={onClose}
        className="absolute inset-0 bg-bananur-clay/60 backdrop-blur-sm transition-opacity"
      ></div>

      <div className="absolute inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-md bg-bananur-sand flex flex-col shadow-2xl animate-slide-left border-l border-bananur-clay/10">
          
          {/* Header */}
          <div className="px-6 py-6 bg-bananur-cream border-b border-bananur-clay/5 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <ShoppingBag className="w-5 h-5 text-bananur-clay" />
              <h2 id="slide-over-title" className="text-lg font-serif font-bold text-bananur-clay">
                Bolsa de Compras
              </h2>
              <span className="font-mono text-xs bg-bananur-clay text-bananur-cream px-2 py-0.5 rounded-full">
                {items.length}
              </span>
            </div>
            <button
              id="cart-btn-close"
              onClick={onClose}
              className="p-2 text-bananur-clay hover:text-bananur-gold rounded-full transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Core scrollable content */}
          <div className="flex-1 overflow-y-auto p-6 space-y-4">
            {items.length === 0 ? (
              /* Empty Bag Mode */
              <div className="h-full flex flex-col items-center justify-center p-6 text-center space-y-5">
                <div className="w-16 h-16 bg-bananur-cream rounded-full flex items-center justify-center border border-bananur-clay/5 text-bananur-clay-light/60">
                  <ShoppingBag className="w-8 h-8" />
                </div>
                <div className="space-y-1">
                  <h3 className="font-serif text-lg font-medium text-bananur-clay">Tu bolsa está vacía</h3>
                  <p className="text-xs text-bananur-clay-light leading-relaxed max-w-xs font-light">
                    Explora nuestra colección de papelería sustentable, maderas refinadas y tazas hechas a mano en Viña del Mar.
                  </p>
                </div>
                <button
                  id="cart-empty-btn-shop"
                  onClick={() => {
                    onGoToShop();
                    onClose();
                  }}
                  className="px-6 py-3 bg-bananur-clay text-bananur-cream rounded-xl text-xs font-semibold hover:bg-bananur-gold hover:text-bananur-clay transition-all shadow-sm cursor-pointer"
                >
                  Ir al Catálogo de Productos
                </button>
              </div>
            ) : (
              /* Item List */
              <div className="space-y-4">
                {items.map((item, index) => {
                  const itemSubtotal = item.product.price * item.quantity;
                  return (
                    <div 
                      key={`${item.product.id}-${item.variant}-${index}`}
                      className="bg-white p-4 rounded-xl shadow-sm border border-bananur-clay/5 flex gap-4 animate-fade-in"
                    >
                      <img 
                        src={item.product.images[0]} 
                        alt={item.product.name} 
                        className="w-16 h-16 object-cover rounded-lg bg-bananur-sand flex-shrink-0"
                      />
                      <div className="min-w-0 flex-1 flex flex-col justify-between">
                        <div>
                          <p className="text-xs text-bananur-gold font-medium uppercase tracking-wider">
                            {item.product.category}
                          </p>
                          <h4 className="text-xs font-medium text-bananur-clay truncate" title={item.product.name}>
                            {item.product.name}
                          </h4>
                          <span className="inline-block text-[10px] font-mono bg-bananur-sand text-bananur-clay-light px-2 py-0.5 rounded mt-1">
                            Var: {item.variant}
                          </span>
                        </div>

                        {/* Quantity Counter controls */}
                        <div className="flex items-center justify-between mt-3">
                          <div className="flex items-center gap-1.5 bg-bananur-sand/70 rounded-lg p-0.5">
                            <button
                              id={`cart-decrease-${item.product.id}`}
                              onClick={() => {
                                if (item.quantity > 1) {
                                  onUpdateQuantity(item.product.id, item.variant, -1);
                                } else {
                                  onRemoveItem(item.product.id, item.variant);
                                }
                              }}
                              className="p-1 text-bananur-clay-light hover:text-bananur-clay hover:bg-white rounded transition-colors cursor-pointer"
                            >
                              <Minus className="w-3.5 h-3.5" />
                            </button>
                            <span className="font-mono text-xs w-6 text-center text-bananur-clay font-medium select-none">
                              {item.quantity}
                            </span>
                            <button
                              id={`cart-increase-${item.product.id}`}
                              onClick={() => onUpdateQuantity(item.product.id, item.variant, 1)}
                              className="p-1 text-bananur-clay-light hover:text-bananur-clay hover:bg-white rounded transition-colors cursor-pointer"
                            >
                              <Plus className="w-3.5 h-3.5" />
                            </button>
                          </div>

                          <div className="flex items-center gap-2">
                            <span className="font-mono text-xs font-bold text-bananur-clay">
                              ${itemSubtotal.toLocaleString('es-CL')}
                            </span>
                            <button
                              id={`cart-remove-${item.product.id}`}
                              onClick={() => onRemoveItem(item.product.id, item.variant)}
                              className="text-bananur-clay-light hover:text-bananur-coral p-1 rounded transition-colors cursor-pointer"
                              title="Eliminar producto"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>

                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Footer - Only visible if items present */}
          {items.length > 0 && (
            <div className="p-6 bg-bananur-cream border-t border-bananur-clay/5">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-bananur-clay-light font-medium">Subtotal</span>
                  <span className="font-mono text-lg font-bold text-bananur-clay">
                    ${subtotal.toLocaleString('es-CL')}
                  </span>
                </div>
                <p className="text-[10px] text-bananur-clay-light/70 font-light">
                  * Despacho e impuestos calculados en el paso siguiente de pago. Soporta Boletas e integraciones Factura.
                </p>
                <div className="grid grid-cols-1 gap-2 pt-2">
                  <button
                    id="cart-btn-checkout"
                    onClick={() => {
                      onGoToCheckout();
                      onClose();
                    }}
                    className="w-full flex items-center justify-center gap-2 bg-bananur-clay text-bananur-cream py-3.5 px-4 rounded-xl text-xs font-semibold hover:bg-bananur-gold hover:text-bananur-clay transition-all shadow-sm cursor-pointer"
                  >
                    Ir a Pagar (Checkout)
                    <ArrowRight className="w-4 h-4" />
                  </button>
                  <button
                    id="cart-btn-keep-shopping"
                    onClick={onClose}
                    className="w-full text-center py-2 text-xs font-semibold text-bananur-clay hover:underline cursor-pointer"
                  >
                    Continuar comprando
                  </button>
                </div>
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}
