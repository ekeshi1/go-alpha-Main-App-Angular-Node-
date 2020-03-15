


module.exports.createToken = function Token(token,email,createdAt){
    this.token = token;
    this.email=email;
    this.createdAt = createdAt;
    return this;
};

