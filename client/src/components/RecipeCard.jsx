import { useState } from 'react';

const familyEmoji = {
  'yeast-based': '🍕',
  'sourdough': '🍞',
  'butter': '🥞',
  'laminated': '🥐',
  'flatbread': '🫓',
  'enriched': '🍰'
};

function RecipeCard({ recipeId, title, doughFamily, difficulty, totalTimeMinutes, hydration, ingredients, steps }) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <div className="recipe-card" onClick={() => setOpen(true)}>
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
            <h2>{title}</h2>
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
            <button onClick={() => setOpen(false)}>Close</button>
          </div>
        </div>
      )}
    </>
  );
}

export default RecipeCard;