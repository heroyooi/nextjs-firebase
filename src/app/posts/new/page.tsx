'use client';

import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { addDoc, collection, serverTimestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase.client';
import PostForm from '@/components/PostForm';
import { useAuth } from '@/hooks/useAuth';

export default function NewPostPage() {
  const router = useRouter();
  const { user, loading } = useAuth();

  useEffect(() => {
    if (!loading && !user) router.replace('/login');
  }, [loading, user, router]);

  if (loading) return null; // 또는 스켈레톤 UI
  if (!user) return null; // 리다이렉트 직전 깜빡임 방지

  const create = async (data: {
    title: string;
    content: string;
    isPublic: boolean;
  }) => {
    const docRef = await addDoc(collection(db, 'posts'), {
      uid: user.uid,
      title: data.title,
      content: data.content,
      isPublic: data.isPublic,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
    router.replace(`/posts/${docRef.id}`);
  };

  return (
    <main style={{ maxWidth: 720, margin: '40px auto', padding: 16 }}>
      <h1>새 글 작성</h1>
      <PostForm onSubmit={create} submitText='등록' />
    </main>
  );
}
