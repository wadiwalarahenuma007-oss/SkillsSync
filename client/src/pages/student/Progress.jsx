import React, { useState, useEffect } from "react";
import axios from "axios";
import {
    RiBarChartLine,
    RiBookOpenLine,
    RiCheckboxCircleLine,
    RiCalendarCheckLine,
    RiFireLine,
    RiTrophyLine,
    RiTimeLine,
    RiArrowUpLine,
    RiCloseLine,
    RiArrowRightLine,
    RiLoader4Line,
} from "react-icons/ri";

import "../../styles/Student/Progress.css";

const SKILL_COLORS = ["purple", "green", "yellow", "cyan", "pink", "blue"];

const Progress = () => {

    /* =====================================================
       STATES
    ===================================================== */

    const [selectedSkill, setSelectedSkill]   = useState(null);
    const [loading, setLoading]               = useState(true);
    const [skillProgress, setSkillProgress]   = useState([]);
    const [recentActivity, setRecentActivity] = useState([]);
    const [stats, setStats]                   = useState({
        overallProgress: 0,
        skillsCount: 0,
        testsCompleted: 0,
        sessionsCompleted: 0,
    });

    useEffect(() => { fetchProgress(); }, []);

    const fetchProgress = async () => {
        setLoading(true);
        try {
            const [sessionsRes, testStatsRes, testAttemptsRes] = await Promise.all([
                axios.get("https://skillssync-a4r9.onrender.com/api/sessions/mine", { withCredentials: true }),
                axios.get("https://skillssync-a4r9.onrender.com/api/tests/stats", { withCredentials: true }),
                // We'll use sessions for recent activity
                axios.get("https://skillssync-a4r9.onrender.com/api/sessions/mine", { withCredentials: true }),
            ]);

            const sessions  = sessionsRes.data.sessions  || [];

            // Build skill progress from sessions
            const skillMap = {};
            sessions.forEach(s => {
                const skill = s.skill || s.title || "General";
                if (!skillMap[skill]) {
                    skillMap[skill] = { sessions: 0, hours: 0, tests: 0 };
                }
                skillMap[skill].sessions++;
                skillMap[skill].hours += (parseInt(s.duration) || 60) / 60;
            });

            // Build per-skill progress (each session = 10% towards that skill, max 100)
            const skillArr = Object.entries(skillMap).map(([name, data], idx) => ({
                id: idx + 1,
                name,
                sessions: data.sessions,
                hours: Math.round(data.hours * 10) / 10,
                tests: data.tests,
                progress: Math.min(100, data.sessions * 10),
                color: SKILL_COLORS[idx % SKILL_COLORS.length],
            }));

            const testStats = testStatsRes.data || {};
            const sessionsCompleted = sessions.filter(s => s.status === "completed").length;
            const testsCompleted    = testStats.passed || 0;
            const overallProgress   = skillArr.length > 0
                ? Math.round(skillArr.reduce((s, sk) => s + sk.progress, 0) / skillArr.length)
                : 0;

            // Recent activity from sessions (last 5)
            const recent = sessions.slice(0, 5).map((s, i) => ({
                id: s._id || i,
                title: `${s.status === "completed" ? "Completed" : "Scheduled"} ${s.skill || s.title || "Session"} with ${s.mentor?.name || "Mentor"}`,
                time: new Date(s.createdAt).toLocaleDateString("en-IN", { day: "2-digit", month: "short" }),
                icon: s.status === "completed" ? <RiCheckboxCircleLine /> : <RiBookOpenLine />,
                type: s.status === "completed" ? "success" : "learning",
            }));

            setSkillProgress(skillArr);
            setRecentActivity(recent);
            setStats({
                overallProgress,
                skillsCount: skillArr.length,
                testsCompleted,
                sessionsCompleted,
            });
        } catch (err) {
            console.error("Progress fetch error:", err.message);
        } finally {
            setLoading(false);
        }
    };

    const { overallProgress, skillsCount, testsCompleted, sessionsCompleted } = stats;

    /* =====================================================
       CLOSE SKILL DETAILS
    ===================================================== */

    const closeSkillDetails = () => {
        setSelectedSkill(null);
    };


    return (
        <div className="progress-page">


            {/* =================================================
                HERO
            ================================================= */}

            <section className="progress-hero">

                <div className="progress-hero-icon">
                    <RiBarChartLine />
                </div>

                <div>
                    <h1>
                        Your <span>Progress</span>
                    </h1>

                    <p>
                        Track your learning journey and see how your
                        skills are growing.
                    </p>
                </div>

            </section>


            {/* =================================================
                OVERALL PROGRESS
            ================================================= */}

            <section className="overall-progress-card">

                <div className="overall-progress-header">

                    <div>
                        <span className="progress-label">
                            Overall Learning Progress
                        </span>

                        <h2>
                            Keep going, you're doing great! 🚀
                        </h2>
                    </div>

                    <div className="overall-percentage">
                        {overallProgress}%
                    </div>

                </div>


                <div className="overall-progress-bar">

                    <div
                        style={{
                            width: `${overallProgress}%`,
                        }}
                    />

                </div>


                <div className="progress-goal">

                    <span>
                        <RiArrowUpLine />
                        {overallProgress}% completed
                    </span>

                    <span>
                        Goal: 100%
                    </span>

                </div>

            </section>


            {/* =================================================
                STATS
            ================================================= */}

            <section className="progress-stats">

                <div className="progress-stat-card">

                    <div className="progress-stat-icon purple">
                        <RiBarChartLine />
                    </div>

                    <div>
                        <span>Skills Learning</span>
                        <strong>{skillsCount}</strong>
                    </div>

                </div>


                <div className="progress-stat-card">

                    <div className="progress-stat-icon green">
                        <RiCheckboxCircleLine />
                    </div>

                    <div>
                        <span>Tests Completed</span>
                        <strong>{testsCompleted}</strong>
                    </div>

                </div>


                <div className="progress-stat-card">

                    <div className="progress-stat-icon cyan">
                        <RiCalendarCheckLine />
                    </div>

                    <div>
                        <span>Sessions Completed</span>
                        <strong>{sessionsCompleted}</strong>
                    </div>

                </div>


                <div className="progress-stat-card">

                    <div className="progress-stat-icon orange">
                        <RiFireLine />
                    </div>

                    <div>
                        <span>Learning Streak</span>
                        <strong>7 Days</strong>
                    </div>

                </div>

            </section>


            {/* =================================================
                MAIN GRID
            ================================================= */}

            <section className="progress-main-grid">


                {/* =================================================
                    SKILL PROGRESS
                ================================================= */}

                <div className="skill-progress-card">

                    <div className="progress-section-heading">

                        <div>
                            <h2>Skill Progress</h2>

                            <p>
                                Click a skill to view detailed progress.
                            </p>
                        </div>

                        <RiBarChartLine />

                    </div>


                    <div className="skill-progress-list">

                        {loading ? (
                            <div style={{ textAlign: "center", padding: "2rem", color: "#94a3b8" }}>
                                <RiLoader4Line style={{ fontSize: "2rem", animation: "spin 1s linear infinite" }} />
                                <p style={{ marginTop: "0.5rem" }}>Loading progress...</p>
                            </div>
                        ) : skillProgress.length === 0 ? (
                            <div style={{ textAlign: "center", padding: "2rem", color: "#94a3b8" }}>
                                <RiBarChartLine style={{ fontSize: "2.5rem", marginBottom: "0.5rem" }} />
                                <p>No sessions yet. Start learning to track progress!</p>
                            </div>
                        ) : (
                        skillProgress.map((skill) => (

                            <button
                                type="button"
                                className="skill-progress-item"
                                key={skill.id}
                                onClick={() => setSelectedSkill(skill)}
                            >

                                <div className="skill-progress-top">

                                    <div>

                                        <strong>
                                            {skill.name}
                                        </strong>

                                        <span>
                                            {skill.sessions} learning sessions
                                        </span>

                                    </div>

                                    <div className="skill-progress-right">

                                        <b>
                                            {skill.progress}%
                                        </b>

                                        <RiArrowRightLine />

                                    </div>

                                </div>


                                <div className="skill-progress-track">

                                    <div
                                        className={`skill-progress-fill ${skill.color}`}
                                        style={{
                                            width: `${skill.progress}%`,
                                        }}
                                    />

                                </div>

                            </button>

                        ))
                        )}

                    </div>

                </div>


                {/* =================================================
                    STREAK
                ================================================= */}

                <div className="streak-card">

                    <div className="streak-icon">
                        <RiFireLine />
                    </div>

                    <span className="streak-label">
                        Current Streak
                    </span>

                    <strong className="streak-number">
                        7
                    </strong>

                    <span className="streak-days">
                        days 🔥
                    </span>

                    <p>
                        Keep learning every day to maintain your streak!
                    </p>


                    <div className="streak-week">

                        {["M", "T", "W", "T", "F", "S", "S"].map(
                            (day, index) => (

                                <div
                                    key={`${day}-${index}`}
                                    className={
                                        index < 5
                                            ? "streak-day completed"
                                            : "streak-day"
                                    }
                                >

                                    <span>{day}</span>

                                    <i>
                                        {index < 5 ? "✓" : ""}
                                    </i>

                                </div>

                            )
                        )}

                    </div>

                </div>

            </section>


   

            {/* =================================================
                ACHIEVEMENT
            ================================================= */}

            <section className="progress-achievement">

                <div className="achievement-icon">
                    <RiTrophyLine />
                </div>

                <div>

                    <span>
                        Next Milestone
                    </span>

                    <h3>
                        Complete 10 Learning Sessions
                    </h3>

                    <p>
                        You're only 2 sessions away from your next
                        achievement.
                    </p>

                </div>

                <div className="achievement-progress">

                    <strong>
                        8/10
                    </strong>

                    <div>
                        <span />
                    </div>

                </div>

            </section>


            {/* =================================================
                SKILL DETAILS MODAL
            ================================================= */}

            {selectedSkill && (

                <div
                    className="skill-details-overlay"
                    onClick={closeSkillDetails}
                >

                    <div
                        className="skill-details-modal"
                        onClick={(e) => e.stopPropagation()}
                    >

                        {/* Modal Header */}

                        <div className="skill-details-header">

                            <div>

                                <span>
                                    Skill Progress
                                </span>

                                <h2>
                                    {selectedSkill.name}
                                </h2>

                            </div>

                            <button
                                type="button"
                                className="skill-details-close"
                                onClick={closeSkillDetails}
                            >
                                <RiCloseLine />
                            </button>

                        </div>


                        {/* Main Progress */}

                        <div className="skill-details-main">

                            <div className="skill-details-percentage">
                                {selectedSkill.progress}%
                            </div>

                            <span>
                                Overall Progress
                            </span>

                        </div>


                        <div className="skill-details-progress-track">

                            <div
                                className={`skill-details-progress-fill ${selectedSkill.color}`}
                                style={{
                                    width: `${selectedSkill.progress}%`,
                                }}
                            />

                        </div>


                        {/* Stats */}

                        <div className="skill-details-stats">

                            <div>

                                <RiCalendarCheckLine />

                                <strong>
                                    {selectedSkill.sessions}
                                </strong>

                                <span>
                                    Sessions
                                </span>

                            </div>


                            <div>

                                <RiCheckboxCircleLine />

                                <strong>
                                    {selectedSkill.tests}
                                </strong>

                                <span>
                                    Tests
                                </span>

                            </div>


                            <div>

                                <RiTimeLine />

                                <strong>
                                    {selectedSkill.hours}h
                                </strong>

                                <span>
                                    Learning Time
                                </span>

                            </div>

                        </div>


                        {/* Recent Skill Activity */}

                        <div className="skill-details-activity">

                            <h3>
                                Recent Activity
                            </h3>

                            <div>
                                <RiCheckboxCircleLine />
                                Completed {selectedSkill.name} practice
                            </div>

                            <div>
                                <RiBookOpenLine />
                                Learning session completed
                            </div>

                            <div>
                                <RiTrophyLine />
                                Progress milestone reached
                            </div>

                        </div>


                        <button
                            type="button"
                            className="skill-details-done-btn"
                            onClick={closeSkillDetails}
                        >
                            Done
                        </button>

                    </div>

                </div>

            )}

        </div>
    );
};

export default Progress;
