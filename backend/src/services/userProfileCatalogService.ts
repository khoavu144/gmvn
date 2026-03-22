import { In } from 'typeorm';
import { AppDataSource } from '../config/database';
import { UserProfileSection } from '../entities/UserProfileSection';
import { UserProfileTerm } from '../entities/UserProfileTerm';
import { UserProfileTermSelection } from '../entities/UserProfileTermSelection';
import { User } from '../entities/User';
import {
    getRulesFor,
    type AppUserType,
    type UserProfileRuleContext,
} from '../config/userProfileRules';

export interface CatalogTermDto {
    id: string;
    slug: string;
    label_vi: string;
    sort_order: number;
}

export interface CatalogSectionDto {
    id: string;
    slug: string;
    title_vi: string;
    description_vi: string | null;
    sort_order: number;
    min_select: number;
    max_select: number;
    terms: CatalogTermDto[];
    /** Reserved for P3 structured questions (custom fields) — same layout later */
    fields: unknown[];
}

export class UserProfileCatalogError extends Error {
    constructor(
        message: string,
        public readonly code: 'VALIDATION' | 'NOT_FOUND',
    ) {
        super(message);
        this.name = 'UserProfileCatalogError';
    }
}

export async function getCatalogForUserType(
    userType: string,
    locale: string,
): Promise<{ sections: CatalogSectionDto[]; locale: string }> {
    void locale; // reserved for future i18n columns
    const secRepo = AppDataSource.getRepository(UserProfileSection);
    const sections = await secRepo.find({
        where: { is_active: true },
        relations: ['terms'],
        order: { sort_order: 'ASC' },
    });

    const filtered = sections.filter((s) => {
        const applies = Array.isArray(s.applies_to) ? s.applies_to : [];
        return applies.includes(userType);
    });

    const out: CatalogSectionDto[] = filtered.map((s) => ({
        id: s.id,
        slug: s.slug,
        title_vi: s.title_vi,
        description_vi: s.description_vi,
        sort_order: s.sort_order,
        min_select: s.min_select,
        max_select: s.max_select,
        terms: (s.terms || [])
            .filter((t) => t.is_active)
            .sort((a, b) => a.sort_order - b.sort_order)
            .map((t) => ({
                id: t.id,
                slug: t.slug,
                label_vi: t.label_vi,
                sort_order: t.sort_order,
            })),
        fields: [],
    }));

    return { sections: out, locale: locale || 'vi' };
}

export async function getUserTermIds(userId: string): Promise<string[]> {
    const repo = AppDataSource.getRepository(UserProfileTermSelection);
    const rows = await repo.find({ where: { user_id: userId } });
    return rows.map((r) => r.term_id);
}

function countBySection(
    termIds: string[],
    termsById: Map<string, UserProfileTerm>,
): Map<string, number> {
    const counts = new Map<string, number>();
    for (const tid of termIds) {
        const t = termsById.get(tid);
        if (!t) continue;
        const sid = t.section_id;
        counts.set(sid, (counts.get(sid) || 0) + 1);
    }
    return counts;
}

