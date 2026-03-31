import type {
    ActorImage,
    ActorProfile,
    ApplicationStatus,
    CastingCall,
    CastingProfile,
} from "@/types";

export function getActorProfileChecklist(
    actorProfile: Partial<ActorProfile> | null | undefined,
    images: Pick<ActorImage, "type">[] = []
) {
    const imageTypes = new Set(images.map((image) => image.type));
    const checks = [
        { key: "basics", label: "Personal details", done: Boolean(actorProfile?.age && actorProfile?.gender) },
        { key: "story", label: "Bio and location", done: Boolean(actorProfile?.bio && actorProfile?.location) },
        { key: "languages", label: "Languages listed", done: Boolean(actorProfile?.languages?.length) },
        { key: "headshots", label: "Three required headshots", done: ["left", "center", "right"].every((type) => imageTypes.has(type as ActorImage["type"])) },
        { key: "portfolio", label: "Past work or reel", done: Boolean(actorProfile?.past_works?.length) },
    ];

    const completed = checks.filter((check) => check.done).length;
    return {
        checks,
        completed,
        total: checks.length,
        percent: Math.round((completed / checks.length) * 100),
        readyToApply: completed >= 4,
    };
}

export function getCastingCallChecklist(call: Partial<CastingCall> | null | undefined) {
    const requirements = call?.requirements || {};
    const typedRequirements = requirements as Record<string, unknown>;
    const submissionChecklist = call?.submission_checklist || [];
    const checks = [
        { key: "title", label: "Role title and project context", done: Boolean(call?.title && call?.description) },
        { key: "requirements", label: "Actor fit requirements", done: Boolean(Object.keys(typedRequirements).length) },
        { key: "instructions", label: "Audition instructions", done: Boolean(call?.audition_instructions) },
        { key: "deadline", label: "Clear timeline", done: Boolean(call?.deadline) },
        { key: "checklist", label: "Submission checklist", done: Boolean(submissionChecklist.length) },
    ];

    const completed = checks.filter((check) => check.done).length;
    return {
        checks,
        completed,
        total: checks.length,
        percent: Math.round((completed / checks.length) * 100),
        readyToPublish: completed >= 4,
    };
}

export function getApplicationStatusCopy(status: ApplicationStatus) {
    switch (status) {
        case "applied":
            return { label: "Under review", tone: "badge-applied", note: "Your audition is in the first review round." };
        case "shortlisted":
            return { label: "Shortlisted", tone: "badge-shortlisted", note: "The casting team wants to keep you in the running." };
        case "selected":
            return { label: "Selected", tone: "badge-selected", note: "You have been chosen for the next step or the role." };
        case "rejected":
            return { label: "Not moving forward", tone: "badge-rejected", note: "This role was not the right fit. Your profile remains protected." };
        default:
            return { label: status, tone: "badge-neutral", note: "" };
    }
}

export function computeActorFit(
    actorProfile: Partial<ActorProfile> | null | undefined,
    call: Partial<CastingCall> | null | undefined
) {
    const requirements = (call?.requirements || {}) as {
        age_range?: { min: number; max: number };
        gender?: string[];
        languages?: string[];
        location?: string;
    };

    let score = 40;
    const reasons: string[] = [];

    if (actorProfile?.age && requirements.age_range) {
        const withinRange =
            actorProfile.age >= requirements.age_range.min &&
            actorProfile.age <= requirements.age_range.max;
        if (withinRange) {
            score += 20;
            reasons.push("Age fits the requested range");
        }
    }

    if (actorProfile?.languages?.length && requirements.languages?.length) {
        const overlap = actorProfile.languages.filter((language) =>
            requirements.languages?.some((required) => required.toLowerCase() === language.toLowerCase())
        );
        if (overlap.length) {
            score += 20;
            reasons.push(`Speaks ${overlap.join(", ")}`);
        }
    }

    if (actorProfile?.location && requirements.location) {
        if (actorProfile.location.toLowerCase().includes(requirements.location.toLowerCase())) {
            score += 10;
            reasons.push("Location aligns with the shoot region");
        }
    }

    if (actorProfile?.bio) {
        score += 10;
        reasons.push("Profile is detailed enough for review");
    }

    return {
        score: Math.min(score, 95),
        reasons: reasons.slice(0, 3),
    };
}

export function getTrustSummary(castingProfile: Partial<CastingProfile> | null | undefined) {
    const cues = [
        castingProfile?.verified ? "Verified company identity" : "Verification pending",
        castingProfile?.website ? "Public company link available" : "Public company link missing",
        castingProfile?.description ? "Role context is documented" : "Add company context to build trust",
    ];

    return {
        verified: Boolean(castingProfile?.verified),
        cues,
    };
}
