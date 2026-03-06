import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Paths to datasets
const INTENTS_PATH = path.resolve(__dirname, '../../../api/intents chatbot nd4.json');
const FLOW_PATH = path.resolve(__dirname, '../../../api/data/chat_flow.json');

let intents = { intents: [] };
let chatFlow = {};

try {
    const intentsData = fs.readFileSync(INTENTS_PATH, 'utf8');
    intents = JSON.parse(intentsData);

    const flowData = fs.readFileSync(FLOW_PATH, 'utf8');
    chatFlow = JSON.parse(flowData);
} catch (error) {
    console.error("Error loading chatbot datasets:", error);
}

/**
 * Normalizes text for matching
 */
function normalize(text) {
    return text.toLowerCase().replace(/[^\w\s]/g, '').trim();
}

/**
 * Finds the top matching intent based on pattern overlap
 */
function findIntent(message) {
    const normalizedMsg = normalize(message);
    const msgWords = new Set(normalizedMsg.split(/\s+/));

    let bestIntent = null;
    let maxOverlap = 0;

    for (const intent of intents.intents) {
        for (const pattern of intent.patterns) {
            const normalizedPattern = normalize(pattern);
            if (normalizedMsg === normalizedPattern) {
                return intent; // Exact match priority
            }

            const patternWords = normalizedPattern.split(/\s+/);
            const overlap = patternWords.filter(w => msgWords.has(w)).length;

            if (overlap > maxOverlap) {
                maxOverlap = overlap;
                bestIntent = intent;
            }
        }
    }

    // Only return if there's significant overlap or it's a very short message with a match
    if (maxOverlap > 0 && (maxOverlap / msgWords.size > 0.4 || maxOverlap >= 2)) {
        return bestIntent;
    }

    return null;
}

/**
 * Main response function
 */
export function getResponse(userMessage, state) {
    // Special handling for initial session
    if (userMessage === "__start__") {
        const startNode = chatFlow['start'];
        return {
            reply: startNode.message,
            state: { expecting: 'start', topic: startNode.tag },
            options: startNode.options || []
        };
    }

    const currentStateId = state?.expecting || 'start';
    const normalizedUserMsg = normalize(userMessage);

    // 1. Check if user selected an option from the current state
    if (chatFlow[currentStateId]) {
        const options = chatFlow[currentStateId].options || [];
        for (const opt of options) {
            if (normalize(opt.label) === normalizedUserMsg) {
                const nextNodeId = opt.next;
                const nextNode = chatFlow[nextNodeId] || chatFlow['start'];

                let reply = nextNode.message;
                if (nextNode.tag) {
                    const intent = intents.intents.find(i => i.tag === nextNode.tag);
                    if (intent && intent.responses.length > 0) {
                        reply = intent.responses[Math.floor(Math.random() * intent.responses.length)];
                    }
                }

                return {
                    reply,
                    state: { ...state, expecting: nextNodeId, topic: nextNode.tag || state.topic },
                    options: nextNode.options || []
                };
            }
        }
    }

    // 2. Try to match intent from message content
    const matchedIntent = findIntent(userMessage);
    if (matchedIntent) {
        const reply = matchedIntent.responses[Math.floor(Math.random() * matchedIntent.responses.length)];

        // Try to find a flow node that matches this intent tag to provide relevant options
        let nextStateId = 'start';
        let options = chatFlow['start']?.options || [];

        const flowNodeId = Object.keys(chatFlow).find(key => chatFlow[key].tag === matchedIntent.tag || key === matchedIntent.tag);
        if (flowNodeId) {
            nextStateId = flowNodeId;
            options = chatFlow[flowNodeId].options || options;
        }

        return {
            reply,
            state: { ...state, expecting: nextStateId, topic: matchedIntent.tag },
            options: options
        };
    }

    // 3. Fallback
    const fallbackIntent = intents.intents.find(i => i.tag === 'fallback') || { responses: ["I'm here for you. Tell me more."] };
    const reply = fallbackIntent.responses[Math.floor(Math.random() * fallbackIntent.responses.length)];

    return {
        reply,
        state: { ...state, expecting: currentStateId },
        options: chatFlow[currentStateId]?.options || chatFlow['start']?.options || []
    };
}

/**
 * Predict emotion based on text input
 */
export function predictEmotion(text) {
    const normalizedText = normalize(text);

    // Hardcoded overrides matching the original Python implementation
    const overrides = {
        "stressed": "Stress / Overwhelm",
        "overwhelmed": "Stress / Overwhelm",
        "neutral": "Neutral",
        "sad": "Sadness"
    };

    for (const [key, value] of Object.entries(overrides)) {
        if (normalizedText.includes(key)) {
            return value;
        }
    }

    const matchedIntent = findIntent(text);

    if (matchedIntent) {
        // Map intent tags to the emotion labels expected by the frontend
        const tagMap = {
            "happy": "Joy / Happy",
            "sad": "Sadness",
            "anxious": "Anxiety / Panic",
            "stressed": "Stress / Overwhelm",
            "neutral-response": "Neutral"
        };

        return tagMap[matchedIntent.tag] || "Neutral";
    }

    return "Neutral";
}
