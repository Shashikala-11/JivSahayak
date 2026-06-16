import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { BookOpen, Volume2, VolumeX, ShieldCheck, Sparkles, ArrowRight, RotateCcw } from "lucide-react";
import { Language, StorySlide } from "../types";
import { speakText, stopSpeaking, registerAudioStateListener } from "../utils/audio";

interface StoryModuleProps {
  currentLang: Language;
  onBack: () => void;
}

const STORY_SLIDES: StorySlide[] = [
  {
    id: 1,
    image: "/src/assets/images/story_sunita_sewing_1781631542503.jpg",
    enText: "Meet Sunita. She is 25 years old and lives in a vibrant small village. Sunita has a natural gift for sewing beautiful garments. She dreams of starting a small home-based tailoring service. However, her uncle says: 'Women should only manage kitchens, not businesses. Tailoring is of no use.' What should Sunita do?",
    hiText: "सुनीता से मिलें। वह 25 वर्ष की है और एक प्यारे गाँव में रहती है। सुनीता के हाथों में सिलाई का एक जादुई हुनर है। वह घर बैठे लोगों के कपड़े सिलने का छोटा व्यवसाय शुरू करना चाहती है। लेकिन उसके चाचा कहते हैं: 'महिलाओं को गृहस्थी संभालनी चाहिए, धंधा नहीं। सिलाई-कढ़ाई से क्या होगा?' सुनीता को क्या करना चाहिए?",
    bnText: "সুনীতার সাথে আলাপ করুন। সে ২৫ বছরের এক তরুণী, যে এক গ্রামে থাকে। সুনীতার পোশাক তৈরির চমৎকার রূপালি হাত রয়েছে। সে নিজের ঘরে বসেই একটি দর্জি দোকান শুরু করার স্বপ্ন দেখে। কিন্তু তার কাকা বলেন, 'মেয়েদের শুধু রান্না সামলানো উচিত, ব্যবসা নয়।' সুনীতার কী করা উচিত?",
    taText: "சுனிதாவைச் சந்தியுங்கள். அவளுக்கு 25 வயது, ஒரு கிராமத்தில் வாழ்கிறாள். சுநிதாவிடம் அழகான உடைகளைத் தைக்கும் திறமை உள்ளது. வீட்டில் தையல் தொழில் தொடங்க விரும்புகிறாள். ஆனால் மாமா, 'பெண்கள் சமைக்க வேண்டும், தொழில் செய்யக்கூடாது' என்கிறார். சுநிதா என்ன செய்ய வேண்டும்?",
    teText: "సునీతను కలవండి. ఆమెకు 25 ఏళ్లు, ఒక గ్రామంలో నివసిస్తుంది. సునీతకు కుట్టుపనిలో అద్భుతమైన నైపుణ్యం ఉంది. ఇంట్లోనే చిన్న షాపు ప్రారంభించాలనుకుంటుంది. కానీ ఆమె మామ: 'ఆడవాళ్ళు వంటిల్లు చూసుకోవాలి, వ్యాపారం కాదు' అంటున్నాడు. సునీత ఏం చేయాలి?",
    hasChoice: true,
    choices: [
      {
        text: {
          en: "Accept silently and stop tailoring to keep the peace.",
          hi: "चुपचाप चाचा की बात मान लें और मन मारकर सिलाई बंद कर दें।",
          bn: "চুপচাপ কাকার কথা মেনে নিন এবং সেলাই কাজ বন্ধ করে দেন।",
          ta: "மாமாவின் சொல்படி கேட்டு தையல் தொழிலைக் கைவிடவும்.",
          te: "మామ మాట విని కుట్టుపని ఆపివేయండి."
        },
        feedback: {
          en: "Sunita stopped. Her family is quiet, but she feels sad and has no independent earnings. She is fully reliant on others.",
          hi: "सुनीता ने सिलाई छोड़ दी। परिवार तो शांत है, लेकिन सुनीता अंदर से दुखी है। उसकी अपनी कोई कमाई नहीं है और वह दूसरों पर निर्भर है।",
          bn: "সুনীতা কাজ করা বন্ধ করে দিল। পরিবারে অশান্তি নেই, কিন্তু তার মন ভেঙে গেছে। নিজের কোনো সঞ্চয় বা স্বাধীনতা রইল না।",
          ta: "சுநிதா தையல் செய்வதை நிறுத்தினாள். குடும்பம் அமைதியாக இருக்கிறது, ஆனால் அவள் வருத்தத்துடன் சுய வருமானம் இல்லாமல் இருக்கிறாள்.",
          te: "సునీత కుట్టుపని ఆపింది. కుటుంబం నిశ్శబ్దంగా ఉంది కానీ ఆమె బాధపడుతోంది, సొంత ఆదాయం లేదు."
        },
        scoreChange: { money: 0, happiness: -20 },
        nextSlideId: 2
      },
      {
        text: {
          en: "Respectfully explain that Rs. 150 daily will buy milk & books for the kids.",
          hi: "चाचा से आदरपूर्वक समझाएं कि सिलाई से रोज ₹150 की अतिरिक्त आय होगी, जिससे बच्चों के लिए दूध और स्कूल की किताबें आएंगी।",
          bn: "কাকাকে বুঝিয়ে বলুন যে প্রতিদিন ১৫০ টাকা অতিরিক্ত আয় হলে বাচ্চাদের ভালো পড়াশোনা ও পুষ্টিকর খাবার জোগানো যাবে।",
          ta: "மதிப்போடு, தினமும் வரும் ரூ.150 கொண்டு பிள்ளைகளுக்கு பாலும் புத்தகமும் வாங்கலாம் என விளக்கவும்.",
          te: "గౌరవంగా రోజుకు రూ. 150 పొదుపు పిల్లల పాలు, చదువు కు సహాయపడుతుందని వివరించండి."
        },
        feedback: {
          en: "Wow! Her uncle agreed. Income is noble. Sunita bought a sewing machine and earned her first Rs. 300 this week!",
          hi: "अद्भुत! चाचा मान गए। कमाई नेक काम के लिए है। सुनीता ने सिलाई मशीन से इस हफ्ते अपने पहले ₹300 कमाए!",
          bn: "দারুণ! কাকা রাজি হলেন। সুনীতা একটি সেলাই মেশিন নিয়ে কাজ শুরু করল এবং এই সপ্তাহে প্রথম ৩০০ টাকা আয় করল!",
          ta: "அருமை! மாமா ஒத்துக்கொண்டார். சுநிதா தையல் இயந்திரம் வாங்கி இந்த வாரம் முதல் ரூ.300 சம்பாதித்தாள்!",
          te: "అద్భుతం! మామ ఒప్పుకున్నాడు. సునీత కుట్టు యంత్రం కొని ఈ వారం మొదటిసారి రూ. 300 సంపాదించింది!"
        },
        scoreChange: { money: 300, happiness: 20 },
        nextSlideId: 2
      }
    ]
  },
  {
    id: 2,
    image: "/src/assets/images/financial_banking_hero_1781631557221.jpg",
    enText: "Sunita's sewing shop is thriving! Neighbors love her colorful kurtas. She now has Rs. 1,200 saved in cash. Neighbors tell her to hide it in a wheat canister in the farm shed. A relative asks her to invest it in a scheme that guarantees to double her money in 5 days. What should she do?",
    hiText: "सुनीता की सिलाई का काम चल पड़ा है! पड़ोसी उसके कपड़े बहुत पसंद करते हैं। अब उसके पास ₹1,200 की बचत नकद में है। पड़ोसियों ने कहा कि इसे रसोई के गेहूँ के डब्बे में छिपा दो। एक दूर के रिश्तेदार ने कहा कि इसे 5 दिन में पैसा दुगना करने वाली योजना में लगा दो। सुनीता क्या करे?",
    bnText: "সুনীতার সেলাইয়ের দোকান খুব ভালো চলছে! প্রতিবেশীরা তার তৈরি কুর্তি পছন্দ করছে। তার হাতে এখন ১২০০ টাকা জমেছে। এক প্রতিবেশী বলল চালের ড্রামে লুকিয়ে রাখতে, অন্য একজন আত্মীয় ৫ দিনে দ্বিগুণ লাভের এক স্কিমে দিতে বলল। কী করবে সুনীতা?",
    taText: "சுனிதாவின் தையல் கடை அமோகமாக நடக்கிறது! அவளிடம் ரூ.1,200 சேமிப்பு ரொக்கமாக உள்ளது. உறவினர் ஒருவர் 5 நாட்களில் பணம் இருமடங்காகும் திட்டத்தில் போடச் சொல்கிறார். சுநிதா என்ன செய்ய வேண்டும்?",
    teText: "సునీత కుట్టు షాపు బాగా నడుస్తోంది! ఆమె వద్ద రూ. 1,200 నగదు ఉంది. ఆ డబ్బును ఒక బంధువు 5 రోజుల్లో రెండింతలు చేసే పథకంలో పెట్టమంటున్నాడు. సునీత ఏం చేయాలి?",
    hasChoice: true,
    choices: [
      {
        text: {
          en: "Join the double-money scheme. Trust a relative.",
          hi: "रिश्तेदार की बात मानकर पैसा दुगना करने वाली योजना में डाल दें।",
          bn: "কোনো আত্মীয়ের কথায় বিশ্বাস করে টাকা দ্বিগুণ করার স্কিমে দিয়ে দিন।",
          ta: "பணம் இருமடங்காகும் திட்டத்தில் போடவும். உறவினரை நம்பவும்.",
          te: "బంధువును నమ్మి డబ్బు రెండింతలు చేసే పథకంలో పెట్టండి."
        },
        feedback: {
          en: "Oh no! It was a fake trick! The relative ran away with her money, and Sunita lost her entire savings of Rs. 1,200. Always save only in official banks or post offices!",
          hi: "अरे नहीं! वह एक फ्रॉड (झूठा) फ्रैंडली स्कीम थी! रिश्तेदार पैसा लेकर भाग गया, और सुनीता के ₹1,200 डूब गए। हमेशा केवल सरकारी बैंक या डाकघर में ही बचत खाता खोलें!",
          bn: "ওহ না! এটি একটি ভুয়ো ফ্রড স্কিম ছিল! আত্মীয়টি টাকা নিয়ে পালিয়ে গেল। সুনীতার কষ্টের ১২০০ টাকা সম্পূর্ণ নষ্ট হল। সর্বদা আসল ব্যাঙ্ক বা ডাকঘরেই টাকা সঞ্চয় করবেন!",
          ta: "ஐயோ! அது ஒரு ஏமாற்றுத் திட்டம்! உறவினர் பணத்தோடு ஓடிவிட்டார். சேமிப்பு முழுவதும் வீணானது. அரசு வங்கி அல்லது அஞ்சலகத்தில் மட்டுமே சேமிக்க வேண்டும்!",
          te: "అయ్యో! అది మోసపూరిత పథకం! బంధువు డబ్బుతో పారిపోయాడు. సునీత తన రూ. 1,200 కోల్పోయింది. ఎల్లప్పుడూ బ్యాంకులలోనే దాచుకోండి!"
        },
        scoreChange: { money: -1200, happiness: -30 },
        nextSlideId: 3
      },
      {
        text: {
          en: "Visit the post office to open a zero-balance Jan Dhan Savings Account.",
          hi: "नजदीकी डाकघर या बैंक जाकर शून्य-बैलेंस जन धन बचत खाता खोलें।",
          bn: "স্থানীয় डाकঘর বা রাষ্ট্রায়ত্ত ব্যাঙ্কে গিয়ে জিরো-ব্যালেন্স জনধন সেভিংস অ্যাকাউন্ট খুলুন।",
          ta: "வங்கிக்குச் சென்று ஜீரோ-பேலன்ஸ் ஜன தன் சேமிப்புக் கணக்கு தொடங்கவும்.",
          te: "పోస్ట్ ఆఫీస్ లేదా బ్యాంకుకి వెళ్ళి జీరో బ్యాలెన్స్ జన్ ధన్ సేవింగ్స్ ఖాతా తెరవండి."
        },
        feedback: {
          en: "Excellent choice! Her money is 100% secure. She even gets a RuPay debit card and interest on savings. She belongs to the bank now!",
          hi: "शानदार निर्णय! सुनीता का पैसा अब 100% सुरक्षित है। उसे ब्याज भी मिलेगा और एक मुफ्त रुपे डेबिट कार्ड भी मिला। अब वह खुद अपनी मालकिन है!",
          bn: "দুর্দান্ত সিদ্ধান্ত! সুনীতার টাকা ১০০% নিরাপদ হল। সে সুদ পাবে এবং একটি রূপের ডেবিট কার্ডও পেল। এখন সে স্বাধীন!",
          ta: "சிறந்த முடிவு! பணம் முற்றிலும் பாதுகாப்பாக உள்ளது. அவளுக்கு ரூபே கார்டும் வட்டியும் கிடைக்கிறது. பெருமையோடு வாழ்கிறாள்!",
          te: "అద్భుతమైన నిర్ణయం! ఆమె డబ్బు 100% సురక్షితం. ఒక రూపే డెబిట్ కార్డ్ లభించింది. పొదుపుపై వడ్ディー కూడా వస్తుంది!"
        },
        scoreChange: { money: 200, happiness: 25 },
        nextSlideId: 3
      }
    ]
  },
  {
    id: 3,
    image: "/src/assets/images/jivsahayak_hero_banner_1781631524464.jpg",
    enText: "With her money safe in the bank, Sunita starts conducting custom tailoring classes for 4 other young girls in the village. Her husband is stressed that people might think he cannot provide enough food. How should Sunita approach this?",
    hiText: "बैंक में पैसा सुरक्षित होने के बाद, सुनीता गांव की 4 अन्य लड़कियों को सिलाई सिखाना शुरू करती है। उसका पति परेशान है कि गांववाले सोचेंगे कि वह परिवार के लिए रोटी नहीं कमा पा रहा। सुनीता को क्या रुख अपनाना चाहिए?",
    bnText: "ফান্ড সুরক্ষিত হওয়ার পর, সুনীতা গ্রামের আরো ৪টি মেয়েকে সिलाई শেখাতে শুরু করল। তার স্বামী লজ্জিত যে গ্রামবাসীরা ভাববে সে হয়তো পরিবারের খরচ জোগাতে পারছে না। সুনীতা কী করবে?",
    taText: "சேமிப்புடன் சுநிதா கிராமத்து பெண்களுக்கு தையல் வகுப்பு எடுக்கிறாள். கணவரோ, தம்மால் குடும்பத்தை நடத்த முடியவில்லை என மற்றவர்கள் பேசக்கூடும் என வருந்துகிறார். சுநிதா என்ன செய்ய வேண்டும்?",
    teText: "బ్యాంకులో డబ్బు భద్రంగా ఉండటంతో, సునీత ఊరిలోని నలుగురు అమ్మాయిలకు కుట్టు శిక్షణ ఇవ్వడం ప్రారంభించింది. ఆమె భర్త ఆందోళన చెందుతున్నాడు. సునీత ఏం ചെയ്യాలి?",
    hasChoice: true,
    choices: [
      {
        text: {
          en: "Close the classes instantly. A husband's ego is more important.",
          hi: "कक्षाएं तुरंत बंद कर दें। पति के मान-सम्मान के सामने खुद का काम कुछ नहीं।",
          bn: "ক্লাস নেওয়া অবিলম্বে বন্ধ করে দেন। স্বামীর জেদের চেয়ে নিজের কাজ বড় নয়।",
          ta: "வகுப்புகளை மூடவும். கணவனின் கவுரவமே முக்கியம்.",
          te: "శిక్షణ ఆపివేయండి. భర్త అహంకారం ముఖ్యం."
        },
        feedback: {
          en: "Sunita stopped. The village girls are disappointed. Sunita feels restricted again. The family income drops.",
          hi: "सुनीता रुक गई। गांव की लड़कियां निराश हो गईं। सुनीता को फिर से चारदीवारी का अहसास हुआ। पारिवारिक आय कम हो गई।",
          bn: "সুনীতা বন্ধ করল। গ্রামের মেয়েরা অত্যন্ত হতাশ হল। সুনীতার মন আবার ছোট হয়ে গেল এবং পরিবারের আয়ও কমে গেল।",
          ta: "சுநிதா வகுப்புகளை நிறுத்தினாள். கிராமத்து பெண்கள் ஏமாற்றம் அடைந்தனர். குடும்ப வருமானம் மீண்டும் குறைந்தது.",
          te: "సునీత ఆపేసింది. ఊరి అమ్మాయిలు నిరాశపడ్డారు. కుటుంబ ఆదాయం పడిపోయింది."
        },
        scoreChange: { money: -200, happiness: -20 },
        nextSlideId: 4
      },
      {
        text: {
          en: "Sit down together. Show him the bank passbook. Explain they are equal partners.",
          hi: "साथ बैठकर बात करें। पति को बैंक की पासबुक दिखाएं और कहें कि संकट में दोनों मिलकर बच्चों की शिक्षा के लिए मजबूत स्तंभ बनेंगे।",
          bn: "দুজন একসাথে বসুন। স্বামীর হাতে ব্যাঙ্কের পাসবই দিন। বুঝিয়ে বলুন যে দুজনে মিলে বাচ্চাদের পড়াশোনা ও আগামী বিপদের ঢাল তৈরি করছেন।",
          ta: "ஒன்றாக அமர்ந்து, சேமிப்புப் புத்தகத்தைக் காட்டி, இருவரும் சரிசமமான துணையாக நிற்பதை எடுத்துரைக்கவும்.",
          te: "భర్తతో కలిసి మాట్లాడండి. బ్యాంకు పాస్ బుక్ చూపించి, పిల్లల చదువుల కోసం ఇద్దరం కలిసి శ్రమిస్తున్నామని చెప్పండి."
        },
        feedback: {
          en: "A triumph of mindset! Her husband smiled holding the passbook. He now drops the village girls to classes himself! Sunita's business is legally registered under govt micro-schemes.",
          hi: "विचारों की बड़ी जीत! पासबुक देखकर सुनीता के पति के चेहरे पर मुस्कान आ गई। अब वह खुद लड़कियों को सुनीता की क्लास तक छोड़ने आते हैं! सिलाई केंद्र सरकारी छोटे उद्योग में पंजीकृत है।",
          bn: "মানসিকতার জয়! পাসবই দেখে স্বামীর আত্মবিশ্বাস বাড়ল। এখন সে নিজেই মেয়েদের সুনীতার ক্লাসে পৌঁছে দিয়ে সাহায্য করে! সুনীতার ব্যবসা সরকারী যোজনার অধীনে রেজিস্টার হল।",
          ta: "மனப்போக்கு மாறியது! கணவன் புன்னகையுடன் உதவினார். பெண்களை வகுப்பிற்கு அவரே அழைத்து வருகிறார். தொழில் முறையாக அரசு திட்டத்தில் இணைந்தது!",
          te: "ఆలోచనా విధానంలో విజయం! భర్త గర్వపడ్డాడు. నలుగురు అమ్మాయిలకు తనే స్వయంగా సహాయం చేస్తున్నాడు. సునీత కుట్టు వ్యాపారం చిన్న కుటీర పరిశ్రమగా మారింది."
        },
        scoreChange: { money: 1000, happiness: 40 },
        nextSlideId: 4
      }
    ]
  },
  {
    id: 4,
    image: "/src/assets/images/story_sunita_sewing_1781631542503.jpg",
    enText: "Congratulations! Sunita is now the president of the Women's Tailoring Cooperative of her Block. Her business sustains 6 households. She broke the negative loop, protected her savings from fraudsters, and proved that a woman's skill is the ultimate engine of community resilience.",
    hiText: "बधाई हो! सुनीता अब अपने ब्लॉक के 'महिला वस्त्र सहकारी समिति' की अध्यक्ष बन चुकी है। उसका सिलाई उद्योग आज गांव के 6 परिवारों का चूल्हा जलाता है। उसने संकीर्ण सोच के जाल को तोड़ा, फ्रॉड चंगुल से पैसे बचाए और साबित किया कि एक महिला का कौशल ही पूरे समाज को समृद्ध बना सकता है।",
    bnText: "অভিনন্দন! সুনীতা এখন তার ব্লকের 'মহিলা কুটির সেলাই সমবায়'-এর সভাপতি। তার পরিশ্রমের ফসল আজ গ্রামের ৬টি পরিবারের মুখের আহার জোগায়। সে ভুল ধারণার দেয়াল ভেঙেছে, জালিয়াতদের হাত থেকে অর্থ বাঁচিয়েছে এবং প্রমাণ করেছে নারীদের শক্তিই শ্রেষ্ঠ সমাজ গড়তে পারে।",
    taText: "வாழ்த்துகள்! சுநிதா இப்போது தனது வட்டார மகளிர் தையல் கூட்டுறவு சங்கத் தலைவி ஆகிவிட்டாள். அவளது தொழில் 6 குடும்பங்களைக் காப்பாற்றுகிறது. மூடநம்பிக்கைகளை உடைத்து, சேமிப்பைப் பாதுகாத்து, பெண்கள் சக்தி என்பதை நிருபித்தாள்!",
    teText: "అభినందనలు! సునీత ఇప్పుడు మహిళా కుట్టు సహకార సంఘం అధ్యక్షురాలైంది. ఆమె వ్యాపారం 6 కుటుంబాలను పోషిస్తోంది. మోసగాళ్ళ నుండి డబ్బు కాపాడుకుంది. మహిళల నైపుణ్యం కుటుంబానికి ఆధారం అని నిరూపించింది!",
    hasChoice: false
  }
];

