from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session, joinedload
from typing import List, Optional
from ...database import get_db
from ...models import User, APICheck, APIMonitor
from ...api.deps import get_current_user
from pydantic import BaseModel
import os
import httpx
import statistics
import json

router = APIRouter()

class AIDiagnosis(BaseModel):
    status: str
    diagnosis: str
    recommendation: str
    confidence: float
    detected_patterns: List[str]

class AIChatRequest(BaseModel):
    message: str

class AIChatResponse(BaseModel):
    response: str

@router.post("/analyze", response_model=AIDiagnosis)
async def analyze_telemetry(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    # Fetch recent telemetry logs
    logs = db.query(APICheck).join(APIMonitor).filter(
        APIMonitor.owner_id == current_user.id
    ).order_by(APICheck.checked_at.desc()).limit(50).all()

    if not logs:
        return AIDiagnosis(
            status="WAITING",
            diagnosis="Collecting telemetry metadata. COCO requires a data stream to begin analysis.",
            recommendation="Initialize at least one monitor to start the diagnostic sequence.",
            confidence=0.0,
            detected_patterns=[]
        )

    # 🚀 High-Reasoning Diagnosis via Groq
    api_key = os.getenv("GROQ_API_KEY")
    if api_key:
        api_key = api_key.strip()
        print(f"DEBUG: Analyzing with Key starting with {api_key[:8]}...")
        try:
            log_data = [{"site": l.monitor.name, "latency": l.response_time_ms, "success": l.success} for l in logs if l.monitor]
            
            async with httpx.AsyncClient() as client:
                response = await client.post(
                    "https://api.groq.com/openai/v1/chat/completions",
                    headers={"Authorization": f"Bearer {api_key}"},
                    json={
                        "model": "llama-3.3-70b-versatile",
                        "messages": [
                            {"role": "system", "content": "You are COCO, an expert systems engineer. Be extremely concise. Analyze the logs and provide a 1-sentence technical diagnosis and a 1-sentence recommendation. No conversational filler. Format as JSON with keys: status (CRITICAL, UNSTABLE, STABLE), diagnosis, recommendation, detected_patterns."},
                            {"role": "user", "content": f"Logs: {str(log_data)}"}
                        ],
                        "response_format": {"type": "json_object"}
                    },
                    timeout=12.0
                )
                
                if response.status_code == 200:
                    parsed = json.loads(response.json()["choices"][0]["message"]["content"])
                    return AIDiagnosis(
                        status=parsed.get("status", "STABLE"),
                        diagnosis=parsed.get("diagnosis", "System nominal."),
                        recommendation=parsed.get("recommendation", "Continue monitoring."),
                        confidence=0.99,
                        detected_patterns=parsed.get("detected_patterns", [])
                    )
                else:
                    print(f"COCO Analysis Fail (Code {response.status_code}): {response.text[:150]}")
        except Exception as e:
            print(f"COCO Analysis Error: {str(e)}")

    # 🧠 Fallback Engine
    latencies = [log.response_time_ms for log in logs if log.success and log.response_time_ms]
    failures = [log for log in logs if not log.success]
    
    status = "STABLE"
    diagnosis = "Fallback analysis indicates health is within baseline."
    recommendation = "Maintain current monitoring cadence."
    patterns = []

    if len(failures) > (len(logs) * 0.1):
        status = "CRITICAL"; patterns.append("FAILURE_CLUSTER")
    if len(latencies) > 1 and statistics.stdev(latencies) > (statistics.mean(latencies) * 0.4):
        status = "UNSTABLE"; patterns.append("JITTER_DETECTION")

    return AIDiagnosis(status=status, diagnosis=diagnosis, recommendation=recommendation, confidence=0.85, detected_patterns=patterns)

@router.post("/chat", response_model=AIChatResponse)
async def chat_with_ai(
    request: AIChatRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    api_key = os.getenv("GROQ_API_KEY")
    if not api_key:
        return AIChatResponse(response="I'm currently in offline mode. Please set GROQ_API_KEY.")
    
    api_key = api_key.strip() # Clean invisible spaces
    print(f"DEBUG: Chatting with Key starting with {api_key[:8]}...")

    try:
        # Fetch context with eager loading
        logs = db.query(APICheck).options(joinedload(APICheck.monitor)).join(APIMonitor).filter(
            APIMonitor.owner_id == current_user.id
        ).order_by(APICheck.checked_at.desc()).limit(20).all()

        log_context = [{"site": l.monitor.name if l.monitor else "Unknown", "ms": l.response_time_ms or 0, "ok": bool(l.success)} for l in logs]

        async with httpx.AsyncClient() as client:
            response = await client.post(
                "https://api.groq.com/openai/v1/chat/completions",
                headers={"Authorization": f"Bearer {api_key}"},
                json={
                    "model": "llama-3.3-70b-versatile",
                    "messages": [
                        {"role": "system", "content": "You are COCO. Be extremely concise and technical. Answer in 1-2 short sentences maximum. No conversational filler. Use provided logs for context."},
                        {"role": "user", "content": f"Logs: {str(log_context)}\n\nUser: {request.message}"}
                    ]
                },
                timeout=15.0
            )
            
            if response.status_code == 200:
                return AIChatResponse(response=response.json()["choices"][0]["message"]["content"])
            
            # Show the detailed error for debugging
            error_data = response.text
            return AIChatResponse(response=f"Reasoning error (Code {response.status_code}): {error_data[:150]}...")
                
    except Exception as e:
        import traceback
        traceback.print_exc() # Print full error to terminal
        return AIChatResponse(response=f"Internal Error: {str(e)}")
