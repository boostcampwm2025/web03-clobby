import { Transport } from 'mediasoup-client/types';
import { Socket } from 'socket.io-client';

interface CreateProducersProps {
  socket: Socket;
  sendTransport: Transport;
}

/**
 * sendTransport에 produce 핸들러를 바인딩하고,
 * track을 produce하는 헬퍼 함수들을 반환합니다.
 */
export function createProducers({
  socket,
  sendTransport,
}: CreateProducersProps) {
  // 1) transport produce 이벤트 처리
  sendTransport.on(
    'produce',
    async ({ kind, rtpParameters, appData }, callback, errback) => {
      try {
        const type = appData?.type; // "mic" | "cam" | "screen_video" | "screen_audio"

        const res = await socket.emitWithAck('signaling:ws:produce', {
          transport_id: sendTransport.id,
          kind,
          type,
          rtpParameters,
        });

        const id = res?.producerInfo?.producer_id ?? res?.producerInfo?.id;

        if (!id) {
          throw new Error('PRODUCE failed: missing producer id');
        }

        // mediasoup 자체 함수
        callback({ id });
      } catch (e) {
        if (e instanceof Error) {
          errback(e);
        } else {
          errback(new Error(String(e)));
        }
      }
    },
  );

  // 2) 실제 track produce 함수들
  const produceMic = (track: MediaStreamTrack) =>
    sendTransport.produce({
      track,
      appData: { type: 'mic' },
    });

  const produceCam = (track: MediaStreamTrack) =>
    sendTransport.produce({
      track,
      appData: { type: 'cam' },
    });

  const produceScreenVideo = (track: MediaStreamTrack) =>
    sendTransport.produce({
      track,
      appData: { type: 'screen_video' },
    });

  const produceScreenAudio = (track: MediaStreamTrack) =>
    sendTransport.produce({
      track,
      appData: { type: 'screen_audio' },
    });

  return {
    produceMic,
    produceCam,
    produceScreenVideo,
    produceScreenAudio,
  };
}
