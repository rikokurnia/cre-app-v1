import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';

// Initialize Gemini
const genAI = new GoogleGenerativeAI(process.env.GOOGLE_GENERATIVE_AI_API_KEY || '');

export async function POST(req: NextRequest) {
  try {
    const { posts, creatorName } = await req.json();

    if (!posts || !Array.isArray(posts) || posts.length === 0) {
      return NextResponse.json({ error: 'No posts provided' }, { status: 400 });
    }

    if (!process.env.GOOGLE_GENERATIVE_AI_API_KEY) {
        return NextResponse.json({ error: 'Gemini API Key missing' }, { status: 500 });
    }

    // Using same model as Nova AI Chatbot
    const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });

    const prompt = `
      You are a crypto market analyst AI. 
      Analyze the following recent social media posts by ${creatorName} (from the last 48 hours).
      
      POSTS:
      ${posts.map((p, i) => `${i+1}. ${p}`).join('\n')}
      
      OBJECTIVE:
      Provide a concise, high-level insight summary.
      1. **Sentiment**: Positive, Neutral, or Bearish?
      2. **Key Topics**: What are they focusing on? (e.g., L2 scaling, community, specific tech)
      3. **Market Signal**: Is there any subtle alpha or signal for builders/traders?
      
      FORMAT:
      Use valid Markdown. Use 3 short bullet points. Be direct and professional. 
      Do not hallucinate. If posts are random/shitposting, say "High noise, low signal".
    `;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    return NextResponse.json({ insight: text });

  } catch (error: any) {
    console.error('Gemini Insight Error:', error);
    return NextResponse.json({ error: 'Failed to generate insight' }, { status: 500 });
  }
}
