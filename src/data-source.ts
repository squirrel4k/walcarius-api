import "reflect-metadata";
import * as Dotenv from "dotenv";
import { DataSource } from "typeorm";

Dotenv.config();

export const AppDataSource = new DataSource({
    type: "mysql",
    host: process.env.WAL_MYSQL_HOST || "127.0.0.1",
    port: parseInt(process.env.WAL_MYSQL_PORT || "3306", 10),
    username: process.env.WAL_MYSQL_USER || "walcarius",
    password: process.env.WAL_MYSQL_PASSWORD,
    database: process.env.WAL_MYSQL_DBNAME || "walcarius",
    charset: "utf8mb4",
    entities: ["src/**/*.entity.ts"],
    migrations: ["src/migrations/*.ts"],
    synchronize: false,
});
