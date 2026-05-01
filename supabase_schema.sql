-- 1. Tabla de Usuarios (Admins y Clientes)
CREATE TABLE public.usuarios (
    id UUID REFERENCES auth.users(id) PRIMARY KEY,
    nombre TEXT NOT NULL,
    telefono TEXT,
    rol TEXT DEFAULT 'cliente' CHECK (rol IN ('cliente', 'admin')),
    creado_en TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 2. Tabla de Conductores
CREATE TABLE public.conductores (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    usuario_id UUID REFERENCES public.usuarios(id),
    telegram_chat_id TEXT UNIQUE,
    vehiculo TEXT,
    estado TEXT DEFAULT 'inactivo' CHECK (estado IN ('activo', 'inactivo')),
    rol_operativo TEXT DEFAULT 'abierto' CHECK (rol_operativo IN ('abierto', 'recoleccion', 'reparto')),
    creado_en TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 3. Tabla de CEDIs
CREATE TABLE public.cedis (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    nombre TEXT NOT NULL,
    latitud DOUBLE PRECISION NOT NULL,
    longitud DOUBLE PRECISION NOT NULL,
    direccion TEXT
);

-- 4. Tabla de Pedidos
CREATE TABLE public.pedidos (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tracking_number TEXT UNIQUE NOT NULL,
    tipo TEXT NOT NULL CHECK (tipo IN ('express', 'estandar')),
    
    -- Origen y Destino
    origen_lat DOUBLE PRECISION NOT NULL,
    origen_lng DOUBLE PRECISION NOT NULL,
    origen_direccion TEXT,
    destino_lat DOUBLE PRECISION NOT NULL,
    destino_lng DOUBLE PRECISION NOT NULL,
    destino_direccion TEXT,
    
    -- Usuarios relacionados
    cliente_id UUID REFERENCES public.usuarios(id),
    creado_por TEXT, -- 'cliente' o 'conductor'
    
    -- Valores comerciales y seguros
    valor_declarado NUMERIC(10, 2) DEFAULT 0,
    costo_seguro NUMERIC(10, 2) DEFAULT 0,
    tarifa_envio NUMERIC(10, 2) NOT NULL,
    
    -- Estado y Pagos
    estado TEXT DEFAULT 'creado' CHECK (estado IN ('creado', 'asignado_recoleccion', 'en_transito_cedi', 'en_cedi', 'en_ruta_entrega', 'entregado')),
    metodo_pago TEXT CHECK (metodo_pago IN ('efectivo', 'yappy', 'transferencia')),
    estado_pago TEXT DEFAULT 'pendiente' CHECK (estado_pago IN ('pendiente', 'pagado')),
    
    -- Prueba de entrega
    firma_contrato_ip TEXT,
    firma_contrato_fecha TIMESTAMP WITH TIME ZONE,
    foto_entrega_url TEXT,
    
    creado_en TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 5. Tabla de Rutas Consolidadas
CREATE TABLE public.rutas_consolidadas (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    cedi_id UUID REFERENCES public.cedis(id),
    conductor_id UUID REFERENCES public.conductores(id),
    fecha TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()),
    estado TEXT DEFAULT 'programada' CHECK (estado IN ('programada', 'en_curso', 'completada'))
);

-- Habilitar RLS (Row Level Security) para seguridad
ALTER TABLE public.usuarios ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pedidos ENABLE ROW LEVEL SECURITY;

-- Políticas de Seguridad Básicas
CREATE POLICY "Clientes ven sus propios pedidos" ON public.pedidos FOR SELECT USING (auth.uid() = cliente_id);
CREATE POLICY "Admins ven todos los pedidos" ON public.pedidos FOR SELECT USING (
  EXISTS (SELECT 1 FROM public.usuarios WHERE id = auth.uid() AND rol = 'admin')
);

-- ----------------------------------------------------
-- ACTUALIZACIÓN: B2B Y PANEL DE EMPRESAS
-- ----------------------------------------------------

-- 6. Tabla de Empresas Corporativas B2B
CREATE TABLE public.empresas (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    nombre_comercial TEXT NOT NULL,
    ruc TEXT,
    email_facturacion TEXT,
    telefono TEXT,
    direccion TEXT,
    creado_en TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 7. Tabla de Usuarios de Empresa (Equipo/Staff B2B)
CREATE TABLE public.usuarios_empresas (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    empresa_id UUID REFERENCES public.empresas(id) ON DELETE CASCADE,
    auth_user_id UUID REFERENCES auth.users(id), -- Null si es invitación pendiente
    nombre TEXT NOT NULL,
    email TEXT NOT NULL,
    rol TEXT DEFAULT 'operador' CHECK (rol IN ('admin', 'operador')),
    estado TEXT DEFAULT 'pendiente' CHECK (estado IN ('activo', 'pendiente', 'inactivo')),
    creado_en TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    UNIQUE(empresa_id, email)
);

-- 8. Actualizaciones a la tabla Pedidos
-- Relacionar el pedido con una empresa (si es B2B) y con el conductor asignado
ALTER TABLE public.pedidos ADD COLUMN IF NOT EXISTS empresa_id UUID REFERENCES public.empresas(id);
ALTER TABLE public.pedidos ADD COLUMN IF NOT EXISTS conductor_id UUID REFERENCES public.conductores(id);

-- 9. Tabla de Rutas Favoritas B2B
CREATE TABLE public.rutas_favoritas (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    empresa_id UUID REFERENCES public.empresas(id) ON DELETE CASCADE,
    nombre_ruta TEXT NOT NULL,
    origen_lat DOUBLE PRECISION NOT NULL,
    origen_lng DOUBLE PRECISION NOT NULL,
    origen_direccion TEXT,
    destino_lat DOUBLE PRECISION NOT NULL,
    destino_lng DOUBLE PRECISION NOT NULL,
    destino_direccion TEXT,
    creado_en TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);
