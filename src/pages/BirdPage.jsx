import { NavLink, useParams , useNavigate } from 'react-router-dom';
import React from "react";
import { useState, useEffect, setState, useRef }  from "react";
import { getFirestore, Firestore ,collection, addDoc, doc, getDoc ,getDocs, onSnapshot
    , querySnapshot , getApp, getApps,  getDocFromCache , query, where } from "firebase/firestore";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import { BirdPageCSS } from '../css/BirdPage.scss'
import Base from '../pages/Base.jsx'
import UploadBird from './page_control/UploadBird.jsx';
import db from './../../firebase-servise.js';
import { auth } from './../../firebase-servise.js';
import { storage } from './../../firebase-servise.js';
import { getStorage, ref , uploadBytes, getDownloadURL } from "firebase/storage";
import { requestOptions } from './page_control/eBird.jsx';
import { async } from '@firebase/util';
import loader from './page_control/googleMap.jsx';


const BirdPage = () =>{
    let { code } = useParams();
    const [audioCode , setAudioCode] = useState("")
    const [birdNameCH , setBirdNameCH] = useState("")
    const [birdNameSCI, setBirdNameSCI] = useState("")
    const [birdImg, setBirdImg] = useState("https://geekrobocook.com/wp-content/uploads/2021/04/KFC-Chicken-fry.jpg")
    const [nativeness, setNetiveness] = useState("")
    const [TWspecial , setTWspecial] = useState("")
    const [showAudio, setShowAudio] = useState(false);
    const [showButton , setShowButton] = useState(true);
    const [showMessage, setShowMessage] = useState(false);
    
    const handleClick = () => {
        if (audioCode !== "Not found") {
          setShowAudio(true);
          setShowButton(false);
        }
        else{
            setShowMessage(true);
        }
    }  

    useEffect(() => {
        const getBird = async() =>{
            const compareBird = await getDoc(doc(db, "bird", "bird_info"));    
            const birdData = 
                compareBird.data().bird_data.filter(
                    bird => code.includes(bird.spp_code) );
            // console.log(birdData)
            const audioCode = birdData[0].audio_code
            const birdNameCH = birdData[0].ch_name
            const birdImg = birdData[0].img
            const nativeness = birdData[0].nativeness
            const birdNameSCI = birdData[0].sci_name
            let TWspecial = birdData[0].tw_special
            setAudioCode(audioCode)
            setBirdNameCH(birdNameCH)
            setBirdImg(birdImg)
            setBirdNameSCI(birdNameSCI)
            setNetiveness(nativeness)
            if (TWspecial === ""){
                TWspecial = "非台灣特有"
            }
            setTWspecial(TWspecial) 
                   

        }
        getBird();
    }, []);
    // 上傳鳥照
    const [showUpload, setShowUpload] = useState(false);
    const [warning , setWarning] = useState("")
    const uploadBirdRef = useRef(null);
    const callUpload = () =>{
        if (getUser == true){
            setShowUpload(!showUpload);
            setWarning("");
        }
        else{
            setWarning("請先登入會員");           
        }      
    }
    const handleDateChange = (event) => {
        setSelectedDate(event.target.value);
    };
    const [getPhoto , setGetPhoto] = useState([]);
    const [selectedDate , setSelectedDate] = useState("");
    const [birdName , setBirdName] = useState([]);
    const [birdCode , setBirdCode] = useState([]);
    const [birdTime , setBirdTime] = useState([]);
    const [birdLocal , setBirdLocal]= useState([]);
    const [locId , setLocId] = useState([]);
    // 會員基本資料
    const [userEmail , setUserEmail] = useState("")
    const [getUser , setGetUser] = useState(false)
    useEffect(() => {
        const auth = getAuth();
        onAuthStateChanged(auth, (user) => {
            if (user) {
                // User is signed in, see docs for a list of available properties
                const email = user.email                     
                setUserEmail(email)          
                setGetUser(true)           
            } else {
                // User is signed out
                setGetUser(false) 
            }
        });       
    }, []);
    // 展示鳥照，不同會員都要拿到
    const [birdPhotoUser, setBirdPhotoUser] = useState([])
    useEffect(() => {
        const getBirdPhoto = async()=>{
          try{
            // const docSnap = await getDoc(doc(db, "Upload_bird_photo", userEmail+"#"+selectedDate));
            // console.log("中文資料", docSnap.id)
            const ref = collection(db, "Upload_bird_photo");
            const q = query(ref, where("spp_code", "==", code));
            const querySnapshot = await getDocs(q);
            const userShotImgList = []
            const birdNameList = []
            const birdCodeList = []
            const birdTimeList = []
            const birdLocalList = []
            const locIdList = []
            const birdPhotoUserList = []
            querySnapshot.forEach((doc) => {
              // 可以再拿其他代碼做利用，用where即可
              // console.log(doc.id, doc.data().img);
              const userShotImg = doc.data().img           
              userShotImgList.push(userShotImg)
              birdNameList.push(doc.data().ch_name)
              birdCodeList.push(doc.data().spp_code)
              birdTimeList.push(doc.data().date)
              birdLocalList.push(doc.data().locationName)
              locIdList.push(doc.data().location)
              birdPhotoUserList.push(doc.data().userName)
  
            });
            setGetPhoto(userShotImgList)
            setBirdName(birdNameList)
            setBirdCode(birdCodeList)
            setBirdTime(birdTimeList)
            setBirdLocal(birdLocalList)
            setLocId(locIdList)
            setBirdPhotoUser(birdPhotoUserList)           
            

          }
          catch(e){
            console.log("拿鳥照", e)
          }
        }
        getBirdPhoto();
      }, [getUser]);
    const [width, setWidth] = useState("300");
    const [height, setHeight] = useState("400");
    const [top, setTop]= useState('0');
    const [left, setLeft]= useState('0');
    useEffect(() => {
        function handleResize() {
          if (window.innerWidth <= 1000) {
            setWidth("30%");
            setHeight("400");
          } else {
            setWidth("300");
            setHeight("400");
          }
        }
        window.addEventListener("resize", handleResize);
        return () => window.removeEventListener("resize", handleResize);
      }, []);
    return(
        <div>
            <Base></Base>
            <div className='main-bird'>            
            {showUpload && <UploadBird onSelectedDateChange={handleDateChange}  onClose={() => setShowUpload(!showUpload)} />}
                <div className='content'>
                    <div className='big-sci-box'>
                        <div className='big-sci-name'>{birdNameSCI}</div>
                    </div>                    
                    <img className='bird-img-backgound' src={birdImg}></img>
                    <img className='bird-img' src={birdImg}></img>   
                  
                    <div className='bird-name-card'>
                        <div className='bird-name'>{birdNameCH}</div>
                        <div className='bird-sci-name' 
                        style={
                            {transform: 'skew(-10deg)'}  
                        }
                        >{birdNameSCI}</div>
                        <div className='native'>{nativeness} , {TWspecial}</div>                      
            
                    </div> 
                    {showMessage && (
                    <div className="message">目前未收錄此鳥種錄音喔 !</div>
                    )}
                    {showButton && (
                    <button onClick={handleClick} className='call-audio'>啾啾叫</button>
                    )}
                        {showAudio && (
                        <iframe src={`https://macaulaylibrary.org/asset/${audioCode}/embed`}
                                className='audio'
                               
                                // top={top}
                                // left={left}
                                height='300px'
                                width='400px'
                                allowFullScreen
                        ></iframe>
                        )}             
                </div>                
                
                <div className='bird-section-member-work'>
                    <h1 className='h1-bird-work'>會員作品展示區</h1>
                    <button className='upload-bird-at-page' onClick={callUpload}
                    onClose={(onClose) => setShowUpload(false)} 
                    style = {{ position : 'relative'}}
                    ref={uploadBirdRef}
                  > + </button> 
                  {warning && 
                    <div className="warning-login"
                        style={{position: 'absolute'}}
                    >
                        {warning}
                    </div>}

                    {getPhoto.map((getPhoto , index) => (  
                      <React.Fragment key={getPhoto}>
                      <div className="image-container" style={{ position: 'relative' }}>
                        <img key={getPhoto} src={getPhoto} className="get-user-photo" />  
                        <div className="bird-data-container" style={{ position: 'absolute', top: 0, left: 0 }}>
                          <div className='bird-data-name-container' style={{ position: 'relative', display: 'inline-block' , width: '100%'}}>
                            <p className='bird-data'>
                                {birdName[index]} {birdTime[index]}
                                <br/>
                                提供: {birdPhotoUser[index]}
                            </p>
                            <NavLink to={`/bird/${birdCode[index]}`}
                              style={{ width: '100%', height:'100%',
                              position: 'absolute', top: 0, left: 0}}
                            ></NavLink>
                          </div>
                          <div className='bird-data-local-container' style={{ position: 'relative', display: 'inline-block' }}>
                            <p className='bird-data'
                              style={{ 
                                fontSize: '12px', overflow: 'hidden' ,
                                textDecoration: 'none', color:'white'                                
                                }}
                            >
                              {birdLocal[index]}      
                                                    
                          </p>
                          <NavLink to={`/hotspot/${locId[index]}`} 
                              style={{ width: '100%', height:'100%',
                                       position: 'absolute', top: 0, left: 0}}
                          ></NavLink>
                          </div>
                          {/* </div> */}
                        </div>
                      </div>                          
                      </React.Fragment>
                    ))}                
                </div>
                   
              
            </div>{/* main */}
            
            
          
        </div>
    )
}

export default BirdPage