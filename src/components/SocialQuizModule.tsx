import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "motion/react";
import { 
  Volume2, 
  VolumeX, 
  Sparkles, 
  Trophy, 
  Award, 
  Timer, 
  ArrowRight, 
  Check, 
  AlertCircle, 
  RotateCcw, 
  Shield, 
  Compass, 
  Smile, 
  Users, 
  MessageSquare, 
  Volume1,
  UserCheck
} from "lucide-react";
import { Language } from "../types";
import { speakText, stopSpeaking, registerAudioStateListener, isCurrentlySpeaking } from "../utils/audio";

interface SocialQuizModuleProps {
  currentLang: Language;
  onBack: () => void;
}

interface QuizScenario {
  id: number;
  topic: Record<Language, string>;
  icon: string;
  badgeId: string;
  badgeName: Record<Language, string>;
  badgeIcon: string;
  badgeColor: string;
  narrative: Record<Language, string>;
  question: Record<Language, string>;
  choices: {
    id: "a" | "b";
    text: Record<Language, string>;
    feedback: Record<Language, string>;
    success: boolean;
  }[];
}

interface LeaderboardEntry {
  name: string;
  points: number;
  isUser?: boolean;
  avatar: string;
}

const LOCAL_SCENARIOS: QuizScenario[] = [
  {
    id: 1,
    topic: {
      en: "Understanding Emotions",
      hi: "भावनाओं की समझ (सहानुभूति)",
      bn: "অনুভূতি বোঝার ক্ষমতা",
      ta: "உணர்வுகளைப் புரிதல்",
      te: "భావోద్వేగాలను అర్థం చేసుకోవడం"
    },
    icon: "💝",
    badgeId: "sympathy",
    badgeName: {
      en: "Sympathy Shield",
      hi: "भावना रक्षक (Sympathy Guard)",
      bn: "ভাবনা রক্ষক মেডেল",
      ta: "அன்பு கேடயம்",
      te: "సహానుభూతి రక్షక్"
    },
    badgeIcon: "🛡️",
    badgeColor: "bg-[#FFCCD5] text-[#D00030] border-[#D00030]",
    narrative: {
      en: "Radha sister is sitting silently with her head down near the sewing shop. People are passing by without noticing. When you ask her, she speaks angrily to hide her deep sadness.",
      hi: "राधा दीदी सिलाई केंद्र के बाहर कोने में सिर झुकाकर चुपचाप रो रही हैं। लोग बिना ध्यान दिए वहाँ से गुज़रे जा रहे हैं। पूछने पर वह अपनी उदासी छुपाने के लिए गुस्से में बात करती हैं।",
      bn: "রাধা দিদি সেলাই ঘরের পাশে মাথা নিচু করে একা বসে কাঁদছেন। অনেকে খেয়াল না করে চলে যাচ্ছে। জিজ্ঞেস করায় তিনি নিজের মনের দুঃখ এবং ভয় লুকোতে রেগে উত্তর দিলেন।",
      ta: "தையல் கடை அருகே ராதா அக்கா தனியாக அழுது கொண்டிருக்கிறார். யாரும் கவனிக்கவில்லை. கேட்டதற்கு கோபமாக பதிலளிக்கிறார்.",
      te: "రాధా అక్క కుట్టుపని కేంద్రం పక్కన కన్నీళ్లు పెట్టుకుంటూ కూర్చుంది. ఎవరూ పట్టించుకోవడం లేదు. అడిగితే కోపంగా బదులిచ్చింది."
    },
    question: {
      en: "What is the best way to handle Radha's emotion and comfort her?",
      hi: "राधा दीदी के इस बर्भाव को समझने और उनके दिल से चिंता को दूर करने का सर्वोत्तम तरीका क्या है?",
      bn: "রাধা দিদির অনুভূতি বুঝে তাকে সান্ত্বনা দেওয়ার সবচেয়ে ভালো সংবেদনশীল পথ কোনটি?",
      ta: "ராதாவின் உணர்வுகளைப் புரிந்து அவருக்கு உதவ சிறந்த வழி எது?",
      te: "రాధా అక్క బాధను అర్థం చేసుకుని సహాయం చేయడానికి మంచి పద్ధతి ఏది?"
    },
    choices: [
      {
        id: "a",
        text: {
          en: "Ignore her and walk away. She is in a bad mood and being rude.",
          hi: "उन्हें नज़रअंदाज़ करें और चले जाएं। उनका मिजाज़ खराब है और वे बदतमीजी कर रही हैं।",
          bn: "তাকে এড়িয়ে চলে যান। তার এখন মেজাজ খারাপ এবং তিনি রূঢ় আচরণ করছেন।",
          ta: "அவரைப் புறக்கணித்துவிட்டுச் செல்லவும். அவர் கோபமாக பேசுகிறார்.",
          te: "ఆమెను పట్టించుకోకుండా వెళ్ళిపోండి. ఆమె కోపంలో ఉంది మరియు సరిగ్గా మాట్లాడలేదు."
        },
        feedback: {
          en: "Turning away leaves our neighbors lonely in their deepest grief. Empathy means looking beyond initial anger.",
          hi: "गलत निर्णय। पीठ फेरने से हमारे पड़ोसी गहरे दुख में अकेले रह जाते हैं। सहानुभूति का अर्थ है पहले गुस्से के पीछे छिपे दर्द को पहचानना।",
          bn: "ভুল সিদ্ধান্ত। মুখ ফিরিয়ে নিলে আমাদের প্রতিবেশীরা একা হয়ে পড়েন। সহানুভূতির মানে প্রথমে রাগের পিছনে লুকিয়ে থাকা কষ্টটা বোঝা।",
          ta: "தவறான முடிவு. நம் அண்டை வீட்டார் துன்பத்தில் இருக்கும் போது ஒதுங்குவது தவறு. அன்பு காட்டுங்கள்.",
          te: "తప్పు నిర్ణయం. ఇరుగుపొరుగు వారి బాధలో మనం తోడుగా ఉండాలి. కోపం వెనుక ఉన్న బాధను తెలియజేయడమే సానుభూతి."
        },
        success: false
      },
      {
        id: "b",
        text: {
          en: "Stay calm, offer her water, and say: 'Didi, I am here for you if you want to share.'",
          hi: "खुद शांत रहें, उन्हें पानी पीने को दें और कहें: 'दीदी, मैं यहीं हूँ। जब आपका मन हल्का हो, आप मुझे परेशानी बता सकती हैं।'",
          bn: "নিজে শান্ত থাকুন, তাকে এক গ্লাস জল দিন এবং আদর করে বলুন: 'দিদি, আমি এখানেই আছি। মন শান্ত হলে কষ্টের কথা বলতে পারো।'",
          ta: "அமைதியாக இருங்கள், தண்ணீர் கொடுத்து 'அக்கா, நான் உங்களுடன் இருக்கிறேன், மெதுவாகப் பேசுங்கள்' என்று கூறவும்.",
          te: "ప్రశాంతంగా ఉండి, ఆమెకు తాగడానికి నీరు ఇచ్చి, 'అక్కా, బాధపడకు నేనున్నాను' అని చెప్పండి."
        },
        feedback: {
          en: "Perfect! You earned the Sympathy Shield Badge! Radha wipes her tears and feels secure knowing she has a friend who listens.",
          hi: "सर्वोत्तम निर्णय! आपने 'भावना रक्षक' पदक जीत लिया है! राधा दीदी अपने आँसू पोंछती हैं और एक सहृदय मित्र पाकर खुद को सुरक्षित महसूस करती हैं।",
          bn: "চমৎকার! আপনি 'ভাবনা রক্ষক' মেডেল জিতলেন! রাধা দিদি চোখের জল মুছে শান্তি পেলেন এবং বুঝলেন যে কেউ তার পাশে আছে।",
          ta: "அருமையான முடிவு! நீங்கள் 'அன்பு கேடயம்' பதக்கம் பெற்றீர்கள். ராதா அக்கா தன் கண்ணீரைத் துடைத்து அமைதியானார்.",
          te: "అద్భుతమైన నిర్ణయం! మీరు 'సహానుభూతి రక్షక్' బ్యాడ్జ్ సాధించారు! రాధా అక్క కన్నీళ్లు తుడుచుకుని సంతోషపడింది."
        },
        success: true
      }
    ]
  },
  {
    id: 2,
    topic: {
      en: "Conflict Resolution",
      hi: "विवाद सुलझाना (शांति स्थापना)",
      bn: "কলহ মীমাংসা ও সম্প্রীতি",
      ta: "விவாதம் தீர்த்தல்",
      te: "వివాదాల పరిష్కారం"
    },
    icon: "🕊️",
    badgeId: "peacemaker",
    badgeName: {
      en: "Peace Maker",
      hi: "शांति दूत (Peace Maker)",
      bn: "শান্তি দূত মেডেল",
      ta: "சமாதானத் தூதுவர்",
      te: "శాంతి దూత"
    },
    badgeIcon: "🕊️",
    badgeColor: "bg-[#D8F3DC] text-[#1B4332] border-[#1B4332]",
    narrative: {
      en: "Two village women, Geeta and Sunita, are shouting at the public water pump. Geeta says she was in queue first; Sunita says her children are late for their morning school.",
      hi: "पानी के सरकारी हैंडपंप पर गीता और सुनीता आपस में ज़ोर-ज़ोर से चिल्ला रही हैं। गीता कहती है कि वह लाइन में पहले आई थी, सुनीता कहती है कि उसके बच्चों को सुबह स्कूल के लिए देर हो रही है।",
      bn: "পানির কলতলায় গীতা ও সুনীতা ঝগড়া করছেন। গীতা বলছেন তিনি লাইনে আগে ছিলেন, সুনীতা বলছেন তার ছেলেদের চাট্টি খেয়ে সকাল সকাল স্কুলে যাওয়ার দেরি হচ্ছে।",
      ta: "கைப்பம்பு அருகில் கீதாவும் சுனிதாவும் சண்டை போடுகிறார்கள். கீதா வரிசையில் முதலில் வந்ததாக கூறுகிறார், சுனிதா குழந்தைக்கு பள்ளிக்கு நேரமாவதாக கூறுகிறார்.",
      te: "నీటి పంపు వద్ద గీత, సునీత గొడవ పడుతున్నారు. గీత తాను మొదటగా వచ్చానంటుంది, సునీత పిల్లలు బడికి ఆలస్యమవుతుందంటుంది."
    },
    question: {
      en: "How can we neutrally resolve this argument and prevent any physical dispute?",
      hi: "इस झगड़े को निष्पक्ष रूप से सुलझाने और आपस में बैर न बढ़ने देने का सबसे सही उपाय क्या है?",
      bn: "এই বিবাদটি কোনো রকম মারামারি ছাড়া নিরপেক্ষভাবে মিটিয়ে শান্তি বজায় রাখার সেরা উপায় কি?",
      ta: "இந்த சண்டையை சமாதானமாக தீர்க்க சிறந்த வழி எது?",
      te: "ఈ గొడవను శాంతియుతంగా పరిష్కరించే మార్గం ఏది?"
    },
    choices: [
      {
        id: "a",
        text: {
          en: "Yell at them both to go away, or favor the one who is your relative.",
          hi: "दोनों पर दूर जाने के लिए चिल्लाएं या फिर उसी महिला का साथ दें जो आपकी रिश्तेदार है।",
          bn: "দুজনের ওপরই দূর হতে চিৎকার করুন অথবা নিজের কোনো আত্মীয় বা পরিচিত লোকের পক্ষ নিন।",
          ta: "சத்தம் போட்டு சண்டையை நிறுத்தச் சொல்லவும் அல்லது உறவினருக்கு ஆதரவு பேசவும்.",
          te: "సమయం వృధా చేయొద్దని ఇద్దరిపై గట్టిగా అరవండి లేదా మీ చుట్టాల వైపు మాట్లాడండి."
        },
        feedback: {
          en: "Favoring relatives or shouting only triggers more anger. Neutral active listening is the key to local peace.",
          hi: "गलत चुनाव। रिश्तेदारों का पक्ष लेने या बेवजह चिल्लाने से झगड़ा और बढ़ता है। निष्पक्ष रहकर सबकी बात सुनना ही गाँव की शांति की चाबी है।",
          bn: "ভুল উত্তর। পক্ষপাতিত্ব ও চিৎকার চেঁচাসেচি বিবাদ আরো বাড়ায়। নিরপেক্ষ উপায়ে সকলের কথা শোনা সামাজিক শান্তির আসল চাবিকাঠি।",
          ta: "தவறான முடிவு. உறவினருக்கு சார்பாக பேசுவது பகைமையை வளர்க்கும். நடுநிலையாகச் செயல்படுங்கள்.",
          te: "తప్పు నిర్ణయం. బంధువుల వైపు మాట్లాడడం వల్ల గొడవ పెరుగుతుంది. ఇద్దరి మాటలు విని శాంతియుతంగా ఉండడమే ముఖ్యం."
        },
        success: false
      },
      {
        id: "b",
        text: {
          en: "Propose a win-win deal: 'Allow Sunita to fill 1 bucket quickly today, and tomorrow Geeta gets first absolute priority.'",
          hi: "दोनों को एक बराबर समाधान सुझाएं: 'सुनीता को आज बच्चों के लिए पहले 1 बाल्टी भरने दें, और कल गीता को बिना किसी रोक-टोक के सबसे पहले मौका मिलेगा।'",
          bn: "দুজনের সুবিধাজনক সমাধান দিন: 'আজ সুনীতাকে স্কুলযাত্রার জন্য ১ বালতি জল দ্রুত তুলতে দেওয়া হোক, এবং কাল গীতাকে সবার আগে অগ্রাধিকার দেওয়া হবে।'",
          ta: "சமரசமாக கூறவும்: 'இன்று சுனிதா 1 குடம் பிடிக்கட்டும், நாளை கீதாவுக்கு முதலில் முக்கியத்துவம் தரப்படும்.'",
          te: "సమస్య పరిష్కారం చెప్పండి: 'సునీతను పిల్లల కోసం ఒక బకెట్ నీరు ముందు పట్టుకోనివ్వండి, రేపు గీతకు మొదటి ప్రాధాన్యత ఇద్దాం.'"
        },
        feedback: {
          en: "Spectacular! You unlocked the Peace Maker Badge! Both women agree, smile, and learn that sharing saves precious time.",
          hi: "लाजवाब! आपने 'शांति दूत' पदक जीत लिया है! दोनों महिलाएँ हँसकर मान जाती हैं और सीखती हैं कि मिलकर बाँटने से आपसी तनाव दूर होता है।",
          bn: "অসাধারণ! আপনি 'শান্তি দূত' মেডেল পেলেন! দুজনেই হাসিমুখে মেনে নিলেন এবং বুঝলেন যে মিলেমিশে কাজ করলে সময় বাঁচে।",
          ta: "அருமை! நீங்கள் 'சமாதானத் தூதுவர்' பதக்கம் வென்றீர்கள். இருவரும் புன்னகையுடன் ஒத்துக்கொண்டனர்.",
          te: "చాలా బాగుంది! మీరు 'శాంతి దూత' బ్యాడ్జ్ సాధించారు! ఇద్దరు మహిళలు సంతోషంగా ఒప్పుకున్నారు."
        },
        success: true
      }
    ]
  },
  {
    id: 3,
    topic: {
      en: "Effective Communication",
      hi: "मधुर बातचीत (स्पष्ट संवाद)",
      bn: "স্পষ্ট ও সুন্দর কথনশৈলী",
      ta: "தீர்க்கமான பேச்சு",
      te: "ప్రభావవంతమైన కమ్యూనికేషన్"
    },
    icon: "🗣️",
    badgeId: "wise_speaker",
    badgeName: {
      en: "Wise Speaker",
      hi: "मधुर वक्ता (Wise Speaker)",
      bn: "মধুর বক্তা মেডেল",
      ta: "சிறந்த பேச்சாளர்",
      te: "మధుర వక్త"
    },
    badgeIcon: "🎙️",
    badgeColor: "bg-[#E0FAFF] text-[#005F73] border-[#005F73]",
    narrative: {
      en: "Your sewing shop customer demands that you charge only ₹100 instead of the agreed ₹200, claiming she can get it cheaper in the big city market.",
      hi: "आपकी सिलाई की सवेरे की एक स्थानीय ग्राहक सामान सिल जाने के बाद तयशुदा ₹200 के बजाय केवल ₹100 देने पर अड़ गई है। वह कहती है कि बड़े शहर के बाजार में यह और भी सस्ता मिलता है।",
      bn: "আপনার এক খদ্দের কাজ হওয়ার পর আগে স্থির হওয়া ২০০ টাকার বদলে মাত্র ১০০ টাকা দিতে চাইছেন। বলছেন বড় শহরের বাজারে এর চেয়ে অনেক সস্তায় পাওয়া যায়।",
      ta: "தையல் கூலி ரூ. 200 பேசப்பட்டு, வேலை முடிந்த பின் வாடிக்கையாளர் ரூ.100 தான் தருவேன் என்கிறார். நகரில் மலிவாக கிடைப்பதாக கூறுகிறார்.",
      te: "ఒక కస్టమర్ కుట్టుకూలి ముందుగా ఒప్పుకున్న రూ. 200 కి బదులు రూ. 100 ఇస్తానంటుంది, పట్నంలో అయితే ఇంకా తక్కువకే కుడతారంటుంది."
    },
    question: {
      en: "How can you assertively convey your value without getting angry or suffering a financial loss?",
      hi: "गुस्सा किए बिना और बिना डरे अपनी मेहनत का पैसा पाने के लिए, आप अपनी कुशल मेहनत की कीमत ग्राहक को कैसे समझाएँगे?",
      bn: "রাগ না করে ও লোকসান না সয়ে, নিজের মেহনতের কাজের সঠিক মূল্য কিভাবে খদ্দেরকে বুঝিয়ে বলবেন?",
      ta: "கோபப்படாமல், நஷ்டமடையாமல் உங்கள் உழைப்பின் மதிப்பை எப்படிப் புரிய வைப்பீர்கள்?",
      te: "కోపం తెచ్చుకోకుండా, మీ కష్టార్జితాన్ని కోల్పోకుండా, మీ పని విలువను ఎలా వివరిస్తారు?"
    },
    choices: [
      {
        id: "a",
        text: {
          en: "Cry, accept the low money, and complain silently that business is bad.",
          hi: "रोने लगें, डरकर चुपचाप कम पैसे रख लें और मन ही मन दुखी हों कि यहाँ काम करना ही बेकार है।",
          bn: "কান্নাকাটি করুন, কম টাকাটাই নিন এবং মনে মনে দুঃখ প্রকাশ করুন যে ব্যবসাই খুব খারাপ।",
          ta: "அழுதுகொண்டு குறைந்த பணத்தை வாங்கிக் கொண்டு வருத்தப்படுவது.",
          te: "బాధపడుతూ తక్కువ డబ్బులు తీసుకోవడం మరియు వ్యాపారం బాలేదని మనస్సులో అనుకోవడం."
        },
        feedback: {
          en: "Accepting unfair treatment silently harms your livelihood long-term. You must stand tall for your handiwork.",
          hi: "गलत फैसला। नाइंसाफी को चुपचाप स्वीकार करना आपके व्यवसाय को लंबे समय में नुकसान पहुँचाता है। आपको अपनी कला पर गर्व होना चाहिए।",
          bn: "ভুল সিদ্ধান্ত। অবিচার চুপচাপ মেনে নিলে নিজের ব্যবসায়ের স্থায়ী ক্ষতি হয়। নিজের হাতের কাজের সম্মান বজায় রাখা দরকার।",
          ta: "தவறான முடிவு. நியாயமற்ற செயல்களை அமைதியாக ஏற்பது நஷ்டத்தை தரும். உழைப்பை மதியுங்கள்.",
          te: "తప్పు నిర్ణయం. తక్కువ డబ్బును ఒప్పుకోవడం వల్ల వ్యాపారానికి నష్టం. మీ పని గౌరవాన్ని కాపాడుకోండి."
        },
        success: false
      },
      {
        id: "b",
        text: {
          en: "Politely show your cost slip: 'Deepa Didi, I spent 4 hours on custom thread and stitching. Quality work deserves a fair payment.'",
          hi: "विनम्रता से अपनी लिखित रसीद दिखाएं: 'दीपा दीदी, मैंने टिकाऊ धागे और मजबूत सिलाई में 4 घंटे लगाए हैं। हमारी अच्छी गुणवत्ता का सही दाम तो मिलना ही चाहिए।'",
          bn: "নম্রভাবে নিজের লিখিত বিলটি দেখান: 'দীপা দিদি, মজবুত সুতো দিয়ে যত্ন করে বানাতে ৪ ঘন্টা পরিশ্রম করেছি। ভালো কাজের সঠিক দাম তো পাওয়াই উচিত।'",
          ta: "மரியாதையாக கூறவும்: 'தீபா அக்கா, தையல் மற்றும் நூலுக்காக நான் 4 மணி நேரம் உழைத்துள்ளேன். தரமான வேலைக்கு நியாயமான கூலி தேவை.'",
          te: "గౌరవంగా చెప్పండి: 'దీపా అక్కా, నేను నాణ్యమైన దారంతో 4 గంటలు కష్టపడ్డాను. మంచి కుట్టుపనికి సరైన కూలి ఇవ్వాలి కదా.'"
        },
        feedback: {
          en: "Incredible response! You unlocked the Wise Speaker Badge! The customer feels respected, understands your effort, and pays ₹200.",
          hi: "अद्भुत बातचीत! आपने 'मधुर वक्ता' पदक हासिल किया है! ग्राहक आपके परिश्रम का सम्मान करते हुए खुशी-खुशी पूरे ₹200 का भुगतान कर देती है।",
          bn: "অসাধারণ কথোপকথন! আপনি 'মধুর বক্তা' মেডেল জিতলেন! খদ্দের আপনার খাটুনির মূল্য বুঝলেন এবং খুশি হয়ে পুরো ২০০ টাকাই দিলেন।",
          ta: "அருமையான பேச்சு! நீங்கள் 'சிறந்த பேச்சாளர்' பதக்கம் வென்றீர்கள். வாடிக்கையாளர் உழைப்பை உணர்ந்து ரூ.200 கொடுத்தார்.",
          te: "చాలా బాగుంది! మీరు 'మధుర వక్త' బ్యాడ్జ్ సాధించారు! కస్టమర్ మీ కష్టాన్ని గుర్తించి పూర్తి రూ. 200 ఇచ్చారు."
        },
        success: true
      }
    ]
  },
  {
    id: 4,
    topic: {
      en: "Respecting Diversity",
      hi: "विविधता का सम्मान (एकता)",
      bn: "বৈচিত্র্য ও মেলবন্ধন শ্রদ্ধা",
      ta: "மக்களை மதித்தல்",
      te: "వైవిధ్యాన్ని గౌరవించడం"
    },
    icon: "🌟",
    badgeId: "unity",
    badgeName: {
      en: "Unity Star",
      hi: "एकता सितारा (Unity Star)",
      bn: "একতা তারা মেডেল",
      ta: "ஒற்றுமை நட்சத்திரம்",
      te: "ఐక్యత నక్షత్రం"
    },
    badgeIcon: "🌟",
    badgeColor: "bg-[#FFF4E0] text-[#B25E00] border-[#B25E00]",
    narrative: {
      en: "A poor family from another state moves next door. They wear different clothing styles, speak a different language, and eat unknown foods. Some kids are teasing them near the tree.",
      hi: "दूसरे राज्य से आया एक नया परिवार आपके पड़ोस में रहने आता है। वे अलग तरह के कपड़े पहनते हैं, दूसरी भाषा बोलते हैं और अलग खाना खाते हैं। कुछ बच्चे उन्हें देखकर मज़ाक उड़ा रहे हैं।",
      bn: "অন্য এক রাজ্য থেকে এক পরিযায়ী পরিবার আপনার পাশে বাড়ি ভাড়া নিয়েছে। তাদের পোশাক-ভাষা ও খাবার সম্পূর্ণ আলাদা। কিছু ছোট ছেলেমেয়ে তাদের দেখে হাসাহাসি করছে গাছতলায়।",
      ta: "வேறு மாநிலத்திலிருந்து ஒரு குடும்பம் அருகில் குடிவருகிறது. அவர்கள் வேறு உடை அணிந்து, வேறு மொழி பேசுகிறார்கள். சிலர் கேலி செய்கிறார்கள்.",
      te: "వేరే రాష్ట్రం నుండి వచ్చిన ఒక కొత్త కుటుంబం మీ పక్క ఇంట్లో చేరింది. వారు వేరే రకం బట్టలు, భాష మరియు ఆహార పద్ధతులు వాడుతున్నారు. కొందరు పిల్లలు వారిని ఎగతాళి చేస్తున్నారు."
    },
    question: {
      en: "How can you teach community kids to respect other cultures and make the new family feel at home?",
      hi: "आप गाँव के बच्चों को दूसरी संस्कृति का सम्मान करना कैसे सिखाएँगे और नए परिवार को यहाँ सुरक्षित और अपनापन महसूस कराएँगे?",
      bn: "আপনি নিজের এলাকার ছেলেদের কিভাবে অন্য সংস্কৃতির প্রতি শ্রদ্ধা রাখতে শেখাবেন ও নতুন পরিবারটিকে আপন করে নেবেন?",
      ta: "வேற்று நாட்டு மக்களின் கலாச்சாரத்தை மதிக்கவும், அவர்களை அன்போடு நடத்தவும் எவ்வாறு கற்றுத் தருவீர்கள்?",
      te: "ఇరుగుపొరుగు వారి సాంప్రదాయాలను గౌరవించాలని పిల్లలకు ఎలా చేప్తారు మరియు ఆ కొత్త కుటుంబానికి ఎలా తోడుగా ఉంటారు?"
    },
    choices: [
      {
        id: "a",
        text: {
          en: "Join the fun or tell your children to stay away because their customs are strange.",
          hi: "मज़ाक का हिस्सा बनें या अपने बच्चों से कहें कि वे उनसे दूर रहें क्योंकि उनके रीति-रिवाज अजीब हैं।",
          bn: "মজা লুঠুন অথবা নিজের বাড়ির বাচ্চাদের বলুন তাদের থেকে দূরে থাকতে কারণ তাদের ভাষা অদ্ভুত ও অভ্যাস অন্যরকম।",
          ta: "அவர்களிடம் பழக வேண்டாம் என்று குழந்தைகளிடம் கூறுவது அல்லது ஒதுக்கி வைப்பது.",
          te: "ఆ ఎగతాళిని చూసి నవ్వడం లేదా వారి పద్ధతులు విచిత్రంగా ఉన్నాయి వాళ్ళతో మాట్లాడకండి అని పిల్లలకు చెప్పడం."
        },
        feedback: {
          en: "Teasing or ignoring new neighbors causes deep discrimination. A friendly hand brings high unity.",
          hi: "गलत फैसला। नए पड़ोसियों का मज़ाक उड़ाने या उनसे दूरी बनाने से समाज में भेदभाव जन्म लेता है। मित्रता का हाथ बड़ा बदलाव लाता है।",
          bn: "ভুল সিদ্ধান্ত। মজা করা বা সামাজিক দূরত্ব সৃষ্টি করলে আমাদের এলাকায় হিংসা ছড়ায়। সৌহার্দ্যপূর্ণ মনোভাব রাখলে সমাজের মেলবন্ধন দৃঢ় হয়।",
          ta: "தவறான முடிவு. புதிய அண்டை வீட்டாரை ஒதுக்கி வைப்பது ஒற்றுமையை சீர்குலைக்கும்.",
          te: "తప్పు నిర్ణయం. పొరుగువారిని ఎగతాళి చేయడం తప్పు. స్నేహ హస్తం అందించడమే నిజమైన మానవత్వం."
        },
        success: false
      },
      {
        id: "b",
        text: {
          en: "Stop the kids. Take a bowl of local sweets, welcome them warmheartedly, and say: 'Sharing makes us a stronger community!'",
          hi: "बच्चों को मज़ाक करने से रोकें। उनके घर थाली में गाँव की बनी ताज़ा मिठाई लेकर जाएं, उनका स्नेहपूर्वक स्वागत करें और कहें: 'मिलकर रहने से ही हमारा गाँव तरक्की करेगा।'",
          bn: "বাচ্চাদের বোঝান এবং বারণ করুন। থালায় নিজের ঘরের মিষ্টি নিয়ে তাদের স্বাগত জানান এবং বলুন: 'মিলেমিশে থাকলে আমাদের সামাজিক বন্ধন আরো মজবুত হবে!'",
          ta: "கேலி செய்வதைத் தடுத்து, வீட்டுப் பலகாரம் கொடுத்து அவர்களை வரவேற்கவும். 'நட்பே ஒற்றுமை' என்று கூறவும்.",
          te: "పిల్లలను వారించండి. వారితో మాట్లాడి, ఇంట్లో చేసిన స్వీట్స్ ఇచ్చి సాధరంగా ఆహ్వానించండి 'కలిసి ఉండడమే మన బలం' అని చెప్పండి."
        },
        feedback: {
          en: "Incredible! You earned the Unity Star Badge! The children learn empathy, and the new family smiles with water in their eyes.",
          hi: "शानदार! आपने 'एकता सिंतारा' पदक हासिल किया है! गाँव के बच्चे सहिष्णुता सीखते हैं, और वह परिवार आँखों में खुशी के आँसुओं के साथ आपको प्रणाम करता है।",
          bn: "অপূর্ব! আপনি 'একতা তারা' মেডেল পেলেন! এলাকার বাচ্চারা সহানুভূতি শিখল ও নতুন পরিবারটি আনন্দে আমাদের ধন্যবাদ জানাল।",
          ta: "அற்புதம்! நீங்கள் 'ஒற்றுமை நட்சத்திரம்' பதக்கம் வென்றீர்கள். குழந்தைகள் மற்றவரை மதிக்கக் கற்றுக் கொண்டனர்.",
          te: "అద్భుతం! మీరు 'ఐక్యత నక్షత్రం' బ్యాడ్జ్ సాధించారు! పిల్లలు మంచి అలవాట్లు నేర్చుకున్నారు, ఆ కుటుంబం ఆనందపడింది."
        },
        success: true
      }
    ]
  }
];

