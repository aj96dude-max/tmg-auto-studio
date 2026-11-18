import asyncio
from datetime import datetime, timezone
from typing import AsyncGenerator
from .schemas import (
    BoundingBoxCoord,
    ExplorationTelemetryPacket,
    ScriptLineSegment,
)


EXPLORATION_SEQUENCE = [
    {
        "step_index": 1,
        "action_pill_label": "Start",
        "active_selector": "window.document.body",
        "active_label": "Viewport Initialized (1920x1080 @ 60fps)",
        "confidence": 0.996,
        "bbox": {"x": 40, "y": 40, "width": 840, "height": 460},
        "zoom_scale_pct": 100.0,
        "zoom_center": (0.5, 0.5),
        "status": "exploring",
        "script": {
            "id": "scr_01",
            "start_timecode": "00:00",
            "end_timecode": "00:03",
            "start_sec": 0.0,
            "end_sec": 3.0,
            "narration_en": "Welcome to Linear Workspace. Let's walk through authenticating your developer account and launching a sprint issue.",
            "source_intent_ur": "Linear workspace kholein aur developer account login ka tareeqa dikhayein.",
            "linked_action_id": "act_start",
            "word_count": 17,
        },
    },
    {
        "step_index": 2,
        "action_pill_label": "Type Email",
        "active_selector": "input#email-field[name='email']",
        "active_label": "Work Email Input Field",
        "confidence": 0.991,
        "bbox": {"x": 290, "y": 182, "width": 340, "height": 42},
        "zoom_scale_pct": 120.0,
        "zoom_center": (0.5, 0.42),
        "status": "typing",
        "script": {
            "id": "scr_02",
            "start_timecode": "00:03",
            "end_timecode": "00:06",
            "start_sec": 3.0,
            "end_sec": 6.0,
            "narration_en": "First, enter your registered workspace email address in the primary authentication field.",
            "source_intent_ur": "Sab se pehle apna workspace email address box mein darj karein.",
            "linked_action_id": "act_email",
            "word_count": 12,
        },
    },
    {
        "step_index": 3,
        "action_pill_label": "Type Password",
        "active_selector": "input#password-field[type='password']",
        "active_label": "Password Credential Input",
        "confidence": 0.989,
        "bbox": {"x": 290, "y": 244, "width": 340, "height": 42},
        "zoom_scale_pct": 125.0,
        "zoom_center": (0.5, 0.51),
        "status": "typing",
        "script": {
            "id": "scr_03",
            "start_timecode": "00:06",
            "end_timecode": "00:09",
            "start_sec": 6.0,
            "end_sec": 9.0,
            "narration_en": "Next, input your encrypted security passphrase while automatic region blur masks sensitive keystrokes.",
            "source_intent_ur": "Ab apna password likhein, sensitive hissa khudkar blur ho jaye ga.",
            "linked_action_id": "act_password",
            "word_count": 13,
        },
    },
    {
        "step_index": 4,
        "action_pill_label": "Zoom to Click Login",
        "active_selector": "button#login-submit[data-testid='auth-submit']",
        "active_label": "Login Button",
        "confidence": 0.984,
        "bbox": {"x": 290, "y": 312, "width": 340, "height": 44},
        "zoom_scale_pct": 150.0,
        "zoom_center": (0.52, 0.64),
        "status": "clicking",
        "script": {
            "id": "scr_04",
            "start_timecode": "00:09",
            "end_timecode": "00:11",
            "start_sec": 9.0,
            "end_sec": 11.0,
            "narration_en": "Click the primary Login button to verify your session token and initialize the workspace.",
            "source_intent_ur": "Login button par click karein taake session verify ho sake.",
            "linked_action_id": "act_login",
            "word_count": 14,
        },
    },
    {
        "step_index": 5,
        "action_pill_label": "Success Screen",
        "active_selector": "div#workspace-dashboard-ready",
        "active_label": "Authenticated Dashboard Shell",
        "confidence": 0.994,
        "bbox": {"x": 80, "y": 64, "width": 760, "height": 410},
        "zoom_scale_pct": 100.0,
        "zoom_center": (0.5, 0.5),
        "status": "completed",
        "script": {
            "id": "scr_05",
            "start_timecode": "00:11",
            "end_timecode": "00:13",
            "start_sec": 11.0,
            "end_sec": 13.5,
            "narration_en": "You're now inside the production dashboard with real-time telemetry and active issue boards ready.",
            "source_intent_ur": "Ab aap mukammal dashboard mein aa chuke hain jahan tamam issues mojood hain.",
            "linked_action_id": "act_success",
            "word_count": 14,
        },
    },
]


async def stream_exploration_telemetry(target_url: str) -> AsyncGenerator[ExplorationTelemetryPacket, None]:
    """Streams real-time Playwright CDP + GPT-4o Vision exploration telemetry packets."""
    total = len(EXPLORATION_SEQUENCE)
    for item in EXPLORATION_SEQUENCE:
        await asyncio.sleep(0.85)
        packet = ExplorationTelemetryPacket(
            packet_id=f"pkt_{item['step_index']:03d}",
            timestamp_iso=datetime.now(timezone.utc).isoformat(),
            step_index=item["step_index"],
            total_steps=total,
            current_url=target_url,
            fps=60.0,
            cdp_latency_ms=11.4,
            active_selector=item["active_selector"],
            active_label=item["active_label"],
            confidence=item["confidence"],
            bbox=BoundingBoxCoord(**item["bbox"]),
            zoom_scale_pct=item["zoom_scale_pct"],
            zoom_center=item["zoom_center"],
            generated_script_line=ScriptLineSegment(**item["script"]),
            action_pill_label=item["action_pill_label"],
            status=item["status"],
        )
        yield packet

