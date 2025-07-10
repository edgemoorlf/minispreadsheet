import React from 'react';
import SpreadsheetGrid from './components/SpreadsheetGrid';
import './App.css';

const App: React.FC = () => {
  return (
    <div className="App">
      <h1>Mini Spreadsheet</h1>
      <SpreadsheetGrid />
    </div>
  );
};

export default App;
