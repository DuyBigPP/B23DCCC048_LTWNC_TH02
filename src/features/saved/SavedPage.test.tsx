import { fireEvent, render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it } from 'vitest';
import { useSessionStore } from '../session/useSessionStore';
import SavedPage from './SavedPage';
import { useSavedStore } from './useSavedStore';

const session = () => useSessionStore.getState();

describe('SavedPage', () => {
  beforeEach(() => {
    localStorage.clear();
    useSavedStore.setState({ ids: [] });
    useSessionStore.setState({ queue: [], currentIndex: -1, isRunning: false, elapsed: 0 });
  });

  it('chưa lưu bài nào thì báo "Bạn chưa lưu bài tập nào" và không có nút Tập tất cả', () => {
    render(<SavedPage />);
    expect(screen.getByText('Bạn chưa lưu bài tập nào')).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Tập tất cả' })).not.toBeInTheDocument();
  });

  it('liệt kê các bài đã lưu theo thứ tự đã lưu', () => {
    useSavedStore.setState({ ids: ['e3', 'e1'] });
    render(<SavedPage />);
    const names = [...document.querySelectorAll('.col-name')].map((el) => el.textContent);
    expect(names).toEqual(['Gập tạ đơn 1', 'Đẩy tạ đơn 1']);
  });

  it('bấm Tập tất cả thì buổi tập là các bài đã lưu, bắt đầu từ bài đầu', () => {
    useSavedStore.setState({ ids: ['e1', 'e3'] });
    render(<SavedPage />);
    fireEvent.click(screen.getByRole('button', { name: 'Tập tất cả' }));

    expect(session().queue.map((e) => e.id)).toEqual(['e1', 'e3']);
    expect(session().currentIndex).toBe(0);
    expect(session().isRunning).toBe(true);
  });

  it('bấm Bắt đầu ở một bài thì buổi tập là các bài đã lưu, bắt đầu từ đúng bài đó', () => {
    useSavedStore.setState({ ids: ['e1', 'e3', 'e2'] });
    render(<SavedPage />);
    fireEvent.click(screen.getAllByRole('button', { name: 'Bắt đầu' })[1]);

    expect(session().queue.map((e) => e.id)).toEqual(['e1', 'e3', 'e2']);
    expect(session().queue[session().currentIndex].id).toBe('e3');
  });

  it('bấm Bỏ lưu thì bài biến mất khỏi danh sách', () => {
    useSavedStore.setState({ ids: ['e1', 'e3'] });
    render(<SavedPage />);
    fireEvent.click(screen.getAllByRole('button', { name: 'Bỏ lưu' })[0]);

    expect(screen.queryByText('Đẩy tạ đơn 1')).not.toBeInTheDocument();
    expect(screen.getByText('Gập tạ đơn 1')).toBeInTheDocument();
  });
});
