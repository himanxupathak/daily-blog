//jshint esversion:6
if(process.env.NODE_ENV !== "production"){
    require("dotenv").config();
}
const express = require("express");
const ejs = require("ejs");
const bodyParser =  require("body-parser");
const _ = require("lodash");
const mongoose = require("mongoose");
const  bcrypt = require("bcrypt");
const passport = require("passport");
const {ensureAuthenticated} = require("./config/authentication");
const flash = require("connect-flash");
const session = require("express-session");
const methodOverride = require('method-override')

const User = require("./models/User");
const Post = require("./models/Post");
const names = require("./models/bio");

const initializePassport = require("./config/passport-config")(passport);

const app = express();
const PORT = process.env.PORT || 5000;
// db config
const db = require("./config/keys").mongoURI;
mongoose.connect(db, { useNewUrlParser: true, useUnifiedTopology: true, useCreateIndex: true })
.then(()=> console.log("mongoDB connected"))
.catch(err => console.log(err));

app.set("view engine", "ejs");

app.use(bodyParser.urlencoded({ extended: false }));

app.use(express.static("public"));
app.use(methodOverride('_method'))
app.use(session({
    secret: process.env.SESSION_SECRET,
    resave: true,
    saveUninitialized:true
}))

app.use(passport.initialize())
app.use(passport.session())

app.use(flash());

// Global variables
app.use(function (req, res, next) {
    res.locals.success_msg = req.flash('success_msg');
    res.locals.error_msg = req.flash('error_msg');
    res.locals.error = req.flash('error');
    next();
});



// routes
app.get("/", function(req,res){
    res.render("welcome");
});

// home page route
app.get("/home", ensureAuthenticated, async function (req,res){
     const allPosts = await Post.find().sort({ createdAt: "desc" });
        res.render("home", {
            posts: allPosts,
            user: req.user,
            bloggers: names  
    }) 
});
app.get("/register",function(req,res){
    res.render("register");
});
app.get("/login",function(req,res){
    res.render("login");
});
app.get("/compose",function(req,res){
    res.render("compose");
});
app.get("/contact",function(req,res){
    res.render("contact");
});
app.get("/about",function(req,res){
    res.render("about");
});
app.get("/popular/:link",function(req,res){
   const link = req.params.link;
    
    res.render("popular",{link});
});

// read more route
app.get("/posts/:postId", function(req,res){
    const requestedId = req.params.postId;
    console.log(requestedId);
    
    Post.findOne({_id: requestedId}, function(err, post){
        res.render("post", {
            title:post.title,
            content: post.content,
            post: requestedId
        })
    });
});

// register route
app.post("/register", async function (req, res){
    const {email, password, confirm} = req.body
    let errors = [];
    // check required fields
    if (!email || !password || !confirm ) {
        errors.push({msg: "please fill all fields"})
    }
    // password match 
    if (password != confirm) {
        errors.push({msg: "password did not match"});
    }

    // password length
    if (password.length < 6) {
        errors.push({msg: "password atleast 6 character"})
    }

    if(errors.length > 0){
         res.render("register", {errors, email, password, confirm});
         console.log("error is here"); 
    }else{

 User.findOne({email:email},async function(err,foundedUser){
     if(err){
         console.log(err);
     }else{
         if(!foundedUser){
             try {
              const hashedPassword = await bcrypt.hash(password, 10);
              const newUser = new User({
                email: email,
                password: hashedPassword
              });
                newUser.save().then(user => {
                    req.flash('success_msg', 'You are now registered and can log in');
                    res.redirect('login');
                })
                .catch(err => console.log(err));

             } catch (error) {
                 console.log(err);  
                 res.redirect("/register")
             }
         }else{
             errors.push({msg: "user already exists"});
             res.render("register", {errors, email, password, confirm})
         }
     }
 })};
});

// Login
app.post('/login', (req, res, next) => {
    passport.authenticate('local', {
        successRedirect: '/home',
        failureRedirect: '/login',
        failureFlash: true
    })(req, res, next);
});
app.get("/logout", function(req, res){
    req.logout();
    req.flash("success_msg", "you are logged out successfully");
    res.redirect("/login");
})

// new post
app.post("/compose", async function(req,res){
    const {title, content} = req.body;
    const userEmail = req.user.email;
    const userId = req.user;
    newPost = new Post({ title, content, userEmail, userId});
    newPost.save(function (err) { if (!err) { res.redirect("/home") } });
});

// delete route 
app.delete("/delete/:id", async (req, res) => {
    await Post.findByIdAndDelete(req.params.id)
    res.redirect('/home');
})

// edit route
app.post("/edits", function(req, res){
    const editTitle = req.body.title;
    const editContent = req.body.content;
    const id = req.body.buttonId;
    Post.findByIdAndUpdate({ _id: id }, { title: editTitle, content: editContent }, function (err, result) {
        if (err) {
            console.log(err);
        }
        else {
            res.redirect("/home");
        }
    });
});
app.get("/edits/:editId", function (req, res) {
    const postsId = req.params.editId;
    console.log(postsId);

    Post.findOne({ _id: postsId }, function (err, findPost) {
        if (err) {
            console.log(err);
        } else {
            res.render("editPage", {
                title: findPost.title,
                content: findPost.content,
                editId: postsId
            });
        }
    });
});


// peoples
app.get("/peoples/:name/:about/:img/:catogary", function(req, res){
    const { name, about, img, catogary} = req.params;
    res.render("bloggers",{
      name: name,
      about: about,
      img: img,
      catogary: catogary
    });
});


app.listen(PORT, function(req, res){
    console.log(`server is running on port ${PORT}`);
});