export default function StoryModule({ currentLang, onBack }: StoryModuleProps) {
  const [slideIndex, setSlideIndex] = useState(0);
  const [activeSlide, setActiveSlide] = useState<StorySlide>(STORY_SLIDES[0]);
  const [money, setMoney] = useState(100);
  const [happiness, setHappiness] = useState(50);
  const [feedbackText, setFeedbackText] = useState<string | null>(null);
  const [isSpeaking, setIsSpeaking] = useState(false);

  useEffect(() => {
    registerAudioStateListener((speaking) => {
      setIsSpeaking(speaking);
    });
    return () => {
      stopSpeaking();
    };
  }, []);

  const slide = activeSlide;

  const speakCurrentText = () => {
    let t = slide.enText;
    if (currentLang === "hi") t = slide.hiText;
    else if (currentLang === "bn") t = slide.bnText;
    else if (currentLang === "ta") t = slide.taText;
    else if (currentLang === "te") t = slide.teText;

    if (isSpeaking) {
      stopSpeaking();
    } else {
      speakText(t, currentLang);
    }
  };

  const handleChoice = (choice: any) => {
    const feedback = choice.feedback[currentLang];
    setFeedbackText(feedback);
    setMoney((prev) => Math.max(0, prev + choice.scoreChange.money));
    setHappiness((prev) => Math.min(100, Math.max(0, prev + choice.scoreChange.happiness)));

    speakText(feedback, currentLang);
  };

  const handleNext = () => {
    stopSpeaking();
    setFeedbackText(null);
    const nextIndex = slideIndex + 1;
    if (nextIndex < STORY_SLIDES.length) {
      setSlideIndex(nextIndex);
      setActiveSlide(STORY_SLIDES[nextIndex]);
      
      // If we are reaching the last informational/congratulatory slide, mark as completed!
      if (nextIndex === STORY_SLIDES.length - 1) {
        localStorage.setItem("jivsahayak_completed_stories", "true");
        window.dispatchEvent(new Event("jivsahayak_progress_updated"));
      }
    }
  };

  const resetStory = () => {
    stopSpeaking();
    setSlideIndex(0);
    setActiveSlide(STORY_SLIDES[0]);
    setMoney(100);
    setHappiness(50);
    setFeedbackText(null);
  };

  const getText = () => {
    if (currentLang === "hi") return slide.hiText;
    if (currentLang === "bn") return slide.bnText;
    if (currentLang === "ta") return slide.taText;
    if (currentLang === "te") return slide.teText;
    return slide.enText;
  };

  return (
    <div className="max-w-4xl mx-auto rounded-3xl bg-white border-4 border-[#1A1A1A] overflow-hidden shadow-[8px_8px_0_#1A1A1A]">
      {/* Top Header Panel */}
      <div className="bg-[#FFD93D] p-6 border-b-4 border-[#1A1A1A] flex justify-between items-center flex-wrap gap-4">
        <div className="flex items-center gap-3">
          <BookOpen className="text-[#1A1A1A] w-8 h-8" />
          <div>
            <h2 className="text-xl font-black text-[#1A1A1A] font-display tracking-tight leading-none">
              {currentLang === "en" ? "Sunita's Dream Livelihood" : 
               currentLang === "hi" ? "सुनीता की सिलाई और आत्मनिर्भरता" :
               currentLang === "bn" ? "সুনীতার লড়াই ও স্বনির্ভরতা" :
               currentLang === "ta" ? "சுனிதாவின் தையல் லட்சியம்" : "సునీత కుట్టు శిక్షణ & జీవనోపాధి"}
            </h2>
            <span className="text-xs font-mono font-black text-[#1A1A1A] opacity-85">SDG 4, 5, 8 Alignment</span>
          </div>
        </div>

        {/* Status Indicators for Gamification */}
        <div className="flex items-center gap-4">
          <div className="bg-white rounded-2xl px-4 py-2 border-2 border-[#1A1A1A] shadow-[2px_2px_0_#1A1A1A] flex items-center gap-2">
            <span className="text-xl">💰</span>
            <div>
              <p className="text-[10px] font-black text-neutral-600 leading-none">
                {currentLang === "en" ? "Funds" : "बचत / টাকা"}
              </p>
              <p className="text-sm font-black text-emerald-600 font-mono">₹{money}</p>
            </div>
          </div>
          <div className="bg-white rounded-2xl px-4 py-2 border-2 border-[#1A1A1A] shadow-[2px_2px_0_#1A1A1A] flex items-center gap-2">
            <span className="text-xl">💖</span>
            <div>
              <p className="text-[10px] font-black text-neutral-600 leading-none">
                {currentLang === "en" ? "Happiness" : "खुशी / आनंद"}
              </p>
              <p className="text-sm font-black text-rose-600 font-mono">{happiness}%</p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Narrative Area */}
      <div className="p-6 md:p-8 grid grid-cols-1 md:grid-cols-12 gap-8 items-start bg-[#FEF9E7]">
        {/* Story Illustration Frame */}
        <div className="md:col-span-5 flex flex-col gap-4">
          <div className="relative rounded-2xl overflow-hidden bg-[#FEF9E7] border-4 border-[#1A1A1A] aspect-[4/3] shadow-[4px_4px_0_#1A1A1A] group">
            <img
              src={slide.image}
              alt="Story illustration"
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
              referrerPolicy="no-referrer"
            />
            <div className="absolute top-3 left-3 bg-[#FFD93D] text-[10px] text-[#1A1A1A] px-3 py-1.5 rounded-full font-mono font-black border-2 border-[#1A1A1A] shadow-[2px_2px_0_#1A1A1A]">
              Slide {slideIndex + 1} / {STORY_SLIDES.length}
            </div>
          </div>

          {/* Large Audio Speaker Call to Action */}
          <button
            onClick={speakCurrentText}
            id="narrate_slide_btn"
            className={`w-full py-3.5 px-4 rounded-2xl cursor-pointer font-black flex items-center justify-center gap-3 border-2 border-[#1A1A1A] shadow-[4px_4px_0_#1A1A1A] transition-all duration-200 ${
              isSpeaking
                ? "bg-[#FF6B6B] text-white animate-pulse"
                : "bg-[#FFD93D] text-[#1A1A1A] hover:translate-y-0.5 hover:shadow-[2px_2px_0_#1A1A1A] active:translate-y-1 active:shadow-none"
            }`}
          >
            {isSpeaking ? (
              <>
                <VolumeX className="w-5 h-5" />
                <span className="text-sm">
                  {currentLang === "en" ? "Stop Listening" : "आवाज बंद करें / অডিও থামান"}
                </span>
              </>
            ) : (
              <>
                <Volume2 className="w-5 h-5 animate-bounce" />
                <span className="text-sm">
                  {currentLang === "en" ? "🔊 Listen to this slide" : "🔊 कहानी अपनी भाषा में सुनें"}
                </span>
              </>
            )}
          </button>
        </div>

        {/* Narrative & Questions */}
        <div className="md:col-span-7 flex flex-col gap-6">
          <div className="bg-white rounded-2xl p-6 border-4 border-[#1A1A1A] shadow-[4px_4px_0_#1A1A1A]">
            <p className="text-[#1A1A1A] text-base md:text-lg leading-relaxed font-sans font-semibold">
              {getText()}
            </p>
          </div>

          {/* Interactive Choice Mechanics */}
          <AnimatePresence mode="wait">
            {slide.hasChoice && !feedbackText ? (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="flex flex-col gap-3"
              >
                <div className="text-xs font-black text-[#1A1A1A] px-1 uppercase tracking-wider font-mono">
                  {currentLang === "en" ? "What should Sunita choose?" : "सुनीता को क्या सलाह देंगे?"}
                </div>
                {slide.choices?.map((choice, idx) => (
                  <button
                    key={idx}
                    id={`choice_btn_${idx}`}
                    onClick={() => handleChoice(choice)}
                    className="w-full text-left p-4 rounded-2xl bg-white border-2 border-[#1A1A1A] hover:border-transparent hover:bg-[#FFF9C4] text-[#1A1A1A] transition-all duration-200 shadow-[4px_4px_0_#1A1A1A] hover:shadow-[2px_2px_0_#1A1A1A] hover:translate-y-0.5 flex items-start gap-3 group cursor-pointer font-semibold"
                  >
                    <div className="bg-[#FFD93D] text-[#1A1A1A] w-7 h-7 rounded-full flex items-center justify-center font-black text-sm shrink-0 border-2 border-[#1A1A1A] shadow-[1px_1px_0_#1A1A1A] group-hover:bg-[#FF6B6B] group-hover:text-white">
                      {idx === 0 ? "A" : "B"}
                    </div>
                    <span className="text-sm md:text-base leading-normal">
                      {choice.text[currentLang]}
                    </span>
                  </button>
                ))}
              </motion.div>
            ) : null}

            {/* Display Feedback Screen */}
            {feedbackText ? (
              <motion.div
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="bg-[#E2F5E5] border-4 border-[#1A1A1A] rounded-2xl p-6 flex flex-col gap-4 relative overflow-hidden shadow-[4px_4px_0_#1A1A1A]"
              >
                <div className="flex items-start gap-3">
                  <div className="bg-white p-2.5 rounded-xl border-2 border-[#1A1A1A] text-[#1A1A1A] shadow-[2px_2px_0_#1A1A1A]">
                    <Sparkles className="w-5 h-5 " />
                  </div>
                  <div>
                    <h4 className="text-xs font-black text-[#1A1A1A] uppercase tracking-widest font-mono">
                      {currentLang === "en" ? "Decision Outcome" : "निर्णय का परिणाम"}
                    </h4>
                    <p className="text-[#1A1A1A] text-sm md:text-base font-semibold mt-2 leading-relaxed">
                      {feedbackText}
                    </p>
                  </div>
                </div>

                <button
                  onClick={handleNext}
                  id="choice_next_btn"
                  className="self-end bg-[#FFD93D] hover:bg-[#FFD93D]/90 border-2 border-[#1A1A1A] text-[#1A1A1A] font-black px-6 py-2.5 rounded-xl flex items-center gap-2 cursor-pointer text-sm shadow-[3px_3px_0_#1A1A1A] hover:translate-y-0.5 hover:shadow-[1px_1px_0_#1A1A1A] transition-all"
                >
                  <span>{currentLang === "en" ? "Next Slide" : "आगे बढ़ें / পরের স্লাইড"}</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </motion.div>
            ) : null}

            {/* End of Story Screen */}
            {!slide.hasChoice && slideIndex === STORY_SLIDES.length - 1 ? (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="p-6 rounded-2xl bg-[#D1EED5] border-4 border-[#1A1A1A] flex flex-col gap-5 items-center text-center shadow-[6px_6px_0_#1A1A1A]"
              >
                <div className="w-16 h-16 bg-white text-[#1A1A1A] rounded-full flex items-center justify-center border-2 border-[#1A1A1A] shadow-[2px_2px_0_#1A1A1A]">
                  <ShieldCheck className="w-9 h-9 text-emerald-600" />
                </div>
                <div>
                  <h3 className="text-lg md:text-xl font-black text-[#1A1A1A] font-display">
                    {currentLang === "en" ? "Empowering Ending Achieved!" : "प्रशंशा! सुनीता आत्मनिर्भर बनी!"}
                  </h3>
                  <p className="text-[#1A1A1A] text-xs md:text-sm mt-1 font-semibold">
                    {currentLang === "en" 
                     ? "You scored high. Sunita kept her money secure from cheating and built high family status." 
                     : "आपने सुनीता को सुरक्षित बैंक खाता और घरेलू आत्मविश्वास दिलाकर एक समृद्ध समाज की रचना की।"}
                  </p>
                </div>

                <div className="flex gap-3 mt-2">
                  <button
                    onClick={resetStory}
                    className="px-5 py-2.5 bg-white border-2 border-[#1A1A1A] rounded-xl font-black text-sm text-[#1A1A1A] hover:bg-neutral-100 cursor-pointer flex items-center gap-2 shadow-[2px_2px_0_#1A1A1A] hover:translate-y-0.5 transition-all"
                  >
                    <RotateCcw className="w-4 h-4" />
                    <span>{currentLang === "en" ? "Play Again" : "दोबारा खेलें"}</span>
                  </button>
                  <button
                    onClick={onBack}
                    className="px-5 py-2.5 bg-[#FF6B6B] text-white border-2 border-[#1A1A1A] rounded-xl font-black text-sm hover:bg-[#FF6B6B]/90 cursor-pointer shadow-[2px_2px_0_#1A1A1A] hover:translate-y-0.5 transition-all"
                  >
                    {currentLang === "en" ? "Check Other Topics" : "दूसरे विषय सीखें"}
                  </button>
                </div>
              </motion.div>
            ) : null}

            {/* Middle Slides navigation placeholder if no choice is prompt */}
            {!slide.hasChoice && slideIndex < STORY_SLIDES.length - 1 ? (
              <div className="flex justify-end mt-4">
                <button
                  onClick={handleNext}
                  className="bg-[#FFD93D] hover:bg-[#FFD93D]/90 border-2 border-[#1A1A1A] text-[#1A1A1A] font-black px-6 py-2.5 rounded-xl flex items-center gap-2 cursor-pointer text-sm shadow-[3px_3px_0_#1A1A1A] hover:translate-y-0.5 hover:shadow-[1px_1px_0_#1A1A1A] transition-all"
                >
                  <span>{currentLang === "en" ? "Continue Screen" : "कहानी जारी रखें"}</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            ) : null}
          </AnimatePresence>
        </div>
      </div>

      {/* Narrative Footer Info */}
      <div className="p-4 bg-white border-t-4 border-[#1A1A1A] text-center flex items-center justify-center gap-2">
        <span className="text-xl">🌻</span>
        <p className="text-xs text-[#1A1A1A] font-sans font-black tracking-wide">
          {currentLang === "en" 
           ? "Sunita's Sewing story targets Goal 5 (Gender Equality) & Goal 10 (Reduced Inequality)." 
           : "सिलाई कहानी सिखाती है: सुरक्षित बैंकिंग का महत्व, घरेलू साझेदारी, और कौशल की शक्ति।"}
        </p>
      </div>
    </div>
  );
}
