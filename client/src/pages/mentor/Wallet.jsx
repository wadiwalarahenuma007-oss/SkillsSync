import { useState, useEffect } from "react";
import axios from "axios";
import { useAuth } from "../../context/AuthContext";
import "../../styles/Mentor/Wallet.css";
import { RiArrowUpLine, RiArrowDownLine, RiLoader4Line } from "react-icons/ri";
import {
    ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid,
} from "recharts";

const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
        return (
            <div className="wallet-tooltip">
                <p>{payload[0].payload.name}</p>
                <span>🪙 {payload[0].value} Coins</span>
            </div>
        );
    }
    return null;
};

const typeEmoji = {
    welcome:  "🎁",
    test:     "📝",
    session:  "📚",
    review:   "⭐",
    milestone:"🏆",
    spend:    "🔄",
    other:    "💰",
};

const MentorWallet = () => {
    const { user } = useAuth();
    const [transactions, setTransactions] = useState([]);
    const [loading, setLoading]           = useState(true);
    const [activeTab, setActiveTab]       = useState("All");

    useEffect(() => { fetchData(); }, []);

    const fetchData = async () => {
        setLoading(true);
        try {
            const res = await axios.get("https://skillssync-a4r9.onrender.com/api/wallet/transactions", {
                withCredentials: true,
            });
            setTransactions(res.data.transactions || []);
        } catch (err) {
            console.error("Mentor wallet fetch error:", err.message);
        } finally {
            setLoading(false);
        }
    };

    const balance    = user?.skillCoins ?? 0;
    const totalEarned = transactions.filter(t => t.amount > 0).reduce((s, t) => s + t.amount, 0);
    const totalSpent  = Math.abs(transactions.filter(t => t.amount < 0).reduce((s, t) => s + t.amount, 0));
    const thisWeekEarned = (() => {
        const now = new Date();
        const weekAgo = new Date(now - 7 * 24 * 60 * 60 * 1000);
        return transactions.filter(t => t.amount > 0 && new Date(t.createdAt) >= weekAgo)
            .reduce((s, t) => s + t.amount, 0);
    })();
    const avgPerEarn = (() => {
        const earns = transactions.filter(t => t.amount > 0);
        return earns.length > 0 ? Math.round(totalEarned / earns.length) : 0;
    })();

    const filtered = transactions.filter(t => {
        if (activeTab === "Earned") return t.amount > 0;
        if (activeTab === "Spent")  return t.amount < 0;
        return true;
    });

    // Build chart data from last 6 transactions (cumulative)
    const chartData = (() => {
        const sorted = [...transactions].sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
        let running = 0;
        return sorted.slice(-6).map((t, i) => {
            running += t.amount;
            return { name: `T${i + 1}`, coins: running };
        });
    })();

    const fmtDate = (iso) => {
        if (!iso) return "";
        return new Date(iso).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" });
    };

    return (
        <div className="mentor-wallet-page">

            {/* HEADER */}
            <div className="wallet-topbar">
                <div>
                    <h1>🪙 Skill Coin Wallet</h1>
                    <p>Earn by teaching. Spend to learn. Grow together.</p>
                </div>
            </div>

            {/* BALANCE CARD */}
            <div className="wallet-balance-card">
                <div className="wallet-balance-label">Current Balance</div>
                <div className="wallet-balance-row">
                    <span className="wallet-coin-icon">🪙</span>
                    <span className="wallet-balance-amount">
                        {loading ? "..." : balance.toLocaleString()}
                    </span>
                </div>
                <div className="wallet-balance-sublabel">Skill Coins</div>
                <div className="wallet-balance-meta">
                    <div className="wallet-meta-stat">
                        <span className="wallet-meta-stat-val earned">+{totalEarned}</span>
                        <span className="wallet-meta-stat-label">Total Earned</span>
                    </div>
                    <div className="wallet-meta-stat">
                        <span className="wallet-meta-stat-val spent">−{totalSpent}</span>
                        <span className="wallet-meta-stat-label">Total Spent</span>
                    </div>
                </div>
            </div>

            {/* MINI STATS */}
            <div className="wallet-stats">
                <div className="wallet-stat-card">
                    <div className="wallet-stat-card-icon">✏️</div>
                    <h3>{loading ? "..." : thisWeekEarned}</h3>
                    <p>Earned This Week</p>
                </div>
                <div className="wallet-stat-card">
                    <div className="wallet-stat-card-icon">🔄</div>
                    <h3>{loading ? "..." : transactions.length}</h3>
                    <p>Transactions</p>
                </div>
                <div className="wallet-stat-card">
                    <div className="wallet-stat-card-icon">🎯</div>
                    <h3>{loading ? "..." : avgPerEarn}</h3>
                    <p>Avg per Earn</p>
                </div>
                <div className="wallet-stat-card">
                    <div className="wallet-stat-card-icon">💰</div>
                    <h3>{loading ? "..." : totalEarned - totalSpent}</h3>
                    <p>Net Balance</p>
                </div>
            </div>

            {/* COIN ACTIVITY CHART */}
            <div className="wallet-activity-card">
                <div className="wallet-card-title">📈 Coin Activity</div>
                {chartData.length === 0 ? (
                    <div style={{ textAlign: "center", padding: "2rem", color: "#94a3b8" }}>
                        No activity yet.
                    </div>
                ) : (
                    <ResponsiveContainer width="100%" height={220}>
                        <LineChart data={chartData}>
                            <CartesianGrid stroke="rgba(255,255,255,0.04)" strokeDasharray="4 4" />
                            <XAxis dataKey="name" tick={{ fill: "#94a3b8", fontSize: 12 }} axisLine={false} tickLine={false} />
                            <YAxis tick={{ fill: "#94a3b8", fontSize: 12 }} axisLine={false} tickLine={false} />
                            <Tooltip content={<CustomTooltip />} cursor={{ stroke: "rgba(139,92,246,0.2)" }} />
                            <Line type="monotone" dataKey="coins" stroke="#fbbf24" strokeWidth={2.5}
                                dot={{ fill: "#fbbf24", strokeWidth: 0, r: 4 }}
                                activeDot={{ r: 6, fill: "#fbbf24" }} />
                        </LineChart>
                    </ResponsiveContainer>
                )}
            </div>

            {/* TRANSACTION HISTORY */}
            <div className="wallet-history-card">
                <div className="wallet-history-header">
                    <div className="wallet-card-title">📒 Transaction History</div>
                    <div className="wallet-filter-tabs">
                        {["All", "Earned", "Spent"].map((tab) => (
                            <button key={tab} type="button"
                                className={`wallet-filter-tab${activeTab === tab ? " active" : ""}`}
                                onClick={() => setActiveTab(tab)}>
                                {tab}
                            </button>
                        ))}
                    </div>
                </div>

                <div className="wallet-txn-list">
                    {loading ? (
                        <div style={{ textAlign: "center", padding: "24px 0", color: "#94a3b8" }}>
                            <RiLoader4Line style={{ animation: "spin 1s linear infinite", fontSize: "1.5rem" }} />
                            <p>Loading...</p>
                        </div>
                    ) : filtered.length === 0 ? (
                        <div style={{ textAlign: "center", padding: "24px 0", color: "#94a3b8" }}>
                            No transactions found.
                        </div>
                    ) : (
                        filtered.map((txn) => (
                            <div key={txn._id} className="wallet-txn-item">
                                <div className={`wallet-txn-icon${txn.amount < 0 ? " debit" : ""}`}>
                                    {txn.amount > 0 ? <RiArrowUpLine /> : <RiArrowDownLine />}
                                </div>
                                <div className="wallet-txn-info">
                                    <h4>{typeEmoji[txn.type] || "💰"} {txn.description || txn.type}</h4>
                                    <span>{fmtDate(txn.createdAt)}</span>
                                </div>
                                <div className={`wallet-txn-amount${txn.amount < 0 ? " debit" : ""}`}>
                                    {txn.amount > 0 ? "+" : ""}{txn.amount}
                                    <span className="txn-coin">🪙</span>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>

        </div>
    );
};

export default MentorWallet;

