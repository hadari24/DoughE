import { useState, useEffect } from 'react';
import { getRecipes } from '../services/recipesService';
import RecipeCard from '../components/RecipeCard';
import RecipesTable from '../components/RecipesTable';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

function DashboardPage() {
  const [recipes, setRecipes] = useState([]);
  const [search, setSearch] = useState('');
  const [showCards, setShowCards] = useState(true);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    getRecipes()
      .then(res => setRecipes(res.data.data))
      .catch(() => setError('Failed to load recipes'))
      .finally(() => setLoading(false));
  }, []);

  const [familyFilter, setFamilyFilter] = useState('');
  const [difficultyFilter, setDifficultyFilter] = useState('');
  const [minTime, setMinTime] = useState('');
  const [maxTime, setMaxTime] = useState('');
  
  const filtered = recipes.filter(r => {
  const matchesSearch = r.title.toLowerCase().includes(search.toLowerCase());
  const matchesFamily = familyFilter ? r.doughFamily === familyFilter : true;
  const matchesDifficulty = difficultyFilter ? r.difficulty === difficultyFilter : true;
  const matchesMin = minTime ? r.totalTimeMinutes >= parseInt(minTime) : true;
  const matchesMax = maxTime ? r.totalTimeMinutes <= parseInt(maxTime) : true;
  return matchesSearch && matchesFamily && matchesDifficulty && matchesMin && matchesMax;
});

  return (
    <div className="page">
      <Navbar />
      <div className="dashboard-content">
        <div className="dashboard-header">
        <button className="toggle-button" onClick={() => setShowCards(!showCards)}>
          {showCards ? 'Hide Cards' : 'Show Cards'}
        </button>
      </div>
        <input
          className="search-input"
          type="text"
          placeholder="Search recipes..."
          value={search}
          onChange={e => setSearch(e.target.value)}
        />

        {loading && <p>Loading...</p>}
        {error && <p className="error-message">{error}</p>}
        {!loading && filtered.length === 0 && <p>No recipes found.</p>}
      <div className="filters">
        <select value={familyFilter} onChange={e => setFamilyFilter(e.target.value)}>
          <option value="">All Families</option>
          <option value="yeast-based">Yeast-based</option>
          <option value="sourdough">Sourdough</option>
          <option value="butter">Butter</option>
          <option value="laminated">Laminated</option>
          <option value="flatbread">Flatbread</option>
          <option value="enriched">Enriched</option>
        </select>

      <select value={difficultyFilter} onChange={e => setDifficultyFilter(e.target.value)}>
        <option value="">All Difficulties</option>
        <option value="easy">Easy</option>
        <option value="medium">Medium</option>
        <option value="hard">Hard</option>
        </select>

  <input
    type="number"
    placeholder="Min time (min)"
    value={minTime}
    onChange={e => setMinTime(e.target.value)}
  />
  <input
    type="number"
    placeholder="Max time (min)"
    value={maxTime}
    onChange={e => setMaxTime(e.target.value)}
  />
</div>
        <h1>All Recipes</h1>
        {showCards && (
        <div className="cards-grid">
          {filtered.map(recipe => (
            <RecipeCard
              key={recipe.recipeId}
              recipeId={recipe.recipeId}
              title={recipe.title}
              doughFamily={recipe.doughFamily}
              difficulty={recipe.difficulty}
              totalTimeMinutes={recipe.totalTimeMinutes}
              hydration={recipe.hydration}
              ingredients={recipe.ingredients}
              steps={recipe.steps}
            />
          ))}
        </div>
        )}
        <div style={{ height: '10px' }} />
        <div className="dashboard-header"></div>
        <h1>Recipes Table</h1>
        <p className="table-hint">Click a column title to sort</p>        
        <RecipesTable recipes={filtered} />
      </div>
      <Footer />
    </div>
  );
}

export default DashboardPage;