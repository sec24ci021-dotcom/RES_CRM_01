import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { createLead } from '../api/leadService'

export default function CreateLead() {
    const [form, setForm] = useState({
        firstName: '',
        lastName: '',
        email: '',
        phone: '',
        source: 'WEBSITE',
        priority: 'MEDIUM',
        status: 'NEW_LEAD'
    })
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState(null)
    const [errors, setErrors] = useState({})
    const navigate = useNavigate()

    const handleChange = (e) => {
        const { name, value } = e.target
        setForm(prev => ({ ...prev, [name]: value }))
        setErrors(prev => ({ ...prev, [name]: '' }))
        setError(null)
    }

    const submit = async (e) => {
        e.preventDefault()

        // Validation (field-level)
        const newErrors = {}
        if (!form.firstName || !form.firstName.trim()) newErrors.firstName = 'First name is required'
        if (!form.lastName || !form.lastName.trim() || form.lastName.trim().length < 2) newErrors.lastName = 'Last name is required and must be at least 2 characters'
        if (!form.email || !form.email.trim()) newErrors.email = 'Email is required'
        if (!form.phone || !form.phone.trim()) newErrors.phone = 'Phone is required'

        if (Object.keys(newErrors).length > 0) {
            setErrors(newErrors)
            setError('Please fix the highlighted fields')
            return
        }

        setLoading(true)
        setError(null)

        try {
            const res = await createLead(form)
            navigate(`/leads/${res.data.data._id}`)
        } catch (err) {
            console.error('Create lead error:', err)
            // If server returned structured validation details, map into field errors
            if (err && err.data) {
                const d = err.data
                if (d.details && typeof d.details === 'object') {
                    const newErrors = {}
                    for (const k of Object.keys(d.details)) {
                        // details entries may be { message } or string
                        const val = d.details[k]
                        newErrors[k] = (val && val.message) || val || 'Invalid value'
                    }
                    setErrors(newErrors)
                }
                setError(d.message || d.error?.message || 'Failed to create lead')
            } else {
                setError(err.message || 'Failed to create lead')
            }
        } finally {
            setLoading(false)
        }
    }

    return (
        <div>
            <h1 className="text-xl font-bold mb-4">Create Lead</h1>
            <form onSubmit={submit} className="bg-white p-6 rounded shadow max-w-md">
                {error && <div className="mb-4 p-2 bg-red-100 text-red-700 rounded">{error}</div>}

                <label className="block mb-3">
                    <span className="text-sm font-medium text-gray-700">First Name *</span>
                    <input
                        type="text"
                        name="firstName"
                        value={form.firstName}
                        onChange={handleChange}
                        className="w-full border p-2 rounded mt-1 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        required
                    />
                    {errors.firstName && <p className="text-red-600 text-sm mt-1">{errors.firstName}</p>}
                </label>

                <label className="block mb-3">
                    <span className="text-sm font-medium text-gray-700">Last Name</span>
                    <input
                        type="text"
                        name="lastName"
                        value={form.lastName}
                        onChange={handleChange}
                        className="w-full border p-2 rounded mt-1 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        required
                    />
                    {errors.lastName && <p className="text-red-600 text-sm mt-1">{errors.lastName}</p>}
                </label>

                <label className="block mb-3">
                    <span className="text-sm font-medium text-gray-700">Email *</span>
                    <input
                        type="email"
                        name="email"
                        value={form.email}
                        onChange={handleChange}
                        className="w-full border p-2 rounded mt-1 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        required
                    />
                    {errors.email && <p className="text-red-600 text-sm mt-1">{errors.email}</p>}
                </label>

                <label className="block mb-3">
                    <span className="text-sm font-medium text-gray-700">Phone *</span>
                    <input
                        type="tel"
                        name="phone"
                        value={form.phone}
                        onChange={handleChange}
                        className="w-full border p-2 rounded mt-1 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        required
                    />
                    {errors.phone && <p className="text-red-600 text-sm mt-1">{errors.phone}</p>}
                </label>

                <label className="block mb-3">
                    <span className="text-sm font-medium text-gray-700">Source</span>
                    <select
                        name="source"
                        value={form.source}
                        onChange={handleChange}
                        className="w-full border p-2 rounded mt-1 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
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
                        <option value="LOW">Low</option>
                        <option value="MEDIUM">Medium</option>
                        <option value="HIGH">High</option>
                        <option value="CRITICAL">Critical</option>
                    </select>
                </label>

                <div className="flex gap-2">
                    <button
                        type="submit"
                        disabled={loading}
                        className="flex-1 bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 disabled:bg-gray-400"
                    >
                        {loading ? 'Creating...' : 'Create Lead'}
                    </button>
                    <button
                        type="button"
                        onClick={() => navigate('/leads')}
                        className="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400"
                    >
                        Cancel
                    </button>
                </div>
            </form>
        </div>
    )
}
