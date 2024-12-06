import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import reportWebVitals from './reportWebVitals';
import axios from 'axios';
import './styles/global.scss';
import  SchedulerProvider  from './contexts/SchedulerContext/SchedulerContext';


axios.defaults.baseURL = process.env.REACT_APP_API_BASE_URL;



const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <SchedulerProvider>
      <App />
    </SchedulerProvider>
  </React.StrictMode>
);

reportWebVitals();
