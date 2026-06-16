import { Language } from "../types";

let currentUtterance: SpeechSynthesisUtterance | null = null;

// Track if speaking is active
let onStateChangeCallback: ((speaking: boolean) => void) | null = null;

export function registerAudioStateListener(callback: (speaking: boolean) => void) {
  onStateChangeCallback = callback;
}

export function speakText(text: string, lang: Language, onEnd?: () => void) {
  if (typeof window === "undefined" || !window.speechSynthesis) {
    console.warn("Speech Synthesis is not supported in this browser.");
    return;
  }

  // Stop any active narration
  window.speechSynthesis.cancel();

  // Clean text a bit (remove emojis for smoother reading)
  const cleanText = text
    .replace(/[\uE000-\uF8FF]|\uD83C[\uDC00-\uDFFF]|\uD83D[\uDC00-\uDFFF]|[\u2011-\u26FF]|\uD83E[\uDD10-\uDDFF]/g, "")
    .replace(/🔊|👉|💰|🦉|🩺|📞|🤝|1️⃣|2️⃣|3️⃣/g, "");

  const utterance = new SpeechSynthesisUtterance(cleanText);

  // Set correct locale for speech engine
  let langLocale = "hi-IN";
  if (lang === "hi") langLocale = "hi-IN";
  else if (lang === "bn") langLocale = "bn-IN";
  else if (lang === "ta") langLocale = "ta-IN";
  else if (lang === "te") langLocale = "te-IN";
  else langLocale = "en-IN";

  utterance.lang = langLocale;

  // Try to find matching voice on system
  const voices = window.speechSynthesis.getVoices();
  const matchedVoice = voices.find(
    (v) => v.lang.startsWith(langLocale) || v.lang.replace("_", "-").startsWith(langLocale)
  );
  if (matchedVoice) {
    utterance.voice = matchedVoice;
  }

  // Adjust friendly speed for low-literacy clarity (slightly slower than normal)
  utterance.rate = 0.85; 
  utterance.pitch = 1.0;

  utterance.onstart = () => {
    if (onStateChangeCallback) onStateChangeCallback(true);
  };

  utterance.onend = () => {
    currentUtterance = null;
    if (onStateChangeCallback) onStateChangeCallback(false);
    if (onEnd) onEnd();
  };

  utterance.onerror = (e) => {
    console.error("SpeechSynthesis error:", e);
    currentUtterance = null;
    if (onStateChangeCallback) onStateChangeCallback(false);
    if (onEnd) onEnd();
  };

  currentUtterance = utterance;
  window.speechSynthesis.speak(utterance);
}

export function stopSpeaking() {
  if (typeof window !== "undefined" && window.speechSynthesis) {
    window.speechSynthesis.cancel();
    if (onStateChangeCallback) onStateChangeCallback(false);
  }
  currentUtterance = null;
}

export function isCurrentlySpeaking(): boolean {
  if (typeof window !== "undefined" && window.speechSynthesis) {
    return window.speechSynthesis.speaking;
  }
  return false;
}
