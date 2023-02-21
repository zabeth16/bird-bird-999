import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import firebase from 'firebase/compat/app';
import 'firebaseui/dist/firebaseui.css';
import { getAuth, createUserWithEmailAndPassword , signInWithEmailAndPassword,
        updateProfile , GoogleAuthProvider , signInWithPopup } from "firebase/auth";
import { LoginPageCSS } from "../css/LoginPage.scss"
import db from './../../firebase-servise.js';
import { auth } from './../../firebase-servise.js';
import { async } from "@firebase/util";
import  { GOOGLE_CLIENT_ID } from './page_control/googleAPI.js'

const LoginPage = () =>{
    const navigate = useNavigate();//取得 navigate
    const [inputEmail , setInputEmail] = useState("");
    const [inputName , setInputName] = useState("");
    const [inputPassword , setInputPassword] = useState("");
    const [errorMessage , setErrorMessage] = useState("");
    const [isLoginFormVisible, setIsLoginFormVisible] = useState(true);
    const [registerSuccess, setRegisterSuccess] = useState(false);
    // 註冊
    const signUp = async(inputEmail , inputName, inputPassword) => {
        const email = inputEmail;
        const displayName = inputName;    
        const password =  inputPassword;       
        try {
            const userCredential = await createUserWithEmailAndPassword(auth , email, password)
            const loginUser = userCredential.user        
            await updateProfile(auth.currentUser, { displayName: displayName }).catch(
                (err) => console.log(err)
                );
            setRegisterSuccess(true);
   
        } catch (e) {
            if(e.message === "Firebase: Error (auth/invalid-email)."){
                e.message = "Email格式不正確"
            }
            else if(e.message ==="Firebase: Password should be at least 6 characters (auth/weak-password)."){
                e.message = "密碼不足6個字喔!"
            }
            else if(e.message === "Firebase: Error (auth/email-already-in-use)."){
                e.message = "此信箱已經註冊過了"
            }
            else if(e.message === "Firebase: Error (auth/internal-error)."){
                e.message = "欄位不可空白 !"
            }
            setErrorMessage(e.message)
        }
    }
    // switch動畫
    const [switchWidth, setSwitchWidth] = useState('20%');
    const [boxWidth, setBoxWidth] = useState("0%");
    
    const handleSwitchClick = () => {        
        setIsLoginFormVisible(!isLoginFormVisible);
        setSwitchWidth(isLoginFormVisible ? '50%' : '20%' );
        setBoxWidth(isLoginFormVisible ? '0%' : '50%')        
    }


    // 登入    
    const [loginSuccess, setLoginSuccess] = useState(false);
    const login = async(inputEmail , inputPassword) =>{
        const email = inputEmail;
        const password =  inputPassword; 
        try {
            const userCredential = await signInWithEmailAndPassword(auth, email, password)
            const loginUser = userCredential.user
            setLoginSuccess(true);
            setErrorMessage("");
            navigate(-1 ); // 回使用者的上一頁
        }
        catch (e) {
            if(e.message == "Firebase: Error (auth/invalid-email)."){
                e.message = "信箱格式錯誤/欄位不可空白"
            }
            else if(e.message == "Firebase: Error (auth/wrong-password)."){
                e.message = "密碼錯誤呦 !"
            }
            else if(e.message == "Firebase: Error (auth/internal-error)."){
                e.message = "密碼不可為空 !"
            }
            setErrorMessage(e.message)
        }
    }
    // 第三方登入
    const googleLogin = async() =>{
        try {
            const provider = new GoogleAuthProvider();
            provider.addScope('https://www.googleapis.com/auth/contacts.readonly');
          
            const result = await signInWithPopup(auth, provider)
            const credential = GoogleAuthProvider.credentialFromResult(result);
            const loginUser = result.user;
            const token = credential.accessToken;
            // console.log(loginUser) 
            const googleDisplayName = loginUser.displayName
            const googleEmail = loginUser.email
            const googleImg = loginUser.photoURL.replace(" '' ")
            const googleUid = loginUser.uid
            setLoginSuccess(true);
            navigate(-1); // 回使用者的上一頁
           
        } catch (error) {
            if (error.message == "Firebase: Error (auth/popup-closed-by-user)."){
                error.message = "GOOGLE登入視窗被關掉了。"
            }
            else if (error.message == "Firebase: Error (auth/cancelled-popup-request)."){
                error.message = "取消了GOOGLE登入"
            }
            else if (error.message == "Firebase: IdP denied access. This usually happens when user refuses to grant permission. (auth/user-cancelled)."){
                error.message = "拒絕了GOOGLE註冊流程"
            }
            setErrorMessage(error.message)
        }
    }

    return (
        <div>
         
            <div className={`main ${isLoginFormVisible ? "" : "main-reversed"}`}> {/* {`main ${isLoginFormVisible ? "" : "main-reversed"}`} */}
            <div className={`switch ${isLoginFormVisible ? "" : "slide-right"}`} onClick={handleSwitchClick} >{/* style={{width : isLoginFormVisible ? `${switchWidth}` : `${switchWidth}`}} */}
                <div className="switch-word" >
                切至{isLoginFormVisible ? "註冊" : "登入"}
                </div>
            </div>
            <div className={isLoginFormVisible ? "login-box" : "register-box"} style={{width : isLoginFormVisible ? `50%`: `50%`}}>
            {isLoginFormVisible ? (
            <>

                <div className="login-title" >登入鳥友會員</div>
                {/* 登入表單元素 */}
                <input className="email" value={inputEmail} type={'text'} 
                onChange={e => {
                    setInputEmail(e.target.value) 
                    }}
                placeholder={"請輸入信箱帳號"}></input>
                <input className="password" type={'text'} placeholder={"請輸入你的密碼，至少6個字"}
                onChange={e => {
                    setInputPassword(e.target.value) 
                    }}
                value={inputPassword} ></input>
                <div className="error-message">{errorMessage}</div>
                {loginSuccess && <div className="success-message">登入成功</div>}
                <button onClick={() => login(inputEmail , inputPassword)} className='login'>登入鳥友</button>
                <hr className="login-line"/>
                <button className="google-login" onClick={googleLogin}>使用GOOGLE帳號快速登入</button>
                <div id="g_id_onload"
                    data-client_id={ GOOGLE_CLIENT_ID }
                    data-login_uri="http://localhost:8080/login"
                    data-auto_prompt="false">
                </div>
      
            </>
            ) : (
            <>
      
                <div className="login-title">註冊鳥友會員</div>
                {/* 註冊表單元素 */}

                <input className="email" value={inputEmail} type={'text'} 
                onChange={e => {
                    setInputEmail(e.target.value) 
                    }}
                placeholder={"請先設定信箱作為帳號"}></input>
                <input className="name" type={'text'} placeholder={"請設定你的暱稱"}
                    onChange={e => {
                    setInputName(e.target.value) 
                    }}
                value={inputName}  ></input>
                <input className="password" type={'text'} placeholder={"請設定你的密碼，至少6個字"}
                onChange={e => {
                    setInputPassword(e.target.value) 
                    }}
                value={inputPassword} ></input>
                <div className="error-message">{errorMessage}</div>
                {registerSuccess && <div className="success-message">註冊成功</div>}
                <button onClick={() => signUp(inputEmail , inputName, inputPassword)} className='signin'>加入鳥友</button>

            </>
            )}
                
            </div>
            </div>
        </div>
    )

}

export default LoginPage