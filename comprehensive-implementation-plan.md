# Comprehensive Implementation Plan for Command Allow/Deny List Functionality

## Overview
This document outlines a complete implementation plan for adding command allow/deny list functionality to the LLxprt codebase, as specified in COMMAND_ALLOW_DENY_REQUIREMENTS.md.

## Current Architecture Analysis

### 1. Profile System
- **Profile Interface**: Located in `/packages/core/src/types/modelParams.ts`
  ```typescript
  export interface Profile {
    version: 1;
    provider: string;
    model: string;
    modelParams: ModelParams;
    ephemeralSettings: EphemeralSettings;
  }
  ```

- **ProfileManager**: Located in `/packages/core/src/config/profileManager.ts` 
  - Handles persistence in `~/.llxprt/profiles/<profileName>.json`
  - Current tool configuration uses `'tools.allowed'` and `'tools.disabled'` arrays

### 2. Shell Command Execution
- **Shell Tool**: Located in `/packages/core/src/tools/shell.ts`
  - Contains `execute` method that performs actual shell command execution
  - Uses `spawnSync` from child_process for command execution

## Implementation Approach

### Phase 1: Configuration Schema Extension

#### 1. Extend Profile Interface
**File**: `/packages/core/src/types/modelParams.ts`

Add `allowedCommands` field to the `Profile` interface:
```typescript
export interface Profile {
  version: 1;
  provider: string;
  model: string;
  modelParams: ModelParams;
  ephemeralSettings: EphemeralSettings;
  // Add this new field
  allowedCommands?: string[];
}
```

#### 2. Update ProfileManager
**File**: `/packages/core/src/config/profileManager.ts`

Modify the `save` method to handle the new field:
```typescript
// In the save method, ensure allowedCommands is properly serialized
const profileToSave = {
  ...profile,
  // Ensure allowedCommands is included in the saved profile
};
```

### Phase 2: Command Validation System

#### 1. Create Command Validator Service
**File**: `/packages/core/src/tools/command-validator.ts` (New file)

```typescript
export class CommandValidator {
  /**
   * Validates if a command is allowed based on the profile configuration
   * @param command The command to validate
   * @param allowedCommands List of allowed commands from profile
   * @returns boolean indicating if command is allowed
   */
  static validateCommand(command: string, allowedCommands?: string[]): boolean {
    // If no allowed commands specified, default to allowing all commands
    if (!allowedCommands || allowedCommands.length === 0) {
      return true;
    }
    
    // Exact match validation
    if (allowedCommands.includes(command)) {
      return true;
    }
    
    // Pattern matching support (basic implementation)
    for (const allowedCommand of allowedCommands) {
      if (this.isPatternMatch(command, allowedCommand)) {
        return true;
      }
    }
    
    return false;
  }
  
  /**
   * Basic pattern matching implementation
   * @param command The command to check
   * @param pattern The allowed command pattern
   * @returns boolean indicating if command matches pattern
   */
  private static isPatternMatch(command: string, pattern: string): boolean {
    // Simple wildcard matching - allow commands like "npm install *"
    if (pattern.includes('*')) {
      const regexPattern = pattern.replace(/\*/g, '.*');
      return new RegExp(`^${regexPattern}$`).test(command);
    }
    
    // Default to exact match
    return false;
  }
}
```

#### 2. Integrate with Shell Tool
**File**: `/packages/core/src/tools/shell.ts`

Modify the `execute` method to validate commands before execution:

```typescript
// At the beginning of execute method, add validation logic
const config = Config.getInstance();
const profile = config.getProfile();

// Validate command against allowedCommands
if (profile && profile.allowedCommands) {
  const isValid = CommandValidator.validateCommand(command, profile.allowedCommands);
  
  if (!isValid) {
    // Log the denied command
    console.warn(`Command denied by profile: ${command}`);
    
    // Throw an error with clear message
    throw new Error(`Command execution denied: ${command}. This command is not allowed in the current profile.`);
  }
}
```

### Phase 3: Security Enhancements

#### 1. Command Sanitization
Add command sanitization to prevent injection attacks:

**File**: `/packages/core/src/tools/command-validator.ts` (Add to existing file)

```typescript
/**
 * Sanitizes a command string to prevent injection attacks
 * @param command The command to sanitize
 * @returns Sanitized command string
 */
static sanitizeCommand(command: string): string {
  // Remove potentially dangerous characters or patterns
  // This is a basic implementation - could be expanded based on needs
  return command.replace(/[\r\n]/g, ' ').trim();
}
```

#### 2. Enhanced Validation Integration
Update shell.ts to use sanitization:

```typescript
// In execute method, sanitize command before validation
const sanitizedCommand = CommandValidator.sanitizeCommand(command);
// Use sanitizedCommand for validation instead of raw command
const isValid = CommandValidator.validateCommand(sanitizedCommand, profile.allowedCommands);
```

### Phase 4: Testing Requirements

#### 1. Unit Tests for Command Validator
**File**: `/packages/core/src/tools/command-validator.test.ts` (New file)

```typescript
import { CommandValidator } from './command-validator';

describe('CommandValidator', () => {
  test('should allow commands when no allowedCommands specified', () => {
    expect(CommandValidator.validateCommand('ls -la', undefined)).toBe(true);
  });

  test('should allow exact command matches', () => {
    expect(CommandValidator.validateCommand('ls -la', ['ls -la'])).toBe(true);
  });

  test('should deny commands not in allowed list', () => {
    expect(CommandValidator.validateCommand('rm -rf /', ['ls -la'])).toBe(false);
  });

  test('should support wildcard patterns', () => {
    expect(CommandValidator.validateCommand('npm install express', ['npm install *'])).toBe(true);
  });
});
```

#### 2. Integration Tests
Add tests to existing shell test files to verify command validation works in context.

### Phase 5: Documentation Updates

#### 1. Update Configuration Documentation
**File**: `/docs/cli/configuration.md` (Add section about allowedCommands)

```markdown
### Command Allow List

The `allowedCommands` field in profiles allows restricting which shell commands can be executed:

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

This feature provides an additional layer of security for shell command execution.
```

## Backward Compatibility Considerations

1. The `allowedCommands` field is optional (`?`) to maintain backward compatibility
2. When not specified, all commands will be allowed (existing behavior)
3. Profiles without `allowedCommands` will continue to work as before

## Security Considerations

1. All commands are sanitized to prevent injection attacks
2. Commands are validated before execution to prevent unauthorized access
3. Denied commands are logged for audit purposes
4. Clear error messages inform users when commands are denied

## Future Extensibility

1. Pattern matching can be enhanced to support more complex patterns
2. Command parameters can be validated in future iterations
3. Integration with existing policy engine can be expanded
4. Approval workflows for commands can be added

## Implementation Timeline

1. **Week 1**: Configuration schema extension and basic validation
2. **Week 2**: Security enhancements and testing
3. **Week 3**: Documentation updates and integration testing
4. **Week 4**: Final review and refinement

This implementation plan addresses all requirements from COMMAND_ALLOW_DENY_REQUIREMENTS.md while maintaining backward compatibility and following existing code patterns in the LLxprt codebase.