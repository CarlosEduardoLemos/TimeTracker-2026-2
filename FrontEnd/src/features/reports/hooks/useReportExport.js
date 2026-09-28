import { useCallback, useEffect, useRef, useState } from 'react';
import { api } from '../../../shared/api/api';
import { getApiErrorMessage } from '../../../shared/api/errorMessage';
import { exportFilename } from '../lib/exportFilename';

export function useReportExport(date, username) {
  const [exporting, setExporting] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const activeExport = useRef(null);

  useEffect(() => () => activeExport.current?.abort(), []);

  const clearFeedback = useCallback(() => {
    setError('');
    setSuccess('');
  }, []);
  const dismissSuccess = useCallback(() => setSuccess(''), []);

  const download = useCallback(
    async (format) => {
      if (activeExport.current) return;
      const controller = new AbortController();
      activeExport.current = controller;
      clearFeedback();
      setExporting(format);
      try {
        const blob = await api.exportFile(format, date, username, controller.signal);
        if (controller.signal.aborted) return;
        if (!(blob instanceof Blob) || blob.size === 0)
          throw new Error('Arquivo vazio ou inválido');
        const url = URL.createObjectURL(blob);
        const anchor = document.createElement('a');
        anchor.href = url;
        anchor.download = exportFilename(format, date, username);
        document.body.append(anchor);
        anchor.click();
        anchor.remove();
        setTimeout(() => URL.revokeObjectURL(url), 1000);
        setSuccess(`Download de ${format.toUpperCase()} iniciado.`);
      } catch (cause) {
        if (!controller.signal.aborted) {
          setError(`Não foi possível exportar: ${getApiErrorMessage(cause)}`);
        }
      } finally {
        if (activeExport.current === controller) activeExport.current = null;
        if (!controller.signal.aborted) setExporting('');
      }
    },
    [clearFeedback, date, username],
  );

  return { exporting, error, success, download, clearFeedback, dismissSuccess };
}
