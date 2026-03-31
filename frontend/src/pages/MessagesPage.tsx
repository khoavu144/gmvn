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
    context_type?: 'program' | 'product' | 'gym' | 'profile' | null;
    context_id?: string | null;
    context_label?: string | null;
    created_at: string;
    is_read: boolean;
}

type MessageContext = {
    context_type: 'program' | 'product' | 'gym' | 'profile';
    context_id: string;
    context_label: string | null;
};

interface Conversation {
    partner_id: string;
    partner: { id: string; full_name: string; avatar_url: string | null } | null;
    last_message: {
        content: string;
        context_type?: 'program' | 'product' | 'gym' | 'profile' | null;
        context_label?: string | null;
        created_at: string;
        is_read: boolean;
    } | null;
    unread_count: number;
}

function isMessageContextType(value: string | null): value is MessageContext['context_type'] {
    return value === 'program' || value === 'product' || value === 'gym' || value === 'profile';
}

export default function MessagesPage() {
    const { user, accessToken } = useSelector((state: RootState) => state.auth);
    const [searchParams] = useSearchParams();
    const partnerTargetFromQuery = searchParams.get('to');
    const draftFromQuery = searchParams.get('draft');
    const partnerNameFromQuery = searchParams.get('name');
    const profilePathFromQuery = searchParams.get('profile_path');
    const contextTypeFromQuery = searchParams.get('context_type');
    const contextIdFromQuery = searchParams.get('context_id');
    const contextLabelFromQuery = searchParams.get('context_label');
    const [conversations, setConversations] = useState<Conversation[]>([]);
    const [messages, setMessages] = useState<Message[]>([]);
    const [activePartner, setActivePartner] = useState<string | null>(null);
    const [newMessage, setNewMessage] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const buildInitialContext = (): MessageContext | null => {
        if (!contextIdFromQuery || !isMessageContextType(contextTypeFromQuery)) {
            return null;
        }

        return {
            context_type: contextTypeFromQuery,
            context_id: contextIdFromQuery,
            context_label: contextLabelFromQuery?.trim() || null,
        };
    };
    const [pendingContext, setPendingContext] = useState<MessageContext | null>(() => buildInitialContext());

    const buildPartnerPlaceholder = (partnerId: string) => ({
        id: partnerId,
        full_name: partnerId === partnerTargetFromQuery
            ? (partnerNameFromQuery?.trim() || 'Đối tác')
            : 'Đối tác',
        avatar_url: null,
    });

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
                        context_type: incomingMessage.context_type,
                        context_label: incomingMessage.context_label,
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
            socketService.offMessageSent();
            socketService.disconnect();
        };
    }, [accessToken, user?.id]);

    // Load conversations
    useEffect(() => { loadConversations(); }, []);

    // Load initial partner from URL param
    useEffect(() => {
        if (partnerTargetFromQuery) {
            setActivePartner(partnerTargetFromQuery);
            loadMessages(partnerTargetFromQuery);
            return;
        }

        if (!activePartner && conversations.length > 0) {
            const firstPartnerId = conversations[0].partner_id;
            setActivePartner(firstPartnerId);
            loadMessages(firstPartnerId);
        }
    }, [partnerTargetFromQuery, conversations, activePartner]);

    useEffect(() => {
        if (!draftFromQuery) return;
        setNewMessage((prev) => (prev.trim().length > 0 ? prev : draftFromQuery));
    }, [draftFromQuery]);

    useEffect(() => {
        if (!partnerTargetFromQuery) return;

        setConversations((prev) => {
            if (prev.some((conversation) => conversation.partner_id === partnerTargetFromQuery)) {
                return prev;
            }

            return [
                {
                    partner_id: partnerTargetFromQuery,
                    partner: buildPartnerPlaceholder(partnerTargetFromQuery),
                    last_message: null,
                    unread_count: 0,
                },
                ...prev,
            ];
        });
    }, [partnerTargetFromQuery, partnerNameFromQuery]);

    useEffect(() => {
        setPendingContext(buildInitialContext());
    }, [contextTypeFromQuery, contextIdFromQuery, contextLabelFromQuery]);

    // Scroll to bottom on new messages
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    const loadConversations = async () => {
        try {
            setError(null);
            const res = await apiClient.get('/messages/conversations');
            const nextConversations = res.data.conversations || [];
            if (partnerTargetFromQuery && !nextConversations.some((conversation: Conversation) => conversation.partner_id === partnerTargetFromQuery)) {
                setConversations([
                    {
                        partner_id: partnerTargetFromQuery,
                        partner: buildPartnerPlaceholder(partnerTargetFromQuery),
                        last_message: null,
                        unread_count: 0,
                    },
                    ...nextConversations,
                ]);
                return;
            }

            setConversations(nextConversations);
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
        if (partnerId !== partnerTargetFromQuery) {
            setPendingContext(null);
        }
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
        const contextPayload = pendingContext && activePartner === partnerTargetFromQuery
            ? pendingContext
            : null;
        const optimisticMessage: Message = {
            id: `temp-${Date.now()}`,
            sender_id: user.id,
            receiver_id: activePartner,
            content,
            context_type: contextPayload?.context_type ?? null,
            context_id: contextPayload?.context_id ?? null,
            context_label: contextPayload?.context_label ?? null,
            created_at: new Date().toISOString(),
            is_read: false,
        };

        socketService.sendMessage(activePartner, content, contextPayload ?? undefined);
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
                partner: nextConversation.partner ?? buildPartnerPlaceholder(activePartner),
                last_message: {
                    content,
                    context_type: contextPayload?.context_type ?? null,
                    context_label: contextPayload?.context_label ?? null,
                    created_at: optimisticMessage.created_at,
                    is_read: false,
                },
                unread_count: 0,
            };

            return [updated, ...prev.filter(conv => conv.partner_id !== activePartner)];
        });
        setNewMessage('');
        if (contextPayload) {
            setPendingContext(null);
        }
    };

    const activeConv = conversations.find(c => c.partner_id === activePartner);
    const activePartnerName = activePartner === partnerTargetFromQuery && partnerNameFromQuery
        ? partnerNameFromQuery
        : activeConv?.partner?.full_name || partnerNameFromQuery || 'Đối tác';
    const currentContextLabel = (() => {
        if (pendingContext?.context_label) {
            return pendingContext.context_label;
        }

        for (let index = messages.length - 1; index >= 0; index -= 1) {
            if (messages[index].context_label) {
                return messages[index].context_label;
            }
        }

        return null;
    })();

    return (
        <div className="page-shell-muted">
            <Helmet>
                <title>Tin nhắn — GYMERVIET</title>
                <meta name="robots" content="noindex,nofollow" />
            </Helmet>
            <div className="page-container gv-pad-y-sm">
                <section className="mb-6">
                    <p className="page-kicker">Trao đổi trực tiếp</p>
                    <h1 className="page-title">Tin nhắn</h1>
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
                                        Tin nhắn từ huấn luyện viên, phòng tập, người bán hoặc đối tác sẽ hiện ở đây.
                                    </p>
                                    <Link to="/" className="btn-primary text-xs uppercase tracking-[0.14em]">
                                        Khám phá nền tảng
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
                                                            {conv.partner?.full_name || 'Chưa rõ'}
                                                        </span>
                                                        {conv.unread_count > 0 && (
                                                            <span className="flex h-5 min-w-[1.25rem] items-center justify-center rounded-full bg-black px-1 text-[10px] font-bold text-white">
                                                                {conv.unread_count}
                                                            </span>
                                                        )}
                                                    </div>
                                                    {conv.last_message?.context_label && (
                                                        <p className="truncate text-[11px] font-semibold text-gray-500">
                                                            Về: {conv.last_message.context_label}
                                                        </p>
                                                    )}
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

                    <div className={`flex flex-col bg-white w-full md:flex-1 ${!activePartner ? 'hidden md:flex' : 'fixed inset-0 md:static z-50 md:z-auto'}`}>
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
                                        {profilePathFromQuery && activePartner === partnerTargetFromQuery ? (
                                            <Link to={profilePathFromQuery} className="font-semibold text-black hover:underline underline-offset-2">
                                                {activePartnerName}
                                            </Link>
                                        ) : (
                                            <span className="font-semibold text-black">{activePartnerName}</span>
                                        )}
                                        {currentContextLabel && (
                                            <p className="text-xs text-gray-500">Ngữ cảnh đang trao đổi: {currentContextLabel}</p>
                                        )}
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
                                                    Chưa có tin nhắn nào trong hội thoại này. Hãy bắt đầu trao đổi.
                                                </div>
                                            </div>
                                        ) : (
                                            messages.map(msg => {
                                                const isMe = msg.sender_id === user?.id;
                                                return (
                                                    <div key={msg.id} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                                                        <div className={`max-w-[75%] rounded-lg px-4 py-2.5 text-sm shadow-sm ${isMe ? 'rounded-tr-sm bg-black text-white' : 'rounded-tl-sm border border-gray-200 bg-white text-black'}`}>
                                                            {msg.context_label && (
                                                                <div className={`mb-1 text-[10px] font-bold uppercase tracking-[0.12em] ${isMe ? 'text-white/70' : 'text-gray-500'}`}>
                                                                    Về: {msg.context_label}
                                                                </div>
                                                            )}
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
                                            placeholder="Nhập nội dung trao đổi..."
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
                                        Chọn hội thoại ở cột trái để tiếp tục trao đổi theo đúng hồ sơ, sản phẩm hoặc chương trình liên quan.
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
