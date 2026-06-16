import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Scale, Volume2, VolumeX, Landmark, Filter, CheckCircle, Info, Sparkles, PhoneCall } from "lucide-react";
import { Language, GovtScheme } from "../types";
import { speakText, stopSpeaking, registerAudioStateListener } from "../utils/audio";

const SCHEMES_DATABASE: GovtScheme[] = [
  {
    id: "jan_dhan",
    name: {
      en: "Pradhan Mantri Jan Dhan Yojana (Zero Account)",
      hi: "प्रधानमंत्री जन धन योजना (जीरो बैलेंस बैंक खाता)",
      bn: "প্রধান মন্ত্রী জন ধন যোজনা (জিরো ব্যালেন্স অ্যাকাউন্ট)",
      ta: "பிரதமர் ஜன் தன் திட்டம் (வங்கி கணக்கு)",
      te: "ప్రధాన మంత్రి జన్ ధన్ యోజన (జీరో బ్యాంక్ ఖాతా)"
    },
    category: "finance",
    benefit: {
      en: "Free zero-balance saving bank account. Free RuPay debit card, and Rs. 2,00,000 accidental insurance coverage.",
      hi: "मुफ्त शून्य-बैलेंस बचत बैंक खाता। मुफ्त डेबिट कार्ड और ₹2,00,000 का दुर्घटना बीमा कवर। महिलाओं के लिए सुरक्षित बचत का स्थान।",
      bn: "বিনামূল্যে জিরো-ব্যালেন্স সেভিংস অ্যাকাউন্ট। ফ্রী রুপে ডেবিট কার্ড এবং ২,০০,০০০ টাকার দুর্ঘটনা বীমা কভারেজ।",
      ta: "இலவச ஜீரோ-பேலன்ஸ் வங்கி கணக்கு. இலவச ரூபே கார்டு மற்றும் ரூ. 2 லட்சம் விபத்து காப்பீடு.",
      te: "ఉచిత జీరో బ్యాలెన్స్ బ్యాంకు ఖాతా. ఉచిత రూపే డెబిట్ కార్డ్ మరియు రూ. 2 లక్షల ప్రమాద భీమా."
    },
    howToApply: {
      en: "Take 2 passport photos and Aadhaar Card. Walk to any nearest Government Bank or Customer Service Point (CSP) center. Say: 'Open Jan Dhan Account'. It is completely free.",
      hi: "पासपोर्ट साइज की 2 फोटो और आधार कार्ड लें। किसी भी नजदीकी सरकारी बैंक (SBI, PNB आदि) या कस्टमर सर्विस सेंटर (ग्राहक सेवा केंद्र) जाएं। कहिए 'जन धन खाता खोलना है'। यह बिल्कुल मुफ्त है।",
      bn: "২ কপি পাসপোর্ট ছবি ও আধার কার্ড সাথে নিন। নিকটস্থ যেকোনো রাষ্ট্রায়ত্ত ব্যাঙ্ক বা কাস্টমার সার্ভিস সেন্টারে যান। বলুন 'জনধন অ্যাকাউন্ট খুলতে চাই'। এটি সম্পূর্ণ বিনামূল্যে করা হয়।",
      ta: "2 புகைப்படங்கள் மற்றும் ஆதார் அட்டையுடன் அருகில் உள்ள அரசு வங்கிக்குச் செல்லவும். 'ஜன் தன் கணக்கு தொடங்க வேண்டும்' என்று கூறவும். இது முற்றிலும் இலவசம்.",
      te: "2 ఫోటోలు మరియు ఆదార్ కార్డు తీసుకుని దగ్గరలోని ప్రభుత్వ బ్యాంకుకి వెళ్ళండి. 'జన్ ధన్ ఖాతా తెరవాలి' అని చెప్పండి. ఇది పూర్తిగా ఉచితం."
    }
  },
  {
    id: "matru_vandana",
    name: {
      en: "Pradhan Mantri Matru Vandana Yojana (Maternity Support)",
      hi: "प्रधानमंत्री मातृ वंदना योजना (गर्भवती महिला सहायता)",
      bn: "প্রধানমন্ত্রী মাতৃ বন্দনা যোজনা (গর্ভবতী মায়েদের আর্থিক সাহায্য)",
      ta: "பிரதம மந்திரி மாத்ரு வந்தனா யோஜனா (மகப்பேறு நிதி உதவி)",
      te: "ప్రధాన మంత్రి మాతృ వందన యోజన (గర్భిణీ స్త్రీల సహాయం)"
    },
    category: "women",
    benefit: {
      en: "Rs. 5,000 cash directly transferred to the mother's bank account in installments for nutrition, vaccine and healthy birth support.",
      hi: "गर्भवती महिलाओं को पोषण, बच्चे के टीके और स्वस्थ जीवन के लिए ₹5,000 सीधे बैंक खाते में किस्तों में दिए जाते हैं।",
      bn: "গর্ভধারণকারী মায়েদের পুষ্টিকর খাবারের ও টিকার জন্য সরাসরি ব্যাঙ্ক অ্যাকাউন্টে ৫,০০০ টাকা দেওয়া হয় কিস্তির মাধ্যমে।",
      ta: "கர்ப்பிணிப் பெண்களுக்கு ஊட்டச்சத்திற்காக ரூ.5,000 ரொக்கமாக நேரடியாக வங்கி கணக்கில் செலுத்தப்படும்.",
      te: "గర్భిణీ స్త్రీల పోషకాహారం కోసం రూ. 5,000 నేరుగా బ్యాంకు ఖాతాలో వేయబడుతుంది."
    },
    howToApply: {
      en: "Meet your local ASHA worker (Health Didi) or Anganwadi center. Show your Pregnancy Registration slip. They will fill out and submit the simple form for you.",
      hi: "अपने गाँव की आशा दीदी (ASHA Worker) या आँगनवाड़ी केंद्र से मिलें। उन्हें गर्भावस्था का कार्ड (ANC Card) दिखाएं। वे आपके लिए फॉर्म मुफ्त में भरकर जमा करेंगी।",
      bn: "আপনার এলাকার আশাকর্মী (ASHA didi) বা অঙ্গনওয়াড়ী কেন্দ্রে যোগাযোগ করুন। গর্ভধারণের স্লিপ বা কার্ড দেখান। তারা আপনার ফর্মটি বিনামূল্যে ফিলাপ করে জমা দেবে।",
      ta: "உங்கள் ஊர் ஆஷா அங்கன்வாடி மையத்தை அணுகவும். கர்ப்பப் பதிவு அட்டையைக் காட்டவும். அவர்கள் விண்ணப்பத்தை இலவசமாகப் பதிவு செய்வார்கள்.",
      te: "మీ ఊరి ఆశా చేతి సహాయకురాలిని (ASHA didi) లేదా అంగన్‌వాడీ కేంద్రాన్ని కలవండి. గర్భిణీ నమోదు పత్రం చూపిస్తే చాలు, ఫార్మ్ పూర్తి చేస్తారు."
    }
  },
  {
    id: "self_help_group",
    name: {
      en: "National Rural Livelihoods Mission (Self Help SHG Loan)",
      hi: "राष्ट्रीय ग्रामीण आजीविका मिशन (महिला स्वयं सहायता समूह ऋण)",
      bn: "জাতীয় গ্রামীণ জীবিকা মিশন (মহিলা স্বনির্ভর গোষ্ঠী ঋণ)",
      ta: "தேசிய கிராமப்புற வாழ்வாதார இயக்கம் (மகளிர் சுயஉதவிக் குழு கடன்)",
      te: "జాతీయ గ్రామీణ జీవనోపాధి మిషన్ (మహిళా స్వయం సహాయక సంఘం రుణం)"
    },
    category: "livelihood",
    benefit: {
      en: "Low-interest loans up to Rs. 1,00,000 to Rs. 2,00,000 for women forming self-help groups (SHG) to start sewing, farming, grocery, or papad business.",
      hi: "महिला स्वयं सहायता समूहों को सिलाई, किराना दुकान, पापड़ उद्योग या मुर्गीपालन शुरू करने के लिए कम ब्याज दर पर ₹1,00,000 से ₹2,00,000 तक का आसान लोन।",
      bn: "সেলাই, সবজি চাষ, ছোট পিয়ারা দোকান বা পাঁপড় তৈরির কাজ শুরু করতে স্বনির্ভর গোষ্ঠীর মায়েদের কম সুদে সহজ ঋণ সুবিধা ১,০০,০০০ থেকে ২,০০,০০০ টাকা পর্যন্ত।",
      ta: "உள்நாட்டு தையல், சிறிய கடை தொடங்க மகளிர் சுய உதவி குழுக்களுக்கு ரூ. 1 லட்சம் முதல் ரூ. 2 லட்சம் வரை குறைந்த வட்டி கடன்.",
      te: "మహిళలు కుట్టుపని, చిన్న కిరాణా షాపులు పెట్టుకోవడానికి తక్కువ వడ్డీతో రూ. 1 లక్ష నుండి రూ. 2 లక్షల వరకు రుణం లభిస్తుంది."
    },
    howToApply: {
      en: "Talk to any neighbor involved in local 'Swayam Sahayata Group' or SHG. Attend their weekly meeting block. They will guide you to enlist your name securely.",
      hi: "अपने गाँव में सक्रिय महिला 'स्वयं सहायता समूह' (बचत समूह) के सदस्यों से बात करें। उनके साप्ताहिक बैठक खंड में जाएँ। वे मुफ्त में आपका पंजीकरण समूह में करा देंगी।",
      bn: "আপনার পাড়ার কোনো 'স্বনির্ভর দল' বা SHG-এর দিদিদের সাথে কথা বলুন। তাদের সাপ্তাহিক মিটিংয়ে যোগ দিয়ে দলে আপনার নাম অন্তর্ভুক্ত করুন। ব্যস!",
      ta: "உங்கள் பகுதியில் உள்ள மகளிர் சுயஉதவிக் குழுவினரிடம் பேசவும். குழு கூட்டத்தில் இணைந்து உங்கள் பெயரைப் பதிவு செய்யவும்.",
      te: "మీ వీధిలోని పొదుపు సంఘాల (SHG) మహిళలతో మాట్లాడండి. వారి వారపు సమావేశంలో చేరి మీ పేరు నమోదు చేసుకోండి."
    }
  },
  {
    id: "swasthya_bima",
    name: {
      en: "Ayushman Bharat Scheme (Free Health Card)",
      hi: "आयुष्मान भारत योजना (₹5 लाख मुफ्त इलाज कार्ड)",
      bn: "আয়ুষ্মান ভারত যোজনা (৫ লাখ টাকার ফ্রী চিকিৎসার কার্ড)",
      ta: "ஆயுஷ்மான் பாரத் யோஜனா (ரூ. 5 லட்சம் இலவச மருத்துவம்)",
      te: "ఆయుష్మాన్ భారత్ యోజన (రూ. 5 లక్షల ఉచిత వైద్యం కార్డ్)"
    },
    category: "health",
    benefit: {
      en: "Provides free hospital healthcare cover up to Rs. 5,00,000 per family per year, for major illnesses and child surgery.",
      hi: "सालभर में पूरे परिवार के लिए ₹5,00,000 तक का मुफ्त इलाज। गंभीर बीमारियों और सर्जरी के लिए बड़े अस्पतालों में पैसा नहीं देना होता।",
      bn: "প্রতি বছর পরিবারের সকলের জন্য ৫,০০,০০০ টাকা পর্যন্ত বিনামূল্যে সরকারি ও বড় বড় বেসরকারি হাসপাতালে চিকিৎসার সুবিধা।",
      ta: "வருடத்திற்கு குடும்பத்திற்கு ரூ. 5 லட்சம் வரை பெரிய அறுவை சிகிச்சை, தீவிர காய்ச்சல்களுக்கு இலவச சிகிச்சை காப்பீடு.",
      te: "ఏడాదికి ఒక కుటుంబానికి రూ. 5 లక్షల వరకు ఉచిత వైద్యం. శస్త్రచికిత్సలకు పెద్ద ఆసుపత్రులలో సేవలు ఉచితం."
    },
    howToApply: {
      en: "Go to any near CSC Digital Point (Common Service Centre) or Government Hospital desk. Take Aadhaar Card and Ration Card. Ask: 'Complete my Ayushman Card'.",
      hi: "अपने गाँव के कंप्यूटर कॉमन सर्विस सेंटर (CSC ग्राहक केंद्र) या सरकारी अस्पताल के आयुष्मान काउंटर पर जाएँ। आधार कार्ड और राशन कार्ड ले जाएँ। वे आपका कार्ड तुरंत बना देंगे।",
      bn: "যেকোনো কাছের সিএসসি কম্পিউটার সেন্টার বা সরকারি হাসপাতালের आयुष्मान भारत কাউন্টারে যান। আধার কার্ড ও রেশন কার্ড সাথে নিয়ে যান। তারা ইনস্ট্যান্ট কার্ড তৈরি করবে।",
      ta: "அருகிலுள்ள அரசு பொது சேவை மையத்திற்கு (CSC) ஆதார் அட்டை மற்றும் குடும்ப அட்டையுடன் செல்லவும். 'ஆயுஷ்மான் கார்டு' பெற்றுக்கொள்ளலாம்.",
      te: "దగ్గరలోని కంప్యూటర్ జనసేవా కేంద్రం (CSC) లేదా ప్రభుత్వ ఆసుపత్రికి వెళ్ళండి. ఆధార్ మరియు రేషన్ కార్డు తీసుకువెళితే ఉचित కార్డ్ ఇస్తారు."
    }
  }
];

