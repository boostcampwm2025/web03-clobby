import Link from 'next/link';
import KakaoLogoIcon from '@/assets/auth/kakaoLogoIcon.svg';

export default function KakaoLoginButton() {
  return (
    <Link
      href="/kakao"
      className="flex h-11.25 w-full items-center justify-center gap-2 rounded-md bg-[#FEE500] px-5"
    >
      <KakaoLogoIcon className="h-4.5 w-4.5 text-black" />
      <span className="kakao-font">카카오 로그인</span>
    </Link>
  );
}
