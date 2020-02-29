//jshint esversion:6
// 从文件加载环境变量，必须放在第一位
require("dotenv").config();
const express = require("express");
const bodyParser = require("body-parser");
const ejs = require("ejs");
const mongoose = require("mongoose");
const encrypt = require("mongoose-encryption");

const app = express();
app.use(express.static("public"));
app.set("view engine", "ejs");
app.use(bodyParser.urlencoded({
  extended: true
}));

mongoose.connect("mongodb://localhost:27017/userDB",
{useNewUrlParser: true, useUnifiedTopology: true});

// 为了使用加密
const userSchema = new mongoose.Schema({
  email: String,
  password: String
});

// 从环境变量中提取密钥
const secret = process.env.SECRET;
// 只加密一部分，["a", "b", ..]
// 调用 save() 方法时自动加密，find()方法时自动解密
userSchema.plugin(encrypt, {secret: secret, encryptedFields: ["password"]});

// modelName; collection name
const User = new mongoose.model("User", userSchema);


app.get("/", function(req, res){
  res.render("home");
});

app.get("/login", function(req, res){
  res.render("login", {
    hint: ""
  });
});

app.get("/register", function(req, res){
  res.render("register");
});

app.get("/submit", function(req, res){
  res.render("submit");
});

app.get("/secret", function(req, res){
  res.render("secret");
});

app.post("/register", function(req, res){
  const newUser = new User({
    email: req.body.username,
    password: req.body.password
  });
  newUser.save(function(err){
    if (!err) {
      res.render("secrets");
    } else {
      console.log(err);
    }
  });
});

app.post("/login", function(req, res){
  const username = req.body.username;
  const password = req.body.password;

  User.findOne({email: username}, function(err, foundUser){
    if (err) {
      console.log(err);
    } else {
      if (foundUser) {
        if (foundUser.password === password) {
          res.render("secrets");
        } else {
          res.render("login", {
            hint: "Your email or password was entered incorrectly."
          });
        }
      } else {
        res.render("login", {
          hint: "Your email or password was entered incorrectly."
        });
      }
    }
  });
});











app.listen(3000, function(){
  console.log("Server started on port 3000.");
});
