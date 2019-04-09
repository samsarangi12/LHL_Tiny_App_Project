
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

app.get("/hello", (req, res) => {
  let templateVars = { greeting: "Hello World!"}
  res.render("hello_world", templateVars);
});

app.get("/urls", (req, res) => {
  let templateVars = { urls: urlDatabase}
  res.render("urls_index", templateVars);
  //res.json(urlDatabase);
});

app.listen(PORT, () => {
  console.log(`Example app is listening on port ${PORT}`)
});