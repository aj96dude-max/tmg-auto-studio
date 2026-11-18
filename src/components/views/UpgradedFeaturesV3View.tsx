import React, { useEffect, useState } from 'react';
import {
  AlertTriangle,
  ArrowLeft,
  BrainCircuit,
  Check,
  CheckCircle2,
  Copy,
  Download,
  History,
  Languages,
  Lock,
  Mic,
  ScanFace,
  Wand2,
} from 'lucide-react';
import { useStudioStore } from '../../store/useStudioStore';

export const UpgradedFeaturesV3View: React.FC = () => {
  const {
    chapters,
    mistakeAlert,
    triggerMistakeReRecord,
    completeMistakePatch,
    ignoreMistakeAlert,
    dubbing,
    toggleVoiceClone,
    setDubbingPreviewTrack,
    applyDubbingToTimeline,
    faceTrack,
    updateFaceTrack,
    projectMemory,
    aiSkipSuggestion,
    applyAiSkipSuggestion,
    dismissAiSkipSuggestion,
    setActiveView,
    setStatusNotification,
  } = useStudioStore();

  const [patchCountdown, setPatchCountdown] = useState<number>(3);
  const [copiedChapters, setCopiedChapters] = useState(false);

  useEffect(() => {
    if (mistakeAlert.status !== 're_recording') {
      setPatchCountdown(3);
      return;
    }
    const timer = setInterval(() => {
      setPatchCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          completeMistakePatch();
          return 0;
        }
        return prev - 1;
      });
    }, 950);
    return () => clearInterval(timer);
  }, [mistakeAlert.status, completeMistakePatch]);

  const handleCopyChapters = () => {
    const formatted = chapters.map((c) => `${c.timecode} ${c.title}`).join('\n');
    navigator.clipboard?.writeText(formatted).catch(() => {});
    setCopiedChapters(true);
    setStatusNotification('Copied YouTube chapters');
    setTimeout(() => setCopiedChapters(false), 1800);
  };

  const sourceEnWave = [35, 68, 82, 54, 90, 42, 76, 88, 61, 48, 85, 92, 64, 39, 77, 84, 58, 72, 91, 46];
  const targetUrWave = [38, 72, 79, 58, 86, 45, 81, 84, 65, 52, 88, 89, 60, 43, 74, 86, 62, 75, 88, 49];

  return (
    <div className="flex flex-col h-[calc(100vh-3rem)] bg-[#161618] text-[#F3F4F6] p-2 gap-2 select-none overflow-y-auto">
      {/* Clean Header Bar */}
      <div className="bg-[#212226] border border-[#323339] rounded-lg px-4 py-2.5 flex items-center justify-between shrink-0">
        <div className="flex items-center space-x-3">
          <span className="px-2.5 py-1 rounded-md bg-[#1473E6] text-white text-xs font-semibold">
            AI Magic Tools v3
          </span>
          <span className="text-xs text-[#D1D5DB]">
            One-click AI tools for YouTube Chapters, Voice Dubbing, Smart Face Cutout, and Project Memory
          </span>
        </div>

        <button
          onClick={() => setActiveView('editor')}
          className="flex items-center space-x-1.5 px-3 py-1.5 rounded-md bg-[#2B2C32] hover:bg-[#36373E] border border-[#3A3B42] text-xs font-medium text-white transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to Editor</span>
        </button>
      </div>

      {/* Clean 2x2 Grid of Rounded Panels */}
      <div className="flex-1 grid grid-cols-12 gap-2 min-h-0">
        {/* CARD 1: Auto-Chapter & Mistake Detector */}
        <section className="col-span-12 lg:col-span-6 bg-[#212226] border border-[#323339] rounded-lg p-4 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 mb-3 border-b border-[#323339]">
              <div className="flex items-center space-x-2.5">
                <div className="w-8 h-8 rounded-lg bg-[#10B981]/15 flex items-center justify-center text-[#10B981]">
                  <Wand2 className="w-4 h-4" />
                </div>
                <div>
                  <h2 className="text-sm font-semibold text-white">
                    Auto-Chapter & Mistake Cleanup
                  </h2>
                  <p className="text-xs text-[#9CA3AF]">
                    Generates YouTube chapters & fixes speech pauses
                  </p>
                </div>
              </div>

              <button
                onClick={handleCopyChapters}
                className="flex items-center space-x-1.5 px-3 py-1.5 rounded-md bg-[#18191C] hover:bg-[#2B2C32] border border-[#34353C] text-xs text-white"
              >
                {copiedChapters ? (
                  <Check className="w-3.5 h-3.5 text-[#10B981]" />
                ) : (
                  <Copy className="w-3.5 h-3.5 text-[#9CA3AF]" />
                )}
                <span>{copiedChapters ? 'Copied!' : 'Copy Chapters'}</span>
              </button>
            </div>

            {/* Chapters List */}
            <div className="space-y-1.5 mb-3">
              {chapters.map((ch) => {
                const isWarning = ch.status === 'warning';
                return (
                  <div
                    key={ch.id}
                    className={`px-3 py-2 rounded-lg border flex items-center justify-between ${
                      isWarning
                        ? 'bg-[#F59E0B]/10 border-[#F59E0B]'
                        : 'bg-[#18191C] border-[#323339]'
                    }`}
                  >
                    <div className="flex items-center space-x-2.5">
                      {isWarning ? (
                        <AlertTriangle className="w-4 h-4 text-[#F59E0B] shrink-0" />
                      ) : (
                        <CheckCircle2 className="w-4 h-4 text-[#10B981] shrink-0" />
                      )}
                      <span className="font-mono text-xs font-semibold text-white px-2 py-0.5 rounded bg-[#26272C]">
                        {ch.timecode}
                      </span>
                      <span className="text-xs font-medium text-white">{ch.title}</span>
                    </div>

                    <span
                      className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                        isWarning
                          ? 'bg-[#F59E0B] text-black'
                          : 'bg-[#10B981]/15 text-[#10B981]'
                      }`}
                    >
                      {isWarning ? 'Needs Review' : 'Ready'}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Amber Warning at 01:12 */}
          <div className="p-3.5 rounded-lg bg-[#18191C] border border-[#F59E0B]/80 flex items-center justify-between gap-3">
            <div>
              <div className="flex items-center space-x-2 mb-1">
                <span className="px-2 py-0.5 rounded bg-[#F59E0B] text-black font-mono text-xs font-bold">
                  {mistakeAlert.timecode}
                </span>
                <span className="text-xs font-semibold text-[#F59E0B]">
                  {mistakeAlert.message}
                </span>
              </div>
              <p className="text-xs text-[#9CA3AF]">{mistakeAlert.snippetText}</p>
            </div>

            <div className="flex items-center space-x-2 shrink-0">
              {mistakeAlert.status === 're_recording' ? (
                <div className="px-3.5 py-2 rounded-md bg-[#1473E6] text-white text-xs font-semibold flex items-center space-x-1.5">
                  <Mic className="w-4 h-4 animate-pulse" />
                  <span>Recording {patchCountdown}s...</span>
                </div>
              ) : (
                <>
                  <button
                    onClick={triggerMistakeReRecord}
                    className="flex items-center space-x-1.5 px-3.5 py-2 rounded-md bg-[#1473E6] hover:bg-[#0D66D0] text-white text-xs font-semibold transition-colors"
                  >
                    <Mic className="w-3.5 h-3.5" />
                    <span>Re-record</span>
                  </button>
                  <button
                    onClick={ignoreMistakeAlert}
                    className="px-3 py-2 rounded-md bg-[#26272C] hover:bg-[#32333A] text-xs font-medium text-[#D1D5DB] hover:text-white transition-colors"
                  >
                    Ignore
                  </button>
                </>
              )}
            </div>
          </div>
        </section>

        {/* CARD 2: Multi-Language Dubbing */}
        <section className="col-span-12 lg:col-span-6 bg-[#212226] border border-[#323339] rounded-lg p-4 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 mb-3 border-b border-[#323339]">
              <div className="flex items-center space-x-2.5">
                <div className="w-8 h-8 rounded-lg bg-[#1473E6]/20 flex items-center justify-center text-[#60A5FA]">
                  <Languages className="w-4 h-4" />
                </div>
                <div>
                  <h2 className="text-sm font-semibold text-white">Multi-Language AI Dubbing</h2>
                  <p className="text-xs text-[#9CA3AF]">
                    Clones your voice into natural Urdu and Hindi
                  </p>
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <span className="px-2.5 py-1 rounded-full bg-[#10B981]/15 text-[#10B981] text-xs font-semibold">
                  {dubbing.voiceMatchPct}% voice match
                </span>

                <button
                  onClick={toggleVoiceClone}
                  className={`px-3 py-1.5 rounded-md text-xs font-semibold transition-colors ${
                    dubbing.voiceCloneEnabled
                      ? 'bg-[#1473E6] text-white'
                      : 'bg-[#18191C] border border-[#34353C] text-[#9CA3AF]'
                  }`}
                >
                  AI Voice Clone {dubbing.voiceCloneEnabled ? 'ON' : 'OFF'}
                </button>
              </div>
            </div>

            {/* Side-by-Side Waveforms */}
            <div className="grid grid-cols-2 gap-3 mb-3">
              <div
                onClick={() => setDubbingPreviewTrack('en')}
                className={`p-3 rounded-lg border cursor-pointer ${
                  dubbing.activePreviewTrack === 'en'
                    ? 'bg-[#18191C] border-[#1473E6]'
                    : 'bg-[#18191C] border-[#323339]'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-semibold text-white">English Original</span>
                  <span className="text-[11px] text-[#9CA3AF]">00:13.5</span>
                </div>
                <div className="h-20 bg-[#121316] rounded-md px-3 flex items-center justify-between">
                  {sourceEnWave.map((h, i) => (
                    <div
                      key={i}
                      style={{ height: `${h}%` }}
                      className="w-1.5 rounded-full bg-[#1473E6]"
                    />
                  ))}
                </div>
              </div>

              <div
                onClick={() => setDubbingPreviewTrack('ur')}
                className={`p-3 rounded-lg border cursor-pointer ${
                  dubbing.activePreviewTrack !== 'en'
                    ? 'bg-[#18191C] border-[#10B981]'
                    : 'bg-[#18191C] border-[#323339]'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-semibold text-white">Urdu / Hindi Cloned</span>
                  <span className="text-[11px] text-[#10B981] font-medium">
                    {dubbing.voiceMatchPct}% Match
                  </span>
                </div>
                <div className="h-20 bg-[#121316] rounded-md px-3 flex items-center justify-between">
                  {targetUrWave.map((h, i) => (
                    <div
                      key={i}
                      style={{ height: `${h}%` }}
                      className="w-1.5 rounded-full bg-[#10B981]"
                    />
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Export / Apply Dubbed Audio */}
          <div className="p-3.5 rounded-lg bg-[#18191C] border border-[#323339] flex items-center justify-between">
            <div>
              <div className="text-xs font-semibold text-white">Download or Apply Dubbed Audio</div>
              <div className="text-xs text-[#9CA3AF]">Ready to use on your video timeline</div>
            </div>

            <div className="flex items-center space-x-2">
              <button
                onClick={() => applyDubbingToTimeline('ur')}
                className="flex items-center space-x-1.5 px-3.5 py-2 rounded-md bg-[#1473E6] hover:bg-[#0D66D0] text-white text-xs font-semibold transition-colors"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Urdu.mp3</span>
              </button>
              <button
                onClick={() => applyDubbingToTimeline('hi')}
                className="flex items-center space-x-1.5 px-3.5 py-2 rounded-md bg-[#26272C] hover:bg-[#32333A] border border-[#3A3B42] text-white text-xs font-semibold transition-colors"
              >
                <Download className="w-3.5 h-3.5 text-[#60A5FA]" />
                <span>Hindi.mp3</span>
              </button>
            </div>
          </div>
        </section>

        {/* CARD 3: Face Auto-Track Merger */}
        <section className="col-span-12 lg:col-span-6 bg-[#212226] border border-[#323339] rounded-lg p-4 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 mb-3 border-b border-[#323339]">
              <div className="flex items-center space-x-2.5">
                <div className="w-8 h-8 rounded-lg bg-[#10B981]/15 flex items-center justify-center text-[#10B981]">
                  <ScanFace className="w-4 h-4" />
                </div>
                <div>
                  <h2 className="text-sm font-semibold text-white">
                    Smart Face Cutout & PIP Overlay
                  </h2>
                  <p className="text-xs text-[#9CA3AF]">
                    Places phone_intro.mp4 in the top-right corner with background removed
                  </p>
                </div>
              </div>

              <span className="px-2.5 py-1 rounded-full bg-[#10B981]/15 text-[#10B981] text-xs font-semibold">
                Locked {faceTrack.scalePct}% Scale
              </span>
            </div>

            {/* Visual Preview Stage */}
            <div className="relative h-44 bg-[#141518] border border-[#323339] rounded-lg p-4 flex items-center justify-between overflow-hidden mb-3">
              <div className="w-3/5 space-y-2">
                <span className="text-xs text-[#9CA3AF]">Main Screen Recording</span>
                <div className="p-3 rounded-lg bg-[#1F2024] border border-[#34353C] space-y-2">
                  <div className="text-xs font-semibold text-white">Linear Workspace Login</div>
                  <div className="h-6 rounded bg-[#1473E6] flex items-center justify-center text-xs font-medium text-white">
                    Log In Button
                  </div>
                </div>
              </div>

              {/* Top-Right Locked 25% PIP Cutout */}
              <div
                className="w-36 h-32 rounded-lg border border-[#10B981] bg-[#212226] p-2.5 flex flex-col items-center justify-between"
                style={{
                  boxShadow: faceTrack.naturalDropShadow
                    ? '0 10px 25px rgba(0, 0, 0, 0.7)'
                    : 'none',
                }}
              >
                <div className="w-full flex items-center justify-between text-[10px] text-[#10B981] font-semibold">
                  <span>{faceTrack.scalePct}% PIP</span>
                  <Lock className="w-3 h-3" />
                </div>
                <div className="w-12 h-12 rounded-full border-2 border-[#10B981] bg-[#18191C] flex items-center justify-center">
                  {faceTrack.showLandmarks ? (
                    <div className="grid grid-cols-3 gap-1">
                      {Array.from({ length: 6 }).map((_, i) => (
                        <span key={i} className="w-1 h-1 rounded-full bg-[#10B981]" />
                      ))}
                    </div>
                  ) : (
                    <span className="text-[10px] text-white">Face</span>
                  )}
                </div>
                <span className="text-[10px] text-[#D1D5DB]">phone_intro.mp4</span>
              </div>
            </div>
          </div>

          {/* 3 Simple Toggle Buttons */}
          <div className="grid grid-cols-3 gap-2">
            <button
              onClick={() => updateFaceTrack('showLandmarks', !faceTrack.showLandmarks)}
              className={`p-2.5 rounded-lg border text-left transition-colors ${
                faceTrack.showLandmarks
                  ? 'bg-[#18191C] border-[#10B981] text-white'
                  : 'bg-[#18191C] border-[#323339] text-[#9CA3AF]'
              }`}
            >
              <div className="text-xs font-semibold">Facial Landmarks</div>
              <div className="text-[11px] text-[#10B981]">
                {faceTrack.showLandmarks ? 'Visible' : 'Hidden'}
              </div>
            </button>

            <button
              onClick={() => updateFaceTrack('backgroundRemoved', !faceTrack.backgroundRemoved)}
              className={`p-2.5 rounded-lg border text-left transition-colors ${
                faceTrack.backgroundRemoved
                  ? 'bg-[#18191C] border-[#10B981] text-white'
                  : 'bg-[#18191C] border-[#323339] text-[#9CA3AF]'
              }`}
            >
              <div className="text-xs font-semibold">Background Removal</div>
              <div className="text-[11px] text-[#10B981]">
                {faceTrack.backgroundRemoved ? 'Active' : 'Off'}
              </div>
            </button>

            <button
              onClick={() => updateFaceTrack('naturalDropShadow', !faceTrack.naturalDropShadow)}
              className={`p-2.5 rounded-lg border text-left transition-colors ${
                faceTrack.naturalDropShadow
                  ? 'bg-[#18191C] border-[#10B981] text-white'
                  : 'bg-[#18191C] border-[#323339] text-[#9CA3AF]'
              }`}
            >
              <div className="text-xs font-semibold">Natural Drop Shadow</div>
              <div className="text-[11px] text-[#10B981]">
                {faceTrack.naturalDropShadow ? 'Enabled' : 'Off'}
              </div>
            </button>
          </div>
        </section>

        {/* CARD 4: Project Memory Card */}
        <section className="col-span-12 lg:col-span-6 bg-[#212226] border border-[#323339] rounded-lg p-4 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 mb-3 border-b border-[#323339]">
              <div className="flex items-center space-x-2.5">
                <div className="w-8 h-8 rounded-lg bg-[#1473E6]/20 flex items-center justify-center text-[#60A5FA]">
                  <BrainCircuit className="w-4 h-4" />
                </div>
                <div>
                  <h2 className="text-sm font-semibold text-white">Cross-Project Smart Memory</h2>
                  <p className="text-xs text-[#9CA3AF]">
                    Reuses common flows like SignUp from your past tutorials
                  </p>
                </div>
              </div>

              <span className="text-xs text-[#9CA3AF]">Recent Projects</span>
            </div>

            {/* Recent Tutorials List */}
            <div className="space-y-2 mb-3">
              {projectMemory.map((item) => (
                <div
                  key={item.id}
                  className="px-3.5 py-2.5 rounded-lg bg-[#18191C] border border-[#323339] flex items-center justify-between"
                >
                  <div className="flex items-center space-x-2.5">
                    <History className="w-4 h-4 text-[#60A5FA]" />
                    <div>
                      <div className="text-xs font-semibold text-white">{item.title}</div>
                      <div className="text-[11px] text-[#9CA3AF]">
                        {item.flowTag} • {item.stepsCount} steps
                      </div>
                    </div>
                  </div>
                  <span className="text-xs text-[#9CA3AF]">{item.timestampLabel}</span>
                </div>
              ))}
            </div>
          </div>

          {/* AI Suggestion Banner */}
          <div className="p-3.5 rounded-lg bg-[#1473E6]/15 border border-[#1473E6] flex items-center justify-between gap-3">
            <div>
              <div className="flex items-center space-x-2 mb-1">
                <span className="px-2 py-0.5 rounded bg-[#1473E6] text-white text-[11px] font-semibold">
                  AI Suggestion
                </span>
                <span className="text-xs font-semibold text-white">
                  Skip previously recorded &ldquo;SignUp&rdquo; flow — Save{' '}
                  <span className="text-[#10B981]">{aiSkipSuggestion.timeSavedLabel}</span>
                </span>
              </div>
              <p className="text-xs text-[#D1D5DB]">
                Found matching SignUp steps in <strong>{aiSkipSuggestion.sourceProject}</strong>.
              </p>
            </div>

            <div className="flex items-center space-x-2 shrink-0">
              <button
                onClick={applyAiSkipSuggestion}
                disabled={aiSkipSuggestion.status === 'applied'}
                className="px-3.5 py-2 rounded-md bg-[#1473E6] hover:bg-[#0D66D0] disabled:bg-[#10B981] disabled:text-black text-white text-xs font-semibold transition-colors"
              >
                {aiSkipSuggestion.status === 'applied' ? '✓ Applied' : 'Apply'}
              </button>
              <button
                onClick={dismissAiSkipSuggestion}
                className="px-3 py-2 rounded-md bg-[#26272C] hover:bg-[#32333A] text-xs font-medium text-[#D1D5DB] hover:text-white transition-colors"
              >
                Dismiss
              </button>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
};
