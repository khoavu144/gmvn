interface StatCardProps {
    label: string;
    value: string | number;
    icon: React.ReactNode;
    tone?: 'default' | 'subtle';
}

/**
 * Reusable stat card for dashboard overview blocks.
 * Distilled to one visual pattern to reduce repeated variants.
 */
export default function StatCard({ label, value, icon, tone = 'default' }: StatCardProps) {
    if (tone === 'subtle') {
        return (
            <div className="bg-white border border-gray-200 rounded-lg p-4 md:p-5 flex flex-col justify-between hover:border-black transition-colors shadow-sm">
                <div className="flex justify-between items-start mb-2">
                    <div className="bg-gray-50 p-2 rounded-md">{icon}</div>
                </div>
                <div>
                    <div className="text-2xl font-black text-black">{value}</div>
                    <div className="text-[10px] sm:text-xs font-bold text-gray-500 uppercase tracking-widest mt-1 truncate">{label}</div>
                </div>
            </div>
        );
    }

    return (
        <div className="bg-white border-l-4 border-black rounded-r-lg shadow-sm p-4 md:p-5 flex flex-col justify-between hover:shadow-md transition-shadow">
            <div className="flex justify-between items-start mb-2">
                <div className="text-gray-400">{icon}</div>
            </div>
            <div>
                <div className="text-2xl font-black text-black">{value}</div>
                <div className="text-[10px] sm:text-xs font-bold text-gray-500 uppercase tracking-widest mt-1 truncate">{label}</div>
            </div>
        </div>
    );
}
