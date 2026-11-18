
import { topics } from "./topics";

const STORAGE_KEY = "eduprep_content_v1";

// Create the initial content structure from topics.js
function createInitialContent() {
  const content = [];

  Object.entries(topics).forEach(([subjectName, levels]) => {
    Object.entries(levels).forEach(([levelName, levelTopics]) => {
      levelTopics.forEach((topic) => {
        content.push({
          id: `${subjectName}-${levelName}-${topic.id}`,
          subject: subjectName,
          level: levelName,
          topicId: topic.id,
          topicTitle: topic.title,
          description: topic.description,
          lessons: topic.lessons || [],
        });
      });
    });
  });

  return content;
}

// Get all saved content
export function getContent() {
  try {
    const savedContent = localStorage.getItem(STORAGE_KEY);

    if (savedContent) {
      return JSON.parse(savedContent);
    }

    const initialContent = createInitialContent();
    saveContent(initialContent);

    return initialContent;
  } catch (error) {
    console.error("Could not load EduPrep content:", error);
    return createInitialContent();
  }
}

// Save all content
export function saveContent(content) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(content));
    return true;
  } catch (error) {
    console.error("Could not save EduPrep content:", error);
    return false;
  }
}

// Add a lesson to a topic
export function addLesson(topicRecordId, lesson) {
  const content = getContent();

  const updatedContent = content.map((item) => {
    if (item.id === topicRecordId) {
      return {
        ...item,
        lessons: [...item.lessons, lesson],
      };
    }

    return item;
  });

  return saveContent(updatedContent);
}

// Update an existing lesson
export function updateLesson(topicRecordId, lessonId, updatedLesson) {
  const content = getContent();

  const updatedContent = content.map((item) => {
    if (item.id === topicRecordId) {
      return {
        ...item,
        lessons: item.lessons.map((lesson) =>
          lesson.id === lessonId
            ? { ...lesson, ...updatedLesson }
            : lesson
        ),
      };
    }

    return item;
  });

  return saveContent(updatedContent);
}

// Delete a lesson
export function deleteLesson(topicRecordId, lessonId) {
  const content = getContent();

  const updatedContent = content.map((item) => {
    if (item.id === topicRecordId) {
      return {
        ...item,
        lessons: item.lessons.filter(
          (lesson) => lesson.id !== lessonId
        ),
      };
    }

    return item;
  });

  return saveContent(updatedContent);
}
