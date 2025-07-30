import React, { useState, useEffect, useContext, useCallback } from 'react';
import { AppContext } from '../context/AppContext';
import ReportCard from '../components/ReportCard';
import { SearchIcon } from '../components/Icons';

export default function AllReportsPage() {
    const { supabase } = useContext(AppContext);
    const [reports, setReports] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [areaFilter, setAreaFilter] = useState('');
    const [issueFilter, setIssueFilter] = useState('');

    const fetchReports = useCallback(async () => {
        setLoading(true);
        const { data, error } = await supabase
            .from('reports')
            .select('*, profiles(username), report_comments(*, profiles(username))')
            .order('created_at', { ascending: false });
        
        if (error) {
            console.error("Error fetching reports:", error);
        } else {
            setReports(data);
        }
        setLoading(false);
    }, [supabase]);

    useEffect(() => {
        fetchReports();
    }, [fetchReports]);

    const filteredReports = reports.filter(report => {
        const matchesSearch = report.landlord_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                              report.property_address.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesArea = areaFilter ? report.area === areaFilter : true;
        const matchesIssue = issueFilter ? report.issue_type === issueFilter : true;
        return matchesSearch && matchesArea && matchesIssue;
    });

    return (
        <div className="main-content-area container-xl">
            <div className="page-header">
                <h1>All Landlord Reports</h1>
                <p>Browse all public reports submitted by the community.</p>
            </div>
            
            <div className="search-bar">
                <SearchIcon />
                <input 
                    type="text" 
                    placeholder="Search by Landlord Name or Address..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                />
            </div>

            <div className="filter-controls">
                <div className="filter-group">
                    <label htmlFor="area-filter">Filter by Area</label>
                    <select id="area-filter" value={areaFilter} onChange={(e) => setAreaFilter(e.target.value)}>
                        <option value="">All Areas</option>
                        <option>AKR-BSR-HQ</option><option>ZHR</option><option>MTR</option><option>SMD</option>
                    </select>
                </div>
                <div className="filter-group">
                    <label htmlFor="issue-filter">Filter by Issue Type</label>
                    <select id="issue-filter" value={issueFilter} onChange={(e) => setIssueFilter(e.target.value)}>
                        <option value="">All Issues</option>
                        <option>Maintenance Neglect</option><option>Unfair Charges</option><option>Harassment</option><option>Privacy Violation</option><option>Unsafe Conditions</option>
                    </select>
                </div>
            </div>

            {loading ? (
                <p>Loading reports...</p>
            ) : (
                <div className="grid-3col">
                    {filteredReports.length > 0 ? (
                        filteredReports.map(report => (
                            <ReportCard key={report.id} report={report} onUpdate={fetchReports} />
                        ))
                    ) : (
                        <p>No reports found matching your criteria.</p>
                    )}
                </div>
            )}
        </div>
    );
}
