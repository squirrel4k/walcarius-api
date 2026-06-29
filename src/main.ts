import { NestFactory } from "@nestjs/core";
import { NestExpressApplication } from "@nestjs/platform-express";
import { AppModule } from "./app/app.module";
import * as Dotenv from "dotenv";
import { WinstonLogger } from "./app/common/logger/winston.logger";
import { CSRF_HEADER_NAME } from "./app/auth/auth.const";
import { TranslationUtil } from "./core/utils/translation.util";
import { LANG } from "./core/enums/language.enum";
import { AnyExceptionFilter } from "./core/errors/exception-filter/any.filter";
import bodyParser = require("body-parser");

// Load .env file
Dotenv.config();

// Define CORS options
export const CORS_OPTIONS = {
  origin: process.env.WAL_LOCAL_FRONT_URL ? [ process.env.WAL_FRONT_URL, process.env.WAL_LOCAL_FRONT_URL ] : process.env.WAL_FRONT_URL,
  methods: [ "GET" , "POST", "PUT", "DELETE", "PATCH", "OPTIONS" ],
  allowedHeaders: [ "Origin", "lazyinit", "lazyupdate", "normalizednames", "headers", "Content-Type", "Authorization", "Content-Length", "X-Requested-With", CSRF_HEADER_NAME, "Access-Control-Allow-Origin" ],
  exposedHeaders: [ CSRF_HEADER_NAME, "Authorization" ],
  credentials: true,
  preflightContinue: false,
  optionsSuccessStatus: 200
};

async function bootstrap() {

  // Bootstrap the application
  const app = await NestFactory.create<NestExpressApplication>(AppModule, {
    logger: ["error", "warn", "log"]
  });

  const logger = app.get(WinstonLogger);

  // Add custom logger
  app.useLogger(app.get(WinstonLogger));

  // Add bodyParser
  app.use(bodyParser.json({ limit: "10mb" }));
  app.use(bodyParser.urlencoded({ limit: "10mb", extended: false }));

  // Add Global "any" filter
  app.useGlobalFilters(new AnyExceptionFilter(logger));

  // Set CORS options
  app.enableCors(CORS_OPTIONS);

  // Add static directory
  app.useStaticAssets(process.env.WAL_STATIC_FILE_DEST || '');

  console.log("[DEBUG] Initializing translations...");
  // Load base translations
  await TranslationUtil.init([LANG.EN, LANG.FR, LANG.NL], logger);
  console.log("[DEBUG] Translations done");

  const port = process.env.NODE_APP_INSTANCE ?
    parseInt(process.env.WAL_PORT, 10) + parseInt(process.env.NODE_APP_INSTANCE, 10) :
    parseInt(process.env.WAL_PORT, 10);

  console.log(`[DEBUG] Listening on port ${port}...`);
  // Launch application
  await app.listen(port);
  console.log("[DEBUG] App started!");
}

bootstrap().catch(err => {
  console.error("=== BOOTSTRAP ERROR ===");
  console.error(err);
  process.exit(1);
});
