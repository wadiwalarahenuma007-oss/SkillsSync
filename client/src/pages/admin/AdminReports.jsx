import React, { useState, useEffect } from "react";
import axios from "axios";
import { FaUsers, FaUserCheck, FaGraduationCap, FaStar } from "react-icons/fa";
import "../../styles/Admin/AdminReports.css";

const PERIOD_OPTIONS = [
    { value: "allTime",    label: "All Time" },
    { value: "thisMonth",  label: "This Month" },
    { value: "lastMonth",  label: "Last Month" },
    { value: "last3Months",label: "Last 3 Months" },
    { value: "thisYear",   label: "This Year" },
];

const AdminReports = () => {
    const [period, setPeriod]   = useState("allTime");
    const [data, setData]       = useState(null);
    const [loading, setLoading] = useState(true);

    const fetchReports = async (p) => {
        setLoading(true);
        try {
            const res = await axios.get(
                `https://skillssync-a4r9.onrender.com/api/admin/reports?period=${p}`,
                { withCredentials: true }
            );
            setData(res.data);
        } catch (err) {
            console.error("Reports fetch error:", err.message);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchReports(period); }, [period]);

    const stats      = data?.stats      || {};
    const topSkills  = data?.topSkills  || [];
    const recentUsers = data?.recentUsers || [];
    const maxSkillCount = topSkills.length > 0 ? Math.max(...topSkills.map(s => s.value), 1) : 1;

    const val = (key) => loading ? "..." : (stats[key] ?? 0);

    return (
        <div className="admin-reports-page">

            {/* Header */}
            <div className="reports-top">
                <div>
                    <h1>Reports</h1>
                    <p>Overview of platform insights and activity</p>
                </div>
                <select
                    className="reports-filter"
                    value={period}
                    onChange={e => setPeriod(e.target.value)}
                >
                    {PERIOD_OPTIONS.map(o => (
                        <option key={o.value} value={o.value}>{o.label}</option>
                    ))}
                </select>
            </div>

            {/* Top Stats Grid */}
            <div className="reports-stats-grid">
                <div className="reports-stat-card">
                    <div className="reports-stat-icon"><FaUsers /></div>
                    <div>
                        <h2>{val("totalUsers")}</h2>
                        <p>Total Users</p>
                    </div>
                </div>
                <div className="reports-stat-card">
                    <div className="reports-stat-icon"><FaUserCheck /></div>
                    <div>
                        <h2>{val("approvedMentors")}</h2>
                        <p>Verified Mentors</p>
                    </div>
                </div>
                <div className="reports-stat-card">
                    <div className="reports-stat-icon"><FaGraduationCap /></div>
                    <div>
                        <h2>{val("completedSessions")}</h2>
                        <p>Completed Sessions</p>
                    </div>
                </div>
                <div className="reports-stat-card">
                    <div className="reports-stat-icon"><FaStar /></div>
                    <div>
                        <h2>{val("avgRating")}</h2>
                        <p>Average Rating</p>
                    </div>
                </div>
            </div>

            {/* Charts / Skills */}
            <div className="reports-middle-grid">
                <div className="reports-card">
                    <h3>Most Requested Skills</h3>
                    <div className="skills-list">
                        {loading ? (
                            <div style={{ color: "#94a3b8", padding: "1rem" }}>Loading...</div>
                        ) : topSkills.length === 0 ? (
                            <div style={{ color: "#94a3b8", padding: "1rem" }}>No skill requests yet.</div>
                        ) : (
                            topSkills.map(skill => (
                                <div className="skill-row" key={skill.name}>
                                    <div className="skill-header">
                                        <span>{skill.name}</span>
                                        <span>{skill.value}</span>
                                    </div>
                                    <div className="skill-bar">
                                        <div
                                            className="skill-fill"
                                            style={{ width: `${Math.round((skill.value / maxSkillCount) * 100)}%` }}
                                        />
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            </div>

            {/* Bottom Section */}
            <div className="reports-bottom-section">
                {/* Recent Signups */}
                <div className="reports-half reports-card recent-activity-card">
                    <h3>Recent Signups</h3>
                    <div className="activity-list">
                        {loading ? (
                            <div style={{ color: "#94a3b8" }}>Loading...</div>
                        ) : recentUsers.length === 0 ? (
                            <div style={{ color: "#94a3b8" }}>No recent signups.</div>
                        ) : (
                            recentUsers.map(u => (
                                <div className="activity-item" key={u._id}>
                                    <div className="activity-dot" />
                                    <span>
                                        <strong>{u.name}</strong> joined as {u.isMentor ? "mentor" : u.role}
                                        {" "}&mdash; {new Date(u.createdAt).toLocaleDateString("en-IN", { day: "2-digit", month: "short" })}
                                    </span>
                                </div>
                            ))
                        )}
                    </div>
                </div>

                {/* Platform Summary */}
                <div className="reports-half reports-card platform-summary-card">
                    <h3>Platform Summary</h3>
                    <div className="summary-grid">
                        <div className="summary-box">
                            <h4>Students</h4>
                            <span>{val("totalStudents")}</span>
                        </div>
                        <div className="summary-box">
                            <h4>Mentors</h4>
                            <span>{val("totalMentors")}</span>
                        </div>
                        <div className="summary-box">
                            <h4>Skills</h4>
                            <span>{val("totalSkills")}</span>
                        </div>
                        <div className="summary-box">
                            <h4>Requests</h4>
                            <span>{val("totalRequests")}</span>
                        </div>
                        <div className="summary-box">
                            <h4>Sessions</h4>
                            <span>{val("totalSessions")}</span>
                        </div>
                        <div className="summary-box">
                            <h4>Tests</h4>
                            <span>{val("totalTests")}</span>
                        </div>
                        <div className="summary-box">
                            <h4>Reviews</h4>
                            <span>{val("totalReviews")}</span>
                        </div>
                        <div className="summary-box">
                            <h4>Attempts</h4>
                            <span>{val("totalAttempts")}</span>
                        </div>
                    </div>
                </div>
            </div>

        </div>
    );
};

export default AdminReports;

