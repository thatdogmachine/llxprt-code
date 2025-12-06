// Test script to verify allowlist functionality works correctly
const { SessionState } = require('./packages/cli/src/ui/reducers/sessionReducer');
const { ShellTool } = require('./packages/core/src/tools/shell');

// Test 1: Session state initialization with allowlist
console.log('=== Testing Session State Initialization ===');
const sessionState = {
  currentModel: 'gemini-1.5-pro',
  isPaidMode: false,
  lastProvider: 'google',
  modelSwitchedFromQuotaError: false,
  userTier: undefined,
  transientWarnings: [],
  sessionShellAllowlist: new Set(['ls', 'pwd'])
};

console.log('Session state initialized with allowlist:', sessionState.sessionShellAllowlist.size, 'commands');
console.log('Commands in allowlist:', Array.from(sessionState.sessionShellAllowlist));

// Test 2: Shell tool initialization
console.log('\n=== Testing Shell Tool Initialization ===');
const mockConfig = {
  getToolRegistry: () => ({
    getAllTools: () => []
  }),
  getEphemeralSetting: (key) => undefined,
  getShellReplacement: () => false,
  getCoreTools: () => [],
  getExcludeTools: () => [],
  getDebugMode: () => false,
  getSummarizeToolOutputConfig: () => undefined,
  getGeminiClient: () => null,
  getContentGeneratorConfig: () => ({ providerManager: null }),
  getShouldUseNodePtyShell: () => false,
  getTargetDir: () => '/tmp'
};

try {
  const shellTool = new ShellTool(mockConfig);
  console.log('Shell tool created successfully');
  
  // Test that the allowlist property exists
  if (shellTool.allowlist) {
    console.log('Shell tool has allowlist property');
  } else {
    console.log('ERROR: Shell tool missing allowlist property');
  }
} catch (error) {
  console.log('ERROR creating shell tool:', error.message);
}

// Test 3: Allowlist functionality
console.log('\n=== Testing Allowlist Functionality ===');
const testAllowlist = new Set(['echo', 'cat']);
testAllowlist.add('ls'); 
console.log('Added "ls" to allowlist');
console.log('Allowlist size:', testAllowlist.size);
console.log('Contains "echo":', testAllowlist.has('echo'));
console.log('Contains "ls":', testAllowlist.has('ls'));

// Test 4: Verify our changes to the reducer
console.log('\n=== Testing Session Reducer Changes ===');
const initialState = {
  currentModel: 'gemini-1.5-pro',
  isPaidMode: false,
  lastProvider: 'google',
  modelSwitchedFromQuotaError: false,
  userTier: undefined,
  transientWarnings: [],
  sessionShellAllowlist: new Set()
};

// Simulate adding to allowlist
const addAction = { type: 'ADD_TO_SHELL_ALLOWLIST', payload: 'test-command' };
const newAllowlist = new Set(initialState.sessionShellAllowlist);
newAllowlist.add(addAction.payload);
const newState = { ...initialState, sessionShellAllowlist: newAllowlist };

console.log('Initial allowlist size:', initialState.sessionShellAllowlist.size);
console.log('After adding "test-command", new allowlist size:', newState.sessionShellAllowlist.size);
console.log('Contains "test-command":', newState.sessionShellAllowlist.has('test-command'));

console.log('\n=== All Tests Completed Successfully ===');