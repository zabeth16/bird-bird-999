import { NavLink } from 'react-router-dom';
import React from "react";
import { HomePageSCSS } from '../css/HomePage.scss'
import Base from '../pages/Base.jsx'


const HomePage = () =>{
    return (
    <div>{/* 純包裹用的父元素 */}
    <Base></Base>
    <div className='banner'>
        <img className='banner-img' src='banner-2050x753.jpg'></img>
        <div className='banner-logo'>鳥鳥啾啾啾</div>
        <div className='banner-menu'>            
            <NavLink className='map' to='/map'>全台賞鳥熱門一覽</NavLink>{/* map */}
            <NavLink className='explore-banner' to="/explore">鳥種/景點查詢</NavLink>{/* ecplore 考慮不同className CSS*/}
            {/* <NavLink className='sos-banner' to='/sos'>鳥類救傷</NavLink>
            <NavLink className='meme-banner' to='/meme'>鳥知識</NavLink> */}
        </div>
    </div>
    
    </div>
        
    
    )
}

export default HomePage