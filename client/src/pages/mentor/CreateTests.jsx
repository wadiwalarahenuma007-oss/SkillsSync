import { useState, useEffect } from "react";
import axios from "axios";
import "../../styles/Mentor/CreateTests.css";
import {
    RiFileList3Line,
    RiSearchLine,
    RiAddLine,
    RiTimeLine,
    RiCheckboxCircleLine,
    RiCloseLine
} from "react-icons/ri";

export default function CreateTests() {
    const [tests, setTests] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState("");
    const [showModal, setShowModal] = useState(false);
    
    // Form state
    const [formData, setFormData] = useState({
        title: "",
        description: "",
        skill: "",
        difficulty: "Beginner",
        duration: 10,
        coinReward: 20,
        questions: [{ question: "", options: ["", "", "", ""], correctIndex: 0 }]
    });

    const fetchTests = async () => {
        setLoading(true);
        try {
            const res = await axios.get("https://skillssync-a4r9.onrender.com/api/tests/mine", { withCredentials: true });
            setTests(res.data.tests || []);
        } catch(err) {
            console.error("Failed to fetch tests", err);
            setTests([]);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchTests();
    }, []);

    const handleAddQuestion = () => {
        setFormData({
            ...formData,
            questions: [...formData.questions, { question: "", options: ["", "", "", ""], correctIndex: 0 }]
        });
    };

    const handleRemoveQuestion = (index) => {
        const newQuestions = [...formData.questions];
        newQuestions.splice(index, 1);
        setFormData({ ...formData, questions: newQuestions });
    };

    const handleQuestionChange = (index, field, value) => {
        const newQuestions = [...formData.questions];
        newQuestions[index][field] = value;
        setFormData({ ...formData, questions: newQuestions });
    };

    const handleOptionChange = (qIndex, optIndex, value) => {
        const newQuestions = [...formData.questions];
        newQuestions[qIndex].options[optIndex] = value;
        setFormData({ ...formData, questions: newQuestions });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await axios.post("https://skillssync-a4r9.onrender.com/api/tests", formData, { withCredentials: true });
            setShowModal(false);
            setFormData({
                title: "", description: "", skill: "", difficulty: "Beginner", duration: 10, coinReward: 20,
                questions: [{ question: "", options: ["", "", "", ""], correctIndex: 0 }]
            });
            fetchTests();
        } catch(err) {
            alert(err.response?.data?.message || "Failed to create test");
        }
    };

    const totalTests = tests.length;
    const activeTests = tests.length; // assuming all are active
    const totalAttempts = tests.reduce((sum, t) => sum + (t.totalAttempts || 0), 0);

    const filteredTests = tests.filter(t => t.title.toLowerCase().includes(search.toLowerCase()) || (t.skill && t.skill.toLowerCase().includes(search.toLowerCase())));

    return (
        <div className="create-tests-page">
            <div className="tests-header">
                <div>
                    <h1>
                        <RiFileList3Line />
                        MCQ <span>Tests</span>
                    </h1>
                    <p>{totalTests} tests created</p>
                </div>
                <button className="create-test-btn" onClick={() => setShowModal(true)}>
                    <RiAddLine />
                    Create Test
                </button>
            </div>

            <div className="tests-search">
                <RiSearchLine />
                <input
                    type="text"
                    placeholder="Search tests..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                />
            </div>

            <div className="tests-stats">
                <div className="test-stat-card purple">
                    <h2>{totalTests}</h2>
                    <p>Total Tests</p>
                </div>
                <div className="test-stat-card blue">
                    <h2>{activeTests}</h2>
                    <p>Active Tests</p>
                </div>
                <div className="test-stat-card green">
                    <h2>{totalAttempts}</h2>
                    <p>Total Attempts</p>
                </div>
            </div>

            <div className="tests-grid">
                {loading ? (
                    <div style={{ color: "#94a3b8" }}>Loading tests...</div>
                ) : filteredTests.length === 0 ? (
                    <div style={{ color: "#94a3b8" }}>No tests found.</div>
                ) : (
                    filteredTests.map((test) => (
                        <div className="test-card" key={test._id}>
                            <div className="test-card-top">
                                <div>
                                    <h3>{test.title}</h3>
                                    <p className="test-desc">{test.description}</p>
                                </div>
                                <span className="status active">Active</span>
                            </div>
                            <div className="test-meta">
                                <div className="meta-box">
                                    <RiFileList3Line />
                                    <span>{test.questions?.length || 0} Questions</span>
                                </div>
                                <div className="meta-box">
                                    <RiTimeLine />
                                    <span>{test.duration} Min</span>
                                </div>
                                <div className="meta-box">
                                    <RiCheckboxCircleLine />
                                    <span>{test.skill}</span>
                                </div>
                            </div>
                            <div className="test-footer">
                                <div className="attempts">
                                    {test.totalAttempts || 0} Attempts
                                </div>
                                <span className="status active">Active</span>
                            </div>
                            <button className="view-test-btn">
                                View Results ({test.totalAttempts || 0})
                            </button>
                        </div>
                    ))
                )}
            </div>

            {/* Create Test Modal - Inline Styles matching dark theme */}
            {showModal && (
                <div style={{
                    position: "fixed", top: 0, left: 0, width: "100%", height: "100%",
                    backgroundColor: "rgba(0,0,0,0.7)", display: "flex", justifyContent: "center", alignItems: "center",
                    zIndex: 1000, padding: "20px", boxSizing: "border-box"
                }}>
                    <div style={{
                        backgroundColor: "#1e1e2d", borderRadius: "12px", width: "100%", maxWidth: "800px",
                        maxHeight: "90vh", overflowY: "auto", border: "1px solid #323248",
                        display: "flex", flexDirection: "column"
                    }}>
                        <div style={{
                            padding: "20px 24px", borderBottom: "1px solid #323248", display: "flex",
                            justifyContent: "space-between", alignItems: "center", position: "sticky", top: 0, backgroundColor: "#1e1e2d", zIndex: 10
                        }}>
                            <h2 style={{ color: "#fff", margin: 0, fontSize: "1.25rem", display: "flex", alignItems: "center", gap: "8px" }}>
                                <RiAddLine color="#a855f7" /> Create New Test
                            </h2>
                            <button onClick={() => setShowModal(false)} style={{
                                background: "none", border: "none", color: "#94a3b8", cursor: "pointer", fontSize: "1.5rem", padding: 0
                            }}>
                                <RiCloseLine />
                            </button>
                        </div>

                        <form onSubmit={handleSubmit} style={{ padding: "24px", display: "flex", flexDirection: "column", gap: "20px" }}>
                            
                            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
                                <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                                    <label style={{ color: "#cbd5e1", fontSize: "0.9rem" }}>Title *</label>
                                    <input required value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})}
                                        style={{ padding: "10px", borderRadius: "8px", background: "#13131a", border: "1px solid #323248", color: "#fff" }} />
                                </div>
                                <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                                    <label style={{ color: "#cbd5e1", fontSize: "0.9rem" }}>Skill *</label>
                                    <input required value={formData.skill} onChange={e => setFormData({...formData, skill: e.target.value})}
                                        style={{ padding: "10px", borderRadius: "8px", background: "#13131a", border: "1px solid #323248", color: "#fff" }} placeholder="e.g. React.js" />
                                </div>
                            </div>

                            <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                                <label style={{ color: "#cbd5e1", fontSize: "0.9rem" }}>Description</label>
                                <textarea value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})}
                                    style={{ padding: "10px", borderRadius: "8px", background: "#13131a", border: "1px solid #323248", color: "#fff", minHeight: "80px", resize: "vertical" }} />
                            </div>

                            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "16px" }}>
                                <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                                    <label style={{ color: "#cbd5e1", fontSize: "0.9rem" }}>Difficulty</label>
                                    <select value={formData.difficulty} onChange={e => setFormData({...formData, difficulty: e.target.value})}
                                        style={{ padding: "10px", borderRadius: "8px", background: "#13131a", border: "1px solid #323248", color: "#fff" }}>
                                        <option value="Beginner">Beginner</option>
                                        <option value="Intermediate">Intermediate</option>
                                        <option value="Advanced">Advanced</option>
                                    </select>
                                </div>
                                <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                                    <label style={{ color: "#cbd5e1", fontSize: "0.9rem" }}>Duration (mins)</label>
                                    <input type="number" min="1" required value={formData.duration} onChange={e => setFormData({...formData, duration: Number(e.target.value)})}
                                        style={{ padding: "10px", borderRadius: "8px", background: "#13131a", border: "1px solid #323248", color: "#fff" }} />
                                </div>
                                <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                                    <label style={{ color: "#cbd5e1", fontSize: "0.9rem" }}>Coin Reward</label>
                                    <input type="number" min="0" required value={formData.coinReward} onChange={e => setFormData({...formData, coinReward: Number(e.target.value)})}
                                        style={{ padding: "10px", borderRadius: "8px", background: "#13131a", border: "1px solid #323248", color: "#fff" }} />
                                </div>
                            </div>

                            <div style={{ marginTop: "16px", borderTop: "1px solid #323248", paddingTop: "20px" }}>
                                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
                                    <h3 style={{ color: "#fff", margin: 0 }}>Questions</h3>
                                    <button type="button" onClick={handleAddQuestion} style={{
                                        background: "rgba(168, 85, 247, 0.1)", color: "#a855f7", border: "1px solid rgba(168, 85, 247, 0.2)",
                                        padding: "6px 12px", borderRadius: "6px", cursor: "pointer", display: "flex", alignItems: "center", gap: "4px", fontSize: "0.9rem"
                                    }}>
                                        <RiAddLine /> Add Question
                                    </button>
                                </div>

                                {formData.questions.map((q, qIndex) => (
                                    <div key={qIndex} style={{
                                        background: "rgba(255,255,255,0.02)", border: "1px solid #323248", borderRadius: "8px", padding: "16px", marginBottom: "16px"
                                    }}>
                                        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "12px" }}>
                                            <span style={{ color: "#a855f7", fontWeight: 500 }}>Question {qIndex + 1}</span>
                                            {formData.questions.length > 1 && (
                                                <button type="button" onClick={() => handleRemoveQuestion(qIndex)} style={{
                                                    background: "none", border: "none", color: "#ef4444", cursor: "pointer", fontSize: "0.9rem"
                                                }}>Remove</button>
                                            )}
                                        </div>

                                        <input required placeholder="Enter question text" value={q.question} onChange={e => handleQuestionChange(qIndex, "question", e.target.value)}
                                            style={{ width: "100%", boxSizing: "border-box", padding: "10px", borderRadius: "8px", background: "#13131a", border: "1px solid #323248", color: "#fff", marginBottom: "12px" }} />

                                        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px", marginBottom: "12px" }}>
                                            {q.options.map((opt, optIndex) => (
                                                <input key={optIndex} required placeholder={`Option ${optIndex + 1}`} value={opt} onChange={e => handleOptionChange(qIndex, optIndex, e.target.value)}
                                                    style={{ padding: "8px", borderRadius: "6px", background: "#13131a", border: "1px solid #323248", color: "#fff" }} />
                                            ))}
                                        </div>

                                        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                                            <label style={{ color: "#cbd5e1", fontSize: "0.9rem" }}>Correct Answer:</label>
                                            <select value={q.correctIndex} onChange={e => handleQuestionChange(qIndex, "correctIndex", Number(e.target.value))}
                                                style={{ padding: "8px", borderRadius: "6px", background: "#13131a", border: "1px solid #323248", color: "#fff" }}>
                                                <option value={0}>Option 1</option>
                                                <option value={1}>Option 2</option>
                                                <option value={2}>Option 3</option>
                                                <option value={3}>Option 4</option>
                                            </select>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            <div style={{ display: "flex", justifyContent: "flex-end", gap: "12px", marginTop: "20px", paddingTop: "20px", borderTop: "1px solid #323248" }}>
                                <button type="button" onClick={() => setShowModal(false)} style={{
                                    padding: "10px 20px", borderRadius: "8px", background: "none", border: "1px solid #323248", color: "#fff", cursor: "pointer"
                                }}>Cancel</button>
                                <button type="submit" style={{
                                    padding: "10px 20px", borderRadius: "8px", background: "linear-gradient(135deg, #a855f7 0%, #6366f1 100%)", border: "none", color: "#fff", cursor: "pointer", fontWeight: 600
                                }}>Create Test</button>
                            </div>

                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
