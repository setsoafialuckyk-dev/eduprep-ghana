import { useState, useEffect } from "react";
import {
  getContent,
  addLesson,
  updateLesson,
  deleteLesson,
} from "./data/contentStore";
import {
  getQuestions,
  addQuestion,
  updateQuestion,
  deleteQuestion,
} from "./data/questionStore";
import parse, { domToReact } from "html-react-parser";
import QuestionManagement from "./QuestionManagement.jsx";
import dashboardHtml from "./assets/student-dashboard.html?raw";
import subjectHtml from "./assets/subject-selection.html?raw";
import { topics } from "./data/topics";
import QuizEngine from "./QuizEngine";

import "./App.css";

const navigation = [
  { id: "home", label: "Home", icon: "home" },
  { id: "subjects", label: "Learn", icon: "menu_book" },
  { id: "quiz", label: "Quiz", icon: "help_center" },
  { id: "progress", label: "Progress", icon: "bar_chart" },
  { id: "profile", label: "Profile", icon: "person" },
];

const levels = ["JHS 1", "JHS 2", "JHS 3", "SHS 1", "SHS 2", "SHS 3"];

const screenDetails = {
  quiz: {
    title: "Quizzes",
    description: "Practice your knowledge and prepare for your examinations.",
    icon: "help_center",
  },
  progress: {
    title: "My Progress",
    description: "Your learning performance and study activity will appear here.",
    icon: "bar_chart",
  },
  profile: {
    title: "My Profile",
    description: "Manage your student information and account settings.",
    icon: "person",
  },
};

function getBodyContent(html) {
  const match = html.match(/<body[^>]*>([\s\S]*?)<\/body>/i);
  return match ? match[1] : html;
}

function getNodeText(node) {
  if (!node) return "";

  if (node.type === "text") {
    return node.data || "";
  }

  return (node.children || []).map(getNodeText).join("");
}

function BottomNavigation({ activeScreen, onNavigate }) {
  return (
    <nav className="fixed bottom-0 left-0 w-full z-50 pb-safe bg-surface/90 backdrop-blur-xl shadow-[0_-2px_12px_rgba(0,0,0,0.05)]">
      <div className="flex justify-around items-center h-16 px-space-xs">
        {navigation.map((item) => (
          <button
            key={item.id}
            onClick={() => onNavigate(item.id)}
            className={`flex flex-col items-center justify-center flex-1 h-full py-1 transition-colors ${
              activeScreen === item.id
                ? "text-primary-container font-bold"
                : "text-on-surface-variant hover:text-on-surface"
            }`}
          >
            <span className="material-symbols-outlined text-[24px]">
              {item.icon}
            </span>

            <span className="font-label-sm text-label-sm tracking-normal">
              {item.label}
            </span>
          </button>
        ))}
      </div>
    </nav>
  );
}

function StudentDashboard({ onNavigate }) {
  const options = {
    replace(domNode) {
      if (
        domNode.name === "a" &&
        domNode.attribs?.["data-path"]
      ) {
        const path = domNode.attribs["data-path"];

        return (
          <button
            type="button"
            onClick={() =>
              onNavigate(path === "performance" ? "progress" : path)
            }
            className={domNode.attribs.class || ""}
          >
            {domToReact(domNode.children || [], options)}
          </button>
        );
      }
    },
  };

  return <>{parse(getBodyContent(dashboardHtml), options)}</>;
}

function SubjectSelection({ onSelectSubject }) {
  const options = {
    replace(domNode) {
      if (domNode.name === "nav" || domNode.name === "script") {
        return <></>;
      }

      if (
        domNode.name === "article" &&
        domNode.attribs?.class?.includes("subject-card")
      ) {
        const subjectName = (domNode.children || [])
          .map(getNodeText)
          .join(" ")
          .match(
            /Core Mathematics|Integrated Science|English Language|Social Studies|Elective Biology|Elective Chemistry|Elective Physics/
          )?.[0];

        if (!subjectName) {
          return <>{domToReact(domNode.children || [], options)}</>;
        }

        return (
          <article
            className={domNode.attribs.class || ""}
            data-category={domNode.attribs["data-category"]}
            data-title={domNode.attribs["data-title"]}
            role="button"
            tabIndex={0}
            onClick={() => onSelectSubject(subjectName)}
            onKeyDown={(event) => {
              if (event.key === "Enter" || event.key === " ") {
                event.preventDefault();
                onSelectSubject(subjectName);
              }
            }}
          >
            {domToReact(domNode.children || [], options)}
          </article>
        );
      }
    },
  };

  return <>{parse(getBodyContent(subjectHtml), options)}</>;
}

