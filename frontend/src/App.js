import React from 'react';
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import HeroSection from './components/HeroSection';
import Footer from './components/Footer';
import GroupsPage from './pages/GroupsPage';
import TopicsPage from './pages/TopicsPage';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route
          path="/"
          element={
            <>
              <HeroSection />
              <Footer />
            </>
          }
        />
        <Route path="/groups" element={<GroupsPage />} />
        <Route path="/topics" element={<TopicsPage />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
