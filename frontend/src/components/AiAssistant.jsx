import { useState } from 'react';
import { askAssistant } from '../services/aiService';

function AiAssistant() {
  const [prompt, setPrompt] = useState('');
  const [answer, setAnswer] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const ask = async (e) => {
    e.preventDefault();
    if (!prompt.trim()) return;
    setLoading(true); setError(''); setAnswer('');
    try {
      const res = await askAssistant(prompt);
      setAnswer(res.data.data.answer);
    } catch (err) {
      setError(err.response?.data?.error?.message || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="ai-assistant">
      <h3>Ask Dough-E</h3>
      <form onSubmit={ask}>
        <textarea value={prompt} onChange={(e) => setPrompt(e.target.value)}
          placeholder="e.g. What can I use instead of yeast?" rows={3} />
        <button type="submit" disabled={loading}>{loading ? 'Thinking...' : 'Ask'}</button>
      </form>
      {error && <p className="error-message">{error}</p>}
      {answer && <div className="ai-answer"><p>{answer}</p></div>}
    </div>
  );
}

export default AiAssistant;
