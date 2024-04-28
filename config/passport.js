const passport = require("passport");
const GoogleStrategy = require("passport-google-oauth20");
const User = require("../models/user_model");
const LocalStrategy = require("passport-local");
const bcrypt = require("bcrypt");

passport.serializeUser( (user, done) => {   // 這裡的done和下面use裡async的沒有關聯
  console.log("serializing user ...");
  // console.log(user);  // user會是最下面if statement的done的第二個傳入參數送過來的
  done(null, user._id);  // 這邊的done是由上面arrow func裡的參數來的
  // 用途是：將mongoDB的id存在session內，並將id簽名後，以cookie的形式傳給使用者
})

passport.deserializeUser( async (_id, done) => {
  console.log("Deserialize user, 使用Serialize user時儲存的id去尋找資料庫中的資料");
  let foundUser = await User.findOne({_id});
  done(null, foundUser);  // 將req.user的值設定為foundUser
})

passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: "http://localhost:8000/auth/google/redirect" // 拿到想要的資料後，要重新導向到的URL
    },
    async (accessToken, refreshToken, profile, done) => {
      console.log("entering GoogleStrategy");
      // console.log(profile);
      console.log("=========================================");
      let foundUser = await User.findOne({googleID: profile.id}).exec();
      if (foundUser){
        console.log("this user is already exist in DB");
        done(null, foundUser);  // 從上面async內的參數done來的，第一個參數固定是null
      }else{
        console.log("this is a new user, needing to save in DB");
        let newUser = new User({
          name: profile.displayName,
          googleID: profile.id,
          thumbnail: profile.photos[0].value,
          email: profile.emails[0].value
        });
        let savedUser = await newUser.save();
        console.log("the new user is saved");
        done(null, savedUser);  // 從上面async func來的
      }
    }
  )
);

passport.use( new LocalStrategy(async (username, password, done) => {   // login.ejs登入時用的變數名稱(username, password)要跟這裡一樣才會自動套入
  let foundUser = await User.findOne({email: username});
  if (foundUser){
    let result = await bcrypt.compare(password, foundUser.password);
    if (result){
      done(null, foundUser);  // 要放入foundUser，這樣serialize User時才能存取到資料(ID)
    }else {
      done(null, false);
    }
  }else {
    done(null, false);  // done是從LocalStrategy那邊來的，第二個參數設為false表示驗證失敗
  }
}))
