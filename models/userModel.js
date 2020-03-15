


module.exports.createUser = function User(name,email,password,isVerified){
    this.name = name;
    this.email=email;
    this.password=password;
    this.isVerified =isVerified;

    return this;
};
