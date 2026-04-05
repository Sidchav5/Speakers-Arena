import React from 'react';
import { Link } from 'react-router-dom';
import TopicsModule from '../components/topics';
import './TopicsPage.css';

function TopicsPage() {
  return (
    <main className="topics-page-root">
      <div className="topics-page-shell">
        <header className="topics-page-header">
          <p className="topics-page-kicker">Speaker's Arena Execution Desk</p>
          <h1>Allocate Topics</h1>
          <p>
            Select a topics sheet from Backend/Topics and allocate one random topic at a time
            without repeats until history is cleared.
          </p>
          <Link className="topics-page-back" to="/">
            Back to Home
          </Link>
        </header>

        <TopicsModule />
      </div>
    </main>
  );
}

export default TopicsPage;
