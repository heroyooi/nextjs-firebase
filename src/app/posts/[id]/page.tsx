'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { auth, db } from '@/lib/firebase.client';
import {
  deleteDoc,
  doc,
  getDoc,
  updateDoc,
  serverTimestamp,
} from 'firebase/firestore';
import { onAuthStateChanged } from 'firebase/auth';
import type { Post } from '@/types/post';
import PostForm from '@/components/PostForm';

export default function PostDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [post, setPost] = useState<Post | null>(null);
  const [uid, setUid] = useState<string | null>(null);
  const [editing, setEditing] = useState(false);

  useEffect(() => onAuthStateChanged(auth, (u) => setUid(u?.uid ?? null)), []);
  useEffect(() => {
    const load = async () => {
      const snap = await getDoc(doc(db, 'posts', id));
      if (!snap.exists()) return router.replace('/posts');
      setPost({ id: snap.id, ...(snap.data() as any) });
    };
    load();
  }, [id, router]);

  const isOwner = uid && post && uid === post.uid;

  const update = async (data: {
    title: string;
    content: string;
    isPublic: boolean;
  }) => {
    await updateDoc(doc(db, 'posts', id), {
      title: data.title,
      content: data.content,
      isPublic: data.isPublic,
      updatedAt: serverTimestamp(),
    });
    setEditing(false);
    // 상세 재조회
    const snap = await getDoc(doc(db, 'posts', id));
    setPost({ id: snap.id, ...(snap.data() as any) });
  };

  const remove = async () => {
    if (!confirm('삭제하시겠습니까?')) return;
    await deleteDoc(doc(db, 'posts', id));
    router.replace('/posts');
  };

  if (!post) return null;

  return (
    <main style={{ maxWidth: 720, margin: '40px auto', padding: 16 }}>
      {!editing ? (
        <>
          <h1>{post.title}</h1>
          {post.content && (
            <p style={{ whiteSpace: 'pre-wrap', marginTop: 12 }}>
              {post.content}
            </p>
          )}
          <div style={{ fontSize: 12, opacity: 0.7, marginTop: 8 }}>
            {post.isPublic ? '공개' : '비공개'} · 작성자 {post.uid.slice(0, 6)}…
          </div>
          {isOwner && (
            <div style={{ display: 'flex', gap: 8, marginTop: 16 }}>
              <button
                onClick={() => setEditing(true)}
                style={{ padding: '8px 12px', borderRadius: 8 }}
              >
                수정
              </button>
              <button
                onClick={remove}
                style={{
                  padding: '8px 12px',
                  borderRadius: 8,
                  border: '1px solid #f33',
                  color: '#f33',
                }}
              >
                삭제
              </button>
            </div>
          )}
        </>
      ) : (
        <>
          <h1>글 수정</h1>
          <PostForm
            initial={{
              title: post.title,
              content: post.content,
              isPublic: post.isPublic,
            }}
            submitText='수정 완료'
            onSubmit={update}
          />
          <button onClick={() => setEditing(false)} style={{ marginTop: 12 }}>
            취소
          </button>
        </>
      )}
    </main>
  );
}
