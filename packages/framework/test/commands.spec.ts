import { APIChannel, CommandHandler, Manyullyn } from "../dist/index";
import * as logger from "../dist/log";
import { mkdir, rm } from "fs/promises";
import { afterAll, beforeAll, describe, it, expect, ApiConfig } from "vitest";
import { existsSync } from "fs";

describe("registering commands", async () => {
  let instance: Manyullyn;
  beforeAll(async () => {
    if (existsSync("./test/command_temp")) {
      await rm("./test/command_temp", { force: true, recursive: true });
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
    async function temp_test(
      msg: string,
      user: string,
      apichannel: APIChannel
    ) {
      await logger.info(`temp_test (${user}): ${msg}`);
    }
    await instance.registerCommand("temp_test", temp_test);
    await instance.runCommand("temp_test", "Trans rights!", "ixhbinphoenix");
  });

  it("create a file", async () => {
    async function file_test(
      msg: string,
      user: string,
      apichannel: APIChannel
    ) {
      await logger.info(`file_test (${user}): ${msg}`);
    }
    await instance.registerCommand("file_test", file_test, true);
    expect(existsSync("./test/command_temp/file_test.js")).toBe(true);
  });

  it("should delete the command", async () => {
    async function delete_test(
      msg: string,
      user: string,
      apichannel: APIChannel
    ) {
      await logger.info(`delete_test (${user}): ${msg}`);
    }
    await instance.registerCommand("delete_test", delete_test);
    await instance.runCommand("delete_test", "Trans Rights!", "ixhbinphoenix");
    await instance.deleteCommand("delete_test");
    expect(instance.commands.has("delete_test")).toBe(false);
  });

  it("should delete the file", async () => {
    async function deleteFile_test(
      msg: string,
      user: string,
      apichannel: APIChannel
    ) {
      await logger.info(`delete_test (${user}): ${msg}`);
    }
    await instance.registerCommand("deleteFile_test", deleteFile_test, true);
    expect(existsSync("./test/command_temp/deleteFile_test.js")).toBe(true);
    await instance.deleteCommand("deleteFile_test");
    expect(existsSync("./test/command_temp/deleteFile_test.js")).toBe(false);
  });

  afterAll(async () => {
    await rm("./test/command_temp", { force: true, recursive: true });
  });
});
