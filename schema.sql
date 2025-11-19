-- =============================================
-- TABLA: courts (Canchas)
-- =============================================
create table public.courts (
  id uuid not null default gen_random_uuid (),
  name character varying(100) not null,
  type character varying(20) not null,
  is_active boolean null default true,
  created_at timestamp with time zone null default now(),
  constraint courts_pkey primary key (id),
  constraint courts_type_check check (
    (
      (type)::text = any (
        (
          array[
            'PADEL'::character varying,
            'FUTBOL'::character varying
          ]
        )::text[]
      )
    )
  )
) TABLESPACE pg_default;

-- =============================================
-- TABLA: clients (Clientes)
-- =============================================
create table public.clients (
  id uuid not null default gen_random_uuid (),
  name character varying(200) not null,
  phone character varying(20) null,
  email character varying(100) null,
  created_at timestamp with time zone null default now(),
  constraint clients_pkey primary key (id)
) TABLESPACE pg_default;

create index IF not exists idx_clients_name on public.clients using btree (name) TABLESPACE pg_default;
create index IF not exists idx_clients_phone on public.clients using btree (phone) TABLESPACE pg_default;

-- =============================================
-- TABLA: bookings (Turnos/Reservas)
-- =============================================
-- Note: bookings table definition was not fully provided in the snippet but referenced. 
-- Keeping the original definition but assuming it exists for foreign keys.
CREATE TABLE IF NOT EXISTS bookings (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  court_id UUID NOT NULL REFERENCES courts(id) ON DELETE CASCADE,
  client_id UUID REFERENCES clients(id) ON DELETE SET NULL,
  start_time TIMESTAMP WITH TIME ZONE NOT NULL,
  end_time TIMESTAMP WITH TIME ZONE NOT NULL,
  status VARCHAR(20) NOT NULL DEFAULT 'PENDIENTE' CHECK (status IN ('PENDIENTE', 'SEÑADO', 'PAGADO', 'CANCELADO')),
  amount DECIMAL(10,2) NOT NULL DEFAULT 0,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  CONSTRAINT end_time_after_start_time CHECK (end_time > start_time)
);

-- =============================================
-- TABLA: products (Productos)
-- =============================================
create table public.products (
  id uuid not null default gen_random_uuid (),
  name character varying(200) not null,
  price numeric(10, 2) not null,
  stock integer null,
  is_active boolean null default true,
  created_at timestamp with time zone null default now(),
  cost_price numeric(10, 2) null,
  rotation_rate character varying(20) null,
  is_composite boolean null default false,
  min_stock integer null default 0,
  track_stock boolean null default true,
  constraint products_pkey primary key (id),
  constraint products_price_check check ((price >= (0)::numeric)),
  constraint products_rotation_rate_check check (
    (
      (rotation_rate)::text = any (
        (
          array[
            'high'::character varying,
            'medium'::character varying,
            'low'::character varying
          ]
        )::text[]
      )
    )
  )
) TABLESPACE pg_default;

create index IF not exists idx_products_name on public.products using btree (name) TABLESPACE pg_default;
create index IF not exists idx_products_active on public.products using btree (is_active) TABLESPACE pg_default where (is_active = true);

-- =============================================
-- TABLA: product_components (Componentes de Productos Compuestos)
-- =============================================
create table public.product_components (
  id uuid not null default gen_random_uuid (),
  parent_product_id uuid not null,
  component_product_id uuid not null,
  quantity_required numeric(10, 3) not null,
  created_at timestamp with time zone null default now(),
  constraint product_components_pkey primary key (id),
  constraint product_components_parent_product_id_component_product_id_key unique (parent_product_id, component_product_id),
  constraint product_components_component_product_id_fkey foreign KEY (component_product_id) references products (id) on delete CASCADE,
  constraint product_components_parent_product_id_fkey foreign KEY (parent_product_id) references products (id) on delete CASCADE,
  constraint product_components_quantity_required_check check ((quantity_required > (0)::numeric))
) TABLESPACE pg_default;

