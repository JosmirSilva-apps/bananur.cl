import { 
  LayoutDashboard, 
  Package, 
  ReceiptText, 
  CalendarDays, 
  Settings, 
  LogOut, 
  ChevronLeft, 
  ChevronRight,
  MonitorCheck,
  Building2,
  Wrench,
  Layers,
  Coins,
  Users,
  ShoppingCart,
  Palette,
  Scan,
  Mail
} from 'lucide-react';
import { useState } from 'react';

interface AdminSidebarProps {
  currentAdminView: string;
  onNavigateAdmin: (view: string) => void;
  onExitAdmin: () => void;
  adminEmail: string;
  onOpenScanner?: () => void;
}

export default function AdminSidebar({
  currentAdminView,
  onNavigateAdmin,
  onExitAdmin,
  adminEmail,
  onOpenScanner
}: AdminSidebarProps) {
  const [isCollapsed, setIsCollapsed] = useState(() => {
    if (typeof window !== 'undefined') {
      return window.innerWidth < 1024;
    }
    return false;
  });

  const menuItems = [
    { id: 'dashboard', label: 'Inicio', icon: LayoutDashboard },
    { id: 'ventas', label: 'Ventas', icon: Coins },
    { id: 'produccion', label: 'Producción', icon: Wrench },
    { id: 'insumos', label: 'Insumos', icon: Layers },
    { id: 'clientes_proveedores', label: 'Clientes y Proveedores', icon: Users },
    { id: 'inventario', label: 'Catálogo Web', icon: Package },
    { id: 'compras', label: 'Compras', icon: ShoppingCart },
    { id: 'agenda', label: 'Agenda', icon: CalendarDays },
    { id: 'correo', label: 'Correo Corporativo', icon: Mail },
    { id: 'personalizador', label: 'Personalización', icon: Palette },
    { id: 'configuracion', label: 'Ajustes', icon: Settings },
  ];

  return (
    <aside 
      className={`bg-bananur-clay text-bananur-cream min-h-screen flex flex-col transition-all duration-300 border-r border-white/10 z-30 sticky top-0 ${
        isCollapsed ? 'w-20' : 'w-72'
      }`}
    >
      {/* Top Brand Logo */}
      <div className="h-20 flex items-center justify-between px-6 border-b border-white/10">
        {!isCollapsed && (
          <div className="flex flex-col">
            <span className="font-serif text-xl font-bold tracking-tight text-white flex items-center gap-1">
              Bananur <span className="text-bananur-gold text-xs font-mono font-medium tracking-widest uppercase bg-white/10 px-1.5 py-0.5 rounded">ADMIN</span>
            </span>
            <span className="text-[10px] text-bananur-sand/50 font-mono truncate max-w-[150px]" title={adminEmail}>
              {adminEmail}
            </span>
          </div>
        )}
        {isCollapsed && (
          <span className="font-serif text-xl font-bold tracking-wider text-bananur-gold mx-auto">
            B<span className="text-white">.</span>
          </span>
        )}
        <button
          id="admin-sidebar-toggle"
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="p-1.5 h-7 w-7 bg-white/10 hover:bg-bananur-gold hover:text-bananur-clay rounded-md transition-colors flex items-center justify-center cursor-pointer"
        >
          {isCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
        </button>
      </div>

      {/* Quick Scanner Action Button */}
      {onOpenScanner && (
        <div className="p-3 pb-0">
          <button
            type="button"
            id="admin-sidebar-btn-scanner"
            onClick={onOpenScanner}
            className={`w-full flex items-center gap-3 p-3 rounded-2xl bg-gradient-to-r from-amber-600/30 to-amber-500/20 hover:from-amber-600/40 hover:to-amber-500/30 text-amber-200 border border-amber-500/40 shadow-xs transition-all cursor-pointer ${
              isCollapsed ? 'justify-center px-0' : ''
            }`}
            title="Abrir Escáner de Código Único / Barcode"
          >
            <Scan className="w-5 h-5 text-bananur-gold shrink-0 animate-pulse" />
            {!isCollapsed && (
              <div className="text-left">
                <span className="text-xs font-bold font-mono tracking-wider text-white block">
                  ESCANEAR CÓDIGO
                </span>
                <span className="text-[9px] text-amber-200/80 font-mono block">
                  Inventario & Venta Directa
                </span>
              </div>
            )}
          </button>
        </div>
      )}

      {/* Navigation menu list */}
      <nav className="flex-1 p-4 space-y-1.5 overflow-y-auto scrollbar-hidden">
        {menuItems.map((item) => {
          const isActive = currentAdminView === item.id || (item.id === 'dashboard' && currentAdminView.startsWith('erp-'));
          const Icon = item.icon;
          return (
            <button
              id={`admin-sidebar-nav-${item.id}`}
              key={item.id}
              onClick={() => onNavigateAdmin(item.id)}
              className={`w-full flex items-center gap-4.5 p-3.5 rounded-xl text-left transition-all cursor-pointer ${
                isActive 
                  ? 'bg-bananur-gold text-bananur-clay font-semibold shadow-inner' 
                  : 'text-bananur-sand/80 hover:text-white hover:bg-white/5'
              }`}
              title={isCollapsed ? item.label : undefined}
            >
              <Icon className="w-5 h-5 flex-shrink-0" />
              {!isCollapsed && <span className="text-sm tracking-wide">{item.label}</span>}
            </button>
          );
        })}
      </nav>

      {/* Bottom controls */}
      <div className="p-4 border-t border-white/10 space-y-2">
        {/* Toggle to Public Site */}
        <button
          id="admin-sidebar-btn-exit"
          onClick={onExitAdmin}
          className="w-full flex items-center gap-4.5 p-3.5 text-left text-bananur-sand/80 hover:text-white hover:bg-white/5 rounded-xl transition-all cursor-pointer"
          title={isCollapsed ? 'Ir a Tienda' : undefined}
        >
          <MonitorCheck className="w-5 h-5 flex-shrink-0 text-bananur-gold" />
          {!isCollapsed && <span className="text-xs font-semibold">Ir a Tienda</span>}
        </button>

        {/* Log Out */}
        <button
          id="admin-sidebar-btn-logout"
          onClick={onExitAdmin} // Just returns to public
          className="w-full flex items-center gap-4.5 p-3.5 text-left text-rose-300 hover:text-white hover:bg-rose-950/40 rounded-xl transition-all cursor-pointer"
          title={isCollapsed ? 'Salir de Admin' : undefined}
        >
          <LogOut className="w-5 h-5 flex-shrink-0" />
          {!isCollapsed && <span className="text-xs font-semibold">Cerrar Sesión</span>}
        </button>
      </div>

    </aside>
  );
}
