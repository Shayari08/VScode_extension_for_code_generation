import * as vscode from 'vscode';
import { getCodeCompletion } from './togetherAIService';
import { copilotViewProvider } from '../providers/copilotViewProvider';

export function registerCopilotSuggestCommand(context: vscode.ExtensionContext, copilotProvider: copilotViewProvider) {
    context.subscriptions.push(
        vscode.commands.registerCommand('copilot.suggest', async () => {
            const editor = vscode.window.activeTextEditor;
            if (editor) {
                const document = editor.document;
                const position = editor.selection.active;
                const startLine = Math.max(0, position.line - 15);
                const endLine = position.line;
                const codeLines = [];

                for (let i = startLine; i <= endLine; i++) {
                    codeLines.push(document.lineAt(i).text);
                }

                const code = codeLines.join('\n');
                const selectedModel = 'mistralai/Mixtral-8x7B-Instruct-v0.1'; // Default model, can be changed

                try {
                    const response = await getCodeCompletion(code, selectedModel);
                    editor.edit(editBuilder => {
                        editBuilder.insert(position, response);
                    });
                } catch (error) {
                    vscode.window.showErrorMessage('Error getting code completion from Together AI');
                }
            }
        })
    );
}
