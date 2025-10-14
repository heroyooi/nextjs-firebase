'use client';

import { useEffect, useRef, useState } from 'react';

type Props = {
  initialUrl?: string;
  onFileChange: (file: File | null) => void;
  accept?: string;
  maxSizeMB?: number;
};

export default function ImagePicker({
  initialUrl,
  onFileChange,
  accept = 'image/*',
  maxSizeMB = 5,
}: Props) {
  const inputRef = useRef<HTMLInputElement | null>(null);
  const [preview, setPreview] = useState<string | undefined>(initialUrl);
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => setPreview(initialUrl), [initialUrl]);

  const handlePick = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] ?? null;
    if (!file) {
      onFileChange(null);
      setPreview(initialUrl);
      return;
    }
    if (!file.type.startsWith('image/')) {
      setErr('이미지 파일만 업로드할 수 있습니다.');
      onFileChange(null);
      return;
    }
    if (file.size > maxSizeMB * 1024 * 1024) {
      setErr(`파일 용량은 최대 ${maxSizeMB}MB까지 가능합니다.`);
      onFileChange(null);
      return;
    }
    setErr(null);
    onFileChange(file);
    const url = URL.createObjectURL(file);
    setPreview(url);
  };

  const clear = () => {
    if (inputRef.current) inputRef.current.value = '';
    onFileChange(null);
    setPreview(initialUrl);
  };

  return (
    <div style={{ display: 'grid', gap: 8 }}>
      <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
        <input ref={inputRef} type="file" accept={accept} onChange={handlePick} />
        {preview && (
          <button type="button" onClick={clear} style={{ padding: '6px 10px', borderRadius: 8 }}>
            선택 해제
          </button>
        )}
      </div>
      {err && <p style={{ color: 'crimson', fontSize: 13 }}>{err}</p>}
      {preview && (
        <img src={preview}
          alt="preview"
          style={{ width: 220, height: 140, objectFit: 'cover', borderRadius: 10, border: '1px solid #eee' }}
        />
      )}
    </div>
  );
}

