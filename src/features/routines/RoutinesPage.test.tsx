import { screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { renderWithProviders } from '../../test-utils';
import RoutinesPage from './RoutinesPage';

const createRoutine = async (name: string) => {
  const input = screen.getByLabelText('Tên giáo án');
  await userEvent.clear(input);
  if (name) await userEvent.type(input, name);
  await userEvent.click(screen.getByRole('button', { name: 'Tạo' }));
};
const listedNames = () =>
  screen.queryAllByRole('listitem').map((li) => within(li).getByRole('link').textContent);

describe('RoutinesPage', () => {
  beforeEach(() => {
    localStorage.clear();
    vi.spyOn(console, 'log').mockImplementation(() => {});
  });

  it('bấm Tạo khi ô trống thì thấy "Tên giáo án không được để trống"', async () => {
    renderWithProviders(<RoutinesPage />);
    await createRoutine('');
    expect(screen.getByText('Tên giáo án không được để trống')).toBeInTheDocument();
    expect(listedNames()).toEqual([]);
  });

  it('tên chỉ có khoảng trắng cũng bị coi là trống', async () => {
    renderWithProviders(<RoutinesPage />);
    await createRoutine('   ');
    expect(screen.getByText('Tên giáo án không được để trống')).toBeInTheDocument();
  });

  it('nhập tên rồi bấm Tạo thì tên xuất hiện trong danh sách, ô nhập được xóa trắng', async () => {
    renderWithProviders(<RoutinesPage />);
    await createRoutine('Ngày ngực');

    expect(listedNames()).toEqual(['Ngày ngực']);
    expect(screen.getByText('0 bài')).toBeInTheDocument();
    expect(screen.getByLabelText('Tên giáo án')).toHaveValue('');
  });

  it('trùng tên (không phân biệt hoa thường) thì báo "Tên giáo án đã tồn tại"', async () => {
    renderWithProviders(<RoutinesPage />);
    await createRoutine('Ngày ngực');
    await createRoutine('ngày NGỰC');

    expect(screen.getByText('Tên giáo án đã tồn tại')).toBeInTheDocument();
    expect(listedNames()).toEqual(['Ngày ngực']);
  });

  it('tạo thành công thì lỗi cũ biến mất', async () => {
    renderWithProviders(<RoutinesPage />);
    await createRoutine('');
    await createRoutine('Ngày chân');
    expect(screen.queryByText('Tên giáo án không được để trống')).not.toBeInTheDocument();
  });

  it('mỗi giáo án hiện tên, số bài và link sang trang chi tiết', () => {
    localStorage.setItem(
      'workout-routines',
      JSON.stringify([{ id: 'r1', name: 'Ngày ngực', exerciseIds: ['e1', 'e2'] }]),
    );
    renderWithProviders(<RoutinesPage />);

    expect(screen.getByRole('link', { name: 'Ngày ngực' })).toHaveAttribute('href', '/routines/r1');
    expect(screen.getByText('2 bài')).toBeInTheDocument();
  });

  it('bấm Xóa thì giáo án biến mất khỏi danh sách', async () => {
    renderWithProviders(<RoutinesPage />);
    await createRoutine('Ngày ngực');
    await createRoutine('Ngày chân');

    const chest = screen.getAllByRole('listitem')[0];
    await userEvent.click(within(chest).getByRole('button', { name: 'Xóa' }));

    expect(listedNames()).toEqual(['Ngày chân']);
  });
});
