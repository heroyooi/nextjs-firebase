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
        alignItems: 'center',
        gap: 16,
        padding: '12px 16px',
        borderBottom: '1px solid #eee',
      }}
    >
      {/* 왼쪽 네비게이션 */}
      <nav style={{ display: 'flex', gap: 12 }}>
        <Link href='/'>Home</Link>
        <Link href='/posts'>Posts</Link>
        <Link href='/dashboard'>Dashboard</Link>
      </nav>

      {/* 오른쪽 로그인/로그아웃 영역 */}
      <div style={{ marginLeft: 'auto' }}>
        {user ? (
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <span style={{ fontSize: 14, opacity: 0.8 }}>
              안녕하세요, {user.email}
            </span>
            <button
              onClick={() => signOut(auth)}
              style={{
                padding: '6px 10px',
                border: '1px solid #ddd',
                borderRadius: 8,
                background: 'white',
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
