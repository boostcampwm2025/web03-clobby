'use client';

import {
  CamOffIcon,
  CamOnIcon,
  ChatIcon,
  CodeIcon,
  ExitMeetingIcon,
  InfoIcon,
  MarkedChatIcon,
  MemberIcon,
  MicOffIcon,
  MicOnIcon,
  ShareIcon,
  WorkspaceIcon,
} from '@/assets/icons/meeting';
import MeetingButton from '@/components/meeting/MeetingButton';
import { useState } from 'react';

export default function MeetingMenu() {
  // 추후 전역 변수로 수정 필요
  const [meetingState, setMeetingState] = useState({
    audio: 'ON',
    video: 'ON',
    members: 1,
    newChat: true,
    workspace: false,
    codeEditor: false,
  });

  const toggleAudio = () =>
    setMeetingState((prev) => ({
      ...prev,
      audio: prev.audio === 'ON' ? 'OFF' : 'ON',
    }));

  const toggleVideo = () =>
    setMeetingState((prev) => ({
      ...prev,
      video: prev.video === 'ON' ? 'OFF' : 'ON',
    }));

  const onChatClick = () => {
    setMeetingState((prev) => ({ ...prev, newChat: false }));
  };

  const onWorkspaceClick = () => {
    setMeetingState((prev) => ({ ...prev, workspace: !prev.workspace }));
  };

  const onCodeEditorClick = () => {
    setMeetingState((prev) => ({ ...prev, codeEditor: !prev.codeEditor }));
  };

  return (
    <nav className="flex w-full justify-between px-4 py-2">
      {/* 미디어 관련 메뉴 */}
      <section className="flex gap-2">
        <MeetingButton
          icon={
            meetingState.audio === 'ON' ? (
              <MicOnIcon className="h-8 w-8" />
            ) : (
              <MicOffIcon className="h-8 w-8" />
            )
          }
          text="오디오"
          onClick={toggleAudio}
        />
        <MeetingButton
          icon={
            meetingState.video === 'ON' ? (
              <CamOnIcon className="h-8 w-8" />
            ) : (
              <CamOffIcon className="h-8 w-8" />
            )
          }
          text="비디오"
          onClick={toggleVideo}
        />
      </section>

      {/* 미팅 관련 메뉴 */}
      <section className="flex gap-2">
        <MeetingButton
          icon={<InfoIcon className="h-8 w-8" />}
          text="회의 정보"
        />
        <div className="relative">
          <MeetingButton
            icon={<MemberIcon className="h-8 w-8" />}
            text="참가자"
          />
          <span className="absolute top-0.5 right-2 flex h-5 w-5 items-center justify-center rounded-full bg-neutral-600 text-xs font-bold text-neutral-50">
            {meetingState.members}
          </span>
        </div>
        <MeetingButton
          icon={
            meetingState.newChat ? (
              <MarkedChatIcon className="h-8 w-8" />
            ) : (
              <ChatIcon className="h-8 w-8" />
            )
          }
          text="채팅"
          onClick={onChatClick}
        />
        <MeetingButton
          icon={<ShareIcon className="h-8 w-8" />}
          text="화면 공유"
        />
        <MeetingButton
          icon={<WorkspaceIcon className="h-8 w-8" />}
          text="워크스페이스"
          isActive={meetingState.workspace}
          onClick={onWorkspaceClick}
        />
        <MeetingButton
          icon={<CodeIcon className="h-8 w-8" />}
          text="코드 에디터"
          isActive={meetingState.codeEditor}
          onClick={onCodeEditorClick}
        />
      </section>

      <MeetingButton
        icon={<ExitMeetingIcon className="h-8 w-8" />}
        text="나가기"
      />
    </nav>
  );
}