function PageHeader({ title, onBack }) {
  return (
    <header className="fixed top-0 left-0 w-full z-40 h-16 px-4 flex items-center gap-3 bg-surface/90 backdrop-blur-xl shadow-sm">
      <button
        onClick={onBack}
        className="w-10 h-10 rounded-full flex items-center justify-center hover:bg-surface-container"
        aria-label="Go back"
      >
        <span className="material-symbols-outlined">
          arrow_back
        </span>
      </button>

      <h1 className="font-headline-sm text-headline-sm font-bold">
        {title}
      </h1>
    </header>
  );
}

function LevelSelectionScreen({
  subject,
  onSelectLevel,
  onBack,
  onNavigate,
}) {
  return (
    <div className="min-h-screen bg-surface text-on-surface">
      <PageHeader title={subject} onBack={onBack} />

      <main className="px-4 pt-24 pb-24">
        <section className="bg-surface-container-low rounded-2xl p-5">
          <span className="material-symbols-outlined text-primary text-3xl">
            school
          </span>

          <h2 className="font-headline-md text-headline-md font-bold mt-2">
            Choose your level
          </h2>

          <p className="text-on-surface-variant text-body-md mt-2">
            Select your class level to access the appropriate learning
            materials and practice questions.
          </p>
        </section>

        <section className="mt-6">
          <h3 className="font-headline-sm text-headline-sm font-bold mb-3">
            Junior High School
          </h3>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {levels.slice(0, 3).map((level) => (
              <button
                key={level}
                onClick={() => onSelectLevel(level)}
                className="bg-surface-container-lowest rounded-xl p-5 shadow-sm border border-outline-variant/30 text-left hover:border-primary transition-colors"
              >
                <span className="material-symbols-outlined text-primary text-2xl">
                  menu_book
                </span>

                <h4 className="font-bold text-lg mt-3">
                  {level}
                </h4>

                <p className="text-xs text-on-surface-variant mt-1">
                  Junior High
                </p>

                <span className="material-symbols-outlined text-primary mt-3">
                  arrow_forward
                </span>
              </button>
            ))}
          </div>
        </section>

        <section className="mt-7">
          <h3 className="font-headline-sm text-headline-sm font-bold mb-3">
            Senior High School
          </h3>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {levels.slice(3).map((level) => (
              <button
                key={level}
                onClick={() => onSelectLevel(level)}
                className="bg-surface-container-lowest rounded-xl p-5 shadow-sm border border-outline-variant/30 text-left hover:border-primary transition-colors"
              >
                <span className="material-symbols-outlined text-primary text-2xl">
                  school
                </span>

                <h4 className="font-bold text-lg mt-3">
                  {level}
                </h4>

                <p className="text-xs text-on-surface-variant mt-1">
                  Senior High
                </p>

                <span className="material-symbols-outlined text-primary mt-3">
                  arrow_forward
                </span>
              </button>
            ))}
          </div>
        </section>
      </main>

      <BottomNavigation
        activeScreen="subjects"
        onNavigate={onNavigate}
      />
    </div>
  );
}

