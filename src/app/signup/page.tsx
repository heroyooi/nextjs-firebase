'use client';

import { FormEvent, useState } from 'react';
import { auth } from '@/lib/firebase.client';
import { createUserWithEmailAndPassword, getIdToken } from 'firebase/auth'; // ★ getIdToken 추가
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function SignupPage() {
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
      // 1) Firebase Auth 회원가입
      const cred = await createUserWithEmailAndPassword(auth, email, pw);

      // 2) ID 토큰 획득
      const idToken = await getIdToken(cred.user, true);

      // 3) 서버 세션쿠키 설정
      const r = await fetch('/api/auth/session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ idToken }),
      });
      if (!r.ok) {
        const j = await r.json().catch(() => ({}));
        throw new Error(j?.message || 'SESSION_SET_FAILED');
      }

      // 4) 이동
      router.replace('/dashboard');
    } catch (e: any) {
      setErr(e?.message ?? '회원가입 실패');
    } finally {
      setLoading(false);
    }
  };

  return (
    <main style={{ maxWidth: 420, margin: '40px auto', padding: 16 }}>
      <h1>회원가입</h1>
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
          placeholder='비밀번호(6자 이상)'
          value={pw}
          onChange={(e) => setPw(e.target.value)}
          style={{ padding: 10, border: '1px solid #ddd', borderRadius: 8 }}
        />
        {err && <p style={{ color: 'crimson', fontSize: 14 }}>{err}</p>}
        <button
          disabled={loading}
          style={{ padding: '10px 12px', borderRadius: 8 }}
        >
          {loading ? '생성 중…' : '회원가입'}
        </button>
      </form>
      <p style={{ marginTop: 12, fontSize: 14 }}>
        이미 계정이 있으신가요? <Link href='/login'>로그인</Link>
      </p>
    </main>
  );
}
