'use server';

import { adminAuth, adminDb } from '@/lib/firebase.admin';
import { cookies } from 'next/headers';

async function requireUid() {
  const cookieStore = await cookies(); // Next 15: 반드시 await
  const session = cookieStore.get('__session')?.value;
  if (!session) throw new Error('UNAUTHORIZED');
  const decoded = await adminAuth.verifySessionCookie(session, true);
  return decoded.uid;
}

/** 글 생성 (단일 파라미터) */
export async function createPostAction(formData: FormData) {
  try {
    const uid = await requireUid();
    const title = (formData.get('title') as string)?.trim();
    const content = (formData.get('content') as string)?.trim() || '';
    const isPublic = formData.get('isPublic') === 'on';
    if (!title) throw new Error('제목을 입력하세요.');

    const docRef = await adminDb.collection('posts').add({
      uid,
      title,
      content,
      isPublic,
      thumbUrl: null,
      thumbPath: null,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    return { ok: true, id: docRef.id };
  } catch (e: any) {
    return { ok: false, message: e?.message ?? '글 생성 실패' };
  }
}

/** 글 수정 */
export async function updatePostAction(formData: FormData) {
  try {
    const uid = await requireUid();
    const id = (formData.get('id') as string)?.trim();
    const title = (formData.get('title') as string)?.trim();
    const content = (formData.get('content') as string)?.trim() || '';
    const isPublic = formData.get('isPublic') === 'on';
    if (!id) throw new Error('ID 누락');
    if (!title) throw new Error('제목을 입력하세요.');

    const ref = adminDb.collection('posts').doc(id);
    const snap = await ref.get();
    if (!snap.exists) throw new Error('NOT_FOUND');
    if (snap.get('uid') !== uid) throw new Error('FORBIDDEN');

    await ref.update({ title, content, isPublic, updatedAt: new Date() });
    return { ok: true };
  } catch (e: any) {
    return { ok: false, message: e?.message ?? '글 수정 실패' };
  }
}

/** 글 삭제 */
export async function deletePostAction(formData: FormData) {
  try {
    const uid = await requireUid();
    const id = (formData.get('id') as string)?.trim();
    if (!id) throw new Error('ID 누락');

    const ref = adminDb.collection('posts').doc(id);
    const snap = await ref.get();
    if (!snap.exists) throw new Error('NOT_FOUND');
    if (snap.get('uid') !== uid) throw new Error('FORBIDDEN');

    await ref.delete();
    return { ok: true };
  } catch (e: any) {
    return { ok: false, message: e?.message ?? '글 삭제 실패' };
  }
}
