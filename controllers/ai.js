import Anthropic from '@anthropic-ai/sdk';
import { WASTE_TYPES } from '../models/wasteCollection.js';

// The AI features are optional: without ANTHROPIC_API_KEY the endpoints
// report themselves as disabled and the frontend hides the features.
const aiEnabled = () => Boolean(process.env.ANTHROPIC_API_KEY);
const MODEL = () => process.env.ANTHROPIC_MODEL || 'claude-haiku-5-5';

let client;
const anthropic = () => {
    if (!client) client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
    return client;
};

export const getAiStatus = (req, res) => {
    res.json({ enabled: aiEnabled() });
};

const DISABLED_MESSAGE = 'AI features are not configured on this server (ANTHROPIC_API_KEY is not set).';

const CLASSIFY_PROMPT = `You are the waste-identification assistant for Taka Kipawa, a waste management and recycling service in Ghana.
Look at the photo and identify the main waste item in it.

Respond with ONLY a JSON object (no markdown fences, no commentary) with exactly these keys:
- "item": short name of what you see (max 6 words)
- "wasteType": the best match from this list: ${JSON.stringify(WASTE_TYPES)}
- "recyclable": true or false
- "confidence": "high", "medium" or "low"
- "disposal": 1-2 sentences of practical disposal/recycling advice appropriate for Ghana
- "upcyclingIdea": one creative reuse or upcycling idea for this item (or null if none makes sense)

If the photo does not clearly show waste, use wasteType "Other", confidence "low", and explain in "disposal" what you can and cannot tell.`;

const parseModelJson = (text) => {
    const cleaned = text.trim().replace(/^```(?:json)?\s*/i, '').replace(/```\s*$/, '');
    return JSON.parse(cleaned);
};

export const classifyWaste = async (req, res, next) => {
    try {
        if (!aiEnabled()) return res.status(503).json({ message: DISABLED_MESSAGE });
        if (!req.file) return res.status(422).json({ message: 'Attach an image file as the "image" field.' });

        const allowed = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
        if (!allowed.includes(req.file.mimetype)) {
            return res.status(422).json({ message: 'Only JPEG, PNG, WebP or GIF images are supported.' });
        }

        const response = await anthropic().messages.create({
            model: MODEL(),
            max_tokens: 500,
            messages: [{
                role: 'user',
                content: [
                    {
                        type: 'image',
                        source: {
                            type: 'base64',
                            media_type: req.file.mimetype,
                            data: req.file.buffer.toString('base64'),
                        },
                    },
                    { type: 'text', text: CLASSIFY_PROMPT },
                ],
            }],
        });

        const text = response.content?.find((block) => block.type === 'text')?.text || '';
        let result;
        try {
            result = parseModelJson(text);
        } catch {
            return res.status(502).json({ message: 'The AI returned an unexpected answer. Please try another photo.' });
        }
        if (!WASTE_TYPES.includes(result.wasteType)) result.wasteType = 'Other';
        res.json(result);
    } catch (error) {
        if (error?.status === 429) return res.status(429).json({ message: 'The AI is busy right now — try again in a minute.' });
        if (error?.status) {
            console.error('[ai] classify failed:', error.status, error.message);
            return res.status(502).json({ message: 'AI request failed. Please try again.' });
        }
        next(error);
    }
};

const CHAT_SYSTEM = `You are "Eco", the friendly assistant of Taka Kipawa (SWK Ghana), a waste management and upcycling marketplace in Ghana.
Help users with: sorting and recycling waste, composting, reducing household waste, what Taka Kipawa offers (scheduling waste pickups from the dashboard, earning points for completed pickups — about 10 points per kg — levels and badges, and a marketplace of recycled/upcycled products), and general sustainability advice relevant to Ghana.
Keep answers short (2-5 sentences), concrete and encouraging. If asked something unrelated to waste, recycling, sustainability or the Taka Kipawa app, politely steer back to those topics.`;

export const chatWithAssistant = async (req, res, next) => {
    try {
        if (!aiEnabled()) return res.status(503).json({ message: DISABLED_MESSAGE });

        const incoming = Array.isArray(req.body?.messages) ? req.body.messages : null;
        if (!incoming || incoming.length === 0) {
            return res.status(422).json({ message: 'Send a "messages" array of {role, content}.' });
        }

        const messages = incoming
            .slice(-12)
            .filter((m) => (m?.role === 'user' || m?.role === 'assistant') && typeof m?.content === 'string')
            .map((m) => ({ role: m.role, content: m.content.slice(0, 2000) }));
        if (messages.length === 0 || messages[messages.length - 1].role !== 'user') {
            return res.status(422).json({ message: 'The last message must be from the user.' });
        }

        const response = await anthropic().messages.create({
            model: MODEL(),
            max_tokens: 500,
            system: CHAT_SYSTEM,
            messages,
        });

        const reply = response.content?.find((block) => block.type === 'text')?.text?.trim() || '';
        res.json({ reply });
    } catch (error) {
        if (error?.status === 429) return res.status(429).json({ message: 'The AI is busy right now — try again in a minute.' });
        if (error?.status) {
            console.error('[ai] chat failed:', error.status, error.message);
            return res.status(502).json({ message: 'AI request failed. Please try again.' });
        }
        next(error);
    }
};
