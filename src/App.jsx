import React, { useState, useEffect } from 'react';
import PostList from './components/PostList';
import PostDetail from './components/PostDetail';
import NewPost from './components/NewPost';
import './App.css';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

function App() {
  const [view, setView] = useState('list'); // 'list', 'detail', 'new'
  const [selectedPostId, setSelectedPostId] = useState(null);

  const showPostDetail = (postId) => {
    setSelectedPostId(postId);
    setView('detail');
  };

  const showList = () => {
    setView('list');
    setSelectedPostId(null);
  };

  const showNewPost = () => {
    setView('new');
  };

  return (
    <div className="app">
      <header className="header">
        <div className="header-content">
          <span className="logo" onClick={showList}>HN</span>
          <span className="title" onClick={showList}>foobar</span>
          <span className="nav">
            <button onClick={showNewPost}>submit</button>
          </span>
        </div>
      </header>
      
      <main className="main">
        {view === 'list' && (
          <PostList apiUrl={API_URL} onPostClick={showPostDetail} />
        )}
        {view === 'detail' && (
          <PostDetail 
            apiUrl={API_URL} 
            postId={selectedPostId} 
            onBack={showList} 
          />
        )}
        {view === 'new' && (
          <NewPost apiUrl={API_URL} onBack={showList} />
        )}
      </main>
    </div>
  );
}

export default App;

