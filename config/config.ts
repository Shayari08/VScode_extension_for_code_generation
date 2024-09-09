import * as vscode from 'vscode';
import Together from 'together-ai';
import { getChatCompletion } from '../services/togetherAIService';
import { reinitializeTogether } from '../services/togetherAIService';

export async function getApiKey(): Promise<string | undefined> {
    let apiKey = vscode.workspace.getConfiguration().get('copilot.apiKey');
    if (!apiKey) {
        apiKey = await vscode.window.showInputBox({
            prompt: 'Enter your TogetherAi API key',
            placeHolder: 'TogetherAi API key'
        });

        if (apiKey) {
            await vscode.workspace.getConfiguration().update('copilot.apiKey', apiKey, vscode.ConfigurationTarget.Global);
            vscode.window.showInformationMessage('API Key saved successfully!');
            reinitializeTogether(apiKey as string); // Reinitialize Together instance with the new API key
        }
    }
    return apiKey as string || undefined;
}

export async function validateApiKey(apiKey: string): Promise<boolean> {
    reinitializeTogether(apiKey);

    try {
        // Make a test request to validate the API key
        await getChatCompletion([{ role: 'user', content: 'Test' }], 'mistralai/Mixtral-8x7B-Instruct-v0.1');
        return true;
    } catch (err) {
        return false;
    }
}

export async function ensureValidApiKey(): Promise<string | undefined> {
    let apiKey = await getApiKey();
    let isValidApiKey = false;

    while (!isValidApiKey && apiKey) {
        isValidApiKey = await validateApiKey(apiKey);
        if (!isValidApiKey) {
            apiKey = await getApiKey();
        }
    }

    if (!apiKey) {
        vscode.window.showErrorMessage('API Key is required to use Copilot.');
        return undefined; // Return undefined if no valid API key is provided
    }

    return apiKey;
}
