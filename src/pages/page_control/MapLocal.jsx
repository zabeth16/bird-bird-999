import { NavLink } from 'react-router-dom';
import React from "react";
import db from '../../../firebase-servise.js';
import "firebase/compat/firestore"; 
import { getFirestore, Firestore ,collection, addDoc, doc, getDoc ,getDocs, onSnapshot
    , querySnapshot , getApp, getApps,  getDocFromCache} from "firebase/firestore";
import { async } from '@firebase/util';
import { requestOptions } from './eBird.jsx';


export async function  MapLocal(myRef){
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
                        console.log(sorted[0],sorted[1],sorted[2]);

                    }
                    
                    
                ).catch(error => console.log('error', error))
                
              } catch (e) {
                console.log("Error getting cached document:", e);
              }
                
            // const docSnap = await getDocs(doc(db, "TW", pathId));
            // docSnap.forEach(docHot =>{
            //     console.log(docHot)
            // })
            
        }         
    })
}
// const ref = collection(db, "users");
// const q = query(ref, where("web", "==", "Let's Write"));
// const querySnapshot = await getDocs(q);
// querySnapshot.forEach((doc) => {
//   console.log(doc.id, doc.data());
// });


// async function locationHotspot(){
//     const docSnap = await getDoc(doc(db, "TW", pathId));
//     console.log(docSnap.data()[0]) 
// }