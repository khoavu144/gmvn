import type { CatalogSection } from '../../services/userProfileCatalogApi';
import { PROFILE_HINT_OPTIONAL_GROUP, profileHintRequiredGroup } from '../../content/userProfileGlossary';

function countSelectedInSection(section: CatalogSection, selected: Set<string>): number {
    return section.terms.filter((t) => selected.has(t.id)).length;
}

export function ProfileCatalogSections({
    sections,
    selected,
    onToggleTerm,
    disabled,
}: {
    sections: CatalogSection[];
    selected: Set<string>;
    onToggleTerm: (section: CatalogSection, termId: string) => void;
    disabled?: boolean;
}) {
    if (sections.length === 0) {
        return (
            <p className="text-sm text-gray-500">
                Chưa có danh mục gợi ý cho vai trò của bạn.
            </p>
        );
    }

    return (
        <div className="space-y-10">
            {sections.map((section) => {
                const n = countSelectedInSection(section, selected);
                const required = section.min_select > 0;
                const hint = required
                    ? profileHintRequiredGroup('lưu phần này')
                    : PROFILE_HINT_OPTIONAL_GROUP;

                return (
                    <div key={section.id}>
                        <h3 className="text-lg font-bold text-black">{section.title_vi}</h3>
                        {section.description_vi ? (
                            <p className="text-sm text-gray-500 mt-1">{section.description_vi}</p>
                        ) : null}
                        <p className="text-xs text-gray-500 mt-2">{hint}</p>
                        <div className="mt-4 flex flex-wrap gap-2">
                            {section.terms.map((term) => {
                                const isOn = selected.has(term.id);
                                const atMax =
                                    section.max_select > 0 &&
                                    n >= section.max_select &&
                                    !isOn;
                                return (
                                    <button
                                        key={term.id}
                                        type="button"
                                        disabled={disabled || atMax}
                                        onClick={() => onToggleTerm(section, term.id)}
                                        className={`px-4 py-2 rounded-lg text-sm font-semibold border transition-all ${
                                            isOn
                                                ? 'bg-black text-white border-black'
                                                : 'bg-white text-black border-gray-200 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed'
                                        }`}
                                    >
                                        {term.label_vi}
                                    </button>
                                );
                            })}
                        </div>
                    </div>
                );
            })}
        </div>
    );
}

export function toggleTermInSection(
    section: CatalogSection,
    termId: string,
    selected: Set<string>,
): Set<string> {
    const next = new Set(selected);
    const inSection = (id: string) => section.terms.some((t) => t.id === id);
    const countInSection = [...selected].filter(inSection).length;

    if (next.has(termId)) {
        next.delete(termId);
        return next;
    }

    const max = section.max_select > 0 ? section.max_select : Number.POSITIVE_INFINITY;
    if (countInSection >= max) return next;

    next.add(termId);
    return next;
}
