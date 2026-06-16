import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Heart, Volume2, VolumeX, ShieldCheck, RefreshCw, Sparkles, HelpCircle, Flame } from "lucide-react";
import { Language } from "../types";
import { speakText, stopSpeaking, registerAudioStateListener } from "../utils/audio";

interface FoodItem {
  id: string;
  name: Record<Language, string>;
  category: "carb" | "protein" | "vitamin" | "calcium" | "junk";
  icon: string;
  nutritionPoints: number;
  unhealthy: boolean;
  desc: Record<Language, string>;
}

const FOOD_ITEMS: FoodItem[] = [
  {
    id: "chapati",
    name: { en: "Roti / Chapati", hi: "रोटी / चपाती", bn: "রুটি / চাপতি", ta: "ரொட்டி / சப்பாத்தி", te: "రొట్టె / చపాతీ" },
    category: "carb",
    icon: "🫓",
    nutritionPoints: 20,
    unhealthy: false,
    desc: {
      en: "Roti gives hard working energy all day long.",
      hi: "रोटी और चावल शरीर को दिनभर कठिन परिश्रम करने की ताकत (ऊर्जा) देते हैं।",
      bn: "রুটি এবং ভাত শরীরকে সারাদিন কঠোর পরিশ্রম করার শক্তি যোগায়।",
      ta: "சப்பாத்தி உடலுக்கு நாள் முழுதும் உழைக்கத் தேவையான ஆற்றலைத் தருகிறது.",
      te: "చపాతీ రోజంతా కష్టపడి పనిచేయడానికి అవసరమైన शक्तिని ఇస్తుంది."
    }
  },
  {
    id: "dal",
    name: { en: "Dal / Lentils", hi: "दाल / दालें", bn: "ডাল / মসুর ডাল", ta: "பருப்பு", te: "పప్పు / పప్పుధాన్యాలు" },
    category: "protein",
    icon: "🥣",
    nutritionPoints: 25,
    unhealthy: false,
    desc: {
      en: "Dal builds muscle strength and heals external fatigue.",
      hi: "दाल और चना शरीर को मजबूत बनाते हैं, मांसपेशियों का विकास करते हैं और थकावट रोकते हैं।",
      bn: "ডাল এবং ছোলা শরীরকে মজবুত করে ও দুর্বলতা দূর করে।",
      ta: "பருப்பு தசை வலிமையை உருவாக்குகிறது, சோர்வை நீக்குகிறது.",
      te: "పప్పు కండరాలకు బలాన్ని ఇస్తుంది మరియు అలసటను తగ్గిస్తుంది."
    }
  },
  {
    id: "palak",
    name: { en: "Green Vegetables", hi: "हरी सब्जियां / हरी साग", bn: "সবুজ শাকসবজি", ta: "பச்சை காயறிகள்", te: "ఆకుకూరలు / కూరగాయలు" },
    category: "vitamin",
    icon: "🥬",
    nutritionPoints: 25,
    unhealthy: false,
    desc: {
      en: "Green spinach keeps your eyes bright and skin glowing.",
      hi: "पालक और हरी सब्जियां खाने से आँखें तेज होती हैं, खून बनता है और बीमारियाँ पास नहीं आतीं।",
      bn: "পালং ও সবুজ শাকসবজি খেলে চোখের জ্যোতি বাড়ে এবং রোগপ্রতিরোধ ক্ষমতা বৃদ্ধি পায়।",
      ta: "பசலைக்கீரை மற்றும் காய்கறிகள் கண்களை பிரகாசமாக்கி, நோய்களை விரட்டுகிறது.",
      te: "పాలకూర మరియు ఆకుకూరలు కంటి చూపుకు చాలా మంచిది, రక్తం పడుతుంది."
    }
  },
  {
    id: "milk",
    name: { en: "Curd / Milk", hi: "ताजा दूध / दही", bn: "দুধ বা দই", ta: "பால் / தயிர்", te: "పాలు / పెరుగు" },
    category: "calcium",
    icon: "🥛",
    nutritionPoints: 20,
    unhealthy: false,
    desc: {
      en: "Milk makes bones and teeth as tough as stones.",
      hi: "दूध और दही से हड्डियाँ और दाँत वज्र जैसे मजबूत होते हैं। बच्चों को अवश्य दें।",
      bn: "দুধ ও দই খেলে হাড় ও দাঁত পাথরের মত মজবুত হয়। শিশুদের জন্য অপরিহার্য।",
      ta: "பால் மற்றும் தயிர் எலும்புகளையும் பற்களையும் கல் போல வலுவாக்குகின்றன.",
      te: "పాలు మరియు పెరుగు ఎముకలను, పళ్ళను గట్టిగా ఉంచుతాయి. పిల్లలకు తప్పక ఇవ్వండి."
    }
  },
  {
    id: "apple",
    name: { en: "Fresh Fruit", hi: "ताजे मौसमी फल", bn: "टाटকা মরশুমি ফল", ta: "பழங்கள்", te: "తాజా పండ్లు" },
    category: "vitamin",
    icon: "🍎",
    nutritionPoints: 15,
    unhealthy: false,
    desc: {
      en: "Seasonal fruits safeguard our body from fevers and infection.",
      hi: "केले, संतरे या मौसमी फल हमारे शरीर को मौसमी बुखार और सर्दी-खांसी से बचाते हैं।",
      bn: "কলা, পেয়ারা বা মরশুমি ফল শরীরকে জ্বর, সর্দি-কাশি থেকে দূরে রাখে।",
      ta: "பழங்கள் நம் உடலை காய்ச்சல் மற்றும் தொற்று நோய்களிலிருந்து பாதுகாக்கின்றன.",
      te: "తాజా పండ్లు జలుబు, జ్వరం వంటి అనారోగ్యాల నుండి కాపాడుతాయి."
    }
  },
  {
    id: "samosa",
    name: { en: "Samosa / Fritters", hi: "समोसा / तैलीय नमकीन", bn: "সমোসা ও তেলেভাজা", ta: "சமோசா / வடை", te: "సమోసా / నూనెతో చేసినవి" },
    category: "junk",
    icon: "🔺",
    nutritionPoints: -10,
    unhealthy: true,
    desc: {
      en: "Too much fried oil causes stomach ache and heavy fatigue.",
      hi: "समोसे या गहरी तली चीजें स्वादिष्ट होती हैं, पर बार-बार खाने से पेट खराब होता है और आलस बढ़ता है।",
      bn: "তেলেভাজা ও সমোসা সুস্বাদু হলেও বেশি খেলে পেটের গণ্ডগোল ও অলসতা বাড়ে।",
      ta: "அதிக எண்ணெய் பலகாரங்கள் சுவையானவை, ஆனால் வயிறு கெட்டு சோர்வைத் தரும்.",
      te: "సమోసాలు రుచిగా ఉన్నా ఎక్కువగా తింటే జీర్ణ సమస్యలు వస్తాయి, కొలెస్ట్రాల్ పెరుగుతుంది."
    }
  }
];

