const { MongoClient, ServerApiVersion, ObjectId} = require('mongodb');
const User = require('../models/User.js');
const Recipe = require('../models/Recipe.js');
const ws = require('fs');

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
        const newUser = new User(user.username, user.password, user.name, user.surname, user.email, user.image, user.likes,user.recipes, user.followers);
        return await this.client.db("FULLRECETAS").collection("Users").insertOne(newUser);
    }

    async addRecipeToUser(userId, recipe) {
        const objectId = new ObjectId(userId);

        //We add the id of the recipe to the recipes array of the user
        return await this.client.db("FULLRECETAS").collection("Users").updateOne({_id: objectId}, {$push: {recipes: recipe}});
    }

    async followUser(userToFollow, userFollowing) {
        const objectId = new ObjectId(userFollowing);
        const followedObjectId = new ObjectId(userToFollow);

        //We add the id of the followed user to the following array of the user
        await this.client.db("FULLRECETAS").collection("Users").updateOne({_id: objectId}, {$push: {following: followedObjectId}});

        //We add the id of the user to the followers array of the followed user
        return await this.client.db("FULLRECETAS").collection("Users").updateOne({_id: followedObjectId}, {$push: {followers: objectId}});
    }

    async unfollowUser(userToFollow, userFollowing) {
        const objectId = new ObjectId(userFollowing);
        const followedObjectId = new ObjectId(userToFollow);

        //We remove the id of the followed user from the following array of the user
        await this.client.db("FULLRECETAS").collection("Users").updateOne({_id: objectId}, {$pull: {following: followedObjectId}});

        //We remove the id of the user from the followers array of the followed user
        return await this.client.db("FULLRECETAS").collection("Users").updateOne({_id: followedObjectId}, {$pull: {followers: objectId}});
    }

    async getUserById(id) {
        const objectId = new ObjectId(id);
        return await this.client.db("FULLRECETAS").collection("Users").findOne({_id: objectId});
    }

    async deleteRecipe(recipe) {
        //We delete the recipe photo from the directory /public/images/recipes
        ws.unlinkSync(`./public/images/recipes/${recipe._id}.png`);

        const objectId = new ObjectId(recipe._id);
        return await this.client.db("FULLRECETAS").collection("Recipes").deleteOne({_id: objectId});
    }

    async getUserByUsername(username) {
        return await this.client.db("FULLRECETAS").collection("Users").findOne({username : username});
    }

    async createRecipe(recipe, isEdit, image) {
        // We save the recipe url in the database if the _id is not null
        if(isEdit){
            const originalId = recipe._id;
            const objectId = new ObjectId(recipe._id);

            delete recipe._id;

            // We save the recipe photo in the directory /public/images/recipes
            ws.writeFileSync(`./public/images/recipes/${originalId}.png`, image);

            // We save the url of the image in the recipe object
            recipe.image = `http://10.0.2.2:3000/images/recipes/${originalId}.png`;

            return await this.client.db("FULLRECETAS").collection("Recipes").updateOne({_id: objectId}, {$set: recipe});
        }else{
            recipe._id = new ObjectId();

            // We save the recipe photo in the directory /public/images/recipes
            ws.writeFileSync(`./public/images/recipes/${recipe._id}.png`, image);

            // We save the url of the image in the recipe object
            recipe.image = `http://10.0.2.2:3000/images/recipes/${recipe._id}.png`;

            return await this.client.db("FULLRECETAS").collection("Recipes").insertOne(recipe);
        }
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
        //We get the recipes of the user
        const user = await this.getUserById(userId);

        //We get the recipes that are in the recipes array of the user ( the recipes array contains the ids of the recipes in a string format so we need to convert them to ObjectId)
        const recipes = await this.client.db("FULLRECETAS").collection("Recipes").find({_id: {$in: user.recipes.map(id => new ObjectId(id))}}).toArray();

        if (recipes.length > 0) {
            // We update the publisher
            for(let i = 0; i < recipes.length; i++){
                recipes[i].publisher = await this.client.db("FULLRECETAS").collection("Users").findOne({_id: recipes[i].publisher});
            }
        }

        return recipes;
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
