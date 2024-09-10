
import path from "path";
import { Command } from "commander";
import dotenv from "dotenv";
  
const commandLine = new Command();
commandLine
  .option("--mode <mode>")
  .option("--port <port>")
  .option("--setup <number>");
commandLine.parse();
const clOptions = commandLine.opts();
const mode = clOptions.mode || 'dev';
dotenv.config({ path: `.env.${mode}` });
//dotenv.config();
const config = {
  SERVER: "atlas_16",
  PORT: clOptions.port || process.env.PORT,
  DIRNAME: path.dirname(
    new URL(import.meta.url).pathname.replace(/^\/([A-Za-z]:\/)/, "$1")
  ), // Win
  // Esta función tipo getter nos permite configurar dinámicamente
  // la propiedad UPLOAD_DIR en base al valor de otra propiedad (DIRNAME)
  // https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Functions/get
  get UPLOAD_DIR() {return `${this.DIRNAME}/uploads`},
   // Función getter
  MONGODB_URI:process.env.MONGODB_URI ,
  SECRET: process.env.SECRET,
  MONGODB_ID_REGEX: /^[a-fA-F0-9]{24}$/,

  GITHUB_CLIENT_ID: process.env.GITHUB_CLIENT_ID,
  GITHUB_CLIENT_SECRET: process.env.GITHUB_CLIENT_SECRET,
  GITHUB_CALLBACK_URL: process.env.GITHUB_CALLBACK_URL,
  GMAIL_APP_USER: 'adavalos654@gmail.com',
  GMAIL_APP_PASS: process.env.GMAIL_APP_PASS
};

export default config;
