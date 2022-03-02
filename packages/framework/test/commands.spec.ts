import { APIChannel, CommandHandler, Manyullyn } from "../dist/index";
import * as logger from "../dist/log";
import { mkdir, rm } from "fs/promises";
import { afterAll, beforeAll, describe, it, expect } from "vitest";
import { existsSync } from "fs";

describe("registering commands", async () => {
  let instance: Manyullyn;
  beforeAll(async () => {
    if (existsSync('./test/command_temp')) {
      await rm('./test/command_temp', { force: true, recursive: true })
    }
    await mkdir("./test/command_temp");
    instance = new Manyullyn(
      {
        prefix: "!",
        commandPath: "./test/command_temp"
      },
      {
        reply: async (msg: string) => {
          await logger.info("Reply: " + msg);
        }
      }
    );
  });

  it("register a command w/o storing", async () => {
    async function temp_test(msg: string, user: string, apichannel: APIChannel) {
      await logger.info(`temp_test (${user}): ${msg}`);
    }
    // I have no clue why VSCode complains when I remove this 'as CommandHandler' so I'm just going to keep it here
    await instance.registerCommand("temp_test", temp_test as CommandHandler);
    await instance.runCommand("temp_test", "Trans rights!", "ixhbinphoenix");
  });

  it("create a file", async () => {
    async function file_test(msg: string, user: string, apichannel: APIChannel) {
      await logger.info(`file_test (${user}): ${msg}`);
    }
    await instance.registerCommand("file_test", file_test as CommandHandler, true);
    expect(existsSync('./test/command_temp/file_test.js')).toBe(true);
  });

  afterAll(async () => {
    await rm("./test/command_temp", { force: true, recursive: true });
  });
});
