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

/**
 * API Channel for communicating from Manyullyn -> World
 */
export interface APIChannel {
  reply: (msg: string) => Promise<void>;
}

/**
 * Config object for configuring manyullyn
 */
export interface Config {
  prefix: string;
}

/** 
 * Async function representing a Command Handler
 */
type CommandHandler = (msg: string, user: string) => Promise<void>;

/**
 * Manyullyn class.
 */
export class Manyullyn {
  constructor(config: Config, channel: APIChannel) {
    this.config = config;
    this.apichannel = channel;
  }
  apichannel: APIChannel;
  config: Config;

  /**
   * Handles any kind of chat message
   * @param msg The string of the message
   * @param user The username of the sender
   */
  public async handleMessage(msg: string, user: string): Promise<void> {
    if (msg.startsWith(this.config.prefix)) {
      // TODO: Command handling
      this.apichannel.reply(
        `${user}, manyullyn-framework does not have command support yet!`
      );
    }
    // TODO: Handle message filters
  };

  /**
   * Registers a command
   * @param name The name of the command
   * @param func The Command handler
   */
  public async registerCommand(name: string, func: CommandHandler): Promise<void> {
    // TODO: Register Commands
    // To do this, we Map the function to the function name
    // Not a permanent solution, as the user still has to handle custom commands
  };
}
