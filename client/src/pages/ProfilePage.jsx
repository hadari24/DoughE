import { useState, useEffect } from 'react';
import { getMyLikes, updateNote } from '../services/likesService';
import RecipeCard from '../components/RecipeCard';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

function ProfilePage() {
  const [liked, setLiked] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const uid = localStorage.getItem('userId');
  const firstName = localStorage.getItem('firstName') || 'there';
  const userRole = localStorage.getItem('userRole') || 'user';
  const isGuest = !uid || uid === 'guest';

  useEffect(() => {
    if (isGuest) { setLoading(false); return; }
    getMyLikes()
      .then(res => setLiked(res.data.data))
      .catch(() => setError('Failed to load your liked recipes'))
      .finally(() => setLoading(false));
  }, [isGuest]);

  const handleSaveNote = async (recipeId, note) => {
    await updateNote(recipeId, note);
    setLiked(list => list.map(r => (r.recipeId === recipeId ? { ...r, note } : r)));
  };

  return (
    <div className="page">
      <Navbar />
      <div className="dashboard-content">
        <h1>My Profile</h1>
        <p>Hello, {firstName} ({userRole})</p>

        <h2>Liked Recipes ♥</h2>
        {isGuest && <p>Log in with an account to like and save recipes here.</p>}
        {loading && <p>Loading...</p>}
        {error && <p className="error-message">{error}</p>}
        {!loading && !isGuest && liked.length === 0 && (
          <p>You haven't liked any recipes yet. Tap the ♥ on a recipe to save it here.</p>
        )}

        <div className="cards-grid">
          {liked.map(recipe => (
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
              initialLiked={true}
              author={recipe.author}
              note={recipe.note}
              onSaveNote={handleSaveNote}
            />
          ))}
        </div>
      </div>
      <Footer />
    </div>
  );
}

export default ProfilePage;
