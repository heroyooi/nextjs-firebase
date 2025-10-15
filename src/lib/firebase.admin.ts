import { cert, getApps, initializeApp } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';
import { getFirestore } from 'firebase-admin/firestore';
import { getStorage } from 'firebase-admin/storage';

const STORAGE_BUCKET =
  process.env.FIREBASE_STORAGE_BUCKET ?? // 서버용 권장
  process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET ?? // 임시 fallback
  '';

if (!STORAGE_BUCKET || STORAGE_BUCKET.startsWith('gs://')) {
  // 서버 콘솔에서 바로 보이게 경고
  console.warn('[firebase.admin] Invalid STORAGE_BUCKET:', STORAGE_BUCKET);
}

const adminApp = getApps().length
  ? getApps()[0]!
  : initializeApp({
      credential: cert({
        projectId: process.env.FIREBASE_ADMIN_PROJECT_ID!,
        clientEmail: process.env.FIREBASE_ADMIN_CLIENT_EMAIL!,
        privateKey: process.env.FIREBASE_ADMIN_PRIVATE_KEY?.replace(
          /\\n/g,
          '\n'
        )!,
      }),
      // ✅ 기본 버킷을 반드시 지정
      storageBucket: STORAGE_BUCKET || undefined,
    });

export const adminAuth = getAuth(adminApp);
export const adminDb = getFirestore(adminApp);
export const adminStorage = getStorage(adminApp);
