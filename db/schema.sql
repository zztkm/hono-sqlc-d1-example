create table if not exists comments (
  id integer primary key autoincrement,
  author text not null,
  body text not null,
  post_slug text not null,
  created_at text default current_timestamp, -- 時刻は utc で保存される
  updated_at text default '' -- 時刻は utc で保存される
);
create index idx_comments_post_slug on comments (post_slug);