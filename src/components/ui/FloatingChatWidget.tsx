"use client";

import React, { useState, useRef, useEffect } from "react";
import { 
  FaWhatsapp, FaPaperclip, FaPaperPlane, FaSearch, 
  FaCheckCircle, FaArrowLeft 
} from "react-icons/fa";
import { IoClose } from "react-icons/io5";
import { cn } from "@/lib/utils"; 

// --- Types & Dummy Data ---
interface Message {
  id: number;
  type: 'sent' | 'received';
  text: string;
  timestamp: string;
  fileInfo?: { name: string; size: number; type: string };
}

interface Conversation {
  id: number;
  name: string;
  avatarInitial: string;
  lastMessage: string;
  timestamp: string;
  unread: number;
  messages: Message[];
}

const INITIAL_CONVERSATIONS: Conversation[] = [
  { 
    id: 1, 
    name: 'Support Team', 
    avatarInitial: 'ST', 
    lastMessage: 'How can we help you today?', 
    timestamp: '10:00 AM', 
    unread: 1, 
    messages: [
      { id: 1, type: 'received', text: 'Hello! Welcome to Smart Duuka Support.', timestamp: '10:00 AM' },
      { id: 2, type: 'received', text: 'How can we help you today?', timestamp: '10:00 AM' }
    ] 
  },
  { 
    id: 2, 
    name: 'Sales Dept', 
    avatarInitial: 'SD', 
    lastMessage: 'Your quote is ready.', 
    timestamp: 'Yesterday', 
    unread: 0, 
    messages: [
      { id: 1, type: 'sent', text: 'Hi, is my quote ready?', timestamp: 'Yesterday' },
      { id: 2, type: 'received', text: 'Your quote is ready.', timestamp: 'Yesterday' }
    ] 
  }
];

