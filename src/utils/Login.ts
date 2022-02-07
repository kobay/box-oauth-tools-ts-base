import BoxNodeSDK from "box-node-sdk/lib/box-node-sdk";
// import { clientID, clientSecret } from "../config";
const { clientID, clientSecret } = require("../../config.json");
import fs from "fs-extra";
import { DateTime } from "luxon";

import cli from "cli-ux";

const express = require("express");
const sdk = new BoxNodeSDK({ clientID, clientSecret });

const loginUrl = sdk.getAuthorizeURL({
  // eslint-disable-next-line camelcase
  client_id: clientID,
  // @ts-ignore
  response_type: "code",
});

export async function getClient() {
  const tokenInfo = await getToken();
  const client = sdk.getBasicClient(tokenInfo.accessToken);
  return client;
}

export async function getToken() {
  const tokenCache = new TokenCache();
  let tokenInfo = tokenCache.read();
  if (tokenInfo !== null) {
    return tokenInfo;
  }
  const app = express();

  // Promiseのハンドラ内部に渡される第一引数 resolveを外だしにして、後から使えるようにする。
  // 取り出したresolveを実行すると、pの処理が終了する。
  let resolve: any;
  const p = new Promise((_resolve) => {
    resolve = _resolve;
  });

  // ローカスのサーバーで/redirectが呼び出されたときの処理
  app.get("/callback", function (req: any, res: any) {
    // 上で取り出したresolveを呼び出す
    resolve(req.query.code);
    res.end("OK. go back to CLI");
  });
  // サーバーを立ち上げる
  const server = await app.listen(3000);

  // Boxの認証画面をブラウザで開く。
  cli.open(loginUrl);

  // redirectの処理で、認可コードを取りだしてresolveが呼び出されるのを待つ
  const code = await p;
  // 取り出した認可コードを表示
  console.log(`the code is ${code}`);
  // 不要になったので待たずにサーバーを停止
  server.close(() => {
    console.log("server stopped");
  });
  // 認可コードからアクセストークン類を取り出す（ここから通常のBOX APIの利用方法）
  // @ts-ignore
  tokenInfo = await sdk.getTokensAuthorizationCodeGrant(code);
  tokenCache.write(tokenInfo);
  return tokenInfo;
}

interface TokenInfo {
  accessToken: string;
  refreshToken: string;
  accessTokenTTLMS: number;
  acquiredAtMS: number;
}

class TokenCache {
  static CACHE_FILE = "token_cache.json";

  read() {
    if (fs.existsSync(TokenCache.CACHE_FILE)) {
      const cached = fs.readJSONSync(TokenCache.CACHE_FILE) as TokenInfo;
      const now = DateTime.now();
      const tokenTTL = DateTime.fromMillis(cached.acquiredAtMS).plus({
        millisecond: cached.accessTokenTTLMS,
      });
      if (now < tokenTTL) {
        return cached;
      }
    }
    return null;
  }

  write(token: TokenInfo) {
    fs.removeSync(TokenCache.CACHE_FILE);
    fs.writeJSONSync(TokenCache.CACHE_FILE, token);
  }
}

function f() {
  const dt = DateTime.fromMillis(1644228166911);
  console.log(dt.toISO());
  const dt2 = dt.plus({ millisecond: 3607000 });
  console.log(dt2.toISO());
}

f();
