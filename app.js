//jshint esversion:6
require("dotenv").config();
const express = require("express");
const session = require("express-session");
const bodyParser = require("body-parser");
const ejs = require("ejs");
const _ = require("lodash");
const mongoose = require("mongoose");
const findOrCreate = require("mongoose-findorcreate");
const passport = require("passport");
const passportLocalMongoose = require("passport-local-mongoose");
const GoogleStrategy = require("passport-google-oauth20").Strategy;

const homeStartingContent = "And welcome to my personal blog. Here, I will keep you informed (for whatever reason) of my latest projects! :)";
const aboutContent = "";
const contactContent = "You can send me an email at leonardov9.lv@gmail.com";

const app = express();

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));

// Creating Schema and defining database

mongoose.connect("mongodb://localhost:27017/blogDB", {useNewUrlParser: true});

const postSchema = { title: String, body: String };

const Post = mongoose.model("Post", postSchema);


//
//

app.get("/", function(req, res){
  Post.find({}, function(err, posts){
    res.render("home", {
      homeStarting: homeStartingContent,
      posts: posts
    });
  });
});

app.get("/contact", function(req, res){
  res.render("contact", {contact: contactContent});
});

app.get("/about", function(req, res){
  res.render("about", {about: aboutContent});
});

app.get("/newsletter-signup", function(req, res){
  res.render("news-signup");
});

app.get("/login", function(req, res){
  res.render("login");
});

app.get("/signup", function(req, res){
  res.render("signup");
});

app.get("/compose", function(req, res){
  res.render("compose");
});

app.get("/posts/:postId", function(req, res){
  const postId = req.params.postId;

  // Searching in database for content to the specified URL
  Post.findOne({_id: postId}, function(err, foundPost){
    console.log(foundPost);
    res.render("post", {postTitle: foundPost.title, postBody: foundPost.body});
  });
});

app.post("/newsletter", function(req, res){

});

app.post("/compose", function(req, res){

  // Saving post to database
  let post = new Post(
    {title: req.body.titleArticle,
    body: req.body.bodyArticle}
  );

  post.save(function (err) {
    if (err) {
      console.error(err);
    } else {
        res.redirect("/");
    }
  });
});






app.listen(3000, function() {
  console.log("Server started on port 3000");
});
