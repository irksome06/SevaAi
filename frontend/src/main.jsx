import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './styles/index.css';
import './styles/auth.css';
import './styles/dashboard.css';
import './styles/document-vault.css';
import './styles/civic-problem.css';
import './styles/rti-generator.css';
import './styles/rti-actions.css';
import './styles/civic-actions.css';
import './styles/ai-widget.css';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
