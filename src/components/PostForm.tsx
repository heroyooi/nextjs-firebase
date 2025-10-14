'use client';

import { useState, FormEvent } from 'react';
import ImagePicker from './ImagePicker';

type Props = {
  initial?: {
    title?: string;
    content?: string;
    isPublic?: boolean;
    thumbUrl?: string;
  };
  submitText?: string;
  onSubmit: (data: {
    title: string;
    content: string;
    isPublic: boolean;
    file: File | null; // 추가: 업로드할 파일
  }) => Promise<void>;
};

export default function PostForm({
  initial,
  submitText = '저장',
  onSubmit,
}: Props) {
  const [title, setTitle] = useState(initial?.title ?? '');
  const [content, setContent] = useState(initial?.content ?? '');
  const [isPublic, setIsPublic] = useState(initial?.isPublic ?? true);
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  const handle = async (e: FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return setErr('제목을 입력하세요.');
    setErr(null);
    setLoading(true);
    try {
      await onSubmit({
        title: title.trim(),
        content: content.trim(),
        isPublic,
        file,
      });
    } catch (e: any) {
      setErr(e?.message ?? '저장 실패');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handle} style={{ display: 'grid', gap: 12 }}>
      <input
        placeholder='제목'
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        style={{ padding: 10, border: '1px solid #ddd', borderRadius: 8 }}
      />
      <textarea
        placeholder='내용(선택)'
        value={content}
        onChange={(e) => setContent(e.target.value)}
        rows={8}
        style={{ padding: 10, border: '1px solid #ddd', borderRadius: 8 }}
      />

      {/* 썸네일 업로드 */}
      <div>
        <label style={{ display: 'block', marginBottom: 6, fontWeight: 600 }}>
          썸네일
        </label>
        <ImagePicker initialUrl={initial?.thumbUrl} onFileChange={setFile} />
      </div>

      <label style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
        <input
          type='checkbox'
          checked={isPublic}
          onChange={(e) => setIsPublic(e.target.checked)}
        />
        공개글로 등록
      </label>

      {err && <p style={{ color: 'crimson', fontSize: 14 }}>{err}</p>}

      <button
        disabled={loading}
        style={{ padding: '10px 12px', borderRadius: 8 }}
      >
        {loading ? '처리 중…' : submitText}
      </button>
    </form>
  );
}
