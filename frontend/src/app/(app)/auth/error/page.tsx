'use client';

import Button from '@/components/common/button';
import { useRouter, useSearchParams } from 'next/navigation';

export default function AuthErrorPage() {
  const searchParams = useSearchParams();

  const status = searchParams.get('status');
  const message = searchParams.get('message');

  const router = useRouter();
  const onClick = () => router.replace('/landing');

  return (
    <main className="flex-center min-h-screen w-screen">
      <div className="flex w-full max-w-90 flex-col gap-8 px-6 py-4">
        <section className="flex flex-col items-center gap-4">
          <h1 className="section-title">로그인 실패</h1>
          <span className="text-center whitespace-pre-wrap text-neutral-600">
            {`상태 코드: ${status}\n${message}`}
          </span>
        </section>

        <Button onClick={onClick}>홈으로</Button>
      </div>
    </main>
  );
}
