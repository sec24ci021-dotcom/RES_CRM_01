import React, { useEffect, useState } from 'react'
import { getActivityStats, getLeadStats, getLeads } from '../api/leadService'

export default function Dashboard() {
    const [stats, setStats] = useState(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(null)

    useEffect(() => {
        let mounted = true
        const fetchStats = async () => {
            try {
                const [leadRes, activityRes] = await Promise.all([getLeadStats(), getActivityStats()])

                // leadRes.data.data is an object (or null) from lead statistics
                const leadData = leadRes?.data?.data || {}

                // activityRes.data.data is expected to be an array of { _id: type, count }
                const activityData = activityRes?.data?.data || []

                const openActivities = (() => {
                    // prefer explicit FOLLOW_UP counts, otherwise sum all activity counts
                    const followUp = activityData.find(a => a._id === 'FOLLOW_UP' || a._id === 'FOLLOW_UPS')
                    if (followUp) return followUp.count || 0
                    return activityData.reduce((s, it) => s + (it.count || 0), 0)
                })()

                let conversions = leadData.convertedLeads ?? leadData.converted ?? 0

                // If backend didn't report conversions, compute from recent leads as a fallback
                if (!conversions) {
                    try {
                        const leadsRes = await getLeads(1, 100)
                        const leadsList = leadsRes.data.data || []
                        conversions = leadsList.reduce((s, l) => {
                            const conv = l.status === 'CONVERTED' || l.conversionStatus === 'CONVERTED' || (l.conversionValue || l.convertedValue || 0) > 0 || !!l.convertedAt
                            return s + (conv ? 1 : 0)
                        }, 0)
                    } catch (e) {
                        // ignore fallback errors
                    }
                }

                const computed = {
                    leadsCount: leadData.totalLeads ?? leadData.total ?? 0,
                    openActivities,
                    conversions
                }

                if (mounted) setStats(computed)
            } catch (err) {
                if (mounted) {
                    setError(err.message || 'Failed to load statistics')
                }
            } finally {
                if (mounted) {
                    setLoading(false)
                }
            }
        }

        fetchStats()
        return () => (mounted = false)
    }, [])

    return (
        <div>
            <h1 className="text-2xl font-bold mb-4">Dashboard</h1>

            {error && <div className="mb-4 p-3 bg-red-100 text-red-700 rounded">{error}</div>}

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-white p-6 rounded shadow">
                    <div className="text-gray-600 text-sm font-medium">Total Leads</div>
                    <div className="text-3xl font-bold mt-2">{loading ? '—' : stats?.leadsCount ?? '—'}</div>
                </div>

                <div className="bg-white p-6 rounded shadow">
                    <div className="text-gray-600 text-sm font-medium">Open Activities</div>
                    <div className="text-3xl font-bold mt-2">{loading ? '—' : stats?.openActivities ?? '—'}</div>
                </div>

                <div className="bg-white p-6 rounded shadow">
                    <div className="text-gray-600 text-sm font-medium">Conversions</div>
                    <div className="text-3xl font-bold mt-2">{loading ? '—' : stats?.conversions ?? '—'}</div>
                </div>
            </div>

            {loading && <div className="mt-4 text-center text-gray-500">Loading statistics...</div>}
        </div>
    )
}
