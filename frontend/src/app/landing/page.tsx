import Button from '@/components/common/button';

export default function LandingPage() {
  return (
    <main className="flex h-screen items-center justify-center">
      <section className="m-auto flex w-full max-w-90 flex-col gap-16 px-6 py-4">
        <div className="flex flex-col items-center justify-center gap-8">
          <span className="text-[24px] font-bold text-neutral-900">
            새 회의 시작
          </span>
          <Button>시작하기</Button>
        </div>

        <div className="flex w-full items-center gap-4 text-neutral-500">
          <span className="h-px flex-1 bg-neutral-500" />
          <span className="text-[14px] font-bold text-neutral-500">또는</span>
          <span className="h-px flex-1 bg-neutral-500" />
        </div>

        <div className="flex flex-col items-center justify-center gap-8">
          <span className="text-[24px] font-bold text-neutral-900">
            회의 참여하기
          </span>

          <div className="flex w-full flex-col gap-6">
            {/* TODO: input common-component 적용 */}
            <input
              placeholder="코드 또는 링크를 입력해주세요"
              className="h-11 w-full max-w-78 rounded-sm border border-neutral-300 px-2 py-3 outline-none"
            />
            <Button>참여하기</Button>
          </div>
        </div>
      </section>
    </main>
  );
}
