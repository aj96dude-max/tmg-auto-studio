from __future__ import annotations
from typing import List, Optional, Literal
from pydantic import BaseModel, Field


class BoundingBoxCoord(BaseModel):
    x: float
    y: float
    width: float
    height: float


class DetectedDOMElement(BaseModel):
    id: str
    selector: str
    label: str
    role: str
    confidence: float = Field(..., ge=0.0, le=1.0)
    bbox: BoundingBoxCoord
    action_type: Literal["click", "type", "focus", "verify", "hover"]
    input_value: Optional[str] = None


class ZoomKeyframeContract(BaseModel):
    id: str
    frame: int
    timestamp_sec: float
    scale_percent: float = Field(default=100.0, ge=100.0, le=300.0)
    target_x: float = Field(default=0.5, ge=0.0, le=1.0)
    target_y: float = Field(default=0.5, ge=0.0, le=1.0)
    easing: Literal["cubic-bezier", "linear", "ease-in-out", "spring-damped"] = "cubic-bezier"


class BlurRegionContract(BaseModel):
    id: str
    label: str
    start_frame: int
    end_frame: int
    x: float
    y: float
    width: float
    height: float
    intensity_px: int = 18
    enabled: bool = True


class BilingualCaptionPayload(BaseModel):
    id: str
    start_frame: int
    end_frame: int
    start_timecode: str
    end_timecode: str
    text_en: str
    text_ur: str
    text_hi: Optional[str] = None
    confidence: float = 0.99
    animation: Literal["fade-slide-up", "cut", "typewriter"] = "fade-slide-up"


class TimelineClipContract(BaseModel):
    id: str
    track_id: str
    track_type: Literal["video_screen", "video_pip", "audio_vo", "captions", "audio_bgm", "fx_keyframes"]
    label: str
    media_source_id: str
    start_frame: int
    end_frame: int
    in_point_frame: int = 0
    fps: int = 60
    volume_pct: float = 100.0
    zoom_keyframes: List[ZoomKeyframeContract] = []
    blur_regions: List[BlurRegionContract] = []
    caption_payload: Optional[BilingualCaptionPayload] = None


class ScriptLineSegment(BaseModel):
    id: str
    start_timecode: str
    end_timecode: str
    start_sec: float
    end_sec: float
    narration_en: str
    source_intent_ur: Optional[str] = None
    linked_action_id: str
    word_count: int


class ExplorationTelemetryPacket(BaseModel):
    packet_id: str
    timestamp_iso: str
    step_index: int
    total_steps: int
    current_url: str
    fps: float
    cdp_latency_ms: float
    active_selector: str
    active_label: str
    confidence: float
    bbox: BoundingBoxCoord
    zoom_scale_pct: float
    zoom_center: tuple[float, float]
    generated_script_line: ScriptLineSegment
    action_pill_label: str
    status: Literal["exploring", "typing", "zooming", "clicking", "completed"]


class MistakeDetectionResult(BaseModel):
    id: str
    timecode: str
    timestamp_sec: float
    duration_sec: float
    issue_type: Literal["filler_word_repeated", "silence_gap", "stutter"]
    description: str
    transcript_snippet: str
    confidence: float
    status: Literal["active", "patched", "ignored"] = "active"


class DubbingSynthesisRequest(BaseModel):
    project_id: str
    target_language: Literal["ur", "hi"]
    voice_clone_enabled: bool = True
    speaker_reference_wav: str = "voiceover_EN.wav"
    temperature: float = 0.65


class FFmpegExportRequest(BaseModel):
    project_id: str
    resolution: Literal["3840x2160", "2560x1440", "1920x1080"] = "3840x2160"
    fps: int = 60
    bitrate_mbps: int = 35
    codec: Literal["h264_nvenc", "hevc_nvenc", "h264_videotoolbox", "hevc_videotoolbox"] = "h264_nvenc"
    gpu_acceleration: bool = True
    bgm_volume_pct: int = 68
    burn_in_captions: bool = True
    pip_face_cutout: bool = True
    pip_scale_pct: int = 25


class ProjectStateSchema(BaseModel):
    project_id: str
    title: str
    target_url: str
    target_duration_sec: int
    goal_summary: str
    input_mode: Literal["urdu", "english", "voice"]
    raw_instructions: str
    dom_nodes: List[DetectedDOMElement]
    script_segments: List[ScriptLineSegment]
    timeline_clips: List[TimelineClipContract]
    export_config: FFmpegExportRequest

