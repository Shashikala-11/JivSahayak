export type Language = "en" | "hi" | "bn" | "ta" | "te";

export interface TranslationSet {
  welcome: string;
  tagline: string;
  subtitle: string;
  playAudio: string;
  stopAudio: string;
  selectLanguage: string;
  categories: {
    stories: string;
    storiesDesc: string;
    finance: string;
    financeDesc: string;
    health: string;
    healthDesc: string;
    legal: string;
    legalDesc: string;
    buddy: string;
    buddyDesc: string;
    socialQuiz: string;
    socialQuizDesc: string;
  };
  backToDashboard: string;
  startLearning: string;
  audioFirstHint: string;
}

export const LANGUAGES: { code: Language; name: string; nativeName: string; flag: string; speechLocale: string }[] = [
  { code: "hi", name: "Hindi", nativeName: "हिन्दी", flag: "🇮🇳", speechLocale: "hi-IN" },
  { code: "bn", name: "Bengali", nativeName: "বাংলা", flag: "🇮🇳", speechLocale: "bn-IN" },
  { code: "ta", name: "Tamil", nativeName: "தமிழ்", flag: "🇮🇳", speechLocale: "ta-IN" },
  { code: "te", name: "Telugu", nativeName: "తెలుగు", flag: "🇮🇳", speechLocale: "te-IN" },
  { code: "en", name: "English", nativeName: "English", flag: "🇬🇧", speechLocale: "en-IN" },
];

