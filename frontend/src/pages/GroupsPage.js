import React from 'react';
import { Link } from 'react-router-dom';
import GroupModule from '../components/group';
import './GroupsPage.css';

function GroupsPage() {
  return (
    <main className="groups-page-root">
      <div className="groups-page-shell">
        <header className="groups-page-header">
          <p className="groups-page-kicker">Speaker's Arena Execution Desk</p>
          <h1>Create Groups</h1>
          <p>
            Select an Excel participant sheet from Backend/groups and generate random,
            unbiased group allocations with strict size validation.
          </p>
          <Link className="groups-page-back" to="/">
            Back to Home
          </Link>
        </header>

        <GroupModule />
      </div>
    </main>
  );
}

export default GroupsPage;
