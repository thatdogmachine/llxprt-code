// Quick verification test to make sure the implementation works
const fs = require('fs');

console.log("=== Verifying that allowlistCommand.ts content is correct ===");

const path = '/Users/ewannisbet/repos/llxprt-code/packages/cli/src/ui/commands/allowlistCommand.ts';
const content = fs.readFileSync(path, 'utf8');

console.log('File exists:', fs.existsSync(path));
console.log('\nContent preview:');
console.log(content.substring(0, 200) + '...');

// Check key elements
const checks = [
    { name: 'Has import', check: content.includes('import { CommandKind, MessageActionReturn, SlashCommand }') },
    { name: 'Has command definition', check: content.includes('const allowlistCommand:') },
    { name: 'Has correct action function', check: content.includes('action: async (context): Promise<MessageActionReturn>') },
    { name: 'Has sessionShellAllowlist access', check: content.includes('context.session.sessionShellAllowlist') },
    { name: 'Has proper return with message', check: content.includes('return { type: \'message\'') },
];

console.log('\n=== Verification Checks ===');
checks.forEach(check => {
    console.log(`${check.check ? '[OK]' : ''} ${check.name}`);
});

console.log('\n=== Built File Verification ===');
const distPath = '/Users/ewannisbet/repos/llxprt-code/packages/cli/dist/src/ui/commands/allowlistCommand.js';
const distExists = fs.existsSync(distPath);
console.log('Built file exists:', distExists);

if (distExists) {
    const distContent = fs.readFileSync(distPath, 'utf8');
    console.log('Built file contains allowlistCommand:', distContent.includes('allowlistCommand'));
    console.log('Built file contains sessionShellAllowlist access:', distContent.includes('sessionShellAllowlist'));
}