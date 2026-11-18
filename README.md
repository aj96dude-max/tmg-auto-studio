# TMG Auto Studio — Autonomous AI Tutorial Generator & 4K Multi-Track Desktop NLE

**TMG Auto Studio (v3.0)** is an industrial monochrome Desktop Non-Linear Editor (NLE) and autonomous AI software tutorial synthesis suite inspired by **DaVinci Resolve** and **Linear**.

---

## 1. Industrial Monochrome Design System

| Token Role | Hex Code | Usage |
| :--- | :--- | :--- |
| **Root Workspace Canvas** | `#09090B` | Deep matte carbon base canvas & viewport |
| **Docked Panels** | `#121215` | Slate black sidebars, headers, & Bento cards |
| **Timeline Tracks & Inputs** | `#18181C` | Dark graphite track lanes, inputs, & controls |
| **Structural Hairlines** | `#27272A` | Crisp `1px solid` pane dividers & borders (`4px` radii) |
| **Primary Semantic CTA** | `#2563EB` | Cobalt blue active timeline/script blocks & primary CTAs |
| **Live Engine Telemetry** | `#10B981` | Emerald green CDP indicators, voice match, & chapter checks |
| **Mistake Anomaly Alert** | `#F59E0B` | Amber warning badges (`01:12` silence/filler alert) |

* **Typography Hierarchy**: `Inter` (Regular, Medium, SemiBold) for high-density panel controls paired with `JetBrains Mono` for SMPTE timecodes, frame counters, bitrates, and DOM confidence telemetry.

---

## 2. Workspace Views & Functional Architecture

### View 1: Auto-Exploration Setup (`src/components/views/AutoExplorationView.tsx`)
* **Top Setup Bar**: File/Edit/View/Run/Help menu bar, live engine telemetry pills, `Tool/App Link` input, `Video Duration` field, `Goal` input, plus `Generate Preview` and `Reset` buttons.
* **Left Input Column**: `Urdu`, `English`, and `Voice` mode toggles, `User Instructions` textarea, informational specificity tip banner, and bottom `Voice input standby` indicator.
* **Center Live Viewport**: Embedded live headless browser frame (`Playwright Chromium CDP v131`) with interactive target element bounding boxes, `98% confidence Login Button` badge (`#login-submit`), click action popups, and `AUTO-ZOOM FOCUS: +150%` callout.
* **Right Script Column**: Timestamped narrator blocks (`00:00` to `00:13`) with active `#2563EB` blue highlight synchronization, inline `Copy`/`Edit` controls, and word-count/duration summary footer.
* **Bottom Action Timeline**: Audio waveform overlaid with interactive action pills (`Start`, `Type Email`, `Type Password`, `Zoom to Click Login`, `Success Screen`), `Zoom +150%` automation bar, and `Save` / `Export to Pro Editor` buttons.

### View 2: Pro Editor Mode (`src/components/views/ProEditorView.tsx`)
* **Left Media Library**: `Project`, `Effects`, and `Audio` tabs displaying thumbnails and technical specs for `phone_intro.mp4`, `screen_recording_001.mp4`, `screen_recording_002.mp4`, and `voiceover_EN.wav`, plus `Import Media`.
* **Center Monitor & Toolbar**: `Preview`/`Program` view toggles, `3×3 grid` video canvas, dual SMPTE timecodes (`SRC` / `REC`), transport controls, and the **7-Tool Bar** (`Trim`, `Split`, `Crop`, `Auto-Zoom`, `Cursor Highlight`, `Text`, `Blur`).
* **Right Properties Inspector**: Collapsible **Text & Captions** (`Inter SemiBold`, `Fade In + Slide Up`), **Audio** (`Background Music Volume 68%` slider), and **Export** (`4K 60FPS`, `35 Mbps`, `GPU` checkbox) panels.
* **Bottom Multi-Track Timeline**: Synchronized stack for `Video Screen Clips`, `English Voiceover` waveform, bilingual `EN/UR Captions`, `background_music.mp3` waveform, and `Zoom 110% to 125%` / `Blur` keyframes.

### View 3: Upgraded Features v3 Dashboard (`src/components/views/UpgradedFeaturesV3View.tsx`)
* **Auto-Chapter & Mistake Card**: Timestamped YouTube chapters with `#10B981` green checkmarks and an `#F59E0B` amber warning at `01:12` (`"Detected: filler word repeated, 3s silence"`) with `Re-record` (3-second voice patch) and `Ignore` buttons.
* **Multi-Language Dubbing Card**: Side-by-side `English` source and `Urdu/Hindi` target waveforms, `AI Voice Clone ON` toggle, `98% voice match` telemetry, and `Urdu.mp3` / `Hindi.mp3` export badges.
* **Face Auto-Track Merger Card**: Screen recording canvas with a locked `25% scale` top-right PIP cutout of `phone_intro.mp4`, featuring toggleable 68-point facial landmarks, MODNet background removal, and natural drop shadows.
* **Project Memory Card**: Lists recent tutorials with timestamps and renders an AI Suggestion card offering to skip previously recorded flows (`SignUp`) to save `1:24 min` with `Apply` and `Dismiss` buttons.

---

## 3. Running the Application

```bash
# 1. Start Frontend / Desktop Dev Server
npm install
npm run dev

# 2. (Optional) Start Python FastAPI AI & FFmpeg Worker
pip install -r backend/requirements.txt
uvicorn backend.main:app --reload --port 8000
```

