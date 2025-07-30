import React, { useState, useEffect, useContext } from 'react';
import { AppContext } from '../context/AppContext';
import GeneralInfoCard from '../components/GeneralInfoCard';
import { SearchIcon } from '../components/Icons';

export default function AllGeneralInfoPage() {
    const { supabase } = useContext(AppContext);
    const [infos, setInfos] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [categoryFilter, setCategoryFilter] = useState('');

    const fetchInfos = async () => {
        setLoading(true);
        const { data, error } = await supabase
            .from('general_info')
            .select('*')
            .order('created_at', { ascending: false });

        if (error) {
            console.error('Error fetching general info:', error);
        } else {
            setInfos(data);
        }
        setLoading(false);
    };

    useEffect(() => {
        fetchInfos();
    }, [supabase]);
    
    const categories = [...new Set(infos.map(info => info.category))];

    const filteredInfos = infos.filter(info => {
        const matchesSearch = info.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
                              info.description.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesCategory = categoryFilter ? info.category === categoryFilter : true;
        return matchesSearch && matchesCategory;
    });

    return (
        <div className="main-content-area container-xl">
            <div className="page-header">
                <h1>Community Resources</h1>
                <p>Find useful contacts and information shared by the community.</p>
            </div>
            
            <div className="search-bar">
                <SearchIcon />
                <input 
                    type="text" 
                    placeholder="Search by title or description..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                />
            </div>

            <div className="filter-controls">
                <div className="filter-group">
                    <label htmlFor="category-filter">Filter by Category</label>
                    <select 
                        id="category-filter"
                        value={categoryFilter}
                        onChange={(e) => setCategoryFilter(e.target.value)}
                    >
                        <option value="">All Categories</option>
                        {categories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                    </select>
                </div>
            </div>

            {loading ? (
                <p>Loading resources...</p>
            ) : (
                 <div className="grid-3col">
                    {filteredInfos.length > 0 ? (
                        filteredInfos.map(info => <GeneralInfoCard key={info.id} info={info} onUpdate={fetchInfos} />)
                    ) : (
                        <p>No resources found matching your criteria.</p>
                    )}
                </div>
            )}
        </div>
    );
}
