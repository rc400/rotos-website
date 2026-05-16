# Loaded Pack Pages

Public viewer:

```text
https://rotostcg.ca/loaded/?u=<RON_USER_ID>
```

Admin:

```text
https://rotostcg.ca/loaded/admin/
```

Sign in with Ron's Supabase email/password. The admin page shows the logged-in `user_id` and has a "Copy public QR link" button for the customer-facing URL.

## Supabase RLS

Run this in the Supabase SQL editor after replacing `RON_USER_ID_HERE` with the user ID shown in the admin page:

```sql
-- Run in Supabase SQL editor to allow public read of Ron's data:
create policy "public read pack_sets for ron" on pack_sets
  for select using (user_id = 'RON_USER_ID_HERE');

create policy "public read pack_set_cards for ron's sets" on pack_set_cards
  for select using (pack_set_id in (select id from pack_sets where user_id = 'RON_USER_ID_HERE'));
```

If realtime updates do not appear publicly, also confirm Supabase Realtime is enabled for `pack_set_cards`.
