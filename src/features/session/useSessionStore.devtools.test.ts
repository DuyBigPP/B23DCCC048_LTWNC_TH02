import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import type { Exercise } from '../../types';

const e1: Exercise = { id: 'e1', name: 'Đẩy tạ đơn 1', trainer: 'Minh Khang', group: 'Ngực', duration: 30 };
const e2: Exercise = { id: 'e2', name: 'Kéo tạ đơn 1', trainer: 'Phương Anh', group: 'Chân', duration: 67 };

// Redux DevTools giả, cùng hình dạng với extension thật: connect() → { init, send, subscribe, unsubscribe }.
const connection = {
  init: vi.fn(),
  send: vi.fn(),
  subscribe: vi.fn(() => () => {}),
  unsubscribe: vi.fn(),
};
const connect = vi.fn(() => connection);

// Store được tạo lúc import, nên phải import lại sau khi gắn extension giả.
const loadStore = async () => (await import('./useSessionStore')).useSessionStore;
const sentTypes = () => connection.send.mock.calls.map((call) => (call as unknown as [{ type: string }])[0].type);

describe('useSessionStore – middleware devtools (thử thách)', () => {
  beforeEach(() => {
    vi.resetModules();
    vi.clearAllMocks();
    Object.assign(window, { __REDUX_DEVTOOLS_EXTENSION__: { connect } });
  });

  afterEach(() => {
    vi.unstubAllEnvs();
    delete (window as unknown as Record<string, unknown>).__REDUX_DEVTOOLS_EXTENSION__;
  });

  it('khi chạy dev: kết nối Redux DevTools với tên "session" và gửi tên từng action', async () => {
    vi.stubEnv('DEV', true);
    const store = await loadStore();

    store.getState().startSession([e1, e2], 0);
    store.getState().tick();
    store.getState().toggleRun();
    store.getState().next();

    expect(connect).toHaveBeenCalledWith(expect.objectContaining({ name: 'session' }));
    expect(connection.init).toHaveBeenCalledTimes(1);
    expect(sentTypes()).toEqual(['startSession', 'tick', 'toggleRun', 'next']);
  });

  it('bản build production thì không kết nối DevTools', async () => {
    vi.stubEnv('DEV', false);
    const store = await loadStore();
    store.getState().startSession([e1], 0);

    expect(connect).not.toHaveBeenCalled();
    expect(store.getState().isRunning).toBe(true);
  });
});
