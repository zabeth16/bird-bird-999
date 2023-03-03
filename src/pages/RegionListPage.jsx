import { NavLink, useParams } from 'react-router-dom';
import React from "react";
import { useState, useEffect, setState, useRef }  from "react";
import { getFirestore, Firestore ,collection, addDoc, doc, getDoc ,getDocs, onSnapshot
    , querySnapshot , getApp, getApps,  getDocFromCache} from "firebase/firestore";
import { RegionListPageCSS } from '../css/RegionListPage.scss'
import Base from '../pages/Base.jsx'
import db from './../../firebase-servise.js';
import { requestOptions } from './page_control/eBird.jsx';
import { async } from '@firebase/util';


const RegionListPage = () =>{
    let { code } = useParams();
    const [hotspot, setHotspot] = useState([]);
    const [birdNumber, setbirdNumber] = useState([]);
    // 長條圖用的最大鳥種數
    const [maxNumber, setMaxNumber] = useState(0);
    useEffect(() => {
        setMaxNumber(Math.max(...birdNumber));
    }, [birdNumber]); 
    // 往該區景點連結用
    const [locationId, setlocationId] = useState([]);
 
    useEffect(() => {
        // get the region infomation
        const getRegionInfo = async() =>{   
            // 考慮前20個
            // 用 region code 觀察數量做排行
            // 與該區可見觀察到的鳥種數量條圖
            fetch("https://api.ebird.org/v2/ref/hotspot/" + code  , requestOptions)
            .then(response => response.text())
            .then(result =>{
                const arr = result.split("\n").map(row => {
                    const newRow = row.replace(/"([^"]*)"/g, (_, match) => match.replace(/,/g, ' '));
                    const [localId, country, code, , lat, long, name, date, num] = newRow.split(",");                        
                    return { localId, country, code, lat, long, name, date, num: parseInt(num) };
                })

                const sorted = arr.sort((a, b) => b.num - a.num);
                const sortedHot = sorted.slice(0, 20)
                const filterNan = sortedHot.filter(item => !isNaN(item.num));
                const name = filterNan.map(item => item.name);
                const number = filterNan.map(item => item.num);          
                setHotspot(name)
                setbirdNumber(number)
                const locId = filterNan.map(item => item.localId);
                setlocationId(locId)
            })            
        }  
        getRegionInfo();
    }, []);
    return (
        <div>
            <Base></Base>
            <div className='guide-title' ></div>
            <div className='main'>
            <div className='main-region-list'>
                <table>
                    <tbody>                    
                    <tr>
                        <th className='top20-number'>編號</th>
                        <th className='top20'>該區前20大熱門景點</th>
                        <th className='top20-bird-number'>該區鳥種數</th>
                    </tr>                  
                        
                    {hotspot.map((location,index) =>(
                        <tr key={index}>
                            <td className='index-number'>
                                {index + 1}
                            </td>
                            <td>
                                <NavLink to={`/hotspot/${locationId[index]}`} 
                                className = 'hotspot-link'>
                                    {location}
                                </NavLink>
                            </td>

                            <td>                                
                                <div className='bar-box'>
                                    <div className='bar' style={{width: `${(birdNumber[index] / maxNumber) * 100}%`}}>
                                        <span className='bar-number'>
                                        <strong>{birdNumber[index]}</strong>    
                                        </span>
                                    </div>
                                </div>
                            </td>                                                 
                        </tr>
                    ))}         
                    </tbody>
                </table>
            </div>{/* main */}
            </div>
        </div>
    )
}

export default RegionListPage