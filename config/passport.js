const JwtStrategy = require("passport-jwt").Strategy;
const { ExtractJwt } = require("passport-jwt");
const LocalStrategy = require("passport-local");
const jwt = require("jsonwebtoken");

const User = require("../models/user");
const config = require("./index");

const jwtOptions = {
  jwtFromRequest: ExtractJwt.fromAuthHeaderWithScheme("jwt"),
  secretOrKey: config.SECRET,
};

const localOptions = {
  usernameField: "email",
};

module.exports = (passport) => {
  passport.serializeUser((user, done) => {
    done(null, user.id);
  });

  passport.deserializeUser((id, done) => {
    User.findById(id, (err, user) => {
      done(err, user);
    });
  });

  passport.use(
    new LocalStrategy(localOptions, (email, password, done) => {
      User.findOne({ email })
        .then((user) => {
          if (!user) {
            console.log("[ERROR]:[USER_EMAIL_NOT_FOUND]");
            return done(null, false, { message: "Incorrect email address." });
          }
          user.comparePassword(password, (err1, isMatch) => {
            if (err1) {
              console.log("[ERROR]:[PASSWORD_MATCHING_FAILURE]", err1);
              return done(err1);
            }
            if (!isMatch) {
              console.log("[ERROR]:[WRONG_PASSWORD]");
              return done(null, false, { message: "Incorrect password" });
            }
            return done(null, user);
          });
        })
        .catch((err) => {
          return done(err);
        });
    })
  );

  passport.use(
    new JwtStrategy(jwtOptions, (payload, done) => {
      User.findOne({userId: payload.userId}, (err, user) => {
        if (err) {
          return done(err, false);
        }
        if (user) {
          done(null, user);
        } else {
          done(null, false);
        }
      });
    })
  );
};
