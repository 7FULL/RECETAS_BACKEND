const crypto = require('crypto');

function has(password){
    if (!password) return null;

    //We return the password hashed using the SHA256 algorithm
    return crypto.createHash('sha256').update(password).digest('hex');
}

function response(code, data){
    const json = {
        code: code,
        data: data
    }

    return JSON.stringify(json);
}

module.exports = {
    has,
    response
};