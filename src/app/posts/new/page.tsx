import { createPostAction } from '@/app/actions/postActions';
import { redirect } from 'next/navigation';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export default function NewPostPage() {
  // ✅ 단일 파라미터(폼데이터)만 받는 서버 함수
  async function handleAction(formData: FormData) {
    'use server';
    const res = await createPostAction(formData);
    if (!res.ok) {
      console.error(res.message);
      return;
    }
    redirect(`/posts/${res.id}`);
  }

  return (
    <main style={{ maxWidth: 720, margin: '40px auto', padding: 16 }}>
      <h1>새 글 작성 (Server Action)</h1>
      <form action={handleAction} style={{ display: 'grid', gap: 12 }}>
        <input
          name='title'
          placeholder='제목'
          style={{ padding: 10, border: '1px solid #ddd', borderRadius: 8 }}
        />
        <textarea
          name='content'
          placeholder='내용(선택)'
          rows={8}
          style={{ padding: 10, border: '1px solid #ddd', borderRadius: 8 }}
        />
        <label style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          <input type='checkbox' name='isPublic' defaultChecked />
          공개글로 등록
        </label>
        <input type='file' name='file' accept='image/*' />
        <button type='submit' style={{ padding: '10px 12px', borderRadius: 8 }}>
          등록
        </button>
      </form>
    </main>
  );
}
