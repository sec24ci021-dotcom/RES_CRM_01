import React, { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { getLeadById, deleteLead } from '../api/leadService'

export default function LeadDetails() {
    const { id } = useParams()
    const [lead, setLead] = useState(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(null)

    useEffect(() => {
        const fetchLead = async () => {
            try {
                const res = await getLeadById(id)
                setLead(res.data.data)
            } catch (err) {
                setError(err.message || 'Failed to load lead')
            } finally {
                setLoading(false)
            }
        }
        fetchLead()
    }, [id])

    const handleDelete = async () => {
        if (!window.confirm('Are you sure you want to delete this lead?')) return

        try {
            await deleteLead(id)
            window.location.href = '/leads'
        } catch (err) {
            alert(err.message || 'Failed to delete lead')
        }
    }

    if (loading) return <div className="p-4 text-center">Loading...</div>
    if (error) return <div className="p-4 text-red-600">{error}</div>
    if (!lead) return <div className="p-4 text-gray-500">Lead not found</div>

    return (
        <div>
            <div className="flex justify-between items-center mb-4">
                <h1 className="text-xl font-bold">{lead.firstName} {lead.lastName || lead.name}</h1>
                <div className="flex gap-2">
                    <Link to={`/leads/${id}/edit`} className="text-green-600 hover:text-green-800 px-3 py-1 border border-green-600 rounded">Edit</Link>
                    <Link to={`/leads/${id}/assign`} className="text-blue-600 hover:text-blue-800 px-3 py-1 border border-blue-600 rounded">Assign</Link>
                    <Link to={`/leads/${id}/status`} className="text-yellow-600 hover:text-yellow-800 px-3 py-1 border border-yellow-600 rounded">Change Status</Link>
                    <button onClick={handleDelete} className="text-red-600 hover:text-red-800 px-3 py-1 border border-red-600 rounded">Delete</button>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-white p-4 rounded shadow">
                    <h2 className="font-bold mb-3">Contact Information</h2>
                    <div className="mb-2"><strong>Email:</strong> <a href={`mailto:${lead.email}`} className="text-blue-600 hover:underline">{lead.email}</a></div>
                    <div className="mb-2"><strong>Phone:</strong> <a href={`tel:${lead.phone}`} className="text-blue-600 hover:underline">{lead.phone}</a></div>
                    <div><strong>Status:</strong> {lead.status}</div>
                </div>

                <div className="bg-white p-4 rounded shadow">
                    <h2 className="font-bold mb-3">Lead Information</h2>
                    <div className="mb-2"><strong>Source:</strong> {lead.source}</div>
                    <div className="mb-2"><strong>Priority:</strong> {lead.priority}</div>
                    <div><strong>Assigned To:</strong> {lead.assignedTo ? `${lead.assignedTo.firstName} ${lead.assignedTo.lastName}` : 'Unassigned'}</div>
                </div>

                <div className="bg-white p-4 rounded shadow">
                    <h2 className="font-bold mb-3">Activity</h2>
                    <div className="mb-2"><strong>Created:</strong> {new Date(lead.createdAt).toLocaleDateString()}</div>
                    <div><strong>Last Updated:</strong> {new Date(lead.updatedAt).toLocaleDateString()}</div>
                </div>

                <div className="bg-white p-4 rounded shadow">
                    <h2 className="font-bold mb-3">Financial Info</h2>
                    <div className="mb-2"><strong>Budget Min:</strong> ${lead.budgetMin?.toLocaleString() || 'N/A'}</div>
                    <div><strong>Budget Max:</strong> ${lead.budgetMax?.toLocaleString() || 'N/A'}</div>
                </div>
            </div>
        </div>
    )
}
