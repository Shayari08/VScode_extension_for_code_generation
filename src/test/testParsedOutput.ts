import { getSuggestions } from '../api';

async function testParsedOutput() {
    const code = 'function greet(name) {';
    const position = code.length;

    try {
        const suggestions = await getSuggestions(code, position);
        console.log('Raw Suggestions:', suggestions);

        // Parse the output to extract the code
        const codeSuggestions = suggestions.map((suggestion: any) => suggestion.text.trim());
        console.log('Parsed Code Suggestions:', codeSuggestions);
    } catch (error) {
        console.error('Error:', error);
    }
}

testParsedOutput();
