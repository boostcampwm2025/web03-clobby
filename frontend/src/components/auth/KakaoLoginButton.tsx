'use client';

import KakaoLogoIcon from '@/assets/auth/kakaoLogoIcon.svg';

interface KakaoAuthUrlResponse {
  url: string;
}

export default function KakaoLoginButton() {
  const getOAuthURL = async () => {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_SERVER_URL}/auth/kakao/url`,
    );

    const { url }: KakaoAuthUrlResponse = await response.json();
    window.location.href = url;
  };

  return (
    <button
      onClick={getOAuthURL}
      className="flex h-11.25 w-full items-center justify-center gap-2 rounded-md bg-[#FEE500] px-5"
    >
      <KakaoLogoIcon className="h-4.5 w-4.5 text-black" />
      <span className="kakao-font">카카오 로그인</span>
    </button>
  );
}
