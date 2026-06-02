const Groq = require('groq-sdk');

// Initialize Groq client (if API key is present)
const apiKey = process.env.GROQ_API_KEY || process.env.groq_api_key;
let groqClient = null;
if (apiKey) {
  try {
    groqClient = new Groq({ apiKey });
  } catch (err) {
    console.error('Error initializing Groq client:', err.message);
  }
} else {
  console.log('No GROQ_API_KEY found. AI Chatbot will run in Fallback Rule-Based Mode.');
}

const normalizeLanguage = (lang) => {
  if (!lang || typeof lang !== 'string') return 'en';
  const clean = lang.toLowerCase().trim();
  if (clean.startsWith('hi')) return 'hi';
  if (clean.startsWith('mr')) return 'mr';
  return 'en';
};

const SYSTEM_PROMPT = `You are AyurBot, an expert Ayurvedic dietitian assistant integrated into AyurNutriCare platform.
You have deep knowledge of:
- Ayurvedic dietary principles (Prakriti, Doshas, Rasa, Guna, Virya, Vipaka)
- Modern nutritional science (macronutrients, micronutrients, calories)
- Ritu Charya (seasonal dietary guidelines)
- Viruddha Ahara (food incompatibilities)
- Common Indian foods and their Ayurvedic properties

When answering:
1. Always relate advice to the user's Dosha if available in context
2. Suggest practical Indian food options
3. Mention both Ayurvedic reasoning AND modern nutritional value
4. Keep responses clear, warm, and encouraging
5. If asked about medical conditions, advise consulting a qualified Vaidya (Ayurvedic doctor)

Patient context will be provided at the start of each conversation.`;

