import { screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { renderWithProviders } from '../../test-utils';
import { useSessionStore } from '../session/useSessionStore';
import RoutineDetailPage from './RoutineDetailPage';

const saveRoutines = (routines: { id: string; name: string; exerciseIds: string[] }[]) =>
  localStorage.setItem('workout-routines', JSON.stringify(routines));
const renderDetail = (id: string) =>
  renderWithProviders(<RoutineDetailPage />, { route: `/routines/${id}`, path: '/routines/:id' });
const session = () => useSessionStore.getState();

describe('RoutineDetailPage', () => {
  beforeEach(() => {
    localStorage.clear();
    vi.spyOn(console, 'log').mockImplementation(() => {});
    useSessionStore.setState({ queue: [], currentIndex: -1, isRunning: false, elapsed: 0 });
  });

  it('không có giáo án với id đó thì báo "Không tìm thấy giáo án"', () => {
    renderDetail('khong-co');
    expect(screen.getByText('Không tìm thấy giáo án')).toBeInTheDocument();
  });

  it('hiện tên giáo án, các bài và tổng thời gian (e1 30s + e2 67s = 1 phút 37 giây)', () => {
    saveRoutines([{ id: 'r1', name: 'Ngày ngực', exerciseIds: ['e1', 'e2'] }]);
    renderDetail('r1');

    expect(screen.getByRole('heading', { level: 1, name: 'Ngày ngực' })).toBeInTheDocument();
    const items = screen.getAllByRole('listitem');
    expect(items.map((li) => within(li).getByText(/tạ đơn 1$/).textContent)).toEqual([
      'Đẩy tạ đơn 1',
      'Kéo tạ đơn 1',
    ]);
    expect(screen.getByText('Tổng thời gian: 1 phút 37 giây')).toBeInTheDocument();
  });

  it('bấm Bỏ thì bài biến mất và tổng thời gian cập nhật', async () => {
    saveRoutines([{ id: 'r1', name: 'Ngày ngực', exerciseIds: ['e1', 'e2'] }]);
    renderDetail('r1');

    await userEvent.click(within(screen.getAllByRole('listitem')[1]).getByRole('button', { name: 'Bỏ' }));

    expect(screen.getAllByRole('listitem')).toHaveLength(1);
    expect(screen.getByText('Tổng thời gian: 0 phút 30 giây')).toBeInTheDocument();
  });

  it('bấm Tập tất cả thì buổi tập là các bài của giáo án, đang tập "Đẩy tạ đơn 1"', async () => {
    saveRoutines([{ id: 'r1', name: 'Ngày ngực', exerciseIds: ['e1', 'e2'] }]);
    renderDetail('r1');

    await userEvent.click(screen.getByRole('button', { name: 'Tập tất cả' }));

    expect(session().queue.map((e) => e.id)).toEqual(['e1', 'e2']);
    expect(session().queue[session().currentIndex].name).toBe('Đẩy tạ đơn 1');
    expect(session().isRunning).toBe(true);
  });

  it('giáo án chưa có bài thì nút Tập tất cả bị khóa', () => {
    saveRoutines([{ id: 'r1', name: 'Trống', exerciseIds: [] }]);
    renderDetail('r1');
    expect(screen.getByRole('button', { name: 'Tập tất cả' })).toBeDisabled();
    expect(screen.getByText('Tổng thời gian: 0 phút 0 giây')).toBeInTheDocument();
  });
});
