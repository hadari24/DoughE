import { useState, useMemo } from 'react';

const COLUMNS = [
  { key: 'title', label: 'Title' },
  { key: 'doughFamily', label: 'Family' },
  { key: 'difficulty', label: 'Difficulty' },
  { key: 'totalTimeMinutes', label: 'Time (min)' },
];

function RecipesTable({ recipes }) {
  const [sortKey, setSortKey] = useState(null);
  const [sortAsc, setSortAsc] = useState(true);

  const handleSort = (key) => {
    if (sortKey === key) {
      setSortAsc(!sortAsc);
    } else {
      setSortKey(key);
      setSortAsc(true);
    }
  };

  const sortedRecipes = useMemo(() => {
    if (!sortKey) return recipes;
    const sorted = [...recipes].sort((a, b) => {
      const valA = a[sortKey];
      const valB = b[sortKey];
      if (typeof valA === 'number' && typeof valB === 'number') {
        return valA - valB;
      }
      return String(valA).localeCompare(String(valB));
    });
    return sortAsc ? sorted : sorted.reverse();
  }, [recipes, sortKey, sortAsc]);

  return (
    <table>
      <thead>
        <tr>
          {COLUMNS.map(col => (
            <th
              key={col.key}
              onClick={() => handleSort(col.key)}
              style={{ cursor: 'pointer', userSelect: 'none' }}
            >
              {col.label}
              {sortKey === col.key ? (sortAsc ? ' ▲' : ' ▼') : ''}
            </th>
          ))}
        </tr>
      </thead>
      <tbody>
        {sortedRecipes.map(recipe => (
          <tr key={recipe.recipeId}>
            <td>{recipe.title}</td>
            <td>{recipe.doughFamily}</td>
            <td>{recipe.difficulty}</td>
            <td>{recipe.totalTimeMinutes}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

export default RecipesTable;
