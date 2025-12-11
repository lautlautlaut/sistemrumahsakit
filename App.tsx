import React, { useState, useEffect, useRef } from 'react';
import { geminiService } from './services/geminiService';
import { Message, Sender, AgentType } from './types';
import { AGENTS, APP_NAME } from './constants';
import MessageBubble from './components/MessageBubble';
import AgentCard from './components/AgentCard';

function App() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [activeAgent, setActiveAgent] = useState<AgentType>(AgentType.NONE);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Initialize standard system message
    setMessages([
      {
        id: 'init',
        text: `Selamat datang di ${APP_NAME}. Saya siap membantu mengarahkan kebutuhan operasional RS (RME, Keuangan, Edukasi, Klinis).`,
        sender: Sender.SYSTEM,
        timestamp: new Date()
      }
    ]);
    
    // Connect to API immediately
    geminiService.startChat();
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim() || isLoading) return;

    const userMsg: Message = {
      id: crypto.randomUUID(),
      text: inputText,
      sender: Sender.USER,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMsg]);
    setInputText('');
    setIsLoading(true);
    
    // Reset active agent visualization to Coordinator processing
    setActiveAgent(AgentType.NONE); 

    try {
      const response = await geminiService.sendMessage(userMsg.text);
      setMessages(prev => [...prev, response]);

      // If routing occurred, highlight the specific agent
      if (response.isRouting && response.routedTo) {
        setActiveAgent(response.routedTo);
        
        // Simulate a follow-up action from the "Sub Agent" (Mock)
        setTimeout(() => {
             const subAgentMsg: Message = {
                id: crypto.randomUUID(),
                text: `[${AGENTS[response.routedTo!].name} Connected] \n\nPermintaan diterima. Memulai proses ${JSON.stringify(response.functionArgs?.jenis_akses || response.functionArgs?.jenis_dokumen || response.functionArgs?.topik_edukasi || response.functionArgs?.data_klinis || "tugas")}...`,
                sender: Sender.SYSTEM,
                timestamp: new Date(),
             }
             setMessages(prev => [...prev, subAgentMsg]);
        }, 1500);
      }

    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-screen bg-slate-50 text-slate-800 font-sans">
      
      {/* Header */}
      <header className="bg-white border-b border-slate-200 px-6 py-4 flex items-center justify-between sticky top-0 z-20">
        <div className="flex items-center gap-3">
          <div className="bg-hospital-600 w-10 h-10 rounded-lg flex items-center justify-center text-white shadow-lg shadow-hospital-500/30">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
            </svg>
          </div>
          <div>
            <h1 className="font-bold text-xl text-slate-800 tracking-tight">Koordinator Sistem RS BLU</h1>
            <p className="text-xs text-slate-500 font-medium">Powered by Gemini AI</p>
          </div>
        </div>
      </header>

      {/* Agents Dashboard / Status Panel */}
      <div className="bg-slate-50 px-6 py-6 border-b border-slate-200">
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 max-w-6xl mx-auto">
           {/* Coordinator Card */}
           <AgentCard 
             config={AGENTS[AgentType.NONE]} 
             isActive={activeAgent === AgentType.NONE && isLoading} 
             isCoordinator={true}
           />
           {/* Sub Agents */}
           <AgentCard config={AGENTS[AgentType.RME]} isActive={activeAgent === AgentType.RME} />
           <AgentCard config={AGENTS[AgentType.ADMIN]} isActive={activeAgent === AgentType.ADMIN} />
           <AgentCard config={AGENTS[AgentType.EDU]} isActive={activeAgent === AgentType.EDU} />
           <AgentCard config={AGENTS[AgentType.CLINICAL]} isActive={activeAgent === AgentType.CLINICAL} />
        </div>
      </div>

      {/* Chat Area */}
      <main className="flex-1 overflow-y-auto px-4 md:px-6 py-6 scrollbar-hide">
        <div className="max-w-4xl mx-auto">
          {messages.map((msg) => (
            <MessageBubble key={msg.id} message={msg} />
          ))}
          {isLoading && !messages[messages.length-1]?.isRouting && (
             <div className="flex items-center gap-2 text-slate-400 text-sm ml-4 mb-4">
               <div className="flex space-x-1">
                 <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce delay-75"></div>
                 <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce delay-150"></div>
                 <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce delay-300"></div>
               </div>
               <span>Menganalisis permintaan...</span>
             </div>
          )}
          <div ref={messagesEndRef} />
        </div>
      </main>

      {/* Input Area */}
      <div className="bg-white p-4 border-t border-slate-200">
        <div className="max-w-4xl mx-auto">
          <form onSubmit={handleSendMessage} className="relative flex items-center gap-2">
            <input
              type="text"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder="Ketik permintaan (contoh: 'Siapkan laporan keuangan bulan Mei' atau 'Saya butuh diagram untuk edukasi diabetes')..."
              className="w-full pl-5 pr-14 py-4 rounded-full bg-slate-100 border border-slate-200 focus:bg-white focus:border-hospital-500 focus:ring-4 focus:ring-hospital-500/10 outline-none transition-all shadow-sm text-slate-700 placeholder-slate-400"
              disabled={isLoading}
            />
            <button
              type="submit"
              disabled={isLoading || !inputText.trim()}
              className="absolute right-2 p-2.5 bg-hospital-600 hover:bg-hospital-700 disabled:bg-slate-300 text-white rounded-full transition-colors shadow-md flex items-center justify-center"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 transform rotate-90" viewBox="0 0 20 20" fill="currentColor">
                <path d="M10.894 2.553a1 1 0 00-1.788 0l-7 14a1 1 0 001.169 1.409l5-1.429A1 1 0 009 15.571V11a1 1 0 112 0v4.571a1 1 0 00.725.962l5 1.428a1 1 0 001.17-1.408l-7-14z" />
              </svg>
            </button>
          </form>
          <div className="text-center mt-3 text-xs text-slate-400">
            Sistem Koordinator Terintegrasi &bull; Aman &bull; Sesuai Regulasi BLU
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;