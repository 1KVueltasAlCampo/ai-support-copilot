import os
from fastapi import FastAPI, HTTPException
from dotenv import load_dotenv
from supabase import create_client, Client
from langchain_google_genai import ChatGoogleGenerativeAI
from schemas import TicketRequest, TicketAnalysis

load_dotenv()

app = FastAPI(title="AI Support Co-Pilot API")

# Configuración de Clientes
supabase: Client = create_client(
    os.getenv("SUPABASE_URL"), 
    os.getenv("SUPABASE_SERVICE_KEY")
)

llm = ChatGoogleGenerativeAI(
    model="gemini-1.5-flash",
    google_api_key=os.getenv("GOOGLE_API_KEY"),
    temperature=0 
)

structured_llm = llm.with_structured_output(TicketAnalysis)

@app.post("/process-ticket")
async def process_ticket(ticket: TicketRequest):
    try:
        prompt = f"Analiza el siguiente ticket de soporte y extrae categoría y sentimiento: {ticket.description}"
        analysis: TicketAnalysis = structured_llm.invoke(prompt)

        update_data = {
            "category": analysis.category.value,
            "sentiment": analysis.sentiment.value,
            "processed": True
        }
        
        response = supabase.table("tickets").update(update_data).eq("id", ticket.id).execute()

        if len(response.data) == 0:
            raise HTTPException(status_code=404, detail="Ticket no encontrado en la base de datos")

        return {
            "status": "success",
            "data": analysis,
            "db_updated": True
        }

    except Exception as e:
        print(f"Error procesando ticket {ticket.id}: {str(e)}")
        raise HTTPException(status_code=500, detail="Error interno en el procesamiento de IA")