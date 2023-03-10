import { BrowserRouter as Router , Route, NavLink } from "react-router-dom";
import { Routes, useState } from "react-router-dom";
import { createRoot } from "react-dom/client";
import React from "react";
import   HomePage    from "./pages/HomePage.jsx"
import MapPage from './pages/MapPage.jsx';
import RegionListPage from './pages/RegionListPage.jsx';
import HotspotPage from "./pages/HotspotPage.jsx";
import BirdPage from "./pages/BirdPage.jsx";
import ExplorePage from "./pages/ExplorePage.jsx";
import MemberPage from "./pages/MemberPage.jsx";
import LoginPage from "./pages/LoginPage.jsx";


function App(){
    return (
        
        <Router>
        <Routes>
            <Route path="/"  element={<HomePage />} />
            <Route path="/map"  element={<MapPage />}/>
            <Route path="/regionList/:code"  element={<RegionListPage />}/>
            <Route path="/hotspot/:code" element={<HotspotPage />} />
            <Route path="/bird/:code" element={<BirdPage />} />
            <Route path="/explore" element={< ExplorePage/>} />
            <Route path="/member" element={<MemberPage />} />
            <Route path="/login" element={<LoginPage />} />
        </Routes>
        </Router>
        
    )
}

createRoot(document.querySelector("#root")).render(
    <React.StrictMode>
      <App />
    </React.StrictMode>
);
