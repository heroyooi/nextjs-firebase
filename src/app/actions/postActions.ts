'use server';

import { adminAuth, adminDb, adminStorage } from '@/lib/firebase.admin';
import { cookies } from 'next/headers';

async function requireUid() {
  const cookieStore = await cookies(); // Next 15: 반드시 await
  const session = cookieStore.get('__session')?.value;
  if (!session) throw new Error('UNAUTHORIZED');
  const decoded = await adminAuth.verifySessionCookie(session, true);
  return decoded.uid;
}

const BUCKET =
  process.env.FIREBASE_STORAGE_BUCKET ??
  process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET!;

/** 글 생성 (단일 파라미터) */
export async function createPostAction(formData: FormData) {
  try {
    const uid = await requireUid();

    const title = (formData.get('title') as string)?.trim();
    const content = (formData.get('content') as string)?.trim() || '';
    const isPublic = formData.get('isPublic') === 'on';
    const file = formData.get('file') as File | null; // ← input name="file"

    if (!title) throw new Error('제목을 입력하세요.');

    const ref = await adminDb.collection('posts').add({
      uid,
      title,
      content,
      isPublic,
      thumbUrl: null,
      thumbPath: null,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    let thumbUrl: string | null = null;
    let thumbPath: string | null = null;

    if (file && file.size > 0) {
      const fileName = `${Date.now()}-${file.name}`;
      thumbPath = `users/${uid}/posts/${ref.id}/${fileName}`;

      // File → Buffer
      const buffer = Buffer.from(await file.arrayBuffer());

      // 업로드
      const bucket = adminStorage.bucket(BUCKET); // 기본 버킷
      const gcsFile = bucket.file(thumbPath);
      await gcsFile.save(buffer, {
        contentType: file.type || 'application/octet-stream',
        resumable: false,
        public: false, // 기본 비공개
        metadata: { cacheControl: 'public, max-age=31536000, immutable' },
      });

      // 사인드 URL 생성(읽기용) — 필요시 만료 연장
      const [signedUrl] = await gcsFile.getSignedUrl({
        action: 'read',
        expires: Date.now() + 1000 * 60 * 60 * 24 * 365, // 1년
      });
      thumbUrl = signedUrl;

      await ref.update({ thumbUrl, thumbPath, updatedAt: new Date() });
    }

    return { ok: true, id: ref.id };
  } catch (e: any) {
    console.error(e);
    return { ok: false, message: e?.message ?? 'CREATE_FAILED' };
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
