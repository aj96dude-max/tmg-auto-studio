import { create } from 'zustand';
import { immer } from 'zustand/middleware/immer';
import type {
  AISkipSuggestionState,
  BilingualCaption,
  BlurRegion,
  DetectedDOMTarget,
  DubbingState,
  EditorTool,
  ExplorationActionStep,
  FaceTrackState,
  InputLanguageMode,
  InspectorProperties,
  MediaAssetItem,
  MediaLibraryTab,
  MistakeAlertState,
  MonitorViewMode,
  ProjectMemoryEntry,
  ScriptBlock,
  TimelineClip,
  WorkspaceViewMode,
  YouTubeChapterItem,
  ZoomKeyframe,
} from '../types/studio';

interface StudioStoreState {
  // Global Navigation & Telemetry
  activeView: WorkspaceViewMode;
  projectTitle: string;
  engineStatus: 'READY' | 'EXPLORING' | 'RENDERING';
  cdpConnected: boolean;
  gpuEncoderName: string;
  statusNotification: string | null;

  // Interactive Login Preview Credentials
  previewEmail: string;
  previewPassword: string;
  isAuthenticatedInPreview: boolean;
  sprintIssues: { id: string; title: string; status: string }[];

  // View 1: Auto-Exploration Setup
  targetUrl: string;
  videoDuration: string;
  goalInput: string;
  inputMode: InputLanguageMode;
  userInstructions: string;
  voiceStandbyActive: boolean;
  isExploring: boolean;
  activeActionIndex: number;
  explorationTimeSec: number;
  totalExplorationSec: number;
  domTargets: DetectedDOMTarget[];
  actionSteps: ExplorationActionStep[];
  scriptBlocks: ScriptBlock[];

  // View 2: Pro Editor Mode
  mediaTab: MediaLibraryTab;
  mediaAssets: MediaAssetItem[];
  selectedMediaId: string;
  monitorMode: MonitorViewMode;
  showGrid3x3: boolean;
  isPlaying: boolean;
  playheadSec: number;
  timelineDurationSec: number;
  fps: number;
  activeTool: EditorTool;
  cursorHighlightEnabled: boolean;
  cropFrameEnabled: boolean;
  selectedClipId: string | null;
  timelineZoom: number;
  magneticSnap: boolean;
  timelineClips: TimelineClip[];
  bilingualCaptions: BilingualCaption[];
  zoomKeyframes: ZoomKeyframe[];
  blurRegions: BlurRegion[];
  inspector: InspectorProperties;
  isExporting4K: boolean;
  exportProgressPct: number;
  lastFfmpegCommand: string | null;

  // View 3: Upgraded Features v3 Dashboard
  chapters: YouTubeChapterItem[];
  mistakeAlert: MistakeAlertState;
  dubbing: DubbingState;
  faceTrack: FaceTrackState;
  projectMemory: ProjectMemoryEntry[];
  aiSkipSuggestion: AISkipSuggestionState;

  // Actions
  setActiveView: (view: WorkspaceViewMode) => void;
  setStatusNotification: (msg: string | null) => void;

  // Interactive Login Actions
  setPreviewEmail: (email: string) => void;
  setPreviewPassword: (password: string) => void;
  performInteractiveLogin: () => void;
  logoutPreview: () => void;
  addSprintIssue: (title: string) => void;

  // View 1 Actions
  setTargetUrl: (url: string) => void;
  setVideoDuration: (dur: string) => void;
  setGoalInput: (goal: string) => void;
  setInputMode: (mode: InputLanguageMode) => void;
  setUserInstructions: (text: string) => void;
  toggleVoiceStandby: () => void;
  selectActionStep: (index: number) => void;
  setExplorationTimeSec: (sec: number) => void;
  startExplorationPreview: () => void;
  advanceExplorationStep: () => void;
  resetExploration: () => void;
  updateScriptBlockText: (id: string, newText: string) => void;

  // View 2 Actions
  setMediaTab: (tab: MediaLibraryTab) => void;
  selectMediaAsset: (id: string) => void;
  importCustomMediaAsset: (filename: string, type?: MediaAssetItem['type']) => void;
  setMonitorMode: (mode: MonitorViewMode) => void;
  toggleGrid3x3: () => void;
  togglePlayPause: () => void;
  setIsPlaying: (playing: boolean) => void;
  setPlayheadSec: (sec: number) => void;
  stepFrame: (deltaFrames: number) => void;
  setActiveTool: (tool: EditorTool) => void;
  selectClip: (clipId: string | null) => void;
  splitClipAtPlayhead: () => void;
  trimActiveClipAtPlayhead: () => void;
  addZoomKeyframeAtPlayhead: (scalePct?: number) => void;
  toggleBlurRegion: (id: string) => void;
  addBlurRegionAtPlayhead: () => void;
  updateCaptionText: (id: string, textEn: string, textUr: string) => void;
  setTimelineZoom: (zoom: number) => void;
  toggleMagneticSnap: () => void;
  toggleTrackMute: (trackId: TimelineClip['trackId']) => void;
  updateInspector: <K extends keyof InspectorProperties>(key: K, value: InspectorProperties[K]) => void;
  start4KExport: () => void;
  tickExportProgress: (pct: number, cmd?: string) => void;

  // View 3 Actions
  triggerMistakeReRecord: () => void;
  completeMistakePatch: () => void;
  ignoreMistakeAlert: () => void;
  toggleVoiceClone: () => void;
  setDubbingPreviewTrack: (track: 'en' | 'ur' | 'hi') => void;
  applyDubbingToTimeline: (lang: 'ur' | 'hi') => void;
  updateFaceTrack: <K extends keyof FaceTrackState>(key: K, value: FaceTrackState[K]) => void;
  applyAiSkipSuggestion: () => void;
  dismissAiSkipSuggestion: () => void;
}

