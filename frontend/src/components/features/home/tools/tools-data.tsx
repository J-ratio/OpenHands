import i18n from "../../../../i18n";

export type Tool = {
  id: string;
  title: string;
  image: string;
  description: string;
  linkedRepoRequired?: boolean;
};

export type ToolCategory = {
  category: string;
  tools: Tool[];
};

export const TOOL_CATEGORIES: ToolCategory[] = [
  {
    category: i18n.t("Documentation"),
    tools: [
      {
        id: "GENERATE_INTERFACE_DOCUMENTATION",
        title: i18n.t("Generate Interface Documentation"),
        image: "/img/interface-doc.svg",
        description: i18n.t(
          "Automatically generate detailed interface documentation for your codebase.",
        ),
      },
      {
        id: "GENERATE_CLASS_DIAGRAM",
        title: i18n.t("Generate Class Diagram"),
        image: "/img/class-diagram.svg",
        description: i18n.t(
          "Visualize class relationships and hierarchies in your project.",
        ),
        linkedRepoRequired: true,
      },
      {
        id: "GENERATE_ARCHITECTURE_DIAGRAM",
        title: i18n.t("Generate Architecture Diagram"),
        image: "/img/code-flow.svg",
        description: i18n.t("Quickly visualize your system's architecture."),
        linkedRepoRequired: true,
      },
      {
        id: "GENERATE_SEQUENCE_DIAGRAM",
        title: i18n.t("Generate Sequence Diagram"),
        image: "/img/sequence-diagram.svg",
        description: i18n.t(
          "Create sequence diagrams to illustrate object interactions over time.",
        ),
      },
    ],
  },
  {
    category: i18n.t("Ask/Explain"),
    tools: [
      {
        id: "ASK_AI_ABOUT_CODE",
        title: i18n.t("Ask AI about your code"),
        image: "/img/ask-ai.svg",
        description: i18n.t(
          "Get instant answers and insights about your codebase from AI.",
        ),
      },
      {
        id: "EXPLAIN_CODE_LINE_BY_LINE",
        title: i18n.t("Explain Code Line-by-Line"),
        image: "/img/explain-code.svg",
        description: i18n.t(
          "Receive detailed, line-by-line explanations for any code snippet.",
        ),
      },
      {
        id: "FIND_BUGS_ANOMALIES",
        title: i18n.t("Find Bugs / Anomalies"),
        image: "/img/find-bugs.svg",
        description: i18n.t(
          "Detect bugs, anomalies, and potential issues in your code automatically.",
        ),
      },
    ],
  },
  {
    category: i18n.t("Refactor"),
    tools: [
      {
        id: "ASK_AI_TO_REFACTOR",
        title: i18n.t("Ask AI to refactor your code"),
        image: "/img/refactor.svg",
        description: i18n.t(
          "Let AI suggest and apply code refactoring for better structure and readability.",
        ),
      },
      {
        id: "OPTIMIZE_CODE_PERFORMANCE",
        title: i18n.t("Optimize Code for Performance"),
        image: "/img/optimize.svg",
        description: i18n.t(
          "Improve your code's performance with AI-driven optimizations.",
        ),
      },
    ],
  },
  {
    category: i18n.t("Testing"),
    tools: [
      {
        id: "GENERATE_UNIT_TESTS",
        title: i18n.t("Generate Unit Tests"),
        image: "/img/unit-test.svg",
        description: i18n.t(
          "Automatically generate unit tests to ensure code correctness.",
        ),
      },
      {
        id: "GENERATE_INTEGRATION_TESTS",
        title: i18n.t("Generate Integration Tests"),
        image: "/img/integration-test.svg",
        description: i18n.t(
          "Create integration tests to verify your system's components work together.",
        ),
      },
      {
        id: "GENERATE_MOCK_DATA",
        title: i18n.t("Generate Mock Data"),
        image: "/img/mock-data.svg",
        description: i18n.t(
          "Easily generate mock data for testing and development purposes.",
        ),
      },
    ],
  },
];
