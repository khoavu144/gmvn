export function GymSectionHeading({
    kicker,
    title,
    description,
}: {
    kicker: string;
    title: string;
    description?: string;
}) {
    return (
        <div className="mb-4 space-y-2">
            <div className="marketplace-section-kicker">{kicker}</div>
            <h2 className="marketplace-section-title">{title}</h2>
            {description && <p className="marketplace-lead max-w-none text-[0.98rem]">{description}</p>}
        </div>
    );
}