const INITIAL_DOM_TARGETS: DetectedDOMTarget[] = [
  {
    id: 'dom_email',
    selector: 'input#email-field[name="work_email"]',
    label: 'Work Email Input',
    role: 'input',
    confidence: 99,
    bbox: { x: 26, y: 34, width: 48, height: 10 },
    actionType: 'type',
    valuePreview: 'architect@tmgstudio.dev',
  },
  {
    id: 'dom_password',
    selector: 'input#password-field[type="password"]',
    label: 'Security Passphrase',
    role: 'password',
    confidence: 99,
    bbox: { x: 26, y: 48, width: 48, height: 10 },
    actionType: 'type',
    valuePreview: '••••••••••••••••',
  },
  {
    id: 'dom_login_btn',
    selector: 'button#login-submit[data-testid="auth-login"]',
    label: 'Login Button',
    role: 'button',
    confidence: 98,
    bbox: { x: 26, y: 63, width: 48, height: 11 },
    actionType: 'click',
    isPrimaryTarget: true,
  },
  {
    id: 'dom_sso_btn',
    selector: 'button#sso-saml-provider',
    label: 'SAML Enterprise SSO',
    role: 'button',
    confidence: 94,
    bbox: { x: 26, y: 78, width: 48, height: 9 },
    actionType: 'verify',
  },
];

const INITIAL_ACTION_STEPS: ExplorationActionStep[] = [
  {
    id: 'act_start',
    label: 'Start',
    startTimeSec: 0.0,
    endTimeSec: 3.0,
    timecode: '00:00',
    targetDomId: 'dom_email',
    zoomScalePct: 100,
    zoomCenter: { x: 50, y: 50 },
    cursorPos: { x: 22, y: 24 },
    screenState: 'landing',
  },
  {
    id: 'act_email',
    label: 'Type Email',
    startTimeSec: 3.0,
    endTimeSec: 6.0,
    timecode: '00:03',
    targetDomId: 'dom_email',
    zoomScalePct: 115,
    zoomCenter: { x: 50, y: 40 },
    cursorPos: { x: 48, y: 39 },
    screenState: 'email_typed',
  },
  {
    id: 'act_password',
    label: 'Type Password',
    startTimeSec: 6.0,
    endTimeSec: 9.0,
    timecode: '00:06',
    targetDomId: 'dom_password',
    zoomScalePct: 125,
    zoomCenter: { x: 50, y: 53 },
    cursorPos: { x: 52, y: 53 },
    screenState: 'password_typed',
  },
  {
    id: 'act_login',
    label: 'Zoom to Click Login',
    startTimeSec: 9.0,
    endTimeSec: 11.2,
    timecode: '00:09',
    targetDomId: 'dom_login_btn',
    zoomScalePct: 150,
    zoomCenter: { x: 50, y: 68 },
    cursorPos: { x: 50, y: 68 },
    clickRipple: true,
    screenState: 'login_clicking',
  },
  {
    id: 'act_success',
    label: 'Success Screen',
    startTimeSec: 11.2,
    endTimeSec: 13.5,
    timecode: '00:11',
    targetDomId: 'dom_login_btn',
    zoomScalePct: 100,
    zoomCenter: { x: 50, y: 50 },
    cursorPos: { x: 68, y: 32 },
    screenState: 'dashboard_success',
  },
];

const INITIAL_SCRIPT_BLOCKS: ScriptBlock[] = [
  {
    id: 'scr_01',
    startTimecode: '00:00',
    endTimecode: '00:03',
    startSec: 0.0,
    endSec: 3.0,
    textEn:
      'Welcome to Linear Workspace. In this tutorial, we will authenticate your engineering account and configure a sprint issue.',
    sourceIntentUr: 'Linear workspace kholein aur developer account login ka tareeqa dikhayein.',
    linkedActionId: 'act_start',
    wordCount: 18,
  },
  {
    id: 'scr_02',
    startTimecode: '00:03',
    endTimecode: '00:06',
    startSec: 3.0,
    endSec: 6.0,
    textEn:
      'First, enter your verified organization email address inside the primary work email input field.',
    sourceIntentUr: 'Sab se pehle apna workspace email address box mein darj karein.',
    linkedActionId: 'act_email',
    wordCount: 14,
  },
  {
    id: 'scr_03',
    startTimecode: '00:06',
    endTimecode: '00:09',
    startSec: 6.0,
    endSec: 9.0,
    textEn:
      'Next, type your security passphrase while TMG Auto-Blur masks sensitive credentials in real time.',
    sourceIntentUr: 'Ab apna password likhein, sensitive hissa khudkar blur ho jaye ga.',
    linkedActionId: 'act_password',
    wordCount: 14,
  },
  {
    id: 'scr_04',
    startTimecode: '00:09',
    endTimecode: '00:11',
    startSec: 9.0,
    endSec: 11.2,
    textEn:
      'Now we zoom in 150 percent and click the primary Login button to validate our session token.',
    sourceIntentUr: 'Ab 150% zoom ke sath Login button par click karein taake session verify ho.',
    linkedActionId: 'act_login',
    wordCount: 17,
  },
  {
    id: 'scr_05',
    startTimecode: '00:11',
    endTimecode: '00:13',
    startSec: 11.2,
    endSec: 13.5,
    textEn:
      'Authentication is complete—transitioning directly into the live engineering sprint dashboard.',
    sourceIntentUr: 'Authentication mukammal ho gayi, ab aap live engineering sprint dashboard mein hain.',
    linkedActionId: 'act_success',
    wordCount: 10,
  },
];

