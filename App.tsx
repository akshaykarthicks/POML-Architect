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
        <div className="chat-container">
            <header className="chat-header">
                <a
                    href="https://github.com/akshaykarthicks"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="github-icon"
                    aria-label="Akshay Karthick's GitHub Profile"
                >
                    <GithubIcon className="github-icon-size" />
                </a>

                <div className="header-content">
                    <h1 className="chat-title">POML Architect</h1>
                    <p className="chat-subtitle">Your Conversational Prompt Engineering Assistant</p>
                </div>
            </header>

            <main className="chat-main">
                <div className="chat-messages">
                    {messages.map((msg) => (
                        <ChatMessage key={msg.id} message={msg} />
                    ))}
                    {isLoading && messages[messages.length - 1]?.text === '' && (
                        <div className="message">
                            <div className="message-avatar ai">
                                <div className="loading-dots">
                                    <div className="loading-dot"></div>
                                    <div className="loading-dot"></div>
                                    <div className="loading-dot"></div>
                                </div>
                            </div>
                            <div className="message-content ai">
                                <div className="thinking-text">AI is thinking...</div>
                            </div>
                        </div>
                    )}
                    <div ref={messagesEndRef} />
                </div>
            </main>

            <footer className="chat-footer">
                <div className="chat-input-container">
                    {error && (
                        <div className="error-message">
                            <div className="error-title">Error</div>
                            <div className="error-details">{error}</div>
                        </div>
                    )}
                    <ChatInput onSendMessage={handleSendMessage} isLoading={isLoading} />
                </div>
            </footer>
        </div>
    );
};

export default App;