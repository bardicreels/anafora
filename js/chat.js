document.addEventListener('DOMContentLoaded', () => {
    const chatMessages = document.getElementById('chat-messages');
    const userInput = document.getElementById('user-input');
    const sendButton = document.getElementById('send-button');

    sendButton.addEventListener('click', sendMessage);
    userInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            sendMessage();
        }
    });

    function sendMessage() {
        const message = userInput.value.trim();
        if (message) {
            addMessageToChat('You', message);
            fetchBotResponse(message);
            userInput.value = '';
        }
    }

    function addMessageToChat(sender, message) {
        const messageElement = document.createElement('div');
        messageElement.innerHTML = `<strong>${sender}:</strong> ${message}`;
        chatMessages.appendChild(messageElement);
        chatMessages.scrollTop = chatMessages.scrollHeight;
    }

    async function fetchBotResponse(message) {
        try {
            const response = await fetch('YOUR_HUGGING_FACE_API_ENDPOINT', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': 'Bearer YOUR_HUGGING_FACE_API_KEY'
                },
                body: JSON.stringify({ inputs: message })
            });

            if (!response.ok) {
                throw new Error('Failed to fetch bot response');
            }

            const data = await response.json();
            addMessageToChat('Bot', data.generated_text);
        } catch (error) {
            console.error('Error:', error);
            addMessageToChat('Bot', 'Sorry, I encountered an error. Please try again later.');
        }
    }
});