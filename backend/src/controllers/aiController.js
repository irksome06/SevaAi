const MAX_ATTACHMENTS = 4;
const MAX_FILE_SIZE = 5 * 1024 * 1024;
const MAX_HISTORY_MESSAGES = 6;
const MAX_HISTORY_CHARS = 1600;
const MAX_DOCUMENT_CHARS = 8000;
const DEFAULT_REQUEST_TIMEOUT_MS = 30000;
const DEFAULT_MAX_RESPONSE_TOKENS = 600;

const ALLOWED_MIME_TYPES = new Set([
  'application/pdf',
  'text/plain',
  'text/csv',
  'application/json',
  'image/jpeg',
  'image/png',
  'image/webp',
]);

const LANGUAGE_NAMES = {
  en: 'English', hi: 'Hindi', bn: 'Bengali', mr: 'Marathi', te: 'Telugu',
  ta: 'Tamil', gu: 'Gujarati', kn: 'Kannada', ml: 'Malayalam', pa: 'Punjabi',
  ur: 'Urdu', or: 'Odia', as: 'Assamese',
};

/**
 * Built-in Indian Civic & Government Services Knowledge Engine
 * Provides immediate, accurate, and structured answers when no external LLM is configured or when local Ollama is offline.
 */
const getCivicKnowledgeResponse = (userText, language = 'en', attachments = []) => {
  const query = userText.toLowerCase();
  const isHindi = language === 'hi' || /[\u0900-\u097F]/.test(userText) || /\b(namaste|kaise|kare|yojana|shikayat|paisa|kisan|pradhan|mantri|sarkari)\b/i.test(userText);

  // If user attached files and asks about them
  if (attachments && attachments.length > 0) {
    const fileNames = attachments.map(f => f.name).join(', ');
    if (isHindi) {
      return `📋 **दस्तावेज़ समीक्षा मार्गदर्शन:**
मैंने आपका संलग्न दस्तावेज़ (${fileNames}) देखा है।

**नागरिक सेवाओं के लिए मुख्य सत्यापन चरण:**
1. **पहचान और पता प्रमाण:** सुनिश्चित करें कि नाम, जन्मतिथि और पता आधार कार्ड और सरकारी रिकॉर्ड के अनुसार समान हैं।
2. **स्पष्टता:** तस्वीर/स्कैन स्पष्ट होना चाहिए ताकि आवेदन सत्यापन में कोई रुकावट न आए।
3. **अगला कदम:** यदि यह किसी योजना (जैसे PM-KISAN, आयुष्मान, PMAY) या शिकायत के लिए है, तो अपने डैशबोर्ड में **'दस्तावेज़ वॉल्ट'** या संबंधित सेवा टैब पर जाकर सुरक्षित अपलोड पूरा करें।`;
    }
    return `📋 **Document Review & Verification Guidance:**
I have noted your uploaded file(s): **${fileNames}**.

**Next Steps for Government & Civic Applications:**
1. **Name & Detail Consistency:** Ensure the name, date of birth, and address exactly match your Aadhaar/government records.
2. **Legibility:** Check that all seals, signatures, and application numbers are clearly readable.
3. **Action:** To submit this for a scheme or civic grievance, navigate to **Document Vault** or the specific service module on your dashboard.`;
  }

  // 1. PM-KISAN
  if (query.includes('pm kisan') || query.includes('pm-kisan') || query.includes('kisan samman') || query.includes('farmer') || query.includes('किसान')) {
    if (isHindi) {
      return `🌾 **प्रधानमंत्री किसान सम्मान निधि (PM-KISAN)**

**योजना का विवरण:**
पात्र किसान परिवारों को प्रति वर्ष ₹6,000 की वित्तीय सहायता 3 समान किस्तों (प्रत्येक ₹2,000) में सीधे बैंक खाते में (DBT) दी जाती है।

**पात्रता:**
* वे सभी किसान परिवार जिनके पास खेती योग्य भूमि का मालिकाना हक है।

**आवश्यक दस्तावेज़:**
1. आधार कार्ड (बैंक खाते से लिंक)
2. खतौनी/जमीन के दस्तावेज (Land Ownership Record)
3. बैंक पासबुक (Aadhaar Seeded & NPCI Active)
4. मोबाइल नंबर

**आवेदन एवं स्थिति जांच:**
* आधिकारिक पोर्टल: **pmkisan.gov.in**
* ई-केवाईसी (e-KYC) अनिवार्य है (ओटीपी या बायोमेट्रिक द्वारा)।
* हेल्पलाइन नंबर: **155261** / **011-24300606**`;
    }
    return `🌾 **PM-KISAN Samman Nidhi Yojana**

**Benefit:**
Eligible farmer families receive **₹6,000 per year** in 3 equal installments of ₹2,000 directly into their bank accounts via DBT.

**Eligibility:**
* Small, marginal, and landholding farmer families with valid land cultivation records.

**Required Documents:**
1. Aadhaar Card (linked with bank account & active NPCI mapping)
2. Land ownership papers (Khatauni/Khasra records)
3. Bank passbook details
4. Active mobile number

**How to Apply / Check Status:**
* Official Portal: **pmkisan.gov.in**
* Mandatory: Complete **e-KYC** using Aadhaar OTP or CSC biometric authentication.
* Toll-Free Helpline: **155261** / **1800-115-526**`;
  }

  // 2. Ayushman Bharat / PM-JAY / Health Insurance
  if (query.includes('ayushman') || query.includes('pmjay') || query.includes('pm-jay') || query.includes('health card') || query.includes('golden card') || query.includes('इलाज') || query.includes('आयुष्मान')) {
    if (isHindi) {
      return `🏥 **आयुष्मान भारत - प्रधानमंत्री जन आरोग्य योजना (AB-PMJAY)**

**लाभ:**
प्रति पात्र परिवार को प्रति वर्ष **₹5 लाख तक का निःशुल्क कैशलेस स्वास्थ्य बीमा** देश भर के सूचीबद्ध सरकारी एवं निजी अस्पतालों में मिलता है।

**पात्रता:**
* SECC 2011 सूची में शामिल गरीब और वंचित परिवार।
* 70 वर्ष या उससे अधिक उम्र के सभी वरिष्ठ नागरिक (आयुष्मान वय वंदना कार्ड)।

**आवश्यक दस्तावेज़:**
1. आधार कार्ड
2. राशन कार्ड / परिवार समग्र आईडी
3. सक्रिय मोबाइल नंबर

**कार्ड कैसे बनवाएं:**
* नजदीकी सीएससी (CSC) सेंटर या सरकारी अस्पताल में आयुष्मान मित्र से संपर्क करें।
* आधिकारिक पोर्टल: **beneficiary.nha.gov.in**
* टोल फ्री नंबर: **14555** / **1800-111-565**`;
    }
    return `🏥 **Ayushman Bharat - PM Jan Arogya Yojana (PM-JAY)**

**Benefit:**
Provides **₹5 Lakh free health cover per family per year** for secondary and tertiary care hospitalization across all empaneled public and private hospitals nationwide.

**Eligibility:**
* Low-income families listed in the SECC 2011 database or state NFSA beneficiary lists.
* All senior citizens aged 70+ (under the newly expanded Ayushman Vay Vandana scheme).

**Required Documents:**
1. Aadhaar Card
2. Ration Card / Family ID
3. Mobile Number

**How to Get Your Golden Card:**
* Check eligibility & apply online at **beneficiary.nha.gov.in** or visit any local CSC / Empaneled Hospital helpdesk.
* Toll-Free National Helpline: **14555** / **1800-111-565**`;
  }

  // 3. PM Awas Yojana (PMAY)
  if (query.includes('awas') || query.includes('pmay') || query.includes('house') || query.includes('housing') || query.includes('आवास') || query.includes('घर')) {
    if (isHindi) {
      return `🏠 **प्रधानमंत्री आवास योजना (PMAY - ग्रामीण / शहरी)**

**लाभ:**
पक्का मकान बनाने या खरीदने के लिए सरकार द्वारा वित्तीय सहायता एवं होम लोन पर ब्याज सब्सिडी प्रदान की जाती है।

**आवश्यक दस्तावेज़:**
1. आधार कार्ड (परिवार के सभी सदस्यों का)
2. आय प्रमाण पत्र (Income Certificate)
3. बैंक खाता विवरण एवं IFSC
4. वर्तमान निवास का प्रमाण एवं फोटो
5. जमीन/प्लॉट के कागजात (ग्रामीण क्षेत्र हेतु)

**आवेदन का तरीका:**
* शहरी: **pmaymis.gov.in** या नगर निगम/नगर पालिका कार्यालय।
* ग्रामीण: ग्राम पंचायत सचिव / ब्लॉक विकास अधिकारी (BDO) से संपर्क करें।
* हेल्पलाइन: **1800-11-6163** (शहरी) / **1800-11-6446** (ग्रामीण)`;
    }
    return `🏠 **Pradhan Mantri Awas Yojana (PMAY - Urban / Gramin)**

**Benefit:**
Financial assistance and interest subsidies on home loans to help eligible families build or acquire a permanent (pucca) house.

**Required Documents:**
1. Aadhaar Card of all family members
2. Income Certificate / Proof of Income
3. Bank Account Passbook with IFSC
4. Proof of current residence & land ownership records (for rural housing)

**How to Apply:**
* **PMAY-Urban:** Apply online at **pmaymis.gov.in** or through the local Municipal Office / CSC.
* **PMAY-Gramin:** Contact your Gram Panchayat Secretary or Block Development Office (BDO).
* Toll-Free Helpline: **1800-11-6163** (Urban) / **1800-11-6446** (Rural)`;
  }

  // 4. Civic Grievances (Potholes, Road damage, Streetlight, Garbage, Water leakage)
  if (query.includes('pothole') || query.includes('road') || query.includes('garbage') || query.includes('waste') || query.includes('water') || query.includes('streetlight') || query.includes('street light') || query.includes('drain') || query.includes('सड़क') || query.includes('कचरा') || query.includes('पानी') || query.includes('बिजली')) {
    if (isHindi) {
      return `⚠️ **नागरिक शिकायत निवारण प्रक्रिया (Civic Grievance):**

**शिकायत दर्ज करने के सरल चरण:**
1. **फोटो व लोकेशन:** समस्या स्थल की स्पष्ट तस्वीर लें और सही पता या लैंडमार्क नोट करें।
2. **पोर्टल पर रिपोर्ट करें:** 
   * SevaAI डैशबोर्ड में **'नागरिक समस्या दर्ज करें' (Report Civic Problem)** पर जाएं।
   * केंद्र/राज्य स्तर पर: **pgportal.gov.in (CPGRAMS)** या **Swachhata App** पर दर्ज करें।
3. **संबंधित विभाग:**
   * **सड़क/गड्ढे:** लोक निर्माण विभाग (PWD) या नगर निगम।
   * **कचरा व सफाई:** नगर निगम ठोस अपशिष्ट प्रबंधन विभाग।
   * **स्ट्रीट लाइट/बिजली:** विद्युत वितरण कंपनी (हेल्पलाइन: 1912) या नगर पालिका।
   * **पानी की समस्या:** जल बोर्ड / जन स्वास्थ्य अभियांत्रिकी विभाग (PHED)।
4. **ट्रैकिंग:** शिकायत दर्ज करने के बाद मिलने वाले रेफरेंस/ट्रैकिंग नंबर से **'एप्लीकेशन ट्रैकर'** में स्थिति जांचें।`;
    }
    return `⚠️ **How to Report and Resolve Civic Grievances:**

**Step-by-Step Reporting Guide:**
1. **Document Evidence:** Capture 1–2 clear photographs of the issue (pothole, overflowing garbage, broken streetlight, or pipe leak) with exact landmark location.
2. **Submit via SevaAI:** Open the **'Report Civic Problem'** tab in your dashboard to lodge an instant geo-tagged complaint.
3. **Direct Department Contacts:**
   * **Potholes / Broken Roads:** Municipal Corporation / PWD Department.
   * **Garbage Overflow & Sanitation:** Municipal Solid Waste Department / Swachhata App.
   * **Street Light & Electricity:** State Power Discom (Call **1912**) or Municipal Electrical Cell.
   * **Water Supply / Leaks:** City Jal Board / Water Supply Division.
4. **Escalation & Tracking:** Use your Complaint ID in **Application Tracker** to monitor action taken within 48–72 hours.`;
  }

  // 5. RTI (Right to Information)
  if (query.includes('rti') || query.includes('right to information') || query.includes('सूचना का अधिकार') || query.includes('सूचना')) {
    if (isHindi) {
      return `📜 **सूचना का अधिकार (RTI Act 2005) - पूर्ण मार्गदर्शन:**

**RTI कैसे फाइल करें:**
1. **सार्वजनिक प्राधिकरण चुनें:** संबंधित सरकारी विभाग या मंत्रालय के केंद्रीय/राज्य लोक सूचना अधिकारी (CPIO/SPIO) को संबोधित करें।
2. **स्पष्ट प्रश्न पूछें:** बिंदुवार और स्पष्ट जानकारी मांगें (व्यक्तिगत राय नहीं, आधिकारिक रिकॉर्ड व दस्तावेज़ मांगें)।
3. **शुल्क:** केवल ₹10 (पोस्टल ऑर्डर, डिमांड ड्राफ्ट या ऑनलाइन पेमेंट)। बीपीएल (BPL) कार्डधारकों के लिए निःशुल्क।
4. **समय सीमा:** आवेदन प्राप्त होने के **30 दिनों के भीतर** उत्तर देना अनिवार्य है (जीवन व स्वतंत्रता से जुड़े मामलों में 48 घंटे)।
5. **ऑनलाइन पोर्टल:** **rtionline.gov.in** पर केंद्र सरकार के मंत्रालयों के लिए ऑनलाइन RTI दर्ज करें।
6. **SevaAI टूल:** आप हमारे **'RTI जेनरेटर'** टूल का उपयोग करके तैयार ड्राफ्ट प्राप्त कर सकते हैं।`;
    }
    return `📜 **Right to Information (RTI Act 2005) Guide:**

**How to File an Effective RTI Application:**
1. **Identify the Authority:** Address your application to the Public Information Officer (PIO/CPIO) of the concerned department/ministry.
2. **Draft Clear Questions:** Ask specific, point-wise questions seeking copies of records, work orders, fund utilization, or inspection reports.
3. **Application Fee:** Standard fee is **₹10** (via Online Gateway, IPO, or Court Fee Stamp). Free for BPL cardholders.
4. **Mandatory Timelines:** The PIO must provide the requested information within **30 days** (or 48 hours for life & liberty matters).
5. **First Appeal:** If no reply is received within 30 days or if the reply is incomplete, you can file a First Appeal under Section 19(1).
6. **Portal & Draft Tool:** File online at **rtionline.gov.in** or use our dashboard's **RTI Generator** for an instant pre-filled draft.`;
  }

  // 6. Emergency Contacts & Helplines
  if (query.includes('helpline') || query.includes('emergency') || query.includes('number') || query.includes('police') || query.includes('ambulance') || query.includes('महिला') || query.includes('हेल्पलाइन') || query.includes('आपातकालीन')) {
    if (isHindi) {
      return `🚨 **महत्वपूर्ण राष्ट्रीय आपातकालीन एवं नागरिक हेल्पलाइन नंबर:**

* 🆘 **112** - राष्ट्रीय एकीकृत आपातकालीन नंबर (पुलिस, दमकल, एम्बुलेंस)
* 👮 **100** - पुलिस सहायता
* 🚒 **101** - अग्निशमन सेवा (Fire Brigade)
* 🚑 **108 / 102** - आपातकालीन एम्बुलेंस सेवा
* 👩 **181 / 1091** - महिला हेल्पलाइन (घरेलू हिंसा व सुरक्षा)
* 🧒 **1098** - चाइल्डलाइन (बाल संरक्षण व सहायता)
* 💳 **1930** - राष्ट्रीय साइबर वित्तीय धोखाधड़ी हेल्पलाइन
* ⚡ **1912** - बिजली आपूर्ति व शिकायत हेल्पलाइन
* 👵 **14567** - वरिष्ठ नागरिक हेल्पलाइन (Elder Line)
* 🌾 **1800-180-1551** - किसान कॉल सेंटर`;
    }
    return `🚨 **Important National Emergency & Citizen Helplines:**

* 🆘 **112** - National All-in-One Emergency Helpline (Police, Fire, Ambulance)
* 👮 **100** - Police Control Room
* 🚒 **101** - Fire Emergency Services
* 🚑 **108 / 102** - Emergency Medical Ambulance
* 👩 **181 / 1091** - Women Helpline (Domestic Safety & Distress)
* 🧒 **1098** - Childline India
* 💳 **1930** - National Cyber Crime & Financial Fraud Helpline
* ⚡ **1912** - Electricity Board Outage Complaints
* 👵 **14567** - Senior Citizens National Helpline (Elder Line)
* 🌾 **1800-180-1551** - Kisan Call Centre (Agriculture Support)`;
  }

  // 7. General Welfare / Default response
  if (isHindi) {
    return `🙏 **नमस्ते! मैं SevaAI नागरिक सेवा सहायक हूँ।**

मैं आपकी निम्नलिखित सेवाओं में त्वरित सहायता कर सकता हूँ:
1. 🏛️ **सरकारी योजनाएं:** PM-KISAN, आयुष्मान भारत, PM आवास योजना, सुकन्या समृद्धि आदि की पात्रता व आवेदन।
2. ⚠️ **नागरिक समस्याएं:** सड़क के गड्ढे, कचरा, स्ट्रीट लाइट, सीवेज या पानी की शिकायतों की रिपोर्टिंग।
3. 📜 **सूचना का अधिकार (RTI):** आवेदन का प्रारूप, शुल्क, प्रक्रिया और प्रथम अपील।
4. 📂 **दस्तावेज़ सहायता:** आधार, आय/जाति/निवास प्रमाण पत्र एवं राशन कार्ड के नियम।
5. 🚨 **आपातकालीन नंबर व संपर्क:** तुरंत सहायता हेतु संपर्क सूत्र।

कृपया अपनी समस्या या सवाल विस्तार से बताएं, मैं आपकी पूरी सहायता करूँगा!`;
  }

  return `🙏 **Namaste! I am your SevaAI Citizen Services Assistant.**

I am here to guide you with end-to-end Indian government and civic services:
1. 🏛️ **Welfare Schemes:** Check eligibility and application steps for PM-KISAN, Ayushman Bharat, PMAY, PM SVANidhi, and State Schemes.
2. ⚠️ **Civic Issue Reporting:** How and where to report potholes, overflowing waste, broken streetlights, or water supply leaks.
3. 📜 **RTI Applications:** Filing guidelines, fee structures, timelines, and generating draft applications.
4. 📂 **Document Guidelines:** Required documents for Aadhaar updates, Income/Caste/Domicile certificates, and Ration cards.
5. 🚨 **Helpline Directories:** Instant emergency and departmental contact numbers.

How may I assist you with your civic inquiry today?`;
};

