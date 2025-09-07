import React from 'react';
import { Message, Role } from '../types';
import { AiIcon, UserIcon } from './Icons';
import { CodeBlock } from './CodeBlock';

interface ChatMessageProps {
    message: Message;
}

// Simple markdown-to-HTML for bold text
const formatText = (text: string) => {
    const boldRegex = /\*\*(.*?)\*\*/g;
    return text.split('\n').map((line, i) => (
        <p key={i} dangerouslySetInnerHTML={{ __html: line.replace(boldRegex, '<strong>$1</strong>') }} />
    ));
};


export const ChatMessage: React.FC<ChatMessageProps> = ({ message }) => {
    const { role, text } = message;
    const isAi = role === Role.AI;

    // Split the text by ```xml ... ``` blocks to separate code from text
    const parts = text.split(/(```xml[\s\S]*?```)/g).filter(part => part.trim() !== '');

    const messageContent = parts.map((part, index) => {
        if (part.startsWith('```xml')) {
            const code = part.replace(/^```xml\n|```$/g, '');
            return <CodeBlock key={index} code={code} />;
        }
        return <div key={index} className="message-text">{formatText(part)}</div>;
    });

    return (
        <div className={`message ${isAi ? '' : 'user'}`}>
            <div className={`message-avatar ${isAi ? 'ai' : 'user'}`}>
                {isAi ? (
                    <AiIcon className="message-icon-size" />
                ) : (
                    <UserIcon className="message-icon-size" />
                )}
            </div>
            
            <div className={`message-content ${isAi ? 'ai' : 'user'}`}>
                {messageContent}
            </div>
        </div>
    );
};
