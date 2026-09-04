/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect } from 'react';
import { LeadForgeProvider, useLeadForge } from './context/LeadForgeContext';
import { AppNavigationRail } from './components/AppNavigationRail';
import { AppTopBar } from './components/AppTopBar';
import { TodayBriefing } from './components/TodayBriefing';
import { OpportunityList } from './components/OpportunityList';
import { OpportunityDetail } from './components/OpportunityDetail';
import { PipelineBoard } from './components/PipelineBoard';
import { ICPBuilder } from './components/ICPBuilder';
import { TasksView } from './components/TasksView';
import { AccountsView } from './components/AccountsView';
import { ContactsView } from './components/ContactsView';
import { ResearchCenter } from './components/ResearchCenter';
import { SettingsView } from './components/SettingsView';
import { OutreachComposer } from './components/OutreachComposer';
import { CSVImportModal } from './components/CSVImportModal';
import { NotificationsDrawer } from './components/NotificationsDrawer';
import { CommandPalette } from './components/CommandPalette';
import { WelcomeScreen } from './components/WelcomeScreen';
import { OnboardingScreen } from './components/OnboardingScreen';
import { ICPConfirmationScreen } from './components/ICPConfirmationScreen';
import { FocusModeModal } from './components/FocusModeModal';

const MainContent: React.FC = () => {
  const { activeTab, selectedOpportunityId } = useLeadForge();

  return (
    <main className="w-full max-w-7xl mx-auto px-4 md:px-8 py-8 flex-1">
      {activeTab === 'overview' && <TodayBriefing />}
      {activeTab === 'opportunities' && (
        selectedOpportunityId ? <OpportunityDetail /> : <OpportunityList />
      )}
      {activeTab === 'pipeline' && <PipelineBoard />}
      {activeTab === 'accounts' && <AccountsView />}
      {activeTab === 'contacts' && <ContactsView />}
      {activeTab === 'tasks' && <TasksView />}
      {activeTab === 'icp' && <ICPBuilder />}
      {activeTab === 'research' && <ResearchCenter />}
      {activeTab === 'settings' && <SettingsView />}
    </main>
  );
};

const AppShell: React.FC = () => {
  const {
    isAuthenticated,
    isOnboardingCompleted,
    isICPConfirmed,
    enterFocusMode,
    isFocusModeOpen,
  } = useLeadForge();

  // Keyboard shortcut listener for 'f' to trigger Focus Mode when in app
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const activeEl = document.activeElement;
      const isInput =
        activeEl?.tagName === 'INPUT' ||
        activeEl?.tagName === 'TEXTAREA' ||
        (activeEl as HTMLElement)?.isContentEditable;

      if (!isInput && (e.key === 'f' || e.key === 'F') && !e.metaKey && !e.ctrlKey) {
        if (!isFocusModeOpen) {
          enterFocusMode();
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [enterFocusMode, isFocusModeOpen]);

  // Screen 01: If not authenticated, display LeadForge Welcome / Sign In
  if (!isAuthenticated) {
    return <WelcomeScreen />;
  }

  // Screen 02: If authenticated but onboarding incomplete, display Workspace Onboarding
  if (!isOnboardingCompleted) {
    return <OnboardingScreen />;
  }

  // Screen 03: If onboarding completed but ICP not yet approved, display ICP Setup / Confirmation
  if (!isICPConfirmed) {
    return <ICPConfirmationScreen />;
  }

  // Authenticated Command Center Experience
  return (
    <div className="min-h-screen bg-black text-white selection:bg-white selection:text-black font-ui antialiased relative flex flex-col md:flex-row">
      {/* 2. Desktop Slim Liquid-Glass Navigation Rail */}
      <AppNavigationRail />

      {/* Main Working View Area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* 3. Top Bar */}
        <AppTopBar />

        {/* Dynamic Views */}
        <MainContent />
      </div>

      {/* Focus Mode Spotlight Modal */}
      <FocusModeModal />

      {/* Global Overlays & Modals */}
      <OutreachComposer />
      <CSVImportModal />
      <NotificationsDrawer />
      <CommandPalette />
    </div>
  );
};

export default function App() {
  return (
    <LeadForgeProvider>
      <AppShell />
    </LeadForgeProvider>
  );
}
