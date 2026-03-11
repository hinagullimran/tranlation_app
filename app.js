const micBtn = document.getElementById('mic-btn');
const inputText = document.getElementById('input-text');
const outputText = document.getElementById('output-text');
const statusText = document.getElementById('status');
const srcLangSelect = document.getElementById('src-lang');
const targetLangSelect = document.getElementById('target-lang');
const swapBtn = document.getElementById('swap-langs');
const video = document.getElementById('webcam-feed');
const liveSubtitle = document.getElementById('live-subtitle');

let isListening = false;
let recognition;
let stream;

// Initialize Webcam
async function initWebcam() {
    try {
        stream = await navigator.mediaDevices.getUserMedia({ 
            video: { width: 1280, height: 720 }, 
            audio: false 
        });
        video.srcObject = stream;
    } catch (err) {
        console.error("Webcam error:", err);
        statusText.innerText = "Camera access denied. Audio only mode.";
    }
}

initWebcam();

// Initialize Speech Recognition
if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    recognition = new SpeechRecognition();
    recognition.continuous = true;
    recognition.interimResults = true;

    recognition.onstart = () => {
        isListening = true;
        micBtn.classList.add('listening');
        statusText.innerText = "Targeting Voice...";
        statusText.classList.add('active');
    };

    recognition.onend = () => {
        isListening = false;
        micBtn.classList.remove('listening');
        if (statusText.innerText !== "Error occurred") {
            statusText.innerText = "Click to Resume Recording";
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

        const currentText = finalTranscript || interimTranscript;
        if (currentText) {
            inputText.innerText = currentText;
            inputText.classList.remove('placeholder');
            
            if (finalTranscript) {
                translateText(finalTranscript);
            } else {
                liveSubtitle.innerText = currentText;
            }
        }
    };

    recognition.onerror = (event) => {
        console.error("Speech recognition error:", event.error);
        statusText.innerText = "Error: " + event.error;
        micBtn.classList.remove('listening');
    };
} else {
    statusText.innerText = "Speech Recognition not supported.";
    micBtn.disabled = true;
}

// Translation Function
async function translateText(text) {
    const srcLang = srcLangSelect.value.split('-')[0];
    const targetLang = targetLangSelect.value;

    statusText.innerText = "Processing Translation...";
    
    try {
        const response = await fetch(`https://api.mymemory.translated.net/get?q=${encodeURIComponent(text)}&langpair=${srcLang}|${targetLang}`);
        const data = await response.json();

        if (data.responseData && data.responseData.translatedText) {
            const translated = data.responseData.translatedText;
            
            // Handle RTL languages
            const rtlLangs = ['ur', 'ar', 'he', 'fa'];
            const isRTL = rtlLangs.includes(targetLang);
            
            outputText.style.direction = isRTL ? 'rtl' : 'ltr';
            liveSubtitle.style.direction = isRTL ? 'rtl' : 'ltr';
            outputText.style.textAlign = isRTL ? 'right' : 'left';
            liveSubtitle.style.textAlign = 'center'; // Keep center for subtitle overlay

            outputText.innerText = translated;
            outputText.classList.remove('placeholder');
            liveSubtitle.innerText = translated; // Update video subtitle
            statusText.innerText = "Translated!";
            
            // Auto-speak translation
            speakText(translated, targetLang);
        } else {
            throw new Error("Translation failed");
        }
    } catch (error) {
        console.error("Translation error:", error);
        statusText.innerText = "Translation error.";
    }
}

// Language Logic
swapBtn.addEventListener('click', () => {
    const temp = srcLangSelect.value;
    // Note: Simple swap might need careful mapping of BCP-47 to ISO codes
    // For now, let's just swap the indexes if they match
    const currentSrc = srcLangSelect.value;
    const currentTarget = targetLangSelect.value;
    
    // Attempt to find matching pairs
    const srcOptions = Array.from(srcLangSelect.options);
    const targetOptions = Array.from(targetLangSelect.options);
    
    const newTarget = srcOptions.find(o => o.value.startsWith(currentTarget))?.value || srcLangSelect.value;
    const newSrc = targetOptions.find(o => currentSrc.startsWith(o.value))?.value || targetLangSelect.value;

    // Direct swap for common ones
    srcLangSelect.value = srcOptions.find(o => o.value.startsWith(currentTarget))?.value || srcLangSelect.value;
    targetLangSelect.value = targetOptions.find(o => currentSrc.startsWith(o.value))?.value || targetLangSelect.value;
});

// Mic Click logic
micBtn.addEventListener('click', () => {
    if (isListening) {
        recognition.stop();
    } else {
        recognition.lang = srcLangSelect.value;
        recognition.start();
    }
});

// Helper for Voice Output
function speakText(text, lang) {
    window.speechSynthesis.cancel(); // Stop overlap
    const utterance = new SpeechSynthesisUtterance(text);
    // Find a voice for the target language
    const voices = window.speechSynthesis.getVoices();
    const voice = voices.find(v => v.lang.startsWith(lang));
    if (voice) utterance.voice = voice;
    utterance.lang = lang;
    window.speechSynthesis.speak(utterance);
}
