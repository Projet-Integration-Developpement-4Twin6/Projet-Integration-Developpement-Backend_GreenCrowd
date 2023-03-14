const User = require("../../models/userSchema.js");
const InvalidCreationException = require("../../exceptions/invalid-credential-exception");
const bcrypt = require("bcrypt");
const userControllers = require("../userControllers.js");
const jwt = require("jsonwebtoken");
const { appKey, tokenExpiresIn } = require("../../config/app.js");
const session = require("express-session");
const passport = require("passport");
const LocalStrategy = require("passport-local").Strategy;
const GoogleStrategy = require("passport-google-oauth2").Strategy;
const findOrCreate = require("mongoose-findorcreate");
const { addUser } = require('../../controllers/userControllers');

class AuthController {
  async login(req, res) {
    const { email, password } = req.body;

    passport.use(
      new LocalStrategy(
        {
          usernameField: "email",
        },
        async function verify(email, password, cb) {
          const user = await User.findOne({ email });

          if (!user) {
            return cb(null, false, {
              message: "Incorrect username or password.",
            });
          }

          if (!(await bcrypt.compare(password, user.password))) {
            return cb(null, false, {
              message: "Incorrect username or password.",
            });
          }

          return cb(null, user);
        }
      )
    );

    passport.authenticate("local", function (err, user, info) {
      if (err) {
        return console.error(err);
      }
      if (!user) {
        console.log("Incorrect username or password");
        res.send(" failed to authent");
      }
      console.log("User successfully authenticated");
      req.logIn(user, function (err) {
        if (err) {
          return console.error(err);
        }
        console.log("User successfully logged in");
        res.redirect("/users/test");
        //res.send(user);
      });
    })(req, res);

    //     const { email, password } = req.body;

    //     // find the user with mongo
    // const u = await User.findOne({
    //   email,
    // });

    //     //check if user's email is right
    //     if (!u)
    //     return res.status(403).send("Invalid login credentials");

    //     //check if user's password is correct

    //    // if (password !== u.password)

    //    if(!await bcrypt.compare(password, u.password))
    //       return res.status(403).send("Invalid login credentials");

    // //part2
    //       const payload = {id : u.id, email : u.email, username: u.username, first_name: u.first_Name, last_name: u.last_Name};
    //       const accessToken = jwt.sign(payload,appKey,{expiresIn: tokenExpiresIn})
    //       res.send({u,...{accessToken}});
    // //////////////////////////////

    //       console.log(u);
    //      //res.send(u);
  }

  async register(req, res) {
    const { email, password } = req.body;
    const user = new User();
   user.email = email;
    user.password = password;
    

    //userControllers.addUser(user);

    //     User.register({username:req.body.email }, req.body.password, function(err, user) {
    //       if (err) {
    //         console.log('testttt error')
    //         console.log(user);
    //         res.send(user);
    //        }

    //        else{
    //         passport.authenticate("local")(req, res, ()=>{
    //           console.log("testt")
    // console.log(user);
    //           res.send(user);

    //         }  )

    //         //  console.log( res.redirect('../test'));

    //        }

    //       // console.log(user);

    //    } );

    try {
      await user.save();
    //addUser(req, res)
      passport.authenticate("local")(req, res, function () {
        res.redirect("/users/test");
      });
    } catch (err) {
      console.error(err);
      res.status(500).send("Error saving user to database");

      res.redirect("/users/register");
    }
  }

  async logout(req, res) {
    req.logout(function (err) {
      if (err) {
        return next(err);
      }
      res.redirect("/users/test");
    });
  }

  async loginGoogle(req, res) {
    passport.use(
      new GoogleStrategy(
        {
          clientID: process.env.client_id,
          clientSecret: process.env.client_secret,
          callbackURL: "http://localhost:5000/auth/google/callback",
          userProfileURL: "https://www.googleapis.com/oauth2/v3/userinfo",
          passReqToCallback: true,
        },
        async function (req, accessToken, refreshToken, profile, done) {
          try {
            console.log(profile);
            const existingUser = await User.findOne({ googleId: profile.id });
            if (existingUser) {
              return done(null, existingUser);
            }
            const newUser = new User({
              googleId: profile.id,
              username:profile.displayName,
              first_Name: profile.given_name,
              last_Name: profile.family_name,
              email: profile.emails[0].value,
              image_user:profile.photos[0].value
            });
            await newUser.save();
            done(null, newUser);
          } catch (err) {
            done(err, false);
          }
        }
      )
    );
    
        passport.authenticate("google", { scope: ["profile","email"] })(req, res);
      }
    
      async callbackGoogle(req, res) {}

}

module.exports = new AuthController();
