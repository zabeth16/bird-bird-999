import { NavLink, useParams } from 'react-router-dom';
import React from "react";
import { useState, useEffect, setState, useRef }  from "react";
import { getFirestore, Firestore ,collection, addDoc, doc, getDoc ,getDocs, onSnapshot
    , querySnapshot , getApp, getApps,  getDocFromCache , query, where} from "firebase/firestore";
import { ExplorePageCSS } from '../css/ExplorePage.scss'
import Base from '../pages/Base.jsx'
import db from './../../firebase-servise.js';
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
        // 隨機撈鳥
        function getRandomBird(birdTarget) {
            let getBird = birdTarget[Math.floor(Math.random() * birdTarget.length)]
            let getBirdCode = getBird.spp_code
            return getBirdCode;
        }
        // console.log(getRandomBird(birdTarget))
        setRandomBird(getRandomBird(birdTarget))


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

    // 景點找區用
    const [inputValueRegion, setInputValueRegion] = useState("");
    const [regionCode, setRegionCode] = useState([]);
    const [regionName, setRegionName] = useState([]);
    // 第二景點搜尋欄
    const [showInput, setShowInput] = useState(false);

    const searchRegion = async() =>{
        const docSnap = await getDoc(doc(db, "TW", "location"));
        const regionData =  docSnap.data().tw_code
        const regionTarget = 
        regionData.filter( item => item.ch_name.includes(inputValueRegion));
        if (inputValueRegion !== ""){
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
            console.log(regionNameList)
        }
    }

    useEffect(() => {
        searchRegion(inputValueRegion);
    }, [inputValueRegion]);

    const putRegionName = (e) =>{
        e.preventDefault();
        console.log(e.target.innerText)
        
    }



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
                     {birdNameCH.map((birdName, index) => (
                        <div key={index}>
                            <NavLink to={`/bird/${code[index]}`} className='bird-link' >
                                <div className='bird-search'>{birdName}</div>
                            </NavLink>
                        </div>
                    ))}
                
                </div>
                <div className='explore-hotspot'>
                    <div className='explore-title'>探索景點</div>
                    <input className='input-hotspot' type={'search'} placeholder='先輸入區域名稱，有需要請用｢台」字搜尋'
                    value={inputValueRegion}
                    onChange={e => setInputValueRegion(e.target.value)} 
                    ></input> 
                    {regionName.map((regionName , regionIndex) =>(
                        <div key={regionIndex} onClick={() => { setInputValueRegion(regionName); setShowInput(true); }}>
                            {regionName}
                        </div>
                    ))}
                    {showInput && (
                        <input className='input-location' type={'search'} placeholder='請輸入地方景點名稱，有需要請用｢台」字搜尋'
                            value={inputValueRegion} 
                            onChange={e => setInputValueRegion(e.target.value)} 
                        ></input>
                    )}
                    {/* 這邊記得input都改成location，還要記得拿locId、隱藏{regionName} */}
                    
                </div>
            </div>
        </div>
    )

}
export default ExplorePage