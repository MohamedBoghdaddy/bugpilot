import React from 'react';
import './Dashboard.css';

const Dashboard = () => {
  const userRole = "Tester"; // جرب تغيرها لـ Customer أو Developer عشان تشوف التغيير

  return (
    <div className="dashboard-container">
      <aside className="sidebar">
        <div className="sidebar-logo">
          Bug Tracker <span className="red-bug">🐞</span>
        </div>
        <nav className="sidebar-nav">
          <button className="nav-item active">Overview</button>
          <button className="nav-item">My Tasks</button>
          <button className="nav-item">Reports</button>
          <button className="nav-item logout-btn">Logout</button>
        </nav>
      </aside>

      <main className="main-content">
        <header className="main-header">
          <h1>Welcome, User!</h1>
          <div className="role-badge">{userRole}</div>
        </header>

        <section className="stats-grid">
          <div className="stat-card">
            <h3>Total Bugs</h3>
            <p className="stat-number">24</p>
          </div>
          <div className="stat-card">
            <h3>Pending</h3>
            <p className="stat-number" style={{color: '#8b0000'}}>12</p>
          </div>
          <div className="stat-card">
            <h3>Solved</h3>
            <p className="stat-number" style={{color: 'green'}}>8</p>
          </div>
        </section>

        <section className="actions-section">
          <h2>Quick Actions</h2>
          <div className="action-buttons">
            {userRole === "Customer" && <button className="primary-btn">Report a New Bug</button>}
            {userRole === "Tester" && <button className="primary-btn">Assign Bugs to Developers</button>}
            {userRole === "Developer" && <button className="primary-btn">View My Bug Queue</button>}
          </div>
        </section>
      </main>
    </div>
  );
};

export default Dashboard;
