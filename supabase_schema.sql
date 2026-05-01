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
