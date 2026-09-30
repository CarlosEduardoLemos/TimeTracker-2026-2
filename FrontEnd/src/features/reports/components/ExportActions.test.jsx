import { fireEvent, render, screen } from '@testing-library/react';
import { expect, it, vi } from 'vitest';
import { ExportActions } from './ExportActions';

const props = {
  date: '2026-09-28',
  exporting: '',
  error: '',
  success: '',
  onDownload: vi.fn(),
  onDismiss: vi.fn(),
};

it('envia o formato selecionado e bloqueia novos downloads durante preparo', () => {
  const onDownload = vi.fn();
  const { rerender } = render(<ExportActions {...props} onDownload={onDownload} />);
  fireEvent.click(screen.getByRole('button', { name: 'Exportar CSV' }));
  fireEvent.click(screen.getByRole('button', { name: 'Exportar PDF' }));
  expect(onDownload.mock.calls.map(([format]) => format)).toEqual(['csv', 'pdf']);
  rerender(<ExportActions {...props} exporting="csv" onDownload={onDownload} />);
  expect(screen.getByRole('button', { name: 'Exportando…' })).toBeDisabled();
  expect(screen.getByRole('button', { name: 'Exportar PDF' })).toBeDisabled();
  expect(screen.getByRole('status')).toHaveTextContent('Preparando arquivo CSV');
  rerender(<ExportActions {...props} date="" onDownload={onDownload} />);
  expect(screen.getByRole('button', { name: 'Exportar CSV' })).toBeDisabled();
});

it('anuncia erro e sucesso e permite fechar a confirmação', () => {
  const onDismiss = vi.fn();
  const { rerender } = render(
    <ExportActions {...props} error="Falha ao exportar" onDismiss={onDismiss} />,
  );
  expect(screen.getByRole('alert')).toHaveTextContent('Falha ao exportar');
  rerender(<ExportActions {...props} success="Download iniciado." onDismiss={onDismiss} />);
  expect(screen.getByRole('status')).toHaveTextContent('Download iniciado.');
  fireEvent.click(screen.getByRole('button', { name: 'Dispensar confirmação' }));
  expect(onDismiss).toHaveBeenCalledOnce();
});
