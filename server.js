const express = require("express");
const app = express();
const port = process.env.PORT;

const User = require("./models/users.js");
const Scores = require("./models/scores.js");
const mongoose = require("mongoose");
const methodOverride = require("method-override");
const session = require("express-session");
app.use(express.urlencoded({ extended: true }));
app.use(methodOverride("_method"));
app.use(
  session({
    secret: "F6952D6EEF555DDD87ACA66E56B91530222D6E318414816F3BA7CF5BF694BF0F",
    resave: false,
    saveUninitialized: false
  })
);

//main page
app.get("/", (req, res) => {
  if (req.session.loggedIn) {
    res.render("mainpage.ejs", {
      loggedIn: req.session.loggedIn,
      username: req.session.username
    });
  } else {
    res.render("mainpage.ejs", { loggedIn: false, username: "" });
  }
});
//Login page
app.get("/login", (req, res) => {
  if (req.session.loggedIn) {
    res.render("login.ejs", {
      loggedIn: req.session.loggedIn,
      username: req.session.username
    });
  } else {
    res.render("login.ejs", { loggedIn: false, username: "" });
  }
});

//registration page
app.get("/user/new", (req, res) => {
  User.find((e, usercount) => {
    res.render("new.ejs", {
      redirect: false,
      userCount: usercount.length
    });
  });
});

app.get("/leaderboard/new", (req, res) => {
  res.render("entry.ejs");
});

//Read / Login / Logout Route
app.post("/user/login", (req, res) => {
  User.findOne({ username: req.body.username }, (e, userProfile) => {
    if (req.body.password == userProfile.password) {
      req.session.loggedIn = true;
      req.session.username = req.body.username;
      res.redirect(`/user/${userProfile.username}`);
    } else {
      res.set("Content-Type", "text/html");
      res.send(
        `<h1>Wrong Username or Password!</h1><br/><p>redirecting...</p><script>setTimeout(function(){ window.location.href = "/"; }, 3000);</script>`
      );
    }
  });
});

app.get("/leaderboard", (req, res) => {
  Scores.find({}, (e, scores) => {
    if (e) {
      console.log(e);
    } else {
      res.render("show.ejs", {
        username: req.session.username,
        data: scores,
        loggedIn: req.session.loggedIn
      });
    }
  });
});

app.get("/user/:username", (req, res) => {
  if (req.params.username === req.session.username) {
    User.findOne({ username: req.params.username }, (e, userProfile) => {
      res.render("userProfile.ejs", {
        playerName: userProfile.username,
        user: userProfile,
        editable: true
      });
    });
  } else {
    User.findOne({ username: req.params.username }, (e, userProfile) => {
      res.render("userProfile.ejs", {
        loggedIn: req.session.loggedIn ? req.session.loggedIn : false,
        username: req.session.loggedIn ? req.session.username : "",
        playerName: userProfile.username,
        user: userProfile,
        editable: false
      });
    });
  }
});

app.get("/logout", (req, res) => {
  req.session.destroy(err => {
    if (err) {
      console.log(err);
    } else {
      res.send(
        `<h1>Successfully logged out.</h1><br/><p>redirecting...</p><script>setTimeout(function(){ window.location.href = "/"; }, 3000);</script>`
      );
    }
  });
});

//Update Route
app.get("/user/:username/edit", (req, res) => {
  if (req.params.username == req.session.username) {
    User.findOne({ username: req.params.username }, (e, userProfile) => {
      if (e) {
        console.log(e);
      } else {
        res.render("editProfile.ejs", {
          playerName: userProfile.username,
          user: userProfile
        });
      }
    });
  } else {
    res.send(
      `<h1>You do not have permission to edit.</h1><br/><p>redirecting...</p><script>setTimeout(function(){ window.location.href = "/"; }, 3000);</script>`
    );
  }
});

app.put("/user/:username/edit", function(req, res) {
  console.log(req.body);
  if (!req.body.oldpass) {
    res.render("editProfile.ejs", {});
  }
  req.body.newpass =
    req.body.newpass && req.body.newrepass
      ? req.body.newpass
      : req.body.oldpass;
  User.findOneAndUpdate(
    { username: req.params.username },
    {
      username: req.body.username,
      password: req.body.newpass
    },
    function(e, userProfile) {
      if (e) {
        res.send(e);
      } else {
        res.redirect("/user/" + userProfile.username);
      }
    }
  );
});

//      Registration Route
app.post("/user", (req, res) => {
  function consistencyCheck(input) {
    console.log("consistencyCheck ran on " + JSON.stringify(input));
    // let redirect = {};
    User.findOne({ username: input.username }, (e, userProfile) => {
      if (userProfile) {
        let redirect = { reason: false };
        redirect.reason = "username";
        redirect.body = userProfile.username;
        User.find((e, usercount) => {
          res.render("new.ejs", {
            redirect: redirect,
            userCount: usercount.length
          });
        });
      }
    });

    User.findOne({ email: input.email }, (e, userProfile) => {
      if (userProfile) {
        let redirect = { reason: false };
        redirect.reason = "email";
        redirect.body = userProfile.email;
        User.find((e, usercount) => {
          res.render("new.ejs", {
            redirect: redirect,
            userCount: usercount.length
          });
        });
      }
    });

    if (input.password != input.repassword || input.password == "") {
      let redirect = { reason: false };
      redirect.reason = "passwords";
      User.find((e, usercount) => {
        res.render("new.ejs", {
          redirect: redirect,
          userCount: usercount.length
        });
      });
    }
    //deprecated: Change this code to only alter the current page(i.e. the registration page).
    // res.set("Content-Type", "text/html");
    // res.send(
    //   `<h1>Failed to register!</h1><br/><p>redirecting back to registration page...</p><script>setTimeout(function(){ window.location.href = "/user/new"; }, 3000);</script>`
    // );
  }

  if (
    // validityCheck("username", req.body.username) &&
    // validityCheck("email", req.body.email) &&
    req.body.password == req.body.repassword &&
    req.body.password != ""
  ) {
    //TODO: update the condition to include more scenarios.
    delete req.body.repassword;
    User.create(req.body, (e, userProfile) => {
      if (e) {
        console.log(e);
      }
      res.set("Content-Type", "text/html");
      res.send(
        `<h1>Registration Successful! Welcome, ${userProfile.username}</h1><br/><p>redirecting...</p><script>setTimeout(function(){ window.location.href = "/"; }, 3000);</script>`
      );
    });
  } else {
    consistencyCheck(req.body);
  }
});

app.post("/leaderboard", (req, res) => {
  chronos = req.body.timing.split("/");
  req.body.timing = {
    hours: chronos[0],
    minutes: chronos[1],
    seconds: chronos[2],
    milliseconds: chronos[3]
  };
  Scores.create(req.body, (e, leaderBoard) => {
    if (e) {
      console.log(e);
    }
    res.set("Content-Type", "text/html");
    res.send(
      `<h1>Entry Successful!</h1><br/><p>redirecting...</p><script>setTimeout(function(){ window.location.href = "/"; }, 3000);</script>`
    );
  });
});

app.listen(port, () => {
  console.log("listening");
});

// mongoose.connect("mongodb://localhost:27017/ODDB", { useNewUrlParser: true });
// mongoose.connection.once("open", () => {
//   console.log("connected to overdozeDB @ Localhost");
// });

mongoose.connect(process.env.MONGODB_URI, { useNewUrlParser: true });
mongoose.connection.once("open", () => {
  console.log("connected to overdozeDB @ Mongo Atlas");
});
