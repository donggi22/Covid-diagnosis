from typing import List, Optional
from pydantic import BaseModel


class DiagnosisRequest(BaseModel):
    patient_id: str
    image_path: Optional[str] = None
    notes: Optional[str] = None


class Finding(BaseModel):
    condition: str
    probability: float
    description: str | None = None


class DiagnosisResponse(BaseModel):
    patient_id: str
    confidence: float
    findings: List[Finding]
    recommendations: List[str]
    ai_notes: str
    gradcam_path: Optional[str] = None
    gradcam_plus_path: Optional[str] = None
    layercam_path: Optional[str] = None
