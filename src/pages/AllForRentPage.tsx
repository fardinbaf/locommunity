import React, { useState, useEffect, useContext, useCallback } from 'react';
import { AppContext } from '../context/AppContext';
import ForRentCard from '../components/ForRentCard';
import { SearchIcon } from '../components/Icons';

export default function AllForRentPage() {
    const { supabase } = useContext(AppContext);
    const [listings, setListings] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [sortOrder, setSortOrder] = useState('created_at:desc');

    const fetchListings = useCallback(async () => {
        setLoading(true);
        const [sortField, sortDirection] = sortOrder.split(':');
        
        const { data, error } = await supabase
            .from('for_rent')
            .select('*')
            .eq('is_approved', true) // RLS handles this, but explicit is safer for public pages
            .order(sortField, { ascending: sortDirection === 'asc' });
        
        if (error) {
            console.error("Error fetching listings:", error);
        } else {
            setListings(data);
        }
        setLoading(false);
    }, [supabase, sortOrder]);

    useEffect(() => {
        fetchListings();
    }, [fetchListings]);

    const filteredListings = listings.filter(item => {
        const matchesSearch = item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                              item.address.toLowerCase().includes(searchTerm.toLowerCase()) ||
                              item.description.toLowerCase().includes(searchTerm.toLowerCase());
        return matchesSearch;
    });

    return (
        <div className="main-content-area container-xl">
            <div className="page-header">
                <h1>Homes For Rent</h1>
                <p>Browse all available rental listings submitted by the community.</p>
            </div>
            
            <div className="search-bar">
                <SearchIcon />
                <input 
                    type="text" 
                    placeholder="Search by title, address, or description..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                />
            </div>

            <div className="filter-controls">
                <div className="filter-group">
                    <label htmlFor="sort-order">Sort By</label>
                    <select id="sort-order" value={sortOrder} onChange={(e) => setSortOrder(e.target.value)}>
                        <option value="created_at:desc">Newest First</option>
                        <option value="created_at:asc">Oldest First</option>
                        <option value="rent:asc">Price: Low to High</option>
                        <option value="rent:desc">Price: High to Low</option>
                    </select>
                </div>
            </div>

            {loading ? (
                <p>Loading listings...</p>
            ) : (
                <div className="grid-3col">
                    {filteredListings.length > 0 ? (
                        filteredListings.map(item => (
                            <ForRentCard key={item.id} item={item} onUpdate={fetchListings} />
                        ))
                    ) : (
                        <p>No rental listings found matching your criteria.</p>
                    )}
                </div>
            )}
        </div>
    );
}