import { createClient } from '@/lib/supabase/server'
import { dismissReport, openInvestigation } from '@/app/admin/actions'
import { Button } from '@/components/ui/Button'

export default async function AdminReportsPage() {
    const supabase = await createClient()

    // Fetch reports where status = 'pending'. Join users for reporter and reported_user details.
    const { data: reports, error } = await supabase
        .from('reports')
        .select(`
            id,
            reported_id,
            reason,
            note,
            timestamp,
            reporter:users!reporter_id(username),
            suspect:users!reported_id(username)
        `)
        .eq('status', 'pending')

    if (error) {
        return <div className="p-8 text-rose-500 font-bold bg-rose-500/10 rounded-xl">Error fetching reports: {error.message}</div>
    }

    return (
        <div className="min-h-screen bg-slate-950 p-8 text-slate-100">
            <h1 className="text-4xl font-extrabold mb-2 tracking-tight">Report Feed</h1>
            <p className="text-slate-400 mb-8 max-w-2xl">Manage community safety. Review reports, assess the context, and take necessary actions to maintain the orbit's frequency.</p>
            
            <div className="grid gap-6 max-w-4xl">
                {!reports || reports.length === 0 ? (
                    <div className="p-12 text-center bg-slate-950 rounded-3xl border border-slate-800">
                        <p className="text-slate-500 text-lg">Inbox zero! No pending reports active.</p>
                    </div>
                ) : (
                    reports.map((report: any) => (
                        <div key={report.id} className="bg-slate-950 border border-slate-800 p-6 rounded-3xl shadow-sm flex flex-col gap-5 transition-all hover:border-slate-700">
                            <div className="flex justify-between items-start">
                                <div>
                                    <h3 className="text-2xl font-bold text-rose-400">{report.reason}</h3>
                                    <p className="text-sm text-slate-400 mt-1">
                                        Reported by <span className="text-indigo-400 font-semibold">{report.reporter?.username || 'Unknown'}</span> 
                                        {' '} against <span className="text-rose-400 font-semibold">{report.suspect?.username || 'Unknown'}</span>
                                    </p>
                                </div>
                                <span className="text-xs font-mono text-slate-600 bg-slate-950 px-3 py-1 rounded-full">
                                    {new Date(report.timestamp).toLocaleString()}
                                </span>
                            </div>
                            
                            {report.note && (
                                <div className="bg-slate-950/50 p-4 rounded-2xl text-sm italic text-slate-300 border border-slate-800/50">
                                    "{report.note}"
                                </div>
                            )}

                            <div className="flex gap-4 pt-2">
                                <form action={dismissReport.bind(null, report.id)}>
                                    <Button variant="outline" className="border-slate-700 bg-transparent hover:bg-slate-800 text-slate-300 rounded-xl h-11 px-6">
                                        Dismiss Report
                                    </Button>
                                </form>
                                <form action={openInvestigation.bind(null, report.id, report.reported_id)}>
                                    <Button className="bg-rose-600 hover:bg-rose-700 text-white shadow-lg shadow-rose-600/20 rounded-xl h-11 px-6 font-semibold transition-all">
                                        Open Investigation
                                    </Button>
                                </form>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    )
}
