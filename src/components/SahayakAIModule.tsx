import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Volume2, VolumeX, Send, Sparkles, MessageCircle, AlertCircle, RefreshCw, AudioLines } from "lucide-react";
import { Language } from "../types";
import { speakText, stopSpeaking, registerAudioStateListener, isCurrentlySpeaking } from "../utils/audio";

interface ChatMessage {
  id: string;
  sender: "user" | "sahayak";
  text: string;
}

interface QuickQuestion {
  id: string;
  label: Record<Language, string>;
  fullQuery: Record<Language, string>;
}

const QUICK_QUESTIONS: QuickQuestion[] = [
  {
    id: "q_jandhan",
    label: {
      en: "🏦 How to open Jan Dhan Bank Account?",
      hi: "🏦 जन धन जीरो बैलेंस खाता कैसे खोलें?",
      bn: "🏦 জিরো ব্যালেন্স জনধন ব্যাঙ্ক অ্যাকাউন্ট খোলার নিয়ম কি?",
      ta: "🏦 ஜன தன் வங்கி கணக்கு தொடங்குவது எப்படி?",
      te: "🏦 జన్ ధన్ జీరో బ్యాలెన్స్ ఖాతా ఎలా తెరవాలి?"
    },
    fullQuery: {
      en: "Please tell me the simple, step-by-step process of opening a Zero-balance Pradhan Mantri Jan Dhan Account at the nearest bank.",
      hi: "मुझे पास के बैंक में शून्य बैलेंस प्रधानमंत्री जन धन खाता खोलने की सबसे आसान और सीधी प्रक्रिया 3 चरणों में बताएं।",
      bn: "আমাকে নিকটবর্তী যেকোনো ব্যাঙ্কে জিরো ব্যালেন্স জনধন অ্যাকাউন্ট খোলার সহজ নিয়ম ৩টি ধাপে বুঝিয়ে বলুন।",
      ta: "பூஜ்ஜிய ஜன தன் வங்கி கணக்கு தொடங்குவது எப்படி என விளக்கமாக கூறவும்.",
      te: "దగ్గరలోని బ్యాంకులో జన్ ధన్ జీరో బ్యాంకు ఖాతా ఎలా తెరిచాలో వివరించండి."
    }
  },
  {
    id: "q_pregnancy",
    label: {
      en: "🤰 What helper schemes exist for pregnant mothers?",
      hi: "🤰 गर्भवती महिलाओं के लिए क्या सरकारी लाभ हैं?",
      bn: "🤰 গর্ভবতী মায়েদের জন্য কি কোনো সরকারী সাহায্য চালু আছে?",
      ta: "🤰 கர்ப்பிணிப் பெண்களுக்கு என்ன அரசு உதவிகள் உள்ளன?",
      te: "🤰 గర్భిణీ స్త్రీలకు ప్రభుత్వం ఇచ్చే సహాయం ఏమిటి?"
    },
    fullQuery: {
      en: "What government maternity benefits, vaccine checkups, or cash assistance (like Rs. 5000) are available for a rural pregnant mother and how to reach out?",
      hi: "ग्रामीण इलाकों की गर्भवती महिलाओं के लिए ₹5,000 की नकद सरकारी सहायता और मुफ्त टीका कार्ड (मातृ वंदना योजना) कैसे प्राप्त करें, समझाएं।",
      bn: "গর্ভধারণকারী মা ও নবজাতক শিশুর পুষ্টির জন্য ৫,০০০ টাকার সরকারী যোজনা এবং আশাকর্মীর সাহায্য পাওয়ার নিয়ম সংক্ষেপে বলুন।",
      ta: "கர்ப்பிணிப் பெண்களுக்கு ஊட்டச்சத்திற்காக ரூ.5000 உதவித்தொகை வழங்கும் திட்டம் பற்றி கூறவும்.",
      te: "గర్భిణీ స్త్రీల సహాయార్థం ఉన్న పథకాలు (రూ. 5000 సహాయం) గురించి చెప్పండి."
    }
  },
  {
    id: "q_doublemoney",
    label: {
      en: "⚠️ Is 'Double money in 10 days' safe?",
      hi: "⚠️ 10 दिन में पैसा दोगुना करने वाली स्कीम सुरक्षित है?",
      bn: "⚠️ ১০ দিনে টাকা ২ গুণ করার স্কিম কি নিরাপদ?",
      ta: "⚠️ 10 நாட்களில் பணம் இருமடங்காகும் திட்டம் பாதுகாப்பானதா?",
      te: "⚠️ 10 రోజుల్లో డబ్బు రెండింతలు చేసే పథకం సురక్షితమేనా?"
    },
    fullQuery: {
      en: "A traveling stranger is promising to double my cash of Rs. 1000 in just 10 days if I give it to him. Is this safe or is it a fraud scheme?",
      hi: "गाँव में कोई फेरीवाला या रिश्तेदार कह रहा है कि ₹1,000 दो और 10 दिन में दुगना ले लो। क्या यह सच है या कोई धोखा? मुझे बताएं ताकि मैं बचूँ।",
      bn: "গ্রামে এক অপরিচিত ডিলার বলছে হাজার টাকা দিলে ১০ দিনে দ্বিগুণ করে দেবে। এটি কি নিরাপদ নাকি কোনো ঠকানো বা জালিয়াত স্কিম? আমায় সতর্ক করুন।",
      ta: "ஒரு புதிய நபர் வந்து 10 நாட்களில் பணத்தை இருமடங்கு தருவதாகக் கூறுகிறார். இது மோசடியா? விளக்கம் தாருங்கள்.",
      te: "ఒక కొత్త వ్యక్తి 10 రోజుల్లో డబ్బు రెండింతలు చేస్తానంటున్నాడు. ఇది మోసమేనా?"
    }
  },
  {
    id: "q_domesticabuse",
    label: {
      en: "📞 Who do I contact during family safety trouble?",
      hi: "📞 घर पर संकट या लड़ाई होने पर किस नंबर पर सचेत करें?",
      bn: "📞 ঘরে অশান্তি বা অত্যাচারের ক্ষেত্রে কোন হেল্পলাইনে ফোন করব?",
      ta: "📞 குடும்பத்தில் பிரச்சனை ஏற்பட்டால் யாரை அழைக்க வேண்டும்?",
      te: "📞 ఇంట్లో సమస్యలు వస్తే ఏ సహాయ కేంద్రానికి ఫోన్ చేయాలి?"
    },
    fullQuery: {
      en: "What legal help numbers or domestic protection networks exist for rural Indian families, and is the call completely free?",
      hi: "महिलाओं और ग्रामीण परिवारों की सुरक्षा के लिए कौन से फ्री हेल्पलाइन नंबर उपलब्ध हैं? क्या महिला हेल्पलाइन 1091 पर बात करना मुफ्त है?",
      bn: "মহিলাদের পারিবারিক সুরক্ষার জন্য সরকারী ফ্রী হেল্পলাইন নাম্বার কি? ১০৯১ নাম্বারে ফোন করতে কি টাকা লাগে?",
      ta: "மகளிர் பாதுகாப்பு குறித்து எளிய முறையில் புகார் அளிக்க சிறந்த இலவச நம்பர் எது?",
      te: "మహిళల భద్రత కోసం ఉన్న ఉచిత టోల్ ఫ్రీ నెంబర్ ఏమిటి?"
    }
  }
];

