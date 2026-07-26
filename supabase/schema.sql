create extension if not exists "pgcrypto";

create table if not exists public.events (
  id uuid primary key default gen_random_uuid(),
  slug text unique not null,
  title text not null,
  description text not null,
  category text not null,
  banner_url text,
  venue text not null,
  city text not null,
  starts_at timestamptz not null,
  ends_at timestamptz,
  organizer_name text not null,
  status text not null default 'draft' check (status in ('draft','published','cancelled','completed')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.ticket_types (
  id uuid primary key default gen_random_uuid(),
  event_id uuid not null references public.events(id) on delete cascade,
  name text not null,
  description text,
  price numeric(12,2) not null check (price >= 0),
  quantity_total integer not null check (quantity_total >= 0),
  quantity_sold integer not null default 0 check (quantity_sold >= 0),
  sales_start timestamptz,
  sales_end timestamptz,
  created_at timestamptz not null default now()
);

create table if not exists public.orders (
  id uuid primary key default gen_random_uuid(),
  reference text unique not null,
  event_slug text not null,
  ticket_type_id text not null,
  ticket_name text not null,
  quantity integer not null check (quantity > 0),
  unit_price numeric(12,2) not null check (unit_price >= 0),
  subtotal numeric(12,2) not null check (subtotal >= 0),
  service_fee numeric(12,2) not null default 0 check (service_fee >= 0),
  total numeric(12,2) not null check (total >= 0),
  customer_name text not null,
  customer_email text not null,
  customer_phone text not null,
  invoice_id text,
  invoice_number text,
  invoice_url text,
  payment_status text not null default 'pending' check (payment_status in ('pending','paid','failed','cancelled','refunded')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.tickets (
  id uuid primary key default gen_random_uuid(),
  order_id uuid unique not null references public.orders(id) on delete cascade,
  ticket_code text unique not null,
  qr_payload text unique not null,
  attendee_name text not null,
  checked_in_at timestamptz,
  created_at timestamptz not null default now()
);

alter table public.events enable row level security;
alter table public.ticket_types enable row level security;
alter table public.orders enable row level security;
alter table public.tickets enable row level security;

create policy "Published events are public" on public.events for select using (status = 'published');
create policy "Ticket types for published events are public" on public.ticket_types for select using (
  exists (select 1 from public.events where events.id = ticket_types.event_id and events.status = 'published')
);

create index if not exists orders_reference_idx on public.orders(reference);
create index if not exists orders_payment_status_idx on public.orders(payment_status);
create index if not exists ticket_types_event_id_idx on public.ticket_types(event_id);
