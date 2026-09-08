-- Rode este script no Supabase em: seu projeto > SQL Editor > New query

create table if not exists monitored_searches (
  id uuid primary key default gen_random_uuid(),
  origin text not null,
  destination text not null,
  departure_date date not null,
  return_date date,
  passengers integer not null default 1,
  email text not null,
  last_price numeric,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  last_checked_at timestamptz
);

create table if not exists price_history (
  id uuid primary key default gen_random_uuid(),
  search_id uuid not null references monitored_searches(id) on delete cascade,
  price numeric not null,
  checked_at timestamptz not null default now()
);

-- Acelera a busca de monitoramentos ativos e o histórico de cada um.
create index if not exists idx_monitored_searches_active on monitored_searches (is_active);
create index if not exists idx_price_history_search_id on price_history (search_id);

-- Habilita Row Level Security. Como o app usa a service role key no servidor
-- para todas as escritas/leituras (via API routes), não é preciso criar
-- políticas adicionais para o funcionamento básico descrito no README.
alter table monitored_searches enable row level security;
alter table price_history enable row level security;
