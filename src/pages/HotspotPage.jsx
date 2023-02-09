import { NavLink, useParams } from 'react-router-dom';
import React from "react";
import { useState, useEffect, setState, useRef }  from "react";
import { getFirestore, Firestore ,collection, addDoc, doc, getDoc ,getDocs, onSnapshot
    , querySnapshot , getApp, getApps,  getDocFromCache} from "firebase/firestore";
import { HotspotPageCSS } from '../css/HotspotPage.scss'
import Base from '../pages/Base.jsx'
import db from './../../firebase-servise.js';
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


    return (
    <div>
        <Base></Base>
        <div className='main-hotspot'>
            <div className='hotspotName-box'>
                <h1 className='hotspotName'>{hotspotName}</h1>
            </div>            
            
            <div className='bird-title'>
                該地區的可見鳥鳥
            </div>
            {/* {birds.map((bird) => (
                    <div key={bird} className='bird'>{bird}</div>
            ))} */}
            {/* 前五個鳥鳥 */}
            {birds.slice(0, showCount).map((bird , index) => (
                <div key={bird} >
                <NavLink to={`/bird/${birdCode[index]}`} className='bird'>{bird}</NavLink>    
                </div>
            ))}
            {/* 點擊則顯示後續的鳥鳥 */}
            {showCount < birds.length && (
                <button onClick={() => setShowCount(birds.length)}>Show More </button>
            )}
            {/* 收合回到一開始的五個鳥鳥 */}
            {showCount === birds.length ? (
                <button onClick={() => setShowCount(5)}> Show Less </button>
            ) : null}

            <div id='map'></div>    
                    

        </div>    
       <div>鳥友照片展示區</div>
        
                
        
                
        


    </div>
        
    )
}
export default HotspotPage