

const pool = require("./dbConnector");
const User= require('../models/userModel');
const bcrypt= require('bcryptjs');
const Token = require('../models/tokenModel')
//id=email


module.exports.comparePassword= function comparePassword(password, password2, callback) {
    bcrypt.compare(password,password2,(err,isMatch)=>{
        if(err)
            throw err;
        callback(null,isMatch)

    })
}

module.exports.getUserById = async function(userEmail,cb) {
    pool.query(
        "SELECT email,name,is_verified,password " +
        "FROM PN_USERS " +
        "where email=?",[userEmail],(error,results)=>{
        if(error) {
            console.log(error);
            cb(error, null)
        }


            let existingUser= results.length!=0 ?  User.createUser(
            results[0].name,
            results[0].email,
                results[0].password,
                results[0].is_verified) : null;

        console.log(existingUser);

        cb(null,existingUser);
    })

}

module.exports.updateToken = async function updateToken(newToken, f) {

    pool.query('UPDATE PN_USER_TOKENS \n' +
        'SET user_token = ?,created_at= CURRENT_TIMESTAMP(6)',[newToken.token],(err,cb)=>{
        f(err,cb)
    })
}



module.exports.findTokenById = async function findTokenById(token,cb) {
    pool.query(
        "SELECT * FROM PN_USER_TOKENS where user_token =? and now() < created_at + INTERVAL 1 HOUR",[token],(error,results)=>{
            if(error) {
                console.log(error);
                cb(error, null)
            }


            let existingToken= results.length!=0 ?  Token.createToken(
                results[0].user_token,
                results[0].user_email,
                results[0].created_at) : null;

            console.log(existingToken);

            cb(null,existingToken);
        })

}

module.exports.verifyUser = async function verifyUser(email,cb) {
    pool.query('UPDATE PN_USERS\n' +
        'SET is_verified=?',['Y'],(err,result)=>{
        if(err){
            cb(err,null)
        }
        console.log(result);
        if(result){
            cb(err,result)
        }
    })
}

module.exports.insertRegistrationToken = async function(email, token, cb){

    pool.query("INSERT INTO `push_notif`.`PN_USER_TOKENS`\n" +
        "(`user_email`,\n" +
        "`user_token`,\n" +
        "`is_verified`)\n" +
        "VALUES\n" +
        "(?,\n" +
        "?,\n" +
        "?)",[email,token,'N',],(err,res)=>{
        console.log(err);
        console.log(res);
        if(err)
            cb(err,null)
        cb(null,res)

    })
}

module.exports.addUser = async function(newUser,cb) {
    bcrypt.genSalt(10,(err,salt)=>{

        console.log("Salt"+salt);


        bcrypt.hash(newUser.password,salt,(err,hash)=>{
            if(err)
                cb(err,null)
            newUser.password= hash;
            console.log("Hash" + hash);
            pool.query("INSERT INTO `push_notif`.`PN_USERS`\n" +
                "(`email`,\n" +
                "`name`,\n" +
                "`password`,\n" +
                "`is_verified`)\n" +
                "VALUES\n" +
                "(?,\n" +
                "?,\n" +
                "?,\n" +
                "?)",[newUser.email, newUser.name,newUser.password,'N' ],(err,results)=>{
                console.log(err);
                console.log(results);
                if(err){
                    cb(err,null);
                }
                cb(null,newUser)
            })

        });
    })

}



