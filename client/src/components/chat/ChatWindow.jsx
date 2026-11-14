import { useState, useRef, useEffect } from "react";
import {
  RiPhoneLine,
  RiVideoAddLine,
  RiMoreLine,
  RiExchangeLine,
  RiAttachmentLine,
  RiEmotionLine,
  RiMicLine,
  RiSendPlaneFill,
  RiCheckDoubleLine,
  RiLinksLine,
  RiFileList3Line,
  RiArrowLeftLine
} from "react-icons/ri";

const ChatWindow = ({ conversation, messages, onSendMessage, currentUserId, currentUserRole, loading, onBack }) => {
  const [draft, setDraft] = useState("");
  const [showLinkInput, setShowLinkInput] = useState(false);
  const [linkType, setLinkType] = useState('meeting_link');
  const scrollRef = useRef(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, loading]);

  if (!conversation) {
    return (
      <div className="chat-window" style={{ alignItems: "center", justifyContent: "center", color: "#94a3b8" }}>
        Select a conversation
      </div>
    );
  }

  const getOther = (conv, myId) => {
    return conv.student._id === myId ? conv.mentor : conv.student;
  };

  const otherPerson = getOther(conversation, currentUserId);

  const handleSend = () => {
    if (!draft.trim()) return;

    if (showLinkInput) {
      onSendMessage(conversation._id, draft.trim(), linkType);
      setShowLinkInput(false);
    } else {
      onSendMessage(conversation._id, draft.trim(), 'text');
    }

    setDraft("");
  };

  const openLinkInput = (type) => {
    setLinkType(type);
    setShowLinkInput(true);
    setDraft("");
  };

  const cancelLinkInput = () => {
    setShowLinkInput(false);
    setDraft("");
  };

  return (
    <div className="chat-window">
      {/* Header */}
      <div className="chat-win-header">
        <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
          <button
            type="button"
            className="chat-mobile-back"
            onClick={onBack}
            aria-label="Back to conversations"
          >
            <RiArrowLeftLine size={22} />
          </button>
          <div style={{ position: "relative", flexShrink: 0 }}>
            <div style={{
              width: 40, height: 40, borderRadius: "9999px",
              background: "linear-gradient(135deg,#7c3aed,#06b6d4)",
              display: "flex", alignItems: "center", justifyContent: "center",
              color: "#fff", fontWeight: 700, fontSize: "0.875rem",
            }}>
              {otherPerson?.name?.charAt(0)?.toUpperCase()}
            </div>
          </div>

          <div>
            <p className="chat-win-name">{otherPerson?.name}</p>
            <p className="chat-win-role">
              {otherPerson?.isMentor ? 'Mentor' : 'Student'}
            </p>
          </div>
        </div>

        <div style={{ display: "flex", gap: "0.25rem" }}>
          {[RiPhoneLine, RiVideoAddLine, RiMoreLine].map((Icon, i) => (
            <button key={i} className="chat-icon-btn">
              <Icon size={17} />
            </button>
          ))}
        </div>
      </div>

      {/* Messages */}
      <div
        ref={scrollRef}
        className="chat-messages-area"
        style={{ flex: 1, overflowY: "auto", padding: "1.25rem 1.5rem", display: "flex", flexDirection: "column", gap: "1rem" }}
      >
        {loading ? (
          <div style={{ textAlign: "center", color: "#94a3b8" }}>Loading messages...</div>
        ) : messages?.length === 0 ? (
          <div style={{ textAlign: "center", color: "#94a3b8", marginTop: "auto", marginBottom: "auto" }}>
            No messages yet. Say hi!
          </div>
        ) : (
          messages?.map((m) => {
            const isMe = m.sender._id === currentUserId;
            const timeStr = new Date(m.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

            return (
              <div key={m._id} style={{ display: "flex", justifyContent: isMe ? "flex-end" : "flex-start" }}>
                <div className={isMe ? "msg-bubble-me" : "msg-bubble-them"} style={{ maxWidth: '75%' }}>

                  {m.type === 'meeting_link' ? (
                    <div style={{ background: 'linear-gradient(135deg, rgba(59,130,246,0.2), rgba(139,92,246,0.2))', border: '1px solid rgba(59,130,246,0.4)', borderRadius: '12px', padding: '12px 16px', maxWidth: 300 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                        <span style={{ fontSize: '1.2rem' }}>📹</span>
                        <span style={{ fontWeight: 700, fontSize: '0.9rem', color: isMe ? '#fff' : 'inherit' }}>Google Meet</span>
                      </div>
                      <p style={{ fontSize: '0.8rem', color: isMe ? '#e2e8f0' : '#94a3b8', marginBottom: 10, wordBreak: 'break-all' }}>{m.text}</p>
                      <a href={m.text} target='_blank' rel='noopener noreferrer' style={{ display: 'block', textAlign: 'center', background: 'linear-gradient(135deg,#3b82f6,#8b5cf6)', color: '#fff', padding: '8px', borderRadius: '8px', fontWeight: 700, fontSize: '0.82rem', textDecoration: 'none' }}>Join Meeting</a>
                    </div>
                  ) : m.type === 'resource' ? (
                    <div style={{ background: 'rgba(15,23,42,0.4)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px', padding: '12px 16px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                        <RiFileList3Line size={16} />
                        <span style={{ fontWeight: 600, fontSize: '0.85rem' }}>Resource Shared</span>
                      </div>
                      <a href={m.text} target="_blank" rel="noopener noreferrer" style={{ color: '#38bdf8', fontSize: '0.9rem', wordBreak: 'break-all' }}>{m.text}</a>
                    </div>
                  ) : (
                    <p style={{ margin: 0, whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>{m.text}</p>
                  )}

                  <div style={{ display: "flex", justifyContent: "flex-end", alignItems: "center", gap: 4, marginTop: 6 }}>
                    <span style={{ fontSize: "0.625rem", opacity: 0.75 }}>{timeStr}</span>
                    {isMe && <RiCheckDoubleLine size={13} style={{ opacity: m.isRead ? 1 : 0.6 }} />}
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Message input */}
      <div className="chat-input-bar" style={{ flexDirection: 'column', alignItems: 'stretch' }}>

        {showLinkInput && (
          <div style={{ display: 'flex', padding: '8px', background: 'rgba(15,23,42,0.5)', borderRadius: '8px', marginBottom: '8px', alignItems: 'center', gap: '8px' }}>
            <span style={{ fontSize: '0.8rem', color: '#a78bfa', fontWeight: 600, whiteSpace: 'nowrap' }}>
              {linkType === 'meeting_link' ? 'Meet Link:' : 'Resource URL:'}
            </span>
            <input
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSend()}
              placeholder={`Paste ${linkType === 'meeting_link' ? 'Google Meet URL' : 'resource URL'} here...`}
              style={{ flex: 1, background: 'transparent', border: 'none', color: '#fff', fontSize: '0.9rem', outline: 'none' }}
              autoFocus
            />
            <button onClick={cancelLinkInput} style={{ background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer', fontSize: '0.8rem' }}>Cancel</button>
          </div>
        )}

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', width: '100%' }}>
          {!showLinkInput && (
            <button className="chat-icon-btn">
              <RiAttachmentLine size={18} />
            </button>
          )}

          {currentUserRole === 'mentor' && !showLinkInput && (
            <>
              <button className="chat-icon-btn" onClick={() => openLinkInput('meeting_link')} title="Send Meet Link">
                <RiVideoAddLine size={18} style={{ color: '#a78bfa' }} />
              </button>
              <button className="chat-icon-btn" onClick={() => openLinkInput('resource')} title="Send Resource">
                <RiLinksLine size={18} style={{ color: '#38bdf8' }} />
              </button>
            </>
          )}

          {!showLinkInput && (
            <div style={{ flex: 1, position: "relative" }}>
              <input
                value={draft}
                onChange={(e) => setDraft(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSend()}
                placeholder="Type a message..."
                className="chat-input-field"
              />
              <div style={{ position: "absolute", right: 12, top: "50%", transform: "translateY(-50%)", display: "flex", gap: "0.75rem" }}>
                <RiEmotionLine size={18} className="chat-input-icon" style={{ cursor: "pointer" }} />
                <RiMicLine size={18} className="chat-input-icon" style={{ cursor: "pointer" }} />
              </div>
            </div>
          )}

          <button
            onClick={handleSend}
            style={{
              width: 40, height: 40, borderRadius: "9999px", border: "none",
              background: "linear-gradient(135deg,#7c3aed,#06b6d4)",
              color: "#fff", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center",
              flexShrink: 0
            }}
          >
            <RiSendPlaneFill size={17} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default ChatWindow;

