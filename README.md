# Gull Translate | Voice to Finnish & English

A premium, high-performance voice translation web application that provides instant transcription and translation between English and Finnish. Designed with a modern "Midnight Aurora" aesthetic.

## ✨ Features

- **🎤 Live Voice Input**: Real-time transcription using the Web Speech API.
- **🔄 Bi-directional Translation**: Easily toggle between English-to-Finnish and Finnish-to-English.
- **🌍 Multi-Language Support**: Choose from over 15 languages including English, Finnish, Spanish, French, German, Hindi, Chinese, Japanese, Russian, Portuguese, Italian, Arabic, Korean, Swedish, and Norwegian.
- **⚡ Low Latency**: Optimized for quick feedback with interim transcription results.
- **💎 Premium Design**: 
  - Glassmorphism interface.
  - Midnight Aurora animated background.
  - Responsive layout for mobile and desktop.
  - Smooth micro-animations and pulsing indicators.
- **🌐 No Setup**: Uses public APIs and browser-native features; no API keys required.

## 🚀 Getting Started

### Prerequisites

- A modern browser with **Web Speech API** support (Google Chrome or Microsoft Edge recommended).
- Stable internet connection for translation services.

### Installation & Running

1. **Clone or Download** this directory.
2. Open the project folder:
   ```bash
   cd "c:/Users/Musa/Desktop/AI in practice/translation_app"
   ```
3. **Open `index.html`** directly in your browser.
   
   *Alternatively, if you have Node.js installed, you can use a local server for a better experience:*
   ```bash
   npx serve
   ```

## 🛠️ Technology Stack

- **HTML5**: Semantic structure.
- **Vanilla CSS**: Custom design system with CSS variables and glassmorphism.
- **Javascript (ES6+)**: 
  - **Web Speech API**: For voice-to-text transcription.
  - **MyMemory API**: For text translation.
  - **Speech Synthesis**: (Hook included) for potential audio playback.

## 📖 How to Use

1. **Set Language**: Use the toggle at the top to choose your translation direction.
   - **Inactive Toggle**: English ➔ Finnish
   - **Active Toggle**: Finnish ➔ English
2. **Start Listening**: Click the large violet microphone button. It will pulse red when it is listening.
3. **Speak**: Speak clearly into your microphone. Your words will appear in the "Listening" box in real-time.
4. **Translate**: Once you stop speaking or pause for a moment, the final result is sent for translation automatically.
5. **Listen**: The translated text appears in the "Translated" box below.

## 📝 License

This project is open-source and created for educational purposes.
