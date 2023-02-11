import { NavLink, useParams } from 'react-router-dom';
import React from "react";
import { useState, useEffect, setState, useRef }  from "react";
import { getFirestore, Firestore ,collection, addDoc, doc, getDoc ,getDocs, onSnapshot
    , querySnapshot , getApp, getApps,  getDocFromCache} from "firebase/firestore";
import { BirdPageCSS } from '../css/BirdPage.scss'
import Base from '../pages/Base.jsx'
import db from './../../firebase-servise.js';
import { requestOptions } from './page_control/eBird.jsx';
import { async } from '@firebase/util';
import loader from './page_control/googleMap.jsx';

const BirdPage = () =>{
    let { code } = useParams();
    const [audioCode , setAudioCode] = useState("")
    const [birdNameCH , setBirdNameCH] = useState("")
    const [birdNameSCI, setBirdNameSCI] = useState("")
    const [birdImg, setBirdImg] = useState("")
    const [nativeness, setNetiveness] = useState("")
    const [TWspecial , setTWspecial] = useState("")
    const [showAudio, setShowAudio] = useState(false);
    const handleClick = () => {
        if (audioCode !== "Not found") {
          setShowAudio(true);
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


    return(
        <div>
            <Base></Base>
            <div className='main'>
                <div className='content'>
                    <div className='big-sci-box'>
                        <div className='big-sci-name'>{birdNameSCI}</div>
                    </div>                    
                    <img className='bird-img-backgound' src={birdImg}></img>
                    <div className='img-box'>
                        <img className='bird-img' src={birdImg}></img>    
                    </div>                           
                    <div className='bird-name-card'>
                        <div className='bird-name'>{birdNameCH}</div>
                        <div className='bird-sci-name'>{birdNameSCI}</div>
                        <div className='native'>{nativeness} , {TWspecial}</div>
                       
                        <NavLink to='/distributed'>記得改成該鳥種分布連結</NavLink>
                    </div> 
                    <button onClick={handleClick} className='call-audio'>啾啾叫</button>
                        {showAudio && (
                        <iframe src={`https://macaulaylibrary.org/asset/${audioCode}/embed`}
                                className='audio'
                                height="400"
                                width="300"
                                allowFullScreen
                        ></iframe>
                        )}             
                </div>    
              
            </div>
            
            
          
        </div>
    )
}

export default BirdPage