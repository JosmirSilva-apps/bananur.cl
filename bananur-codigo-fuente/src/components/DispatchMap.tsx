import React, { useState, useMemo } from 'react';
import { MapPin, Compass, ZoomIn, ZoomOut, ExternalLink, Globe, Navigation, Search } from 'lucide-react';

interface DispatchMapProps {
  address: string;
  commune: string;
  city: string;
  orderId: string;
}

interface CoordinateInfo {
  lat: number;
  lng: number;
  mainRoads: string[];
  park?: string;
  waterBody?: string;
  topographyType: 'mountain' | 'coastal' | 'flat' | 'river-valley';
}

// Complete geo-mapping for common Chilean cities/communes
const COMMUNE_COORDS: { [key: string]: CoordinateInfo } = {
  providencia: {
    lat: -33.4312,
    lng: -70.6122,
    mainRoads: ['Av. Providencia', 'Av. Andrés Bello', 'Av. Los Leones', 'Tobalaba'],
    park: 'Parque de las Esculturas',
    waterBody: 'Río Mapocho',
    topographyType: 'river-valley'
  },
  'las condes': {
    lat: -33.4124,
    lng: -70.5665,
    mainRoads: ['Av. Apoquindo', 'Av. Vitacura', 'Av. Manquehue', 'Av. Américo Vespucio'],
    park: 'Parque Araucano',
    topographyType: 'flat'
  },
  santiago: {
    lat: -33.4489,
    lng: -70.6693,
    mainRoads: ['Alameda Bernardo O’Higgins', 'Paseo Ahumada', 'Calle Moneda', 'San Antonio'],
    park: 'Parque Forestal',
    waterBody: 'Mapocho Cl Canal',
    topographyType: 'river-valley'
  },
  vitacura: {
    lat: -33.3811,
    lng: -70.5756,
    mainRoads: ['Av. Vitacura', 'Av. Bicentenario', 'Av. Américo Vespucio', 'Kennedy'],
    park: 'Parque Bicentenario',
    waterBody: 'Río Mapocho (Riberas)',
    topographyType: 'river-valley'
  },
  ñuñoa: {
    lat: -33.4569,
    lng: -70.6032,
    mainRoads: ['Av. Irarrázaval', 'Av. José Pedro Alessandri', 'Av. Grecia', 'Av. Salvador'],
    park: 'Plaza Ñuñoa (Barrio Histórico)',
    topographyType: 'flat'
  },
  'la reina': {
    lat: -33.4428,
    lng: -70.5512,
    mainRoads: ['Av. Larraín', 'Av. Francisco Bilbao', 'Echeñique', 'Av. Tobalaba'],
    park: 'Parque Mahuida (Piedemonte)',
    topographyType: 'mountain'
  },
  maipú: {
    lat: -33.5106,
    lng: -70.7572,
    mainRoads: ['Av. Pajaritos', 'Av. 5 de Abril', 'Camino a Melipilla'],
    park: 'Cerro Primo de Rivera',
    topographyType: 'flat'
  },
  'la florida': {
    lat: -33.5227,
    lng: -70.5983,
    mainRoads: ['Av. Vicuña Mackenna', 'Av. La Florida', 'Av. Departamental'],
    park: 'Parque Quebrada de Macul',
    topographyType: 'mountain'
  },
  'viña del mar': {
    lat: -33.0245,
    lng: -71.5518,
    mainRoads: ['Avenida Libertad', 'Avenida Marina', '1 Norte', 'Avenida Álvarez'],
    park: 'Quinta Vergara',
    waterBody: 'Océano Pacífico (Bahía)',
    topographyType: 'coastal'
  },
  valparaíso: {
    lat: -33.0472,
    lng: -71.6127,
    mainRoads: ['Avenida Errázuriz', 'Avenida Brasil', 'Avenida Pedro Montt', 'Subida Cumming'],
    park: 'Cerro Alegre (Paseo Yugoslavo)',
    waterBody: 'Bahía de Valparaíso',
    topographyType: 'coastal'
  },
  concepción: {
    lat: -36.8201,
    lng: -73.0444,
    mainRoads: ['Avenida O’Higgins', 'Avenida Chacabuco', 'Paicaví', 'Prat'],
    park: 'Parque Ecuador (Cerro Caracol)',
    waterBody: 'Río Biobío',
    topographyType: 'river-valley'
  }
};

