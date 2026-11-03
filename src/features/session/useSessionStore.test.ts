import { beforeEach, describe, expect, it } from 'vitest';
import type { Exercise } from '../../types';
import { useSessionStore } from './useSessionStore';

const e1: Exercise = { id: 'e1', name: 'Đẩy tạ đơn 1', trainer: 'Minh Khang', group: 'Ngực', duration: 30 };
const e2: Exercise = { id: 'e2', name: 'Kéo tạ đơn 1', trainer: 'Phương Anh', group: 'Chân', duration: 67 };
const e3: Exercise = { id: 'e3', name: 'Gập tạ đơn 1', trainer: 'Đức Anh', group: 'Tay', duration: 104 };

const state = () => useSessionStore.getState();
const current = () => state().queue[state().currentIndex];

describe('useSessionStore', () => {
  beforeEach(() => {
    useSessionStore.setState({ queue: [], currentIndex: -1, isRunning: false, elapsed: 0 });
  });

  it('ban đầu chưa bắt đầu: currentIndex là -1 và đồng hồ đứng yên', () => {
    expect(state().currentIndex).toBe(-1);
    expect(state().isRunning).toBe(false);
  });

  it('startSession thay danh sách buổi tập, bắt đầu đúng bài, elapsed về 0 và chạy đồng hồ', () => {
    useSessionStore.setState({ queue: [e3], currentIndex: 0, elapsed: 50 });

    state().startSession([e1, e2, e3], 1);

    expect(state().queue).toEqual([e1, e2, e3]);
    expect(current()).toEqual(e2);
    expect(state().elapsed).toBe(0);
    expect(state().isRunning).toBe(true);
  });

  it('startSession với danh sách rỗng thì không làm gì', () => {
    state().startSession([e1], 0);
    state().startSession([], 0);
    expect(state().queue).toEqual([e1]);
  });

  it('toggleRun bật/tắt đồng hồ', () => {
    state().startSession([e1, e2], 0);
    state().toggleRun();
    expect(state().isRunning).toBe(false);
    state().toggleRun();
    expect(state().isRunning).toBe(true);
  });

  it('toggleRun khi buổi tập rỗng thì không chạy', () => {
    state().toggleRun();
    expect(state().isRunning).toBe(false);
  });

  it('toggleRun khi đã có bài (thêm bằng + Buổi tập) nhưng chưa bắt đầu thì chạy từ bài đầu', () => {
    state().addToSession(e2);
    state().toggleRun();
    expect(current()).toEqual(e2);
    expect(state().isRunning).toBe(true);
  });

  it('next sang bài sau và đặt elapsed về 0', () => {
    state().startSession([e1, e2], 0);
    useSessionStore.setState({ elapsed: 10 });
    state().next();
    expect(current()).toEqual(e2);
    expect(state().elapsed).toBe(0);
  });

  it('next ở bài cuối thì isRunning là false và vẫn ở bài cuối', () => {
    state().startSession([e1, e2], 1);
    state().next();
    expect(state().isRunning).toBe(false);
    expect(current()).toEqual(e2);
  });

  it('prev khi đã tập quá 3 giây thì chỉ đặt lại bài hiện tại về 0', () => {
    state().startSession([e1, e2], 1);
    useSessionStore.setState({ elapsed: 4 });
    state().prev();
    expect(current()).toEqual(e2);
    expect(state().elapsed).toBe(0);
  });

  it('prev khi mới tập 3 giây trở xuống thì lùi về bài trước', () => {
    state().startSession([e1, e2], 1);
    useSessionStore.setState({ elapsed: 3 });
    state().prev();
    expect(current()).toEqual(e1);
    expect(state().elapsed).toBe(0);
  });

  it('prev ở bài đầu thì đặt lại về 0, không lùi ra ngoài', () => {
    state().startSession([e1, e2], 0);
    useSessionStore.setState({ elapsed: 2 });
    state().prev();
    expect(state().currentIndex).toBe(0);
    expect(state().elapsed).toBe(0);
  });

  it('addToSession thêm vào cuối, bài đã có thì bỏ qua', () => {
    state().startSession([e1], 0);
    state().addToSession(e2);
    state().addToSession(e1);
    state().addToSession(e2);
    expect(state().queue).toEqual([e1, e2]);
    expect(current()).toEqual(e1);
  });

  it('tick tăng elapsed thêm 1 giây', () => {
    state().startSession([e1, e2], 0);
    state().tick();
    state().tick();
    expect(state().elapsed).toBe(2);
  });

  it('tick ở giây cuối của bài thì tự sang bài sau', () => {
    state().startSession([e1, e2], 0);
    useSessionStore.setState({ elapsed: 29 });
    state().tick();
    expect(current()).toEqual(e2);
    expect(state().elapsed).toBe(0);
    expect(state().isRunning).toBe(true);
  });

  it('tick ở giây cuối của bài cuối thì dừng đồng hồ, còn lại 0 giây', () => {
    state().startSession([e1], 0);
    useSessionStore.setState({ elapsed: 29 });
    state().tick();
    expect(state().isRunning).toBe(false);
    expect(state().elapsed).toBe(30);
  });

  it('tick khi đang tạm dừng thì không đếm', () => {
    state().startSession([e1], 0);
    state().toggleRun();
    state().tick();
    expect(state().elapsed).toBe(0);
  });
});
