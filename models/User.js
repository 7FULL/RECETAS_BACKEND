//Import the hash function
const { has } = require('../utils/Util');

class User {
    constructor(username, password, name, surname, email, phone, image, likes, recipes, followers, following, token) {
        this.username = username || null; // Si no se proporciona un username, se inicializa como null
        //Hash the password
        this.password = has(password) || null; // Se ha añadido la función has para encriptar la contraseña (ver más abajo)
        this.name = name || null; // Si no se proporciona un nombre, se inicializa como null
        this.surname = surname || null; // Si no se proporciona un apellido, se inicializa como null
        this.email = email || null; // Si no se proporciona un email, se inicializa como null
        this.phone = phone || null; // Si no se proporciona un teléfono, se inicializa como null
        this.image = image || null; // Si no se proporciona una imagen, se inicializa como null
        this.likes = likes || []; // Si no se proporciona un array de likes, se inicializa como un array vacío
        this.recipes = recipes || []; // Si no se proporciona un array de recetas, se inicializa como un array vacío
        this.following = following || []; // Si no se proporciona un array de seguidos, se inicializa como un array vacío
        this.followers = followers || []; // Similarmente, con los seguidores
        this.token = token || null; // Si no se proporciona un token, se inicializa como null
    }
}

module.exports = User;