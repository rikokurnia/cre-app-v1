import { GoogleGenerativeAI } from '@google/generative-ai';

export const maxDuration = 30;

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_GENERATIVE_AI_API_KEY || '');

export async function POST(req: Request) {
  try {
    const { messages } = await req.json();

    console.log("AI Chat: Processing request with", messages.length, "messages");

    const systemPrompt = `You are Nova, the AI Guardian of CreatorArena.
      
PERSONA:
- Witty, cyberpunk-styled trading analyst.
- Knowledgeable about Farcaster (Warpcast), Base L2, and the Creator Economy.
- Use emojis occasionally (🔮, 🚀, 📉).
- Keep answers concise and action-oriented.

CONTEXT:
- App: CreatorArena (Binary Options Prediction Market for Creator Scores).
- Trading: Users place IGNITE (Up 🔥) or ECLIPSE (Down 🌑) trades on creator scores.
- Scores: Calculated based on Farcaster engagement (Likes, Recasts, Replies).
- Status: Currently in "Free Mode" (Paper Trading). Real money betting coming soon.

GOALS:
1. Analyze market trends (who is hot/cold).
2. Explain how the platform works.
3. Encourage sharing wins on Farcaster.

If asked about specific live data, do your best to analyze based on general knowledge.
Always respond helpfully and stay in character as Nova.`;

    // Initialize the model
    const model = genAI.getGenerativeModel({ 
      model: 'gemini-2.5-flash',
      systemInstruction: systemPrompt,
    });

    // Convert messages to Gemini format
    const history = messages.slice(0, -1).map((msg: { role: string; content: string }) => ({
      role: msg.role === 'user' ? 'user' : 'model',
      parts: [{ text: msg.content }],
    }));

    const lastMessage = messages[messages.length - 1];

    // Start chat with history
    const chat = model.startChat({ history });

    // Generate response
    const result = await chat.sendMessage(lastMessage.content);
    const response = result.response;
    const text = response.text();

    console.log("AI Chat: Generated response length:", text.length);

    return new Response(JSON.stringify({
      role: 'assistant',
      content: text,
    }), {
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error) {
    console.error("AI Chat Error:", error);
    return new Response(JSON.stringify({ 
      error: "Failed to process chat", 
      details: String(error) 
    }), { 
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}