const buildUserMessage = (message, attachments) => {
  const images = [];
  const documentNotes = [];

  attachments.forEach(({ name, type, dataUrl }) => {
    if (!ALLOWED_MIME_TYPES.has(type) || typeof dataUrl !== 'string') return;

    if (type.startsWith('image/')) {
      const base64 = dataUrl.split(',')[1];
      if (base64) images.push({ mimeType: type, data: base64 });
      return;
    }

    if (['text/plain', 'text/csv', 'application/json'].includes(type)) {
      try {
        const content = Buffer.from(dataUrl.split(',')[1] || '', 'base64').toString('utf8').slice(0, MAX_DOCUMENT_CHARS);
        documentNotes.push(`\n\nAttached file: ${name}\n---\n${content}\n---`);
      } catch {
        documentNotes.push(`\n\nAn attached file named "${name}" could not be read.`);
      }
    } else {
      documentNotes.push(`\n\nA PDF named "${name}" is attached.`);
    }
  });

  return {
    text: `${message}${documentNotes.join('')}`,
    images,
  };
};

/**
 * Try Gemini API if key is present
 */
const tryGeminiApi = async (apiKey, systemPrompt, safeHistory, userMessageObj) => {
  const model = process.env.GEMINI_MODEL || 'gemini-1.5-flash';
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;

  const contents = [
    ...safeHistory.map((item) => ({
      role: item.sender === 'assistant' ? 'model' : 'user',
      parts: [{ text: item.text.slice(0, MAX_HISTORY_CHARS) }],
    })),
    {
      role: 'user',
      parts: [
        { text: userMessageObj.text },
        ...userMessageObj.images.map((img) => ({
          inlineData: { mimeType: img.mimeType, data: img.data },
        })),
      ],
    },
  ];

  const response = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      systemInstruction: { parts: [{ text: systemPrompt }] },
      contents,
      generationConfig: {
        temperature: 0.3,
        maxOutputTokens: 600,
      },
    }),
  });

  if (!response.ok) {
    const errorData = await response.text();
    throw new Error(`Gemini API error (${response.status}): ${errorData}`);
  }

  const result = await response.json();
  const text = result?.candidates?.[0]?.content?.parts?.[0]?.text;
  if (!text) throw new Error('No content returned from Gemini.');
  return text;
};

