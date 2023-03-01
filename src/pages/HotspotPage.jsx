import { NavLink, useParams , useNavigate} from 'react-router-dom';
import React from "react";
import { useState, useEffect, setState, useRef }  from "react";
import { getFirestore, Firestore ,collection, addDoc, doc, getDoc ,getDocs, onSnapshot
    , querySnapshot , getApp, getApps,  getDocFromCache , query, where} from "firebase/firestore";
import { HotspotPageCSS } from '../css/HotspotPage.scss'
import { getAuth, onAuthStateChanged ,signOut , updateProfile} from "firebase/auth";
import Base from '../pages/Base.jsx'
import UploadBird from './page_control/UploadBird.jsx';
import db from './../../firebase-servise.js';
import { auth } from './../../firebase-servise.js';
import { storage } from './../../firebase-servise.js';
import { getStorage, ref , uploadBytes, getDownloadURL } from "firebase/storage";
import { requestOptions } from './page_control/eBird.jsx';
import { async } from '@firebase/util';
import loader from './page_control/googleMap.jsx';


const HotspotPage = ()=>{
    let { code } = useParams();
    const [hotspotName, setHotspotName] = useState("");
    const [hotspotLat, setHotspotLat] = useState("");
    const [hotspotLng, setHotspotLng] = useState("");
    const [birds, setBirds] = useState([]);
    const [birdCode, setBirdCode] = useState([]);
    // 只顯示前五個鳥種
    const [showCount, setShowCount] = useState(5);
    // 長鳥
    const[longBird , setLongBird] = useState(["/img/head.png" , "/img/neck.png" , "/img/foot.png"])
    const [scroll, setScroll] = useState("hidden");
    useEffect(() => {
        const getHotspotInfo = async() =>{           
            // 該區詳細
            // GET Hotspot Info
            fetch("https://api.ebird.org/v2/ref/hotspot/info/" + code , requestOptions)
            .then(response => response.text())
            .then(result =>{
                // console.log(result)
                const data = JSON.parse(result)                
                const name = data.name                
                setHotspotName(data.name)
                setHotspotLat(data.lat)
                setHotspotLng(data.lng)
                // 該區google map
                loader.load().then(() => {
                    const target = { lat: data.lat, lng: data.lng }
                    const map = new google.maps.Map(document.getElementById("map"), {
                    center: target,
                    zoom: 15,
                    });
                    // The marker, positioned at center
                    const marker = new google.maps.Marker({
                        position: target,
                        map: map,
                        icon: 'https://images.plurk.com/1WrhkGlC1xDtqnFEPkz6sA.png',
                        animation: google.maps.Animation.BOUNCE
                    });
                })
            })
            .catch(error => console.log('error', error));
        }
        getHotspotInfo();
        const getSpplist = async() =>{
            // GET Species List for a Region
            fetch("https://api.ebird.org/v2/product/spplist/" + code , requestOptions)
            .then(response => response.text())
            .then(async result =>{
                // console.log(result)
                const data = JSON.parse(result);
                // console.log(data[0]);
                const compareBird = await getDoc(doc(db, "bird", "bird_info"));    
                const birdData = 
                    compareBird.data().bird_data.filter(
                        bird => data.includes(bird.spp_code) );
                // console.log(birdData)
                const birdName = birdData.map(name => name.ch_name)
                const birdCode = birdData.map(item => item.spp_code)
                // console.log(birdName)
                setBirds(birdName)
                setBirdCode(birdCode)
                           
                
                                   
            })
            .catch(error => console.log('error', error));
        }
        getSpplist();
    }, []);
    // // scroll
    // useEffect(() => {
    //     const container = document.querySelector(".show-bird-list-container");
    //     if (container.offsetHeight > 150) {
    //       setScroll("scroll");
    //     } else {
    //       setScroll("hidden");
    //     }
    //   }, [showCount, birds]);

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
    const [birdCodeWork , setBirdCodeWork] = useState([]);
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
        const q = query(ref, where("location", "==", code));
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
        setBirdCodeWork(birdCodeList)
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

    return (
    <div>
        <Base></Base>
        {showUpload && <UploadBird onSelectedDateChange={handleDateChange}  onClose={() => setShowUpload(!showUpload)} />}
        <div className='main-hotspot'>
            <div className='hotspotName-box'>
                <h1 className='hotspotName'>{hotspotName}</h1>
            </div>            
            <div className='bird-in-hotspot'>
                <div className='bird-title'>
                    該地區的可見鳥鳥
                </div>     
                {/* <div className={`show-bird-list-container ${scroll}`}> */}
                {/* 前五個鳥鳥 */}
                {birds.slice(0, showCount).map((bird , index) => (                 

                    <div key={bird} className='show-bird-list'>  
                    <div className='bird-box-hopspot'>                 
                        <NavLink to={`/bird/${birdCode[index]}`} className='bird'>{bird}</NavLink>   
                    </div>
                    <img src={index === 0 ? longBird[0] : index === birds.length - 1 ? longBird[2] : longBird[1]}
                    className="bird-image" /> 
                    </div>
                ))}
                {/* 點擊則顯示後續的鳥鳥 */}
                {showCount < birds.length && (
                    <button onClick={() => setShowCount(birds.length)} className='show-more'>Show More </button>
                )}
                {/* 收合回到一開始的五個鳥鳥 */}
                {showCount === birds.length ? (
                    <button onClick={() => setShowCount(5)} className='show-less'> Show Less </button>
                ) : null}
                {/* </div> */}
            </div>
            <div id='map'></div>  
            <div className='bird-section-member-work'>
                    <h1 className='h1-bird-work'>會員作品展示區</h1>
                    <button className='upload-bird' onClick={callUpload}
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
                          <div style={{ position: 'relative', display: 'inline-block' , width: '100%'}}>
                            <p className='bird-data'>
                                {birdName[index]} {birdTime[index]}
                                <br/>
                                提供: {birdPhotoUser[index]}
                            </p>
                            <NavLink to={`/bird/${birdCodeWork[index]}`}
                              style={{ width: '100%', height:'100%',
                              position: 'absolute', top: 0, left: 0}}
                            ></NavLink>
                          </div>
                          <div style={{ position: 'relative', display: 'inline-block' }}>
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

        </div>
        
                
        
                
        


    </div>
        
    )
}
export default HotspotPage