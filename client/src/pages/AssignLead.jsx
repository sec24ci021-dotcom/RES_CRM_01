import React, { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { getUsers, assignLead } from '../api/leadService'

export default function AssignLead() {
    const { id } = useParams()
    const [users, setUsers] = useState([])
    const [agentId, setAgentId] = useState('')
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState(null)
    const navigate = useNavigate()

    useEffect(() => {
        const fetchUsers = async () => {
            try {
                const res = await getUsers()
                setUsers(res.data.data || [])
            } catch (err) {
                setError('Failed to load users')
                console.error(err)
            }
        }
        fetchUsers()
    }, [])

    const submit = async (e) => {
        e.preventDefault()
        if (!agentId) {
            setError('Please select an agent')
            return
        }

        setLoading(true)
        setError(null)

        try {
            await assignLead(id, agentId)
            navigate(`/leads/${id}`)
        } catch (err) {
            setError(err.message || 'Failed to assign lead')
        } finally {
            setLoading(false)
        }
    }

    return (
        <div>
            <h1 className="text-xl font-bold mb-4">Assign Lead</h1>
            <form onSubmit={submit} className="bg-white p-4 rounded shadow max-w-md">
                {error && <div className="mb-3 p-2 bg-red-100 text-red-700 rounded">{error}</div>}

                <label className="block mb-3">
                    <span className="text-sm font-medium text-gray-700 block mb-1">Select Agent</span>
                    <select
                        value={agentId}
                        onChange={e => setAgentId(e.target.value)}
                        className="w-full border p-2 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                        required
                    >
                        <option value="">-- Select an agent --</option>
                        {users.map(u => (
                            <option key={u._id} value={u._id}>
                                {u.name || u.firstName} {u.lastName || ''} ({u.role || 'User'})
                            </option>
                        ))}
                    </select>
                </label>

                <div className="flex gap-2">
                    <button
                        type="submit"
                        disabled={loading}
                        className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 disabled:bg-gray-400"
                    >
                        {loading ? 'Assigning...' : 'Assign Lead'}
                    </button>
                    <button
                        type="button"
                        onClick={() => navigate(`/leads/${id}`)}
                        className="bg-gray-400 text-white px-4 py-2 rounded hover:bg-gray-500"
                    >
                        Cancel
                    </button>
                </div>
            </form>
        </div>
    )
}
