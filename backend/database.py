import json
import math
import sqlite3
from pathlib import Path
from typing import Any, Dict, List

DB_PATH = Path(__file__).parent / "tmg_studio_state.db"


def get_connection() -> sqlite3.Connection:
    conn = sqlite3.connect(str(DB_PATH))
    conn.row_factory = sqlite3.Row
    return conn


def init_db() -> None:
    conn = get_connection()
    cur = conn.cursor()
    cur.execute(
        """
        CREATE TABLE IF NOT EXISTS projects (
            project_id TEXT PRIMARY KEY,
            title TEXT NOT NULL,
            target_url TEXT NOT NULL,
            target_duration_sec INTEGER NOT NULL,
            goal_summary TEXT NOT NULL,
            input_mode TEXT NOT NULL,
            raw_instructions TEXT NOT NULL,
            state_json TEXT NOT NULL,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
        """
    )
    cur.execute(
        """
        CREATE TABLE IF NOT EXISTS tutorial_memory_embeddings (
            step_id TEXT PRIMARY KEY,
            project_title TEXT NOT NULL,
            flow_name TEXT NOT NULL,
            selector_signature TEXT NOT NULL,
            duration_saved_sec INTEGER NOT NULL,
            recorded_at_label TEXT NOT NULL,
            embedding_json TEXT NOT NULL
        )
        """
    )
    conn.commit()

    # Seed cross-project vector memory if empty
    cur.execute("SELECT COUNT(*) as cnt FROM tutorial_memory_embeddings")
    if cur.fetchone()["cnt"] == 0:
        seed_entries = [
            (
                "mem_auth_01",
                "Linear Workspace & OAuth Setup",
                "SignUp & Authentication Flow",
                "#email-input -> #password-input -> #login-submit",
                84,
                "2h ago",
                json.dumps([0.91, 0.84, 0.12, 0.77, 0.95, 0.43, 0.88, 0.62]),
            ),
            (
                "mem_stripe_02",
                "Stripe Billing Portal Webhook Guide",
                "API Keys & Secret Token Masking",
                "#api-key-reveal -> .token-copy-btn -> #webhook-endpoint",
                52,
                "Yesterday",
                json.dumps([0.34, 0.62, 0.89, 0.41, 0.29, 0.91, 0.55, 0.78]),
            ),
            (
                "mem_supa_03",
                "Supabase Row-Level Security Policies",
                "SQL Policy Editor & Role Verification",
                "#sql-editor-canvas -> #run-query-btn -> .policy-check",
                65,
                "3d ago",
                json.dumps([0.45, 0.39, 0.74, 0.83, 0.61, 0.50, 0.92, 0.31]),
            ),
        ]
        cur.executemany(
            """
            INSERT INTO tutorial_memory_embeddings
            (step_id, project_title, flow_name, selector_signature, duration_saved_sec, recorded_at_label, embedding_json)
            VALUES (?, ?, ?, ?, ?, ?, ?)
            """,
            seed_entries,
        )
        conn.commit()
    conn.close()


def cosine_similarity(vec_a: List[float], vec_b: List[float]) -> float:
    dot = sum(a * b for a, b in zip(vec_a, vec_b))
    norm_a = math.sqrt(sum(a * a for a in vec_a))
    norm_b = math.sqrt(sum(b * b for b in vec_b))
    if norm_a == 0 or norm_b == 0:
        return 0.0
    return round(dot / (norm_a * norm_b), 4)


def query_cross_project_memory(query_vector: List[float] | None = None) -> List[Dict[str, Any]]:
    if query_vector is None:
        query_vector = [0.90, 0.82, 0.15, 0.79, 0.94, 0.40, 0.87, 0.60]
    conn = get_connection()
    cur = conn.cursor()
    cur.execute("SELECT * FROM tutorial_memory_embeddings")
    rows = cur.fetchall()
    conn.close()

    results = []
    for row in rows:
        emb = json.loads(row["embedding_json"])
        sim = cosine_similarity(query_vector, emb)
        results.append(
            {
                "step_id": row["step_id"],
                "project_title": row["project_title"],
                "flow_name": row["flow_name"],
                "selector_signature": row["selector_signature"],
                "duration_saved_sec": row["duration_saved_sec"],
                "recorded_at_label": row["recorded_at_label"],
                "similarity": sim,
            }
        )
    results.sort(key=lambda x: x["similarity"], reverse=True)
    return results

