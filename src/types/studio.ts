export type WorkspaceViewMode = 'exploration' | 'editor' | 'v3_dashboard';

export type InputLanguageMode = 'urdu' | 'english' | 'voice';

export type EditorTool =
  | 'trim'
  | 'split'
  | 'crop'
  | 'auto_zoom'
  | 'cursor_highlight'
  | 'text'
  | 'blur';

export type MonitorViewMode = 'preview' | 'program';

export type MediaLibraryTab = 'project' | 'effects' | 'audio';

export interface DOMBoundingBox {
  x: number; // percentage 0..100
  y: number; // percentage 0..100
  width: number; // percentage 0..100
  height: number; // percentage 0..100
}

export interface DetectedDOMTarget {
  id: string;
  selector: string;
  label: string;
  role: 'button' | 'input' | 'password' | 'container' | 'link';
  confidence: number; // e.g., 98
  bbox: DOMBoundingBox;
  actionType: 'click' | 'type' | 'focus' | 'verify';
  valuePreview?: string;
  isPrimaryTarget?: boolean;
}

export interface ExplorationActionStep {
  id: string;
  label: string; // 'Start' | 'Type Email' | 'Type Password' | 'Zoom to Click Login' | 'Success Screen'
  startTimeSec: number;
  endTimeSec: number;
  timecode: string;
  targetDomId: string;
  zoomScalePct: number;
  zoomCenter: { x: number; y: number };
  cursorPos: { x: number; y: number };
  clickRipple?: boolean;
  screenState: 'landing' | 'email_typed' | 'password_typed' | 'login_clicking' | 'dashboard_success';
}

export interface ScriptBlock {
  id: string;
  startTimecode: string;
  endTimecode: string;
  startSec: number;
  endSec: number;
  textEn: string;
  sourceIntentUr: string;
  linkedActionId: string;
  wordCount: number;
}

export interface MediaAssetItem {
  id: string;
  filename: string;
  category: 'project' | 'effects' | 'audio';
  type: 'video_vertical' | 'video_4k' | 'audio_wav' | 'audio_mp3' | 'effect_preset';
  resolution: string;
  fps?: number;
  codec: string;
  durationSec: number;
  durationLabel: string;
  sizeLabel: string;
  sampleRate?: string;
  accentColor: string;
  description: string;
}

export interface ZoomKeyframe {
  id: string;
  timeSec: number;
  frame: number;
  scalePct: number; // e.g. 110, 125, 150
  centerX: number; // 0..1
  centerY: number; // 0..1
  label: string;
  easing: 'Cubic-Bezier' | 'Linear' | 'Spring';
}

export interface BlurRegion {
  id: string;
  label: string;
  startSec: number;
  endSec: number;
  x: number; // 0..100%
  y: number; // 0..100%
  width: number; // 0..100%
  height: number; // 0..100%
  blurPx: number;
  active: boolean;
}

export interface BilingualCaption {
  id: string;
  startSec: number;
  endSec: number;
  startTimecode: string;
  endTimecode: string;
  textEn: string;
  textUr: string;
  textHi: string;
}

export interface TimelineClip {
  id: string;
  trackId: 'pip' | 'video' | 'voiceover' | 'captions' | 'bgm' | 'fx';
  label: string;
  mediaSourceId: string;
  startSec: number;
  endSec: number;
  startFrame: number;
  endFrame: number;
  color: string;
  metaBadge: string;
  muted?: boolean;
  locked?: boolean;
}

export interface YouTubeChapterItem {
  id: string;
  timecode: string;
  timeSec: number;
  title: string;
  status: 'verified' | 'warning';
  warningText?: string;
}

export interface MistakeAlertState {
  id: string;
  timecode: string;
  timeSec: number;
  durationSec: number;
  message: string;
  snippetText: string;
  status: 'detected' | 're_recording' | 'patched' | 'ignored';
  patchTakeCount: number;
}

export interface DubbingState {
  voiceCloneEnabled: boolean;
  voiceMatchPct: number;
  activeTargetLang: 'ur' | 'hi';
  isSynthesizing: boolean;
  urduReady: boolean;
  hindiReady: boolean;
  activePreviewTrack: 'en' | 'ur' | 'hi';
  appliedToTimeline: 'en' | 'ur' | 'hi';
}

export interface FaceTrackState {
  pipLocked: boolean;
  scalePct: number; // 25%
  anchorCorner: 'top-right' | 'top-left' | 'bottom-right' | 'bottom-left';
  showLandmarks: boolean;
  backgroundRemoved: boolean;
  naturalDropShadow: boolean;
  trackingConfidencePct: number;
}

export interface ProjectMemoryEntry {
  id: string;
  title: string;
  timestampLabel: string;
  flowTag: string;
  stepsCount: number;
  durationLabel: string;
  similarityPct: number;
  urlDomain: string;
}

export interface AISkipSuggestionState {
  id: string;
  flowName: string;
  sourceProject: string;
  timeSavedLabel: string;
  timeSavedSec: number;
  status: 'pending' | 'applied' | 'dismissed';
}

export interface InspectorProperties {
  // Text & Captions
  captionFontFamily: 'Inter SemiBold' | 'Inter Medium' | 'JetBrains Mono';
  captionFontSize: number;
  captionAnimation: 'Fade In + Slide Up' | 'Instant Cut' | 'Typewriter Reveal';
  showBilingualCaptions: boolean;
  // Audio
  bgmVolumePct: number; // 68%
  voGainDb: number;
  autoDucking: boolean;
  // Export
  exportResolution: '4K 60FPS' | '1440p 60FPS' | '1080p 60FPS';
  exportBitrateMbps: number; // 35 Mbps
  exportCodec: 'H.264 (NVENC)' | 'HEVC 10-bit (NVENC)' | 'Apple VideoToolbox';
  gpuAcceleration: boolean;
}

