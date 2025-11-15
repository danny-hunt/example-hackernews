const express = require("express");
const cors = require("cors");
const db = require("./db");

const app = express();
const PORT = process.env.BACKEND_PORT || 8000;

app.use(cors());
app.use(express.json());

// Get all posts
app.get("/api/posts", (req, res) => {
  try {
    const posts = db
      .prepare(
        `
      SELECT p.*, COUNT(c.id) as comment_count
      FROM posts p
      LEFT JOIN comments c ON p.id = c.post_id
      GROUP BY p.id
      ORDER BY p.created_at DESC
    `
      )
      .all();
    res.json(posts);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get single post with comments
app.get("/api/posts/:id", (req, res) => {
  try {
    const post = db.prepare("SELECT * FROM posts WHERE id = ?").get(req.params.id);
    if (!post) {
      return res.status(404).json({ error: "Post not found" });
    }

    const comments = db
      .prepare(
        `
      SELECT * FROM comments 
      WHERE post_id = ? 
      ORDER BY created_at ASC
    `
      )
      .all(req.params.id);

    res.json({ ...post, comments });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Create new post
app.post("/api/posts", (req, res) => {
  try {
    const { title, url, text } = req.body;
    if (!title) {
      return res.status(400).json({ error: "Title is required" });
    }

    const result = db
      .prepare(
        `
      INSERT INTO posts (title, url, text, score) 
      VALUES (?, ?, ?, 0)
    `
      )
      .run(title, url || null, text || null);

    const post = db.prepare("SELECT * FROM posts WHERE id = ?").get(result.lastInsertRowid);
    res.status(201).json(post);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Create new comment
app.post("/api/posts/:id/comments", (req, res) => {
  try {
    const { text } = req.body;
    if (!text) {
      return res.status(400).json({ error: "Comment text is required" });
    }

    const result = db
      .prepare(
        `
      INSERT INTO comments (post_id, text) 
      VALUES (?, ?)
    `
      )
      .run(req.params.id, text);

    const comment = db.prepare("SELECT * FROM comments WHERE id = ?").get(result.lastInsertRowid);
    res.status(201).json(comment);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Upvote post
app.post("/api/posts/:id/upvote", (req, res) => {
  try {
    db.prepare("UPDATE posts SET score = score + 1 WHERE id = ?").run(req.params.id);
    const post = db.prepare("SELECT * FROM posts WHERE id = ?").get(req.params.id);
    res.json(post);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get("/api", (req, res) => {
  res.send("Healthy");
});

app.listen(PORT, () => {
  console.log(`Backend server running on http://localhost:${PORT}`);
});
