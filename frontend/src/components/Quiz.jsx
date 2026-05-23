import React, { useEffect, useMemo, useState } from 'react';
import { RotateCcw } from 'lucide-react';
import { QuestionCard } from './QuestionCard.jsx';

export function Quiz({ materialId, questions }) {
  const [answers, setAnswers] = useState({});
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    setAnswers({});
    setSubmitted(false);
  }, [materialId]);

  const result = useMemo(() => {
    const correct = questions.filter((question, index) => answers[index] === question.correctAnswer).length;
    return {
      correct,
      incorrect: questions.length - correct,
      total: questions.length
    };
  }, [answers, questions]);

  const answeredCount = Object.keys(answers).length;
  const isComplete = answeredCount === questions.length;

  function handleAnswer(index, answer) {
    if (submitted) return;
    setAnswers((current) => ({ ...current, [index]: answer }));
  }

  function handleQuizSubmit(event) {
    event.preventDefault();
    if (!isComplete) return;
    setSubmitted(true);
  }

  function resetQuiz() {
    setAnswers({});
    setSubmitted(false);
  }

  return (
    <form className="quiz-section" onSubmit={handleQuizSubmit}>
      <div className="quiz-heading">
        <div>
          <h3>Quiz interactivo</h3>
          <p>Responde las 10 preguntas y revisa tu resultado al final.</p>
        </div>
        <span>{answeredCount}/{questions.length} respondidas</span>
      </div>

      {submitted && (
        <div className="score-panel">
          <strong>Resultado: {result.correct}/{result.total}</strong>
          <span>{result.correct} correctas y {result.incorrect} incorrectas</span>
        </div>
      )}

      <div className="quiz-grid">
        {questions.map((question, index) => (
          <QuestionCard
            answer={answers[index]}
            index={index}
            key={`${question.question}-${index}`}
            onAnswer={handleAnswer}
            question={question}
            submitted={submitted}
          />
        ))}
      </div>

      <div className="quiz-actions">
        <button className="primary-button" disabled={!isComplete || submitted} type="submit">
          Enviar respuestas
        </button>
        <button className="ghost-button" onClick={resetQuiz} type="button">
          <RotateCcw size={18} aria-hidden="true" />
          Reiniciar quiz
        </button>
      </div>

      {!isComplete && !submitted && (
        <p className="quiz-hint">Completa todas las preguntas para enviar el quiz.</p>
      )}
    </form>
  );
}
