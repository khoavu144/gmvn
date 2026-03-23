import { useState, useEffect, useCallback } from 'react';
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

    const loadWorkouts = useCallback(async (subId: string, week: number) => {
        setLoading(true);
        try {
            const res = await apiClient.get(`/subscriptions/${subId}/workouts?week=${week}`);
            setWorkouts(res.data.workouts || []);
        } catch (err) { logger.error(err); } finally { setLoading(false); }
    }, []);

    const loadSubs = useCallback(async () => {
        try {
            const res = await apiClient.get('/subscriptions/me');
            const active = (res.data.subscriptions || []).filter((s: Subscription) => s.status === 'active');
            setSubs(active);
            if (active.length > 0) { setActiveSub(active[0].id); await loadWorkouts(active[0].id, 1); }
        } catch (err) { logger.error(err); }
    }, [loadWorkouts]);

    useEffect(() => {
        if (!user || user.user_type !== 'athlete') { navigate('/dashboard'); return; }
        void loadSubs();
    }, [user, navigate, loadSubs]);

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
                <title>Lịch tập của tôi — GYMERVIET</title>
                <meta name="robots" content="noindex,nofollow" />
            </Helmet>
            {ToastComponent}
            <div className="page-container gv-pad-y">
                <section className="page-header">
                    <button onClick={() => navigate('/dashboard')} className="back-link mb-3">← Về Dashboard</button>
                    <p className="page-kicker">Workout Tracker</p>
                    <h1 className="page-title">Lịch tập của tôi</h1>
                    <p className="page-description">
                        Theo dõi các chương trình đang hoạt động, xem bài tập theo tuần và đánh dấu từng buổi đã hoàn thành.
                    </p>
                </section>

                {subs.length === 0 ? (
                    <div className="empty-state border-dashed border-gray-200 bg-gray-50 mt-4 rounded-lg max-w-2xl mx-auto">
                        <div className="text-4xl mb-4">🎯</div>
                        <h3 className="text-lg font-bold text-gray-900 mb-2">Chưa có lộ trình tập luyện</h3>
                        <p className="text-sm text-gray-500 mb-6 max-w-sm mx-auto">
                            Khi bạn đăng ký học với Coach, các bài tập chi tiết theo từng ngày sẽ xuất hiện tại đây để bạn dễ dàng theo dõi.
                        </p>
                        <button onClick={() => navigate('/coaches')} className="btn-primary px-6 text-sm">
                            Khám phá Coach
                        </button>
                    </div>
                ) : (
                    <>
                        <div className="page-section mb-6">
                            <div className="page-kicker mb-3">Chương trình đang theo</div>
                            <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-none">
                                {subs.map(s => (
                                    <button key={s.id} onClick={() => { setActiveSub(s.id); loadWorkouts(s.id, selectedWeek); }}
                                        className={`filter-chip flex-shrink-0 whitespace-nowrap ${activeSub === s.id ? 'filter-chip-active' : 'filter-chip-idle'}`}>
                                        {s.program?.name}
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div className="page-section mb-8">
                            <div className="page-kicker mb-3">Chọn tuần</div>
                            <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-none">
                                {Array.from({ length: subs.find(s => s.id === activeSub)?.program?.duration_weeks || 12 }, (_, i) => i + 1).map(w => (
                                    <button key={w} onClick={() => { setSelectedWeek(w); if (activeSub) loadWorkouts(activeSub, w); }}
                                        className={`filter-chip min-w-[2.75rem] flex-shrink-0 ${selectedWeek === w ? 'filter-chip-active' : 'filter-chip-idle'}`}>
                                        {w}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Workouts */}
                        {loading ? (
                            <div className="space-y-6 animate-pulse">
                                {[1, 2, 3].map(i => (
                                    <div key={i} className="page-section">
                                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4 border-b border-gray-200 pb-4">
                                            <div className="space-y-2 w-full sm:w-1/2">
                                                <div className="h-4 bg-gray-100 w-24 rounded-sm"></div>
                                                <div className="h-6 bg-gray-100 w-3/4 rounded-sm"></div>
                                            </div>
                                            <div className="hidden sm:flex items-center gap-2">
                                                <div className="h-10 w-48 bg-gray-50 rounded-sm"></div>
                                                <div className="h-10 w-28 bg-gray-100 rounded-sm"></div>
                                            </div>
                                        </div>
                                        <div className="space-y-4">
                                            {[1, 2].map(j => (
                                                <div key={j} className="flex items-start gap-3">
                                                    <div className="w-5 h-5 rounded-full bg-gray-100 shrink-0 mt-0.5"></div>
                                                    <div className="space-y-2 w-full">
                                                        <div className="h-4 bg-gray-100 w-1/3 rounded-sm"></div>
                                                        <div className="h-3 bg-gray-100 w-1/4 rounded-sm"></div>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : workouts.length === 0 ? (
                            <div className="empty-state border-dashed text-sm text-gray-500">
                                <div className="empty-state-number">{selectedWeek}</div>
                                <p className="text-sm font-medium text-gray-600">Tuần {selectedWeek} chưa có lịch tập.</p>
                            </div>
                        ) : (
                            <div className="space-y-6">
                                {workouts.map(w => {
                                    const isDone = loggedIds.has(w.id);
                                    return (
                                        <div key={w.id} className={`page-section ${isDone ? 'bg-gray-50' : ''}`}>
                                            <div className="mb-4 flex flex-col justify-between gap-4 border-b border-gray-200 pb-4 sm:flex-row sm:items-center">
                                                <div>
                                                    <div className="mb-1 flex items-center gap-2">
                                                        <span className="page-pill">
                                                            {w.day_number ? dayNames[w.day_number] : 'Chưa xếp ngày'}
                                                        </span>
                                                        {w.duration_minutes && <span className="text-xs font-medium text-gray-500">{w.duration_minutes} phút</span>}
                                                    </div>
                                                    <h3 className={`text-lg font-bold tracking-tight ${isDone ? 'text-gray-500 line-through' : 'text-black'}`}>
                                                        {w.name || `Buổi tập ngày ${w.day_number}`}
                                                    </h3>
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    {!isDone && (
                                                        <textarea
                                                            placeholder="Ghi chú buổi tập..."
                                                            className="form-input h-11 min-h-[44px] w-48 resize-none py-2 text-xs"
                                                            value={notes[w.id] || ''}
                                                            onChange={(e) => setNotes(prev => ({ ...prev, [w.id]: e.target.value }))}
                                                        />
                                                    )}
                                                    <button onClick={() => handleLog(w.id)} disabled={isDone}
                                                        className={`shrink-0 ${isDone ? 'btn-secondary border-transparent bg-gray-50 text-gray-500 shadow-none' : 'btn-primary'}`}>
                                                        {isDone ? 'Đã hoàn thành' : 'Đánh dấu xong'}
                                                    </button>
                                                </div>
                                            </div>

                                            {w.exercises?.length > 0 ? (
                                                <div className="space-y-3">
                                                    {w.exercises.map((ex, i) => (
                                                        <div key={ex.id} className={`flex items-start gap-3 text-sm ${isDone ? 'opacity-60' : ''}`}>
                                                            <span className="w-5 h-5 rounded-full bg-gray-50 flex items-center justify-center text-[10px] font-bold text-gray-500 flex-shrink-0 mt-0.5">{i + 1}</span>
                                                            <div className="flex-1">
                                                                <div className="font-semibold text-gray-900">{ex.exercise_name}</div>
                                                                <div className="text-xs font-medium text-gray-500 mt-0.5 flex flex-wrap gap-x-3 gap-y-1">
                                                                    {ex.sets && <span>{ex.sets} set</span>}
                                                                    {ex.reps_min && <span>{ex.reps_min}{ex.reps_max && ex.reps_max !== ex.reps_min ? `-${ex.reps_max}` : ''} reps</span>}
                                                                    {ex.rest_seconds && <span>{ex.rest_seconds}s nghỉ</span>}
                                                                </div>
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                            ) : (
                                                <div className="text-sm text-gray-500 italic">Chưa có bài tập nào.</div>
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
