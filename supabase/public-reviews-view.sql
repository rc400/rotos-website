-- ROTO's TCG: public review feed with privacy-safe names
-- Run in Supabase -> SQL Editor -> New query -> paste -> Run

-- 1. Manual override for any name the auto-check gets wrong
alter table public.reviews
  add column if not exists show_full_name boolean;  -- null = auto, true = always full, false = always shorten

-- 2. Auto-check: does this look like a business/brand name?
-- Returns true when a review name looks like a business/brand, not a person.
create or replace function public.is_business_name(n text)
returns boolean
language plpgsql
immutable
as $$
declare
  s text := btrim(regexp_replace(coalesce(n, ''), '\s+', ' ', 'g'));
  l text := lower(s);
  w text;
  words text[];
begin
  if s = '' then return false; end if;
  words := regexp_split_to_array(s, ' ');

  -- digits, handles, urls, underscores, pipes
  if s ~ '[0-9@_|/#]' then return true; end if;
  if l ~ '\.(com|ca|net|org|co|shop|store|io|gg|tv)\M' then return true; end if;

  -- whole-word business vocabulary
  if l ~ ('\m(collectibles?|collectables?|collecting|collections?|cards|card|tcg|ccg|tcgs|pokemon|pokémon|'
       || 'trading|traders?|games|gaming|sports|hobby|hobbies|shop|shoppe|store|stores|outlet|mart|market|'
       || 'vault|breaks|rips|pulls|slabs|slab|graded|grading|inc|incorporated|ltd|limited|llc|corp|corporation|'
       || 'co|company|enterprises?|group|ventures?|studios?|media|supply|supplies|toys|comics|emporium|depot|'
       || 'hub|club|crew|official|exchange|deals|finds|investments|capital|holdings|industries|solutions|'
       || 'sharks|realm|nation|world|empire|kingdom|labs?|city|expo|treasures?|boutique|lounge|den|cave|'
       || 'packs?|boxes|sealed|binders?|singles|rares|vintage|central|connection|plug|tcgplayer|whatnot)\M')
  then return true; end if;

  -- brand stems inside words: Collectr, PokeSean, HobbyVerse, SlabKing, PrimeCards
  if l ~ '(collect|pok[eé][a-z]|tcg|slab|hobby|verse|cards\M|cardz|kards|kardz)' then return true; end if;

  -- leading "The"
  if words[1] ~* '^the$' and array_length(words, 1) > 1 then return true; end if;

  -- possessive brand: "Kip's", "Mike's Corner"
  if s ~ '[A-Za-z]''s\M' then return true; end if;

  foreach w in array words loop
    -- CamelCase that isn't a name prefix (McKenzie, MacLeod, DeAndre, LaToya, DiCaprio, VanDyke, O'Neil)
    if w ~ '^[A-Z][a-z]+[A-Z]' and w !~ '^(Mc|Mac|De|Da|Di|Du|La|Le|Lo|Van|Von|St|Ja|Sha|Ke|Ty)[A-Z]' then
      return true;
    end if;
    -- all-caps acronym with no vowels, 3+ letters: DPS, VCC, TCGX
    if w ~ '^[A-Z]{3,}$' and w !~ '[AEIOUY]' then return true; end if;
  end loop;

  -- people rarely give 5+ words
  if (select count(*) from unnest(words) x
      where x !~ '^(de|la|le|del|della|di|da|du|van|von|der|den|bin|bint|al|el|y|e|dos|das)$') >= 5
  then return true; end if;

  return false;
end;
$$;


-- 3. "Ron Chai" -> "Ron C."   "Mary Jane Smith" -> "Mary J. S."   businesses unchanged
create or replace function public.review_display_name(full_name text, override boolean)
returns text
language plpgsql
immutable
as $$
declare
  s text := btrim(regexp_replace(coalesce(full_name, ''), '\s+', ' ', 'g'));
  words text[];
  first text;
  result text;
  i int;
begin
  if s = '' then return 'ROTO''s customer'; end if;
  if override is true or (override is null and public.is_business_name(s)) then return s; end if;
  words := regexp_split_to_array(s, ' ');
  first := regexp_replace(words[1], '[.,]+$', '');
  if first = lower(first) or first = upper(first) then first := initcap(first); end if;
  result := first;
  for i in 2 .. coalesce(array_length(words, 1), 1) loop
    if words[i] ~ '[A-Za-zÀ-ÿ]' then
      result := result || ' ' || upper(left(regexp_replace(words[i], '^[^A-Za-zÀ-ÿ]+', ''), 1)) || '.';
    end if;
  end loop;
  return result;
end;
$$;

-- 4. Public feed: approved reviews only, shortened names only (never full names or emails)
drop view if exists public.public_reviews;
create view public.public_reviews as
select
  id,
  rating,
  nullif(btrim(comment), '') as comment,
  public.review_display_name(name, show_full_name) as display_name,
  created_at
from public.reviews
where approved = true;

grant select on public.public_reviews to anon;

-- 5. Stop exposing full names from the raw table
revoke select (name) on public.reviews from anon;
