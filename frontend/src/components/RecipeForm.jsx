import { useState } from 'react';
import { createRecipe, updateRecipe } from '../services/recipesService';

const FAMILIES = ['yeast-based', 'sourdough', 'batter', 'laminated', 'flatbread', 'enriched'];
const DIFFICULTIES = ['easy', 'medium', 'hard'];

// recipe = null -> create mode; recipe = {...} -> edit mode
function RecipeForm({ recipe, onClose, onSaved }) {
  const editing = !!recipe;

  const [title, setTitle] = useState(recipe?.title || '');
  const [doughFamily, setDoughFamily] = useState(recipe?.doughFamily || 'yeast-based');
  const [difficulty, setDifficulty] = useState(recipe?.difficulty || 'easy');
  const [hydration, setHydration] = useState(recipe?.hydration ?? '');
  const [totalTimeMinutes, setTotalTimeMinutes] = useState(recipe?.totalTimeMinutes ?? '');
  const [steps, setSteps] = useState((recipe?.steps || []).join('\n'));
  const [ingredients, setIngredients] = useState(
    recipe?.ingredients?.length ? recipe.ingredients.map(i => ({ ...i })) : [{ name: '', amount: '', unit: '' }]
  );
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  const setIng = (i, key, val) => setIngredients(list => list.map((row, idx) => idx === i ? { ...row, [key]: val } : row));
  const addIng = () => setIngredients(list => [...list, { name: '', amount: '', unit: '' }]);
  const removeIng = (i) => setIngredients(list => list.filter((_, idx) => idx !== i));

  const submit = async (e) => {
    e.preventDefault();
    if (!title.trim() || !doughFamily) return setError('Title and dough family are required');

    const payload = {
      title: title.trim(),
      doughFamily,
      difficulty,
      hydration: hydration === '' ? null : Number(hydration),
      totalTimeMinutes: totalTimeMinutes === '' ? null : Number(totalTimeMinutes),
      steps: steps.split('\n').map(s => s.trim()).filter(Boolean),
      ingredients: ingredients
        .filter(i => i.name.trim())
        .map(i => ({ name: i.name.trim(), amount: i.amount === '' ? null : Number(i.amount), unit: i.unit || '' })),
    };

    setSaving(true);
    setError('');
    try {
      if (editing) await updateRecipe(recipe.recipeId, payload);
      else await createRecipe(payload);
      onSaved();
      onClose();
    } catch (err) {
      setError(err.response?.data?.error?.message || 'Failed to save recipe');
    } finally {
      setSaving(false);
    }
  };

  const S = styles;
  return (
    <div style={S.overlay} onClick={onClose}>
      <div style={S.box} onClick={e => e.stopPropagation()}>
        <h2 style={{ marginTop: 0, color: 'var(--accent)' }}>{editing ? 'Edit Recipe' : 'Add Recipe'}</h2>
        <form onSubmit={submit}>
          <label style={S.label}>Title</label>
          <input style={S.input} value={title} onChange={e => setTitle(e.target.value)} placeholder="e.g. Focaccia" />

          <div style={S.row}>
            <div style={{ flex: 1 }}>
              <label style={S.label}>Dough family</label>
              <select style={S.input} value={doughFamily} onChange={e => setDoughFamily(e.target.value)}>
                {FAMILIES.map(f => <option key={f} value={f}>{f}</option>)}
              </select>
            </div>
            <div style={{ flex: 1 }}>
              <label style={S.label}>Difficulty</label>
              <select style={S.input} value={difficulty} onChange={e => setDifficulty(e.target.value)}>
                {DIFFICULTIES.map(d => <option key={d} value={d}>{d}</option>)}
              </select>
            </div>
          </div>

          <div style={S.row}>
            <div style={{ flex: 1 }}>
              <label style={S.label}>Hydration (%)</label>
              <input style={S.input} type="number" value={hydration} onChange={e => setHydration(e.target.value)} />
            </div>
            <div style={{ flex: 1 }}>
              <label style={S.label}>Total time (min)</label>
              <input style={S.input} type="number" value={totalTimeMinutes} onChange={e => setTotalTimeMinutes(e.target.value)} />
            </div>
          </div>

          <label style={S.label}>Ingredients</label>
          {ingredients.map((ing, i) => (
            <div key={i} style={S.ingRow}>
              <input style={{ ...S.input, flex: 2, margin: 0 }} placeholder="name" value={ing.name} onChange={e => setIng(i, 'name', e.target.value)} />
              <input style={{ ...S.input, flex: 1, margin: 0 }} type="number" placeholder="amount" value={ing.amount ?? ''} onChange={e => setIng(i, 'amount', e.target.value)} />
              <input style={{ ...S.input, flex: 1, margin: 0 }} placeholder="unit" value={ing.unit ?? ''} onChange={e => setIng(i, 'unit', e.target.value)} />
              <button type="button" style={S.removeBtn} onClick={() => removeIng(i)}>x</button>
            </div>
          ))}
          <button type="button" style={S.addIng} onClick={addIng}>+ add ingredient</button>

          <label style={S.label}>Steps (one per line)</label>
          <textarea style={{ ...S.input, minHeight: 90 }} value={steps} onChange={e => setSteps(e.target.value)} placeholder={'Mix\nRest\nBake'} />

          {error && <p className="error-message">{error}</p>}

          <div style={S.actions}>
            <button type="button" style={S.cancel} onClick={onClose}>Cancel</button>
            <button type="submit" style={S.save} disabled={saving}>{saving ? 'Saving...' : (editing ? 'Save changes' : 'Create recipe')}</button>
          </div>
        </form>
      </div>
    </div>
  );
}

const styles = {
  overlay: { position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1100, padding: 16 },
  box: { background: 'var(--chat-bg, #fff)', color: 'inherit', borderRadius: 14, padding: 22, width: 'min(560px, 96vw)', maxHeight: '90vh', overflowY: 'auto', boxShadow: '0 10px 40px rgba(0,0,0,0.35)' },
  label: { display: 'block', fontSize: 13, fontWeight: 600, color: 'var(--accent)', margin: '10px 0 4px' },
  input: { width: '100%', boxSizing: 'border-box', border: '1px solid #d8cfc4', borderRadius: 8, padding: '8px 10px', fontSize: 14, outline: 'none' },
  row: { display: 'flex', gap: 12 },
  ingRow: { display: 'flex', gap: 6, marginBottom: 6, alignItems: 'center' },
  removeBtn: { border: 'none', background: '#e0cfc2', color: '#6b4a2f', borderRadius: 6, width: 30, height: 30, cursor: 'pointer', fontWeight: 700 },
  addIng: { border: '1px dashed var(--accent)', background: 'transparent', color: 'var(--accent)', borderRadius: 8, padding: '6px 12px', cursor: 'pointer', marginTop: 4, fontWeight: 600 },
  actions: { display: 'flex', justifyContent: 'flex-end', gap: 10, marginTop: 18 },
  cancel: { background: '#e0cfc2', color: '#5a3d26', border: 'none', borderRadius: 20, padding: '9px 18px', fontWeight: 600, cursor: 'pointer' },
  save: { background: 'var(--accent)', color: 'var(--accent-contrast)', border: 'none', borderRadius: 20, padding: '9px 20px', fontWeight: 700, cursor: 'pointer' },
};

export default RecipeForm;
