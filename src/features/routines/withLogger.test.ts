import { afterEach, describe, expect, it, vi } from 'vitest';
import { withLogger } from './withLogger';

type CounterAction = { type: 'add'; by: number } | { type: 'reset' };
const counter = (state: number, action: CounterAction) => (action.type === 'add' ? state + action.by : 0);

describe('withLogger', () => {
  afterEach(() => {
    vi.restoreAllMocks();
    vi.unstubAllEnvs();
  });

  it('trả về đúng kết quả của reducer gốc', () => {
    vi.spyOn(console, 'log').mockImplementation(() => {});
    const logged = withLogger(counter);
    expect(logged(2, { type: 'add', by: 3 })).toBe(5);
    expect(logged(7, { type: 'reset' })).toBe(0);
  });

  it('ở chế độ DEV: log tên action, state trước và state sau', () => {
    vi.stubEnv('DEV', true);
    const log = vi.spyOn(console, 'log').mockImplementation(() => {});

    withLogger(counter)(2, { type: 'add', by: 3 });

    expect(log).toHaveBeenCalledTimes(1);
    expect(log).toHaveBeenCalledWith('add', { prev: 2, next: 5 });
  });

  it('không phải DEV thì không log', () => {
    vi.stubEnv('DEV', false);
    const log = vi.spyOn(console, 'log').mockImplementation(() => {});

    withLogger(counter)(2, { type: 'add', by: 3 });

    expect(log).not.toHaveBeenCalled();
  });
});
