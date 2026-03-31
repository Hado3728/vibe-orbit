'use client'

import { useState } from 'react'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import {
    AlertTriangle,
    MessageCircle,
    UserX,
    CheckCircle2,
    Clock,
    Search,
    ShieldAlert,
    Send
} from 'lucide-react'
import { cn } from '@/lib/utils'
import {
    updateReportStatus,
    createAdminMessage,
    banUser
} from '@/app/(app)/admin/actions'

interface Report {
    id: string
    reporter_id: string
    reported_user_id: string
    reason: string
    description: string
    status: 'pending' | 'investigating' | 'resolved'
    timestamp: string
    reporter: { username: string }
    reported: { username: string }
}

interface ReportsDashboardProps {
    initialReports: Report[]
    currentAdminId: string
}

export default function ReportsDashboard({ initialReports, currentAdminId }: ReportsDashboardProps) {
    const [reports, setReports] = useState<Report[]>(initialReports)
    const [selectedReport, setSelectedReport] = useState<Report | null>(null)
    const [message, setMessage] = useState('')
    const [sending, setSending] = useState(false)

    const handleSelectReport = (report: Report) => {
        setSelectedReport(report)
        // Set to investigating if currently pending
        if (report.status === 'pending') {
            updateStatus(report.id, 'investigating')
        }
    }

    const updateStatus = async (reportId: string, status: 'pending' | 'investigating' | 'resolved') => {
        const success = await updateReportStatus(reportId, status)
        if (success) {
            setReports(prev => prev.map(r => r.id === reportId ? { ...r, status } : r))
            if (selectedReport?.id === reportId) {
                setSelectedReport(prev => prev ? { ...prev, status } : null)
            }
        }
    }

    const handleSendMessage = async (recipientId: string) => {
        if (!message.trim() || !selectedReport) return
        setSending(true)
        const success = await createAdminMessage(selectedReport.id, currentAdminId, recipientId, message)
        if (success) {
            setMessage('')
            alert('Message sent successfully')
        }
        setSending(false)
    }

    const handleBan = async (userId: string) => {
        if (confirm('Are you sure you want to ban this user? This will delete their public profile.')) {
            await banUser(userId)
            alert('User banned.')
        }
    }

    return (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            {/* Reports List */}
            <div className={cn("lg:col-span-12", selectedReport && "lg:col-span-5")}>
                <Card className="bg-slate-950 border-slate-800 shadow-sm">
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-xl font-bold flex items-center gap-2">
                            <ShieldAlert className="h-5 w-5 text-red-500" />
                            Active Reports
                        </CardTitle>
                        <span className="bg-red-500/10 text-red-500 text-xs px-2 py-1 rounded-full border border-red-500/20 font-bold">
                            {reports.filter(r => r.status !== 'resolved').length} Pending
                        </span>
                    </CardHeader>
                    <CardContent className="p-0">
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm text-left">
                                <thead className="bg-white/5 text-gray-400 uppercase text-[10px] tracking-widest font-bold">
                                    <tr>
                                        <th className="px-4 py-3">Date</th>
                                        <th className="px-4 py-3">Reporter</th>
                                        <th className="px-4 py-3">Reported</th>
                                        <th className="px-4 py-3">Reason</th>
                                        <th className="px-4 py-3 text-right">Action</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-white/5">
                                    {reports.map((report) => (
                                        <tr
                                            key={report.id}
                                            className={cn(
                                                "hover:bg-white/5 transition-colors cursor-pointer border-l-2",
                                                report.status === 'pending' ? "border-l-red-500" :
                                                    report.status === 'investigating' ? "border-l-yellow-500" : "border-l-transparent",
                                                selectedReport?.id === report.id && "bg-indigo-500/10"
                                            )}
                                            onClick={() => handleSelectReport(report)}
                                        >
                                            <td className="px-4 py-4 text-gray-500 whitespace-nowrap">
                                                {new Date(report.timestamp).toLocaleDateString()}
                                            </td>
                                            <td className="px-4 py-4 font-medium text-gray-300">
                                                @{report.reporter?.username || 'user'}
                                            </td>
                                            <td className="px-4 py-4 text-red-400 font-bold">
                                                @{report.reported?.username || 'user'}
                                            </td>
                                            <td className="px-4 py-4 truncate max-w-[150px]">
                                                <span className="bg-gray-800 px-2 py-0.5 rounded text-[10px] text-gray-400 border border-gray-700">
                                                    {report.reason}
                                                </span>
                                            </td>
                                            <td className="px-4 py-4 text-right">
                                                <Button size="sm" variant="ghost" className="h-7 text-[10px] uppercase font-bold tracking-tighter">
                                                    Review
                                                </Button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Investigation Portal */}
            {selectedReport && (
                <div className="lg:col-span-7 animate-in slide-in-from-right-4 duration-300">
                    <Card className="bg-slate-900 border-indigo-500/30 shadow-2xl shadow-indigo-500/10 overflow-hidden sticky top-24">
                        <CardHeader className="bg-indigo-500/10 border-b border-indigo-500/20 py-4">
                            <div className="flex justify-between items-center">
                                <div>
                                    <p className="text-[10px] font-bold text-indigo-400 uppercase tracking-widest mb-1">Investigation Portal</p>
                                    <CardTitle className="text-lg font-bold">Case #{selectedReport.id.slice(0, 8)}</CardTitle>
                                </div>
                                <div className="flex gap-2">
                                    <Button
                                        size="sm"
                                        variant="outline"
                                        className="h-8 bg-green-500/10 text-green-500 border-green-500/30 hover:bg-green-500/20"
                                        onClick={() => updateStatus(selectedReport.id, 'resolved')}
                                    >
                                        <CheckCircle2 className="h-4 w-4 mr-1" /> Resolve
                                    </Button>
                                    <Button size="sm" variant="ghost" onClick={() => setSelectedReport(null)}>✕</Button>
                                </div>
                            </div>
                        </CardHeader>
                        <CardContent className="p-0 flex flex-col h-[600px]">
                            {/* Tabs/Split view */}
                            <div className="flex-1 overflow-y-auto p-6 space-y-8 scrollbar-thin">
                                {/* Details Section */}
                                <section className="space-y-4">
                                    <h3 className="text-xs font-bold text-gray-500 uppercase tracking-widest border-b border-white/5 pb-2">Full Details</h3>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="p-3 bg-white/5 rounded-lg border border-white/5">
                                            <p className="text-[10px] text-gray-500 mb-1">Reporter</p>
                                            <p className="text-sm font-bold">@{selectedReport.reporter?.username}</p>
                                        </div>
                                        <div className="p-3 bg-red-500/5 rounded-lg border border-red-500/10">
                                            <p className="text-[10px] text-red-500/50 mb-1">Reported User</p>
                                            <p className="text-sm font-bold text-red-500">@{selectedReport.reported?.username}</p>
                                        </div>
                                    </div>
                                    <div className="p-4 bg-white/5 rounded-lg border border-white/5 space-y-2">
                                        <div className="flex items-center gap-2">
                                            <AlertTriangle className="h-4 w-4 text-orange-500" />
                                            <span className="text-sm font-bold text-orange-500">{selectedReport.reason}</span>
                                        </div>
                                        <p className="text-sm text-gray-400 leading-relaxed italic">
                                            "{selectedReport.description || 'No description provided.'}"
                                        </p>
                                    </div>
                                </section>

                                {/* Communication Hub */}
                                <section className="space-y-4 flex-1">
                                    <h3 className="text-xs font-bold text-gray-500 uppercase tracking-widest border-b border-white/5 pb-2">Comms Hub</h3>

                                    <div className="space-y-4">
                                        <div className="flex flex-col gap-2">
                                            <p className="text-[10px] text-gray-500 font-bold uppercase">Send Message to Reporter</p>
                                            <div className="flex gap-2">
                                                <input
                                                    type="text"
                                                    value={message}
                                                    onChange={(e) => setMessage(e.target.value)}
                                                    placeholder="Message user for more context..."
                                                    className="flex-1 bg-black border border-white/10 rounded-lg px-3 py-2 text-sm focus:border-indigo-500 outline-none transition-all"
                                                />
                                                <Button
                                                    size="icon"
                                                    className="bg-indigo-600 hover:bg-indigo-700 flex-shrink-0"
                                                    onClick={() => handleSendMessage(selectedReport.reporter_id)}
                                                    disabled={sending}
                                                >
                                                    <Send className="h-4 w-4" />
                                                </Button>
                                            </div>
                                        </div>
                                    </div>
                                </section>
                            </div>

                            {/* Footer Actions */}
                            <div className="p-4 bg-black/50 border-t border-white/10 grid grid-cols-2 gap-3">
                                <Button
                                    variant="outline"
                                    className="border-red-500/50 text-red-500 hover:bg-red-500/10 font-bold"
                                    onClick={() => handleBan(selectedReport.reported_user_id)}
                                >
                                    <UserX className="h-4 w-4 mr-2" /> Ban User
                                </Button>
                                <Button
                                    variant="outline"
                                    className="border-orange-500/50 text-orange-500 hover:bg-orange-500/10 font-bold"
                                    onClick={() => updateStatus(selectedReport.id, 'resolved')}
                                >
                                    Dismiss Report
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            )}
        </div>
    )
}
