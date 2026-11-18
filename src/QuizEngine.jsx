
import { useEffect, useMemo, useState } from "react";
import { getQuestions } from "./data/questionStore";

const EXAM_DURATION = 10 * 60;

export default function QuizEngine({
  subject,
  level,
  topic,
  onBack,
}) {
  const [mode, setMode] = useState("");
  const [started, setStarted] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState({});
  const [submitted, setSubmitted] = useState(false);
  const [remainingTime, setRemainingTime] = useState(EXAM_DURATION);

  const questions = useMemo(() => {
    return getQuestions().filter(
      (question) =>
        question.published === true &&
        question.subject === subject &&
        question.level === level &&
        question.topicId === topic?.id
    );
  }, [subject, level, topic]);

  useEffect(() => {
    if (!started || mode !== "exam" || submitted) return;

    const timer = setInterval(() => {
      setRemainingTime((previous) => {
        if (previous <= 1) {
          clearInterval(timer);
          setSubmitted(true);
          return 0;
        }

        return previous - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [started, mode, submitted]);

  const currentQuestion = questions[currentIndex];
  const selectedAnswer = answers[currentQuestion?.id];

  const score = questions.filter(
    (question) =>
      answers[question.id] === question.correctAnswer
  ).length;

  function selectAnswer(option) {
    if (submitted) return;

    if (mode === "practice" && answers[currentQuestion.id]) {
      return;
    }

    setAnswers((previous) => ({
      ...previous,
      [currentQuestion.id]: option,
    }));
  }

  function formatTime(seconds) {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;

    return `${String(minutes).padStart(2, "0")}:${String(
      remainingSeconds
    ).padStart(2, "0")}`;
  }

  function startQuiz(selectedMode) {
    setMode(selectedMode);
    setStarted(true);
    setCurrentIndex(0);
    setAnswers({});
    setSubmitted(false);
    setRemainingTime(EXAM_DURATION);
  }

  function finishQuiz() {
    setSubmitted(true);
  }

  function restartQuiz() {
    setMode("");
    setStarted(false);
    setCurrentIndex(0);
    setAnswers({});
    setSubmitted(false);
    setRemainingTime(EXAM_DURATION);
  }

  if (!subject || !level || !topic) {
    return (
      <main className="min-h-screen bg-slate-50 p-6">
        <p>Please select a subject, level and topic first.</p>
        <button onClick={onBack} className="mt-4 rounded-lg border px-4 py-2">
          Back
        </button>
      </main>
    );
  }

  if (questions.length === 0) {
    return (
      <main className="min-h-screen bg-slate-50 p-6">
        <button onClick={onBack} className="mb-6 rounded-lg border px-4 py-2">
          ← Back
        </button>

        <h1 className="text-2xl font-bold">No Questions Available</h1>
        <p className="mt-3 text-slate-600">
          There are currently no published questions for this topic.
        </p>
      </main>
    );
  }

  if (!started) {
    return (
      <main className="min-h-screen bg-slate-50 p-6">
        <div className="mx-auto max-w-2xl">
          <button onClick={onBack} className="mb-6 rounded-lg border px-4 py-2">
            ← Back
          </button>

          <section className="rounded-2xl bg-white p-6 shadow-sm">
            <h1 className="text-2xl font-bold">Quiz Centre</h1>

            <p className="mt-2 text-slate-600">
              {subject} · {level} · {topic.title}
            </p>

            <p className="mt-4">
              Available questions: <strong>{questions.length}</strong>
            </p>

            <h2 className="mb-4 mt-8 text-lg font-bold">
              Choose your quiz mode
            </h2>

            <div className="grid gap-4 md:grid-cols-2">
              <button
                onClick={() => startQuiz("practice")}
                className="rounded-xl bg-blue-700 p-5 text-left text-white"
              >
                <strong className="block text-lg">Practice Mode</strong>
                <span className="mt-2 block text-sm">
                  Immediate feedback and explanations.
                </span>
              </button>

              <button
                onClick={() => startQuiz("exam")}
                className="rounded-xl bg-slate-900 p-5 text-left text-white"
              >
                <strong className="block text-lg">Exam Mode</strong>
                <span className="mt-2 block text-sm">
                  10-minute countdown with results at submission.
                </span>
              </button>
            </div>
          </section>
        </div>
      </main>
    );
  }

  if (submitted) {
    return (
      <main className="min-h-screen bg-slate-50 p-6">
        <div className="mx-auto max-w-2xl rounded-2xl bg-white p-6 shadow-sm">
          <h1 className="text-2xl font-bold">Quiz Results</h1>

          <p className="mt-4 text-4xl font-bold text-blue-700">
            {score} / {questions.length}
          </p>

          <p className="mt-2 text-slate-600">
            You answered {Object.keys(answers).length} of{" "}
            {questions.length} questions.
          </p>

          <div className="mt-6 space-y-4">
            {questions.map((question, index) => (
              <article key={question.id} className="rounded-lg border p-4">
                <p className="font-semibold">
                  {index + 1}. {question.questionText}
                </p>

                <p className="mt-2 text-sm">
                  Your answer: {answers[question.id] || "Not answered"}
                </p>

                <p className="text-sm text-green-700">
                  Correct answer: {question.correctAnswer}
                </p>

                <p className="mt-2 text-sm text-slate-600">
                  {question.explanation || "No explanation provided."}
                </p>
              </article>
            ))}
          </div>

          <div className="mt-6 flex flex-wrap gap-3">
            <button
              onClick={restartQuiz}
              className="rounded-lg bg-blue-700 px-5 py-3 text-white"
            >
              Try Again
            </button>

            <button
              onClick={onBack}
              className="rounded-lg border px-5 py-3"
            >
              Back
            </button>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-slate-50 p-6">
      <div className="mx-auto max-w-2xl">
        <div className="mb-6 flex items-center justify-between gap-3">
          <div>
            <h1 className="text-xl font-bold">
              {mode === "practice" ? "Practice Mode" : "Exam Mode"}
            </h1>
            <p className="text-sm text-slate-600">
              Question {currentIndex + 1} of {questions.length}
            </p>
          </div>

          {mode === "exam" && (
            <div className="rounded-lg bg-slate-900 px-4 py-2 font-bold text-white">
              {formatTime(remainingTime)}
            </div>
          )}
        </div>

        <div className="mb-5 h-2 overflow-hidden rounded-full bg-slate-200">
          <div
            className="h-full bg-blue-700"
            style={{
              width: `${((currentIndex + 1) / questions.length) * 100}%`,
            }}
          />
        </div>

        <section className="rounded-2xl bg-white p-6 shadow-sm">
          <h2 className="text-lg font-bold">
            {currentQuestion.questionText}
          </h2>

          <div className="mt-6 space-y-3">
            {Object.entries(currentQuestion.options).map(
              ([letter, option]) => {
                const isSelected = selectedAnswer === letter;
                const isCorrect =
                  currentQuestion.correctAnswer === letter;

                let optionStyle = "border-slate-200 hover:bg-slate-50";

                if (mode === "practice" && selectedAnswer) {
                  if (isCorrect) {
                    optionStyle = "border-green-500 bg-green-50";
                  } else if (isSelected) {
                    optionStyle = "border-red-500 bg-red-50";
                  }
                } else if (isSelected) {
                  optionStyle = "border-blue-600 bg-blue-50";
                }

                return (
                  <button
                    key={letter}
                    type="button"
                    onClick={() => selectAnswer(letter)}
                    disabled={
                      mode === "practice" && Boolean(selectedAnswer)
                    }
                    className={`w-full rounded-xl border p-4 text-left ${optionStyle}`}
                  >
                    <strong className="mr-3">{letter}.</strong>
                    {option}
                  </button>
                );
              }
            )}
          </div>

          {mode === "practice" && selectedAnswer && (
            <div className="mt-5 rounded-xl bg-slate-100 p-4">
              <p className="font-bold">
                {selectedAnswer === currentQuestion.correctAnswer
                  ? "Correct answer!"
                  : "Not quite. Review the correct answer."}
              </p>

              <p className="mt-2 text-sm">
                {currentQuestion.explanation || "No explanation provided."}
              </p>
            </div>
          )}

          <div className="mt-6 flex flex-wrap justify-between gap-3">
            <button
              type="button"
              disabled={currentIndex === 0}
              onClick={() => setCurrentIndex((previous) => previous - 1)}
              className="rounded-lg border px-5 py-3 disabled:opacity-40"
            >
              Previous
            </button>

            {currentIndex < questions.length - 1 ? (
              <button
                type="button"
                onClick={() => setCurrentIndex((previous) => previous + 1)}
                className="rounded-lg bg-blue-700 px-5 py-3 text-white"
              >
                Next
              </button>
            ) : (
              <button
                type="button"
                onClick={finishQuiz}
                className="rounded-lg bg-green-700 px-5 py-3 text-white"
              >
                Submit Quiz
              </button>
            )}
          </div>
        </section>
      </div>
    </main>
  );
}
