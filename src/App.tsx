import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Volume2, VolumeX, BookOpen, Coins, Heart, Scale, MessageSquareCode, Undo2, HelpCircle } from "lucide-react";
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Cell, PieChart, Pie } from "recharts";

// Local imports
import { Language, LANGUAGES, TRANSLATIONS } from "./types";
import { speakText, stopSpeaking, registerAudioStateListener, isCurrentlySpeaking } from "./utils/audio";
import StoryModule from "./components/StoryModule";
import FinanceModule from "./components/FinanceModule";
import HealthModule from "./components/HealthModule";
import LegalSchemesModule from "./components/LegalSchemesModule";
import SahayakAIModule from "./components/SahayakAIModule";
import SocialQuizModule from "./components/SocialQuizModule";

export default function App() {
  const [currentLang, setCurrentLang] = useState<Language>("hi");
  const [currentView, setCurrentView] = useState<"dashboard" | "stories" | "finance" | "health" | "legal" | "buddy" | "socialQuiz">("dashboard");
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [progressData, setProgressData] = useState({
    stories: false,
    finance: false,
    health: false,
    legal: false,
    buddy: false,
    socialQuiz: false
  });

  const loadProgress = () => {
    setProgressData({
      stories: localStorage.getItem("jivsahayak_completed_stories") === "true",
      finance: localStorage.getItem("jivsahayak_completed_finance") === "true",
      health: localStorage.getItem("jivsahayak_completed_health") === "true",
      legal: localStorage.getItem("jivsahayak_completed_legal") === "true",
      buddy: localStorage.getItem("jivsahayak_completed_buddy") === "true",
      socialQuiz: localStorage.getItem("jivsahayak_completed_social") === "true"
    });
  };

  useEffect(() => {
    // Sync active synthesizer state
    registerAudioStateListener((speaking) => {
      setIsSpeaking(speaking);
    });

    // Auto-welcome on load
    const greeting = "जीवसहायक में आपका स्वागत है। यह एक सुनने और समझने वाला खास पोर्टल है। अपनी भाषा चुनने के लिए नीचे दिए झंडों को छुएं।";
    speakText(greeting, "hi");

    // Load initial progress
    loadProgress();

    // Register active listener for progress bar events
    const onProgressUpdated = () => {
      loadProgress();
    };
    window.addEventListener("jivsahayak_progress_updated", onProgressUpdated);

    return () => {
      stopSpeaking();
      window.removeEventListener("jivsahayak_progress_updated", onProgressUpdated);
    };
  }, []);

  const t = TRANSLATIONS[currentLang];

  const modulesStatus = [
    { 
      name: currentLang === 'hi' ? "सिलाई कहानी"
            : currentLang === 'bn' ? "জীবনের গল্প"
            : currentLang === 'ta' ? "வாழ்க்கை கதைகள்"
            : currentLang === 'te' ? "జీవిత కథలు"
            : "Life Stories", 
      completed: progressData.stories ? 100 : 0, 
      color: "#FFF5E6", 
      fill: "#FF9F43",
      icon: "🦉"
    },
    { 
      name: currentLang === 'hi' ? "सब्जी दुकान"
            : currentLang === 'bn' ? "সবজি দোকান"
            : currentLang === 'ta' ? "காய்கறி கடை"
            : currentLang === 'te' ? "కూరగాయల షాపు"
            : "Savings Simulation", 
      completed: progressData.finance ? 100 : 0, 
      color: "#E2F5E5", 
      fill: "#4CAF50",
      icon: "💰"
    },
    { 
      name: currentLang === 'hi' ? "संतुलित थाली"
            : currentLang === 'bn' ? "পুষ্টিকর থালা"
            : currentLang === 'ta' ? "சத்துணவு"
            : currentLang === 'te' ? "పోషకాల పళ్లెం"
            : "Healthy Plate", 
      completed: progressData.health ? 100 : 0, 
      color: "#E3F2FD", 
      fill: "#2196F3",
      icon: "🥗"
    },
    { 
      name: currentLang === 'hi' ? "सरकारी योजना"
            : currentLang === 'bn' ? "সরকারী প্রকল্প"
            : currentLang === 'ta' ? "அரசு திட்டம்"
            : currentLang === 'te' ? "ప్రభుత్వ పథకం"
            : "Welfare Schemes", 
      completed: progressData.legal ? 100 : 0, 
      color: "#FFF9C4", 
      fill: "#FFC107",
      icon: "⚖️"
    },
    { 
      name: currentLang === 'hi' ? "सहायक एआई"
            : currentLang === 'bn' ? "সহায়ক এআই"
            : currentLang === 'ta' ? "சহாயக் ஏஐ"
            : currentLang === 'te' ? "సహాయక్ ఏఐ"
            : "Sahayak Buddy", 
      completed: progressData.buddy ? 100 : 0, 
      color: "#F3E5F5", 
      fill: "#9C27B0",
      icon: "🤝"
    },
    { 
      name: currentLang === 'hi' ? "सामाजिक क्विज़"
            : currentLang === 'bn' ? "সামাজিক কুইজ"
            : currentLang === 'ta' ? "சமூக பண்புகள்"
            : currentLang === 'te' ? "సామాజిక క్విజ్"
            : "Social Wisdom", 
      completed: progressData.socialQuiz ? 100 : 0, 
      color: "#FFF0E0", 
      fill: "#FF7043",
      icon: "🏆"
    }
  ];

  const completedCount = Object.values(progressData).filter(Boolean).length;
  const overallProgress = Math.round((completedCount / 6) * 100);

  const pieData = [
    { name: "Completed", value: completedCount },
    { name: "Remaining", value: 6 - completedCount }
  ];

  // Specific translations for progress tracker
  const progressTitle: Record<Language, string> = {
    hi: "📊 आपका अधिगम सफर और प्रगति चार्ट",
    bn: "📊 আপনার সামগ্রিক পড়াশোনা ও প্রোগ্রেস চার্ট",
    ta: "📊 உங்கள் கற்றல் பயணம் & முன்னேற்ற வரைபடம்",
    te: "📊 మీ మొత్తం అభ్యాస ప్రయాణం & ప్రగతి చార్ట్",
    en: "📊 Your Learning Journey & Progress Tracker"
  };

  const progressSubtitle: Record<Language, string> = {
    hi: "यह चार्ट दर्शाता है कि आपने जीवन के कौन से व्यावहारिक पहलुओं को सफलतापूर्वक सुलझाया है।",
    bn: "এই চার্টটি দেখায় যে আপনি জীবনের কোন ব্যবহারিক দিকগুলি সফলভাবে সমাধান করেছেন।",
    ta: "வாழ்க்கையின் எந்த முக்கியமான பகுதிகளை நீங்கள் வெற்றிகரமாக முடித்துள்ளீர்கள் என்பதை இது காட்டுகிறது.",
    te: "జీవితంలోని ఏ ముఖ్యమైన విషయాలను మీరు విజయవంతంగా నేర్చుకున్నారో ఈ చార్ట్ చూపిస్తుంది.",
    en: "Visualize which essential real-world life modules you have successfully explored and finished."
  };

  const completedLabel: Record<Language, string> = {
    hi: "पूर्ण",
    bn: "সম্পন্ন",
    ta: "முடிக்கப்பட்டது",
    te: "పూర్తయింది",
    en: "Done"
  };

  const activeLabel: Record<Language, string> = {
    hi: "सक्रिय",
    bn: "সক্রিয়",
    ta: "செயலில் உள்ளது",
    te: "కొనసాగుతోంది",
    en: "Active"
  };

  const modulesCompletedLabel: Record<Language, string> = {
    hi: "पूर्ण",
    bn: "সম্পন্ন",
    ta: "முழுமை",
    te: "పూర్తి",
    en: "Completed"
  };

  // Global screen narrator
  const speakAppOverview = () => {
    let rawText = "";
    if (currentLang === "hi") {
      rawText = "जीवसहायक। हम किताबें नहीं, जीवन जीना सिखाते हैं। यह पूरी तरह से सुनने के लिए बना ऐप है। नीचे सिलाई कहानी, सब्जी बजट खेल, स्वस्थ थाली, सरकारी योजनाएं या सहायक एआई से बात करने के लिए किसी भी बड़े बटन को स्पर्श करें।";
    } else if (currentLang === "bn") {
      rawText = "জীবসহায়ক। আমরা পাঠ্যবই শেখাই না — আমরা জীবন শেখাই। এটি কথা বলা এবং শোনার জন্য তৈরি অ্যাপ। নিজের ভাষায় প্রকল্প ও খেলার নিয়ম শুনতে স্পিকার বাটন টিপুন।";
    } else {
      rawText = `${t.welcome}. ${t.tagline}. ${t.subtitle} Choose your topics below to play simulations and find welfare programs easily.`;
    }

    if (isSpeaking) {
      stopSpeaking();
    } else {
      speakText(rawText, currentLang);
    }
  };

  // Change primary language locale
  const handleLangChange = (lang: Language) => {
    stopSpeaking();
    setCurrentLang(lang);
    
    // Physical welcome note in the clicked target language locale! Awesome UX
    const clickNotes: Record<Language, string> = {
      hi: "हिन्दी चुनी गई है। अब सारी आवाजें हिन्दी भाषा में सुनाई देंगी।",
      bn: "বাংলা ভাষা নির্বাচন করা হয়েছে। এখন সব অডিও বাংলায় শোনা যাবে।",
      ta: "தமிழ் மொழி தேர்ந்தெடுக்கப்பட்டது. குரல் வழிகாட்டி தயாராக உள்ளது.",
      te: "తెలుగు భాష ఎంచుకోబడింది. ఆడియో సిద్ధంగా ఉంది.",
      en: "English language selected. Audio synthesis is ready."
    };
    
    speakText(clickNotes[lang], lang);
  };

  const handleBackToHome = () => {
    stopSpeaking();
    setCurrentView("dashboard");
  };

  return (
    <div className="min-h-screen bg-[#FEF9E7] text-[#1A1A1A] flex flex-col font-sans leading-normal">
      
      {/* Visual Navigation Bar */}
      <header className="border-b-4 border-[#1A1A1A] bg-white sticky top-0 z-40 shrink-0 shadow-[0_4px_0_#1A1A1A]">
        <div className="max-w-7xl mx-auto px-4 py-4 md:px-8 flex justify-between items-center flex-wrap gap-4">
          
          <div className="flex items-center gap-2.5 cursor-pointer" onClick={handleBackToHome}>
            <div className="bg-[#FFD93D] font-black text-[#1A1A1A] w-10 h-10 rounded-xl flex items-center justify-center text-lg border-2 border-[#1A1A1A] shadow-[2px_2px_0_#1A1A1A]">
              जी
            </div>
            <div>
              <h1 className="text-xl font-black tracking-tight text-[#1A1A1A] font-display flex items-center gap-1.5 leading-none">
                JivSahayak
              </h1>
              <span className="text-[10px] font-bold text-neutral-600">
                Livelihood & Life Empowerment Agency
              </span>
            </div>
          </div>

          {/* Graphical Language Selectors (Big accessible flags + text readable on all screens) */}
          <div className="flex flex-wrap items-center justify-center gap-1 bg-white p-1 rounded-2xl border-2 border-[#1A1A1A] shadow-[3px_3px_0_#1A1A1A] max-w-full">
            {LANGUAGES.map((lang) => (
              <button
                key={lang.code}
                id={`lang_btn_${lang.code}`}
                onClick={() => handleLangChange(lang.code)}
                className={`flex items-center gap-1 px-2.5 py-1.5 sm:px-3 sm:py-2 rounded-xl text-[11px] sm:text-xs font-black transition-all duration-200 cursor-pointer ${
                  currentLang === lang.code
                    ? "bg-[#FFD93D] text-[#1A1A1A] border-2 border-[#1A1A1A] shadow-[2px_2px_0_#1A1A1A] scale-102"
                    : "text-neutral-600 hover:text-[#1A1A1A] border-2 border-transparent hover:bg-neutral-100"
                }`}
              >
                <span className="text-sm shrink-0">{lang.flag}</span>
                <span className="inline-block whitespace-nowrap">{lang.nativeName}</span>
              </button>
            ))}
          </div>
        </div>
      </header>

      {/* Main Container Stage */}
      <main className="flex-1 w-full max-w-7xl mx-auto px-4 py-8 md:px-8 flex flex-col gap-8">
        
        <AnimatePresence mode="wait">
          {currentView === "dashboard" ? (
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              className="flex flex-col gap-8"
              id="dashboard_layout"
            >
              {/* Feature Banner */}
              <div className="relative rounded-3xl overflow-hidden border-4 border-[#1A1A1A] shadow-[8px_8px_0_#1A1A1A] bg-white p-6 md:p-8 flex flex-col md:flex-row gap-8 items-center min-h-[300px]">
                
                {/* Visual Imagery */}
                <div className="w-full md:w-5/12 aspect-[16/9] rounded-2xl overflow-hidden bg-[#FEF9E7] border-4 border-[#1A1A1A] shadow-[4px_4px_0_#1A1A1A]">
                  <img
                    src="/src/assets/images/jivsahayak_hero_banner_1781631524464.jpg"
                    alt="JivSahayak Welcome block image representing rural Indian community smiling with quality education"
                    className="w-full h-full object-cover"
                    referrerPolicy="no-referrer"
                  />
                </div>

                <div className="w-full md:w-7/12 flex flex-col gap-4 text-left">
                  <span className="text-xs font-black tracking-widest text-[#1A1A1A] uppercase font-mono bg-[#FFD93D] border-2 border-[#1A1A1A] px-3 py-1.5 rounded-full inline-block self-start shadow-[2px_2px_0_#1A1A1A]">
                    ★ Primary SDG 4 & 5
                  </span>
                  
                  <h2 className="text-2xl md:text-4xl font-extrabold text-[#1A1A1A] font-display tracking-tight leading-tight">
                    {t.welcome}
                  </h2>
                  <p className="text-sm md:text-base text-neutral-700 leading-relaxed font-sans font-semibold">
                    {t.subtitle}
                  </p>

                  {/* Audio First user helpful tip banner */}
                  <div className="bg-[#4D96FF]/10 border-2 border-[#1A1A1A] rounded-2xl p-4 text-xs text-[#1A1A1A] font-extrabold shadow-[2px_2px_0_#1A1A1A]">
                    📢 {t.audioFirstHint}
                  </div>

                  {/* Master Play Button */}
                  <button
                    onClick={speakAppOverview}
                    id="play_app_overview_btn"
                    className={`self-start mt-2 px-6 py-3.5 rounded-2xl font-black text-sm tracking-wide border-2 border-[#1A1A1A] flex items-center gap-3 transition-all cursor-pointer ${
                      isSpeaking
                        ? "bg-[#FF6B6B] text-white shadow-[2px_2px_0_#1A1A1A] animate-pulse"
                        : "bg-[#FFD93D] text-[#1A1A1A] shadow-[4px_4px_0_#1A1A1A] hover:translate-y-0.5 hover:shadow-[2px_2px_0_#1A1A1A] active:translate-y-1 active:shadow-none"
                    }`}
                  >
                    {isSpeaking ? (
                      <>
                        <VolumeX className="w-5 h-5" />
                        <span>{t.stopAudio}</span>
                      </>
                    ) : (
                      <>
                        <Volume2 className="w-5 h-5 animate-bounce" />
                        <span>📢 {currentLang === 'hi' ? "इस वेबसाइट के बारे में सुनें" : t.playAudio}</span>
                      </>
                    )}
                  </button>
                </div>
              </div>

              {/* Total Learning Journey Progress Card with Recharts */}
              <div className="bg-white border-4 border-[#1A1A1A] rounded-3xl p-6 md:p-8 flex flex-col gap-6 shadow-[8px_8px_0_#1A1A1A]">
                <div className="flex flex-col gap-1.5 text-left">
                  <h3 className="text-xl md:text-2xl font-black text-[#1A1A1A] flex items-center gap-2 select-none">
                    {progressTitle[currentLang]}
                  </h3>
                  <p className="text-xs md:text-sm text-neutral-600 font-bold leading-normal">
                    {progressSubtitle[currentLang]}
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
                  
                  {/* Left Column: Donut PieChart Gauge */}
                  <div className="col-span-1 md:col-span-4 flex flex-col items-center justify-center p-4 bg-[#FEF9E7] border-2 border-[#1A1A1A] rounded-2xl shadow-[4px_4px_0_#1A1A1A] relative min-h-[240px]">
                    
                    <div className="relative w-40 h-40 flex items-center justify-center">
                      {/* Center Content Overlaid */}
                      <div className="absolute inset-x-0 flex flex-col items-center justify-center text-center select-none pointer-events-none">
                        <span className="text-3xl font-black text-[#1A1A1A]">{overallProgress}%</span>
                        <p className="text-[10px] font-black text-neutral-600 max-w-[90px] leading-tight uppercase tracking-wide">
                          {completedCount} / 6 {modulesCompletedLabel[currentLang]}
                        </p>
                      </div>

                      {/* Recharts Pie Donut */}
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie
                            data={pieData}
                            cx="50%"
                            cy="50%"
                            innerRadius={55}
                            outerRadius={75}
                            paddingAngle={3}
                            dataKey="value"
                            startAngle={90}
                            endAngle={-270}
                          >
                            <Cell key="completed" fill="#FFD93D" stroke="#1A1A1A" strokeWidth={3} />
                            <Cell key="remaining" fill="#FFFFFF" stroke="#1A1A1A" strokeWidth={3} />
                          </Pie>
                        </PieChart>
                      </ResponsiveContainer>
                    </div>

                    <span className="text-[11px] font-bold text-neutral-700 mt-2 text-center bg-[#FFD93D]/10 px-3 py-1 rounded-full border border-[#1A1A1A] select-none">
                      🎯 {completedCount === 6 
                        ? (currentLang === "en" ? "All Modules Accomplished!" : "सभी पाठ पूरे कर लिए गए!") 
                        : (currentLang === "en" ? "Keep Learning!" : "दौड़ें, हर कदम महत्वपूर्ण है!")}
                    </span>
                  </div>

                  {/* Right Column: Mini horizontal progress bars listing */}
                  <div className="col-span-1 md:col-span-8 p-4 md:p-6 bg-[#FEF9E7] border-2 border-[#1A1A1A] rounded-2xl shadow-[4px_4px_0_#1A1A1A] flex flex-col justify-between min-h-[240px]">
                    <div className="flex flex-col gap-3">
                      {modulesStatus.map((item, index) => (
                        <div key={index} className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3 justify-between pb-2 last:pb-0 border-b border-dashed border-neutral-300 sm:border-0 last:border-0">
                          <div className="flex items-center justify-between sm:justify-start gap-2 w-full sm:w-auto">
                            <div className="flex items-center gap-2 select-none">
                              <span className="text-base">{item.icon}</span>
                              <span className="text-xs font-black text-[#1A1A1A]">{item.name}</span>
                            </div>
                            {/* Option for mobile status badge, shown only on mobile */}
                            <span className={`text-[10px] font-black px-2 py-0.5 rounded-full border shadow-[1px_1px_0_#1A1A1A] shrink-0 select-none sm:hidden ${
                              item.completed === 100
                                ? "bg-[#4CAF50]/15 text-emerald-700 border-emerald-600"
                                : "bg-[#FF7043]/10 text-neutral-500 border-neutral-400"
                            }`}>
                              {item.completed === 100 ? `✓ ${completedLabel[currentLang]}` : `${activeLabel[currentLang]}`}
                            </span>
                          </div>

                          {/* Horizontal mini neo-custom progress lane */}
                          <div className="flex-1 w-full sm:max-w-[120px] md:max-w-xs h-3 bg-white border-2 border-[#1A1A1A] rounded-full overflow-hidden relative shadow-[1px_1px_0_#1A1A1A]">
                            <motion.div
                              initial={{ width: 0 }}
                              animate={{ width: `${item.completed}%` }}
                              transition={{ duration: 0.8, delay: index * 0.1 }}
                              className="h-full rounded-full"
                              style={{ backgroundColor: item.fill }}
                            />
                          </div>

                          {/* Completed tick badge indicator - hidden on mobile, shown on sm+ */}
                          <span className={`text-[10px] sm:text-xs font-black px-2.5 py-0.5 rounded-full border shadow-[1px_1px_0_#1A1A1A] shrink-0 select-none hidden sm:inline-block ${
                            item.completed === 100
                              ? "bg-[#4CAF50]/15 text-emerald-700 border-emerald-600"
                              : "bg-[#FF7043]/10 text-neutral-500 border-neutral-400"
                          }`}>
                            {item.completed === 100 ? `✓ ${completedLabel[currentLang]}` : `${activeLabel[currentLang]}`}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>

                </div>
              </div>

              {/* Launcher Category Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                
                {/* Card 1: Sunita Livelihood stories */}
                <div
                  id="nav_card_stories"
                  onClick={() => setCurrentView("stories")}
                  className="group bg-[#FFF5E6] border-4 border-[#1A1A1A] hover:bg-[#FFEBD0] rounded-3xl p-6 shadow-[6px_6px_0_#1A1A1A] hover:-translate-y-1 hover:shadow-[10px_10px_0_#1A1A1A] cursor-pointer transition-all duration-200 flex flex-col justify-between min-h-[220px]"
                >
                  <div className="flex flex-col gap-3">
                    <div className="w-12 h-12 rounded-2xl bg-white text-[#1A1A1A] border-2 border-[#1A1A1A] flex items-center justify-center text-2xl shadow-[2px_2px_0_#1A1A1A]">
                      🦉
                    </div>
                    <h3 className="text-lg font-extrabold text-[#1A1A1A] font-display">
                      {t.categories.stories}
                    </h3>
                    <p className="text-xs text-neutral-700 leading-normal font-semibold">
                      {t.categories.storiesDesc}
                    </p>
                  </div>
                  <span className="text-xs text-[#1A1A1A] font-black mt-4 flex items-center gap-1 group-hover:translate-x-1 transition-transform">
                    {t.startLearning} →
                  </span>
                </div>

                {/* Card 2: Lakshmi Merchant saving bank */}
                <div
                  id="nav_card_finance"
                  onClick={() => setCurrentView("finance")}
                  className="group bg-[#E2F5E5] border-4 border-[#1A1A1A] hover:bg-[#D1EED5] rounded-3xl p-6 shadow-[6px_6px_0_#1A1A1A] hover:-translate-y-1 hover:shadow-[10px_10px_0_#1A1A1A] cursor-pointer transition-all duration-200 flex flex-col justify-between min-h-[220px]"
                >
                  <div className="flex flex-col gap-3">
                    <div className="w-12 h-12 rounded-2xl bg-white text-[#1A1A1A] border-2 border-[#1A1A1A] flex items-center justify-center text-2xl shadow-[2px_2px_0_#1A1A1A]">
                      💰
                    </div>
                    <h3 className="text-lg font-extrabold text-[#1A1A1A] font-display">
                      {t.categories.finance}
                    </h3>
                    <p className="text-xs text-neutral-700 leading-normal font-semibold">
                      {t.categories.financeDesc}
                    </p>
                  </div>
                  <span className="text-xs text-[#1A1A1A] font-black mt-4 flex items-center gap-1 group-hover:translate-x-1 transition-transform">
                    {t.startLearning} →
                  </span>
                </div>

                {/* Card 3: Healthy Food plate balance */}
                <div
                  id="nav_card_health"
                  onClick={() => setCurrentView("health")}
                  className="group bg-[#E3F2FD] border-4 border-[#1A1A1A] hover:bg-[#D0E8FF] rounded-3xl p-6 shadow-[6px_6px_0_#1A1A1A] hover:-translate-y-1 hover:shadow-[10px_10px_0_#1A1A1A] cursor-pointer transition-all duration-200 flex flex-col justify-between min-h-[220px]"
                >
                  <div className="flex flex-col gap-3">
                    <div className="w-12 h-12 rounded-2xl bg-white text-[#1A1A1A] border-2 border-[#1A1A1A] flex items-center justify-center text-2xl shadow-[2px_2px_0_#1A1A1A]">
                      🥗
                    </div>
                    <h3 className="text-lg font-extrabold text-[#1A1A1A] font-display">
                      {t.categories.health}
                    </h3>
                    <p className="text-xs text-neutral-700 leading-normal font-semibold">
                      {t.categories.healthDesc}
                    </p>
                  </div>
                  <span className="text-xs text-[#1A1A1A] font-black mt-4 flex items-center gap-1 group-hover:translate-x-1 transition-transform">
                    {t.startLearning} →
                  </span>
                </div>

                {/* Card 4: Welfare Schemes */}
                <div
                  id="nav_card_legal"
                  onClick={() => setCurrentView("legal")}
                  className="group bg-[#FFF9C4] border-4 border-[#1A1A1A] hover:bg-[#FFF59D] rounded-3xl p-6 shadow-[6px_6px_0_#1A1A1A] hover:-translate-y-1 hover:shadow-[10px_10px_0_#1A1A1A] cursor-pointer transition-all duration-200 flex flex-col justify-between min-h-[220px]"
                >
                  <div className="flex flex-col gap-3">
                    <div className="w-12 h-12 rounded-2xl bg-white text-[#1A1A1A] border-2 border-[#1A1A1A] flex items-center justify-center text-2xl shadow-[2px_2px_0_#1A1A1A]">
                      ⚖
                    </div>
                    <h3 className="text-lg font-extrabold text-[#1A1A1A] font-display">
                      {t.categories.legal}
                    </h3>
                    <p className="text-xs text-neutral-700 leading-normal font-semibold">
                      {t.categories.legalDesc}
                    </p>
                  </div>
                  <span className="text-xs text-[#1A1A1A] font-black mt-4 flex items-center gap-1 group-hover:translate-x-1 transition-transform">
                    {t.startLearning} →
                  </span>
                </div>

                {/* Card 5: Sahayak AI Friend chat */}
                <div
                  id="nav_card_buddy"
                  onClick={() => setCurrentView("buddy")}
                  className="group bg-[#F3E5F5] border-4 border-[#1A1A1A] hover:bg-[#E8D0EE] rounded-3xl p-6 shadow-[6px_6px_0_#1A1A1A] hover:-translate-y-1 hover:shadow-[10px_10px_0_#1A1A1A] cursor-pointer transition-all duration-200 flex flex-col justify-between min-h-[220px]"
                >
                  <div className="flex flex-col gap-3">
                    <div className="w-12 h-12 rounded-2xl bg-white text-[#1A1A1A] border-2 border-[#1A1A1A] flex items-center justify-center text-2xl shadow-[2px_2px_0_#1A1A1A]">
                      🤝
                    </div>
                    <h3 className="text-lg font-extrabold text-[#1A1A1A] font-display font-sans">
                      {t.categories.buddy}
                    </h3>
                    <p className="text-xs text-neutral-700 leading-normal font-semibold">
                      {t.categories.buddyDesc}
                    </p>
                  </div>
                  <span className="text-xs text-[#1A1A1A] font-black mt-4 flex items-center gap-1 group-hover:translate-x-1 transition-transform">
                    {t.startLearning} →
                  </span>
                </div>

                {/* Card 6: Interactive Social Literacy Quizzes & Challenges */}
                <div
                  id="nav_card_social_quiz"
                  onClick={() => setCurrentView("socialQuiz")}
                  className="group bg-[#FFF0E0] border-4 border-[#1A1A1A] hover:bg-[#FFE2C8] rounded-3xl p-6 shadow-[6px_6px_0_#1A1A1A] hover:-translate-y-1 hover:shadow-[10px_10px_0_#1A1A1A] cursor-pointer transition-all duration-200 flex flex-col justify-between min-h-[220px]"
                >
                  <div className="flex flex-col gap-3">
                    <div className="w-12 h-12 rounded-2xl bg-white text-[#1A1A1A] border-2 border-[#1A1A1A] flex items-center justify-center text-2xl shadow-[2px_2px_0_#1A1A1A]">
                      🏆
                    </div>
                    <h3 className="text-lg font-extrabold text-[#1A1A1A] font-display">
                      {t.categories.socialQuiz}
                    </h3>
                    <p className="text-xs text-neutral-700 leading-normal font-semibold">
                      {t.categories.socialQuizDesc}
                    </p>
                  </div>
                  <span className="text-xs text-[#1A1A1A] font-black mt-4 flex items-center gap-1 group-hover:translate-x-1 transition-transform">
                    {t.startLearning} →
                  </span>
                </div>

                {/* Card 7: Offline Help Center support overview */}
                <div className="bg-white border-4 border-[#1A1A1A] rounded-3xl p-6 flex flex-col justify-between min-h-[220px] text-center items-center shadow-[6px_6px_0_#1A1A1A]">
                  <div className="flex flex-col gap-2 items-center">
                    <span className="text-3xl">ℹ️</span>
                    <h4 className="text-sm font-extrabold text-[#1A1A1A] font-display">
                      {currentLang === "en" ? "Low-Bandwidth Design" : "कम इंटरनेट खपत का अनुकूलन"}
                    </h4>
                    <p className="text-[11px] text-neutral-600 leading-normal font-bold">
                      {currentLang === "en" 
                        ? "No heavy visual frameworks. Audio compression makes this fully responsive on 2G/3G connections easily." 
                        : "कम इंटरनेट सिग्नल में भी तेज चलने के लिए यह पोर्टल बिना जटिल वीडियो फाइलों के तैयार हुआ है।"}
                    </p>
                  </div>
                  <span className="text-[10px] font-mono font-black text-neutral-500">
                    Version 2.5 Fully Stable
                  </span>
                </div>

              </div>
            </motion.div>
          ) : (
            <motion.div
              initial={{ opacity: 0, scale: 0.99 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.99 }}
              className="flex flex-col gap-4"
            >
              {/* Escape route option */}
              <button
                onClick={handleBackToHome}
                id="back_to_dashboard_btn"
                className="self-start py-2.5 px-4 rounded-xl bg-white text-[#1A1A1A] hover:bg-neutral-100 border-2 border-[#1A1A1A] flex items-center gap-2 cursor-pointer font-black text-xs shadow-[3px_3px_0_#1A1A1A] hover:translate-y-0.5 hover:shadow-[1px_1px_0_#1A1A1A] transition-all"
              >
                <Undo2 className="w-4 h-4" />
                <span>{t.backToDashboard}</span>
              </button>

              {/* Sub-component Screen Router */}
              {currentView === "stories" && <StoryModule currentLang={currentLang} onBack={handleBackToHome} />}
              {currentView === "finance" && <FinanceModule currentLang={currentLang} onBack={handleBackToHome} />}
              {currentView === "health" && <HealthModule currentLang={currentLang} onBack={handleBackToHome} />}
              {currentView === "legal" && <LegalSchemesModule currentLang={currentLang} />}
              {currentView === "buddy" && <SahayakAIModule currentLang={currentLang} />}
              {currentView === "socialQuiz" && <SocialQuizModule currentLang={currentLang} onBack={handleBackToHome} />}

            </motion.div>
          )}
        </AnimatePresence>

      </main>

      {/* Primary Footer */}
      <footer className="border-t-4 border-[#1A1A1A] bg-white py-6 text-center mt-12 shrink-0 shadow-[0_-4px_0_#1A1A1A]">
        <p className="text-xs text-[#1A1A1A] font-sans font-extrabold px-4">
          JivSahayak © 2026 • Quality Education (SDG 4) & Gender Equality (SDG 5) Empowerment Initiative • Free Assistance portal
        </p>
      </footer>
    </div>
  );
}
