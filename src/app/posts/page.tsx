'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { auth, db } from '@/lib/firebase.client';
import {
  collection,
  onSnapshot,
  orderBy,
  query,
  where,
} from 'firebase/firestore';
import type { Post } from '@/types/post';
import { onAuthStateChanged } from 'firebase/auth';

export default function PostsPage() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [mine, setMine] = useState(false);
  const [uid, setUid] = useState<string | null>(null);

  useEffect(() => {
    const unsubAuth = onAuthStateChanged(auth, (u) => setUid(u ? u.uid : null));
    return () => unsubAuth();
  }, []);

  const qRef = useMemo(() => {
    const base = collection(db, 'posts');
    // 공개글만 or 내 글만
    return mine && uid
      ? query(base, where('uid', '==', uid), orderBy('createdAt', 'desc'))
      : query(
          base,
          where('isPublic', '==', true),
          orderBy('createdAt', 'desc')
        );
  }, [mine, uid]);

  useEffect(() => {
    const unsub = onSnapshot(qRef, (snap) => {
      const list = snap.docs.map((d) => ({
        id: d.id,
        ...(d.data() as any),
      })) as Post[];
      setPosts(list);
    });
    return () => unsub();
  }, [qRef]);

  return (
    <main style={{ maxWidth: 800, margin: '40px auto', padding: 16 }}>
      <h1>게시글 목록</h1>
      <div
        style={{
          display: 'flex',
          gap: 12,
          alignItems: 'center',
          margin: '12px 0',
        }}
      >
        <label style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          <input
            type='checkbox'
            checked={mine}
            onChange={(e) => setMine(e.target.checked)}
          />
          내 글만 보기
        </label>
        <Link href='/posts/new' style={{ marginLeft: 'auto' }}>
          + 새 글
        </Link>
      </div>

      <ul style={{ display: 'grid', gap: 10 }}>
        {posts.map((p) => (
          <li
            key={p.id}
            style={{ border: '1px solid #eee', borderRadius: 8, padding: 12 }}
          >
            <Link href={`/posts/${p.id}`} style={{ fontWeight: 600 }}>
              {p.title}
            </Link>
            <div style={{ fontSize: 12, opacity: 0.7, marginTop: 6 }}>
              {p.isPublic ? '공개' : '비공개'} · {p.uid.slice(0, 6)}…
            </div>
          </li>
        ))}
        {posts.length === 0 && <p>글이 없습니다.</p>}
      </ul>
    </main>
  );
}
