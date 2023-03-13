import { NavLink } from 'react-router-dom';
import React from "react";
import { useState, useEffect, useMemo, memo,setState, useRef }  from "react";
import { getFirestore, Firestore ,collection, addDoc, doc, getDoc ,getDocs, onSnapshot
    , querySnapshot , getApp, getApps,  getDocFromCache} from "firebase/firestore";
import { MapPageSCSS } from '../css/MapPage.scss'
import Base from '../pages/Base.jsx'
import db from './../../firebase-service.js';
import { requestOptions } from './page_control/eBird.jsx';
// import MapLocalComponent, { MapLocal } from './page_control/MapLocal.jsx'
// import  hotspot  from './page_control/MapLocal.jsx';

// 每個地區 ref 點擊用
const myRef = React.createRef();
const myRefKin = React.createRef();
const myRefLie = React.createRef();
const myRefTnn = React.createRef();
const myRefCyq = React.createRef();
const myRefCyi = React.createRef();
const myRefYun = React.createRef();
const myRefKhh = React.createRef();
const myRefPif = React.createRef();
const myRefCha = React.createRef();
const myRefTxg = React.createRef();
const myRefNan = React.createRef();
const myRefMia = React.createRef();
const myRefTtt = React.createRef();
const myRefHsz = React.createRef();
const myRefHsq = React.createRef();
const myRefTao = React.createRef();
const myRefHua = React.createRef();
const myRefTpq = React.createRef();
const myRefIla = React.createRef();
const myRefTpe = React.createRef();
const myRefKee = React.createRef();



