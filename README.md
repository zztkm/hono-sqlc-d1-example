# D1 example with Hono & sqlc

refs:

- https://developers.cloudflare.com/d1/tutorials/build-a-comments-api/
- https://developers.cloudflare.com/d1/examples/d1-and-hono/#
- https://hono.dev/getting-started/cloudflare-workers#bindings
- [CloudFlare Workers、Cloudflare D1、HonoでLINE botを作りました](https://tkancf.com/blog/creating-line-bot-with-cloudflare-workers-d1-and-hono/)
- [voluntas/sqlc-gen-ts-d1-spec](https://github.com/voluntas/sqlc-gen-ts-d1-spec)
- [orisano/sqlc-gen-ts-d1](https://github.com/orisano/sqlc-gen-ts-d1)
- [Getting started with SQLite — sqlc 1.20.0 documentation](https://docs.sqlc.dev/en/latest/tutorials/getting-started-sqlite.html)
- [Migrations · Cloudflare D1 docs](https://developers.cloudflare.com/d1/platform/migrations/#migrations)


## Commands

### init d1

create db
```
wrangler d1 create d1-example
```

create migration file
```
wrangler d1 migrations create d1-example init
```

db init (first migration)
※ 一番最初のマイグレーションファイルは `db/schema.sql` をコピーして作る必要がある
```sh
make local-init
```

### migrations

migration for local db
```
make local-migration
```

migration for production db
```
make migration
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

## Note

### migration について

だいたいの流れ

1. 最初に schema 定義を書く
2. d1 migrations create する
3. 生成された最初の migration file に schema 定義をコピー
4. d1 migrations apply する (実行前に list で確認しておく
5. schema を修正
6. sqldef など使って、マイグレーションクエリを生成
7. d1 migrations apply する

これ以降は 5 ~ 7 のサイクル

### returing ありで insert したときに D1Result 型を受け取りたい

以下のように返り値を `one` にすると、返り値の型が `Promise<T | null>` になってしまう。

```sql
-- name: CreateComment :one
insert into comments 
(
    post_slug, author, body
) values (
    @post_slug, @author, @body
)
returning *;
```
生成コード
```ts
export async function createComment(
  d1: D1Database,
  args: CreateCommentParams
): Promise<CreateCommentRow | null> {
  return await d1
    .prepare(createCommentQuery)
    .bind(args.postSlug, args.author, args.body)
    .first<RawCreateCommentRow | null>()
    .then((raw: RawCreateCommentRow | null) => raw ? {
      id: raw.id,
      author: raw.author,
      body: raw.body,
      postSlug: raw.post_slug,
    } : null);
}
```

`many` にすると、`Promise<D1Result<T>>` になる。
```sql
-- name: CreateComment :many
insert into comments 
(
    post_slug, author, body
) values (
    @post_slug, @author, @body
)
returning *;
```

欲しかった生成コード
```ts
export async function createComment(
  d1: D1Database,
  args: CreateCommentParams
): Promise<D1Result<CreateCommentRow>> {
  return await d1
    .prepare(createCommentQuery)
    .bind(args.postSlug, args.author, args.body)
    .all<RawCreateCommentRow>()
    .then((r: D1Result<RawCreateCommentRow>) => { return {
      ...r,
      results: r.results.map((raw: RawCreateCommentRow) => { return {
        id: raw.id,
        author: raw.author,
        body: raw.body,
        postSlug: raw.post_slug,
      }}),
    }});
}
```

one で生成すると、first で結果を取得するので、型が `Promise<T | null>` となって、D1Result にならないが、many で生成すると、`Promise<D1Result<T>>` となる。

https://twitter.com/voluntas/status/1694572903545844084?s=20

## Troubleshooting

`better-sqlite3` のインストールに失敗したら -> https://github.com/WiseLibs/better-sqlite3/blob/master/docs/troubleshooting.md