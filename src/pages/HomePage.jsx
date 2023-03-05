import { NavLink } from 'react-router-dom';
import React ,{ useState , useEffect } from "react";
import { HomePageSCSS } from '../css/HomePage.scss'
import Base from '../pages/Base.jsx'


const HomePage = () =>{
    const [screenWidth, setScreenWidth] = useState(window.innerWidth);
    useEffect(() => {
        const handleResize = () => setScreenWidth(window.innerWidth);
        window.addEventListener('resize', handleResize);
        return () => {
          window.removeEventListener('resize', handleResize);
        };
      }, []);
    return (
    <div>{/* 純包裹用的父元素 */}
    <Base></Base>
        <div className='banner'>
            {screenWidth >= 1000 ? (
            <img className='banner-img' src='banner-2050x753.jpg'></img>
            ) : 
            
            <div className='white-home'>                
            </div>
            }
            <div className='banner-logo'>
        
                <img src='/img/LOGO.png' className='home-logo'></img>
        
                <div className='slogan'>探尋臺灣鳥類多樣足跡</div>
            </div>
            
            <div className='banner-menu'>            
                <NavLink className='map' to='/map'>四季熱門地圖</NavLink>{/* map */}
                <NavLink className='explore-banner' to="/explore">鳥種/景點資料探索</NavLink>
                {/* <NavLink className='sos-banner' to='/sos'>鳥類救傷</NavLink>
                <NavLink className='meme-banner' to='/meme'>鳥知識</NavLink> */}
            </div>
        </div>
        <div className='bird-intro'>
            <div className='bird-intro-img'></div>
            <div className='bird-intro-word'>
                <p >多達全台725種鳥類圖鑑、聲音資源 !</p>
                <p >不知道查什麼? 試試鳥鳥驚喜包吧 !</p>
            </div>          
        </div>
        <hr className='home-hr'></hr>
        <div className='map-intro'>
            <div className='map-intro-word'>
                <p>可用台灣地圖找尋四季區域鳥種</p>
                <p>各縣市的熱門賞鳥點也能看到!</p>
            </div>
            <div className='map-intro-img'></div>
        </div>
        <hr className='home-hr'></hr>
        <div className='member-intro'>
            <div className='member-intro-img'></div>
            <div className='member-intro-word'>
                <p >加入鳥友上傳鳥類攝影作品</p>
                <p >與各地會員同好一同參與賞鳥樂趣!</p>
            </div>            
        </div>
        <hr className='home-hr'></hr>
    
    </div>
        
    
    )
}

export default HomePage