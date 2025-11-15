import React, { useState, useEffect } from 'react';
import './PostDetail.css';

function PostDetail({ apiUrl, postId, onBack }) {
  const [post, setPost] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [commentText, setCommentText] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchPost();
  }, [postId]);

  const fetchPost = async () => {
    try {
      const response = await fetch(`${apiUrl}/api/posts/${postId}`);
      if (!response.ok) throw new Error('Failed to fetch post');
      const data = await response.json();
      setPost(data);
      setLoading(false);
    } catch (err) {
      setError(err.message);
      setLoading(false);
    }
  };

  const handleSubmitComment = async (e) => {
    e.preventDefault();
    if (!commentText.trim()) return;

    setSubmitting(true);
    try {
      const response = await fetch(`${apiUrl}/api/posts/${postId}/comments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: commentText }),
      });
      if (!response.ok) throw new Error('Failed to submit comment');
      
      setCommentText('');
      fetchPost(); // Refresh to show new comment
    } catch (err) {
      alert('Error submitting comment: ' + err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const formatTime = (timestamp) => {
    const now = Date.now() / 1000;
    const diff = now - timestamp;
    
    if (diff < 60) return 'just now';
    if (diff < 3600) return `${Math.floor(diff / 60)} minutes ago`;
    if (diff < 86400) return `${Math.floor(diff / 3600)} hours ago`;
    return `${Math.floor(diff / 86400)} days ago`;
  };

  if (loading) return <div className="loading">Loading...</div>;
  if (error) return <div className="error">Error: {error}</div>;
  if (!post) return <div className="error">Post not found</div>;

  return (
    <div className="post-detail">
      <button onClick={onBack} className="back-button">← back</button>
      
      <div className="post-header">
        <h1 className="post-title-detail">
          {post.title}
          {post.url && (
            <span className="post-url-detail">
              {' '}(<a href={post.url} target="_blank" rel="noopener noreferrer">
                {new URL(post.url).hostname}
              </a>)
            </span>
          )}
        </h1>
        <div className="post-meta-detail">
          <span className="post-score">{post.score} points</span>
          {' '}
          <span className="post-time">{formatTime(post.created_at)}</span>
          {' | '}
          <span>{post.comments.length} comments</span>
        </div>
      </div>

      {post.text && (
        <div className="post-text">
          {post.text}
        </div>
      )}

      <div className="comment-form-section">
        <form onSubmit={handleSubmitComment} className="comment-form">
          <textarea
            value={commentText}
            onChange={(e) => setCommentText(e.target.value)}
            placeholder="Add a comment..."
            rows="6"
            disabled={submitting}
          />
          <button type="submit" className="submit-btn" disabled={submitting}>
            {submitting ? 'Submitting...' : 'Add Comment'}
          </button>
        </form>
      </div>

      <div className="comments-section">
        {post.comments.length === 0 ? (
          <div className="no-comments">No comments yet. Be the first to comment!</div>
        ) : (
          post.comments.map((comment) => (
            <div key={comment.id} className="comment">
              <div className="comment-meta">
                {formatTime(comment.created_at)}
              </div>
              <div className="comment-text">
                {comment.text}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

export default PostDetail;

