const express = require("express");
const app = express();
const PORT = 8080;
const fs = require("fs");
const bodyParser = require("body-parser");
const cookieSession = require('cookie-session');
const bcrypt = require('bcryptjs');

app.use(bodyParser.urlencoded({extended: true}));
app.use(cookieSession({
  name: 'session',
  keys: ['key1', 'key2']
}));

app.set('view engine', 'ejs');

//functions---------------------------------------------------------
function generateRandomString() {
var randomString = '';
const possibleChars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ123456789';
  for (let i = 0; i < 6; i++) {
  randomString += possibleChars[getRandomInt(0, 61)];
  };
  return randomString;
}

// MDN code for random integer between min - max
function getRandomInt(min, max) {
  min = Math.ceil(min);
  max = Math.floor(max);
  return Math.floor(Math.random() * (max - min)) + min; //The maximum is exclusive and the minimum is inclusive
}

function urlsForUser(id) {
  var userDatabase = {};
  for (shortURL in urlDatabase) {
    const urlData = urlDatabase[shortURL];
    if (id === urlData.userID) {
      userDatabase[shortURL] = urlData;
    }
  }
  return userDatabase;
}

function isValidUser(user_id) {
  for (let id in users) {
    if (id === user_id) {
      return true;
    }
  }
}
//--------------------------------------------------------------------
//Databases here------------------------------------------------------
// key of urlDatabase is shortURL, userID is randomly generated userID
var urlDatabase = {
  "b2xVn2": {
    longURL: "http://www.lighthouselabs.ca",
    userID: "j8Ui3w"
  },
  "9sm5xK": {
    longURL: "http://www.google.com",
    userID: "L2Yp3s"
  }
};

const users = {
  j8Ui3w: {
    email: "angela@example.com",
    password: bcrypt.hashSync("purple-monkey-dinosaur", 10),
    id: "j8Ui3w"
  },
 L2Yp3s: {
    email: "monica@example.com",
    password: bcrypt.hashSync("dishwasher-funk", 10),
    id: "L2Yp3s"
  }
};
//------------------------------------------------------------

app.get("/", (req, res) => {
  res.send("Hello! Welcome to TinyApp");
});

// /urls page-------------------------------------------------
app.get("/urls", (req, res) => {
  let user_id = req.session.user_id;
  // req.cookies["user_id"];
  if (user_id && isValidUser(user_id)) {
    var newDatabase = urlsForUser(user_id);
    let templateVars = { userDatabase: newDatabase,
                         user_id: user_id,
                         users: users
                       };
      // console.log(templateVars.user_id);
    res.render("urls_index", templateVars);
  } else {
    res.redirect("/login");
  }
});

// generate random string for URL
app.post("/urls", (req, res) => {
  const shortURL = generateRandomString();
  let user_id = req.session.user_id;
  if (user_id && isValidUser(user_id)) {
    urlDatabase[shortURL] = {};
    urlDatabase[shortURL].longURL = req.body.longURL;
    urlDatabase[shortURL].userID = user_id;
    // console.log("this is .shorturl", urlDatabase[shortURL]);
    res.redirect(`/urls/${shortURL}`);
  } else {
    res.redirect("/login");
  }
});
//------------------------------------------------------------

// login page---------------------------------------------------
app.get("/login", (req, res) => {
  // let user_id = req.cookies["user_id"];
  let templateVars = { user_id: undefined};
  res.render("login", templateVars);
});

// set login username as cookie
app.post("/login", (req, res) => {
  let email = req.body.email;
  let password = req.body.password;
  if (email === '' || password === '') {
    res.status(403).send("Please enter both your email and password.");
    return;
  } else {
    for (const key in users) {
      if(users[key].email === email && bcrypt.compareSync(password, users[key].password)){
        req.session.user_id = key;
        res.redirect("/urls");
        return;
      }
    }
    res.status(403).send("Email and password combination not found.");
  }
});
//----------------------------------------------------------------
//register -------------------------------------------------------
// endpoint of form for email and password
app.get("/register", (req, res) => {
  let user_id = req.session.user_id;
  let templateVars = { urls: urlDatabase,
                       user_id: user_id,
                       users: users };
  res.render("register", templateVars);
});

// add new users to database
app.post("/register", (req, res) => {
  let loginID = generateRandomString();
  let emailArray = [];
  let email = req.body.email;
  let password = req.body.password;

  for (var id in users) {
    emailArray.push(users[id].email);
  }
  if (email === '' || password === '') {
    res.status(400).send(`Please enter an email and/or password`);
  }
  else if (emailArray.includes(email)) {
    res.status(400).send('This email is already in use!');
  } else {
    users[loginID] = {};
    users[loginID].email = req.body.email;
    users[loginID].password = bcrypt.hashSync(req.body.password, 10);
    users[loginID].id = loginID;
    req.session.user_id = loginID;
    res.redirect('/urls');
  }
});
//----------------------------------------------------------------
// enter new URL to be shortened
app.get("/urls/new", (req, res) => {
  let user_id = req.session.user_id;

  if (user_id && isValidUser(user_id)) {
    let templateVars = { user_id: user_id,
                         users: users };
    res.render("urls_new", templateVars);
  } else {
    res.redirect("/login");
  }
});

//redirect to longURL using shortURL
app.get("/u/:shortURL", (req, res) => {
  let longURL = urlDatabase[req.params.shortURL].longURL;
  let user_id = req.session.user_id;

  if (user_id && isValidUser(user_id)) {
    res.redirect(longURL);
  } else {
    res.redirect("/login");
  }
});

// delete an url in urlDatabase
app.post("/urls/:shortURL/delete", (req, res) => {
  delete urlDatabase[req.params.shortURL];
  res.redirect('/urls');
});

// log out and clear cookies
app.post("/logout", (req, res) => {
  req.session = null;
  res.redirect('/urls');
});

//urls/shortID here--------------------------------------------
// show short and long URL and give option to change longURL
app.get("/urls/:id", (req, res) => {
  let user_id = req.session.user_id;
  let urlDatabaseKey = urlDatabase[req.params.id];

  if (user_id) {
    let templateVars = { shortURL: req.params.id,
                         longURL: urlDatabaseKey.longURL,
                         user_id: user_id,
                         users: users
                       };
    res.render("urls_show", templateVars);
  } else {
    res.redirect("/login");
  }
});

app.post("/urls/:id", (req, res) => {
  let userID = req.session.user_id;
  let shortURL = req.params.id;
  let urlDatabaseKey = urlDatabase[shortURL];

  if (userID === urlDatabaseKey.userID) {
    urlDatabaseKey.longURL = req.body.longURL;// new long URL
    res.redirect(`/urls/${shortURL}`);
  } else {
    res.redirect('/login');
  }
});
//-------------------------------------------------------------

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});