export default function LegalSchemesModule({ currentLang }: { currentLang: Language }) {
  const [filterGender, setFilterGender] = useState<"all" | "female">("all");
  const [filterOccupation, setFilterOccupation] = useState<"all" | "tailor" | "farm" | "no_income">("all");
  
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [activeSpeechId, setActiveSpeechId] = useState<string | null>(null);

  useEffect(() => {
    registerAudioStateListener((speaking) => {
      setIsSpeaking(speaking);
      if (!speaking) setActiveSpeechId(null);
    });
    
    // Set legal schemes completed when exploring
    localStorage.setItem("jivsahayak_completed_legal", "true");
    window.dispatchEvent(new Event("jivsahayak_progress_updated"));

    return () => {
      stopSpeaking();
    };
  }, []);

  const getFilteredSchemes = () => {
    return SCHEMES_DATABASE.filter((scheme) => {
      if (filterGender === "female" && scheme.id === "swasthya_bima") return true; 
      if (filterGender === "female" && scheme.category !== "women" && scheme.category !== "livelihood" && scheme.category !== "finance") {
         return false;
      }
      if (filterOccupation === "tailor" && scheme.id === "swasthya_bima") return true;
      if (filterOccupation === "tailor" && scheme.category !== "livelihood" && scheme.id !== "jan_dhan") return false;
      
      return true;
    });
  };

  const filteredList = getFilteredSchemes();

  const playSchemeAudio = (scheme: GovtScheme) => {
    const text = `${scheme.name[currentLang]}. फायदा: ${scheme.benefit[currentLang]}. आवेदन कैसे करें: ${scheme.howToApply[currentLang]}`;
    
    if (activeSpeechId === scheme.id && isSpeaking) {
      stopSpeaking();
      setActiveSpeechId(null);
    } else {
      stopSpeaking();
      setActiveSpeechId(scheme.id);
      speakText(text, currentLang);
    }
  };

  const handlesHelpCall = () => {
    stopSpeaking();
    const callMsg = currentLang === "en"
      ? "Calling Women Safety Helpline 1091 is legally free. Always stand for your pride."
      : "महिलाओं की कानूनी रक्षा के लिए हेल्पलाइन 1 0 9 1 बिल्कुल मुफ्त है। बिना संकोच मदद के लिए पुकारें।";
    speakText(callMsg, currentLang);
  };

  return (
    <div className="max-w-4xl mx-auto rounded-3xl bg-white border-4 border-[#1A1A1A] overflow-hidden shadow-[8px_8px_0_#1A1A1A]">
      {/* Header Panel */}
      <div className="bg-[#FFD93D] p-6 border-b-4 border-[#1A1A1A] flex justify-between items-center flex-wrap gap-4">
        <div className="flex items-center gap-3">
          <Scale className="text-[#1A1A1A] w-8 h-8 font-black" />
          <div>
            <h2 className="text-xl font-black text-[#1A1A1A] font-display tracking-tight leading-none">
              {currentLang === "en" ? "Welfare Schemes & Legal Shield" : 
               currentLang === "hi" ? "सरकारी योजनाएँ और अधिकार केंद्र" : 
               currentLang === "bn" ? "সরকারী প্রকল্প ও অধিকার নির্দেশক" : 
               currentLang === "ta" ? "அரசு நலத்திட்டங்கள் & உரிமைகள்" : "ప్రభుత్వ పథకాలు & హక్కుల వేదిక"}
            </h2>
            <p className="text-xs font-mono font-black text-[#1A1A1A]/80 mt-1">SDG 5 & 10 Reducing Inequality gap</p>
          </div>
        </div>

        {/* Emergency Distress button */}
        <button
          onClick={handlesHelpCall}
          className="bg-[#FF6B6B] border-2 border-[#1A1A1A] text-white font-black px-4 py-2 rounded-xl flex items-center gap-2 text-xs shadow-[2px_2px_0_#1A1A1A] hover:translate-y-0.5 hover:shadow-[1px_1px_0_#1A1A1A] transition-all cursor-pointer"
        >
          <PhoneCall className="w-4 h-4 text-white animate-pulse" />
          <span>{currentLang === "en" ? "Women Safety Helpline: 1091" : "महिला हेल्पलाइन: 1091"}</span>
        </button>
      </div>

      <div className="p-6 md:p-8 grid grid-cols-1 md:grid-cols-12 gap-8 items-start bg-[#FEF9E7]">
        
        {/* Left Side: Simplified Questionnaire */}
        <div className="md:col-span-4 bg-white p-5 rounded-2xl border-4 border-[#1A1A1A] shadow-[4px_4px_0_#1A1A1A] flex flex-col gap-6">
          <div className="flex items-center gap-2 text-[#1A1A1A]">
            <Filter className="w-4 h-4" />
            <span className="text-xs font-black uppercase tracking-widest font-mono">
              {currentLang === "en" ? "Quick Profile Match" : "आसान फिल्टर"}
            </span>
          </div>

          {/* Gender Filter */}
          <div className="flex flex-col gap-2">
            <label className="text-xs font-black text-[#1A1A1A]">
              {currentLang === "en" ? "Whom is it for?" : "योजना किसके लिए है?"}
            </label>
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => { stopSpeaking(); setFilterGender("all"); }}
                className={`py-2.5 rounded-xl font-black text-xs border-2 cursor-pointer transition-all ${
                  filterGender === "all"
                    ? "bg-[#FFD93D] text-[#1A1A1A] border-[#1A1A1A] shadow-[1px_1px_0_#1A1A1A]"
                    : "bg-white text-neutral-700 border-neutral-300 hover:border-[#1A1A1A]"
                }`}
              >
                {currentLang === "en" ? "Whole Family" : "पूरे परिवार के लिए"}
              </button>
              <button
                onClick={() => { stopSpeaking(); setFilterGender("female"); }}
                className={`py-2.5 rounded-xl font-black text-xs border-2 cursor-pointer transition-all ${
                  filterGender === "female"
                    ? "bg-[#FFD93D] text-[#1A1A1A] border-[#1A1A1A] shadow-[1px_1px_0_#1A1A1A]"
                    : "bg-white text-neutral-700 border-neutral-300 hover:border-[#1A1A1A]"
                }`}
              >
                {currentLang === "en" ? "Women Only" : "केवल महिला / माँियों"}
              </button>
            </div>
          </div>

          {/* Occupation Filter */}
          <div className="flex flex-col gap-2">
            <label className="text-xs font-black text-[#1A1A1A]">
              {currentLang === "en" ? "What is your profession?" : "आजीविका / धंधा क्या है?"}
            </label>
            <div className="flex flex-col gap-2">
              <button
                onClick={() => { stopSpeaking(); setFilterOccupation("all"); }}
                className={`w-full py-2.5 text-left px-3 rounded-xl border-2 font-black text-xs cursor-pointer ${
                  filterOccupation === "all" 
                    ? "bg-[#FFD93D] text-[#1A1A1A] border-[#1A1A1A] shadow-[1px_1px_0_#1A1A1A]" 
                    : "bg-white text-neutral-700 border-neutral-300 hover:border-[#1A1A1A]"
                }`}
              >
                🌾 {currentLang === "en" ? "General Farming / Manual Job" : "सामान्य खेती / मनरेगा / मजदूरी"}
              </button>
              <button
                onClick={() => { stopSpeaking(); setFilterOccupation("tailor"); }}
                className={`w-full py-2.5 text-left px-3 rounded-xl border-2 font-black text-xs cursor-pointer ${
                  filterOccupation === "tailor" 
                    ? "bg-[#FFD93D] text-[#1A1A1A] border-[#1A1A1A] shadow-[1px_1px_0_#1A1A1A]" 
                    : "bg-white text-neutral-700 border-neutral-300 hover:border-[#1A1A1A]"
                }`}
              >
                🧵 {currentLang === "en" ? "Home Tailoring / Sewing" : "घर पर सिलाई / लघु उद्योग"}
              </button>
            </div>
          </div>

          <p className="text-[10px] text-neutral-500 font-bold leading-normal text-center mt-2">
            {currentLang === "en" ? "Select parameters to filter matched Indian state schemes instantly." : "अपने प्रोफाइल के अनुसार योजना ढूंढने के लिए ऊपर उचित बटन दबाएं।"}
          </p>
        </div>

        {/* Right Side: Matched Schemes with Audio narration cards */}
        <div className="md:col-span-8 flex flex-col gap-5">
          <div className="flex items-center justify-between border-b-2 border-neutral-300 pb-2">
            <span className="text-xs font-black text-[#1A1A1A]">
              {currentLang === "en" ? `Matched Programs (${filteredList.length})` : `आपके योग्य योजनाएं (${filteredList.length})`}
            </span>
            <span className="text-[10px] text-[#1A1A1A] font-black font-mono bg-[#FFF9C4] px-2.5 py-1 border-2 border-[#1A1A1A] rounded-full shadow-[1px_1px_0_#1A1A1A]">
              ★ Guaranteed Real Schemes
            </span>
          </div>

          {filteredList.length > 0 ? (
            filteredList.map((scheme) => {
              const isPlaying = activeSpeechId === scheme.id && isSpeaking;
              return (
                <div
                  key={scheme.id}
                  className="bg-white rounded-2xl p-5 border-4 border-[#1A1A1A] shadow-[6px_6px_0_#1A1A1A] flex flex-col gap-4 relative hover:shadow-[4px_4px_0_#1A1A1A] transition-all duration-300"
                >
                  <div className="flex justify-between items-start gap-4">
                    <div className="flex gap-3">
                      <div className="bg-[#FFEBCD] border-2 border-[#1A1A1A] text-[#1A1A1A] p-2.5 rounded-xl block shrink-0 shadow-[2px_2px_0_#1A1A1A]">
                        {scheme.category === "finance" ? "🏦" : scheme.category === "women" ? "🤰" : scheme.category === "health" ? "🩺" : "🧵"}
                      </div>
                      <div>
                        <h4 className="text-sm md:text-base font-black text-[#1A1A1A] leading-snug font-display">
                          {scheme.name[currentLang]}
                        </h4>
                        <span className="text-[10px] font-black font-mono text-[#1A1A1A]/80 uppercase">
                          {scheme.category} Welfare support
                        </span>
                      </div>
                    </div>

                    {/* Master Play Button */}
                    <button
                      onClick={() => playSchemeAudio(scheme)}
                      className={`p-3.5 rounded-2xl transition-all shadow-[2px_2px_0_#1A1A1A] cursor-pointer border-2 border-[#1A1A1A] shrink-0 ${
                        isPlaying
                          ? "bg-[#FF6B6B] text-white animate-pulse shadow-none translate-y-0.5"
                          : "bg-[#FFD93D] text-[#1A1A1A] hover:translate-y-0.5 hover:shadow-[1px_1px_0_#1A1A1A]"
                      }`}
                    >
                      {isPlaying ? (
                        <VolumeX className="w-5 h-5" />
                      ) : (
                        <Volume2 className="w-5 h-5" />
                      )}
                    </button>
                  </div>

                  {/* Benefit Block */}
                  <div className="bg-[#FEF9E7] p-4 rounded-xl border-2 border-[#1A1A1A] text-xs text-[#1A1A1A] leading-relaxed flex flex-col gap-1.5 shadow-[2px_2px_0_#1A1A1A]">
                    <span className="text-[10px] text-amber-700 uppercase tracking-wider font-extrabold flex items-center gap-1">
                      <Sparkles className="w-3.5 h-3.5" />
                      {currentLang === "en" ? "Benefits You Get:" : "आपको क्या लाभ मिलेगा:"}
                    </span>
                    <p className="font-bold leading-relaxed">
                      {scheme.benefit[currentLang]}
                    </p>
                  </div>

                  {/* Apply Block */}
                  <div className="text-xs text-[#1A1A1A] flex flex-col gap-1.5">
                    <span className="text-[10px] text-emerald-800 uppercase font-black flex items-center gap-1">
                      <CheckCircle className="w-3.5 h-3.5" />
                      {currentLang === "en" ? "How to Apply easily:" : "आवेदन कैसे करें (सरल शब्द):"}
                    </span>
                    <p className="font-bold leading-relaxed pl-1">
                      {scheme.howToApply[currentLang]}
                    </p>
                  </div>
                </div>
              );
            })
          ) : (
            <div className="text-center py-12 text-neutral-600 flex flex-col items-center gap-3">
              <Info className="w-10 h-10" />
              <p className="text-xs font-black">
                {currentLang === "en" ? "No matches found. Select Whole Family or reset filters." : "कोई योजना नहीं मिली। कृपया पुनः फिल्टर बदलें।"}
              </p>
            </div>
          )}
        </div>

      </div>

      {/* Safety Legal Footer */}
      <div className="p-4 bg-white text-center text-xs text-[#1A1A1A] font-black border-t-4 border-[#1A1A1A]">
        ⚖ {currentLang === "en" ? "Your legal awareness is your shield. For financial security, save only in official registered banks." : "सीखें: सरकारी योजना का पैसा बिचौलियों के हाथों में न दें, सीधे जन धन खाते में प्राप्त करें।"}
      </div>
    </div>
  );
}
