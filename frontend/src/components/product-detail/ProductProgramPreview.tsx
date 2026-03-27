import { ChevronDown } from 'lucide-react';
import { titleizeToken } from '../../utils/productDetailUtils';
import type { TrainingPackageDetail } from '../../types';

type DayPlan = NonNullable<TrainingPackageDetail['program_structure']>[string][string];

interface ProductProgramPreviewProps {
    previewWeeks: [string, Record<string, DayPlan>][];
}

export function ProductProgramPreview({ previewWeeks }: ProductProgramPreviewProps) {
    if (previewWeeks.length === 0) return null;

    return (
        <section className="mpd-section" id="preview">
            <div className="mpd-section-head">
                <h2 className="mpd-section-title">Xem trước chương trình</h2>
                <p className="mpd-section-copy">
                    Chỉ mở phần đủ để hiểu cấu trúc tuần tập.
                </p>
            </div>
            <div className="mpd-program-accordion">
                {previewWeeks.map(([week, days], index) => (
                    <details key={week} className="mpd-program-panel" open={index === 0}>
                        <summary className="mpd-program-summary">
                            <span className="mpd-program-summary-copy">
                                <strong>{titleizeToken(week)}</strong>
                                <small>{Object.keys(days).length} buổi</small>
                            </span>
                            <ChevronDown className="h-4 w-4 shrink-0" aria-hidden />
                        </summary>
                        <div className="mpd-program-panel-body">
                            {Object.entries(days).map(([day, plan]) => (
                                <div key={day} className="mpd-program-day">
                                    <div className="mpd-program-day-head">
                                        <strong>{plan.title}</strong>
                                        <span>{titleizeToken(day)}</span>
                                    </div>
                                    {plan.exercises.length > 0 && (
                                        <div className="mpd-table-scroll">
                                            <table className="mpd-exercise-table">
                                                <thead>
                                                    <tr>
                                                        <th>Bài tập</th>
                                                        <th>Sets</th>
                                                        <th>Reps</th>
                                                        <th>Nghỉ</th>
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    {plan.exercises.map((exercise, exerciseIndex) => (
                                                        <tr key={exerciseIndex}>
                                                            <td>{exercise.name}</td>
                                                            <td>{exercise.sets}</td>
                                                            <td>{exercise.reps}</td>
                                                            <td>{exercise.rest_seconds ? `${exercise.rest_seconds}s` : '—'}</td>
                                                        </tr>
                                                    ))}
                                                </tbody>
                                            </table>
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    </details>
                ))}
            </div>
        </section>
    );
}
