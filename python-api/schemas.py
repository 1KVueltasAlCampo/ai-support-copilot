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
    id: str  # El ID que viene de Supabase/n8n
    description: str

class TicketAnalysis(BaseModel):
    """Esquema para la salida estructurada del LLM"""
    category: CategoryEnum = Field(description="Categoría principal del ticket")
    sentiment: SentimentEnum = Field(description="Sentimiento predominante del usuario")