const INITIAL_MEDIA_ASSETS: MediaAssetItem[] = [
  {
    id: 'med_phone_intro',
    filename: 'phone_intro.mp4',
    category: 'project',
    type: 'video_vertical',
    resolution: '1080×1920',
    fps: 60,
    codec: 'HEVC 4:2:2 • MODNet Alpha',
    durationSec: 4.2,
    durationLabel: '00:04.2',
    sizeLabel: '18.4 MB',
    accentColor: '#10B981',
    description: 'Vertical Phone Camera Intro • 68-Pt Face Cutout PIP Ready',
  },
  {
    id: 'med_screen_001',
    filename: 'screen_recording_001.mp4',
    category: 'project',
    type: 'video_4k',
    resolution: '3840×2160',
    fps: 60,
    codec: 'ProRes / CDP Lossless',
    durationSec: 8.5,
    durationLabel: '00:08.5',
    sizeLabel: '42.1 MB',
    accentColor: '#2563EB',
    description: 'Playwright 4K Screencast — Auth & Credential Entry',
  },
  {
    id: 'med_screen_002',
    filename: 'screen_recording_002.mp4',
    category: 'project',
    type: 'video_4k',
    resolution: '3840×2160',
    fps: 60,
    codec: 'ProRes / CDP Lossless',
    durationSec: 5.0,
    durationLabel: '00:05.0',
    sizeLabel: '24.8 MB',
    accentColor: '#2563EB',
    description: 'Playwright 4K Screencast — Login Click & Dashboard Load',
  },
  {
    id: 'med_vo_en',
    filename: 'voiceover_EN.wav',
    category: 'project',
    type: 'audio_wav',
    resolution: '48kHz / 24-bit',
    codec: 'Uncompressed PCM • WhisperX',
    durationSec: 13.5,
    durationLabel: '00:13.5',
    sizeLabel: '3.8 MB',
    sampleRate: '48.0 kHz Stereo',
    accentColor: '#F59E0B',
    description: 'Broadcast English Narration synced to DOM actions',
  },
  {
    id: 'fx_auto_zoom_150',
    filename: 'AutoZoom_CubicBezier_150.fx',
    category: 'effects',
    type: 'effect_preset',
    resolution: '4K Matrix',
    codec: 'WebGL Shader Curve',
    durationSec: 2.2,
    durationLabel: '00:02.2',
    sizeLabel: '12 KB',
    accentColor: '#2563EB',
    description: 'Dynamic 110% → 125% → 150% DOM Target Focus Interpolation',
  },
  {
    id: 'fx_privacy_blur',
    filename: 'Gaussian_Credential_Mask.fx',
    category: 'effects',
    type: 'effect_preset',
    resolution: '18px Sigma',
    codec: 'WebGL Region Mask',
    durationSec: 5.0,
    durationLabel: '00:05.0',
    sizeLabel: '8 KB',
    accentColor: '#F59E0B',
    description: 'Auto-tracks password & API token fields with 18px blur',
  },
  {
    id: 'fx_cursor_ring',
    filename: 'Cursor_Telemetry_Highlight.fx',
    category: 'effects',
    type: 'effect_preset',
    resolution: '60FPS Vector',
    codec: 'PixiJS Overlay',
    durationSec: 13.5,
    durationLabel: '00:13.5',
    sizeLabel: '6 KB',
    accentColor: '#10B981',
    description: 'High-contrast ring & click ripple synced to CDP pointer events',
  },
  {
    id: 'aud_bgm_mp3',
    filename: 'background_music.mp3',
    category: 'audio',
    type: 'audio_mp3',
    resolution: '320 kbps CBR',
    codec: 'MP3 Stereo • Auto-Ducked 68%',
    durationSec: 13.5,
    durationLabel: '00:13.5',
    sizeLabel: '1.9 MB',
    sampleRate: '48.0 kHz',
    accentColor: '#10B981',
    description: 'Ambient Industrial Synth Bed — Locked at 68% Mix Gain',
  },
  {
    id: 'aud_urdu_dub',
    filename: 'Urdu.mp3',
    category: 'audio',
    type: 'audio_mp3',
    resolution: '320 kbps • XTTS-v2',
    codec: '98% Voice Clone Match',
    durationSec: 13.5,
    durationLabel: '00:13.5',
    sizeLabel: '2.1 MB',
    sampleRate: '48.0 kHz',
    accentColor: '#2563EB',
    description: 'AI Voice-Cloned Urdu Narration Track (98.4% Speaker Similarity)',
  },
  {
    id: 'aud_hindi_dub',
    filename: 'Hindi.mp3',
    category: 'audio',
    type: 'audio_mp3',
    resolution: '320 kbps • XTTS-v2',
    codec: '98% Voice Clone Match',
    durationSec: 13.5,
    durationLabel: '00:13.5',
    sizeLabel: '2.1 MB',
    sampleRate: '48.0 kHz',
    accentColor: '#2563EB',
    description: 'AI Voice-Cloned Hindi Narration Track (98.1% Speaker Similarity)',
  },
];

const INITIAL_TIMELINE_CLIPS: TimelineClip[] = [
  {
    id: 'clip_pip_1',
    trackId: 'pip',
    label: 'phone_intro.mp4 [PIP 25% Cutout]',
    mediaSourceId: 'med_phone_intro',
    startSec: 0.0,
    endSec: 13.5,
    startFrame: 0,
    endFrame: 810,
    color: '#10B981',
    metaBadge: 'MODNet 60FPS',
  },
  {
    id: 'clip_v_1',
    trackId: 'video',
    label: 'screen_recording_001.mp4',
    mediaSourceId: 'med_screen_001',
    startSec: 0.0,
    endSec: 8.5,
    startFrame: 0,
    endFrame: 510,
    color: '#2563EB',
    metaBadge: '4K60 CDP',
  },
  {
    id: 'clip_v_2',
    trackId: 'video',
    label: 'screen_recording_002.mp4',
    mediaSourceId: 'med_screen_002',
    startSec: 8.5,
    endSec: 13.5,
    startFrame: 510,
    endFrame: 810,
    color: '#2563EB',
    metaBadge: '4K60 CDP',
  },
  {
    id: 'clip_vo_1',
    trackId: 'voiceover',
    label: 'voiceover_EN.wav',
    mediaSourceId: 'med_vo_en',
    startSec: 0.0,
    endSec: 13.5,
    startFrame: 0,
    endFrame: 810,
    color: '#3B82F6',
    metaBadge: 'PCM 48kHz',
  },
  {
    id: 'clip_cap_1',
    trackId: 'captions',
    label: 'Bilingual EN/UR Subtitles (5 Segments • Fade In + Slide Up)',
    mediaSourceId: 'captions_bilingual',
    startSec: 0.0,
    endSec: 13.5,
    startFrame: 0,
    endFrame: 810,
    color: '#6366F1',
    metaBadge: 'EN + اردو',
  },
  {
    id: 'clip_bgm_1',
    trackId: 'bgm',
    label: 'background_music.mp3 (Vol: 68%)',
    mediaSourceId: 'aud_bgm_mp3',
    startSec: 0.0,
    endSec: 13.5,
    startFrame: 0,
    endFrame: 810,
    color: '#10B981',
    metaBadge: '-3.4 dB (68%)',
  },
  {
    id: 'clip_fx_1',
    trackId: 'fx',
    label: 'Zoom 110% → 125% → 150% + Credential Blur Keyframes',
    mediaSourceId: 'fx_auto_zoom_150',
    startSec: 2.5,
    endSec: 11.8,
    startFrame: 150,
    endFrame: 708,
    color: '#F59E0B',
    metaBadge: '4 Keyframes',
  },
];

