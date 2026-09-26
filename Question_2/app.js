const express = require("express");
const session = require("express-session");
const FileStore = require("session-file-store")(session);
const path = require("path");

const app = express();

const PORT = 3000;


// --------------------------------------------------
// EJS SETUP
// --------------------------------------------------

app.set("view engine", "ejs");

app.set(
    "views",
    path.join(__dirname, "views")
);


// --------------------------------------------------
// MIDDLEWARE
// --------------------------------------------------

app.use(express.urlencoded({ extended: true }));


// --------------------------------------------------
// SESSION CONFIGURATION
// --------------------------------------------------

app.use(
    session({

        store: new FileStore({

            path: "./sessions",

            ttl: 60 * 60,

            retries: 0

        }),

        secret: "my-secret-key",

        resave: false,

        saveUninitialized: false,

        cookie: {

            maxAge: 60 * 60 * 1000

        }

    })
);


// --------------------------------------------------
// LOGIN PAGE
// --------------------------------------------------

app.get("/", (req, res) => {

    res.render("login", {
        error: null
    });

});


// --------------------------------------------------
// LOGIN
// --------------------------------------------------

app.post("/login", (req, res) => {

    const { username, password } = req.body;


    // Demo credentials

    if (
        username === "admin" &&
        password === "12345"
    ) {

        // Create session

        req.session.user = {
            username: username
        };

        res.redirect("/home");

    } else {

        res.render("login", {
            error: "Invalid username or password"
        });

    }

});


// --------------------------------------------------
// AUTHENTICATION MIDDLEWARE
// --------------------------------------------------

function isAuthenticated(req, res, next) {

    if (req.session.user) {

        next();

    } else {

        res.redirect("/");

    }

}


// --------------------------------------------------
// PROTECTED ROUTE 1
// --------------------------------------------------

app.get(
    "/home",
    isAuthenticated,
    (req, res) => {

        res.render("home", {
            username: req.session.user.username
        });

    }
);


// --------------------------------------------------
// PROTECTED ROUTE 2
// --------------------------------------------------

app.get(
    "/profile",
    isAuthenticated,
    (req, res) => {

        res.render("profile", {
            username: req.session.user.username
        });

    }
);


// --------------------------------------------------
// LOGOUT
// --------------------------------------------------

app.get("/logout", (req, res) => {

    req.session.destroy((err) => {

        if (err) {

            return res.send(
                "Unable to logout"
            );

        }

        res.redirect("/");

    });

});


// --------------------------------------------------
// START SERVER
// --------------------------------------------------

app.listen(PORT, () => {

    console.log(
        `Server running at http://localhost:${PORT}`
    );

});