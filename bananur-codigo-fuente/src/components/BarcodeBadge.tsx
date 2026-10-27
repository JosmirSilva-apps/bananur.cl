import React, { useState } from 'react';
import { Printer, X, Copy, Check, QrCode } from 'lucide-react';
import { getBarcodeBars } from '../services/barcodeService';

interface BarcodeBadgeProps {
  code: string;
  name?: string;
  price?: number;
  category?: string;
  showPrintButton?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

export default function BarcodeBadge({
  code,
  name,
  price,
  category,
  showPrintButton = true,
  size = 'md'
}: BarcodeBadgeProps) {
  const [showPrintModal, setShowPrintModal] = useState(false);
  const [copied, setCopied] = useState(false);
  const bars = getBarcodeBars(code);

  const handleCopy = (e: React.MouseEvent) => {
    e.stopPropagation();
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <>
      <div className="inline-flex items-center gap-1.5 group">
        <button
          type="button"
          onClick={handleCopy}
          className={`font-mono font-bold tracking-wider rounded-lg border flex items-center gap-1 transition-all cursor-pointer ${
            size === 'sm'
              ? 'px-1.5 py-0.5 text-[9px] bg-[#FAF8F5] border-bananur-sand text-bananur-clay hover:border-bananur-gold'
              : size === 'lg'
              ? 'px-3 py-1 text-xs bg-white border-bananur-sand text-bananur-clay shadow-2xs'
              : 'px-2 py-0.5 text-[10px] bg-white border-bananur-sand/80 text-bananur-clay hover:bg-bananur-sand/20'
          }`}
          title="Clic para copiar código único"
        >
          {copied ? (
            <Check className="w-3 h-3 text-emerald-600" />
          ) : (
            <span className="w-1.5 h-1.5 rounded-full bg-bananur-gold-dark shrink-0" />
          )}
          <span>{code}</span>
        </button>

        {showPrintButton && (
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              setShowPrintModal(true);
            }}
            className="p-1 hover:bg-bananur-sand/40 text-bananur-clay-light hover:text-bananur-clay rounded transition-colors cursor-pointer"
            title="Imprimir etiqueta térmica con código de barras"
          >
            <Printer className="w-3 h-3" />
          </button>
        )}
      </div>

      {/* Modal de Etiqueta Térmica / Barcode para Impresión */}
      {showPrintModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-white rounded-3xl border border-bananur-sand shadow-2xl max-w-sm w-full p-6 space-y-5 animate-scale-up">
            <div className="flex items-center justify-between pb-3 border-b border-bananur-sand/70">
              <div className="flex items-center gap-2">
                <Printer className="w-5 h-5 text-bananur-gold-dark" />
                <h3 className="font-serif text-base font-bold text-bananur-clay">
                  Etiqueta de Inventario & Venta
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setShowPrintModal(false)}
                className="p-1 text-bananur-clay-light hover:text-black rounded cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Sticker Térmico Preview */}
            <div className="p-4 bg-white border-2 border-dashed border-bananur-clay/30 rounded-2xl shadow-inner text-center space-y-3 font-sans">
              <div className="text-[10px] font-mono tracking-widest uppercase font-bold text-bananur-clay/70 border-b border-gray-200 pb-1 flex items-center justify-between">
                <span>BANANUR CHILE</span>
                <span>VIÑA DEL MAR</span>
              </div>

              {name && (
                <div className="text-xs font-bold text-bananur-clay line-clamp-2 leading-tight">
                  {name}
                </div>
              )}

              {category && (
                <div className="text-[9px] font-mono text-bananur-clay-light uppercase">
                  {category}
                </div>
              )}

              {/* Renderizado de Barras de Código 128 */}
              <div className="py-2 px-2 bg-white flex flex-col items-center justify-center">
                <svg
                  viewBox="0 0 160 50"
                  className="w-full max-w-[220px] h-12 overflow-visible"
                  preserveAspectRatio="none"
                >
                  <g fill="#18181B">
                    {(() => {
                      let xOffset = 6;
                      return bars.map((b, idx) => {
                        const currentX = xOffset;
                        xOffset += b.width * 1.5;
                        if (b.isSpace) return null;
                        return (
                          <rect
                            key={idx}
                            x={currentX}
                            y="0"
                            width={b.width * 1.5}
                            height="44"
                          />
                        );
                      });
                    })()}
                  </g>
                </svg>
                <span className="font-mono text-xs font-black tracking-widest text-black mt-1">
                  {code}
                </span>
              </div>

              {price !== undefined && (
                <div className="pt-1 border-t border-gray-200 flex items-center justify-between">
                  <span className="text-[10px] font-mono text-bananur-clay-light">PRECIO TALLER</span>
                  <span className="font-mono text-sm font-black text-bananur-clay">
                    ${price.toLocaleString('es-CL')}
                  </span>
                </div>
              )}

              <div className="text-[8px] font-mono text-gray-400">
                1 Norte 450, Viña del Mar • bananur.cl
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center justify-between gap-3 pt-2">
              <button
                type="button"
                onClick={handleCopy}
                className="px-3 py-2 border border-bananur-sand rounded-xl text-xs font-semibold text-bananur-clay hover:bg-bananur-sand/30 flex items-center gap-1.5 cursor-pointer"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copied ? 'Copiado' : 'Copiar'}</span>
              </button>

              <button
                type="button"
                onClick={handlePrint}
                className="px-4 py-2 bg-bananur-clay hover:bg-bananur-gold hover:text-black text-white rounded-xl text-xs font-bold font-mono uppercase tracking-wider flex items-center gap-2 shadow-xs transition-all cursor-pointer"
              >
                <Printer className="w-3.5 h-3.5" />
                <span>Imprimir Sticker</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
