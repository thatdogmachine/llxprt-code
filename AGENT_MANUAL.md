# Driving the Agent System

This document explains how to initiate and manage tasks using the modular agent architecture. This architecture is designed to be robust, cost-effective, and resilient against common failure modes like premature work stoppage by using a dedicated Supervisor agent to drive the overall workflow.

---

## Core Architecture

The system is built on a three-tiered hierarchy of documents that must be referenced when initiating a task:

1.  **The Process Framework (`AGENT_FRAMEWORK.md`)**
    *   **Purpose:** The foundational "constitution" that defines the universal, non-negotiable rules for how the agent system operates, delegates, handles errors, and tracks progress. This is the **how** of the system.

2.  **The Agent Strategy (`AGENT_STRATEGY_DEFAULT.md`)**
    *   **Purpose:** The specific "game plan" that dictates which models to use (e.g., `glm`, `qwen`, `gemini`) and how they are orchestrated by the Supervisor. This strategy document can be modified or swapped to test different approaches without changing the core process.

3.  **The Task Requirements (e.g., `COMMAND_ALLOW_DENY_REQUIREMENTS.md`)**
    *   **Purpose:** A per-task document that defines *what* needs to be built. This is the specific goal for a given work session.

---

## How to Initiate or Resume a Task

To start or resume a task, you must provide a prompt that references all three architectural components. This ensures the agent system is properly configured with its rules, its strategy, and its goal.

### Invocation Prompt Template

Use the following template, replacing `@TASK_REQUIREMENTS_FILE` with the path to your specific requirements document.

```
Your core operating procedure is defined in @AGENT_FRAMEWORK.md.

For the current task, you will use the agent orchestration strategy defined in @AGENT_STRATEGY_DEFAULT.md.

Your task is to resume and complete the work outlined in @TASK_REQUIREMENTS_FILE. Please begin by assessing the current state of the code and continuing from the last known successful step.
```

### Example: Resuming the "Command Allow/Deny" Task

To continue the work on the command allow/deny list feature, you would use the following prompt:

```
Your core operating procedure is defined in @AGENT_FRAMEWORK.md.

For the current task, you will use the agent orchestration strategy defined in @AGENT_STRATEGY_DEFAULT.md.

Your task is to resume and complete the work outlined in @COMMAND_ALLOW_DENY_REQUIREMENTS.md. Please begin by assessing the current state of the code and continuing from the last known successful step.
```
