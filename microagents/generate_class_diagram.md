---
name: class_diagram
version: 1.0.0
author: openhands
agent: CodeActAgent
triggers:
  - /class_diagram
inputs:
  - name: CLASS_NAME
    description: "The name of the class to generate a diagram for"
  - name: BRANCH_NAME
    description: "The branch to use for context"
---

Generate mermaid class diagram code for the class named "{{ CLASS_NAME }}".
The diagram should include:

- All properties with their access modifiers and data types
- All methods with their parameters, return types, and access modifiers
- Relationships with other classes (such as inheritance, composition, aggregation, associations)
- Any interfaces it implements
- Abstract or static modifiers, if any
  Leave out any standard library classes from relationships.
  Set the following config value for mermaid code.

---

    config:
        class:
            hideEmptyMembersBox: true

---

The context is from the repository at branch "{{ BRANCH_NAME }}".
