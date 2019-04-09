
//Load the packages that we need
const http = require("http");
const express = require("express");
const app = express();
const PORT = "8080";

//setting up view engine as ejs

app.set("view engine", "ejs");

let urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};
//test code to display "Hello World!"
app.get("/hello", (req, res) => {
  let templateVars = { greeting: "Hello World!"}
  res.render("hello_world", templateVars);
});

//This code renders the urls page and also provides a link to the create a Tiny URL.
app.get("/urls", (req, res) => {
  let templateVars = { urls: urlDatabase}
  res.render("urls_index", templateVars);
  //res.json(urlDatabase);
});

//This code renders the tiny URLS page.
app.get("/urls/:shortURL",(req, res) => {
  let templateVars = { shortURL: req.params.shortURL, longURL:urlDatabase[req.params.shortURL]}
  res.render("urls_show", templateVars)
})

app.listen(PORT, () => {
  console.log(`Example app is listening on port ${PORT}`)
});