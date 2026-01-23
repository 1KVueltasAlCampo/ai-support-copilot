from pydantic import BaseModel, Field
from enum import Enum
from typing import Optional

class CategoryEnum(str, Enum):
    tecnico = "Técnico"
    facturacion = "Facturación"
    comercial = "Comercial"

class SentimentEnum(str, Enum):
    positivo = "Positivo"
    neutral = "Neutral"
    negativo = "Negativo"

class TicketRequest(BaseModel):
    id: str
    description: str

class TicketAnalysis(BaseModel):
    category: CategoryEnum = Field(description="Categoría principal del ticket")
    sentiment: SentimentEnum = Field(description="Sentimiento predominante del usuario")