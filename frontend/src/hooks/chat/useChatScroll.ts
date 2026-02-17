import { RefObject, useState } from 'react';

export const useChatScroll = (
  containerRef: RefObject<HTMLDivElement | null>,
) => {
  const [isAtBottom, setIsAtBottom] = useState(true);
  const THRESHOLD = 150;

  const checkIsNearBottom = () => {
    const el = containerRef.current;
    if (!el) return true;

    return el.scrollHeight - el.scrollTop - el.clientHeight < THRESHOLD;
  };

  const handleScroll = () => {
    const next = checkIsNearBottom();
    setIsAtBottom((prev) => (prev === next ? prev : next));
  };

  const scrollToBottom = (isMyMessage = false) => {
    const el = containerRef.current;
    if (!el) return;

    el.scrollTo({
      top: el.scrollHeight,
      behavior: isMyMessage ? 'auto' : 'smooth',
    });

    // 메시지 전송 시 바로 아래로 이동했으므로 상태도 갱신
    setIsAtBottom(true);
  };

  return { handleScroll, scrollToBottom, isAtBottom };
};
