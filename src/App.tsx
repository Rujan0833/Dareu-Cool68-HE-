import React, { useEffect, useState } from 'react';
import { useDeviceStore } from './store/useDeviceStore';
import { Header } from './components/layout/Header';
import { Sidebar, ActivePage } from './components/layout/Sidebar';
import { ConnectPage } from './pages/ConnectPage';
import { PerformancePage } from './pages/PerformancePage';
import { KeymapPage } from './pages/KeymapPage';
import { LightingPage } from './pages/LightingPage';
import { ProfilesPage } from './pages/ProfilesPage';
import { SettingsPage } from './pages/SettingsPage';
import { DiagnosticsModal } from './components/diagnostics/DiagnosticsModal';
import { cool68Service } from './device/cool68Service';

export const App: React.FC = () => {
  const { status } = useDeviceStore();
  const [activePage, setActivePage] = useState<ActivePage>('performance');
  const [diagnosticsOpen, setDiagnosticsOpen] = useState(false);
  const [hasEnteredApp, setHasEnteredApp] = useState(false);

  // Attempt auto-connect on load if user already paired the device previously
  useEffect(() => {
    cool68Service.autoConnect().then(info => {
      if (info) {
        useDeviceStore.setState({ status: 'connected', deviceInfo: info });
        setHasEnteredApp(true);
      }
    });
  }, []);

  // When device connects, allow entering app
  useEffect(() => {
    if (status === 'connected') {
      setHasEnteredApp(true);
    } else if (status === 'disconnected') {
      setHasEnteredApp(false);
    }
  }, [status]);

  if (!hasEnteredApp || status !== 'connected') {
    return (
      <>
        <ConnectPage onEnterApp={() => setHasEnteredApp(true)} />
        <DiagnosticsModal
          isOpen={diagnosticsOpen}
          onClose={() => setDiagnosticsOpen(false)}
        />
      </>
    );
  }

  return (
    <div className="min-h-screen bg-atk-bg text-atk-text flex flex-col select-none overflow-x-hidden">
      {/* Top Application Header */}
      <Header onOpenDiagnostics={() => setDiagnosticsOpen(true)} />

      {/* Main Workspace with Sidebar and Content Stage */}
      <div className="flex-1 flex overflow-hidden">
        <Sidebar activePage={activePage} onSelectPage={setActivePage} />

        {/* Content View Stage */}
        <main className="flex-1 overflow-y-auto p-6 bg-atk-bg">
          {activePage === 'performance' && <PerformancePage />}
          {activePage === 'keymap' && <KeymapPage />}
          {activePage === 'lighting' && <LightingPage />}
          {activePage === 'profiles' && <ProfilesPage />}
          {activePage === 'settings' && (
            <SettingsPage onOpenDiagnostics={() => setDiagnosticsOpen(true)} />
          )}
        </main>
      </div>

      {/* Diagnostics Modal */}
      <DiagnosticsModal
        isOpen={diagnosticsOpen}
        onClose={() => setDiagnosticsOpen(false)}
      />
    </div>
  );
};

export default App;
