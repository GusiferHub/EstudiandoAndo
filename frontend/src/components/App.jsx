import React, { useEffect, useMemo, useState } from 'react';
import { FileText } from 'lucide-react';
import { createStudyMaterial, deleteStudyMaterial, listStudyMaterials } from '../api.js';
import { Sidebar } from './Sidebar.jsx';
import { StudyMaterial } from './StudyMaterial.jsx';

export function App() {
  const [file, setFile] = useState(null);
  const [materials, setMaterials] = useState([]);
  const [selectedId, setSelectedId] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const selectedMaterial = useMemo(() => {
    return materials.find((material) => material.id === selectedId) ?? materials[0] ?? null;
  }, [materials, selectedId]);

  useEffect(() => {
    refreshMaterials();
  }, []);

  async function refreshMaterials() {
    try {
      const data = await listStudyMaterials();
      setMaterials(data);
      setSelectedId((current) => current ?? data[0]?.id ?? null);
    } catch (loadError) {
      setError(loadError.message);
    }
  }

  async function handleUploadSubmit(event) {
    event.preventDefault();
    setError('');

    if (!file) {
      setError('Selecciona un PDF para generar el material.');
      return;
    }

    if (file.type !== 'application/pdf') {
      setError('El archivo debe ser un PDF.');
      return;
    }

    setIsLoading(true);
    try {
      const created = await createStudyMaterial(file);
      setMaterials((current) => [created, ...current]);
      setSelectedId(created.id);
      setFile(null);
      event.target.reset();
    } catch (submitError) {
      setError(submitError.message);
    } finally {
      setIsLoading(false);
    }
  }

  async function handleDelete(id) {
    setError('');

    try {
      await deleteStudyMaterial(id);
      setMaterials((current) => current.filter((material) => material.id !== id));
      setSelectedId((current) => current === id ? null : current);
    } catch (deleteError) {
      setError(deleteError.message);
    }
  }

  return (
    <main className="app-shell">
      <section className="workspace">
        <Sidebar
          error={error}
          file={file}
          isLoading={isLoading}
          materials={materials}
          onFileChange={setFile}
          onMaterialSelect={setSelectedId}
          onSubmit={handleUploadSubmit}
          selectedMaterial={selectedMaterial}
        />

        <section className="content">
          {selectedMaterial ? (
            <StudyMaterial material={selectedMaterial} onDelete={handleDelete} />
          ) : (
            <div className="welcome">
              <FileText size={48} aria-hidden="true" />
              <h2>Sube un PDF para empezar</h2>
              <p>Te ayudo a generar un plan de estudio!</p>
            </div>
          )}
        </section>
      </section>
    </main>
  );
}
