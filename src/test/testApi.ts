import { getSuggestions } from '../api';

async function testApi() {
    const code = 'function greet(name) {';
    const position = code.length;

    try {
        const suggestions = await getSuggestions(code, position);
        console.log('Suggestions:', suggestions);
    } catch (error) {
        console.error('Error:', error);
    }
}

testApi();