import { Hono } from 'hono';

type Bindings = {
	DB: D1Database;
};

const app = new Hono<{ Bindings: Bindings }>();

app.get('/api', (c) => c.text('Hello World!'));

app.get('/api/posts/:slug/comments', async (c) => {
	const slug = c.req.param('slug');
	console.log(slug);
	try {
		const { results } = await c.env.DB.prepare('select * from comments where post_slug = ?').bind(slug).all();
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
		const { success } = await c.env.DB.prepare('insert into comments (post_slug, author, body) values (?, ?, ?)')
			.bind(slug, author, body)
			.run();

		if (success) {
			return c.json({ success: true });
		} else {
			c.status(500);
			return c.json({ error: 'failed to insert comment' });
		}
	} catch (e) {
		return c.json({ error: e }, 500);
	}
});

export default app;