const INITIAL_CAPTIONS: BilingualCaption[] = [
  {
    id: 'cap_1',
    startSec: 0.0,
    endSec: 3.0,
    startTimecode: '00:00:00',
    endTimecode: '00:03:00',
    textEn: 'Welcome to Linear Workspace authentication & sprint setup.',
    textUr: 'لینیئر ورک اسپیس تصدیق اور اسپرنٹ سیٹ اپ میں خوش آمدید۔',
    textHi: 'लिनियर वर्कस्पेस ऑथेंटिकेशन और स्प्रिंट सेटअप में आपका स्वागत है।',
  },
  {
    id: 'cap_2',
    startSec: 3.0,
    endSec: 6.0,
    startTimecode: '00:03:00',
    endTimecode: '00:06:00',
    textEn: 'Enter your verified work email address in the input field.',
    textUr: 'ان پٹ فیلڈ میں اپنا تصدیق شدہ ورک ای میل ایڈریس درج کریں۔',
    textHi: 'इनपुट फ़ील्ड में अपना सत्यापित कार्य ईमेल पता दर्ज करें।',
  },
  {
    id: 'cap_3',
    startSec: 6.0,
    endSec: 9.0,
    startTimecode: '00:06:00',
    endTimecode: '00:09:00',
    textEn: 'Input your security passphrase while Auto-Blur protects sensitive data.',
    textUr: 'اپنا پاس ورڈ درج کریں جبکہ آٹو بلر حساس ڈیٹا کو محفوظ رکھتا ہے۔',
    textHi: 'अपना सुरक्षा पासफ़्रेज़ दर्ज करें जबकि ऑटो-ब्लर संवेदनशील डेटा की रक्षा करता है।',
  },
  {
    id: 'cap_4',
    startSec: 9.0,
    endSec: 11.2,
    startTimecode: '00:09:00',
    endTimecode: '00:11:12',
    textEn: 'Zooming to 150%—click the primary Login button to continue.',
    textUr: '150% زوم—جاری رکھنے کے لیے لاگ ان بٹن پر کلک کریں۔',
    textHi: '150% ज़ूम—जारी रखने के लिए मुख्य लॉगिन बटन पर क्लिक करें।',
  },
  {
    id: 'cap_5',
    startSec: 11.2,
    endSec: 13.5,
    startTimecode: '00:11:12',
    endTimecode: '00:13:30',
    textEn: 'Session verified. Your production sprint board is now active.',
    textUr: 'سیشن کی تصدیق ہو گئی۔ آپ کا پروڈکشن اسپرنٹ بورڈ اب فعال ہے۔',
    textHi: 'सत्र सत्यापित। आपका प्रोडक्शन स्प्रिंट बोर्ड अब सक्रिय है।',
  },
];

const INITIAL_ZOOM_KEYFRAMES: ZoomKeyframe[] = [
  {
    id: 'zk_1',
    timeSec: 3.2,
    frame: 192,
    scalePct: 110,
    centerX: 0.5,
    centerY: 0.4,
    label: 'Zoom 110% (Email Focus)',
    easing: 'Cubic-Bezier',
  },
  {
    id: 'zk_2',
    timeSec: 6.2,
    frame: 372,
    scalePct: 125,
    centerX: 0.5,
    centerY: 0.52,
    label: 'Zoom 125% (Passphrase Focus)',
    easing: 'Cubic-Bezier',
  },
  {
    id: 'zk_3',
    timeSec: 9.1,
    frame: 546,
    scalePct: 150,
    centerX: 0.5,
    centerY: 0.66,
    label: 'Zoom 150% (Login CTA)',
    easing: 'Cubic-Bezier',
  },
  {
    id: 'zk_4',
    timeSec: 11.4,
    frame: 684,
    scalePct: 100,
    centerX: 0.5,
    centerY: 0.5,
    label: 'Reset 100% (Full Dashboard)',
    easing: 'Cubic-Bezier',
  },
];

const INITIAL_BLUR_REGIONS: BlurRegion[] = [
  {
    id: 'blur_pass_01',
    label: 'Password & Session Token Blur Mask',
    startSec: 0.0,
    endSec: 13.5,
    x: 28,
    y: 47,
    width: 44,
    height: 11,
    blurPx: 18,
    active: true,
  },
];

