import React from 'react';
import ReactDOM from 'react-dom';

import { BrowserRouter,Routes, Route } from 'react-router-dom';

import './index.css';
import App from './App';

import HqDeployContract from './HqDeployContract'

import reportWebVitals from './reportWebVitals';


// ReactDOM.render(
//   <React.StrictMode>
//     <App />   
//   </React.StrictMode>,
//   document.getElementById('root')
// );


ReactDOM.render(
  <BrowserRouter>
  <Routes>
    <Route path="/" element={<App/>}></Route>
    <Route path="/deploy/:currentAccount" element={<HqDeployContract/>}></Route>
  </Routes>
</BrowserRouter>,
  document.getElementById('root')
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
