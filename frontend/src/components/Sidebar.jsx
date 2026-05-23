import React from 'react';
import { Loader2, UploadCloud, XCircle } from 'lucide-react';

export function Sidebar({
  error,
  file,
  isLoading,
  materials,
  onFileChange,
  onMaterialSelect,
  onSubmit,
  selectedMaterial
}) {
  return (
    <aside className="sidebar">
      <div className="brand">
        <div>
          <h1>EstudiandoAndo</h1>
          <p>Sube un PDF y genera un material de estudio</p>
        </div>
      </div>

      <form className="upload-panel" onSubmit={onSubmit}>
        <label className="drop-zone">
          <UploadCloud size={34} aria-hidden="true" />
          <span>{file ? file.name : 'Sube un PDF'}</span>
          <input
            type="file"
            accept="application/pdf"
            onChange={(event) => onFileChange(event.target.files?.[0] ?? null)}
          />
        </label>
        <button className="primary-button" type="submit" disabled={isLoading}>
          {isLoading && <Loader2 className="spin" size={18} aria-hidden="true" />}
          {isLoading ? 'Generando...' : 'Genera el material :D'}
        </button>
      </form>

      {error && (
        <div className="error-box">
          <XCircle size={18} aria-hidden="true" />
          <span>{error}</span>
        </div>
      )}

      <div className="history-header">
        <h2>Historial de material de estudio</h2>
        <span>{materials.length}</span>
      </div>

      <div className="history-list">
        {materials.length === 0 ? (
          <p className="empty-state">Aún no hay PDFs procesados.</p>
        ) : (
          materials.map((material) => (
            <button
              className={`history-item ${selectedMaterial?.id === material.id ? 'active' : ''}`}
              key={material.id}
              onClick={() => onMaterialSelect(material.id)}
              type="button"
            >
              <span>{material.summary.title || material.originalFilename}</span>
              <small>{new Date(material.createdAt).toLocaleString('es-GT')}</small>
            </button>
          ))
        )}
      </div>
    </aside>
  );
}
