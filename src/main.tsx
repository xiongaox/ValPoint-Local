import React from 'react';
import ReactDOM from 'react-dom/client';
import UserApp from './apps/user/UserApp';
import './styles/fonts.css';
import './index.css';
import 'leaflet/dist/leaflet.css';

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
  <React.StrictMode>
    <UserApp />
  </React.StrictMode>,
);
