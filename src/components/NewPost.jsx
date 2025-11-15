import React, { useState } from 'react';
import './NewPost.css';

function NewPost({ apiUrl, onBack }) {
  const [title, setTitle] = useState('');
  const [url, setUrl] = useState('');
  const [text, setText] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!title.trim()) {
      setError('Title is required');
      return;
    }

    setSubmitting(true);
    setError(null);

    try {
      const response = await fetch(`${apiUrl}/api/posts`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: title.trim(),
          url: url.trim() || null,
          text: text.trim() || null,
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to create post');
      }

      // Success - go back to list
      onBack();
    } catch (err) {
      setError(err.message);
      setSubmitting(false);
    }
  };

  return (
    <div className="new-post">
      <button onClick={onBack} className="back-button">← back</button>
      
      <h2>Submit a New Post</h2>
      
      <form onSubmit={handleSubmit} className="new-post-form">
        {error && <div className="error-message">{error}</div>}
        
        <div className="form-group">
          <label htmlFor="title">Title *</label>
          <input
            type="text"
            id="title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Post title"
            disabled={submitting}
            maxLength="200"
          />
        </div>

        <div className="form-group">
          <label htmlFor="url">URL (optional)</label>
          <input
            type="text"
            id="url"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder="https://example.com"
            disabled={submitting}
          />
        </div>

        <div className="form-group">
          <label htmlFor="text">Text (optional)</label>
          <textarea
            id="text"
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Additional text or description..."
            rows="10"
            disabled={submitting}
          />
        </div>

        <div className="form-note">
          You can provide either a URL or text content, or both.
        </div>

        <button type="submit" className="submit-btn" disabled={submitting}>
          {submitting ? 'Submitting...' : 'Submit Post'}
        </button>
      </form>
    </div>
  );
}

export default NewPost;

