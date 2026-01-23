from pydantic import BaseModel

class TicketRequest(BaseModel):
    id: str
    description: str

class TicketAnalysis(BaseModel):
    # Usamos tipos básicos para la validación de salida del SDK
    category: str
    sentiment: str