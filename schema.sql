-- =============================================
-- TABLA: courts (Canchas)
-- =============================================
CREATE TABLE courts (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  type VARCHAR(20) NOT NULL CHECK (type IN ('PADEL', 'FUTBOL')),
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =============================================
-- TABLA: clients (Clientes)
-- =============================================
CREATE TABLE clients (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name VARCHAR(200) NOT NULL,
  phone VARCHAR(20),
  email VARCHAR(100),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =============================================
-- TABLA: bookings (Turnos/Reservas)
-- =============================================
CREATE TABLE bookings (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  court_id UUID NOT NULL REFERENCES courts(id) ON DELETE CASCADE,
  client_id UUID REFERENCES clients(id) ON DELETE SET NULL,
  start_time TIMESTAMP WITH TIME ZONE NOT NULL,
  end_time TIMESTAMP WITH TIME ZONE NOT NULL,
  status VARCHAR(20) NOT NULL DEFAULT 'PENDIENTE' CHECK (status IN ('PENDIENTE', 'SEÑADO', 'PAGADO', 'CANCELADO')),
  amount DECIMAL(10,2) NOT NULL DEFAULT 0,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Índices para mejor performance en consultas de calendario
  CONSTRAINT end_time_after_start_time CHECK (end_time > start_time)
);

-- =============================================
-- TABLA: products (Productos del Kiosco)
-- =============================================
CREATE TABLE products (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name VARCHAR(200) NOT NULL,
  price DECIMAL(10,2) NOT NULL CHECK (price >= 0),
  stock INTEGER DEFAULT NULL, -- NULL = stock ilimitado
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =============================================
-- TABLA: sales (Ventas del Kiosco)
-- =============================================
CREATE TABLE sales (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  total_amount DECIMAL(10,2) NOT NULL CHECK (total_amount >= 0),
  payment_method VARCHAR(20) DEFAULT 'EFECTIVO' CHECK (payment_method IN ('EFECTIVO', 'TARJETA', 'TRANSFERENCIA')),
  client_id UUID REFERENCES clients(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =============================================
-- TABLA: sale_items (Items de Venta)
-- =============================================
CREATE TABLE sale_items (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  sale_id UUID NOT NULL REFERENCES sales(id) ON DELETE CASCADE,
  product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  quantity INTEGER NOT NULL CHECK (quantity > 0),
  unit_price DECIMAL(10,2) NOT NULL CHECK (unit_price >= 0),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =============================================
-- TABLA: booking_sales (Ventas por Turno)
-- =============================================
CREATE TABLE booking_sales (
  booking_id UUID NOT NULL REFERENCES bookings(id) ON DELETE CASCADE,
  sale_id UUID NOT NULL REFERENCES sales(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  PRIMARY KEY (booking_id, sale_id)
);

-- =============================================
-- INSERCIÓN DE DATOS INICIALES
-- =============================================

-- Insertar las 3 canchas fijas
INSERT INTO courts (name, type) VALUES
('Pádel 1', 'PADEL'),
('Pádel 2', 'PADEL'),
('Fútbol 5', 'FUTBOL');

-- Insertar algunos productos de ejemplo para el kiosco
INSERT INTO products (name, price, stock) VALUES
('Agua Mineral 500ml', 800.00, 100),
('Gaseosa Coca-Cola 500ml', 1200.00, 50),
('Cerveza Heineken 473ml', 1800.00, 24),
('Alfajor', 600.00, 30),
('Barrita de Cereal', 400.00, 20);

-- =============================================
-- ÍNDICES PARA OPTIMIZACIÓN
-- =============================================

-- Índices para bookings (consultas frecuentes por fecha)
CREATE INDEX idx_bookings_start_time ON bookings(start_time);
CREATE INDEX idx_bookings_end_time ON bookings(end_time);
CREATE INDEX idx_bookings_court_id ON bookings(court_id);
CREATE INDEX idx_bookings_status ON bookings(status);

-- Índices para clients (búsquedas por nombre/teléfono)
CREATE INDEX idx_clients_name ON clients(name);
CREATE INDEX idx_clients_phone ON clients(phone);

-- Índices para products
CREATE INDEX idx_products_name ON products(name);
CREATE INDEX idx_products_active ON products(is_active) WHERE is_active = true;

-- Índices para sales
CREATE INDEX idx_sales_created_at ON sales(created_at);

-- =============================================
-- HABILITAR RLS (Row Level Security)
-- =============================================

-- Habilitar RLS en todas las tablas
ALTER TABLE courts ENABLE ROW LEVEL SECURITY;
ALTER TABLE clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE sales ENABLE ROW LEVEL SECURITY;
ALTER TABLE sale_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE booking_sales ENABLE ROW LEVEL SECURITY;