function TopicsScreen({
  subject,
  level,
  onSelectTopic,
  onBack,
  onNavigate,
}) {
  const subjectTopics = topics[subject]?.[level] || [];

  return (
    <div className="min-h-screen bg-surface text-on-surface">
      <PageHeader title={`${subject} - ${level}`} onBack={onBack} />

      <main className="px-4 pt-24 pb-24">
        <section className="bg-surface-container-low rounded-2xl p-5">
          <span className="material-symbols-outlined text-primary text-3xl">
            menu_book
          </span>

          <h2 className="font-headline-md text-headline-md font-bold mt-2">
            Learning Topics
          </h2>

          <p className="text-on-surface-variant text-body-md mt-2">
            Choose a topic to access its lessons, revision notes and quizzes.
          </p>

          <div className="mt-4 inline-flex bg-primary/10 text-primary rounded-full px-3 py-1 text-sm font-semibold">
            {level}
          </div>
        </section>

        <section className="mt-6">
          <h3 className="font-headline-sm text-headline-sm font-bold mb-3">
            {subject} Topics
          </h3>

          {subjectTopics.length > 0 ? (
            <div className="space-y-3">
              {subjectTopics.map((topic, index) => (
                <button
                  key={topic.id}
                  onClick={() => onSelectTopic(topic)}
                  className="w-full bg-surface-container-lowest rounded-xl p-4 shadow-sm border border-outline-variant/30 flex items-center gap-4 text-left hover:border-primary transition-colors"
                >
                  <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                    <span className="material-symbols-outlined text-primary text-2xl">
                      {topic.icon || "menu_book"}
                    </span>
                  </div>

                  <div className="flex-1">
                    <p className="text-xs text-on-surface-variant">
                      Topic {index + 1}
                    </p>

                    <h4 className="font-bold text-base">
                      {topic.title}
                    </h4>

                    <p className="text-xs text-on-surface-variant mt-1">
                      {topic.description}
                    </p>
                  </div>

                  <span className="material-symbols-outlined text-primary">
                    chevron_right
                  </span>
                </button>
              ))}
            </div>
          ) : (
            <div className="bg-surface-container-lowest rounded-xl p-5 shadow-sm">
              <h4 className="font-bold mt-2">
                No topics available yet
              </h4>

              <p className="text-on-surface-variant text-sm mt-2">
                Verified learning content for this subject and level
                has not been added yet.
              </p>
            </div>
          )}
        </section>
      </main>

      <BottomNavigation
        activeScreen="subjects"
        onNavigate={onNavigate}
      />
    </div>
  );
}

function SecondaryScreen({ screen, onNavigate }) {
  const details = screenDetails[screen];

  return (
    <div className="min-h-screen bg-surface text-on-surface">
      <header className="fixed top-0 left-0 w-full z-40 h-16 px-4 flex items-center bg-surface/90 backdrop-blur-xl shadow-sm">
        <h1 className="font-headline-sm text-headline-sm font-bold">
          EduPrep Ghana
        </h1>
      </header>

      <main className="px-4 pt-24 pb-24">
        <section className="bg-surface-container-low rounded-xl p-5">
          <div className="flex items-center gap-3 mb-4">
            <span className="material-symbols-outlined text-primary text-3xl">
              {details.icon}
            </span>

            <h2 className="font-headline-md text-headline-md font-bold">
              {details.title}
            </h2>
          </div>

          <p className="text-on-surface-variant text-body-md">
            {details.description}
          </p>
        </section>

        <section className="mt-5 bg-surface-container-lowest rounded-xl p-5 shadow-sm">
          <h3 className="font-headline-sm text-headline-sm mb-2">
            Coming Soon
          </h3>

          <p className="text-on-surface-variant text-body-sm">
            This section is being developed as we build EduPrep Ghana.
          </p>
        </section>
      </main>

      <BottomNavigation
        activeScreen={screen}
        onNavigate={onNavigate}
      />
    </div>
  );
}


function TopicStudyScreen({
  subject,
  level,
  topic,
  lessons,
  onSelectLesson,
  onBack,
  onNavigate,
  onStartQuiz,
}) {
  return (
    <div className="min-h-screen bg-surface text-on-surface">
      <PageHeader title={topic.title} onBack={onBack} />

      <main className="px-4 pt-24 pb-24">
        <section className="bg-surface-container-low rounded-2xl p-5">
          <span className="material-symbols-outlined text-primary text-3xl">
            {topic.icon || "menu_book"}
          </span>

          <h2 className="text-xl font-bold mt-2">{topic.title}</h2>

          <p className="text-on-surface-variant mt-2">
            {topic.description}
          </p>

          <p className="text-sm text-primary font-semibold mt-3">
            {subject} · {level}
          </p>
        </section>

        <section className="mt-6">
          <h3 className="text-lg font-bold mb-3">Available Lessons</h3>

          {lessons.length > 0 ? (
            <div className="space-y-3">
              {lessons.map((lesson, index) => (
                <button
                  key={lesson.id}
                  onClick={() => onSelectLesson(lesson)}
                  className="w-full text-left bg-surface-container-lowest rounded-xl p-4 shadow-sm border border-outline-variant/30"
                >
                  <p className="text-xs text-primary font-semibold">
                    LESSON {index + 1}
                  </p>
                  <h4 className="font-bold mt-1">{lesson.title}</h4>
                  <p className="text-sm text-on-surface-variant mt-1">
                    {lesson.introduction}
                  </p>
                </button>
              ))}
            </div>
          ) : (
            <div className="bg-surface-container-low rounded-xl p-5">
              <p className="font-semibold">No published lessons yet.</p>
              <p className="text-sm text-on-surface-variant mt-2">
                Lessons will appear here when the administrator publishes them.
              </p>
            </div>
          )}
        </section>

        <section className="mt-6">
          <button
            onClick={onStartQuiz}
            className="w-full bg-primary text-white rounded-xl p-4 flex items-center justify-center gap-3 font-bold"
          >
            <span className="material-symbols-outlined">quiz</span>
            Start Topic Quiz
            <span className="material-symbols-outlined">arrow_forward</span>
          </button>
        </section>
      </main>

      <BottomNavigation
        activeScreen="subjects"
        onNavigate={onNavigate}
      />
    </div>
  );
}

