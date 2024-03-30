import React from "react";

export default function RecipeTile({ recipe }) {
  return (
    recipe.image.match(/\.(jpeg|jpg|gif|png)$/) != null && (
      <div className="recipeTile" onClick={() => window.open(recipe.sourceUrl)}>
        <img className="recipeTile__img" src={recipe.image} alt={recipe.title} />
        <p className="recipeTile__name">{recipe.title}</p>
      </div>
    )
  );
}