export const useStudioStore = create<StudioStoreState>()(
  immer((set) => ({
    activeView: 'exploration',
    projectTitle: 'Linear_Auth_Sprint_Tutorial_4K',
    engineStatus: 'READY',
    cdpConnected: true,
    gpuEncoderName: 'NVIDIA NVENC H.264/HEVC (4K60)',
    statusNotification: null,

    previewEmail: 'architect@tmgstudio.dev',
    previewPassword: 'passphrase_prod_994812',
    isAuthenticatedInPreview: false,
    sprintIssues: [
      { id: 'TMG-101', title: 'WebCodecs 4K60 Canvas Pipeline', status: 'IN PROGRESS' },
      { id: 'TMG-102', title: 'XTTS-v2 Urdu & Hindi Voice Clone', status: 'READY' },
      { id: 'TMG-103', title: 'NVENC 35Mbps Hardware Export', status: 'VERIFIED' },
    ],

    // View 1 Initial State
    targetUrl: 'https://app.linear.app/login',
    videoDuration: '01:30',
    goalInput: 'Complete workspace authentication & launch sprint issue',
    inputMode: 'urdu',
    userInstructions:
      'Linear workspace login page kholein, work email aur password enter karein (sensitive password ko blur rakhein), phir Login button par 150% auto-zoom ke sath click karein aur dashboard verify karein.',
    voiceStandbyActive: false,
    isExploring: false,
    activeActionIndex: 3,
    explorationTimeSec: 9.4,
    totalExplorationSec: 13.5,
    domTargets: INITIAL_DOM_TARGETS,
    actionSteps: INITIAL_ACTION_STEPS,
    scriptBlocks: INITIAL_SCRIPT_BLOCKS,

    // View 2 Initial State
    mediaTab: 'project',
    mediaAssets: INITIAL_MEDIA_ASSETS,
    selectedMediaId: 'med_screen_001',
    monitorMode: 'program',
    showGrid3x3: true,
    isPlaying: false,
    playheadSec: 9.2,
    timelineDurationSec: 13.5,
    fps: 60,
    activeTool: 'auto_zoom',
    cursorHighlightEnabled: true,
    cropFrameEnabled: false,
    selectedClipId: 'clip_v_1',
    timelineZoom: 1.0,
    magneticSnap: true,
    timelineClips: INITIAL_TIMELINE_CLIPS,
    bilingualCaptions: INITIAL_CAPTIONS,
    zoomKeyframes: INITIAL_ZOOM_KEYFRAMES,
    blurRegions: INITIAL_BLUR_REGIONS,
    inspector: {
      captionFontFamily: 'Inter SemiBold',
      captionFontSize: 24,
      captionAnimation: 'Fade In + Slide Up',
      showBilingualCaptions: true,
      bgmVolumePct: 68,
      voGainDb: 1.5,
      autoDucking: true,
      exportResolution: '4K 60FPS',
      exportBitrateMbps: 35,
      exportCodec: 'H.264 (NVENC)',
      gpuAcceleration: true,
    },
    isExporting4K: false,
    exportProgressPct: 0,
    lastFfmpegCommand: null,

    // View 3 Initial State
    chapters: [
      { id: 'ch_1', timecode: '00:00', timeSec: 0, title: 'Intro & Workspace Environment Setup', status: 'verified' },
      { id: 'ch_2', timecode: '00:24', timeSec: 24, title: 'Work Email & OAuth Credential Entry', status: 'verified' },
      { id: 'ch_3', timecode: '00:52', timeSec: 52, title: 'Auto-Zoom 150% Login & Token Handshake', status: 'verified' },
      {
        id: 'ch_4',
        timecode: '01:12',
        timeSec: 72,
        title: 'Sprint Issue Creation & Priority Tagging',
        status: 'warning',
        warningText: 'Detected: filler word repeated, 3s silence',
      },
      { id: 'ch_5', timecode: '01:45', timeSec: 105, title: 'Production Verification & 4K Export', status: 'verified' },
    ],
    mistakeAlert: {
      id: 'mst_0112',
      timecode: '01:12',
      timeSec: 72,
      durationSec: 3.0,
      message: 'Detected: filler word repeated, 3s silence',
      snippetText: '"...and now we select the— uh, uh [3.0s silence] —high priority sprint filter..."',
      status: 'detected',
      patchTakeCount: 0,
    },
    dubbing: {
      voiceCloneEnabled: true,
      voiceMatchPct: 98,
      activeTargetLang: 'ur',
      isSynthesizing: false,
      urduReady: true,
      hindiReady: true,
      activePreviewTrack: 'ur',
      appliedToTimeline: 'en',
    },
    faceTrack: {
      pipLocked: true,
      scalePct: 25,
      anchorCorner: 'top-right',
      showLandmarks: true,
      backgroundRemoved: true,
      naturalDropShadow: true,
      trackingConfidencePct: 99.2,
    },
    projectMemory: [
      {
        id: 'pm_1',
        title: 'Linear Auth & Workspace Setup',
        timestampLabel: '2h ago',
        flowTag: 'SignUp & OAuth Flow',
        stepsCount: 14,
        durationLabel: '03:18',
        similarityPct: 98,
        urlDomain: 'app.linear.app',
      },
      {
        id: 'pm_2',
        title: 'Stripe Webhook & Billing Portal Tutorial',
        timestampLabel: 'Yesterday',
        flowTag: 'API Secret Masking',
        stepsCount: 19,
        durationLabel: '04:45',
        similarityPct: 76,
        urlDomain: 'dashboard.stripe.com',
      },
      {
        id: 'pm_3',
        title: 'Supabase Row-Level Security Deep Dive',
        timestampLabel: '3d ago',
        flowTag: 'SQL Policy Editor',
        stepsCount: 22,
        durationLabel: '06:10',
        similarityPct: 68,
        urlDomain: 'supabase.com/dashboard',
      },
    ],
    aiSkipSuggestion: {
      id: 'sug_01',
      flowName: 'SignUp & Authentication',
      sourceProject: 'Linear Auth & Workspace Setup',
      timeSavedLabel: '1:24 min',
      timeSavedSec: 84,
      status: 'pending',
    },

    setActiveView: (view) =>
      set((state) => {
        state.activeView = view;
      }),

    setStatusNotification: (msg) =>
      set((state) => {
        state.statusNotification = msg;
      }),

    setPreviewEmail: (email) =>
      set((state) => {
        state.previewEmail = email;
        state.activeActionIndex = 1;
        state.explorationTimeSec = 3.5;
      }),

    setPreviewPassword: (password) =>
      set((state) => {
        state.previewPassword = password;
        state.activeActionIndex = 2;
        state.explorationTimeSec = 6.5;
      }),

    performInteractiveLogin: () =>
      set((state) => {
        state.isAuthenticatedInPreview = true;
        state.activeActionIndex = 4; // Jump to Step 5: Success Screen
        state.explorationTimeSec = 11.5;
        state.playheadSec = 11.5;
        state.statusNotification = `Logged in as ${state.previewEmail || 'architect@tmgstudio.dev'} — Sprint Dashboard Loaded!`;
      }),

    logoutPreview: () =>
      set((state) => {
        state.isAuthenticatedInPreview = false;
        state.activeActionIndex = 3;
        state.explorationTimeSec = 9.4;
        state.playheadSec = 9.4;
        state.statusNotification = 'Returned to Login Step';
      }),

    addSprintIssue: (title) =>
      set((state) => {
        if (!title.trim()) return;
        const nextNum = 101 + state.sprintIssues.length;
        state.sprintIssues.unshift({
          id: `TMG-${nextNum}`,
          title: title.trim(),
          status: 'NEW SPRINT ISSUE',
        });
        state.statusNotification = `Created Sprint Issue TMG-${nextNum}: ${title.trim()}`;
      }),

    setTargetUrl: (url) =>
      set((state) => {
        state.targetUrl = url;
      }),

    setVideoDuration: (dur) =>
      set((state) => {
        state.videoDuration = dur;
      }),

    setGoalInput: (goal) =>
      set((state) => {
        state.goalInput = goal;
      }),

    setInputMode: (mode) =>
      set((state) => {
        state.inputMode = mode;
        if (mode === 'english') {
          state.userInstructions =
            'Navigate to the Linear workspace login page, enter the work email and security passphrase with auto-blur enabled, then zoom 150% onto the Login button, click to authenticate, and verify the dashboard.';
        } else if (mode === 'urdu') {
          state.userInstructions =
            'Linear workspace login page kholein, work email aur password enter karein (sensitive password ko blur rakhein), phir Login button par 150% auto-zoom ke sath click karein aur dashboard verify karein.';
        } else {
          state.voiceStandbyActive = true;
        }
      }),

    setUserInstructions: (text) =>
      set((state) => {
        state.userInstructions = text;
      }),

    toggleVoiceStandby: () =>
      set((state) => {
        state.voiceStandbyActive = !state.voiceStandbyActive;
        state.statusNotification = state.voiceStandbyActive
          ? 'Microphone Active — Speak instructions in Urdu or English'
          : 'Microphone Standby';
      }),

    selectActionStep: (index) =>
      set((state) => {
        const clamped = Math.max(0, Math.min(index, state.actionSteps.length - 1));
        state.activeActionIndex = clamped;
        state.isAuthenticatedInPreview = clamped === 4;
        state.explorationTimeSec = state.actionSteps[clamped].startTimeSec + 0.4;
        state.playheadSec = state.explorationTimeSec;
      }),

    setExplorationTimeSec: (sec) =>
      set((state) => {
        const clamped = Math.max(0, Math.min(sec, state.totalExplorationSec));
        state.explorationTimeSec = clamped;
        state.playheadSec = clamped;
        const foundIdx = state.actionSteps.findIndex(
          (s) => clamped >= s.startTimeSec && clamped <= s.endTimeSec
        );
        if (foundIdx !== -1) {
          state.activeActionIndex = foundIdx;
          state.isAuthenticatedInPreview = foundIdx === 4;
        }
      }),

    startExplorationPreview: () =>
      set((state) => {
        state.isExploring = true;
        state.isAuthenticatedInPreview = false;
        state.engineStatus = 'EXPLORING';
        state.activeActionIndex = 0;
        state.explorationTimeSec = 0;
        state.statusNotification = 'Running AI Auto-Exploration Preview...';
      }),

    advanceExplorationStep: () =>
      set((state) => {
        if (!state.isExploring) return;
        if (state.activeActionIndex < state.actionSteps.length - 1) {
          state.activeActionIndex += 1;
          state.isAuthenticatedInPreview = state.activeActionIndex === 4;
          const step = state.actionSteps[state.activeActionIndex];
          state.explorationTimeSec = step.startTimeSec + 0.5;
          state.playheadSec = state.explorationTimeSec;
        } else {
          state.isExploring = false;
          state.isAuthenticatedInPreview = true;
          state.engineStatus = 'READY';
          state.statusNotification = 'Preview Complete — Logged in & 5 Steps Synced!';
        }
      }),

    resetExploration: () =>
      set((state) => {
        state.isExploring = false;
        state.isAuthenticatedInPreview = false;
        state.engineStatus = 'READY';
        state.activeActionIndex = 3;
        state.explorationTimeSec = 9.4;
        state.targetUrl = 'https://app.linear.app/login';
        state.videoDuration = '01:30';
        state.goalInput = 'Complete workspace authentication & launch sprint issue';
        state.statusNotification = 'Reset to default login step';
      }),

    updateScriptBlockText: (id, newText) =>
      set((state) => {
        const block = state.scriptBlocks.find((b) => b.id === id);
        if (block) {
          block.textEn = newText;
          block.wordCount = newText.trim().split(/\s+/).filter(Boolean).length;
        }
      }),

    setMediaTab: (tab) =>
      set((state) => {
        state.mediaTab = tab;
      }),

    selectMediaAsset: (id) =>
      set((state) => {
        state.selectedMediaId = id;
      }),

    importCustomMediaAsset: (filename, type = 'video_4k') =>
      set((state) => {
        const newId = `med_custom_${Date.now()}`;
        state.mediaAssets.unshift({
          id: newId,
          filename,
          category: state.mediaTab,
          type,
          resolution: type === 'audio_wav' ? '48kHz / 24-bit' : '3840×2160',
          fps: 60,
          codec: 'Hardware Accelerated',
          durationSec: 6.4,
          durationLabel: '00:06.4',
          sizeLabel: '28.2 MB',
          accentColor: '#2563EB',
          description: 'Imported Media Asset',
        });
        state.selectedMediaId = newId;
        state.statusNotification = `Imported ${filename}`;
      }),

    setMonitorMode: (mode) =>
      set((state) => {
        state.monitorMode = mode;
      }),

    toggleGrid3x3: () =>
      set((state) => {
        state.showGrid3x3 = !state.showGrid3x3;
      }),

    togglePlayPause: () =>
      set((state) => {
        state.isPlaying = !state.isPlaying;
      }),

    setIsPlaying: (playing) =>
      set((state) => {
        state.isPlaying = playing;
      }),

    setPlayheadSec: (sec) =>
      set((state) => {
        let target = Math.max(0, Math.min(sec, state.timelineDurationSec));
        if (state.magneticSnap && !state.isPlaying) {
          const snapPoints = [
            0,
            3.0,
            6.0,
            8.5,
            9.0,
            11.2,
            13.5,
            ...state.zoomKeyframes.map((k) => k.timeSec),
          ];
          for (const pt of snapPoints) {
            if (Math.abs(target - pt) < 0.08) {
              target = pt;
              break;
            }
          }
        }
        state.playheadSec = Number(target.toFixed(3));
        state.explorationTimeSec = state.playheadSec;
      }),

    stepFrame: (deltaFrames) =>
      set((state) => {
        state.isPlaying = false;
        const frameSec = 1 / state.fps;
        const next = Math.max(
          0,
          Math.min(state.timelineDurationSec, state.playheadSec + deltaFrames * frameSec)
        );
        state.playheadSec = Number(next.toFixed(3));
      }),

    setActiveTool: (tool) =>
      set((state) => {
        state.activeTool = tool;
        if (tool === 'cursor_highlight') {
          state.cursorHighlightEnabled = !state.cursorHighlightEnabled;
          state.statusNotification = `Cursor Highlight ${
            state.cursorHighlightEnabled ? 'Enabled' : 'Disabled'
          }`;
        } else if (tool === 'crop') {
          state.cropFrameEnabled = !state.cropFrameEnabled;
          state.statusNotification = `Crop Frame ${
            state.cropFrameEnabled ? 'Enabled' : 'Hidden'
          }`;
        }
      }),

    selectClip: (clipId) =>
      set((state) => {
        state.selectedClipId = clipId;
      }),

    splitClipAtPlayhead: () =>
      set((state) => {
        let t = state.playheadSec;
        let targetClipIndex = state.timelineClips.findIndex(
          (c) =>
            (state.selectedClipId ? c.id === state.selectedClipId : c.trackId === 'video') &&
            t > c.startSec + 0.3 &&
            t < c.endSec - 0.3
        );
        // If playhead isn't inside the selected clip, split any video clip under playhead or at midpoint
        if (targetClipIndex === -1) {
          targetClipIndex = state.timelineClips.findIndex(
            (c) => c.trackId === 'video' && t > c.startSec + 0.3 && t < c.endSec - 0.3
          );
        }
        if (targetClipIndex === -1) {
          targetClipIndex = state.timelineClips.findIndex((c) => c.trackId === 'video');
          if (targetClipIndex !== -1) {
            const c = state.timelineClips[targetClipIndex];
            t = Number(((c.startSec + c.endSec) / 2).toFixed(2));
            state.playheadSec = t;
          }
        }
        if (targetClipIndex === -1) return;

        const orig = state.timelineClips[targetClipIndex];
        const splitFrame = Math.round(t * state.fps);
        const rightClip: TimelineClip = {
          ...orig,
          id: `${orig.id}_split_${Date.now().toString().slice(-3)}`,
          label: `${orig.label} (Part B)`,
          startSec: Number(t.toFixed(2)),
          startFrame: splitFrame,
        };
        orig.endSec = Number(t.toFixed(2));
        orig.endFrame = splitFrame;
        state.timelineClips.splice(targetClipIndex + 1, 0, rightClip);
        state.selectedClipId = rightClip.id;
        state.statusNotification = `Split clip at ${t.toFixed(2)}s`;
      }),

    trimActiveClipAtPlayhead: () =>
      set((state) => {
        const clip =
          state.timelineClips.find((c) => c.id === state.selectedClipId) ||
          state.timelineClips.find((c) => c.trackId === 'video');
        if (clip && clip.endSec - clip.startSec > 1.5) {
          clip.endSec = Number((clip.endSec - 0.8).toFixed(2));
          clip.endFrame = Math.round(clip.endSec * state.fps);
          state.statusNotification = `Trimmed "${clip.label}" out-point to ${clip.endSec}s`;
        } else {
          state.statusNotification = 'Clip trimmed';
        }
      }),

    addZoomKeyframeAtPlayhead: (scalePct = 135) =>
      set((state) => {
        const t = Number(state.playheadSec.toFixed(2));
        const existing = state.zoomKeyframes.find((k) => Math.abs(k.timeSec - t) < 0.35);
        if (existing) {
          existing.scalePct = existing.scalePct >= 150 ? 110 : existing.scalePct + 15;
          existing.label = `Zoom ${existing.scalePct}% @ ${t}s`;
          state.statusNotification = `Updated Zoom Keyframe to ${existing.scalePct}%`;
        } else {
          state.zoomKeyframes.push({
            id: `zk_${Date.now().toString().slice(-4)}`,
            timeSec: t,
            frame: Math.round(t * state.fps),
            scalePct,
            centerX: 0.5,
            centerY: 0.55,
            label: `Zoom ${scalePct}% @ ${t}s`,
            easing: 'Cubic-Bezier',
          });
          state.zoomKeyframes.sort((a, b) => a.timeSec - b.timeSec);
          state.statusNotification = `Added ${scalePct}% Zoom Keyframe at ${t}s`;
        }
      }),

    toggleBlurRegion: (id) =>
      set((state) => {
        const region = state.blurRegions.find((r) => r.id === id);
        if (region) {
          region.active = !region.active;
          state.statusNotification = `Password Blur Mask ${region.active ? 'Enabled' : 'Disabled'}`;
        }
      }),

    addBlurRegionAtPlayhead: () =>
      set((state) => {
        if (state.blurRegions.length > 0) {
          const primary = state.blurRegions[0];
          primary.active = !primary.active;
        }
        const t = Number(state.playheadSec.toFixed(1));
        state.blurRegions.push({
          id: `blur_${Date.now().toString().slice(-4)}`,
          label: `Sensitive Field Mask @ ${t}s`,
          startSec: 0,
          endSec: state.timelineDurationSec,
          x: 30,
          y: 35,
          width: 40,
          height: 12,
          blurPx: 20,
          active: true,
        });
        state.statusNotification = `Added Blur Mask at ${t}s`;
      }),

    updateCaptionText: (id, textEn, textUr) =>
      set((state) => {
        const cap = state.bilingualCaptions.find((c) => c.id === id);
        if (cap) {
          cap.textEn = textEn;
          cap.textUr = textUr;
        }
      }),

    setTimelineZoom: (zoom) =>
      set((state) => {
        state.timelineZoom = Math.max(0.6, Math.min(2.5, zoom));
      }),

    toggleMagneticSnap: () =>
      set((state) => {
        state.magneticSnap = !state.magneticSnap;
      }),

    toggleTrackMute: (trackId) =>
      set((state) => {
        state.timelineClips.forEach((clip) => {
          if (clip.trackId === trackId) {
            clip.muted = !clip.muted;
          }
        });
      }),

    updateInspector: (key, value) =>
      set((state) => {
        state.inspector[key] = value;
        if (key === 'bgmVolumePct') {
          const bgmClip = state.timelineClips.find((c) => c.trackId === 'bgm');
          if (bgmClip) {
            bgmClip.label = `background_music.mp3 (Vol: ${value}%)`;
            bgmClip.metaBadge = `${value}% Gain`;
          }
        }
      }),

    start4KExport: () =>
      set((state) => {
        state.isExporting4K = true;
        state.exportProgressPct = 10;
        state.engineStatus = 'RENDERING';
        state.statusNotification = `Rendering 4K 60FPS Video (${state.inspector.exportBitrateMbps} Mbps)...`;
      }),

    tickExportProgress: (pct, cmd) =>
      set((state) => {
        state.exportProgressPct = pct;
        if (cmd) state.lastFfmpegCommand = cmd;
        if (pct >= 100) {
          state.isExporting4K = false;
          state.engineStatus = 'READY';
          state.statusNotification = `4K 60FPS Video Export Complete!`;
        }
      }),

    triggerMistakeReRecord: () =>
      set((state) => {
        state.mistakeAlert.status = 're_recording';
        state.statusNotification = 'Recording 3-Second Audio Patch at 01:12...';
      }),

    completeMistakePatch: () =>
      set((state) => {
        state.mistakeAlert.status = 'patched';
        state.mistakeAlert.patchTakeCount += 1;
        state.mistakeAlert.snippetText = '"...and now we select the high-priority sprint filter..." [PATCHED 3.0s]';
        const ch = state.chapters.find((c) => c.timecode === '01:12');
        if (ch) {
          ch.status = 'verified';
          ch.warningText = undefined;
        }
        state.statusNotification = '01:12 Audio Mistake Patched!';
      }),

    ignoreMistakeAlert: () =>
      set((state) => {
        state.mistakeAlert.status = 'ignored';
        const ch = state.chapters.find((c) => c.timecode === '01:12');
        if (ch) {
          ch.status = 'verified';
        }
        state.statusNotification = 'Mistake warning at 01:12 ignored';
      }),

    toggleVoiceClone: () =>
      set((state) => {
        state.dubbing.voiceCloneEnabled = !state.dubbing.voiceCloneEnabled;
        state.dubbing.voiceMatchPct = state.dubbing.voiceCloneEnabled ? 98 : 84;
      }),

    setDubbingPreviewTrack: (track) =>
      set((state) => {
        state.dubbing.activePreviewTrack = track;
      }),

    applyDubbingToTimeline: (lang) =>
      set((state) => {
        state.dubbing.appliedToTimeline = lang;
        const voClip = state.timelineClips.find((c) => c.trackId === 'voiceover');
        if (voClip) {
          voClip.label = lang === 'ur' ? 'Urdu.mp3 (XTTS-v2 98% Clone)' : 'Hindi.mp3 (XTTS-v2 98% Clone)';
          voClip.metaBadge = '98% Clone';
        }
        state.statusNotification = `Applied ${lang === 'ur' ? 'Urdu.mp3' : 'Hindi.mp3'} to Voiceover Track!`;
      }),

    updateFaceTrack: (key, value) =>
      set((state) => {
        state.faceTrack[key] = value;
        const pipClip = state.timelineClips.find((c) => c.trackId === 'pip');
        if (pipClip && key === 'scalePct') {
          pipClip.label = `phone_intro.mp4 [PIP ${value}% Cutout]`;
        }
      }),

    applyAiSkipSuggestion: () =>
      set((state) => {
        state.aiSkipSuggestion.status = 'applied';
        state.videoDuration = '00:46';
        state.statusNotification =
          'Skipped "SignUp" flow using Project Memory — Saved 1:24 min!';
      }),

    dismissAiSkipSuggestion: () =>
      set((state) => {
        state.aiSkipSuggestion.status = 'dismissed';
        state.statusNotification = 'Dismissed AI Suggestion';
      }),
  }))
);