function LessonScreen({
  subject,
  level,
  topic,
  lesson,
  onBack,
  onNavigate,
}) {
  return (
    <div className="min-h-screen bg-surface text-on-surface">
      <PageHeader title={lesson.title} onBack={onBack} />

      <main className="px-4 pt-24 pb-24 space-y-6">
        <section className="bg-surface-container-low rounded-2xl p-5">
          <p className="text-sm text-primary font-semibold">
            {subject} · {level}
          </p>
          <h2 className="text-xl font-bold mt-2">{lesson.title}</h2>
          <p className="text-on-surface-variant mt-3">
            {lesson.introduction}
          </p>
        </section>

        {lesson.objectives?.length > 0 && (
          <section className="bg-surface-container-lowest rounded-xl p-5 shadow-sm">
            <h3 className="font-bold text-lg mb-3">
              Learning Objectives
            </h3>
            <ul className="list-disc pl-5 space-y-2">
              {lesson.objectives.map((objective, index) => (
                <li key={index}>{objective}</li>
              ))}
            </ul>
          </section>
        )}

        {lesson.sections?.map((section, index) => (
          <section
            key={index}
            className="bg-surface-container-lowest rounded-xl p-5 shadow-sm"
          >
            <h3 className="font-bold text-lg mb-3">
              {section.heading}
            </h3>
            <p className="whitespace-pre-wrap leading-7">
              {section.explanation}
            </p>
          </section>
        ))}

        {lesson.examples?.map((example, index) => (
          <section
            key={index}
            className="bg-surface-container-low rounded-xl p-5"
          >
            <h3 className="font-bold text-lg mb-3">Worked Example</h3>

            <p className="font-semibold">{example.question}</p>

            {example.solution?.length > 0 && (
              <ol className="list-decimal pl-5 mt-3 space-y-2">
                {example.solution.map((step, stepIndex) => (
                  <li key={stepIndex}>{step}</li>
                ))}
              </ol>
            )}

            {example.answer && (
              <p className="mt-4 font-bold text-primary">
                Answer: {example.answer}
              </p>
            )}
          </section>
        ))}

        <button
          onClick={onBack}
          className="w-full border border-outline-variant rounded-xl p-3 font-bold"
        >
          Back to Lessons
        </button>
      </main>

      <BottomNavigation
        activeScreen="subjects"
        onNavigate={onNavigate}
      />
    </div>
  );
}


