import { useState, useEffect } from "react"
import { useNavigate, Link } from "react-router-dom"
import { DashboardLayout } from "@/components/layout/DashboardLayout"
import { Button } from "@/components/ui/Button"
import { motion } from "framer-motion"
import {
    Plus, Eye, Loader2, Search, Briefcase, Clock, ArrowRight,
    MoreHorizontal, Trash2, Edit3, PauseCircle
} from "lucide-react"
import { JobAPI, type Job } from "@/lib/api"
import { cn } from "@/lib/utils"

type FilterType = 'all' | 'open' | 'active' | 'closed'

export function ManageJobs() {
    const navigate = useNavigate()
    const [jobs, setJobs] = useState<Job[]>([])
    const [isLoading, setIsLoading] = useState(true)
    const [filter, setFilter] = useState<FilterType>('all')
    const [searchQuery, setSearchQuery] = useState('')
    const [openMenu, setOpenMenu] = useState<string | null>(null)

    useEffect(() => {
        loadJobs()
    }, [])

    const loadJobs = async () => {
        try {
            const data = await JobAPI.getMyJobs()
            setJobs(data)
        } catch (error) {
            console.error("Failed to load jobs", error)
        } finally {
            setIsLoading(false)
        }
    }

    const filteredJobs = jobs
        .filter(job => {
            if (filter === 'all') return true
            if (filter === 'active') return job.status === 'in_progress'
            if (filter === 'closed') return job.status === 'closed' || job.status === 'completed'
            return job.status === filter
        })
        .filter(job => {
            if (!searchQuery) return true
            return job.title.toLowerCase().includes(searchQuery.toLowerCase())
        })

    const getStatusCounts = () => ({
        all: jobs.length,
        open: jobs.filter(j => j.status === 'open').length,
        active: jobs.filter(j => j.status === 'in_progress').length,
        closed: jobs.filter(j => j.status === 'closed' || j.status === 'completed').length,
    })

    const counts = getStatusCounts()

    return (
        <DashboardLayout role="client">
            <div className="space-y-6">
                {/* Header */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex flex-col sm:flex-row sm:items-end justify-between gap-4"
                >
                    <div>
                        <h1 className="text-3xl font-bold text-white mb-1">My Jobs</h1>
                        <p className="text-zinc-400">Manage your job postings and review proposals</p>
                    </div>
                    <Link to="/client/post-job">
                        <Button className="h-11 px-5 rounded-xl bg-white text-black hover:bg-zinc-100 font-semibold">
                            <Plus className="w-4 h-4 mr-2" />
                            Post Job
                        </Button>
                    </Link>
                </motion.div>

                {/* Filters & Search */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.05 }}
                    className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4"
                >
                    {/* Filter Tabs */}
                    <div className="flex items-center gap-1 p-1 bg-white/[0.02] rounded-xl border border-white/[0.06]">
                        {(['all', 'open', 'active', 'closed'] as FilterType[]).map((f) => (
                            <button
                                key={f}
                                onClick={() => setFilter(f)}
                                className={cn(
                                    "px-4 py-2 rounded-lg text-sm font-medium transition-all capitalize",
                                    filter === f
                                        ? "bg-white/10 text-white"
                                        : "text-zinc-500 hover:text-zinc-300"
                                )}
                            >
                                {f}
                                <span className="ml-1.5 text-xs text-zinc-600">
                                    ({counts[f]})
                                </span>
                            </button>
                        ))}
                    </div>

                    {/* Search */}
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
                        <input
                            type="text"
                            placeholder="Search jobs..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full sm:w-64 h-10 bg-white/[0.02] border border-white/[0.06] rounded-xl pl-10 pr-4 text-sm text-white placeholder:text-zinc-600 focus:outline-none focus:border-white/20 transition-colors"
                        />
                    </div>
                </motion.div>

                {/* Jobs List */}
                {isLoading ? (
                    <div className="flex justify-center py-20">
                        <Loader2 className="w-6 h-6 text-zinc-500 animate-spin" />
                    </div>
                ) : filteredJobs.length === 0 ? (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 }}
                        className="text-center py-16 rounded-2xl bg-white/[0.02] border border-white/[0.06]"
                    >
                        <div className="w-14 h-14 rounded-2xl bg-white/[0.04] flex items-center justify-center mx-auto mb-4">
                            <Briefcase className="w-6 h-6 text-zinc-500" />
                        </div>
                        <h3 className="text-lg font-semibold text-white mb-2">
                            {searchQuery ? 'No jobs found' : filter === 'all' ? 'No jobs yet' : `No ${filter} jobs`}
                        </h3>
                        <p className="text-sm text-zinc-500 mb-6 max-w-sm mx-auto">
                            {searchQuery
                                ? 'Try a different search term'
                                : filter === 'all'
                                ? 'Create your first job posting to start hiring talent'
                                : `You don't have any ${filter} jobs at the moment`}
                        </p>
                        {filter === 'all' && !searchQuery && (
                            <Link to="/client/post-job">
                                <Button className="h-10 px-5 rounded-xl bg-white text-black hover:bg-zinc-100 font-semibold">
                                    Create Job
                                </Button>
                            </Link>
                        )}
                    </motion.div>
                ) : (
                    <div className="space-y-3">
                        {filteredJobs.map((job, i) => (
                            <motion.div
                                key={job.id}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.1 + i * 0.03 }}
                                className="group relative rounded-2xl bg-white/[0.02] border border-white/[0.06] hover:bg-white/[0.04] hover:border-white/[0.1] transition-all"
                            >
                                <div className="p-5 flex items-center gap-5">
                                    {/* Job Avatar */}
                                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-indigo-500/20 to-purple-500/20 flex items-center justify-center shrink-0 border border-white/[0.08]">
                                        <span className="text-lg font-bold text-white/70">
                                            {job.title.charAt(0)}
                                        </span>
                                    </div>

                                    {/* Job Info */}
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-3 mb-1">
                                            <span className={cn(
                                                "px-2 py-0.5 rounded text-[10px] font-semibold uppercase tracking-wider",
                                                job.status === 'open' ? "bg-indigo-500/20 text-indigo-400" :
                                                job.status === 'in_progress' ? "bg-blue-500/20 text-blue-400" :
                                                "bg-zinc-500/20 text-zinc-400"
                                            )}>
                                                {job.status === 'in_progress' ? 'In Progress' : job.status}
                                            </span>
                                        </div>
                                        <h3 className="font-semibold text-white truncate group-hover:text-indigo-400 transition-colors">
                                            {job.title}
                                        </h3>
                                        <div className="flex items-center gap-3 text-sm text-zinc-500 mt-1">
                                            <span>{job.budget_type === 'fixed' ? 'Fixed Price' : 'Hourly'}</span>
                                            <span className="text-indigo-400 font-medium">◎ {job.budget}</span>
                                            <span className="flex items-center gap-1">
                                                <Clock className="w-3 h-3" />
                                                {new Date(job.created_at).toLocaleDateString()}
                                            </span>
                                        </div>
                                    </div>

                                    {/* Proposals Count */}
                                    <div className="text-center px-5 border-l border-white/[0.06] hidden sm:block">
                                        <div className="text-2xl font-bold text-white">{job.proposal_count || 0}</div>
                                        <div className="text-xs text-zinc-500 uppercase tracking-wider">Proposals</div>
                                    </div>

                                    {/* Actions */}
                                    <div className="flex items-center gap-2">
                                        <Button
                                            variant="outline"
                                            onClick={() => navigate(`/client/jobs/${job.id}/proposals`)}
                                            className="h-9 px-4 rounded-lg border-white/10 text-zinc-300 hover:text-white hover:bg-white/5 text-sm"
                                        >
                                            <Eye className="w-4 h-4 mr-2" />
                                            View Proposals
                                        </Button>

                                        {/* More Menu */}
                                        <div className="relative">
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                onClick={() => setOpenMenu(openMenu === job.id ? null : job.id)}
                                                className="h-9 w-9 rounded-lg text-zinc-500 hover:text-white hover:bg-white/5"
                                            >
                                                <MoreHorizontal className="w-4 h-4" />
                                            </Button>

                                            {openMenu === job.id && (
                                                <>
                                                    <div
                                                        className="fixed inset-0 z-10"
                                                        onClick={() => setOpenMenu(null)}
                                                    />
                                                    <div className="absolute right-0 top-full mt-1 w-40 bg-[#0a0a0c] border border-white/10 rounded-xl py-1 z-20 shadow-xl">
                                                        <button className="w-full px-3 py-2 text-sm text-left text-zinc-300 hover:bg-white/5 flex items-center gap-2">
                                                            <Edit3 className="w-4 h-4" />
                                                            Edit Job
                                                        </button>
                                                        <button className="w-full px-3 py-2 text-sm text-left text-zinc-300 hover:bg-white/5 flex items-center gap-2">
                                                            <PauseCircle className="w-4 h-4" />
                                                            Close Job
                                                        </button>
                                                        <button className="w-full px-3 py-2 text-sm text-left text-red-400 hover:bg-red-500/10 flex items-center gap-2">
                                                            <Trash2 className="w-4 h-4" />
                                                            Delete
                                                        </button>
                                                    </div>
                                                </>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                {/* Hover Arrow */}
                                <div className="absolute right-16 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                                    <ArrowRight className="w-5 h-5 text-zinc-600" />
                                </div>
                            </motion.div>
                        ))}
                    </div>
                )}
            </div>
        </DashboardLayout>
    )
}
