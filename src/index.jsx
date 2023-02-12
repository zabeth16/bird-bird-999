import { BrowserRouter as Router , Route, NavLink } from "react-router-dom";
import { Routes } from "react-router-dom";
import { createRoot } from "react-dom/client";
import React from "react";
import   HomePage    from "./pages/HomePage.jsx"
import MapPage from './pages/MapPage.jsx';
import RegionListPage from './pages/RegionListPage.jsx';
import HotspotPage from "./pages/HotspotPage.jsx";
import BirdPage from "./pages/BirdPage.jsx";
import ExplorePage from "./pages/ExplorePage.jsx";


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
        </Routes>
        </Router>
        
    )
}

createRoot(document.querySelector("#root")).render(
    <React.StrictMode>
      <App />
    </React.StrictMode>
);
