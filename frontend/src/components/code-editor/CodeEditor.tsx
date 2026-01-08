'use client';

import Editor from '@monaco-editor/react';
import type * as monaco from 'monaco-editor';
import { useEffect, useRef } from 'react';
import * as Y from 'yjs';
import { WebsocketProvider } from 'y-websocket';

type CodeEditorProps = {
  language?: string;
  readOnly?: boolean;
  autoComplete?: boolean;
  minimap?: boolean;
};

export default function CodeEditor({
  language = 'typescript',
  readOnly = false,
  autoComplete = true,
  minimap = true,
}: CodeEditorProps) {
  const editorRef = useRef<monaco.editor.IStandaloneCodeEditor | null>(null);
  const cleanupRef = useRef<(() => void) | null>(null);

  const handleMount = async (editor: monaco.editor.IStandaloneCodeEditor) => {
    editorRef.current = editor;

    const ydoc = new Y.Doc();

    const { MonacoBinding } = await import('y-monaco');

    const provider = new WebsocketProvider(
      'ws://localhost:1234',
      'room-1',
      ydoc,
    );

    // 사용자 정보 동적 설정
    const name = `User-${Math.floor(Math.random() * 100)}`;
    // TODO: const color = getRandomColor();

    provider.awareness.setLocalStateField('user', {
      name,
      role: 'viewer',
    });

    const yText = ydoc.getText('monaco');

    const model = editor.getModel();
    if (!model) return;

    // 양방향 바인딩 해주기
    const binding = new MonacoBinding(
      yText, // 원본 데이터
      model, // 실제 에디터에 보이는 코드
      new Set([editor]), // 바인딩할 에디터 인스턴스들
      provider.awareness, // 여기서 다른 유저들의 위치 정보를 받아온다.
    );

    cleanupRef.current = () => {
      binding.destroy();
      provider.destroy();
      ydoc.destroy();
    };
  };

  useEffect(() => {
    return () => cleanupRef.current?.();
  }, []);

  return (
    <div className="flex h-full w-full flex-col">
      {/* 상단 컨트롤 */}
      <div>...</div>

      {/* 코드에디터 */}
      <Editor
        width="100%"
        height="100%"
        theme="vs-dark"
        defaultLanguage={language}
        onMount={handleMount}
        options={{
          readOnly,
          automaticLayout: true,

          // 편집
          tabSize: 2, // 탭 크기 설정
          insertSpaces: true, // 탭 입력 시 공백으로 처리
          fontSize: 14,

          // UX
          lineNumbers: 'on', // 줄번호 표시
          wordWrap: 'off', // 자동 줄바꿈 비활성화
          minimap: { enabled: minimap }, // 미니맵 활성화 여부

          // 기타
          cursorStyle: 'line',
          scrollBeyondLastLine: false,
          mouseWheelZoom: true, // ctrl + 마우스 휠로 폰트 크기 확대/축소
        }}
      />
    </div>
  );
}
