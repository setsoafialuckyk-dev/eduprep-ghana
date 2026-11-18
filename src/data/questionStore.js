
const STORAGE_KEY = "eduprep_questions_v1";

export function getQuestions() {
  try {
    const savedQuestions = localStorage.getItem(STORAGE_KEY);
    return savedQuestions ? JSON.parse(savedQuestions) : [];
  } catch (error) {
    console.error("Could not load questions:", error);
    return [];
  }
}

export function saveQuestions(questions) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(questions));
    return true;
  } catch (error) {
    console.error("Could not save questions:", error);
    return false;
  }
}

export function addQuestion(question) {
  const questions = getQuestions();
  return saveQuestions([...questions, question]);
}

export function updateQuestion(questionId, updatedQuestion) {
  const questions = getQuestions();

  const updated = questions.map((question) =>
    question.id === questionId
      ? { ...question, ...updatedQuestion }
      : question
  );

  return saveQuestions(updated);
}

export function deleteQuestion(questionId) {
  const questions = getQuestions();

  return saveQuestions(
    questions.filter((question) => question.id !== questionId)
  );
}
