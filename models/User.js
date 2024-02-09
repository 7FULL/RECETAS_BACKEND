//Import the hash function
const { has } = require('../utils/Util');

class User {
    constructor(username, password, name, surname, email, phone, image, recipes, followers, following, token) {
        this.username = username;
        //Hash the password
        this.password = has(password); // Se ha añadido la función has para encriptar la contraseña (ver más abajo)
        this.name = name;
        this.surname = surname;
        this.email = email;
        this.phone = phone;
        this.image = image;
        this.recipes = recipes || []; // Si no se proporciona un array de recetas, se inicializa como un array vacío
        this.following = following || []; // Si no se proporciona un array de seguidos, se inicializa como un array vacío
        this.followers = followers || []; // Similarmente, con los seguidores
        this.token = token || null; // Si no se proporciona un token, se inicializa como null
    }
}

module.exports = User;