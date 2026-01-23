import os
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv
from postgrest import SyncPostgrestClient
from google import genai
from google.genai import types
from schemas import TicketRequest, TicketAnalysis

load_dotenv()

app = FastAPI(title="AI Support Co-Pilot API")

# Configuración de CORS para evitar bloqueos en el navegador
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

# Inicialización del Cliente de Base de Datos (PostgREST directo)
# Esto evita el conflicto de websockets del SDK de Supabase
SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_KEY = os.getenv("SUPABASE_SERVICE_KEY")
db_url = f"{SUPABASE_URL}/rest/v1"
headers = {
    "apikey": SUPABASE_KEY,
    "Authorization": f"Bearer {SUPABASE_KEY}"
}
db = SyncPostgrestClient(db_url, headers=headers)

# Cliente Gemini
client = genai.Client(api_key=os.getenv("GOOGLE_API_KEY"))

@app.post("/process-ticket")
async def process_ticket(ticket: TicketRequest):
    try:
        # 1. Análisis con Gemini 2.0
        prompt = f"Analiza categoría y sentimiento de este ticket: {ticket.description}"
        response = client.models.generate_content(
            model="gemini-2.0-flash",
            contents=prompt,
            config=types.GenerateContentConfig(
                response_mime_type='application/json',
                response_schema=TicketAnalysis,
                temperature=0
            )
        )
        
        analysis = response.parsed

        # 2. Actualización en la DB usando PostgREST
        # Usamos .execute() para confirmar la transacción
        update_data = {
            "category": analysis.category,
            "sentiment": analysis.sentiment,
            "processed": True
        }
        
        result = db.table("tickets").update(update_data).eq("id", ticket.id).execute()

        if not result.data:
            raise HTTPException(status_code=404, detail="Ticket no encontrado")

        return {
            "status": "success",
            "analysis": analysis,
            "db_updated": True
        }

    except Exception as e:
        print(f"Error crítico: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))