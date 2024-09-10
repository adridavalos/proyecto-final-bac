import passport from "passport";
import local from "passport-local";
import GitHubStrategy from "passport-github2";

import config from "../config.js";
import UsersManager from "../controllers/users.manager.mdb.js";
import cartManager from "../controllers/cartManager.js";
const localStrategy = local.Strategy;
const manager = new UsersManager();
const cartsManager = new cartManager();

const initAuthStrategies = () => {
  // Estrategia local (cotejamos contra nuestra base de datos)
    passport.use("login", new localStrategy(
        { passReqToCallback: true, usernameField: "email" },
        async (req, username, password, done) => {
            try {
            const result = await manager.credentialAreCorrect(username, password);
            if (!result) {
                return done(null, false);
            } 
            return done(null,result);
            } catch (err) {
            return done(err, false);
            }
        }
        )
    );

   // Estrategia de terceros (autenticamos a través de un servicio externo)
    passport.use("ghlogin",new GitHubStrategy(
        {
            clientID: config.GITHUB_CLIENT_ID,
            clientSecret: config.GITHUB_CLIENT_SECRET,
            callbackURL: config.GITHUB_CALLBACK_URL,
            scope : "user:email"
        },
        async (req, accessToken, refreshToken, profile, done) => {
            try {
            const email = profile.emails[0].value;
            if (email) {
                const foundUser = await manager.getOne({ email: email });

                if (!foundUser) {
                    const user = {
                        firstName: profile._json.name.split(" ")[0],
                        lastName: profile._json.name.split(" ")[1],
                        email: email,
                        password: "none",
                    };

                    const process = await manager.Aggregated(user);
                    cartsManager.addCart(process._id.toHexString());

                    console.log("Creo el usuario de manera exitosa");
                    return done(null, process);
                } else {
                return done(null, foundUser);
                }
            } else {
                return done(new Error("Faltan datos de perfil"), null);
            }
            } catch (err) {
            return done(err, false);
            }
        }
        )
    );

    passport.serializeUser((user, done) => {
        done(null, user);
    });

    passport.deserializeUser((user, done) => {
        done(null, user);
    });
};

export default initAuthStrategies;
