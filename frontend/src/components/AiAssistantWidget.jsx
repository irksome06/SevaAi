import React, { useEffect, useRef, useState } from 'react';
import { Bot, FileText, ImagePlus, LoaderCircle, Mic, MicOff, Paperclip, Send, Sparkles, Trash2, User, Volume2, VolumeX, X } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { aiApi } from '../services/api';

const MAX_FILE_SIZE = 5 * 1024 * 1024;
const ACCEPTED_FILES = 'image/jpeg,image/png,image/webp,application/pdf,text/plain,text/csv,application/json';
const SPEECH_LANG_MAP = { en: 'en-IN', hi: 'hi-IN', bn: 'bn-IN', mr: 'mr-IN', te: 'te-IN', ta: 'ta-IN', gu: 'gu-IN', kn: 'kn-IN', ml: 'ml-IN', pa: 'pa-IN', ur: 'ur-IN', or: 'or-IN', as: 'as-IN' };

const welcome = (language) => ({
  id: 'welcome', sender: 'assistant', text: language === 'hi'
    ? 'नमस्ते! मैं SevaAI हूँ। आप मुझसे अपनी भाषा में बात कर सकते हैं और किसी दस्तावेज़ या तस्वीर पर सवाल पूछ सकते हैं।'
    : 'Namaste! I am SevaAI. Ask me in your language, or attach a document or image and ask a detailed question about it.',
});

const readFile = (file) => new Promise((resolve, reject) => {
  const reader = new FileReader();
  reader.onload = () => resolve(reader.result);
  reader.onerror = reject;
  reader.readAsDataURL(file);
});

