import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it } from 'vitest';
import App from './App';
import { renderWithProviders } from './test-utils';

const renderAt = (route: string) => renderWithProviders(<App />, { route });

describe('App – khung ứng dụng', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('thanh menu có 3 mục trỏ đúng địa chỉ', () => {
    renderAt('/');
    expect(screen.getByRole('link', { name: 'Kho bài tập' })).toHaveAttribute('href', '/');
    expect(screen.getByRole('link', { name: 'Đã lưu' })).toHaveAttribute('href', '/saved');
    expect(screen.getByRole('link', { name: 'Giáo án' })).toHaveAttribute('href', '/routines');
  });

  it.each([
    ['/', 'Kho bài tập', 'Kho bài tập'],
    ['/saved', 'Bài tập đã lưu', 'Đã lưu'],
    ['/routines', 'Giáo án', 'Giáo án'],
    ['/routines/abc', 'Chi tiết giáo án', 'Giáo án'],
  ])('mở %s thì hiện trang "%s" và chỉ tô sáng mục "%s"', async (path, heading, activeLink) => {
    renderAt(path);
    expect(await screen.findByRole('heading', { level: 1, name: heading })).toBeInTheDocument();
    const current = screen
      .getAllByRole('link')
      .filter((a) => a.getAttribute('aria-current') === 'page')
      .map((a) => a.textContent);
    expect(current).toEqual([activeLink]);
  });

  it.each(['/', '/saved', '/routines', '/routines/abc'])(
    'mở %s thì thanh đồng hồ buổi tập luôn có ở đáy trang',
    (path) => {
      renderAt(path);
      expect(screen.getByRole('contentinfo')).toHaveTextContent('Chưa bắt đầu buổi tập');
    },
  );

  it('nút trên thanh menu đổi giữa "Giao diện tối" và "Giao diện sáng"', async () => {
    renderAt('/');

    await userEvent.click(screen.getByRole('button', { name: 'Giao diện tối' }));
    expect(document.documentElement.dataset.theme).toBe('dark');

    await userEvent.click(screen.getByRole('button', { name: 'Giao diện sáng' }));
    expect(document.documentElement.dataset.theme).toBe('light');
  });
});
