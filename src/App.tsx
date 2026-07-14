import { useState, useEffect } from 'react';
import { AppSettingsProvider } from './context/AppSettingsContext';
import { AuthProvider, useAuth } from './context/AuthContext';
import Navbar, { type Section } from './components/Navbar';
import LoginPage from './components/auth/LoginPage';
import HomePage from './components/HomePage';
import AssistantPanel from './components/AssistantPanel';
import { type Privacy } from './components/PrivacySelector';
import DocumentsPanel from './components/DocumentsPanel';
import HumanReviewNotice from './components/HumanReviewNotice';
import UploadDocumentModal from './components/UploadDocumentModal';
import DocumentsPage from './components/documents/DocumentsPage';
import StatsPage from './components/stats/StatsPage';
import SettingsPage from './components/settings/SettingsPage';
import UseCasesPage from './components/usecases/UseCasesPage';
import { useAppSettings } from './context/AppSettingsContext';

function LoadingScreen() {
  return (
    <div className="min-h-screen bg-[#0d2240] flex items-center justify-center">
      <div className="text-center">
        <div className="w-12 h-12 border-2 border-white/20 border-t-white rounded-full animate-spin mx-auto mb-4" />
        <p className="text-white/60 text-sm">Cargando...</p>
      </div>
    </div>
  );
}

function AppShell() {
  const { session, loading, canAccess } = useAuth();
  const { settings } = useAppSettings();

  const [section, setSection]       = useState<Section>('home');
  const [showLogin, setShowLogin]   = useState(false);
  const [uploadOpen, setUploadOpen] = useState(false);
  const [privacyLevel] = useState<Privacy>('interna');
  const [useDocs] = useState(true);

  const activeModelId = settings?.active_model_id ?? '20000000-0000-0000-0000-000000000001';

  // Dismiss login overlay automatically when session is established
  useEffect(() => {
    if (session) setShowLogin(false);
  }, [session]);

  if (loading) return <LoadingScreen />;

  function navigate(s: Section) {
    if (s === 'home' || s === 'usecases') { setSection(s); return; }
    if (!session) { setShowLogin(true); return; }
    if (!canAccess(s)) return;
    setSection(s);
  }

  // If the user loses their session while on a protected section, fall back to home
  const activeSection = (!session && section !== 'home' && section !== 'usecases') ? 'home' : section;

  return (
    <div className="flex flex-col h-screen bg-[#f1f4f8] overflow-hidden font-sans">
      <Navbar active={activeSection} onNavigate={navigate} onLoginClick={() => setShowLogin(true)} />

      <div className="flex-1 flex flex-col overflow-hidden min-h-0">
        {activeSection === 'home' && (
          <HomePage onGoToAssistant={() => navigate('assistant')} />
        )}

        {activeSection === 'assistant' && (
          <main className="h-full flex gap-5 p-5 overflow-hidden">
            <section className="flex-1 bg-[#f8fafc] rounded-2xl border border-gray-200 shadow-sm flex flex-col min-h-0 overflow-hidden">
              <AssistantPanel
                activeModelId={activeModelId}
                privacyLevel={privacyLevel}
                useDocs={useDocs}
              />
            </section>
            <aside className="w-80 flex-shrink-0 flex flex-col gap-4 overflow-y-auto">
              <DocumentsPanel onUpload={() => setUploadOpen(true)} />
              <HumanReviewNotice />
            </aside>
          </main>
        )}

        {activeSection === 'documents' && (
          <DocumentsPage onGoToAssistant={() => navigate('assistant')} />
        )}
        {activeSection === 'stats'    && <StatsPage />}
        {activeSection === 'settings' && <SettingsPage />}
        {activeSection === 'usecases' && <UseCasesPage />}
      </div>

      {uploadOpen && (
        <UploadDocumentModal onClose={() => setUploadOpen(false)} />
      )}

      {/* Login overlay for unauthenticated users trying to access protected sections */}
      {showLogin && !session && (
        <div className="fixed inset-0 z-50">
          <LoginPage onClose={() => setShowLogin(false)} />
        </div>
      )}
    </div>
  );
}

export default function App() {
  return (
    <AppSettingsProvider>
      <AuthProvider>
        <AppShell />
      </AuthProvider>
    </AppSettingsProvider>
  );
}
