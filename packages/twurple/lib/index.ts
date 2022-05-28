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

import { Config, Manyullyn } from "@manyullyn/framework";
import * as logger from "@manyullyn/framework/dist/log";
import { ApiClient } from "@twurple/api";
import { RefreshingAuthProvider } from "@twurple/auth";
import { ChatClient } from "@twurple/chat";
import type { EventBinder } from "@d-fischer/typed-event-emitter";
import * as fs from "fs/promises";

export interface manyurpleConfig {
  auth: auth;
  // TODO: Multi-channel support
  channel: string;
}

export interface auth {
  clientId: string;
  clientSecret: string;
  tokens: tokens;
}

export interface tokens {
  accessToken: string;
  refreshToken: string;
  scope?: string[];
  expiresIn: number;
  obtainmentTimestamp: number;
}

export interface platformProvider {
  apiClient: ApiClient;
  chatClient: ChatClient;
}

/**
 * Manyullyn+Twurple class
 */
export class manyurple extends Manyullyn {

  /**
   * @eventListener
   */
  onConnect: EventBinder<[]> = this.registerEvent();

  /**
   * @eventListener
   */
  onMessage: EventBinder<[channel: string, user: string, msg: string]> = this.registerEvent();


  constructor(config: manyurpleConfig, manyuconfig: Config) {
    if (!config.auth.tokens) {
      logger.error(
        "Initial refreshing tokens not found! Please do the token setup first!"
      );
      throw new ReferenceError("Tokens not found");
    }
    let authProvider = new RefreshingAuthProvider(
      {
        clientId: config.auth.clientId,
        clientSecret: config.auth.clientSecret,
        onRefresh: async (newToken) =>
          await fs.writeFile(
            "./tokens.json",
            JSON.stringify(newToken, null, 4),
            "utf-8"
          )
      },
      config.auth.tokens
    );
    let provider: platformProvider = {
      apiClient: new ApiClient({ authProvider }),
      chatClient: new ChatClient({
        channels: [config.channel],
        authProvider
      })
    }
    super(manyuconfig, {
      reply: async (msg) => {
        provider.chatClient.say(config.channel, msg);
      },
      platformProvider: {
        platform: "twurple",
        apiClient: provider
      }
    })
    this.chatClient = provider.chatClient;
    this.apiClient = provider.apiClient;

    this.manyurpleConfig = config;
    this.chatClient.connect()
    this.chatClient.onConnect(() => {
      this.emit(this.onConnect)
    })
    this.chatClient.onMessage(
      async (channel: string, user: string, msg: string) => {
        await this.handleMessage(msg, user);
      }
    );

    this.addInternalListener(this.onConnect, async () => {
      await logger.info("ChatClient connected")
    })
  }
  chatClient: ChatClient;
  apiClient: ApiClient;
  manyurpleConfig: manyurpleConfig;

  public async sendMessage(msg: string): Promise<void> {
    this.chatClient.say(this.manyurpleConfig.channel, msg);
  }
}
