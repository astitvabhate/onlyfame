'use client';

import { createClient } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

interface ApplicationActionsProps {
    applicationId: string;
}

export function ApplicationActions({ applicationId }: ApplicationActionsProps) {
    const router = useRouter();
    const [updating, setUpdating] = useState(false);

    const updateStatus = async (status: 'shortlisted' | 'rejected') => {
        setUpdating(true);
        const supabase = createClient();

        await supabase
            .from('applications')
            .update({ status })
            .eq('id', applicationId);

        router.refresh();
        setUpdating(false);
    };

    return (
        <div className="mt-4 pt-4 border-t border-neutral-800 flex gap-2">
            <button
                onClick={() => updateStatus('shortlisted')}
                disabled={updating}
                className="btn bg-amber-500/20 text-amber-300 border border-amber-500/30 hover:bg-amber-500/30 text-sm py-1.5"
            >
                Shortlist
            </button>
            <button
                onClick={() => updateStatus('rejected')}
                disabled={updating}
                className="btn bg-red-500/20 text-red-300 border border-red-500/30 hover:bg-red-500/30 text-sm py-1.5"
            >
                Reject
            </button>
        </div>
    );
}