const INITIAL_MOCK_LEADERBOARD: LeaderboardEntry[] = [
  { name: "Ramesh Weaver Daji", points: 430, avatar: "👨‍🌾" },
  { name: "Radha ASHA Didi", points: 340, avatar: "👩‍⚕️" },
  { name: "Sunita Tailor Master", points: 280, avatar: "👩‍🎨" },
  { name: "YOU", points: 0, isUser: true, avatar: "🏆" },
  { name: "Deepak Youth Volunteer", points: 190, avatar: "🧑‍🎓" }
];

export default function SocialQuizModule({ currentLang, onBack }: SocialQuizModuleProps) {
  // Game states
  const [isPlaying, setIsSpeaking] = useState(false);
  const [gameState, setGameState] = useState<"intro" | "playing" | "celebrate_badge" | "completed">("intro");
  const [gameMode, setGameMode] = useState<"practice" | "timed">("practice");
  
  // Scoring & Rewards
  const [points, setPoints] = useState<number>(() => {
    const saved = localStorage.getItem("jivsahayak_social_points");
    return saved ? parseInt(saved, 10) : 0;
  });
  
  const [unlockedBadges, setUnlockedBadges] = useState<string[]>(() => {
    const saved = localStorage.getItem("jivsahayak_social_badges");
    return saved ? JSON.parse(saved) : [];
  });

  // Current Question
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedChoiceId, setSelectedChoiceId] = useState<"a" | "b" | null>(null);
  const [hasAnswered, setHasAnswered] = useState(false);
  
  // Timer States for Timed Challenge Mode
  const [timeLeft, setTimeLeft] = useState(15);
  const [timerActive, setTimerActive] = useState(false);
  const [timerRanOut, setTimerRanOut] = useState(false);
  const [scoredBonus, setScoredBonus] = useState(0);

  // Celebration states
  const [celebratedBadge, setCelebratedBadge] = useState<{ name: Record<Language, string>; icon: string; color: string } | null>(null);

  // Leaderboard Sorting dynamically based on current user points
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);

  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Sync speak listeners
  useEffect(() => {
    registerAudioStateListener((speaking) => {
      setIsSpeaking(speaking);
    });

    // Load points and update leaderboard initially
    updateLeaderboard(points);

    return () => {
      stopSpeaking();
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);

  // Update dynamic leaderboard
  const updateLeaderboard = (userPts: number) => {
    const freshList = INITIAL_MOCK_LEADERBOARD.map(entry => {
      if (entry.isUser) {
        return { ...entry, points: userPts };
      }
      return entry;
    });
    // Sort descending
    freshList.sort((a, b) => b.points - a.points);
    setLeaderboard(freshList);
  };

  // Timer run down handler
  useEffect(() => {
    if (timerActive && timeLeft > 0 && !hasAnswered) {
      timerRef.current = setTimeout(() => {
        setTimeLeft((prev) => prev - 1);
      }, 1000);
    } else if (timeLeft === 0 && !hasAnswered && timerActive) {
      setTimerRanOut(true);
      setTimerActive(false);
      handleTimeOut();
    }

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [timeLeft, timerActive, hasAnswered]);

  const handleTimeOut = () => {
    stopSpeaking();
    const hint = currentLang === "en"
      ? "Time is up! In real life, choices must be quick. But don't worry, select an option to continue."
      : "समय सीमा समाप्त! हालांकि वास्तविक जीवन में सामाजिक फैसले जल्दी लेने होते हैं। कोई बात नहीं, सीखने के लिए कोई एक विकल्प चुनें।";
    speakText(hint, currentLang);
  };

  const currentScenario = LOCAL_SCENARIOS[currentQuestionIndex];

  // Voice narration triggers
  const playIntroAudio = () => {
    const welcome = currentLang === "en" 
      ? "Welcome to Social Literacy Quizzes! Play interactive challenges on Empathy, Peaceful Conflict Resolution, and Clear Communication. Win points and climb the village leaderboard!"
      : currentLang === "hi"
      ? "सामाजिक साक्षरता खेल में आपका स्वागत है। यहाँ आप सहानुभूति, शांतिपूर्ण विवाद समाधान, और मधुर बातचीत के बारे में खेलेंगे। अंक जीतकर गाँव की रैंकिंग में ऊपर चढ़ें!"
      : currentLang === "bn"
      ? "সামাজিক সচেতনতা কুইজে স্বাগত! সহানুভূতি, ঝগড়া মেটানো ও সুন্দর কথাবার্তা বলার খেলা খেলুন। পয়েন্ট জিতে গ্রামের লিডারবোর্ডে নিজের নাম ওপরে তুলুন!"
      : currentLang === "ta"
      ? "சமூக நற்பண்புகள் விளையாட்டு உங்களை வரவேற்கிறது! சண்டை சச்சரவின்றி பேசுதல் மற்றும் பிறரின் உணர்வுகளை மதித்தல் பற்றி விளையாடுங்கள்."
      : "సామాజిక నైపుణ్యాల ఆటకు స్వాగతం! ఇక్కడ మీరు సానుభూతి, శాంతియుతంగా గొడవలు పరిష్కరించడం మరియు మర్యాదగా మాట్లాడడం గురించి నేర్చుకుంటారు.";
    
    if (isCurrentlySpeaking()) {
      stopSpeaking();
    } else {
      speakText(welcome, currentLang);
    }
  };

  const playScenarioAudio = () => {
    if (!currentScenario) return;

    let text = `${currentScenario.topic[currentLang]}. ${currentScenario.narrative[currentLang]}. ${currentScenario.question[currentLang]}`;
    if (hasAnswered && selectedChoiceId) {
      const choice = currentScenario.choices.find(c => c.id === selectedChoiceId);
      if (choice) {
        text = `${choice.success ? "बिल्कुल सही! Correct!" : "गलत। Incorrect."} ${choice.feedback[currentLang]}`;
      }
    }

    if (isCurrentlySpeaking()) {
      stopSpeaking();
    } else {
      speakText(text, currentLang);
    }
  };

  const startQuiz = (mode: "practice" | "timed") => {
    stopSpeaking();
    setGameMode(mode);
    setCurrentQuestionIndex(0);
    setSelectedChoiceId(null);
    setHasAnswered(false);
    setTimerRanOut(false);
    setGameState("playing");
    
    if (mode === "timed") {
      setTimeLeft(15);
      setTimerActive(true);
    }

    // Direct scenario audio
    setTimeout(() => {
      const scenario = LOCAL_SCENARIOS[0];
      const speech = `${scenario.topic[currentLang]}. ${scenario.narrative[currentLang]}. ${scenario.question[currentLang]}`;
      speakText(speech, currentLang);
    }, 450);
  };

  const handleSelectChoice = (choiceId: "a" | "b") => {
    if (hasAnswered) return; // Locked in
    stopSpeaking();

    setSelectedChoiceId(choiceId);
    setHasAnswered(true);
    setTimerActive(false);

    const scenario = LOCAL_SCENARIOS[currentQuestionIndex];
    const choice = scenario.choices.find(c => c.id === choiceId);
    if (!choice) return;

    let pointsEarned = 0;
    let extraBonus = 0;

    if (choice.success) {
      pointsEarned = 100;

      // Check if Timed challenge mode has speed bonus
      if (gameMode === "timed" && !timerRanOut) {
        extraBonus = Math.max(10, timeLeft * 3.5);
        extraBonus = Math.floor(extraBonus);
        setScoredBonus(extraBonus);
      } else {
        setScoredBonus(0);
      }

      // Add points
      const nextPoints = points + pointsEarned + extraBonus;
      setPoints(nextPoints);
      localStorage.setItem("jivsahayak_social_points", nextPoints.toString());
      
      // Save social quiz completion progress key
      localStorage.setItem("jivsahayak_completed_social", "true");
      window.dispatchEvent(new Event("jivsahayak_progress_updated"));

      updateLeaderboard(nextPoints);

      // Badge Unlocking trigger
      if (!unlockedBadges.includes(scenario.badgeId)) {
        const nextBadges = [...unlockedBadges, scenario.badgeId];
        setUnlockedBadges(nextBadges);
        localStorage.setItem("jivsahayak_social_badges", JSON.stringify(nextBadges));
        
        // Setup celebratory screen values
        setCelebratedBadge({
          name: scenario.badgeName,
          icon: scenario.badgeIcon,
          color: scenario.badgeColor
        });
      }
    } else {
      // Deduct minor penalty for wrong answers, always keep positive
      const nextPoints = Math.max(0, points - 20);
      setPoints(nextPoints);
      localStorage.setItem("jivsahayak_social_points", nextPoints.toString());
      updateLeaderboard(nextPoints);
    }

    // Speak immediate answer feedback matching region language
    speakText(choice.feedback[currentLang], currentLang);
  };

  const handleNextQuestion = () => {
    stopSpeaking();
    
    // Check if we have newly unlocked badge to celebrate first!
    if (celebratedBadge) {
      setGameState("celebrate_badge");
      
      const badgeTitle = celebratedBadge.name[currentLang];
      const audioCongrat = currentLang === "en"
        ? `Incredible! You unlocked the ${badgeTitle} badge. This proves your extreme wisdom in community decisions!`
        : `उत्कृष्ट कार्य! आपने ${badgeTitle} पदक जीत लिया है। यह गाँव में आपकी विवेकशीलता और कुशल नेतृत्व का प्रमाण है!`;
      
      speakText(audioCongrat, currentLang);
      return;
    }

    proceedNext();
  };

  const proceedNext = () => {
    setCelebratedBadge(null);
    const nextIdx = currentQuestionIndex + 1;
    if (nextIdx < LOCAL_SCENARIOS.length) {
      setCurrentQuestionIndex(nextIdx);
      setSelectedChoiceId(null);
      setHasAnswered(false);
      setTimerRanOut(false);
      setGameState("playing");

      if (gameMode === "timed") {
        setTimeLeft(15);
        setTimerActive(true);
      }

      // Voice read new scenario
      setTimeout(() => {
        const nextSec = LOCAL_SCENARIOS[nextIdx];
        const speechTextNew = `${nextSec.topic[currentLang]}. ${nextSec.narrative[currentLang]}. ${nextSec.question[currentLang]}`;
        speakText(speechTextNew, currentLang);
      }, 350);

    } else {
      // End game
      setGameState("completed");
      const summaryText = currentLang === "en"
        ? `Splendid! You scored a total support of ${points} points! You have climbed above other village leaders in wisdom rankings.`
        : `बहुत बढ़िया! आपने कुल ${points} ज्ञान अंक अर्जित कर गाँव की विवेकशीलता रैंकिंग में नया मुकाम पाया है। अपनी सूझबूझ से गाँव को जोड़ें!`;
      speakText(summaryText, currentLang);
    }
  };

  const handleCloseBadgePopup = () => {
    setCelebratedBadge(null);
    proceedNext();
  };

  const resetAllProgress = () => {
    stopSpeaking();
    setPoints(0);
    setUnlockedBadges([]);
    localStorage.removeItem("jivsahayak_social_points");
    localStorage.removeItem("jivsahayak_social_badges");
    updateLeaderboard(0);
    setGameState("intro");
  };

  return (
    <div className="max-w-4xl mx-auto rounded-3xl bg-white border-4 border-[#1A1A1A] overflow-hidden shadow-[8px_8px_0_#1A1A1A]">
      
      {/* Upper header row with points & audio indicator */}
      <div className="bg-[#FFD93D] p-5 border-b-4 border-[#1A1A1A] flex justify-between items-center flex-wrap gap-4">
        <div className="flex items-center gap-3">
          <Trophy className="text-[#1A1A1A] w-8 h-8 font-black shrink-0" />
          <div>
            <h2 className="text-base md:text-xl font-black text-[#1A1A1A] font-display tracking-tight leading-none flex items-center gap-2">
              <span>
                {currentLang === "en" ? "Social Literacy Challenges in Action" : 
                 currentLang === "hi" ? "सामाजिक साक्षरता कट्स चुनौतियां" : 
                 currentLang === "bn" ? "সামাজিক সচেতনতা ও কুইজ গেম" : 
                 currentLang === "ta" ? "சமூக நற்பண்புகள் விளையாட்டு" : "సామాజిక నైపుణ్యాల జ్ఞాన వేదిక"}
              </span>
            </h2>
            <p className="text-[10px] font-mono font-black text-[#1A1A1A]/80 mt-1 uppercase">
              ★ SDG 4 Quality Wisdom, SDG 5 Equality
            </p>
          </div>
        </div>

        {/* Live point display widgets */}
        <div className="flex items-center gap-2">
          <div className="bg-white border-2 border-[#1A1A1A] px-3 py-1.5 rounded-xl font-mono text-xs font-black shadow-[2px_2px_0_#1A1A1A] text-[#1A1A1A] flex items-center gap-1">
            <span>⭐</span>
            <span>{points} XP</span>
          </div>
          <div className="bg-white border-2 border-[#1A1A1A] px-3 py-1.5 rounded-xl font-mono text-xs font-black shadow-[2px_2px_0_#1A1A1A] text-[#1A1A1A] flex items-center gap-1.5">
            <span>🎖️</span>
            <span>{unlockedBadges.length} {currentLang === "en" ? "Badges" : "पदक"}</span>
          </div>
        </div>
      </div>

      {/* Main stage wrapper */}
      <div className="p-6 md:p-8 bg-[#FEF9E7]">
        <AnimatePresence mode="wait">
          
          {/* SCREEN 1: Intro Menu */}
          {gameState === "intro" && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="grid grid-cols-1 md:grid-cols-12 gap-8 items-start"
            >
              {/* Left explanation column */}
              <div className="md:col-span-7 flex flex-col gap-6 text-left">
                <span className="text-[10px] uppercase font-bold tracking-widest bg-[#FF6B6B] text-white border-2 border-[#1A1A1A] px-3 py-1 rounded-full self-start shadow-[1.5px_1.5px_0_#1A1A1A] font-mono">
                  {currentLang === "en" ? "Skill challenges" : "ज्ञान परीक्षा और खेल"}
                </span>

                <h3 className="text-xl md:text-3xl font-black text-[#1A1A1A] font-display leading-tight">
                  {currentLang === "en" ? "Become a Wise Community Builder!" : 
                   currentLang === "hi" ? "बनें समाज के सबसे समझदार मार्गदर्शक!" : 
                   currentLang === "bn" ? "সমাজ গড়ার শ্রেষ্ঠ পরিচালক হয়ে উঠুন!" : 
                   currentLang === "ta" ? "சமூக சிந்தனையாளர் ஆகுங்கள்!" : "మంచి సామాజిక నాయకుడిగా ఎదగండి!"}
                </h3>

                <p className="text-sm font-semibold text-neutral-700 leading-relaxed">
                  {currentLang === "en" 
                    ? "In everyday lives, we face emotional stress, dispute at water pumps, unfair trade, and cultural differences. How we react shapes our village harmony! Play these scenario challenges, earn certificates, and rank top of the scoreboard."
                    : currentLang === "hi"
                    ? "दैनिक जीवन में पानी की कतारों का विवाद, दूसरों के दुख दर्द की उपेक्षा, कारीगरी की कम उजरत और अनजान पड़ोसियों की विविधता जैसी चुनौतियाँ आती हैं। आपकी सूझबूझ से गाँव और घर में खुशहाली आ सकती है! खेल खेलकर अपनी बुद्धिमानी सावित करें।"
                    : "আমাদের জীবনে পানির কলতলায় বিবাদ, অন্যের চোখের জল উপেক্ষা করা, মজুরির সঠিক মূল্যায়ন ও নতুন প্রতিবেশীদের সাথে ব্যবহারে অনেক ভুল হয়। আপনার একটি সঠিক সিদ্ধান্ত সমাজকে সুন্দর করতে পারে। এই কুইজ খেলে ব্যাজ ও লিডারবোর্ডে নিজের নাম দেখান।"}
                </p>

                {/* Speaker play option */}
                <button
                  onClick={playIntroAudio}
                  className={`py-3 px-5 rounded-2xl border-2 border-[#1A1A1A] text-xs font-black cursor-pointer transition-all flex items-center gap-2 self-start ${
                    isPlaying
                      ? "bg-[#FF6B6B] text-white animate-pulse shadow-[2px_2px_0_#1A1A1A]"
                      : "bg-white text-[#1A1A1A] hover:bg-neutral-100 shadow-[3px_3px_0_#1A1A1A] hover:translate-y-0.5 hover:shadow-[1px_1px_0_#1A1A1A]"
                  }`}
                >
                  <Volume2 className="w-4 h-4" />
                  <span>{currentLang === "en" ? "🔊 Read Guide Aloud" : "🔊 आवाज में दिशा-निर्देश सुनें"}</span>
                </button>

                {/* Large responsive Play buttons */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4">
                  <button
                    onClick={() => startQuiz("practice")}
                    className="p-5 rounded-3xl bg-[#E2F5E5] border-4 border-[#1A1A1A] shadow-[4px_4px_0_#1A1A1A] hover:shadow-[2px_2px_0_#1A1A1A] hover:translate-y-0.5 text-left flex flex-col justify-between min-h-[140px] cursor-pointer group transition-all"
                  >
                    <div className="flex justify-between items-start w-full">
                      <span className="text-3xl">🧭</span>
                      <span className="text-[9px] font-mono font-black border-2 border-[#1A1A1A] px-2 py-0.5 rounded-full bg-white text-[#1A1A1A]">
                        FREE ROAD
                      </span>
                    </div>
                    <div>
                      <h4 className="text-sm font-black text-[#1A1A1A]">
                        {currentLang === "en" ? "Practice Journey" : "सीखने की यात्रा (Practice)"}
                      </h4>
                      <p className="text-[10px] font-bold text-neutral-600 mt-1">
                        {currentLang === "en" ? "No timers, detail guides" : "बिना समय सीमा की आरामदायक सीख"}
                      </p>
                    </div>
                  </button>

                  <button
                    onClick={() => startQuiz("timed")}
                    className="p-5 rounded-3xl bg-[#FFE5EC] border-4 border-[#1A1A1A] shadow-[4px_4px_0_#1A1A1A] hover:shadow-[2px_2px_0_#1A1A1A] hover:translate-y-0.5 text-left flex flex-col justify-between min-h-[140px] cursor-pointer group transition-all"
                  >
                    <div className="flex justify-between items-start w-full">
                      <span className="text-3xl">⏱️</span>
                      <span className="text-[9px] font-mono font-black border-2 border-[#1A1A1A] px-2 py-0.5 rounded-full bg-white text-[#FF1493]">
                        TIMED BONUS
                      </span>
                    </div>
                    <div>
                      <h4 className="text-sm font-black text-[#1A1A1A]">
                        {currentLang === "en" ? "Timed Challenge" : "गति चुनौती (Timed Mode)"}
                      </h4>
                      <p className="text-[10px] font-bold text-neutral-600 mt-1">
                        {currentLang === "en" ? "15s limit, speed bonus +50 XP" : "15 सेकंड समय सीमा, बोनस सहित!"}
                      </p>
                    </div>
                  </button>
                </div>
              </div>

              {/* Right column: live dynamic leaderboard display */}
              <div className="md:col-span-5 bg-white p-5 rounded-3xl border-4 border-[#1A1A1A] shadow-[6px_6px_0_#1A1A1A] flex flex-col gap-4">
                <div className="flex items-center gap-2 border-b-2 border-neutral-300 pb-2">
                  <Trophy className="w-4 h-4 text-amber-500" />
                  <span className="text-xs font-black uppercase font-mono tracking-wider text-[#1A1A1A]">
                    {currentLang === "en" ? "Village Leaderboard" : "गाँव की बुद्धिमानी रैंकिंग"}
                  </span>
                </div>

                <div className="flex flex-col gap-2.5">
                  {leaderboard.map((player, idx) => (
                    <div 
                      key={idx}
                      className={`flex justify-between items-center p-2.5 rounded-xl border-2 transition-all duration-300 ${
                        player.isUser 
                          ? "bg-[#FFF9C4] border-[#1A1A1A] shadow-[2.5px_2.5px_0_#1A1A1A] scale-[1.03]" 
                          : "bg-neutral-50 border-neutral-200"
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-mono font-black text-neutral-500 w-4">
                          {idx + 1}
                        </span>
                        <span className="text-lg">{player.avatar}</span>
                        <span className={`text-xs font-sans font-extrabold ${player.isUser ? "text-amber-900" : "text-[#1A1A1A]"}`}>
                          {player.isUser && currentLang !== "en" ? "आप (YOU)" : player.name}
                        </span>
                      </div>
                      <span className="text-xs font-mono font-black text-neutral-700">
                        {player.points} pts
                      </span>
                    </div>
                  ))}
                </div>

                {points > 0 && (
                  <button
                    onClick={resetAllProgress}
                    className="mt-2 text-[10px] text-red-600 font-bold hover:underline flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <RotateCcw className="w-3 h-3" />
                    <span>{currentLang === "en" ? "Reset Game Progress Data" : "सारे अंक और पदक मिटाएं (प्रारंभ करें)"}</span>
                  </button>
                )}
              </div>
            </motion.div>
          )}

          {/* SCREEN 2: Active Challenge Playing Screen */}
          {gameState === "playing" && currentScenario && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex flex-col gap-6"
            >
              <div className="bg-[#FFFCE8] p-5 rounded-2xl border-2 border-[#1A1A1A] shadow-[4px_4px_0_#1A1A1A] flex flex-col gap-4">
                <div className="flex justify-between items-center flex-wrap gap-2 border-b-2 border-[#1A1A1A]/10 pb-2.5">
                  <span className="text-xs bg-[#FFD93D] text-[#1A1A1A] border-2 border-[#1A1A1A] px-3 py-1 rounded-full font-mono font-black uppercase flex items-center gap-1.5 shadow-[1.5px_1.5px_0_#1A1A1A]">
                    <span>{currentScenario.icon}</span>
                    <span>{currentScenario.topic[currentLang]}</span>
                  </span>
                  
                  {/* Speaker helper for illiterate users */}
                  <div className="flex items-center gap-2">
                    <button
                      onClick={playScenarioAudio}
                      className={`p-2 rounded-xl border-2 border-[#1A1A1A] shadow-[2px_2px_0_#1A1A1A] cursor-pointer transition-all ${
                        isCurrentlySpeaking()
                          ? "bg-[#FF6B6B] text-white animate-pulse"
                          : "bg-white text-[#1A1A1A] hover:bg-neutral-50"
                      }`}
                    >
                      <Volume2 className="w-4 h-4" />
                    </button>
                    <span className="text-[10px] font-mono font-black text-neutral-500">
                      {currentLang === "en" ? "Listen" : "आवाज सुनें"}
                    </span>
                  </div>
                </div>

                {/* Scenario details narrative */}
                <p className="text-sm md:text-base font-sans font-bold leading-relaxed text-[#1A1A1A]">
                  {currentScenario.narrative[currentLang]}
                </p>

                {/* Underlined core question */}
                <div className="border-t-2 border-dashed border-[#1A1A1A]/10 pt-3">
                  <p className="text-sm font-black text-[#1A1A1A] flex items-start gap-1.5">
                    <span>❓</span>
                    <span>{currentScenario.question[currentLang]}</span>
                  </p>
                </div>
              </div>

              {/* TIMED MODE TIMER RING/BAR PROGRESS */}
              {gameMode === "timed" && !hasAnswered && (
                <div className="w-full bg-white p-3.5 rounded-xl border-2 border-[#1A1A1A] shadow-[2.5px_2.5px_0_#1A1A1A] flex items-center justify-between gap-4">
                  <div className="flex items-center gap-2 text-red-600 font-black text-xs shrink-0">
                    <Timer className={`w-4 h-4 ${timeLeft <= 5 ? "animate-spin" : "animate-bounce"}`} />
                    <span>{timeLeft} {currentLang === "en" ? "Seconds Left" : "सेकंड बचे हैं"}</span>
                  </div>
                  <div className="flex-grow bg-neutral-200 h-3 rounded-full overflow-hidden border border-[#1A1A1A]">
                    <motion.div 
                      className={`h-full ${timeLeft <= 5 ? "bg-red-500" : "bg-emerald-500"}`}
                      initial={{ width: "100%" }}
                      animate={{ width: `${(timeLeft / 15) * 100}%` }}
                      transition={{ duration: 1, ease: "linear" }}
                    />
                  </div>
                </div>
              )}

              {/* TWO LARGE ACTION CHOICES */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {currentScenario.choices.map((choice) => {
                  const isSelected = selectedChoiceId === choice.id;
                  const isCorrect = choice.success;
                  
                  let cardStyle = "bg-white border-[#1A1A1A] text-[#1A1A1A] hover:bg-[#FFF9C4]";
                  if (hasAnswered) {
                    if (isSelected) {
                      cardStyle = isCorrect 
                        ? "bg-[#D1EED5] border-emerald-700 text-[#1A1A1A]" 
                        : "bg-[#FFCCD5] border-red-600 text-[#1A1A1A]";
                    } else if (isCorrect) {
                      cardStyle = "bg-[#D1EED5] opacity-50 border-emerald-700 text-[#1A1A1A]";
                    } else {
                      cardStyle = "bg-white opacity-40 border-neutral-300 text-neutral-400";
                    }
                  }

                  return (
                    <button
                      key={choice.id}
                      disabled={hasAnswered}
                      onClick={() => handleSelectChoice(choice.id)}
                      className={`p-6 rounded-2xl border-4 text-left flex flex-col gap-3 min-h-[160px] shadow-[4px_4px_0_#1A1A1A] hover:shadow-[2px_2px_0_#1A1A1A] hover:translate-y-0.5 active:translate-y-1 transition-all duration-200 cursor-pointer relative overflow-hidden ${cardStyle}`}
                    >
                      {/* Indicator Tag */}
                      <span className="text-xs font-mono font-black bg-[#FFD93D] border-2 border-[#1A1A1A] text-[#1A1A1A] px-2 py-0.5 rounded-full inline-block self-start shadow-[1px_1px_0_#1A1A1A]">
                        {choice.id.toUpperCase() === "A" ? "Option 1" : "Option 2"}
                      </span>

                      <p className="text-xs md:text-sm font-sans font-extrabold leading-relaxed flex-grow">
                        {choice.text[currentLang]}
                      </p>

                      {hasAnswered && isSelected && (
                        <div className="absolute bottom-2 right-2 rounded-full border-2 border-current p-1">
                          {isCorrect ? (
                            <Check className="w-5 h-5 text-emerald-800 animate-bounce" />
                          ) : (
                            <AlertCircle className="w-5 h-5 text-red-600 animate-pulse" />
                          )}
                        </div>
                      )}
                    </button>
                  );
                })}
              </div>

              {/* ANSWER FEEDBACK WITH VOICE NARRATION ACCENT */}
              {hasAnswered && selectedChoiceId && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`p-5 rounded-2xl border-4 border-[#1A1A1A] shadow-[4px_4px_0_#1A1A1A] ${
                    currentScenario.choices.find(c => c.id === selectedChoiceId)?.success
                      ? "bg-[#D1EED5]"
                      : "bg-[#FFCCD5]"
                  }`}
                >
                  <div className="flex gap-4 items-start text-left">
                    <div className="bg-white border-2 border-[#1A1A1A] p-2 rounded-xl shadow-[2px_2px_0_#1A1A1A] shrink-0">
                      {currentScenario.choices.find(c => c.id === selectedChoiceId)?.success ? "🏆" : "⚠️"}
                    </div>
                    <div>
                      <h5 className="font-mono text-xs font-black text-[#1A1A1A] uppercase">
                        {currentScenario.choices.find(c => c.id === selectedChoiceId)?.success 
                          ? (currentLang === "en" ? "Choice feedback (Succeeded!)" : "सफल निर्णय का विश्लेषण") 
                          : (currentLang === "en" ? "Analysis (Opportunity to learn)" : "सीखने का अमूल्य अवसर")}
                      </h5>
                      <p className="text-xs md:text-sm text-neutral-800 font-sans font-bold leading-normal mt-1.5">
                        {currentScenario.choices.find(c => c.id === selectedChoiceId)?.feedback[currentLang]}
                      </p>

                      {currentScenario.choices.find(c => c.id === selectedChoiceId)?.success && gameMode === "timed" && !timerRanOut && (
                        <span className="inline-block mt-2 font-mono text-[10px] font-black text-emerald-900 bg-white border border-emerald-400 px-2 py-0.5 rounded-full shadow-[1px_1px_0_#1A1A1A] animate-pulse">
                          🔥 {currentLang === "en" ? "Timed Speed Bonus" : "तेजी बोनस"}: +{scoredBonus} XP
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Move to next step */}
                  <div className="flex justify-end mt-4">
                    <button
                      onClick={handleNextQuestion}
                      className="bg-[#FFD93D] hover:bg-[#FFE066] border-2 border-[#1A1A1A] text-[#1A1A1A] font-black px-6 py-2.5 rounded-xl text-xs md:text-sm shadow-[3px_3px_0_#1A1A1A] hover:translate-y-0.5 active:translate-y-1 transition-all cursor-pointer flex items-center gap-1.5"
                    >
                      <span>
                        {currentQuestionIndex === LOCAL_SCENARIOS.length - 1
                          ? (currentLang === "en" ? "Check Final Score" : "अंतिम परिणाम देखें")
                          : (currentLang === "en" ? "Next Challenge" : "अगली चुनौती")}
                      </span>
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  </div>
                </motion.div>
              )}
            </motion.div>
          )}

          {/* SCREEN 3: Celebrate unlocked Badge POPUP */}
          {gameState === "celebrate_badge" && celebratedBadge && (
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="max-w-md mx-auto p-6 md:p-8 bg-white border-4 border-[#1A1A1A] rounded-3xl text-center flex flex-col gap-5 items-center shadow-[8px_8px_0_#1A1A1A]"
            >
              <div className="relative">
                <div className="absolute -inset-2 bg-gradient-to-r from-pink-500 to-yellow-500 rounded-full blur opacity-40 animate-pulse" />
                <div className={`relative w-20 h-20 rounded-full border-4 flex items-center justify-center text-4xl shadow-[4px_4px_0_#1A1A1A] ${celebratedBadge.color}`}>
                  {celebratedBadge.icon}
                </div>
              </div>

              <div>
                <span className="text-[10px] bg-[#FFD93D] border-2 border-[#1A1A1A] text-[#1A1A1A] font-black font-mono uppercase tracking-widest block self-center px-3 py-1 rounded-full shadow-[1.5px_1.5px_0_#1A1A1A]">
                  ★ MEDAL UNLOCKED ★
                </span>
                <h4 className="text-xl font-black text-[#1A1A1A] font-display mt-4">
                  {celebratedBadge.name[currentLang]}
                </h4>
                <p className="text-neutral-700 text-xs mt-3 leading-relaxed font-semibold">
                  {currentLang === "en"
                    ? "Congratulations! Your decision reflects stellar social intelligence, emotional safety protection, and local leadership in our village community."
                    : "अपरंपार बधाई! आपका यह समाज-सेवी कदम दूसरों के प्रति आपकी संवेदनशीलता, सुरक्षा व्यवस्था, और कुशल नेतृत्व को सिद्ध करता है। ऐसे ही आगे बढ़ें!"}
                </p>
              </div>

              <div className="w-full flex flex-col gap-2">
                <button
                  onClick={handleCloseBadgePopup}
                  className="w-full py-3 bg-[#FFD93D] border-2 border-[#1A1A1A] text-[#1A1A1A] font-black rounded-xl text-xs md:text-sm shadow-[3px_3px_0_#1A1A1A] hover:translate-y-0.5 active:translate-y-1 transition-all cursor-pointer"
                >
                  {currentLang === "en" ? "Continue Journey" : "अपनी यात्रा जारी रखें"}
                </button>
              </div>
            </motion.div>
          )}

          {/* SCREEN 4: Quiz completed / Score analysis results summary */}
          {gameState === "completed" && (
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="p-6 md:p-8 rounded-3xl bg-white border-4 border-[#1A1A1A] max-w-lg mx-auto text-center flex flex-col gap-6 items-center shadow-[8px_8px_0_#1A1A1A]"
            >
              <div className="w-16 h-16 bg-[#FFF2CC] border-2 border-[#1A1A1A] rounded-full flex items-center justify-center text-3xl shadow-[3px_3px_0_#1A1A1A]">
                🎓
              </div>

              <div>
                <h3 className="text-xl md:text-2xl font-black text-[#1A1A1A] font-display">
                  {currentLang === "en" ? "Social Champion Title Achieved!" : "प्रशंसा! आप हैं गाँव के कुशल मार्गदर्शक!"}
                </h3>
                <p className="text-neutral-700 text-xs md:text-sm mt-3 leading-relaxed font-semibold">
                  {currentLang === "en"
                    ? `Astonishing job! Your final cumulative wisdom is ${points} XP points. By understanding sadness, resolving handpump arguments neutrally, and respecting diverse accents, you have made our public spaces safer.`
                    : `शानदार प्रदर्शन! आपने कुल ${points} ज्ञान अंक कमाए हैं। भावनाओं को समझने, झगड़ों का निष्पक्ष निपटारा करने, और बाहरी परिवारों को गले लगाने के आपके निर्णयों से हमारा गाँव प्रेम और भाईचारे की मिसाल बनेगा।`}
                </p>
              </div>

              {/* Dynamic Badge album show of progress */}
              <div className="w-full bg-[#FEF9E7] p-4 rounded-2xl border-2 border-[#1A1A1A] shadow-[2.5px_2.5px_0_#1A1A1A] text-left">
                <h5 className="text-[10px] uppercase font-mono font-black text-neutral-500 tracking-wider">
                  {currentLang === "en" ? "Your Earned Badges Portfolio" : "आपके द्वारा अर्जित राष्ट्रीय पदक"}
                </h5>
                <div className="grid grid-cols-2 gap-3 mt-3">
                  {LOCAL_SCENARIOS.map((scenario) => {
                    const isEarned = unlockedBadges.includes(scenario.badgeId);
                    return (
                      <div 
                        key={scenario.id}
                        className={`p-2.5 rounded-xl border-2 flex items-center gap-2 ${
                          isEarned 
                            ? `${scenario.badgeColor} shadow-[2px_2px_0_#1A1A1A]` 
                            : "bg-white opacity-40 border-neutral-300 text-neutral-400"
                        }`}
                      >
                        <span className="text-xl">{scenario.badgeIcon}</span>
                        <span className="text-[10px] font-sans font-black truncate">
                          {scenario.badgeName[currentLang]}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Dynamic Leaderboard overview */}
              <div className="w-full bg-white p-4 rounded-xl border-2 border-[#1A1A1A]">
                <p className="text-[10px] font-mono font-black uppercase text-neutral-500 text-left">
                  {currentLang === "en" ? "Your Rank vs Neighbors" : "पड़ोसियों के बीच आपकी रैंक"}
                </p>
                <div className="flex justify-between items-center mt-2.5 bg-[#FFF9C4] p-3 rounded-xl border-2 border-[#1A1A1A] shadow-[1.5px_1.5px_0_#1A1A1A]">
                  <div className="flex items-center gap-2">
                    <span className="text-lg">👑</span>
                    <span className="text-xs font-sans font-black text-amber-950">
                      {currentLang === "en" ? "You climbed up!" : "आप ऊपर आ गए हैं!"}
                    </span>
                  </div>
                  <span className="text-xs font-mono font-black text-amber-950">
                    {points} XP • Rank #{leaderboard.findIndex(p => p.isUser) + 1}
                  </span>
                </div>
              </div>

              {/* Action options */}
              <div className="grid grid-cols-2 gap-3 w-full">
                <button
                  onClick={() => startQuiz("timed")}
                  className="py-3 bg-white border-2 border-[#1A1A1A] text-[#1A1A1A] font-black text-xs md:text-sm rounded-xl cursor-pointer shadow-[2.5px_2.5px_0_#1A1A1A] hover:bg-neutral-50"
                >
                  {currentLang === "en" ? "Retry Speed Challenge" : "दोबारा खेलें"}
                </button>
                <button
                  onClick={onBack}
                  className="py-3 bg-[#FF6B6B] text-white border-2 border-[#1A1A1A] font-black text-xs md:text-sm rounded-xl cursor-pointer shadow-[2.5px_2.5px_0_#1A1A1A] hover:translate-y-0.5"
                >
                  {currentLang === "en" ? "Back to Dashboard" : "गैलेरी में जाएं"}
                </button>
              </div>
            </motion.div>
          )}

        </AnimatePresence>
      </div>

      {/* Interactive Footer banner */}
      <div className="p-4 bg-white border-t-4 border-[#1A1A1A] text-center text-xs text-[#1A1A1A] font-black flex items-center justify-center gap-1.5">
        <span>🕊️</span>
        <span>
          {currentLang === "en" 
            ? "Fosters peaceful village relationships, reduces local friction, and builds legal & emotional security." 
            : "सीखें: झगड़े और गुस्से से केवल नुकसान होता है। सहानुभूति, सही संवाद और विविधता का आदर ही सभ्य समाज की पहचान है।"}
        </span>
      </div>

    </div>
  );
}
