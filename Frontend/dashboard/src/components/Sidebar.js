import React, {useState} from "react";
import { Link, useLocation } from "react-router-dom";
import { FaHome } from 'react-icons/fa';

function Sidebar() {
    const location = useLocation();

    const menuItems = [
        { path: '/dashboard',  icon: <FaHome />, label: 'Dashboard'},
        { path: '/price', icon: <FaHome />, label: 'Price'}
        
    ];

    return (
        <div className="Sidebar">
            <div className="sidebar-header">
                <h2>Name</h2>
            </div>
            <nav className="sidebar-menu">
                {menuItems.map(({ path,icon, label})=>(
                    <Link 
                        key={path}
                        to={path}
                        className={`menu-item${location.pathname === path ? ' active' : ''}`}
                    >
                        <span className="icon">{icon}</span>
                        {label}
                    </Link>
                ))}
            </nav>
        </div>
    );
};

export default Sidebar;