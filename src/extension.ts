import * as vscode from 'vscode';
import { copilotViewProvider } from '../providers/copilotViewProvider';
import { ensureValidApiKey } from '../config/config';
import { registerEnterApiKeyCommand } from '../config/apiKeyCommand';
import { registerSendSelectionToChatboxCommand } from '../providers/sendToChatboxCommand';
import { registerCopilotSuggestCommand } from '../services/codeSuggestionCursor';

export async function activate(context: vscode.ExtensionContext) {
    const copilotProvider = new copilotViewProvider(context);
    // Ensure a valid API key is available
    const apiKey = await ensureValidApiKey();
    if (!apiKey) {
        return; // Exit activation if no valid API key is provided
    }

    // Register the webview view provider
    context.subscriptions.push(
        vscode.window.registerWebviewViewProvider(copilotViewProvider.viewType, copilotProvider)
    );


    // Register commands
    registerEnterApiKeyCommand(context);
    
    registerSendSelectionToChatboxCommand(context, copilotProvider);
    
    registerCopilotSuggestCommand(context, copilotProvider);
    
}

export function deactivate() {}
