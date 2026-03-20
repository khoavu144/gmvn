/**
 * Shared type definitions for platform plan limits.
 * Separate file to avoid circular imports between hook and component files.
 */
export interface PlanLimits {
    maxPrograms: number;
    maxClients: number;
    maxBranches: number;
    maxGymTrainers: number;
    prioritySearch: boolean;
    badge: boolean;
    customShareCard: boolean;
    unlimitedProgressPhotos: boolean;
    fullSubscriptionHistory: boolean;
    coachComparison: boolean;
}
