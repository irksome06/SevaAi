const MAX_ATTACHMENTS = 4;
const MAX_FILE_SIZE = 5 * 1024 * 1024;
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

const buildUserMessage = (message, attachments) => {
  const images = [];
  const documentNotes = [];

  attachments.forEach(({ name, type, dataUrl }) => {
    if (!ALLOWED_MIME_TYPES.has(type) || typeof dataUrl !== 'string') return;

    if (type.startsWith('image/')) {
      // Ollama expects the raw base64 string, without the data URL prefix.
      const base64 = dataUrl.split(',')[1];
      if (base64) images.push(base64);
      return;
    }

    // Text-based uploads can be included directly in the local model prompt.
    // PDFs need a vision/document-capable model or a PDF extraction service.
    if (['text/plain', 'text/csv', 'application/json'].includes(type)) {
      try {
        const content = Buffer.from(dataUrl.split(',')[1] || '', 'base64').toString('utf8').slice(0, 30000);
        documentNotes.push(`\n\nAttached file: ${name}\n---\n${content}\n---`);
      } catch {
        documentNotes.push(`\n\nAn attached file named "${name}" could not be read.`);
      }
    } else {
      documentNotes.push(`\n\nA PDF named "${name}" is attached. Ask the citizen to paste its relevant text, or configure a document-capable local model.`);
    }
  });

  return {
    role: 'user',
    content: `${message}${documentNotes.join('')}`,
    ...(images.length ? { images } : {}),
  };
};

exports.chat = async (req, res, next) => {
  try {
    const { message, language = 'en', history = [], attachments = [] } = req.body;
    if (typeof message !== 'string' || !message.trim()) {
      return res.status(400).json({ success: false, message: 'A message is required.' });
    }
    const ollamaBaseUrl = (process.env.OLLAMA_BASE_URL || 'http://127.0.0.1:11434').replace(/\/$/, '');
    const ollamaModel = process.env.OLLAMA_MODEL || 'llama3.2';
    if (!ollamaModel) {
      return res.status(503).json({
        success: false,
        message: 'AI assistant is not configured. Set OLLAMA_MODEL in backend/.env and restart the backend.',
      });
    }
    if (!Array.isArray(attachments) || attachments.length > MAX_ATTACHMENTS) {
      return res.status(400).json({ success: false, message: `You can attach up to ${MAX_ATTACHMENTS} files.` });
    }
    for (const file of attachments) {
      if (!file || !ALLOWED_MIME_TYPES.has(file.type) || typeof file.dataUrl !== 'string' || file.dataUrl.length > MAX_FILE_SIZE * 1.4) {
        return res.status(400).json({ success: false, message: 'Use a PNG, JPG, WEBP, PDF, TXT, CSV, or JSON file up to 5 MB.' });
      }
    }

    const safeHistory = Array.isArray(history) ? history.slice(-8) : [];
    const messages = [
      {
        role: 'system',
        content: `You are SevaAI, a helpful Indian citizen-services assistant. Reply in ${LANGUAGE_NAMES[language] || 'English'} unless the user requests another language. Analyse attached images when the selected local model supports vision. Give practical, clearly structured guidance for civic services, grievances, RTI, and government schemes. Do not invent government rules, eligibility, or deadlines; state uncertainty and advise checking the relevant official authority. Do not request passwords, OTPs, Aadhaar numbers, or other sensitive personal data.`,
      },
      ...safeHistory
        .filter((item) => item && typeof item.text === 'string' && ['user', 'assistant'].includes(item.sender))
        .map((item) => ({ role: item.sender === 'assistant' ? 'assistant' : 'user', content: item.text })),
      buildUserMessage(message.trim(), attachments),
    ];

    const response = await fetch(`${ollamaBaseUrl}/api/chat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ model: ollamaModel, messages, stream: false }),
    });
    const result = await response.json();
    if (!response.ok) {
      console.error('[AI] Ollama error:', result);
      return res.status(response.status).json({ success: false, message: 'The AI service could not complete that request. Please try again.' });
    }
    const text = result?.message?.content || 'I could not generate a response. Please try again.';
    return res.json({ success: true, message: text });
  } catch (error) {
    if (error?.cause?.code === 'ECONNREFUSED') {
      return res.status(503).json({
        success: false,
        message: 'The free local AI service is not running. Install Ollama, run "ollama pull llama3.2", then start Ollama and restart the backend.',
      });
    }
    next(error);
  }
};
