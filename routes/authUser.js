const passport = require("passport");
const Route = require('express').Router();
const randomstring = require('randomstring');
const bcrypt = require('bcryptjs');
const LocalStrategy = require('passport-local').Strategy;

// import the user model
const User = require('../models/user');

// initialize passport configuration 
require("../config/passport")(passport, LocalStrategy, User, bcrypt);


// Register validation middleware 
const RegisterValidation = (req, res, next)=>{
    User.findOne({email: req.body.email}).then(user=>{

        const error = {
            name : '',
            email: '',
            password : '',
            confirmPassword: ''
        }
    
        // Detect name error 
        if(req.body.name.length == ''){
            error.name = 'Name field must be required';
        }else if(req.body.name.length < 3){
            error.name = 'Name must be at least 3 chareaters';
        }
    
    
         // Detect email errors
        const emailTest = (email)=>{
            const regex = /^([a-z\d\.-]+)@([a-z\d\.-]+)\.([a-z]{2,8})(\.[a-z]{2,3})?$/;
            return !regex.test(email);
        }
        if(req.body.email.length == ''){
            error.email = 'Email field must be required';
        }else if(emailTest(req.body.email)){
            error.email = 'Not a valid Email';
        }else if(user){
            error.email = 'This email has already been registerd!!';
        }
    
        // Detect password errors
        if(req.body.password == ''){
            error.password = 'Password field must be required';
        }else if(req.body.password.length < 5){
            error.password = 'Password must be at least 3 chareaters';
        }else if( req.body.password != req.body.confirmPassword){
            error.confirmPassword = 'Passwords did\'t match';
        }
    
        // if no error then fired next middleware
        if(error.name == '' && error.email == '' && error.password == '' && error.confirmPassword == '' ){
           req.validate = true;
            next();
        }else{

            // if errors then redirect back to the same page with error message
            req.validate = false;
            const reponsedWith = {
                error: error,
                body: req.body,
            }
            res.render('register', reponsedWith);
        }    
    });
}

const sendVericiaionTokenToMail = require('../mails/mailer');

// Register router
Route.route('/register')
.get((req, res, next)=>{
    res.render('register');
})
.post(RegisterValidation, (req, res)=>{
    if(req.validate){
        // first hashed the password t
        bcrypt.genSalt(10).then(salt=>{
            bcrypt.hash(req.body.password, salt).then(hashPassword=>{
                const token = randomstring.generate(32);
                    User.create({
                        name: req.body.name,
                        email: req.body.email,
                        password:hashPassword,
                        verification:{
                            token:token,
                        }
                    }).then((user)=>{
                        sendVericiaionTokenToMail(req.body.email, token).then(()=>{
                            req.flash('success_fmsg', 'You Have Successfully Registerd, Now You can Log In Your Account.')
                            req.logout();
                            res.redirect('/login');
                       }).catch(err => console.log(err));
                    });    
              });
        })
    }
});


// login router
Route.route('/login')
.get((req, res)=>{
    res.render('login');
})
.post((req, res, next)=>{
   if(!req.isAuthenticated()){
        passport.authenticate('local', {
            successRedirect: '/blogs',
            failureRedirect: '/login',
            failureFlash: true  
        })(req, res, next);
   }else{
       res.redirect('/');
   }
});

Route.get('/logout', (req, res)=>{
    if(req.isAuthenticated()){
        req.logout();
        req.flash('success_fmsg', 'You are logged out!!')
        res.redirect("/login");
    }else{
        res.redirect('/login');
    }
});

module.exports = Route;
