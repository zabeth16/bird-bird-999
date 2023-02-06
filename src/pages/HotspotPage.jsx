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


const HotspotPage = ()=>{
    let { code } = useParams();
    const [hotspotName, setHotspotName] = useState("");
    const [hotspotLat, setHotspotLat] = useState("");
    const [hotspotLng, setHotspotLng] = useState("");
    const [birds, setBirds] = useState([]);
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
                })
                // 該區spplist
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
                // console.log(birdName)
                // // const birdNameArray = birdName.split(",")
                // console.log(birdNameArray)
             
                setBirds(birdName)     
                
                // console.log("篩選出來的鳥名" , birdName)
                
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
            {birds.map((bird) => (
                    <div key={bird} className='bird'>{bird}</div>
            ))}
        </div>    
       
        
                
        
                
        


    </div>
        
    )
}
export default HotspotPage