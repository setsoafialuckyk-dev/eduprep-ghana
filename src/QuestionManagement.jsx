
import { useState } from "react";
import {
  getQuestions,
  addQuestion,
  updateQuestion,
  deleteQuestion,
} from "./data/questionStore";
import { topics } from "./data/topics";

const levels = ["JHS 1", "JHS 2", "JHS 3", "SHS 1", "SHS 2", "SHS 3"];

const emptyForm = {
  subject: "Core Mathematics",
  level: "JHS 1",
  topicId: "",
  questionText: "",
  options: { A: "", B: "", C: "", D: "" },
  correctAnswer: "A",
  explanation: "",
  published: false,
};

export default function QuestionManagement({ onBack }) {
  const [questions, setQuestions] = useState(() => getQuestions());
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState(null);
  const [message, setMessage] = useState("");

  const availableSubjects = Object.keys(topics);
  const availableTopics =
    topics[form.subject]?.[form.level] || [];

  function updateField(field, value) {
    setForm((previous) => ({ ...previous, [field]: value }));
  }

  function handleSubmit(event) {
    event.preventDefault();

    if (!form.topicId || !form.questionText.trim()) {
      setMessage("Please select a topic and enter a question.");
      return;
    }

    if (Object.values(form.options).some((option) => !option.trim())) {
      setMessage("Please complete all four answer options.");
      return;
    }

    const questionData = {
      ...form,
      id: editingId || `question-${Date.now()}`,
      createdAt: new Date().toISOString(),
    };

    const saved = editingId
      ? updateQuestion(editingId, questionData)
      : addQuestion(questionData);

    if (!saved) {
      setMessage("Could not save the question.");
      return;
    }

    setQuestions(getQuestions());
    setForm(emptyForm);
    setEditingId(null);
    setMessage("Question saved successfully.");
  }

  function handleEdit(question) {
    setForm({
      ...emptyForm,
      ...question,
      options: { ...emptyForm.options, ...question.options },
    });
    setEditingId(question.id);
    setMessage("");
  }

  function handleDelete(id) {
    if (!window.confirm("Delete this question?")) return;

    deleteQuestion(id);
    setQuestions(getQuestions());
    setMessage("Question deleted.");
  }

  function togglePublished(question) {
    updateQuestion(question.id, {
      published: !question.published,
    });
    setQuestions(getQuestions());
  }

  function cancelEdit() {
    setForm(emptyForm);
    setEditingId(null);
    setMessage("");
  }

  return (
    <main className="min-h-screen bg-slate-50 p-4 md:p-8">
      <div className="mx-auto max-w-5xl">
        <button
          type="button"
          onClick={onBack}
          className="mb-6 rounded-lg border bg-white px-4 py-2"
        >
          ← Back to Admin
        </button>

        <h1 className="mb-2 text-2xl font-bold text-slate-900">
          Question Management
        </h1>
        <p className="mb-6 text-slate-600">
          Create and manage questions for student quizzes.
        </p>

        <form
          onSubmit={handleSubmit}
          className="mb-8 space-y-5 rounded-xl bg-white p-5 shadow-sm"
        >
          <h2 className="text-lg font-bold">
            {editingId ? "Edit Question" : "Add New Question"}
          </h2>

          <div className="grid gap-4 md:grid-cols-3">
            <label className="block">
              <span className="mb-1 block text-sm font-medium">Subject</span>
              <select
                value={form.subject}
                onChange={(e) => {
                  setForm({
                    ...form,
                    subject: e.target.value,
                    topicId: "",
                  });
                }}
                className="w-full rounded-lg border p-3"
              >
                {availableSubjects.map((subject) => (
                  <option key={subject} value={subject}>
                    {subject}
                  </option>
                ))}
              </select>
            </label>

            <label className="block">
              <span className="mb-1 block text-sm font-medium">Level</span>
              <select
                value={form.level}
                onChange={(e) => {
                  setForm({
                    ...form,
                    level: e.target.value,
                    topicId: "",
                  });
                }}
                className="w-full rounded-lg border p-3"
              >
                {levels.map((level) => (
                  <option key={level} value={level}>{level}</option>
                ))}
              </select>
            </label>

            <label className="block">
              <span className="mb-1 block text-sm font-medium">Topic</span>
              <select
                value={form.topicId}
                onChange={(e) => updateField("topicId", e.target.value)}
                className="w-full rounded-lg border p-3"
                required
              >
                <option value="">Select a topic</option>
                {availableTopics.map((topic) => (
                  <option key={topic.id} value={topic.id}>
                    {topic.title}
                  </option>
                ))}
              </select>
            </label>
          </div>

          <label className="block">
            <span className="mb-1 block text-sm font-medium">
              Question
            </span>
            <textarea
              value={form.questionText}
              onChange={(e) => updateField("questionText", e.target.value)}
              className="w-full rounded-lg border p-3"
              rows="3"
              placeholder="Enter the question..."
              required
            />
          </label>

          <div className="grid gap-4 md:grid-cols-2">
            {["A", "B", "C", "D"].map((letter) => (
              <label key={letter} className="block">
                <span className="mb-1 block text-sm font-medium">
                  Option {letter}
                </span>
                <input
                  value={form.options[letter]}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      options: {
                        ...form.options,
                        [letter]: e.target.value,
                      },
                    })
                  }
                  className="w-full rounded-lg border p-3"
                  placeholder={`Enter option ${letter}`}
                  required
                />
              </label>
            ))}
          </div>

          <label className="block">
            <span className="mb-1 block text-sm font-medium">
              Correct Answer
            </span>
            <select
              value={form.correctAnswer}
              onChange={(e) => updateField("correctAnswer", e.target.value)}
              className="w-full rounded-lg border p-3"
            >
              {["A", "B", "C", "D"].map((letter) => (
                <option key={letter} value={letter}>
                  Option {letter}
                </option>
              ))}
            </select>
          </label>

          <label className="block">
            <span className="mb-1 block text-sm font-medium">
              Explanation
            </span>
            <textarea
              value={form.explanation}
              onChange={(e) => updateField("explanation", e.target.value)}
              className="w-full rounded-lg border p-3"
              rows="3"
              placeholder="Explain why the answer is correct..."
            />
          </label>

          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={form.published}
              onChange={(e) => updateField("published", e.target.checked)}
            />
            <span className="text-sm font-medium">
              Publish this question for students
            </span>
          </label>

          {message && (
            <p className="text-sm text-blue-700">{message}</p>
          )}

          <div className="flex flex-wrap gap-3">
            <button
              type="submit"
              className="rounded-lg bg-blue-700 px-5 py-3 font-semibold text-white"
            >
              {editingId ? "Update Question" : "Save Question"}
            </button>

            {editingId && (
              <button
                type="button"
                onClick={cancelEdit}
                className="rounded-lg border px-5 py-3"
              >
                Cancel Edit
              </button>
            )}
          </div>
        </form>

        <section className="rounded-xl bg-white p-5 shadow-sm">
          <h2 className="mb-4 text-lg font-bold">
            Existing Questions ({questions.length})
          </h2>

          {questions.length === 0 ? (
            <p className="text-slate-500">
              No questions have been added yet.
            </p>
          ) : (
            <div className="space-y-4">
              {questions.map((question) => (
                <article
                  key={question.id}
                  className="rounded-lg border p-4"
                >
                  <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
                    <span className="text-sm text-slate-500">
                      {question.subject} · {question.level}
                    </span>
                    <span className="text-sm font-semibold">
                      {question.published ? "Published" : "Draft"}
                    </span>
                  </div>

                  <p className="mb-3 font-semibold">
                    {question.questionText}
                  </p>

                  <div className="mb-3 grid gap-1 text-sm md:grid-cols-2">
                    {Object.entries(question.options || {}).map(
                      ([letter, option]) => (
                        <p key={letter}>
                          {letter}. {option}
                        </p>
                      )
                    )}
                  </div>

                  <p className="mb-3 text-sm text-green-700">
                    Correct answer: {question.correctAnswer}
                  </p>

                  <div className="flex flex-wrap gap-2">
                    <button
                      type="button"
                      onClick={() => handleEdit(question)}
                      className="rounded-lg border px-3 py-2 text-sm"
                    >
                      Edit
                    </button>
                    <button
                      type="button"
                      onClick={() => togglePublished(question)}
                      className="rounded-lg border px-3 py-2 text-sm"
                    >
                      {question.published ? "Unpublish" : "Publish"}
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDelete(question.id)}
                      className="rounded-lg border border-red-300 px-3 py-2 text-sm text-red-700"
                    >
                      Delete
                    </button>
                  </div>
                </article>
              ))}
            </div>
          )}
        </section>
      </div>
    </main>
  );
}
