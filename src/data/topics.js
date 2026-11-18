
function createMathematicsTopics() {
  return [
    {
      id: "number",
      title: "Number",
      description: "Explore numbers, operations and numerical relationships.",
      icon: "calculate",
      lessons: [],
    },
    {
      id: "algebra",
      title: "Algebra",
      description: "Understand expressions, equations and relationships.",
      icon: "functions",
      lessons: [],
    },
    {
      id: "geometry",
      title: "Geometry and Measurement",
      description: "Explore shapes, space, measurement and geometric relationships.",
      icon: "architecture",
      lessons: [],
    },
    {
      id: "data",
      title: "Handling Data",
      description: "Collect, organise, represent and interpret data.",
      icon: "bar_chart",
      lessons: [],
    },
  ];
}

export const topics = {
  "Core Mathematics": {
    "JHS 1": createMathematicsTopics(),
    "JHS 2": createMathematicsTopics(),
    "JHS 3": createMathematicsTopics(),
    "SHS 1": createMathematicsTopics(),
    "SHS 2": createMathematicsTopics(),
    "SHS 3": createMathematicsTopics(),
  },
};