/**
 * Try Groq or OpenAI compatible API
 */
const tryOpenAiCompatibleApi = async (apiKey, baseUrl, model, systemPrompt, safeHistory, userMessageObj) => {
  const messages = [
    { role: 'system', content: systemPrompt },
    ...safeHistory.map((item) => ({
      role: item.sender === 'assistant' ? 'assistant' : 'user',
      content: item.text.slice(0, MAX_HISTORY_CHARS),
    })),
    {
      role: 'user',
      content: userMessageObj.text,
    },
  ];

  const response = await fetch(`${baseUrl.replace(/\/$/, '')}/chat/completions`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: model || 'llama-3.3-70b-versatile',
      messages,
      temperature: 0.3,
      max_tokens: 600,
    }),
  });

  if (!response.ok) {
    const errorData = await response.text();
    throw new Error(`Cloud LLM API error (${response.status}): ${errorData}`);
  }

  const result = await response.json();
  const text = result?.choices?.[0]?.message?.content;
  if (!text) throw new Error('No content returned from Cloud LLM.');
  return text;
};

/**
 * Try Local Ollama Instance
 */
const tryOllamaApi = async (ollamaBaseUrl, ollamaModel, systemPrompt, safeHistory, userMessageObj, timeoutMs) => {
  const messages = [
    { role: 'system', content: systemPrompt },
    ...safeHistory.map((item) => ({
      role: item.sender === 'assistant' ? 'assistant' : 'user',
      content: item.text.slice(0, MAX_HISTORY_CHARS),
    })),
    {
      role: 'user',
      content: userMessageObj.text,
      ...(userMessageObj.images.length ? { images: userMessageObj.images.map(img => img.data) } : {}),
    },
  ];

  const abortController = new AbortController();
  const timeout = setTimeout(() => abortController.abort(), timeoutMs);

  try {
    const response = await fetch(`${ollamaBaseUrl}/api/chat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      signal: abortController.signal,
      body: JSON.stringify({
        model: ollamaModel,
        messages,
        stream: false,
        keep_alive: process.env.OLLAMA_KEEP_ALIVE || '30m',
        options: {
          num_ctx: 2048,
          num_predict: 300,
          temperature: 0.3,
        },
      }),
    });

    if (!response.ok) {
      const errText = await response.text();
      throw new Error(`Ollama error (${response.status}): ${errText}`);
    }

    const result = await response.json();
    return result?.message?.content;
  } finally {
    clearTimeout(timeout);
  }
};

exports.chat = async (req, res, next) => {
  try {
    const { message, language = 'en', history = [], attachments = [] } = req.body;
    if (typeof message !== 'string' || !message.trim()) {
      return res.status(400).json({ success: false, message: 'A message is required.' });
    }

    if (!Array.isArray(attachments) || attachments.length > MAX_ATTACHMENTS) {
      return res.status(400).json({ success: false, message: `You can attach up to ${MAX_ATTACHMENTS} files.` });
    }
    for (const file of attachments) {
      if (!file || !ALLOWED_MIME_TYPES.has(file.type) || typeof file.dataUrl !== 'string' || file.dataUrl.length > MAX_FILE_SIZE * 1.4) {
        return res.status(400).json({ success: false, message: 'Use a PNG, JPG, WEBP, PDF, TXT, CSV, or JSON file up to 5 MB.' });
      }
    }

    const safeHistory = Array.isArray(history)
      ? history
          .filter((item) => item && typeof item.text === 'string' && ['user', 'assistant'].includes(item.sender))
          .slice(-MAX_HISTORY_MESSAGES)
      : [];

    const userMessageObj = buildUserMessage(message.trim(), attachments);
    const systemPrompt = `You are SevaAI, a helpful, highly knowledgeable Indian citizen-services assistant. Reply in ${LANGUAGE_NAMES[language] || 'English'} unless the user requests another language. Analyse attached images or documents when provided. Give practical, clearly structured guidance for Indian civic services, grievances (potholes, water, garbage, electricity), RTI applications, and government schemes (PM-KISAN, Ayushman Bharat, PMAY, etc.). Lead with direct actions, required documents, and official portals. Keep answers structured with bullet points. Never ask for passwords, OTPs, or Aadhaar numbers.`;

    const geminiKey = process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY;
    const groqKey = process.env.GROQ_API_KEY;
    const openAiKey = process.env.OPENAI_API_KEY;
    const openRouterKey = process.env.OPENROUTER_API_KEY;

    // 1. Try Gemini API if key is available
    if (geminiKey) {
      try {
        const text = await tryGeminiApi(geminiKey, systemPrompt, safeHistory, userMessageObj);
        return res.json({ success: true, message: text, provider: 'gemini' });
      } catch (geminiError) {
        console.warn('[AI] Gemini API failed, trying next provider:', geminiError.message);
      }
    }

    // 2. Try Groq API if key is available
    if (groqKey) {
      try {
        const text = await tryOpenAiCompatibleApi(groqKey, 'https://api.groq.com/openai/v1', process.env.GROQ_MODEL || 'llama-3.3-70b-versatile', systemPrompt, safeHistory, userMessageObj);
        return res.json({ success: true, message: text, provider: 'groq' });
      } catch (groqError) {
        console.warn('[AI] Groq API failed, trying next provider:', groqError.message);
      }
    }

    // 3. Try OpenAI / OpenRouter if key is available
    if (openAiKey || openRouterKey) {
      try {
        const key = openAiKey || openRouterKey;
        const baseUrl = process.env.OPENAI_BASE_URL || (openRouterKey ? 'https://openrouter.ai/api/v1' : 'https://api.openai.com/v1');
        const model = process.env.OPENAI_MODEL || (openRouterKey ? 'meta-llama/llama-3.3-70b-instruct:free' : 'gpt-4o-mini');
        const text = await tryOpenAiCompatibleApi(key, baseUrl, model, systemPrompt, safeHistory, userMessageObj);
        return res.json({ success: true, message: text, provider: 'openai' });
      } catch (openAiError) {
        console.warn('[AI] OpenAI compatible API failed, trying next provider:', openAiError.message);
      }
    }

    // 4. Try Local Ollama
    const ollamaBaseUrl = (process.env.OLLAMA_BASE_URL || 'http://127.0.0.1:11434').replace(/\/$/, '');
    const ollamaModel = process.env.OLLAMA_MODEL || 'llama3.2:1b';
    const timeoutMs = Number(process.env.AI_REQUEST_TIMEOUT_MS) || DEFAULT_REQUEST_TIMEOUT_MS;

    try {
      const text = await tryOllamaApi(ollamaBaseUrl, ollamaModel, systemPrompt, safeHistory, userMessageObj, timeoutMs);
      if (text) {
        return res.json({ success: true, message: text, provider: 'ollama' });
      }
    } catch (ollamaError) {
      console.warn('[AI] Ollama service not reachable or timed out:', ollamaError.message);
    }

    // 5. Intelligent Fallback: Built-in Civic Knowledge Engine
    // Never fail or return a 503 error to the user!
    const fallbackText = getCivicKnowledgeResponse(message.trim(), language, attachments);
    return res.json({
      success: true,
      message: fallbackText,
      provider: 'civic-engine-fallback',
    });
  } catch (error) {
    console.error('[AI] Controller error:', error);
    // Even in unexpected errors, provide a helpful citizen assistant fallback response
    return res.json({
      success: true,
      message: getCivicKnowledgeResponse(req.body?.message || 'help', req.body?.language || 'en', req.body?.attachments || []),
      provider: 'civic-engine-fallback',
    });
  }
};

