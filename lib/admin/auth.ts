'use server';

import { createSupabaseServerClient } from '@/lib/supabase/server';
import { hasValidLocalAdminSession, isLocalAdminEnabled } from '@/lib/admin/local-auth';
import { redirect } from 'next/navigation';

export async function checkAdminAuth() {
  if (isLocalAdminEnabled()) {
    if (!(await hasValidLocalAdminSession())) {
      redirect('/admin/login');
    }

    return {
      user: {
        id: 'local-admin',
        email: process.env.LOCAL_ADMIN_EMAIL,
      },
      profile: {
        role: 'admin',
        status: 'active',
      },
    };
  }

  const supabase = await createSupabaseServerClient();

  const { data: { user }, error: userError } = await supabase.auth.getUser();

  if (!user || userError) {
    redirect('/admin/login');
  }

  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .select('role, status')
    .eq('id', user.id)
    .single();

  if (profileError || !profile) {
    redirect('/admin/login');
  }

  if (profile.role !== 'admin' || profile.status !== 'active') {
    redirect('/admin/unauthorized');
  }

  return { user, profile };
}