export default function SahayakAIModule({ currentLang }: { currentLang: Language }) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputValue, setInputValue] = useState("");
  const [loading, setLoading] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [activeSpeechMsgId, setActiveSpeechMsgId] = useState<string | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const initMessage = () => {
      let welcome = "";
      if (currentLang === "hi") {
        welcome = "नमस्ते! मैं आपका जीवन और आजीविका मार्गदर्शक 'सहायक' (Sahayak AI) हूँ। आप मुझसे बैंक खाता खोलने, बचत करने, पोषण युक्त भोजन, सरकारी योजनाओं या अधिकारों के बारे में बेझिझक पूछ सकते हैं। आप भी नीचे दिए गए आसान बटनों में से किसी एक को छूकर मुझसे सवाल पूछ सकते हैं।";
      } else if (currentLang === "bn") {
        welcome = "নমস্কার! আমি আপনার জীবন ও সঞ্চয় সহায়তাকারী 'সহায়ক' (Sahayak AI)। ব্যাঙ্ক অ্যাকাউন্ট খোলা, দৈনিক সঞ্চয়, পুষ্টিকর খাবার, সরকারী অধিকার বা যেকোনো বিষয়ে প্রশ্ন করতে পারেন। নিচে দেওয়া যেকোনো লাল/হলুদ বাটনে ক্লিক করে সরাসরি জিজ্ঞেস করুন।";
      } else if (currentLang === "ta") {
        welcome = "வணக்கம்! நான் உங்கள் ஜீவ்சஹாயக் ஏஐ நண்பன். வங்கி கணக்கு, குடும்ப சேமிப்பு, சத்துணவு, அரசு திட்டங்கள் பற்றி எளிய குரல் மூலம் கேட்கலாம். கீழே உள்ள கேள்விகளைத் தொட்டு கேட்கலாம்!";
      } else if (currentLang === "te") {
        welcome = "నమస్తే! నేను మీ 'సహాయక్' ఏఐ మిత్రుడిని. బ్యాంకు ఖాతాలు, పొదుపు పద్ధతులు, పోషకాహారం, హక్కుల గురించి ఏదైనా అడగండి. కింద ఉన్న ప్రశ్నల బటన్లు నొక్కి సులభంగా తెలుసుకోండి!";
      } else {
        welcome = "Hello! I am Sahayak, your Livelihood and Life Mentor. Ask me anything about opening bank branches, village micro-savings, child nutrition plates, or family schemes. You can tap any button below to instantly listen to direct audio guides!";
      }

      setMessages([
        { id: "initial", sender: "sahayak", text: welcome }
      ]);
      
      speakText(welcome, currentLang);
    };

    initMessage();

    // Set buddy chat module completed when visiting
    localStorage.setItem("jivsahayak_completed_buddy", "true");
    window.dispatchEvent(new Event("jivsahayak_progress_updated"));

    registerAudioStateListener((speaking) => {
      setIsSpeaking(speaking);
      if (!speaking) setActiveSpeechMsgId(null);
    });

    return () => {
      stopSpeaking();
    };
  }, [currentLang]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  const speakMessage = (msg: ChatMessage) => {
    if (activeSpeechMsgId === msg.id && isSpeaking) {
      stopSpeaking();
      setActiveSpeechMsgId(null);
    } else {
      stopSpeaking();
      setActiveSpeechMsgId(msg.id);
      speakText(msg.text, currentLang);
    }
  };

  const handleSendMessage = async (textToSend: string) => {
    if (!textToSend.trim() || loading) return;

    stopSpeaking();
    const userMsgId = `user_${Date.now()}`;
    const newMsg: ChatMessage = { id: userMsgId, sender: "user", text: textToSend };
    
    setMessages((prev) => [...prev, newMsg]);
    setInputValue("");
    setLoading(true);

    try {
      const response = await fetch("/api/sahayak/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: textToSend,
          lang: currentLang === "hi" ? "Hindi" : currentLang === "bn" ? "Bengali" : currentLang === "ta" ? "Tamil" : currentLang === "te" ? "Telugu" : "English",
          chatHistory: messages.slice(-6).map((m) => ({
            sender: m.sender === "user" ? "user" : "model",
            text: m.text
          }))
        })
      });

      const data = await response.json();
      if (data.reply) {
        const sahayakMsgId = `sahayak_${Date.now()}`;
        const sahayakMsg: ChatMessage = { id: sahayakMsgId, sender: "sahayak", text: data.reply };
        
        setMessages((prev) => [...prev, sahayakMsg]);
        
        setActiveSpeechMsgId(sahayakMsgId);
        speakText(data.reply, currentLang);
      } else {
        throw new Error("No answer generated");
      }
    } catch (err) {
      console.error(err);
      const errMsgId = `err_${Date.now()}`;
      const failText = currentLang === "en" 
        ? "Network issue. Please tap again." 
        : "नेटवर्क धीमा है। कृपया दोबारा टच करें।";
      
      setMessages((prev) => [
        ...prev,
        { id: errMsgId, sender: "sahayak", text: failText }
      ]);
      speakText(failText, currentLang);
    } finally {
      setLoading(false);
    }
  };

  const selectQuickQuestion = (q: QuickQuestion) => {
    const rawQuery = q.fullQuery[currentLang];
    handleSendMessage(rawQuery);
  };

  return (
    <div className="max-w-4xl mx-auto rounded-3xl bg-white border-4 border-[#1A1A1A] overflow-hidden shadow-[8px_8px_0_#1A1A1A] flex flex-col h-[650px]">
      
      {/* Upper Title Panel */}
      <div className="bg-[#FFD93D] p-5 border-b-4 border-[#1A1A1A] flex justify-between items-center shrink-0">
        <div className="flex items-center gap-3">
          <div className="bg-white text-[#1A1A1A] border-2 border-[#1A1A1A] w-10 h-10 rounded-2xl flex items-center justify-center font-extrabold text-lg shadow-[2px_2px_0_#1A1A1A]">
            🤝
          </div>
          <div>
            <h2 className="text-sm md:text-base font-black text-[#1A1A1A] font-display leading-none">
              JivSahayak AI Friend
            </h2>
            <p className="text-[10px] font-mono font-black text-[#1A1A1A]/80 mt-1">
              Active Audio Assistance Platform
            </p>
          </div>
        </div>

        {/* Live Active Audio Waveform representation */}
        {isSpeaking && (
          <div className="flex items-center gap-2 bg-[#FF6B6B] border-2 border-[#1A1A1A] px-3 py-1.5 rounded-full text-white text-[10px] font-mono font-bold shadow-[2px_2px_0_#1A1A1A] animate-pulse">
            <AudioLines className="w-4 h-4 text-white" />
            <span>AI SPEAKING...</span>
          </div>
        )}
      </div>

      {/* Chat Messages Scrolling Body */}
      <div className="flex-grow overflow-y-auto p-4 md:p-6 flex flex-col gap-4 bg-[#FEF9E7]">
        
        {messages.map((msg) => {
          const isSahayak = msg.sender === "sahayak";
          const isSpeakingThis = activeSpeechMsgId === msg.id && isCurrentlySpeaking();
          return (
            <div
              key={msg.id}
              className={`flex items-start gap-3 max-w-[85%] ${
                isSahayak ? "self-start" : "self-end flex-row-reverse"
              }`}
            >
              {/* Avatar circle */}
              <div className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 font-bold border-2 border-[#1A1A1A] scale-95 shadow-[1px_1px_0_#1A1A1A] ${
                isSahayak ? "bg-white text-neutral-800" : "bg-[#FFD93D] text-[#1A1A1A]"
              }`}>
                {isSahayak ? "💁" : "👤"}
              </div>

              {/* Msg bubble container */}
              <div className={`rounded-2xl p-4 border-2 border-[#1A1A1A] flex flex-col gap-2 shadow-[3px_3px_0_#1A1A1A] ${
                isSahayak 
                  ? "bg-white text-[#1A1A1A]" 
                  : "bg-[#D1EED5] text-[#1A1A1A]"
              }`}>
                <p className="text-sm leading-relaxed whitespace-pre-wrap font-bold font-sans">
                  {msg.text}
                </p>

                {/* Local audio playback action inside bubble */}
                {isSahayak && (
                  <button
                    onClick={() => speakMessage(msg)}
                    className={`self-start mt-2 px-3 py-1 rounded-full text-[10px] font-black cursor-pointer flex items-center gap-1.5 transition-all border-2 border-[#1A1A1A] shadow-[1px_1px_0_#1A1A1A] ${
                      isSpeakingThis
                        ? "bg-[#FF6B6B] text-white shadow-none translate-y-0.5"
                        : "bg-[#FFD93D] text-[#1A1A1A] hover:bg-[#FFE066]"
                    }`}
                  >
                    {isSpeakingThis ? <VolumeX className="w-3.5 h-3.5" /> : <Volume2 className="w-3.5 h-3.5" />}
                    <span>{isSpeakingThis ? "Mute" : "Listen Voice (आवाज)"}</span>
                  </button>
                )}
              </div>
            </div>
          );
        })}

        {/* AI is writing representation */}
        {loading && (
          <div className="flex items-start gap-3 self-start max-w-[85%]">
            <div className="w-8 h-8 rounded-xl bg-white border-2 border-[#1A1A1A] text-neutral-800 flex items-center justify-center font-bold shadow-[1px_1px_0_#1A1A1A]">
              💁
            </div>
            <div className="rounded-2xl p-4 bg-white border-2 border-[#1A1A1A] text-[#1A1A1A] text-xs font-bold shadow-[2px_2px_0_#1A1A1A] flex items-center gap-2">
              <RefreshCw className="w-4 h-4 animate-spin text-[#1A1A1A]" />
              <span>
                {currentLang === "en" ? "Sahayak is speaking / translating..." : "सहायक जानकारी तैयार कर रहा है..."}
              </span>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Quick Visual Question Prompters at the bottom (Highly Low-Literacy Friendly!) */}
      {messages.length < 5 && (
        <div className="px-4 py-3 bg-white border-t-4 border-[#1A1A1A] flex flex-col gap-2 shrink-0">
          <p className="text-[10px] font-black text-[#1A1A1A] uppercase tracking-widest font-mono">
            👉 {currentLang === "en" ? "Tapping questions (No typing needed)" : "कोई सवाल छुएं (टाइप करने की जरूरत नहीं)"}
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
            {QUICK_QUESTIONS.map((q) => (
              <button
                key={q.id}
                onClick={() => selectQuickQuestion(q)}
                className="text-left p-2.5 rounded-xl bg-white border-2 border-[#1A1A1A] shadow-[3px_3px_0_#1A1A1A] hover:shadow-[1px_1px_0_#1A1A1A] hover:translate-y-0.5 text-[11px] font-black text-[#1A1A1A] truncate cursor-pointer transition-all duration-200"
              >
                {q.label[currentLang]}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Manual Keyboard input bottom drawer */}
      <div className="p-4 bg-white border-t-4 border-[#1A1A1A] flex gap-2 shrink-0">
        <input
          type="text"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleSendMessage(inputValue)}
          placeholder={
            currentLang === "en" ? "Type your doubt here..." : 
            currentLang === "hi" ? "यहाँ अपना सवाल संक्षेप में लिखें..." :
            currentLang === "bn" ? "নিজের প্রশ্নটি এখানে লিখুন..." : "மீதி கேள்விகளை கேளுங்கள்..."
          }
          className="flex-1 bg-[#FEF9E7] border-2 border-[#1A1A1A] rounded-xl px-4 py-2.5 text-sm text-[#1A1A1A] placeholder-neutral-500 font-bold focus:outline-none focus:bg-white"
        />
        <button
          onClick={() => handleSendMessage(inputValue)}
          className="bg-[#FFD93D] hover:bg-[#FFE066] border-2 border-[#1A1A1A] text-[#1A1A1A] font-black px-5 rounded-xl flex items-center justify-center shadow-[2px_2px_0_#1A1A1A] cursor-pointer hover:translate-y-0.5 active:translate-y-1 active:shadow-none transition-all duration-200"
        >
          <Send className="w-4 h-4" />
        </button>
      </div>

    </div>
  );
}
