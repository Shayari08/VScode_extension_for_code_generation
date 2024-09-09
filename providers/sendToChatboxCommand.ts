import * as vscode from 'vscode';
import { copilotViewProvider } from './copilotViewProvider';

export function registerSendSelectionToChatboxCommand(context: vscode.ExtensionContext, copilotProvider: copilotViewProvider) {
    context.subscriptions.push(
        vscode.commands.registerCommand('extension.sendSelectionToChatbox', () => {
            const editor = vscode.window.activeTextEditor;
            if (!editor) {
                vscode.window.showInformationMessage('No active editor found.');
                return;
            }

            const selection = editor.document.getText(editor.selection);
            if (selection) {
                updateChatboxInput(copilotProvider, selection);
            } else {
                vscode.window.showInformationMessage('No text selected.');
            }
        })
    );
}
function updateChatboxInput(copilotProvider: copilotViewProvider, text: string) {
    copilotProvider._view?.webview.postMessage({
        command: 'updateInput',
        text: text
    });
}
