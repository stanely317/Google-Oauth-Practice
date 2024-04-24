const router = require("express").Router();
const passport = require("passport");
const User = require("../models/user_model");
const bcrypt = require("bcrypt");

router.get("/login", (req, res) => {
  return res.render("login", {user: req.user});
});

router.get("/logout", (req, res) => {
  req.logOut(err => {
    if (err) return res.send(err);
    return res.redirect("/");
  });
});

router.get("/signup", (req, res) => {
  return res.render("signup", {user: req.user});
})

router.get(
  "/google",
  passport.authenticate("google", {
    // 使用google的驗證方式
    scope: ["profile", "email"], // 要從google的resource server拿到的資料
    prompt: "select_account", // 每次登入時可選擇使用哪個帳號登入 (上面scope的email也是因為這個才需要)
  })
);

router.post("/signup", async (req, res) => {
  let {name, email, password} = req.body;
  if (password.length < 8){
    req.flash("error_msg", "密碼長度過短，需要至少8個英數字");
    return res.redirect("/auth/signup");
  }
  // 先檢查信箱是否有被註冊過
  let foundEmail = await User.findOne({email}).exec();
  if (foundEmail){
    req.flash("error_msg", "此信箱已註冊過，請使用其他信箱註冊；或直接使用信箱登入");
    return res.redirect("/auth/signup");
  }
  // 沒被使用過就可以儲存到DB
  let hashPassword = await bcrypt.hash(password, 11);
  let newUser = new User({name, email, password: hashPassword});
  await newUser.save();
  req.flash("success_msg", "註冊成功，導轉至登入頁面");
  return res.redirect("/auth/login");
});

router.get("/google/redirect", passport.authenticate("google"), (req, res) => {   // 因為這個route要通過google驗證才能使用，所以要authenticate
  console.log("entering redirect zone")
  return res.redirect("/profile");
});

module.exports = router;
