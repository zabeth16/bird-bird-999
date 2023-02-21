import { NavLink , useNavigate ,useLocation } from 'react-router-dom';
import React ,{ useState , useEffect } from "react";
import { BaseSCSS } from '../css/Base.scss';
import { getAuth , onAuthStateChanged } from "firebase/auth";


const Base = () =>{
    const [loginSuccess, setLoginSuccess] = useState(false);
    const [userName, setUserName] = useState("");
    useEffect(() => {
        const auth = getAuth();
        onAuthStateChanged(auth, (user) => {
            if (user) {
                // User is signed in, see docs for a list of available properties
                const uid = user.uid;
                const photoURL = user.photoURL;
                const email = user.email
                const userName = user.displayName ;            
                setUserName(userName)
                // console.log("userName: " , userName)
                setLoginSuccess(true)                
            } else {
                // User is signed out
                setLoginSuccess(false)
            }
        });
    }, []);

    return(
    <div>{/* 純包裹用的父元素 */}
        <div className='top'>
        <nav className='nav-bar'>
            <NavLink className='logo' to='/'>鳥鳥啾啾啾</NavLink>
            <div className='nav-right-box'>
                <NavLink className='explore' to="/explore">資料探索</NavLink>
                <NavLink className='sos' to='/sos'>鳥類救傷</NavLink>
                <NavLink className='meme' to='/meme'>鳥知識</NavLink>                
                <NavLink className='member' to={!loginSuccess ? '/login' : '/member' }>
                    {!loginSuccess ? '鳥友會員' :`鳥友: ${userName}`}
                </NavLink>
            </div>
        </nav>
        </div>
    </div>
    )
}

export default Base