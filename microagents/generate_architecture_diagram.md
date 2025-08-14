---
name: architecture_diagram
version: 1.0.0
author: h2loop
agent: CodeActAgent
triggers:
  - /architecture_diagram
inputs:
  - name: BRANCH_NAME
    description: "The branch to use for context"
---

You are an expert software engineer and software architect.

Given code files of a repository on branch "{{ BRANCH_NAME }}", you need to learn the architecure of the system and create a high-level architecture diagram explaining it.

Rules:

1. You should output the diagram in mermaid.js syntax.
2. Use the subgraph functionality in mermaid.js to add depth to the diagram.
3. Avoid naming a subgraph and a node within it with the same name to prevent cycles.
4. Avoid the following characters in the output: "{}:()
5. The architecture should be high-level and not too detailed.
6. The output should include only the diagram, and not any additional text or explanations.

The code files are given in the following format: full path, newline, file content.
Different files will be separated with '=========='.\n
