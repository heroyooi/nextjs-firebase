import './globals.scss';
import HeaderAuth from '@/components/HeaderAuth';

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang='ko'>
      <body>
        <HeaderAuth />
        {children}
      </body>
    </html>
  );
}
