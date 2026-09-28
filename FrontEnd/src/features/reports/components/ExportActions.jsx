import { ErrorNotice, SuccessToast } from '../../../shared/components/AsyncFeedback';

export function ExportActions({ date, exporting, error, success, onDownload, onDismiss }) {
  return (
    <>
      <div className="mt-5 flex flex-wrap gap-2">
        <button
          className="secondary-button"
          disabled={!date || !!exporting}
          onClick={() => onDownload('csv')}
        >
          {exporting === 'csv' ? 'Exportando…' : 'Exportar CSV'}
        </button>
        <button
          className="primary-button"
          disabled={!date || !!exporting}
          onClick={() => onDownload('pdf')}
        >
          {exporting === 'pdf' ? 'Exportando…' : 'Exportar PDF'}
        </button>
      </div>
      {exporting && (
        <p role="status" className="mt-3 text-sm muted">
          Preparando arquivo {exporting.toUpperCase()}…
        </p>
      )}
      {error && <ErrorNotice className="mt-3">{error}</ErrorNotice>}
      {success && <SuccessToast onDismiss={onDismiss}>{success}</SuccessToast>}
    </>
  );
}
