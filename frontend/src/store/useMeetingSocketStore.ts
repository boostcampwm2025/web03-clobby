import { Device } from 'mediasoup-client';
import { Producer, Transport } from 'mediasoup-client/types';
import { Socket } from 'socket.io-client';
import { create } from 'zustand';

type ProducerPromise = (
  track: MediaStreamTrack,
) => Promise<Producer<{ type: string }>>;

interface Producers {
  produceMic: ProducerPromise | null;
  produceCam: ProducerPromise | null;
  produceScreenVideo: ProducerPromise | null;
  produceScreenAudio: ProducerPromise | null;
}

interface MediasoupTransports {
  device: Device;
  sendTransport: Transport;
  recvTransport: Transport;
}

interface MeetingSocketState {
  socket: Socket | null;
  device: Device | null;
  sendTransport: Transport | null;
  recvTransport: Transport | null;
  producers: Producers;
}

interface MeetingSocketAction {
  setSocket: (socket: Socket | null) => void;

  setMediasoupTransports: (transports: MediasoupTransports) => void;

  setProducers: (producers: Producers) => void;
}

export const useMeetingSocketStore = create<
  MeetingSocketState & MeetingSocketAction
>((set) => ({
  socket: null,
  device: null,
  sendTransport: null,
  recvTransport: null,

  producers: {
    produceMic: null,
    produceCam: null,
    produceScreenAudio: null,
    produceScreenVideo: null,
  },

  setSocket: (socket) => set({ socket }),
  setMediasoupTransports: (transports) => set({ ...transports }),
  setProducers: (producers) => set({ producers }),
}));
