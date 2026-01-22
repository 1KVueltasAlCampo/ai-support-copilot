-- 1. Crear tipos enumerados para consistencia de datos
CREATE TYPE category_type AS ENUM ('Técnico', 'Facturación', 'Comercial');
CREATE TYPE sentiment_type AS ENUM ('Positivo', 'Neutral', 'Negativo');

-- 2. Crear la tabla principal
CREATE TABLE tickets (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at TIMESTAMPTZ DEFAULT now(),
  description TEXT NOT NULL,
  category category_type,
  sentiment sentiment_type,
  processed BOOLEAN DEFAULT false
);

-- 3. Habilitar el tiempo real (Realtime)
-- Esto permite que el Dashboard de React "escuche" cambios sin refrescar
ALTER PUBLICATION supabase_realtime ADD TABLE tickets;

-- 4. Configurar Seguridad (RLS)
-- Por defecto, Supabase bloquea todo. Para la prueba, habilitaremos acceso público.
ALTER TABLE tickets ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Permitir acceso total público" 
ON tickets FOR ALL 
USING (true) 
WITH CHECK (true);