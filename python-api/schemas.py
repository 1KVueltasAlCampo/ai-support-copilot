from pydantic import BaseModel

class TicketAnalysis(BaseModel):
    category: str # 'Técnico', 'Facturación', 'Comercial'
    sentiment: str # 'Positivo', 'Neutral', 'Negativo'

class TicketRequest(BaseModel):
    id: str
    description: str