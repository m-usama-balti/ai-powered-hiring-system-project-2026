const KpiCard = ({ label, value, tone = 'indigo' }) => {
    const toneClass =
        tone === 'emerald'
            ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
            : tone === 'amber'
                ? 'bg-amber-50 text-amber-700 border-amber-200'
                : 'bg-indigo-50 text-indigo-700 border-indigo-200';

    return (
        <div className={`rounded-xl border p-4 ${toneClass}`}>
            <p className="text-xs font-bold uppercase tracking-wide">{label}</p>
            <p className="mt-2 text-3xl font-black">{value}</p>
        </div>
    );
};

export default KpiCard;
