'use client';

import { FormEvent, useEffect, useState } from 'react';
import { db } from '@/lib/firebase.client';
import {
  collection,
  addDoc,
  serverTimestamp,
  getDocs,
  query,
  orderBy,
} from 'firebase/firestore';

type Post = {
  id: string;
  title: string;
  createdAt?: { seconds: number; nanoseconds: number } | null;
};

export default function HomePage() {
  const [title, setTitle] = useState('');
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchPosts = async () => {
    const q = query(collection(db, 'posts'), orderBy('createdAt', 'desc'));
    const snap = await getDocs(q);
    const list: Post[] = snap.docs.map((d) => ({
      id: d.id,
      ...(d.data() as any),
    }));
    setPosts(list);
  };

  useEffect(() => {
    fetchPosts();
  }, []);

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;
    setLoading(true);
    try {
      await addDoc(collection(db, 'posts'), {
        title: title.trim(),
        createdAt: serverTimestamp(),
      });
      setTitle('');
      await fetchPosts();
    } finally {
      setLoading(false);
    }
  };

  return (
    <main style={{ maxWidth: 720, margin: '40px auto', padding: 16 }}>
      <h1>Next.js + Firebase — Test</h1>

      <form
        onSubmit={onSubmit}
        style={{ display: 'flex', gap: 8, marginTop: 16 }}
      >
        <input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder='제목 입력'
          style={{
            flex: 1,
            padding: 10,
            border: '1px solid #ddd',
            borderRadius: 8,
          }}
        />
        <button
          type='submit'
          disabled={loading}
          style={{ padding: '10px 16px', borderRadius: 8 }}
        >
          {loading ? '저장 중…' : '추가'}
        </button>
      </form>

      <ul style={{ marginTop: 24, display: 'grid', gap: 12 }}>
        {posts.map((p) => (
          <li
            key={p.id}
            style={{ border: '1px solid #eee', padding: 12, borderRadius: 8 }}
          >
            <strong>{p.title}</strong>
          </li>
        ))}
      </ul>
    </main>
  );
}
