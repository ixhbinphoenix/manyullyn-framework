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
import { ApiClient } from "@twurple/api/lib";
import { RefreshingAuthProvider } from "@twurple/auth/lib";
import { ChatClient } from "@twurple/chat/lib";
import * as fs from "fs/promises";

export interface manyurpleConfig {
  auth: auth;
  // TODO: Multi-channel support
  channel: string;
  manyuconfig: Config;
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
export class manyurple {
  constructor(config: manyurpleConfig) {
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
    this.chatClient = new ChatClient({
      channels: [config.channel],
      authProvider
    });
    this.apiClient = new ApiClient({ authProvider });
    this.config = config;
    let provider: platformProvider = {
      apiClient: this.apiClient,
      chatClient: this.chatClient
    }
    this.manyullyn = new Manyullyn(config.manyuconfig, {
      reply: this.sendMessage,
      platformProvider: provider
    });

    this.chatClient.onMessage(
      async (channel: string, user: string, msg: string) => {
        this.manyullyn.handleMessage(msg, user);
      }
    );
  }
  chatClient: ChatClient;
  apiClient: ApiClient;
  manyullyn: Manyullyn;
  config: manyurpleConfig;

  public async sendMessage(msg: string): Promise<void> {
    this.chatClient.say(this.config.channel, msg);
  }
}
