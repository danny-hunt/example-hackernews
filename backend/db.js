const Database = require("better-sqlite3");
const path = require("path");
const fs = require("fs");

const dbPath = path.join(__dirname, "database.db");
const dbExists = fs.existsSync(dbPath);

const db = new Database(dbPath);

// Initialize database if it doesn't exist
if (!dbExists) {
  console.log("Initializing database...");

  // Create tables
  db.exec(`
    CREATE TABLE IF NOT EXISTS posts (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT NOT NULL,
      url TEXT,
      text TEXT,
      score INTEGER DEFAULT 0,
      created_at INTEGER DEFAULT (strftime('%s', 'now'))
    );

    CREATE TABLE IF NOT EXISTS comments (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      post_id INTEGER NOT NULL,
      text TEXT NOT NULL,
      created_at INTEGER DEFAULT (strftime('%s', 'now')),
      FOREIGN KEY (post_id) REFERENCES posts (id)
    );
  `);

  // Seed data
  const insertPost = db.prepare("INSERT INTO posts (title, url, text, score) VALUES (?, ?, ?, ?)");
  const insertComment = db.prepare("INSERT INTO comments (post_id, text) VALUES (?, ?)");

  const seedPosts = [
    {
      title: "Welcome to HackerNews Clone",
      url: null,
      text: "This is a simple example app for testing vibe coding tools. Feel free to add posts and comments!",
      score: 42,
    },
    {
      title: "Show HN: My Weekend Project",
      url: "https://example.com/project",
      text: null,
      score: 15,
    },
    {
      title: "Ask HN: What are you working on?",
      url: null,
      text: "I'm curious what projects everyone is building these days.",
      score: 23,
    },
    {
      title: "SQLite is Awesome",
      url: "https://sqlite.org",
      text: null,
      score: 67,
    },
    {
      title: "The Art of Simple Code",
      url: null,
      text: "Sometimes the best solution is the simplest one. Complexity should be justified.",
      score: 31,
    },
  ];

  seedPosts.forEach((post) => {
    const result = insertPost.run(post.title, post.url, post.text, post.score);

    // Add some comments to first few posts
    if (result.lastInsertRowid <= 3) {
      const comments = [
        "Great post! Thanks for sharing.",
        "I completely agree with this perspective.",
        "Interesting idea, but have you considered...?",
      ];
      comments.forEach((text) => {
        insertComment.run(result.lastInsertRowid, text);
      });
    }
  });

  console.log("Database seeded successfully!");
}

module.exports = db;
