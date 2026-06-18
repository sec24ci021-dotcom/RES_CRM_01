import React from 'react'
import { Routes, Route, Link } from 'react-router-dom'
import Dashboard from './pages/Dashboard'
import LeadList from './pages/LeadList'
import CreateLead from './pages/CreateLead'
import EditLead from './pages/EditLead'
import LeadDetails from './pages/LeadDetails'
import SearchLeads from './pages/SearchLeads'
import FilterLeads from './pages/FilterLeads'
import AssignLead from './pages/AssignLead'
import UpdateStatus from './pages/UpdateStatus'

export default function App() {
    return (
        <div className="min-h-screen">
            <nav className="bg-white shadow p-4">
                <div className="container mx-auto flex gap-4">
                    <Link to="/" className="font-bold">Dashboard</Link>
                    <Link to="/leads">Leads</Link>
                    <Link to="/leads/create">Create Lead</Link>
                    <Link to="/leads/search">Search</Link>
                    <Link to="/leads/filter">Filter</Link>
                </div>
            </nav>

            <main className="container mx-auto p-4">
                <Routes>
                    <Route path="/" element={<Dashboard />} />
                    <Route path="/leads" element={<LeadList />} />
                    <Route path="/leads/create" element={<CreateLead />} />
                    <Route path="/leads/:id/edit" element={<EditLead />} />
                    <Route path="/leads/:id" element={<LeadDetails />} />
                    <Route path="/leads/search" element={<SearchLeads />} />
                    <Route path="/leads/filter" element={<FilterLeads />} />
                    <Route path="/leads/:id/assign" element={<AssignLead />} />
                    <Route path="/leads/:id/status" element={<UpdateStatus />} />
                </Routes>
            </main>
        </div>
    )
}
