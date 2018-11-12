const express = require("express"); // load the express module or import the express library
const app = express(); // assign the module to a variable
const path = require('path');
const mongoose = require("mongoose");
const bodyParser = require('body-parser');
const { check, validationResult } = require('express-validator/check');
const flash = require('connect-flash');
const session = require('express-session');
const config = require('./models/config/database');
const passport = require('passport');


// create connection
mongoose.connect(config.database);
let db = mongoose.connection;

// check connections
db.once('open', function(){
    console.log('Connected to MongoDB');
});

//check for database errors
db.on('error', function(err){
    console.log(err);
});

// Bring in models
let Article = require("./models/article");

// path setup for view files
app.set('views', path.join(__dirname, 'views'));

// Load/set view engine type
app.set('view engine', 'pug');

// Body parser for retrieving json objects
app.use(bodyParser.urlencoded({ extended: false }));

// parse application/json
app.use(bodyParser.json());

// set public folder for static files
app.use(express.static(path.join(__dirname, 'public'))); 

//Express  Session Middleware
app.use(session({
    secret: 'Keyboard cat',
    resave: true, // make sure this stays as true in other for messages to display
    saveUnitialized: true,
    // cookie: {secure: true}
}))

// Express message middleware
app.use(require('connect-flash')());
app.use(function (req, res, next) {
  res.locals.messages = require('express-messages')(req, res);
  next();
});

// Passport config
require('./models/config/passport')(passport);

// Passport Middleware
app.use(passport.initialize());
app.use(passport.session());

// this is used to create a global 'user' variable accessible to all routers
app.get('*', function(req, res, next){
    res.locals.user = req.user || null;
    next();
})

/****  Routes & Routers  ****/

// Home Route
app.get("/", function(req, res){
    Article.find({}, function(err, articles){
        if(err){
            console.log(err);
        }
        else{
            res.render('index',{
                title: 'Articles',
                articles: articles
            });
        }    
    });
    
});

// Point to Route Files
let articles = require('./routes/articles');
let users = require('./routes/users');
// this line means, any request the begins with '/articles' should be looked up in the file path above
app.use('/articles', articles);
app.use('/users', users);

// create server and port to be listening on 
app.listen(3000, function(){
    console.log("server started on port 3000....");
})