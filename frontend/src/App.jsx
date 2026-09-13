import React, { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import Sidebar from './components/Sidebar';
import Dashboard from './pages/Dashboard';
import Establishments from './pages/Establishments';
import Inspections from './pages/Inspections';
import Violations from './pages/Violations';
import CorrectiveActions from './pages/CorrectiveActions';
import AIAssistant from './pages/AIAssistant';
import Login from './pages/Login';
import api from './services/api';

export default function App() {
  const [currentTab, setCurrentTab] = useState('dashboard');
  const [currentUser, setCurrentUser] = useState(null);
  const [activeRoleKey, setActiveRoleKey] = useState('inspector');
  const [metrics, setMetrics] = useState(null);
  const [tabParams, setTabParams] = useState({});

  // Fetch current user and system metrics
  const refreshUserData = async () => {
    try {
      const authRes = await api.getMe();
      if (authRes.success) {
        setCurrentUser(authRes.user);
        setActiveRoleKey(authRes.activeRoleKey);
      }
      const metricsRes = await api.getRiskMetrics();
      if (metricsRes.success) {
        setMetrics(metricsRes.data);
      }
    } catch (err) {
      console.error('Failed to initialize session data:', err);
    }
  };

  useEffect(() => {
    refreshUserData();
  }, []);

  const handleRoleChange = async (roleKey) => {
    try {
      const res = await api.switchRole(roleKey);
      if (res.success) {
        setCurrentUser(res.user);
        setActiveRoleKey(roleKey);
      }
    } catch (err) {
      console.error('Role switch failed:', err);
    }
  };

  const navigateToTab = (tabId, params = {}) => {
    setCurrentTab(tabId);
    setTabParams(params);
    // Refresh counts
    api.getRiskMetrics().then(r => {
      if (r.success) setMetrics(r.data);
    });
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans">
      {/* Persistent Navbar */}
      <Navbar
        currentUser={currentUser}
        activeRoleKey={activeRoleKey}
        onRoleChange={handleRoleChange}
        onOpenAIAssistant={() => navigateToTab('ai-assistant')}
      />

      <div className="flex flex-1 overflow-hidden">
        {/* Persistent Sidebar */}
        <Sidebar
          currentTab={currentTab}
          onSelectTab={navigateToTab}
          metrics={metrics}
        />

        {/* Dynamic Page Content */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 bg-slate-900/50">
          {currentTab === 'dashboard' && (
            <Dashboard
              currentUser={currentUser}
              onNavigate={navigateToTab}
            />
          )}

          {currentTab === 'establishments' && (
            <Establishments
              initialSelectedId={tabParams.selectId}
              onOpenInspectionModal={(estId) => navigateToTab('inspections', { openCreateModal: true, defaultEstablishmentId: estId })}
              onOpenViolationModal={(estId) => navigateToTab('violations', { openCreateModal: true, defaultEstablishmentId: estId })}
              onOpenAIAssistant={() => navigateToTab('ai-assistant')}
            />
          )}

          {currentTab === 'inspections' && (
            <Inspections
              openCreateModalByDefault={tabParams.openCreateModal}
              defaultEstablishmentId={tabParams.defaultEstablishmentId}
              onOpenViolationModal={(estId, inspId) => navigateToTab('violations', {
                openCreateModal: true,
                defaultEstablishmentId: estId,
                defaultInspectionId: inspId
              })}
            />
          )}

          {currentTab === 'violations' && (
            <Violations
              openCreateModalByDefault={tabParams.openCreateModal}
              defaultEstablishmentId={tabParams.defaultEstablishmentId}
              defaultInspectionId={tabParams.defaultInspectionId}
              onOpenInspectionModal={(estId) => navigateToTab('inspections', {
                openCreateModal: true,
                defaultEstablishmentId: estId
              })}
            />
          )}

          {currentTab === 'corrective-actions' && (
            <CorrectiveActions
              currentUser={currentUser}
              activeRoleKey={activeRoleKey}
              onNavigateToEstablishment={(id) => navigateToTab('establishments', { selectId: id })}
            />
          )}

          {currentTab === 'ai-assistant' && (
            <AIAssistant initialPrompt={tabParams.prompt} />
          )}

          {currentTab === 'login' && (
            <Login
              currentUser={currentUser}
              activeRoleKey={activeRoleKey}
              onRoleChange={handleRoleChange}
              onNavigateDashboard={() => navigateToTab('dashboard')}
            />
          )}
        </main>
      </div>
    </div>
  );
}