// Rule-based fallback response engine for demo/testing without API key
const getFallbackResponse = (message, dosha = 'Vata-Pitta', language = 'en') => {
  const lowercaseMsg = message.toLowerCase();
  
  // 1. Marathi Fallback Response Engine
  if (language === 'mr') {
    if (lowercaseMsg.includes('breakfast') || lowercaseMsg.includes('नाश्ता') || lowercaseMsg.includes('न्याहारी')) {
      if (dosha.includes('Vata') || dosha.includes('वात')) {
        return `तुमच्या **वात** प्रकृतीसाठी, उत्तम उष्ण आणि पचनास हलका नाश्ता म्हणजे **तुपातील रव्याचा उपमा** किंवा **दूध आणि दालचिनी घालून शिजवलेले ओट्स**.
*   **आयुर्वेदिक दृष्टीकोन**: वात दोषाचा थंड आणि कोरडा गुणधर्म कमी करण्यासाठी गरम, मऊ आणि स्निग्ध पदार्थांची आवश्यकता असते. तुपात बनवलेला उपमा वात त्वरित संतुलित करतो.
*   **आधुनिक पोषण**: हे शाश्वत ऊर्जेसाठी जटिल कर्बोदके (कॉम्प्लेक्स कार्ब्स) आणि पेशींच्या मजबुतीसाठी तुपातील निरोगी चरबी प्रदान करते. सकाळी थंड तृणधान्ये (सिरीअल्स) किंवा कच्चे रस टाळा.`;
      } else if (dosha.includes('Pitta') || dosha.includes('पित्त')) {
        return `तुमच्या **पित्त** प्रकृतीसाठी, थंड आणि समाधानकारक नाश्ता म्हणजे **गोड ओट्स (बदाम घालून)** किंवा सौम्य मसाल्यांसह (कोथिंबीर आणि जिरे, मोहरी न वापरता) बनवलेला **तांदळाचा पोहा**.
*   **आयुर्वेदिक दृष्टीकोन**: शरीरातील अंतर्गत उष्णता संतुलित करण्यासाठी पित्त प्रकृतीला गोड, थंड आणि सौम्य अन्नाची आवश्यकता असते. गोड डाळिंब किंवा सफरचंद यांसारखी गोड फळे उत्तम आहेत.
*   **आधुनिक पोषण**: फायबर आणि आवश्यक खनिजांनी समृद्ध, जे आम्लपित्त (अॅसिडिटी) रोखण्यास आणि रक्तातील साखरेची पातळी स्थिर ठेवण्यास मदत करते. सकाळी तिखट मिरची, आले आणि लसूण टाळा.`;
      } else {
        return `तुमच्या **कफ** प्रकृतीसाठी, हलका, गरम आणि पाचक नाश्ता म्हणजे **अंकुरित मूग कोशिंबीर** (किंचित गरम केलेली) किंवा **नाचणीची लापशी** (रागी माल्ट) अत्यंत आदर्श आहे.
*   **आयुर्वेदिक दृष्टीकोन**: कफ हा जड, थंड आणि ओलसर असतो. पचन सुधारणारे मसाले (काळी मिरी, आले) असलेले हलके, कोरडे आणि गरम अन्न कफ साठून राहण्यास प्रतिबंध करते.
*   **आधुनिक पोषण**: प्रथिने आणि फायबरने समृद्ध, जे वजन वाढू न देता पचनक्रिया सक्रिय ठेवण्यास मदत करते.`;
      }
    }

    if (lowercaseMsg.includes('avoid') || lowercaseMsg.includes('incompatible') || lowercaseMsg.includes('viruddha') || lowercaseMsg.includes('टाळा') || lowercaseMsg.includes('विरुद्ध')) {
      return `आयुर्वेदात, परस्परविरोधी अन्न प्रकार एकत्र खाणे (**विरुद्ध आहार**) पचनक्रियेस (जठराग्नी) अत्यंत घातक मानले जाते आणि यामुळे शरीरात विषारी घटक (**आम**) तयार होतात. काही मुख्य विसंगत जोड्या खालीलप्रमाणे आहेत:
1.  **दूध आणि मासे**: दोन्हीचे वीर्य परस्परविरोधी आहे (दूध थंड आहे, मासे गरम आहेत), जे शरीरातील रक्तवाहिन्यांमध्ये अडथळा आणू शकतात आणि त्वचेचे आजार निर्माण करू शकतात.
2.  **दूध आणि आंबट फळे**: यामुळे दूध खराब होते आणि पोटात विषारी अन्न तयार होते.
3.  **केळी आणि दूध**: कफ वाढवतो, पचन मंद करतो आणि सर्दी-खोकला निर्माण करू शकतो.
4.  **मध आणि तूप समप्रमाणात**: हे शरीरातील पेशींमध्ये विषारी संचय निर्माण करते.
*   नेहमी ताजे आणि गरम शिजवलेले अन्न खा आणि या विसंगत जोड्यांमध्ये किमान २-३ तासांचे अंतर ठेवा!`;
    }

    if (lowercaseMsg.includes('pitta') || lowercaseMsg.includes('पित्त')) {
      return `**पित्त दोष** हा मुख्यत्वे अग्नी आणि जल तत्त्वाशी संबंधित असून तो शरीरातील चयापचय आणि पचन नियंत्रित करतो.
*   **कोणते अन्न खावे**: गोड, कडू आणि तुरट चवीचे पदार्थ. थंड अन्न जसे की काकडी, नारळ, तूप, गोड डाळिंब, हिरव्या पालेभाज्या आणि दूध.
*   **काय टाळावे**: आंबट, खारट आणि तिखट चवीचे पदार्थ. तिखट मिरची, लोणचे, आंबवलेले पदार्थ, व्हिनेगर, टोमॅटो आणि चहा-कॉफीचे अतिसेवन टाळा.
*   **आधुनिक पोषण टीप**: थंड आणि अल्कधर्मी (alkaline) अन्न शरीरातील जळजळ आणि पित्ताचे प्रमाण कमी करण्यास मदत करते.`;
    }

    if (lowercaseMsg.includes('vata') || lowercaseMsg.includes('वात')) {
      return `**वात दोष** हा वायू आणि आकाश तत्त्वाशी संबंधित असून तो शरीरातील हालचाली आणि मज्जासंस्थेचे कार्य नियंत्रित करतो.
*   **कोणते अन्न खावे**: गोड, आंबट आणि खारट चवीचे पदार्थ. गरम, शिजवलेले, मऊ आणि स्निग्ध अन्न. योग्य पर्याय म्हणजे शिजवलेला भात, कोमट दूध, तूप, गोड बेरी, सफरचंद, तीळ तेल आणि आले किंवा जिरे यांसारखे पाचक मसाले.
*   **काय टाळावे**: कडू, तिखट आणि तुरट चव. कच्चे सॅलड्स, थंड पेये, सुका मेवा, गॅस निर्माण करणारे पदार्थ (उदा. कोबी, फ्लॉवर) आणि कोरडे पदार्थ टाळा.
*   **आधुनिक पोषण टीप**: निरोगी स्निग्धता (ओमेगा-३ फॅटी अॅसिड) आणि गरम शिजवलेली प्रथिने सांध्यांचा कोरडेपणा दूर करण्यास मदत करतात.`;
    }

    if (lowercaseMsg.includes('kapha') || lowercaseMsg.includes('कफ')) {
      return `**कफ दोष** हा पृथ्वी आणि जल तत्त्वाशी संबंधित असून तो शरीराची रचना, स्निग्धता आणि प्रतिकारशक्ती नियंत्रित करतो.
*   **कोणते अन्न खावे**: तिखट, कडू आणि तुरट चवीचे पदार्थ. हलके, कोरडे आणि गरम अन्न. मूग डाळ, बाजरी, मध, आल्याचा चहा, काळी मिरी आणि कडू पालेभाज्या योग्य आहेत.
*   **काय टाळावे**: गोड, आंबट आणि खारट चव. जड स्निग्ध पदार्थ, थंड पेये किंवा आईस्क्रीम, दही, गहू आणि मिठाचे जास्त सेवन टाळा, ज्यामुळे शरीरात पाणी साठून राहू शकते.
*   **आधुनिक पोषण टीप**: जास्त प्रथिने आणि फायबरयुक्त आहार मंद चयापचय क्रिया वाढवण्यास मदत करतो.`;
    }

    if (lowercaseMsg.includes('medical') || lowercaseMsg.includes('doctor') || lowercaseMsg.includes('disease') || lowercaseMsg.includes('fever') || lowercaseMsg.includes('pain') || lowercaseMsg.includes('डॉक्टर') || lowercaseMsg.includes('औषध') || lowercaseMsg.includes('ताप') || lowercaseMsg.includes('दुखणे')) {
      return `मला समजते की तुम्ही आरोग्याशी संबंधित विशिष्ट समस्येबद्दल विचारत आहात. आयुर्वेद प्रतिबंधात्मक उपाय सुचवत असला तरी, प्रत्यक्ष आजारासाठी प्रत्यक्ष वैद्यकीय सल्ला किंवा पात्र **वैद्य (आयुर्वेदिक डॉक्टर)** यांचा सल्ला घेणे आवश्यक आहे. स्वतःहून औषधोपचार करणे टाळा.`;
    }

    return `नमस्ते! मी **आयुर्बॉट** आहे, तुमचा वैयक्तिक आयुर्वेदिक आहार सहाय्यक.
तुमची प्रमुख प्रकृती **${dosha === 'Undetermined' ? 'अनिर्धारित' : dosha}** असल्याने, तुमच्या शरीरात संतुलन राखणारे अन्न खाण्यावर भर द्या.
*   काय खावे याबद्दल जाणून घेण्यासाठी मला **"न्याहारी किंवा नाश्त्याचे पर्याय"** विचारा.
*   नुकसानकारक अन्न जोड्यांबद्दल जाणून घेण्यासाठी मला **"विरुद्ध आहार"** विचारा.
*   तुमच्याकडे असणारे अन्न घटक मला सांगा, मी त्यांचे आयुर्वेदिक गुणधर्म (*रस*, *वीर्य*, *विपाक*) आणि पोषक घटक तपासेन!`;
  }

  // 2. Hindi Fallback Response Engine
  if (language === 'hi') {
    if (lowercaseMsg.includes('breakfast') || lowercaseMsg.includes('नाश्ता') || lowercaseMsg.includes('अल्पाहार')) {
      if (dosha.includes('Vata') || dosha.includes('वात')) {
        return `आपके **वात** संविधान (Prakriti) के लिए, एक आदर्श गर्म और पौष्टिक नाश्ता **घी में बना सूजी (रवा) का उपमा** या **दूध और दालचीनी के साथ पकाया हुआ ओट्स** है।
*   **आयुर्वेदिक दृष्टिकोण**: वात दोष के ठंडे और सूखे गुणों को संतुलित करने के लिए गर्म, नम और स्निग्ध (चिकने) खाद्य पदार्थों की आवश्यकता होती है। घी में बना उपमा वात को तुरंत शांत करता है।
*   **आधुनिक पोषण**: यह ऊर्जा के लिए जटिल कार्बोहाइड्रेट (complex carbs) और कोशिकाओं के स्वास्थ्य के लिए घी से स्वस्थ वसा प्रदान करता है। सुबह ठंडे अनाज या कच्चे रस से बचें।`;
      } else if (dosha.includes('Pitta') || dosha.includes('पित्त')) {
        return `आपके **पित्त** संविधान के लिए, एक ठंडा और तृप्तिदायक नाश्ता **मीठा ओट्स (बादाम के साथ)** या हल्के मसालों (धनिया और जीरा, राई के बिना) से बना **चावल का पोहा** है।
*   **आयुर्वेदिक दृष्टिकोण**: शरीर की आंतरिक गर्मी को संतुलित करने के लिए पित्त को मीठे, ठंडे और शांत करने वाले खाद्य पदार्थों की आवश्यकता होती है। मीठे अनार या सेब जैसे फल बहुत अच्छे हैं।
*   **आधुनिक पोषण**: फाइबर और आवश्यक खनिजों से भरपूर, जो एसिडिटी को रोकने और रक्त शर्करा के स्तर को स्थिर रखने में मदद करता है। सुबह मिर्च, अदरक और लहसुन से बचें।`;
      } else {
        return `आपके **कफ** संविधान के लिए, एक हल्का, गर्म और सुपाच्य नाश्ता जैसे **अंकुरित मूंग का सलाद** (हल्का गर्म किया हुआ) या **रागी माल्ट** (उंगली बाजरे का दलिया) आदर्श है।
*   **आयुर्वेदिक दृष्टिकोण**: कफ भारी, ठंडा और गीला होता है। पाचन बढ़ाने वाले मसालों (काली मिर्च, अदरक) के साथ हल्के, सूखे और गर्म भोजन कफ के संचय को रोकते हैं।
*   **आधुनिक पोषण**: उच्च प्रोटीन और फाइबर से युक्त, जो वजन बढ़ाए बिना पाचन को सक्रिय रखता है।`;
      }
    }

    if (lowercaseMsg.includes('avoid') || lowercaseMsg.includes('incompatible') || lowercaseMsg.includes('viruddha') || lowercaseMsg.includes('परहेज') || lowercaseMsg.includes('विरुद्ध')) {
      return `आयुर्वेद में, परस्पर विरोधी खाद्य संयोजनों (**विरुद्ध आहार**) को पाचन अग्नि (*अग्नि*) के लिए अत्यंत हानिकारक माना जाता है और यह शरीर में विषैले तत्व (**आम**) पैदा करता है। कुछ मुख्य विसंगत जोड़े इस प्रकार हैं:
1.  **दूध और मछली**: दोनों की तासीर (वीर्य) विपरीत है (दूध ठंडा है, मछली गर्म है), जो शरीर के स्रोतों को अवरुद्ध कर त्वचा रोग पैदा कर सकती है।
2.  **दूध और खट्टे फल**: यह दूध को फाड़ देता है और पेट में विषाक्त पदार्थ बनाता है।
3.  **केला और दूध**: कफ बढ़ाता है, पाचन को धीमा करता है और जुकाम-खांसी पैदा कर सकता है।
4.  **शहद और घी बराबर मात्रा में**: यह एक रासायनिक असंगति है जो शरीर के ऊतकों में विषाक्त संचय पैदा करती है।
*   हमेशा ताजा और गर्म पका हुआ भोजन खाएं और इन खाद्य पदार्थों के सेवन में कम से कम २-३ घंटे का अंतर रखें!`;
    }

    if (lowercaseMsg.includes('pitta') || lowercaseMsg.includes('पित्त')) {
      return `**पित्त दोष** मुख्य रूप से अग्नि और जल तत्वों से संबंधित है, जो शरीर के चयापचय (metabolism) और पाचन को नियंत्रित करता है।
*   **उपयुक्त खाद्य पदार्थ**: मीठे, कड़वे और कसैले स्वाद के पदार्थ। ठंडी चीजें जैसे खीरा, नारियल, घी, मीठा अनार, हरी पत्तेदार सब्जियां और दूध।
*   **वर्जित खाद्य पदार्थ**: खट्टे, नमकीन और तीखे स्वाद। तीखी मिर्च, अचार, खमीर वाले (fermented) भोजन, सिरका, टमाटर और अत्यधिक कैफीन से बचें।
*   **आधुनिक पोषण**: ठंडे क्षारीय (alkaline) खाद्य पदार्थ सूजन और शरीर में अत्यधिक पित्त के उत्पादन को रोकते हैं।`;
    }

    if (lowercaseMsg.includes('vata') || lowercaseMsg.includes('वात')) {
      return `**वात दोष** वायु और आकाश तत्वों से संबंधित है, जो शरीर की गतिशीलता और तंत्रिका तंत्र के कार्यों को नियंत्रित करता है।
*   **उपयुक्त खाद्य पदार्थ**: मीठे, खट्टे और नमकीन स्वाद के पदार्थ। गर्म, पका हुआ, नम और स्निग्ध भोजन। सबसे अच्छे विकल्प पके हुए चावल, गर्म दूध, घी, मीठे जामुन, उबले हुए सेब, तिल का तेल और अदरक या जीरा जैसे पाचक मसाले हैं।
*   **वर्जित खाद्य पदार्थ**: कड़वे, तीखे और कसैले स्वाद। कच्चे सलाद, ठंडे पेय, सूखे मेवे, गैस बनाने वाली सब्जियां (जैसे गोभी, ब्रोकली) और सूखे खाद्य पदार्थों से बचें।
*   **आधुनिक पोषण**: स्वस्थ वसा (ओमेगा -3) और गर्म पका हुआ प्रोटीन वात के जोड़ों के सूखेपन को दूर करता है।`;
    }

    if (lowercaseMsg.includes('kapha') || lowercaseMsg.includes('कफ')) {
      return `**कफ दोष** पृथ्वी और जल तत्वों से संबंधित है, जो शरीर की संरचना, स्निग्धता (lubrication) और रोग प्रतिरोधक क्षमता को नियंत्रित करता.
*   **उपयुक्त खाद्य पदार्थ**: तीखे, कड़वे और कसैले स्वाद। हल्के, सूखे और गर्म भोजन। मूंग दाल, बाजरा, शहद, अदरक की चाय, काली मिर्च और कड़वी पत्तेदार सब्जियां बहुत अच्छी हैं।
*   **वर्जित खाद्य पदार्थ**: मीठे, खट्टे और नमकीन स्वाद। भारी वसा, ठंडे डेसर्ट, दही, गेहूं और बहुत अधिक नमक से बचें, जिससे शरीर में पानी जमा हो सकता है।
*   **आधुनिक पोषण**: उच्च प्रोटीन और फाइबर से युक्त भोजन कफ की धीमी चयापचय दर को गति देता है।`;
    }

    if (lowercaseMsg.includes('medical') || lowercaseMsg.includes('doctor') || lowercaseMsg.includes('disease') || lowercaseMsg.includes('fever') || lowercaseMsg.includes('pain') || lowercaseMsg.includes('डॉक्टर') || lowercaseMsg.includes('बीमारी') || lowercaseMsg.includes('दवाई') || lowercaseMsg.includes('दर्द')) {
      return `मुझे समझ में आ रहा है कि आप स्वास्थ्य से संबंधित किसी विशेष समस्या के बारे में पूछ रहे हैं। हालांकि आयुर्वेद अद्भुत निवारक मार्गदर्शन प्रदान करता है, लेकिन वास्तविक बीमारी के लिए किसी योग्य **वैद्य (आयुर्वेदिक डॉक्टर)** या चिकित्सक से परामर्श करना अनिवार्य है। खुद से दवाइयां न लें, क्योंकि नाड़ी परीक्षण के अनुसार ही सही उपचार संभव है।`;
    }

    return `नमस्ते! मैं **आयुर्बॉट** हूँ, आपका व्यक्तिगत आयुर्वेदिक आहार सहायक।
चूंकि आपका मुख्य संविधान **${dosha === 'Undetermined' ? 'अनिर्धारित' : dosha}** है, इसलिए अपने शरीर को संतुलित करने वाले खाद्य पदार्थों पर ध्यान दें।
*   नाश्ते के बारे में जानने के लिए मुझसे **"नाश्ते के विकल्प"** पूछें।
*   हानिकारक खाद्य संयोजनों के बारे में जानने के लिए **"विरुद्ध आहार"** पूछें।
*   अपने पास उपलब्ध खाद्य सामग्री मुझे बताएं, मैं उनके आयुर्वेदिक गुण (*रस*, *वीर्य*, *विपाक*) और पोषक तत्व जांच कर बताऊंगा!`;
  }

  // 3. Default English Fallback Response
  if (lowercaseMsg.includes('breakfast')) {
    if (dosha.includes('Vata')) {
      return `For your **Vata** constitution, a perfect warm, grounding breakfast is **Sooji (Rava) Upma** or **Oatmeal** cooked with milk and a pinch of cinnamon.
*   **Ayurvedic view**: Vata needs warm, moist, oily foods to offset its cold and dry qualities (Gunas). Upma cooked in ghee balances Vata instantly.
*   **Modern Nutrition**: Provides complex carbohydrates for sustained energy and healthy fats from ghee to support cell structures. Avoid cold cereals or raw juices.`;
    } else if (dosha.includes('Pitta')) {
      return `For your **Pitta** constitution, a cooling and satisfying breakfast option is **Sweet Oatmeal with almonds** or **Rice Poha** tempered with mild spices (coriander and cumin, no mustard seeds).
*   **Ayurvedic view**: Pitta needs sweet, cooling, and calming foods to balance internal heat. Sweet fruits like sweet pomegranate or apple are excellent.
*   **Modern Nutrition**: Rich in fiber and essential minerals, helping to prevent acidity and maintain stable blood sugar levels. Avoid chili, ginger, and garlic in the morning.`;
    } else {
      return `For your **Kapha** constitution, a light, warm, and stimulating breakfast like **Sprouted Moong Salad** (warmed slightly) or **Ragi Malt** (finger millet porridge) is ideal.
*   **Ayurvedic view**: Kapha is heavy, cool, and damp. Light, dry, and warming foods with digestive spices (black pepper, ginger) prevent Kapha accumulation.
*   **Modern Nutrition**: High in protein and dietary fiber, keeping your digestion active and helping with weight management without adding heavy calories.`;
    }
  }

  if (lowercaseMsg.includes('avoid') || lowercaseMsg.includes('incompatible') || lowercaseMsg.includes('viruddha')) {
    return `In Ayurveda, incompatible food combinations (**Viruddha Ahara**) are highly disruptive to digestive fire (*Agni*). Common ones include:
1.  **Milk and Fish**: Opposite potencies (milk is cooling, fish is warming) that block channels and can cause skin issues.
2.  **Milk and Sour Fruits**: Causes milk to curdle, creating toxic residue (*Ama*).
3.  **Banana and Milk**: Aggravates Kapha, slows down digestion, and produces cold/congestion.
4.  **Equal portions of Ghee and Honey**: A known chemical incompatibility that creates toxic accumulation in body tissues.
*   Always eat fresh, freshly-cooked meals and keep these combinations apart by at least 2-3 hours!`;
  }

  if (lowercaseMsg.includes('pitta')) {
    return `**Pitta Dosha** is associated with fire and water, governing metabolism and digestion.
*   **Foods to favor**: Sweet, bitter, and astringent tastes. Cooling foods like cucumber, coconut, ghee, sweet pomegranate, green leafy vegetables, and milk.
*   **Foods to avoid**: Sour, salty, and pungent tastes. Avoid spicy peppers, pickles, fermented foods, vinegar, tomatoes, and excessive caffeine.
*   **Nutrition Note**: Cooling alkaline foods prevent inflammatory conditions and excessive bile production.`;
  }

  if (lowercaseMsg.includes('vata')) {
    return `**Vata Dosha** is associated with air and space, governing movement and nervous system functions.
*   **Foods to favor**: Sweet, sour, and salty tastes. Warm, cooked, moist, and oily foods. Excellent choices are cooked rice, warm milk, ghee, sweet berries, stewed apples, sesame oil, and warming spices like ginger and cumin.
*   **Foods to avoid**: Bitter, pungent, and astringent tastes. Avoid raw salads, cold drinks, dried fruits, gas-producing foods like cabbage/broccoli, and dry crackers.
*   **Nutrition Note**: Healthy fats (omega-3s, MCTs) and warm cooked proteins soothe Vata's tendency towards dry joints and erratic digestion.`;
  }

  if (lowercaseMsg.includes('kapha')) {
    return `**Kapha Dosha** is associated with earth and water, governing structural stability, lubrication, and immunity.
*   **Foods to favor**: Pungent, bitter, and astringent tastes. Light, dry, and warm foods. Good choices include legumes (moong dal), millet, honey, ginger tea, black pepper, and bitter greens.
*   **Foods to avoid**: Sweet, sour, and salty tastes. Avoid heavy fats, cold desserts, yogurt, wheat, and excessive salt, which cause fluid retention.
*   **Nutrition Note**: High-protein, high-fiber, low-glycemic foods boost Kapha's naturally slow metabolic rate.`;
  }

  if (lowercaseMsg.includes('medical') || lowercaseMsg.includes('doctor') || lowercaseMsg.includes('disease') || lowercaseMsg.includes('fever') || lowercaseMsg.includes('pain')) {
    return `I understand you are asking about a specific health concern. While Ayurveda provides wonderful preventive guidance, for actual medical conditions, it is crucial to consult a qualified **Vaidya (Ayurvedic doctor)** or medical practitioner. Please do not self-treat serious symptoms, as an in-person pulse diagnosis (*Nadi Pariksha*) is necessary to tailor treatments correctly.`;
  }

  // General default response
  return `Namaste! I am **AyurBot**, your personal Ayurvedic dietitian. 
Since your dominant constitution is **${dosha}**, I suggest focusing on foods that bring balance to your body.
*   If you're wondering what to eat, ask me about **"breakfast recommendations"**.
*   If you'd like to learn about harmful mixtures, ask about **"foods to avoid"**.
*   Feel free to tell me what ingredients you have, and I will check their qualities (*Rasa*, *Virya*, *Vipaka*) and modern macronutrient contents!`;
};

