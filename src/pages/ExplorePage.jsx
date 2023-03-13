import { NavLink, useParams } from 'react-router-dom';
import React from "react";
import { useState, useEffect, setState, useRef }  from "react";
import { getFirestore, Firestore ,collection, addDoc, doc, getDoc ,getDocs, onSnapshot
    , querySnapshot , getApp, getApps,  getDocFromCache , query, where} from "firebase/firestore";
import { ExplorePageCSS } from '../css/ExplorePage.scss'
import Base from '../pages/Base.jsx'
import db from './../../firebase-service.js';
import { requestOptions } from './page_control/eBird.jsx';
import { async } from '@firebase/util';

const ExplorePage = () =>{
    const [inputValue, setInputValue] = useState("");
    const [birdNameCH, setBirdNameCH] = useState([]);
    const [birdNameSCI, setBirdNameSCI] = useState([]);
    const [code , setCode] = useState([]);
    const [randomBird , setRandomBird] = useState("")
    const searchData = async() =>{
        const docSnap = await getDoc(doc(db, "bird", "bird_info")); 
        // console.log(docSnap.data().bird_data)
        const birdData = docSnap.data().bird_data         
        const birdTarget = 
            birdData.filter( bird => bird.ch_name.includes(inputValue));
        // 輸入找鳥
        if (inputValue !== ""){
            // console.log(birdTarget)
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
            setBirdNameSCI(birdNameSCIList)
            setCode(birdCodeList)
        }   
    }

    useEffect(() => {
        searchData(inputValue);
    }, [inputValue]);

    // 隨機撈鳥
    const getRandomBird = async() =>{
        try{
            const docSnap = await getDoc(doc(db, "bird", "bird_info")); 
            const birdData = docSnap.data().bird_data
            let getBird = birdData[Math.floor(Math.random() * birdData.length)]
            let getBirdCode = getBird.spp_code
            // console.log(getBird , "鳥代碼: ", getBirdCode)
            setRandomBird(getBirdCode)
        }
        catch (e){
            console.log(e)
        }
    }
    useEffect(() => {
        getRandomBird();
    }, []);

    // 景點找區用
    const [inputValueRegion, setInputValueRegion] = useState("");
    const [regionCode, setRegionCode] = useState([]);
    const [regionName, setRegionName] = useState([]);
    // 設定初始 padding-top 值
    const [inputPaddingTop, setInputPaddingTop] = useState("0px"); 
    const handleInputClick = () => {
        if (window.innerWidth <= 1000) {
          setInputPaddingTop("10px");
        }
    };
    // 第二景點搜尋欄
    // 點擊後展示點擊value
    const [showInput, setShowInput] = useState(false);
    // 隱藏第一欄結果
    const [hideResult, setHideResult] = useState(false);    
    // 第二景點搜尋
    const [inputValueLocal , setInputValueLocal] = useState("");
    const [localData, setLocalData] = useState([]);
    const [localCode, setLocalCode] = useState([]);
    const [localName, setLocalName]= useState([]);
    const [showtop20 , setShowTop20 ] = useState(false);
    const [selectedRegion, setSelectedRegion] = useState("");
    const [selectedRegionCode , setSelectedRegionCode] = useState("")


    const searchRegion = async(inputValueRegion) =>{
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

    const searchLocal = async(regionName) =>{
        try{
            const docSnap = await getDoc(doc(db, "TW", regionName));           
            const localData =  docSnap.data().hotspot            
            setLocalData(localData);     
        }
        catch (e) {
            console.log("Error searchLocal:", e);
        }     
    }

    const searchLocalName = (inputValueLocal) =>{
        if(inputValueLocal !== "") {
            const localTarget = 
            localData.filter( item => item.name.includes(inputValueLocal));
            // console.log(localTarget)
            let i = 0;
            let localCodeList = []
            let localNameList = []
            for (i = 0 ; i < localTarget.length ; i++){
                const localCode = localTarget[i].locId
                const localName = localTarget[i].name
                localCodeList.push(localCode)
                localNameList.push(localName)
            }
            setLocalCode(localCodeList)
            setLocalName(localNameList)
        }
    }


    // 搜尋結果的 scroll 顯示的判斷
    const [scroll, setScroll] = useState("hidden");
    useEffect(() => {
        const container = document.querySelector(".scroll-box");
        if (container.offsetHeight > 150) {
          setScroll("scroll");
        } else {
          setScroll("hidden");
        }
    }, [regionName]);


    return (
        <div>
            <Base></Base>
            <div className='main-explore'>
                <div className='explore-bird'>
                    <div className='explore-title'>探索鳥鳥</div>
                    <NavLink to={`/bird/${randomBird}`} className='surprise'>鳥鳥驚喜包𓅞</NavLink>
                    <input className='input-bird' type={'search'} placeholder='輸入鳥名'
                     value={inputValue}
                     onChange={e => setInputValue(e.target.value)}></input>
                     <div className='scroll-box'>
                        {birdNameCH.map((birdName, index) => (
                            <div key={index}>
                                <NavLink to={`/bird/${code[index]}`} className='bird-link' >
                                    <div className='bird-search'>{birdName}</div>
                                </NavLink>
                            </div>
                        ))}
                    </div>
                
                </div>
                <div className='explore-hotspot'>
                    <div className='explore-title'>探索景點</div>
                    { showtop20 &&
                       
                        <NavLink to={`/regionList/${selectedRegionCode}`}
                        className='top20-recommend'>{selectedRegion + "前20大熱門推薦"}</NavLink>
                       
                    }                    
                    <input className='input-hotspot' type={'search'} placeholder='先輸入區域名稱，有需要請用｢台」字搜尋'
                    value={inputValueRegion}
                    onChange={e => {
                        setInputValueRegion(e.target.value)  
                        searchRegion(e.target.value)       
                    } }
                    style={{ paddingTop: inputPaddingTop }} // 根據狀態改變 padding-top 的值
                    onClick={handleInputClick} // 當使用者在輸入框內點擊時，呼叫 handleInputClick 函式
                    
                    ></input> 
                    <div className='scroll-box'>
                        {regionName.map((regionName , regionIndex) =>(
                            !hideResult &&
                            <div key={regionIndex} className='region-search'
                                onClick={() => { 
                                    setInputValueRegion(regionName);
                                    setShowInput(true);
                                    setHideResult(true);
                                    searchLocal(regionName);
                                    setShowTop20(true)
                                    setSelectedRegion(regionName)
                                    setSelectedRegionCode(regionCode[regionIndex])
                                    }}>    
                            {regionName}
                            </div>
                            
                        ))}

                        {showInput && (
                            <input className='input-location' type={'search'} placeholder='請輸入地方景點名稱，有需要請用｢台」字搜尋'
                                value={inputValueLocal} 
                                onChange={e => {
                                    setInputValueLocal(e.target.value);
                                    searchLocalName(e.target.value);
                                }}                                
                            ></input>
                        )}
                        {localName.map((localName, localIndex) =>(
                            <div key={localIndex} className='local-search'>
                                <NavLink to={`/hotspot/${localCode[localIndex]}`} 
                                className='local-search'>{localName}</NavLink>
                            </div>
                        ))}
                    </div>

                   
                    
                </div>
            </div>
        </div>
    )

}
export default ExplorePage