export async function validateSelections(
    userType: AppUserType,
    context: UserProfileRuleContext,
    termIds: string[],
): Promise<void> {
    const unique = [...new Set(termIds)];

    const secRepo = AppDataSource.getRepository(UserProfileSection);
    const allSections = await secRepo.find({ where: { is_active: true } });
    const applicableSections = allSections.filter((s) => {
        const applies = Array.isArray(s.applies_to) ? s.applies_to : [];
        return applies.includes(userType);
    });
    const sectionBySlug = new Map(applicableSections.map((s) => [s.slug, s]));

    const termsById = new Map<string, UserProfileTerm>();
    if (unique.length > 0) {
        const termRepo = AppDataSource.getRepository(UserProfileTerm);
        const terms = await termRepo.find({
            where: { id: In(unique), is_active: true },
            relations: ['section'],
        });
        if (terms.length !== unique.length) {
            throw new UserProfileCatalogError('Có lựa chọn không hợp lệ.', 'VALIDATION');
        }
        for (const t of terms) {
            const applies = Array.isArray(t.section.applies_to) ? t.section.applies_to : [];
            if (!applies.includes(userType)) {
                throw new UserProfileCatalogError(
                    `Lựa chọn không áp dụng cho loại tài khoản của bạn (${t.section.title_vi}).`,
                    'VALIDATION',
                );
            }
        }
        for (const t of terms) {
            termsById.set(t.id, t);
        }
    }

    const rules = getRulesFor(context, userType);
    const bySectionId = countBySection(unique, termsById);

    for (const [sectionSlug, req] of Object.entries(rules)) {
        const section = sectionBySlug.get(sectionSlug);
        if (!section) continue;
        const n = bySectionId.get(section.id) || 0;
        if (n < req.min) {
            throw new UserProfileCatalogError(
                `Vui lòng chọn ít nhất ${req.min} mục trong phần "${section.title_vi}".`,
                'VALIDATION',
            );
        }
        if (req.max > 0 && n > req.max) {
            throw new UserProfileCatalogError(
                `Chọn tối đa ${req.max} mục trong phần "${section.title_vi}".`,
                'VALIDATION',
            );
        }
    }

    for (const section of applicableSections) {
        const n = bySectionId.get(section.id) || 0;
        if (n === 0) continue;
        if (section.max_select > 0 && n > section.max_select) {
            throw new UserProfileCatalogError(
                `Chọn tối đa ${section.max_select} mục trong phần "${section.title_vi}".`,
                'VALIDATION',
            );
        }
    }
}

export async function setUserSelections(
    userId: string,
    userType: AppUserType,
    context: UserProfileRuleContext,
    termIds: string[],
): Promise<{ term_ids: string[] }> {
    const unique = [...new Set(termIds)];
    await validateSelections(userType, context, unique);

    const selRepo = AppDataSource.getRepository(UserProfileTermSelection);
    await selRepo.delete({ user_id: userId });

    for (const tid of unique) {
        await selRepo.insert({ user_id: userId, term_id: tid });
    }

    await syncTrainerSpecialtiesFromTerms(userId, userType, unique);

    return { term_ids: unique };
}

/** Keep User.specialties in sync for trainers (backward compat with coaches list). */
async function syncTrainerSpecialtiesFromTerms(
    userId: string,
    userType: AppUserType,
    termIds: string[],
): Promise<void> {
    if (userType !== 'trainer') return;

    const userRepo = AppDataSource.getRepository(User);
    if (termIds.length === 0) {
        await userRepo.update(userId, { specialties: [] });
        return;
    }

    const termRepo = AppDataSource.getRepository(UserProfileTerm);
    const terms = await termRepo.find({
        where: { id: In(termIds) },
        relations: ['section'],
    });
    const labels = terms
        .filter((t) => t.section.slug === 'coach_specialties')
        .sort((a, b) => a.sort_order - b.sort_order)
        .map((t) => t.label_vi);

    await userRepo.update(userId, { specialties: labels });
}

/** Map legacy free-text specialty labels to catalog term ids (coach_specialties). */
export async function resolveCoachSpecialtyTermIdsFromLabels(labels: string[]): Promise<string[]> {
    const secRepo = AppDataSource.getRepository(UserProfileSection);
    const section = await secRepo.findOne({
        where: { slug: 'coach_specialties', is_active: true },
        relations: ['terms'],
    });
    if (!section?.terms?.length) return [];

    const norm = (s: string) => s.trim().toLowerCase();
    const ids: string[] = [];
    for (const raw of labels) {
        const label = String(raw).trim();
        if (!label) continue;
        const hit = section.terms.find(
            (t) => t.is_active && norm(t.label_vi) === norm(label),
        );
        if (hit) ids.push(hit.id);
    }
    return [...new Set(ids)];
}

export async function loadUserType(userId: string): Promise<AppUserType> {
    const user = await AppDataSource.getRepository(User).findOneBy({ id: userId });
    if (!user) throw new UserProfileCatalogError('User not found', 'NOT_FOUND');
    return user.user_type as AppUserType;
}
