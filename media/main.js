const vscode = acquireVsCodeApi();
const input = document.getElementById('chat-input');
const model = document.getElementById('model');

// Function to auto-resize the textarea and apply styles
function autoResizeAndStyle() {
    this.style.height = 'auto'; // Reset the height
    this.style.height = this.scrollHeight + 'px'; // Set it to the scroll height

    // Apply command-specific styles to the input field
    if (this.value.startsWith('/comment')) {
        this.classList.add('command-comment');
        this.classList.remove('command-debug', 'command-refactor');
    } else if (this.value.startsWith('/debug')) {
        this.classList.add('command-debug');
        this.classList.remove('command-comment', 'command-refactor');
    } else if (this.value.startsWith('/refactor')) {
        this.classList.add('command-refactor');
        this.classList.remove('command-comment', 'command-debug');
    } else if (this.value.startsWith('/suggest')) {
        this.classList.add('command-suggest');
        this.classList.remove('command-comment', 'command-debug', 'command-refactor');
    } else {
        this.classList.remove('command-comment', 'command-debug', 'command-refactor','command-suggest');
    }
}

// Attach the autoResizeAndStyle function to the input event
input.addEventListener('input', autoResizeAndStyle);

document.getElementById('send-icon').addEventListener('click', () => {
    const message = input.value.trim();
    input.value = '';
    input.style.height = 'auto'; // Reset height after sending

    vscode.postMessage({
        command: 'sendMessage',
        text: message,
        model: model.value // Include the selected model
    });

    addMessageToChatBox('You', message);
});

document.getElementById('chat-box').addEventListener('click', (event) => {
    if (event.target.classList.contains('move-button')) {
        const codeSegment = event.target.closest('.code-container').querySelector('code').textContent;
        vscode.postMessage({
            command: 'moveCodeToCursor',
            code: codeSegment
        });
    }
});

// Function to add messages to the chat box
function addMessageToChatBox(sender, message) {
    const chatBox = document.getElementById('chat-box');
    const messageElement = document.createElement('div');
    messageElement.className = 'message';

    if (sender === 'You') {
        messageElement.classList.add('user-message');
        messageElement.textContent = message;

        // Apply command-specific styles
        if (message.startsWith('/comment')) {
            messageElement.classList.add('command-comment');
        } else if (message.startsWith('/debug')) {
            messageElement.classList.add('command-debug');
        } else if (message.startsWith('/refactor')) {
            messageElement.classList.add('command-refactor');
        }
    } else {
        messageElement.classList.add('bot-message');
        processBotResponse(messageElement, message);
    }
    chatBox.appendChild(messageElement);
    chatBox.scrollTop = chatBox.scrollHeight;
}

// Function to process bot response and handle multiple text and code blocks
function processBotResponse(messageElement, message) {
    const parts = message.split('```');
    for (let i = 0; i < parts.length; i++) {
        if (i % 2 === 0) {
            // Text part
            const textPart = document.createElement('p');
            textPart.textContent = parts[i].trim();
            messageElement.appendChild(textPart);
        } else {
            // Code part
            const code = parts[i].trim();
            const languageMatch = code.match(/^(\w+)\n/); // Extract the language from the first line
            const language = languageMatch ? languageMatch[1] : 'Code';
            const codeContent = code.replace(/^(\w+)\n/, ''); // Remove the language line from the code

            const languageLabel = document.createElement('div');
            languageLabel.className = 'language-label';
            languageLabel.textContent = language;

            const codeBlock = document.createElement('pre');
            const codeElement = document.createElement('code');
            codeBlock.innerHTML = `<code class="language-javascript">${Prism.highlight(codeContent, Prism.languages.javascript, 'javascript')}</code>`;

            const copyButton = document.createElement('button');
            copyButton.className = 'copy-button';
            copyButton.textContent = 'Copy';
            copyButton.title = 'Copy';
            copyButton.addEventListener('click', () => {
                navigator.clipboard.writeText(codeContent);
                copyButton.textContent = 'Copied!';
                setTimeout(() => copyButton.textContent = 'Copy', 2000);
            });

            // Create the move button
            const moveButton = document.createElement('button');
            moveButton.className = 'move-button';
            moveButton.textContent = 'Move';
            moveButton.title = 'Move to pointer';
            moveButton.addEventListener('click', () => {
                vscode.postMessage({
                    command: 'moveCodeToCursor',
                    code: codeContent
                });
            });

            const buttonContainer = document.createElement('div');
            buttonContainer.className = 'button-container';
            buttonContainer.appendChild(copyButton);
            buttonContainer.appendChild(moveButton);

            const codeHeader = document.createElement('div');
            codeHeader.style.display = 'flex';
            codeHeader.style.justifyContent = 'space-between';
            codeHeader.style.alignItems = 'center';
            codeHeader.appendChild(languageLabel);
            codeHeader.appendChild(buttonContainer);

            codeElement.appendChild(codeHeader);
            codeElement.appendChild(codeBlock);
            messageElement.appendChild(codeElement);
        }
    }
}

// Listen for messages from the extension
window.addEventListener('message', event => {
    const message = event.data;

    if (message.command === 'receiveMessage') {
        // Add bot's response to chatbox
        addMessageToChatBox('bot', message.botResponse);
    } else if (message.command === 'updateInput') {
        // Update chatbox input with selected text
        input.value += '\n' + message.text;
        input.style.height = 'auto'; // Reset height
        input.style.height = input.scrollHeight + 'px'; // Adjust height
    }
});