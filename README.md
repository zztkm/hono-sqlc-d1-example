# D1 example with Hono

refs:

- https://developers.cloudflare.com/d1/tutorials/build-a-comments-api/
- https://developers.cloudflare.com/d1/examples/d1-and-hono/#
- https://hono.dev/getting-started/cloudflare-workers#bindings
- [CloudFlare Workers、Cloudflare D1、HonoでLINE botを作りました](https://tkancf.com/blog/creating-line-bot-with-cloudflare-workers-d1-and-hono/)

## Commands

### init d1

```sh
wrangler d1 execute d1-example --file ./schemas/schema.sql
```

pnpm dev の前に実行しておく
for local:

```sh
wrangler d1 execute d1-example --local --file ./schemas/schema.sql
```

### run dev server

```sh
pnpm run dev
```

### format

```sh
pnpm run fmt
```

### deploy

```sh
pnpm run deploy
```
