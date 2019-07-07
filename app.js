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

app.use(bodyParser.urlencoded({extended: true}));
app.set('view engine', 'ejs');
app.use(express.static("public"));
app.use(session({
  secret: process.env.SECRET,
  resave: false,
  saveUninitialized: false
}));
app.use(passport.initialize());
app.use(passport.session());

// Creating Schema and defining database

mongoose.connect("mongodb://localhost:27017/blogDB", {useNewUrlParser: true});
mongoose.set("useCreateIndex", true);

// Schemas
const postSchema = { title: String, body: String };

const userSchema = new mongoose.Schema({
  user: String,
  password: String,
  googleId:String
});

const newsletterSchema = new mongoose.Schema({
  firstName: String,
  lastName:String,
  email: String
});

//
//

userSchema.plugin(passportLocalMongoose);
userSchema.plugin(findOrCreate);

// Models

const Post = new mongoose.model("Post", postSchema);

const User = new mongoose.model("User", userSchema);

const NewsletterSignup = new mongoose.model("NewsletterSignup", newsletterSchema);

//
//

passport.use(User.createStrategy());

passport.serializeUser(function(user, done) {
  done(null, user.id);
});

passport.deserializeUser(function(id, done) {
  User.findById(id, function(err, user) {
    done(err, user);
  });
});

passport.use(new GoogleStrategy({
    clientID: process.env.CLIENT_ID,
    clientSecret: process.env.CLIENT_SECRET,
    callbackURL: "http://localhost:3000/auth/google/about",
    userProfileURL: "https://www.googleapis.com/oauth2/v3/userinfo"
  },
  function(accessToken, refreshToken, profile, cb) {
    console.log(profile);
    User.findOrCreate({ googleId: profile.id }, function (err, user) {
      return cb(err, user);
    });
  }
));

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

app.get("/auth/google",
  passport.authenticate("google", { scope: ["profile"] })
);

app.get("/auth/google/about",
  passport.authenticate("google", { failureRedirect: "/login" }),
  function(req, res) {
    // Successful authentication, redirect home.
    res.redirect("/");
});

app.post("/newsletter-signup", function(req, res){
  let newsUser = new NewsletterSignup({
    firstName: req.body.firstName,
    lastName: req.body.lastName,
    email: req.body.email
  });
  newsUser.save(function(err){
    if(err){
      console.log(err);
    } else {
      res.redirect("/");
    }
  });
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
