import React from 'react';
import { Link } from 'react-router-dom';

interface CoachGymBadgeProps {
    gymId: string;
    gymName: string;
    branchName?: string;
    role?: string;
}

const CoachGymBadge: React.FC<CoachGymBadgeProps> = ({ gymId, gymName, branchName, role }) => {
    return (
        <Link to={`/gyms/${gymId}`} className="block border border-gray-200 rounded-xl p-4 hover:border-black transition-colors group">
            <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xs bg-gray-100 border border-gray-200 flex items-center justify-center font-bold text-gray-500 uppercase">
                    {gymName.charAt(0)}
                </div>
                <div>
                    <h4 className="font-bold text-black text-sm group-hover:underline">{gymName}</h4>
                    <p className="text-xs text-gray-500 mt-0.5">
                        {role || 'Coach'} {branchName && `• ${branchName}`}
                    </p>
                </div>
            </div>
        </Link>
    );
};

export default CoachGymBadge;
