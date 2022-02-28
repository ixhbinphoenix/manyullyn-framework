import logger from "node-color-log";
import * as dotenv from "dotenv";

export async function info(msg: string) {
  logger
    .bgColor("cyan")
    .color("black")
    .log("[INFO]")
    .joint()
    .log(" " + msg);
}
export async function warn(msg: string) {
  logger
    .bgColor("yellow")
    .color("black")
    .log("[WARN]")
    .joint()
    .color("yellow")
    .log(" " + msg);
}
export async function error(msg: string) {
  logger
    .bgColor("red")
    .color("black")
    .log("[ERROR]")
    .joint()
    .color("red")
    .log(" " + msg);
}
export async function fatal(msg: string) {
  logger
    .bgColor("red")
    .color("black")
    .log("[FATAL]")
    .joint()
    .color("red")
    .log(" " + msg);
}
export async function debug(msg: string) {
  dotenv.config();
  if (process.env.DEBUG) {
    logger
      .bgColor("white")
      .color("black")
      .log("[DEBUG]")
      .joint()
      .color("black")
      .log(" " + msg);
  }
}
