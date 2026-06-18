import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import { searchLeads } from '../api/leadService'

export default function SearchLeads() {
    const [query, setQuery] = useState('')
    const [results, setResults] = useState([])
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState(null)
    const [searched, setSearched] = useState(false)

    const search = async (e) => {
        e.preventDefault()
        if (!query.trim()) {
            setError('Please enter a search term')
            return
        }

        setLoading(true)
        setError(null)
        setSearched(true)

        try {
            const res = await searchLeads(query, 1, 20)

            // Normalize response shapes from backend (be defensive)
            // Possible shapes: { data: [ ... ] } or { data: { data: [ ... ], pagination: {} } } or direct array
            let payload = []
            if (res && res.data) {
                if (Array.isArray(res.data)) payload = res.data
                else if (Array.isArray(res.data.data)) payload = res.data.data
                else if (Array.isArray(res.data.data?.data)) payload = res.data.data.data
            }

            setResults(payload)
        } catch (err) {
            setError(err.message || 'Search failed')
            setResults([])
        } finally {
            setLoading(false)
        }
    }

    return (
        <div>
            <h1 className="text-xl font-bold mb-4">Search Leads</h1>

            <form onSubmit={search} className="mb-4 flex gap-2">
                <input
                    className="flex-1 border p-2 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder="Search by name, email, or phone..."
                />
                <button
                    type="submit"
                    disabled={loading}
                    className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 disabled:bg-gray-400"
                >
                    {loading ? 'Searching...' : 'Search'}
                </button>
            </form>

            {error && <div className="mb-4 p-3 bg-red-100 text-red-700 rounded">{error}</div>}

            <div className="grid gap-3">
                {searched && loading && <div className="p-4 text-center text-gray-500">Searching...</div>}
                {searched && !loading && results.length === 0 && !error && <div className="p-4 bg-white rounded shadow text-gray-500">No leads found matching "{query}"</div>}
                {Array.isArray(results) && results.map(r => (
                    <div key={r._id} className="p-4 bg-white rounded shadow flex justify-between items-center">
                        <div>
                            <div className="font-semibold">{r.firstName} {r.lastName || r.name}</div>
                            <div className="text-sm text-gray-600">{r.email} • {r.phone}</div>
                            <div className="text-xs text-gray-500">Status: {r.status} • Source: {r.source}</div>
                        </div>
                        <Link to={`/leads/${r._id}`} className="text-blue-600 hover:text-blue-800 px-3 py-1 border border-blue-600 rounded">View</Link>
                    </div>
                ))}
                {!Array.isArray(results) && searched && !loading && <div className="p-4 text-sm text-gray-600">Unexpected response format</div>}
            </div>
        </div>
    )
}
