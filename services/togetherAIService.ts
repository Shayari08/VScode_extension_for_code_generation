import Together from 'together-ai';
import * as vscode from 'vscode';
import * as dotenv from 'dotenv';
dotenv.config();

let TOGETHER_API_KEY = vscode.workspace.getConfiguration().get('copilot.apiKey') as string | undefined;
let together = new Together({ apiKey: TOGETHER_API_KEY });

export function reinitializeTogether(apiKey: string) {
    TOGETHER_API_KEY = apiKey;
    together = new Together({ apiKey: TOGETHER_API_KEY });
}

export async function getChatCompletion(messages: any[], model: string): Promise<string> {
    try {
        const response = await together.chat.completions.create({
            messages: messages,
            model: model,
        });
        return response.choices[0].message?.content || "Sorry, I didn't understand that.";
    } catch (err) {
        if (err instanceof Together.APIError) {
            if (err.status === 401) {
                vscode.window.showErrorMessage('Authentication Error: Invalid API Key. Please enter a valid API Key.');
            }
        } else {
            throw err;
        }
        return "Sorry, I couldn't complete the request.";
    }
}

export async function getCodeCompletion(prompt: string, model: string): Promise<string> {
    try {
        const response = await together.completions.create({
            model: model,
            prompt: prompt,
            stop: ["/"],
            temperature: 0.3,
            top_p: 0.9,
            stream: true
        });

        let completion = '';
        for await (const chunk of response) {
            completion += chunk.choices[0].text;
        }
        return completion;
    } catch (err) {
        if (err instanceof Together.APIError) {
            console.log(err.status);
            console.log(err.name); 
            console.log(err.headers); 
            vscode.window.showErrorMessage(`Together AI Error: ${err.name} (${err.status})`);
        } else {
            throw err;
        }
        return "Sorry, I couldn't complete the code.";
    }
}
