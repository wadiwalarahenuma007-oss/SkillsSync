import React from "react";
import { useEffect, useState } from "react";
import axios from "axios";
import {
    RiUserLine,
    RiTeamLine,
    RiCalendarLine,
    RiVipCrownLine,
    RiExchangeLine,
    RiBarChartLine,
    RiCoinLine,
    RiArrowUpLine,
    RiArrowDownLine,
    RiUserAddLine,
    RiCheckboxCircleLine,
    RiTimeLine,
    RiStarLine,
} from "react-icons/ri";

import "../../styles/Admin/AdminDashboard.css";




const popularSkills = [
    {
        name: "React.js",
        category: "Programming",
        learners: 186,
        percentage: 82,
    },
    {
        name: "JavaScript",
        category: "Programming",
        learners: 164,
        percentage: 74,
    },
    {
        name: "UI/UX Design",
        category: "Design",
        learners: 128,
        percentage: 61,
    },
    {
        name: "Python",
        category: "Programming",
        learners: 112,
        percentage: 53,
    },
];

const AdminDashboard = () => {
    const [dashboardData, setDashboardData] = useState(null);
    const [recentUsers, setRecentUsers] = useState([]);


    const stats = [
        {
            title: "Total Users",
            value: dashboardData?.totalUsers || 0,
            change: "+12.5%",
            label: "registered",
            icon: <RiUserLine />,
            type: "purple",
        },

        {
            title: "Total Skills",
            value: dashboardData?.totalSkills || 0,
            change: "+0%",
            label: "platform skills",
            icon: <RiBarChartLine />,
            type: "cyan",
        },

        {
            title: "Active Skills",
            value: dashboardData?.activeSkills || 0,
            change: "+0%",
            label: "active",
            icon: <RiCheckboxCircleLine />,
            type: "green",
        },
        {
            title: "Recent Users",
            value: recentUsers ? recentUsers.length : 0,
            change: "+0%",
            label: "registered recently",
            icon: <RiCheckboxCircleLine />,
            type: "green",
        }
    ];

    const fetchDashboard = async () => {
        try {
            const response = await axios.get(
                "https://skillssync-a4r9.onrender.com/api/admin/dashboard"
            );
            console.log("FULL RESPONSE", response.data);
console.log("RECENT USERS", response.data.recentUsers);
            if (response.data.success) {
                setDashboardData(response.data.stats);
                setRecentUsers(response.data.recentUsers || []);
                // console.log(response.data.recentUsers);
            }

        } catch (error) {
            console.log(error);
        }
    };
    useEffect(() => {
        fetchDashboard();
    }, []);

    const totalUsers = dashboardData?.totalUsers || 0;
    const students = dashboardData?.totalStudents || 0;
    const mentors = dashboardData?.totalMentors || 0;
    const admins = dashboardData?.totalAdmins || 0;

    const studentPercent =
        totalUsers > 0
            ? ((students / totalUsers) * 100).toFixed(0)
            : 0;

    const mentorPercent =
        totalUsers > 0
            ? ((mentors / totalUsers) * 100).toFixed(0)
            : 0;

    const adminPercent =
        totalUsers > 0
            ? ((admins / totalUsers) * 100).toFixed(0)
            : 0;
            
    return (
        <div className="admin-dashboard">

            {/* =========================
                HEADER
                ========================= */}

            <section className="admin-dashboard-header">

                <div>
                    <span className="admin-dashboard-label">
                        ADMIN OVERVIEW
                    </span>

                    <h1>
                        Dashboard
                    </h1>

                    <p>
                        Monitor and manage your SkillSync platform.
                    </p>
                </div>

                <div className="admin-date-box">
                    <RiTimeLine />

                    <div>
                        <span>Today</span>
                        <strong>Platform Overview</strong>
                    </div>
                </div>

            </section>


            {/* =========================
                STATS
            ========================= */}

            <section className="admin-stats-grid">

                {stats.map((stat) => (

                    <div
                        className={`admin-stat-card ${stat.type}`}
                        key={stat.title}
                    >

                        <div className="admin-stat-top">

                            <div className="admin-stat-icon">
                                {stat.icon}
                            </div>

                            <span className="admin-stat-trend">
                                <RiArrowUpLine />
                                {stat.change}
                            </span>

                        </div>

                        <div className="admin-stat-info">

                            <span>
                                {stat.title}
                            </span>

                            <strong>
                                {stat.value}
                            </strong>

                            <small>
                                {stat.label}
                            </small>

                        </div>

                    </div>

                ))}

            </section>


            {/* =========================
                CHARTS / ANALYTICS
            ========================= */}

            <section className="admin-analytics-grid">

                {/* User Growth */}

                <div className="admin-card user-growth-card">

                    <div className="admin-card-header">

                        <div>
                            <h2>
                                User Growth
                            </h2>

                            <p>
                                New registered users
                            </p>
                        </div>

                        <select defaultValue="6">
                            <option value="6">
                                Last 6 Months
                            </option>

                            <option value="12">
                                Last Year
                            </option>
                        </select>

                    </div>


                    <div className="growth-chart">

                        <div className="chart-y-axis">
                            <span>400</span>
                            <span>300</span>
                            <span>200</span>
                            <span>100</span>
                            <span>0</span>
                        </div>

                        <div className="chart-area">

                            <div className="chart-grid-lines">
                                <span />
                                <span />
                                <span />
                                <span />
                                <span />
                            </div>

                            <svg
                                viewBox="0 0 600 230"
                                preserveAspectRatio="none"
                                className="growth-svg"
                            >
                                <defs>
                                    <linearGradient
                                        id="growthGradient"
                                        x1="0"
                                        y1="0"
                                        x2="0"
                                        y2="1"
                                    >
                                        <stop
                                            offset="0%"
                                            stopColor="#8b5cf6"
                                            stopOpacity="0.3"
                                        />

                                        <stop
                                            offset="100%"
                                            stopColor="#8b5cf6"
                                            stopOpacity="0"
                                        />
                                    </linearGradient>
                                </defs>

                                <path
                                    d="
                                    M0 190
                                    C70 175, 70 165, 120 170
                                    S170 145, 220 150
                                    S270 120, 320 130
                                    S370 100, 420 110
                                    S470 75, 520 85
                                    S570 55, 600 65
                                    L600 230
                                    L0 230
                                    Z
                                    "
                                    fill="url(#growthGradient)"
                                />

                                <path
                                    d="
                                    M0 190
                                    C70 175, 70 165, 120 170
                                    S170 145, 220 150
                                    S270 120, 320 130
                                    S370 100, 420 110
                                    S470 75, 520 85
                                    S570 55, 600 65
                                    "
                                    fill="none"
                                    stroke="#8b5cf6"
                                    strokeWidth="3"
                                />
                            </svg>

                            <div className="chart-x-axis">
                                <span>Mar</span>
                                <span>Apr</span>
                                <span>May</span>
                                <span>Jun</span>
                                <span>Jul</span>
                                <span>Aug</span>
                            </div>

                        </div>

                    </div>

                </div>


                {/* Platform Overview */}

                <div className="admin-card platform-overview-card">
              
                    <div className="admin-card-header">

                        <div>
                            <h2>
                                Platform Overview
                            </h2>

                            <p>
                                Current user distribution
                            </p>
                        </div>

                    </div>


                    <div className="platform-donut-area">

                        <div className="donut-chart"
                         style={{
                            background: `conic-gradient(
      #8b5cf6 0 ${studentPercent}%,
      #22d3ee ${studentPercent}% ${Number(studentPercent) +
                                Number(mentorPercent)
                                }%,
      #64748b ${Number(studentPercent) +
                                Number(mentorPercent)
                                }% 100%
    )`,
                        }}
                        >
                            <div className="donut-center">
                                <strong>{totalUsers}</strong>
                                <span>Total Users</span>
                            </div>
                        </div>

                    </div>


                    <div className="platform-legend">

                        <div>
                            <span className="legend-dot students" />
                            <span>Students</span>
                            <strong>{studentPercent}%</strong>
                        </div>

                        <div>
                            <span className="legend-dot mentors" />
                            <span>Mentors</span>
                            <strong>{mentorPercent}%</strong>
                        </div>

                        <div>
                            <span className="legend-dot admins" />
                            <span>Admins</span>
                            <strong>{adminPercent}%</strong>
                        </div>

                    </div>

                </div>

            </section>


            {/* =========================
                QUICK ACTIONS
            ========================= */}

            {/* <section className="admin-card quick-actions-card">

                <div className="admin-card-header">

                    <div>
                        <h2>
                            Quick Actions
                        </h2>

                        <p>
                            Frequently used admin controls
                        </p>
                    </div>

                </div>


                <div className="quick-actions-grid">

                    <button>
                        <RiUserAddLine />
                        <span>Add User</span>
                    </button>

                    <button>
                        <RiTeamLine />
                        <span>Manage Mentors</span>
                    </button>

                    <button>
                        <RiExchangeLine />
                        <span>View Requests</span>
                    </button>

                    <button>
                        <RiVipCrownLine />
                        <span>Memberships</span>
                    </button>

                    <button>
                        <RiCoinLine />
                        <span>Manage Coins</span>
                    </button>

                    <button>
                        <RiBarChartLine />
                        <span>View Reports</span>
                    </button>

                </div>

            </section> */}


            {/* =========================
                BOTTOM GRID
            ========================= */}
            {/* <h1 style={{ color: "red", fontSize: "40px" }}>
                Recent Users Length: {recentUsers.length}
            </h1> */}

            <section className="admin-bottom-grid">

                {/* Recent Users */}

                <div className="admin-card">

                    <div className="admin-card-header">

                        <div>
                            <h2>
                                Recent Users
                            </h2>

                            <p>
                                Latest registered users
                            </p>
                        </div>

                        <button className="admin-view-btn">
                            View All →
                        </button>

                    </div>


                    <div className="admin-table-wrapper">

                        <table className="admin-table">

                            <thead>
                                <tr>
                                    <th>User</th>
                                    <th>Role</th>
                                    <th>Status</th>
                                    <th>Joined</th>
                                </tr>
                            </thead>

                            <tbody>

                                {recentUsers?.map((user) => (

                                    <tr key={user._id}>

                                        <td>
                                            <div className="table-user">

                                                <div className="table-avatar">
                                                    {user?.name?.charAt(0)?.toUpperCase() || "U"}
                                                </div>

                                                <div>
                                                    <strong>{user?.name || "Unknown User"}</strong>

                                                    <span>
                                                        {user.email}
                                                    </span>
                                                </div>

                                            </div>
                                        </td>

                                        <td>
                                            <span className="role-badge">
                                                {user.role}
                                            </span>
                                        </td>

                                        <td>
                                            <span
                                                className={`status-badge ${user.isActive ? "active" : "inactive"
                                                    }`}
                                            >
                                                {user.isActive ? "Active" : "Inactive"}
                                            </span>
                                        </td>

                                        <td>
                                            {new Date(user.createdAt).toLocaleDateString()}
                                        </td>

                                    </tr>

                                ))}

                            </tbody>

                        </table>

                    </div>

                </div>


                {/* Popular Skills */}

                <div className="admin-card">

                    <div className="admin-card-header">

                        <div>
                            <h2>
                                Popular Skills
                            </h2>

                            <p>
                                Most requested skills
                            </p>
                        </div>

                    </div>


                    <div className="popular-skills-list">

                        { dashboardData?.popularSkills?.map((skill, index) => (

                            <div
                                className="popular-skill"
                                key={skill.name}
                            >

                                <div className="popular-skill-top">

                                    <div className="popular-skill-name">

                                        <span>
                                            {index + 1}
                                        </span>

                                        <div>
                                            <strong>
                                                {skill.name}
                                            </strong>

                                            <small>
                                                {skill.category}
                                            </small>
                                        </div>

                                    </div>

                                    <strong>
                                        {skill.learners}
                                    </strong>

                                </div>

                                <div className="skill-progress">
                                    <span
                                        style={{
                                            width: `${skill.percentage}%`,
                                        }}
                                    />
                                </div>

                            </div>

                        ))}

                    </div>

                </div>

            </section>



        </div>
    );
};

export default AdminDashboard;
