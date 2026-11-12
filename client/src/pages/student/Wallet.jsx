import React, { useState, useEffect } from "react";
import axios from "axios";
import {
    RiCoinLine,
    RiArrowUpLine,
    RiArrowDownLine,
    RiFileList3Line,
    RiBookOpenLine,
    RiStarLine,
    RiTrophyLine,
    RiCheckboxCircleLine,
    RiTimeLine,
    RiLoader4Line,
    RiGiftLine,
} from "react-icons/ri";
import { useAuth } from "../../context/AuthContext";
import "../../styles/Student/Wallet.css";

/* ── Icon map by transaction type ── */
const typeIcon = {
    welcome:  <RiGiftLine />,
    test:     <RiCheckboxCircleLine />,
    session:  <RiBookOpenLine />,
    review:   <RiStarLine />,
    milestone:<RiTrophyLine />,
    spend:    <RiCoinLine />,
    other:    <RiTimeLine />,
};

const earnMethods = [
    { icon: <RiFileList3Line />, title: "Complete a Test",      description: "Pass a skill test",              coins: "+20" },
    { icon: <RiBookOpenLine />,  title: "Complete a Session",   description: "Finish a learning session",      coins: "+30" },
    { icon: <RiStarLine />,      title: "Receive a Rating",     description: "Get a rating from another user", coins: "+10" },
    { icon: <RiTrophyLine />,    title: "Complete a Milestone", description: "Reach your learning milestone",  coins: "+50" },
];

const Wallet = () => {
    const { user } = useAuth();
    const [transactions, setTransactions] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => { fetchData(); }, []);

    const fetchData = async () => {
        setLoading(true);
        try {
            const res = await axios.get("https://skillssync-a4r9.onrender.com/api/wallet/transactions", {
                withCredentials: true,
            });
            setTransactions(res.data.transactions || []);
        } catch (err) {
            console.error("Wallet fetch error:", err.message);
        } finally {
            setLoading(false);
        }
    };

    const balance    = user?.skillCoins ?? 0;
    const totalEarned = transactions.filter(t => t.amount > 0).reduce((s, t) => s + t.amount, 0);
    const totalSpent  = Math.abs(transactions.filter(t => t.amount < 0).reduce((s, t) => s + t.amount, 0));

    const fmtDate = (iso) => {
        if (!iso) return "";
        return new Date(iso).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" });
    };

    return (
        <div className="wallet-page">

            {/* PAGE HEADER */}
            <section className="wallet-hero">
                <div className="wallet-hero-icon"><RiCoinLine /></div>
                <div className="wallet-hero-content">
                    <h1>My <span>Wallet</span></h1>
                    <p>Manage your Skill Coins and track your earning history.</p>
                </div>
            </section>

            {/* BALANCE CARDS */}
            <section className="wallet-stats-grid">
                <div className="wallet-stat-card balance-card">
                    <div className="wallet-stat-icon"><RiCoinLine /></div>
                    <div className="wallet-stat-content">
                        <span>Current Balance</span>
                        <strong>{loading ? "..." : balance}</strong>
                        <small>Skill Coins</small>
                    </div>
                </div>

                <div className="wallet-stat-card earned-card">
                    <div className="wallet-stat-icon"><RiArrowUpLine /></div>
                    <div className="wallet-stat-content">
                        <span>Total Earned</span>
                        <strong>{loading ? "..." : totalEarned}</strong>
                        <small>Coins Earned</small>
                    </div>
                </div>

                <div className="wallet-stat-card spent-card">
                    <div className="wallet-stat-icon"><RiArrowDownLine /></div>
                    <div className="wallet-stat-content">
                        <span>Total Spent</span>
                        <strong>{loading ? "..." : totalSpent}</strong>
                        <small>Coins Spent</small>
                    </div>
                </div>
            </section>

            {/* EARN METHODS */}
            <section className="wallet-main-grid">
                <div className="wallet-card earn-card">
                    <div className="wallet-card-header">
                        <div>
                            <h2><RiCoinLine /> Earn Skill Coins</h2>
                            <p>Complete activities and earn coins.</p>
                        </div>
                    </div>
                    <div className="earn-list">
                        {earnMethods.map((item) => (
                            <div className="earn-item" key={item.title}>
                                <div className="earn-item-icon">{item.icon}</div>
                                <div className="earn-item-content">
                                    <strong>{item.title}</strong>
                                    <span>{item.description}</span>
                                </div>
                                <div className="earn-amount">{item.coins}</div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* TRANSACTIONS */}
            <section className="wallet-card transactions-card">
                <div className="wallet-card-header transaction-header">
                    <div>
                        <h2><RiTimeLine /> Recent Transactions</h2>
                        <p>Your recent Skill Coin activity.</p>
                    </div>
                </div>

                <div className="transactions-list">
                    {loading ? (
                        <div style={{ textAlign: "center", padding: "2rem", color: "#94a3b8" }}>
                            <RiLoader4Line style={{ animation: "spin 1s linear infinite", fontSize: "1.5rem" }} />
                            <p>Loading transactions...</p>
                        </div>
                    ) : transactions.length === 0 ? (
                        <div style={{ textAlign: "center", padding: "2rem", color: "#94a3b8" }}>
                            <RiCoinLine style={{ fontSize: "2rem", marginBottom: "0.5rem" }} />
                            <p>No transactions yet. Start learning to earn coins!</p>
                        </div>
                    ) : (
                        transactions.map((txn) => {
                            const isEarned = txn.amount > 0;
                            return (
                                <div className="transaction-item" key={txn._id}>
                                    <div className={`transaction-icon ${isEarned ? "earned" : "spent"}`}>
                                        {typeIcon[txn.type] || <RiCoinLine />}
                                    </div>
                                    <div className="transaction-info">
                                        <strong>{txn.description || txn.type}</strong>
                                        <span>{fmtDate(txn.createdAt)}</span>
                                    </div>
                                    <div className={`transaction-amount ${isEarned ? "earned" : "spent"}`}>
                                        {isEarned ? "+" : ""}{txn.amount}
                                    </div>
                                </div>
                            );
                        })
                    )}
                </div>
            </section>

            {/* BOTTOM INFO */}
            <div className="wallet-info-box">
                <div className="wallet-info-icon">💰</div>
                <div>
                    <strong>Keep building your skills!</strong>
                    <p>Complete tests, attend sessions and reach milestones to earn more Skill Coins.</p>
                </div>
            </div>

        </div>
    );
};

export default Wallet;
