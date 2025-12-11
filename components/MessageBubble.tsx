import React from 'react';
import { Message, Sender, AgentType, GroundingChunk } from '../types';
import { AGENTS } from '../constants';

interface MessageBubbleProps {
  message: Message;
}

const MessageBubble: React.FC<MessageBubbleProps> = ({ message }) => {
  const isUser = message.sender === Sender.USER;
  const isRouting = message.isRouting;
  
  // Format specific routed message
  let displayContent = message.text;
  let subAgentConfig = null;
  
  if (isRouting && message.routedTo) {
    subAgentConfig = AGENTS[message.routedTo];
  }

  return (
    <div className={`flex w-full mb-6 ${isUser ? 'justify-end' : 'justify-start'}`}>
      <div className={`flex max-w-[85%] md:max-w-[70%] ${isUser ? 'flex-row-reverse' : 'flex-row'} gap-3`}>
        
        {/* Avatar */}
        <div className={`
          flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-sm shadow-sm
          ${isUser ? 'bg-slate-800 text-white' : 'bg-hospital-600 text-white'}
        `}>
          {isUser ? 'U' : 'AI'}
        </div>

        {/* Content Box */}
        <div className={`flex flex-col ${isUser ? 'items-end' : 'items-start'}`}>
          <div className={`
            p-4 rounded-2xl shadow-sm text-sm leading-relaxed
            ${isUser 
              ? 'bg-slate-800 text-white rounded-tr-none' 
              : 'bg-white border border-slate-200 text-slate-700 rounded-tl-none'
            }
          `}>
            
            {/* Standard Text */}
            {!isRouting && (
              <div className="whitespace-pre-wrap">{displayContent}</div>
            )}

            {/* Routing Card UI */}
            {isRouting && subAgentConfig && (
               <div className="space-y-3">
                 <div className="flex items-center gap-2 text-slate-500 mb-2 border-b border-slate-100 pb-2">
                   <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                   </svg>
                   <span>Routing Request...</span>
                 </div>
                 
                 <div className={`rounded-lg p-3 ${subAgentConfig.color} bg-opacity-10 border border-slate-100`}>
                    <div className="flex items-center gap-3">
                       <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white ${subAgentConfig.color}`}>
                          {subAgentConfig.icon}
                       </div>
                       <div>
                         <p className="font-bold text-slate-800">{subAgentConfig.name}</p>
                         <p className="text-xs text-slate-600">Task Assigned</p>
                       </div>
                    </div>
                 </div>

                 {message.functionArgs && (
                   <div className="mt-2 text-xs font-mono bg-slate-50 p-2 rounded border border-slate-100 text-slate-600 overflow-x-auto">
                     {JSON.stringify(message.functionArgs, null, 2)}
                   </div>
                 )}
               </div>
            )}

            {/* Grounding Sources */}
            {message.groundingChunks && message.groundingChunks.length > 0 && (
              <div className="mt-4 pt-3 border-t border-slate-200/50">
                <p className="text-xs font-semibold text-slate-400 mb-2 uppercase tracking-wider">Sumber Informasi</p>
                <div className="flex flex-wrap gap-2">
                  {message.groundingChunks.map((chunk, idx) => (
                    chunk.web && (
                      <a 
                        key={idx}
                        href={chunk.web.uri}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-1.5 bg-slate-100 hover:bg-slate-200 text-slate-600 text-xs px-2.5 py-1.5 rounded-full transition-colors"
                      >
                        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                        </svg>
                        <span className="truncate max-w-[150px]">{chunk.web.title}</span>
                      </a>
                    )
                  ))}
                </div>
              </div>
            )}

          </div>
          <span className="text-[10px] text-slate-400 mt-1 px-1">
            {message.timestamp.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
          </span>
        </div>
      </div>
    </div>
  );
};

export default MessageBubble;