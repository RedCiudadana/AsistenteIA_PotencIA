import { useState } from 'react';
import { Eye, EyeOff, Mail, Lock, User, AlertCircle, CheckCircle, ShieldCheck, Bot, FileText, BarChart2, X } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useAppSettings } from '../../context/AppSettingsContext';

type Mode = 'login' | 'register';

const ROLE_CARDS = [
  {
    icon: ShieldCheck,
    role: 'Administrador',
    color: '#1e3a5f',
    desc: 'Acceso completo: usuarios, configuración, todos los módulos.',
  },
  {
    icon: FileText,
    role: 'Coordinador de área',
    color: '#0d9488',
    desc: 'Asistente IA, documentos, flujos, estadísticas y privacidad.',
  },
  {
    icon: BarChart2,
    role: 'Analista',
    color: '#64748b',
    desc: 'Consulta el asistente, revisa documentos, flujos y estadísticas.',
  },
];

export default function LoginPage({ onClose }: { onClose?: () => void }) {
  const { signIn, signUp } = useAuth();
  const { settings }       = useAppSettings();

  const platformName    = settings?.platform_name    ?? 'Red Ciudadana';
  const platformTagline = settings?.platform_tagline ?? 'Plataforma Institucional';

  const [mode, setMode]           = useState<Mode>('login');
  const [fullName, setFullName]   = useState('');
  const [email, setEmail]         = useState('');
  const [password, setPassword]   = useState('');
  const [confirm, setConfirm]     = useState('');
  const [showPw, setShowPw]       = useState(false);
  const [loading, setLoading]     = useState(false);
  const [error, setError]         = useState('');
  const [success, setSuccess]     = useState('');

  function resetForm() {
    setFullName(''); setEmail(''); setPassword(''); setConfirm('');
    setError(''); setSuccess('');
  }

  function switchMode(m: Mode) {
    setMode(m);
    resetForm();
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(''); setSuccess('');

    if (mode === 'register') {
      if (!fullName.trim()) { setError('El nombre completo es requerido.'); return; }
      if (password.length < 6) { setError('La contraseña debe tener al menos 6 caracteres.'); return; }
      if (password !== confirm) { setError('Las contraseñas no coinciden.'); return; }
    }

    setLoading(true);

    if (mode === 'login') {
      const err = await signIn(email.trim(), password);
      if (err) setError(translateError(err));
    } else {
      const err = await signUp(email.trim(), password, fullName.trim());
      if (err) {
        setError(translateError(err));
      } else {
        setSuccess('Cuenta creada correctamente. Iniciando sesión...');
      }
    }

    setLoading(false);
  }

  return (
    <div className="min-h-screen flex">
      {/* Left panel — branding */}
      <div className="hidden lg:flex lg:w-[46%] bg-[#0d2240] flex-col justify-between p-10 relative overflow-hidden">
        {/* Background grid */}
        <div
          className="absolute inset-0 opacity-[0.04]"
          style={{
            backgroundImage: 'linear-gradient(#ffffff 1px, transparent 1px), linear-gradient(90deg, #ffffff 1px, transparent 1px)',
            backgroundSize: '32px 32px',
          }}
        />

        {/* Logo */}
        <div className="relative">
          <div className="flex items-center gap-3 mb-8">
            <div className="w-11 h-11 rounded-xl bg-white/10 flex items-center justify-center border border-white/20">
              <img
                src="https://redciudadana.org/logo_red_ciudadana.png"
                alt="Logo"
                className="w-8 h-8 object-contain"
              />
            </div>
            <div>
              <p className="text-white font-bold text-lg leading-tight">{platformName}</p>
              <p className="text-white/40 text-xs">{platformTagline}</p>
            </div>
          </div>

          <h1 className="text-3xl font-extrabold text-white leading-tight mb-3">
            Plataforma de <br />
            <span className="text-[#3b82f6]">Inteligencia Institucional</span>
          </h1>
          <p className="text-white/60 text-sm leading-relaxed max-w-sm">
            Herramienta segura para servidores públicos que centraliza documentos,
            flujos de trabajo y un asistente con inteligencia artificial.
          </p>
        </div>

        {/* Role cards */}
        <div className="relative space-y-3">
          <p className="text-white/40 text-xs font-semibold uppercase tracking-widest mb-4">
            Niveles de acceso
          </p>
          {ROLE_CARDS.map(({ icon: Icon, role, color, desc }) => (
            <div
              key={role}
              className="flex items-start gap-3 bg-white/5 border border-white/10 rounded-xl p-4"
            >
              <div
                className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
                style={{ background: `${color}40` }}
              >
                <Icon size={15} style={{ color: '#ffffff' }} />
              </div>
              <div>
                <p className="text-white text-sm font-semibold">{role}</p>
                <p className="text-white/50 text-xs mt-0.5 leading-relaxed">{desc}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Footer */}
        <div className="relative">
          <div className="flex items-center gap-2">
            <Bot size={14} className="text-[#3b82f6]" />
            <span className="text-white/30 text-xs">Impulsado por IA · Datos seguros · Cumplimiento normativo</span>
          </div>
        </div>
      </div>

      {/* Right panel — form */}
      <div className="flex-1 flex flex-col items-center justify-center p-6 bg-[#f1f4f8]">
        {/* Mobile logo */}
        <div className="lg:hidden flex items-center gap-2.5 mb-8">
          <div className="w-9 h-9 rounded-lg bg-[#0d2240] flex items-center justify-center">
            <img src="https://redciudadana.org/logo_red_ciudadana.png" alt="Logo" className="w-7 h-7 object-contain" />
          </div>
          <div>
            <p className="text-[#0d2240] font-bold leading-tight">{platformName}</p>
            <p className="text-gray-400 text-xs">{platformTagline}</p>
          </div>
        </div>

        <div className="w-full max-w-md">
          {/* Close button — only shown when used as overlay */}
          {onClose && (
            <div className="flex justify-end mb-4">
              <button
                onClick={onClose}
                className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-800 transition-colors"
              >
                <X size={16} />
                <span>Volver al inicio</span>
              </button>
            </div>
          )}
          <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-8">
            {/* Mode tabs */}
            <div className="flex bg-gray-100 rounded-xl p-1 mb-7">
              {(['login', 'register'] as Mode[]).map((m) => (
                <button
                  key={m}
                  onClick={() => switchMode(m)}
                  className={`flex-1 py-2 rounded-lg text-sm font-semibold transition-all ${
                    mode === m
                      ? 'bg-white text-[#0d2240] shadow-sm'
                      : 'text-gray-500 hover:text-gray-700'
                  }`}
                >
                  {m === 'login' ? 'Iniciar sesión' : 'Crear cuenta'}
                </button>
              ))}
            </div>

            <h2 className="text-xl font-extrabold text-[#0d2240] mb-1">
              {mode === 'login' ? 'Bienvenido de vuelta' : 'Registrar cuenta'}
            </h2>
            <p className="text-sm text-gray-400 mb-6">
              {mode === 'login'
                ? 'Ingresa tus credenciales para acceder.'
                : 'Crea tu cuenta para acceder a la plataforma.'}
            </p>

            {/* Error / success banners */}
            {error && (
              <div className="flex items-center gap-2.5 bg-red-50 border border-red-200 rounded-xl px-4 py-3 mb-5">
                <AlertCircle size={15} className="text-red-500 flex-shrink-0" />
                <p className="text-sm text-red-700">{error}</p>
              </div>
            )}
            {success && (
              <div className="flex items-center gap-2.5 bg-green-50 border border-green-200 rounded-xl px-4 py-3 mb-5">
                <CheckCircle size={15} className="text-green-600 flex-shrink-0" />
                <p className="text-sm text-green-700">{success}</p>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              {mode === 'register' && (
                <Field label="Nombre completo" required>
                  <FieldInput
                    icon={User}
                    type="text"
                    placeholder="Juan Pérez"
                    value={fullName}
                    onChange={setFullName}
                    autoComplete="name"
                  />
                </Field>
              )}

              <Field label="Correo electrónico" required>
                <FieldInput
                  icon={Mail}
                  type="email"
                  placeholder="correo@institucion.gob"
                  value={email}
                  onChange={setEmail}
                  autoComplete="email"
                />
              </Field>

              <Field label="Contraseña" required hint={mode === 'register' ? 'Mínimo 6 caracteres' : undefined}>
                <FieldInput
                  icon={Lock}
                  type={showPw ? 'text' : 'password'}
                  placeholder={mode === 'register' ? 'Crea una contraseña segura' : 'Tu contraseña'}
                  value={password}
                  onChange={setPassword}
                  autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
                  suffix={
                    <button type="button" onClick={() => setShowPw((v) => !v)} className="text-gray-400 hover:text-gray-600">
                      {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  }
                />
              </Field>

              {mode === 'register' && (
                <Field label="Confirmar contraseña" required>
                  <FieldInput
                    icon={Lock}
                    type={showPw ? 'text' : 'password'}
                    placeholder="Repite tu contraseña"
                    value={confirm}
                    onChange={setConfirm}
                    autoComplete="new-password"
                  />
                </Field>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-[#0d2240] hover:bg-[#1e3a5f] text-white font-semibold py-3 rounded-xl transition-colors mt-2 flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <span className="w-5 h-5 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                ) : (
                  mode === 'login' ? 'Iniciar sesión' : 'Crear cuenta'
                )}
              </button>
            </form>

            {mode === 'register' && (
              <p className="text-xs text-gray-400 text-center mt-4 leading-relaxed">
                Al registrarte, tu cuenta quedará con rol de <strong>Analista</strong>.
                Un Administrador puede cambiar tu rol más adelante.
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Small helpers ─────────────────────────────────────────────────────────────

function Field({ label, required, hint, children }: {
  label: string; required?: boolean; hint?: string; children: React.ReactNode;
}) {
  return (
    <div>
      <label className="block text-xs font-semibold text-gray-700 mb-1.5">
        {label}{required && <span className="text-red-400 ml-0.5">*</span>}
        {hint && <span className="font-normal text-gray-400 ml-1">— {hint}</span>}
      </label>
      {children}
    </div>
  );
}

function FieldInput({ icon: Icon, type, placeholder, value, onChange, autoComplete, suffix }: {
  icon: typeof Mail;
  type: string;
  placeholder: string;
  value: string;
  onChange: (v: string) => void;
  autoComplete?: string;
  suffix?: React.ReactNode;
}) {
  return (
    <div className="relative">
      <Icon size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
      <input
        type={type}
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        autoComplete={autoComplete}
        required
        className="w-full pl-9 pr-9 py-2.5 text-sm border border-gray-200 rounded-xl bg-gray-50 focus:outline-none focus:ring-2 focus:ring-[#1e3a5f]/20 focus:border-[#1e3a5f] transition-all placeholder:text-gray-400"
      />
      {suffix && (
        <div className="absolute right-3 top-1/2 -translate-y-1/2">{suffix}</div>
      )}
    </div>
  );
}

function translateError(msg: string): string {
  if (msg.includes('Invalid login credentials')) return 'Correo o contraseña incorrectos.';
  if (msg.includes('User already registered'))   return 'Ya existe una cuenta con ese correo.';
  if (msg.includes('Email not confirmed'))       return 'Confirma tu correo antes de iniciar sesión.';
  if (msg.includes('Password should be'))       return 'La contraseña debe tener al menos 6 caracteres.';
  if (msg.includes('Unable to validate'))       return 'No se pudo conectar al servidor. Intenta de nuevo.';
  return msg;
}
