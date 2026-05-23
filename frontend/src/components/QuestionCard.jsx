import React from 'react';
import { formatAnswer } from '../utils/formatAnswer.js';

export function QuestionCard({ answer, index, onAnswer, question, submitted, unanswered }) {
  const isCorrect = submitted && answer === question.correctAnswer;
  const isIncorrect = submitted && answer !== question.correctAnswer;

  return (
    <fieldset className={`question-card ${isCorrect ? 'is-correct' : ''} ${isIncorrect ? 'is-incorrect' : ''} ${unanswered ? 'is-unanswered' : ''}`}>
      <legend className="question-number">
        Pregunta {index + 1}
        {unanswered && !submitted && <span className="required-mark" aria-label="Pregunta sin responder">*</span>}
      </legend>
      <h4>{question.question}</h4>

      {question.type === 'multiple_choice' ? (
        <div className="options-list">
          {question.options.map((option) => (
            <label
              className={`option-item ${answer === option ? 'selected' : ''} ${submitted && option === question.correctAnswer ? 'correct' : ''} ${submitted && answer === option && option !== question.correctAnswer ? 'wrong' : ''}`}
              key={option}
            >
              <input
                checked={answer === option}
                disabled={submitted}
                name={`question-${index}`}
                onChange={() => onAnswer(index, option)}
                type="radio"
              />
              {submitted && answer === option && option !== question.correctAnswer && <span className="wrong-mark">x</span>}
              <span>{option}</span>
            </label>
          ))}
        </div>
      ) : (
        <div className="true-false-options">
          {[true, false].map((value) => (
            <label
              className={`option-item ${answer === value ? 'selected' : ''} ${submitted && value === question.correctAnswer ? 'correct' : ''} ${submitted && answer === value && value !== question.correctAnswer ? 'wrong' : ''}`}
              key={String(value)}
            >
              <input
                checked={answer === value}
                disabled={submitted}
                name={`question-${index}`}
                onChange={() => onAnswer(index, value)}
                type="radio"
              />
              {submitted && answer === value && value !== question.correctAnswer && <span className="wrong-mark">x</span>}
              <span>{value ? 'Verdadero' : 'Falso'}</span>
            </label>
          ))}
        </div>
      )}

      {submitted && (
        <div className="feedback-box">
          <strong>{isCorrect ? 'Correcta' : 'Incorrecta'}</strong>
          <p>Respuesta correcta: {formatAnswer(question.correctAnswer)}</p>
          <p>{question.explanation}</p>
        </div>
      )}
    </fieldset>
  );
}
