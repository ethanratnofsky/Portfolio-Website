import React from 'react';
import { createRoot } from 'react-dom/client';
import { HashRouter } from 'react-router-dom';

// Components
import App from './components/App';

// Mount app
const root = createRoot(document.getElementById('app'));
root.render(
    <HashRouter>
        <App />
    </HashRouter>
);