import { describe, expect, it } from 'vitest';
import { formatDuration, formatMinutesSeconds } from './format';

describe('formatDuration', () => {
  it.each([
    [0, '0:00'],
    [30, '0:30'],
    [67, '1:07'],
    [120, '2:00'],
  ])('đổi %i giây thành "%s"', (seconds, expected) => {
    expect(formatDuration(seconds)).toBe(expected);
  });
});

describe('formatMinutesSeconds', () => {
  it.each([
    [0, '0 phút 0 giây'],
    [97, '1 phút 37 giây'],
    [120, '2 phút 0 giây'],
    [754, '12 phút 34 giây'],
  ])('đổi %i giây thành "%s"', (seconds, expected) => {
    expect(formatMinutesSeconds(seconds)).toBe(expected);
  });
});
