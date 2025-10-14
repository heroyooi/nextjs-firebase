'use client';

import { storage } from '@/lib/firebase.client';
import { ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage';

export async function uploadImageByPath(file: File, fullPath: string) {
  const fileRef = ref(storage, fullPath);
  const snap = await uploadBytes(fileRef, file, {
    contentType: file.type || 'application/octet-stream',
    cacheControl: 'public,max-age=31536000,immutable',
  });
  const url = await getDownloadURL(snap.ref);
  return { url, path: snap.ref.fullPath };
}

export async function deleteByPath(path?: string) {
  if (!path) return;
  try {
    await deleteObject(ref(storage, path));
  } catch (e) {
    // 없는 파일일 수 있으므로 조용히 무시
    console.warn('deleteByPath warning:', e);
  }
}