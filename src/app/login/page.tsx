'use client';

import { FormEvent, useState } from 'react';
import { auth } from '@/lib/firebase.client';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [pw, setPw] = useState('');
  const [err, setErr] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setErr(null);
    setLoading(true);
    try {
      await signInWithEmailAndPassword(auth, email, pw);
      router.replace('/dashboard');
    } catch (e: any) {
      setErr(e?.message ?? '로그인 실패');
    } finally {
      setLoading(false);
    }
  };

  return (
    <main style={{ maxWidth: 420, margin: '40px auto', padding: 16 }}>
      <h1>로그인</h1>
      <form
        onSubmit={onSubmit}
        style={{ display: 'grid', gap: 10, marginTop: 16 }}
      >
        <input
          type='email'
          placeholder='이메일'
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          style={{ padding: 10, border: '1px solid #ddd', borderRadius: 8 }}
        />
        <input
          type='password'
          placeholder='비밀번호'
          value={pw}
          onChange={(e) => setPw(e.target.value)}
          style={{ padding: 10, border: '1px solid #ddd', borderRadius: 8 }}
        />
        {err && <p style={{ color: 'crimson', fontSize: 14 }}>{err}</p>}
        <button
          disabled={loading}
          style={{ padding: '10px 12px', borderRadius: 8 }}
        >
          {loading ? '로그인 중…' : '로그인'}
        </button>
      </form>
      <p style={{ marginTop: 12, fontSize: 14 }}>
        계정이 없으신가요? <Link href='/signup'>회원가입</Link>
      </p>
    </main>
  );
}
