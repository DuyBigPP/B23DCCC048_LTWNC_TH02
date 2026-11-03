import { screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import App from './App';
import { renderWithProviders } from './test-utils';

// File riêng: React.lazy chỉ tải module một lần, nên fallback chỉ thấy được ở lần mở trang đầu tiên.
describe('App – lazy load theo route', () => {
  it.each([
    ['/saved', 'Bài tập đã lưu'],
    ['/routines', 'Giáo án'],
    ['/routines/abc', 'Chi tiết giáo án'],
  ])('lần đầu mở %s thì hiện "Đang tải trang..." rồi mới tới trang', async (route, heading) => {
    renderWithProviders(<App />, { route });

    expect(screen.getByText('Đang tải trang...')).toBeInTheDocument();
    expect(await screen.findByRole('heading', { level: 1, name: heading })).toBeInTheDocument();
    expect(screen.queryByText('Đang tải trang...')).not.toBeInTheDocument();
  });

  it('trang Kho bài tập không lazy: hiện ngay, không có màn hình chờ', () => {
    renderWithProviders(<App />, { route: '/' });
    expect(screen.getByRole('heading', { level: 1, name: 'Kho bài tập' })).toBeInTheDocument();
  });
});
