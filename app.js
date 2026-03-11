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
let translationTimeout;

// Initialize Webcam with flexible constraints
async function initWebcam() {
    try {
        stream = await navigator.mediaDevices.getUserMedia({ 
            video: true, // More flexible
            audio: false 
        });
        video.srcObject = stream;
        console.log("Webcam initialized successfully");
    } catch (err) {
        console.error("Webcam error:", err);
        statusText.innerText = "Camera access denied or not found. Audio only mode.";
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
        statusText.innerText = "Listening... Speak now";
        statusText.classList.add('active');
        inputText.innerText = "Listening for voice...";
    };

    recognition.onend = () => {
        isListening = false;
        micBtn.classList.remove('listening');
        if (!statusText.innerText.includes("Error")) {
            statusText.innerText = "Recording paused. Click to resume.";
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
            
            // For live subtitle, always show current progress
            liveSubtitle.innerText = currentText;

            // Clear previous auto-translate timeout
            clearTimeout(translationTimeout);

            if (finalTranscript) {
                translateText(finalTranscript);
            } else {
                // If user pauses for 1.5 seconds, translate the interim text anyway for "live" feel
                translationTimeout = setTimeout(() => {
                    if (interimTranscript) {
                        translateText(interimTranscript);
                    }
                }, 1500);
            }
        }
    };

    recognition.onerror = (event) => {
        console.error("Speech recognition error:", event.error);
        if (event.error === 'not-allowed') {
            statusText.innerText = "Mic access blocked. Check browser settings.";
        } else {
            statusText.innerText = "Error: " + event.error;
        }
        micBtn.classList.remove('listening');
    };
} else {
    statusText.innerText = "Speech Recognition not supported.";
    micBtn.disabled = true;
}

// Translation Function
async function translateText(text) {
    if (!text.trim()) return;

    const srcLang = srcLangSelect.value.split('-')[0];
    const targetLang = targetLangSelect.value;
    
    // Show translating status on the subtitle area too
    statusText.innerText = "Translating...";
    
    try {
        const response = await fetch(`https://api.mymemory.translated.net/get?q=${encodeURIComponent(text)}&langpair=${srcLang}|${targetLang}`);
        const data = await response.json();

        if (data.responseData && data.responseData.translatedText) {
            const translated = data.responseData.translatedText;
            
            // Handle RTL languages (Urdu, Arabic)
            const rtlLangs = ['ur', 'ar'];
            const isRTL = rtlLangs.includes(targetLang);
            
            outputText.style.direction = isRTL ? 'rtl' : 'ltr';
            liveSubtitle.style.direction = isRTL ? 'rtl' : 'ltr';
            outputText.style.textAlign = isRTL ? 'right' : 'left';
            liveSubtitle.style.textAlign = 'center';

            outputText.innerText = translated;
            outputText.classList.remove('placeholder');
            liveSubtitle.innerText = translated; // Update video subtitle
            statusText.innerText = "Translated!";
            
            speakText(translated, targetLang);
        }
    } catch (error) {
        console.error("Translation error:", error);
        statusText.innerText = "Network translation error.";
    }
}

// Language Logic
swapBtn.addEventListener('click', () => {
    const sVal = srcLangSelect.value;
    const tVal = targetLangSelect.value;
    
    // Find matching options
    const srcOptions = Array.from(srcLangSelect.options);
    const targetOptions = Array.from(targetLangSelect.options);
    
    const newTarget = srcOptions.find(o => o.value.startsWith(tVal))?.value;
    const newSrc = targetOptions.find(o => sVal.startsWith(o.value))?.value;

    if (newTarget) srcLangSelect.value = newTarget;
    if (newSrc) targetLangSelect.value = newSrc;
    
    // If listening, restart with new language
    if (isListening) {
        recognition.stop();
        setTimeout(() => {
            recognition.lang = srcLangSelect.value;
            recognition.start();
        }, 400);
    }
});

// Mic Click logic
micBtn.addEventListener('click', () => {
    if (isListening) {
        recognition.stop();
    } else {
        // Very important: set language before starting
        recognition.lang = srcLangSelect.value;
        recognition.start();
    }
});

// Helper for Voice Output
function speakText(text, lang) {
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    const voices = window.speechSynthesis.getVoices();
    const voice = voices.find(v => v.lang.startsWith(lang));
    if (voice) utterance.voice = voice;
    utterance.lang = lang;
    window.speechSynthesis.speak(utterance);
}
