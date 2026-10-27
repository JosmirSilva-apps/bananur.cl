import { Search, ShoppingBag, User, Sparkles, Menu, X } from 'lucide-react';
import { useState } from 'react';

interface HeaderProps {
  currentView: string;
  onNavigate: (view: string) => void;
  cartCount: number;
  onToggleCart: () => void;
  onToggleSearch: () => void;
  isLoggedIn: boolean;
  onLogoutAdmin?: () => void;
  customPages?: { id: string; title: string; enabled: boolean }[];
}

export default function Header({
  currentView,
  onNavigate,
  cartCount,
  onToggleCart,
  onToggleSearch,
  isLoggedIn,
  customPages = []
}: HeaderProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const baseNavItems = [
    { label: 'Tienda', view: 'tienda' },
    { label: 'Servicios', view: 'servicios' },
    { label: 'Portafolio', view: 'portafolio' },
    { label: 'Nosotros', view: 'nosotros' },
    { label: 'Contacto', view: 'contacto' }
  ];

  // Dynamically append enabled custom pages to client navbar!
  const navItems = [
    ...baseNavItems,
    ...customPages
      .filter(p => p.enabled)
      .map(p => ({ label: p.title, view: p.id }))
  ];

  const handleNavClick = (view: string) => {
    onNavigate(view);
    setMobileMenuOpen(false);
  };

  return (
    <header className="sticky top-0 z-40 bg-bananur-cream/95 backdrop-blur-md border-b border-bananur-sand/40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          
          {/* Logo */}
          <div className="flex items-center cursor-pointer" onClick={() => handleNavClick('home')}>
            <span className="font-serif text-3xl font-bold tracking-tight text-bananur-clay flex items-center gap-1.5 hover:text-bananur-gold transition-colors">
              Bananur<span className="text-bananur-gold text-lg">.</span>
            </span>
          </div>

          {/* Core Desktop Nav */}
          <nav className="hidden md:flex space-x-8">
            {navItems.map((item) => {
              const isActive = currentView === item.view;
              return (
                <button
                  id={`nav-item-${item.view}`}
                  key={item.view}
                  onClick={() => handleNavClick(item.view)}
                  className={`text-sm tracking-wide font-medium relative py-1.5 transition-colors duration-200 cursor-pointer ${
                    isActive 
                      ? 'text-bananur-clay border-b-2 border-bananur-gold' 
                      : 'text-bananur-clay-light hover:text-bananur-gold'
                  }`}
                >
                  {item.label}
                </button>
              );
            })}
          </nav>

          {/* Action Icons */}
          <div className="flex items-center space-x-4">
            {/* Search Trigger */}
            <button
              id="header-btn-search"
              onClick={onToggleSearch}
              title="Buscar productos o servicios"
              className="p-2 text-bananur-clay-light hover:text-bananur-gold hover:bg-bananur-sand/30 rounded-full transition-all cursor-pointer"
            >
              <Search className="w-5 h-5" />
            </button>

            {/* Account / Workspace Switcher */}
            <button
              id="header-btn-account"
              onClick={() => handleNavClick(isLoggedIn ? 'cuenta' : 'login')}
              title={isLoggedIn ? 'Mi Cuenta' : 'Iniciar sesión'}
              className={`p-2 rounded-full transition-all cursor-pointer flex items-center gap-1 ${
                isLoggedIn 
                  ? 'text-bananur-sage bg-bananur-sage-light/60 hover:bg-bananur-sage-light' 
                  : 'text-bananur-clay-light hover:text-bananur-gold hover:bg-bananur-sand/30'
              }`}
            >
              <User className="w-5 h-5" />
              {isLoggedIn && <span className="w-2 h-2 rounded-full bg-bananur-sage block"></span>}
            </button>

            {/* Cart Slide-Over Trigger */}
            <button
              id="header-btn-cart"
              onClick={onToggleCart}
              className="p-2 relative text-bananur-clay bg-bananur-sand/40 hover:bg-bananur-sand/75 rounded-full duration-150 transition-all cursor-pointer"
            >
              <ShoppingBag className="w-5 h-5" />
              {cartCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-bananur-coral text-white font-mono text-[10px] font-bold w-5 h-5 rounded-full flex items-center justify-center animate-pulse">
                  {cartCount}
                </span>
              )}
            </button>

            {/* Quick Cotizar button (editorial accents) */}
            <button
              id="header-btn-cotizar"
              onClick={() => handleNavClick('cotizar')}
              className="hidden lg:flex items-center gap-1.5 bg-bananur-clay text-bananur-cream px-4 py-2 rounded-full text-xs font-semibold hover:bg-bananur-gold hover:text-bananur-clay transition-all shadow-sm cursor-pointer"
            >
              <Sparkles className="w-3.5 h-3.5" />
              Cotizar Proyecto
            </button>

            {/* Mobile Menu Toggle */}
            <button
              id="header-btn-mobile-menu"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 text-bananur-clay-light hover:text-bananur-gold"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>

        </div>
      </div>

      {/* Mobile Menu Panel */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-bananur-cream border-b border-bananur-sand px-4 py-4 space-y-3 animate-fade-in">
          {navItems.map((item) => (
            <button
              id={`mobile-nav-${item.view}`}
              key={item.view}
              onClick={() => handleNavClick(item.view)}
              className={`block w-full text-left py-2 px-3 rounded-lg font-medium text-base transition-colors ${
                currentView === item.view 
                  ? 'bg-bananur-sand text-bananur-clay font-semibold' 
                  : 'text-bananur-clay-light hover:bg-bananur-sand/40'
              }`}
            >
              {item.label}
            </button>
          ))}
          <button
            id="mobile-nav-cotizar"
            onClick={() => handleNavClick('cotizar')}
            className="w-full flex items-center justify-center gap-2 bg-bananur-clay text-bananur-cream py-3 rounded-xl font-medium text-sm transition-colors"
          >
            <Sparkles className="w-4 h-4" />
            Cotizar Proyecto
          </button>
        </div>
      )}
    </header>
  );
}
