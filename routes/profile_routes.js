const router = require("express").Router();

const authCheck = (req, res, next) => {
    if (req.isAuthenticated()) {
        next();
    }else{
        return res.redirect("/auth/login");
    }
}

router.get("/", authCheck, (req, res) => {
    console.log("now we are in profile route");
    return res.render("profile", {user: req.user});     // req.user是從DeserializeUser()來的
})

module.exports = router