import { useState, useEffect } from 'react';
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
        } catch (err) { console.error(err); }
    };

    const loadWorkouts = async (subId: string, week: number) => {
        setLoading(true);
        try {
            const res = await apiClient.get(`/subscriptions/${subId}/workouts?week=${week}`);
            setWorkouts(res.data.workouts || []);
        } catch (err) { console.error(err); } finally { setLoading(false); }
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
        <div className="pb-16">
            {ToastComponent}
            <div className="max-w-4xl mx-auto px-4 py-8">
                <div className="mb-8">
                    <button onClick={() => navigate('/dashboard')} className="text-gray-500 hover:text-black font-medium text-sm mb-2 block">← Về Dashboard</button>
                    <h1 className="text-h2 m-0">Lịch tập của tôi</h1>
                </div>

                {subs.length === 0 ? (
                    <div className="card text-center py-16 border-dashed">
                        <p className="text-gray-500 mb-4 text-sm font-medium">Bạn chưa đăng ký gói tập nào.</p>
                        <button onClick={() => navigate('/trainers')} className="btn-primary px-6">
                            Tìm Huấn luyện viên
                        </button>
                    </div>
                ) : (
                    <>
                        {/* Sub selector */}
                        <div className="flex gap-2 mb-6 overflow-x-auto pb-2 scrollbar-none">
                            {subs.map(s => (
                                <button key={s.id} onClick={() => { setActiveSub(s.id); loadWorkouts(s.id, selectedWeek); }}
                                    className={`flex-shrink-0 px-4 py-2 rounded-xs text-sm font-semibold transition-colors border ${activeSub === s.id ? 'bg-black text-white border-black' : 'bg-white text-gray-700 border-gray-200 hover:border-gray-400'}`}>
                                    {s.program?.name}
                                </button>
                            ))}
                        </div>

                        {/* Week selector */}
                        <div className="flex gap-2 mb-8 overflow-x-auto pb-2 scrollbar-none">
                            {Array.from({ length: subs.find(s => s.id === activeSub)?.program?.duration_weeks || 12 }, (_, i) => i + 1).map(w => (
                                <button key={w} onClick={() => { setSelectedWeek(w); if (activeSub) loadWorkouts(activeSub, w); }}
                                    className={`flex-shrink-0 w-10 h-10 rounded-full text-sm font-semibold transition-colors border ${selectedWeek === w ? 'bg-black text-white border-black' : 'bg-white text-gray-700 border-gray-200 hover:border-gray-400'}`}>
                                    {w}
                                </button>
                            ))}
                        </div>

                        {/* Workouts */}
                        {loading ? (
                            <div className="text-center text-gray-500 py-16 text-sm">Đang tải lịch tập...</div>
                        ) : workouts.length === 0 ? (
                            <div className="card text-center text-gray-500 py-12 border-dashed text-sm">
                                Tuần {selectedWeek} chưa có lịch tập.
                            </div>
                        ) : (
                            <div className="space-y-6">
                                {workouts.map(w => {
                                    const isDone = loggedIds.has(w.id);
                                    return (
                                        <div key={w.id} className={`card ${isDone ? 'border-gray-400 bg-gray-50' : ''}`}>
                                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4 border-b border-gray-100 pb-4">
                                                <div>
                                                    <div className="flex items-center gap-2 mb-1">
                                                        <span className="text-[10px] font-bold uppercase tracking-wider bg-gray-100 text-gray-600 px-2 py-0.5 rounded-xs">
                                                            {w.day_number ? dayNames[w.day_number] : 'Chưa xếp ngày'}
                                                        </span>
                                                        {w.duration_minutes && <span className="text-xs text-gray-500 font-medium">{w.duration_minutes} phút</span>}
                                                    </div>
                                                    <h3 className={`text-lg font-bold ${isDone ? 'text-gray-500 line-through' : 'text-black'}`}>
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
                                                        className={`shrink-0 px-4 py-2 rounded-xs text-sm font-semibold transition-colors border ${isDone ? 'bg-transparent text-gray-400 border-transparent cursor-not-allowed' : 'btn-primary'}`}>
                                                        {isDone ? 'Đã hoàn thành' : 'Đánh dấu xong'}
                                                    </button>
                                                </div>
                                            </div>

                                            {w.exercises?.length > 0 ? (
                                                <div className="space-y-3">
                                                    {w.exercises.map((ex, i) => (
                                                        <div key={ex.id} className={`flex items-start gap-3 text-sm ${isDone ? 'opacity-60' : ''}`}>
                                                            <span className="w-5 h-5 rounded-full bg-gray-100 flex items-center justify-center text-[10px] font-bold text-gray-500 flex-shrink-0 mt-0.5">{i + 1}</span>
                                                            <div className="flex-1">
                                                                <div className="font-semibold text-gray-800">{ex.exercise_name}</div>
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
