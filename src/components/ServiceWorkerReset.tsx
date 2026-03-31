'use client';

import { useEffect } from 'react';

export function ServiceWorkerReset() {
    useEffect(() => {
        if (typeof window === 'undefined' || !('serviceWorker' in navigator)) {
            return;
        }

        navigator.serviceWorker
            .getRegistrations()
            .then((registrations) => Promise.all(registrations.map((registration) => registration.unregister())))
            .then(() => caches.keys())
            .then((cacheNames) => Promise.all(cacheNames.map((cacheName) => caches.delete(cacheName))))
            .catch(() => {
                // Ignore cleanup failures in development.
            });
    }, []);

    return null;
}
