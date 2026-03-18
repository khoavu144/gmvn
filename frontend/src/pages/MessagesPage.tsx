import { useState, useEffect, useRef } from 'react';
import { logger } from '../lib/logger';
import { useSearchParams, Link } from 'react-router-dom';
import { ChevronLeft } from 'lucide-react';
import { useSelector } from 'react-redux';
import type { RootState } from '../store/store';
import apiClient from '../services/api';
import { socketService } from '../services/socketService';

interface Message {
    id: string;
    sender_id: string;
    receiver_id: string;
    content: string;
    created_at: string;
    is_read: boolean;
}

interface Conversation {
    partner_id: string;
    partner: { id: string; full_name: string; avatar_url: string | null } | null;
    last_message: { content: string; created_at: string; is_read: boolean } | null;
    unread_count: number;
}

export default function MessagesPage() {
    const { user, accessToken } = useSelector((state: RootState) => state.auth);
    const [searchParams] = useSearchParams();
    const [conversations, setConversations] = useState<Conversation[]>([]);
    const [messages, setMessages] = useState<Message[]>([]);
    const [activePartner, setActivePartner] = useState<string | null>(null);
    const [newMessage, setNewMessage] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    // Keep activePartner in a ref to avoid stale closure without reconnecting socket on every switch
    const activePartnerRef = useRef(activePartner);
    useEffect(() => {
        activePartnerRef.current = activePartner;
    }, [activePartner]);

    // Connect socket on mount
    useEffect(() => {
        if (!accessToken) return;
        socketService.connect(accessToken);

        const handleMessage = (data: any) => {
            const incomingMessage = data?.message;
            if (!incomingMessage) return;

            setConversations(prev => {
                const existing = prev.find(conv => conv.partner_id === incomingMessage.sender_id);
                const nextConversation: Conversation = existing ?? {
                    partner_id: incomingMessage.sender_id,
                    partner: null,
                    last_message: null,
                    unread_count: 0,
                };

                const updated: Conversation = {
                    ...nextConversation,
                    last_message: {
                        content: incomingMessage.content,
                        created_at: incomingMessage.created_at,
                        is_read: incomingMessage.is_read,
                    },
                    unread_count: incomingMessage.sender_id === activePartnerRef.current
                        ? 0
                        : (nextConversation.unread_count ?? 0) + 1,
                };

                return [
                    updated,
                    ...prev.filter(conv => conv.partner_id !== incomingMessage.sender_id),
                ];
            });

            if (incomingMessage.sender_id === activePartnerRef.current) {
                setMessages(prev => {
                    if (prev.some(message => message.id === incomingMessage.id)) {
                        return prev;
                    }

                    return [...prev, incomingMessage];
                });
            }
        };

        socketService.onMessageReceive(handleMessage);

        return () => {
            socketService.offMessageReceive();
            socketService.disconnect();
        };
    }, [accessToken, user?.id]);

    // Load conversations
    useEffect(() => { loadConversations(); }, []);

    // Load initial partner from URL param
    useEffect(() => {
        const to = searchParams.get('to');
        if (to) {
            setActivePartner(to);
            loadMessages(to);
            return;
        }

        if (!activePartner && conversations.length > 0) {
            const firstPartnerId = conversations[0].partner_id;
            setActivePartner(firstPartnerId);
            loadMessages(firstPartnerId);
        }
    }, [searchParams, conversations, activePartner]);

    // Scroll to bottom on new messages
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    const loadConversations = async () => {
        try {
            setError(null);
            const res = await apiClient.get('/messages/conversations');
            setConversations(res.data.conversations || []);
        } catch (err: any) { 
            logger.error(err); 
            setError('Lỗi tải danh sách đối thoại.'); 
        }
    };

    const loadMessages = async (partnerId: string) => {
        setLoading(true);
        setError(null);
        try {
            const res = await apiClient.get(`/messages/conversations/${partnerId}`);
            setMessages(res.data.messages || []);
        } catch (err: any) { 
            logger.error(err); 
            setError('Không thể tải tin nhắn.');
        } finally { setLoading(false); }
    };

    const selectConversation = (partnerId: string) => {
        setActivePartner(partnerId);
        setConversations(prev => prev.map(conv => (
            conv.partner_id === partnerId
                ? { ...conv, unread_count: 0 }
                : conv
        )));
        loadMessages(partnerId);
    };

    const sendMessage = () => {
        if (!newMessage.trim() || !activePartner || !user?.id) return;

        const content = newMessage.trim();
        const optimisticMessage: Message = {
            id: `temp-${Date.now()}`,
            sender_id: user.id,
            receiver_id: activePartner,
            content,
            created_at: new Date().toISOString(),
            is_read: false,
        };

        socketService.sendMessage(activePartner, content);
        setMessages(prev => [...prev, optimisticMessage]);
        setConversations(prev => {
            const existing = prev.find(conv => conv.partner_id === activePartner);
            const nextConversation: Conversation = existing ?? {
                partner_id: activePartner,
                partner: null,
                last_message: null,
                unread_count: 0,
            };

            const updated: Conversation = {
                ...nextConversation,
                last_message: {
                    content,
                    created_at: optimisticMessage.created_at,
                    is_read: false,
                },
                unread_count: 0,
            };

            return [updated, ...prev.filter(conv => conv.partner_id !== activePartner)];
        });
        setNewMessage('');
    };

    const activeConv = conversations.find(c => c.partner_id === activePartner);

    return (
        <div className="h-[calc(100vh-140px)] bg-white flex overflow-hidden relative">
            {/* Sidebar */}
            <div className={`w-full md:w-80 bg-gray-50 border-r border-gray-200 flex-col shrink-0 ${activePartner ? 'hidden md:flex' : 'flex'}`}>
                <div className="p-4 border-b border-gray-200 bg-white">
                    <h2 className="font-bold text-lg text-black">Tin nhắn</h2>
                </div>
                <div className="flex-1 overflow-y-auto">
                    {error && conversations.length === 0 ? (
                        <div className="p-8 text-center">
                            <p className="text-red-500 text-sm mb-4">{error}</p>
                            <button onClick={loadConversations} className="text-xs font-bold text-black border border-black px-4 py-2 rounded-full hover:bg-black hover:text-white transition">Thử lại</button>
                        </div>
                    ) : conversations.length === 0 ? (
                        <div className="p-8 text-center mt-10">
                            <div className="text-4xl mb-3">👋</div>
                            <h3 className="font-bold text-gray-900 mb-1">Hộp thư trống</h3>
                            <p className="text-xs text-gray-500 mb-6">
                                Các cuộc trò chuyện với Coach hoặc học viên sẽ xuất hiện ở đây.
                            </p>
                            <Link to="/coaches" className="text-xs font-bold text-black border border-black px-4 py-2 rounded-full hover:bg-black hover:text-white transition">
                                Tìm Coach ngay
                            </Link>
                        </div>
                    ) : (
                        <div className="divide-y divide-gray-100">
                            {conversations.map(conv => (
                                <button
                                    key={conv.partner_id}
                                    onClick={() => selectConversation(conv.partner_id)}
                                    className={`w-full text-left p-4 hover:bg-gray-100 transition-colors ${activePartner === conv.partner_id ? 'bg-white border-l-2 border-black -ml-[2px]' : ''}`}
                                >
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-full border border-gray-200 bg-gray-100 flex items-center justify-center text-sm font-bold text-gray-500 flex-shrink-0">
                                            {conv.partner?.full_name?.charAt(0).toUpperCase() || '?'}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center justify-between mb-0.5">
                                                <span className={`text-sm truncate ${conv.unread_count > 0 ? 'font-bold text-black' : 'font-medium text-gray-800'}`}>
                                                    {conv.partner?.full_name || 'Unknown'}
                                                </span>
                                                {conv.unread_count > 0 && (
                                                    <span className="bg-black text-white text-[10px] w-4 h-4 rounded-full flex items-center justify-center flex-shrink-0">
                                                        {conv.unread_count}
                                                    </span>
                                                )}
                                            </div>
                                            {conv.last_message && (
                                                <p className={`text-xs truncate ${conv.unread_count > 0 ? 'text-black font-medium' : 'text-gray-500'}`}>
                                                    {conv.last_message.content}
                                                </p>
                                            )}
                                        </div>
                                    </div>
                                </button>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            {/* Chat Area */}
            <div className={`flex-1 flex-col bg-white w-full h-full absolute inset-0 md:static ${!activePartner ? 'hidden md:flex' : 'flex'}`}>
                {activePartner ? (
                    <>
                        <div className="bg-white border-b border-gray-200 p-4 flex items-center gap-3">
                            <button 
                                onClick={() => setActivePartner(null)} 
                                className="md:hidden p-1 -ml-2 text-gray-500 hover:text-black hover:bg-gray-100 rounded-full transition-colors"
                            >
                                <ChevronLeft className="w-6 h-6" />
                            </button>
                            <div className="w-8 h-8 rounded-full border border-gray-200 bg-gray-50 flex items-center justify-center text-xs font-bold text-gray-600">
                                {activeConv?.partner?.full_name?.charAt(0).toUpperCase() || '?'}
                            </div>
                            <span className="font-semibold text-black">{activeConv?.partner?.full_name || 'Unknown'}</span>
                        </div>

                        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4 bg-gray-50/50">
                            {loading ? (
                                <div className="space-y-4 mt-4 animate-pulse">
                                    <div className="flex justify-start"><div className="h-10 w-48 bg-gray-200 rounded-2xl rounded-tl-sm"></div></div>
                                    <div className="flex justify-end"><div className="h-10 w-56 bg-gray-300 rounded-2xl rounded-tr-sm"></div></div>
                                    <div className="flex justify-start"><div className="h-10 w-36 bg-gray-200 rounded-2xl rounded-tl-sm"></div></div>
                                </div>
                            ) : error && messages.length === 0 ? (
                                <div className="h-full flex flex-col items-center justify-center p-6 text-center">
                                    <p className="text-red-500 text-sm mb-4">{error}</p>
                                    <button onClick={() => activePartner && loadMessages(activePartner)} className="text-xs font-bold text-black border border-black px-4 py-2 rounded-full hover:bg-black hover:text-white transition">Thử lại</button>
                                </div>
                            ) : messages.length === 0 ? (
                                <div className="h-full flex items-center justify-center">
                                    <div className="text-center text-gray-400 text-sm border border-dashed border-gray-200 p-6 rounded-xs">
                                        Hãy gửi lời chào!
                                    </div>
                                </div>
                            ) : (
                                messages.map(msg => {
                                    const isMe = msg.sender_id === user?.id;
                                    return (
                                        <div key={msg.id} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                                            <div className={`max-w-[75%] px-4 py-2.5 rounded-2xl text-sm ${isMe ? 'bg-black text-white rounded-tr-sm' : 'bg-gray-100 text-black border border-gray-200 rounded-tl-sm'}`}>
                                                {msg.content}
                                            </div>
                                        </div>
                                    )
                                })
                            )}
                            <div ref={messagesEndRef} className="h-1" />
                        </div>

                        <div className="bg-white border-t border-gray-200 p-4">
                            <div className="max-w-4xl mx-auto flex gap-3 relative">
                                <input
                                    value={newMessage}
                                    onChange={e => setNewMessage(e.target.value)}
                                    onKeyDown={e => e.key === 'Enter' && !e.shiftKey && sendMessage()}
                                    placeholder="Nhập tin nhắn..."
                                    aria-label="Nhập tin nhắn để gửi"
                                    className="form-input rounded-full px-5 py-3 pr-24 bg-gray-50 border-gray-200 focus:bg-white"
                                />
                                <button
                                    onClick={sendMessage}
                                    disabled={!newMessage.trim()}
                                    className="absolute right-1 top-1 bottom-1 px-4 bg-black text-white hover:bg-gray-800 disabled:bg-gray-300 rounded-full text-sm font-semibold transition-colors"
                                >
                                    Gửi
                                </button>
                            </div>
                        </div>
                    </>
                ) : (
                    <div className="flex-1 flex items-center justify-center text-gray-400 bg-gray-50">
                        <div className="text-center">
                            <p className="text-sm font-medium">Chọn một người để bắt đầu trò chuyện</p>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
