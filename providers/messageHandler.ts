import * as vscode from 'vscode';
import { getChatCompletion, getCodeCompletion } from '../services/togetherAIService';
import { SYSTEM_CONTENT_COMMENT, SYSTEM_CONTENT_DEBUG, SYSTEM_CONTENT_REFACTOR, SYSTEM_CONTENT_DEFAULT } from '../utils/message';

interface ChatMessage {
    role: 'system' | 'user' | 'assistant';
    content: string;
}

export class MessageHandler {
    
    constructor(
        private readonly webviewView: vscode.WebviewView,
        private conversationHistory: ChatMessage[]
    ) {}

    public async handleMessage(message: any, selectedModel: string) {
        if (message.command === 'sendMessage') {
            const userMessage = message.text;
            let systemContent = '';

            // Add user message to conversation history
            this.conversationHistory.push({ role: 'user', content: userMessage });

            try {
                // Parse the command
                const commandMatch = userMessage.match(/^\/(\w+)\s+([\s\S]*)/);
                if (commandMatch) {
                    const command = commandMatch[1];
                    const code = commandMatch[2];

                    if (command === 'suggest') {
                        // Get code completion from Together AI
                        const response = await getCodeCompletion(code, selectedModel);

                        // Send the bot's response back to the webview
                        this.webviewView.webview.postMessage({
                            command: 'receiveMessage',
                            botResponse: response,
                        });
                    } else {
                        if (command === 'comment') {
                            systemContent = SYSTEM_CONTENT_COMMENT;
                        } else if (command === 'debug') {
                            systemContent = SYSTEM_CONTENT_DEBUG;
                        } else if (command === 'refactor') {
                            systemContent = SYSTEM_CONTENT_REFACTOR;
                        } else {
                            systemContent = SYSTEM_CONTENT_DEFAULT;
                        }

                        // Get chat completion from Together AI
                        const chatCompletion = await getChatCompletion([
                            {
                                role: 'system',
                                content: systemContent
                            },
                            {
                                role: 'user',
                                content: code
                            }
                        ], selectedModel);

                        // Add bot response to conversation history
                        this.conversationHistory.push({ role: 'assistant', content: chatCompletion });

                        // Send the bot's response back to the webview
                        this.webviewView.webview.postMessage({
                            command: 'receiveMessage',
                            botResponse: chatCompletion,
                        });
                    }
                } else {
                    systemContent = SYSTEM_CONTENT_DEFAULT;

                    // Handle normal chat messages without specific commands
                    const chatCompletion = await getChatCompletion([
                        {
                            role: 'system',
                            content: systemContent
                        },
                        ...this.conversationHistory,
                        {
                            role: 'user',
                            content: userMessage || 'Hi, greet me with an emoji.'
                        }
                    ], selectedModel);

                    this.conversationHistory.push({ role: 'assistant', content: chatCompletion });

                    this.webviewView.webview.postMessage({
                        command: 'receiveMessage',
                        botResponse: chatCompletion,
                    });
                }
            } catch (error) {
                vscode.window.showErrorMessage('Error getting response from Together AI');
            }
        } else if (message.command === 'moveCodeToCursor') {
            const code = message.code;
            const editor = vscode.window.activeTextEditor;
            if (editor) {
                editor.edit(editBuilder => {
                    editBuilder.insert(editor.selection.active, code);
                });
            }
        }
    }
}
