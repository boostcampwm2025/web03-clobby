import { CloseIcon, ImageIcon } from '@/assets/icons/common';
import { FileIcon, SendIcon } from '@/assets/icons/meeting';
import ChatListItem from '@/components/meeting/ChatListItem';
import { useChatSender } from '@/hooks/useChatSender';
import { useChatStore } from '@/store/useChatStore';
import { useMeetingSocketStore } from '@/store/useMeetingSocketStore';
import { useMeetingStore } from '@/store/useMeetingStore';
import { useUserStore } from '@/store/useUserStore';
import { useEffect, useRef, useState } from 'react';

export default function ChatModal() {
  const scrollRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const { setIsOpen } = useMeetingStore();

  const [hasValue, setHasValue] = useState(false);
  const [files, setFiles] = useState([]);

  const { userId, nickname, profilePath } = useUserStore();
  const messages = useChatStore((s) => s.messages);
  const socket = useMeetingSocketStore((s) => s.socket);

  const { sendMessage: sendTextMessage } = useChatSender({
    socket,
    userId,
    nickname,
    profileImg: profilePath as string,
  });

  const onCloseClick = () => setIsOpen('isChatOpen', false);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  // 이후 form 관련 라이브러리 사용 시 수정 필요
  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const value = textareaRef.current?.value;

    if (value && value.trim().length > 0) {
      sendTextMessage(value);

      if (textareaRef.current) {
        textareaRef.current.value = '';
        textareaRef.current.style.height = 'auto'; // 전송하고 높이 초기화
        setHasValue(textareaRef.current.value.trim().length > 0);
      }
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.nativeEvent.isComposing) return;

    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      onSubmit(e);
    }
  };

  // textarea 자동 높이 조절
  const handleInput = () => {
    const obj = textareaRef.current;
    if (!obj) return;

    obj.style.height = 'auto';
    obj.style.height = `${obj.scrollHeight}px`;

    setHasValue(obj.value.trim().length > 0);
  };

  return (
    <aside className="meeting-side-modal z-6">
      <div className="flex-center relative h-12 w-full bg-neutral-800">
        <span className="font-bold text-neutral-200">채팅</span>
        <button
          className="absolute top-2 right-2 rounded-sm p-1 hover:bg-neutral-700"
          onClick={onCloseClick}
        >
          <CloseIcon className="h-6 w-6 text-neutral-200" />
        </button>
      </div>

      {/* 채팅 내역 */}
      <section ref={scrollRef} className="flex-1 overflow-y-auto">
        {messages.map((chat) => (
          <ChatListItem key={chat.id} {...chat} />
        ))}
      </section>

      {/* 채팅 입력 부분 */}
      <form className="border-t border-neutral-600">
        {/* 파일 업로드 현황 */}
        {files.length > 0 && <div></div>}

        {/* 텍스트 input */}
        <textarea
          ref={textareaRef}
          className="peer w-full resize-none px-2 pt-3 pb-1 text-sm text-neutral-50 placeholder:text-neutral-400 focus:outline-none"
          placeholder="메세지를 입력해주세요"
          onKeyDown={handleKeyDown}
          onInput={handleInput}
        />

        {/* 버튼 */}
        <div className="flex justify-between p-2 text-neutral-200 peer-placeholder-shown:text-neutral-400">
          {/* 이미지, 파일 로직 추가 후 수정 필요 */}
          <div className="flex gap-1 text-neutral-200">
            <button
              type="button"
              className="rounded-sm p-1 hover:bg-neutral-600"
            >
              <ImageIcon className="h-4 w-4" />
            </button>
            <button
              type="button"
              className="rounded-sm p-1 hover:bg-neutral-600"
            >
              <FileIcon />
            </button>
          </div>
          <button
            type="submit"
            disabled={!hasValue}
            className={`rounded-sm p-1 ${
              hasValue
                ? 'cursor-pointer text-neutral-200 hover:bg-neutral-600'
                : 'cursor-default text-neutral-400 hover:bg-transparent'
            } `}
            onClick={onSubmit}
          >
            <SendIcon className="h-4 w-4" />
          </button>
        </div>
      </form>
    </aside>
  );
}
