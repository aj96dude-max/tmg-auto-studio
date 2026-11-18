import React, { useEffect, useMemo, useState } from 'react';
import {
  Check,
  ChevronDown,
  ChevronRight,
  Cpu,
  Crop,
  Download,
  EyeOff,
  Film,
  FolderPlus,
  Grid,
  Magnet,
  MousePointer,
  MousePointerClick,
  Music,
  Pause,
  Play,
  Scissors,
  Sliders,
  Sparkles,
  SkipBack,
  SkipForward,
  StepBack,
  StepForward,
  Subtitles,
  Type,
  Video,
  Volume2,
  ZoomIn,
} from 'lucide-react';
import { useStudioStore } from '../../store/useStudioStore';
import type { EditorTool, MediaLibraryTab } from '../../types/studio';

function formatCleanTimecode(sec: number, fps = 60): string {
  const safe = Math.max(0, sec);
  const mins = Math.floor(safe / 60);
  const secs = Math.floor(safe % 60);
  const frames = Math.floor((safe - Math.floor(safe)) * fps);
  return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}:${frames
    .toString()
    .padStart(2, '0')}`;
}

export const ProEditorView: React.FC = () => {
  const {
    mediaTab,
    setMediaTab,
    mediaAssets,
    selectedMediaId,
    selectMediaAsset,
    importCustomMediaAsset,
    monitorMode,
    setMonitorMode,
    showGrid3x3,
    toggleGrid3x3,
    isPlaying,
    togglePlayPause,
    setIsPlaying,
    playheadSec,
    setPlayheadSec,
    timelineDurationSec,
    fps,
    stepFrame,
    activeTool,
    setActiveTool,
    cursorHighlightEnabled,
    cropFrameEnabled,
    selectedClipId,
    selectClip,
    splitClipAtPlayhead,
    trimActiveClipAtPlayhead,
    addZoomKeyframeAtPlayhead,
    addBlurRegionAtPlayhead,
    toggleBlurRegion,
    updateCaptionText,
    timelineZoom,
    setTimelineZoom,
    magneticSnap,
    toggleMagneticSnap,
    timelineClips,
    toggleTrackMute,
    bilingualCaptions,
    zoomKeyframes,
    blurRegions,
    inspector,
    updateInspector,
    isExporting4K,
    exportProgressPct,
    start4KExport,
    tickExportProgress,
    faceTrack,
    previewEmail,
    setPreviewEmail,
    previewPassword,
    setPreviewPassword,
    performInteractiveLogin,
    sprintIssues,
    setStatusNotification,
  } = useStudioStore();

  const [openTextPanel, setOpenTextPanel] = useState(true);
  const [openAudioPanel, setOpenAudioPanel] = useState(true);
  const [openExportPanel, setOpenExportPanel] = useState(true);

  useEffect(() => {
    if (!isPlaying) return;
    let lastTime = performance.now();
    let animId: number;

    const tick = (now: number) => {
      const dt = (now - lastTime) / 1000;
      lastTime = now;
      const nextSec = playheadSec + dt;
      if (nextSec >= timelineDurationSec) {
        setPlayheadSec(0);
        setIsPlaying(false);
        return;
      }
      setPlayheadSec(nextSec);
      animId = requestAnimationFrame(tick);
    };

    animId = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(animId);
  }, [isPlaying, playheadSec, timelineDurationSec, setPlayheadSec, setIsPlaying]);

  useEffect(() => {
    if (!isExporting4K) return;
    const timer = setInterval(() => {
      const next = Math.min(100, exportProgressPct + 15);
      const ffmpegCmd = `ffmpeg -hwaccel cuda -i screen_recording_001.mp4 -c:v h264_nvenc -b:v ${inspector.exportBitrateMbps}M -r 60 TMG_Master_4K60.mp4`;
      tickExportProgress(next, ffmpegCmd);
    }, 450);
    return () => clearInterval(timer);
  }, [isExporting4K, exportProgressPct, inspector.exportBitrateMbps, tickExportProgress]);

  const currentZoomScale = useMemo(() => {
    if (monitorMode === 'preview') return 100;
    const sorted = [...zoomKeyframes].sort((a, b) => a.timeSec - b.timeSec);
    for (let i = sorted.length - 1; i >= 0; i--) {
      if (playheadSec >= sorted[i].timeSec) {
        return sorted[i].scalePct;
      }
    }
    return 100;
  }, [playheadSec, zoomKeyframes, monitorMode]);

  const activeCaption = useMemo(() => {
    return (
      bilingualCaptions.find((c) => playheadSec >= c.startSec && playheadSec <= c.endSec) ||
      bilingualCaptions[0]
    );
  }, [playheadSec, bilingualCaptions]);

  const activeBlurMasks = useMemo(() => {
    return blurRegions.filter(
      (b) => b.active && playheadSec >= b.startSec && playheadSec <= b.endSec
    );
  }, [playheadSec, blurRegions]);

  const filteredAssets = mediaAssets.filter((a) => a.category === mediaTab);

  const handleToolClick = (toolId: EditorTool) => {
    setActiveTool(toolId);
    if (toolId === 'split') {
      splitClipAtPlayhead();
    } else if (toolId === 'trim') {
      trimActiveClipAtPlayhead();
    } else if (toolId === 'auto_zoom') {
      addZoomKeyframeAtPlayhead(125);
    } else if (toolId === 'blur') {
      if (blurRegions.length > 0) {
        toggleBlurRegion(blurRegions[0].id);
      } else {
        addBlurRegionAtPlayhead();
      }
    } else if (toolId === 'text') {
      setOpenTextPanel(true);
      setStatusNotification('Edit active subtitle text in the right Inspector');
    }
  };

  const handleImportMedia = async () => {
    const bridge = (window as unknown as { tmgStudioBridge?: { selectMediaFile?: () => Promise<string | null> } })
      .tmgStudioBridge;
    if (bridge?.selectMediaFile) {
      const filePath = await bridge.selectMediaFile();
      if (filePath) {
        const basename = filePath.split(/[\\/]/).pop() || 'custom_capture_4k.mp4';
        importCustomMediaAsset(basename);
        return;
      }
    }
    importCustomMediaAsset(`screen_recording_00${mediaAssets.length + 1}.mp4`, 'video_4k');
  };

  const toolsList: { id: EditorTool; label: string; icon: React.ReactNode }[] = [
    { id: 'trim', label: 'Trim', icon: <Sliders className="w-3.5 h-3.5" /> },
    { id: 'split', label: 'Split', icon: <Scissors className="w-3.5 h-3.5" /> },
    { id: 'crop', label: 'Crop', icon: <Crop className="w-3.5 h-3.5" /> },
    { id: 'auto_zoom', label: 'Auto-Zoom', icon: <ZoomIn className="w-3.5 h-3.5" /> },
    { id: 'cursor_highlight', label: 'Cursor Highlight', icon: <MousePointer className="w-3.5 h-3.5" /> },
    { id: 'text', label: 'Text', icon: <Type className="w-3.5 h-3.5" /> },
    { id: 'blur', label: 'Blur', icon: <EyeOff className="w-3.5 h-3.5" /> },
  ];

  const isLoggedInOnTimeline = playheadSec >= 10.5;

  return (
    <div className="flex flex-col h-[calc(100vh-3rem)] bg-[#161618] text-[#F3F4F6] p-2 gap-2 select-none overflow-hidden">
      {/* TOP WORKSPACE PANELS */}
      <div className="flex-1 grid grid-cols-12 gap-2 min-h-0">
        {/* LEFT PANEL: Media Bin (3 Cols) */}
        <aside className="col-span-3 bg-[#212226] border border-[#323339] rounded-lg p-3 flex flex-col justify-between min-h-0">
          <div>
            <div className="grid grid-cols-3 gap-1 bg-[#18191C] p-1 rounded-lg border border-[#323339] mb-3">
              {(
                [
                  { id: 'project', label: 'Project' },
                  { id: 'effects', label: 'Effects' },
                  { id: 'audio', label: 'Audio' },
                ] as { id: MediaLibraryTab; label: string }[]
              ).map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setMediaTab(tab.id)}
                  className={`py-1.5 rounded-md text-xs font-medium transition-colors ${
                    mediaTab === tab.id
                      ? 'bg-[#1473E6] text-white'
                      : 'text-[#9CA3AF] hover:text-white hover:bg-[#26272C]'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </div>

          <div className="flex-1 overflow-y-auto grid grid-cols-2 gap-2 content-start pr-0.5">
            {filteredAssets.map((asset) => {
              const isSelected = selectedMediaId === asset.id;
              return (
                <div
                  key={asset.id}
                  onClick={() => selectMediaAsset(asset.id)}
                  className={`p-2 rounded-lg border cursor-pointer transition-all flex flex-col justify-between ${
                    isSelected
                      ? 'bg-[#1473E6]/15 border-[#1473E6]'
                      : 'bg-[#18191C] border-[#323339] hover:border-[#4A4B54]'
                  }`}
                >
                  <div className="h-20 rounded-md bg-[#121316] border border-[#2C2D33] flex items-center justify-center relative overflow-hidden mb-2">
                    {asset.type === 'video_vertical' && (
                      <div className="w-8 h-14 rounded border border-[#10B981] bg-[#10B981]/15 flex items-center justify-center text-[10px] font-semibold text-[#10B981]">
                        9:16
                      </div>
                    )}
                    {asset.type === 'video_4k' && (
                      <div className="flex flex-col items-center text-[#60A5FA]">
                        <Video className="w-5 h-5 mb-1" />
                        <span className="text-[10px] font-semibold">4K 60fps</span>
                      </div>
                    )}
                    {(asset.type === 'audio_wav' || asset.type === 'audio_mp3') && (
                      <div className="flex items-end space-x-1 h-8">
                        {[35, 75, 50, 90, 60, 80, 45, 70].map((h, i) => (
                          <span
                            key={i}
                            style={{ height: `${h}%` }}
                            className="w-1 bg-[#F59E0B] rounded-full"
                          />
                        ))}
                      </div>
                    )}
                    {asset.type === 'effect_preset' && (
                      <Sparkles className="w-6 h-6 text-[#60A5FA]" />
                    )}

                    <span className="absolute bottom-1 right-1 px-1.5 py-0.5 rounded bg-black/75 text-[10px] font-mono text-white">
                      {asset.durationLabel}
                    </span>
                  </div>

                  <div>
                    <div className="text-xs font-medium text-white truncate" title={asset.filename}>
                      {asset.filename}
                    </div>
                    <div className="text-[10px] text-[#9CA3AF] truncate mt-0.5">
                      {asset.resolution}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="pt-2.5 mt-2 border-t border-[#323339]">
            <button
              onClick={handleImportMedia}
              className="w-full py-2 px-3 rounded-lg bg-[#2B2C32] hover:bg-[#35363E] border border-[#3E3F48] text-xs font-semibold text-white flex items-center justify-center space-x-2 transition-colors"
            >
              <FolderPlus className="w-4 h-4 text-[#1473E6]" />
              <span>Import Media</span>
            </button>
          </div>
        </aside>

        {/* CENTER PANEL: Video Monitor (6 Cols) */}
        <main className="col-span-6 bg-[#212226] border border-[#323339] rounded-lg p-3 flex flex-col justify-between min-h-0 overflow-hidden">
          <div className="flex items-center justify-between pb-2 border-b border-[#323339] shrink-0">
            <div className="flex items-center space-x-2">
              <div className="flex items-center bg-[#18191C] p-0.5 rounded-md border border-[#323339]">
                <button
                  onClick={() => setMonitorMode('preview')}
                  className={`px-3 py-1 rounded text-xs font-medium transition-colors ${
                    monitorMode === 'preview'
                      ? 'bg-[#1473E6] text-white'
                      : 'text-[#9CA3AF] hover:text-white'
                  }`}
                >
                  Preview
                </button>
                <button
                  onClick={() => setMonitorMode('program')}
                  className={`px-3 py-1 rounded text-xs font-medium transition-colors ${
                    monitorMode === 'program'
                      ? 'bg-[#1473E6] text-white'
                      : 'text-[#9CA3AF] hover:text-white'
                  }`}
                >
                  Program
                </button>
              </div>

              <button
                onClick={toggleGrid3x3}
                className={`flex items-center space-x-1.5 px-2.5 py-1 rounded-md border text-xs transition-colors ${
                  showGrid3x3
                    ? 'bg-[#1473E6]/20 border-[#1473E6] text-white'
                    : 'bg-[#18191C] border-[#323339] text-[#9CA3AF]'
                }`}
              >
                <Grid className="w-3.5 h-3.5" />
                <span>3×3 Grid</span>
              </button>
            </div>

            <div className="flex items-center space-x-2 text-xs font-mono">
              <span className="px-2.5 py-1 rounded-md bg-[#18191C] border border-[#323339] text-[#60A5FA] font-semibold">
                {formatCleanTimecode(playheadSec, fps)}
              </span>
              <span className="text-[#6B7280]">/</span>
              <span className="px-2.5 py-1 rounded-md bg-[#18191C] border border-[#323339] text-[#9CA3AF]">
                {formatCleanTimecode(timelineDurationSec, fps)}
              </span>
            </div>
          </div>

          {/* 16:9 VIDEO STAGE */}
          <div className="relative flex-1 my-2 bg-[#111215] border border-[#2E2F36] rounded-lg overflow-hidden flex items-center justify-center">
            <div
              className="relative w-[90%] h-[86%] bg-[#18191D] border border-[#323339] rounded-lg overflow-hidden transition-transform duration-200 flex flex-col justify-between p-4"
              style={{
                transform: `scale(${currentZoomScale / 100})`,
                transformOrigin: '50% 58%',
              }}
            >
              <div className="flex items-center justify-between text-xs text-[#9CA3AF]">
                <span>
                  {playheadSec < 8.5 ? 'screen_recording_001.mp4' : 'screen_recording_002.mp4'}
                </span>
                <span className="px-2 py-0.5 rounded bg-[#26272C] text-[#60A5FA] font-mono text-[11px]">
                  Zoom {currentZoomScale}%
                </span>
              </div>

              {!isLoggedInOnTimeline ? (
                <div className="my-auto mx-auto w-full max-w-sm bg-[#222328] border border-[#383942] rounded-xl p-4 space-y-2.5 relative shadow-md">
                  <div className="text-xs font-semibold text-white">Linear Workspace Sign In</div>
                  <input
                    type="email"
                    value={previewEmail}
                    onChange={(e) => setPreviewEmail(e.target.value)}
                    className="w-full p-2 rounded-md bg-[#16171A] border border-[#323339] focus:border-[#1473E6] text-xs font-mono text-white focus:outline-none"
                  />

                  <div className="relative">
                    <input
                      type="password"
                      value={previewPassword}
                      onChange={(e) => setPreviewPassword(e.target.value)}
                      className="w-full p-2 rounded-md bg-[#16171A] border border-[#323339] focus:border-[#1473E6] text-xs font-mono text-white focus:outline-none"
                    />
                    {activeBlurMasks.length > 0 && (
                      <div
                        onClick={() => toggleBlurRegion(activeBlurMasks[0].id)}
                        className="absolute inset-0 bg-[#222328]/75 backdrop-blur-md border border-[#F59E0B] rounded-md flex items-center justify-center cursor-pointer"
                        title="Click to toggle password blur"
                      >
                        <span className="text-[10px] font-medium text-[#F59E0B]">
                          Password Blurred (Click to toggle)
                        </span>
                      </div>
                    )}
                  </div>

                  <button
                    type="button"
                    onClick={performInteractiveLogin}
                    className="w-full py-2 px-3 rounded-md bg-[#1473E6] hover:bg-[#0D66D0] text-white text-xs font-semibold flex items-center justify-center space-x-1.5 cursor-pointer transition-colors"
                  >
                    <span>Log In to Workspace</span>
                    <MousePointerClick className="w-3.5 h-3.5" />
                  </button>

                  {cursorHighlightEnabled && (
                    <div
                      className="absolute pointer-events-none transition-all duration-150"
                      style={{
                        left: playheadSec < 6 ? '55%' : '48%',
                        top: playheadSec < 6 ? '42%' : '76%',
                      }}
                    >
                      <div className="w-7 h-7 rounded-full border-2 border-[#F59E0B] bg-[#F59E0B]/25 flex items-center justify-center">
                        <div className="w-1.5 h-1.5 rounded-full bg-white" />
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="my-auto mx-auto w-full max-w-sm bg-[#222328] border border-[#10B981] rounded-xl p-4 space-y-2 relative shadow-md">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-white flex items-center gap-1.5">
                      <Check className="w-4 h-4 text-[#10B981]" /> Authenticated Dashboard
                    </span>
                    <button
                      onClick={() => setPlayheadSec(3.5)}
                      className="text-[11px] text-[#60A5FA] hover:underline"
                    >
                      Rewind to Login
                    </button>
                  </div>
                  <div className="space-y-1">
                    {sprintIssues.slice(0, 2).map((iss) => (
                      <div
                        key={iss.id}
                        className="px-2.5 py-1.5 rounded bg-[#16171A] border border-[#323339] flex items-center justify-between text-xs"
                      >
                        <span className="text-white truncate">{iss.title}</span>
                        <span className="text-[10px] text-[#10B981] font-mono ml-2">
                          {iss.status}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="text-[11px] text-[#6B7280] flex justify-between">
                <span>4K 60FPS Preview</span>
                <span>16:9</span>
              </div>
            </div>

            {showGrid3x3 && (
              <div className="absolute inset-0 pointer-events-none grid grid-cols-3 grid-rows-3">
                {Array.from({ length: 9 }).map((_, idx) => (
                  <div key={idx} className="border border-white/10" />
                ))}
              </div>
            )}

            {cropFrameEnabled && (
              <div className="absolute inset-6 border-2 border-dashed border-[#F59E0B] rounded-lg pointer-events-none" />
            )}

            {monitorMode === 'program' && (
              <div
                className="absolute top-3 right-3 bg-[#212226]/95 border border-[#10B981] rounded-lg p-2 flex flex-col items-center shadow-xl"
                style={{ width: `${Math.max(18, Math.min(32, faceTrack.scalePct))}%` }}
              >
                <div className="w-8 h-8 rounded-full bg-[#10B981]/20 border border-[#10B981] flex items-center justify-center text-[10px] font-semibold text-[#10B981] mb-1">
                  PIP
                </div>
                <span className="text-[10px] text-white font-medium">phone_intro.mp4</span>
                <span className="text-[9px] text-[#10B981]">{faceTrack.scalePct}% Cutout</span>
              </div>
            )}

            {inspector.showBilingualCaptions && activeCaption && (
              <div className="absolute bottom-3 left-1/2 -translate-x-1/2 w-[80%] bg-black/80 backdrop-blur-sm border border-white/15 rounded-lg px-4 py-2 text-center pointer-events-none">
                <div className="text-xs font-semibold text-white">{activeCaption.textEn}</div>
                <div className="text-xs text-[#60A5FA] mt-0.5" dir="rtl">
                  {activeCaption.textUr}
                </div>
              </div>
            )}
          </div>

          {/* Centered Playback Controls */}
          <div className="flex items-center justify-center space-x-2 pt-1 shrink-0">
            <button
              onClick={() => setPlayheadSec(0)}
              className="p-2 rounded-md bg-[#18191C] hover:bg-[#2B2C32] text-[#D1D5DB] hover:text-white"
              title="Jump to Start"
            >
              <SkipBack className="w-4 h-4" />
            </button>
            <button
              onClick={() => stepFrame(-1)}
              className="p-2 rounded-md bg-[#18191C] hover:bg-[#2B2C32] text-[#D1D5DB] hover:text-white"
              title="Previous Frame"
            >
              <StepBack className="w-4 h-4" />
            </button>
            <button
              onClick={togglePlayPause}
              className="px-5 py-2 rounded-full bg-[#1473E6] hover:bg-[#0D66D0] text-white flex items-center space-x-1.5 text-xs font-semibold shadow-sm"
            >
              {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4 fill-current" />}
              <span>{isPlaying ? 'Pause' : 'Play'}</span>
            </button>
            <button
              onClick={() => stepFrame(1)}
              className="p-2 rounded-md bg-[#18191C] hover:bg-[#2B2C32] text-[#D1D5DB] hover:text-white"
              title="Next Frame"
            >
              <StepForward className="w-4 h-4" />
            </button>
            <button
              onClick={() => setPlayheadSec(timelineDurationSec)}
              className="p-2 rounded-md bg-[#18191C] hover:bg-[#2B2C32] text-[#D1D5DB] hover:text-white"
              title="Jump to End"
            >
              <SkipForward className="w-4 h-4" />
            </button>
          </div>
        </main>

        {/* RIGHT PANEL: Properties & Export Inspector (3 Cols) */}
        <aside className="col-span-3 bg-[#212226] border border-[#323339] rounded-lg p-3 flex flex-col justify-between min-h-0 overflow-y-auto">
          <div className="space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-[#323339]">
              <h2 className="text-xs font-semibold text-white">Properties & Export</h2>
              <span className="text-[11px] text-[#9CA3AF]">Inspector</span>
            </div>

            {/* 1. Text & Captions Card */}
            <div className="rounded-lg bg-[#18191C] border border-[#323339] overflow-hidden">
              <button
                onClick={() => setOpenTextPanel(!openTextPanel)}
                className="w-full px-3 py-2.5 flex items-center justify-between text-xs font-semibold text-white hover:bg-[#24252A]"
              >
                <div className="flex items-center space-x-2">
                  <Subtitles className="w-4 h-4 text-[#1473E6]" />
                  <span>Text & Captions</span>
                </div>
                {openTextPanel ? (
                  <ChevronDown className="w-4 h-4 text-[#9CA3AF]" />
                ) : (
                  <ChevronRight className="w-4 h-4 text-[#9CA3AF]" />
                )}
              </button>

              {openTextPanel && (
                <div className="p-3 space-y-2.5 border-t border-[#323339] text-xs">
                  <div className="flex items-center justify-between">
                    <span className="text-[#9CA3AF]">Font Style</span>
                    <select
                      value={inspector.captionFontFamily}
                      onChange={(e) =>
                        updateInspector(
                          'captionFontFamily',
                          e.target.value as typeof inspector.captionFontFamily
                        )
                      }
                      className="bg-[#212226] border border-[#383942] rounded-md px-2.5 py-1 text-xs text-white"
                    >
                      <option value="Inter SemiBold">Inter SemiBold</option>
                      <option value="Inter Medium">Inter Medium</option>
                      <option value="JetBrains Mono">JetBrains Mono</option>
                    </select>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-[#9CA3AF]">Animation</span>
                    <select
                      value={inspector.captionAnimation}
                      onChange={(e) =>
                        updateInspector(
                          'captionAnimation',
                          e.target.value as typeof inspector.captionAnimation
                        )
                      }
                      className="bg-[#212226] border border-[#383942] rounded-md px-2.5 py-1 text-xs text-white"
                    >
                      <option value="Fade In + Slide Up">Fade In + Slide Up</option>
                      <option value="Instant Cut">Instant Cut</option>
                      <option value="Typewriter Reveal">Typewriter Reveal</option>
                    </select>
                  </div>

                  {activeCaption && (
                    <div className="pt-1 space-y-1">
                      <span className="text-[11px] text-[#9CA3AF]">Active Subtitle (EN):</span>
                      <input
                        type="text"
                        value={activeCaption.textEn}
                        onChange={(e) =>
                          updateCaptionText(activeCaption.id, e.target.value, activeCaption.textUr)
                        }
                        className="w-full bg-[#121316] border border-[#34353C] focus:border-[#1473E6] rounded px-2 py-1 text-xs text-white focus:outline-none"
                      />
                    </div>
                  )}

                  <label className="flex items-center justify-between pt-1 cursor-pointer">
                    <span className="text-[#D1D5DB]">Show Bilingual Subtitles (EN/UR)</span>
                    <input
                      type="checkbox"
                      checked={inspector.showBilingualCaptions}
                      onChange={(e) =>
                        updateInspector('showBilingualCaptions', e.target.checked)
                      }
                      className="accent-[#1473E6] w-4 h-4 rounded"
                    />
                  </label>
                </div>
              )}
            </div>

            {/* 2. Audio Volume Card */}
            <div className="rounded-lg bg-[#18191C] border border-[#323339] overflow-hidden">
              <button
                onClick={() => setOpenAudioPanel(!openAudioPanel)}
                className="w-full px-3 py-2.5 flex items-center justify-between text-xs font-semibold text-white hover:bg-[#24252A]"
              >
                <div className="flex items-center space-x-2">
                  <Volume2 className="w-4 h-4 text-[#10B981]" />
                  <span>Audio Volume</span>
                </div>
                {openAudioPanel ? (
                  <ChevronDown className="w-4 h-4 text-[#9CA3AF]" />
                ) : (
                  <ChevronRight className="w-4 h-4 text-[#9CA3AF]" />
                )}
              </button>

              {openAudioPanel && (
                <div className="p-3 space-y-2.5 border-t border-[#323339] text-xs">
                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-[#9CA3AF]">Background Music Volume</span>
                      <span className="font-mono font-semibold text-[#10B981]">
                        {inspector.bgmVolumePct}%
                      </span>
                    </div>
                    <input
                      type="range"
                      min={0}
                      max={100}
                      value={inspector.bgmVolumePct}
                      onChange={(e) =>
                        updateInspector('bgmVolumePct', parseInt(e.target.value, 10))
                      }
                      className="tmg-slider w-full"
                    />
                  </div>
                </div>
              )}
            </div>

            {/* 3. Export Card */}
            <div className="rounded-lg bg-[#18191C] border border-[#323339] overflow-hidden">
              <button
                onClick={() => setOpenExportPanel(!openExportPanel)}
                className="w-full px-3 py-2.5 flex items-center justify-between text-xs font-semibold text-white hover:bg-[#24252A]"
              >
                <div className="flex items-center space-x-2">
                  <Cpu className="w-4 h-4 text-[#1473E6]" />
                  <span>Export Video</span>
                </div>
                {openExportPanel ? (
                  <ChevronDown className="w-4 h-4 text-[#9CA3AF]" />
                ) : (
                  <ChevronRight className="w-4 h-4 text-[#9CA3AF]" />
                )}
              </button>

              {openExportPanel && (
                <div className="p-3 space-y-2.5 border-t border-[#323339] text-xs">
                  <div className="flex items-center justify-between">
                    <span className="text-[#9CA3AF]">Quality</span>
                    <span className="px-2 py-0.5 rounded bg-[#212226] border border-[#383942] font-semibold text-white">
                      4K 60FPS
                    </span>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-[#9CA3AF]">Bitrate</span>
                    <span className="px-2 py-0.5 rounded bg-[#212226] border border-[#383942] font-mono text-[#10B981]">
                      {inspector.exportBitrateMbps} Mbps
                    </span>
                  </div>

                  <label className="flex items-center justify-between pt-1 cursor-pointer">
                    <span className="text-[#D1D5DB]">GPU Hardware Acceleration</span>
                    <input
                      type="checkbox"
                      checked={inspector.gpuAcceleration}
                      onChange={(e) => updateInspector('gpuAcceleration', e.target.checked)}
                      className="accent-[#1473E6] w-4 h-4 rounded"
                    />
                  </label>

                  <div className="pt-2">
                    {isExporting4K ? (
                      <div className="space-y-1.5">
                        <div className="flex justify-between text-xs">
                          <span className="text-[#10B981] font-medium">Rendering 4K Video...</span>
                          <span className="font-mono">{exportProgressPct}%</span>
                        </div>
                        <div className="w-full h-2 bg-[#111215] rounded-full overflow-hidden">
                          <div
                            className="h-full bg-[#1473E6] transition-all duration-300"
                            style={{ width: `${exportProgressPct}%` }}
                          />
                        </div>
                      </div>
                    ) : (
                      <button
                        onClick={start4KExport}
                        className="w-full py-2 px-3 rounded-lg bg-[#1473E6] hover:bg-[#0D66D0] text-white text-xs font-semibold flex items-center justify-center space-x-1.5 transition-colors shadow-sm"
                      >
                        <Download className="w-4 h-4" />
                        <span>Export 4K 60FPS (35 Mbps)</span>
                      </button>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </aside>
      </div>

      {/* MIDDLE QUICK TOOL STRIP (7 Tools + Scrubber) */}
      <div className="bg-[#212226] border border-[#323339] rounded-lg px-3 py-1.5 flex items-center justify-between shrink-0">
        <div className="flex items-center space-x-1">
          {toolsList.map((tool) => {
            const isActive = activeTool === tool.id;
            return (
              <button
                key={tool.id}
                onClick={() => handleToolClick(tool.id)}
                className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${
                  isActive
                    ? 'bg-[#1473E6] text-white'
                    : 'text-[#D1D5DB] hover:text-white hover:bg-[#2B2C32]'
                }`}
              >
                {tool.icon}
                <span>{tool.label}</span>
              </button>
            );
          })}
        </div>

        <div className="flex items-center space-x-4 text-xs">
          <button
            onClick={toggleMagneticSnap}
            className={`flex items-center space-x-1.5 px-2.5 py-1 rounded-md border transition-colors ${
              magneticSnap
                ? 'bg-[#1473E6]/20 border-[#1473E6] text-white'
                : 'bg-[#18191C] border-[#323339] text-[#9CA3AF]'
            }`}
          >
            <Magnet className="w-3.5 h-3.5" />
            <span>Snap</span>
          </button>

          <div className="hidden md:flex items-center space-x-2">
            <span className="text-[#9CA3AF]">Scrub:</span>
            <input
              type="range"
              min={0}
              max={timelineDurationSec}
              step={0.05}
              value={playheadSec}
              onChange={(e) => setPlayheadSec(parseFloat(e.target.value))}
              className="tmg-slider w-36"
            />
          </div>

          <div className="hidden lg:flex items-center space-x-2">
            <span className="text-[#9CA3AF]">Zoom:</span>
            <input
              type="range"
              min={0.8}
              max={2.0}
              step={0.1}
              value={timelineZoom}
              onChange={(e) => setTimelineZoom(parseFloat(e.target.value))}
              className="tmg-slider w-20"
            />
          </div>
        </div>
      </div>

      {/* BOTTOM MULTI-TRACK TIMELINE */}
      <div className="h-56 bg-[#212226] border border-[#323339] rounded-lg flex flex-col justify-between overflow-hidden shrink-0 relative">
        <div className="h-7 bg-[#18191C] border-b border-[#323339] flex items-center text-[11px] font-mono text-[#9CA3AF] shrink-0">
          <div className="w-44 px-3 border-r border-[#323339] font-sans font-semibold text-xs text-white">
            Tracks
          </div>
          <div
            className="flex-1 relative h-full flex items-center justify-between px-4 cursor-pointer"
            onClick={(e) => {
              const rect = e.currentTarget.getBoundingClientRect();
              const ratio = (e.clientX - rect.left) / rect.width;
              setPlayheadSec(ratio * timelineDurationSec);
            }}
          >
            {['00:00', '00:02', '00:04', '00:06', '00:08', '00:10', '00:12', '00:13.5'].map(
              (tc) => (
                <span key={tc}>{tc}</span>
              )
            )}
          </div>
        </div>

        <div className="flex-1 flex flex-col justify-evenly divide-y divide-[#2C2D33] relative">
          {/* Lane 1: Video Clips */}
          <div className="flex items-center h-9 bg-[#1B1C20]">
            <div className="w-44 h-full px-3 bg-[#212226] border-r border-[#323339] flex items-center space-x-2 shrink-0">
              <Film className="w-4 h-4 text-[#1473E6]" />
              <span className="text-xs font-medium text-white">Video Clips</span>
            </div>
            <div className="flex-1 h-full relative px-1 py-1">
              {timelineClips
                .filter((c) => c.trackId === 'video')
                .map((clip) => {
                  const leftPct = (clip.startSec / timelineDurationSec) * 100;
                  const widthPct = ((clip.endSec - clip.startSec) / timelineDurationSec) * 100;
                  const isSel = selectedClipId === clip.id;
                  return (
                    <div
                      key={clip.id}
                      onClick={() => selectClip(clip.id)}
                      style={{ left: `${leftPct}%`, width: `${widthPct}%` }}
                      className={`absolute top-1 bottom-1 rounded-md px-2.5 flex items-center justify-between cursor-pointer border transition-all ${
                        isSel
                          ? 'bg-[#1473E6] border-white text-white shadow-sm'
                          : 'bg-[#1473E6]/35 border-[#1473E6] text-white'
                      }`}
                    >
                      <span className="text-xs font-medium truncate">{clip.label}</span>
                      <span className="text-[10px] opacity-85 shrink-0 ml-1">{clip.metaBadge}</span>
                    </div>
                  );
                })}
            </div>
          </div>

          {/* Lane 2: Voiceover */}
          <div className="flex items-center h-9 bg-[#1B1C20]">
            <div className="w-44 h-full px-3 bg-[#212226] border-r border-[#323339] flex items-center justify-between shrink-0">
              <div className="flex items-center space-x-2">
                <Volume2 className="w-4 h-4 text-[#38BDF8]" />
                <span className="text-xs font-medium text-white">Voiceover</span>
              </div>
              <button
                onClick={() => toggleTrackMute('voiceover')}
                className="text-[10px] text-[#9CA3AF] hover:text-white"
              >
                Mute
              </button>
            </div>
            <div className="flex-1 h-full relative px-2 py-1">
              <div className="w-full h-full rounded-md bg-[#0284C7]/25 border border-[#38BDF8]/60 px-2.5 flex items-center justify-between relative overflow-hidden">
                <span className="text-xs font-medium text-white z-10">
                  {timelineClips.find((c) => c.trackId === 'voiceover')?.label || 'voiceover_EN.wav'}
                </span>
                <div className="absolute inset-0 flex items-center justify-around px-3 opacity-35">
                  {Array.from({ length: 56 }).map((_, i) => (
                    <span
                      key={i}
                      style={{ height: `${25 + ((i * 37) % 60)}%` }}
                      className="w-0.5 rounded-full bg-[#38BDF8]"
                    />
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Lane 3: Captions */}
          <div className="flex items-center h-9 bg-[#1B1C20]">
            <div className="w-44 h-full px-3 bg-[#212226] border-r border-[#323339] flex items-center space-x-2 shrink-0">
              <Subtitles className="w-4 h-4 text-[#A855F7]" />
              <span className="text-xs font-medium text-white">EN/UR Captions</span>
            </div>
            <div className="flex-1 h-full relative px-1 py-1">
              {bilingualCaptions.map((cap) => {
                const leftPct = (cap.startSec / timelineDurationSec) * 100;
                const widthPct = ((cap.endSec - cap.startSec) / timelineDurationSec) * 100;
                return (
                  <div
                    key={cap.id}
                    onClick={() => setPlayheadSec(cap.startSec + 0.2)}
                    style={{ left: `${leftPct}%`, width: `${widthPct}%` }}
                    className="absolute top-1 bottom-1 rounded-md bg-[#A855F7]/25 border border-[#A855F7]/70 px-2 flex items-center cursor-pointer overflow-hidden"
                  >
                    <span className="text-[11px] text-white truncate">{cap.textEn}</span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Lane 4: Music */}
          <div className="flex items-center h-9 bg-[#1B1C20]">
            <div className="w-44 h-full px-3 bg-[#212226] border-r border-[#323339] flex items-center justify-between shrink-0">
              <div className="flex items-center space-x-2">
                <Music className="w-4 h-4 text-[#10B981]" />
                <span className="text-xs font-medium text-white">Music</span>
              </div>
              <span className="text-[11px] font-mono text-[#10B981]">
                {inspector.bgmVolumePct}%
              </span>
            </div>
            <div className="flex-1 h-full relative px-2 py-1">
              <div className="w-full h-full rounded-md bg-[#10B981]/20 border border-[#10B981]/60 px-2.5 flex items-center justify-between relative overflow-hidden">
                <span className="text-xs font-medium text-white z-10">
                  background_music.mp3 ({inspector.bgmVolumePct}%)
                </span>
              </div>
            </div>
          </div>

          {/* Lane 5: Zoom & Blur Keyframes */}
          <div className="flex items-center h-9 bg-[#1B1C20]">
            <div className="w-44 h-full px-3 bg-[#212226] border-r border-[#323339] flex items-center space-x-2 shrink-0">
              <Sparkles className="w-4 h-4 text-[#F59E0B]" />
              <span className="text-xs font-medium text-white">Zoom & Blur</span>
            </div>
            <div className="flex-1 h-full relative px-2 py-1 flex items-center">
              <div className="w-full h-full rounded-md bg-[#26272C] border border-[#3A3B43] px-2.5 flex items-center relative">
                <span className="text-[11px] text-[#F59E0B]">
                  Zoom 110% → 125% → 150% + Blur Keyframes
                </span>
                {zoomKeyframes.map((kf) => {
                  const leftPct = (kf.timeSec / timelineDurationSec) * 100;
                  return (
                    <button
                      key={kf.id}
                      onClick={() => setPlayheadSec(kf.timeSec)}
                      style={{ left: `${leftPct}%` }}
                      className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 px-1.5 py-0.5 rounded bg-[#F59E0B] text-black font-mono text-[10px] font-bold hover:scale-105 transition-transform"
                      title={kf.label}
                    >
                      ◆ {kf.scalePct}%
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Playhead */}
          <div
            className="absolute top-0 bottom-0 w-[2px] bg-white pointer-events-none z-30 shadow"
            style={{
              left: `calc(11rem + (100% - 11rem) * ${playheadSec / timelineDurationSec})`,
            }}
          >
            <div className="w-3.5 h-3.5 -ml-[6px] bg-[#1473E6] border-2 border-white rounded-sm rotate-45" />
          </div>
        </div>
      </div>
    </div>
  );
};
