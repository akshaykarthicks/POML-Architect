import type { NextApiRequest, NextApiResponse } from 'next';
import { GoogleGenAI, Chat, Content } from "@google/genai";
import { SYSTEM_INSTRUCTION } from '../../constants';
import { Role } from '../../types';

// Converts our Message[] format to Gemini's Content[] format
const buildGeminiHistory = (messages: {role: Role, text: string}[]): Content[] => {
    return messages.map(msg => ({
        role: msg.role === Role.AI ? 'model' : 'user',
        parts: [{ text: msg.text }]
    }));
};


export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method Not Allowed' });
    }

    const { message, history } = req.body;

    if (!process.env.API_KEY) {
        return res.status(500).json({ error: "API_KEY environment variable not set" });
    }

    try {
        const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
        const chat: Chat = ai.chats.create({
            model: 'gemini-2.5-flash',
            config: {
                systemInstruction: SYSTEM_INSTRUCTION
            },
            // Pass the history, converting it to the format Gemini expects
            history: buildGeminiHistory(history),
        });

        const stream = await chat.sendMessageStream({ message });
        
        // Set headers for streaming
        res.setHeader('Content-Type', 'text/plain; charset=utf-8');
        res.setHeader('Transfer-Encoding', 'chunked');

        // Pipe the stream from Gemini to the client
        for await (const chunk of stream) {
            res.write(chunk.text);
        }
        
        res.end();

    } catch (error) {
        console.error("Gemini API Error:", error);
        res.status(500).json({ error: 'Failed to get response from AI' });
    }
}
