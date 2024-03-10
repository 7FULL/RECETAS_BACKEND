const express = require('express');
const bodyParser = require('body-parser');
const { MongoDB } = require('./BBDD/MongoDB');
const { has, response } = require('./utils/Util');
const User = require('./models/User');
const multer = require('multer');

const BBDD = new MongoDB();

const app = express();
const port = 3000;

//Multer
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

app.use(bodyParser.json());

app.use('/images/recipes', express.static('public/images/recipes'));

//Cors
app.use((req, res, next) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE');
    res.setHeader('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
    next();
});

//Basic auth
app.use((req, res, next) => {
    const auth = {login: 'user', password: 'user'}; // change this
    const b64auth = (req.headers.authorization || '').split(' ')[1] || '';
    const [login, password] = Buffer.from(b64auth, 'base64').toString().split(':');

    if (!login || !password || login !== auth.login || password !== auth.password) {
        res.set('WWW-Authenticate', 'Basic realm="nope"');
        res.status(401).send('Unauthorized');
        return;
    }
    next();
});

app.listen(port, () => {
    console.log(`Server running on port ${port}`);
});

app.get('/', (req, res) => {
    res.send('Hello World');
});

//Get user by email
app.get('/api/user', async (req, res) => {
    const email = req.query.email;
    const user = await BBDD.getUserByEmail(email);
    res.send(response(200, user));
});

//Create user
app.post('/api/user', async (req, res) => {
    const user = req.body;
    const result = await BBDD.createUser(user);
    res.send(response(200, result));
});

//Login
app.post('/api/user/login', async (req, res) => {
    const user = req.body;

    const username = user.username;

    //TODO: No furula

    if(username.toString().includes('@')){
        const userDB = await BBDD.getUserByEmail();

        if(userDB.password === has(user.password)){
            res.send(response(200, userDB));
        }else{
            res.send(response(401, new User()));
        }
    } else{
        const userDB = await BBDD.getUserByUsername(username);
        if(userDB){
            if(userDB.password === has(user.password)){
                res.send(response(200, userDB));
            }else{
                res.send(response(401, new User()));
            }
        }else{
            res.send(response(401, new User()));
        }
    }

});

//Get trending recipes
app.get('/api/recipes/trending', async (req, res) => {
    const recipes = await BBDD.getTrendingRecipes();

    res.send(response(200, recipes));
});

//Get all recipes
app.get('/api/recipes', async (req, res) => {
    const recipes = await BBDD.getAllRecipes();

    res.send(response(200, recipes));
});

//Get recipe by id
app.get('/api/recipe', async (req, res) => {
    const id = req.query.id;

    const recipe = await BBDD.getRecipeById(id);
    res.send(response(200, recipe));
});

//Create recipe
app.post('/api/recipe', upload.single("photo"), async (req, res) => {
    const recipe = JSON.parse(req.body.recipe);
    const image = req.file.buffer

    let isEdit = req.query.edit;

    isEdit = Boolean(isEdit);

    recipe.publisher = recipe.publisher._id;

    const result = await BBDD.createRecipe(recipe, isEdit, image);

    // We add the recipe to the user
    await BBDD.addRecipeToUser(recipe.publisher, result.insertedId);

    res.send(response(200, result));
});

//Like recipe
app.put('/api/recipe/like', async (req, res) => {
    const { recipeId, userId } = req.body;
    const result = await BBDD.likeRecipe(recipeId, userId);
    res.send(response(200, result));
});

//Unlike recipe
app.put('/api/recipe/unlike', async (req, res) => {
    const { recipeId, userId } = req.body;
    const result = await BBDD.unlikeRecipe(recipeId, userId);
    res.send(response(200, result));
});

//Get all likes recipes by user
app.get('/api/recipes/likes', async (req, res) => {
    const userId = req.query.id;
    const recipes = await BBDD.getLikesRecipesByUserId(userId);
    res.send(response(200, recipes));
});

//Get all tags
app.get('/api/tags', async (req, res) => {
    const tags = await BBDD.getAllTags();
    res.send(response(200, tags));
});

//Delete recipe
app.post('/api/recipe/delete', async (req, res) => {
    const recipe = req.body;
    await BBDD.deleteRecipe(recipe);

    console.log("Recipe deleted");

    res.send(response(200, "Recipe deleted"));
});

//Get all recipes by user
app.get('/api/recipes/user', async (req, res) => {
    const userId = req.query.id;
    const recipes = await BBDD.getRecipesByUserId(userId);
    res.send(response(200, recipes));
});

//Follow user
app.post('/api/user/follow', async (req, res) => {
    const { userToFollow, userFollowing } = req.body;

    const result = await BBDD.followUser(userToFollow, userFollowing);
    res.send(response(200, "User followed"));
});

//Unfollow user
app.post('/api/user/unfollow', async (req, res) => {
    const { userToUnfollow, userUnfollowing } = req.body;

    const result = await BBDD.unfollowUser(userToUnfollow, userUnfollowing);
    res.send(response(200, "User unfollowed"));
});

//Get user by id
app.get('/api/user/id', async (req, res) => {
    const id = req.query.id;
    const user = await BBDD.getUserById(id);
    res.send(response(200, user));
});

//Register user
app.post('/api/user/register', async (req, res) => {
    const user = req.body;
    const result = await BBDD.createUser(user);
    res.send(response(200, "User registered"));
});