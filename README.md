添加了可以合并多个账户数据的功能，不同账户游玩相同游戏的时长会加在一起，不会出现两次。

使用方法（以三个号为例）：

1.下载环境，终端管理员运行powershell -c "irm bun.sh/install.ps1 | iex"

2.访问 https://steamcommunity.com/dev/apikey  获到你的api密钥

3.从 https://github.com/yundan125/playtime-panorama 下载项目并给我一个star

4.解压下载好的项目，打开文件夹，在此文件夹打开cmd

5.运行命令bun install运行完成后，再运行set STEAM_API_KEYS = "steam密钥,steam密钥,steam密钥"（有几个号就输入几次，然这几个steam秘钥可以相同也尽量相同，复制粘贴同一个就可以） ，执行完后接着执行bun run dev

6.访问地址http://localhost:3000/steamId1,steamId2,steamId3 （有几个号就填几个id，填不一样的，一般都是7656xxxxxxxxxxxxx）


# playtime-panorama

![Screenshot of playtime-panorama](screenshot.jpg)

Generate a dense, responsive collage of your Steam library where each header image tile is sized by the playtime.

## What the app does

- Fetches publicly visible Steam playtime data from `IPlayerService/GetOwnedGames`.
- Scales every game's header image by actual hours played, so long-haul favorites dominate the collage.
- Arranges the artwork into a responsive CSS grid that reflows to match any viewport size.
- Generates a [leaderboard](https://playtime-panorama.superserio.us/leaderboard) of the top profiles (game count, hours played, hours / game average).

## Quick start

Grab a Steam API key from <https://steamcommunity.com/dev/apikey>.

```bash
bun install
STEAM_API_KEY=ABCDEFGH... bun run dev
```

Visit `http://localhost:3000/<your-steam-id>` and the server will fetch, normalize, and render the responsive grid layout on the fly.

The server caches responses for up to 24 hours for playtime data and indefinitely for `ISteamUser/ResolveVanityURL` to avoid hitting the API repeatedly (Steam provides [100K req/day](https://steamcommunity.com/dev/apiterms))

## Using your own Steam API key

To avoid hitting rate limits on the server's API key, users can provide their own Steam Web API key:

### Method 1: Through the web interface

1. Visit the homepage
2. Expand the "Use your own Steam API key" section
3. Enter your API key (get one at <https://steamcommunity.com/dev/apikey>)
4. Submit the form - your key will be stored in browser localStorage

### Method 2: URL parameter

Add `?api_key=YOUR_KEY` to any API request:

```text
/api/playtime/76561198000000000?api_key=YOUR_STEAM_API_KEY
```

### Method 3: HTTP Header

Send the key via the `X-Steam-API-Key` header:

```bash
curl -H "X-Steam-API-Key: YOUR_STEAM_API_KEY" \
  http://localhost:3000/api/playtime/76561198000000000
```

Your API key is sent directly to Steam's servers and never stored on our backend.

## How the packing logic works

The collage is laid out by `computeGridLayout` in `templates/profile.html`, and it behaves like a self-tuning CSS Grid packer:

- **Hours drive span weights.** Each game’s hours are transformed into an area weight using a softened power curve (`(hours + 0.1)^0.62`) so outliers still feel big without flattening mid-tier favorites. The largest weight sets the scale for every other tile.
- **Span-first sizing.** The algorithm starts with a target column count (based on viewport width and desired card width), computes a column width, and then converts the weighted area into square grid spans (from 1×1 up to a capped 12×12 tile). High-playtime titles claim larger spans; the top few entries are boosted to anchor the grid.
- **Height-aware column search.** Before locking a layout, the code estimates overall grid height. If the grid would overflow the viewport, it increases the column count; if it leaves too much empty space, it trims columns. This loop runs a handful of times so the final grid sits neatly in the visible stage.
- **Row sizing + CSS handoff.** With the chosen column count, `--columns` and `--row-size` are written to CSS variables, and the DOM simply flows cards into place. Hover states and tooltips are handled purely in CSS for smooth rendering.

Apart from a few type packages, this app uses no external dependencies. Everything runs off of Bun's in-built APIs on the server and the frontend is intentionally a simple, HTML file without React or Tailwind. I wanted a performant, minimal dependency approach for this project.

## Limitations & quirks

- Games with less than 10 minutes of lifetime playtime are skipped.
- Family sharing libraries are not exposed by Steam's API in `GetOwnedGames`.
- Dota 2 has an unusual licens. It _seems_ to only appears in the API response when the game is currently installed but I couldn't verify it thoroughly.

## Why I built this

I was reading the patch notes for [Bun 1.3](https://bun.com/blog/bun-v1.3) (♥) where they talk about Bun being a "Full‑stack JavaScript runtime". I really wanted to see how far I can get with only Bun's in-built APIs.

Plus, it's fun.

Contributions are welcome!
