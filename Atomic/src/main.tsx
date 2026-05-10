import React from 'react'
import ReactDOM from 'react-dom/client';

import './index.css'

// Aplica el tema guardado antes de que React monte para evitar flash
const savedTheme = localStorage.getItem('atomic-theme') ?? 'dark';
document.documentElement.setAttribute('data-theme', savedTheme);
import App from './App.tsx'
import store from './store/store';

import { BrowserRouter } from 'react-router-dom';
import { Provider } from 'react-redux';


ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <Provider store={store}>
      <BrowserRouter>
        <App />
      </BrowserRouter>
    </Provider>
  </React.StrictMode>
);