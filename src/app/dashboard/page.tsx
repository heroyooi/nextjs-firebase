'use client';

import AuthGate from '@/components/AuthGate';

export default function DashboardPage() {
  return (
    <AuthGate>
      <main style={{ maxWidth: 720, margin: '40px auto', padding: 16 }}>
        <h1>대시보드</h1>
        <p>로그인한 사용자만 볼 수 있는 페이지입니다.</p>
      </main>
    </AuthGate>
  );
}
