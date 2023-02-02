import { NavLink } from 'react-router-dom';
import React from "react";
import { useState, useEffect, useMemo, memo, setState }  from "react";
import db from '../../../firebase-servise.js';
import "firebase/compat/firestore"; 
import { getFirestore, Firestore ,collection, addDoc, doc, getDoc ,getDocs, onSnapshot
    , querySnapshot , getApp, getApps,  getDocFromCache} from "firebase/firestore";
import { async } from '@firebase/util';
import { requestOptions } from './eBird.jsx';
import { useHotSpot } from '../hooks/useState.js';


const MapLocalComponent = () =>{
    
    const [hotspot, setHotspot] = useState([]);
    // const MapLocal = async(myRef) =>{
    //     const pathId = myRef.current.getAttribute('id');
    //     console.log(pathId);
    //     const locationDoc = await getDocs(collection(db, "TW"));
    //     locationDoc.forEach(async document =>{
    //         // console.log(document.id)
    //         if (pathId === document.id){    
    //             console.log("OK")     
    //             try {
    //                 const docSnap = await getDoc(doc(db, "TW", pathId));
    //                 // console.log(docSnap.data().hotspot[0].locId)
    //                 const regionCode = docSnap.data().hotspot[0].regionCode
    //                 const locId = docSnap.data().hotspot[0].locId
    //                 // 串API囉各位           
    //                 fetch("https://api.ebird.org/v2/ref/hotspot/" + regionCode  , requestOptions)
    //                 .then(response => response.text())
    //                 .then(result =>               
    //                     // console.log(result)
    //                     {
    //                     const arr = result.split("\n").map(row => {
    //                         const newRow = row.replace(/"([^"]*)"/g, (_, match) => match.replace(/,/g, ' '));
    //                         const [localId, country, code, , lat, long, name, date, num] = newRow.split(",");                        
    //                         return { localId, country, code, lat, long, name, date, num: parseInt(num) };
    //                     })
                            
    //                         const sorted = arr.sort((a, b) => b.num - a.num);                        
    //                         // console.log(sorted[0],sorted[1],sorted[2]);
    //                         const hotspot1 = sorted[0].name
    //                         const hotspot2 = sorted[1].name
    //                         const hotspot3 = sorted[2].name
    //                         setHotspot([hotspot1, hotspot2, hotspot3]);         
                                            
    //                     }

    //                 ).catch(error => console.log('error', error))
    //                 // setHotspot(dataHotspot)
    //             } catch (e) {
    //                 console.log("Error getting cached document:", e);
    //             }             
    //         }         
    //     })
    // }

}

export default MapLocalComponent
// export {hotspot}

export const MapLocal = async(myRef) =>{
    const { hotspot, setHotspot } = useHotSpot();
    const pathId = myRef.current.getAttribute('id');
    console.log(pathId);
    const locationDoc = await getDocs(collection(db, "TW"));
    locationDoc.forEach(async document =>{
        // console.log(document.id)
        if (pathId === document.id){    
            console.log("OK")     
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
                        const hotspot1 = sorted[0].name
                        const hotspot2 = sorted[1].name
                        const hotspot3 = sorted[2].name
                        setHotspot([hotspot1, hotspot2, hotspot3]);         
                                        
                    }

                ).catch(error => console.log('error', error))
                // setHotspot(dataHotspot)
            } catch (e) {
                console.log("Error getting cached document:", e);
            }             
        }         
    })
}