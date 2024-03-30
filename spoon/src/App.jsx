import Axios from "axios";
import { useState, useEffect } from "react";
import RecipeTile from "./recipe-tile";
import "./App.css";

function App() {
  const [query, setQuery] = useState("");
  const [recipes, setRecipes] = useState([]);
  const [totalItems, setTotalItems] = useState(0);
  const [averageLikes, setAverageLikes] = useState(0);
  const [searchResult, setSearchResult] = useState([]);
  const [filteredRecipes, setFilteredRecipes] = useState([]);
  const [filterCriteria, setFilterCriteria] = useState("");
  const [minCalories, setMinCalories] = useState(50);
  const [maxCalories, setMaxCalories] = useState(800);
  const [caloriesMean, setCaloriesMean] = useState(0);
  const [caloriesMedian, setCaloriesMedian] = useState(0);
  const [caloriesMode, setCaloriesMode] = useState(0);

  const YOUR_API_KEY = "7944ff3629ea46a1b787a1dbbe6ee427";

  useEffect(() => {
    const apiUrl = `https://api.spoonacular.com/recipes/complexSearch?query=${query}&maxFat=25&number=10&${
      minCalories && maxCalories
        ? `minCalories=${minCalories}&maxCalories=${maxCalories}&`
        : ""
    }apiKey=${YOUR_API_KEY}`;

    getRecipeInfo(apiUrl);
  }, [query, minCalories, maxCalories]);

  const getRecipeInfo = async (apiUrl) => {
    try {
      const response = await Axios.get(apiUrl);
      setRecipes(response.data.results);
      setSearchResult(response.data.results);
      setTotalItems(response.data.totalResults);
      calculateAverageLikes(response.data.results);
      filterRecipes(response.data.results);
    } catch (error) {
      console.error("Error fetching recipes:", error);
    }
  };

  const calculateAverageLikes = (data) => {
    const validRecipes = data.filter((recipe) => recipe.likes !== undefined);
    if (validRecipes.length === 0) {
      setAverageLikes(0);
      return;
    }
    const totalLikes = validRecipes.reduce((acc, recipe) => acc + recipe.likes, 0);
    const avgLikes = totalLikes / validRecipes.length;
    setAverageLikes(avgLikes);
  };

  const onSubmit = (e) => {
    e.preventDefault();
    filterRecipes(searchResult);
  };

  const handleFilterChange = (e) => {
    setFilterCriteria(e.target.value);
    filterRecipes(searchResult);
  };

  const handleChange = (e) => {
    if (e.target.id === "minCal") {
      setMinCalories(parseInt(e.target.value));
    } else {
      setMaxCalories(parseInt(e.target.value));
    }
    calculateCaloriesStatistics();
  };

  const filterRecipes = (data) => {
    let filtered = data;
    if (filterCriteria) {
      filtered = data.filter((recipe) =>
        recipe.diet.includes(filterCriteria)
      );
    }
    filtered = filtered.filter(
      (recipe) =>
        recipe.calories >= minCalories && recipe.calories <= maxCalories
    );
    setFilteredRecipes(filtered);
  };

  const calculateCaloriesStatistics = () => {
    const caloriesArray = Array.from({ length: maxCalories - minCalories + 1 }, (_, i) => i + minCalories);

    // Calculate mean
    const mean = caloriesArray.reduce((acc, calories) => acc + calories, 0) / caloriesArray.length;
    setCaloriesMean(mean);

    // Calculate median
    const sortedCalories = caloriesArray.sort((a, b) => a - b);
    const middleIndex = Math.floor(sortedCalories.length / 2);
    const median = sortedCalories.length % 2 === 0 ? (sortedCalories[middleIndex - 1] + sortedCalories[middleIndex]) / 2 : sortedCalories[middleIndex];
    setCaloriesMedian(median);

    // Calculate mode
    const caloriesCountMap = {};
    let maxCount = 0;
    let mode = 0;
    for (const calories of caloriesArray) {
      caloriesCountMap[calories] = (caloriesCountMap[calories] || 0) + 1;
      if (caloriesCountMap[calories] > maxCount) {
        maxCount = caloriesCountMap[calories];
        mode = calories;
      }
    }
    setCaloriesMode(mode);
  };

  return (
    <div className="app">
      <h1 onClick={getRecipeInfo}>Food Recipe Plaza 🍔</h1>
      <form className="app__searchForm" onSubmit={onSubmit}>
        <input
          className="app__input"
          type="text"
          placeholder="Enter ingredient"
          autoComplete="off"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
        <button type="submit"> Submit </button>
      </form>
      <div className="calorie-filter"> 
        <h2>Calorie Filter</h2>
        <div className="slider-container">
          <label htmlFor="minCal">Min:</label>
          <input type="range" id="minCal" min="50" max="800" value={minCalories} onChange={handleChange} />

          <label htmlFor="maxCal">Max:</label>
          <input type="range" id="maxCal" min="50" max="800" value={maxCalories} onChange={handleChange} />
        </div>
        <p>Calories: {minCalories} - {maxCalories}</p>
      </div>
      <div>
        <h2>Summary Data Statistics</h2>
        <p>Total Items: {totalItems}</p>
        <p>Calories Mean: {caloriesMean}</p>
        <p>Calories Median: {caloriesMedian}</p>
        <p>Calories Mode: {caloriesMode}</p>
        
      </div>

      <div>
        <h2>Search Data</h2>
        {/* Render search data */}
        {filteredRecipes.map((recipe) => (
          <RecipeTile key={recipe.id} recipe={recipe} />
        ))}
      </div>
    </div>
  );
}

export default App;
