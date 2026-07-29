import { createSupabaseServerClient } from '@/lib/supabase/server';
import { isLocalAdminEnabled, LOCAL_ADMIN_COOKIE } from '@/lib/admin/local-auth';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';

export async function POST() {
  if (isLocalAdminEnabled()) {
    const cookieStore = await cookies();
    cookieStore.delete(LOCAL_ADMIN_COOKIE);
    redirect('/admin/login');
  }

  const supabase = await createSupabaseServerClient();

  await supabase.auth.signOut();

  redirect('/admin/login');
}
