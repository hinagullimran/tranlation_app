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
let audioContext;
let analyser;
let dataArray;

// Check Browser Compatibility
const isChrome = /Chrome/.test(navigator.userAgent) && /Google Inc/.test(navigator.vendor);
const isEdge = /Edg/.test(navigator.userAgent);

if (!isChrome && !isEdge) {
    statusText.innerHTML = "⚠️ <strong>WARNING</strong>: For best results, please use <a href='https://www.google.com/chrome/' style='color:white'>Google Chrome</a> or Microsoft Edge. Your current browser may not support live voice detection.";
}

// Initialize Webcam with flexible constraints
async function initWebcam() {
    try {
        stream = await navigator.mediaDevices.getUserMedia({ 
            video: true, // More flexible
            audio: true // Request audio too for volume visualization
        });
        video.srcObject = stream;
        
        // Setup Volume Visualization
        setupVolumeIndicator(stream);
        
        console.log("Webcam and Mic Access Granted");
    } catch (err) {
        console.error("Connectivity error:", err);
        statusText.innerText = "Camera/Mic access denied. Please check permissions in your browser bar.";
    }
}

function setupVolumeIndicator(stream) {
    audioContext = new (window.AudioContext || window.webkitAudioContext)();
    const source = audioContext.createMediaStreamSource(stream);
    analyser = audioContext.createAnalyser();
    analyser.fftSize = 256;
    source.connect(analyser);
    
    const bufferLength = analyser.frequencyBinCount;
    dataArray = new Uint8Array(bufferLength);
    
    updateVolume();
}

function updateVolume() {
    if (!isListening) {
        requestAnimationFrame(updateVolume);
        return;
    }
    
    analyser.getByteFrequencyData(dataArray);
    let values = 0;
    for (let i = 0; i < dataArray.length; i++) {
        values += dataArray[i];
    }
    const average = values / dataArray.length;
    
    // Scale the mic button pulse based on volume
    const scale = 1 + (average / 100);
    micBtn.style.transform = `scale(${scale})`;
    
    requestAnimationFrame(updateVolume);
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
        inputText.innerText = "Listening for " + srcLangSelect.options[srcLangSelect.selectedIndex].text + "...";
        if (audioContext && audioContext.state === 'suspended') {
            audioContext.resume();
        }
    };

    recognition.onspeechstart = () => {
        console.log("Speech detected by system...");
        statusText.innerText = "Transcribing voice...";
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

    recognition.onend = () => {
        isListening = false;
        micBtn.classList.remove('listening');
        if (!statusText.innerText.includes("Error")) {
            statusText.innerText = "Recording paused. Click to resume.";
        }
        statusText.classList.remove('active');
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

// Language Logic updates
function updateRecognitionLang() {
    if (recognition) {
        recognition.lang = srcLangSelect.value;
        if (isListening) {
            recognition.stop();
            // Restarts in onend or with a timeout
            setTimeout(() => recognition.start(), 300);
        }
    }
}

srcLangSelect.addEventListener('change', updateRecognitionLang);
targetLangSelect.addEventListener('change', () => {
    statusText.innerText = `Target set to ${targetLangSelect.options[targetLangSelect.selectedIndex].text}`;
    setTimeout(() => { if(!isListening) statusText.innerText = "Click to Resume Recording"; }, 2000);
});

swapBtn.addEventListener('click', () => {
    const sVal = srcLangSelect.value;
    const tVal = targetLangSelect.value;
    
    // Attempt to map back
    const srcOptions = Array.from(srcLangSelect.options);
    const targetOptions = Array.from(targetLangSelect.options);
    
    // Find target code that matches current source
    const newTarget = targetOptions.find(o => sVal.startsWith(o.value))?.value;
    // Find source code that matches current target
    const newSrc = srcOptions.find(o => o.value.startsWith(tVal))?.value;

    if (newSrc) srcLangSelect.value = newSrc;
    if (newTarget) targetLangSelect.value = newTarget;
    
    updateRecognitionLang();
});

// Mic Click logic
micBtn.addEventListener('click', () => {
    if (isListening) {
        recognition.stop();
    } else {
        recognition.lang = srcLangSelect.value;
        try {
            recognition.start();
        } catch (e) {
            console.error("Recognition start error:", e);
            // Fallback: stop and start
            recognition.stop();
            setTimeout(() => recognition.start(), 200);
        }
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
