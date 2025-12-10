# Shell Command Access Control Requirements

## Overview
This document outlines the requirements for implementing shell command access control functionality in the LLxprt codebase. The feature extends the existing tool configuration system to provide granular control over which shell commands can be executed, including the ability to bypass confirmation prompts for identified commands.

## Current State Analysis
Based on the codebase analysis, the system already supports:
- Tool configuration with `allowed` and `disabled` arrays in profiles
- Configuration persistence through ProfileManager
- Policy-based tool access control
- Command validation and execution mechanisms
- Confirmation prompt systems for shell commands

However, there was no current support for restricting shell commands at the command level beyond tool-level controls, and no mechanism to bypass confirmation prompts for specific permitted commands.

## Requirements

### 1. Configuration Schema Extension
The profile configuration should support new `permittedShellCommands` and `forbiddenShellCommands` fields alongside the existing tools configuration:

```json
{
  "version": 1,
  "provider": "openai",
  "model": "qwen/qwen3-coder-30b",
  "modelParams": {},
  "ephemeralSettings": {
    "auth-key": "not-needed",
    "base-url": "http://localhost:1234/v1"
  },
  "permittedShellCommands": ["ls -la", "npm install", "git status"],
  "forbiddenShellCommands": ["rm -rf /", "sudo shutdown"]
}
```

### 2. Command Processing Logic
The system should process shell commands according to these rules:

1. **Forbidden Commands**: If `forbiddenShellCommands` is configured and a command matches any entry, execution is blocked entirely with a clear error message
2. **Permitted Commands**: If `permittedShellCommands` is configured and a command matches an entry, confirmation prompts are bypassed for that command
3. **Default Behavior**: If neither list is configured or empty, all commands behave as normal (with confirmation prompts)

### 3. Integration with Shell Tool
The feature must integrate with the existing ShellTool to:
- Check commands against both permitted and forbidden lists before execution
- Suppress confirmation prompts for commands in the permitted list
- Block execution entirely for commands in the forbidden list with clear error messages
- Provide clear error messages when commands are not permitted
- Maintain compatibility with existing tool configuration systems

### 3. Confirmation Prompt bypass
The primary purpose of this feature is to enable **confirmation prompt bypass** for identified permitted commands:

- Commands that are in the `permittedShellCommands` list should NOT trigger confirmation prompts
- Commands that are NOT in the `permittedShellCommands` list should still trigger confirmation prompts (for security)
- Commands that are in the `forbiddenShellCommands` list should be blocked entirely with error message

### 4. Integration with Shell Tool
The feature must integrate with the existing ShellTool to:
- Check commands against both permitted and forbidden lists before execution
- Suppress confirmation prompts for commands in the permitted list
- Block execution entirely for commands in the forbidden list with clear error messages
- Provide clear error messages when commands are not permitted
- Maintain compatibility with existing tool configuration systems

### 5. Error Handling and User Experience
When a command is not permitted:
- Show clear error message indicating the command was not permitted
- Provide context about why the command failed (e.g., "Command 'ls -la' is not permitted by the current profile configuration.")
- When a command is forbidden:
  - Show clear error message indicating the command was forbidden (e.g., "Command 'rm -rf /' is forbidden by the current profile configuration.")
- Maintain existing behavior for commands that are permitted (they should execute normally, without confirmation prompts)

### 6. Backward Compatibility
- The feature should not break existing profiles that don't specify `permittedShellCommands` or `forbiddenShellCommands`
- Default behavior should remain the same (all commands allowed when no lists are configured)
- Existing tool configuration systems should continue to work

### 7. Testing Requirements
The implementation must include comprehensive testing covering:
- Commands that are permitted (should execute without confirmation prompts)
- Commands that are forbidden (should be blocked with error messages)
- Commands that are not permitted but not forbidden (should show confirmation prompts for security)
- Empty or missing `permittedShellCommands` and `forbiddenShellCommands` (should allow all commands with confirmation prompts)
- Various command formats and arguments

## Implementation Details

