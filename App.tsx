import React, { useState, useEffect, useRef } from 'react';
import { getChat } from './services/geminiService';
import { ChatInput } from './components/ChatInput';
import { ChatMessage } from './components/ChatMessage';
import { Message, Role } from './types';
import { INITIAL_MESSAGE_TEXT } from './constants';
import type { Chat } from '@google/genai';
import { GithubIcon } from './components/Icons';


const App: React.FC = () => {
    const [chat, setChat] = useState<Chat | null>(null);
    const initialMessage: Message = {
        id: 'initial-ai-message',
        role: Role.AI,
        text: INITIAL_MESSAGE_TEXT,
    };
    const [messages, setMessages] = useState<Message[]>([initialMessage]);
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);
    const messagesEndRef = useRef<null | HTMLDivElement>(null);

    useEffect(() => {
        try {
            setChat(getChat());
        } catch (e) {
            setError(e instanceof Error ? e.message : 'Failed to initialize chat.');
            console.error(e);
        }
    }, []);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    const handleSendMessage = async (inputText: string) => {
        if (!inputText.trim() || isLoading || !chat) return;

        setIsLoading(true);
        setError(null);

        const newUserMessage: Message = {
            id: `user-${Date.now()}`,
            role: Role.USER,
            text: inputText,
        };
        
        // Add user message and a placeholder for AI response
        setMessages(prev => [...prev, newUserMessage, { id: `ai-${Date.now()}`, role: Role.AI, text: '' }]);

        try {
            const result = await chat.sendMessageStream({ message: inputText });

            for await (const chunk of result) {
                const chunkText = chunk.text;
                setMessages(prev => {
                    const lastMessage = prev[prev.length - 1];
                    // Ensure we are updating the correct AI message
                    if (lastMessage.role === Role.AI) {
                        return [
                            ...prev.slice(0, -1),
                            { ...lastMessage, text: lastMessage.text + chunkText }
                        ];
                    }
                    return prev; 
                });
            }
        } catch (e) {
            const errorMessage = e instanceof Error ? e.message : 'An unexpected error occurred.';
            setError(errorMessage);
            console.error("Gemini API Error:", e);
            // remove placeholder AI message on error
            setMessages(prev => prev.filter(m => m.text !== ''));
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="flex flex-col h-screen bg-gray-900 text-white font-sans">
            <header className="p-4 border-b border-gray-700 shadow-lg flex-shrink-0 flex items-center justify-center relative">
                <a
                    href="https://github.com/akshaykarthicks"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white transition-colors"
                    aria-label="Akshay Karthick's GitHub Profile"
                >
                    <GithubIcon className="w-6 h-6" />
                </a>

                <div className="text-center">
                    <h1 className="text-2xl font-bold text-gray-200">POML Architect</h1>
                    <p className="text-sm text-gray-400">Your Conversational Prompt Engineering Assistant</p>
                </div>
            </header>

            <main className="flex-1 overflow-y-auto p-4 md:p-6 space-y-6">
                <div className="w-full max-w-4xl mx-auto">
                    {messages.map((msg) => (
                        <ChatMessage key={msg.id} message={msg} />
                    ))}
                     {isLoading && (
                        <div className="flex justify-start items-center ml-12">
                            <div className="animate-pulse flex space-x-1">
                                <div className="w-2 h-2 bg-indigo-400 rounded-full"></div>
                                <div className="w-2 h-2 bg-indigo-400 rounded-full animation-delay-200"></div>
                                <div className="w-2 h-2 bg-indigo-400 rounded-full animation-delay-400"></div>
                            </div>
                        </div>
                    )}
                    <div ref={messagesEndRef} />
                </div>
            </main>

            <footer className="p-4 border-t border-gray-700 flex-shrink-0">
                <div className="w-full max-w-4xl mx-auto">
                    {error && (
                        <div className="mb-4 p-3 rounded-lg bg-red-900/50 border border-red-500 text-red-300 text-center text-sm">
                            {error}
                        </div>
                    )}
                    <ChatInput onSendMessage={handleSendMessage} isLoading={isLoading} />
                </div>
            </footer>
        </div>
    );
};

export default App;