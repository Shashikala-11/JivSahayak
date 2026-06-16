import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Volume2, VolumeX, Landmark, ArrowRight, RefreshCw, ShoppingCart, Coins, ShieldAlert, BadgeInfo, CheckCircle } from "lucide-react";
import { Language } from "../types";
import { speakText, stopSpeaking, registerAudioStateListener } from "../utils/audio";

interface FinanceModuleProps {
  currentLang: Language;
  onBack: () => void;
}

interface MarketEarnItem {
  id: string;
  name: Record<Language, string>;
  qty: string;
  price: number;
  icon: string;
}

interface FinancialChoice {
  text: Record<Language, string>;
  feedback: Record<Language, string>;
  success: boolean;
  scoreChange: { purse: number; bank: number };
}

const VEGGIE_SALES_DAY1: MarketEarnItem[] = [
  { id: "tomatoes", name: { en: "Tomatoes", hi: "ताजा टमाटर", bn: "টাটকা টমেটো", ta: "தக்காளி", te: "టమోటాలు" }, qty: "5 kg", price: 150, icon: "🍅" },
  { id: "potatoes", name: { en: "Potatoes", hi: "आलू", bn: "আলু", ta: "உருளைக்கிழங்கு", te: "బంగాళదుంపలు" }, qty: "8 kg", price: 160, icon: "🥔" },
  { id: "spinach", name: { en: "Spinach", hi: "हरी पालक", bn: "সবুজ পালং", ta: "கீரை", te: "పాలకూర" }, qty: "3 bundles", price: 90, icon: "🥬" }
];

