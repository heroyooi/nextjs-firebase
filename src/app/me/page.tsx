import { cookies } from 'next/headers';
import { adminAuth } from '@/lib/firebase.admin';

export default async function MePage() {
  const cookieStore = await cookies();
  const session = cookieStore.get('__session')?.value;

  if (!session)
    return <main style={{ padding: 16 }}>로그인 세션이 없습니다.</main>;

  try {
    const decoded = await adminAuth.verifySessionCookie(session, true);
    return <main style={{ padding: 16 }}>현재 UID: {decoded.uid}</main>;
  } catch {
    return <main style={{ padding: 16 }}>세션이 유효하지 않습니다.</main>;
  }
}
