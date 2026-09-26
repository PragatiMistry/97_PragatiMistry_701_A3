const express = require("express");
const path = require("path");
const multer = require("multer");

const {
    body,
    validationResult
} = require("express-validator");

const app = express();

const PORT = 3000;

// EJS setup
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

// Middleware
app.use(express.urlencoded({ extended: true }));

// Serve uploaded files
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// --------------------------------------------------
// MULTER CONFIGURATION
// --------------------------------------------------

const storage = multer.diskStorage({

    destination: function (req, file, cb) {

        if (file.fieldname === "profilePic") {
            cb(null, "uploads/profile");
        } else {
            cb(null, "uploads/others");
        }

    },

    filename: function (req, file, cb) {

        const uniqueName =
            Date.now() + "-" + file.originalname;

        cb(null, uniqueName);
    }
});


// File type validation
const fileFilter = function (req, file, cb) {

    const allowedTypes = [
        "image/jpeg",
        "image/jpg",
        "image/png",
        "image/gif"
    ];

    if (allowedTypes.includes(file.mimetype)) {
        cb(null, true);
    } else {
        cb(new Error("Only JPG, JPEG, PNG and GIF images are allowed."));
    }
};


// Multer upload configuration
const upload = multer({

    storage: storage,

    fileFilter: fileFilter,

    limits: {
        fileSize: 2 * 1024 * 1024
    }

}).fields([

    {
        name: "profilePic",
        maxCount: 1
    },

    {
        name: "otherPics",
        maxCount: 5
    }

]);


// --------------------------------------------------
// GET REGISTRATION FORM
// --------------------------------------------------

app.get("/", (req, res) => {

    res.render("form", {
        errors: [],
        values: {},
        uploadError: null
    });

});


// --------------------------------------------------
// POST REGISTRATION FORM
// --------------------------------------------------

app.post(
    "/register",

    upload,

    [

        body("username")
            .trim()
            .notEmpty()
            .withMessage("Username is required.")
            .isLength({ min: 3 })
            .withMessage("Username must contain at least 3 characters."),

        body("password")
            .notEmpty()
            .withMessage("Password is required.")
            .isLength({ min: 6 })
            .withMessage("Password must contain at least 6 characters."),

        body("confirmPassword")
            .notEmpty()
            .withMessage("Confirm password is required.")
            .custom((value, { req }) => {

                if (value !== req.body.password) {
                    throw new Error("Passwords do not match.");
                }

                return true;
            }),

        body("email")
            .trim()
            .notEmpty()
            .withMessage("Email is required.")
            .isEmail()
            .withMessage("Enter a valid email address."),

        body("gender")
            .notEmpty()
            .withMessage("Please select your gender."),

        body("hobbies")
            .isArray({ min: 1 })
            .withMessage("Please select at least one hobby.")

    ],

    (req, res) => {

        const errors = validationResult(req);

        // Store uploaded files
        const profilePic =
            req.files && req.files.profilePic
                ? req.files.profilePic[0]
                : null;

        const otherPics =
            req.files && req.files.otherPics
                ? req.files.otherPics
                : [];

        // --------------------------------------------------
        // VALIDATION ERROR
        // --------------------------------------------------

        if (!errors.isEmpty()) {

            return res.render("form", {

                errors: errors.array(),

                values: req.body,

                uploadError: null

            });

        }


        // --------------------------------------------------
        // FILE VALIDATION
        // --------------------------------------------------

        if (!profilePic) {

            return res.render("form", {

                errors: [
                    {
                        msg: "Profile picture is required."
                    }
                ],

                values: req.body,

                uploadError: null

            });

        }


        // --------------------------------------------------
        // ALL DATA VALID
        // --------------------------------------------------

        res.render("result", {

            data: req.body,

            profilePic: profilePic,

            otherPics: otherPics

        });

    }
);


// --------------------------------------------------
// DOWNLOAD ROUTE
// --------------------------------------------------

app.get("/download/:folder/:filename", (req, res) => {

    const folder = req.params.folder;
    const filename = req.params.filename;

    const filePath = path.join(
        __dirname,
        "uploads",
        folder,
        filename
    );

    res.download(filePath, filename, (err) => {

        if (err) {
            console.log("Download error:", err.message);
        }

    });

});


// --------------------------------------------------
// ERROR HANDLER
// --------------------------------------------------

app.use((err, req, res, next) => {

    console.log(err.message);

    res.render("form", {

        errors: [
            {
                msg: err.message
            }
        ],

        values: req.body || {},

        uploadError: err.message

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