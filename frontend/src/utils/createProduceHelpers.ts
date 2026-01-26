import { Transport } from 'mediasoup-client/types';

// track을 produce하는 헬퍼 함수들을 반환합니다.
export function createProduceHelper(sendTransport: Transport) {
  // vpc 9을 사용할 수 있는지 확인이 필요하다.
  
  // 2) 실제 track produce 함수들
  const produceMic = (track: MediaStreamTrack) =>
    sendTransport.produce({
      track,
      appData: { type: 'mic' },
    });
  
  // can을 보낼때 VP8 or VP9일때 나누어서 처리하는 것이 좋다. 
  const produceCam = (track: MediaStreamTrack) =>
    sendTransport.produce({
      track,
      appData: { type: 'cam' },
      // simulcast 방식 ( 아래로 갈수록 고화질 )
      encodings: [
        { rid: 'r0', scaleResolutionDownBy: 4, maxBitrate: 150_000 },
        { rid: 'r1', scaleResolutionDownBy: 2, maxBitrate: 500_000 },
        { rid: 'r2', scaleResolutionDownBy: 1, maxBitrate: 1_200_000 },
      ],
      codecOptions: {
        videoGoogleStartBitrate: 600,
      },
    });

  // 기기에 따라서 vp9이 가능하게 해라


  const produceScreenVideo = (track: MediaStreamTrack) =>
    sendTransport.produce({
      track,
      appData: { type: 'screen_video' },
      encodings: [
        {
          maxBitrate: 1_500_000, // codec이 safari 같은 경우 VP9이 오류가 많아서 VP8로 하고 가장 높은 화질 하나의 레이어로 처리 ( 가장 좋은건 화면 공유는 VP9으로 진행한다. )
        },
      ],
      codecOptions: {
        videoGoogleStartBitrate: 400,  // 화면공유에 시작 비트레이트는 낮게 
      },
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
