// Debug script to understand why allowlist implementation appears useless

// Test 1: Check shell command execution and allowlist behavior
console.log('=== Debugging Allowlist Implementation ===\n');

// Test 2: Create mock context and check allowlist access
const mockContext = {
  session: {
    sessionShellAllowlist: new Set(['ls', 'pwd', 'echo hello'])
  }
};

console.log('1. Mock context created with allowlist:', 
Array.from(mockContext.session.sessionShellAllowlist));

// Test 3: Check the allowlist command behavior
const { allowlistCommand } = require('./packages/cli/src/ui/commands/allowlistCommand.ts');

async function testAllowlistCommand() {
  console.log('\n2. Testing allowlist command execution...');
  
  try {
    const result = await allowlistCommand.action(mockContext);
    console.log('Result:', JSON.stringify(result, null, 2));
  } catch (error) {
    console.error('Error running allowlist command:', error);
  }
}

testAllowlistCommand();

// Test 4: Check shell tool instantiation and allowlist usage
console.log('\n3. Testing shell tool behavior...');
const { ShellTool } = require('./packages/core/src/tools/shell.ts');

// This would be how the shell tool is used in the app:
const config = {
  getTargetDir: () => '/tmp',
  getDebugMode: () => false,
  getShouldUseNodePtyShell: () => false,
  getSummarizeToolOutputConfig: () => null,
  getContentGeneratorConfig: () => null,
  getGeminiClient: () => null
};

const shellTool = new ShellTool(config);
console.log('ShellTool created successfully');

// Check if the tool has an allowlist property
console.log('Shell tool allowlist property exists:', shellTool.allowlist !== undefined);
if (shellTool.allowlist) {
  console.log('Initial allowlist size:', shellTool.allowlist.size);
}

// Test 5: Simulate adding a command to allowlist
console.log('\n4. Testing allowing commands...');
const testCommand = 'ls';
shellTool.allowlist.add(testCommand);
console.log('After adding "ls", allowlist size:', shellTool.allowlist.size);

// Test 6: Check the session reducer behavior
console.log('\n5. Testing session reducer actions...');
const { sessionReducer } = require('./packages/cli/src/ui/reducers/sessionReducer.ts');

const initialState = {
  sessionShellAllowlist: new Set(['ls', 'pwd'])
};

console.log('Initial state allowlist size:', initialState.sessionShellAllowlist.size);
console.log('Commands in initial state:', [...initialState.sessionShellAllowlist]);

// Simulate adding to allowlist
const addAction = { type: 'ADD_TO_SHELL_ALLOWLIST', payload: 'test-command' };
const newAllowlist = new Set(initialState.sessionShellAllowlist);
newAllowlist.add(addAction.payload);

const newState = { ...initialState, sessionShellAllowlist: newAllowlist };

console.log('After adding "test-command", new allowlist size:', newState.sessionShellAllowlist.size);
console.log('Contains "test-command":', newState.sessionShellAllowlist.has('test-command'));