export const AiAssistantWidget = () => {
  const { t, language } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [inputValue, setInputValue] = useState('');
  const [messages, setMessages] = useState(() => [welcome(language)]);
  const [attachments, setAttachments] = useState([]);
  const [isSending, setIsSending] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [speakingMsgId, setSpeakingMsgId] = useState(null);
  const [error, setError] = useState('');
  const fileInputRef = useRef(null);
  const messagesEndRef = useRef(null);
  const recognitionRef = useRef(null);

  useEffect(() => { if (isOpen) messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [messages, isOpen, isSending]);
  useEffect(() => () => window.speechSynthesis?.cancel(), []);

  const addAttachments = async (files) => {
    setError('');
    const candidates = Array.from(files).slice(0, 4 - attachments.length);
    if (!candidates.length) return;
    try {
      const parsed = await Promise.all(candidates.map(async (file) => {
        if (file.size > MAX_FILE_SIZE) throw new Error(`${file.name} is larger than 5 MB.`);
        if (!ACCEPTED_FILES.split(',').includes(file.type)) throw new Error(`${file.name} is not a supported file type.`);
        return { id: `${file.name}-${file.lastModified}`, name: file.name, type: file.type, dataUrl: await readFile(file) };
      }));
      setAttachments((current) => [...current, ...parsed]);
    } catch (fileError) { setError(fileError.message || 'Unable to read that file.'); }
  };

  const sendMessage = async (prompt) => {
    const text = (prompt || inputValue).trim();
    if ((!text && !attachments.length) || isSending) return;
    const userMessage = { id: Date.now(), sender: 'user', text: text || 'Please analyse the attached file(s).', attachments };
    const history = messages.filter((item) => item.id !== 'welcome').slice(-8);
    setMessages((current) => [...current, userMessage]);
    setInputValue(''); setAttachments([]); setError(''); setIsSending(true);
    try {
      const response = await aiApi.chat({ message: userMessage.text, language, attachments, history });
      setMessages((current) => [...current, { id: Date.now() + 1, sender: 'assistant', text: response.message }]);
    } catch (requestError) { setError(requestError.message || 'Unable to reach the AI assistant.'); }
    finally { setIsSending(false); }
  };

  const toggleListening = () => {
    const Recognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!Recognition) return setError('Voice input is available in Chrome and Edge.');
    if (isListening) return recognitionRef.current?.stop();
    const recognition = new Recognition();
    recognition.lang = SPEECH_LANG_MAP[language] || 'en-IN'; recognition.interimResults = true;
    recognition.onstart = () => setIsListening(true);
    recognition.onresult = (event) => setInputValue(Array.from(event.results).map((result) => result[0].transcript).join(''));
    recognition.onerror = () => { setError('Voice input could not be started.'); setIsListening(false); };
    recognition.onend = () => setIsListening(false);
    recognitionRef.current = recognition; recognition.start();
  };

  const speak = (message) => {
    if (!window.speechSynthesis) return setError('Text-to-speech is not supported in this browser.');
    if (speakingMsgId === message.id) { window.speechSynthesis.cancel(); return setSpeakingMsgId(null); }
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(message.text);
    utterance.lang = SPEECH_LANG_MAP[language] || 'en-IN';
    utterance.onstart = () => setSpeakingMsgId(message.id); utterance.onend = () => setSpeakingMsgId(null); utterance.onerror = () => setSpeakingMsgId(null);
    window.speechSynthesis.speak(utterance);
  };

  return <div className="ai-floating-container">
    {isOpen && <div className="ai-chat-window ai-chat-window--advanced" role="dialog" aria-label="SevaAI AI Assistant">
      <header className="ai-chat-header"><div className="ai-chat-title-group"><div className="ai-avatar-badge"><Bot size={20} /></div><div className="ai-chat-header-text"><h4>{t('modAssistantTitle')} <Sparkles size={13} color="#fbbf24" /></h4><span className="ai-status-indicator">Multilingual · Images · Documents</span></div></div><button type="button" className="ai-chat-close-btn" onClick={() => setIsOpen(false)} aria-label="Close assistant"><X size={16} /></button></header>
      <main className="ai-messages-body">
        {messages.map((message) => <div className={`ai-message ${message.sender}`} key={message.id}><div className="ai-msg-avatar">{message.sender === 'assistant' ? <Bot size={15} /> : <User size={15} />}</div><div><div className="ai-message-bubble">{message.text}</div>{message.attachments?.length > 0 && <div className="ai-message-attachments">{message.attachments.map((file) => <span key={file.id}><FileText size={12} /> {file.name}</span>)}</div>}{message.sender === 'assistant' && <button type="button" className={`ai-speaker-action-btn ${speakingMsgId === message.id ? 'is-speaking' : ''}`} onClick={() => speak(message)}>{speakingMsgId === message.id ? <VolumeX size={14} /> : <Volume2 size={14} />} {speakingMsgId === message.id ? 'Stop' : 'Listen'}</button>}</div></div>)}
        {isSending && <div className="ai-message assistant"><div className="ai-msg-avatar"><Bot size={15} /></div><div className="ai-message-bubble ai-thinking"><LoaderCircle size={15} /> Analysing your question…</div></div>}<div ref={messagesEndRef} />
      </main>
      <div className="ai-suggestions-container"><span className="ai-suggestions-label">Try asking</span><div className="ai-chips-list"><button type="button" className="ai-chip-btn" onClick={() => sendMessage('Explain this document in simple language.')}>Explain a document</button><button type="button" className="ai-chip-btn" onClick={() => sendMessage('What civic action should I take next?')}>What should I do next?</button></div></div>
      {error && <div className="ai-error-banner">{error}<button type="button" onClick={() => setError('')} aria-label="Dismiss error"><X size={14} /></button></div>}
      {attachments.length > 0 && <div className="ai-upload-queue">{attachments.map((file) => <span key={file.id}>{file.type.startsWith('image/') ? <ImagePlus size={13} /> : <FileText size={13} />}{file.name}<button type="button" onClick={() => setAttachments((current) => current.filter((item) => item.id !== file.id))}><Trash2 size={12} /></button></span>)}</div>}
      <form className="ai-chat-input-bar" onSubmit={(event) => { event.preventDefault(); sendMessage(); }}><input ref={fileInputRef} type="file" accept={ACCEPTED_FILES} multiple hidden onChange={(event) => { addAttachments(event.target.files); event.target.value = ''; }} /><button type="button" className="ai-attachment-btn" onClick={() => fileInputRef.current?.click()} title="Attach image or document" aria-label="Attach image or document"><Paperclip size={16} /></button><button type="button" className={`ai-voice-mic-btn ${isListening ? 'is-listening' : ''}`} onClick={toggleListening} aria-label="Voice input">{isListening ? <MicOff size={16} /> : <Mic size={16} />}</button><input value={inputValue} onChange={(event) => setInputValue(event.target.value)} placeholder="Ask in your language…" aria-label="Ask the assistant" /><button type="submit" className="ai-send-btn" disabled={isSending || (!inputValue.trim() && !attachments.length)} aria-label="Send message"><Send size={16} /></button></form>
    </div>}
    <button type="button" className="ai-fab-btn" onClick={() => setIsOpen((open) => !open)} aria-label="Toggle AI citizen assistant"><span className="ai-fab-pulse" />{isOpen ? <X size={26} /> : <Bot size={28} />}</button>
  </div>;
};

export default AiAssistantWidget;
