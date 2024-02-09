class Recipe {
    constructor(name, publisher, image, minutes, description, cookingInstructions, ingredients, likes, tags) {
        this.name = name;
        this.publisher = publisher;
        this.image = image;
        this.minutes = minutes;
        this.description = description;
        this.cookingInstructions = cookingInstructions || []; // Inicializa como un array vacío si no se proporciona
        this.ingredients = ingredients || []; // Inicializa como un array vacío si no se proporciona
        this.likes = likes;
        this.tags = tags || []; // Inicializa como un array vacío si no se proporciona
    }
}

module.exports = Recipe;