const generateChatResponse = async (message, patientDosha, conversationHistory, language = 'en') => {
  const doshaText = patientDosha || 'Undetermined';
  const cleanLang = normalizeLanguage(language);
  
  if (!groqClient) {
    // If no client, return fallback response after a tiny delay to simulate network latency
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve(getFallbackResponse(message, doshaText, cleanLang));
      }, 500);
    });
  }

  try {
    const contextPrompt = `Patient Context:\n- Dominant Dosha: ${doshaText}\n\n`;
    const langName = cleanLang === 'mr' ? 'Marathi' : cleanLang === 'hi' ? 'Hindi' : 'English';
    const systemPromptWithLanguage = SYSTEM_PROMPT + `\n\nCRITICAL: The user's active language is ${langName}. You MUST reply entirely in ${langName}. If Hindi or Marathi is selected, write your response using the proper Devanagari script. Do not write Devanagari words in Latin/English alphabet. Respond naturally and professionally.`;

    // Construct messages array for Groq API
    const messages = [];
    
    // Add system prompt first
    messages.push({
      role: 'system',
      content: systemPromptWithLanguage
    });

    // Map conversation history
    conversationHistory.forEach(msg => {
      messages.push({
        role: msg.role === 'assistant' ? 'assistant' : 'user',
        content: msg.content
      });
    });

    // Add current user message
    messages.push({
      role: 'user',
      content: `${contextPrompt}User prompt: ${message}`
    });

    const response = await groqClient.chat.completions.create({
      model: 'llama-3.3-70b-versatile',
      max_tokens: 1024,
      messages: messages
    });

    return response.choices[0].message.content;
  } catch (error) {
    console.error('Groq API call error:', error.message);
    // Graceful fallback on API errors
    return `[API Service Notice: Groq API error. Falling back to local AyurBot calculations]\n\n` + getFallbackResponse(message, doshaText, cleanLang);
  }
};

