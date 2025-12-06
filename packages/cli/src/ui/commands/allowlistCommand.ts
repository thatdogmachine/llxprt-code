// @license
// Copyright 2025 Vybestack LLC
// SPDX-License-Identifier: Apache-2.0

import { CommandKind, MessageActionReturn, SlashCommand } from './types.js';

const allowlistCommand: SlashCommand = {
  name: 'allowlist',
  description: 'Show the list of commands that are allowed to run without confirmation',
  kind: CommandKind.BUILT_IN,
  action: async (context): Promise<MessageActionReturn> => {
    const allowlist = context.session.sessionShellAllowlist;
    
    if (allowlist.size === 0) {
      return {
        type: 'message',
        messageType: 'info', 
        content: 'No commands are currently allowed without confirmation.',
      };
    }
    
    const commands = Array.from(allowlist).sort();
    let message = 'Whitelisted shell commands (allowed without confirmation):\\n\\n';
    
    // Create a more readable display
    for (const command of commands) {
      message += `  - ${command}\\n`;
    }
    
    // Add debug info to help identify state issues
    message += `\\n\\nDebug: Allowlist contains ${commands.length} commands.\\n`;
    message += 'To clear this list, run: /shell --clear-allowlist';
    
    return {
      type: 'message',
      messageType: 'info',
      content: message,
    };
  },
};

export { allowlistCommand };