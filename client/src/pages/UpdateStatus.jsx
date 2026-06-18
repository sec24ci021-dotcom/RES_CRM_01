import React, { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { updateLeadStatus } from '../api/leadService'
import { getLeadById } from '../api/leadService'

export default function UpdateStatus() {
    const { id } = useParams()
    const [status, setStatus] = useState('')
    const [currentStatus, setCurrentStatus] = useState('')
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState(null)
    const navigate = useNavigate()

    const submit = async (e) => {
        e.preventDefault()
        if (!status) {
            setError('Please select a status')
            return
        }

        setLoading(true)
        setError(null)

        try {
            await updateLeadStatus(id, status)
            navigate(`/leads/${id}`)
        } catch (err) {
            // Prefer structured server error message when available
            const serverMsg = err && err.data && (err.data.error?.message || err.data.message || err.data.error?.code)
            setError(serverMsg || err.message || 'Failed to update status')
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        let mounted = true
        const load = async () => {
            try {
                const res = await getLeadById(id)
                if (!mounted) return
                const s = res.data.data.status
                setCurrentStatus(s)
                // default select to current status
                setStatus(s)
            } catch (err) {
                // ignore - keep UI functional
            }
        }
        load()
        return () => { mounted = false }
    }, [id])

    // Client-side allowed transitions mirror server-side rules to avoid sending invalid requests
    const validTransitions = {
        NEW_LEAD: ['ATTEMPTED_CALL', 'CONTACTED', 'CONNECTED', 'INTERESTED', 'BOOKED', 'SITE_VISIT_SCHEDULED', 'LOST', 'INACTIVE'],
        ATTEMPTED_CALL: ['CONNECTED', 'INTERESTED', 'LOST', 'INACTIVE'],
        CONNECTED: ['INTERESTED', 'BOOKED', 'SITE_VISIT_SCHEDULED', 'LOST', 'INACTIVE'],
        INTERESTED: ['SITE_VISIT_SCHEDULED', 'BOOKED', 'IN_NEGOTIATION', 'LOST', 'INACTIVE'],
        SITE_VISIT_SCHEDULED: ['SITE_VISIT_COMPLETED', 'BOOKED', 'IN_NEGOTIATION', 'LOST', 'INACTIVE'],
        SITE_VISIT_COMPLETED: ['IN_NEGOTIATION', 'BOOKED', 'LOST', 'INACTIVE'],
        QUALIFIED: ['IN_NEGOTIATION', 'LOST', 'INACTIVE'],
        IN_NEGOTIATION: ['BOOKED', 'CONVERTED', 'LOST', 'INACTIVE'],
        BOOKED: ['CONVERTED', 'SOLD', 'INACTIVE'],
        CONVERTED: ['SOLD', 'INACTIVE'],
        SOLD: ['INACTIVE'],
        LOST: ['NEW_LEAD', 'INACTIVE'],
        INACTIVE: ['NEW_LEAD', 'CONTACTED']
    }

    const isAllowed = (target) => {
        if (!currentStatus) return true
        const allowed = validTransitions[currentStatus] || []
        return allowed.includes(target)
    }

    return (
        <div>
            <h1 className="text-xl font-bold mb-4">Update Lead Status</h1>
            <form onSubmit={submit} className="bg-white p-6 rounded shadow max-w-md">
                {error && <div className="mb-4 p-2 bg-red-100 text-red-700 rounded">{error}</div>}

                <label className="block mb-4">
                    <span className="text-sm font-medium text-gray-700 block mb-2">Select Status *</span>
                    <select
                        value={status}
                        onChange={e => setStatus(e.target.value)}
                        className="w-full border p-2 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                        required
                    >
                        <option value="">-- Select a status --</option>
                        <option value="NEW_LEAD" disabled={!isAllowed('NEW_LEAD')}>New Lead</option>
                        <option value="ATTEMPTED_CALL" disabled={!isAllowed('ATTEMPTED_CALL')}>Attempted Call</option>
                        <option value="CONTACTED" disabled={!isAllowed('CONTACTED')}>Contacted</option>
                        <option value="CONNECTED" disabled={!isAllowed('CONNECTED')}>Connected</option>
                        <option value="INTERESTED" disabled={!isAllowed('INTERESTED')}>Interested</option>
                        <option value="SITE_VISIT_SCHEDULED" disabled={!isAllowed('SITE_VISIT_SCHEDULED')}>Site Visit Scheduled</option>
                        <option value="SITE_VISIT_COMPLETED" disabled={!isAllowed('SITE_VISIT_COMPLETED')}>Site Visit Completed</option>
                        <option value="QUALIFIED" disabled={!isAllowed('QUALIFIED')}>Qualified</option>
                        <option value="IN_NEGOTIATION" disabled={!isAllowed('IN_NEGOTIATION')}>In Negotiation</option>
                        <option value="BOOKED" disabled={!isAllowed('BOOKED')}>Booked</option>
                        <option value="CONVERTED" disabled={!isAllowed('CONVERTED')}>Converted</option>
                        <option value="SOLD" disabled={!isAllowed('SOLD')}>Sold</option>
                        <option value="LOST" disabled={!isAllowed('LOST')}>Lost</option>
                        <option value="INACTIVE" disabled={!isAllowed('INACTIVE')}>Inactive</option>
                    </select>
                    {currentStatus && <p className="text-xs text-gray-500 mt-2">Current status: {currentStatus.replace('_', ' ')}</p>}
                </label>

                <div className="flex gap-2">
                    <button
                        type="submit"
                        disabled={loading}
                        className="flex-1 bg-yellow-600 text-white px-4 py-2 rounded hover:bg-yellow-700 disabled:bg-gray-400"
                    >
                        {loading ? 'Updating...' : 'Update Status'}
                    </button>
                    <button
                        type="button"
                        onClick={() => navigate(`/leads/${id}`)}
                        className="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400"
                    >
                        Cancel
                    </button>
                </div>
            </form>
        </div>
    )
}
