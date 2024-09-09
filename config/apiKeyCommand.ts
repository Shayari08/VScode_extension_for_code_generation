
import * as vscode from 'vscode';
import { ensureValidApiKey } from './config';

export function registerEnterApiKeyCommand(context: vscode.ExtensionContext) {
    context.subscriptions.push(
        vscode.commands.registerCommand('copilot.enterApiKey', async () => {
            const apiKey = await vscode.window.showInputBox({
                prompt: 'Enter your TogetherAi API key',
                placeHolder: 'TogetherAi API key'
            });

            if (apiKey) {
                await vscode.workspace.getConfiguration().update('copilot.apiKey', apiKey, vscode.ConfigurationTarget.Global);
                vscode.window.showInformationMessage('API Key saved successfully!');
                await ensureValidApiKey();
            }
        })
    );
}
