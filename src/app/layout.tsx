import './globals.scss';
import { Noto_Sans_KR } from 'next/font/google';
import HeaderAuth from '@/components/HeaderAuth';

const noto = Noto_Sans_KR({
  subsets: ['latin'],
  weight: ['400', '500', '700'],
  display: 'swap',
});

export const metadata = {
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000'
  ),
  title: {
    default: 'Next.js + Firebase 실전 앱',
    template: '%s | Next.js + Firebase',
  },
  description:
    'Next.js(App Router)와 Firebase로 로그인/CRUD/이미지 업로드까지 구현하는 실전 프로젝트',
  openGraph: {
    type: 'website',
    title: 'Next.js + Firebase 실전 앱',
    description: '로그인/CRUD/Storage',
    url: '/',
    images: [{ url: '/og.png', width: 1200, height: 630 }],
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang='ko'>
      <body className={noto.className}>
        <HeaderAuth />
        {children}
      </body>
    </html>
  );
}
