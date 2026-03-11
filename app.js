const micBtn = document.getElementById('mic-btn');
const inputText = document.getElementById('input-text');
const outputText = document.getElementById('output-text');
const modeToggle = document.getElementById('mode-toggle');
const statusText = document.getElementById('status');
const labelEn = document.getElementById('label-en');
const labelFi = document.getElementById('label-fi');

let isListening = false;
let recognition;

// Initialize Speech Recognition
if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    recognition = new SpeechRecognition();
    recognition.continuous = true;
    recognition.interimResults = true;

    recognition.onstart = () => {
        isListening = true;
        micBtn.classList.add('listening');
        statusText.innerText = "Listening...";
        statusText.classList.add('active');
    };

    recognition.onend = () => {
        isListening = false;
        micBtn.classList.remove('listening');
        if (statusText.innerText !== "Error occurred") {
            statusText.innerText = "Click to start again";
        }
        statusText.classList.remove('active');
    };

    recognition.onresult = (event) => {
        let interimTranscript = '';
        let finalTranscript = '';

        for (let i = event.resultIndex; i < event.results.length; ++i) {
            if (event.results[i].isFinal) {
                finalTranscript += event.results[i][0].transcript;
            } else {
                interimTranscript += event.results[i][0].transcript;
            }
        }

        if (finalTranscript || interimTranscript) {
            inputText.innerText = finalTranscript || interimTranscript;
            inputText.classList.remove('placeholder');
            
            if (finalTranscript) {
                translateText(finalTranscript);
            }
        }
    };

    recognition.onerror = (event) => {
        console.error("Speech recognition error:", event.error);
        statusText.innerText = "Error: " + event.error;
        micBtn.classList.remove('listening');
    };
} else {
    statusText.innerText = "Speech Recognition not supported in this browser.";
    micBtn.disabled = true;
}

// Translation Function
async function translateText(text) {
    const isFiToEn = modeToggle.checked;
    const sourceLang = isFiToEn ? 'fi' : 'en';
    const targetLang = isFiToEn ? 'en' : 'fi';

    statusText.innerText = "Translating...";
    
    try {
        // Using MyMemory API (Free, no key required for basic usage)
        const response = await fetch(`https://api.mymemory.translated.net/get?q=${encodeURIComponent(text)}&langpair=${sourceLang}|${targetLang}`);
        const data = await response.json();

        if (data.responseData && data.responseData.translatedText) {
            outputText.innerText = data.responseData.translatedText;
            outputText.classList.remove('placeholder');
            statusText.innerText = "Translated!";
            
            // Auto-speak translation (Optional, but adds a premium feel)
            // speakText(data.responseData.translatedText, targetLang);
        } else {
            throw new Error("Translation failed");
        }
    } catch (error) {
        console.error("Translation error:", error);
        statusText.innerText = "Translation error. Try again.";
    }
}

// Toggle logic
modeToggle.addEventListener('change', () => {
    const isFiToEn = modeToggle.checked;
    if (isFiToEn) {
        labelEn.classList.remove('active');
        labelFi.classList.add('active');
        recognition.lang = 'fi-FI';
    } else {
        labelEn.classList.add('active');
        labelFi.classList.remove('active');
        recognition.lang = 'en-US';
    }
    
    // Reset views
    inputText.innerText = "Speak something...";
    inputText.classList.add('placeholder');
    outputText.innerText = "Translation will appear here";
    outputText.classList.add('placeholder');
    
    if (isListening) {
        recognition.stop();
        setTimeout(() => recognition.start(), 300);
    }
});

// Mic Click logic
micBtn.addEventListener('click', () => {
    if (isListening) {
        recognition.stop();
    } else {
        // Set language based on toggle
        recognition.lang = modeToggle.checked ? 'fi-FI' : 'en-US';
        recognition.start();
    }
});

// Helper for Voice Output (optional enhancement)
function speakText(text, lang) {
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = lang === 'fi' ? 'fi-FI' : 'en-US';
    window.speechSynthesis.speak(utterance);
}