### Configuration Field
The `permittedShellCommands` and `forbiddenShellCommands` fields should be added to the Profile interface in `modelParams.ts`:
```typescript
export interface Profile {
  /** Profile format version */
  version: 1;
  /** Provider name */
  provider: string;
  /** Model name */
  model: string;
  /** Model parameters */
  modelParams: ModelParams;
  /** Ephemeral settings */
  ephemeralSettings: EphemeralSettings;
  
  /** 
   * Array of permitted shell commands
   * When provided, only these commands will be executed.
   * If not provided or empty, all commands are allowed (default behavior)
   * Commands in this list will bypass confirmation prompts
   */
  permittedShellCommands?: string[];
  
  /** 
   * Array of forbidden shell commands
   * When provided, these commands will be blocked entirely.
   * If not provided or empty, no commands are forbidden (default behavior)
   */
  forbiddenShellCommands?: string[];
}
```

### Validation Process
1. When ShellTool executes a command, it should check the profile configuration for both lists:
2. If `forbiddenShellCommands` is configured and command is in that list, block immediately with error message
3. If `permittedShellCommands` is configured and command is in that list, suppress confirmation prompts
4. If command is not in the permitted list but not forbidden, allow normal confirmation prompt behavior for security
5. If command is permitted or no lists exist, allow execution to proceed

### Error Message Format
Error messages should be clear and actionable:
```
Command 'command-name' is not permitted by the current profile configuration.
```

```
Command 'command-name' is forbidden by the current profile configuration.
```

## Usage Examples

### Example 1: Allow All Commands (Default Behavior)
```json
{
  "version": 1,
  "provider": "openai",
  "model": "qwen/qwen3-coder-30b",
  "modelParams": {},
  "ephemeralSettings": {
    "auth-key": "not-needed",
    "base-url": "http://localhost:1234/v1"
  }
}
```
All commands will be executed with confirmation prompts (default behavior).

### Example 2: Restrict to Specific Commands and Suppress Prompts
```json
{
  "version": 1,
  "provider": "openai",
  "model": "qwen/qwen3-coder-30b",
  "modelParams": {},
  "ephemeralSettings": {
    "auth-key": "not-needed",
    "base-url": "http://localhost:1234/v1"
  },
  "permittedShellCommands": ["ls -la", "npm install", "git status"],
  "forbiddenShellCommands": ["rm -rf /", "sudo shutdown"]
}
```
- `ls -la`, `npm install`, and `git status` will execute without confirmation prompts
- `rm -rf /` and `sudo shutdown` will be blocked entirely with error messages
- Other commands will still show confirmation prompts for security

### Example 3: Empty Lists (Allow All with Prompts)
```json
{
  "version": 1,
  "provider": "openai",
  "model": "qwen/qwen3-coder-30b",
  "modelParams": {},
  "ephemeralSettings": {
    "auth-key": "not-needed",
    "base-url": "http://localhost:1234/v1"
  },
  "permittedShellCommands": [],
  "forbiddenShellCommands": []
}
```
All commands will be executed with confirmation prompts (default behavior).

## Feature Limitations
- The `permittedShellCommands` and `forbiddenShellCommands` features only control shell command execution and confirmation bypass, not general tool access
- The forbidden commands list provides absolute blocking capability while permitted commands provide confirmation bypass
- Error messages should be clear and actionable for users

## Security Considerations
- The feature provides additional security by restricting what shell commands can be executed
- It should not be the sole security mechanism - other access controls remain in place
- Users must understand that this is an additional layer of control that enables automation workflows while maintaining security for unknown commands
- Forbidden commands are blocked entirely regardless of confirmation prompts
- Commands in the permitted list are still subject to validation and error handling

## Testing Strategy
The implementation should include:
1. Unit tests for command validation logic with both permitted and forbidden lists
2. Integration tests for shell tool execution with various configurations
3. Edge case testing (empty lists, null values, etc.)
4. Backward compatibility tests with existing profiles
5. Confirmation prompt bypass testing for permitted vs non-permitted commands
6. Forbidden command blocking tests with appropriate error messages