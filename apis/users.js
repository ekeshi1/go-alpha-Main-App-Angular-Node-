const express= require('express');
const router = express.Router();
const User= require('../models/userModel.js');
const userHelper = require('../db/userHelper');
const crypto = require('crypto');
const bcrypt= require('bcryptjs');
const nodemailer= require('nodemailer');
const jwt= require('jsonwebtoken');
const passport = require('passport');
const Token = require('../models/tokenModel')



router.post('/register',(req,res,next)=> {
    console.log("Registering user");


    let newUser =  User.createUser(
        req.body.name,
        req.body.email,
        req.body.password
    );

   // console.log(newUser);

    if( userHelper.getUserById(req.body.email,(err,user) =>{
        if(user){
            console.log({
                success:false,
                msg: "We couldn't sign you up ! A user with that username already exists"
            });

            res.json({
                success:false,
                msg: "We couldn't sign you up ! A usuer with that username already exists"
            });
        } else  {
            userHelper.addUser(newUser, (err,user)=>{
                if(err){
                    res.json({success: false, msg: "Sorry for the inconvenience. We couldn't sign you up"});
                    }
                else {
                    const token = userHelper.insertRegistrationToken(user.email,
                        crypto.randomBytes(16).toString('hex'),(err)=>{
                        if(err){
                            res.status(500).send(
                                {
                                    success:false,
                                    msg: err.message})
                            return;

                                 }


                            const transporter = nodemailer.createTransport({
                                service: 'gmail',
                                auth: {user: "keshierald@gmail.com", pass: "Password!2777"
                                }
                            });
                            const mailOptions = {
                                from: 'keshierald@gmail.com',
                                to: user.email,
                                subject: 'Account Verification Token',
                                html: '<a href="http://localhost:4200/register/confirm/'+token.token+'/">Click here to confirm your email' + '</a>'
                            };

                            transporter.sendMail(mailOptions,(err)=> {
                                if(err) {
                                    res.status(500).json({
                                        msg: err.message
                                    })
                                }
                                else {
                                    res.json({success: true, msg: 'User Registered ! A confirmation email will be sent to' + newUser.email
                                    });
                                }
                            });
                        });
                }
            })
        }
    },(err)=>{
        console.log(err);
    }));

})

router.post('/authenticate',(req,res,next)=>{
    const email = req.body.email;
    const password = req.body.password;
    console.log("Authentication request"+ email + password)

    userHelper.getUserById(email,(err,user)=>{
        if(err)
           return res.json({success: false,
            message: err}
            )
        if(!user){
            return res.json({
                success: false,
                message: 'User not found'
            })
        }

        userHelper.comparePassword(password,user.password,(err,isMatch)=>{
            console.log(password);
            console.log(user.password);


                if(err)
                    throw err;
                if(isMatch){
                    const token = jwt.sign(JSON.stringify(user),'my secret');

                    res.json({
                        success:true,
                        token: 'Bearer '+token,
                        user: {
                            name: user.name,
                            email: user.email
                        }
                    })
                } else {
                    res.json({
                        success:false,
                        message: 'Wrong password'
                    })
                }

        })

    })

})


router.post('/confirm',(req, res, next)=> {
    console.log(req.body.token)
    userHelper.findTokenById(req.body.token , function(err,token){
        console.log(token);

        if(!token)
            return res.send({type: 'not-verified',msg: 'We were unable to find a valid token.'})
        userHelper.getUserById( token.email,(err,user)=>{
            console.log(user);
            if(user.isVerified=='Y')
                return res.send({type: 'already-verified', msg:"This user has already been verified."})

            else


            user.isVerified=true;
            userHelper.verifyUser(user.email,(err,result)=>{
                if(err) {
                    return res.status(500).send({msg: err.msg})
                }
               return res.status(200).json({success: true, msg: 'The account has been verified. Please log in'});


            })
        })

    })
})



router.post('/resendToken',async(req,res,next) =>{
    userHelper.getUserById(req.body.email,(err,user)=>{
        if(!user)
            return res.status(400).send({success:false, msg: 'We were unable to find a user with that email.'})
        if(user.isVerified=='Y') return res.status(400).send({msg: 'This account has already been verified. Please log in'});

        const newToken = Token.createToken(crypto.randomBytes(16).toString('hex'),user.email)

        userHelper.updateToken(newToken,(err,result)=>{
            if(err)
                return res.status(500).send({success:false, msg: ' Couldn\'t resend token'})
            if(result.changedRows=1){
                const transporter = nodemailer.createTransport({
                    service: 'gmail',
                    auth: {
                        user: "keshierald@gmail.com",
                        pass: "Password!2777"
                    }
                });

                const mailOptions = {
                    from: 'keshierald@gmail.com',
                    to: user.email,
                    subject: 'Account Verification Token',
                    html: '<a href="http://'+req.headers.host+'/confirmation/'+newToken.token+'/">Click here to confrm your email' + '</a>'
                };
                transporter.sendMail(mailOptions,(err)=> {
                    if(err) {
                        res.status(500).json({msg: err.message
                        })
                    } else {
                        res.json({success: true, msg: 'User token resended! A confirmation email will be sent to' + user.email
                        });
                    }
                });
            }
        })

    })
})

//Profile
router.get('/profile',passport.authenticate('jwt', { session: false }),(req,res,next)=>{
    console.log(req.user)
    res.json({user:req.user});
});
module.exports = router;
