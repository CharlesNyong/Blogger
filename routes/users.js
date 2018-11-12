const express = require("express"); // load the express module or import the express library
const router = express.Router();
const { check, validationResult } = require('express-validator/check');
const flash = require('connect-flash');
const session = require('express-session');
const bcrypt = require('bcryptjs');
const passport = require('passport');
//Bring in User Model
let User = require('../models/user');


//Express  Session Middleware
// app.use(session({
//     secret: 'Keyboard cat',
//     resave: true, // make sure this stays as true in other for messages to display
//     saveUnitialized: true,
//     // cookie: {secure: true}
// }))

// // Express message middleware
// app.use(require('connect-flash')());
// app.use(function (req, res, next) {
//   res.locals.messages = require('express-messages')(req, res);
//   next();
// });

// Registration form
router.get('/register', function(req, res){
    res.render('register');
})

router.post('/register', [check('name', 'name Required!').isLength({min:1}),
check('username', 'username Required!').isLength({min:1}),
check('email', 'email Required!').isLength({min:1}),
check('email', 'email is not valid!').isEmail(),
check('password', 'password Required!').isLength({min:1}),
check('password2', 'confirmation Required!').isLength({min:1}).custom(function(value, {req, loc, path}){
    if (value !== req.body.password) {
        // trow error if passwords do not match
        throw new Error("passwords don't match");
    } else {
        return value;
    }
})],
 function(req, res){

    const errors = validationResult(req);

    if(!errors.isEmpty()){
        console.log(errors);
        res.render('register', {
            errors: errors.mapped() 
        })
    }else{
        let newUser = new User();
        newUser.username = req.body.username;
        newUser.email = req.body.email;
        newUser.password = req.body.password;
        newUser.password2 = req.body.password2;
        newUser.name = req.body.name;

        bcrypt.genSalt(10, function(err, salt){
            bcrypt.hash(newUser.password, salt, function(err, hash){
                if(err){
                    console.log(err);
                }
                newUser.password = hash;
                newUser.save(function(err){
                    if(err){
                        console.log(err);
                        return;
                    }
                    else{
                        req.flash('success', 'Successfully registered!');
                        res.redirect('/users/login');
                    }
                });
            })
        })    
            
        
    }    
})

router.get('/logout', function(req, res){
    req.logout()
    req.flash('success', 'You are logged out');
    res.redirect('/users/login');
});


router.get('/login', function(req, res){
    res.render('login');
});

// login process
router.post('/login', function(req, res, next){
    passport.authenticate('local',{
        successRedirect:'/',
        failureRedirect:'/users/login',
        failureFlash: true,
    })(req, res, next);
});

module.exports = router;