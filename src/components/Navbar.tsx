
import React, { useState, useEffect, useContext, CSSProperties } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { AppContext } from '../context/AppContext';
import { LogoIcon, MenuIcon, CloseIcon, HeartIcon } from './Icons';

interface BaseNavItem {
    label: string;
    style?: CSSProperties;
}

interface NavLinkItem extends BaseNavItem {
    path: string;
    subItems?: undefined;
}

interface NavDropdownItem extends BaseNavItem {
    path?: undefined;
    subItems: NavLinkItem[];
}

type NavItem = NavLinkItem | NavDropdownItem;

export default function Navbar() {
    const { user, profile, signOut } = useContext(AppContext);
    const navigate = useNavigate();
    const location = useLocation();
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [mobileSubMenu, setMobileSubMenu] = useState('');

    useEffect(() => {
        document.body.style.overflow = isMobileMenuOpen ? 'hidden' : 'auto';
        return () => {
            document.body.style.overflow = 'auto';
        };
    }, [isMobileMenuOpen]);

    const handleNavClick = (path: string) => {
        navigate(path);
        setIsMobileMenuOpen(false);
        setMobileSubMenu('');
    };

    const handleMobileSubMenuToggle = (label: string) => {
        setMobileSubMenu(prev => (prev === label ? '' : label));
    };

    const handleLogout = async () => {
        await signOut();
        setIsMobileMenuOpen(false);
        navigate('/');
    };

    const navItems: NavItem[] = [
        { path: '/', label: 'Home' },
        { path: '/reports', label: 'Reports' },
        { path: '/for-rent/browse', label: 'For Rent' },
        { path: '/info/browse', label: 'Info' },
        {
            label: 'Contribute',
            subItems: [
                { path: '/report/new', label: 'Submit Report' },
                { path: '/for-rent/new', label: 'Post Rental Ad' },
                { path: '/info/add', label: 'Add Community Info' },
            ]
        },
        { path: '/blood-request/new', label: 'Emergency Blood', style: {color: 'var(--error)'}},
    ];

    const renderLinks = (isMobile = false) => (
        <>
            {navItems.map(item => {
                if (item.subItems) {
                    return isMobile ? (
                        <div key={item.label}>
                            <a onClick={() => handleMobileSubMenuToggle(item.label)} className="nav-link" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                {item.label}
                                <span>{mobileSubMenu === item.label ? '▲' : '▼'}</span>
                            </a>
                            {mobileSubMenu === item.label && (
                                <div className="mobile-nav-submenu">
                                    {item.subItems.map(subItem => (
                                        <a key={subItem.path} onClick={() => handleNavClick(subItem.path)} className='nav-link' style={subItem.style}>{subItem.label}</a>
                                    ))}
                                </div>
                            )}
                        </div>
                    ) : (
                        <div key={item.label} className="nav-item-dropdown">
                            <a className="nav-link">{item.label}</a>
                            <ul className="dropdown-menu">
                                {item.subItems.map(subItem => (
                                    <li key={subItem.path}>
                                        <Link to={subItem.path} className='dropdown-item' style={subItem.style}>{subItem.label}</Link>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    );
                }
                return (
                    <a key={item.path} onClick={() => handleNavClick(item.path)} className={`nav-link ${location.pathname === item.path ? 'active' : ''}`} style={item.style}>
                        {item.label}
                    </a>
                );
            })}
            
            {user ? (
                <>
                    {profile?.is_admin && <a onClick={() => handleNavClick('/admin')} className={`nav-link ${location.pathname.startsWith('/admin') ? 'active' : ''}`}>Admin</a>}
                    <a onClick={() => handleNavClick('/dashboard')} className={`nav-link ${location.pathname === '/dashboard' ? 'active' : ''}`}>Dashboard</a>
                    <button onClick={handleLogout} className="btn-logout">Logout</button>
                </>
            ) : (
                <button onClick={() => handleNavClick('/login')} className="btn-primary">Login</button>
            )}
            <button onClick={() => handleNavClick('/donate')} className="donate-nav-btn"><HeartIcon /> Donate</button>
        </>
    );

    return (
        <nav className="navbar">
            <Link to="/" className="nav-brand">
                <LogoIcon />
                <span>Community Hub</span>
            </Link>
            <div className="nav-links">
                {renderLinks()}
            </div>
            <button className="mobile-nav-toggle" onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} aria-label="Toggle navigation">
                {isMobileMenuOpen ? <CloseIcon /> : <MenuIcon />}
            </button>
            {isMobileMenuOpen && (
                 <div className="mobile-nav-overlay" onClick={() => setIsMobileMenuOpen(false)}>
                    <div onClick={(e) => e.stopPropagation()} style={{display: 'flex', flexDirection: 'column', alignItems: 'stretch', gap: '1rem', width: '80%', maxWidth: '300px'}}>
                        {renderLinks(true)}
                    </div>
                </div>
            )}
        </nav>
    );
}