export default function FloatingChatWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [activeView, setActiveView] = useState<'list' | 'chat'>('list');
  const [activeConversationId, setActiveConversationId] = useState<number | null>(null);
  const [conversations, setConversations] = useState<Conversation[]>(INITIAL_CONVERSATIONS);
  const [inputText, setInputText] = useState("");
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const activeConversation = conversations.find(c => c.id === activeConversationId);
  const totalUnread = conversations.reduce((sum, c) => sum + c.unread, 0);

  // Scroll to bottom
  useEffect(() => {
    if (activeView === 'chat') {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [conversations, activeView, activeConversationId]);

  // Handlers
  const toggleChat = () => setIsOpen(!isOpen);

  const openConversation = (id: number) => {
    setActiveConversationId(id);
    setActiveView('chat');
    setConversations(prev => prev.map(c => c.id === id ? { ...c, unread: 0 } : c));
  };

  const backToList = () => {
    setActiveView('list');
    setActiveConversationId(null);
  };

  const handleSendMessage = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!inputText.trim() || !activeConversationId) return;

    const newMessage: Message = {
      id: Date.now(),
      type: 'sent',
      text: inputText,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    updateConversationMessages(activeConversationId, newMessage);
    setInputText("");

    setTimeout(() => {
      const reply: Message = {
        id: Date.now() + 1,
        type: 'received',
        text: "Thanks for your message! An agent will reply shortly.",
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      updateConversationMessages(activeConversationId, reply);
    }, 1500);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || !files.length || !activeConversationId) return;
    const file = files[0];
    const fileMsg: Message = {
      id: Date.now(),
      type: 'sent',
      text: `File: ${file.name}`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      fileInfo: { name: file.name, size: file.size, type: file.type }
    };
    updateConversationMessages(activeConversationId, fileMsg);
    if(fileInputRef.current) fileInputRef.current.value = "";
  };

  const updateConversationMessages = (chatId: number, msg: Message) => {
    setConversations(prev => prev.map(c => {
      if (c.id === chatId) {
        return {
          ...c,
          messages: [...c.messages, msg],
          lastMessage: msg.fileInfo ? `📎 ${msg.fileInfo.name}` : msg.text,
          timestamp: msg.timestamp
        };
      }
      return c;
    }));
  };

  return (
    // Use the CSS class from globals.css for positioning
    <div className="chat-widget-container font-sans">
      
      {/* Chat Window: Uses CSS classes for animation/states */}
      <div className={cn("chat-widget-window", isOpen ? "chat-window-open" : "chat-window-closed")}>
        
        {/* Sliding Views Container */}
        <div className="relative flex-grow overflow-hidden bg-slate-50 flex flex-col h-full">
          
          {/* --- VIEW 1: CONVERSATION LIST --- */}
          <div 
            className={cn(
              "absolute inset-0 flex flex-col transition-transform duration-300 ease-in-out bg-white",
              activeView === 'list' ? "translate-x-0" : "-translate-x-full"
            )}
          >
            {/* Header */}
            <div className="bg-whatsapp text-white p-4 flex justify-between items-center shadow-sm shrink-0">
              <h3 className="font-semibold text-lg">Your Conversations</h3>
              <button onClick={toggleChat} className="text-white hover:text-green-100 text-2xl leading-none">
                <IoClose />
              </button>
            </div>

            {/* Search */}
            <div className="p-3 border-b border-slate-100 shrink-0">
              <div className="relative">
                <span className="absolute inset-y-0 left-0 flex items-center pl-3">
                  <FaSearch className="text-slate-400" />
                </span>
                <input 
                  type="text" 
                  placeholder="Search conversations..." 
                  className="chat-search-input w-full text-sm rounded-md pl-10 pr-4 py-2"
                />
              </div>
            </div>

            {/* List */}
            <div className="flex-grow overflow-y-auto custom-scrollbar">
              {conversations.map(convo => (
                <div 
                  key={convo.id}
                  onClick={() => openConversation(convo.id)}
                  className="flex items-center p-3 hover:bg-slate-50 cursor-pointer border-b border-slate-100 transition-colors"
                >
                  <div className="w-12 h-12 bg-slate-200 rounded-full mr-3 flex items-center justify-center font-bold text-[#128C7E] shrink-0">
                    {convo.avatarInitial}
                  </div>
                  <div className="flex-grow overflow-hidden">
                    <div className="flex justify-between items-center">
                      <h4 className="font-semibold text-slate-800 truncate">{convo.name}</h4>
                      <p className="text-xs text-slate-400 shrink-0 ml-2">{convo.timestamp}</p>
                    </div>
                    <div className="flex justify-between items-start mt-1">
                      <p className="text-sm text-slate-500 truncate max-w-[180px]">{convo.lastMessage}</p>
                      {convo.unread > 0 && (
                        <span className="bg-whatsapp text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center">
                          {convo.unread}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* --- VIEW 2: CHAT MESSAGES --- */}
          <div 
            className={cn(
              "absolute inset-0 flex flex-col transition-transform duration-300 ease-in-out bg-[#e5ddd5]", 
              activeView === 'chat' ? "translate-x-0" : "translate-x-full"
            )}
            style={{ backgroundImage: "url('https://user-images.githubusercontent.com/15075759/28719144-86dc0f70-73b1-11e7-911d-60d70fcded21.png')", backgroundRepeat: 'repeat', backgroundSize: '400px' }}
          >
            {/* Header */}
            <div className="bg-white border-b border-slate-200 p-3 flex items-center shadow-sm z-10 shrink-0">
              <button onClick={backToList} className="text-[#128C7E] hover:bg-slate-100 rounded-full p-2 mr-2 transition-colors">
                <FaArrowLeft />
              </button>
              <div className="w-10 h-10 bg-slate-200 rounded-full mr-3 flex items-center justify-center font-bold text-[#128C7E]">
                {activeConversation?.avatarInitial}
              </div>
              <div>
                <h4 className="font-bold text-slate-800 text-sm">{activeConversation?.name}</h4>
                <p className="text-xs text-slate-500">via WhatsApp</p>
              </div>
            </div>

            {/* Messages */}
            <div className="flex-grow p-4 overflow-y-auto custom-scrollbar flex flex-col space-y-3">
              {activeConversation?.messages.map((msg) => (
                <div 
                  key={msg.id} 
                  className={cn("chat-bubble", msg.type === 'sent' ? "chat-bubble-sent" : "chat-bubble-received")}
                >
                  {msg.fileInfo ? (
                    <div className="flex items-center gap-3">
                      <div className="bg-white/50 p-2 rounded-lg">
                          <FaCheckCircle className="text-[#25D366] text-xl" />
                      </div>
                      <div className="overflow-hidden">
                        <p className="font-semibold text-xs truncate max-w-[150px]">{msg.fileInfo.name}</p>
                        <p className="text-[10px] text-slate-500">{(msg.fileInfo.size / 1024).toFixed(1)} KB</p>
                      </div>
                    </div>
                  ) : (
                    <span className="text-slate-800 text-sm">{msg.text}</span>
                  )}
                  <span className="text-[10px] text-slate-500 block text-right mt-1 opacity-70">
                    {msg.timestamp}
                  </span>
                </div>
              ))}
              <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <div className="bg-white p-3 z-10 shrink-0 border-t border-slate-200">
              <form onSubmit={handleSendMessage} className="flex items-center gap-2">
                <div className="chat-message-input-container flex-grow flex items-center bg-white rounded-full py-1 pl-4 pr-2">
                  <input 
                    type="text" 
                    value={inputText}
                    onChange={(e) => setInputText(e.target.value)}
                    placeholder="Type a message..." 
                    className="flex-grow bg-transparent border-0 focus:ring-0 text-sm p-1 outline-none text-slate-700"
                  />
                  <button 
                    type="button" 
                    onClick={() => fileInputRef.current?.click()}
                    className="text-slate-400 hover:text-[#128C7E] p-2 rounded-full transition-colors"
                  >
                    <FaPaperclip />
                  </button>
                </div>
                <button 
                  type="submit" 
                  className="bg-whatsapp text-white rounded-full w-10 h-10 flex items-center justify-center hover:bg-whatsapp-dark transition-colors shadow-md shrink-0"
                >
                  <FaPaperPlane className="text-sm ml-0.5" />
                </button>
              </form>
              <input type="file" ref={fileInputRef} className="hidden" onChange={handleFileUpload} />
            </div>
          </div>

        </div>
      </div>

      {/* Toggle Button - MODIFIED SECTION */}
      <button 
        onClick={toggleChat}
        className={cn(
          "group relative bg-whatsapp hover:bg-whatsapp-dark text-white h-14 w-14 hover:w-auto hover:px-6 rounded-full shadow-lg flex items-center justify-center transition-all duration-300 ease-in-out focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#128C7E]",
        )}
      >
        {/* Icon: Always visible, prevents shrinking */}
        <FaWhatsapp className="text-3xl shrink-0" />
        
        {/* Text: Hidden by default (width 0, opacity 0), reveals on hover */}
        <span className="max-w-0 overflow-hidden opacity-0 group-hover:max-w-xs group-hover:opacity-100 group-hover:ml-2 transition-all duration-300 ease-in-out font-semibold text-sm whitespace-nowrap">
          Chat with us
        </span>
        
        {/* Notification Badge */}
        {!isOpen && totalUnread > 0 && (
          <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center border-2 border-white animate-bounce">
            {totalUnread}
          </span>
        )}
      </button>

    </div>
  );
}