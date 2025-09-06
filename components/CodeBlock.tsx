
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
        <div className="bg-gray-900/70 rounded-lg my-4 relative border border-gray-700">
            <div className="flex justify-between items-center px-4 py-2 bg-gray-800/50 rounded-t-lg border-b border-gray-700">
                <span className="text-gray-400 text-sm font-semibold">POML Template</span>
                <button
                    onClick={handleCopy}
                    className="flex items-center gap-1.5 text-sm text-gray-300 hover:text-white transition-colors"
                >
                    {isCopied ? (
                        <>
                            <CheckIcon className="w-4 h-4 text-green-400" />
                            Copied!
                        </>
                    ) : (
                        <>
                            <CopyIcon className="w-4 h-4" />
                            Copy
                        </>
                    )}
                </button>
            </div>
            <pre className="p-4 text-sm overflow-x-auto text-gray-300">
                <code>{code}</code>
            </pre>
        </div>
    );
};
