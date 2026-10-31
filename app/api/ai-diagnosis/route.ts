import { NextRequest, NextResponse } from 'next/server';

const SYSTEM_MESSAGE =
  "You are an expert AI Veterinary Specialist for livestock and poultry farms. Analyze symptoms, daily observations, mortality spikes, or feeding logs submitted by smallholder farmers. Provide a concise, practical breakdown including: 1) Potential diagnosis, 2) Immediate action/isolation steps, and 3) Recommended treatment or veterinary intervention.";

export async function POST(req: NextRequest) {
  try {
    const apiKey = process.env.GROQ_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { error: 'Server configuration error: GROQ_API_KEY is not configured.' },
        { status: 500 }
      );
    }

    let body: any;
    try {
      body = await req.json();
    } catch {
      return NextResponse.json(
        { error: 'Invalid JSON request body' },
        { status: 400 }
      );
    }

    let messages: Array<{ role: string; content: string }> = [];

    if (Array.isArray(body?.messages) && body.messages.length > 0) {
      const nonSystemMessages = body.messages.filter(
        (m: { role: string }) => m.role !== 'system'
      );
      messages = [
        { role: 'system', content: SYSTEM_MESSAGE },
        ...nonSystemMessages,
      ];
    } else {
      const userContent =
        body?.prompt ||
        body?.symptoms ||
        body?.question ||
        body?.observation ||
        (typeof body === 'string' ? body : '');

      if (!userContent || (typeof userContent === 'string' && !userContent.trim())) {
        return NextResponse.json(
          { error: 'Missing prompt, symptoms, or question in request body' },
          { status: 400 }
        );
      }

      messages = [
        { role: 'system', content: SYSTEM_MESSAGE },
        { role: 'user', content: String(userContent).trim() },
      ];
    }

    const groqPayload = {
      model: 'llama-3.1-8b-instant',
      messages,
      temperature: body?.temperature ?? 0.7,
      max_tokens: body?.max_tokens ?? 1024,
    };

    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.GROQ_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(groqPayload),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => null);
      const errorMessage =
        errorData?.error?.message ||
        errorData?.message ||
        `Groq API responded with status ${response.status}: ${response.statusText}`;

      return NextResponse.json(
        {
          error: errorMessage,
          details: errorData || undefined,
        },
        { status: response.status }
      );
    }

    const data = await response.json();
    const diagnosis = data.choices?.[0]?.message?.content || '';

    return NextResponse.json({
      success: true,
      response: diagnosis,
      choices: data.choices,
      model: data.model,
      usage: data.usage,
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Internal Server Error';
    return NextResponse.json(
      { error: message },
      { status: 500 }
    );
  }
}
