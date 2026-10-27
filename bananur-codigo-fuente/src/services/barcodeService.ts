/**
 * Servicio Centralizado de Código Único y Escaneo de Código de Barras
 * Taller Bananur Chile • Viña del Mar
 */

export type EntityType = 'product' | 'service' | 'material' | 'lot' | 'order';

export interface IdentifiedItem {
  type: EntityType;
  id: string;
  code: string;
  name: string;
  category: string;
  price?: number;
  stock?: number;
  unit?: string;
  image?: string;
  description?: string;
  sourceItem: any;
}

/**
 * Genera un código único alfanumérico estandarizado con prefijo corporativo BNN.
 */
export function generateUniqueCode(type: EntityType, categoryHint?: string): string {
  const randomNum = Math.floor(1000 + Math.random() * 9000); // 4 dígitos
  let prefix = 'BNN-GEN';

  if (type === 'product') {
    if (categoryHint?.toLowerCase().includes('3d')) prefix = 'BNN-3D';
    else if (categoryHint?.toLowerCase().includes('costura')) prefix = 'BNN-CST';
    else if (categoryHint?.toLowerCase().includes('crochet')) prefix = 'BNN-CRO';
    else if (categoryHint?.toLowerCase().includes('ropa')) prefix = 'BNN-TEX';
    else prefix = 'BNN-PRD';
  } else if (type === 'service') {
    prefix = 'BNN-SRV';
  } else if (type === 'material') {
    prefix = 'BNN-MAT';
  } else if (type === 'lot') {
    prefix = 'BNN-FAR';
  } else if (type === 'order') {
    prefix = 'BNN-TK';
  }

  return `${prefix}-${randomNum}`;
}

/**
 * Emite un bip sonoro característico de terminal de punto de venta (POS)
 * mediante el Web Audio API del navegador.
 */
export function playScanSuccessSound(): void {
  try {
    const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioContextClass) return;
    const ctx = new AudioContextClass();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'sine';
    // Doble tono ascendente de confirmación POS
    osc.frequency.setValueAtTime(1200, ctx.currentTime);
    osc.frequency.setValueAtTime(1760, ctx.currentTime + 0.05);

    gain.gain.setValueAtTime(0.12, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.16);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start();
    osc.stop(ctx.currentTime + 0.18);
  } catch {
    // Si el navegador bloquea audio sin interacción previa, silencioso
  }
}

/**
 * Genera el patrón de barras pseudo-Code128 determinista a partir de la cadena de texto
 */
export function getBarcodeBars(text: string): { width: number; isSpace: boolean }[] {
  const normalized = (text || 'BNN-0000').toUpperCase();
  const bars: { width: number; isSpace: boolean }[] = [];

  // Quiet zone inicial
  bars.push({ width: 3, isSpace: true });
  // Start pattern
  bars.push({ width: 2, isSpace: false });
  bars.push({ width: 1, isSpace: true });
  bars.push({ width: 2, isSpace: false });
  bars.push({ width: 2, isSpace: true });

  for (let i = 0; i < normalized.length; i++) {
    const charCode = normalized.charCodeAt(i);
    const patternVal = (charCode * (i + 3)) % 16;
    
    // Generar 4 barras/espacios por caracter
    bars.push({ width: (patternVal % 3) + 1, isSpace: false });
    bars.push({ width: ((patternVal >> 1) % 3) + 1, isSpace: true });
    bars.push({ width: ((patternVal >> 2) % 3) + 1, isSpace: false });
    bars.push({ width: ((patternVal >> 3) % 2) + 1, isSpace: true });
  }

  // Stop pattern
  bars.push({ width: 3, isSpace: false });
  bars.push({ width: 1, isSpace: true });
  bars.push({ width: 2, isSpace: false });
  bars.push({ width: 3, isSpace: true });

  return bars;
}
