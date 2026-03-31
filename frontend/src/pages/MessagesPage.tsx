import { useState, useEffect, useRef } from 'react';
import { logger } from '../lib/logger';
import { useSearchParams, Link } from 'react-router-dom';
import { ChevronLeft } from 'lucide-react';
import { Helmet } from 'react-helmet-async';
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
            setError('Lỗi tải danh sách tin nhắn.');
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
            setError('Lỗi tải tin nhắn.');
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
        <div className="page-shell-muted">
            <Helmet>
                <title>Tin nhắn — GYMERVIET</title>
                <meta name="robots" content="noindex,nofollow" />
            </Helmet>
            <div className="page-container gv-pad-y-sm">
                <section className="page-header">
                    <p className="page-kicker">Trao đổi trực tiếp</p>
                    <h1 className="page-title">Tin nhắn</h1>
                    <p className="page-description">Một bề mặt hội thoại gọn, rõ và thống nhất với dashboard để trao đổi cùng Coach, athlete hoặc đối tác.</p>
                </section>

                <div className="overflow-hidden rounded-lg border border-gray-200 bg-white shadow-sm md:grid md:min-h-[calc(100vh-18rem)] md:grid-cols-[20rem_minmax(0,1fr)]">
                    <div className={`border-r border-gray-200 bg-gray-50 flex-col shrink-0 ${activePartner ? 'hidden md:flex' : 'flex'}`}>
                        <div className="border-b border-gray-200 bg-white px-4 py-4">
                            <div className="page-kicker mb-2">Danh sách hội thoại</div>
                            <h2 className="text-lg font-bold tracking-tight text-black">Tin nhắn gần đây</h2>
                        </div>
                        <div className="flex-1 overflow-y-auto">
                            {error && conversations.length === 0 ? (
                                <div className="p-8 text-center">
                                    <p className="mb-4 text-sm text-red-500">{error}</p>
                                    <button onClick={loadConversations} className="btn-secondary text-xs uppercase tracking-[0.14em]">Thử lại</button>
                                </div>
                            ) : conversations.length === 0 ? (
                                <div className="mt-10 p-8 text-center">
                                    <div className="mb-3 text-4xl">👋</div>
                                    <h3 className="mb-1 font-bold text-gray-900">Hộp thư trống</h3>
                                    <p className="mb-6 text-xs text-gray-500">
                                        Tin nhắn từ Coach hoặc học viên sẽ hiện ở đây.
                                    </p>
                                    <Link to="/coaches" className="btn-primary text-xs uppercase tracking-[0.14em]">
                                        Tìm Coach ngay
                                    </Link>
                                </div>
                            ) : (
                                <div className="divide-y divide-gray-100">
                                    {conversations.map(conv => (
                                        <button
                                            key={conv.partner_id}
                                            onClick={() => selectConversation(conv.partner_id)}
                                            className={`w-full px-4 py-4 text-left transition-colors hover:bg-white ${activePartner === conv.partner_id ? 'bg-white' : ''}`}
                                        >
                                            <div className="flex items-center gap-3">
                                                <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full border border-gray-200 bg-white text-sm font-bold text-gray-500">
                                                    {conv.partner?.full_name?.charAt(0).toUpperCase() || '?'}
                                                </div>
                                                <div className="min-w-0 flex-1">
                                                    <div className="mb-0.5 flex items-center justify-between gap-3">
                                                        <span className={`truncate text-sm ${conv.unread_count > 0 ? 'font-bold text-black' : 'font-medium text-gray-900'}`}>
                                                            {conv.partner?.full_name || 'Unknown'}
                                                        </span>
                                                        {conv.unread_count > 0 && (
                                                            <span className="flex h-5 min-w-[1.25rem] items-center justify-center rounded-full bg-black px-1 text-[10px] font-bold text-white">
                                                                {conv.unread_count}
                                                            </span>
                                                        )}
                                                    </div>
                                                    {conv.last_message && (
                                                        <p className={`truncate text-xs ${conv.unread_count > 0 ? 'font-medium text-black' : 'text-gray-500'}`}>
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

                    <div className={`flex-1 flex-col bg-white w-full absolute inset-0 md:static ${!activePartner ? 'hidden md:flex' : 'flex'}`}>
                        {activePartner ? (
                            <>
                                <div className="flex items-center gap-3 border-b border-gray-200 bg-white px-4 py-4 sm:px-5">
                                    <button
                                        onClick={() => setActivePartner(null)}
                                        className="-ml-2 rounded-full p-1 text-gray-500 transition-colors hover:bg-gray-50 hover:text-black md:hidden"
                                    >
                                        <ChevronLeft className="h-6 w-6" />
                                    </button>
                                    <div className="flex h-9 w-9 items-center justify-center rounded-full border border-gray-200 bg-gray-50 text-xs font-bold text-gray-600">
                                        {activeConv?.partner?.full_name?.charAt(0).toUpperCase() || '?'}
                                    </div>
                                    <div>
                                        <div className="page-kicker mb-1">Đang trao đổi</div>
                                        <Link to={`/coaches/${activePartner}`} className="font-semibold text-black hover:underline underline-offset-2">
                                            {activeConv?.partner?.full_name || 'Xem hồ sơ'}
                                        </Link>
                                    </div>
                                </div>

                                <div className="flex-1 overflow-y-auto bg-gray-50/60 p-4 sm:p-6">
                                    <div className="mx-auto flex h-full w-full max-w-4xl flex-col gap-4">
                                        {loading ? (
                                            <div className="mt-4 space-y-4 animate-pulse">
                                                <div className="flex justify-start"><div className="h-10 w-48 rounded-lg rounded-tl-sm bg-gray-100"></div></div>
                                                <div className="flex justify-end"><div className="h-10 w-56 rounded-lg rounded-tr-sm bg-gray-100"></div></div>
                                                <div className="flex justify-start"><div className="h-10 w-36 rounded-lg rounded-tl-sm bg-gray-100"></div></div>
                                            </div>
                                        ) : error && messages.length === 0 ? (
                                            <div className="flex h-full flex-col items-center justify-center p-6 text-center">
                                                <p className="mb-4 text-sm text-red-500">{error}</p>
                                                <button onClick={() => activePartner && loadMessages(activePartner)} className="btn-secondary text-xs uppercase tracking-[0.14em]">Thử lại</button>
                                            </div>
                                        ) : messages.length === 0 ? (
                                            <div className="flex h-full items-center justify-center">
                                                <div className="rounded-lg border border-dashed border-gray-200 bg-white px-6 py-5 text-center text-sm text-gray-500 shadow-sm">
                                                    Gửi lời chào đầu tiên
                                                </div>
                                            </div>
                                        ) : (
                                            messages.map(msg => {
                                                const isMe = msg.sender_id === user?.id;
                                                return (
                                                    <div key={msg.id} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                                                        <div className={`max-w-[75%] rounded-lg px-4 py-2.5 text-sm shadow-sm ${isMe ? 'rounded-tr-sm bg-black text-white' : 'rounded-tl-sm border border-gray-200 bg-white text-black'}`}>
                                                            {msg.content}
                                                        </div>
                                                    </div>
                                                )
                                            })
                                        )}
                                        <div ref={messagesEndRef} className="h-1" />
                                    </div>
                                </div>

                                <div className="border-t border-gray-200 bg-white p-4 sm:px-5">
                                    <div className="relative mx-auto flex max-w-4xl gap-3">
                                        <input
                                            value={newMessage}
                                            onChange={e => setNewMessage(e.target.value)}
                                            onKeyDown={e => e.key === 'Enter' && !e.shiftKey && sendMessage()}
                                            placeholder="Nhập tin nhắn..."
                                            aria-label="Nhập tin nhắn để gửi"
                                            className="form-input rounded-full bg-gray-50 px-5 py-3 pr-24 focus:bg-white"
                                        />
                                        <button
                                            onClick={sendMessage}
                                            disabled={!newMessage.trim()}
                                            className="btn-primary absolute bottom-1 right-1 top-1 rounded-full px-4 text-sm"
                                        >
                                            Gửi
                                        </button>
                                    </div>
                                </div>
                            </>
                        ) : (
                            <div className="hidden flex-1 items-center justify-center bg-gray-50/50 md:flex">
                                <div className="text-center">
                                    <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full border border-gray-200 bg-white text-lg font-bold text-gray-500 shadow-sm">
                                        ✉️
                                    </div>
                                    <h2 className="text-lg font-bold text-black">Chọn một cuộc trò chuyện</h2>
                                    <p className="mt-2 max-w-sm text-sm text-gray-500">
                                        Chọn hội thoại ở cột trái để bắt đầu nhắn tin với Coach hoặc học viên.
                                    </p>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
