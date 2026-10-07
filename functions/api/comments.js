export async function onRequestGet(context) {
  const url = new URL(context.request.url);
  const post = url.searchParams.get("post");

  if (!post) {
    return Response.json(
      { error: "Post is required." },
      { status: 400 }
    );
  }

  const { results } = await context.env.COMMENTS_DB
    .prepare(`
      SELECT id, name, comment, created_at
      FROM comments
      WHERE post_slug = ? AND approved = 1
      ORDER BY created_at ASC
    `)
    .bind(post)
    .all();

  const { results: replies } = await context.env.COMMENTS_DB
  .prepare(`
    SELECT r.comment_id, r.reply, r.created_at
    FROM comment_replies r
    JOIN comments c ON c.id = r.comment_id
    WHERE c.post_slug = ? AND c.approved = 1
    ORDER BY r.created_at ASC
  `)
  .bind(post)
  .all();

  return Response.json({
  comments: results.map(comment => ({
    ...comment,
    replies: replies.filter(reply => reply.comment_id === comment.id)
  }))
});
}

export async function onRequestPost(context) {
  try {
    const data = await context.request.json();

    const post = String(data.post || "").trim();
    const name = String(data.name || "").trim();
    const email = String(data.email || "").trim();
    const comment = String(data.comment || "").trim();

    if (!post || !name || !comment) {
      return Response.json(
        { error: "Name and comment are required." },
        { status: 400 }
      );
    }

    if (name.length > 80 || email.length > 200 || comment.length > 3000) {
      return Response.json(
        { error: "Your comment is too long." },
        { status: 400 }
      );
    }

    await context.env.COMMENTS_DB
      .prepare(`
        INSERT INTO comments
        (post_slug, name, email, comment, approved)
        VALUES (?, ?, ?, ?, 0)
      `)
      .bind(post, name, email, comment)
      .run();

    return Response.json({
      success: true,
      message: "Thanks! Your comment is waiting for approval."
    });

  } catch (error) {
    return Response.json(
      { error: "Something went wrong. Please try again." },
      { status: 500 }
    );
  }
}
