create extension if not exists "pgcrypto";

-- Enum types
create type public.event_status as enum ('draft', 'pending_approval', 'published', 'ongoing', 'completed', 'cancelled', 'sold_out');
create type public.payment_status as enum ('pending', 'paid', 'failed', 'cancelled', 'refunded');

-- Tables
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text,
  email text,
  phone text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.roles (
  id uuid primary key default gen_random_uuid(),
  name text unique not null,
  description text
);

create table if not exists public.user_roles (
  user_id uuid references public.profiles(id) on delete cascade,
  role_id uuid references public.roles(id) on delete cascade,
  primary key (user_id, role_id)
);

create table if not exists public.organizers (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references public.profiles(id) on delete cascade,
  business_name text not null,
  description text,
  logo_url text,
  contact_email text,
  contact_phone text,
  verification_status text not null default 'pending' check (verification_status in ('pending', 'approved', 'rejected', 'suspended')),
  commission_percentage numeric(5,2) not null default 5.00,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.organizer_documents (
  id uuid primary key default gen_random_uuid(),
  organizer_id uuid not null references public.organizers(id) on delete cascade,
  document_type text not null,
  document_url text not null,
  uploaded_at timestamptz not null default now()
);

create table if not exists public.categories (
  id uuid primary key default gen_random_uuid(),
  name text unique not null,
  slug text unique not null,
  image_url text
);

create table if not exists public.venues (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  address text not null,
  city text not null,
  capacity integer,
  map_url text,
  created_at timestamptz not null default now()
);

create table if not exists public.events (
  id uuid primary key default gen_random_uuid(),
  slug text unique not null,
  organizer_id uuid not null references public.organizers(id) on delete cascade,
  title text not null,
  description text not null,
  category_id uuid references public.categories(id),
  banner_url text,
  venue_id uuid references public.venues(id),
  city text not null,
  starts_at timestamptz not null,
  ends_at timestamptz,
  status public.event_status not null default 'draft',
  is_featured boolean not null default false,
  instructions text,
  refund_policy text,
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
  purchase_limit integer default 10,
  created_at timestamptz not null default now()
);

create table if not exists public.orders (
  id uuid primary key default gen_random_uuid(),
  reference text unique not null,
  customer_id uuid references public.profiles(id),
  event_id uuid not null references public.events(id),
  customer_name text not null,
  customer_email text not null,
  customer_phone text not null,
  subtotal numeric(12,2) not null check (subtotal >= 0),
  service_fee numeric(12,2) not null default 0 check (service_fee >= 0),
  discount numeric(12,2) not null default 0 check (discount >= 0),
  total numeric(12,2) not null check (total >= 0),
  invoice_id text,
  invoice_number text,
  invoice_url text,
  payment_status public.payment_status not null default 'pending',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.order_items (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.orders(id) on delete cascade,
  ticket_type_id uuid not null references public.ticket_types(id),
  quantity integer not null check (quantity > 0),
  unit_price numeric(12,2) not null check (unit_price >= 0)
);

create table if not exists public.tickets (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.orders(id) on delete cascade,
  ticket_type_id uuid not null references public.ticket_types(id),
  ticket_code text unique not null,
  qr_payload text unique not null,
  attendee_name text,
  status text not null default 'valid' check (status in ('valid', 'used', 'cancelled', 'refunded')),
  created_at timestamptz not null default now()
);

create table if not exists public.check_ins (
  id uuid primary key default gen_random_uuid(),
  ticket_id uuid not null references public.tickets(id) on delete cascade,
  scanned_by uuid references public.profiles(id),
  scanned_at timestamptz not null default now(),
  is_manual boolean not null default false
);

create table if not exists public.refunds (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.orders(id) on delete cascade,
  amount numeric(12,2) not null,
  reason text,
  status text not null default 'pending' check (status in ('pending', 'approved', 'rejected', 'completed')),
  requested_by uuid references public.profiles(id),
  processed_by uuid references public.profiles(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- RLS
alter table public.profiles enable row level security;
alter table public.roles enable row level security;
alter table public.user_roles enable row level security;
alter table public.organizers enable row level security;
alter table public.categories enable row level security;
alter table public.venues enable row level security;
alter table public.events enable row level security;
alter table public.ticket_types enable row level security;
alter table public.orders enable row level security;
alter table public.order_items enable row level security;
alter table public.tickets enable row level security;

create policy "Public can read published events" on public.events for select using (status = 'published');
create policy "Public can read categories" on public.categories for select using (true);
create policy "Public can read venues" on public.venues for select using (true);
create policy "Public can read ticket types for published events" on public.ticket_types for select using (
  exists (select 1 from public.events where events.id = ticket_types.event_id and events.status = 'published')
);

create policy "Users can read own profile" on public.profiles for select using (auth.uid() = id);
create policy "Users can update own profile" on public.profiles for update using (auth.uid() = id);

create policy "Users can read own orders" on public.orders for select using (customer_id = auth.uid());
create policy "Users can read own tickets" on public.tickets for select using (
  exists (select 1 from public.orders where orders.id = tickets.order_id and orders.customer_id = auth.uid())
);

-- Trigger to automatically create profile for new auth.users
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, phone, full_name)
  values (
    new.id,
    new.phone,
    new.raw_user_meta_data->>'name'
  );
  return new;
end;
$$ language plpgsql security definer;

-- Drop trigger if exists
drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();
