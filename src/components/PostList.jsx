import React, { useState, useEffect } from 'react';
import './PostList.css';

function PostList({ apiUrl, onPostClick }) {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchPosts();
  }, []);

  const fetchPosts = async () => {
    try {
      const response = await fetch(`${apiUrl}/api/posts`);
      if (!response.ok) throw new Error('Failed to fetch posts');
      const data = await response.json();
      setPosts(data);
      setLoading(false);
    } catch (err) {
      setError(err.message);
      setLoading(false);
    }
  };


  const handleUpvote = async (postId, e) => {
    e.stopPropagation();
    try {
      const response = await fetch(`${apiUrl}/api/posts/${postId}/upvote`, {
        method: 'POST',
      });
      if (!response.ok) throw new Error('Failed to upvote');
      fetchPosts(); // Refresh the list
    } catch (err) {
      console.error('Error upvoting:', err);
    }
  };

  const handleDownvote = async (postId, e) => {
    e.stopPropagation();
    try {
      const response = await fetch(`${apiUrl}/api/posts/${postId}/downvote`, {
        method: 'POST',
      });
      if (!response.ok) throw new Error('Failed to downvote');
      fetchPosts(); // Refresh the list
    } catch (err) {
      console.error('Error downvoting:', err);
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

  return (
    <div className="post-list">
      {posts.map((post, index) => (
        <div key={post.id} className="post-item">
          <div className="post-rank">{index + 1}.</div>
          <div className="post-votes">
            <div className="post-upvote" onClick={(e) => handleUpvote(post.id, e)}>▲</div>
            <div className="post-downvote" onClick={(e) => handleDownvote(post.id, e)}>▼</div>
          </div>
          <div className="post-content">
            <div className="post-title-row">
              <span 
                className="post-title" 
                onClick={() => onPostClick(post.id)}
              >
                {post.title}
              </span>
              {post.url && (
                <span className="post-url">
                  (<a href={post.url} target="_blank" rel="noopener noreferrer">
                    {new URL(post.url).hostname}
                  </a>)
                </span>
              )}
            </div>
            <div className="post-meta">
              <span className="post-score">{post.score} points</span>
              {' '}
              <span className="post-time">{formatTime(post.created_at)}</span>
              {' | '}
              <button onClick={() => onPostClick(post.id)}>
                {post.comment_count} comments
              </button>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

export default PostList;

