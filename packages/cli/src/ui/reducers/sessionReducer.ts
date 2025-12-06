/**
 * @license
 * Copyright 2025 Vybestack LLC
 * SPDX-License-Identifier: Apache-2.0
 */

import { UserTierId } from '@vybestack/llxprt-code-core';

// Session state interface
export interface SessionState {
  currentModel: string;
  isPaidMode: boolean | undefined;
  lastProvider: string | undefined;
  modelSwitchedFromQuotaError: boolean;
  userTier: UserTierId | undefined;
  transientWarnings: string[];
  sessionShellAllowlist: Set<string>;
}

// Action types
export type SessionAction =
  | { type: 'SET_CURRENT_MODEL'; payload: string }
  | { type: 'SET_PAID_MODE'; payload: boolean | undefined }
  | { type: 'SET_LAST_PROVIDER'; payload: string | undefined }
  | { type: 'SET_MODEL_SWITCHED_FROM_QUOTA_ERROR'; payload: boolean }
  | { type: 'SET_USER_TIER'; payload: UserTierId | undefined }
  | { type: 'SET_TRANSIENT_WARNINGS'; payload: string[] }
  | { type: 'CLEAR_TRANSIENT_WARNINGS' }
  | { type: 'ADD_TO_SHELL_ALLOWLIST'; payload: string }
  | { type: 'CLEAR_SHELL_ALLOWLIST' };

// Session reducer with exhaustive switch
export const sessionReducer = (
  state: SessionState,
  action: SessionAction,
): SessionState => {
  switch (action.type) {
    case 'SET_CURRENT_MODEL':
      return { ...state, currentModel: action.payload };
    case 'SET_PAID_MODE':
      return { ...state, isPaidMode: action.payload };
    case 'SET_LAST_PROVIDER':
      return { ...state, lastProvider: action.payload };
    case 'SET_MODEL_SWITCHED_FROM_QUOTA_ERROR':
      return { ...state, modelSwitchedFromQuotaError: action.payload };
    case 'SET_USER_TIER':
      return { ...state, userTier: action.payload };
    case 'SET_TRANSIENT_WARNINGS':
      return { ...state, transientWarnings: action.payload };
    case 'CLEAR_TRANSIENT_WARNINGS':
      return { ...state, transientWarnings: [] };
    case 'ADD_TO_SHELL_ALLOWLIST':
      // Create a new Set with the existing allowlist + the new command
      const newAllowlist = new Set(state.sessionShellAllowlist);
      newAllowlist.add(action.payload);
      return { ...state, sessionShellAllowlist: newAllowlist };
    case 'CLEAR_SHELL_ALLOWLIST':
      return { ...state, sessionShellAllowlist: new Set() };
    default: {
      // Exhaustive check - this ensures all action types are handled
      const _exhaustiveCheck: never = action;
      void _exhaustiveCheck; // Explicitly acknowledge the variable for TypeScript
      return state;
    }
  }
};
