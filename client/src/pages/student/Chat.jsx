import { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { useAuth } from '../../context/AuthContext';
import { useSocket } from '../../context/SocketContext';
import ConversationsPanel from '../../components/chat/ConversationsPanel';
import ChatWindow from '../../components/chat/ChatWindow';
import RightPanel from '../../components/chat/RightPanel';
import '../../styles/Student/Chat.css';

const Chat = () => {
  const { user } = useAuth();
  const socket = useSocket();
  const [conversations, setConversations] = useState([]);
  const [activeId, setActiveId] = useState(null);
  const [messages, setMessages] = useState([]);
  const [loadingConvs, setLoadingConvs] = useState(true);
  const [loadingMsgs, setLoadingMsgs] = useState(false);

  const fetchConversations = useCallback(async () => {
    setLoadingConvs(true);
    try {
      // ?role=student — only conversations where this user is the STUDENT
      const res = await axios.get('https://skillssync-a4r9.onrender.com/api/chat/conversations?role=student', { withCredentials: true });
      setConversations(res.data.conversations || []);
    } catch (err) { console.error(err); }
    finally { setLoadingConvs(false); }
  }, []);

  useEffect(() => { fetchConversations(); }, [fetchConversations]);

  const selectConversation = async (id) => {
    setActiveId(id);
    setLoadingMsgs(true);
    try {
      const res = await axios.get(`https://skillssync-a4r9.onrender.com/api/chat/conversations/${id}/messages`, { withCredentials: true });
      setMessages(res.data.messages || []);
      
      await axios.put(`https://skillssync-a4r9.onrender.com/api/chat/conversations/${id}/read`, {}, { withCredentials: true });
      
      setConversations(prev => prev.map(c => c._id === id ? { ...c, studentUnread: 0, mentorUnread: 0 } : c));
    } catch (err) { console.error(err); }
    finally { setLoadingMsgs(false); }
  };

  useEffect(() => {
    if (!socket) return;
    const handler = ({ conversationId, message }) => {
      if (conversationId === activeId) {
        setMessages(prev => [...prev, message]);
      }
      setConversations(prev => prev.map(c =>
        c._id === conversationId
          ? { ...c, lastMessage: message.text, lastMessageAt: message.createdAt }
          : c
      ));
    };
    socket.on('newMessage', handler);
    return () => socket.off('newMessage', handler);
  }, [socket, activeId]);

  const handleSendMessage = async (conversationId, text, type = 'text') => {
    try {
      const res = await axios.post(
        `https://skillssync-a4r9.onrender.com/api/chat/conversations/${conversationId}/messages`,
        { text, type },
        { withCredentials: true }
      );
      const newMsg = res.data.message;
      setMessages(prev => [...prev, newMsg]);
      
      setConversations(prev => prev.map(c =>
        c._id === conversationId
          ? { ...c, lastMessage: text.substring(0, 60), lastMessageAt: new Date().toISOString() }
          : c
      ));
      
      const conv = conversations.find(c => c._id === conversationId);
      if (conv && socket) {
        const recipientId = conv.student._id === user._id ? conv.mentor._id : conv.student._id;
        socket.emit('sendMessage', { conversationId, message: newMsg, recipientId });
      }
    } catch (err) { console.error('Send message error:', err); }
  };

  const activeConversation = conversations.find(c => c._id === activeId);

  return (
    <div className="chat-page">
      <ConversationsPanel
        conversations={conversations}
        activeId={activeId}
        onSelect={selectConversation}
        currentUserId={user?._id}
        loading={loadingConvs}
      />
      <ChatWindow
        conversation={activeConversation}
        messages={messages}
        onSendMessage={handleSendMessage}
        currentUserId={user?._id}
        currentUserRole={'student'}
        loading={loadingMsgs}
      />
      <RightPanel
        conversation={activeConversation}
        currentUserId={user?._id}
      />
    </div>
  );
};

export default Chat;

