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

const users = { 
  "userRandomID": {
    id: "userRandomID", 
    email: "user@example.com", 
    password: "purple-monkey-dinosaur"
  },
 "user2RandomID": {
    id: "user2RandomID", 
    email: "user2@example.com", 
    password: "dishwasher-funk"
  }
}

const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};

//Email lookup function to check if the email entered 
//by the user is available in the database.
function emailLookup(email) {
  let output = false;
  for (element in users) {
    let userlist = users[element];
    //console.log(userlist)
    // console.log(users[element].email);
    if(userlist.email === email) {
      output = true;
    }
  }
  //console.log("display the users", users)
  return output;
}

//Route to get the registration form
app.get("/register", (req, res) => {
  res.render("registration");
});

//Route to post the registration
app.post("/register", (req, res) => {
  if (req.body.email && req.body.password) {
    let emailPresent = emailLookup(req.body.email)
    if (emailPresent) {
      res.status(400).send("Email already present. Please use a new email to register")
    } else {
      const userid = generateShortURL();
      const useremail = req.body.email;
      const userpwd = req.body.password;
      users[userid] = {id: userid, email:useremail, password: userpwd};
      //console.log(users);
      res.cookie("userid", userid);
      res.redirect("/urls");
    }

  } else {
    res.status(400).send("Email or password cannot be empty")
  }
});

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
  let userid = req.cookies["userid"]
  let useremail = '';
  for (element in users) {
    let userlist = users[element];
    if(userlist.id === userid) {
      useremail = userlist.email;
    }
  }
  let templateVars = {username: useremail, urls: urlDatabase};
  //let templateVars = {username: users, userid:req.cookies["userid"], urls: urlDatabase};
  res.render("urls_index", templateVars);
});

//This route reders the url submission form.
app.get("/urls/new", (req, res) => {
  let userid = req.cookies["userid"]
  let useremail = '';
  for (element in users) {
    let userlist = users[element];
    if(userlist.id === userid) {
      useremail = userlist.email;
    }
  }
  let templateVars = {
    username: useremail
    //username: users, userid:req.cookies["userid"]
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
  let userid = req.cookies["userid"]
  let useremail = '';
  for (element in users) {
    let userlist = users[element];
    if(userlist.id === userid) {
      useremail = userlist.email;
    }
  }
  let templateVars = {username: useremail, shortURL: req.params.shortURL, longURL:urlDatabase[req.params.shortURL]};
  //let templateVars = {username: users, userid:req.cookies["userid"], shortURL: req.params.shortURL, longURL:urlDatabase[req.params.shortURL]};
  res.render("urls_show", templateVars);
});

app.listen(PORT, () => {
  console.log(`Example app is listening on port ${PORT}`)
});