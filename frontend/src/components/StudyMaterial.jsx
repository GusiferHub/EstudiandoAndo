import React from 'react';
import { CheckCircle2, Trash2 } from 'lucide-react';
import { Quiz } from './Quiz.jsx';

export function StudyMaterial({ material, onDelete }) {
  return (
    <article className="study-material">
      <header className="material-header">
        <div>
          <p>{material.originalFilename}</p>
          <h2>{material.summary.title}</h2>
        </div>
        <button className="ghost-button delete-button" onClick={() => onDelete(material.id)} type="button">
          <Trash2 size={18} aria-hidden="true" />
          Eliminar
        </button>
      </header>

      <section className="summary-band info-card">
        <h3>Resumen</h3>
        <p>{material.summary.shortSummary}</p>
      </section>

      <div className="two-column">
        <section className="info-card">
          <h3>Puntos clave</h3>
          <ul className="check-list">
            {material.summary.keyPoints.map((point) => (
              <li key={point}>
                <CheckCircle2 size={18} aria-hidden="true" />
                <span>{point}</span>
              </li>
            ))}
          </ul>
        </section>

        <section className="info-card">
          <h3>Plan de estudio</h3>
          <ol className="study-plan">
            {material.summary.studyPlan.map((step) => (
              <li key={step}>{step}</li>
            ))}
          </ol>
        </section>
      </div>

      <Quiz materialId={material.id} questions={material.quiz} />
    </article>
  );
}
