import { useState, useEffect } from 'react';
import RecipeComments from './RecipeComments';
import { setAiContext, clearAiContext } from '../services/aiContext';
import { likeRecipe, unlikeRecipe } from '../services/likesService';

const familyEmoji = {
  'yeast-based': '🍕',
  'sourdough': '🍞',
  'batter': '🥞',
  'laminated': '🥐',
  'flatbread': '🫓',
  'enriched': '🍰'
};

function RecipeCard({ recipeId, title, doughFamily, difficulty, totalTimeMinutes, hydration, ingredients, steps, initialLiked = false, authorId, author, onEdit, onDelete, note = '', onSaveNote }) {
  const [open, setOpen] = useState(false);
  const [liked, setLiked] = useState(initialLiked);
  const [noteText, setNoteText] = useState(note || '');
  const [editingNote, setEditingNote] = useState(!(note && note.trim()));
  const [savingNote, setSavingNote] = useState(false);
  const [noteError, setNoteError] = useState('');

  const role = localStorage.getItem('userRole');
  const uid = parseInt(localStorage.getItem('userId'));
  const canEdit = !!onEdit && (role === 'admin' || (role === 'manager' && authorId === uid));
  const canDelete = !!onDelete && role === 'admin';

  const handleEdit = (e) => {
    e.stopPropagation();
    setOpen(false);
    onEdit({ recipeId, title, doughFamily, difficulty, hydration, totalTimeMinutes, ingredients, steps, authorId });
  };

  const handleDelete = async (e) => {
    e.stopPropagation();
    if (!window.confirm(`Delete "${title}"? This cannot be undone.`)) return;
    try {
      await onDelete(recipeId);
      setOpen(false);
    } catch {
      alert('Failed to delete recipe');
    }
  };

  const saveNote = async () => {
    setSavingNote(true);
    setNoteError('');
    try {
      await onSaveNote(recipeId, noteText);
      setEditingNote(false);
    } catch {
      setNoteError('Could not save your note. Make sure you are logged in and the server is running.');
    } finally {
      setSavingNote(false);
    }
  };

  useEffect(() => { setLiked(initialLiked); }, [initialLiked]);

  useEffect(() => {
    if (open) {
      const ingList = (ingredients || []).map((i) => `${i.amount || ''}${i.unit || ''} ${i.name}`).join(', ');
      setAiContext(
        `The user is viewing the recipe "${title}". ` +
        `Dough family: ${doughFamily}. Difficulty: ${difficulty}. Total time: ${totalTimeMinutes} min. Hydration: ${hydration}%. ` +
        `Ingredients: ${ingList}. Steps: ${(steps || []).join(' | ')}.`
      );
    } else {
      clearAiContext();
    }
    return () => clearAiContext();
  }, [open, title, doughFamily, difficulty, totalTimeMinutes, hydration, ingredients, steps]);

  const toggleLike = async (e) => {
    e.stopPropagation();
    const next = !liked;
    setLiked(next);
    try {
      if (next) await likeRecipe(recipeId);
      else await unlikeRecipe(recipeId);
    } catch {
      setLiked(!next); // revert if it failed (e.g. guest)
    }
  };

  const Heart = ({ big }) => (
    <span
      onClick={toggleLike}
      title={liked ? 'Unlike' : 'Like'}
      style={{ cursor: 'pointer', fontSize: big ? 26 : 22, color: liked ? '#e0245e' : '#cbb8a8', userSelect: 'none', lineHeight: 1 }}
    >
      ♥
    </span>
  );

  return (
    <>
      <div className="recipe-card" style={{ position: 'relative' }} onClick={() => setOpen(true)}>
        <span style={{ position: 'absolute', top: 8, right: 12 }}><Heart /></span>
        <div className="recipe-card-emoji">{familyEmoji[doughFamily] || '🍽️'}</div>
        <h3>{title}</h3>
        <p>Family: {doughFamily}</p>
        <p>Difficulty: {difficulty}</p>
        <p>Time: {totalTimeMinutes} min</p>
        {author && <p style={{ fontStyle: 'italic', opacity: 0.85 }}>By {author}</p>}
        <p className="card-hint">Click to view full recipe</p>
      </div>

      {open && (
        <div className="modal-overlay" onClick={() => setOpen(false)}>
          <div className="modal-box" onClick={e => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12 }}>
              <h2 style={{ margin: 0 }}>{title}</h2>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                {canEdit && (
                  <button
                    onClick={handleEdit}
                    style={{ background: 'var(--accent)', color: 'var(--accent-contrast)', border: 'none', borderRadius: 16, padding: '5px 14px', fontWeight: 600, cursor: 'pointer' }}
                  >
                    Edit
                  </button>
                )}
                {canDelete && (
                  <button
                    onClick={handleDelete}
                    style={{ background: '#c0492f', color: 'white', border: 'none', borderRadius: 16, padding: '5px 14px', fontWeight: 600, cursor: 'pointer' }}
                  >
                    Delete
                  </button>
                )}
                <Heart big />
              </div>
            </div>
            <p>Family: {doughFamily}</p>
            <p>Difficulty: {difficulty}</p>
            <p>Time: {totalTimeMinutes} min</p>
            <p>Hydration: {hydration}%</p>
            {author && <p style={{ fontStyle: 'italic', opacity: 0.85 }}>Created by {author}</p>}
            <h3>Ingredients</h3>
            <ul>
              {ingredients.map((ing, i) => (
                <li key={i}>{ing.amount} {ing.unit} {ing.name}</li>
              ))}
            </ul>
            <h3>Steps</h3>
            <ol>
              {steps.map((step, i) => (
                <li key={i}>{step}</li>
              ))}
            </ol>
            {onSaveNote && (
              <div style={{ marginTop: 16, borderTop: '1px solid #e5ddd3', paddingTop: 12, textAlign: 'left' }}>
                <h3 style={{ margin: '0 0 6px', color: 'var(--accent)' }}>My Notes</h3>
                {editingNote ? (
                  <>
                    <textarea
                      value={noteText}
                      onChange={e => setNoteText(e.target.value)}
                      placeholder="Add your personal notes for this saved recipe..."
                      style={{ width: '100%', boxSizing: 'border-box', minHeight: 70, border: '1px solid #d8cfc4', borderRadius: 8, padding: '8px 10px', fontSize: 14, outline: 'none' }}
                    />
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginTop: 6 }}>
                      <button
                        type="button"
                        onClick={saveNote}
                        disabled={savingNote}
                        style={{ background: 'var(--accent)', color: 'var(--accent-contrast)', border: 'none', borderRadius: 16, padding: '6px 16px', fontWeight: 600, cursor: 'pointer' }}
                      >
                        {savingNote ? 'Saving...' : 'Save note'}
                      </button>
                      {note && note.trim() && (
                        <button
                          type="button"
                          onClick={() => { setNoteText(note); setEditingNote(false); setNoteError(''); }}
                          style={{ background: 'transparent', border: 'none', color: '#9b8b7a', cursor: 'pointer', textDecoration: 'underline' }}
                        >
                          Cancel
                        </button>
                      )}
                    </div>
                    {noteError && <p className="error-message" style={{ marginTop: 6 }}>{noteError}</p>}
                  </>
                ) : (
                  <>
                    <p style={{ whiteSpace: 'pre-wrap', background: '#faf6f1', border: '1px solid #eee2d6', borderRadius: 8, padding: '8px 11px', margin: 0 }}>
                      {noteText || <span style={{ opacity: 0.6 }}>No note yet.</span>}
                    </p>
                    <button
                      type="button"
                      onClick={() => setEditingNote(true)}
                      style={{ marginTop: 6, background: 'transparent', border: '1px solid var(--accent)', color: 'var(--accent)', borderRadius: 16, padding: '5px 14px', fontWeight: 600, cursor: 'pointer' }}
                    >
                      Edit note
                    </button>
                  </>
                )}
              </div>
            )}
            <RecipeComments recipeId={recipeId} />
            <button onClick={() => setOpen(false)}>Close</button>
          </div>
        </div>
      )}
    </>
  );
}

export default RecipeCard;
