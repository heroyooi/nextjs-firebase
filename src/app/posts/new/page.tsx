'use client';

import { useRouter } from 'next/navigation';
import { addDoc, collection, serverTimestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase.client';
import { uploadImageByPath } from '@/lib/storage';
import PostForm from '@/components/PostForm';
import { useAuth } from '@/hooks/useAuth';

export default function NewPostPage() {
  const router = useRouter();
  const { user, loading } = useAuth();

  if (loading) return null;
  if (!user) {
    router.replace('/login');
    return null;
  }

  const create = async (data: {
    title: string;
    content: string;
    isPublic: boolean;
    file: File | null;
  }) => {
    // 일단 문서부터 만들고 postId를 얻어 경로를 안정적으로 구성
    const docRef = await addDoc(collection(db, 'posts'), {
      uid: user.uid,
      title: data.title,
      content: data.content,
      isPublic: data.isPublic,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
      thumbUrl: null,
      thumbPath: null,
    });

    let thumbUrl: string | null = null;
    let thumbPath: string | null = null;

    if (data.file) {
      const fileName = `${Date.now()}-${data.file.name}`;
      const fullPath = `users/${user.uid}/posts/${docRef.id}/${fileName}`;
      const uploaded = await uploadImageByPath(data.file, fullPath);
      thumbUrl = uploaded.url;
      thumbPath = uploaded.path;

      // 썸네일 정보만 업데이트
      await (
        await import('firebase/firestore')
      ).updateDoc(docRef, {
        thumbUrl,
        thumbPath,
        updatedAt: serverTimestamp(),
      });
    }

    router.replace(`/posts/${docRef.id}`);
  };

  return (
    <main style={{ maxWidth: 720, margin: '40px auto', padding: 16 }}>
      <h1>새 글 작성</h1>
      <PostForm onSubmit={create} submitText='등록' />
    </main>
  );
}
