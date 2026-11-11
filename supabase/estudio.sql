-- Estúdio de Cards — tabelas no mesmo Supabase do VPR Insta Full Postagens.
-- Cole tudo no Supabase: SQL Editor → New query → Run. Pode rodar mais de uma vez.

-- ------------------------------------------------ configurações por usuário
-- Nome e @ do cabeçalho, @ do selo "Siga o @…" e a biblioteca de rodapés de repost.
create table if not exists public.estudio_config (
  user_id      uuid primary key default auth.uid() references auth.users(id) on delete cascade,
  nome         text not null default 'Jhonatta • Negócios e IA',
  handle       text not null default '@ojhonatta1',
  selo_handle  text,
  rodapes      jsonb not null default '{}'::jsonb,   -- {"Categoria": ["🔁 frase", ...]}
  updated_at   timestamptz not null default now()
);
-- interruptores do card (selo "Siga o @" e rodapé de repost)
alter table public.estudio_config add column if not exists mostrar_selo   boolean not null default true;
alter table public.estudio_config add column if not exists mostrar_rodape boolean not null default true;

-- ------------------------------------------- histórico de rodapés usados
-- O Estúdio lê os últimos 5 para não repetir o mesmo rodapé em vídeos seguidos.
create table if not exists public.estudio_rodapes_hist (
  id          bigint generated always as identity primary key,
  user_id     uuid not null default auth.uid() references auth.users(id) on delete cascade,
  rodape      text not null,
  numero      bigint,
  created_at  timestamptz not null default now()
);
create index if not exists estudio_rodapes_hist_user_idx on public.estudio_rodapes_hist (user_id, created_at desc);

-- ----------------------------------------------------------- segurança
-- Cada usuário só vê e altera as próprias linhas (pensado para a versão de assinatura).
alter table public.estudio_config       enable row level security;
alter table public.estudio_rodapes_hist enable row level security;

drop policy if exists "dono config" on public.estudio_config;
create policy "dono config" on public.estudio_config for all to authenticated
  using (user_id = auth.uid()) with check (user_id = auth.uid());

drop policy if exists "dono historico" on public.estudio_rodapes_hist;
create policy "dono historico" on public.estudio_rodapes_hist for all to authenticated
  using (user_id = auth.uid()) with check (user_id = auth.uid());

grant select, insert, update, delete on public.estudio_config, public.estudio_rodapes_hist to authenticated;
revoke all on public.estudio_config, public.estudio_rodapes_hist from anon;

-- ------------------------------------------- plano de conexão junto do vídeo
-- O modo automático grava o comentário para fixar e o JSON do motor de conexão.
alter table public.videos add column if not exists comentario_fixado text;
alter table public.videos add column if not exists conexao jsonb;
