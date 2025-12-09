# Agent Supervisor Workflow & Escalation Protocol

This document outlines the agreed-upon strategy for leveraging a multi-agent system to balance development velocity, cost, and quality, in alignment with the principles in `how-i-will-complete-the-work-and-not-fuck-up-in-future.txt`.

### Core Principle
This workflow is deliberately designed to **prioritize the conservation of Gemini tokens** over achieving the absolute fastest execution time. The performance and thresholds of the local correction loop will be logged and are subject to future review.

---

### 1. Agent Roles

*   **Supervisor:** `glm-4.5-air-mlx`
    *   **Responsibility:** Manages the overall process, breaks down tasks, delegates to subagents, detects loops/stalls, and manages the escalation path. Does not write or review implementation code itself.

*   **Draft Coder:** `qwen3-coder-30b`
    *   **Responsibility:** Provides an initial, rapid generation of code for a given task.

*   **Implementation & Correction Agent:** `glm-4.5-air-mlx` (Subagent)
    *   **Responsibility:** Receives draft code, performs validation (linting, syntax checks), and attempts to implement, test, and correct the code to meet requirements.

*   **Expert Reviewer:** `gemini-2-5-pro`
    *   **Responsibility:** Acts as a "last resort" expert, engaged only upon escalation from the Supervisor when local agents are confirmed to be stuck.

---

### 2. Workflow & Local Correction Loop

1.  **Task Delegation:** The Supervisor delegates a coding task to `qwen`.
2.  **Implementation Attempt:** The Supervisor passes the `qwen`-generated code to a `glm` subagent.
3.  **Validation & Correction:** The `glm` subagent first runs fail-fast checks (e.g., linting). It then enters a correction loop, attempting to integrate the code, run tests, and fix any errors it finds.

---

### 3. Definition of "Stuck" (Escalation Trigger)

The Supervisor will consider the `glm` subagent "stuck" and initiate escalation to Gemini if the subagent reports failure after meeting one or more of the following conditions:

*   **High Attempt Count:** The subagent fails to produce a valid, passing result after a specified number of iterations (initial setting: **10-15 attempts**). This process must be logged for later review and tuning.
*   **Error Repetition:** The same build or test error occurs on consecutive attempts.
*   **Stagnation:** The subagent's code modifications cease to show meaningful progress toward the goal.
*   **Low Confidence:** The subagent consistently reports a low confidence score in its ability to solve the task.

---

### 4. Gemini Escalation Protocol

1.  When the "stuck" condition is met, the Supervisor compiles a "dossier" for Gemini.
2.  This dossier **must** include:
    *   The original high-level requirement.
    *   The initial code from `qwen`.
    *   The final code attempt from the `glm` subagent.
    *   The specific error log or test failure that could not be resolved.
3.  The Supervisor passes this dossier to `gemini-2-5-pro` for expert review and a suggested solution.
4.  The feedback from Gemini is then passed back to a `glm` subagent to re-attempt the implementation.
