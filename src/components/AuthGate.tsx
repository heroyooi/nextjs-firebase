'use client';

import { ReactNode, useEffect, useState } from 'react';
import { auth } from '@/lib/firebase.client';
import { onAuthStateChanged } from 'firebase/auth';
import { useRouter } from 'next/navigation';

export default function AuthGate({ children }: { children: ReactNode }) {
  const router = useRouter();
  const [ready, setReady] = useState(false);
  const [authed, setAuthed] = useState(false);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (u) => {
      setAuthed(!!u);
      setReady(true);
      if (!u) router.replace('/login');
    });
    return () => unsub();
  }, [router]);

  if (!ready) return null; // 또는 로딩 스피너

  return <>{authed ? children : null}</>;
}
