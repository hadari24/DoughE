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

function RecipeCard({ recipeId, title, doughFamily, difficulty, totalTimeMinutes, hydration, ingredients, steps, initialLiked = false }) {
  const [open, setOpen] = useState(false);
  const [liked, setLiked] = useState(initialLiked);

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
        <p className="card-hint">Click to view full recipe</p>
      </div>

      {open && (
        <div className="modal-overlay" onClick={() => setOpen(false)}>
          <div className="modal-box" onClick={e => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12 }}>
              <h2 style={{ margin: 0 }}>{title}</h2>
              <Heart big />
            </div>
            <p>Family: {doughFamily}</p>
            <p>Difficulty: {difficulty}</p>
            <p>Time: {totalTimeMinutes} min</p>
            <p>Hydration: {hydration}%</p>
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
            <RecipeComments recipeId={recipeId} />
            <button onClick={() => setOpen(false)}>Close</button>
          </div>
        </div>
      )}
    </>
  );
}

export default RecipeCard;
