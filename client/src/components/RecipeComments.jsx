import { useState, useEffect, useRef } from 'react';
import socket from '../services/socket';
import { getComments } from '../services/recipesService';

function Stars({ value, onSelect, size = 18, readOnly = false }) {
  const [hover, setHover] = useState(0);
  return (
    <span style={{ display: 'inline-flex', gap: 2 }}>
      {[1, 2, 3, 4, 5].map((n) => (
        <span
          key={n}
          onClick={readOnly ? undefined : () => onSelect(n)}
          onMouseEnter={readOnly ? undefined : () => setHover(n)}
          onMouseLeave={readOnly ? undefined : () => setHover(0)}
          style={{
            cursor: readOnly ? 'default' : 'pointer',
            fontSize: size,
            lineHeight: 1,
            color: (hover || value) >= n ? '#f5b301' : '#d9ccbf',
          }}
        >
          ★
        </span>
      ))}
    </span>
  );
}

function RecipeComments({ recipeId }) {
  const [comments, setComments] = useState([]);
  const [text, setText] = useState('');
  const [rating, setRating] = useState(0);
  const [online, setOnline] = useState(0);
  const listRef = useRef(null);

  const userId = localStorage.getItem('userId');
  const userName = localStorage.getItem('userName') || 'Guest';

  useEffect(() => {
    let active = true;

    getComments(recipeId)
      .then((res) => { if (active) setComments(res.data.data); })
      .catch(() => {});

    socket.emit('recipe:join', { recipeId });

    const onAdded = (comment) => setComments((prev) => [...prev, comment]);
    const onPresence = ({ online }) => setOnline(online);

    socket.on('comment:added', onAdded);
    socket.on('presence:update', onPresence);

    return () => {
      active = false;
      socket.off('comment:added', onAdded);
      socket.off('presence:update', onPresence);
    };
  }, [recipeId]);

  useEffect(() => {
    if (listRef.current) listRef.current.scrollTop = listRef.current.scrollHeight;
  }, [comments]);

  const send = (e) => {
    e.preventDefault();
    if (!text.trim()) return;
    socket.emit('comment:new', { recipeId, userId, userName, text, rating });
    setText('');
    setRating(0);
  };

  const rated = comments.filter((c) => c.rating);
  const avg = rated.length ? (rated.reduce((s, c) => s + c.rating, 0) / rated.length).toFixed(1) : null;

  const S = styles;
  return (
    <div style={S.wrap}>
      <div style={S.header}>
        <span style={S.title}>Live Comments</span>
        <span style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          {avg && <span style={S.avg}>★ {avg} <span style={S.avgCount}>({rated.length})</span></span>}
          <span style={S.badge}><span style={S.dot} /> {online} online</span>
        </span>
      </div>

      <div style={S.list} ref={listRef}>
        {comments.length === 0 && <p style={S.empty}>No comments yet. Be the first!</p>}
        {comments.map((c, i) => (
          <div key={c.commentId || i} style={S.item}>
            <div style={S.avatar}>{(c.userName || 'G').charAt(0).toUpperCase()}</div>
            <div style={S.bubble}>
              <div style={S.nameRow}>
                <span style={S.name}>{c.userName || 'Guest'}</span>
                {c.rating ? <Stars value={c.rating} readOnly size={14} /> : null}
              </div>
              <div style={S.text}>{c.text}</div>
            </div>
          </div>
        ))}
      </div>

      <form style={S.form} onSubmit={send}>
        <div style={S.rateRow}>
          <span style={S.rateLabel}>Your rating:</span>
          <Stars value={rating} onSelect={setRating} />
          {rating > 0 && (
            <button type="button" style={S.clear} onClick={() => setRating(0)}>clear</button>
          )}
        </div>
        <div style={S.inputRow}>
          <input
            style={S.input}
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Write a comment..."
          />
          <button style={S.send} type="submit">Send</button>
        </div>
      </form>
    </div>
  );
}

const styles = {
  wrap: { marginTop: 18, borderTop: '1px solid #e5ddd3', paddingTop: 14, textAlign: 'left' },
  header: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10, flexWrap: 'wrap', gap: 6 },
  title: { fontSize: 17, fontWeight: 700, color: 'var(--accent)' },
  avg: { fontSize: 13, fontWeight: 700, color: '#f5b301' },
  avgCount: { color: '#9b8b7a', fontWeight: 400 },
  badge: { display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 12, color: '#4a7c3a', background: '#eaf5e6', padding: '3px 9px', borderRadius: 12, fontWeight: 600 },
  dot: { width: 8, height: 8, borderRadius: '50%', background: '#4caf50', display: 'inline-block' },
  list: { maxHeight: 190, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 8, paddingRight: 4 },
  empty: { color: '#9b8b7a', fontStyle: 'italic', margin: '6px 0' },
  item: { display: 'flex', gap: 8, alignItems: 'flex-start' },
  avatar: { flexShrink: 0, width: 30, height: 30, borderRadius: '50%', background: 'var(--accent)', color: 'var(--accent-contrast)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: 13 },
  bubble: { background: '#faf6f1', border: '1px solid #eee2d6', borderRadius: 12, borderTopLeftRadius: 4, padding: '7px 11px', maxWidth: '85%' },
  nameRow: { display: 'flex', alignItems: 'center', gap: 8, marginBottom: 2 },
  name: { fontSize: 12, fontWeight: 700, color: 'var(--accent)' },
  text: { fontSize: 14, color: '#3a2a1a', lineHeight: 1.35, whiteSpace: 'pre-wrap', wordBreak: 'break-word' },
  form: { marginTop: 12 },
  rateRow: { display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 },
  rateLabel: { fontSize: 13, color: 'var(--accent)', fontWeight: 600 },
  clear: { background: 'transparent', border: 'none', color: '#9b8b7a', fontSize: 12, cursor: 'pointer', textDecoration: 'underline', padding: 0 },
  inputRow: { display: 'flex', gap: 8 },
  input: { flex: 1, border: '1px solid #d8cfc4', borderRadius: 20, padding: '9px 14px', fontSize: 14, outline: 'none' },
  send: { background: 'var(--accent)', color: 'var(--accent-contrast)', border: 'none', borderRadius: 20, padding: '0 20px', fontWeight: 600, cursor: 'pointer' },
};

export default RecipeComments;
