
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
                            <CheckIcon className="code-icon-size" />
                            <span className="copied-text">Copied!</span>
                        </>
                    ) : (
                        <>
                            <CopyIcon className="code-icon-size" />
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
