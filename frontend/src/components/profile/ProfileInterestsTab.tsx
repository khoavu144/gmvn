import { useCallback, useEffect, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';
import {
    fetchUserProfileCatalog,
    fetchUserProfileTermIds,
    updateUserProfileTermIds,
} from '../../services/userProfileCatalogApi';
import { ProfileCatalogSections, toggleTermInSection } from './ProfileCatalogSections';
import { PROFILE_INTERESTS_TAB_DESC } from '../../content/userProfileGlossary';

export function ProfileInterestsTab() {
    const qc = useQueryClient();

    const catalogQ = useQuery({
        queryKey: ['user-profile-catalog'],
        queryFn: fetchUserProfileCatalog,
    });

    const meQ = useQuery({
        queryKey: ['user-profile-term-ids'],
        queryFn: fetchUserProfileTermIds,
    });

    const [selected, setSelected] = useState<Set<string>>(new Set());

    /* eslint-disable react-hooks/set-state-in-effect -- mirror server term ids into editable local state */
    useEffect(() => {
        if (meQ.data) {
            setSelected(new Set(meQ.data));
        }
    }, [meQ.data]);
    /* eslint-enable react-hooks/set-state-in-effect */

    const onToggle = useCallback((section: Parameters<typeof toggleTermInSection>[0], termId: string) => {
        setSelected((prev) => toggleTermInSection(section, termId, prev));
    }, []);

    const [savedOk, setSavedOk] = useState(false);

    const saveMut = useMutation({
        mutationFn: () => updateUserProfileTermIds([...selected], 'profile'),
        onSuccess: async () => {
            setSavedOk(true);
            setTimeout(() => setSavedOk(false), 3000);
            await qc.invalidateQueries({ queryKey: ['user-profile-term-ids'] });
        },
    });

    if (catalogQ.isLoading || meQ.isLoading) {
        return (
            <div className="card">
                <p className="text-sm text-gray-500">Đang tải danh sách gợi ý…</p>
            </div>
        );
    }

    if (catalogQ.isError) {
        return (
            <div className="card">
                <p className="text-sm text-red-600">Không tải được danh mục. Thử lại sau.</p>
            </div>
        );
    }

    const sections = catalogQ.data?.sections ?? [];

    return (
        <div className="card">
            <h2 className="card-header">Mục tiêu &amp; chuyên môn</h2>
            <p className="text-sm text-gray-500 mb-8">{PROFILE_INTERESTS_TAB_DESC}</p>

            {savedOk && (
                <div className="mb-6 bg-gray-50 border border-black text-black px-4 py-3 rounded-xs text-sm">
                    Đã lưu lựa chọn.
                </div>
            )}

            <ProfileCatalogSections
                sections={sections}
                selected={selected}
                onToggleTerm={onToggle}
                disabled={saveMut.isPending}
            />

            {saveMut.isError && (
                <p className="mt-6 text-sm text-red-600">
                    {(axios.isAxiosError(saveMut.error)
                        ? saveMut.error.response?.data?.error?.message
                        : undefined) ?? 'Không lưu được. Kiểm tra lựa chọn theo yêu cầu từng nhóm.'}
                </p>
            )}

            <div className="mt-10 flex justify-end border-t border-gray-200 pt-6">
                <button
                    type="button"
                    disabled={saveMut.isPending || sections.length === 0}
                    onClick={() => saveMut.mutate()}
                    className="btn-primary min-w-[140px]"
                >
                    {saveMut.isPending ? 'Đang lưu…' : 'Lưu lựa chọn'}
                </button>
            </div>
        </div>
    );
}