export default function FinanceModule({ currentLang, onBack }: FinanceModuleProps) {
  const [day, setDay] = useState(1);
  const [gameStage, setGameStage] = useState<"intro" | "sales" | "counting" | "decision" | "completed">("intro");
  
  // Game states
  const [purseCash, setPurseCash] = useState(50);
  const [bankSavings, setBankSavings] = useState(150);
  
  // Sales of the day
  const [currentSales, setCurrentSales] = useState<MarketEarnItem[]>(VEGGIE_SALES_DAY1);
  const [earnedTotal, setEarnedTotal] = useState(400); // 150+160+90 = 400
  
  // Coin counting stage
  const [countedTotal, setCountedTotal] = useState(0);
  const [remainingBills, setRemainingBills] = useState<{ id: string; value: number; label: string; color: string }[]>([]);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [decisionFeedback, setDecisionFeedback] = useState<string | null>(null);

  useEffect(() => {
    registerAudioStateListener((speaking) => {
      setIsSpeaking(speaking);
    });
    return () => stopSpeaking();
  }, []);

  // Calculate standard bills for counting stage based on earnedTotal
  const startCountingStage = () => {
    stopSpeaking();
    setCountedTotal(0);
    const bills: typeof remainingBills = [];
    let rem = earnedTotal;
    
    // Deconstruct 400 into standard visual notes
    while (rem >= 100) {
      bills.push({ id: `100_${Math.random()}`, value: 100, label: "₹100 Note", color: "bg-[#A5D8FF] text-[#1A1A1A] border-2 border-[#1A1A1A] shadow-[2px_2px_0_#1A1A1A]" });
      rem -= 100;
    }
    while (rem >= 50) {
      bills.push({ id: `50_${Math.random()}`, value: 50, label: "₹50 Note", color: "bg-[#FFD8F0] text-[#1A1A1A] border-2 border-[#1A1A1A] shadow-[2px_2px_0_#1A1A1A]" });
      rem -= 50;
    }
    while (rem >= 10) {
      bills.push({ id: `10_${Math.random()}`, value: 10, label: "₹10 Coin", color: "bg-[#FFD93D] text-[#1A1A1A] border-2 border-[#1A1A1A] shadow-[2px_2px_0_#1A1A1A]" });
      rem -= 10;
    }
    
    setRemainingBills(bills);
    setGameStage("counting");

    const instr = currentLang === "en" 
      ? "Tap each note and coin below to count Lakshmi's earnings. Helps you understand money additions." 
      : "सब्जियां बिक चुकी हैं! लक्ष्मी के कमाए पैसे गिनने के लिए नीचे दिए नोटों और सिक्कों पर एक-एक करके टच करें।";
    speakText(instr, currentLang);
  };

  const handleCoinTap = (bill: typeof remainingBills[0]) => {
    const nextTotal = countedTotal + bill.value;
    setCountedTotal(nextTotal);
    
    setRemainingBills((prev) => prev.filter((b) => b.id !== bill.id));

    let speechVal = "";
    if (currentLang === "hi") {
      speechVal = `${bill.value} रुपये! कुल हुआ ${nextTotal} रुपये।`;
    } else if (currentLang === "bn") {
      speechVal = `${bill.value} টাকা! মোট হল ${nextTotal} টাকা।`;
    } else {
      speechVal = `${bill.value} Rupees! Current sum is ${nextTotal} Rupees.`;
    }
    speakText(speechVal, currentLang);
  };

  const handleAutoCount = () => {
    setCountedTotal(earnedTotal);
    setRemainingBills([]);
    speakText(currentLang === "en" ? `Counted ${earnedTotal} Rupees.` : `कुल ${earnedTotal} रुपये गिन लिए गए हैं।`, currentLang);
  };

  const dayDecisions: Record<number, FinancialChoice[]> = {
    1: [
      {
        text: {
          en: "Store Rs.350 in Local Post Office / Bank Account & keep Rs.50 for daily food.",
          hi: "₹350 गाँव के डाकघर / बैंक खाते में जमा करें और ₹50 आज के भोजन के लिए रखें।",
          bn: "৩৫০ টাকা নিজের ব্যাঙ্ক বা পোস্ট অ্যাকাউন্টে জমান এবং ৫০ টাকা ঘরে সংসারের জন্য রাখুন।",
          ta: "ரூ.350 சேமிப்பு கணக்கிலும், ரூ.50 உணவிற்கும் வைக்கவும்.",
          te: "రూ. 350 పొదుపు చేయండి & రూ.50 భోజనం కోసం ఉంచండి."
        },
        feedback: {
          en: "Incredible choice! Your money is safe from mice, leaks, and spur-of-the-moment spends. It earns quarterly interest!",
          hi: "सर्वोत्तम निर्णय! आपका ₹350 बैंक में 100% सुरक्षित है। यह पैसा चूहों से, पानी लगने से, या किसी के चुराने से पूरी तरह बचेगा और इस पर बैंक ब्याज भी देगा।",
          bn: "সসঠিক সিদ্ধান্ত! আপনার ৩৫০ টাকা ব্যাঙ্কে সম্পূর্ণ সুরক্ষিত। তা চুরি হওয়া বা ইঁদুরের হাত থেকে বাঁচল এবং এর উপর সুদও পাবেন।",
          ta: "மிகச் சிறந்த முடிவு! இந்த ரூ.350 முற்றிலும் பாதுகாப்பாக உள்ளது. வட்டியும் வரும். குடும்ப தேவைகளுக்கும் பணம் இருக்கிறது.",
          te: "సరైన నిర్ణయము! మీ రూ. 350 బ్యాంకులో భద్రంగా ఉంది. దీనిపై వడ్డీ కూడా వస్తుంది."
        },
        success: true,
        scoreChange: { purse: 50, bank: 350 }
      },
      {
        text: {
          en: "Buy Rs.300 'Lucky double draw' lottery ticket from the moving dealer and spend Rs.100.",
          hi: "गाँव में आए फेरीवाले से ₹300 का 'पैसा पाँच गुना करने वाला लकी कूपन' खरीदें और ₹100 उड़ाएं।",
          bn: "গ্রামে আসা ভ্রাম্যমাণ ডিলারের থেকে ৩০০ টাকার 'টাকা পাঁচ গুণ লাকি ড্র' খেলুন এবং ১০০ টাকা খরচ করুন।",
          ta: "ரூ.300-க்கு குலுக்கல் சீட்டு வாங்கவும், ரூ.100-ஐ உடனடியாக வீணடிக்கவும்.",
          te: "రూ. 300 తో 'లక్కీ డ్రా' కూపన్ ప్యాక్ కొనండి మరియు రూ. 100 ఖర్చు చేయండి."
        },
        feedback: {
          en: "Oh no! The lottery dealer left the village tonight. The coupon was entirely fake. Lakshmi lost the hard earned Rs. 300. Never buy unregistered schemes!",
          hi: "ओह नहीं! शाम को वह फेरीवाला गाँव से गायब हो गया। वह कूपन सरासर नकली था। लक्ष्मी की सवेरे से सिलवाई पीठ और धूप में की कमाई के ₹300 पलभर में डूब गए।",
          bn: "হায় হায়! সন্ধ্যার পর সেই লটারী বিক্রেতা গ্রাম ছেড়ে পালাল। কুপনটি সম্পূর্ণ জাল ছিল। কষ্টের ৩০০ টাকা নষ্ট হল।",
          ta: "அய்யகோ! அந்த வியாபாரி மாலையிலேயே ஊரை விட்டு ஓடிவிட்டான். சீட்டு போலியானது. லட்சுமி கஷ்டப்பட்டு சம்பாதித்த ரூ.300 வீணானது!",
          te: "అయ్యో! ఆ లక్కీ డ్రా వ్యాపారి సాయంత్రానికే పారిపోయాడు. కూపన్ నకిలీ. లక్ష్మి కష్టపడి సంపాదించిన డబ్బు నష్టపోయింది."
        },
        success: false,
        scoreChange: { purse: 100, bank: 0 }
      }
    ]
  };

  const handleDecision = (choice: FinancialChoice) => {
    setPurseCash((prev) => Math.max(0, prev + choice.scoreChange.purse));
    setBankSavings((prev) => prev + choice.scoreChange.bank);
    setDecisionFeedback(choice.feedback[currentLang]);
    speakText(choice.feedback[currentLang], currentLang);
  };

  const nextDay = () => {
    stopSpeaking();
    setDecisionFeedback(null);
    setGameStage("completed");
    
    // Save finance module completion
    localStorage.setItem("jivsahayak_completed_finance", "true");
    window.dispatchEvent(new Event("jivsahayak_progress_updated"));
    
    speakText(currentLang === "en" ? "Splendid! Lakshmi has completed her first financial simulation day successfully." : "बहुत बढ़िया! लक्ष्मी ने बचत का पहला महत्वपूर्ण दिन सफलता के साथ पूरा कर लिया है।", currentLang);
  };

  const restartGame = () => {
    setDay(1);
    setPurseCash(50);
    setBankSavings(150);
    setCountedTotal(0);
    setDecisionFeedback(null);
    setGameStage("intro");
  };

  return (
    <div className="max-w-4xl mx-auto rounded-3xl bg-white border-4 border-[#1A1A1A] overflow-hidden shadow-[8px_8px_0_#1A1A1A]">
      {/* Module Title Row */}
      <div className="bg-[#FFD93D] p-6 border-b-4 border-[#1A1A1A] flex justify-between items-center flex-wrap gap-4">
        <div className="flex items-center gap-3">
          <Coins className="text-[#1A1A1A] w-8 h-8" />
          <div>
            <h2 className="text-xl font-black text-[#1A1A1A] font-display tracking-tight leading-none">
              {currentLang === "en" ? "Lakshmi's Smart Savings" : 
               currentLang === "hi" ? "लक्ष्मी की सब्जी की दुकान और बचत" : 
               currentLang === "bn" ? "লক্ষ্মীর সবজি দোকান ও নিরাপদ ব্যাঙ্ক" : 
               currentLang === "ta" ? "லட்சுமியின் காய்கறி கடை சேமிப்பு" : "లక్ష్మి కూరగాయల దుకాణం & పొదుపు ఆట"}
            </h2>
            <p className="text-xs font-mono font-black text-[#1A1A1A]/80 mt-1">SDG 1 & 8 Economic Growth</p>
          </div>
        </div>

        {/* Live Wallet Counters */}
        <div className="flex items-center gap-4">
          <div className="bg-white rounded-2xl px-4 py-2 border-2 border-[#1A1A1A] shadow-[2px_2px_0_#1A1A1A]">
            <p className="text-[10px] font-black text-neutral-600 font-sans uppercase">
              {currentLang === "en" ? "Lakshmi's Purse" : "लक्ष्मी का बटुआ / मानিব্যাগ"}
            </p>
            <p className="text-sm font-black text-amber-600 font-mono">₹{purseCash}</p>
          </div>
          <div className="bg-white rounded-2xl px-4 py-2 border-2 border-[#1A1A1A] shadow-[2px_2px_0_#1A1A1A] flex items-center gap-2">
            <Landmark className="w-4 h-4 text-[#1A1A1A]" />
            <div>
              <p className="text-[10px] font-black text-neutral-600 font-sans uppercase">
                {currentLang === "en" ? "Bank Savings" : "बैंक खाता / ব্যাঙ্কের টাকা"}
              </p>
              <p className="text-sm font-black text-emerald-600 font-mono">₹{bankSavings}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Container block */}
      <div className="p-6 md:p-8 bg-[#FEF9E7]">
        <AnimatePresence mode="wait">
          
          {/* Stage 1: Intro */}
          {gameStage === "intro" && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="flex flex-col gap-6 items-center text-center max-w-xl mx-auto"
            >
              <div className="relative w-full aspect-[4/3] rounded-2xl overflow-hidden border-4 border-[#1A1A1A] shadow-[4px_4px_0_#1A1A1A]">
                <img
                  src="/src/assets/images/financial_banking_hero_1781631557221.jpg"
                  alt="Market stall"
                  className="w-full h-full object-cover"
                  referrerPolicy="no-referrer"
                />
              </div>

              <div>
                <span className="text-xs bg-[#FF6B6B] text-white border-2 border-[#1A1A1A] shadow-[2px_2px_0_#1A1A1A] px-3 py-1.5 rounded-full font-mono font-black">
                  Day {day} Market Stand
                </span>
                <p className="text-[#1A1A1A] text-base font-bold leading-relaxed mt-5">
                  {currentLang === "en" 
                    ? "Welcome! Lakshmi sells fresh vegetables on her handcart daily. If she makes cash but hides it or spends it on unregistered lottery schemes, she loses. Let's start the bazaar day!" 
                    : "नमस्ते! लक्ष्मी हर दिन सब्जी मंडी से खुद सब्जी खरीदती है और ठेले पर बेचती है। आज सुबह उसने ₹100 की लागत से टमाटर, आलू और ताजी हरी पालक खरीदी। चलिए देखते हैं आज बाजार में कितनी बिक्री हुई!"}
                </p>
              </div>

              <div className="w-full">
                <button
                  onClick={() => {
                    setGameStage("sales");
                    const salesText = currentLang === "en" 
                      ? "Great! Customer bought Tomatoes for Rs.150, Potatoes for Rs.160, and spinach for Rs.90."
                      : "बाजार में ग्राहक आए! उन्होंने लक्ष्मी से ₹150 के टमाटर, ₹160 के आलू और ₹90 की हरी पालक खरीदी। अब बिक्री का हिसाब लगाना है!";
                    setCurrentSales(VEGGIE_SALES_DAY1);
                    speakText(salesText, currentLang);
                  }}
                  className="w-full py-4 rounded-2xl bg-[#FFD93D] border-2 border-[#1A1A1A] text-[#1A1A1A] font-black cursor-pointer shadow-[4px_4px_0_#1A1A1A] hover:translate-y-0.5 hover:shadow-[2px_2px_0_#1A1A1A] active:translate-y-1 active:shadow-none transition-all duration-200"
                >
                  {currentLang === "en" ? "📦 Start Bazaar Sales" : "📦 बाजार में बिक्री शुरू करें"}
                </button>
              </div>
            </motion.div>
          )}

          {/* Stage 2: Sales Screen */}
          {gameStage === "sales" && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex flex-col gap-6"
            >
              <div className="bg-white p-5 rounded-2xl border-2 border-[#1A1A1A] shadow-[4px_4px_0_#1A1A1A] flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <ShoppingCart className="text-[#1A1A1A] w-5 h-5" />
                  <span className="text-sm font-black text-[#1A1A1A]">
                    {currentLang === "en" ? "Lakshmi's Sales Today" : "आज के बाजार की कुल बिक्री"}
                  </span>
                </div>
                <div className="bg-[#D1EED5] px-3 py-1.5 border-2 border-[#1A1A1A] text-emerald-800 rounded-xl font-mono font-black text-sm shadow-[1px_1px_0_#1A1A1A]">
                  Earnings: ₹{earnedTotal}
                </div>
              </div>

              {/* Grid of sold veggies */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {currentSales.map((item) => (
                  <div key={item.id} className="bg-white rounded-2xl p-4 border-2 border-[#1A1A1A] text-center flex flex-col gap-2 relative overflow-hidden shadow-[4px_4px_0_#1A1A1A]">
                    <span className="text-4xl">{item.icon}</span>
                    <span className="text-sm font-black text-[#1A1A1A]">{item.name[currentLang]}</span>
                    <span className="text-xs text-neutral-500 font-mono font-bold">{item.qty} sold</span>
                    <div className="mt-2 bg-[#D1EED5] border-2 border-[#1A1A1A] py-1 rounded-xl text-emerald-800 font-black font-mono shadow-[2px_2px_0_#1A1A1A]">
                      + ₹{item.price}
                    </div>
                  </div>
                ))}
              </div>

              <div className="flex gap-4">
                <button
                  onClick={() => setGameStage("intro")}
                  className="flex-1 py-3 bg-white border-2 border-[#1A1A1A] text-[#1A1A1A] rounded-xl font-black shadow-[2px_2px_0_#1A1A1A] hover:bg-neutral-100 cursor-pointer"
                >
                  {currentLang === "en" ? "Back" : "पीछे"}
                </button>
                <button
                  onClick={startCountingStage}
                  className="flex-2 py-3 bg-[#FFD93D] border-2 border-[#1A1A1A] text-[#1A1A1A] rounded-xl font-black font-sans cursor-pointer shadow-[3px_3px_0_#1A1A1A] hover:translate-y-0.5 hover:shadow-[1px_1px_0_#1A1A1A] transition-all flex justify-center items-center gap-2"
                >
                  <span>{currentLang === "en" ? "Count the Money" : "💵 पैसे गिनना शुरू करें"}</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </motion.div>
          )}

          {/* Stage 3: Coin Counting */}
          {gameStage === "counting" && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex flex-col gap-6"
            >
              <div className="bg-[#FFEBCD] p-5 rounded-2xl border-2 border-[#1A1A1A] shadow-[4px_4px_0_#1A1A1A] flex flex-col gap-2">
                <div className="flex items-center gap-2">
                  <Coins className="text-[#1A1A1A] w-5 h-5 animate-spin" />
                  <span className="text-sm font-black text-[#1A1A1A]">
                    {currentLang === "en" ? "Help Lakshmi count" : "लक्ष्मी की पैसे गिनने में मदद करें"}
                  </span>
                </div>
                <p className="text-xs text-neutral-800 font-bold leading-normal">
                  {currentLang === "en" 
                    ? "Click on each money note or coin below. They stack directly into your purse total." 
                    : "पैसे गिनने के लिए नीचे बने प्रत्येक नोट या गोल सिक्के को टच करें।"}
                </p>
              </div>

              {/* Counts Counter */}
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-white p-4 rounded-xl border-2 border-[#1A1A1A] shadow-[4px_4px_0_#1A1A1A] text-center">
                  <p className="text-[10px] text-neutral-500 font-black uppercase">
                    {currentLang === "en" ? "Goal To Count" : "कुल गंतव्य / মোট হিসাব"}
                  </p>
                  <p className="text-lg font-black text-emerald-600 font-mono">₹{earnedTotal}</p>
                </div>
                <div className="bg-white p-4 rounded-xl border-2 border-[#1A1A1A] shadow-[4px_4px_0_#1A1A1A] text-center">
                  <p className="text-[10px] text-amber-600 font-black uppercase">
                    {currentLang === "en" ? "Your Count" : "आपका गिना हुआ / আপনার গণনা"}
                  </p>
                  <p className="text-lg font-black text-amber-500 font-mono">₹{countedTotal}</p>
                </div>
              </div>

              {/* Interactive Wallet Area */}
              <div className="bg-white p-6 rounded-2xl border-4 border-[#1A1A1A] shadow-[6px_6px_0_#1A1A1A] min-h-[140px] flex items-center justify-center flex-wrap gap-4">
                {remainingBills.length > 0 ? (
                  remainingBills.map((bill) => (
                    <button
                      key={bill.id}
                      onClick={() => handleCoinTap(bill)}
                      className={`px-4 py-3.5 border-2 rounded-2xl ${bill.color} font-black cursor-pointer text-xs md:text-sm hover:scale-105 active:scale-95 transition-all flex items-center gap-2`}
                    >
                      <span>💱</span>
                      <span>{bill.label}</span>
                    </button>
                  ))
                ) : (
                  <div className="text-center flex flex-col gap-2 items-center py-4">
                    <CheckCircle className="text-emerald-600 w-10 h-10 animate-bounce" />
                    <p className="text-sm font-black text-emerald-600">
                      {currentLang === "en" ? "Wonderful! All money counted." : "बहुत खूब! सारे पैसे सही-सही गिन लिए गए हैं।"}
                    </p>
                  </div>
                )}
              </div>

              {/* Fast completion */}
              <div className="flex gap-3">
                {remainingBills.length > 0 && (
                  <button
                    onClick={handleAutoCount}
                    className="flex-1 py-3 bg-white border-2 border-[#1A1A1A] hover:bg-neutral-100 text-[#1A1A1A] font-black rounded-xl shadow-[2px_2px_0_#1A1A1A] cursor-pointer"
                  >
                    🚀 {currentLang === "en" ? "Auto Count" : "जल्दी गिने (ऑटो)"}
                  </button>
                )}
                <button
                  disabled={remainingBills.length > 0}
                  onClick={() => {
                    setGameStage("decision");
                    setDecisionFeedback(null);
                    speakText(currentLang === "en" ? "Now let's make a savings choice." : "पैसे आ चुके हैं। अब हमें समझदारी से सोचना है कि इस पैसे का क्या किया जाए ताकि लक्ष्मी का भविष्य संवर सके।", currentLang);
                  }}
                  className={`flex-2 py-3 rounded-xl font-black text-sm shadow-[3px_3px_0_#1A1A1A] flex items-center justify-center gap-2 border-2 ${
                    remainingBills.length > 0
                      ? "bg-neutral-100 text-neutral-400 border-neutral-300 cursor-not-allowed shadow-none"
                      : "bg-[#FFD93D] border-[#1A1A1A] text-[#1A1A1A] hover:translate-y-0.5 hover:shadow-[1px_1px_0_#1A1A1A]"
                  }`}
                >
                  <span>{currentLang === "en" ? "Make Savings Decision" : "📝 मुख्य निर्णय लें"}</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </motion.div>
          )}

          {/* Stage 4: Financial Decisions */}
          {gameStage === "decision" && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex flex-col gap-6"
            >
              <div className="text-center bg-white p-4 rounded-xl border-2 border-[#1A1A1A] shadow-[4px_4px_0_#1A1A1A]">
                <span className="text-xs bg-[#FFD93D] text-[#1A1A1A] border-2 border-[#1A1A1A] shadow-[1px_1px_0_#1A1A1A] px-3 py-1.5 rounded-full font-mono font-black uppercase tracking-wide">
                  Lakshmi's Savings dilemma
                </span>
                <p className="text-sm font-black text-[#1A1A1A] mt-4">
                  {currentLang === "en" 
                    ? "Lakshmi made Rs. 400 total today. How should she allocate this money?" 
                    : "लक्ष्मी ने आज कुल ₹400 कमाए हैं। उसे इस सुरक्षा राशि का क्या करना चाहिए?"}
                </p>
              </div>

              <div className="flex flex-col gap-4">
                {dayDecisions[day]?.map((choice, idx) => (
                  <button
                    key={idx}
                    disabled={decisionFeedback !== null}
                    onClick={() => handleDecision(choice)}
                    className={`w-full text-left p-4 rounded-2xl border-2 shadow-[4px_4px_0_#1A1A1A] transition-all duration-200 flex items-start gap-4 cursor-pointer ${
                      decisionFeedback 
                        ? "bg-neutral-50 border-neutral-300 text-neutral-400 cursor-not-allowed shadow-none"
                        : "bg-white border-[#1A1A1A] hover:bg-[#FFF9C4] text-[#1A1A1A] hover:shadow-[2px_2px_0_#1A1A1A] hover:translate-y-0.5"
                    }`}
                  >
                    <div className="w-8 h-8 rounded-full bg-[#FFD93D] border-2 border-[#1A1A1A] text-[#1A1A1A] flex items-center justify-center font-black text-sm shrink-0 shadow-[1px_1px_0_#1A1A1A]">
                      {idx === 0 ? "1" : "2"}
                    </div>
                    <div>
                      <span className="text-sm md:text-base font-bold leading-relaxed block">
                        {choice.text[currentLang]}
                      </span>
                    </div>
                  </button>
                ))}
              </div>

              {/* Feedback readout */}
              {decisionFeedback && (
                <div className="bg-[#D1EED5] p-5 rounded-2xl border-4 border-[#1A1A1A] text-[#1A1A1A] text-sm leading-relaxed flex flex-col gap-4 shadow-[4px_4px_0_#1A1A1A]">
                  <div className="flex items-start gap-3">
                    <div className="bg-white border-2 border-[#1A1A1A] text-[#1A1A1A] p-2 rounded-xl shadow-[2px_2px_0_#1A1A1A]">
                      <BadgeInfo className="w-5 h-5" />
                    </div>
                    <p className="font-semibold leading-relaxed">
                      {decisionFeedback}
                    </p>
                  </div>
                  <button
                    onClick={nextDay}
                    className="self-end bg-[#FFD93D] border-2 border-[#1A1A1A] text-[#1A1A1A] font-black px-6 py-2 rounded-xl text-sm shadow-[3px_3px_0_#1A1A1A] hover:translate-y-0.5 hover:shadow-[1px_1px_0_#1A1A1A] transition-all cursor-pointer"
                  >
                    {currentLang === "en" ? "Complete Day" : "दिन समाप्त करें"}
                  </button>
                </div>
              )}
            </motion.div>
          )}

          {/* Stage 5: Completed */}
          {gameStage === "completed" && (
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="p-6 rounded-3xl bg-white border-4 border-[#1A1A1A] text-center flex flex-col gap-5 items-center max-w-lg mx-auto shadow-[8px_8px_0_#1A1A1A]"
            >
              <div className="w-16 h-16 bg-white border-2 border-[#1A1A1A] text-[#1A1A1A] rounded-full flex items-center justify-center shadow-[3px_3px_0_#1A1A1A]">
                <Landmark className="w-9 h-9" />
              </div>
              <div>
                <h3 className="text-xl font-black text-[#1A1A1A] font-display">
                  {currentLang === "en" ? "Savings Lesson Completed!" : "खेल समाप्त! लक्ष्मी का सुखद भविष्य!"}
                </h3>
                <p className="text-neutral-800 text-sm mt-3 leading-relaxed font-semibold">
                  {currentLang === "en" 
                    ? `Great job! Lakshmi has ₹${bankSavings} safe in her bank trust now. Storing earnings securely builds independence and prevents loss from street theft or fraud lottery coupons.`
                    : `शानदार प्रयास! लक्ष्मी के पास अब बैंक में ₹${bankSavings} सुरक्षित हैं। अपने दैनिक मुनाफे की बचत कर बैंक में जमा करना लक्ष्मी को आत्मनिर्भर बनाता है और उसे साहूकारों और फ्रॉड से सुरक्षित रखता है।`}
                </p>
              </div>

              <div className="flex gap-3 w-full">
                <button
                  onClick={restartGame}
                  className="flex-1 py-3 bg-white border-2 border-[#1A1A1A] text-[#1A1A1A] font-black text-sm rounded-xl cursor-pointer shadow-[2px_2px_0_#1A1A1A] hover:translate-y-0.5 transition-all flex justify-center items-center gap-2"
                >
                  <RefreshCw className="w-4 h-4" />
                  <span>{currentLang === "en" ? "Play Day 1 Again" : "खेल दोबारा शुरू करें"}</span>
                </button>
                <button
                  onClick={onBack}
                  className="flex-1 py-3 bg-[#FF6B6B] text-white border-2 border-[#1A1A1A] font-black text-sm rounded-xl cursor-pointer shadow-[2px_2px_0_#1A1A1A] hover:translate-y-0.5 transition-all"
                >
                  {currentLang === "en" ? "Other Modules" : "गैलेरी में जाएं"}
                </button>
              </div>
            </motion.div>
          )}

        </AnimatePresence>
      </div>

      {/* Footer Info */}
      <div className="p-4 bg-white border-t-4 border-[#1A1A1A] text-center text-xs text-[#1A1A1A] font-black flex items-center justify-center gap-1">
        <span>✅</span>
        <span>
          {currentLang === "en" 
            ? "Targets SDG 1 (No Poverty) and SDG 8 (Decent Work & Economic Growth) for low literacy vendor demographics." 
            : "सीखें: दैनिक बटुआ प्रबंधन (Purse) और बैंक बचत (Savings) का अंतर। चूहों, बीमारी और घोटालेबाजों से बचत ही असली सुरक्षा है।"}
        </span>
      </div>
    </div>
  );
}
