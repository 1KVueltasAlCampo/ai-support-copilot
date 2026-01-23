from enum import Enum
from pydantic import BaseModel

class CategoryEnum(str, Enum):
    TECNICO = "Técnico"
    FACTURACION = "Facturación"
    COMERCIAL = "Comercial"

class SentimentEnum(str, Enum):
    POSITIVO = "Positivo"
    NEUTRAL = "Neutral"
    NEGATIVO = "Negativo"

class TicketAnalysis(BaseModel):
    category: CategoryEnum
    sentiment: SentimentEnum

class TicketRequest(BaseModel):
    id: str
    description: str