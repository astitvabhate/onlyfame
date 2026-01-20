import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import { ProfileSetupLoading } from '@/components/ProfileSetupLoading';

export default async function ActorLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const supabase = await createClient();

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) redirect('/auth/login');

    const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .single();

    if (!profile) {
        // Profile might be creating via trigger (race condition)
        return <ProfileSetupLoading />;
    }

    if (profile.role === 'caster') {
        redirect('/caster/dashboard');
    } else if (profile.role !== 'actor') {
        redirect('/auth/login');
    }

    return <>{children}</>;
}
