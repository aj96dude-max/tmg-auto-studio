import React, { useEffect } from 'react';
import { TopGlobalNav } from './components/TopGlobalNav';
import { AutoExplorationView } from './components/views/AutoExplorationView';
import { ProEditorView } from './components/views/ProEditorView';
import { UpgradedFeaturesV3View } from './components/views/UpgradedFeaturesV3View';
import { useStudioStore } from './store/useStudioStore';

export const App: React.FC = () => {
  const { activeView, setActiveView, togglePlayPause, splitClipAtPlayhead } = useStudioStore();

  // Global NLE Keyboard Shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement | null;
      const isInput =
        target &&
        (target.tagName === 'INPUT' ||
          target.tagName === 'TEXTAREA' ||
          target.tagName === 'SELECT');

      if (e.altKey && e.key === '1') {
        e.preventDefault();
        setActiveView('exploration');
      } else if (e.altKey && e.key === '2') {
        e.preventDefault();
        setActiveView('editor');
      } else if (e.altKey && e.key === '3') {
        e.preventDefault();
        setActiveView('v3_dashboard');
      } else if (!isInput && e.code === 'Space' && activeView === 'editor') {
        e.preventDefault();
        togglePlayPause();
      } else if (!isInput && e.key.toLowerCase() === 's' && !e.ctrlKey && activeView === 'editor') {
        e.preventDefault();
        splitClipAtPlayhead();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [activeView, setActiveView, togglePlayPause, splitClipAtPlayhead]);

  return (
    <div className="min-h-screen w-screen bg-[#161618] text-[#F3F4F6] flex flex-col overflow-hidden">
      <TopGlobalNav />
      <div className="flex-1 min-h-0 overflow-hidden">
        {activeView === 'exploration' && <AutoExplorationView />}
        {activeView === 'editor' && <ProEditorView />}
        {activeView === 'v3_dashboard' && <UpgradedFeaturesV3View />}
      </div>
    </div>
  );
};

export default App;

