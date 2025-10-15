import { NextRequest, NextResponse } from 'next/server';
import { adminAuth } from '@/lib/firebase.admin';

export async function POST(req: NextRequest) {
  const { idToken } = await req.json();
  if (!idToken)
    return NextResponse.json(
      { ok: false, message: 'NO_TOKEN' },
      { status: 400 }
    );

  const expiresIn =
    Number(process.env.AUTH_SESSION_DAYS ?? 7) * 24 * 60 * 60 * 1000;

  try {
    const sessionCookie = await adminAuth.createSessionCookie(idToken, {
      expiresIn,
    });
    const res = NextResponse.json({ ok: true });

    res.cookies.set({
      name: '__session',
      value: sessionCookie,
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production', // ← 개발에선 false
      path: '/',
      maxAge: Math.floor(expiresIn / 1000),
      sameSite: 'lax',
    });
    return res;
  } catch {
    return NextResponse.json(
      { ok: false, message: 'CREATE_SESSION_FAILED' },
      { status: 401 }
    );
  }
}

export async function DELETE() {
  const res = NextResponse.json({ ok: true });
  res.cookies.set({ name: '__session', value: '', path: '/', maxAge: 0 });
  return res;
}
