import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import { filterLeads } from '../api/leadService'

export default function FilterLeads() {
    const [filters, setFilters] = useState({ status: '', source: '', priority: '', page: 1, limit: 10 })
    const [results, setResults] = useState([])
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState(null)

    const apply = async (e) => {
        e.preventDefault()
        setLoading(true)
        setError(null)

        try {
            // Only include filters with values
            const queryFilters = {}
            if (filters.status) queryFilters.status = filters.status
            if (filters.source) queryFilters.source = filters.source
            if (filters.priority) queryFilters.priority = filters.priority
            queryFilters.page = filters.page
            queryFilters.limit = filters.limit

            const res = await filterLeads(queryFilters)
            setResults(res.data.data || [])
        } catch (err) {
            setError(err.message || 'Failed to filter leads')
            setResults([])
        } finally {
            setLoading(false)
        }
    }

    const handleReset = () => {
        setFilters({ status: '', source: '', priority: '', page: 1, limit: 10 })
        setResults([])
        setError(null)
    }

    return (
        <div>
            <h1 className="text-xl font-bold mb-4">Filter Leads</h1>

            <form onSubmit={apply} className="mb-4 bg-gray-50 p-4 rounded">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                    <select
                        value={filters.status}
                        onChange={(e) => setFilters({ ...filters, status: e.target.value })}
                        className="border p-2 rounded"
                    >
                        <option value="">Select Status</option>
                        <option value="NEW_LEAD">New Lead</option>
                        <option value="ATTEMPTED_CALL">Attempted Call</option>
                        <option value="CONTACTED">Contacted</option>
                        <option value="CONNECTED">Connected</option>
                        <option value="INTERESTED">Interested</option>
                        <option value="SITE_VISIT_SCHEDULED">Site Visit Scheduled</option>
                        <option value="SITE_VISIT_COMPLETED">Site Visit Completed</option>
                        <option value="QUALIFIED">Qualified</option>
                        <option value="IN_NEGOTIATION">In Negotiation</option>
                        <option value="BOOKED">Booked</option>
                        <option value="CONVERTED">Converted</option>
                        <option value="SOLD">Sold</option>
                        <option value="LOST">Lost</option>
                        <option value="INACTIVE">Inactive</option>
                    </select>

                    <select
                        value={filters.source}
                        onChange={(e) => setFilters({ ...filters, source: e.target.value })}
                        className="border p-2 rounded"
                    >
                        <option value="">Select Source</option>
                        <option value="WEBSITE">Website</option>
                        <option value="FACEBOOK">Facebook</option>
                        <option value="GOOGLE_ADS">Google Ads</option>
                        <option value="REFERRAL">Referral</option>
                        <option value="WALK_IN">Walk In</option>
                        <option value="CALL">Call</option>
                        <option value="EMAIL">Email</option>
                    </select>

                    <select
                        value={filters.priority}
                        onChange={(e) => setFilters({ ...filters, priority: e.target.value })}
                        className="border p-2 rounded"
                    >
                        <option value="">Select Priority</option>
                        <option value="LOW">Low</option>
                        <option value="MEDIUM">Medium</option>
                        <option value="HIGH">High</option>
                        <option value="CRITICAL">Critical</option>
                    </select>
                </div>

                <div className="flex gap-2">
                    <button type="submit" disabled={loading} className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 disabled:bg-gray-400">
                        {loading ? 'Filtering...' : 'Apply Filters'}
                    </button>
                    <button type="button" onClick={handleReset} className="bg-gray-400 text-white px-4 py-2 rounded hover:bg-gray-500">
                        Reset
                    </button>
                </div>
            </form>

            {error && <div className="mb-4 p-3 bg-red-100 text-red-700 rounded">{error}</div>}

            <div className="grid gap-3">
                {results.length === 0 && !loading && !error && <div className="p-4 bg-white rounded shadow text-gray-500">No results. Try applying filters.</div>}
                {results.map(r => (
                    <div key={r._id} className="p-4 bg-white rounded shadow flex justify-between items-center">
                        <div>
                            <div className="font-semibold">{r.firstName} {r.lastName}</div>
                            <div className="text-sm text-gray-600">{r.email} • {r.phone}</div>
                            <div className="text-sm text-gray-500">Status: {r.status} • Priority: {r.priority}</div>
                        </div>
                        <Link to={`/leads/${r._id}`} className="text-blue-600 hover:text-blue-800">View</Link>
                    </div>
                ))}
            </div>
        </div>
    )
}
