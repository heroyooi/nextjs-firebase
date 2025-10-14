'use client';

import { useEffect, useState } from 'react';
import { auth } from '@/lib/firebase.client';
import { onAuthStateChanged, signOut, User } from 'firebase/auth';
import Link from 'next/link';

export default function HeaderAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (u) => {
      setUser(u);
      setLoading(false);
    });
    return () => unsub();
  }, []);

  if (loading) return null;

  return (
    <header
      style={{
        display: 'flex',
        gap: 12,
        alignItems: 'center',
        padding: '12px 16px',
        borderBottom: '1px solid #eee',
      }}
    >
      <Link href='/'>Home</Link>
      <Link href='/dashboard'>Dashboard</Link>
      <div style={{ marginLeft: 'auto' }}>
        {user ? (
          <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
            <span style={{ fontSize: 14 }}>안녕하세요, {user.email}</span>
            <button
              onClick={() => signOut(auth)}
              style={{
                padding: '6px 10px',
                border: '1px solid #ddd',
                borderRadius: 8,
              }}
            >
              로그아웃
            </button>
          </div>
        ) : (
          <div style={{ display: 'flex', gap: 12 }}>
            <Link href='/login'>로그인</Link>
            <Link href='/signup'>회원가입</Link>
          </div>
        )}
      </div>
    </header>
  );
}
