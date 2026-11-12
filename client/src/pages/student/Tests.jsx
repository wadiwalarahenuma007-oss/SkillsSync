import { useState, useEffect } from "react";
import axios from "axios";
import { useAuth } from "../../context/AuthContext";
import {
    RiCheckboxCircleLine,
    RiCloseCircleLine,
    RiTimeLine,
    RiCoinsLine,
    RiTrophyLine,
    RiArrowRightLine,
    RiBookOpenLine,
    RiQuestionLine,
    RiRestartLine,
} from "react-icons/ri";

import "../../styles/Student/Tests.css";

const skillMeta = {
    'JavaScript': { icon: '🟨', color: 'yellow' },
    'React.js': { icon: '⚛️', color: 'cyan' },
    'Node.js': { icon: '🟢', color: 'green' },
    'Python': { icon: '🐍', color: 'blue' },
    'MongoDB': { icon: '🍃', color: 'purple' },
    'UI/UX Design': { icon: '🎨', color: 'pink' },
};

const Tests = () => {
    const { refreshUser } = useAuth();
    const [tests, setTests] = useState([]);
    const [loadingTests, setLoadingTests] = useState(true);
    const [stats, setStats] = useState({ taken: 0, passed: 0, avgScore: 0, coinsEarned: 0 });
    
    const [selectedTest, setSelectedTest] = useState(null);
    const [loadingTest, setLoadingTest] = useState(false);
    
    const [currentQuestion, setCurrentQuestion] = useState(0);
    const [answers, setAnswers] = useState([]);
    const [submitting, setSubmitting] = useState(false);
    const [result, setResult] = useState(null);

    useEffect(() => {
        const fetchTestsAndStats = async () => {
            try {
                const [testsRes, statsRes] = await Promise.all([
                    axios.get("https://skillssync-a4r9.onrender.com/api/tests", { withCredentials: true }),
                    axios.get("https://skillssync-a4r9.onrender.com/api/tests/stats", { withCredentials: true })
                ]);
                setTests(testsRes.data.tests || []);
                setStats(statsRes.data.stats || { taken: 0, passed: 0, avgScore: 0, coinsEarned: 0 });
            } catch (err) {
                console.error("Failed to load tests or stats", err);
                setTests([]);
            } finally {
                setLoadingTests(false);
            }
        };
        fetchTestsAndStats();
    }, []);

    const startTest = async (testId) => {
        setLoadingTest(true);
        try {
            const res = await axios.get(`https://skillssync-a4r9.onrender.com/api/tests/${testId}`, { withCredentials: true });
            setSelectedTest(res.data.test);
            setAnswers([]);
            setCurrentQuestion(0);
            setResult(null);
        } catch(err) {
            alert('Failed to load test');
        } finally {
            setLoadingTest(false);
        }
    };

    const handleNext = () => {
        if (currentQuestion < selectedTest.questions.length - 1) {
            setCurrentQuestion((prev) => prev + 1);
        } else {
            submitTest();
        }
    };

    const submitTest = async () => {
        setSubmitting(true);
        try {
            const res = await axios.post(
                `https://skillssync-a4r9.onrender.com/api/tests/${selectedTest._id}/attempt`,
                { answers },
                { withCredentials: true }
            );
            setResult(res.data);
            if (res.data.coinsEarned > 0) refreshUser();
        } catch(err) {
            const msg = err.response?.data?.message || 'Failed to submit';
            if (msg.includes('already passed')) {
                alert('You have already passed this test!');
                setSelectedTest(null);
            } else {
                alert(msg);
            }
        } finally {
            setSubmitting(false);
        }
    };

    const restartTest = () => {
        if (!selectedTest) return;
        setAnswers([]);
        setCurrentQuestion(0);
        setResult(null);
    };

    const closeTest = () => {
        setSelectedTest(null);
        setCurrentQuestion(0);
        setAnswers([]);
        setResult(null);
        // Refresh tests and stats in case stats updated
        axios.get("https://skillssync-a4r9.onrender.com/api/tests/stats", { withCredentials: true })
             .then(res => setStats(res.data)).catch(console.error);
    };

    /* =====================================================
       TEST RESULT
    ===================================================== */

    if (result && selectedTest) {
        return (
            <div className="tests-page">
                <div className="test-result-card">
                    <div className="test-result-icon">
                        <RiTrophyLine />
                    </div>
                    <span className="test-result-label">
                        Test Completed
                    </span>
                    <h1>
                        {result.passed ? "Great job! 🎉" : "Keep Practicing!"}
                    </h1>
                    <div className="test-score">
                        <strong>
                            {result.correct}/{result.total}
                        </strong>
                        <span>
                            {result.percentage}%
                        </span>
                    </div>
                    <p>
                        You completed the {selectedTest.title} test.
                        {!result.passed && " You need 70% to pass."}
                    </p>
                    <div className="result-stats">
                        <div>
                            <RiCheckboxCircleLine />
                            <strong>{result.correct}</strong>
                            <span>Correct</span>
                        </div>
                        <div>
                            <RiCloseCircleLine />
                            <strong>{result.total - result.correct}</strong>
                            <span>Wrong</span>
                        </div>
                        <div>
                            <RiCoinsLine />
                            <strong>+{result.coinsEarned}</strong>
                            <span>Coins</span>
                        </div>
                    </div>
                    <div className="result-actions">
                        <button
                            className="test-secondary-btn"
                            onClick={closeTest}
                        >
                            Back to Tests
                        </button>
                        <button
                            className="test-primary-btn"
                            onClick={restartTest}
                        >
                            <RiRestartLine />
                            Try Again
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    /* =====================================================
       TEST QUESTIONS
    ===================================================== */

    if (selectedTest && !result) {
        const question = selectedTest.questions[currentQuestion];
        const meta = skillMeta[selectedTest.skill] || { icon: '📝', color: 'purple' };

        return (
            <div className="tests-page">
                <div className="test-header">
                    <button
                        className="test-back-btn"
                        onClick={closeTest}
                    >
                        ← Back to Tests
                    </button>
                    <div className="test-progress-info">
                        Question {currentQuestion + 1} of{" "}
                        {selectedTest.questions.length}
                    </div>
                </div>
                <div className="test-progress">
                    <div
                        style={{
                            width: `${
                                ((currentQuestion + 1) /
                                    selectedTest.questions.length) *
                                100
                            }%`,
                        }}
                    />
                </div>
                <div className="question-card">
                    <div className="question-top">
                        <span>
                            {meta.icon}
                        </span>
                        <div>
                            <h2>{selectedTest.title}</h2>
                            <p>Skill Assessment</p>
                        </div>
                    </div>
                    <div className="question-number">
                        Question {currentQuestion + 1}
                    </div>
                    <h1 className="question-title">
                        {question.question}
                    </h1>
                    <div className="question-options">
                        {question.options.map((option, idx) => (
                            <button
                                key={idx}
                                type="button"
                                className={`question-option ${
                                    answers[currentQuestion] === idx
                                        ? "selected"
                                        : ""
                                }`}
                                onClick={() => {
                                    setAnswers((prev) => {
                                        const next = [...prev];
                                        next[currentQuestion] = idx;
                                        return next;
                                    });
                                }}
                            >
                                <span className="option-circle">
                                    {answers[currentQuestion] === idx
                                        ? "✓"
                                        : ""}
                                </span>
                                <span>{option}</span>
                            </button>
                        ))}
                    </div>
                    <div className="question-footer">
                        <span>
                            <RiQuestionLine />
                            Select one answer
                        </span>
                        <button
                            className="test-primary-btn"
                            disabled={answers[currentQuestion] === undefined || submitting}
                            onClick={handleNext}
                        >
                            {submitting ? "Submitting..." : (
                                currentQuestion === selectedTest.questions.length - 1
                                    ? "Submit Test"
                                    : "Next Question"
                            )}
                            <RiArrowRightLine />
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    /* =====================================================
       TEST DASHBOARD
    ===================================================== */

    return (
        <div className="tests-page">
            {/* Header */}
            <section className="tests-hero">
                <div className="tests-hero-content">
                    <div className="tests-hero-icon">
                        🎯
                    </div>
                    <div>
                        <h1>
                            Skill <span>Tests</span>
                        </h1>
                        <p>
                            Test your knowledge, improve your skills
                            and earn Skill Coins.
                        </p>
                    </div>
                </div>
            </section>

            {/* Stats */}
            <section className="tests-stats">
                <div className="test-stat-card">
                    <div className="test-stat-icon purple">
                        <RiBookOpenLine />
                    </div>
                    <div>
                        <span>Tests Taken</span>
                        <strong>{stats.taken || 0}</strong>
                    </div>
                </div>

                <div className="test-stat-card">
                    <div className="test-stat-icon green">
                        <RiCheckboxCircleLine />
                    </div>
                    <div>
                        <span>Tests Passed</span>
                        <strong>{stats.passed || 0}</strong>
                    </div>
                </div>

                <div className="test-stat-card">
                    <div className="test-stat-icon yellow">
                        <RiTrophyLine />
                    </div>
                    <div>
                        <span>Average Score</span>
                        <strong>{stats.avgScore || 0}%</strong>
                    </div>
                </div>

                <div className="test-stat-card">
                    <div className="test-stat-icon cyan">
                        <RiCoinsLine />
                    </div>
                    <div>
                        <span>Coins Earned</span>
                        <strong>{stats.coinsEarned || 0}</strong>
                    </div>
                </div>
            </section>

            {/* Available Tests */}
            <section className="available-tests">
                <div className="section-heading">
                    <div>
                        <h2>Available Tests</h2>
                        <p>
                            Choose a skill and challenge yourself.
                        </p>
                    </div>
                </div>

                {loadingTests ? (
                    <div className="tests-grid">Loading tests...</div>
                ) : tests.length === 0 ? (
                    <div className="tests-empty" style={{ textAlign: 'center', padding: '40px', color: '#94a3b8' }}>
                        No tests available yet.
                    </div>
                ) : (
                    <div className="tests-grid">
                        {tests.map((test) => {
                            const meta = skillMeta[test.skill] || { icon: '📝', color: 'purple' };
                            return (
                                <div
                                    className={`test-card test-card-${meta.color}`}
                                    key={test._id}
                                >
                                    <div className="test-card-top">
                                        <div className="test-skill-icon">
                                            {meta.icon}
                                        </div>
                                        <span className="test-level">
                                            {test.difficulty || "Beginner"}
                                        </span>
                                    </div>
                                    <h3>
                                        {test.title}
                                    </h3>
                                    <p>
                                        {test.description}
                                    </p>
                                    <div className="test-meta">
                                        <span>
                                            <RiQuestionLine />
                                            {test.questions?.length || 0} Questions
                                        </span>
                                        <span>
                                            <RiTimeLine />
                                            {test.duration} min
                                        </span>
                                        <span>
                                            <RiCoinsLine />
                                            {test.coinReward || 0} Coins
                                        </span>
                                    </div>
                                    <button
                                        className="start-test-btn"
                                        onClick={() => startTest(test._id)}
                                        disabled={loadingTest}
                                    >
                                        {loadingTest ? "Loading..." : "Start Test"}
                                        <RiArrowRightLine />
                                    </button>
                                </div>
                            );
                        })}
                    </div>
                )}
            </section>
        </div>
    );
};

export default Tests;
