//Load the packages that we need
const http = require("http");
const express = require("express");
const bodyParser = require("body-parser");
const app = express();
const PORT = "8080";

//setting up view engine as ejs

app.set("view engine", "ejs");
app.use(bodyParser.urlencoded({extended: true}));

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
//test route to display "Hello World!"
app.get("/hello", (req, res) => {
  let templateVars = { greeting: "Hello World!"};
  res.render("hello_world", templateVars);
});

//This route renders the urls page and also provides a link to the create a Tiny URL.
app.get("/urls", (req, res) => {
  let templateVars = { urls: urlDatabase};
  res.render("urls_index", templateVars);
  //res.json(urlDatabase);
});


//This route reders the url submission form.
app.get("/urls/new", (req, res) => {
  res.render("urls_new");
});

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

//This route renders the tiny URLS page.
app.get("/urls/:shortURL",(req, res) => {
  let templateVars = { shortURL: req.params.shortURL, longURL:urlDatabase[req.params.shortURL]};
  res.render("urls_show", templateVars);
});

app.get("/u/:shortURL",(req, res) => {
  let templateVars = urlDatabase[req.params.shortURL];
  res.redirect(templateVars)
});



app.listen(PORT, () => {
  console.log(`Example app is listening on port ${PORT}`)
});