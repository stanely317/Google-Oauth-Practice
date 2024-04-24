const dotenv = require("dotenv");
dotenv.config();
const express = require("express");
const app = express();
const mongoose = require("mongoose");
const authRoutes = require("./routes/auth_routes");
const profileRoutes = require("./routes/profile_routes");
const session = require("express-session");
const passport = require("passport");
const flash = require("connect-flash");

require("./config/passport"); // require就會自動執行裡面的程式碼

mongoose
  .connect("mongodb://localhost:27017/GoogleDB")
  .then(() => {
    console.log("connecting to mongodb");
  })
  .catch((e) => {
    console.log(e);
  });

app.set("view engine", "ejs");
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(
  session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    cookie: { secure: false },
  })
);
app.use(passport.initialize()); // 開始運行passport的認證功能
app.use(passport.session());    // 讓passport可以使用session
app.use(flash());
app.use((req, res, next) => {
  res.locals.success_msg = req.flash("success_msg");  // 儲存在locals裡的值，可以直接在ejs裡面使用
  res.locals.error_msg = req.flash("error_msg");
  res.locals.error = req.flash("error");
  next();
})

// 設定route
app.use("/auth", authRoutes);
app.use("/profile", profileRoutes);

app.get("/", (req, res) => {
  return res.render("index", {user: req.user});
});

app.listen(8000, () => {
  console.log("listening to port 8000 ...");
});
