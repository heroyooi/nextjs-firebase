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
import { deleteByPath, uploadImageByPath } from '@/lib/storage';

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
    file: File | null;
  }) => {
    if (!post) return;

    let nextThumbUrl = post.thumbUrl ?? null;
    let nextThumbPath = post.thumbPath ?? null;

    // 파일 교체가 있으면 새로 업로드 → 이전 파일 삭제
    if (data.file && uid) {
      const fileName = `${Date.now()}-${data.file.name}`;
      const fullPath = `users/${uid}/posts/${post.id}/${fileName}`;
      const uploaded = await uploadImageByPath(data.file, fullPath);
      // 이전 파일 삭제(있으면)
      if (post.thumbPath && post.thumbPath !== uploaded.path) {
        await deleteByPath(post.thumbPath);
      }
      nextThumbUrl = uploaded.url;
      nextThumbPath = uploaded.path;
    }

    await updateDoc(doc(db, 'posts', id), {
      title: data.title,
      content: data.content,
      isPublic: data.isPublic,
      thumbUrl: nextThumbUrl,
      thumbPath: nextThumbPath,
      updatedAt: serverTimestamp(),
    });

    setEditing(false);
    const snap = await getDoc(doc(db, 'posts', id));
    setPost({ id: snap.id, ...(snap.data() as any) });
  };

  const remove = async () => {
    if (!post) return;
    if (!confirm('삭제하시겠습니까?')) return;

    // 파일 먼저 정리(있으면)
    await deleteByPath(post.thumbPath);
    await deleteDoc(doc(db, 'posts', id));
    router.replace('/posts');
  };

  if (!post) return null;

  return (
    <main style={{ maxWidth: 720, margin: '40px auto', padding: 16 }}>
      {!editing ? (
        <>
          <h1>{post.title}</h1>
          {post.thumbUrl && (
            <img
              src={post.thumbUrl}
              alt='thumbnail'
              style={{
                width: '100%',
                maxWidth: 720,
                borderRadius: 12,
                margin: '12px 0',
              }}
            />
          )}
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
              thumbUrl: post.thumbUrl,
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
