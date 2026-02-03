import {
  formatFileSize,
  formatTimestamp,
  parseRoomPath,
} from '@/utils/formatter';

describe('파일 크기 Formatting 테스트', () => {
  test('0 bytes는 "0 Bytes"를 반환한다', () => {
    expect(formatFileSize(0)).toBe('0 Bytes');
  });

  test('Bytes 단위를 올바르게 포맷한다', () => {
    expect(formatFileSize(500)).toBe('500 Bytes');
  });

  test('KB 단위를 올바르게 포맷한다', () => {
    expect(formatFileSize(1024)).toBe('1 KB');
    expect(formatFileSize(1536)).toBe('1.5 KB');
  });

  test('MB 단위를 올바르게 포맷한다', () => {
    expect(formatFileSize(1024 * 1024)).toBe('1 MB');
  });

  test('소수점 자릿수를 지정할 수 있다', () => {
    expect(formatFileSize(1536, 0)).toBe('2 KB');
  });
});

describe('타임스탬프 Formatting 테스트', () => {
  test('한국 시간 형식의 오전/오후 시각을 반환한다', () => {
    // 2024-01-01T00:30:00Z → 한국 시간 오전 9:30
    const result = formatTimestamp('2024-01-01T00:30:00Z');

    expect(result).toMatch(/(오전|오후)/);
    expect(result).toMatch(/:/);
  });

  test('유효한 timestamp 문자열을 받아 포맷된 시간을 반환한다', () => {
    const result = formatTimestamp('2024-06-01T12:15:00Z');

    expect(typeof result).toBe('string');
    expect(result.length).toBeGreaterThan(0);
  });
});

describe('회의 코드 Formatting 테스트', () => {
  test('전체 URL에서 마지막 경로를 코드로 추출한다', () => {
    expect(parseRoomPath('https://devmeet.com/abcd1234')).toBe('/abcd1234');
  });

  test('슬래시가 없는 입력은 그대로 코드로 사용한다', () => {
    expect(parseRoomPath('roomCode')).toBe('/roomCode');
  });

  test('앞뒤 공백을 제거하고 처리한다', () => {
    expect(parseRoomPath('  https://devmeet.com/xyz  ')).toBe('/xyz');
  });

  test('마지막 슬래시 이후의 값만 사용한다', () => {
    expect(parseRoomPath('/rooms/meeting/hello')).toBe('/hello');
  });
});
