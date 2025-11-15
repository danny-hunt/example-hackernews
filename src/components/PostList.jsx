import React, { useState, useEffect, useMemo } from 'react';
import './PostList.css';

function PostList({ apiUrl, onPostClick }) {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [sortBy, setSortBy] = useState('newest'); // 'newest', 'oldest', 'score-high', 'score-low', 'comments-high', 'comments-low'

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

  const sortedPosts = useMemo(() => {
    const postsCopy = [...posts];
    switch (sortBy) {
      case 'newest':
        return postsCopy.sort((a, b) => b.created_at - a.created_at);
      case 'oldest':
        return postsCopy.sort((a, b) => a.created_at - b.created_at);
      case 'score-high':
        return postsCopy.sort((a, b) => b.score - a.score);
      case 'score-low':
        return postsCopy.sort((a, b) => a.score - b.score);
      case 'comments-high':
        return postsCopy.sort((a, b) => b.comment_count - a.comment_count);
      case 'comments-low':
        return postsCopy.sort((a, b) => a.comment_count - b.comment_count);
      default:
        return postsCopy;
    }
  }, [posts, sortBy]);

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
      <div className="sort-controls">
        <label htmlFor="sort-select">Sort by: </label>
        <select 
          id="sort-select"
          value={sortBy} 
          onChange={(e) => setSortBy(e.target.value)}
          className="sort-select"
        >
          <option value="newest">Newest First</option>
          <option value="oldest">Oldest First</option>
          <option value="score-high">Highest Score</option>
          <option value="score-low">Lowest Score</option>
          <option value="comments-high">Most Comments</option>
          <option value="comments-low">Least Comments</option>
        </select>
      </div>
      {sortedPosts.map((post, index) => (
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

