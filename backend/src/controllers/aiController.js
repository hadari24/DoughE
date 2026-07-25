// AI assistant powered by Groq (free, OpenAI-compatible API).
// The API key stays on the server (process.env.GROQ_API_KEY) and is never sent to the frontend.

const success = (res, data, code = 200) => res.status(code).json({ success: true, data, error: null });
const error = (res, code, message, details = {}, status = 400) =>
  res.status(status).json({ success: false, data: null, error: { code, message, details } });

// POST /api/ai/assistant   body: { prompt, context? }
async function assistant(req, res) {
  try {
    const { prompt, context } = req.body;
    if (!prompt || !prompt.trim()) {
      return error(res, 'VALIDATION_ERROR', 'A prompt is required', { field: 'prompt' }, 400);
    }
    if (!process.env.GROQ_API_KEY) {
      return error(res, 'AI_CONFIG_ERROR', 'GROQ_API_KEY is not set on the server', {}, 500);
    }

    let system =
      'You are Dough-E, the "Chef" - a friendly expert baking assistant. ' +
      'Help with bread, dough, hydration, fermentation, baking techniques, substitutions, and recipes. ' +
      'Be concise, warm, and practical. If asked something unrelated to baking, gently steer back to baking.';

    if (context && context.trim()) {
      system += '\n\nContext - what the user is currently looking at:\n' + context +
        '\n\nIf the question relates to this recipe, tailor your answer to it.';
    }

    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.GROQ_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'llama-3.3-70b-versatile',
        messages: [
          { role: 'system', content: system },
          { role: 'user', content: prompt },
        ],
        temperature: 0.7,
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      console.error('[AI] error:', JSON.stringify(data));
      return error(res, 'AI_ERROR', 'Failed to get a response from the AI provider',
        { detail: data.error?.message || `HTTP ${response.status}` }, 500);
    }

    const answer = data.choices?.[0]?.message?.content || '(no answer)';
    return success(res, { answer }, 200);
  } catch (e) {
    console.error('[AI] error:', e.message);
    return error(res, 'AI_ERROR', 'Failed to get a response from the AI provider', { detail: e.message }, 500);
  }
}

module.exports = { assistant };