function AdminDashboard({
  onBack,
  onContentSaved,
  onManageLessons,
  onManageQuestions,
  editingLesson,
  onFinishEditing,
}) {
  const availableSubjects = Object.keys(topics);

 const [subject, setSubject] = useState(availableSubjects[0] || "");
  const [level, setLevel] = useState("JHS 1");
  const [topicId, setTopicId] = useState("");
  const [title, setTitle] = useState("");
  const [introduction, setIntroduction] = useState("");
  const [objectives, setObjectives] = useState("");
  const [sectionHeading, setSectionHeading] = useState("");
  const [explanation, setExplanation] = useState("");
  const [exampleQuestion, setExampleQuestion] = useState("");
  const [exampleSolution, setExampleSolution] = useState("");
  const [exampleAnswer, setExampleAnswer] = useState("");
  const [published, setPublished] = useState(false);
  const [message, setMessage] = useState("");

  const availableTopics = topics[subject]?.[level] || [];

  useEffect(() => {
    if (!editingLesson) return;

    const { topicRecord, lesson } = editingLesson;

    setSubject(topicRecord.subject);
    setLevel(topicRecord.level);
    setTopicId(topicRecord.topicId);
    setTitle(lesson.title || "");
    setIntroduction(lesson.introduction || "");
    setObjectives((lesson.objectives || []).join("\n"));
    setSectionHeading(lesson.sections?.[0]?.heading || "");
    setExplanation(lesson.sections?.[0]?.explanation || "");
    setExampleQuestion(lesson.examples?.[0]?.question || "");
    setExampleSolution(
      (lesson.examples?.[0]?.solution || []).join("\n")
    );
    setExampleAnswer(lesson.examples?.[0]?.answer || "");
    setPublished(lesson.published === true);
    setMessage("");
  }, [editingLesson]);

  function handleSubmit(event) {
    event.preventDefault();
    setMessage("");

    if (!topicId || !title.trim() || !introduction.trim()) {
      setMessage("Please select a topic and enter the lesson title and introduction.");
      return;
    }

    const lesson = {
     id: editingLesson
  ? editingLesson.lesson.id
  : `lesson-${Date.now()}`,
      title: title.trim(),
      introduction: introduction.trim(),
      objectives: objectives
        .split("\n")
        .map((item) => item.trim())
        .filter(Boolean),
      sections: sectionHeading.trim() || explanation.trim()
        ? [{
            heading: sectionHeading.trim(),
            explanation: explanation.trim(),
          }]
        : [],
      examples: exampleQuestion.trim()
        ? [{
            question: exampleQuestion.trim(),
            solution: exampleSolution
              .split("\n")
              .map((item) => item.trim())
              .filter(Boolean),
            answer: exampleAnswer.trim(),
          }]
        : [],
      practiceQuestions: [],
      published,
      createdAt: new Date().toISOString(),
    };

    const topicRecordId = `${subject}-${level}-${topicId}`;

const saved = editingLesson
  ? updateLesson(topicRecordId, editingLesson.lesson.id, lesson)
  : addLesson(topicRecordId, lesson);

    if (!saved) {
      setMessage("The lesson could not be saved. Please try again.");
      return;
    }

   onContentSaved();

setMessage(
  editingLesson
    ? "Lesson updated successfully!"
    : published
      ? "Lesson published successfully!"
      : "Lesson saved as a draft successfully!"
);

if (editingLesson) {
  onFinishEditing();
}

    setTitle("");
    setIntroduction("");
    setObjectives("");
    setSectionHeading("");
    setExplanation("");
    setExampleQuestion("");
    setExampleSolution("");
    setExampleAnswer("");
    setPublished(false);
  }

  const inputClass =
    "w-full border border-outline-variant rounded-xl p-3 bg-surface text-on-surface focus:outline-none focus:border-primary";

  return (
    <div className="min-h-screen bg-surface text-on-surface">
      <PageHeader title="Admin Dashboard" onBack={onBack} />

      <main className="px-4 pt-24 pb-12 max-w-3xl mx-auto">
        
<button
  type="button"
  onClick={onManageLessons}
  className="mb-5 rounded-lg bg-slate-900 px-5 py-3 text-sm font-semibold text-white"
>
  Manage Existing Lessons
</button>

<button
  type="button"
  onClick={onManageQuestions}
  className="mb-5 ml-3 rounded-lg bg-blue-700 px-5 py-3 text-sm font-semibold text-white"
>
  Manage Questions
</button>
        <section className="bg-primary text-white rounded-2xl p-5 mb-6">
          <span className="material-symbols-outlined text-3xl">
            admin_panel_settings
          </span>

          <h2 className="text-2xl font-bold mt-2">
            Content Management
          </h2>

          <p className="text-sm mt-2 text-white/80">
            Create and publish learning materials for EduPrep Ghana students.
          </p>
        </section>

        <form
          onSubmit={handleSubmit}
          className="bg-surface-container-lowest rounded-2xl p-5 shadow-sm space-y-5"
        >
          <h3 className="text-lg font-bold">
            Create a New Lesson
          </h3>

          <div>
            <label className="block text-sm font-semibold mb-2">
              Subject
            </label>

            <select
              className={inputClass}
              value={subject}
              onChange={(event) => {
                setSubject(event.target.value);
                setTopicId("");
              }}
            >
              {availableSubjects.map((item) => (
                <option key={item} value={item}>
                  {item}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-semibold mb-2">
              Class Level
            </label>

            <select
              className={inputClass}
              value={level}
              onChange={(event) => {
                setLevel(event.target.value);
                setTopicId("");
              }}
            >
              {levels.map((item) => (
                <option key={item} value={item}>
                  {item}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-semibold mb-2">
              Topic
            </label>

            <select
              className={inputClass}
              value={topicId}
              onChange={(event) => setTopicId(event.target.value)}
              required
            >
              <option value="">Select a topic</option>

              {availableTopics.map((item) => (
                <option key={item.id} value={item.id}>
                  {item.title}
                </option>
              ))}
            </select>

            {availableTopics.length === 0 && (
              <p className="text-sm text-red-600 mt-2">
                No topics have been configured for this level yet.
              </p>
            )}
          </div>

          <div className="border-t border-outline-variant pt-5">
            <h3 className="font-bold mb-4">Lesson Information</h3>

            <label className="block text-sm font-semibold mb-2">
              Lesson Title
            </label>

            <input
              className={inputClass}
              value={title}
              onChange={(event) => setTitle(event.target.value)}
              placeholder="Enter lesson title"
              required
            />

            <label className="block text-sm font-semibold mt-4 mb-2">
              Introduction
            </label>

            <textarea
              className={inputClass}
              rows="4"
              value={introduction}
              onChange={(event) => setIntroduction(event.target.value)}
              placeholder="Introduce the lesson..."
              required
            />

            <label className="block text-sm font-semibold mt-4 mb-2">
              Learning Objectives
            </label>

            <textarea
              className={inputClass}
              rows="4"
              value={objectives}
              onChange={(event) => setObjectives(event.target.value)}
              placeholder={"Enter one objective per line"}
            />
          </div>

          <div className="border-t border-outline-variant pt-5">
            <h3 className="font-bold mb-4">Lesson Notes</h3>

            <label className="block text-sm font-semibold mb-2">
              Section Heading
            </label>

            <input
              className={inputClass}
              value={sectionHeading}
              onChange={(event) => setSectionHeading(event.target.value)}
              placeholder="e.g. Introduction to the topic"
            />

            <label className="block text-sm font-semibold mt-4 mb-2">
              Explanation
            </label>

            <textarea
              className={inputClass}
              rows="6"
              value={explanation}
              onChange={(event) => setExplanation(event.target.value)}
              placeholder="Write the lesson notes..."
            />
          </div>

          <div className="border-t border-outline-variant pt-5">
            <h3 className="font-bold mb-4">Worked Example (Optional)</h3>

            <label className="block text-sm font-semibold mb-2">
              Example Question
            </label>

            <textarea
              className={inputClass}
              rows="2"
              value={exampleQuestion}
              onChange={(event) => setExampleQuestion(event.target.value)}
              placeholder="Enter an example question"
            />

            <label className="block text-sm font-semibold mt-4 mb-2">
              Solution Steps
            </label>

            <textarea
              className={inputClass}
              rows="4"
              value={exampleSolution}
              onChange={(event) => setExampleSolution(event.target.value)}
              placeholder="Enter one solution step per line"
            />

            <label className="block text-sm font-semibold mt-4 mb-2">
              Final Answer
            </label>

            <input
              className={inputClass}
              value={exampleAnswer}
              onChange={(event) => setExampleAnswer(event.target.value)}
              placeholder="Enter the answer"
            />
          </div>

          <div className="border-t border-outline-variant pt-5">
            <label className="flex items-center gap-3">
              <input
                type="checkbox"
                checked={published}
                onChange={(event) => setPublished(event.target.checked)}
                className="w-5 h-5 accent-primary"
              />

              <span className="font-semibold">
                Publish this lesson immediately
              </span>
            </label>

            <p className="text-xs text-on-surface-variant mt-2">
              Unchecked lessons are saved as drafts and remain hidden from students.
            </p>
          </div>

          {message && (
            <div className="rounded-xl bg-surface-container-low p-3 text-sm">
              {message}
            </div>
          )}

          <div className="flex flex-col sm:flex-row gap-3">
            <button
              type="submit"
              className="flex-1 bg-primary text-white rounded-xl p-3 font-bold hover:opacity-90"
            >
              Save Lesson
            </button>

           {editingLesson && (
  <button
    type="button"
    onClick={() => {
      setTitle("");
      setIntroduction("");
      setObjectives("");
      setSectionHeading("");
      setExplanation("");
      setExampleQuestion("");
      setExampleSolution("");
      setExampleAnswer("");
      setPublished(false);
      setMessage("");
      onFinishEditing();
    }}
    className="flex-1 border border-red-300 text-red-600 rounded-xl p-3 font-bold"
  >
    Cancel Edit
  </button>
)}

<button
  type="button"
  onClick={onBack}
  className="flex-1 border border-outline-variant rounded-xl p-3 font-bold"
>
  Back to Home
</button>
          </div>
        </form>
      </main>
    </div>
  );
}


function ManageLessons({ content, onRefresh, onBack, onEditLesson }) {
  function handlePublishToggle(topicRecord, lesson) {
    const updated = updateLesson(
      topicRecord.id,
      lesson.id,
      { published: !lesson.published }
    );

    if (updated) {
      onRefresh();
    }
  }

  function handleDelete(topicRecord, lesson) {
    const confirmed = window.confirm(
      `Delete "${lesson.title}"? This action cannot be undone.`
    );

    if (!confirmed) return;

    const deleted = deleteLesson(
      topicRecord.id,
      lesson.id
    );

    if (deleted) {
      onRefresh();
    }
  }

  const lessonRecords = content.flatMap((topicRecord) =>
    (topicRecord.lessons || []).map((lesson) => ({
      topicRecord,
      lesson,
    }))
  );

  return (
    <div className="min-h-screen bg-slate-50 p-5 md:p-8">
      <div className="mx-auto max-w-5xl">

        <button
          onClick={onBack}
          className="mb-6 text-sm font-semibold text-blue-700"
        >
          ← Back to Admin Dashboard
        </button>

        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-900">
            Manage Lessons
          </h1>

          <p className="mt-2 text-slate-500">
            View, publish, unpublish and delete learning content.
          </p>
        </div>

        <div className="mb-6 rounded-xl bg-white p-5 shadow-sm">
          <p className="text-sm text-slate-500">
            Total lessons
          </p>

          <p className="mt-1 text-3xl font-bold text-blue-700">
            {lessonRecords.length}
          </p>
        </div>

        {lessonRecords.length === 0 ? (
          <div className="rounded-xl bg-white p-10 text-center shadow-sm">
            <h2 className="text-lg font-semibold text-slate-800">
              No lessons available
            </h2>

            <p className="mt-2 text-sm text-slate-500">
              Create a lesson first. It will appear here.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {lessonRecords.map(({ topicRecord, lesson }) => (
              <div
                key={`${topicRecord.id}-${lesson.id}`}
                className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm"
              >
                <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">

                  <div className="min-w-0">
                    <h2 className="text-lg font-bold text-slate-900">
                      {lesson.title}
                    </h2>

                    <p className="mt-1 text-sm text-slate-500">
                      {topicRecord.subject} · {topicRecord.level}
                    </p>

                    <p className="mt-1 text-sm text-slate-500">
                      Topic: {topicRecord.topicTitle}
                    </p>

                    <span
                      className={`mt-3 inline-block rounded-full px-3 py-1 text-xs font-semibold ${
                        lesson.published
                          ? "bg-green-100 text-green-700"
                          : "bg-amber-100 text-amber-700"
                      }`}
                    >
                      {lesson.published ? "Published" : "Draft"}
                    </span>
                  </div>

                  <div className="flex flex-wrap gap-2">
                   <div className="flex flex-wrap gap-2">
  <button
    type="button"
    onClick={() => onEditLesson(topicRecord, lesson)}
    className="rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-white"
  >
    Edit
  </button>

  <button
    type="button"
    onClick={() => handlePublishToggle(topicRecord, lesson)}
    className="rounded-lg bg-blue-700 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-800"
  >
    {lesson.published ? "Unpublish" : "Publish"}
  </button>
</div>

                    <button
                      onClick={() =>
                        handleDelete(topicRecord, lesson)
                      }
                      className="rounded-lg bg-red-100 px-4 py-2 text-sm font-semibold text-red-700 hover:bg-red-200"
                    >
                      Delete
                    </button>
                  </div>

                </div>
              </div>
            ))}
          </div>
        )}

      </div>
    </div>
  );
}function App() {



  const [activeScreen, setActiveScreen] = useState("home");
  const [selectedSubject, setSelectedSubject] = useState("");
  const [selectedLevel, setSelectedLevel] = useState("");
  const [selectedTopic, setSelectedTopic] = useState(null);
  const [selectedLesson, setSelectedLesson] = useState(null);
  const [content, setContent] = useState(() => getContent());
  const [showManageLessons, setShowManageLessons] = useState(false);
  const [showQuestionManagement, setShowQuestionManagement] = useState(false);
const [editingLesson, setEditingLesson] = useState(null);
const [showQuiz, setShowQuiz] = useState(false);
  function scrollToTop() {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function navigate(screen) {
    setActiveScreen(screen);
    setSelectedSubject("");
    setSelectedLevel("");
    setSelectedTopic(null);
    setSelectedLesson(null);
    scrollToTop();
  }

  function openSubject(subject) {
    setSelectedSubject(subject);
    setSelectedLevel("");
    setSelectedTopic(null);
    setSelectedLesson(null);
    scrollToTop();
  }

  function openLevel(level) {
    setSelectedLevel(level);
    setSelectedTopic(null);
    setSelectedLesson(null);
    scrollToTop();
  }

  function openTopic(topic) {
    setSelectedTopic(topic);
    setSelectedLesson(null);
    scrollToTop();
  }

  function openLesson(lesson) {
    setSelectedLesson(lesson);
    scrollToTop();
  }

  function backToSubjects() {
    setSelectedSubject("");
    setSelectedLevel("");
    setSelectedTopic(null);
    setSelectedLesson(null);
    setActiveScreen("subjects");
    scrollToTop();
  }

  function backToLevels() {
    setSelectedLevel("");
    setSelectedTopic(null);
    setSelectedLesson(null);
    scrollToTop();
  }

  function backToTopics() {
    setSelectedTopic(null);
    setSelectedLesson(null);
    scrollToTop();
  }

  function backToLessons() {
    setSelectedLesson(null);
    scrollToTop();
  }

  function handleContentSaved() {
  setContent(getContent());
}

if (showQuiz && selectedTopic && selectedLevel && selectedSubject) {
  return (
    <QuizEngine
      subject={selectedSubject}
      level={selectedLevel}
      topic={selectedTopic}
      onBack={() => setShowQuiz(false)}
    />
  );
}

  if (
    selectedLesson &&
    selectedTopic &&
    selectedLevel &&
    selectedSubject
  ) {
    return (
      <LessonScreen
        subject={selectedSubject}
        level={selectedLevel}
        topic={selectedTopic}
        lesson={selectedLesson}
        onBack={backToLessons}
        onNavigate={navigate}
      />
    );
  }

if (selectedTopic && selectedLevel && selectedSubject) {
  const topicRecord = content.find(
    (item) =>
      item.subject === selectedSubject &&
      item.level === selectedLevel &&
      item.topicId === selectedTopic.id
  );

  const publishedLessons = (topicRecord?.lessons || []).filter(
    (lesson) => lesson.published === true
  );

  return (
  <TopicStudyScreen
    subject={selectedSubject}
    level={selectedLevel}
    topic={selectedTopic}
    lessons={publishedLessons}
    onSelectLesson={openLesson}
    onBack={backToTopics}
    onNavigate={navigate}
    onStartQuiz={() => setShowQuiz(true)}
  />
);
}

  if (selectedLevel && selectedSubject) {
    return (
      <TopicsScreen
        subject={selectedSubject}
        level={selectedLevel}
        onSelectTopic={openTopic}
        onBack={backToLevels}
        onNavigate={navigate}
      />
    );
  }

  if (selectedSubject) {
    return (
      <LevelSelectionScreen
        subject={selectedSubject}
        onSelectLevel={openLevel}
        onBack={backToSubjects}
        onNavigate={navigate}
      />
    );
  }
if (showQuestionManagement) {
  return (
    <QuestionManagement
      onBack={() => setShowQuestionManagement(false)}
    />
  );
}
if (showManageLessons) {
  return (
    <ManageLessons
      content={content}
      onRefresh={handleContentSaved}
      onBack={() => setShowManageLessons(false)}
      onEditLesson={(topicRecord, lesson) => {
        setEditingLesson({ topicRecord, lesson });
        setShowManageLessons(false);
      }}
    />
  );
}

if (activeScreen === "admin") {
  return (
    <AdminDashboard
      onBack={() => navigate("home")}
      onContentSaved={handleContentSaved}
      onManageLessons={() => setShowManageLessons(true)}
      onManageQuestions={() => setShowQuestionManagement(true)}

      editingLesson={editingLesson}
      onFinishEditing={() => setEditingLesson(null)}
    />
  );
}

if (activeScreen === "home") {
  return (
    <>
      <StudentDashboard onNavigate={navigate} />

      <button
        onClick={() => navigate("admin")}
        className="fixed top-20 right-4 z-50 bg-primary text-white rounded-full px-4 py-2 shadow-lg text-sm font-semibold"
      >
        Admin
      </button>
    </>
  );
}

  if (activeScreen === "subjects") {
    return (
      <>
        <SubjectSelection onSelectSubject={openSubject} />

        <BottomNavigation
          activeScreen="subjects"
          onNavigate={navigate}
        />
      </>
    );
  }

  return (
    <SecondaryScreen
      screen={activeScreen}
      onNavigate={navigate}
    />
  );
}

export default App;
