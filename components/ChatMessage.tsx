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
        return <div key={index} className="prose prose-invert prose-sm max-w-none">{formatText(part)}</div>;
    });

    return (
        <div className={`flex items-start gap-4 my-4 ${isAi ? '' : 'justify-end'}`}>
            {isAi && (
                <div className="w-8 h-8 rounded-full bg-indigo-600 flex items-center justify-center flex-shrink-0">
                    <AiIcon className="w-5 h-5 text-white" />
                </div>
            )}
            
            <div className={`max-w-2xl ${isAi ? '' : 'flex items-end flex-col'}`}>
                <div className={`p-4 rounded-xl ${isAi ? 'bg-gray-800' : 'bg-blue-600'}`}>
                    {messageContent}
                </div>
            </div>

            {!isAi && (
                 <div className="w-8 h-8 rounded-full bg-gray-700 flex items-center justify-center flex-shrink-0">
                    <UserIcon className="w-5 h-5 text-white" />
                </div>
            )}
        </div>
    );
};
