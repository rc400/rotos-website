-- ROTO's TCG — reviews table
-- Run this in Supabase → SQL Editor → New query → paste → Run
-- Project: vcyhutqrnhbeuyrlfrvt

-- ---------------------------------------------------------------
-- 1. Table
-- ---------------------------------------------------------------
create table if not exists public.reviews (
  id          uuid primary key default gen_random_uuid(),
  rating      smallint    not null check (rating between 1 and 5),
  comment     text        check (comment is null or char_length(comment) <= 2000),
  email       text        check (email is null or email ~* '^[^@\s]+@[^@\s]+\.[^@\s]+$'),
  name        text        check (name is null or char_length(name) <= 80),
  approved    boolean     not null default false,
  created_at  timestamptz not null default now()
);

comment on table  public.reviews is 'Customer reviews submitted from rotostcg.ca/review';
comment on column public.reviews.approved is 'Flip to true to publish on the site. Nothing shows publicly until this is true.';
comment on column public.reviews.email is 'Optional. Used for giveaway entry only.';

-- Helpful indexes
create index if not exists reviews_approved_created_idx
  on public.reviews (approved, created_at desc);

create index if not exists reviews_email_idx
  on public.reviews (email) where email is not null;

-- ---------------------------------------------------------------
-- 2. Row Level Security
-- ---------------------------------------------------------------
alter table public.reviews enable row level security;

-- Anyone (anon key) may submit a review.
-- They can only insert rows that are NOT pre-approved.
drop policy if exists "anon can submit reviews" on public.reviews;
create policy "anon can submit reviews"
  on public.reviews
  for insert
  to anon
  with check (approved = false);

-- Public may only read reviews you have approved.
drop policy if exists "public reads approved reviews" on public.reviews;
create policy "public reads approved reviews"
  on public.reviews
  for select
  to anon
  using (approved = true);

-- No anon update/delete policies = anon cannot modify or remove anything.

-- ---------------------------------------------------------------
-- 3. Lock down column access on insert
--    anon may only write these columns; approved/created_at/id are
--    forced to their defaults.
-- ---------------------------------------------------------------
revoke all on public.reviews from anon;
grant insert (rating, comment, email, name) on public.reviews to anon;
grant select (id, rating, comment, name, created_at)  on public.reviews to anon;

-- ---------------------------------------------------------------
-- 4. Rate limiting — max 3 submissions per email per day,
--    and block duplicate identical comments.
-- ---------------------------------------------------------------
create or replace function public.reviews_rate_limit()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  recent_count integer;
begin
  -- Block exact duplicate comment text in the last hour (spam signature)
  if new.comment is not null and char_length(trim(new.comment)) > 0 then
    select count(*) into recent_count
    from public.reviews
    where comment = new.comment
      and created_at > now() - interval '1 hour';

    if recent_count >= 1 then
      raise exception 'duplicate_submission';
    end if;
  end if;

  -- Max 3 reviews per email per 24h
  if new.email is not null then
    select count(*) into recent_count
    from public.reviews
    where email = new.email
      and created_at > now() - interval '24 hours';

    if recent_count >= 3 then
      raise exception 'rate_limited';
    end if;
  end if;

  return new;
end;
$$;

drop trigger if exists reviews_rate_limit_trigger on public.reviews;
create trigger reviews_rate_limit_trigger
  before insert on public.reviews
  for each row execute function public.reviews_rate_limit();

-- ---------------------------------------------------------------
-- Done.
--
-- To approve a review:
--   Supabase → Table Editor → reviews → flip `approved` to true
--
-- To pull giveaway entries:
--   select distinct email from public.reviews where email is not null;
-- ---------------------------------------------------------------
