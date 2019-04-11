//Load the packages that we need
const http = require("http");
const express = require("express");
const bodyParser = require("body-parser");
const cookieParser = require("cookie-parser");
const app = express();
const PORT = "8080";

//setting up view engine as ejs

app.set("view engine", "ejs");
app.use(bodyParser.urlencoded({extended: true}));
app.use(cookieParser())

//This function creates a random string which will be used for creating the shorturl
function generateShortURL() {
  let possibleChars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let newShortURL = '';
  for (let i = 0; i < 6; i++) {
    newShortURL += possibleChars.charAt(Math.floor(Math.random() * possibleChars.length));
  }
  return newShortURL
}


let urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};

//Route to post the login form
app.post("/login", (req, res) => {
  res.cookie("username", req.body.username);
  res.redirect("/urls");
});

app.post("/logout", (req, res) => {
  res.clearCookie('username');
  res.redirect("/urls");
});

//This route renders the urls page and also provides a link to the create a Tiny URL.
app.get("/urls", (req, res) => {
  let templateVars = {username: req.cookies["username"], urls: urlDatabase};
  res.render("urls_index", templateVars);
});

//This route reders the url submission form.
app.get("/urls/new", (req, res) => {
  let templateVars = {
    username: req.cookies["username"]
  };
  res.render("urls_new", templateVars);
});

//This route creates the new tiny url.
app.post("/urls", (req, res) => {
  let newShortURL = generateShortURL();
  urlDatabase[newShortURL] = req.body.longURL;
  res.redirect("/urls");
})

//Route to delete a URL
app.post("/urls/:url/delete", (req, res) => {
  let shortURL = req.params.url
  delete urlDatabase[shortURL]
  res.redirect("/urls");
  
})

//Route to update a URL
app.post("/urls/:id", (req, res) => {
  let shortURL = req.params.id
  let longURL = urlDatabase.shortURL
  urlDatabase[shortURL] = req.body.longURL;
  res.redirect("/urls");
  
})

//This route renders the tiny URLS page. 

app.get("/urls/:shortURL",(req, res) => {
  let templateVars = {username: req.cookies["username"], shortURL: req.params.shortURL, longURL:urlDatabase[req.params.shortURL]};
  res.render("urls_show", templateVars);
});

//This route renders the tiny URLS page. Removing this code since the 
//functionality is no more required for the app.
app.get("/u/:shortURL",(req, res) => {
  let templateVars = urlDatabase[req.params.shortURL];
  res.redirect(templateVars)
});



app.listen(PORT, () => {
  console.log(`Example app is listening on port ${PORT}`)
});