const translateText = async (text, targetLang) => {
  if (!text || typeof text !== 'string' || !text.trim()) {
    return text;
  }
  
  const cleanLang = normalizeLanguage(targetLang);
  const targetLangName = cleanLang === 'mr' ? 'Marathi' : cleanLang === 'hi' ? 'Hindi' : 'English';
  if (targetLangName === 'English') {
    return text;
  }

  if (!groqClient) {
    console.log(`[AI Translation Fallback]: No Groq client. Returning English text for ${targetLangName}`);
    return text;
  }

  try {
    const systemInstruction = `You are a professional Ayurvedic and nutrition translator. Translate the input text from English to ${targetLangName} using proper Devanagari script.
Requirements:
1. Use proper Devanagari script (e.g., for Hindi: "घी में पकाया गया गर्म गेहूं का दलिया जिसमें दालचीनी और कटे हुए बादाम हैं।", for Marathi: "तुपात शिजवलेली गरम गव्हाची लापशी, दालचिनी आणि कापलेल्या बदामांसह.")
2. Ensure the translation is natural, fluent, and highly human-readable.
3. Preserve Ayurvedic terminology (e.g., Ghee, Dosha, Kapha, Vata, Pitta, Agni, Ama, Khichdi, etc.) appropriately.
4. Do NOT translate words like "Ghee" to a completely unrelated term if it's best represented or transliterated/translated in Devanagari (like घी/तूप).
5. Never return English text or English letters. Everything must be in proper Devanagari script.
6. Respond ONLY with the direct translation. Do not include quotes, pleasantries, explanations, or any extra text.`;

    const response = await groqClient.chat.completions.create({
      model: 'llama-3.3-70b-versatile',
      max_tokens: 300,
      messages: [
        {
          role: 'system',
          content: systemInstruction
        },
        {
          role: 'user',
          content: text
        }
      ]
    });

    const translatedText = response.choices[0].message.content.trim();
    return translatedText || text;
  } catch (error) {
    console.error(`[AI Translation Error] for ${targetLangName}:`, error.message);
    return text; // Safe fallback
  }
};

module.exports = { generateChatResponse, translateText };
