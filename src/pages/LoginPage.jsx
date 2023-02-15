import React, { useState } from "react";
import firebase from 'firebase/compat/app';
import 'firebaseui/dist/firebaseui.css';
import { getAuth, createUserWithEmailAndPassword , signInWithEmailAndPassword,
        updateProfile} from "firebase/auth";
import { LoginPageCSS } from "../css/LoginPage.scss"
import db from './../../firebase-servise.js';
import { auth } from './../../firebase-servise.js';

const LoginPage = () =>{
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
        
    const handleSwitchClick = () => {
        setIsLoginFormVisible(!isLoginFormVisible);
    }
    // 登入
    const [loginSuccess, setLoginSuccess] = useState(false);
    const login = async(inputEmail , inputPassword) =>{
        const email = inputEmail;
        const password =  inputPassword; 
        try {
            const userCredential = await signInWithEmailAndPassword(auth, email, password)
            const loginUser = userCredential.user
            setLoginSuccess(true)
            setErrorMessage("")

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
    

    return (
        <div>
         
            <div className="main">
                <div className="switch">
                    <div className="switch-word" onClick={handleSwitchClick}>
                    切至{isLoginFormVisible ? "註冊" : "登入"}
                    </div>
                </div>
            <div className={isLoginFormVisible ? "login-box" : "register-box"}>
            {isLoginFormVisible ? (
            <>
                <div className="login-title">登入鳥友會員</div>
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