import { useState, useRef, useEffect } from 'react';
import { askAssistant } from '../services/aiService';
import { getAiContext } from '../services/aiContext';
import logo from '../logo.png';

function ChatWidget() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState([
    { role: 'ai', text: "Hi! I'm the Chef. Ask me anything about baking - and if you have a recipe open, I'll help with that one." },
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const bodyRef = useRef(null);

  useEffect(() => {
    if (bodyRef.current) bodyRef.current.scrollTop = bodyRef.current.scrollHeight;
  }, [messages, open]);

  const send = async (e) => {
    e.preventDefault();
    const text = input.trim();
    if (!text || loading) return;
    setInput('');
    setMessages((m) => [...m, { role: 'user', text }]);
    setLoading(true);
    try {
      const res = await askAssistant(text, getAiContext());
      setMessages((m) => [...m, { role: 'ai', text: res.data.data.answer }]);
    } catch (err) {
      const msg = err.response?.data?.error?.message || 'Something went wrong.';
      setMessages((m) => [...m, { role: 'ai', text: 'Sorry - ' + msg }]);
    } finally {
      setLoading(false);
    }
  };

  const S = styles;

  return (
    <div style={S.wrap}>
      {open && (
        <div style={S.panel}>
          <div style={S.header}>
            <span style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <img src={logo} alt="" style={S.logoImg} /> Ask the Chef
            </span>
            <button style={S.close} onClick={() => setOpen(false)} aria-label="Close">×</button>
          </div>
          <div style={S.body} ref={bodyRef}>
            {messages.map((m, i) => (
              <div key={i} style={{ ...S.row, justifyContent: m.role === 'user' ? 'flex-end' : 'flex-start' }}>
                <div style={{ ...S.bubble, ...(m.role === 'user' ? S.user : S.ai) }}>{m.text}</div>
              </div>
            ))}
            {loading && <div style={{ ...S.row, justifyContent: 'flex-start' }}><div style={{ ...S.bubble, ...S.ai }}>Thinking…</div></div>}
          </div>
          <form style={S.inputRow} onSubmit={send}>
            <input
              style={S.input}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask about baking…"
            />
            <button style={S.sendBtn} type="submit" disabled={loading}>Send</button>
          </form>
        </div>
      )}

      {!open && (
        <button style={S.fab} onClick={() => setOpen(true)}>
          <img src={logo} alt="" style={S.logoImg} /> Ask the Chef
        </button>
      )}
    </div>
  );
}

const styles = {
  wrap: { position: 'fixed', right: 20, bottom: 20, zIndex: 1000, fontFamily: 'inherit' },
  logoImg: { width: 24, height: 24, borderRadius: '50%', objectFit: 'cover', background: 'white' },
  fab: {
    display: 'flex', alignItems: 'center', gap: 8, background: 'var(--accent)', color: 'var(--accent-contrast)',
    border: 'none', borderRadius: 30, padding: '12px 18px', fontSize: 15, fontWeight: 600,
    cursor: 'pointer', boxShadow: '0 4px 14px rgba(0,0,0,0.25)',
  },
  panel: {
    width: 340, height: 460, background: 'var(--chat-bg)', borderRadius: 14, overflow: 'hidden',
    display: 'flex', flexDirection: 'column', boxShadow: '0 8px 30px rgba(0,0,0,0.3)',
  },
  header: {
    background: 'var(--accent)', color: 'var(--accent-contrast)', padding: '12px 14px', fontWeight: 700,
    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
  },
  close: { background: 'transparent', border: 'none', color: 'var(--accent-contrast)', fontSize: 22, cursor: 'pointer', lineHeight: 1 },
  body: { flex: 1, padding: 12, overflowY: 'auto', background: 'var(--chat-body)' },
  row: { display: 'flex', marginBottom: 8 },
  bubble: { maxWidth: '80%', padding: '8px 12px', borderRadius: 14, fontSize: 14, lineHeight: 1.4, whiteSpace: 'pre-wrap' },
  user: { background: 'var(--accent)', color: 'var(--accent-contrast)', borderBottomRightRadius: 4 },
  ai: { background: 'var(--chat-ai-bubble)', color: 'var(--chat-ai-text)', borderBottomLeftRadius: 4 },
  inputRow: { display: 'flex', borderTop: '1px solid var(--chat-border)', padding: 8, gap: 6, background: 'var(--chat-bg)' },
  input: { flex: 1, border: '1px solid var(--chat-border)', borderRadius: 20, padding: '8px 12px', fontSize: 14, outline: 'none', background: 'var(--chat-bg)', color: 'inherit' },
  sendBtn: { background: 'var(--accent)', color: 'var(--accent-contrast)', border: 'none', borderRadius: 20, padding: '0 16px', fontWeight: 600, cursor: 'pointer' },
};

export default ChatWidget;
