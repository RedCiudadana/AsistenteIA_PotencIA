import { useState } from 'react';
import {
  Home, Bot, FileText, BarChart2, Shield, Settings, Lightbulb,
  Menu, X, ChevronDown,
  Twitter, Facebook, Youtube, Linkedin, Instagram,
  LogOut, ShieldCheck,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { ROLE_LABELS, ROLE_COLORS } from '../lib/permissions';

export type Section = 'home' | 'assistant' | 'documents' | 'stats' | 'privacy' | 'settings' | 'usecases';

const ADMIN_SECTIONS: Section[] = ['stats', 'privacy', 'settings'];

const MAIN_NAV_ITEMS: { icon: typeof Home; label: string; section: Section }[] = [
  { icon: Home,      label: 'Inicio',       section: 'home'      },
  { icon: Bot,       label: 'Asistente IA', section: 'assistant' },
  { icon: Lightbulb, label: 'Casos de uso', section: 'usecases'  },
  { icon: FileText,  label: 'Documentos',   section: 'documents' },
];

const ADMIN_NAV_ITEMS: { icon: typeof Home; label: string; section: Section }[] = [
  { icon: BarChart2, label: 'Estadísticas', section: 'stats'    },
  { icon: Shield,    label: 'Privacidad',   section: 'privacy'  },
  { icon: Settings,  label: 'Ajustes',      section: 'settings' },
];

const SOCIAL_LINKS = [
  { Icon: Twitter,   label: 'Twitter/X', href: 'https://twitter.com/redxguate' },
  { Icon: Facebook,  label: 'Facebook',  href: 'https://www.facebook.com/Redciudadanagt' },
  { Icon: Instagram, label: 'Instagram', href: 'https://www.instagram.com/redxguate/' },
  { Icon: Youtube,   label: 'YouTube',   href: '#' },
  { Icon: Linkedin,  label: 'LinkedIn',  href: 'https://www.linkedin.com/company/2532725/' },
];

interface NavbarProps {
  active: Section;
  onNavigate: (section: Section) => void;
  onLoginClick?: () => void;
}

export default function Navbar({ active, onNavigate, onLoginClick }: NavbarProps) {
  const { user, role, session, signOut, canAccess } = useAuth();
  const [mobileOpen, setMobileOpen]   = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showAdminMenu, setShowAdminMenu] = useState(false);
  const [mobileAdminOpen, setMobileAdminOpen] = useState(false);

  const visibleMain = session
    ? MAIN_NAV_ITEMS.filter((item) => canAccess(item.section))
    : MAIN_NAV_ITEMS.filter((item) => item.section === 'home' || item.section === 'usecases');

  const visibleAdmin = session
    ? ADMIN_NAV_ITEMS.filter((item) => canAccess(item.section))
    : [];

  const isAdminActive = ADMIN_SECTIONS.includes(active);

  const displayName = (user?.user_metadata?.full_name as string | undefined)
    || user?.email?.split('@')[0]
    || 'Usuario';

  const roleColors = role ? ROLE_COLORS[role] : ROLE_COLORS.analista;

  function navigate(section: Section) {
    onNavigate(section);
    setMobileOpen(false);
    setShowAdminMenu(false);
    setMobileAdminOpen(false);
  }

  async function handleSignOut() {
    setShowUserMenu(false);
    await signOut();
  }

  return (
    <header className="flex-shrink-0 z-30 relative">
      {/* ── Social strip ── */}
      <div className="bg-[#0d2240] h-9 flex items-center px-6 gap-4">
        <div className="hidden sm:flex items-center gap-2">
          <img
            src="data:image/png;base64,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"
            alt="Red Ciudadana"
            className="h-4 w-auto opacity-80"
          />
          <span className="text-white/50 text-xs">Sitio oficial de la Asociacion Civil Red Ciudadana</span>
        </div>
        <div className="flex items-center gap-1 ml-auto">
          <span className="text-white/30 text-xs mr-2 hidden md:block">Síguenos</span>
          {SOCIAL_LINKS.map(({ Icon, label, href }) => (
            <a
              key={label}
              href={href}
              aria-label={label}
              className="w-7 h-7 rounded-md flex items-center justify-center text-white/50 hover:text-white hover:bg-white/10 transition-all duration-150"
            >
              <Icon size={14} />
            </a>
          ))}
        </div>
      </div>

      {/* ── Main nav ── */}
      <nav className="bg-white border-b border-gray-200 shadow-sm h-14 flex items-center px-4 sm:px-6 gap-4">
        {/* Logo */}
        <button
          onClick={() => navigate('home')}
          className="flex items-center hover:opacity-80 transition-opacity flex-shrink-0"
          aria-label="Ir al inicio"
        >
          <img
            src="https://redciudadana.org/logo_red_ciudadana.png"
            alt="Red Ciudadana"
            className="h-10 w-auto max-w-[150px] object-contain"
          />
        </button>

        <div className="hidden lg:block w-px h-6 bg-gray-200 flex-shrink-0" />

        {/* Desktop nav */}
        <div className="hidden lg:flex items-center gap-0.5 flex-1">
          {visibleMain.map(({ icon: Icon, label, section }) => {
            const isActive = active === section;
            return (
              <button
                key={section}
                onClick={() => navigate(section)}
                className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-150 ${
                  isActive ? 'bg-[#0d2240] text-white' : 'text-gray-600 hover:text-[#0d2240] hover:bg-gray-100'
                }`}
              >
                <Icon size={15} className={isActive ? 'text-[#3b82f6]' : ''} />
                <span>{label}</span>
              </button>
            );
          })}

          {/* Administración dropdown */}
          {visibleAdmin.length > 0 && (
            <div className="relative">
              <button
                onClick={() => setShowAdminMenu((v) => !v)}
                className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-150 ${
                  isAdminActive ? 'bg-[#0d2240] text-white' : 'text-gray-600 hover:text-[#0d2240] hover:bg-gray-100'
                }`}
              >
                <ShieldCheck size={15} className={isAdminActive ? 'text-[#3b82f6]' : ''} />
                <span>Administración</span>
                <ChevronDown size={13} className={`transition-transform duration-150 ${showAdminMenu ? 'rotate-180' : ''}`} />
              </button>

              {showAdminMenu && (
                <>
                  <div className="fixed inset-0 z-40" onClick={() => setShowAdminMenu(false)} />
                  <div className="absolute left-0 top-full mt-1.5 w-48 bg-white rounded-2xl border border-gray-200 shadow-lg z-50 overflow-hidden py-1">
                    {visibleAdmin.map(({ icon: Icon, label, section }) => {
                      const isActive = active === section;
                      return (
                        <button
                          key={section}
                          onClick={() => navigate(section)}
                          className={`w-full flex items-center gap-2.5 px-4 py-2.5 text-sm font-medium transition-colors ${
                            isActive
                              ? 'bg-[#f0f5ff] text-[#0d2240]'
                              : 'text-gray-700 hover:bg-gray-50 hover:text-[#0d2240]'
                          }`}
                        >
                          <Icon size={15} className={isActive ? 'text-[#2563eb]' : 'text-gray-400'} />
                          {label}
                          {isActive && <span className="ml-auto w-1.5 h-1.5 bg-[#2563eb] rounded-full" />}
                        </button>
                      );
                    })}
                  </div>
                </>
              )}
            </div>
          )}
        </div>

        {/* Medium screens: icon-only nav */}
        <div className="hidden md:flex lg:hidden items-center gap-0.5 flex-1">
          {visibleMain.map(({ icon: Icon, label, section }) => {
            const isActive = active === section;
            return (
              <button
                key={section}
                onClick={() => navigate(section)}
                title={label}
                className={`flex items-center justify-center w-9 h-9 rounded-lg transition-all duration-150 ${
                  isActive ? 'bg-[#0d2240] text-white' : 'text-gray-500 hover:text-[#0d2240] hover:bg-gray-100'
                }`}
              >
                <Icon size={17} />
              </button>
            );
          })}

          {visibleAdmin.length > 0 && (
            <div className="relative">
              <button
                onClick={() => setShowAdminMenu((v) => !v)}
                title="Administración"
                className={`flex items-center justify-center w-9 h-9 rounded-lg transition-all duration-150 ${
                  isAdminActive ? 'bg-[#0d2240] text-white' : 'text-gray-500 hover:text-[#0d2240] hover:bg-gray-100'
                }`}
              >
                <ShieldCheck size={17} />
              </button>

              {showAdminMenu && (
                <>
                  <div className="fixed inset-0 z-40" onClick={() => setShowAdminMenu(false)} />
                  <div className="absolute left-0 top-full mt-1.5 w-48 bg-white rounded-2xl border border-gray-200 shadow-lg z-50 overflow-hidden py-1">
                    {visibleAdmin.map(({ icon: Icon, label, section }) => {
                      const isActive = active === section;
                      return (
                        <button
                          key={section}
                          onClick={() => navigate(section)}
                          className={`w-full flex items-center gap-2.5 px-4 py-2.5 text-sm font-medium transition-colors ${
                            isActive ? 'bg-[#f0f5ff] text-[#0d2240]' : 'text-gray-700 hover:bg-gray-50 hover:text-[#0d2240]'
                          }`}
                        >
                          <Icon size={15} className={isActive ? 'text-[#2563eb]' : 'text-gray-400'} />
                          {label}
                          {isActive && <span className="ml-auto w-1.5 h-1.5 bg-[#2563eb] rounded-full" />}
                        </button>
                      );
                    })}
                  </div>
                </>
              )}
            </div>
          )}
        </div>

        {/* Right: auth */}
        <div className="flex items-center gap-2 ml-auto flex-shrink-0">
          {!session ? (
            <button
              onClick={onLoginClick}
              className="flex items-center gap-2 bg-[#0d2240] hover:bg-[#1e3a5f] text-white text-sm font-semibold px-4 py-2 rounded-xl transition-colors"
            >
              Iniciar sesión
            </button>
          ) : (
            <>
              <div className="relative pl-2 border-l border-gray-200">
                <button
                  onClick={() => setShowUserMenu((v) => !v)}
                  className="flex items-center gap-2 rounded-xl hover:bg-gray-50 px-2 py-1.5 transition-colors"
                >
                  <div className={`w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 text-xs font-bold ${roleColors.bg} ${roleColors.text}`}>
                    {displayName.charAt(0).toUpperCase()}
                  </div>
                  <div className="hidden xl:block text-left">
                    <span className="text-xs font-semibold text-[#0d2240] block max-w-[120px] truncate leading-tight">
                      {displayName}
                    </span>
                    {role && (
                      <span className="text-[10px] text-gray-400 block">{ROLE_LABELS[role]}</span>
                    )}
                  </div>
                  <ChevronDown size={13} className="text-gray-400 hidden xl:block" />
                </button>

                {showUserMenu && (
                  <>
                    <div className="fixed inset-0 z-40" onClick={() => setShowUserMenu(false)} />
                    <div className="absolute right-0 top-full mt-2 w-56 bg-white rounded-2xl border border-gray-200 shadow-lg z-50 overflow-hidden">
                      <div className="px-4 py-3 border-b border-gray-100">
                        <p className="text-sm font-bold text-[#0d2240] truncate">{displayName}</p>
                        <p className="text-xs text-gray-400 truncate">{user?.email}</p>
                        {role && (
                          <span className={`inline-block mt-1.5 text-[10px] font-bold px-2 py-0.5 rounded-full ${roleColors.bg} ${roleColors.text}`}>
                            {ROLE_LABELS[role]}
                          </span>
                        )}
                      </div>
                      <div className="p-1">
                        <button
                          onClick={handleSignOut}
                          className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-sm text-red-600 hover:bg-red-50 transition-colors"
                        >
                          <LogOut size={15} />
                          Cerrar sesión
                        </button>
                      </div>
                    </div>
                  </>
                )}
              </div>
            </>
          )}

          <button
            onClick={() => setMobileOpen((v) => !v)}
            className="md:hidden w-9 h-9 rounded-lg flex items-center justify-center hover:bg-gray-100 text-gray-600 transition-colors"
          >
            {mobileOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </nav>

      {/* ── Mobile drawer ── */}
      {mobileOpen && (
        <>
          <div
            className="fixed inset-0 bg-black/30 backdrop-blur-sm z-40 md:hidden"
            onClick={() => setMobileOpen(false)}
          />
          <div className="absolute top-full left-0 right-0 bg-white border-b border-gray-200 shadow-lg z-50 md:hidden">
            {session ? (
              <div className="flex items-center gap-3 px-4 py-3 border-b border-gray-100">
                <div className={`w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0 ${roleColors.bg} ${roleColors.text}`}>
                  {displayName.charAt(0).toUpperCase()}
                </div>
                <div>
                  <p className="text-sm font-semibold text-[#0d2240]">{displayName}</p>
                  {role && <p className="text-xs text-gray-400">{ROLE_LABELS[role]}</p>}
                </div>
              </div>
            ) : (
              <div className="px-4 py-3 border-b border-gray-100">
                <button
                  onClick={() => { setMobileOpen(false); onLoginClick?.(); }}
                  className="w-full bg-[#0d2240] hover:bg-[#1e3a5f] text-white text-sm font-semibold py-2.5 rounded-xl transition-colors"
                >
                  Iniciar sesión
                </button>
              </div>
            )}

            <div className="px-4 py-3 space-y-1">
              {visibleMain.map(({ icon: Icon, label, section }) => {
                const isActive = active === section;
                return (
                  <button
                    key={section}
                    onClick={() => navigate(section)}
                    className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
                      isActive ? 'bg-[#0d2240] text-white' : 'text-gray-700 hover:bg-gray-100'
                    }`}
                  >
                    <Icon size={17} className={isActive ? 'text-[#3b82f6]' : 'text-gray-400'} />
                    {label}
                  </button>
                );
              })}

              {/* Administración group in mobile */}
              {visibleAdmin.length > 0 && (
                <div>
                  <button
                    onClick={() => setMobileAdminOpen((v) => !v)}
                    className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
                      isAdminActive ? 'bg-[#0d2240] text-white' : 'text-gray-700 hover:bg-gray-100'
                    }`}
                  >
                    <ShieldCheck size={17} className={isAdminActive ? 'text-[#3b82f6]' : 'text-gray-400'} />
                    <span className="flex-1 text-left">Administración</span>
                    <ChevronDown
                      size={15}
                      className={`transition-transform duration-150 ${mobileAdminOpen ? 'rotate-180' : ''} ${isAdminActive ? 'text-white/60' : 'text-gray-400'}`}
                    />
                  </button>

                  {mobileAdminOpen && (
                    <div className="ml-4 mt-1 space-y-1 border-l-2 border-gray-100 pl-3">
                      {visibleAdmin.map(({ icon: Icon, label, section }) => {
                        const isActive = active === section;
                        return (
                          <button
                            key={section}
                            onClick={() => navigate(section)}
                            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
                              isActive ? 'bg-[#f0f5ff] text-[#0d2240]' : 'text-gray-600 hover:bg-gray-50'
                            }`}
                          >
                            <Icon size={15} className={isActive ? 'text-[#2563eb]' : 'text-gray-400'} />
                            {label}
                          </button>
                        );
                      })}
                    </div>
                  )}
                </div>
              )}
            </div>

            <div className="px-4 pb-3 pt-2 border-t border-gray-100 space-y-2">
              <div className="flex items-center gap-3">
                <span className="text-xs text-gray-500">Síguenos:</span>
                {SOCIAL_LINKS.map(({ Icon, label, href }) => (
                  <a key={label} href={href} aria-label={label}
                    className="w-8 h-8 rounded-lg flex items-center justify-center text-gray-500 hover:text-[#0d2240] hover:bg-gray-100 transition-colors">
                    <Icon size={16} />
                  </a>
                ))}
              </div>
              {session && (
                <button
                  onClick={handleSignOut}
                  className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-sm text-red-600 hover:bg-red-50 transition-colors"
                >
                  <LogOut size={15} />
                  Cerrar sesión
                </button>
              )}
            </div>
          </div>
        </>
      )}
    </header>
  );
}
