const express = require("express"); // load the express module or import the express library
const { check, validationResult } = require('express-validator/check');
const router = express.Router();
const flash = require('connect-flash');
const session = require('express-session');

// Bring in Article model
let Article = require("../models/article");

// Bring in User model
let User = require("../models/user");

// add articles
router.get("/add", ensureAuthenticated, function(req, res){
    res.render('add_article', {
        title: "Add Article"
    });
});

// get specific article
router.get("/:id", function(req, res){
    Article.findById(req.params.id, function(err, article){
       //console.log(article);
        User.findById(article.author, function(err, user){
            if(err){
                console.log(err);
            }
            else{
                res.render('article', {
                    article: article,
                    author: user.name
                });
            }
        });    
    });
})

// Delete specific article
router.get("/delete/:id", function(req, res){
    if(!req.user._id){
        res.status(500).send();
    }
    let query = {_id:req.params.id}
    Article.findById(query, function(err, article){
        if(article.author != req.user._id){
            console.log("User cannot delete");
            res.status(500).send();
        }else{
            Article.findByIdAndRemove(query, function(err, article){
                if(err){
                    console.log(err);
                }
                else{
                   res.redirect("/");
                }    
            });
        }
    });
    
})

// load Edit form
router.get("/edit/:id", ensureAuthenticated, function(req, res){
    Article.findById(req.params.id, function(err, article){
        if(article.author != req.user._id){
            req.flash('danger', 'Not Authorized');
            res.redirect('/');
        }
        else if(err){
            console.log(err);
        }
        else{
            res.render('edit_article', {
                article: article
            });
        }    
    });
})


// Add Submit Post Route
router.post("/add", [check('title', 'title Required!').isLength({min:1}),
    check('body', 'body Required!').isLength({min:1})], 
    function(req, res){
        const errors = validationResult(req);

        if(!errors.isEmpty()){
            console.log(errors);
            res.render('add_article', {
                title: "Add Article",
                errors: errors.mapped() 
            })
        }else{
            let article = new Article();
            article.title = req.body.title;
            article.author = req.user._id;
            article.body = req.body.body;
            article.save(function(err){
                if(err){
                    console.log(err);
                    return;
                }
                else{
                    req.flash('success', 'Article Added');
                    res.redirect('/');
                }
            });
        }    
    });

// Update database with edited article
router.post("/edit/:id", function(req, res){
    let article = {};
    article.title = req.body.title;
    //article.author = req.body.author;
    article.body = req.body.body;
    
    let query = {_id:req.params.id}

    Article.update(query, article, function(err){
        if(err){
            console.log(err);
            return;
        }
        else{
            res.redirect('/');
        }
    });
});

// Access control
function ensureAuthenticated(req, res, next){
    if(req.isAuthenticated()){
        return next();
    }
    else{
        req.flash('danger', 'Please login');
        res.redirect('/users/login');
    }
}

// ensures that this file can be accessed anywhere in the project
module.exports = router;