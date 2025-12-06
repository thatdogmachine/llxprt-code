// Simple test to see if allowlist command works in isolation
import { allowlistCommand } from './packages/cli/dist/src/ui/commands/allowlistCommand.js';

// Mock context
const mockContext = {
  session: {
    sessionShellAllowlist: new Set(['ls', 'pwd', 'echo hello'])
  }
};

async function testAllowlist() {
  try {
    console.log('Testing allowlist command with mock context...');
    
    const result = await allowlistCommand.action(mockContext);
    console.log('Result:', JSON.stringify(result, null, 2));
    
    if (result.type === 'message') {
      console.log('Content:', result.content);
    }
  } catch (error) {
    console.error('Error running allowlist command:', error);
  }
}

testAllowlist();