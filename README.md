# Gull Translate | Voice to Finnish & English

A premium, high-performance voice translation web application that provides instant transcription and translation. Features a high-performance Mint Green glassmorphism interface and live webcam subtitles.

## 🔍 Troubleshooting (If Detection Fails)

If your camera or language detection isn't working:

1.  **Use Google Chrome**: This app uses the Web Speech API which is best supported in **Chrome** or **Edge**.
2.  **Check Permissions**: Look at the top-left of your browser bar. Make sure **Camera** and **Microphone** are set to "Allow".
3.  **Localhost only**: If you are not using `localhost`, your browser may block the microphone for security. Always run the app using `npx serve` or a similar local server.
4.  **Speak Clearly**: Ensure your microphone is positioned correctly and speak clearly in the language selected in the "Source" dropdown.
5.  **Look for the Pulse**: When you click the Microphone, the button should pulse in sync with your voice volume. If it doesn't pulse, your mic is not picking up sound.

## ✨ Features

- **🎤 Live Video & Subtitles**: Real-time webcam feed with live translated floating subtitles.
- **🔄 Bi-directional Translation**: Easily toggle between languages using the control grid.
- **🌍 Multi-Language Hub**: Switch between **English**, **Urdu**, **German**, and **Chinese** with instant Right-to-Left (RTL) support.
- **⚡ Low Latency**: Fast transcription and cloud-based translation.
- **💎 Premium Design**: 
  - Glassmorphism interface.
  - Interactive "Mint Green" background.
  - Responsive layouts.
  - Right-to-Left (RTL) text support for languages like Urdu and Arabic.
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

## 🖥️ Professional Hardware Support

Gull Translate is optimized for high-end optical sensors. It is fully compatible with the **Gull Pro (鴎)** professional webcam series, ensuring 8k resolution processing and crystal-clear voice targeting.

![Gull Pro Webcam](webcam_hero.png)

*Branding powered by Gull Hardware Engineering.*

