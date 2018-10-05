var urlDatabase = {
  "b2xVn2": {
    longURL: "http://www.lighthouselabs.ca",
    userID: "j8Ui3w"
  },
  "9sm5xK": {
    longURL: "http://www.google.com",
    userID: "L2Yp3s"
  },
  "8gh2h2": {
    longURL: "http://www.google.ca",
    userID: "L2Yp3s"
  }
};

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

console.log(urlsForUser("L2Yp3s"));
console.log(urlsForUser("j8Ui3w"));