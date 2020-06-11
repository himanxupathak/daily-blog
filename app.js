//jshint esversion:6

const express = require("express");
const ejs = require("ejs");
const bodyParser =  require("body-parser");
const _ = require("lodash");
const mongoose = require("mongoose");

const app = express();

const names = [{
    "name": "Peter",
    "about": "Author of book dream it and junior web designer and developer",
    "img": "blogger1",
    "catogary": "author"
}, {
     "name": "John",
     "about": "Well known for popular blog posts on coronavirus",
     "img": "blogger2",
     "catogary": "blogger"
    },{
     "name": "Brad",
     "about": "Well known for food blogging exploring indian street food every weak",
     "img": "blogger3",
    "catogary": "food"
    },{
     "name": "Himanshu",
     "about": "Travel blogger exploring new and intresting places around the globe ",
     "img": "blogger4", 
     "catogary": "travelling"
    }];

app.set("view engine", "ejs");

app.use(bodyParser.urlencoded({ extended: true }));

app.use(express.static("public"));

mongoose.connect("mongodb://localhost:27017/dailyBlogDB", {useNewUrlParser: true});

const postSchema ={
    title: String,
    content: String
}
const userSchema = {
    email: String,
    password: String
};

const User = mongoose.model("User", userSchema);
const Post = mongoose.model("Post", postSchema);


app.get("/", function (req,res){
    res.render("login");
});
app.get("/signup",function(req,res){
    res.render("signup");
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

app.get("/dynamicPost", function(req, res){ 
    Post.find({},function(err, posts){
        if(err){
            console.log(err);
        }else{
            User.findOne({},function(err,users){
                res.render("home", {
                    posts: posts,
                    user:users,
                    bloggers: names
                });
            })
          
        }
    })
})
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
app.get("/edits/:editId", function(req, res){
    const postsId = req.params.editId;
    console.log(postsId);

    Post.findOne({_id: postsId}, function(err, findPost){
        if(err){
            console.log(err);
        }else{
            res.render("editPage",{
                title: findPost.title,
                content: findPost.content,
                editId: postsId
            });
        }
    });
});
app.post("/signup", function (req, res){
    const email = req.body.email;
    const password = req.body.password;
    const confirm = req.body.confirm;
 User.findOne({email:email}, function(err,foundedUser){
     if(err){
         console.log(err);
     }else{
         if(!foundedUser){
             const newUser = new User({
                 email: email,
                 password: password
             });
             newUser.save(function (err) {
                 if (err) {
                     console.log();
                 } else {
                   res.redirect("/dynamicPost");  
                 }
             });
         }else{
             console.log("user already exists");
             res.render("signup");
         }
     }
 })

});
app.post("/login", function (req, res) {
   const email = req.body.email;
   const password = req.body.password;

   User.findOne({email: email}, function(err,foundUser){
       if(err){
           console.log(err);
       }else{
           if(foundUser){
               if(foundUser.password === password){
                   Post.find({}, function (err, posts) {
                       if (err) {
                           console.log(err);
                       } else {
                           User.findOne({email: email}, function (err, users) {
                               res.render("home", {
                                   posts: posts,
                                   user: users,
                                   bloggers: names
                               });
                           })
                       }
                   })
               }
           }
       }
   });
});
app.post("/compose", function(req,res){
    const title = req.body.title;
    const content = req.body.content;

    newPost = new Post({
        title:title,
        content:content
    });
    newPost.save(function(err){
        if(err){
            console.log(err);
        }else{
            console.log("successfully saved post");
            res.redirect("/dynamicPost");
        }
    });
});
app.post("/delete", function(req, res){
    
    const deletePost =  req.body.delete;
    Post.findByIdAndRemove(deletePost, function(err){
        if(!err){
            console.log("deleted 1 item");
            res.redirect("/dynamicPost");
        }
    });
    
});
app.post("/edits", function(req, res){
    const editTitle = req.body.title;
    const editContent = req.body.content;
    const id = req.body.buttonId;
    console.log(editTitle);
    console.log(editContent);
    console.log(id);
    Post.findByIdAndUpdate({ _id: id }, { title: editTitle, content: editContent }, function (err, result) {
        if (err) {
            console.log(err);
        }
        else {
            console.log(result);
            res.redirect("/dynamicPost");
        }
    });
});
app.get("/peoples/:name/:about/:img/:catogary", function(req, res){
    const name = req.params.name;
    const about = req.params.about;
    const img = req.params.img;
    const catogary = req.params.catogary;
    res.render("bloggers",{
      name: name,
      about: about,
      img: img,
      catogary: catogary
    });
});


app.listen(5000, function(req, res){
    console.log("server started on port 5000");
});