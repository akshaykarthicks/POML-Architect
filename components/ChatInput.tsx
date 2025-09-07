import React, { useState, useRef, useEffect, KeyboardEvent } from 'react';
import { SendIcon } from './Icons';

interface ChatInputProps {
    onSendMessage: (message: string) => void;
    isLoading: boolean;
}

export const ChatInput: React.FC<ChatInputProps> = ({ onSendMessage, isLoading }) => {
    const [text, setText] = useState('');
    const textareaRef = useRef<HTMLTextAreaElement>(null);

    useEffect(() => {
        const textarea = textareaRef.current;
        if (textarea) {
            textarea.style.height = 'auto'; // Reset height
            textarea.style.height = `${textarea.scrollHeight}px`; // Set to content height
        }
    }, [text]);

    const handleSubmit = () => {
        if (text.trim() && !isLoading) {
            onSendMessage(text);
            setText('');
        }
    };

    const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSubmit();
        }
    };

    return (
        <div className="chat-input-wrapper">
            <textarea
                ref={textareaRef}
                value={text}
                onChange={(e) => setText(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Type your message here..."
                rows={1}
                className="chat-input"
                disabled={isLoading}
                style={{ minHeight: '24px' }}
            />
            <button
                onClick={handleSubmit}
                disabled={isLoading || !text.trim()}
                className="chat-send-button"
                aria-label="Send message"
            >
                <SendIcon className="send-icon-size" />
            </button>
        </div>
    );
};
