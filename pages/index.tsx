import React, { useState, useEffect, useRef } from 'react';
import Head from 'next/head';
import { ChatInput } from '../components/ChatInput';
import { ChatMessage } from '../components/ChatMessage';
import { Message, Role } from '../types';
import { INITIAL_MESSAGE_TEXT } from '../constants';
import { GithubIcon } from '../components/Icons';


const HomePage: React.FC = () => {
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
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    const handleSendMessage = async (inputText: string) => {
        if (!inputText.trim() || isLoading) return;

        setIsLoading(true);
        setError(null);

        const newUserMessage: Message = {
            id: `user-${Date.now()}`,
            role: Role.USER,
            text: inputText,
        };

        const historyForApi = messages.filter(m => m.id !== 'initial-ai-message');
        
        setMessages(prev => [...prev, newUserMessage, { id: `ai-${Date.now()}`, role: Role.AI, text: '' }]);

        try {
            const response = await fetch('/api/chat', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ message: inputText, history: [...historyForApi, newUserMessage] }),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || 'API request failed');
            }

            const reader = response.body?.getReader();
            const decoder = new TextDecoder();

            if (reader) {
                 while (true) {
                    const { done, value } = await reader.read();
                    if (done) break;
                    
                    const chunkText = decoder.decode(value);
                    setMessages(prev => {
                        const lastMessage = prev[prev.length - 1];
                        if (lastMessage.role === Role.AI) {
                            return [
                                ...prev.slice(0, -1),
                                { ...lastMessage, text: lastMessage.text + chunkText }
                            ];
                        }
                        return prev; 
                    });
                }
            }
        } catch (e) {
            const errorMessage = e instanceof Error ? e.message : 'An unexpected error occurred.';
            setError(errorMessage);
            console.error("API Fetch Error:", e);
            setMessages(prev => prev.slice(0, -2)); // Remove user message and AI placeholder
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <>
            <Head>
                <title>POML Architect</title>
                <meta name="description" content="Your Conversational Prompt Engineering Assistant" />
                <link rel="icon" href="/favicon.ico" />
            </Head>
            <div className="chat-container">
                <header className="chat-header">
                    <a
                        href="https://github.com/akshaykarthicks"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="github-icon"
                        aria-label="Akshay Karthick's GitHub Profile"
                    >
                        <GithubIcon style={{ width: '20px', height: '20px' }} />
                    </a>

                    <div style={{ textAlign: 'center' }}>
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
                                    <div style={{ color: '#9ca3af', fontSize: '0.875rem' }}>AI is thinking...</div>
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
                                <div style={{ marginTop: '0.25rem' }}>{error}</div>
                            </div>
                        )}
                        <ChatInput onSendMessage={handleSendMessage} isLoading={isLoading} />
                    </div>
                </footer>
            </div>
        </>
    );
};

export default HomePage;