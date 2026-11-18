import React, { useEffect, useState } from 'react';
import {
  ArrowRight,
  Check,
  Clock,
  Copy,
  Edit3,
  Eye,
  EyeOff,
  Globe,
  Info,
  Lock,
  LogOut,
  Mic,
  MicOff,
  MousePointerClick,
  Play,
  Plus,
  RotateCcw,
  Save,
  ShieldCheck,
  Sparkles,
  Target,
  ZoomIn,
} from 'lucide-react';
import { useStudioStore } from '../../store/useStudioStore';
import type { InputLanguageMode } from '../../types/studio';

export const AutoExplorationView: React.FC = () => {
  const {
    targetUrl,
    setTargetUrl,
    videoDuration,
    setVideoDuration,
    goalInput,
    setGoalInput,
    inputMode,
    setInputMode,
    userInstructions,
    setUserInstructions,
    voiceStandbyActive,
    toggleVoiceStandby,
    isExploring,
    activeActionIndex,
    explorationTimeSec,
    actionSteps,
    scriptBlocks,
    selectActionStep,
    startExplorationPreview,
    advanceExplorationStep,
    resetExploration,
    updateScriptBlockText,
    setActiveView,
    setStatusNotification,
    previewEmail,
    setPreviewEmail,
    previewPassword,
    setPreviewPassword,
    isAuthenticatedInPreview,
    performInteractiveLogin,
    logoutPreview,
    sprintIssues,
    addSprintIssue,
  } = useStudioStore();

  const [editingScriptId, setEditingScriptId] = useState<string | null>(null);
  const [editDraft, setEditDraft] = useState<string>('');
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [maskPassword, setMaskPassword] = useState<boolean>(true);
  const [newIssueTitle, setNewIssueTitle] = useState<string>('');

  useEffect(() => {
    if (!isExploring) return;
    const timer = setInterval(() => {
      advanceExplorationStep();
    }, 1000);
    return () => clearInterval(timer);
  }, [isExploring, advanceExplorationStep]);

  const activeStep = actionSteps[activeActionIndex] || actionSteps[3];
  const totalWords = scriptBlocks.reduce((acc, b) => acc + b.wordCount, 0);

  const handleCopyScript = (id: string, text: string) => {
    navigator.clipboard?.writeText(text).catch(() => {});
    setCopiedId(id);
    setStatusNotification('Copied script line to clipboard');
    setTimeout(() => setCopiedId(null), 1500);
  };

  const handleStartEdit = (id: string, currentText: string) => {
    setEditingScriptId(id);
    setEditDraft(currentText);
  };

  const handleSaveEdit = (id: string) => {
    updateScriptBlockText(id, editDraft);
    setEditingScriptId(null);
    setStatusNotification('Script updated');
  };

  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    performInteractiveLogin();
  };

  const handleCreateSprintIssue = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newIssueTitle.trim()) return;
    addSprintIssue(newIssueTitle);
    setNewIssueTitle('');
  };

  const waveformBars = Array.from({ length: 68 }, (_, idx) => {
    const phase = Math.sin(idx * 0.42) * 0.35 + Math.cos(idx * 0.19) * 0.3 + 0.5;
    return Math.max(20, Math.min(90, Math.round(phase * 75)));
  });

  const showDashboard =
    isAuthenticatedInPreview || activeStep.screenState === 'dashboard_success';

  return (
    <div className="flex flex-col h-[calc(100vh-3rem)] bg-[#161618] text-[#F3F4F6] p-2 gap-2 select-none overflow-hidden">
      {/* TOP SETUP BAR */}
      <div className="bg-[#212226] border border-[#323339] rounded-lg px-4 py-2.5 flex flex-wrap items-center justify-between gap-3 shrink-0">
        <div className="flex items-center gap-3 flex-1 min-w-0">
          <div className="flex items-center bg-[#18191C] border border-[#34353C] rounded-md px-3 py-1.5 flex-1 max-w-xs focus-within:border-[#1473E6]">
            <Globe className="w-4 h-4 text-[#9CA3AF] mr-2 shrink-0" />
            <span className="text-xs text-[#9CA3AF] mr-2 shrink-0">App Link:</span>
            <input
              type="text"
              value={targetUrl}
              onChange={(e) => setTargetUrl(e.target.value)}
              placeholder="https://app.linear.app/login"
              className="bg-transparent text-xs text-white focus:outline-none w-full truncate"
            />
          </div>

          <div className="flex items-center bg-[#18191C] border border-[#34353C] rounded-md px-3 py-1.5 w-36 shrink-0 focus-within:border-[#1473E6]">
            <Clock className="w-4 h-4 text-[#9CA3AF] mr-2 shrink-0" />
            <span className="text-xs text-[#9CA3AF] mr-1.5 shrink-0">Length:</span>
            <input
              type="text"
              value={videoDuration}
              onChange={(e) => setVideoDuration(e.target.value)}
              className="bg-transparent text-xs font-mono text-white focus:outline-none w-full text-right"
            />
          </div>

          <div className="flex items-center bg-[#18191C] border border-[#34353C] rounded-md px-3 py-1.5 flex-1 min-w-[200px] focus-within:border-[#1473E6]">
            <Target className="w-4 h-4 text-[#1473E6] mr-2 shrink-0" />
            <span className="text-xs text-[#9CA3AF] mr-2 shrink-0">Goal:</span>
            <input
              type="text"
              value={goalInput}
              onChange={(e) => setGoalInput(e.target.value)}
              placeholder="What should this tutorial teach?"
              className="bg-transparent text-xs text-white focus:outline-none w-full truncate"
            />
          </div>
        </div>

        <div className="flex items-center space-x-2 shrink-0">
          <button
            onClick={startExplorationPreview}
            disabled={isExploring}
            className="flex items-center space-x-2 px-4 py-1.5 rounded-md bg-[#1473E6] hover:bg-[#0D66D0] disabled:opacity-60 text-white text-xs font-semibold transition-colors shadow-sm"
          >
            <Play className="w-3.5 h-3.5 fill-current" />
            <span>{isExploring ? 'Recording Preview...' : 'Generate Preview'}</span>
          </button>

          <button
            onClick={resetExploration}
            className="flex items-center space-x-1.5 px-3 py-1.5 rounded-md bg-[#2B2C32] hover:bg-[#36373E] border border-[#3A3B42] text-xs font-medium text-[#D1D5DB] hover:text-white transition-colors"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset</span>
          </button>
        </div>
      </div>

      {/* MAIN 3-PANEL WORKSPACE */}
      <div className="flex-1 grid grid-cols-12 gap-2 min-h-0">
        {/* LEFT PANEL: Instructions & Voice Input (3 Cols) */}
        <aside className="col-span-3 bg-[#212226] border border-[#323339] rounded-lg p-3.5 flex flex-col justify-between min-h-0 overflow-y-auto">
          <div className="space-y-4">
            <div className="flex items-center justify-between pb-2.5 border-b border-[#323339]">
              <div className="flex items-center space-x-2">
                <Sparkles className="w-4 h-4 text-[#1473E6]" />
                <h2 className="text-xs font-semibold text-white">1. Tutorial Instructions</h2>
              </div>
              <span className="text-[11px] text-[#9CA3AF]">AI Prompt</span>
            </div>

            <div>
              <label className="block text-xs text-[#9CA3AF] mb-1.5">Input Language</label>
              <div className="grid grid-cols-3 gap-1 bg-[#18191C] p-1 rounded-lg border border-[#323339]">
                {(
                  [
                    { id: 'urdu', label: 'Urdu' },
                    { id: 'english', label: 'English' },
                    { id: 'voice', label: 'Voice' },
                  ] as { id: InputLanguageMode; label: string }[]
                ).map((tab) => {
                  const active = inputMode === tab.id;
                  return (
                    <button
                      key={tab.id}
                      onClick={() => setInputMode(tab.id)}
                      className={`py-1.5 px-2 rounded-md text-xs font-medium transition-colors ${
                        active
                          ? 'bg-[#1473E6] text-white'
                          : 'text-[#9CA3AF] hover:text-white hover:bg-[#26272C]'
                      }`}
                    >
                      {tab.label}
                    </button>
                  );
                })}
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs text-[#9CA3AF]">Describe Steps</label>
                <span className="text-[11px] text-[#10B981]">Auto-writes English Script</span>
              </div>
              <textarea
                rows={6}
                value={userInstructions}
                onChange={(e) => setUserInstructions(e.target.value)}
                placeholder="Write what the AI should click and explain..."
                className="w-full rounded-lg bg-[#18191C] border border-[#34353C] focus:border-[#1473E6] focus:outline-none p-3 text-xs text-white leading-relaxed resize-none"
              />
            </div>

            <div className="p-3 rounded-lg bg-[#18191C] border border-[#323339] flex items-start space-x-2.5">
              <Info className="w-4 h-4 text-[#1473E6] shrink-0 mt-0.5" />
              <div className="text-xs text-[#9CA3AF] leading-relaxed">
                <strong className="text-white block mb-0.5">Pro Tip:</strong>
                Mention exact button names (like <span className="text-white">Login Button</span>) and where to zoom in for the cleanest recording.
              </div>
            </div>
          </div>

          <div className="pt-3 border-t border-[#323339]">
            <button
              onClick={toggleVoiceStandby}
              className={`w-full p-3 rounded-lg border flex items-center justify-between transition-all ${
                voiceStandbyActive
                  ? 'bg-[#10B981]/10 border-[#10B981] text-white'
                  : 'bg-[#18191C] border-[#34353C] text-[#D1D5DB] hover:border-[#4B4C56]'
              }`}
            >
              <div className="flex items-center space-x-2.5">
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center ${
                    voiceStandbyActive
                      ? 'bg-[#10B981] text-black'
                      : 'bg-[#2B2C32] text-[#9CA3AF]'
                  }`}
                >
                  {voiceStandbyActive ? <Mic className="w-4 h-4" /> : <MicOff className="w-4 h-4" />}
                </div>
                <div className="text-left">
                  <div className="text-xs font-semibold text-white">
                    {voiceStandbyActive ? 'Listening to Microphone...' : 'Voice input standby'}
                  </div>
                  <div className="text-[11px] text-[#9CA3AF]">
                    {voiceStandbyActive ? 'Speak in Urdu or English' : 'Click to speak instructions'}
                  </div>
                </div>
              </div>
              <span
                className={`w-2.5 h-2.5 rounded-full ${
                  voiceStandbyActive ? 'bg-[#10B981] animate-pulse' : 'bg-[#6B7280]'
                }`}
              />
            </button>
          </div>
        </aside>

        {/* CENTER PANEL: Live Interactive Browser Preview (6 Cols) */}
        <main className="col-span-6 bg-[#212226] border border-[#323339] rounded-lg p-3.5 flex flex-col justify-between min-h-0 overflow-hidden">
          <div className="flex items-center justify-between pb-2.5 border-b border-[#323339] shrink-0">
            <div className="flex items-center space-x-2">
              <span className="w-2.5 h-2.5 rounded-full bg-[#10B981]" />
              <h2 className="text-xs font-semibold text-white">2. Live Browser Preview</h2>
              <span className="text-xs text-[#9CA3AF]">
                • Step {activeActionIndex + 1} of {actionSteps.length}: {activeStep.label}
              </span>
            </div>

            <div className="flex items-center space-x-2">
              <span className="px-2.5 py-0.5 rounded-full bg-[#1473E6]/20 border border-[#1473E6] text-xs font-medium text-[#60A5FA]">
                Auto-Zoom {activeStep.zoomScalePct}%
              </span>
            </div>
          </div>

          {/* Interactive Browser Frame */}
          <div className="relative flex-1 my-2.5 bg-[#141518] border border-[#323339] rounded-lg overflow-hidden flex flex-col">
            <div className="h-9 bg-[#1B1C20] border-b border-[#323339] px-3 flex items-center justify-between shrink-0">
              <div className="flex items-center space-x-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-[#EF4444]/80" />
                <span className="w-2.5 h-2.5 rounded-full bg-[#F59E0B]/80" />
                <span className="w-2.5 h-2.5 rounded-full bg-[#10B981]/80" />
              </div>

              <div className="flex items-center space-x-1.5 px-3 py-1 rounded-md bg-[#121316] border border-[#2D2E34] text-xs text-[#9CA3AF] w-2/3 justify-center">
                <Lock className="w-3 h-3 text-[#10B981]" />
                <span className="truncate">
                  {showDashboard ? 'https://app.linear.app/workspace/sprint-board' : targetUrl}
                </span>
              </div>

              <div className="text-[11px] text-[#10B981] font-medium">
                {showDashboard ? 'Logged In' : 'Interactive'}
              </div>
            </div>

            {/* Interactive Login Form OR Logged-In Sprint Dashboard */}
            <div className="relative flex-1 p-5 flex items-center justify-center overflow-y-auto">
              {activeStep.zoomScalePct > 100 && !showDashboard && (
                <div className="absolute top-3 left-3 px-2.5 py-1 rounded-md bg-[#212226]/90 border border-[#1473E6] flex items-center space-x-1.5 text-xs text-white z-20">
                  <ZoomIn className="w-3.5 h-3.5 text-[#1473E6]" />
                  <span>Auto-Zoom Focus: +{activeStep.zoomScalePct}%</span>
                </div>
              )}

              {!showDashboard ? (
                <form
                  onSubmit={handleLoginSubmit}
                  className="w-full max-w-md bg-[#1F2024] border border-[#36373F] rounded-xl p-5 shadow-lg space-y-3"
                >
                  <div className="flex items-center justify-between pb-2.5 border-b border-[#323339]">
                    <div>
                      <div className="text-sm font-semibold text-white">Sign in to Linear</div>
                      <div className="text-xs text-[#9CA3AF]">
                        Type your email & password or click Log In below
                      </div>
                    </div>
                    <span className="px-2 py-0.5 rounded-md bg-[#10B981]/15 text-[#10B981] text-xs font-medium">
                      Live Form
                    </span>
                  </div>

                  {/* Interactive Email Input */}
                  <div
                    className={`p-2.5 rounded-lg border transition-all ${
                      activeStep.id === 'act_email'
                        ? 'border-[#1473E6] bg-[#1473E6]/10'
                        : 'border-[#323339] bg-[#18191C]'
                    }`}
                  >
                    <div className="flex items-center justify-between text-xs text-[#9CA3AF] mb-1">
                      <label htmlFor="live-email-input">Work Email</label>
                      <span className="text-[#10B981] font-medium">99% Match</span>
                    </div>
                    <input
                      id="live-email-input"
                      type="email"
                      value={previewEmail}
                      onFocus={() => selectActionStep(1)}
                      onChange={(e) => setPreviewEmail(e.target.value)}
                      placeholder="name@company.com"
                      className="w-full bg-[#121316] border border-[#2D2E34] focus:border-[#1473E6] rounded px-2.5 py-1.5 text-xs font-mono text-white focus:outline-none"
                    />
                  </div>

                  {/* Interactive Password Input */}
                  <div
                    className={`p-2.5 rounded-lg border transition-all ${
                      activeStep.id === 'act_password'
                        ? 'border-[#1473E6] bg-[#1473E6]/10'
                        : 'border-[#323339] bg-[#18191C]'
                    }`}
                  >
                    <div className="flex items-center justify-between text-xs text-[#9CA3AF] mb-1">
                      <label htmlFor="live-password-input">Password</label>
                      <button
                        type="button"
                        onClick={() => setMaskPassword(!maskPassword)}
                        className="text-[#F59E0B] font-medium flex items-center gap-1 hover:underline"
                      >
                        {maskPassword ? (
                          <>
                            <ShieldCheck className="w-3.5 h-3.5" /> Auto-Blurred (Show)
                          </>
                        ) : (
                          <>
                            <Eye className="w-3.5 h-3.5" /> Visible (Blur)
                          </>
                        )}
                      </button>
                    </div>
                    <input
                      id="live-password-input"
                      type={maskPassword ? 'password' : 'text'}
                      value={previewPassword}
                      onFocus={() => selectActionStep(2)}
                      onChange={(e) => setPreviewPassword(e.target.value)}
                      placeholder="Enter password..."
                      className="w-full bg-[#121316] border border-[#2D2E34] focus:border-[#1473E6] rounded px-2.5 py-1.5 text-xs font-mono text-white focus:outline-none"
                    />
                  </div>

                  {/* Interactive Login Submit Button with 98% Confidence Badge */}
                  <div
                    className={`p-3 rounded-lg border-2 transition-all ${
                      activeStep.id === 'act_login'
                        ? 'border-[#1473E6] bg-[#1473E6]/15'
                        : 'border-[#10B981] bg-[#18191C]'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs font-medium text-[#D1D5DB]">#login-submit</span>
                      <span className="px-2 py-0.5 rounded-full bg-[#10B981] text-black text-[11px] font-bold">
                        98% confidence Login Button
                      </span>
                    </div>
                    <button
                      type="submit"
                      className="w-full py-2.5 px-4 rounded-md bg-[#1473E6] hover:bg-[#0D66D0] active:scale-[0.99] text-white text-xs font-semibold flex items-center justify-center space-x-2 cursor-pointer transition-all shadow-md"
                    >
                      <span>Log In to Workspace</span>
                      <MousePointerClick className="w-4 h-4" />
                    </button>
                  </div>
                </form>
              ) : (
                /* Authenticated Sprint Dashboard (Interactive!) */
                <div className="w-full max-w-lg bg-[#1F2024] border border-[#10B981] rounded-xl p-4 space-y-3 shadow-lg">
                  <div className="flex items-center justify-between pb-2.5 border-b border-[#323339]">
                    <div className="flex items-center space-x-2">
                      <div className="w-6 h-6 rounded-full bg-[#10B981]/20 text-[#10B981] flex items-center justify-center">
                        <Check className="w-4 h-4" />
                      </div>
                      <div>
                        <div className="text-xs font-semibold text-white">
                          Logged in as {previewEmail || 'architect@tmgstudio.dev'}
                        </div>
                        <div className="text-[11px] text-[#10B981]">
                          Linear Engineering Sprint Dashboard • Active Session
                        </div>
                      </div>
                    </div>

                    <button
                      onClick={logoutPreview}
                      className="flex items-center space-x-1 px-2.5 py-1 rounded bg-[#2B2C32] hover:bg-[#36373E] text-xs text-[#D1D5DB] hover:text-white"
                    >
                      <LogOut className="w-3.5 h-3.5" />
                      <span>Sign Out</span>
                    </button>
                  </div>

                  {/* Create Sprint Issue Form inside Dashboard */}
                  <form onSubmit={handleCreateSprintIssue} className="flex items-center gap-2">
                    <input
                      type="text"
                      value={newIssueTitle}
                      onChange={(e) => setNewIssueTitle(e.target.value)}
                      placeholder="Create a new sprint issue (e.g. Fix OAuth redirect)..."
                      className="flex-1 bg-[#141518] border border-[#34353C] focus:border-[#1473E6] rounded-md px-3 py-1.5 text-xs text-white focus:outline-none"
                    />
                    <button
                      type="submit"
                      className="px-3 py-1.5 rounded-md bg-[#1473E6] hover:bg-[#0D66D0] text-white text-xs font-semibold flex items-center space-x-1 shrink-0"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Add Issue</span>
                    </button>
                  </form>

                  {/* Active Sprint Issues List */}
                  <div className="space-y-1.5 max-h-36 overflow-y-auto pr-1">
                    {sprintIssues.map((issue) => (
                      <div
                        key={issue.id}
                        className="px-3 py-2 rounded-lg bg-[#18191C] border border-[#323339] flex items-center justify-between text-xs"
                      >
                        <div className="flex items-center space-x-2">
                          <span className="font-mono text-[#60A5FA] font-semibold">
                            {issue.id}
                          </span>
                          <span className="text-white">{issue.title}</span>
                        </div>
                        <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-[#10B981]/15 text-[#10B981]">
                          {issue.status}
                        </span>
                      </div>
                    ))}
                  </div>

                  <div className="pt-2 border-t border-[#323339] flex items-center justify-between">
                    <span className="text-xs text-[#9CA3AF]">
                      All 5 tutorial steps recorded & synced
                    </span>
                    <button
                      onClick={() => setActiveView('editor')}
                      className="px-3.5 py-1.5 rounded-md bg-[#1473E6] hover:bg-[#0D66D0] text-white text-xs font-semibold inline-flex items-center space-x-1.5"
                    >
                      <span>Open in Pro Editor</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="flex items-center justify-between text-xs text-[#9CA3AF] shrink-0">
            <span>
              {showDashboard
                ? 'Authenticated! You can add sprint issues above or switch to Pro Editor.'
                : 'Tip: Click "Log In to Workspace" above to test logging in live.'}
            </span>
            <span className="font-mono text-white">
              Time: 00:{Math.floor(explorationTimeSec).toString().padStart(2, '0')} / 00:13
            </span>
          </div>
        </main>

        {/* RIGHT PANEL: Voiceover Script (3 Cols) */}
        <aside className="col-span-3 bg-[#212226] border border-[#323339] rounded-lg p-3.5 flex flex-col justify-between min-h-0">
          <div className="flex items-center justify-between pb-2.5 border-b border-[#323339] shrink-0">
            <div>
              <h2 className="text-xs font-semibold text-white">3. Voiceover Script</h2>
              <p className="text-[11px] text-[#9CA3AF]">Synced to browser actions</p>
            </div>
            <span className="px-2 py-0.5 rounded-full bg-[#10B981]/15 text-[#10B981] text-[11px] font-medium">
              Auto-Synced
            </span>
          </div>

          <div className="flex-1 overflow-y-auto space-y-2 my-2.5 pr-1">
            {scriptBlocks.map((block, idx) => {
              const isActive = idx === activeActionIndex;
              const isEditing = editingScriptId === block.id;

              return (
                <div
                  key={block.id}
                  onClick={() => selectActionStep(idx)}
                  className={`p-3 rounded-lg border cursor-pointer transition-all ${
                    isActive
                      ? 'bg-[#1473E6]/15 border-[#1473E6]'
                      : 'bg-[#18191C] border-[#323339] hover:border-[#464750]'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1.5">
                    <span
                      className={`px-2 py-0.5 rounded text-[11px] font-mono font-semibold ${
                        isActive ? 'bg-[#1473E6] text-white' : 'bg-[#26272C] text-[#9CA3AF]'
                      }`}
                    >
                      {block.startTimecode} – {block.endTimecode}
                    </span>

                    <div
                      className="flex items-center space-x-1"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <button
                        onClick={() => handleCopyScript(block.id, block.textEn)}
                        className="px-2 py-0.5 rounded bg-[#26272C] hover:bg-[#34353C] text-[11px] text-[#D1D5DB] flex items-center space-x-1"
                      >
                        {copiedId === block.id ? (
                          <Check className="w-3 h-3 text-[#10B981]" />
                        ) : (
                          <Copy className="w-3 h-3" />
                        )}
                        <span>Copy</span>
                      </button>
                      <button
                        onClick={() =>
                          isEditing
                            ? handleSaveEdit(block.id)
                            : handleStartEdit(block.id, block.textEn)
                        }
                        className="px-2 py-0.5 rounded bg-[#26272C] hover:bg-[#34353C] text-[11px] text-[#D1D5DB] flex items-center space-x-1"
                      >
                        <Edit3 className="w-3 h-3" />
                        <span>{isEditing ? 'Save' : 'Edit'}</span>
                      </button>
                    </div>
                  </div>

                  {isEditing ? (
                    <div className="space-y-2" onClick={(e) => e.stopPropagation()}>
                      <textarea
                        rows={3}
                        value={editDraft}
                        onChange={(e) => setEditDraft(e.target.value)}
                        className="w-full p-2 rounded bg-[#121316] border border-[#1473E6] text-xs text-white focus:outline-none"
                      />
                    </div>
                  ) : (
                    <p className="text-xs text-[#F3F4F6] leading-relaxed">{block.textEn}</p>
                  )}
                </div>
              );
            })}
          </div>

          <div className="pt-2.5 border-t border-[#323339] flex items-center justify-between text-xs text-[#9CA3AF] shrink-0">
            <span>{totalWords} words total</span>
            <span>Duration: 00:13.5</span>
          </div>
        </aside>
      </div>

      {/* BOTTOM ACTION TIMELINE */}
      <div className="bg-[#212226] border border-[#323339] rounded-lg px-4 py-2.5 flex flex-col gap-2 shrink-0">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <span className="text-xs font-semibold text-white">Recorded Steps & Audio</span>
            <span className="px-2.5 py-0.5 rounded-full bg-[#1473E6]/20 text-[#60A5FA] text-xs font-medium">
              Zoom +150% on Login Click
            </span>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={() => setStatusNotification('Project saved')}
              className="flex items-center space-x-1.5 px-3 py-1 rounded-md bg-[#2B2C32] hover:bg-[#36373E] text-xs font-medium text-white transition-colors"
            >
              <Save className="w-3.5 h-3.5" />
              <span>Save</span>
            </button>
            <button
              onClick={() => setActiveView('editor')}
              className="flex items-center space-x-1.5 px-3.5 py-1 rounded-md bg-[#1473E6] hover:bg-[#0D66D0] text-xs font-semibold text-white transition-colors"
            >
              <span>Edit in Timeline</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        <div className="relative h-12 bg-[#18191C] border border-[#323339] rounded-lg px-2 flex items-center overflow-hidden">
          <div className="absolute inset-0 flex items-center justify-between px-3 opacity-25 pointer-events-none">
            {waveformBars.map((heightPct, i) => (
              <div
                key={i}
                style={{ height: `${heightPct}%` }}
                className="w-1 rounded-full bg-[#60A5FA]"
              />
            ))}
          </div>

          <div className="relative z-10 w-full grid grid-cols-5 gap-2">
            {actionSteps.map((step, idx) => {
              const isSelected = idx === activeActionIndex;
              return (
                <button
                  key={step.id}
                  onClick={() => selectActionStep(idx)}
                  className={`px-3 py-1.5 rounded-md border text-left transition-all flex items-center justify-between ${
                    isSelected
                      ? 'bg-[#1473E6] border-[#1473E6] text-white shadow-sm'
                      : 'bg-[#24252A]/95 border-[#36373F] text-[#E5E7EB] hover:border-[#52535E]'
                  }`}
                >
                  <div className="truncate">
                    <div className="text-xs font-semibold truncate">{step.label}</div>
                    <div
                      className={`text-[10px] font-mono ${
                        isSelected ? 'text-white/80' : 'text-[#9CA3AF]'
                      }`}
                    >
                      {step.timecode} • {step.zoomScalePct}%
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};