export default function DispatchMap({ address, commune, city, orderId }: DispatchMapProps) {
  const [zoom, setZoom] = useState<number>(1.5);
  const [panning, setPanning] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });

  // Resolve approximate coordinates based on Address Comunes / Cities
  const mapData = useMemo<CoordinateInfo>(() => {
    const cleanCommune = commune.trim().toLowerCase();
    const cleanCity = city.trim().toLowerCase();

    // Check commune mapping first (fine-grained)
    if (COMMUNE_COORDS[cleanCommune]) {
      return COMMUNE_COORDS[cleanCommune];
    }
    
    // Check city mapping (broader)
    if (COMMUNE_COORDS[cleanCity]) {
      return COMMUNE_COORDS[cleanCity];
    }

    // Default: Viña del Mar coords (tienda principal), generate roads programmatically based on the address
    const hash = address.length + commune.length;
    return {
      lat: -33.0245 + (hash % 10 - 5) * 0.005,
      lng: -71.5518 + (hash % 7 - 3) * 0.005,
      mainRoads: [
        address.split(' ')[0] || 'Avenida Libertad',
        '1 Norte (Conexión Taller)',
        'Avenida Marina',
        'Avenida Álvarez'
      ],
      park: 'Quinta Vergara',
      waterBody: 'Océano Pacífico (Bahía)',
      topographyType: 'coastal'
    };
  }, [address, commune, city]);

  const fullAddress = `${address}, ${commune}, ${city}, Chile`;
  const googleMapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(fullAddress)}`;

  // SVG grid custom seed based on address length to keep the generated layout deterministic per address
  const streetLines = useMemo(() => {
    const lines = [];
    const seed = address.length + orderId.charCodeAt(orderId.length - 1 || 0);
    
    // Grid horizontal & vertical lines representing blocks
    for (let i = -15; i <= 15; i++) {
      const offset = i * 40 + (seed % 15);
      // skew vertical lines slightly for realistic street patterns
      lines.push({
        id: `v-${i}`,
        x1: offset,
        y1: -400,
        x2: offset + (seed % 5 - 2) * 5,
        y2: 400,
        thickness: Math.abs(i) % 4 === 0 ? 2.5 : 1
      });
      lines.push({
        id: `h-${i}`,
        x1: -400,
        y1: offset,
        x2: 400,
        y2: offset + (seed % 6 - 3) * 4,
        thickness: Math.abs(i) % 3 === 0 ? 2.5 : 1
      });
    }

    // Generate avenues with thicker weight
    const avenues = [
      { id: 'ave1', x1: -500, y1: -80, x2: 500, y2: -45, stroke: 'rgba(181, 132, 85, 0.25)', thickness: 5.5, label: mapData.mainRoads[0] },
      { id: 'ave2', x1: -160, y1: -500, x2: -90, y2: 500, stroke: 'rgba(181, 132, 85, 0.25)', thickness: 5.5, label: mapData.mainRoads[1] },
    ];
    if (mapData.mainRoads[2]) {
      avenues.push({ id: 'ave3', x1: -500, y1: 120, x2: 500, y2: 150, stroke: 'rgba(82, 71, 66, 0.15)', thickness: 4, label: mapData.mainRoads[2] });
    }

    return { lines, avenues };
  }, [address, orderId, mapData]);

  // Handle Drag / Pan mechanics
  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
    setDragStart({ x: e.clientX - panning.x, y: e.clientY - panning.y });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return;
    setPanning({
      x: e.clientX - dragStart.x,
      y: e.clientY - dragStart.y
    });
  };

  const handleMouseUpOrLeave = () => {
    setIsDragging(false);
  };

  return (
    <div className="border border-bananur-sand/80 bg-[#FCFBF7] rounded-3xl p-5 space-y-4 shadow-xs" id={`dispatch-map-${orderId}`}>
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
        <div>
          <span className="text-[10px] uppercase font-mono font-bold text-bananur-gold-dark flex items-center gap-1">
            <Globe className="w-3.5 h-3.5" /> Planimetría de Despacho de Autor
          </span>
          <h4 className="font-serif text-sm font-bold text-[#2D2522] mt-0.5">
            Geolocalización Estimada del Pedido
          </h4>
        </div>
        <div className="flex items-center gap-1.5 self-end sm:self-auto">
          {/* Zoom controls */}
          <button
            type="button"
            onClick={() => setZoom(prev => Math.min(prev + 0.3, 3.5))}
            className="p-1.5 rounded-lg bg-white border border-bananur-sand/80 hover:bg-bananur-sand/20 text-bananur-clay hover:text-black transition-all cursor-pointer"
            title="Acercar mapa"
          >
            <ZoomIn className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            onClick={() => setZoom(prev => Math.max(prev - 0.3, 0.8))}
            className="p-1.5 rounded-lg bg-white border border-bananur-sand/80 hover:bg-bananur-sand/20 text-bananur-clay hover:text-black transition-all cursor-pointer"
            title="Alejar mapa"
          >
            <ZoomOut className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            onClick={() => {
              setZoom(1.5);
              setPanning({ x: 0, y: 0 });
            }}
            className="p-1.5 rounded-lg bg-white border border-bananur-sand/80 hover:bg-bananur-sand/20 text-bananur-clay hover:text-black transition-all cursor-pointer font-mono text-[10px] px-2"
            title="Centrar"
          >
            Reset
          </button>
        </div>
      </div>

      {/* Actual SVG Map Stage Context Container */}
      <div 
        className="relative h-48 sm:h-56 bg-[#FAF7F1] rounded-2xl border border-bananur-sand/60 overflow-hidden cursor-grab active:cursor-grabbing select-none"
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUpOrLeave}
        onMouseLeave={handleMouseUpOrLeave}
      >
        <div 
          className="absolute inset-0 transition-transform duration-75 ease-out"
          style={{ transform: `translate(${panning.x}px, ${panning.y}px) scale(${zoom})` }}
        >
          {/* Compass grid coordinate lines */}
          <div className="absolute inset-0 flex items-center justify-center opacity-10 pointer-events-none">
            <div className="w-[800px] h-[800px] rounded-full border border-dashed border-[#524742]" />
            <div className="absolute w-[600px] h-[600px] rounded-full border border-dashed border-[#524742]" />
            <div className="absolute w-[400px] h-[400px] rounded-full border border-[#524742]" />
            <div className="absolute w-[200px] h-[200px] rounded-full border border-[#524742]" />
          </div>

          <svg 
            width="100%" 
            height="100%" 
            viewBox="-200 -120 400 240" 
            className="absolute inset-0 overflow-visible pointer-events-none"
          >
            {/* 1. Draw topography styling based on commune context */}
            {mapData.topographyType === 'coastal' && (
              // Water Bay Layer
              <path 
                d="M -500 -500 L -120 -500 C -120 -500 -80 -200 -220 -50 C -360 100 -280 300 -320 500 L -500 500 Z" 
                fill="rgba(186, 215, 233, 0.45)"
                stroke="rgba(186, 215, 233, 0.8)"
                strokeWidth="2"
              />
            )}

            {mapData.topographyType === 'river-valley' && mapData.waterBody && (
              // Diagonal scrolling elegant Mapocho river vector
              <path 
                d="M -500 -180 Q -200 -100 100 -20 T 500 30" 
                fill="none" 
                stroke="rgba(155, 190, 200, 0.5)" 
                strokeWidth="18" 
                strokeLinecap="round"
              />
            )}

            {mapData.park && (
              // Green Area Patch (Deterministic ellipse away from marker to avoid overlay block)
              <ellipse 
                cx={mapData.topographyType === 'mountain' ? 120 : -90} 
                cy={mapData.topographyType === 'mountain' ? -80 : 70} 
                rx="65" 
                ry="40" 
                fill="rgba(187, 214, 184, 0.4)" 
                stroke="rgba(187, 214, 184, 0.7)" 
                strokeWidth="1"
              />
            )}

            {/* 2. Secondary urban block streets */}
            {streetLines.lines.map(line => (
              <line
                key={line.id}
                x1={line.x1}
                y1={line.y1}
                x2={line.x2}
                y2={line.y2}
                stroke="rgba(82, 71, 66, 0.08)"
                strokeWidth={line.thickness}
              />
            ))}

            {/* 3. Main Avenues with dynamic text labels */}
            {streetLines.avenues.map(ave => (
              <g key={ave.id}>
                <line
                  x1={ave.x1}
                  y1={ave.y1}
                  x2={ave.x2}
                  y2={ave.y2}
                  stroke={ave.stroke}
                  strokeWidth={ave.thickness}
                  strokeLinecap="round"
                />
                <text
                  x={(ave.x1 + ave.x2) / 2}
                  y={(ave.y1 + ave.y2) / 2 - 6}
                  fill="rgba(82, 71, 66, 0.6)"
                  fontSize="7"
                  fontFamily="monospace"
                  textAnchor="middle"
                  transform={`rotate(${(Math.atan2(ave.y2 - ave.y1, ave.x2 - ave.x1) * 180) / Math.PI}, ${(ave.x1 + ave.x2) / 2}, ${(ave.y1 + ave.y2) / 2 - 6})`}
                >
                  {ave.label}
                </text>
              </g>
            ))}

            {/* Park labeling text */}
            {mapData.park && (
              <text
                x={mapData.topographyType === 'mountain' ? 120 : -90}
                y={mapData.topographyType === 'mountain' ? -80 : 75}
                fill="rgba(100, 130, 90, 0.75)"
                fontSize="6.5"
                fontWeight="500"
                fontFamily="sans-serif"
                textAnchor="middle"
              >
                🌳 {mapData.park}
              </text>
            )}

            {/* Coastal labeling text */}
            {mapData.topographyType === 'coastal' && mapData.waterBody && (
              <text
                x="-190"
                y="-100"
                fill="rgba(55, 95, 120, 0.6)"
                fontSize="7"
                fontFamily="sans-serif"
                fontWeight="bold"
                textAnchor="middle"
                transform="rotate(-75, -190, -100)"
              >
                ⚓ {mapData.waterBody}
              </text>
            )}

            {/* River labeling text */}
            {mapData.topographyType === 'river-valley' && mapData.waterBody && (
              <text
                x="80"
                y="-3"
                fill="rgba(100, 140, 150, 0.7)"
                fontSize="6"
                fontFamily="monospace"
                fontWeight="bold"
                textAnchor="middle"
                transform="rotate(6, 80, -3)"
              >
                💧 {mapData.waterBody}
              </text>
            )}

            {/* Coordinates crosshairs marking the target centroid */}
            <line x1="-20" y1="0" x2="20" y2="0" stroke="rgba(181, 132, 85, 0.4)" strokeWidth="1" strokeDasharray="3,3" />
            <line x1="0" y1="-20" x2="0" y2="20" stroke="rgba(181, 132, 85, 0.4)" strokeWidth="1" strokeDasharray="3,3" />

            {/* Target Marker Pin with pulsating radar elements */}
            <g transform="translate(0, 0)" className="cursor-pointer">
              {/* Pulsating outer sonar ripple */}
              <circle cx="0" cy="0" r="14" fill="none" stroke="rgba(181, 132, 85, 0.3)" strokeWidth="1.5">
                <animate attributeName="r" values="8;18;8" dur="2.4s" repeatCount="indefinite" />
                <animate attributeName="opacity" values="0.8;0;0.8" dur="2.4s" repeatCount="indefinite" />
              </circle>
              {/* Secondary ripple */}
              <circle cx="0" cy="0" r="28" fill="none" stroke="rgba(181, 132, 85, 0.15)" strokeWidth="1">
                <animate attributeName="r" values="16;34;16" dur="3s" repeatCount="indefinite" />
                <animate attributeName="opacity" values="0.7;0;0.7" dur="3s" repeatCount="indefinite" />
              </circle>
              {/* Inner core marker anchor */}
              <circle cx="0" cy="0" r="4" fill="#2D2522" />
              {/* Pin body */}
              <path
                d="M 0 0 C -5 -8 -8 -15 -8 -22 C -8 -27 -4 -31 0 -31 C 4 -31 8 -27 8 -22 C 8 -15 5 -8 0 0 Z"
                fill="#B58455"
                stroke="#2D2522"
                strokeWidth="1.5"
              />
              {/* Pin inner accent dot */}
              <circle cx="0" cy="-22" r="2.8" fill="white" />
            </g>
          </svg>
        </div>

        {/* Map layout cosmetic overlays (compass, dynamic scales) */}
        <div className="absolute bottom-3 left-3 bg-[#2D2522]/90 backdrop-blur-md px-2 py-1 rounded text-[9px] font-mono text-white flex items-center gap-1 border border-white/10 shadow-sm pointer-events-none">
          <Compass className="w-3 h-3 text-bananur-gold animate-spin-slow" style={{ animationDuration: '8s' }} />
          <span>SUDAMÉRICA / CHILE (UTC-4)</span>
        </div>

        <div className="absolute top-3 right-3 bg-white/95 backdrop-blur-md px-2.5 py-1.5 rounded-xl text-[10px] text-bananur-clay border border-bananur-sand/50 shadow-md pointer-events-none font-sans flex items-center gap-1">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
          <span>Despacho Programado</span>
        </div>

        <div className="absolute bottom-3 right-3 bg-[#FAF7F1]/95 px-2 py-0.5 rounded border border-bananur-sand/80 text-[8px] font-mono text-bananur-clay pointer-events-none">
          Escala Vectorial: ~1:15.000
        </div>
      </div>

      {/* Geofencing feedback information pane */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="bg-[#FAF8F5]/60 border border-bananur-sand/40 p-3 rounded-xl">
          <span className="block text-[9px] text-[#524742]/60 uppercase font-mono tracking-wider">Altas de Registro:</span>
          <p className="font-bold font-mono text-bananur-clay text-[11px] mt-0.5 whitespace-nowrap">
            {mapData.lat.toFixed(4)}° S, {mapData.lng.toFixed(4)}° W
          </p>
        </div>
        <div className="bg-[#FAF8F5]/60 border border-bananur-sand/40 p-3 rounded-xl">
          <span className="block text-[9px] text-[#524742]/60 uppercase font-mono tracking-wider">Zonificación Courier:</span>
          <p className="font-semibold text-bananur-clay text-[11px] mt-0.5 flex items-center gap-1 truncate">
            <span className="inline-block w-2 h-2 rounded bg-bananur-gold"></span>
            {city.toLowerCase().includes('viña') || commune.toLowerCase().includes('viña')
              ? `${commune}, Región de Valparaíso`
              : city === commune 
                ? (city.toLowerCase().includes('santiago') ? `${city} R.M.` : `${city}`) 
                : `${commune}, ${city}`}
          </p>
        </div>
        <div className="flex items-center">
          <a
            href={googleMapsUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full text-center py-2.5 px-3 bg-[#2D2522] hover:bg-bananur-gold text-[#FCFBF7] hover:text-[#2D2522] font-semibold text-xs rounded-xl flex items-center justify-center gap-1.5 transition-all cursor-pointer shadow-3xs"
          >
            <span>Ver Dirección Real</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </a>
        </div>
      </div>
    </div>
  );
}
