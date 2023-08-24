# D1 example with Hono & sqlc

refs:

- https://developers.cloudflare.com/d1/tutorials/build-a-comments-api/
- https://developers.cloudflare.com/d1/examples/d1-and-hono/#
- https://hono.dev/getting-started/cloudflare-workers#bindings
- [CloudFlare Workers、Cloudflare D1、HonoでLINE botを作りました](https://tkancf.com/blog/creating-line-bot-with-cloudflare-workers-d1-and-hono/)
- [voluntas/sqlc-gen-ts-d1-spec](https://github.com/voluntas/sqlc-gen-ts-d1-spec/tree/main)
- [orisano/sqlc-gen-ts-d1](https://github.com/orisano/sqlc-gen-ts-d1)
- [Getting started with SQLite — sqlc 1.20.0 documentation](https://docs.sqlc.dev/en/latest/tutorials/getting-started-sqlite.html)


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

### sqlc

このアプリケーションのDB周りのコードは sqlc を利用して生成されています。
コードを変更する際は、まず `db` ディレクトリ直下のファイルを変更し、その後 `make generate` を実行してください。

```sh
make generate

# sql の syntax check
make compile
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
