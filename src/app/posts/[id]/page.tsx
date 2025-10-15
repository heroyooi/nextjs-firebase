import { adminDb } from '@/lib/firebase.admin';
import { updatePostAction, deletePostAction } from '@/app/actions/postActions';
import { redirect } from 'next/navigation';
import Image from 'next/image';

export const dynamic = 'force-dynamic';

export async function generateMetadata({ params }: { params: { id: string } }) {
  const snap = await adminDb.collection('posts').doc(params.id).get();
  if (!snap.exists) return { title: '게시글 없음' };

  const data = snap.data()!;
  return {
    title: data.title,
    description: (data.content || '').slice(0, 100),
    openGraph: {
      images: data.thumbUrl
        ? [{ url: data.thumbUrl, width: 1200, height: 630 }]
        : undefined,
    },
  };
}

export default async function PostDetail({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const snap = await adminDb.collection('posts').doc(id).get();
  if (!snap.exists) return <main>존재하지 않는 글입니다.</main>;
  const post = { id: snap.id, ...(snap.data() as any) };

  async function onUpdate(formData: FormData) {
    'use server';
    formData.set('id', post.id);
    const res = await updatePostAction(formData);
    if (!res.ok) {
      console.error(res.message);
      return;
    }
    // 필요하면 revalidatePath('/posts') 등 추가
  }

  async function onDelete(formData: FormData) {
    'use server';
    formData.set('id', post.id);
    const res = await deletePostAction(formData);
    if (!res.ok) {
      console.error(res.message);
      return;
    }
    redirect('/posts');
  }

  return (
    <main style={{ maxWidth: 720, margin: '40px auto', padding: 16 }}>
      <h1>{post.title}</h1>
      {post.thumbUrl && (
        <Image
          src={post.thumbUrl}
          alt=''
          width={720}
          height={420}
          style={{ width: '100%', height: 'auto', borderRadius: 12 }}
          priority
        />
      )}
      {post.content && <p style={{ whiteSpace: 'pre-wrap' }}>{post.content}</p>}

      <form
        action={onUpdate}
        style={{ display: 'grid', gap: 8, marginTop: 24 }}
      >
        <input name='title' defaultValue={post.title} />
        <textarea name='content' defaultValue={post.content} rows={6} />
        <label style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          <input
            type='checkbox'
            name='isPublic'
            defaultChecked={post.isPublic}
          />
          공개글
        </label>
        <button type='submit'>수정</button>
      </form>

      <form action={onDelete} style={{ marginTop: 12 }}>
        <button
          type='submit'
          style={{ border: '1px solid #f33', color: '#f33' }}
        >
          삭제
        </button>
      </form>
    </main>
  );
}
