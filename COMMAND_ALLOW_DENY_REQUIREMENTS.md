# Command Allow/Deny List Functionality Requirements

## Overview
This document outlines the requirements for implementing command allow/deny list functionality in the LLxprt codebase. The feature should extend the existing tool configuration system to also control which shell commands can be executed.

## Current State Analysis
Based on the codebase analysis, the system already supports:
- Tool configuration with `allowed` and `disabled` arrays in profiles
- Configuration persistence through ProfileManager
- Policy-based tool access control

However, there is no current support for restricting shell commands beyond tool-level controls.

## Requirements

### 1. Configuration Schema Extension
The profile configuration should support a new `allowedCommands` field alongside the existing tools configuration:

```json
{
  "name": "my-profile",
  "settings": {
    "defaultProvider": "gemini"
  },
  "ephemeralSettings": {
    "model": "gemini-2.5-pro"
  },
  "tools": {
    "allowed": ["run_shell_command", "read_file"],
    "disabled": ["write_file"]
  },
  "allowedCommands": ["ls -la", "npm install", "git status"]
}
```

### 2. Command Validation Logic
The system must validate shell commands against the configured allow list before execution:

1. **Command Matching**: Commands should be matched exactly or using pattern matching
2. **Security**: Prevent command injection and ensure all commands are properly escaped/validated
3. **Flexibility**: Support both exact command matches and pattern-based matching

### 3. Integration Points
The implementation should integrate with:
- Existing tool configuration system in ProfileManager
- Shell command execution flow in `run_shell_command` tool
- Policy engine for consistency with other access controls

### 4. Feature Requirements
#### Core Features:
- Support `allowedCommands` array in profile configuration
- Validate commands against configured allow list before execution
- Allow matching of specific commands or command patterns
- Support for wildcard or pattern matching in commands

#### Security Requirements:
- Prevent command injection attacks
- Validate all command parameters and arguments
- Log attempted denied commands for audit purposes

#### User Experience:
- Clear error messages when commands are denied
- Option to configure commands as "ask user" for approval
- Integration with existing policy system

### 5. Implementation Approach

#### A. Configuration Schema Updates
1. Extend the Profile type to include `allowedCommands` field
2. Update ProfileManager to handle command allow lists
3. Support both exact command matching and pattern-based matching

#### B. Command Validation System
1. Create a new validation service for shell commands
2. Integrate with existing tool execution flow in `run_shell_command` 
3. Implement proper command matching logic (exact vs pattern)
4. Handle edge cases like command arguments and escaping

#### C. Policy Engine Integration
1. Extend the policy system to handle command-specific rules
2. Support for command-based policy rules alongside tool-based rules
3. Maintain consistency with existing policy decision logic

### 6. Technical Considerations

#### Security:
- All commands must be properly escaped before execution
- No command injection vulnerabilities
- Support for parameterized command matching

#### Performance:
- Efficient command validation logic 
- Minimal impact on execution speed
- Caching of validation rules where appropriate

#### Extensibility:
- Support for future command-based policy features
- Consistent with existing configuration patterns
- Backward compatibility with existing profiles

### 7. Testing Requirements
1. Unit tests for command validation logic
2. Integration tests with profile configuration loading
3. Security tests to ensure no command injection
4. Test coverage for edge cases and patterns

### 8. User Documentation
1. Updated documentation for profile configuration format
2. Examples of allowedCommands usage
3. Security considerations for command filtering

### 9. Migration Considerations
1. Backward compatibility with existing profiles
2. Default behavior for profiles without allowedCommands
3. Clear migration path for users

## Acceptance Criteria
1. Profile configuration accepts `allowedCommands` field
2. Shell commands are validated against the allow list before execution
3. Users receive clear error messages for denied commands
4. Security vulnerabilities are addressed
5. Implementation is consistent with existing tool configuration patterns
6. No breaking changes to existing functionality

## Future Considerations
1. Pattern matching for commands (e.g., "npm install *")
2. Advanced policy rules with command parameters
3. Integration with existing policy engine for unified access control
4. Command approval workflows (similar to tool approval)