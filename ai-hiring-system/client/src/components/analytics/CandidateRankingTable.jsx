const CandidateRankingTable = ({ candidates }) => {
    if (!candidates?.length) {
        return <p className="text-sm text-slate-500">No ranked candidates yet.</p>;
    }

    return (
        <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
                <thead>
                    <tr className="border-b border-slate-200 text-slate-500">
                        <th className="py-2 pr-4">Candidate</th>
                        <th className="py-2 pr-4">Job</th>
                        <th className="py-2 pr-4">Score</th>
                        <th className="py-2">Action</th>
                    </tr>
                </thead>
                <tbody>
                    {candidates.map((row) => (
                        <tr key={row.application_id} className="border-b border-slate-100">
                            <td className="py-2 pr-4 font-semibold text-slate-800">{row.candidate_email}</td>
                            <td className="py-2 pr-4 text-slate-600">{row.job_title}</td>
                            <td className="py-2 pr-4">
                                <span className="rounded bg-indigo-50 px-2 py-1 font-bold text-indigo-700">{row.match_score}%</span>
                            </td>
                            <td className="py-2 text-xs uppercase tracking-wide text-slate-500">{row.status}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};

export default CandidateRankingTable;
