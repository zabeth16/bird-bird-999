import 'firebaseui/dist/firebaseui.css';
import React , { useEffect, useState, useRef , useCallback , useMemo }from "react";
import { getAuth, onAuthStateChanged ,signOut , updateProfile} from "firebase/auth";
import { getFirestore, doc, setDoc , getDoc , getDocs } from "firebase/firestore";
import { useNavigate } from "react-router-dom";
import db from '../../../firebase-servise.js';
import { auth } from '../../../firebase-servise.js';
import { storage } from '../../../firebase-servise.js';
import { getStorage, ref , uploadBytes, getDownloadURL } from "firebase/storage";
import { async } from '@firebase/util';
import { UploadBirdCSS } from '../../css/UploadBird.scss'

const UploadBird = () =>{
    const inputRef = React.createRef
    const [photoUrl, setPhotoUrl] = React.useState('https://images.plurk.com/LHcdc5166UeWc8bXYDVm.png');
    const [inputValueName , setInputValueName] = useState('')
    const [birdNameCH, setBirdNameCH] = useState([]);
    const [code , setCode] = useState([]);
    const handleUpload = async(event) =>{
        const selectedFile = event.target.files[0];
        const url = URL.createObjectURL(selectedFile);
        setPhotoUrl(url);
    }
    const searchBird = async() =>{
        try{
            const docSnap = await getDoc(doc(db, "bird", "bird_info"));
            const birdData = docSnap.data().bird_data
            const birdTarget = 
            birdData.filter( bird => bird.ch_name.includes(inputValueName));
            // 輸入找鳥
            if(inputValueName !== ""){
                let i = 0;
                let birdNameList = []
                let birdCodeList = []
                let birdNameSCIList = []
                for (i = 0 ; i < birdTarget.length  ; i ++){
                    const birdName = birdTarget[i].ch_name
                    const birdCode = birdTarget[i].spp_code
                    const birdNameSCI = birdTarget[i].sci_name
                    birdNameList.push(birdName)
                    birdCodeList.push(birdCode)
                    birdNameSCIList.push(birdNameSCI) 
                }
                setBirdNameCH(birdNameList)
                setCode(birdCodeList)
            }
        }
        catch(e){
            console.log(e.message)
        }

    }
    useEffect(() => {
        searchBird(inputValueName);
    }, [inputValueName]);
    return(
        <div>
            <div className='white-background'>
                <div className='upload-box'>
                    <div className='bird-photo-box'
                    style={{ position: 'relative', overflow: 'hidden' }}
                    onClick={() => inputRef.current.click()}>
                        點擊此區上傳鳥照片
                        <input                            
                            type='file'
                            accept='image/*'
                            className='bird-photo-upload'
                            ref={inputRef}
                            onChange={handleUpload}                     
                        />
                        <img src={photoUrl} className='previous-bird-photo'></img>
                    </div>
                    <div className='photo-detail'>
                        1.請輸入鳥種名稱:
                        <input placeholder='中文，可以只打關鍵字來即時查找'
                        value={inputValueName}
                        onChange={e => setInputValueName(e.target.value)}
                        className='name-detail' type={'search'}/>
                         <div className='scroll-box'>{/* style寬度要再調，然後點選的值要帶進去輸入框內顯示 */}
                            {birdNameCH.map((birdName, index) => (
                                <div key={index}>
                                        <div className='bird-search'>{birdName}</div>
                                </div>
                            ))}
                        </div>
                        2.請輸入拍攝縣市地區:
                        <input placeholder='有需要請使用｢台」字'
                        className='region-detail'type={'search'}/>
                        3.請輸入拍攝地點:
                        <input placeholder='請先輸入地區再進行此欄位輸入'
                        className='local-detail'type={'search'}/>
                        4.請選擇拍攝日期:
                        <input className='choose-date' type={'date'}/>{/* type 時間 */}
                    </div>
                    <button className='upload'>確定上傳</button>
                </div>
            </div>
        </div>
    )
}

export default UploadBird