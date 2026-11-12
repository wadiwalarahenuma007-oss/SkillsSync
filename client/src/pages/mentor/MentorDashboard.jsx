import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import axios from "axios";
import "../../styles/Mentor/Dashboard.css";

import {
  RiCalendarLine,
  RiUserStarLine,
  RiStarLine,
  RiFileList3Line,
  RiMoneyDollarCircleLine,
  RiShieldCheckLine,
  RiCoinsLine,
  RiStarSmileLine,
  RiArrowRightLine,
  RiLoader4Line,
} from "react-icons/ri";

import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
} from "recharts";

const CustomTooltip = ({ active, payload }) => {
  if (active && payload && payload.length) {
    return (
      <div className="chart-tooltip">
        <p>{payload[0].payload.name}</p>
        <span>{payload[0].value} Coins</span>
      </div>
    );
  }
  return null;
};

const MentorDashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  /* ── Real data state ── */
  const [stats,    setStats]    = useState({ totalStudents: 0, pendingRequests: 0, activeSessions: 0, completedSessions: 0 });
  const [requests, setRequests] = useState([]);   // pending requests for banner + card
  const [sessions, setSessions] = useState([]);
  const [loading,  setLoading]  = useState(true);

  /* ── Fetch data on mount ── */
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const [reqRes, sessRes] = await Promise.allSettled([
          axios.get("https://skillssync-a4r9.onrender.com/api/mentor/requests/list", { withCredentials: true }),
          axios.get("https://skillssync-a4r9.onrender.com/api/sessions/mentor", { withCredentials: true }),
        ]);

        const allRequests = reqRes.status === "fulfilled" ? (reqRes.value.data.requests || []) : [];
        const allSessions = sessRes.status === "fulfilled" ? (sessRes.value.data.sessions || []) : [];

        const pending   = allRequests.filter((r) => r.status === "pending");
        const accepted  = allRequests.filter((r) => r.status === "accepted");
        const active    = allSessions.filter((s) => s.status === "upcoming" || s.status === "ongoing");
        const completed = allSessions.filter((s) => s.status === "completed");

        setRequests(pending.slice(0, 3));
        setSessions(allSessions);
        setStats({
          totalStudents:      accepted.length,
          pendingRequests:    pending.length,
          activeSessions:     active.length,
          completedSessions:  completed.length,
        });
      } catch (err) {
        console.error("Dashboard fetch error:", err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  /* ── Skills chart — built from real sessions, fallback to mentor's own skills with 0 ── */
  const skillEarnings = {};
  sessions.filter(s => s.status === "completed").forEach(s => {
    const sk = s.skill || "Other";
    skillEarnings[sk] = (skillEarnings[sk] || 0) + (s.coinReward || 30);
  });
  const skillData = Object.keys(skillEarnings).length > 0
    ? Object.entries(skillEarnings).slice(0, 4).map(([name, earnings]) => ({ name, earnings }))
    : (user?.skills_offered || ["React", "Node"]).slice(0, 4).map((s) => ({ name: s, earnings: 0 }));

  /* ── Recent activity built from requests ── */
  const recentActivity = requests.slice(0, 4).map((r) =>
    `New request from ${r.student?.name || "a student"}`
  );
  if (recentActivity.length === 0) recentActivity.push("No recent activity yet");

  return (
    <div className="mentor-dashboard">

      {/* Welcome Banner */}
      <div className="welcome-banner">
        <div>
          <h1>Welcome back, {user?.name || "Mentor"} 👨‍🏫</h1>
          <p>
            {loading
              ? "Loading your dashboard..."
              : stats.pendingRequests > 0
              ? `You have ${stats.pendingRequests} pending request${stats.pendingRequests > 1 ? "s" : ""} waiting for your response.`
              : "You have no pending requests right now."}
          </p>

          <div className="banner-actions">
            <button onClick={() => navigate("/mentor/sessions")}>Create Session</button>
            <button className="outline-btn" onClick={() => navigate("/mentor/students")}>
              My Students
            </button>
          </div>
        </div>

        {/* Coins — real from DB, capped to show user's actual coins (max displayed 100 as default) */}
        <div className="coin-box">
          🪙 {user?.skillCoins ?? 100} Coins
        </div>
      </div>

      {/* Stats */}
      <div className="stats-grid">

        <div className="stat-card" onClick={() => navigate("/mentor/students")} style={{ cursor: "pointer" }}>
          <div className="stat-icon purple"><RiUserStarLine /></div>
          <RiArrowRightLine className="arrow" />
          <h2>{loading ? "—" : stats.totalStudents}</h2>
          <p>Total Students</p>
        </div>

        <div className="stat-card" onClick={() => navigate("/mentor/sessions")} style={{ cursor: "pointer" }}>
          <div className="stat-icon cyan"><RiCalendarLine /></div>
          <RiArrowRightLine className="arrow" />
          <h2>{loading ? "—" : stats.activeSessions}</h2>
          <p>Active Sessions</p>
        </div>

        <div className="stat-card">
          <div className="stat-icon gold"><RiCoinsLine /></div>
          <RiArrowRightLine className="arrow" />
          <h2>{user?.skillCoins ?? 100}</h2>
          <p>Skill Coins Earned</p>
        </div>

        <div className="stat-card">
          <div className="stat-icon green"><RiStarSmileLine /></div>
          <RiArrowRightLine className="arrow" />
          <h2>{user?.rating ? user.rating.toFixed(1) : "—"}</h2>
          <p>Average Rating</p>
        </div>

      </div>

      {/* Chart + Activity */}
      <div className="dashboard-row">

        <div className="dashboard-card chart-card">
          <h3>📊 Top Skills</h3>
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={skillData}>
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip content={<CustomTooltip />} cursor={false} />
              <Bar dataKey="earnings" radius={[10, 10, 0, 0]} fill="#8b5cf6" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="dashboard-card activity-card">
          <h3>🕒 Recent Activity</h3>
          {recentActivity.map((item, index) => (
            <div key={index} className="activity-item">
              <span className="dot"></span>
              {item}
            </div>
          ))}
        </div>

      </div>

      {/* Pending Requests */}
      <div className="dashboard-card request-section">

        <div className="section-header">
          <h3>📩 Pending Student Requests</h3>
          <span className="cursor-pointer" onClick={() => navigate("/mentor/requests")} style={{ cursor: "pointer" }}>
            View All →
          </span>
        </div>

        <div className="request-grid">
          {loading ? (
            <div style={{ display: "flex", alignItems: "center", gap: ".5rem", color: "#94a3b8", padding: "1rem" }}>
              <RiLoader4Line style={{ animation: "spin 1s linear infinite" }} />
              Loading requests...
            </div>
          ) : requests.length === 0 ? (
            <p style={{ color: "#94a3b8", padding: "1rem", margin: 0, fontSize: ".875rem" }}>
              No pending requests right now.
            </p>
          ) : (
            requests.map((req) => (
              <div key={req._id} className="request-card">
                <div>
                  <h4>{req.student?.name || "Student"}</h4>
                  <p>{req.skill || "Mentorship"}</p>
                </div>
                <div className="request-actions">
                  <button
                    className="accept-btn"
                    onClick={() => navigate("/mentor/requests")}
                  >
                    Respond
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

      </div>

      {/* Quick Actions */}
      <div className="dashboard-card">
        <h3>⚡ Quick Actions</h3>
        <div className="quick-grid">
          <button className="quick-action purple-card" onClick={() => navigate("/mentor/sessions")}>
            <RiCalendarLine />
            <span>Create Session</span>
          </button>
          <button className="quick-action blue-card" onClick={() => navigate("/mentor/students")}>
            <RiUserStarLine />
            <span>My Students</span>
          </button>
          <button className="quick-action gold-card" onClick={() => navigate("/mentor/reviews")}>
            <RiStarLine />
            <span>View Reviews</span>
          </button>
          <button className="quick-action cyan-card" onClick={() => navigate("/mentor/tests")}>
            <RiFileList3Line />
            <span>Create Test</span>
          </button>
          <button className="quick-action red-card" onClick={() => navigate("/mentor/earnings")}>
            <RiMoneyDollarCircleLine />
            <span>Earnings</span>
          </button>
          <button className="quick-action indigo-card" onClick={() => navigate("/mentor/verification")}>
            <RiShieldCheckLine />
            <span>Verification</span>
          </button>
        </div>
      </div>

    </div>
  );
};

export default MentorDashboard;