const MapPage = () =>{

    // 各季節渲染
    const [season, setSeason] = useState('春');
    const [seasonBackground , setSeasonBackground] = useState('春')
    const [triangleLeft, setTriangleLeft] = useState('-200%');
    const [seasonImage, setSeasonImage] = useState("/img/春鳥.png");
    const [seasonImageOpacity , setSeasonImageOpacity] = useState('1');
    const handleSeasonClick = (event) => {
      setSeason(event.target.textContent);
      setSeasonBackground(event.target.textContent)
      setTriangleLeft('0');
        setTimeout(() => {
        setTriangleLeft('-200%');
        }, 1100);
        if (event.target.textContent === "春") {
            setSeasonImage("/img/春鳥.png");
            setSeasonImageOpacity(1);
            setTimeout(() => {
                setSeasonImageOpacity(0)
            }, 1100);
          } else if (event.target.textContent === "夏") {
            setSeasonImage("/img/夏鳥.png");
            setSeasonImageOpacity(1);
            setTimeout(() => {
                setSeasonImageOpacity(0)
            }, 1100);
          } else if (event.target.textContent === "秋") {
            setSeasonImage("/img/秋鳥.png");
            setSeasonImageOpacity(1);
            setTimeout(() => {
                setSeasonImageOpacity(0)
            }, 1100);
          } else if (event.target.textContent === "冬") {
            setSeasonImage("/img/冬鳥.png");
            setSeasonImageOpacity(1);
            setTimeout(() => {
                setSeasonImageOpacity(0)
            }, 1100);
          }

    };

    // Local 資訊BOX
    const [isVisible, setIsVisible] = useState(false);       
    useEffect(() => {
        // hide info-box           
        setIsVisible(false); 
    }, []);
    const showInfoBox = () => {
        setIsVisible(true);
        const infoBox = document.querySelector('.local-info-box');
        infoBox.classList.add('show');       
    };    
    // 季節地圖 RWD
    // 視窗小於600 替換成文字區域列表
    const [isSmallWindow, setIsSmallWindow] = useState(window.innerWidth < 600);
    useEffect(() => {
        function handleResize() {
          setIsSmallWindow(window.innerWidth < 600);
        }
    
        window.addEventListener('resize', handleResize);
    
        return () => {
          window.removeEventListener('resize', handleResize);
        }
    }, []);
    // 視窗小於600 隱藏、拿出我的資訊和地圖
    const [loadingHide, setLoadingHide] = useState(false);
    const [localInfoBoxHide, setLocalInfoBoxHide] = useState(false);
    const handleClick = () => {
        if (window.innerWidth < 600) {   
          setLoadingHide(true);
          setLocalInfoBoxHide(true);          
        }
        else{
            // 普通召喚
        }
    }


    // 前三景點title上方大標
    const [showHotTitle, setShowHotTitle] = useState(false);
    // Loading
    const [isLoading, setIsLoading] = useState(true);
    useEffect(() => {           
        setIsLoading(false);
    }, []);    
    // 熱門景點
    const [hotspot, setHotspot] = useState([]);
    const [hotspotId, setHotspotId] = useState([])
    // 該區熱門鳥種name
    const [birdTWname, setbirdTWname] = useState([])
    // 該區熱門鳥種photo
    const [birdTWphoto, setbirdTWphoto] = useState([])
    // 該區代碼，往景點列表用
    const [regionCode, setRegionCode] = useState('');
    // 鳥種代碼，往鳥類圖鑑頁面用
    const [birdCode, setBirdCode] = useState([]);

    // 用MapLocal(myRef) 拿到該區域，再串API
    const MapLocal= async (myRef) =>{
        // Loading動畫
        setIsLoading(true)        
        const pathId = myRef.current.getAttribute('id');
        // console.log(pathId);
        const locationDoc = await getDocs(collection(db, "TW"));
        locationDoc.forEach(async document =>{
            // console.log(document.id)
            if (pathId === document.id){    
                // console.log("OK")     
                try {
                    const docSnap = await getDoc(doc(db, "TW", pathId));
                    // console.log(docSnap.data().hotspot[0].locId)
                    const regionCode = docSnap.data().hotspot[0].regionCode                    
                    const locId = docSnap.data().hotspot[0].locId
                    // 串API囉各位           
                    fetch("https://api.ebird.org/v2/ref/hotspot/" + regionCode  , requestOptions)
                    .then(response => response.text())
                    .then(result =>               
                        // console.log(result)
                        {
                        const arr = result.split("\n").map(row => {
                            const newRow = row.replace(/"([^"]*)"/g, (_, match) => match.replace(/,/g, ' '));
                            const [localId, country, code, , lat, long, name, date, num] = newRow.split(",");                        
                            return { localId, country, code, lat, long, name, date, num: parseInt(num) };
                        })
                            
                            const sorted = arr.sort((a, b) => b.num - a.num);                                                     
                            // console.log(sorted[0],sorted[1],sorted[2]);
                            const filterNan = sorted.filter(item => !isNaN(item.num));
                            const hotspot1 = filterNan[0].name
                            const hotspot2 = filterNan[1].name
                            const hotspot3 = filterNan[2].name
                            const hotspot1ID = filterNan[0].localId
                            const hotspot2ID = filterNan[1].localId
                            const hotspot3ID = filterNan[2].localId
                            setHotspot([hotspot1, hotspot2, hotspot3]);
                            setHotspotId([hotspot1ID, hotspot2ID, hotspot3ID])
                            // 進階搜尋各季節鳥類，且要拿出台灣特有種
                            if (season === '春') {
                                // fetch春季的API
                                // Historic observations on a date                               
                                fetch("https://api.ebird.org/v2/data/obs/" +
                                regionCode + "/historic/2022/4/16" , requestOptions)
                                .then(response => response.text())
                                .then(async result => {
                                    // console.log("春")
                                    // console.log(result)
                                    const parsedData = JSON.parse(result);
                                    // 下方 item 是可以隨意命名的
                                    const speciesCodes = parsedData.map(item => item.speciesCode);
                                    // speciesCodes 是陣列
                                    // console.log(speciesCodes);
                                    const compareBird = await getDoc(doc(db, "bird", "bird_info"));
                                    const allSpp = compareBird.data().bird_data[0].spp_code
                                    // console.log(compareBird.data().bird_data[0].spp_code)
                                    const birdSpecial = 
                                    compareBird.data().bird_data.filter(
                                        bird => speciesCodes.includes(bird.spp_code) );
                                    // console.log(birdSpecial)
                                    const threeBirdSpecial = birdSpecial.slice(0, 3);
                                    // console.log(threeBirdSpecial);                                
                                    const threeBirdName = threeBirdSpecial.map(name => name.ch_name)
                                    const threeBirdPhoto = threeBirdSpecial.map(photo =>photo.img)
                                    const newBirdPhotos = threeBirdPhoto.map(photo => photo.replace("'", "\""));
                                    // console.log("鳥名", threeBirdName,"鳥照", newBirdPhotos)
                                    const threeBirdCode = threeBirdSpecial.map(name => name.spp_code)

                                    if (! newBirdPhotos[1]){
                                        newBirdPhotos[1] = "https://cdn.download.ams.birds.cornell.edu/api/v1/asset/251151871/1200"
                                        threeBirdName[1] = "喜鵲"
                                        threeBirdCode[1] = "orimag1"
                                    }
                                    if (! newBirdPhotos[2]){
                                        newBirdPhotos[2] = "https://cdn.download.ams.birds.cornell.edu/api/v1/asset/254741801/1200"
                                        threeBirdName[2] = "蒼鷺"
                                        threeBirdCode[2] = "graher1"
                                    }
                                    const birdName1 = threeBirdName[0]
                                    const birdName2 = threeBirdName[1]
                                    const birdName3 = threeBirdName[2]
                                    const birdPhoto1 = `${newBirdPhotos[0]}`;
                                    const birdPhoto2 = `${newBirdPhotos[1]}`;
                                    const birdPhoto3 = `${newBirdPhotos[2]}`;
                                    const birdCode1 = threeBirdCode[0];
                                    const birdCode2 = threeBirdCode[1];
                                    const birdCode3 = threeBirdCode[2];
                                    setbirdTWname([
                                        birdName1, birdName2 , birdName3,                                
                                    ])
                                    setbirdTWphoto([
                                        birdPhoto1, birdPhoto2 , birdPhoto3
                                    ])
                                    setBirdCode([
                                        birdCode1 , birdCode2, birdCode3
                                    ])
                                    setIsLoading(false);
                                    showInfoBox();
                                    setShowHotTitle(true);
                                    setRegionCode(regionCode)                              
                                })

                              } else if (season === '夏') {
                                // fetch夏季的API
                                // Historic observations on a date                               
                                fetch("https://api.ebird.org/v2/data/obs/" +
                                regionCode + "/historic/2022/8/6" , requestOptions)
                                .then(response => response.text())
                                .then(async result => {
                                    // console.log("夏")
                                    // console.log(result)
                                    const parsedData = JSON.parse(result);
                                    // 下方 item 是可以隨意命名的
                                    const speciesCodes = parsedData.map(item => item.speciesCode);
                                    // speciesCodes 是陣列
                                    // console.log(speciesCodes);
                                    const compareBird = await getDoc(doc(db, "bird", "bird_info"));
                                    const allSpp = compareBird.data().bird_data[0].spp_code
                                    // console.log(compareBird.data().bird_data[0].spp_code)
                                    const birdSpecial = 
                                    compareBird.data().bird_data.filter(
                                        bird => speciesCodes.includes(bird.spp_code) );
                                    // console.log(birdSpecial)
                                    const threeBirdSpecial = birdSpecial.slice(0, 3);
                                    // console.log(threeBirdSpecial);
                                    const threeBirdName = threeBirdSpecial.map(name => name.ch_name)
                                    const threeBirdPhoto = threeBirdSpecial.map(photo =>photo.img)
                                    const newBirdPhotos = threeBirdPhoto.map(photo => photo.replace("'", "\""));
                                    const threeBirdCode = threeBirdSpecial.map(name => name.spp_code)
                                    // console.log("鳥名", threeBirdName,"鳥照", newBirdPhotos)
                                    if (! newBirdPhotos[0]){
                                        newBirdPhotos[0] = "https://cdn.download.ams.birds.cornell.edu/api/v1/asset/254741801/1200"
                                        threeBirdName[0] = "蒼鷺"
                                        threeBirdCode[0] = "graher1"
                                    }
                                    if (! newBirdPhotos[1]){
                                        newBirdPhotos[1] = "https://cdn.download.ams.birds.cornell.edu/api/v1/asset/158684261/1200"
                                        threeBirdName[1] = "白頭翁"
                                        threeBirdCode[1] = "livbul1"
                                    }
                                    if (! newBirdPhotos[2]){
                                        newBirdPhotos[2] = "https://cdn.download.ams.birds.cornell.edu/api/v1/asset/158482801/1800"
                                        threeBirdName[2] = "山麻雀"
                                        threeBirdCode[2] = "russpa2"
                                    }
                                    const birdName1 = threeBirdName[0]
                                    const birdName2 = threeBirdName[1]
                                    const birdName3 = threeBirdName[2]
                                    const birdPhoto1 = `${newBirdPhotos[0]}`;
                                    const birdPhoto2 = `${newBirdPhotos[1]}`;
                                    const birdPhoto3 = `${newBirdPhotos[2]}`;
                                    const birdCode1 = threeBirdCode[0];
                                    const birdCode2 = threeBirdCode[1];
                                    const birdCode3 = threeBirdCode[2];
                                    setbirdTWname([
                                        birdName1, birdName2 , birdName3,                                
                                    ])
                                    setbirdTWphoto([
                                        birdPhoto1, birdPhoto2 , birdPhoto3
                                    ])
                                    setBirdCode([
                                        birdCode1 , birdCode2, birdCode3
                                    ])
                                    setIsLoading(false);
                                    showInfoBox();
                                    setShowHotTitle(true);
                                    setRegionCode(regionCode);
                                })

                              } else if (season === '秋') {
                                // fetch秋季的API
                                // Historic observations on a date                               
                                fetch("https://api.ebird.org/v2/data/obs/" +
                                regionCode + "/historic/2022/10/16" , requestOptions)
                                .then(response => response.text())
                                .then(async result => {
                                    // console.log("秋")
                                    // console.log(result)
                                    const parsedData = JSON.parse(result);
                                    // 下方 item 是可以隨意命名的
                                    const speciesCodes = parsedData.map(item => item.speciesCode);
                                    // speciesCodes 是陣列
                                    // console.log(speciesCodes);
                                    const compareBird = await getDoc(doc(db, "bird", "bird_info"));
                                    const allSpp = compareBird.data().bird_data[0].spp_code
                                    // console.log(compareBird.data().bird_data[0].spp_code)
                                    const birdSpecial = 
                                    compareBird.data().bird_data.filter(
                                        bird => speciesCodes.includes(bird.spp_code) );
                                    // console.log(birdSpecial)
                                    const threeBirdSpecial = birdSpecial.slice(0, 3);
                                    // console.log(threeBirdSpecial);
                                    const threeBirdName = threeBirdSpecial.map(name => name.ch_name)
                                    const threeBirdPhoto = threeBirdSpecial.map(photo =>photo.img)
                                    const newBirdPhotos = threeBirdPhoto.map(photo => photo.replace("'", "\""));
                                    const threeBirdCode = threeBirdSpecial.map(name => name.spp_code)
                                    // console.log("鳥名", threeBirdName,"鳥照", newBirdPhotos)
                                    if (! newBirdPhotos[0]){
                                        newBirdPhotos[0] = "https://cdn.download.ams.birds.cornell.edu/api/v1/asset/251151871/1200"
                                        threeBirdName[0] = "喜鵲"
                                        threeBirdCode[0] = "orimag1"

                                    }
                                    if (! newBirdPhotos[1]){
                                        newBirdPhotos[1] = "https://cdn.download.ams.birds.cornell.edu/api/v1/asset/158483201/1200"
                                        threeBirdName[1] = "赤翡翠"
                                        threeBirdCode[1] = "rudkin1"
                                    }
                                    if (! newBirdPhotos[2]){
                                        newBirdPhotos[2] = "https://cdn.download.ams.birds.cornell.edu/api/v1/asset/158505701/1200"
                                        threeBirdName[2] = "東方毛腳燕"
                                        threeBirdCode[2] = "ashmar1"
                                    }                              
                                    const birdName1 = threeBirdName[0]
                                    const birdName2 = threeBirdName[1]
                                    const birdName3 = threeBirdName[2]
                                    const birdPhoto1 = `${newBirdPhotos[0]}`;
                                    const birdPhoto2 = `${newBirdPhotos[1]}`;
                                    const birdPhoto3 = `${newBirdPhotos[2]}`;
                                    const birdCode1 = threeBirdCode[0];
                                    const birdCode2 = threeBirdCode[1];
                                    const birdCode3 = threeBirdCode[2];
                                    setbirdTWname([
                                        birdName1, birdName2 , birdName3,                                
                                    ])
                                    setbirdTWphoto([
                                        birdPhoto1, birdPhoto2 , birdPhoto3
                                    ])
                                    setBirdCode([
                                        birdCode1 , birdCode2, birdCode3
                                    ])
                                    setIsLoading(false);
                                    showInfoBox();
                                    setShowHotTitle(true);
                                    setRegionCode(regionCode);
                                })
                              } else if (season === '冬') {
                                // fetch冬季的API
                                // Historic observations on a date                               
                                fetch("https://api.ebird.org/v2/data/obs/" +
                                regionCode + "/historic/2023/1/31" , requestOptions)
                                .then(response => response.text())
                                .then(async result => {
                                    // console.log("冬")
                                    const parsedData = JSON.parse(result);
                                    // 下方 item 是可以隨意命名的
                                    const speciesCodes = parsedData.map(item => item.speciesCode);
                                    // speciesCodes 是陣列
                                    // console.log(speciesCodes);
                                    const compareBird = await getDoc(doc(db, "bird", "bird_info"));
                                    const allSpp = compareBird.data().bird_data[0].spp_code
                                    // console.log(compareBird.data().bird_data[0].spp_code)
                                    const birdSpecial = 
                                    compareBird.data().bird_data.filter(
                                        bird => speciesCodes.includes(bird.spp_code) );
                                    // console.log(birdSpecial)
                                    const threeBirdSpecial = birdSpecial.slice(0, 3);
                                    // console.log(threeBirdSpecial);
                                    const threeBirdName = threeBirdSpecial.map(name => name.ch_name)
                                    const threeBirdPhoto = threeBirdSpecial.map(photo =>photo.img)
                                    const newBirdPhotos = threeBirdPhoto.map(photo => photo.replace("'", "\""));
                                    const threeBirdCode = threeBirdSpecial.map(name => name.spp_code)
                                    // console.log("鳥名", threeBirdName,"鳥照", newBirdPhotos)
                                    if (! newBirdPhotos[0]){
                                        newBirdPhotos[0] = "https://cdn.download.ams.birds.cornell.edu/api/v1/asset/133755601/1200"
                                        threeBirdName[0] = "棕背伯勞"
                                        threeBirdCode[0] = "lotshr1"
                                    }
                                    if (! newBirdPhotos[1]){
                                        newBirdPhotos[1] = "https://cdn.download.ams.birds.cornell.edu/api/v1/asset/144184611/1200"
                                        threeBirdName[1] = "八哥(冠八哥)"
                                        threeBirdCode[1] = "cremyn"
                                    }
                                    if (! newBirdPhotos[2]){
                                        newBirdPhotos[2] = "https://cdn.download.ams.birds.cornell.edu/api/v1/asset/254741801/1200"
                                        threeBirdName[2] = "蒼鷺"
                                        threeBirdCode[2] = "graher1"
                                    }
                                    const birdName1 = threeBirdName[0]
                                    const birdName2 = threeBirdName[1]
                                    const birdName3 = threeBirdName[2]
                                    const birdPhoto1 = `${newBirdPhotos[0]}`;
                                    const birdPhoto2 = `${newBirdPhotos[1]}`;
                                    const birdPhoto3 = `${newBirdPhotos[2]}`;
                                    const birdCode1 = threeBirdCode[0];
                                    const birdCode2 = threeBirdCode[1];
                                    const birdCode3 = threeBirdCode[2];
                                    setbirdTWname([
                                        birdName1, birdName2 , birdName3,                                
                                    ])
                                    setbirdTWphoto([
                                        birdPhoto1, birdPhoto2 , birdPhoto3
                                    ])
                                    setBirdCode([
                                        birdCode1 , birdCode2, birdCode3
                                    ])
                                    setIsLoading(false);
                                    showInfoBox();
                                    setShowHotTitle(true);
                                    setRegionCode(regionCode);                                    
                                })
                              }

                        }
                        
                    ).catch(error => console.log('error', error))
                    
                } catch (e) {
                    console.log("Error getting cached document:", e);
                }             
            }         
        })
    }


    return (        
        <div>
        <Base></Base>
        <div className='guide-title'>點擊區域查看熱門景點&鳥種吧 !</div>
        <div className='main'>            
    <div className={`map-box season-${seasonBackground}`}
         style={{  
            marginLeft: isLoading || isVisible
            ? 0 : ''
            // 巢狀的三元運算子，但無法像CSS及時更新。
            // : window.innerWidth < 600
            // ? '10%'
            // : window.innerWidth < 700
            // ? '20%'
            // : window.innerWidth < 900
            // ? '25%'
            // : window.innerWidth < 1000
            // ? '28%'
            // : window.innerWidth < 1100
            // ? '30%'
            // : window.innerWidth < 1200
            // ? 'unset'
            // : '0%'
         }}
    >

        <div className={`triangle${isVisible ? ' watch' : ''}`}  style={{ left: triangleLeft }}> 
            <img src={seasonImage} className={`corner-season-bird${isVisible ? ' watch' : ''}`}
            style={{ opacity: seasonImageOpacity }}
            />
        </div>   
 
        <div className='season-box'>
            <button className={`season-1 ${season === "春" ? "selected" : ""}`} onClick={handleSeasonClick} >春</button>
            <button className={`season-2 ${season === "夏" ? "selected" : ""}`} onClick={handleSeasonClick} >夏</button>
            <button className={`season-3 ${season === "秋" ? "selected" : ""}`} onClick={handleSeasonClick} >秋</button>
            <button className={`season-4 ${season === "冬" ? "selected" : ""}`} onClick={handleSeasonClick} >冬</button>
        </div>
    {isSmallWindow ? 
        <div className={`region-label ${isLoading ? 'hide' : ''}`}>
            <NavLink to='/map' 
              onClick={async() => {
                    await MapLocal(myRefTpe);
                    setShowHotTitle(!showHotTitle);
                    handleClick();
                    }          
                } 
            className='region'>
            <div  ref={myRefTpe} className="region-txt" id="台北市景點">台北市景點</div>
            </NavLink>
            <NavLink to='/map'
                    onClick={async() => {
                        await MapLocal(myRefTpq);
                        setShowHotTitle(!showHotTitle);
                        handleClick();
                        }          
                    }  
            className='region'>
                <div value="新北市" ref={myRefTpq} className="region-txt" id="新北市景點">新北市景點</div>
            </NavLink>         
            <NavLink to='/map'
                onClick={async() => {
                    await MapLocal(myRefKee);
                    setShowHotTitle(!showHotTitle);
                    handleClick();
                    }          
                } 
            className='region'>
                <div value="基隆市" ref={myRefKee} className="region-txt"  id="基隆市景點">基隆市景點</div>
            </NavLink>
            <NavLink to='/map'
                onClick={async() => {
                    await MapLocal(myRefIla);
                    setShowHotTitle(!showHotTitle);
                    handleClick();
                    }          
                }  
            className='region'>
                <div value="宜蘭縣" ref={myRefIla} className="region-txt" id="宜蘭縣景點">宜蘭縣景點</div>
            </NavLink>
            <NavLink to='/map'
                    onClick={async() => {
                        await MapLocal(myRefHua);
                        setShowHotTitle(!showHotTitle);
                        handleClick();
                        }          
                    }  
            className='region'>
                <div value="花蓮縣" ref={myRefHua} className="region-txt" id="花蓮縣景點">花蓮縣景點</div>
            </NavLink>
            <NavLink to='/map' 
            onClick={async() => {
                        await MapLocal(myRefTtt);
                        setShowHotTitle(!showHotTitle);
                        handleClick();
                        }          
                    } 
            className='region'>
                <div value="台東縣" ref={myRefTtt} className="region-txt" id="台東縣景點">台東縣景點</div>
            </NavLink>         
            <NavLink to='/map'
                    onClick={async() => {
                        await MapLocal(myRefTao);
                        setShowHotTitle(!showHotTitle);
                        handleClick();
                        }          
                    }  
            className='region'>
                <div value="桃園市" ref={myRefTao} className="region-txt" id="桃園市景點">桃園市景點</div>
            </NavLink>
            <NavLink to='/map'
                onClick={async() => {
                    await MapLocal(myRefHsq);
                    setShowHotTitle(!showHotTitle);
                    handleClick();
                    }          
                } 
            className='region'>
                <div value="新竹縣" ref={myRefHsq} className="region-txt" id="新竹縣景點">新竹縣景點</div>
            </NavLink>
            <NavLink to='/map'
                onClick={async() => {
                    await MapLocal(myRefHsz);
                    setShowHotTitle(!showHotTitle);
                    handleClick();
                    }          
                } 
            className='region'>
                <div value="新竹市" ref={myRefHsz} className="region-txt" id="新竹市景點">新竹市景點</div>
            </NavLink>
            <NavLink to='/map'
            onClick={async() => {
                    await MapLocal(myRefMia);
                    setShowHotTitle(!showHotTitle);
                    handleClick();
                    }          
                } 
            className='region'>
                <div value="苗栗縣" ref={myRefMia} className="region-txt" id="苗栗縣景點">苗栗縣景點</div>
            </NavLink>
            <NavLink to='/map'
                onClick={async() => {
                    await MapLocal(myRefTxg);
                    setShowHotTitle(!showHotTitle);
                    handleClick();
                    }          
                } 
            className='region'>
                <div value="台中市" ref={myRefTxg} className="region-txt" id="台中市景點">台中市景點</div>
            </NavLink>
            <NavLink to='/map'
                onClick={async() => {
                    await MapLocal(myRefCha);
                    setShowHotTitle(!showHotTitle);
                    handleClick();
                    }          
                } 
            className='region'>
                <div value="彰化縣" ref={myRefCha} className="region-txt" id="彰化縣景點">彰化縣景點</div>
            </NavLink>
           
            <NavLink to='/map'
            onClick={async() => {
                        await MapLocal(myRefNan);
                        setShowHotTitle(!showHotTitle);
                        handleClick();
                        }          
                    } 
            className='region'>
                <div value="南投縣" ref={myRefNan} className="region-txt" id="南投縣景點">南投縣景點</div>
            </NavLink>
          
            <NavLink to='/map'
                onClick={async() => {
                    await MapLocal(myRefYun);
                    setShowHotTitle(!showHotTitle);
                    handleClick();
                    }          
                }    
            className='region'>
                <div value="雲林縣" ref={myRefYun} className="region-txt" id="雲林縣景點">雲林縣景點</div>
            </NavLink>
            <NavLink to='/map'
                // key={myRefCyq}
                onClick={async() => {
                    await MapLocal(myRefCyq);
                    setShowHotTitle(!showHotTitle);
                    handleClick();
                    }          
                }                  
            className='region'>
                <div value="嘉義縣" ref={myRefCyq} className="region-txt" id="嘉義縣景點">嘉義縣景點</div>
            </NavLink>
           
            <NavLink to='/map'
                // key={myRefCyi}
                onClick={async() => {
                    await MapLocal(myRefCyi);
                    setShowHotTitle(!showHotTitle);
                    handleClick();
                    }          
                }
            className='region'>
                <div value="嘉義市" ref={myRefCyi} className="region-txt" id="嘉義市景點">嘉義市景點</div>
            </NavLink>
            <NavLink to='/map'
                onClick={async() => {
                    await MapLocal(myRefTnn);
                    setShowHotTitle(!showHotTitle);
                    handleClick();
                    }          
                }  
                className='region'
            >
            <div value="台南市" ref={myRefTnn} className="region-txt" id="台南市景點">台南市景點</div>
            </NavLink>
           
            <NavLink to='/map'
                onClick={async() => {
                    await MapLocal(myRefKhh);
                    setShowHotTitle(!showHotTitle);
                    handleClick();
                    }          
                } 
            className='region'>
                <div value="高雄市"  ref={myRefKhh} id="高雄市景點" className="region-txt">高雄市景點</div>
            </NavLink>
          
            <NavLink to='/map'
                onClick={async() => {
                    await MapLocal(myRefPif);
                    setShowHotTitle(!showHotTitle);
                    handleClick();
                    }          
                } 
            className='region'>
                <div value="屏東縣" ref={myRefPif} className="region-txt" id="屏東縣景點">屏東縣景點</div>
            </NavLink>
            <NavLink to='/map'                
                onClick={async() => {
                    await MapLocal(myRefLie);
                    setShowHotTitle(!showHotTitle);
                    handleClick();
                    }          
                }  
                className='region'
            >
            <div value="連江縣" ref={myRefLie} className="region-txt" id="連江縣景點">連江縣景點</div>
            </NavLink>
            <NavLink to='/map'
                onClick={async() => {
                    await MapLocal(myRefKin);
                    setShowHotTitle(!showHotTitle);
                    handleClick();
                    }          
                }  
                className='region'
            >
                <div value="金門縣" ref={myRefKin}  className="region-txt" id='金門縣景點'>金門縣景點</div>
            </NavLink>
            <NavLink to='/map'
                key={myRef}
                onClick={async() => {
                    await MapLocal(myRef);
                    setShowHotTitle(!showHotTitle);
                    handleClick();
                    }          
                } 
            className='region'>
                <div value="澎湖縣" ref={myRef} className="region-txt" id ="澎湖縣景點">澎湖縣景點</div>
            </NavLink>
           
        </div>
    :
    <svg version="1.1" id="map-TW" xmlns="http://www.w3.org/2000/svg" 
    x="0px" y="0px" viewBox="0 0 800 800" >
    {/*  style="enable-background:new 0 0 800 800;"  */}
    {/* <NavLink to='/map' id="基隆市">Keelung City 基隆市 */}

    <NavLink to='/map'
        onClick={async() => {
            await MapLocal(myRefKee);
            setShowHotTitle(!showHotTitle);
            }          
        } 
    className='local'>
        <path ref={myRefKee} className="st0" id="基隆市景點" d="M535.22,62.51c2.79-1.1,7.33-0.06,8.1,4.02c0.71,3.8,2.12,2.24,3.56,1.13c1.47-1.17,2.61-2.98,4.72-1.38
        c1.13,0.83,3.4,0.52,3.22,2.7c-0.18,1.99-1.93,1.99-3.47,2.36c-5.4,1.23-7.15,3.9-4.51,8.31c3.13,5.31-1.53,3.93-3.13,4.94
        c-6.69-0.18-19.11-10.67-19.72-16.26c-0.12-0.89,0.31-1.26,0.95-1.47C528.5,65.64,531.81,63.89,535.22,62.51z" />
    </NavLink>
    {/* </NavLink> */}
    {/* <NavLink to='/map' id="台北市">Taipei City 台北市 */}
    <NavLink to='/map' 
              onClick={async() => {
                await MapLocal(myRefTpe);
                setShowHotTitle(!showHotTitle);
                }          
            } 
            className='local'>
        <path ref={myRefTpe} className="st0" id="台北市景點" d="M497.73,92.67c-0.89,0.28-1.87,1.35-2.64,0.06c-0.55-0.95-0.12-2.06,0.58-2.85c2.18-2.36,2.24-5.25,2.18-8.19
        c-0.09-3.1-1.35-5.55-4.42-6.13c-4.51-0.86-3.74-3.56-1.99-5.89c2.36-3.22,4.48-6.75,8.56-8.53c2.09-0.89,3.53-3.16,5.43-4.6
        c2.48-1.87,4.85-0.86,5.25,1.75c0.77,5.06,4.72,9.02,4.48,14.36c-0.03,0.71,1.17,1.6,1.96,2.18c2.42,1.75,3.16,3.68,1.78,6.59
        c-1.69,3.56-0.8,6.93,2.52,10.03c-6.53,1.38-7.12,2.39-6.59,8.77c0.12,1.26,2.18,3.1-0.15,3.9c-1.93,0.71-4.69,0.61-5.64-1.26
        c-1.5-2.98-5.06-3.96-6.01-7.42C502.43,93.25,500.4,91.81,497.73,92.67z" />
    </NavLink>
    {/* </NavLink> */}
    {/* <NavLink to='/map' id="宜蘭縣">Yilan County 宜蘭縣 */}
    <NavLink to='/map'
          onClick={async() => {
            await MapLocal(myRefIla);
            setShowHotTitle(!showHotTitle);
            }          
        }  
    className='local'>
        <path ref={myRefIla} className="st0" id="宜蘭縣景點" d="M475.25,231.43c-2.02,1.07-2.98,1.01-4.05-0.92c-0.46-0.86-1.35-2.15-2.06-2.18c-6.32-0.03-4.88-4.94-5.83-8.62
        c-1.29-5,2.27-6.99,4.97-9.75c4.32-4.42,8.74-8.1,9.54-15.55c0.67-6.5,6.01-12.39,8.44-18.89c1.63-4.36,4.2-6.01,8.44-6.66
        c7.7-1.17,12.97-7.12,19.63-10.4c2.82-1.41,1.96-4.36,1.84-6.93c-0.15-3.44-0.43-5.95,4.14-8.28c6.87-3.56,15.4-4.69,20.31-11.72
        c1.38-1.96,3.5-2.02,5.61-1.44c3.8,1.07,5.98-0.34,6.56-4.2c0.67-4.2,2.45-6.47,7.3-6.84c4.91-0.4,6.53-3.8,4.97-8.47
        c-0.58-1.78-0.8-3.65,1.23-3.4c4.57,0.55,7.98-2.02,11.63-3.86c0.67,1.35,0.18,2.27-0.43,2.7c-5.34,3.65-7.7,9.82-12.24,14.23
        c-7.82,7.61-10.09,27.97-4.51,37.11c1.56,2.58,0.98,4.97,0.92,7.42c-0.15,7.55,3.99,13.86,5.89,20.77
        c0.95,3.37,0.49,6.78,1.56,10.09c0.61,1.93-1.56,2.79-3.13,3.53c-3.1,1.44-4.82,3.47-2.76,6.87c1.01,1.69,0.52,2.7-0.77,3.99
        c-6.17,6.26-10.58,13.34-10.67,22.58c-0.03,3.86-3.96,6.96-2.42,11.29c-9.05-1.72-17.27-4.82-24.63-9.82
        c-3.01-2.02-3.96-0.55-4.42,2.15c-0.77,4.48-7.73,7.73-11.44,5.18c-2.64-1.84-5.71-2.76-8.68-2.7c-4.82,0.09-8.65-2.02-11.29-5.28
        C484.64,228.18,480.1,228.86,475.25,231.43z" />
    </NavLink>
    {/* </NavLink> */}
    {/* <NavLink to='/map' id="新北市">New Taipei City 新北市 */}
    <NavLink to='/map'
            onClick={async() => {
                await MapLocal(myRefTpq);
                setShowHotTitle(!showHotTitle);
                }          
            }  
    className='local'>
        <path ref={myRefTpq} className="st0" id="新北市景點" d="M592.06,95.58c-0.43-1.9-2.06-3.01-4.42-2.27c-2.48,0.74-5.74,0.31-6.41-1.93c-1.47-4.91-5.15-9.54-4.08-14.82
        c0.8-4.02-0.8-4.82-3.74-4.57c-4.45,0.34-8.9-0.49-13.19-0.77s-6.26,3.93-10.37,3.1c-1.23-0.28-1.81,2.67-0.74,4.32
        c1.2,1.81,3.5,3.77,0.98,5.71c-2.33,1.78-5.18,4.02-8.44,2.64c-8.31-3.56-15.86-8.07-20.06-16.41c-0.28-0.55-0.55-1.13-0.8-1.72
        c-0.92-2.18-0.15-3.19,1.9-3.77c2.3-0.67,4.63-1.35,6.84-2.3c4.17-1.78,4.94-6.47,0.98-8.07c-6.13-2.48-8.1-7.36-10.06-12.79
        c-1.56-4.26-5.71-6.96-9.54-6.93c-9.66,0.12-17.94,4.32-23.99,12.05c-2.09,2.64-3.37,5.89-5.03,8.86c-0.52,0.89-1.26,2.24,0,2.61
        c4.29,1.29,5.49,5.37,8.19,8.96c2.94-6.01,8.86-8.22,13.19-12.3c1.35-1.26,2.18-4.66,4.39-3.31c2.21,1.35,5.25,2.52,5.71,5.98
        c0.61,4.39,2.21,8.9,4.23,12.48c0.28,0.52,0.58,1.01,0.89,1.5c2.79,4.42,3.47,8.01,2.61,12.58c-0.58,3.19,1.38,4.63,3.96,5.58
        c1.41,0.55,4.2-0.49,3.77,2.18c-0.34,2.21-2.85,1.1-4.42,1.47c-0.67,0.15-1.35,0.28-1.99,0.4c-6.17,1.32-7.02,3.68-2.91,8.68
        c1.72,2.09,1.13,2.7-1.07,3.5c-6.35,2.3-13.56-1.6-16.84-8.22c-1.17-2.39-1.69-3.44-4.29-2.09c-2.52,1.32-3.77,0.15-4.23-2.52
        c-0.46-2.55,0.03-4.48,1.69-6.59c2.61-3.37,1.81-8.19-1.87-9.02c-5.12-1.13-6.2-4.72-7.48-8.65c-0.71-2.18-1.87-4.02-3.8-5.34
        c-1.04-0.74-2.09-1.44-3.19-0.28c-5.55,5.67-12.18,8.74-20.21,8.5c-0.86-0.03-1.78,0.34-1.84,1.38c-0.06,1.04,0.89,1.47,1.66,1.69
        c3.22,0.8,6.07,2.39,8.65,4.36c1.07,0.86,0.8,3.25,2.91,3.1c6.01-0.43,7.76,2.7,8.53,8.25c0.83,5.77-3.16,13.53-8.74,12.76
        c-6.17-0.86-6.13,3.01-5.95,6.32c0.12,2.55,1.6,4.94-0.31,7.45c-0.18,0.25,0.61,1.56,1.26,1.99c3.28,2.3,4.11,6.04,4.57,9.42
        c0.31,2.55,1.38,3.19,3.04,2.79c7.98-1.84,10.71,3.74,13.96,9.14c1.41,2.36,1.72,3.99-0.34,5.77c-3.4,3.01-2.39,6.17-0.15,9.14
        c2.06,2.73,4.88,4.97,6.5,7.94c1.6,2.94,3.28,2.61,5.86,1.93c5.15-1.29,7.94-6.26,13.1-7.67c2.94-0.8,4.6-2.94,2.64-6.78
        c-1.41-2.7-0.58-6.53,2.09-8.22c3.9-2.48,7.48-5.77,12.64-5.98c2.52-0.09,4.54-1.44,6.47-3.56c2.76-3.04,5.83-6.44,10.95-5.28
        c2.67,0.58,4.51-1.07,4.82-3.5c0.71-5.46,3.77-7.48,8.99-7.94c2.79-0.25,5.34-1.44,3.22-5.52c-2.18-4.11,0.15-7.21,4.82-6.44
        c2.48,0.4,4.33,0.12,6.07-1.56c1.81-1.75,4.05-2.48,6.5-2.79c2.88-0.37,5.83-0.67,8.59-1.53C590.06,98.25,592.58,97.79,592.06,95.58
        z" />
    </NavLink>
    {/* </NavLink> */}
    {/* <NavLink to='/map' id="花蓮縣">Hualien County 花蓮縣 */}
    <NavLink to='/map'
               onClick={async() => {
                await MapLocal(myRefHua);
                setShowHotTitle(!showHotTitle);
                }          
            }  
    className='local'>
        <path ref={myRefHua} className="st0" id="花蓮縣景點" d="M478.38,454.8c-5.83,9.23-9.51,19.45-13.25,29.6c-0.4,1.13-0.71,2.61-1.53,3.22
        c-4.02,2.88-3.59,7.02-3.56,11.13c0.03,2.09,0.71,4.63-2.67,5.21c-2.42,0.4-5,2.15-6.35-1.66c-0.21-0.58-0.86-1.26-1.44-1.41
        c-7.15-1.9-9.91-7.36-12.05-13.83c-1.04-3.04-3.8-5.46-7.85-3.65c-1.1,0.49-2.48,1.1-3.31-0.12c-1.78-2.64-4.69-3.53-7.33-4.39
        c-7.61-2.42-8.44-9.57-9.39-15.28c-0.98-5.71-4.11-8.37-8.16-10.83c-3.01-1.84-5.37-2.76-1.1-6.23c2.79-2.24,6.17-5.18,3.99-10.06
        c-0.86-1.93,1.44-2.52,2.73-3.04c2.3-0.92,3.16-2.45,2.85-4.82c-0.89-6.93,3.74-11.5,10.71-10.61c6.23,0.77,7.39,0.09,8.04-5.86
        c0.67-6.1,4.2-9.78,9.57-11.66c4.17-1.44,5.4-4.51,5.83-8.16c0.52-4.11,1.44-8.01,2.52-11.99c1.63-5.89,0.18-11.41-4.51-15.74
        c-0.74-0.67-2.06-1.35-0.89-2.36c5.21-4.57,3.71-11.81,6.93-17.12c2.27-3.74,4.6-7.3,4.72-12.02c0.12-5.06,1.32-10.28-0.06-15.12
        c-0.83-3.01-0.52-5.28,0.55-7.79c2.15-5.06,3.77-10.28,8.19-14.26c1.93-1.75,3.47-5.31,0.37-8.19c-8.56-7.88-8.4-10.43,1.96-15.86
        c2.85-1.47,4.54-2.55,3.93-5.95c-0.15-0.83,0.43-2.33,1.1-2.7c6.5-3.62,5.98-12.88,13.28-16.07c2.3-0.98,3.19-4.23,3.34-7.18
        c0.18-3.77,2.02-4.51,5.03-2.18c2.09,1.66,4.45,2.33,7.15,2.45c3.62,0.12,7.12,1.17,10.06,3.44c2.3,1.78,5.09,1.99,7.76,2.52
        c0.89,0.15,1.93-0.4,2.91-0.61c-2.64-5.86,6.84-2.91,5.61-7.7c-0.12-0.49-0.49-0.89-0.77-1.35c7.18,6.41,17.15,5.83,24.78,9.91
        c-3.07,9.08-9.11,15.52-16.72,20.95c-3.62,2.61-5.28,6.87-3.74,11.53c1.23,3.71-0.18,6.1-2.91,8.5c-7.42,6.41-8.04,13.19-1.75,20.92
        c2.79,3.44,0.06,6.32-1.44,7.55c-3.96,3.22-3.8,6.72-3.96,11.23c-0.21,8.71-1.17,17.51-5.67,25.37c-1.01,1.72-1.32,3.53-1.23,5.43
        c0.34,5.09-0.03,9.91-3.68,14.02c-2.06,2.27-0.31,5.34-1.13,7.94c-3.4,10.86-3.25,22.58-7.76,33.25c-1.23,2.88-1.04,6.04-0.25,9.14
        c0.98,3.93-2.67,6.99-2.18,11.01c0.15,1.32-1.84,0.77-2.94,0.21c-4.36-2.18-7.91-0.34-10.46,2.88c-3.16,4.02-6.66,8.5-3.77,13.96
        C479.51,452.31,479.36,453.23,478.38,454.8z" />
    </NavLink>
    {/* </NavLink>
    <NavLink to='/map' id="桃園市"> */}
    <NavLink to='/map'
               onClick={async() => {
                await MapLocal(myRefTao);
                setShowHotTitle(!showHotTitle);
                }          
            }  
    className='local'>
        <path ref={myRefTao} className="st0" id="桃園市景點" d="M471.54,133.68c6.63-2.36,8.59,2.82,11.26,6.78c1.44,2.15,2.06,4.32-0.71,6.2c-1.63,1.13-1.44,2.98-0.95,4.72
        c1.26,4.36,3.04,8.44,6.78,11.26c1.53,1.13,3.07,2.94,1.32,4.11c-4.32,2.98-4.39,7.98-6.69,11.87c-0.8,1.32-1.44,2.98-2.64,3.74
        c-1.75,1.17-3.56,3.4-5.98,2.12c-2.09-1.07-2.76-3.04-3.4-5.64c-1.6-6.35-2.61-13.25-9.78-16.9c-2.85-1.44-1.13-5.8-1.87-8.77
        c-0.18-0.74,0.43-1.66,0.34-2.48c-0.12-1.32-12.82-11.72-14.14-11.56c-6.53,0.8-9.45-5.18-14.32-7.45c1.2-7.21-3.71-8.65-9.02-10.46
        c-1.35-0.46-2.36-1.93-4.48-1.87c-2.24,0.06-5.43-0.31-5.83-3.16c-0.86-6.17-4.26-8.07-9.94-7.27c-0.8,0.12-1.66-0.12-3.22-0.28
        c3.1-2.91,4.45-5.61,4.82-9.36c0.37-3.47,3.16-6.5,6.23-8.53c3.86-2.55,7.73-5.8,12.02-6.81c8.04-1.84,14.82-6.07,21.96-9.63
        c4.14-2.06,7.82-2.18,11.07,1.6c1.17,1.35,2.98,1.63,4.6,2.21c2.36,0.83,4.91,1.38,5.98,4.26c0.67,1.78,2.64,2.76,4.2,2.61
        c6.56-0.64,5.98,4.72,6.44,8.19c0.55,4.17-4.02,7.88-8.56,8.07c-5.52,0.21-7.18,2.61-6.72,10.43c0.21,4.17-0.25,8.59,3.99,11.5
        c1.66,1.13,1.47,3.31,0.49,4.72c-2.67,3.83-0.71,4.75,2.76,5.12C468.9,133.16,470.44,134.08,471.54,133.68z" />
    </NavLink>
    {/* </NavLink>
    <NavLink to='/map' id="新竹縣"> */}
    
        <g> <NavLink to='/map'
                onClick={async() => {
                    await MapLocal(myRefHsq);
                    setShowHotTitle(!showHotTitle);
                    }          
                } 
            className='local'>
            <path ref={myRefHsq} className="st0" id="新竹縣景點" d="M475.43,187.63c-7.42-0.83-7.91-7.42-8.77-12.21c-1.04-5.61-2.55-9.48-8.37-10.86
            c-2.24-0.52-1.99-2.24-1.9-4.11c0.18-3.31,1.29-8.22-0.43-9.72c-3.5-3.01-6.72-7.7-11.1-8.44c-6.29-1.1-10.03-5.52-14.97-8.34
            c-2.06-1.2-3.28-2.82-2.3-5.55c0.86-2.3-0.31-3.83-2.7-3.74c-4.66,0.18-8.28-2.7-12.45-3.96c-2.09-0.64-4.08-1.81-3.93-4.72
            c0.21-4.45-2.39-5.15-6.72-4.23c-2.52,0.18-6.72-0.61-7.64,3.31c-0.89,3.86-3.5,6.56-4.85,10.03c-2.36,5.95-2.21,6.47,3.93,8.1
            c7.18,1.93,11.1,6.59,11.63,13.83c0.09,1.35,0.34,2.91-1.13,3.71c-1.59,0.86-2.48-0.46-3.44-1.44c-0.92-0.98-1.63-2.27-3.37-1.26
            c-3.16,1.78-6.2,3.71-8.31,6.66c-1.63,2.33-2.82,5.06,2.12,4.57c2.12-0.21,3.22,0.58,3.47,2.76c0.55,4.94,9.75,15.58,14.72,16.35
            c4.11,0.61,6.29,3.59,5.95,6.44c-0.61,5-0.89,9.88-1.01,14.88c-0.12,4.32,0.8,6.01,5.25,4.51c2.48-0.86,4.94-1.84,7.45-1.35
            c3.8,0.74,7.48,1.01,11.07-0.67c1.38-0.64,2.91-0.71,3.8,0.52c3.04,4.05,6.26,8.07,8.71,12.51c1.9,3.37,5.74,5.18,8.65,2.76
            c1.26-1.04,1.99-2.7,2.91-4.11c5.06-7.55,14.85-11.99,14.82-22.97C476.51,189.38,477.92,187.91,475.43,187.63z" />
            </NavLink>
            <NavLink to='/map'
                onClick={async() => {
                    await MapLocal(myRefHsz);
                    setShowHotTitle(!showHotTitle);
                    }          
                } 
            className='local'>
            <path ref={myRefHsz} className="st0" id="新竹市景點" d="M393.26,147.2c2.94-2.7,5.34-3.53,8.5-0.06c-0.15-8.01-4.79-10.74-10.74-12.21c-1.13-0.28-2.33-0.64-3.34-1.2
            c-3.04-1.75-6.41-0.58-5.92,2.67c0.8,5.67-1.07,10.71-1.93,16.01c-0.37,2.39,2.3,3.31,3.4,5c0.55,0.86,2.02-0.21,2.27-1.26
            C386.48,151.71,390.25,149.9,393.26,147.2z" />
            </NavLink>
        </g>
    {/* </NavLink>
    <NavLink to='/map' id="台東縣"> */}
    <NavLink to='/map' 
            onClick={async() => {
                await MapLocal(myRefTtt);
                setShowHotTitle(!showHotTitle);
                }          
            } 
    className='local'>
        <path ref={myRefTtt} className="st0" id="台東縣景點" d="M469.64,479.28c4.48-8.25,5.86-18.07,12.45-25.24c1.69-1.81,0.64-2.98-0.77-4.26c-4.32-3.9,0-6.9,1.41-9.91
        c1.53-3.25,4.42-5.43,8.44-4.26c2.36,0.67,3.16,2.36,2.12,4.82c-2.21,5.31-2.88,10.92-3.31,16.56c-0.09,1.23-0.12,2.58-1.38,3.13
        c-4.66,2.09-5.67,6.5-7.12,10.71c-1.29,3.77-1.29,7.98-4.63,11.07c-1.53,1.44-1.96,4.32-1.13,6.38c1.75,4.36-0.8,8.77,0.64,13.13
        c0.71,2.15-1.78,3.68-3.07,4.23c-6.56,2.82-6.5,9.45-9.17,14.57c-3.16,6.07-3.77,13.31-9.45,18.34c-3.1,2.7-3.56,7.61-5.83,11.26
        c-2.18,3.5-4.36,6.23-8.4,7.64c-5.4,1.9-7.67,5.61-5.67,10.31c2.73,6.5-1.87,10.06-4.85,13.99c-5.74,7.55-14.63,11.17-22.36,16.04
        c-5.61,3.53-7.3,8.28-8.28,13.9c-0.34,2.06-0.06,4.45-1.69,5.8c-5.98,4.85-7.02,12.15-8.86,18.71
        c-2.85,10.15-6.63,19.91-10.77,29.45c-3.19,7.36-3.59,14.48-2.27,21.99c0.31,1.69,1.17,3.22-0.92,4.51
        c-1.72,1.01-2.67,0.46-4.11-0.52c-1.2-0.8-2.88-0.83-4.32-1.32c-5.09-1.78-6.35-7.21-10-10.4c-0.43-0.4-0.12-0.8,0.15-1.29
        c2.76-5.15-0.06-8.22-4.05-11.04c-4.69-3.37-4.32-7.7,0.92-10.34c3.47-1.78,3.9-4.08,1.87-7.09c-1.23-1.81-2.67-3.53-4.05-5.25
        c-0.77-0.98-1.87-2.55-1.23-3.16c4.45-4.26,0.55-7.98-0.67-11.72c-1.1-3.37-1.13-6.23-0.61-9.94c1.13-7.98,5.83-14.05,8.65-21.07
        c0.18-0.43,0.61-1.1,0.98-1.13c5.92-0.49,9.32-5.98,15.34-7.12c6.35-1.2,4.94-8.65,6.01-13.43c0.58-2.61,0.92-7.15-3.8-8.37
        c-3.34-0.89-3.99-3.25-3.4-6.41c0.77-4.08,0.92-8.01-4.36-9.36c-0.46-0.12-0.86-0.58-1.17-0.98c-3.4-4.23-3.62-15.49,0.12-19.51
        c3.16-3.4,4.08-8.31,8.01-11.1c0.46-0.34,0.95-1.38,0.77-1.81c-3.22-7.45,4.02-14.48,0.83-21.9c-0.25-0.61,0.12-1.81,0.61-2.36
        c3.71-4.02,4.6-9.02,4.94-14.17c0.12-1.99,0.89-3.25,2.82-3.8c0.49-0.12,1.1-0.34,1.32-0.74c3.62-6.23,10.89-6.69,16.16-10.31
        c3.9-2.7,6.26-0.4,6.69,2.85c0.89,7.15,4.66,11.04,11.41,12.55c1.63,0.34,2.67,1.53,3.53,2.79c1.53,2.21,3.31,2.67,5.77,1.5
        c3.68-1.81,5.86,0.31,6.29,3.56c0.89,6.59,4.82,10.28,10.52,12.64c0.77,0.31,2.09,0.61,2.18,1.1c1.78,8.16,7.39,3.04,10.83,2.58
        c4.36-0.55,2.67-5.15,3.13-8.4c-0.86-3.22,0.06-5.86,2.64-8.53C467.95,486.55,467.95,482.37,469.64,479.28z" />
    </NavLink>
    {/* </NavLink>
    <NavLink to='/map' id="苗栗縣"> */}
    <NavLink to='/map'
        onClick={async() => {
            await MapLocal(myRefMia);
            setShowHotTitle(!showHotTitle);
            }          
        } 
    className='local'>
        <path ref={myRefMia} className="st0" id="苗栗縣景點" d="M342.13,188.8c1.04-2.52,0.83-6.56,6.04-4.32c1.53,0.67,4.69-1.75,4.69-4.66c-0.03-6.78,5.77-11.04,12.36-8.74
        c1.44,0.52,3.04,1.69,4.17,0.06c1.13-1.6-0.58-2.3-1.66-3.1c-0.28-0.25-0.55-1.04-0.55-1.17c3.74-2.36,4.05-7.12,6.9-9.91
        c1.29-1.26,3.93-0.77,5.74,0.49c0.43,0.28,0.67,0.77,0.98,1.17c3.19,3.96,10.15,1.96,11.96,9.05c1.35,5.28,7.73,7.79,11.99,11.38
        c0.77,0.67,1.53,1.44,2.45,1.84c5.89,2.45,6.53,3.56,4.14,9.26c-0.89,2.18-1.96,3.96,0.18,5.98c0.77,0.74,0.52,1.78,0.21,2.88
        c-2.06,7.15,0.77,10.58,7.33,7.64c6.44-2.88,13.04,0.89,19.11-2.15c0.77-0.4,1.66,0.03,2.09,0.98c0.37,0.77,0.64,1.6,1.17,2.27
        c7.82,10.24,7.85,10.21,0.49,21.66c-2.61-2.85-5.21-2.94-7.45,0.37c-3.83,5.58-10.71,7.05-15.46,11.69
        c-2.98,2.88-8.93,2.18-12.27,6.32c-1.13,1.41-3.1-0.61-3.8-2.24c-1.69-3.83-4.48-5.21-8.62-5.06c-1.93,0.06-3.93-0.95-5.92-1.47
        c-5.06-1.35-7.39,0.55-6.99,5.71c0.09,1.44,0.18,2.76-1.2,3.68c-2.91,1.93-14.42,0.58-17.15-2.02c-0.49-0.46-0.98-1.26-1.53-1.32
        c-7.42-0.67-12.48-6.04-18.59-9.36c-6.41-3.47-9.75-9.75-14.66-14.63c-1.56-1.53-1.44-3.16,0.28-4.88
        C336.18,208.61,338.14,198.21,342.13,188.8z" />
    </NavLink>
    {/* </NavLink>
    <NavLink to='/map' id="南投縣"> */}
    <NavLink to='/map'
            onClick={async() => {
                await MapLocal(myRefNan);
                setShowHotTitle(!showHotTitle);
                }          
            } 
    className='local'>
        <path ref={myRefNan} className="st0" id="南投縣景點" d="M330.84,395.14c-0.95-2.67-5.34-3.71-3.8-7.12c1.93-4.32,2.45-8.47,0.64-12.85c-0.12-0.31-0.18-0.8-0.03-1.01
        c3.01-3.93,3.96-7.94,1.41-12.61c-0.67-1.2,1.41-1.6,2.42-2.12c1.87-0.95,3.74-1.96,4.11-4.23c0.31-2.02,0.18-3.74-2.76-3.68
        c-6.44,0.09-9.54-3.62-7.82-10.09c1.13-4.23,1.5-8.4,1.69-12.7c0.12-2.7,0.37-5.34,2.02-7.76c1.9-2.76,0.52-5.46-1.32-8.34
        c7.12-0.43,13.47-0.37,19.97,1.26c5,1.29,7.73-3.07,9.91-6.63c2.06-3.31,2.82-7.3,7.15-8.9c1.81-0.67,1.2-3.01,1.32-4.66
        c0.15-2.09,0.34-4.75,2.76-4.72c1.81,0.03,4.6,0.58,4.88,3.62c0.09,1.17,1.13,3.22,1.87,1.96c2.91-5.03,9.36-1.44,12.39-5.64
        c0.64-0.86,1.78-0.77,2.88-0.52c4.66,1.07,8.07-0.4,9.82-5.09c0.67-1.81,1.81-2.36,3.96-2.33c4.02,0.09,7.67-1.26,10.4-4.63
        c2.18-2.73,4.79-4.88,8.74-4.32c1.2,0.18,2.42-0.4,3.1-1.47c1.93-2.98,5.12-1.66,7.39-2.48c4.79-1.72,11.17,1.41,14.48-4.54
        c0.21-0.37,1.07-0.89,1.17-0.8c3.99,3.28,9.11,0.43,13.28,2.42c1.81,0.86,4.29,2.06,0.46,3.99c-2.27,1.17-4.26,2.85-6.44,4.2
        c-4.82,3.01-5.18,8.86-1.04,12.73c6.38,5.98,7.55,6.44-0.37,12.45c-1.32,1.01-2.24,2.12-2.45,3.74c-0.95,6.99-4.69,13.31-2.55,21.2
        c1.9,6.9-0.64,14.29-4.11,20.86c-2.88,5.49-3.62,11.9-7.45,16.99c-0.83,1.1-0.8,2.88,0.31,3.86c6.66,5.98,5.58,13.31,3.83,20.8
        c-0.21,0.98-0.4,1.99-0.58,3.01c-1.56,8.59-3.71,10.83-12.36,12.48c-1.75,0.34-3.31,0.74-2.73,2.73c0.92,3.16-1.72,5.74-0.89,9.05
        c0.49,1.93-1.56,3.28-4.29,2.76c-6.66-1.29-11.93,0.8-15.03,7.24c-0.8,1.66-2.21,3.13-0.61,5.15c1.1,1.41,0.49,2.55-1.07,3.25
        c-1.26,0.55-2.33,1.17-3.68-0.15c-7.7-7.36-17.48-6.04-26.69-5.52c-7.7,0.46-8.65-1.01-11.9-7.88c-2.67-5.61,1.38-10-0.21-14.97
        c-0.92-2.88-1.69-4.57-4.94-4.6c-4.02-0.06-8.16-1.78-11.04-3.65c-4.63-2.98-7.98-1.26-11.75,0.28
        C333.57,395.84,331.55,397.1,330.84,395.14z" />
    </NavLink>
    {/* </NavLink>
    <NavLink to='/map' id="台中市"> */}
    <NavLink to='/map'
        onClick={async() => {
            await MapLocal(myRefTxg);
            setShowHotTitle(!showHotTitle);
            }          
        } 
    className='local'>
        <g>
            <path className="st0" d="M353.05,268.52c-2.09-1.72-2.82,0.03-4.17,1.07c-3.77,2.94-7.7,5.12-12.55,1.84c-1.32-0.89-3.28-0.8-4.94-1.07
            c-10.89-1.99-11.17-1.84-14.78,8.01c-0.4,1.13-0.92,2.12,0,3.34c4.2,5.83,15,8.01,20.98,4.23c1.41-0.89,1.75-1.75,1.13-3.37
            c-1.78-4.6-1.2-5.21,3.56-4.36c1.35,0.25,2.7,0.49,4.02,0.74c2.61,0.18,4.63-1.41,6.96-1.96c1.87-0.46,3.68-0.55,3.93-3.19
            C357.46,270.6,354.83,270.02,353.05,268.52z" />
            <path ref={myRefTxg} className="st0" id="台中市景點" d="M481.32,232.17c-5.83,2.27-10.37,2.48-15.58-1.99c-2.52-2.15-4.97-3.13-4.42-6.84
            c0.15-1.13,0.71-2.45-1.29-2.64c-6.38-0.64-11.35,2.02-14.51,8.16c-1.07,2.06-2.7,4.05-4.66,2.79c-3.62-2.27-5.21,0.28-6.96,2.21
            c-1.56,1.72-3.77,2.3-5.31,3.5c-5.37,4.2-10.55,8.44-17.45,9.85c-0.52,0.09-0.8,1.07-1.29,1.53c-2.61,2.55-5.98,2.67-7.48-0.28
            c-3.34-6.56-9.63-5.67-15.03-7.09c-2.73-0.67-4.57,0.58-3.83,3.65c1.26,5.18-1.72,5.74-5.83,6.66
            c-10.46,2.33-18.19-4.42-26.53-8.04c-9.48-4.08-17.61-11.17-23.93-19.54c-2.88-3.77-4.08-2.88-6.04,0.18
            c-0.83,1.29-2.39,2.55-2.42,3.86c-0.21,6.93-7.94,10.18-8.19,17.09c-0.06,1.47-1.63,1.63-3.19,1.81c-2.36,0.25-3.93,1.96-3.4,4.63
            c0.49,2.45,2.98,5.43-2.42,5.43c-1.38,0,0,1.23,0.34,1.75c0.92,1.26,1.26,2.76,0.25,3.8c-3.8,3.93-3.56,7.48,0.34,11.17
            c0.64,0.61,0.74,1.9,0.95,2.91c1.63,7.85,6.01,12.33,14.39,13.16c4.51,0.46,7.45,5.83,7.27,11.13c-0.71,2.82,0.58,5.21,2.94,5.03
            c2.91-0.21,4.39,1.35,6.35,2.61c8.8,5.67,18.34,2.76,22.73-6.75c0.55-1.23,1.38-2.61,2.48-3.19c2.48-1.41,3.44-3.22,3.77-6.1
            c0.28-2.58,1.47-6.44,4.45-6.07c3.86,0.49,7.39,2.42,11.75,1.9c2.09-0.21,4.14,0.28,6.01-1.17c1.81-1.47,3.68-2.06,6.17-1.38
            c2.98,0.83,5.52-0.15,6.41-3.5c0.74-2.88,2.73-3.53,5.4-3.71c5.03-0.31,8.62-2.94,12.24-6.56c4.02-4.02,10.89-3.5,15.28-7.55
            c0.09-0.06,0.34,0.03,0.52,0.06c5.98,0.8,11.66,0.58,16.07-4.42c0.46-0.52,2.02-0.95,2.24-0.67c3.28,3.65,7.79,1.13,11.44,2.42
            c2.55,0.89,4.29,1.69,5.71-1.6c0.95-2.27,5.28-1.35,5.37-4.82c0.03-2.27,1.23-3.56,2.64-5.21c3.62-4.2,8.37-7.48,9.32-13.96
            C484.85,232.81,483.9,231.19,481.32,232.17z M359.37,276.19c0.03,0.86-0.52,1.72-1.44,1.9c-4.51,0.89-8.59,3.56-13.68,3.16
            c-2.33-1.23-2.88-0.25-2.33,2.33c0.28,1.2-0.28,2.36-1.17,3.28c-5.71,5.98-22.76,3.22-26.62-4.32c-0.37-0.71-0.58-1.81-0.31-2.45
            c1.75-3.93,2.73-8.07,3.68-12.24c0.43-1.81,1.87-2.48,3.59-1.6c6.01,3.13,13.16,0.55,19.2,4.02c2.36,1.35,5.09-0.25,6.81-2.39
            c3.47-4.33,6.44-1.53,9.82,0.21C360.81,270.08,359.27,273.3,359.37,276.19z" />
        </g>
    </NavLink>
    {/* </NavLink>
    <NavLink to='/map' id="彰化縣"> */}
    <NavLink to='/map'
        onClick={async() => {
            await MapLocal(myRefCha);
            setShowHotTitle(!showHotTitle);
            }          
        } 
    className='local'>
        <path ref={myRefCha} className="st0" id="彰化縣景點" d="M322.19,343.94c-0.58,5.71,3.62,9.82,10.83,11.38c-1.6,2.39-3.74,2.55-6.23,2.39
        c-8.16-0.52-16.04-3.31-24.39-2.73c-4.11,0.31-7.98-1.99-11.59-3.9c-6.01-3.13-12.3-1.78-18.4-1.26c-5.92,0.52-11.63,0.15-17.33-1.1
        c-1.32-0.31-3.9-0.83-1.44-3.34c6.29-6.5,8.62-15.4,13.56-22.76c0.18-0.28,0.58-0.71,0.49-0.86c-3.22-5.67,4.79-7.3,4.36-12.09
        c-0.18-1.96,1.78-3.62,3.37-4.26c5.09-2.02,7.21-6.93,10.61-10.55c2.67-2.85,1.44-7.48,2.94-11.2c1.78-4.39,5.83-6.53,8.13-10.28
        c0.95-1.53,2.39-0.52,2.98,1.1c0.67,1.93,1.75,3.8,2.02,5.8c1.01,7.02,5.89,9.78,11.99,10.64c5.98,0.86,8.22,5.21,8.31,9.82
        c0.12,5.83,2.76,7.52,7.7,7.82c0.4,0.03,0.8,0.52,1.5,1.01c-1.26,1.66-2.48,0.89-3.59,0.86c-2.64-0.06-3.74,1.66-2.61,3.62
        c1.99,3.4,1.75,6.07-1.01,8.71c-0.21,0.21-0.37,0.67-0.31,0.95C325.47,330.69,322.83,337.23,322.19,343.94z" />
    </NavLink>
    {/* </NavLink>
    <NavLink to='/map' id="屏東縣"> */}
    <NavLink to='/map'
        onClick={async() => {
            await MapLocal(myRefPif);
            setShowHotTitle(!showHotTitle);
            }          
        } 
    className='local'>
        <path ref={myRefPif} className="st0" id="屏東縣景點" d="M328.82,557.22c1.78,4.88,5.21,3.19,7.98,1.75c6.32-3.34,9.23-3.31,13.19,2.3c3.1,4.36,5.34,4.51,9.36,1.1
        c5.15-4.39,9.45-2.48,11.1,4.2c0.46,1.9,1.2,3.59,3.44,3.99c3.74,0.67,3.93,3.22,3.37,6.26c-0.4,1.99-0.49,4.08-0.89,6.07
        c-0.64,3.19-1.66,6.07-5.86,5.71c-2.3-0.21-3.9,0.92-5.15,2.82c-0.52,0.83-1.32,1.9-2.12,2.02c-11.13,1.87-11.35,12.42-15.49,19.66
        c-1.53,2.7-1.29,6.35-2.27,9.45c-1.5,4.75,1.9,8.13,3.1,12.09c0.55,1.81,1.07,3.07-0.34,4.6c-2.52,2.73-1.04,5.34,0.98,7.18
        c1.6,1.47,2.3,3.37,3.68,4.88c1.63,1.78,1.32,2.55-1.1,3.5c-5.18,2.06-6.32,9.88-2.24,13.74c1.23,1.17,2.67,2.12,3.99,3.16
        c1.93,1.56,3.4,3.28,0.86,5.43c-2.09,1.72-1.6,3.1,0.15,4.6c0.64,0.55,1.66,1.29,1.63,1.9c-0.25,5.37,4.51,5.61,7.52,7.61
        c2.21,1.47,5.06,1.53,6.84,4.17c1.35,1.99,3.34-0.4,5.64-0.86c-1.9,7.82-1.35,15.43-1.13,22.7c0.15,5.28-0.83,10.77,0.4,16.1
        c1.2,5.09-2.15,8.5-5.55,11.17c-4.88,3.86-6.35,8.96-3.4,14.57c0.95,1.78,2.7,3.16,2.27,5.92c-2.94-7.67-10.74-7.91-16.41-11.38
        c-3.25-1.96-5.06,0.64-6.53,2.98c-0.64,1.07,0.06,2.79-1.6,3.74c-2.76-1.38-2.91-4.11-2.52-6.5c0.61-4.11-0.77-7.27-3.19-10.37
        c-2.18-2.73-2.06-5.25-0.37-8.74c2.98-6.07,5.4-12.24,1.41-19.6c-3.13-5.83-1.9-13.71-5.92-19.42c-3.56-5.06-5.37-10.46-6.26-16.35
        c-0.09-0.67-0.4-1.38-0.83-1.87c-6.9-8.19-12.97-17.02-23.13-22.12c-6.38-3.22-13.19-6.07-17.33-13.07c-2.7-4.63-3.31-8.56-1.1-13.1
        c2.76-5.67,4.32-11.07,1.9-17.61c-1.69-4.57-1.32-9.97,0.98-14.6c1.81-3.65,2.91-7.42,2.48-11.41c-0.64-6.17,1.53-11.87,2.21-17.79
        c0.34-2.79,2.18-2.88,4.14-2.18c3.34,1.2,6.81,0.64,10.21,0.83c2.79,0.15,5-0.8,6.59-3.16c2.88-4.23,7.58-5.64,11.96-7.52
        C327.1,555.07,328.29,555.81,328.82,557.22z" />
    </NavLink>
    {/* </NavLink>
    <NavLink to='/map' id="高雄市"> */}
    <NavLink to='/map'
        onClick={async() => {
            await MapLocal(myRefKhh);
            setShowHotTitle(!showHotTitle);
            }          
        } 
    className='local'>
        <g>
            <path   
            d="M275.75,625.62c0.58-3.1-1.53-5.89-5.21-6.41c-2.18-0.31-4.42-0.37-6.63-0.52c-2.61-0.15-3.01-1.29-2.21-3.74
            c1.29-4.14,5.67-7.73,1.9-13.01c-0.77-1.04-0.95-3.28-2.12-4.75c-1.1-1.41-1.96-2.98-0.09-4.48c1.78-1.41,1.44-3.74,3.07-6.41
            c-3.37,1.38-5.89,2.24-8.68,1.04c-1.29-0.55-2.73-0.06-3.68,1.17c-0.89,1.1-0.86,2.21,0.21,3.19c3.44,3.16,1.78,5.67-1.01,8.1
            c-1.66,1.44-2.52,3.1-1.66,5.46c3.71,10.15,10.24,18.37,17.88,25.83c0.49,0.46,1.29,1.26,1.59,1.13
            C272.07,630.77,275.17,628.72,275.75,625.62z"            
            />
            <path ref={myRefKhh} id="高雄市景點" className="st0" d="M398.75,453.91c-5.12-3.31-4.85-2.91-1.38-8.28c1.47-2.24,4.94-2.76,4.85-6.2
            c-0.12-6.35-5.89-11.17-12.18-9.88c-10.8,2.21-19.85,6.96-24.6,17.67c-0.34,0.77-0.83,1.66-1.5,2.02
            c-6.81,3.59-12.55,8.53-18.47,13.34c-3.9,3.16-7.7,8.9-14.32,4.08c-1.44-1.01-2.91,0.58-3.31,2.27c-0.46,2.06-0.06,3.93,0.83,5.95
            c1.75,3.96,2.02,7.52-0.21,12.05c-3.93,7.94-12.42,13.07-13.56,22.58c-0.09,0.71-0.95,1.44-1.63,1.93
            c-5.86,4.17-11.04,9.11-16.04,14.2c-4.54,4.6-9.42,8.8-11.53,15.49c-0.98,3.16-2.33,8.53-8.5,6.01c-1.75-0.74-2.94,1.29-4.02,2.64
            c-1.96,2.48-4.69,4.14-7.67,3.04c-4.88-1.75-9.6-1.99-14.6-0.92c-1.5,0.34-3.19,0.03-4.36-1.07c-2.18-2.06-5.15-1.75-7.64-2.82
            c-2.85-1.23-3.4,0.49-2.98,2.79c0.31,1.69,1.04,3.13,2.94,3.86c2.24,0.86,3.37,3.44,2.09,5c-2.7,3.25-0.71,5.74,0.34,8.47
            c1.56,3.99,3.19,7.98,4.82,11.93c0.89,2.18,1.93,6.1,3.71,5.55c3.99-1.29,8.77,1.04,12.05-2.61c0.8-0.86,1.2-2.36,2.64-1.96
            c1.47,0.46,1.78,1.99,2.02,3.34c0.34,1.93-0.25,3.65-1.1,5.43c-1.47,2.98-2.76,5.55,0.25,9.17c2.06,2.48,4.02,6.56,2.45,10.64
            c-0.83,2.21-1.69,4.42-2.61,6.84c1.13,0,1.84,0.06,2.52-0.03c4.54-0.52,7.61,1.41,9.39,5.55c1.72,4.08-0.12,6.99-3.16,9.45
            c-2.36,1.9-2.36,3.59,0.21,5.18c1.69,1.04,2.91,2.94,5.89,2.91c-0.58-3.56-2.27-7.64,0.46-10.31c5.46-5.31,7.02-10.8,3.13-17.61
            c-0.49-0.86,0.21-2.33,0.15-3.53c-0.34-6.96,3.22-13.28,3.53-20.06c0.31-6.69,0.25-13.25,2.76-19.75c2.27-5.8,2.52-5.92,8.47-4.82
            c4.63,0.83,9.94,3.16,13.99-3.01c2.67-4.08,7.91-5.8,12.73-7.27c2.15-0.64,4.51-0.15,5.34,1.9c1.96,5,4.02,2.76,6.17,0.4
            c2.39-2.61,5.09-2.48,7.98-1.1c2.85,1.35,5.06,3.44,7.15,5.8c0.95,1.1,2.06,3.01,3.71,1.6c3.96-3.28,8.13-5.28,13.56-3.8
            c-7.64-4.94-10.4-17.61-5.46-25.31c3.56-5.52,9.02-10.24,7.58-17.97c-0.15-0.71,0.43-1.69,0.92-2.33c1.81-2.36,2.24-5.03,1.87-7.82
            c-0.77-5.52-0.74-10.77,3.71-14.97c1.04-0.98,0.31-2.33,0.64-3.37c0.89-2.88-0.83-7.27,2.02-8.56c6.23-2.79,8.93-10.4,16.72-11.07
            c3.28-0.31,7.73-2.85,8.22-6.07C406.27,457.07,401.51,455.69,398.75,453.91z" />
        </g>
    </NavLink>
    {/* </NavLink>
    <NavLink to='/map' id="雲林縣"> */}
    <NavLink to='/map'
        onClick={async() => {
            await MapLocal(myRefYun);
            setShowHotTitle(!showHotTitle);
            }          
        }    
    className='local'>
        <path ref={myRefYun} className="st0" id="雲林縣景點" d="M343.08,403.73c-4.23,0.86-9.36,1.01-13.25-1.6c-2.18-1.5-4.05-1.69-6.13-1.07
            c-7.24,2.09-18.28,0.09-22.36-7.67c-1.35-2.48-3.59-3.19-6.59-2.27c-4.63,1.44-9.36,3.19-14.29,0.71c-1.93-0.98-3.13,0.74-4.42,1.81
            c-5.03,4.17-10.21,8.16-16.1,11.1c-1.5,0.77-2.61,1.9-3.5,3.53c-1.01,1.84-2.33,4.08-5.61,2.24c-2.58-1.44-4.2,0.55-4.29,3.25
            c-0.12,4.17-2.02,5.15-5.67,3.59c-0.61-0.28-1.35-0.55-1.99-0.46c-2.98,0.46-7.88-0.03-8.04-1.41c-0.52-4.02-2.79-7.48-2.7-11.69
            c0.18-8.62,1.07-16.96,6.17-24.29c0.61-0.89,0.92-2.06,0.09-2.85c-2.73-2.61-0.09-4.29,0.95-6.2c0.55-1.01,2.33-1.99,2.18-2.67
            c-1.5-6.93,4.32-10.21,7.12-14.97c1.38-2.33,3.34-3.93,5.92-2.82c10.15,4.29,20.64,2.42,30.95,1.53c4.57-0.37,7.98,1.69,11.56,3.31
            c5.67,2.58,11.47,2.52,17.45,2.67c3.86,0.09,7.67,1.56,11.53,2.39c4.91,1.04,6.87,4.75,4.97,9.45c-0.28,0.64-0.92,1.29-0.83,1.84
            c0.86,7.21-0.61,14.11-2.15,21.07c-0.71,3.13,8.56,7.85,11.84,5.92c2.15-1.23,4.57-1.04,6.69-2.94
            C341.88,398.73,344.92,403.36,343.08,403.73z" />
    </NavLink>
    {/* </NavLink>
    <NavLink to='/map' id="嘉義縣"> */}
    
        <g> 
            <NavLink to='/map'
                // key={myRefCyi}
                onClick={async() => {
                    await MapLocal(myRefCyi);
                    setShowHotTitle(!showHotTitle);
                    }          
                }
            className='local'>
            <path ref={myRefCyi} className="st0" id="嘉義市景點" d="M287.53,418.85c-1.93-0.92-4.94,2.98-8.16,3.47c-1.32,0.18-0.03,1.6,0.15,2.52c0.95,4.11,5.64,3.9,7.85,6.81
            c1.07,1.38,2.55-1.99,4.08-2.91c1.41-0.83,2.48-0.55,3.83,0c2.06,0.83,2.7-0.64,3.13-2.15c-0.15-0.46-0.18-0.83-0.34-1.1
            C295.75,421.49,291.15,420.6,287.53,418.85z" />
            </NavLink>
            <NavLink to='/map'
                // key={myRefCyq}
                onClick={async() => {
                    await MapLocal(myRefCyq);
                    setShowHotTitle(!showHotTitle);
                    }          
                }                  
            className='local'>
            <path ref={myRefCyq} className="st0" id="嘉義縣景點" d="M375.75,427.84c-7.48,2.91-12.15,0.06-13.83-7.91c-0.18-0.83-0.37-1.78-0.86-2.39
            c-2.27-2.88-2.42-5.55-0.74-9.02c2.36-4.85,0.58-7.45-4.69-8.37c-1.69-0.31-3.28-1.07-4.94-1.5c-2.94-0.77-5.61-1.26-4.66,3.53
            c0.43,2.18-0.31,5.86-2.79,4.82c-5.58-2.33-12.97,3.34-17.18-4.08c-0.49-0.86-1.5,0.15-2.3,0.4c-8.5,2.58-16.72,0.89-21.99-5.67
            c-3.86-4.82-7.55-4.02-11.81-3.4c-3.25,0.49-6.35,2.85-9.75,0.4c-0.34-0.25-1.5,0.15-1.81,0.61c-3.4,4.63-10.49,4.97-12.7,10.98
            c-0.43,1.13-1.72,0.74-2.76,0.67c-1.9-0.12-3.22,1.01-4.26,2.42c-1.87,2.48-3.01,6.13-6.99,5.52c-4.75-0.74-2.45,5.25-5.86,5.67
            c-1.23,0.15-2.33,0.15-3.53-0.09c-4.6-0.98-9.39-1.1-13.86-2.79c-1.53-0.55-3.5-1.5-3.99,1.32c-0.37,2.12,0.58,3.25,2.76,3.4
            c2.73,0.21,3.37,1.44,2.55,4.17c-1.32,4.36-0.83,10.24,0.83,12.91c3.74,6.04,0.89,8.5-2.79,11.87c-1.66,1.53-3.8,3.65-0.89,5.95
            c2.48,1.96,5.09,4.08,8.01,5.21c3.13,1.23,6.17,3.01,9.29-1.99c2.15-3.4,5.89-6.72,9.32-9.69c3.68-3.22,7.76-5.15,11.9-7.39
            c5.25-2.85,10.95-2.94,16.53-4.11c4.94-1.04,8.65,1.84,12.91,3.22c3.77,1.23,6.1,2.02,2.39,6.01c5.55,0.77,5.71,6.59,9.42,8.77
            c0.55,0.34,0.31,2.12-0.52,2.82c-2.18,1.84-1.38,4.14-1.63,6.47c-0.31,2.85,2.48,5.12,1.44,7.27c-2.21,4.6,1.87,4.6,3.77,6.17
            c2.36,1.9,4.02,0.71,5.49-1.44c0.86-1.26,2.33-1.78,3.65-0.86c3.04,2.12,5.64,0.52,8.74-0.31c-0.64-1.17-1.04-1.93-1.47-2.64
            c-1.93-3.22-0.95-6.66,0.55-9.36c1.6-2.91,4.6-0.61,6.99-0.18c1.72,0.31,3.53,1.01,4.54-0.98c0.98-1.96,2.67-2.3,4.45-3.01
            c2.18-0.89,4.42-2.12,5.43-4.51c0.89-2.09,2.79-2.55,4.54-3.62c4.29-2.61,9.54-4.36,11.81-9.48c3.56-8.01,11.38-10.55,18.16-15.34
            C380.32,428.2,378.45,426.79,375.75,427.84z M301.24,426.67c-0.31,2.91-2.02,5.89-6.13,4.88c-0.49-0.06-1.29-0.37-1.44-0.18
            c-5.89,7.61-10.21-1.04-15.24-1.69c-3.28-0.4-1.63-4.63-2.7-6.99c-0.86-1.93,1.47-2.91,3.13-3.19c2.42-0.4,4.51-1.41,6.66-2.45
            C289.46,415.14,301.64,422.38,301.24,426.67z" />
            </NavLink>
        </g>
     
        <NavLink to='/map'
            // key={myRefTnn}
            onClick={async() => {
                await MapLocal(myRefTnn);
                setShowHotTitle(!showHotTitle);
                }          
            }  
            className='local'
        >
        <g>
            <path className="st0" d="M242.16,536.36c5.18-2.09,5.12-4.6,1.6-7.85c-4.39-4.05-4.05-7.61,0.58-11.04c0.71-0.52,1.63-1.01,1.04-1.93
            c-0.4-0.64-1.41-1.35-2.09-1.29c-4.36,0.49-7.73-1.84-11.41-3.47c-4.82-2.15-13.31,0.64-16.13,4.72c-1.5,2.15-1.63,3.65,0.98,4.85
            c3.04,1.38,5.09,4.08,7.76,5.89c3.19,2.18,4.23,7.91,10.03,6.13c1.1-0.34,0.52,1.69,0.92,2.48c1.47,3.13-2.39,6.13,0.15,9.69
            C237.93,541.54,239.03,537.62,242.16,536.36z" />
            <path ref={myRefTnn} className="st0" id="台南市景點" d="M326.36,481.55c-3.22-0.4-7.48-1.78-9.57-0.31c-3.86,2.73-6.41,0.92-9.88,0.09c-5.18-1.26-5.28-3.83-3.59-7.82
            c0.18-0.43-0.58-1.23-0.64-1.87c-0.52-3.9-1.35-7.85,0.67-11.56c1.07-2.02,0.18-2.79-1.53-3.4c-3.77-1.38-4.29-5.55-6.44-8.25
            c-2.76-3.47-6.2-6.29-10.58-6.44c-7.85-0.25-15.18,0.55-21.47,5.77c-0.37,0.34-0.92,0.55-1.41,0.61c-2.55,0.25-4.05,1.44-5.55,3.71
            c-3.53,5.25-9.66,8.04-13.37,13.25c-0.74,1.04-2.27,0.64-3.34,1.01c-5.15,1.75-7.3-3.44-11.17-4.72c-1.9-0.61-3.8-2.64-5.31-0.15
            c-1.01,1.66-2.06,4.05,0.67,5.64c1.13,0.64,1.13,1.93,0.25,2.61c-2.88,2.21-3.47,5.8-5.49,8.53c-3.9,5.34-5.98,11.26-2.73,17.67
            c1.75,3.47,0.67,5.49-2.33,7.12c-6.17,3.31-6.69,4.63-4.48,11.38c0.86,2.55,2.42,3.25,3.8,0.74c3.77-6.66,10.15-6.72,18.13-7.3
            c4.32,1.47,10.15,3.31,15.86,5.46c2.27,0.86,2.73,3.16,0.71,4.45c-5.92,3.71-3.83,7.09-0.28,11.01c2.7,3.01,1.78,7.18-1.87,8.74
            c-2.55,1.13-3.44,3.71-5.52,5.18c-0.83,0.58-0.95,2.48,0.21,2.52c4.63,0.12,7.67,5.03,12.61,4.02c3.77-0.8,7.52-0.21,11.04,1.1
            c2.79,1.01,4.88,0.86,6.87-1.44c2.42-2.76,4.97-5.25,9.26-3.74c1.81,0.64,1.69-1.29,1.96-2.3c3.4-11.75,12.48-19.54,21.44-26.16
            c10.49-7.76,13.25-20.4,21.81-29.02c0.92-0.92,1.23-2.45,1.9-3.62C327.68,482.9,327.5,481.7,326.36,481.55z" />
        </g>
        </NavLink>
        

        
        <NavLink to='/map'
            // key={myRefLie}
            onClick={async() => {
                await MapLocal(myRefLie);
                setShowHotTitle(!showHotTitle);
                }          
            }  
            className='local'
        >
        <path ref={myRefLie} className="st0" id='連江縣景點'  transform="scale(5) translate(-20, -90)"
        d="M45.79,102l-.27,3,.54,3.26-.54,1.9,4.34.54,3.26-.81,4.34-3.53-1.9-2.44-2.17,1.9-3,.54-1.63-2.17-3-2.17Z" ></path>
        </NavLink>       
        
        <NavLink to='/map'
            // key={myRefKin}
            onClick={async() => {
                await MapLocal(myRefKin);
                setShowHotTitle(!showHotTitle);
                }          
            }  
            className='local'
        >
        <path ref={myRefKin}  className="st0" id='金門縣景點' transform="scale(5) translate(-50, -190)"
        d="M65.59,235.62,65,236l-.44.5-1.69-.25-.63.31-.31.69v1.88l-.31.63-.06.88-.56.44h-.94l-.63.31.19.94.44.63-.31.69-.56.56-.69.25h-.25l.44.75,1.76.13.31.82.88-.06L63,244.28l.75-.19.82.19.38.56.69-.31.38-.63L66,243l.38-.63,1.82-.06.82-.25.44-.5,1-2.89-.13-.82-2.07-1.26-.5-.56-.63-.31-.88-.19-.63.06Z"
        ></path>
        </NavLink>

        <NavLink to='/map'
            key={myRef}
            onClick={async() => {
                await MapLocal(myRef);
                setShowHotTitle(!showHotTitle);
                }          
            } 
            className='local'>        
        <path ref={myRef} className="st0" id ="澎湖縣景點" transform="scale(5) translate(-65, -340)"
        d="M77.44,422.09l-2,1.71-.79.24h-.92l.43.79v.92l-.18.85-1.22,1-.12.92.67.37,1.65-.73.67-.49,1,.06.61.43.55.61-1.83,2-.92.12-1.83-.31,
        1,1.16,1.4.61,1.1-.12.79-.49,2.74.06.55.73.3.79-.91,1.46-.12.49.79.55-.06.67-.73.73-.79-.06-.55-.49L78,436.3l-.91.12L76,438.74l-1,1.1.43.73,
        1.77.18,1-.12,1.22-.43,1-.06,1.1,1.22.79-.18.12-.79.73-.67.06-.85.3-.85-.73-.43-.12-.67.61-.67.43-.79,3-2.38.79-.12L89,431.06l.24-.73.67-.55,4.21-.12,1.28-.61.55.43.18.91.43.79.73.49.85-.18.67-.37h1l.37-.55L98,428.31l-.55-2,.24-.73v-.91l-.37-.79-1.64-1.77-.43-1.4-.49.55-.24,1.71-.85-.12-.43-.85-.55-.61.24-.55.49-.37-1.16-1.1-.79-.31-.55.55-1.16,2.13-.67-.12-.61.18-1,1-.18.73-.49.12-.06-2.74.67-1.46-1,.12-.55.37-3.54.61-.55.43.06.85.49.67v.91l-.37.61-.85.24-.55.67v1.89l-.49.55-.91-.43-.67-.61.12-1.22-1-.12-.12-.85.49-.79.06-.55-.61-.73h0Z"></path>
        </NavLink>
        
    {/* </NavLink> */}
    </svg>
} {/* isSmallWindow end */}
    </div>
    <div style={{ display: isLoading  ? 'block' : 'none' }}>
            <img src='/img/loading.gif'  className={`loading ${loadingHide ? 'hide' : ''}`}/>      
    </div>
        <div className={`local-info-box ${localInfoBoxHide ? 'hide' : ''}`}
        style={{ display: isLoading  ? 'none' : 'block' }}
        >
            {/* 放我的熱門景點R */}
            <h3 className='h3-hotspot' style={{ display: showHotTitle ? 'block' : 'none' }}>前三熱門景點</h3>
            <p className='p'>
                <NavLink to={`/hotspot/${hotspotId[0]}`} className='hotspot-link'>{hotspot[0]}</NavLink>
            </p>
            <p className='p'>
                <NavLink to={`/hotspot/${hotspotId[1]}`} className='hotspot-link'>{hotspot[1]}</NavLink>
            </p>
            <p className='p'>
                <NavLink to={`/hotspot/${hotspotId[2]}`} className='hotspot-link'>{hotspot[2]}</NavLink>
            </p>
            <NavLink to={`/regionList/${regionCode}`} className='more-hotspot'                
                style={{ display: showHotTitle ? 'block' : 'none' }}>
                更多景點
            </NavLink> 
            <hr className='info-hr' style={{ display: showHotTitle ? 'block' : 'none' }}/>
            <h3 style={{ display: showHotTitle ? 'block' : 'none' }}>該區當季可見鳥種</h3>
            <div className='season-bird'>
                {birdTWname.map((birdName, index) => (
                    <div key={index} className='bird-box'>
                        <NavLink to={`/bird/${birdCode[index]}`} className='bird-link' >
                        <div className='bird'>{birdName}</div>
                        <div>
                            <img className='bird-photo' src={birdTWphoto[index]} />
                        </div>                   
                        </NavLink>
                    </div>
                                    
                ))}
            </div>
           
        </div>

    </div>{/* map-box */}
    </div>
    
    )
}

export default MapPage