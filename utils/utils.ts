import * as vscode from 'vscode';
import { CodeAnalyzer } from './codeAnalyzer';
import { getChatCompletion } from '../services/togetherAIService';
import { INTRODUCTORY_MESSAGE } from './message';

interface ChatMessage {
    role: 'system' | 'user' | 'assistant';
    content: string;
}

export class Utils {

    constructor(
        private readonly context: vscode.ExtensionContext,
        private readonly webviewView: vscode.WebviewView,
        private conversationHistory: ChatMessage[]
    ) {}

    public addSystemMessage(content: string) {
        this.conversationHistory.push({ role: 'system', content });
    }

    public async handleDefaultChatMessage() {
        const systemContent = `Introduce yourself`;
        const introductoryMessage = INTRODUCTORY_MESSAGE;

        const chatCompletion = await getChatCompletion([
            {
                role: 'system',
                content: systemContent
            },
            {
                role: 'assistant',
                content: introductoryMessage
            }
        ], 'mistralai/Mixtral-8x7B-Instruct-v0.1');

        this.conversationHistory.push({ role: 'assistant', content: chatCompletion });

        // Send the bot's response back to the webview
        this.webviewView.webview.postMessage({
            command: 'receiveMessage',
            botResponse: chatCompletion,
        });
    }

    public async analyzeUserCode() {
        const files = await vscode.workspace.findFiles('**/*.{ts,js,jsx,py}', '**/node_modules/**');
        for (const file of files) {
            const document = await vscode.workspace.openTextDocument(file);
            const code = document.getText();
            const analyzer = new CodeAnalyzer(code);
            const functionInfos = analyzer.analyzeFunctions();

            // Add analysis result to conversation history
            this.addSystemMessage(`This is user's codebase for ${file.fsPath}:\n${JSON.stringify(functionInfos, null, 2)}. You are being provided with this codebase to make you aware of the context of code, in case you are asked questions by the user from the codebase.`);
        }
    }
}
