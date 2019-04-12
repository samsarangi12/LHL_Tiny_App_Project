//Load the packages that we need
const http = require("http");
const express = require("express");
const bodyParser = require("body-parser");
const cookieParser = require("cookie-parser");
const cookieSession = require('cookie-session');
const bcrypt = require('bcrypt');
const app = express();
const PORT = "8080";

//setting up view engine as ejs

app.set("view engine", "ejs");
app.use(bodyParser.urlencoded({extended: true}));
app.use(cookieParser());
app.use(cookieSession({
  name: "session",
  keys: ["This is a key for a basic tinyURL APP"],
  maxAge: 1 * 60 * 1000
}))

//This function creates a random string which will be used for creating the shorturl
function generateShortURL() {
  let possibleChars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let newShortURL = '';
  for (let i = 0; i < 6; i++) {
    newShortURL += possibleChars.charAt(Math.floor(Math.random() * possibleChars.length));
  }
  return newShortURL;
}

//UserDatabase
const users = {
  "userRandomID": {
    id: "userRandomID",
    email: "user@example.com",
    hashedPassword: "$2b$10$ArZRWi46RTtEa0VKXZG3BO47FNG1fKqvvEE8fXvPUsNKDZmXPYhZu"
  },
 "user2RandomID": {
    id: "user2RandomID",
    email: "user2@example.com",
    hashedPassword: "$2b$10$GxOCInMGzVAtn2ZvA0Nurep9fzrkIyYUWHQptvsdt9EE0XBvgO/72"
  }
};

//URL Database
const urlDatabase = {
  "b2xVn2": { longURL: "http://www.lighthouselabs.ca", userID: "userRandomID" },
  "9sm5xK": { longURL: "http://www.google.com", userID: "user2RandomID" },
  "9sm51K": { longURL: "http://www.google1.com", userID: "user2RandomID" },
  "9sm53K": { longURL: "http://www.google2.com", userID: "user2RandomID" }
};

//Email lookup function to check if the email entered
//by the user is available in the database.
function emailLookup(email) {
  let output = false;
  for (element in users) {
    let userlist = users[element];
    if(userlist.email === email) {
      output = true;
    }
  }
  return output;
}

//Password lookup function to check if the email entered
//by the user is available in the database.
function passwordLookup(password) {
  let output = false;
  for (element in users) {
    let userlist = users[element];
    if(bcrypt.compareSync(password, userlist.hashedPassword)) {
      output = true;
    }
  }
  return output;
}

//Funtion to get email id to pass as the key
function getEmail(userid) {
  let useremail = '';
  for (element in users) {
    let userlist = users[element];
    if(userlist.id === userid) {
      useremail = userlist.email;
    }
  }
  return useremail;
}

//Route to get the registration form
app.get("/register", (req, res) => {
  res.render("registration");
});

//Route to post the registration
app.post("/register", (req, res) => {
  if (req.body.email && req.body.password) {
    let emailPresent = emailLookup(req.body.email);
    if (emailPresent) {
      res.status(400).send("Email already present. Please use a new email to register");
    } else {
      const userid = generateShortURL();
      const useremail = req.body.email;
      const userpwd = req.body.password;
      const hashedPassword = bcrypt.hashSync(userpwd, 10);
      users[userid] = {id: userid, email:useremail, hashedPassword: hashedPassword};
      req.session.userid = userid;
      res.redirect("/urls");
    }
  } else {
    res.status(400).send("Email or password cannot be empty");
  }
});

//Route to get the login form
app.get("/login", (req, res) => {
  res.render("login");
});

//Route to post login
app.post("/login", (req, res) => {
  if (req.body.email && req.body.password) {
    let emailPresent = emailLookup(req.body.email);
    let passwordMatch = passwordLookup(req.body.password);
    let userid = '';
    if (emailPresent && passwordMatch) {
      for (element in users) {
        let userlist = users[element];
        if(userlist.email === req.body.email) {
          userid = userlist.id;
        }
      }
      req.session.userid = userid;
      res.redirect("/urls");
    } else if (emailPresent && !passwordMatch) {
      res.status(403).send("Incorrect Password")
    } else if (!emailPresent){
      res.status(403).send("User not registered. Please register");
    }
  } else {
    res.status(400).send("Email or password cannot be empty");
  }
});

//This Route to post's the logout functionality
app.post("/logout", (req, res) => {
  req.session = null;
  res.redirect("/login");
});

//This route renders the urls page and also provides a link to the create a Tiny URL.
app.get("/urls", (req, res) => {
  let userid = req.session.userid;
  let useremail = getEmail(userid);
  let selectedUrlDatabase = {}
  if(userid) {
    for (element in urlDatabase) {
      if (urlDatabase[element].userID === userid) {
        selectedUrlDatabase[element] = urlDatabase[element];
      }
    }
    let templateVars = {username: useremail, urls: selectedUrlDatabase};
    res.render("urls_index", templateVars);
  } else {
    res.redirect("/login");
  }
});

//This route renders the url submission form.
app.get("/urls/new", (req, res) => {
  let userid = req.session.userid;
  let useremail = getEmail(userid);
  let templateVars = {
    username: useremail
  };
  if(userid) {
    res.render("urls_new", templateVars);
  } else {
    res.redirect("/login");
  }

});

//This route creates the new tiny url.
app.post("/urls/new", (req, res) => {
  let userid = req.session.userid;
  let newShortURL = generateShortURL();
  urlDatabase[newShortURL] = { longURL: req.body.longURL, userID: userid};
  res.redirect("/urls");
})

//Route to delete a URL
app.post("/urls/:url/delete", (req, res) => {
  let userid = req.session.userid;
  let shortURL = req.params.url;
  if (userid === urlDatabase[shortURL].userID) {
    delete urlDatabase[shortURL];
    res.redirect("/urls");
  } else {
    res.redirect("/login");
  }
})

//This route renders the tiny URLS page which allows the user to edit the
//long url associated with a short url

app.get("/urls/:shortURL",(req, res) => {
  let userid = req.session.userid;
  let useremail = getEmail(userid);
  if(userid && urlDatabase[req.params.shortURL].userID === userid) {
    let templateVars = {username: useremail,
    shortURL: req.params.shortURL, longURL:urlDatabase[req.params.shortURL]};
    res.render("urls_show", templateVars);
  } else {
    res.redirect("/login");
  }
});

//Route to update a URL
app.post("/urls/:id", (req, res) => {
  let userid = req.session.userid;
  let shortURL = req.params.id;
  if (userid === urlDatabase[shortURL].userID) {
    urlDatabase[shortURL] = { longURL: req.body.longURL, userID: userid};
    res.redirect("/urls");
  }
})

//This route renders the tiny URLS page to anyone, even when the user is not logged in.
app.get("/u/:shortURL", (req, res) => {
  let templateVars = {shortURL: req.params.shortURL, longURL:urlDatabase[req.params.shortURL]};
  res.render("showShortUrl", templateVars);
});

app.listen(PORT, () => {
  console.log(`Example app is listening on port ${PORT}`);
});