create index IF not exists idx_product_components_parent on public.product_components using btree (parent_product_id) TABLESPACE pg_default;
create index IF not exists idx_product_components_component on public.product_components using btree (component_product_id) TABLESPACE pg_default;

-- =============================================
-- TABLA: sales (Ventas)
-- =============================================
CREATE TABLE IF NOT EXISTS sales (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  total_amount DECIMAL(10,2) NOT NULL CHECK (total_amount >= 0),
  payment_method VARCHAR(20) DEFAULT 'EFECTIVO' CHECK (payment_method IN ('EFECTIVO', 'TARJETA', 'TRANSFERENCIA')),
  client_id UUID REFERENCES clients(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =============================================
-- TABLA: sale_items (Items de Venta)
-- =============================================
create table public.sale_items (
  id uuid not null default gen_random_uuid (),
  sale_id uuid not null,
  product_id uuid not null,
  quantity integer not null,
  unit_price numeric(10, 2) not null,
  created_at timestamp with time zone null default now(),
  constraint sale_items_pkey primary key (id),
  constraint sale_items_product_id_fkey foreign KEY (product_id) references products (id) on delete CASCADE,
  constraint sale_items_sale_id_fkey foreign KEY (sale_id) references sales (id) on delete CASCADE,
  constraint sale_items_quantity_check check ((quantity > 0)),
  constraint sale_items_unit_price_check check ((unit_price >= (0)::numeric))
) TABLESPACE pg_default;

-- Trigger placeholder (function definition not provided in snippet)
-- create trigger trg_update_product_stock after INSERT on sale_items for EACH row execute FUNCTION update_product_stock ();

-- =============================================
-- TABLA: booking_sales (Ventas asociadas a Turnos)
-- =============================================
create table public.booking_sales (
  booking_id uuid not null,
  sale_id uuid not null,
  created_at timestamp with time zone null default now(),
  constraint booking_sales_pkey primary key (booking_id, sale_id),
  constraint booking_sales_booking_id_fkey foreign KEY (booking_id) references bookings (id) on delete CASCADE,
  constraint booking_sales_sale_id_fkey foreign KEY (sale_id) references sales (id) on delete CASCADE
) TABLESPACE pg_default;

-- =============================================
-- TABLA: stock_movements (Movimientos de Stock)
-- =============================================
create table public.stock_movements (
  id uuid not null default gen_random_uuid (),
  product_id uuid not null,
  movement_type character varying(20) not null,
  quantity integer not null,
  unit_price numeric(10, 2) null,
  cost_price numeric(10, 2) null,
  related_sale_id uuid null,
  notes text null,
  created_at timestamp with time zone null default now(),
  constraint stock_movements_pkey primary key (id),
  constraint stock_movements_product_id_fkey foreign KEY (product_id) references products (id),
  constraint stock_movements_movement_type_check check (
    (
      (movement_type)::text = any (
        (
          array[
            'sale'::character varying,
            'purchase'::character varying,
            'adjustment'::character varying,
            'discount'::character varying,
            'composite_usage'::character varying
          ]
        )::text[]
      )
    )
  )
) TABLESPACE pg_default;

create index IF not exists idx_stock_movements_product on public.stock_movements using btree (product_id) TABLESPACE pg_default;
create index IF not exists idx_stock_movements_created_at on public.stock_movements using btree (created_at) TABLESPACE pg_default;

-- =============================================
-- TABLA: users (Usuarios)
-- =============================================
-- Assuming user_role type exists
-- CREATE TYPE public.user_role AS ENUM ('admin', 'employee', 'partner');

create table public.users (
  id uuid not null,
  email text not null,
  full_name text null,
  id uuid not null default gen_random_uuid (),
  name character varying(100) not null,
  type character varying(20) not null,
  is_active boolean null default true,
  created_at timestamp with time zone null default now(),
  constraint courts_pkey primary key (id),
  constraint courts_type_check check (
    (
      (type)::text = any (
        (
          array[
            'PADEL'::character varying,
            'FUTBOL'::character varying
          ]
        )::text[]
      )
    )
  )
) TABLESPACE pg_default;

-- =============================================
-- TABLA: clients (Clientes)
-- =============================================
create table public.clients (
  id uuid not null default gen_random_uuid (),
  name character varying(200) not null,
  phone character varying(20) null,
  email character varying(100) null,
  created_at timestamp with time zone null default now(),
  constraint clients_pkey primary key (id)
) TABLESPACE pg_default;

create index IF not exists idx_clients_name on public.clients using btree (name) TABLESPACE pg_default;
create index IF not exists idx_clients_phone on public.clients using btree (phone) TABLESPACE pg_default;

-- =============================================
-- TABLA: bookings (Turnos/Reservas)
-- =============================================
-- Note: bookings table definition was not fully provided in the snippet but referenced. 
-- Keeping the original definition but assuming it exists for foreign keys.
CREATE TABLE IF NOT EXISTS bookings (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  court_id UUID NOT NULL REFERENCES courts(id) ON DELETE CASCADE,
  client_id UUID REFERENCES clients(id) ON DELETE SET NULL,
  start_time TIMESTAMP WITH TIME ZONE NOT NULL,
  end_time TIMESTAMP WITH TIME ZONE NOT NULL,
  status VARCHAR(20) NOT NULL DEFAULT 'PENDIENTE' CHECK (status IN ('PENDIENTE', 'SEÑADO', 'PAGADO', 'CANCELADO')),
  amount DECIMAL(10,2) NOT NULL DEFAULT 0,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  CONSTRAINT end_time_after_start_time CHECK (end_time > start_time)
);

-- =============================================
-- TABLA: products (Productos)
-- =============================================
create table public.products (
  id uuid not null default gen_random_uuid (),
  name character varying(200) not null,
  price numeric(10, 2) not null,
  stock integer null,
  is_active boolean null default true,
  created_at timestamp with time zone null default now(),
  cost_price numeric(10, 2) null,
  rotation_rate character varying(20) null,
  is_composite boolean null default false,
  min_stock integer null default 0,
  track_stock boolean null default true,
  constraint products_pkey primary key (id),
  constraint products_price_check check ((price >= (0)::numeric)),
  constraint products_rotation_rate_check check (
    (
      (rotation_rate)::text = any (
        (
          array[
            'high'::character varying,
            'medium'::character varying,
            'low'::character varying
          ]
        )::text[]
      )
    )
  )
) TABLESPACE pg_default;

create index IF not exists idx_products_name on public.products using btree (name) TABLESPACE pg_default;
create index IF not exists idx_products_active on public.products using btree (is_active) TABLESPACE pg_default where (is_active = true);

-- =============================================
-- TABLA: product_components (Componentes de Productos Compuestos)
-- =============================================
create table public.product_components (
  id uuid not null default gen_random_uuid (),
  parent_product_id uuid not null,
  component_product_id uuid not null,
  quantity_required numeric(10, 3) not null,
  created_at timestamp with time zone null default now(),
  constraint product_components_pkey primary key (id),
  constraint product_components_parent_product_id_component_product_id_key unique (parent_product_id, component_product_id),
  constraint product_components_component_product_id_fkey foreign KEY (component_product_id) references products (id) on delete CASCADE,
  constraint product_components_parent_product_id_fkey foreign KEY (parent_product_id) references products (id) on delete CASCADE,
  constraint product_components_quantity_required_check check ((quantity_required > (0)::numeric))
) TABLESPACE pg_default;

create index IF not exists idx_product_components_parent on public.product_components using btree (parent_product_id) TABLESPACE pg_default;
create index IF not exists idx_product_components_component on public.product_components using btree (component_product_id) TABLESPACE pg_default;

-- =============================================
-- TABLA: sales (Ventas)
-- =============================================
CREATE TABLE IF NOT EXISTS sales (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  total_amount DECIMAL(10,2) NOT NULL CHECK (total_amount >= 0),
  payment_method VARCHAR(20) DEFAULT 'EFECTIVO' CHECK (payment_method IN ('EFECTIVO', 'TARJETA', 'TRANSFERENCIA')),
  client_id UUID REFERENCES clients(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =============================================
-- TABLA: sale_items (Items de Venta)
-- =============================================
create table public.sale_items (
  id uuid not null default gen_random_uuid (),
  sale_id uuid not null,
  product_id uuid not null,
  quantity integer not null,
  unit_price numeric(10, 2) not null,
  created_at timestamp with time zone null default now(),
  constraint sale_items_pkey primary key (id),
  constraint sale_items_product_id_fkey foreign KEY (product_id) references products (id) on delete CASCADE,
  constraint sale_items_sale_id_fkey foreign KEY (sale_id) references sales (id) on delete CASCADE,
  constraint sale_items_quantity_check check ((quantity > 0)),
  constraint sale_items_unit_price_check check ((unit_price >= (0)::numeric))
) TABLESPACE pg_default;

-- Trigger placeholder (function definition not provided in snippet)
-- create trigger trg_update_product_stock after INSERT on sale_items for EACH row execute FUNCTION update_product_stock ();

-- =============================================
-- TABLA: booking_sales (Ventas asociadas a Turnos)
-- =============================================
create table public.booking_sales (
  booking_id uuid not null,
  sale_id uuid not null,
  created_at timestamp with time zone null default now(),
  constraint booking_sales_pkey primary key (booking_id, sale_id),
  constraint booking_sales_booking_id_fkey foreign KEY (booking_id) references bookings (id) on delete CASCADE,
  constraint booking_sales_sale_id_fkey foreign KEY (sale_id) references sales (id) on delete CASCADE
) TABLESPACE pg_default;

-- =============================================
-- TABLA: stock_movements (Movimientos de Stock)
-- =============================================
create table public.stock_movements (
  id uuid not null default gen_random_uuid (),
  product_id uuid not null,
  movement_type character varying(20) not null,
  quantity integer not null,
  unit_price numeric(10, 2) null,
  cost_price numeric(10, 2) null,
  related_sale_id uuid null,
  notes text null,
  created_at timestamp with time zone null default now(),
  constraint stock_movements_pkey primary key (id),
  constraint stock_movements_product_id_fkey foreign KEY (product_id) references products (id),
  constraint stock_movements_movement_type_check check (
    (
      (movement_type)::text = any (
        (
          array[
            'sale'::character varying,
            'purchase'::character varying,
            'adjustment'::character varying,
            'discount'::character varying,
            'composite_usage'::character varying
          ]
        )::text[]
      )
    )
  )
) TABLESPACE pg_default;

create index IF not exists idx_stock_movements_product on public.stock_movements using btree (product_id) TABLESPACE pg_default;
create index IF not exists idx_stock_movements_created_at on public.stock_movements using btree (created_at) TABLESPACE pg_default;

-- =============================================
-- TABLA: users (Usuarios)
-- =============================================
-- Assuming user_role type exists
-- CREATE TYPE public.user_role AS ENUM ('admin', 'employee', 'partner');

create table public.users (
  id uuid not null,
  email text not null,
  full_name text null,
  role public.user_role not null default 'employee'::user_role,
  is_active boolean null default true,
  created_at timestamp with time zone null default now(),
  updated_at timestamp with time zone null default now(),
  constraint users_pkey primary key (id),
  constraint users_id_fkey foreign KEY (id) references auth.users (id)
) TABLESPACE pg_default;

-- =============================================
-- TABLA: expenses (Gastos)
-- =============================================
create table public.expenses (
  id uuid not null default gen_random_uuid (),
  description text not null,
  amount numeric(10, 2) not null,
  category character varying(50) not null,
  date timestamp with time zone not null default now(),
  user_id uuid references users(id),
  created_at timestamp with time zone null default now(),
  constraint expenses_pkey primary key (id),
  constraint expenses_amount_check check ((amount > (0)::numeric))
) TABLESPACE pg_default;

create index IF not exists idx_expenses_date on public.expenses using btree (date) TABLESPACE pg_default;
create index IF not exists idx_expenses_category on public.expenses using btree (category) TABLESPACE pg_default;