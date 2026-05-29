import passport from "passport";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";
import User from "../modules/users/users.model.js";
import { sendRegistrationEmail } from "../services/email.service.js";

const configurePassport = () => {
  if (
    !process.env.GOOGLE_OAUTH_CLIENT_ID ||
    !process.env.GOOGLE_OAUTH_CLIENT_SECRET
  ) {
    return;
  }

  passport.use(
    new GoogleStrategy(
      {
        clientID: process.env.GOOGLE_OAUTH_CLIENT_ID,
        clientSecret: process.env.GOOGLE_OAUTH_CLIENT_SECRET,
        callbackURL:
          process.env.GOOGLE_OAUTH_CALLBACK_URL ||
          "http://localhost:5454/api/auth/google/callback",
      },
      async (_accessToken, _refreshToken, profile, done) => {
        try {
          const email = profile.emails?.[0]?.value?.toLowerCase();

          if (!email) {
            return done(new Error("Google account has no email"), null);
          }

          let user = await User.findOne({
            $or: [{ googleId: profile.id }, { email }],
          });

          if (user) {
            if (!user.googleId) {
              user.googleId = profile.id;
              if (profile.photos?.[0]?.value) {
                user.avatar = profile.photos[0].value;
              }
              await user.save();
            }
          } else {
            user = await User.create({
              googleId: profile.id,
              firstName: profile.name?.givenName || "Google",
              lastName: profile.name?.familyName || "User",
              email,
              avatar: profile.photos?.[0]?.value || "",
              isVerified: true,
            });

            try {
              await sendRegistrationEmail(user);
            } catch (err) {
              console.error("Registration email failed:", err.message);
            }
          }

          if (!user.isActive) {
            return done(new Error("Your account has been deactivated"), null);
          }

          return done(null, user);
        } catch (error) {
          return done(error, null);
        }
      }
    )
  );
};

export default configurePassport;
