import { Hono } from 'hono';

import * as db from './gen/sqlc/querier';

type Bindings = {
	DB: D1Database;
};

const app = new Hono<{ Bindings: Bindings }>();

app.get('/api', (c) => c.text('Hello World!'));

app.get('/api/comments/:id', async (c) => {
	const id = +c.req.param('id');
	try {
		const row = await db.getComment(c.env.DB, { id: id });
		if (!row) return c.json({ error: 'comment not found' }, 404);
		return c.json(row);
	} catch (e) {
		return c.json({ error: e }, 500);
	}
});

app.get('/api/posts/:slug/comments', async (c) => {
	const slug = c.req.param('slug');
	console.log(slug);
	try {
		const { results } = await db.listComments(c.env.DB, { postSlug: slug });
		return c.json(results);
	} catch (e) {
		return c.json({ error: e }, 500);
	}
});

app.post('/api/posts/:slug/comments', async (c) => {
	const slug = c.req.param('slug');
	const { author, body } = await c.req.json();

	if (!author) return c.json({ error: 'author is required' }, 400);
	if (!body) return c.json({ error: 'body is required' }, 400);

	try {
		const res = await db.createComment(c.env.DB, { postSlug: slug, author: author, body: body });

		if (res.success) {
			if (res.results) {
				// TODO: どうせ1件しか返ってこないので、results[0]で取得
				console.debug(res.results.length);
				return c.json({ success: true, id: res.results[0].id });
			} else {
				// NOTE: 返り値がない場合はエラーとしても良いのかな?
				c.status(500);
				return c.json({ error: 'failed to create comment' });
			}
		} else {
			c.status(500);
			return c.json({ error: 'failed to create comment' });
		}
	} catch (e) {
		return c.json({ error: e }, 500);
	}
});

export default app;
