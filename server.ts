import express from "express";
import path from "path";
import dotenv from "dotenv";
import { GoogleGenAI } from "@google/genai";
import { createServer as createViteServer } from "vite";

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json());

// Lazy initialisation of Gemini to prevent start crashes
let aiClient: GoogleGenAI | null = null;
function getAIClient() {
  if (!aiClient) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      console.warn("GEMINI_API_KEY environment variable is missing. Sahayak AI chatbot falls back to manual local responses.");
      return null;
    }
    aiClient = new GoogleGenAI({
      apiKey: apiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        }
      }
    });
  }
  return aiClient;
}

// REST route for Health Check
app.get("/api/health", (req, res) => {
  res.json({ status: "ok", time: new Date() });
});

// REST route for Sahayak AI Assistant Chatbot
app.post("/api/sahayak/chat", async (req, res) => {
  try {
    const { message, lang = "Hindi", chatHistory = [] } = req.body;
    if (!message) {
       res.status(400).json({ error: "Message is required" });
       return;
    }

    const ai = getAIClient();
    if (!ai) {
      // Local rules-based simulator responses in case of missing API key or offline testing
      const lowerMsg = message.toLowerCase();
      let reply = "नमस्ते! मैं जीवसहायक हूँ। आपकी सहायता करने के लिए तैयार हूँ। (यह एक पूर्व-निर्धारित प्रतिक्रिया है क्योंकि एआई कुंजी अभी कॉन्फ़िगर नहीं की गई है)";
      
      if (lang === "Bengali") {
        reply = "নমস্কার! আমি জীবসহায়ক। আপনার সাহায্যে প্রস্তুত। (এপিআই কী না থাকার কারণে এটি একটি সাধারণ ডেমো উত্তর)";
      } else if (lang === "Tamil") {
        reply = "வணக்கம்! நான் ஜீவ்சஹாயக். உங்களுக்கு உதவ தயாராக இருக்கிறேன். (ஏபிஐ சாவி இல்லாததால் இது ஒரு டெமோ பதில்)";
      } else if (lang === "Telugu") {
        reply = "నమస్తే! నేను జీవసహాయక్. సహాయం చేయడానికి సిద్ధంగా ఉన్నాను. (ఏపీఐ కీ లేకపోవడం వల్ల సాధారణ సమాధానం)";
      } else if (lang === "English") {
        reply = "Hello! I am JivSahayak. Ready to assist you. (This is a pre-defined fallback reply because the API key is not configured)";
      }

      const lowerText = lowerMsg.toLowerCase();
      if (lowerText.includes("saving") || lowerText.includes("money") || lowerText.includes("कमाने") || lowerText.includes("बचत") || lowerText.includes("টাকা")) {
        if (lang === "Hindi") {
          reply = "बचत के लिए सही रास्ता चुनें! अपनी कमाई का कम से कम 10% एक सुरक्षित बैंक खाते में रखें। आप डाकघर बचत योजना (Post Office Scheme) का उपयोग भी कर सकते हैं। इससे आपका पैसा सुरक्षित रहता है और ब्याज भी मिलता है।";
        } else if (lang === "Bengali") {
          reply = "সঞ্চয়ের জন্য সঠিক পথ বাছুন! আপনার আয়ের অন্তত ১০% একটি নিরাপদ ব্যাঙ্ক অ্যাকাউন্টে রাখুন। পোস্ট অফিস সঞ্চয় যোজনাও একটি চমৎকার বিকল্প।";
        } else if (lang === "English") {
          reply = "For savings, choose the right path! Keep at least 10% of your earnings in a safe bank account or post office deposit. It secures your future and earns interest.";
        }
      } else if (lowerText.includes("health") || lowerText.includes("disease") || lowerText.includes("बीमारी") || lowerText.includes("बीमार") || lowerText.includes("শরীর")) {
        if (lang === "Hindi") {
          reply = "स्वास्थ्य ही सबसे बड़ा धन है! बच्चों का समय पर टीकाकरण कराएं और पीने के पानी को हमेशा उबालकर या छानकर पीएं। आशा दीदी (ASHA Worker) या नजदीकी स्वास्थ्य केंद्र से संपर्क करें।";
        } else if (lang === "Bengali") {
          reply = "স্বাস্থ্যই পরম সম্পদ! শিশুদের সময়মত টিকা খাওয়ান এবং সর্বদা বিশুদ্ধ ফুটানো জল পান করুন। স্থানীয় আশাকর্মীর সাথে যোগাযোগ রাখতে ভুলবেন না।";
        } else if (lang === "English") {
          reply = "Health is wealth! Get children vaccinated on time and ensure you drink clean boiled water. Contact your local ASHA worker or nearby primary health center.";
        }
      } else if (lowerText.includes("rights") || lowerText.includes("law") || lowerText.includes("कानून") || lowerText.includes("अधिकार")) {
        if (lang === "Hindi") {
          reply = "अधिकार ही आपकी सुरक्षा है! घरेलू हिंसा या शोषण के खिलाफ आवाज उठाना आपका कानूनी अधिकार है। किसी भी शिकायत के लिए महिला हेल्पलाइन नंबर 1091 पर अवश्य कॉल करें।";
        } else if (lang === "English") {
          reply = "Rights are your security! Standing up against domestic violence or harassment is your legal right. For any help, domestic abuse distress helpline is 1091.";
        }
      }

      res.json({ reply });
      return;
    }

    // Prepare system instructions for rural, low-literacy communities
    const systemPrompt = `You are "JivSahayak" (meaning Livelihood & Life Helper), a compassionate, deeply respectful, and highly supportive AI Mentor designed for underprivileged, rural, and low-literacy communities in India.

Your primary objective is to empower the user across four core areas:
1. Financial literacy (how to open accounts, save money daily, protect from fraud/fake schemes).
2. Health & Wellness (hygiene, nutrition, pregnancy wellness, simple home remedies, ASHA worker support).
3. Legal awareness & Women rights (domestic abuse protection, legal helpline 1091, property share basic tips).
4. Government services (simple steps to access Jan Dhan Accounts, PM Ujjwala, PM Matru Vandana Yojana).

Since the audience has limited literacy and prefers audio, you MUST adhere to the following rules:
- Provide your response exclusively in the requested language: "${lang}". If "${lang}" is Hindi, answer in clean, simple Hindi (Devanagari script). If Bengali, Tamil, Telugu, answer in their respective scripts.
- Use extremely simple, clear, and colloquial vocabulary. Speak like a friendly local elder brother/sister (Sahayak).
- Limit your lines. Avoid long-winded academic explanations of policies or mathematics.
- Break your response into:
  1. A warm, understanding opening sentence validating their query.
  2. 2 or 3 short, concrete, practical action steps (using numbered symbols 1️⃣, 2️⃣, 3️⃣ for visual navigation).
  3. A final short line of high encouragement (e.g., "हम आपके साथ हैं, आगे बढ़ते रहें!").
- Do not use complex english loanwords in english letters unless absolutely necessary; write phonetically in the local script (e.g. write "बैंक" instead of "Bank" in Devanagari).`;

    // Map chatHistory to contents for generateContent
    const contents: any[] = [];
    
    // Convert history or format text
    chatHistory.forEach((h: { sender: string, text: string }) => {
      contents.push({
        role: h.sender === "user" ? "user" : "model",
        parts: [{ text: h.text }]
      });
    });

    contents.push({
      role: "user",
      parts: [{ text: message }]
    });

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: contents,
      config: {
        systemInstruction: systemPrompt,
        temperature: 0.7,
      }
    });

    const reply = response.text || "क्षमस्व! मैं जवाब नहीं बना पाया। कृपया पुनः प्रयास करें।";
    res.json({ reply });
  } catch (error: any) {
    console.error("Gemini Error:", error);
    res.status(500).json({ error: "Something went wrong in JivSahayak engine: " + error.message });
  }
});

// Configure Vite integration asynchronously to support esbuild bundles without top-level await warnings
async function startServer() {
  const isProduction = process.env.NODE_ENV === "production";

  if (!isProduction) {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  // Bind to host 0.0.0.0 and port 3000 as required
  app.listen(PORT, "0.0.0.0", () => {
    console.log(`[JivSahayak Server] Running on http://0.0.0.0:${PORT} (Env: ${process.env.NODE_ENV || "development"})`);
  });
}

startServer().catch((err) => {
  console.error("Failed to start JivSahayak server:", err);
});
