import React from "react";
import { BrowserRouter, Routes, Route} from "react-router-dom";
import LandingPage from "./pages/LandingPage.jsx";
import SessionPage from "./pages/SessionPage.jsx";

const AppRoutes = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route path = "/" element = {<LandingPage />} />
        <Route path = "/session/:sessionId" element = {<SessionPage />} />
      </Routes>
    </BrowserRouter>
  )
}

export default AppRoutes;