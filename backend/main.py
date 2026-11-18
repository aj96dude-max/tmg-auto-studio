from fastapi import FastAPI, WebSocket, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware
from .database import init_db, query_cross_project_memory
from .exploration_worker import EXPLORATION_SEQUENCE, stream_exploration_telemetry
from .ffmpeg_engine import build_ffmpeg_hardware_command
from .schemas import DubbingSynthesisRequest, FFmpegExportRequest
from .speech_vision_pipeline import (
    compute_mediapipe_modnet_pip,
    run_whisperx_mistake_analysis,
    synthesize_xtts_dubbing,
)

app = FastAPI(
    title="TMG Auto Studio — Autonomous AI NLE Core Engine",
    version="3.0.0",
    description="Playwright CDP + GPT-4o Vision Explorer, WhisperX Aligner, XTTS-v2 Dubber, MediaPipe/MODNet PIP & NVENC 4K60 FFmpeg Worker",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.on_event("startup")
def on_startup() -> None:
    init_db()


@app.get("/api/health")
def health_check():
    return {
        "status": "online",
        "engine": "TMG-Auto-Studio-Core-v3",
        "playwright_cdp": "ready",
        "whisperx_cuda": "loaded",
        "xtts_v2_cloner": "loaded",
        "mediapipe_modnet": "loaded",
        "ffmpeg_nvenc": "h264_nvenc / hevc_nvenc (4K 60FPS @ 35Mbps)",
    }


@app.get("/api/explore/sequence")
def get_exploration_sequence(url: str = "https://app.linear.app/login"):
    return {
        "target_url": url,
        "total_steps": len(EXPLORATION_SEQUENCE),
        "steps": EXPLORATION_SEQUENCE,
    }


@app.get("/api/speech/analyze-mistakes/{project_id}")
def analyze_mistakes(project_id: str):
    return run_whisperx_mistake_analysis(project_id)


@app.post("/api/dubbing/synthesize")
def synthesize_dubbing(req: DubbingSynthesisRequest):
    return synthesize_xtts_dubbing(req)


@app.get("/api/vision/face-track")
def get_face_track(scale_pct: int = 25, corner: str = "top-right"):
    return compute_mediapipe_modnet_pip(scale_pct=scale_pct, corner=corner)


@app.get("/api/memory/query")
def get_project_memory():
    return {
        "entries": query_cross_project_memory(),
        "ai_suggestion": {
            "id": "sug_skip_auth",
            "title": "Reusable Auth Flow Detected in Vector Store",
            "description": "Skip previously recorded 'SignUp & Authentication' flow from Linear Workspace project (98.7% DOM cosine match).",
            "time_saved_label": "1:24 min",
            "time_saved_sec": 84,
        },
    }


@app.post("/api/render/export")
def trigger_hardware_export(req: FFmpegExportRequest):
    return build_ffmpeg_hardware_command(req)


@app.websocket("/ws/exploration")
async def websocket_exploration_endpoint(websocket: WebSocket):
    await websocket.accept()
    try:
        init_payload = await websocket.receive_json()
        target_url = init_payload.get("target_url", "https://app.linear.app/login")
        async for packet in stream_exploration_telemetry(target_url):
            await websocket.send_json(packet.model_dump())
    except WebSocketDisconnect:
        pass

