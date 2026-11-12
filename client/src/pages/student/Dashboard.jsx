import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from "../../context/AuthContext";
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { RiSearchLine, RiTeamLine, RiExchangeLine, RiCoinLine, RiCalendarLine, RiBarChartLine, RiFireLine, RiUserLine, RiArrowUpLine, RiArrowDownLine } from 'react-icons/ri';
import "../../styles/Student/Dashboard.css";
const weeklyData = [
  { day: 'Mon', sessions: 0, coins: 0 }, { day: 'Tue', sessions: 0, coins: 0 },
  { day: 'Wed', sessions: 0, coins: 0 }, { day: 'Thu', sessions: 0, coins: 0 },
  { day: 'Fri', sessions: 0, coins: 0 }, { day: 'Sat', sessions: 0, coins: 0 },
  { day: 'Sun', sessions: 0, coins: 0 },
];

const COLORS = ['#8b5cf6', '#06b6d4', '#34d399', '#fbbf24'];

const StudentDashboard = () => {
  const { user, loading } = useAuth();

  // Real data state
  const [realStats, setRealStats]     = useState({ requests: 0, sessions: 0, notifications: 0 });
  const [topMentors, setTopMentors]   = useState([]);
  const [recentNotifs, setRecentNotifs] = useState([]);
  const [dataLoading, setDataLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    fetchDashboardData();
  }, [user]);

  const fetchDashboardData = async () => {
    setDataLoading(true);
    try {
      const [reqRes, sessRes, mentorsRes, notifsRes] = await Promise.allSettled([
        axios.get("https://skillssync-a4r9.onrender.com/api/requests/mine", { withCredentials: true }),
        axios.get("https://skillssync-a4r9.onrender.com/api/sessions/mine", { withCredentials: true }),
        axios.get("https://skillssync-a4r9.onrender.com/api/mentors?limit=3", { withCredentials: true }),
        axios.get("https://skillssync-a4r9.onrender.com/api/notifications", { withCredentials: true }),
      ]);

      const requests = reqRes.status === "fulfilled" ? (reqRes.value.data.requests || []) : [];
      const sessions = sessRes.status === "fulfilled" ? (sessRes.value.data.sessions || []) : [];
      const mentors  = mentorsRes.status === "fulfilled" ? (mentorsRes.value.data.mentors || []) : [];
      const notifs   = notifsRes.status === "fulfilled" ? (notifsRes.value.data.notifications || []) : [];

      setRealStats({
        requests:      requests.length,
        sessions:      sessions.filter(s => s.status === "completed").length,
        notifications: notifs.filter(n => !n.isRead).length,
      });
      setTopMentors(mentors.slice(0, 3));
      setRecentNotifs(notifs.slice(0, 5));
    } catch (err) {
      console.error("Dashboard fetch error:", err.message);
    } finally {
      setDataLoading(false);
    }
  };

  if (loading) {
    return (
      <div style={{ padding: '2rem', textAlign: 'center' }}>
        Loading dashboard...
      </div>
    );
  }

  const skills_offered = user?.skills_offered || [];
  const skills_wanted  = user?.skills_wanted  || [];
  const completion     = user?.completionPercentage || 0;
  if (user?.primarySkill && !skills_offered.includes(user.primarySkill)) {
    skills_offered.unshift(user.primarySkill);
  }

  const statCards = [
    { label: 'My Requests',   value: realStats.requests,      icon: <RiExchangeLine size={22} />,  color: '#8b5cf6', link: '/requests',      change: '' },
    { label: 'Sessions Done', value: realStats.sessions,       icon: <RiCalendarLine size={22} />,  color: '#06b6d4', link: '/sessions',       change: '' },
    { label: 'Skill Coins',   value: user?.skillCoins || 0,    icon: <RiCoinLine size={22} />,      color: '#fbbf24', link: '/wallet',         change: '' },
    { label: 'Notifications', value: realStats.notifications,  icon: <RiBarChartLine size={22} />,  color: '#34d399', link: '/notifications',   change: '' },
  ];

  const pieData = [
    { name: 'Skills Offered', value: skills_offered.length || 1 },
    { name: 'Skills Wanted',  value: skills_wanted.length  || 1 },
    { name: 'Completed',      value: realStats.sessions + 1 },
    { name: 'Requests',       value: realStats.requests + 1 },
  ];


  return (
    <div className="dashboard-page" style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      {/* Welcome banner */}
      <div className="glass-card dashboard-welcome"  style={{ padding: '2rem', background: 'linear-gradient(135deg, rgba(124,58,237,0.2), rgba(6,182,212,0.1))', border: '1px solid rgba(139,92,246,0.3)', position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', right: '-20px', top: '-20px', fontSize: '8rem', opacity: 0.05 }}>⚡</div>
        <div  className="dashboard-welcome-content" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <h1 style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontSize: '1.75rem', fontWeight: 800, margin: '0 0 0.5rem' }}>
              Good day, <span className="gradient-text">{user?.name?.split(' ')[0]}!</span> 👋
            </h1>
            <p style={{ color: '#94a3b8', margin: '0 0 1rem', fontSize: '0.95rem' }}>
              Ready to learn something new today? You're on a <span style={{ color: '#fbbf24', fontWeight: 700 }}>🔥 {user?.streakCount || 0}-day streak!</span>
            </p>
            <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
              <Link to="/find-mentors" className="btn-primary" style={{ padding: '0.6rem 1.25rem', fontSize: '0.875rem' }}>
                <RiTeamLine /> Find a Mentor
              </Link>
              <Link to="/browse-skills" className="btn-secondary" style={{ padding: '0.6rem 1.25rem', fontSize: '0.875rem' }}>
                <RiSearchLine /> Browse Skills
              </Link>
            </div>
          </div>
          <div  className="dashboard-coin-section" style={{ textAlign: 'right' }}>
            <div className="coin-badge" style={{ fontSize: '1rem', padding: '0.5rem 1.25rem' }}>🪙 {user?.skillCoins} Coins</div>
            <p style={{ color: '#94a3b8', fontSize: '0.75rem', marginTop: '0.5rem' }}>Your Skill Coin Balance</p>
          </div>
        </div>

        {/* Profile completion */}
        <div style={{ marginTop: '1.5rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.375rem' }}>
            <span style={{ fontSize: '0.8rem', color: '#94a3b8' }}>Profile Completion</span>
            <span style={{ fontSize: '0.8rem', color: '#a78bfa', fontWeight: 600 }}>{completion}%</span>
          </div>
          <div className="progress-bar">
            <div className="progress-fill" style={{ width: `${completion}%` }} />
          </div>
          {completion < 100 && (
            <Link to="/profile/edit" style={{ fontSize: '0.75rem', color: '#06b6d4', textDecoration: 'none', marginTop: '0.375rem', display: 'inline-block' }}>
              Complete your profile →
            </Link>
          )}
        </div>
      </div>

      {/* Stats cards */}
      <div  className="dashboard-stats-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '1rem' }}>
        {statCards.map(card => (
          <Link key={card.label} to={card.link} style={{ textDecoration: 'none' }}>
            <div className="stat-card">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
                <div style={{ width: 44, height: 44, borderRadius: '12px', background: `${card.color}20`, border: `1px solid ${card.color}40`, display: 'flex', alignItems: 'center', justifyContent: 'center', color: card.color }}>
                  {card.icon}
                </div>
                <span style={{ fontSize: '0.75rem', color: '#34d399', background: 'rgba(16,185,129,0.1)', padding: '0.2rem 0.5rem', borderRadius: '9999px', fontWeight: 600 }}>
                  {card.change}
                </span>
              </div>
              <div style={{ fontSize: '2rem', fontWeight: 800, color: card.color }}>{card.value}</div>
              <div style={{ fontSize: '0.8rem', color: '#94a3b8', marginTop: '0.25rem' }}>{card.label}</div>
            </div>
          </Link>
        ))}
      </div>

      {/* Charts Row */}
      <div className="dashboard-charts-grid"  style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '1.5rem' }}>
        {/* Weekly activity */}
        <div className="card">
          <h3 style={{ fontWeight: 700, margin: '0 0 1.5rem', fontSize: '1rem' }}>📈 Weekly Activity</h3>
          <ResponsiveContainer width="100%" height={200}>
            <AreaChart data={weeklyData}>
              <defs>
                <linearGradient id="coinGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0} />
                </linearGradient>
              </defs>
              <XAxis dataKey="day" tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
              <YAxis hide />
              <Tooltip contentStyle={{ background: '#1a1a2e', border: '1px solid rgba(139,92,246,0.3)', borderRadius: '0.75rem', color: '#e2e8f0', fontSize: '0.8rem' }} />
              <Area type="monotone" dataKey="coins" stroke="#8b5cf6" strokeWidth={2} fill="url(#coinGrad)" name="Coins Earned" />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Skill breakdown */}
        <div className="card">
          <h3 style={{ fontWeight: 700, margin: '0 0 1rem', fontSize: '1rem' }}>🎯 Skill Breakdown</h3>
          <ResponsiveContainer width="100%" height={150}>
            <PieChart>
              <Pie data={pieData} cx="50%" cy="50%" innerRadius={40} outerRadius={65} dataKey="value" stroke="none">
                {pieData.map((_, i) => <Cell key={i} fill={COLORS[i]} />)}
              </Pie>
              <Tooltip contentStyle={{ background: '#1a1a2e', border: '1px solid rgba(139,92,246,0.3)', borderRadius: '0.75rem', fontSize: '0.75rem' }} />
            </PieChart>
          </ResponsiveContainer>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', marginTop: '0.5rem' }}>
            {pieData.map((d, i) => (
              <div key={d.name} style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', fontSize: '0.7rem', color: '#94a3b8' }}>
                <div style={{ width: 8, height: 8, borderRadius: '50%', background: COLORS[i] }} />
                {d.name}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Top Mentors + Notifications */}
      <div className="dashboard-bottom-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
        {/* Top Mentors */}
        <div className="card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
            <h3 style={{ fontWeight: 700, margin: 0, fontSize: '1rem' }}>🎓 Top Mentors</h3>
            <Link to="/find-mentors" style={{ fontSize: '0.8rem', color: '#a78bfa', textDecoration: 'none' }}>View All →</Link>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.875rem' }}>
            {topMentors.length > 0 ? topMentors.map(mentor => (
              <Link key={mentor._id} to={`/user/${mentor._id}`} style={{ textDecoration: 'none' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.875rem', padding: '0.75rem', borderRadius: '0.75rem', transition: 'background 0.2s' }}
                  onMouseOver={e => e.currentTarget.style.background = 'rgba(139,92,246,0.08)'}
                  onMouseOut={e => e.currentTarget.style.background = 'transparent'}>
                  {mentor.profilePicture ? (
                    <img src={mentor.profilePicture} alt={mentor.name} className="avatar" style={{ width: 40, height: 40 }} />
                  ) : (
                    <div className="avatar" style={{ width: 40, height: 40, fontSize: '0.9rem' }}>{mentor.name?.charAt(0)}</div>
                  )}
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 600, fontSize: '0.875rem', color: '#e2e8f0' }}>{mentor.name}</div>
                    <div style={{ fontSize: '0.75rem', color: '#94a3b8' }}>{mentor.skills_offered?.[0] || 'Expert'}</div>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', color: '#fbbf24', fontSize: '0.8rem', fontWeight: 600 }}>
                    ⭐ {mentor.rating?.toFixed(1) || '5.0'}
                  </div>
                </div>
              </Link>
            )) : (
              <p style={{ color: '#64748b', fontSize: '0.85rem', textAlign: 'center', padding: '1rem 0' }}>No mentors yet</p>
            )}
          </div>
        </div>

        {/* Recent Notifications */}
        <div className="card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
            <h3 style={{ fontWeight: 700, margin: 0, fontSize: '1rem' }}>🔔 Recent Activity</h3>
            <Link to="/notifications" style={{ fontSize: '0.8rem', color: '#a78bfa', textDecoration: 'none' }}>View All →</Link>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {recentNotifs.length > 0 ? recentNotifs.map(n => (
              <div key={n._id} style={{ display: 'flex', gap: '0.75rem', alignItems: 'flex-start', padding: '0.75rem', borderRadius: '0.75rem', background: n.isRead ? 'transparent' : 'rgba(139,92,246,0.06)', border: n.isRead ? 'none' : '1px solid rgba(139,92,246,0.1)' }}>
                <div style={{ fontSize: '1.25rem', flexShrink: 0 }}>{n.icon}</div>
                <div>
                  <div style={{ fontWeight: 600, fontSize: '0.8rem', color: '#e2e8f0' }}>{n.title}</div>
                  <div style={{ fontSize: '0.75rem', color: '#94a3b8', marginTop: '0.125rem' }}>{n.message?.substring(0, 60)}...</div>
                </div>
              </div>
            )) : (
              <p style={{ color: '#64748b', fontSize: '0.85rem', textAlign: 'center', padding: '1rem 0' }}>No notifications yet</p>
            )}
          </div>
        </div>
      </div>

      {/* Quick actions */}
      <div className="card">
        <h3 style={{ fontWeight: 700, margin: '0 0 1.25rem', fontSize: '1rem' }}>⚡ Quick Actions</h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '0.75rem' }}>
          {[
            { label: 'Browse Skills', icon: '🔍', to: '/browse-skills', color: '#8b5cf6' },
            { label: 'Find Mentors', icon: '🎓', to: '/browse-mentors', color: '#06b6d4' },
            { label: 'My Requests', icon: '📨', to: '/requests', color: '#f59e0b' },
            { label: 'View Progress', icon: '📊', to: '/progress', color: '#10b981' },
            { label: 'Take a Test', icon: '📝', to: '/tests', color: '#ec4899' },
            { label: 'View Wallet', icon: '🪙', to: '/wallet', color: '#fbbf24' },
          ].map(a => (
            <Link key={a.label} to={a.to} style={{ textDecoration: 'none' }}>
              <div style={{ padding: '1rem', borderRadius: '0.75rem', border: `1px solid ${a.color}25`, background: `${a.color}10`, textAlign: 'center', transition: 'all 0.2s', cursor: 'pointer' }}
                onMouseOver={e => { e.currentTarget.style.background = `${a.color}20`; e.currentTarget.style.borderColor = `${a.color}50`; }}
                onMouseOut={e => { e.currentTarget.style.background = `${a.color}10`; e.currentTarget.style.borderColor = `${a.color}25`; }}>
                <div style={{ fontSize: '1.5rem', marginBottom: '0.375rem' }}>{a.icon}</div>
                <div style={{ fontSize: '0.78rem', fontWeight: 600, color: a.color }}>{a.label}</div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
};

export default StudentDashboard;

