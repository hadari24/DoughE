let recipesData =[
{ 
recipeId: 1,
title: "Classic Pizza Dough",
doughFamily: "yeast-based",
hydration: 65,
difficulty: "easy",
totalTimeMinutes: 120,
ingredients: [
{ name: "flour", amount: 500, unit: 'g' },
{ name: "water", amount: 325, unit: 'ml' },
{ name: "yeast", amount: 7, unit: 'g' },
{ name: "salt", amount: 10, unit: 'g' }
],
steps: ["Mix flour and salt", "Add water and yeast", "Knead 10 min", "Rise 1 hour", "Shape and bake 20-25 min at 180°C"],
createDate: "2026-03-01T10:00:00Z",
updateDate: "2026-03-01T10:00:00Z"
},
{
recipeId: 2,
title: "Sourdough Bread",
doughFamily: "sourdough",
hydration: 75,
difficulty: "hard",
totalTimeMinutes: 1440,
ingredients: [
{ name: "flour", amount: 500, unit: 'g' },
{ name: "water", amount: 375, unit: 'ml' },
{ name: "starter", amount: 100, unit: 'g' },
{ name: "salt", amount: 10, unit: 'g' }
],
steps: ["Mix starter and water", "Add flour", "Autolyse 30 min", "Bulk ferment 6h", "Shape", "Cold proof overnight", "Bake 30-35 min at 180°C"],
createDate: "2026-03-02T11:00:00Z",
updateDate: "2026-03-02T11:00:00Z"
},
{
recipeId: 3,
title: "Quick Pancakes",
doughFamily: "batter",
hydration: 90,
difficulty: "easy",
totalTimeMinutes: 20,
ingredients: [
{ name: "flour", amount: 250, unit: 'g' },
{ name: "milk", amount: 300, unit: 'ml' },
{ name: "egg", amount: 50, unit: 'g' },
{ name: "sugar", amount: 20, unit: 'g' }
],
steps: ["Whisk dry ingredients", "Add wet ingredients", "Cook 2 min each side"],
createDate: "2026-03-04T09:00:00Z",
updateDate: "2026-03-04T09:00:00Z"
},
{
recipeId: 4,
title: "Croissant Dough",
doughFamily: "laminated",
hydration: 50,
difficulty: "hard",
totalTimeMinutes: 720,
ingredients: [
{ name: "flour", amount: 500, unit: 'g' },
{ name: "butter", amount: 250, unit: 'g' },
{ name: "milk", amount: 250, unit: 'ml' },
{ name: "yeast", amount: 10, unit: 'g' }
],
steps: ["Make detrempe", "Chill", "Laminate 3 turns", "Shape and proof", "Bake for 15-20 min at 200°C"],
createDate: "2026-03-06T15:00:00Z",
updateDate: "2026-03-06T15:00:00Z"
},
{
recipeId: 5,
title: "Tortillas",
doughFamily: "flatbread",
hydration: 55,
difficulty: "easy",
totalTimeMinutes: 45,
ingredients: [
{ name: "flour", amount: 300, unit: 'g' },
{ name: "water", amount: 165, unit: 'ml' },
{ name: "oil", amount: 20, unit: 'ml' },
{ name: "salt", amount: 5, unit: 'g' }
],
steps: ["Mix", "Rest 20 min", "Roll thin", "Cook on hot pan 30s each side"],
createDate: "2026-03-08T12:00:00Z",
updateDate: "2026-03-08T12:00:00Z"
},
{
recipeId: 6,
title: "Brioche",
doughFamily: "enriched",
hydration: 60,
difficulty: "medium",
totalTimeMinutes: 600,
ingredients: [
{ name: "flour", amount: 500, unit: 'g' },
{ name: "butter", amount: 200, unit: 'g' },
{ name: "egg", amount: 200, unit: 'g' },
{ name: "milk", amount: 100, unit: 'ml' },
{ name: "sugar", amount: 50, unit: 'g' },
{ name: "yeast", amount: 10, unit: 'g' }
],
steps: ["Mix all but butter", "Knead 10 min", "Add butter gradually", "Cold ferment overnight", "Shape and bake for 25-30 min at 180°C"],
createDate: "2026-03-10T08:00:00Z",
updateDate: "2026-03-10T08:00:00Z"
}];

let nextRecipeId = 7;
const getAllRecipes = () => {
return recipesData;
}

let getRecipeById = (id) => {
return recipesData.find(r => r.recipeId === id);
}

let addRecipe = (recipe) => {
recipe.recipeId = nextRecipeId++;
recipe.createDate = new Date().toISOString();
recipe.updateDate = recipe.createDate;
recipesData.push(recipe);
return recipe;
}

let updateRecipe = (id, updatedFields) => {
let recipe = getRecipeById(id);
if (!recipe) return null;
Object.assign(recipe, updatedFields);
recipe.updateDate = new Date().toISOString();
return recipe;
}

let deleteRecipe = (id) => {
let index = recipesData.findIndex(r => r.recipeId === id);
if (index === -1) return null;
const [deletedRecipe] = recipesData.splice(index, 1);
return deletedRecipe;
}

module.exports = { getAllRecipes, getRecipeById, addRecipe, updateRecipe, deleteRecipe };