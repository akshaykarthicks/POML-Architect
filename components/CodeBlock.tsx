
import React, { useState } from 'react';
import { CopyIcon, CheckIcon } from './Icons';

interface CodeBlockProps {
    code: string;
}

export const CodeBlock: React.FC<CodeBlockProps> = ({ code }) => {
    const [isCopied, setIsCopied] = useState(false);

    const handleCopy = () => {
        navigator.clipboard.writeText(code).then(() => {
            setIsCopied(true);
            setTimeout(() => setIsCopied(false), 2000);
        });
    };

    return (
        <div className="code-block">
            <div className="code-header">
                <span className="code-title">POML Template</span>
                <button
                    onClick={handleCopy}
                    className="code-copy-button"
                >
                    {isCopied ? (
                        <>
                            <CheckIcon style={{ width: '12px', height: '12px' }} />
                            <span style={{ color: '#10b981' }}>Copied!</span>
                        </>
                    ) : (
                        <>
                            <CopyIcon style={{ width: '12px', height: '12px' }} />
                            Copy
                        </>
                    )}
                </button>
            </div>
            <pre className="code-content">
                <code>{code}</code>
            </pre>
        </div>
    );
};
