var express = require("express");
var app = express();
var PORT = 8080;
var fs = require("fs");
const bodyParser = require("body-parser");
const cookieParser = require('cookie-parser');

app.use(bodyParser.urlencoded({extended: true}));
app.use(cookieParser());

app.set('view engine', 'ejs');

//Databases here---------------------------------------------
var urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};

const users = {
  angela: {
    email: "angela@example.com",
    password: "purple-monkey-dinosaur",
    id: "angela"
  },
 monica: {
    email: "monica@example.com",
    password: "dishwasher-funk",
    id: "monica"
  }
};
//------------------------------------------------------------
app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});

app.get("/", (req, res) => {
  res.send("Hello! Welcome to TinyApp");
});

// /urls page-------------------------------------------------
app.get("/urls", (req, res) => {
    // console.log(req.cookies);
  let user_id = req.cookies["user_id"];
  // console.log("This is my", user_id);
  let templateVars = { urls: urlDatabase,
    user_id: user_id};
    console.log(templateVars.user_id);
  res.render("urls_index", templateVars);
});

// generate random string for URL
app.post("/urls", (req, res) => {
  const shortURL = generateRandomString();
  urlDatabase[shortURL] = req.body.longURL;
  res.redirect(`/urls/${shortURL}`);
});
//------------------------------------------------------------
//urls/shortID here--------------------------------------------
// show short and long URL and give option to change longURL
app.get("/urls/:id", (req, res) => {
  let user_id = req.cookies["user_id"];
  // console.log(urlDatabase[req.params.id]);
  let templateVars = {
    shortURL: req.params.id,
    longURL: urlDatabase[req.params.id],
    user_id: user_id
  };
  res.render("urls_show", templateVars);
});

app.post("/urls/:id", (req, res) => {
  urlDatabase[req.params.id] = req.body.longURL;// new long URL
  let shortURL = req.params.id;
  res.redirect(`/urls/${shortURL}`);
});
//-------------------------------------------------------------
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
  var flag = 0;
  var currentUser;
  for(var key in users){
    if(users[key].email === email && users[key].password === password){
      flag = 1;
      currentUser = key;
      break;
    }
    else if (email === '' || password === '') {
      flag = 2;
      break;
    }
    else if (users[key].email === email && users[key].password !== password) {
      flag = 3;
      break;
    }
  }

  if(flag === 1){
    res.cookie('user_id', key).redirect("/");
  }
  else if (flag === 2) {
    res.status(403).send("Please enter both your email and password.");
  }
  else if (flag === 3) {
    res.status(403).send("Sorry, incorrect password.");
  } else { (flag === 0);
    res.status(403).send("That email does not exist.");
  }
});
//----------------------------------------------------------------
//register -------------------------------------------------------
// endpoint of form for email and password
app.get("/register", (req, res) => {
  let user_id = req.cookies["user_id"];
  let templateVars = { urls: urlDatabase,
                       user_id: user_id };
  res.render("register", templateVars);
});

// add new users to database
app.post("/register", (req, res) => {
  let loginID = generateRandomString();
  let emailArray = [];
  for (var id in users) {
    emailArray.push(users[id].email);
  }
  if (req.body.email === '' || req.body.password === '') {
    res.status(400).send(`Please enter an email and/or password`);
  }
  else if (emailArray.includes(req.body.email)) {
    res.status(400).send('This email is already in use!');
  } else {
    users[loginID] = req.body;
    users[loginID].id = loginID;
    res.cookie('user_id', loginID).redirect('/urls');
  }
});
//----------------------------------------------------------------
// enter new URL to be shortened
app.get("/urls/new", (req, res) => {
  // let user_id = req.cookies["user_id"];
  let templateVars = { user_id: user_id };
  res.render("urls_new", templateVars);
});

//redirect to longURL using shortURL
app.get("/u/:shortURL", (req, res) => {
  let longURL = urlDatabase[req.params.shortURL]; // let longURL = ...
  res.redirect(longURL);
});

// delete an url in urlDatabase
app.post("/urls/:shortURL/delete", (req, res) => {
  delete urlDatabase[req.params.shortURL];
  res.redirect('/urls');
});

// log out and clear cookies
app.post("/logout", (req, res) => {
  res.clearCookie("user_id");
  res.redirect('/urls');
});

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

