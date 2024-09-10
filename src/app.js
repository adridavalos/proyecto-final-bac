import express from "express";
import handlebars from "express-handlebars";
//import mongoose from 'mongoose'
import session from 'express-session';
//import fileStore from 'session-file-store';
import MongoStore from "connect-mongo";
import passport from 'passport';
import cors from 'cors';
import swaggerJsdoc from 'swagger-jsdoc';
import swaggerUiExpress from 'swagger-ui-express';
import cookieParser from 'cookie-parser';

import productsRouter from "./routes/productsRoutes.js";
import cartRouter from "./routes/cartsRoutes.js";
import viewRouter from "./routes/viewsRoutes.js";
import resetPasswordRoutes from "./routes/resetPasswordRoutes.js"
import config from "./config.js";
import initSoket from "./services/sockets.js";
import sessionRouter from "./routes/sessionsRoutes.js";
import MongoSingleton from './services/mongo.singleton.js'
//import TestRouter from "./routes/testRouter.js";
import usersRouter from "./routes/usersRoutes.js"

import { generateMockProducts } from "./services/mocking.js";
import errorsHandler from "./services/errors/errors.handler.js";
import addLogger from "./services/logging/logger.js";
const app = express();
app.use(cookieParser());

const expressInstance = app.listen(config.PORT, async() => {
  //await mongoose.connect(config.MONGODB_URI);
  MongoSingleton.getInstance();
  const socketServer = initSoket(expressInstance);
  app.set("socketServer", socketServer); //referencia global
  app.use(cors()); //para poder habilitar pegarle a distintas rutas, mecanismo de defensa

  app.use(express.json({
    origin:'*'//pueden acceder todos desde cualquier lugar, politica abierta
  }));
  app.use(express.urlencoded({ extended: true }));

  // Activamos el uso del módulo de sesiones para identificar usuarios

  /**
   * Agregamos persistencia al manejo de sesiones:
   *
   * session-file-store: almacenamiento en archivos (habilitar la línea fileStorage debajo)
   * connect-mongo: almacenamiento en colección MongoDB
   *
   * ttl = time to live (tiempo de vida de la sesión en segundos)
   */

  //const fileStorage = fileStore(session);
  app.use(
    session({
      //para persistencia en archivo
      //store: new fileStorage({ path: "./sessions", ttl: 100, retries: 0 }),
      //para mongo
      store: MongoStore.create({ mongoUrl: config.MONGODB_URI, ttl: 1000 }),
      secret: config.SECRET,
      resave: true,
      saveUninitialized: true,
    })
  );

  // Solo inicializamos passport y el enlace a session
  app.use(passport.initialize());
  app.use(passport.session());

  app.engine("handlebars", handlebars.engine());
  app.set("views", `${config.DIRNAME}/views`);
  app.set("view engine", "handlebars");

  app.use(addLogger);

  app.use("/api/products", productsRouter);
  app.use("/api/carts", cartRouter);
  app.use("/", viewRouter);
  app.use("/api/sessions", sessionRouter);
  app.use("/api/reset-password", resetPasswordRoutes);
  app.use("/api/users",usersRouter);
  //app.use("/api/test",new TestRouter().getRouter());
  app.use("/static", express.static(`${config.DIRNAME}/public`));

  // Generamos objeto base config Swagger y levantamos
  // endpoint para servir la documentación
  const swaggerOptions = {
    definition: {
        openapi: '3.0.1',
        info: {
            title: 'Documentación sistema Products',
            description: 'Esta documentación cubre toda la API habilitada para Products',
        },
    },
    apis: ['./src/docs/**/*.yaml'], // todos los archivos de configuración de rutas estarán aquí
  };
  const specs = swaggerJsdoc(swaggerOptions);
  app.use('/api/docs', swaggerUiExpress.serve, swaggerUiExpress.setup(specs));
  //Manejo de error
  app.use(errorsHandler);
  //MOCKINS
  app.get('/mockingproducts', async(req, res) => {
    const fakeProducts = await generateMockProducts(1);
    res.status(200).send(fakeProducts[0])
  });

  console.log(`Servidor activo en puerto ${config.PORT} PID ${process.pid}`);
});