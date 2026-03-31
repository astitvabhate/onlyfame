import { getApplicationStatusCopy } from "@/lib/workflows";
import type { ApplicationStatus } from "@/types";

interface StatusBadgeProps {
    status: ApplicationStatus;
}

export function StatusBadge({ status }: StatusBadgeProps) {
    const copy = getApplicationStatusCopy(status);

    return <span className={`badge ${copy.tone}`}>{copy.label}</span>;
}
