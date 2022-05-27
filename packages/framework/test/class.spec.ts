import { Manyullyn, Config, APIChannel } from "../dist";
import { afterEach, describe, it } from "vitest";
import { mkdir, rm } from "fs/promises";
import { existsSync } from "fs";

describe("Manyullyn constructor", () => {
  afterEach(async () => {
    await rm("./test/class_temp", { force: true, recursive: true });
  });

  it("w/ existing folder", async () => {
    let config: Config = {
      prefix: "!",
      commandPath: "./test/class_temp"
    };
    if (!existsSync("./test/class_temp")) {
      await mkdir("./test/class_temp");
    }
    let apichannel: APIChannel = {
      reply: async (msg: string) => {
        console.log(msg);
      }
    };
    const instance = new Manyullyn(config, apichannel);
  });

  it("w/o folder", async () => {
    let config: Config = {
      prefix: "!",
      commandPath: "./test/class_temp"
    };
    let apichannel: APIChannel = {
      reply: async (msg: string) => {
        console.log(msg);
      }
    };
    const instance = new Manyullyn(config, apichannel);
  });
});
