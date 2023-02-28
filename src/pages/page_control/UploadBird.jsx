import 'firebaseui/dist/firebaseui.css';
import React , { useEffect, useState, useRef , useCallback , useMemo }from "react";
import { getAuth, onAuthStateChanged ,signOut , updateProfile} from "firebase/auth";
import { getFirestore, doc, setDoc , getDoc , getDocs , addDoc ,collection, 
        updateDoc } from "firebase/firestore";
import { useNavigate } from "react-router-dom";
import db from '../../../firebase-servise.js';
import { auth } from '../../../firebase-servise.js';
import { storage } from '../../../firebase-servise.js';
import { getStorage, ref , uploadBytes, getDownloadURL } from "firebase/storage";
import { async } from '@firebase/util';
import { UploadBirdCSS } from '../../css/UploadBird.scss'

const UploadBird = ({onClose}) =>{
    const inputRef = React.createRef
    const navigate = useNavigate();//取得 navigate
    const [showAll , setShowAll] = useState(true)
    const [photoUrl, setPhotoUrl] = useState('https://images.plurk.com/LHcdc5166UeWc8bXYDVm.png');
    const [inputValueName , setInputValueName] = useState('')
    const [birdNameCH, setBirdNameCH] = useState([]);
    const [selectedBird, setSelectedBird] = useState('');
    const [selectedName , setSelectedName] = useState(false);
    const [selectedFile, setSelectedFile] = useState(null);
    // 景點找區用
    const [inputValueRegion, setInputValueRegion] = useState("");
    const [inputValueLocal , setInputValueLocal] = useState("");
    const [regionCode, setRegionCode] = useState([]);
    const [regionName, setRegionName] = useState([]);
    const [hideResultName ,setHideResultName] = useState(false);
    const [hideResultRegion ,setHideResultRegion] = useState(false);
    const [hideResultLocal ,setHideResultLocal] = useState(false);
    const [localName , setLocalName] = useState([]);
    const [localCode , setLocalCode] =  useState([]);
    // 關閉隱藏整個組件
    const handleClose = () => {
        setShowAll(!showAll);
        onClose();
    };
    // 選鳥照
    const handleUpload = async(event) =>{
        const selectedFile = event.target.files[0];
        const url = URL.createObjectURL(selectedFile);
        setSelectedFile(selectedFile);
        setPhotoUrl(url);
    }
    // 拿user基本資料
    const [userEmail , setUserEmail] = useState("")
    const [warning , setWarning] = useState("")
    const [displayName , setDisplayName] =useState("")
    useEffect(() => {
        const auth = getAuth();
        onAuthStateChanged(auth, (user) => {
            if (user) {
                const email = user.email        
                setUserEmail(email) 
                setDisplayName(user.displayName)             
            } else {
                // User is signed out
                // 這邊製作警告
                setWarning("請先登入再使用這功能!")
            }
        });
    }, []);
    const searchBird = async(inputValueName) =>{
        try{
            const docSnap = await getDoc(doc(db, "bird", "bird_info"));
            const birdData = docSnap.data().bird_data
            const birdTarget = 
            birdData.filter( bird => bird.ch_name.includes(inputValueName));
            // 輸入找鳥
            if(inputValueName !== ""){
                let i = 0;
                let birdNameList = []             
                for (i = 0 ; i < birdTarget.length  ; i ++){
                    const birdName = birdTarget[i].ch_name
                    birdNameList.push(birdName)                   
                }
                setBirdNameCH(birdNameList)                
            }
        }
        catch(e){
            // console.log(e.message)
        }

    }
    useEffect(() => {
        searchBird(inputValueName);
    }, [inputValueName]);
    const searchRegion = async(inputValueRegion)=>{
        try{
            const docSnap = await getDoc(doc(db, "TW", "location"));
            const regionData =  docSnap.data().tw_code|| [];
            if (inputValueRegion !== ""){
                const regionTarget = 
                regionData.filter( item => {
                    if (item.ch_name) {
                    return item.ch_name.includes(inputValueRegion);
                  }
                  return false;
                })
                if (regionTarget.length > 0){                
                    let i = 0;
                    let regionCodeList = []
                    let regionNameList = []
                    for (i = 0 ; i < regionTarget.length ; i ++){
                        const regionCode = regionTarget[i].code
                        const regionName = regionTarget[i].ch_name
                        regionCodeList.push(regionCode)
                        regionNameList.push(regionName)
                    }
                    setRegionCode(regionCodeList)
                    setRegionName(regionNameList)
                    }
            }
        }
        catch (e){
            // console.log(e.message)
        }
    }
    const [localData, setLocalData] = useState([]);
    const searchLocal = async(regionName) =>{
        try{
            const docSnap = await getDoc(doc(db, "TW", regionName));           
            const localData =  docSnap.data().hotspot            
            setLocalData(localData);     
        }
        catch (e) {
            // console.log("Error searchLocal:", e);
        }     
    }
    const  searchLocalName = (inputValueLocal) =>{
        if(inputValueLocal !== "") {
            const localTarget = 
            localData.filter( item => item.name.includes(inputValueLocal));            
            let i = 0;
            let localNameList = []
            for (i = 0 ; i < localTarget.length ; i++){
                const localName = localTarget[i].name
                localNameList.push(localName)
            }        
            setLocalName(localNameList)
        }
    }
    const [selectedDate, setSelectedDate] = useState("");
    const handleDateChange = (event) => {
        setSelectedDate(event.target.value);
    };
    const [getPhoto , setGetPhoto] = useState("")
    const uploadDetail = async() =>{
        try{
            if( photoUrl !== "https://images.plurk.com/LHcdc5166UeWc8bXYDVm.png" &&
                inputValueName && inputValueRegion && inputValueLocal && selectedDate !== ""
                ){
                setWarning("上傳中，完成會自動刷新頁面")
                // 上傳照片資料
                // 篩選出鳥名、鳥code
                const docSnap = await getDoc(doc(db, "bird","bird_info"));
                const birdData = docSnap.data().bird_data
                // 使用 filter 過濾出符合 inputValueName 的 birdData
                const filteredData = birdData.filter((data) =>
                data.ch_name.includes(inputValueName)
                );
                // 從 filteredData 取得對應的 spp_code
                const birdCode = filteredData.map((data) => data.spp_code);
                // 整理成locId
                const docSnapLocal = await getDoc(doc(db, "TW",inputValueRegion));
                const localData = docSnapLocal.data().hotspot
                const filteredDataLocal = localData.filter((data) =>
                data.name.includes(inputValueLocal)
                );
                const locId = filteredDataLocal.map((data) => data.locId)
                //傳照片到storage
                const uploadPath = `birdPhoto/${userEmail}/${inputValueName}_${birdCode}_${locId}_${selectedDate}.jpg`
               
                uploadBytes(ref(storage, uploadPath), selectedFile )
                .then(()=>{
                    getDownloadURL(ref(storage, uploadPath)).then((url)=>{
                        setGetPhoto(url)
                        setWarning("上傳中，完成會自動刷新頁面")                 
                        updateDoc(doc(db, "Upload_bird_photo", userEmail +"#"+selectedDate), 
                        {                            
                            img:url,                       
                        });

                       
                    })
                }).then(async()=>{                                     
                    const userDocRef = await setDoc(doc(db, "Upload_bird_photo", userEmail +"#"+selectedDate ),
                    {
                      email: userEmail,
                      img:'',
                      ch_name: inputValueName,
                      spp_code: birdCode[0],
                      location: locId[0],
                      locationName: inputValueLocal,
                      date: selectedDate,
                      userName: displayName
                    },
                    { merge: true }
                  )           
                }).then(()=>{
                    navigate(0);
                })
  
            }
            else if(photoUrl == "https://images.plurk.com/LHcdc5166UeWc8bXYDVm.png"){
                setWarning("請選擇照片!")
            }
            else if(inputValueName || inputValueRegion || inputValueLocal || selectedDate == ""){
                setWarning("資訊欄位不可空白")
            }
       
        }
        catch(e){
            console.log(e.message)
        }
    }
    return(
        <div> 
            {showAll && (
            <div className='white-background'>                
                <div className='upload-box'>
                    <div className='bird-photo-box'
                    style={{ position: 'relative', overflow: 'hidden' }}
                    onClick={() => inputRef.current}>
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
                        onChange={e => {
                            setInputValueName(e.target.value)
                            searchBird(e.target.value)
                        }}                   
                        className='name-detail' type={'search'}
                        /> 
                         <div className='scroll-box-upload'>  
                            {birdNameCH.map((birdName, index) => (
                                !hideResultName &&
                                <div key={index}>
                                        <div 
                                        className='bird-search-upload'
                                        onClick={() => {
                                            // setSelectedBird(birdName)
                                            setSelectedName(true)
                                            setHideResultName(true);
                                            setInputValueName(birdName)
                                        }}
                                        >{birdName}</div>
                                </div>
                            ))}
                        </div>
                        2.請輸入拍攝縣市地區:
                        <input placeholder='有需要請使用｢台」字'
                            className='region-detail'type={'search'}
                            value={inputValueRegion}
                            onChange={e => {
                                setInputValueRegion(e.target.value)  
                                searchRegion(e.target.value)       
                            }}                                    
                        />
                        <div className='scroll-box-region'>
                        {regionName.map((regionName , regionIndex) =>(
                            !hideResultRegion &&
                            <div key={regionIndex} className='region-search'
                                onClick={() => { 
                                    setInputValueRegion(regionName);
                                    // setShowInput(true);
                                    setHideResultRegion(true);
                                    searchLocal(regionName);                      
                                    // setSelectedRegion(regionName)                   
                                    }}>    
                            {regionName}
                            </div>                            
                        ))}
                        </div>
                        3.請輸入拍攝地點:
                        <input placeholder='請先輸入地區再進行此欄位輸入'
                            className='local-detail'type={'search'}
                            value={inputValueLocal} 
                            onChange={e => {
                                setInputValueLocal(e.target.value);
                                searchLocalName(e.target.value);
                            }} 
                        />
                        <div className='scroll-box-local'>
                        {localName.map((localName, localIndex) =>(
                            !hideResultLocal &&
                            <div key={localIndex} 
                            className='local-search'
                            onClick={() => { 
                                setInputValueLocal(localName);   
                                setHideResultLocal(true);
                                searchLocal(regionName);       
                            }}>                               
                             {localName}
                            </div>
                        ))}
                        </div>
                        4.請選擇拍攝日期:
                        <input className='choose-date' type={'date'}
                            value={selectedDate}
                            onChange={handleDateChange}
                        />
                    </div>
                    <div className='warning'>{warning}</div>
                    <button className='upload'onClick={uploadDetail}
                    style={{ marginLeft: `${warning ? '4%' : '56%'}`}}
                    >確定上傳</button>
                </div>
                <button className='close'
                onClick={()=>{
                    handleClose();
                    onClose
                    }}
                > X </button>
            </div>
            )}            
        </div>
    )
}

export default UploadBird 