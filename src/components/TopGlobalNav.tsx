import React, { useState } from 'react';
import {
  CheckCircle2,
  Download,
  Film,
  Sparkles,
  Wand2,
} from 'lucide-react';
import { useStudioStore } from '../store/useStudioStore';
import type { WorkspaceViewMode } from '../types/studio';

export const TopGlobalNav: React.FC = () => {
  const {
    activeView,
    setActiveView,
    projectTitle,
    engineStatus,
    statusNotification,
    setStatusNotification,
    startExplorationPreview,
    resetExploration,
    splitClipAtPlayhead,
    toggleGrid3x3,
    start4KExport,
  } = useStudioStore();

  const [openMenu, setOpenMenu] = useState<string | null>(null);

  const views: { id: WorkspaceViewMode; label: string; step: string; icon: React.ReactNode }[] = [
    {
      id: 'exploration',
      label: 'Auto-Exploration Setup',
      step: '1',
      icon: <Wand2 className="w-4 h-4" />,
    },
    {
      id: 'editor',
      label: 'Pro Editor Mode',
      step: '2',
      icon: <Film className="w-4 h-4" />,
    },
    {
      id: 'v3_dashboard',
      label: 'Upgraded Features v3',
      step: '3',
      icon: <Sparkles className="w-4 h-4" />,
    },
  ];

  const menuActions: Record<string, { label: string; shortcut: string; action: () => void }[]> = {
    File: [
      {
        label: 'New AI Recording Project',
        shortcut: 'Ctrl+N',
        action: () => {
          setActiveView('exploration');
          resetExploration();
        },
      },
      {
        label: 'Save Project',
        shortcut: 'Ctrl+S',
        action: () => setStatusNotification('Project saved successfully'),
      },
      {
        label: 'Export 4K 60FPS Video',
        shortcut: 'Ctrl+E',
        action: () => {
          setActiveView('editor');
          start4KExport();
        },
      },
    ],
    Edit: [
      {
        label: 'Split Clip at Playhead',
        shortcut: 'S',
        action: () => {
          setActiveView('editor');
          splitClipAtPlayhead();
        },
      },
      {
        label: 'Reset AI Setup',
        shortcut: 'Ctrl+R',
        action: () => resetExploration(),
      },
    ],
    View: [
      {
        label: '1. Auto-Exploration Setup',
        shortcut: 'Alt+1',
        action: () => setActiveView('exploration'),
      },
      {
        label: '2. Pro Editor Mode',
        shortcut: 'Alt+2',
        action: () => setActiveView('editor'),
      },
      {
        label: '3. Upgraded Features v3',
        shortcut: 'Alt+3',
        action: () => setActiveView('v3_dashboard'),
      },
      {
        label: 'Toggle 3×3 Guide Grid',
        shortcut: 'G',
        action: () => toggleGrid3x3(),
      },
    ],
    Run: [
      {
        label: 'Generate AI Browser Preview',
        shortcut: 'F5',
        action: () => {
          setActiveView('exploration');
          startExplorationPreview();
        },
      },
      {
        label: 'Scan Audio for Mistakes',
        shortcut: 'F6',
        action: () => {
          setActiveView('v3_dashboard');
          setStatusNotification('Detected 1 audio mistake at 01:12');
        },
      },
    ],
    Help: [
      {
        label: 'Keyboard Shortcuts (Space = Play, S = Split)',
        shortcut: '?',
        action: () =>
          setStatusNotification('Shortcuts: Space (Play/Pause), S (Split Clip), Alt+1/2/3 (Switch Views)'),
      },
    ],
  };

  return (
    <header className="h-12 bg-[#1F2024] border-b border-[#323339] px-4 flex items-center justify-between select-none z-40 relative">
      {/* Left: Adobe Premiere / CapCut Style App Badge + Simple Menu */}
      <div className="flex items-center space-x-4">
        <div className="flex items-center space-x-2.5">
          <div className="w-7 h-7 rounded-lg bg-[#1473E6] flex items-center justify-center text-xs font-bold text-white shadow-sm">
            Pr
          </div>
          <div>
            <div className="text-xs font-semibold text-white leading-none">TMG Studio</div>
            <div className="text-[10px] text-[#9CA3AF] mt-0.5">{projectTitle}</div>
          </div>
        </div>

        {/* Clean Menu Bar: File / Edit / View / Run / Help */}
        <nav className="hidden md:flex items-center space-x-1 pl-3 border-l border-[#323339]">
          {Object.keys(menuActions).map((menuName) => (
            <div key={menuName} className="relative">
              <button
                onClick={() => setOpenMenu(openMenu === menuName ? null : menuName)}
                className={`px-2.5 py-1 text-xs rounded-md transition-colors ${
                  openMenu === menuName
                    ? 'bg-[#323339] text-white'
                    : 'text-[#D1D5DB] hover:text-white hover:bg-[#2A2B30]'
                }`}
              >
                {menuName}
              </button>
              {openMenu === menuName && (
                <>
                  <div className="fixed inset-0 z-40" onClick={() => setOpenMenu(null)} />
                  <div className="absolute left-0 top-full mt-1.5 w-64 bg-[#26272C] border border-[#3A3B42] rounded-lg py-1.5 shadow-xl z-50">
                    {menuActions[menuName].map((item) => (
                      <button
                        key={item.label}
                        onClick={() => {
                          item.action();
                          setOpenMenu(null);
                        }}
                        className="w-full px-3.5 py-2 text-left text-xs text-[#F3F4F6] hover:bg-[#1473E6] hover:text-white flex items-center justify-between transition-colors"
                      >
                        <span>{item.label}</span>
                        <span className="text-[11px] text-[#9CA3AF] ml-2 font-mono">
                          {item.shortcut}
                        </span>
                      </button>
                    ))}
                  </div>
                </>
              )}
            </div>
          ))}
        </nav>
      </div>

      {/* Center: Clean 3-Step Workspace Switcher (Adobe Premiere Import / Edit / Export Tab Style) */}
      <div className="flex items-center bg-[#161618] p-1 rounded-lg border border-[#323339]">
        {views.map((v) => {
          const isActive = activeView === v.id;
          return (
            <button
              key={v.id}
              onClick={() => setActiveView(v.id)}
              className={`flex items-center space-x-2 px-3.5 py-1.5 rounded-md text-xs font-medium transition-all ${
                isActive
                  ? 'bg-[#1473E6] text-white shadow-sm'
                  : 'text-[#9CA3AF] hover:text-white hover:bg-[#26272C]'
              }`}
            >
              {v.icon}
              <span>{v.label}</span>
            </button>
          );
        })}
      </div>

      {/* Right: Friendly Status Pill + CapCut/Premiere Export Button */}
      <div className="flex items-center space-x-3">
        {statusNotification && (
          <div
            onClick={() => setStatusNotification(null)}
            className="hidden lg:flex items-center space-x-1.5 px-3 py-1 rounded-full bg-[#26272C] border border-[#3A3B42] text-xs text-[#F3F4F6] cursor-pointer max-w-xs truncate"
            title={statusNotification}
          >
            <CheckCircle2 className="w-3.5 h-3.5 text-[#10B981] shrink-0" />
            <span className="truncate">{statusNotification}</span>
          </div>
        )}

        <div className="hidden sm:flex items-center space-x-1.5 px-2.5 py-1 rounded-full bg-[#26272C] border border-[#323339] text-xs text-[#D1D5DB]">
          <span className="w-2 h-2 rounded-full bg-[#10B981]" />
          <span>
            {engineStatus === 'EXPLORING'
              ? 'Recording...'
              : engineStatus === 'RENDERING'
              ? 'Exporting...'
              : 'AI Ready'}
          </span>
        </div>

        <button
          onClick={() => {
            setActiveView('editor');
            start4KExport();
          }}
          className="flex items-center space-x-1.5 px-3.5 py-1.5 rounded-md bg-[#1473E6] hover:bg-[#0D66D0] text-white text-xs font-semibold transition-colors"
        >
          <Download className="w-3.5 h-3.5" />
          <span>Export 4K</span>
        </button>
      </div>
    </header>
  );
};
