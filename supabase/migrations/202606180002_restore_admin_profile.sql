alter table public.profiles disable trigger profiles_prevent_privilege_escalation;

update public.profiles
set role = 'admin',
    status = 'active',
    updated_at = now()
where email = 'gilfernandesml@gmail.com';

alter table public.profiles enable trigger profiles_prevent_privilege_escalation;
