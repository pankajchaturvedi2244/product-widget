// src/main.jsx
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.jsx';
import './styles/app.css';

const container = document.getElementById('marketplace-widget');
if (!container) {
  const div = document.createElement('div');
  div.id = 'marketplace-widget';
  document.body.appendChild(div);
}

const root = ReactDOM.createRoot(document.getElementById('marketplace-widget'));
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

if (import.meta.hot) {
  import.meta.hot.accept();
}
