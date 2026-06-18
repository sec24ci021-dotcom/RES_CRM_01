import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { getLeads } from '../api/leadService'

export default function LeadList() {
    const [leads, setLeads] = useState([])
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState(null)
    const [page, setPage] = useState(1)
    const [pagination, setPagination] = useState(null)

    useEffect(() => {
        const fetchLeads = async () => {
            setLoading(true)
            setError(null)
            try {
                const res = await getLeads(page, 10)
                setLeads(res.data.data || [])
                setPagination(res.data.pagination)
            } catch (err) {
                setError(err.message || 'Failed to load leads')
                setLeads([])
            } finally {
                setLoading(false)
            }
        }
        fetchLeads()
    }, [page])

    const handleNextPage = () => {
        if (pagination && page < pagination.pages) {
            setPage(page + 1)
        }
    }

    const handlePreviousPage = () => {
        if (page > 1) {
            setPage(page - 1)
        }
    }

    return (
        <div>
            <div className="flex justify-between items-center mb-4">
                <h1 className="text-xl font-bold">Leads</h1>
                <Link to="/leads/create" className="bg-blue-600 text-white px-3 py-1 rounded hover:bg-blue-700">New Lead</Link>
            </div>

            {error && <div className="mb-4 p-3 bg-red-100 text-red-700 rounded">{error}</div>}

            <div className="grid gap-3">
                {loading && <div className="p-4 bg-white rounded shadow text-center">Loading...</div>}
                {!loading && leads.length === 0 && <div className="p-4 bg-white rounded shadow text-gray-500">No leads found</div>}
                {leads.map((l) => (
                    <div key={l._id} className="p-4 bg-white rounded shadow flex justify-between items-center">
                        <div>
                            <div className="font-semibold">{l.firstName} {l.lastName || l.name}</div>
                            <div className="text-sm text-gray-600">{l.email} • {l.phone}</div>
                            <div className="text-xs text-gray-500">Status: {l.status} • Source: {l.source}</div>
                        </div>
                        <div className="flex gap-2">
                            <Link to={`/leads/${l._id}`} className="text-blue-600 hover:text-blue-800">View</Link>
                            <Link to={`/leads/${l._id}/edit`} className="text-green-600 hover:text-green-800">Edit</Link>
                        </div>
                    </div>
                ))}
            </div>

            {pagination && !loading && (
                <div className="mt-4 flex justify-between items-center">
                    <div className="text-sm text-gray-600">
                        Page {pagination.page} of {pagination.pages} (Total: {pagination.total})
                    </div>
                    <div className="flex gap-2">
                        <button
                            onClick={handlePreviousPage}
                            disabled={page === 1}
                            className="px-3 py-1 bg-gray-300 rounded hover:bg-gray-400 disabled:bg-gray-100"
                        >
                            Previous
                        </button>
                        <button
                            onClick={handleNextPage}
                            disabled={page >= pagination.pages}
                            className="px-3 py-1 bg-gray-300 rounded hover:bg-gray-400 disabled:bg-gray-100"
                        >
                            Next
                        </button>
                    </div>
                </div>
            )}
        </div>
    )
}
