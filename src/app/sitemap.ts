import type { MetadataRoute } from 'next';
import { adminDb } from '@/lib/firebase.admin';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';

  // 공개 글만
  const snap = await adminDb
    .collection('posts')
    .where('isPublic', '==', true)
    .get();

  const posts = snap.docs.map((d) => ({
    url: `${base}/posts/${d.id}`,
    lastModified: (d.get('updatedAt')?.toDate?.() as Date) || new Date(),
    changeFrequency: 'weekly' as const,
    priority: 0.7,
  }));

  return [
    { url: base, lastModified: new Date() },
    { url: `${base}/posts`, lastModified: new Date() },
    ...posts,
  ];
}
