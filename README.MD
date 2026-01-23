# AI-Powered Support Co-Pilot | VIVETORI Technical Challenge

Este proyecto es una solución integral de **Inteligencia Artificial Full-Stack** diseñada para optimizar la gestión de tickets de soporte. El sistema automatiza la clasificación, el análisis de sentimiento y la visualización en tiempo real de las solicitudes de los usuarios.

## 🚀 Enlaces del Proyecto

* **Dashboard Activo:** [ubiquitous-starlight-d753ba.netlify.app](https://ubiquitous-starlight-d753ba.netlify.app)
* **API de Python (Backend):** [https://ai-support-copilot-0im9.onrender.com](https://ai-support-copilot-0im9.onrender.com)

---

## 🛠️ Stack Tecnológico

* **Frontend:** React 18, TypeScript, Vite, Tailwind CSS, Lucide Icons.
* **Backend:** Python 3.10, FastAPI, Google GenAI SDK (Gemini 2.0 Flash).
* **Base de Datos:** Supabase (PostgreSQL) con capacidades de Realtime.
* **Automatización:** n8n (Workflow orchestration).
* **Infraestructura:** Render (API) y Netlify (Frontend).

---

## 🧠 Estrategia de Prompt Engineering

Para el núcleo de procesamiento de lenguaje natural, se implementó una estrategia avanzada de **Persona-Based Structured Prompting** optimizada para el modelo **Gemini 2.0 Flash**. Los pilares fundamentales son:

1. **Contextual Anchoring & Role Prompting:** Se definió un contexto de negocio específico para VIVETORI, asignando al modelo el rol de "Agente de Inteligencia de Soporte". Esto alinea el tono y los criterios de clasificación con los objetivos operativos de la empresa.
2. **Delimitadores de Seguridad:** Se utilizaron triple comillas (`"""`) para aislar la entrada del usuario (`ticket.description`). Esta técnica de segmentación previene ataques de *Prompt Injection* y ayuda al modelo a distinguir claramente entre instrucciones del sistema y datos a procesar.
3. **Salida Estructurada (Constraint Enforcement):** Se configuró un **JSON Schema plano** inyectado directamente en el motor de inferencia del SDK de Google. Esto garantiza que la respuesta sea 100% compatible con los tipos `Enum` de PostgreSQL en Supabase, eliminando errores de parseo y garantizando la integridad de los datos.
4. **Determinismo Técnico:** El modelo se configuró con una `temperature: 0.1`. Este valor extremadamente bajo asegura que el análisis sea consistente y predecible, evitando variaciones creativas en la clasificación de categorías críticas como "Técnico" o "Facturación".
5. **Lógica de Priorización:** El prompt incluye reglas de decisión para casos ambiguos, instruyendo al modelo a priorizar etiquetas de alta urgencia o sentimientos negativos para disparar flujos críticos en n8n.

---

## ⚙️ Arquitectura del Sistema

1. **Ingesta:** Un ticket es insertado en la tabla `tickets` de Supabase.
2. **Orquestación:** n8n detecta la nueva fila y consume el microservicio de Python.
3. **Inferencia:** FastAPI recibe el contenido, aplica la estrategia de Prompt Engineering y obtiene el análisis estructurado de Gemini 2.0.
4. **Persistencia:** El microservicio actualiza la fila en Supabase mediante el cliente de **PostgREST**, marcando el ticket como procesado.
5. **Visualización:** El Dashboard de React, suscrito a los canales de **Supabase Realtime**, actualiza la interfaz instantáneamente sin requerir interacción del usuario.
6. **Alerta:** Si el sentimiento es **"Negativo"**, el flujo de n8n dispara una notificación automática por correo electrónico.

---

## 📂 Estructura del Repositorio

* `/supabase`: Esquema de base de datos (`setup.sql`) y políticas de seguridad.
* `/python-api`: Microservicio FastAPI, modelos de Pydantic y configuración de IA.
* `/n8n-workflow`: Exportación del flujo de automatización en formato JSON.
* `/frontend`: Código fuente del Dashboard interactivo.

---

**Desarrollado por Juan David Cruz Garcia** - *Ingeniero de Sistemas*