export default function HealthModule({ currentLang, onBack }: { currentLang: Language; onBack: () => void }) {
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [currentFeedback, setCurrentFeedback] = useState<string | null>(null);

  useEffect(() => {
    registerAudioStateListener((speaking) => {
      setIsSpeaking(speaking);
    });
    return () => {
      stopSpeaking();
    };
  }, []);

  const toggleFood = (item: FoodItem) => {
    stopSpeaking();
    
    let nextIds = [...selectedIds];
    if (selectedIds.includes(item.id)) {
      nextIds = nextIds.filter((id) => id !== item.id);
    } else {
      nextIds.push(item.id);
    }
    
    setSelectedIds(nextIds);
    setCurrentFeedback(item.desc[currentLang]);

    speakText(item.desc[currentLang], currentLang);
  };

  const getNutritionMetrics = () => {
    let score = 0;
    let includesUnhealthy = false;
    let categoriesPresent = new Set<string>();

    selectedIds.forEach((id) => {
      const food = FOOD_ITEMS.find((f) => f.id === id);
      if (food) {
        score += food.nutritionPoints;
        if (food.unhealthy) includesUnhealthy = true;
        categoriesPresent.add(food.category);
      }
    });

    score = Math.max(0, Math.min(100, score));

    return {
      score,
      includesUnhealthy,
      isBalanced: categoriesPresent.has("carb") && categoriesPresent.has("protein") && categoriesPresent.has("vitamin") && categoriesPresent.has("calcium")
    };
  };

  const metrics = getNutritionMetrics();

  useEffect(() => {
    if (metrics.isBalanced) {
      if (localStorage.getItem("jivsahayak_completed_health") !== "true") {
        localStorage.setItem("jivsahayak_completed_health", "true");
        window.dispatchEvent(new Event("jivsahayak_progress_updated"));
      }
    }
  }, [metrics.isBalanced]);

  const handleClearPlate = () => {
    stopSpeaking();
    setSelectedIds([]);
    setCurrentFeedback(null);
  };

  const handleHearSummary = () => {
    stopSpeaking();
    
    if (selectedIds.length === 0) {
      const emptyTip = currentLang === "en" 
        ? "Your food plate is dry! Add Dal, Greens, and Milk above to check its nutritional strength."
        : "आपकी थाली अभी खाली है! ऊपर दी गई रोटी, दाल, हरी साग और दूध पर टच करके इसे पोषण से भरें और सीखें।";
      speakText(emptyTip, currentLang);
      return;
    }

    let summaryText = "";
    if (currentLang === "hi") {
      summaryText = `आपकी थाली का पोषण स्कोर है ${metrics.score} प्रतिशत। `;
      if (metrics.isBalanced) {
        summaryText += "मजेदार! आपकी थाली में रोटी से ऊर्जा, दाल से प्रोटीन, हरी साग से विटामिन और दूध से कैल्शियम सब मौजूद है। यह बच्चों और बड़ों को बिना महँगे अस्पताल के स्वस्थ रखेगा!";
      } else {
        summaryText += "आपकी थाली अच्छी है, पर और संतुलित हो सकती है। उत्तम स्वास्थ्य के लिए कम से कम एक दाल, एक हरी सब्जी और थोड़ा दही जरूर जोड़ें।";
      }
      if (metrics.includesUnhealthy) {
        summaryText += " ध्यान दें, थाली में समोसा या बाजार का तला खाना कम से कम रखें, यह पेट में गैस और भारीपन लाता है।";
      }
    } else if (currentLang === "bn") {
      summaryText = `আপনার থালার পুষ্টি স্কোর হল ${metrics.score} শতাংশ। `;
      if (metrics.isBalanced) {
        summaryText += "দারুণ! থালায় ভাতের সাথে ডাল, শাকসবজি ও ক্যালসিয়াম বা দই সবই আছে। এটি শরীরকে মজবুত রাখে ও ডাক্তারের খরচ বাঁচায়!";
      } else {
        summaryText += "থালাটি ভালো, তবে আরো ডাল ও শাকসবজি মিশিয়ে পুষ্টিকর করে তুলুন।";
      }
      if (metrics.includesUnhealthy) {
        summaryText += " মনে রাখবেন, তেলেভাজা খাবার পেট অম্ল করে ও এনার্জী কমায়।";
      }
    } else {
      summaryText = `Your nutrition score is ${metrics.score}%. `;
      if (metrics.isBalanced) {
        summaryText += "Excellent! You built a perfectly balanced plate containing energy carbs, building proteins, protective vitamins, and dairy calcium. This builds health without hospitals!";
      } else {
        summaryText += "To make it fully balanced, ensure you add a combination of lentils (dal), green leaves (spinach), and fresh dairy milk.";
      }
    }

    setCurrentFeedback(summaryText);
    speakText(summaryText, currentLang);
  };

  return (
    <div className="max-w-4xl mx-auto rounded-3xl bg-white border-4 border-[#1A1A1A] overflow-hidden shadow-[8px_8px_0_#1A1A1A]">
      {/* Header Block */}
      <div className="bg-[#FFD93D] p-6 border-b-4 border-[#1A1A1A] flex justify-between items-center flex-wrap gap-4">
        <div className="flex items-center gap-3">
          <Heart className="text-[#1A1A1A] w-8 h-8 font-black" />
          <div>
            <h2 className="text-xl font-black text-[#1A1A1A] font-display tracking-tight leading-none">
              {currentLang === "en" ? "Interactive Nutrition Plate" : 
               currentLang === "hi" ? "स्वस्थ पोषण थाली खेल" : 
               currentLang === "bn" ? "পুষ্টিকর খাদ্য থালা গেম" : 
               currentLang === "ta" ? "சத்தான உணவுத் தட்டு விளையாட்டு" : "పోషక సమతుల్య ఆహార పళ్లెం ఆట"}
            </h2>
            <p className="text-xs font-mono font-black text-[#1A1A1A]/80 mt-1">SDG 3 Quality Health Awareness</p>
          </div>
        </div>

        {/* Dynamic Score Dial */}
        <div className="bg-white rounded-2xl px-5 py-2.5 border-2 border-[#1A1A1A] text-center flex items-center gap-3 shadow-[2px_2px_0_#1A1A1A]">
          <span className="text-2xl">🥗</span>
          <div>
            <p className="text-[10px] font-black text-neutral-600 font-sans uppercase leading-none">
              {currentLang === "en" ? "Nutrition Score" : "पोषण रेटिंग / পুষ্টি মান"}
            </p>
            <p className={`text-sm font-black font-mono leading-none mt-1`}>
              {metrics.score}%
            </p>
          </div>
        </div>
      </div>

      <div className="p-6 md:p-8 grid grid-cols-1 md:grid-cols-12 gap-8 items-start bg-[#FEF9E7]">
        
        {/* Left Side: Drag/Tap items */}
        <div className="md:col-span-5 flex flex-col gap-4">
          <h3 className="text-xs font-black text-[#1A1A1A] uppercase tracking-widest font-mono">
            {currentLang === "en" ? "Select Staples" : "सामग्री छुएं (टैप करें)"}
          </h3>

          <div className="grid grid-cols-2 gap-3">
            {FOOD_ITEMS.map((item) => {
              const selected = selectedIds.includes(item.id);
              return (
                <button
                  key={item.id}
                  onClick={() => toggleFood(item)}
                  className={`p-4 rounded-2xl text-center border-2 transition-all duration-300 cursor-pointer flex flex-col items-center gap-2 relative shadow-[2px_2px_0_#1A1A1A] hover:translate-y-0.5 hover:shadow-[1px_1px_0_#1A1A1A] group ${
                    selected
                      ? "bg-[#E2F5E5] border-[#1A1A1A] text-[#1A1A1A]"
                      : "bg-white border-[#1A1A1A] hover:bg-neutral-50 text-[#1A1A1A]"
                  }`}
                >
                  <span className="text-4xl group-hover:scale-110 transition-transform duration-300">
                    {item.icon}
                  </span>
                  <span className="text-xs font-black leading-tight text-[#1A1A1A]">
                    {item.name[currentLang]}
                  </span>
                  
                  {/* Category Pill Tag */}
                  <span className="text-[9px] font-black font-mono px-2 py-0.5 rounded-full capitalize bg-white border border-[#1A1A1A]">
                    {item.category}
                  </span>

                  {selected && (
                    <div className="absolute top-2 right-2 bg-[#FFD93D] border-2 border-[#1A1A1A] text-[#1A1A1A] w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-black shadow-[1px_1px_0_#1A1A1A]">
                      ✓
                    </div>
                  )}
                </button>
              );
            })}
          </div>

          <button
            onClick={handleClearPlate}
            className="w-full py-2 bg-white border-2 border-[#1A1A1A] hover:bg-neutral-100 text-xs text-[#1A1A1A] font-black rounded-xl shadow-[2px_2px_0_#1A1A1A] cursor-pointer"
          >
            {currentLang === "en" ? "Reset Plate" : "थाली साफ करें / থালা খালি করুন"}
          </button>
        </div>

        {/* Right Side: Visual Plate Representation & Audio Readouts */}
        <div className="md:col-span-7 flex flex-col gap-6">
          <h3 className="text-xs font-black text-[#1A1A1A] uppercase tracking-widest font-mono text-center">
            {currentLang === "en" ? "Sunita & Children's Balance Plate" : "आपकी संतुलित सजी थाली"}
          </h3>

          {/* Central Plate circle container */}
          <div className="relative rounded-full aspect-square max-w-[280px] mx-auto bg-white border-[10px] border-[#1A1A1A] shadow-[6px_6px_0_#1A1A1A] flex items-center justify-center p-6">
            
            {/* Structural divided plate lines inside */}
            <div className="absolute inset-0 rounded-full border-2 border-neutral-300 pointer-events-none"></div>
            <div className="absolute h-full w-[2px] bg-neutral-300/40 left-1/2 pointer-events-none"></div>
            <div className="absolute w-full h-[2px] bg-neutral-300/40 top-1/2 pointer-events-none"></div>

            <AnimatePresence>
              {selectedIds.length === 0 ? (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="text-center flex flex-col items-center gap-2 p-4 text-neutral-500 z-10"
                >
                  <span className="text-4xl animate-pulse">🍽️</span>
                  <p className="text-xs font-black text-neutral-600">
                    {currentLang === "en" ? "Plate is empty" : "थाली खाली है"}
                  </p>
                  <p className="text-[10px] font-bold text-neutral-500">
                    {currentLang === "en" ? "Tap foods on the left to add" : "सजने के लिए सप्लीमेंट छुएं"}
                  </p>
                </motion.div>
              ) : (
                <motion.div className="grid grid-cols-3 gap-3 z-10">
                  {selectedIds.map((id) => {
                    const f = FOOD_ITEMS.find((food) => food.id === id);
                    if (!f) return null;
                    return (
                      <motion.div
                        key={f.id}
                        initial={{ scale: 0, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        exit={{ scale: 0, opacity: 0 }}
                        className="w-12 h-12 md:w-16 md:h-16 rounded-full bg-[#FFD93D] border-2 border-[#1A1A1A] flex flex-col items-center justify-center shadow-[2px_2px_0_#1A1A1A]"
                      >
                        <span className="text-xl md:text-3xl">{f.icon}</span>
                      </motion.div>
                    );
                  })}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Core Action Call Audio Button */}
          <button
            onClick={handleHearSummary}
            className={`w-full py-4 rounded-2xl font-black flex items-center justify-center gap-3 border-2 border-[#1A1A1A] shadow-[4px_4px_0_#1A1A1A] transition-all cursor-pointer ${
              isSpeaking
                ? "bg-[#FF6B6B] text-white animate-pulse"
                : "bg-[#FFD93D] text-[#1A1A1A] hover:translate-y-0.5 hover:shadow-[2px_2px_0_#1A1A1A] active:translate-y-1 active:shadow-none"
            }`}
          >
            {isSpeaking ? (
              <>
                <VolumeX className="w-5 h-5" />
                <span>{currentLang === "en" ? "Stop Voice Guide" : "आवाज रोकें / অডিও থামান"}</span>
              </>
            ) : (
              <>
                <Volume2 className="w-5 h-5" />
                <span>{currentLang === "en" ? "🔊 Listen to Plate Analysis" : "🔊 भोजन थाली का विश्लेषण सुनें"}</span>
              </>
            )}
          </button>

          {/* Dynamic Interactive Tips */}
          {currentFeedback && (
            <motion.div
              initial={{ opacity: 0, y: 5 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white p-5 rounded-2xl border-4 border-[#1A1A1A] text-[#1A1A1A] text-sm leading-relaxed shadow-[4px_4px_0_#1A1A1A]"
            >
              <div className="flex gap-2.5">
                <span className="text-xl">💡</span>
                <p className="font-semibold leading-relaxed font-sans">{currentFeedback}</p>
              </div>
            </motion.div>
          )}

          {/* Balance checklist */}
          {selectedIds.length > 0 && (
            <div className="bg-white p-4 rounded-xl border-2 border-[#1A1A1A] shadow-[2px_2px_0_#1A1A1A] grid grid-cols-2 gap-2 text-xs text-[#1A1A1A]">
              <span className={selectedIds.some(id => FOOD_ITEMS.find(f => f.id === id)?.category === 'carb') ? "text-emerald-700 font-extrabold" : "text-neutral-500 font-bold"}>
                {selectedIds.some(id => FOOD_ITEMS.find(f => f.id === id)?.category === 'carb') ? "✓ " : "○ "} 
                {currentLang === "en" ? "Carbs (Energy)" : "रोटी / चावल (ताकत)"}
              </span>
              <span className={selectedIds.some(id => FOOD_ITEMS.find(f => f.id === id)?.category === 'protein') ? "text-emerald-700 font-extrabold" : "text-neutral-500 font-bold"}>
                {selectedIds.some(id => FOOD_ITEMS.find(f => f.id === id)?.category === 'protein') ? "✓ " : "○ "} 
                {currentLang === "en" ? "Protein (Muscles)" : "दाल / चना (मांसपेशी)"}
              </span>
              <span className={selectedIds.some(id => FOOD_ITEMS.find(f => f.id === id)?.category === 'vitamin') ? "text-emerald-700 font-extrabold" : "text-neutral-500 font-bold"}>
                {selectedIds.some(id => FOOD_ITEMS.find(f => f.id === id)?.category === 'vitamin') ? "✓ " : "○ "} 
                {currentLang === "en" ? "Vitamins (Bright Eyes)" : "हरी सब्जी / साग (रोग प्रतिरोध)"}
              </span>
              <span className={selectedIds.some(id => FOOD_ITEMS.find(f => f.id === id)?.category === 'calcium') ? "text-emerald-700 font-extrabold" : "text-neutral-500 font-bold"}>
                {selectedIds.some(id => FOOD_ITEMS.find(f => f.id === id)?.category === 'calcium') ? "✓ " : "○ "} 
                {currentLang === "en" ? "Calcium (Strong Bones)" : "दूध / दही (हड्डियाँ)"}
              </span>
            </div>
          )}

        </div>
      </div>

      <div className="p-4 bg-white text-center text-xs text-[#1A1A1A] font-black border-t-4 border-[#1A1A1A]">
        🥦 {currentLang === "en" ? "Simple nutritious combinations guard families from diseases and high cost checkups." : "ताजा खाइए, स्वस्थ रहिए। दाल, हरी पालक, और ताजे फल आपके स्वास्थ्य के रक्षक हैं।"}
      </div>
    </div>
  );
}
