export function formatAnswer(answer) {
  if (typeof answer === 'boolean') {
    return answer ? 'Verdadero' : 'Falso';
  }

  return answer;
}
