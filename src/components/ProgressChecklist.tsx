interface ProgressChecklistProps {
    title: string;
    percent: number;
    items: { label: string; done: boolean }[];
    note?: string;
}

export function ProgressChecklist({
    title,
    percent,
    items,
    note,
}: ProgressChecklistProps) {
    return (
        <div className="card">
            <div className="flex items-start justify-between gap-4">
                <div>
                    <p className="section-label">Readiness</p>
                    <h2 className="panel-title mt-2">{title}</h2>
                    {note ? <p className="subtle-copy mt-2 text-sm">{note}</p> : null}
                </div>
                <div className="text-right">
                    <p className="text-3xl font-semibold">{percent}%</p>
                    <p className="subtle-copy text-xs uppercase tracking-[0.18em]">Complete</p>
                </div>
            </div>

            <div className="mt-5 h-2 overflow-hidden rounded-full bg-white/8">
                <div
                    className="h-full rounded-full bg-[linear-gradient(90deg,#e0af56_0%,#7ba58d_100%)]"
                    style={{ width: `${percent}%` }}
                />
            </div>

            <div className="mt-5 space-y-3">
                {items.map((item) => (
                    <div
                        key={item.label}
                        className="flex items-center justify-between gap-3 rounded-2xl border border-white/6 bg-white/3 px-4 py-3"
                    >
                        <span className="text-sm text-[var(--text)]">{item.label}</span>
                        <span className={`badge ${item.done ? "badge-success" : "badge-neutral"}`}>
                            {item.done ? "Done" : "Needs work"}
                        </span>
                    </div>
                ))}
            </div>
        </div>
    );
}
