// Copyright (C) 2022  ixhbinphoenix
//
// This program is free software: you can redistribute it and/or modify
// it under the terms of the GNU General Public License as published by
// the Free Software Foundation, either version 3 of the License, or
// (at your option) any later version.
//
// This program is distributed in the hope that it will be useful,
// but WITHOUT ANY WARRANTY; without even the implied warranty of
// MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
// GNU General Public License for more details.
//
// You should have received a copy of the GNU General Public License
// along with this program.  If not, see <https://www.gnu.org/licenses/>.

import { existsSync, mkdirSync, readdirSync } from "fs";
import * as fs from "fs/promises";
import * as logger from "./log";
import type { EventBinder } from "@d-fischer/typed-event-emitter";
import { EventEmitter } from "@d-fischer/typed-event-emitter";

/**
 * API Channel for communicating from Manyullyn -> World
 */
export interface APIChannel {
  reply: (msg: string) => Promise<void>;

  // For Accessing platform specific API
  platformProvider?: {
    platform: string;
    apiClient: any;
  };
}

/**
 * Config object for configuring manyullyn
 * @property prefix Command prefix for text-based commands
 * @property commandPath Folder path for chat-registered commands
 */
export interface Config {
  prefix: string;
  commandPath: string;
}

// TODO: Change user from string to a unique identifier
/**
 * Async function representing a Command Handler
 */
export type CommandHandler = (
  msg: string,
  user: string,
  apichannel: APIChannel
) => Promise<void>;

// TODO: Command config permanence provider
/**
 * Manyullyn class.
 */
export class Manyullyn extends EventEmitter {

  onCommand: EventBinder<[command: string]> = this.registerEvent();

  onCommandRegister: EventBinder<[command: string, store: boolean]> = this.registerEvent();

  onCommandDelete: EventBinder<[command: string]> = this.registerEvent();

  constructor(config: Config, channel: APIChannel) {
    super()
    this.commands = new Map<string, CommandHandler>();
    if (!existsSync(config.commandPath)) {
      logger.warn("Command path does not exist! Creating...");
      mkdirSync(config.commandPath);
      // Don't need to load commands since custom commands do not exist
    } else {
      logger.debug("Loading commands into map...");
      readdirSync(config.commandPath)
        .filter((str) => str.endsWith(".js"))
        .forEach((val) => {
          let cmdname = val.slice(0, -3);
          let func = require(`${config.commandPath}${val}`).default as CommandHandler;
          this.commands.set(cmdname, func);
        });
      logger.debug("Loaded commands!");
    }
    this.config = config;
    this.apichannel = channel;

    this.addInternalListener(this.onCommand, async (cmd: string) => {
      await logger.debug(`Executing command ${cmd}`)
    })

    this.addInternalListener(this.onCommandRegister, async (cmd: string, store: boolean) => {
      await logger.info(`Registered ${store ? "user" : "client"} command ${cmd}`)
    })

    this.addInternalListener(this.onCommandDelete, async (cmd: string) => {
      await logger.info(`Deleted command ${cmd}`)
    })
  }
  apichannel: APIChannel;
  config: Config;
  commands: Map<string, CommandHandler>;

  /**
   * Handles any kind of chat message
   * @param msg The string of the message
   * @param user The username of the sender
   */
  public async handleMessage(msg: string, user: string): Promise<void> {
    if (msg.startsWith(this.config.prefix)) {
      let cmd = msg.split(" ")[0].slice(1);
      if (this.commands.has(cmd)) {
        let cmdHandler = this.commands.get(cmd) as CommandHandler;
        await cmdHandler(msg, user, this.apichannel);
        this.emit(this.onCommand, cmd);
      }
    }
  }

  /**
   * Runs a command artificially
   * @param cmd Command name
   */
  public async runCommand(cmd: string, msg: string, user: string) {
    if (this.commands.has(cmd)) {
      let cmdHandler = this.commands.get(cmd) as CommandHandler;
      await cmdHandler(msg, user, this.apichannel);
      this.emit(this.onCommand, cmd)
    } else {
      await logger.error(`Command ${cmd} does not exist!`);
    }
  }

  /**
   * Registers a command
   * @param name The name of the command
   * @param func The Command handler
   * @param store Enables storing the command in a file - Should be false for builtin, true for chat-registered
   */
  public async registerCommand(
    name: string,
    func: CommandHandler,
    store: boolean = false
  ): Promise<void> {
    if (this.commands.has(name)) {
      await this.apichannel.reply(`Command ${name} already exists!`);
      await logger.debug(`User attempted to re-register ${name}`);
    } else {
      this.commands.set(name, func);
      this.emit(this.onCommandRegister, name, store);
      if (store) {
        let funcstr = func.toString();
        funcstr = "export default " + funcstr;
        if (existsSync(`${this.config.commandPath}/${name}.js`)) {
          await logger.fatal(
            "Command folder and commandmap not in sync! Command file already exists while it is not registered in map!"
          );
          await this.apichannel.reply(
            "There was a fatal error while trying to register the command."
          );
        } else {
          await fs.writeFile(`${this.config.commandPath}/${name}.js`, funcstr);
        }
      }
    }
  }

  /**
   * Deletes a command
   * @param name name of the command
   */
  public async deleteCommand(name: string) {
    if (!this.commands.has(name)) {
      await this.apichannel.reply(`Command ${name} does not exist!`);
      await logger.debug(`User attempted to delete non-existent command ${name}`)
    } else {
      if (existsSync(`${this.config.commandPath}/${name}.js`)) {
        await fs.rm(`${this.config.commandPath}/${name}.js`);
      }
      this.commands.delete(name);
      this.emit(this.onCommandDelete, name);
    }
  }
}
