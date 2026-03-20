import { useState, useEffect } from 'react';
import { logger } from '../lib/logger';
import { Helmet } from 'react-helmet-async';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import type { RootState } from '../store/store';
import apiClient from '../services/api';
import { useToast } from '../components/Toast';

interface Exercise { id: string; exercise_name: string | null; sets: number | null; reps_min: number | null; reps_max: number | null; rest_seconds: number | null; video_url: string | null; }
interface Workout { id: string; week_number: number | null; day_number: number | null; name: string | null; duration_minutes: number | null; exercises: Exercise[]; }
interface Subscription { id: string; program: { id: string; name: string; duration_weeks?: number; }; trainer: { full_name: string; }; status: string; }

export default function WorkoutsPage() {
    const { toast, ToastComponent } = useToast();
    const navigate = useNavigate();
    const { user } = useSelector((state: RootState) => state.auth);
    const [subs, setSubs] = useState<Subscription[]>([]);
    const [activeSub, setActiveSub] = useState<string | null>(null);
    const [workouts, setWorkouts] = useState<Workout[]>([]);
    const [selectedWeek, setSelectedWeek] = useState(1);
    const [loggedIds, setLoggedIds] = useState<Set<string>>(new Set());
    const [loading, setLoading] = useState(false);
    const [notes, setNotes] = useState<Record<string, string>>({});

    useEffect(() => {
        if (!user || user.user_type !== 'athlete') { navigate('/dashboard'); return; }
        loadSubs();
    }, [user, navigate]);

    const loadSubs = async () => {
        try {
            const res = await apiClient.get('/subscriptions/me');
            const active = (res.data.subscriptions || []).filter((s: Subscription) => s.status === 'active');
            setSubs(active);
            if (active.length > 0) { setActiveSub(active[0].id); loadWorkouts(active[0].id, 1); }
        } catch (err) { logger.error(err); }
    };

    const loadWorkouts = async (subId: string, week: number) => {
        setLoading(true);
        try {
            const res = await apiClient.get(`/subscriptions/${subId}/workouts?week=${week}`);
            setWorkouts(res.data.workouts || []);
        } catch (err) { logger.error(err); } finally { setLoading(false); }
    };

    const handleLog = async (workoutId: string) => {
        const workoutNotes = notes[workoutId] || '';
        try {
            await apiClient.post(`/workouts/${workoutId}/log`, { notes: workoutNotes });
            setLoggedIds(prev => new Set([...prev, workoutId]));
            toast.success('Đã ghi nhận hoàn thành buổi tập!');
        } catch (err: any) { toast.error(err.response?.data?.error || 'Lỗi'); }
    };

    const dayNames = ['', 'Thứ 2', 'Thứ 3', 'Thứ 4', 'Thứ 5', 'Thứ 6', 'Thứ 7', 'CN'];

    return (
        <div className="page-shell-muted">
            <Helmet>
                <title>Lịch tập của tôi — GymViet</title>
                <meta name="robots" content="noindex,nofollow" />
            </Helmet>
            {ToastComponent}
            <div className="page-container">
                <section className="page-header">
                    <button onClick={() => navigate('/dashboard')} className="back-link mb-3">← Về Dashboard</button>
                    <p className="page-kicker">Workout Tracker</p>
                    <h1 className="page-title">Lịch tập của tôi</h1>
                    <p className="page-description">
                        Theo dõi các chương trình đang hoạt động, xem bài tập theo tuần và đánh dấu từng buổi đã hoàn thành.
                    </p>
                </section>

                {subs.length === 0 ? (
                    <div className="empty-state border-dashed border-[color:var(--mk-line)] bg-[color:var(--mk-paper)] mt-4 rounded-lg max-w-2xl mx-auto">
                        <div className="text-4xl mb-4">🎯</div>
                        <h3 className="text-lg font-bold text-[color:var(--mk-text)] mb-2">Chưa có lộ trình tập luyện</h3>
                        <p className="text-sm text-[color:var(--mk-muted)] mb-6 max-w-sm mx-auto">
                            Khi bạn đăng ký học với Coach, các bài tập chi tiết theo từng ngày sẽ xuất hiện tại đây để bạn dễ dàng theo dõi.
                        </p>
                        <button onClick={() => navigate('/coaches')} className="btn-primary px-6 text-sm">
                            Khám phá Coach
                        </button>
                    </div>
                ) : (
                    <>
                        {/* Sub selector */}
                        <div className="flex gap-2 mb-6 overflow-x-auto pb-2 scrollbar-none">
                            {subs.map(s => (
                                <button key={s.id} onClick={() => { setActiveSub(s.id); loadWorkouts(s.id, selectedWeek); }}
                                    className={`flex-shrink-0 px-4 py-2 rounded-xs text-sm font-semibold transition-colors border ${activeSub === s.id ? 'bg-black text-white border-black' : 'bg-white text-[color:var(--mk-text-soft)] border-[color:var(--mk-line)] hover:border-[color:var(--mk-line)]'}`}>
                                    {s.program?.name}
                                </button>
                            ))}
                        </div>

                        {/* Week selector */}
                        <div className="flex gap-2 mb-8 overflow-x-auto pb-2 scrollbar-none">
                            {Array.from({ length: subs.find(s => s.id === activeSub)?.program?.duration_weeks || 12 }, (_, i) => i + 1).map(w => (
                                <button key={w} onClick={() => { setSelectedWeek(w); if (activeSub) loadWorkouts(activeSub, w); }}
                                    className={`flex-shrink-0 w-10 h-10 rounded-full text-sm font-semibold transition-colors border ${selectedWeek === w ? 'bg-black text-white border-black' : 'bg-white text-[color:var(--mk-text-soft)] border-[color:var(--mk-line)] hover:border-[color:var(--mk-line)]'}`}>
                                    {w}
                                </button>
                            ))}
                        </div>

                        {/* Workouts */}
                        {loading ? (
                            <div className="space-y-6 animate-pulse">
                                {[1, 2, 3].map(i => (
                                    <div key={i} className="card border border-[color:var(--mk-line)] p-5">
                                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4 border-b border-[color:var(--mk-line)] pb-4">
                                            <div className="space-y-2 w-full sm:w-1/2">
                                                <div className="h-4 bg-[color:var(--mk-paper-strong)] w-24 rounded-sm"></div>
                                                <div className="h-6 bg-[color:var(--mk-paper-strong)] w-3/4 rounded-sm"></div>
                                            </div>
                                            <div className="flex items-center gap-2 hidden sm:flex">
                                                <div className="h-10 w-48 bg-[color:var(--mk-paper)] rounded-sm"></div>
                                                <div className="h-10 w-28 bg-[color:var(--mk-paper-strong)] rounded-sm"></div>
                                            </div>
                                        </div>
                                        <div className="space-y-4">
                                            {[1, 2].map(j => (
                                                <div key={j} className="flex items-start gap-3">
                                                    <div className="w-5 h-5 rounded-full bg-[color:var(--mk-paper-strong)] shrink-0 mt-0.5"></div>
                                                    <div className="space-y-2 w-full">
                                                        <div className="h-4 bg-[color:var(--mk-paper-strong)] w-1/3 rounded-sm"></div>
                                                        <div className="h-3 bg-[color:var(--mk-paper-strong)] w-1/4 rounded-sm"></div>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : workouts.length === 0 ? (
                            <div className="empty-state border-dashed text-sm text-[color:var(--mk-muted)]">
                                <div className="empty-state-number">{selectedWeek}</div>
                                <p className="text-sm font-medium text-[color:var(--mk-text-soft)]">Tuần {selectedWeek} chưa có lịch tập.</p>
                            </div>
                        ) : (
                            <div className="space-y-6">
                                {workouts.map(w => {
                                    const isDone = loggedIds.has(w.id);
                                    return (
                                        <div key={w.id} className={`card ${isDone ? 'border-[color:var(--mk-line)] bg-[color:var(--mk-paper)]' : ''}`}>
                                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4 border-b border-[color:var(--mk-line)] pb-4">
                                                <div>
                                                    <div className="flex items-center gap-2 mb-1">
                                                        <span className="text-[10px] font-bold uppercase tracking-wider bg-[color:var(--mk-paper)] text-[color:var(--mk-text-soft)] px-2 py-0.5 rounded-xs">
                                                            {w.day_number ? dayNames[w.day_number] : 'Chưa xếp ngày'}
                                                        </span>
                                                        {w.duration_minutes && <span className="text-xs text-[color:var(--mk-muted)] font-medium">{w.duration_minutes} phút</span>}
                                                    </div>
                                                    <h3 className={`text-lg font-bold ${isDone ? 'text-[color:var(--mk-muted)] line-through' : 'text-black'}`}>
                                                        {w.name || `Buổi tập ngày ${w.day_number}`}
                                                    </h3>
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    {!isDone && (
                                                        <textarea
                                                            placeholder="Ghi chú buổi tập..."
                                                            className="form-input text-xs h-10 min-h-[40px] w-48 resize-none py-2"
                                                            value={notes[w.id] || ''}
                                                            onChange={(e) => setNotes(prev => ({ ...prev, [w.id]: e.target.value }))}
                                                        />
                                                    )}
                                                    <button onClick={() => handleLog(w.id)} disabled={isDone}
                                                        className={`shrink-0 px-4 py-2 rounded-xs text-sm font-semibold transition-colors border ${isDone ? 'bg-transparent text-[color:var(--mk-muted)] border-transparent cursor-not-allowed' : 'btn-primary'}`}>
                                                        {isDone ? 'Đã hoàn thành' : 'Đánh dấu xong'}
                                                    </button>
                                                </div>
                                            </div>

                                            {w.exercises?.length > 0 ? (
                                                <div className="space-y-3">
                                                    {w.exercises.map((ex, i) => (
                                                        <div key={ex.id} className={`flex items-start gap-3 text-sm ${isDone ? 'opacity-60' : ''}`}>
                                                            <span className="w-5 h-5 rounded-full bg-[color:var(--mk-paper)] flex items-center justify-center text-[10px] font-bold text-[color:var(--mk-muted)] flex-shrink-0 mt-0.5">{i + 1}</span>
                                                            <div className="flex-1">
                                                                <div className="font-semibold text-[color:var(--mk-text)]">{ex.exercise_name}</div>
                                                                <div className="text-xs font-medium text-[color:var(--mk-muted)] mt-0.5 flex flex-wrap gap-x-3 gap-y-1">
                                                                    {ex.sets && <span>{ex.sets} set</span>}
                                                                    {ex.reps_min && <span>{ex.reps_min}{ex.reps_max && ex.reps_max !== ex.reps_min ? `-${ex.reps_max}` : ''} reps</span>}
                                                                    {ex.rest_seconds && <span>{ex.rest_seconds}s nghỉ</span>}
                                                                </div>
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                            ) : (
                                                <div className="text-sm text-[color:var(--mk-muted)] italic">Chưa có bài tập nào.</div>
                                            )}
                                        </div>
                                    )
                                })}
                            </div>
                        )}
                    </>
                )}
            </div>
        </div>
    );
}
