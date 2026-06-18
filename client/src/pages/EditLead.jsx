import React, { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { getLeadById, updateLead } from '../api/leadService'

export default function EditLead() {
    const { id } = useParams()
    const [form, setForm] = useState({ firstName: '', lastName: '', email: '', phone: '', source: '', priority: '', status: '' })
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(null)
    const [submitting, setSubmitting] = useState(false)
    const navigate = useNavigate()

    useEffect(() => {
        const fetchLead = async () => {
            try {
                const res = await getLeadById(id)
                const lead = res.data.data
                setForm({
                    firstName: lead.firstName || '',
                    lastName: lead.lastName || '',
                    email: lead.email || '',
                    phone: lead.phone || '',
                    source: lead.source || '',
                    priority: lead.priority || '',
                    status: lead.status || ''
                })
            } catch (err) {
                setError(err.message || 'Failed to load lead')
            } finally {
                setLoading(false)
            }
        }
        fetchLead()
    }, [id])

    const handleChange = (e) => {
        const { name, value } = e.target
        setForm(prev => ({ ...prev, [name]: value }))
    }

    const submit = async (e) => {
        e.preventDefault()
        setSubmitting(true)
        setError(null)

        try {
            await updateLead(id, form)
            navigate(`/leads/${id}`)
        } catch (err) {
            setError(err.message || 'Failed to update lead')
        } finally {
            setSubmitting(false)
        }
    }

    if (loading) return <div className="p-4">Loading...</div>
    if (error && !form.firstName) return <div className="p-4 text-red-600">{error}</div>

    return (
        <div>
            <h1 className="text-xl font-bold mb-4">Edit Lead</h1>
            <form onSubmit={submit} className="bg-white p-6 rounded shadow max-w-md">
                {error && <div className="mb-4 p-2 bg-red-100 text-red-700 rounded">{error}</div>}

                <label className="block mb-3">
                    <span className="text-sm font-medium text-gray-700">First Name</span>
                    <input
                        type="text"
                        name="firstName"
                        value={form.firstName}
                        onChange={handleChange}
                        className="w-full border p-2 rounded mt-1 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                </label>

                <label className="block mb-3">
                    <span className="text-sm font-medium text-gray-700">Last Name</span>
                    <input
                        type="text"
                        name="lastName"
                        value={form.lastName}
                        onChange={handleChange}
                        className="w-full border p-2 rounded mt-1 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                </label>

                <label className="block mb-3">
                    <span className="text-sm font-medium text-gray-700">Email</span>
                    <input
                        type="email"
                        name="email"
                        value={form.email}
                        onChange={handleChange}
                        className="w-full border p-2 rounded mt-1 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                </label>

                <label className="block mb-3">
                    <span className="text-sm font-medium text-gray-700">Phone</span>
                    <input
                        type="tel"
                        name="phone"
                        value={form.phone}
                        onChange={handleChange}
                        className="w-full border p-2 rounded mt-1 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                </label>

                <label className="block mb-3">
                    <span className="text-sm font-medium text-gray-700">Source</span>
                    <select
                        name="source"
                        value={form.source}
                        onChange={handleChange}
                        className="w-full border p-2 rounded mt-1 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                        <option value="">Select...</option>
                        <option value="WEBSITE">Website</option>
                        <option value="FACEBOOK">Facebook</option>
                        <option value="GOOGLE_ADS">Google Ads</option>
                        <option value="REFERRAL">Referral</option>
                        <option value="WALK_IN">Walk In</option>
                        <option value="CALL">Call</option>
                        <option value="EMAIL">Email</option>
                    </select>
                </label>

                <label className="block mb-3">
                    <span className="text-sm font-medium text-gray-700">Priority</span>
                    <select
                        name="priority"
                        value={form.priority}
                        onChange={handleChange}
                        className="w-full border p-2 rounded mt-1 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                        <option value="">Select...</option>
                        <option value="LOW">Low</option>
                        <option value="MEDIUM">Medium</option>
                        <option value="HIGH">High</option>
                        <option value="CRITICAL">Critical</option>
                    </select>
                </label>

                <label className="block mb-3">
                    <span className="text-sm font-medium text-gray-700">Status</span>
                    <select
                        name="status"
                        value={form.status}
                        onChange={handleChange}
                        className="w-full border p-2 rounded mt-1 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                        <option value="">Select...</option>
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
                </label>

                <div className="flex gap-2">
                    <button
                        type="submit"
                        disabled={submitting}
                        className="flex-1 bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 disabled:bg-gray-400"
                    >
                        {submitting ? 'Saving...' : 'Save Changes'}
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
