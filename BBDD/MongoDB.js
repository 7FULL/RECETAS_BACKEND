const { MongoClient, ServerApiVersion } = require('mongodb');
const User = require('../Models/User');

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
        const newUser = new User(user.username, user.password, user.name, user.surname, user.email, user.phone, user.image, user.recipes, user.followers);
        return await this.client.db("FULLRECETAS").collection("Users").insertOne(newUser);
    }

    async getUserByUsername(username) {
        return await this.client.db("FULLRECETAS").collection("Users").findOne({username : username});
    }

    async createRecipe(recipe) {
        return await this.client.db("FULLRECETAS").collection("Recipes").insertOne(recipe);
    }

    async getRecipeById(id) {
        //We get the recipe by its id, then we update the publisher using its id
        const recipe = await this.client.db("FULLRECETAS").collection("Recipes").findOne({_id : id});

        //We update the publisher
        recipe.publisher = await this.client.db("FULLRECETAS").collection("Users").findOne({_id: recipe.publisher});

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
        const recipes = await this.client.db("FULLRECETAS").collection("Recipes").find().sort({likes: -1}).limit(5).toArray();

        //We update the publisher
        for(let i = 0; i < recipes.length; i++){
            recipes[i].publisher = await this.client.db("FULLRECETAS").collection("Users").findOne({_id: recipes[i].publisher});
        }

        return recipes;
    }
}

module.exports = {
    MongoDB
}
