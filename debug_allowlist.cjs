// Debug script to understand why allowlist implementation appears useless
const { createMockCommandContext } = require('./packages/cli/src/test-utils/mockCommandContext.ts');
const { allowlistCommand } = require('./packages/cli/src/ui/commands/allowlistCommand.ts');

async function debugAllowlist() {
  console.log('=== Debugging Allowlist Implementation ===\n');
  
  // Create a mock context with some commands in the allowlist
  const mockContext = createMockCommandContext({
    session: {
      sessionShellAllowlist: new Set(['ls', 'pwd', 'echo hello'])
    }
  });
  
  console.log('1. Mock context created with allowlist:', 
    Array.from(mockContext.session.sessionShellAllowlist)
  );
  
  try {
    console.log('\n2. Testing allowlist command execution...');
    
    const result = await allowlistCommand.action(mockContext);
    console.log('Result type:', result.type);
    
    if (result.type === 'message') {
      console.log('3. Message content:');
      console.log(result.content);
    }
    
    // Test with empty allowlist
    console.log('\n4. Testing with empty allowlist...');
    const emptyContext = createMockCommandContext({
      session: {
        sessionShellAllowlist: new Set()
      }
    });
    
    const emptyResult = await allowlistCommand.action(emptyContext);
    console.log('Empty list result type:', emptyResult.type);
    
    if (emptyResult.type === 'message') {
      console.log('Empty list message:');
      console.log(emptyResult.content);
    }
    
  } catch (error) {
    console.error('Error running allowlist command:', error);
    console.error('Stack:', error.stack);
  }
  
  // Test the underlying mechanism in shell processor
  console.log('\n5. Testing shell permission checking...');
  
  try {
    const { checkCommandPermissions } = require('@vybestack/llxprt-code-core');
    
    // Test with a command that should be allowed
    const config = {
      getApprovalMode: () => 'STRICT' // or 'YOLO'
    };
    
    const result = checkCommandPermissions('ls', config, mockContext.session.sessionShellAllowlist);
    console.log('Check result for "ls":', result);
    
    // Test with a command that should NOT be allowed
    const result2 = checkCommandPermissions('rm -rf /', config, mockContext.session.sessionShellAllowlist);
    console.log('Check result for "rm -rf /":', result2);
    
  } catch (error) {
    console.error('Error testing shell permissions:', error.message);
  }
  
  // Show the allowlist command logic in detail
  console.log('\n6. Allowlist command source logic:');
  console.log('   - Gets allowlist from context.session.sessionShellAllowlist');
  console.log('   - If empty: returns "No commands are currently allowed" message');  
  console.log('   - If not empty: returns sorted list of commands with "-" prefix');
}

debugAllowlist();