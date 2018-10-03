var express = require("express");
var app = express();
var PORT = 8080;
const bodyParser = require("body-parser");
const cookieParser = require('cookie-parser');

app.use(bodyParser.urlencoded({extended: true}));
app.use(cookieParser());

app.set('view engine', 'ejs');

var urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};

app.get("/", (req, res) => {
  res.send("Hello! Welcome to TinyApp");
  });

app.get("/urls", (req, res) => {
    // console.log(req.cookies);
  let username = req.cookies["username"];
  let templateVars = { urls: urlDatabase,
    username: username};
  res.render("urls_index", templateVars);
});

// enter new URL to be shortened
app.get("/urls/new", (req, res) => {
  let templateVars = { username: username };
  res.render("urls_new", templateVars);
});

// show short and long URL and give option to change longURL
app.get("/urls/:id", (req, res) => {
  let templateVars = {
    shortURL: req.params.id,
    longURL: urlDatabase[req.params.id],
    username: username
  };
  // console.log("this should be a truthy value", username === true);
  res.render("urls_show", templateVars);
});

// app.get("/urls.json", (req, res) => {
//   res.json(urlDatabase.b2xVn2);
//   });

// app.get("/hello", (req, res) => {
//   res.send("<html><body>Hello <b>World</b></body></html>\n");
// });

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});

// ??????
// console.log(req.cookies);
// let templateVars = {
//   username: req.cookies["Username"],
//   urls: urlDatabase
//   // ... any other vars
// };
// res.render("urls_index","urls_new","urls_show", templateVars);

// endpoint of form for email and password
app.get("/register", (req, res) => {
  let username = req.cookies["username"];
  let templateVars = { urls: urlDatabase,
                       username: username};
  res.render("register", templateVars);
});

app.post("/urls/:id", (req, res) => {
  // console.log("we are in the update", req.params.id);
  // change longURL in database corresponding to :id
  urlDatabase[req.params.id] = req.body.longURL;// new long URL
  let shortURL = req.params.id;
  res.redirect(`/urls/${shortURL}`);

});

// generate random string for URL
app.post("/urls", (req, res) => {
  var shortURL = generateRandomString();
  urlDatabase[shortURL] = req.body.longURL;
  // console.log(urlDatabase);  // debug statement to see POST parameters
  res.redirect(`/urls/${shortURL}`);
  // console.log(urlDatabase);      // Respond with 'Ok' (we will replace this)
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

// set login username as cookie
app.post("/login", (req, res) => {
  var key  = Object.keys(req.body)[0];
  var username = req.body[key];
  // console.log(username);
  res.cookie('username', username).redirect("/urls");
  // .send(`Logged in as ${req.body[Username]}.`);
});

// log out and clear cookies
app.post("/logout", (req, res) => {
  res.clearCookie("username");
  res.redirect('/urls');
});

function generateRandomString() {
var randomString = '';
var possibleChars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ123456789';
// console.log(possibleChars.length);
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


// console.log(generateRandomString());


