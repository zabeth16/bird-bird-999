import { NavLink } from 'react-router-dom';
import React from "react";
import { BaseSCSS } from '../css/Base.scss'


const Base = () =>{
    return(
    <div>{/* 純包裹用的父元素 */}
        <div className='top'>
        <nav className='nav-bar'>
            <NavLink className='logo' to='/'>鳥鳥啾啾啾</NavLink>
            <div className='nav-right-box'>
                <NavLink className='explore' to="/explore">鳥種查詢</NavLink>
                <NavLink className='sos' to='/sos'>鳥類救傷</NavLink>
                <NavLink className='meme' to='/meme'>鳥知識</NavLink>
                <NavLink className='member' to='/member'>鳥友會員</NavLink>
            </div>
        </nav>
        </div>
    </div>
    )
}

export default Base