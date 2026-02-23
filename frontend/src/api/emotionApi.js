let base_url = import.meta.env.VITE_API_URL || "";
// Remove trailing slash if present to prevent double slashes in requests
if (base_url.endsWith("/")) {
    base_url = base_url.slice(0, -1);
}
export const API_URL = base_url;

if (!API_URL) {
    console.error("VITE_API_URL is NOT defined! The AI Chatbot will not work in production.");
}


export async function predictEmotion(text) {
    try {
        const res = await fetch(`${API_URL}/api/predict`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ text })
        });

        const rawText = await res.text();
        if (!res.ok) {
            console.error("API Error Raw Response:", rawText);
            throw new Error(`API Error: ${res.status}`);
        }

        try {
            return JSON.parse(rawText);
        } catch (parseError) {
            console.error("FAILED TO PARSE JSON. RAW RESPONSE:", rawText);
            throw parseError;
        }
    } catch (error) {
        console.error("Emotion Prediction failed:", error);
        return { emotion: "Neutral" };
    }
}

export const getSuggestion = (emotion) => {
    const suggestions = {
        "Sadness": "Try a 5-minute grounding technique or listen to a calming playlist. You're not alone.",
        "Stress / Overwhelm": "Break your tasks into smaller steps. Take a deep breath and focus on one thing at a time.",
        "Anxiety": "Try the 5-4-3-2-1 technique: Name 5 things you see, 4 you can touch, 3 you hear, 2 you smell, and 1 you can taste.",
        "Anger": "Step away for a moment. Try a short physical activity to release some energy.",
        "Joy": "Celebrate this moment! Share your positive energy with someone or write down what made you happy.",
        "Fear": "Focus on your breathing. You are in a safe space right now.",
        "Neutral": "Take a moment to check in with yourself. How are you really feeling?"
    };

    return suggestions[emotion] || suggestions["Neutral"];
};
