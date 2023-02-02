import React from "react";
import { useState, useEffect, useMemo, memo, setState }  from "react";
import db from "../../../firebase-servise";
import { getFirestore, Firestore ,collection, addDoc, doc, getDoc ,getDocs, onSnapshot
    , querySnapshot , getApp, getApps,  getDocFromCache} from "firebase/firestore";
import { async } from '@firebase/util';

export const useHotSpot = () => {
    const [hotspot, setHotspot] = useState([]);
    return { hotspot, setHotspot };
    };