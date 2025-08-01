import logo from './logo.svg';
import './App.css';
import Sidebar from './components/Sidebar';
import Dashboard from "./pages/Dashboard";
import Price from "./pages/Price";
import './styles.css';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Hamburger from 'hamburger-react';

function App() {
  return (
    <Router>
        <div className='app-container'>
          <div className='sidebar-wrapper'>
            <Sidebar />
          </div>

          <div className='main-content'>
            <Routes>
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path='/price' element={<Price />}/>
            </Routes>
          </div>
        </div>
    </Router>
  );
}

export default App;
