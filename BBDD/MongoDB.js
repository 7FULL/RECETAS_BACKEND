const { MongoClient, ServerApiVersion, ObjectId} = require('mongodb');
const User = require('../Models/User.js');
const Recipe = require('../Models/Recipe.js');

class MongoDB {
    constructor() {
        this.uri = "mongodb+srv://pi:678041577pP_p1h2g3pablo@cluster0.maizixh.mongodb.net/?retryWrites=true&w=majority";
        this.client = new MongoClient(this.uri, {
            serverApi: {
                version: ServerApiVersion.v1,
                strict: true,
                deprecationErrors: true,
            }
        });

        console.log("");
        console.log("Connecting to MongoDB...");
        console.log("");

        this.connect();
    }

    async connect() {
        try {
            await this.client.connect();
            await this.client.db("admin").command({ ping: 1 });
            console.log("");
            console.log("Connected successfully to MongoDB");
            console.log("");
        } catch (error) {
            console.error("Error connecting to MongoDB:", error);
        }
    }

    async close() {
        await this.client.close();

        console.log("Connection to MongoDB closed");
    }

    async getUserByEmail(email) {
        return await this.client.db("FULLRECETAS").collection("Users").findOne({email: email});
    }

    async createUser(user) {
        const newUser = new User(user.username, user.password, user.name, user.surname, user.email, user.phone, user.image, user.likes,user.recipes, user.followers);
        return await this.client.db("FULLRECETAS").collection("Users").insertOne(newUser);
    }

    async getUserByUsername(username) {
        return await this.client.db("FULLRECETAS").collection("Users").findOne({username : username});
    }

    async createRecipe(recipe) {
        return await this.client.db("FULLRECETAS").collection("Recipes").insertOne(recipe);
    }

    async getRecipeById(id) {
        const objectId = new ObjectId(id)

        //We get the recipe by its id, then we update the publisher using its id
        const recipe = await this.client.db("FULLRECETAS").collection("Recipes").findOne({_id : objectId});

        const publisherObjectId = new ObjectId(recipe.publisher);

        //We update the publisher
        recipe.publisher = await this.client.db("FULLRECETAS").collection("Users").findOne({_id: publisherObjectId});

        return recipe;
    }

    async getRecipesByUserId(userId) {
        return await this.client.db("FULLRECETAS").collection("Recipes").find({publisher : userId}).toArray();
    }

    async getRecipesByTag(tag) {
        return await this.client.db("FULLRECETAS").collection("Recipes").find({tags : tag}).toArray();
    }

    async getAllRecipes() {
        //We get all the recipes, then we update the publisher using its id
        const recipes = await this.client.db("FULLRECETAS").collection("Recipes").find().toArray();

        //We update the publisher
        for(let i = 0; i < recipes.length; i++){
            recipes[i].publisher = await this.client.db("FULLRECETAS").collection("Users").findOne({_id: recipes[i].publisher});
        }

        return recipes;
    }

    async getRecipesByIngredients(ingredients) {
        return await this.client.db("FULLRECETAS").collection("Recipes").find({ingredients : ingredients}).toArray();
    }

    async getTrendingRecipes() {
        //We get the top 5 recipes with more likes, then we update the publisher using its id
        const recipes = await this.client.db("FULLRECETAS").collection("Recipes").find().sort({likes: -1}).limit(6).toArray();

        //We update the publisher
        for(let i = 0; i < recipes.length; i++){
            recipes[i].publisher = await this.client.db("FULLRECETAS").collection("Users").findOne({_id: recipes[i].publisher});
        }

        return recipes;
    }

    async likeRecipe(recipeId, userId) {
        const objectId = new ObjectId(recipeId);
        const userObjectId = new ObjectId(userId);

        //We check if the user has already liked the recipe
        const user = await this.client.db("FULLRECETAS").collection("Users").findOne({_id: userObjectId});

        if(user.likes.includes(recipeId)){
            return new Recipe();
        }

        //We add the id of the recipe to the likes array of the user
        await this.client.db("FULLRECETAS").collection("Users").updateOne({_id: userObjectId}, {$push: {likes: recipeId}});

        //We add 1 to the number of likes of the recipe
        return await this.client.db("FULLRECETAS").collection("Recipes").updateOne({_id: objectId}, {$inc: {likes: 1}});
    }

    async unlikeRecipe(recipeId, userId) {
        const objectId = new ObjectId(recipeId);
        const userObjectId = new ObjectId(userId);

        //We check if the user has already liked the recipe
        const user = await this.client.db("FULLRECETAS").collection("Users").findOne({_id: userObjectId});
        if(!user.likes.includes(recipeId)){
            return new Recipe();
        }

        //We remove the id of the recipe from the likes array of the user
        await this.client.db("FULLRECETAS").collection("Users").updateOne({_id: userObjectId}, {$pull: {likes: recipeId}});

        //We remove 1 to the number of likes of the recipe
        return await this.client.db("FULLRECETAS").collection("Recipes").updateOne({_id: objectId}, {$inc: {likes: -1}});
    }

    async getLikesRecipesByUserId(email) {
        //we get the recipes liked by the user
        const user = await this.getUserByEmail(email)

        //We get the recipes that are in the likes array of the user ( the likes array contains the ids of the recipes in a string format so we need to convert them to ObjectId)
        const recipes = await this.client.db("FULLRECETAS").collection("Recipes").find({_id: {$in: user.likes.map(id => new ObjectId(id))}}).toArray();

        //We update the publisher
        for(let i = 0; i < recipes.length; i++){
            recipes[i].publisher = await this.client.db("FULLRECETAS").collection("Users").findOne({_id: recipes[i].publisher});
        }

        return recipes;
    }

    async getAllTags() {
        //We get all the tags
        return await this.client.db("FULLRECETAS").collection("Tags").find().toArray();
    }
}

module.exports = {
    MongoDB
}