export const TRANSLATIONS: Record<Language, TranslationSet> = {
  en: {
    welcome: "Welcome to JivSahayak",
    tagline: "We Don't Teach Textbooks — We Teach Life",
    subtitle: "Empowering low-literacy communities in India with simple audio narration and gamified decisions.",
    playAudio: "Listen (Speech)",
    stopAudio: "Stop Voice",
    selectLanguage: "Choose Your Language",
    categories: {
      stories: "Life Stories & Decisions",
      storiesDesc: "Listen to Sunita's choices on domestic, social, and mindset scenarios.",
      finance: "Smart Trader Saving Bank",
      financeDesc: "Run Lakshmi's local vegetable shop, count money, and save in a bank safely.",
      health: "Healthy Food Plate",
      healthDesc: "Balance meals with vitamins & protein. Perfect health without hospital visits.",
      legal: "Govt Schemes & Rights",
      legalDesc: "Enter simple details to find welfare schemes you can apply for instantly.",
      buddy: "Sahayak AI Friend",
      buddyDesc: "Speak or type to receive life guidance in any regional Indian language.",
      socialQuiz: "Social Wisdom & Quizzes",
      socialQuizDesc: "Play gamified challenges on emotions, peaceful negotiation, and communication.",
    },
    backToDashboard: "Go Back to Home",
    startLearning: "Start Learning",
    audioFirstHint: "👉 This app is AUDIO-FIRST. Tap the yellow SPEAKER icon on any card or slide to HEAR it in your selected language!",
  },
  hi: {
    welcome: "जीवसहायक में आपका स्वागत है",
    tagline: "हम किताबें नहीं, जीवन जीना सिखाते हैं",
    subtitle: "सरल ऑडियो और ज्ञानवर्धक खेलों के माध्यम से भारत के हर समाज और परिवार को सशक्त बनाना।",
    playAudio: "सुनें (आवाज)",
    stopAudio: "आवाज रोकें",
    selectLanguage: "अपनी भाषा चुनें",
    categories: {
      stories: "जीवन की कहानियां और निर्णय",
      storiesDesc: "सिलाई उद्यमी सुनीता के घरेलू, सामाजिक और व्यावहारिक बदलाव के फैसले सुनें।",
      finance: "स्मार्ट विक्रेता बजट खेल",
      financeDesc: "लक्ष्मी की सब्जी की दुकान चलाएं, पैसे गिनें और बैंक में बचत करना सीखें।",
      health: "पोषण युक्त भोजन थाली",
      healthDesc: "प्रोटीन और हरी सब्जियों से थाली सजाएं। अस्पतालों के बिना स्वस्थ जीवन पाएं।",
      legal: "सरकारी योजनाएं और अधिकार",
      legalDesc: "3 आसान सवालों के जवाब देकर अपने लायक असली सरकारी सहायता का पता लगाएं।",
      buddy: "सहायक एआई मित्र (Sahayak)",
      buddyDesc: "कोई भी प्रश्न पूछें या बोलें, आपकी अपनी भाषा में तुरंत सहायक सलाह पाएं।",
      socialQuiz: "सामाजिक ज्ञान और क्विज़",
      socialQuizDesc: "भावनाओं को समझने, शांतिपूर्ण संवाद और भाईचारे पर आधारित खेल और चुनौतियाँ खेलें।",
    },
    backToDashboard: "मुख्य पृष्ठ पर जाएं",
    startLearning: "सीखना शुरू करें",
    audioFirstHint: "👉 यह ऐप विशेष रूप से सुनने के लिए है। किसी भी पाठ को अपनी भाषा में सुनने के लिए पीले स्पीकर 🔊 बटन को दबाएं!",
  },
  bn: {
    welcome: "জীবসহায়কে আপনাকে স্বাগত",
    tagline: "আমরা পাঠ্যবই শেখাই না — আমরা জীবন শেখাই",
    subtitle: "সহজ অডিও এবং খেলার ছলে ভারতের প্রতিটি সমাজ ও পরিবারকে স্বাবলম্বী করা।",
    playAudio: "শুনুন (অডিও)",
    stopAudio: "অডিও বন্ধ করুন",
    selectLanguage: "আপনার ভাষা নির্বাচন করুন",
    categories: {
      stories: "জীবনের গল্প ও সিদ্ধান্ত",
      storiesDesc: "সুনীতার সেলাই ব্যবসার গল্প ও সামাজিক পরিবর্তনের সিদ্ধান্তগুলি শুনুন।",
      finance: "স্মার্ট বিক্রেতা সঞ্চয় গেম",
      financeDesc: "লক্ষ্মীর সবজি দোকান চালান, টাকা হিসাব করুন ও ব্যাংকে জমানোর নিয়ম শিখুন।",
      health: "পুষ্টিকর খাদ্য থালা",
      healthDesc: "প্রোটিন ও ভিটামিনে ভরা থালা সাজান। হাসপাতাল ছাড়াই সুস্থ ও দীর্ঘজীবী হন।",
      legal: "সরকারী প্রকল্প ও অধিকার",
      legalDesc: "৩টি সহজ প্রশ্নের উত্তর দিয়ে আপনার যোগ্য সরকারী যোজনাগুলি খুঁজে বের করুন।",
      buddy: "সহায়ক এআই বন্ধু",
      buddyDesc: "যেকোনো জীবনমুখী বা সঞ্চয় প্রশ্ন জিজ্ঞাসা করুন, নিজের মাতৃভাষায় উত্তর পাবেন।",
      socialQuiz: "সামাজিক জ্ঞান ও কুইজ",
      socialQuizDesc: "সহানুভূতি, সঠিক কথোপকথন এবং বৈচিত্র্য নিয়ে সুন্দর রঙের খেলা কুইজ খেলুন।",
    },
    backToDashboard: "হোম পেজে ফিরে যান",
    startLearning: "শেখা শুরু করুন",
    audioFirstHint: "👉 এই অ্যাপটি অডিও-ফার্স্ট। নিজের ভাষায় শুনতে কার্ড বা স্লাইডের হলুদ স্পিকার 🔊 বাটনে চাপুন!",
  },
  ta: {
    welcome: "ஜீவ்சஹாயக் உலகிற்கு உங்களை வரவேற்கிறோம்",
    tagline: "நாங்கள் பாடம் கற்பிப்பதில்லை — நாங்கள் வாழ்க்கையைக் கற்பிக்கிறோம்",
    subtitle: "எளிய ஆடியோ மற்றும் விளையாட்டுகள் மூலம் இந்தியாவின் அனைத்து மக்களையும் முன்னேற்றுகிறோம்.",
    playAudio: "கேளுங்கள் (குரல்)",
    stopAudio: "குரலை நிறுத்து",
    selectLanguage: "உங்கள் மொழியைத் தேர்ந்தெடுக்கவும்",
    categories: {
      stories: "வாழ்க்கை கதைகள் & முடிவுகள்",
      storiesDesc: "சுனிதாவின் தையல் கற்றல் மற்றும் இல்லற முடிவுகளைக் கேட்டு கற்றுக்கொள்ளுங்கள்.",
      finance: "புத்திசாலி வியாபாரி சேமிப்பு ஆட்டம்",
      financeDesc: "லட்சுமியின் காய்கறி கடையை நடத்தி, பணத்தைச் சேமித்து வங்கி கணக்கில் வையுங்கள்.",
      health: "சத்தான உணவு தட்டு",
      healthDesc: "விட்டமின்கள் & புரதம் கொண்ட உணவைத் தேர்ந்தெடுத்து ஆரோக்கியமாக வாழுங்கள்.",
      legal: "அரசு திட்டங்கள் & உரிமைகள்",
      legalDesc: "3 எளிய கேள்விகளுக்குப் பதிலளித்து உங்களுக்கான அரசு நலத்திட்டங்களைக் காணுங்கள்.",
      buddy: "சஹாயக் ஏஐ நண்பன்",
      buddyDesc: "உங்கள் சொந்த மொழியில் ஏஐ நண்பனிடம் பேசி எளிய ஆலோசனைகளைப் பெறுங்கள்.",
      socialQuiz: "சமூக நற்பண்புகள் விளையாட்டு",
      socialQuizDesc: "உணர்வுகளின் மதிப்பு, சமாதானப் பேச்சுகள் மற்றும் சண்டையின்றிக் கையாளுவதைக் கற்றுக்கொள்ளுங்கள்.",
    },
    backToDashboard: "முகப்பு பக்கத்திற்குச் செல்ல",
    startLearning: "கற்கத் தொடங்குங்கள்",
    audioFirstHint: "👉 இந்தச் செயலி ஆடியோ-முதல் வடிவமைப்பு கொண்டது. கேட்க மஞ்சள் ஸ்பீக்கர் 🔊 பொத்தானை அழுத்தவும்!",
  },
  te: {
    welcome: "జీవసహాయక్ కి స్వాగతం",
    tagline: "మేము పాఠాలు నేర్పించము — జీవితాన్ని నేర్పిస్తాము",
    subtitle: "సులభమైన ఆడియో మరియు ఆటల ద్వారా గ్రామీణ మరియు తక్కువ చదువుకొన్న ప్రజలను శక్తివంతం చేయుట.",
    playAudio: "వినండి (ఆడియో)",
    stopAudio: "ఆడియో ఆపండి",
    selectLanguage: "మీ భాషను ఎంచుకోండి",
    categories: {
      stories: "జీవిత కథలు & నిర్ణయాలు",
      storiesDesc: "సునీత కుట్టుపని నేర్చుకోవడం, ఆమె పొదుపు మరియు కుటుంబ మార్పు నిర్ణయాలు వినండి.",
      finance: "స్మార్ట్ వ్యాపారి పొదుపు ఆట",
      financeDesc: "లక్ష్మి కూరగాయల దుకాణం నడపండి, డబ్బు లెక్కించి బ్యాంకులో పొదుపు చేయండి.",
      health: "పోషకమైన ఆహార పళ్లెం",
      healthDesc: "ప్రోటీన్ మరియు విటమిన్లు ఉన్న ఆహారాన్ని ఎంపिकी చేసి ఆరోగ్యం పెంచండి.",
      legal: "ప్రభుత్వ పథకాలు & హక్కులు",
      legalDesc: "3 సాధారణ ప్రశ్నలకు సమాధానమిచ్చి మీ అర్హత గల పథకాలను కనుగొనండి.",
      buddy: "సహాయక్ ఏఐ మిత్రుడు",
      buddyDesc: "మీ సొంత భాషలో ఏఐ మిత్రుడితో మాట్లాడి పొదుపు, ఆరోగ్యంపై సలహాలు పొందండి.",
      socialQuiz: "సామాజిక నైపుణ్యాల ఆట",
      socialQuizDesc: "భావోద్వేగాలు, గొడవల పరిష్కారం మరియు మర్యాదగల ప్రవర్తనలపై ఆటలు ఆడండి.",
    },
    backToDashboard: "ప్రధాన పేజీకి వెళ్ళండి",
    startLearning: "నేర్చుకోవడం ప్రారంభించండి",
    audioFirstHint: "👉 ఈ యాప్ ఆడియో-ఫస్ట్. మీ భాషలో వినడానికి ఏ కార్డ్ పైన అయినా పసుపు రంగు స్పీకర్ 🔊 బటన్ నొక్కండి!",
  },
};

// Story type definition
export interface StorySlide {
  id: number;
  image: string;
  enText: string;
  hiText: string;
  bnText: string;
  taText: string;
  teText: string;
  hasChoice: boolean;
  choices?: {
    text: Record<Language, string>;
    feedback: Record<Language, string>;
    scoreChange: { money: number; happiness: number };
    nextSlideId: number;
  }[];
}

// Govt Scheme definition
export interface GovtScheme {
  id: string;
  name: Record<Language, string>;
  category: "women" | "finance" | "health" | "livelihood";
  benefit: Record<Language, string>;
  howToApply: Record<Language, string>;
  url?: string;
}
