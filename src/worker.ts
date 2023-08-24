import { Hono } from 'hono';

import * as db from './gen/sqlc/querier';

type Bindings = {
	DB: D1Database;
};

const app = new Hono<{ Bindings: Bindings }>();

app.get('/api', (c) => c.text('Hello World!'));

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

		if (res) {
			return c.json({ success: true, id: res.id });
		} else {
			c.status(500);
			return c.json({ error: 'failed to insert comment' });
		}
	} catch (e) {
		return c.json({ error: e }, 500);
	}
});

export default app;
