import React, { useState, useEffect, useRef } from 'react';
import { Spreadsheet } from '../engine/Spreadsheet';
import type { CellValue } from '../engine/Spreadsheet';

const ROWS = 5;
const COLS = 10;
const COL_LETTERS = 'ABCDEFGHIJ'.split('');

const SpreadsheetGrid: React.FC = () => {
  const [spreadsheet] = useState(() => new Spreadsheet());
  const [cells, setCells] = useState<Record<string, string>>({});
  const [editingCell, setEditingCell] = useState<string | null>(null);
  const [editValue, setEditValue] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  // Initialize from localStorage
  useEffect(() => {
    const savedData = localStorage.getItem('spreadsheet');
    if (savedData) {
      try {
        const parsedData: Record<string, string> = JSON.parse(savedData);
        Object.entries(parsedData).forEach(([cellId, value]) => {
          spreadsheet.set(cellId, value);
        });
        updateCellValues();
      } catch (e) {
        console.error('Failed to load from localStorage', e);
      }
    }
  }, [spreadsheet]);

  // Focus input when editing
  useEffect(() => {
    if (editingCell && inputRef.current) {
      inputRef.current.focus();
    }
  }, [editingCell]);

  const updateCellValues = () => {
    const newCells: Record<string, string> = {};
    for (let row = 1; row <= ROWS; row++) {
      for (let col = 0; col < COLS; col++) {
        const cellId = `${COL_LETTERS[col]}${row}`;
        const value = spreadsheet.get(cellId);
        newCells[cellId] = typeof value === 'string' ? value : 
                          value instanceof Error ? value.message : 
                          value.toString();
      }
    }
    setCells(newCells);
  };

  const handleCellClick = (cellId: string) => {
    setEditingCell(cellId);
    setEditValue(spreadsheet.get(cellId)?.toString() || '');
  };

  const handleEditChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEditValue(e.target.value);
  };

  const handleEditSubmit = () => {
    if (editingCell) {
      spreadsheet.set(editingCell, editValue);
      updateCellValues();
      saveToLocalStorage();
      setEditingCell(null);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleEditSubmit();
    } else if (e.key === 'Escape') {
      setEditingCell(null);
    }
  };

  const saveToLocalStorage = () => {
    const dataToSave: Record<string, string> = {};
    for (let row = 1; row <= ROWS; row++) {
      for (let col = 0; col < COLS; col++) {
        const cellId = `${COL_LETTERS[col]}${row}`;
        const cell = spreadsheet.get(cellId);
        if (cell !== '') {
          dataToSave[cellId] = spreadsheet.get(cellId)?.toString() || '';
        }
      }
    }
    localStorage.setItem('spreadsheet', JSON.stringify(dataToSave));
  };

  // Render header row (A-J)
  const renderHeader = () => (
    <tr>
      <th className="cell"></th>
      {COL_LETTERS.slice(0, COLS).map(letter => (
        <th key={letter} className="cell header-cell">{letter}</th>
      ))}
    </tr>
  );

  // Render data rows
  const renderRows = () => {
    const rows = [];
    for (let row = 1; row <= ROWS; row++) {
      rows.push(
        <tr key={row}>
          <td className="cell header-cell">{row}</td>
          {COL_LETTERS.slice(0, COLS).map(letter => {
            const cellId = `${letter}${row}`;
            const isEditing = editingCell === cellId;
            
            return (
              <td 
                key={cellId} 
                className={`cell ${cells[cellId]?.startsWith('#') ? 'error-cell' : ''}`}
                onClick={() => handleCellClick(cellId)}
                aria-label={cellId}
              >
                {isEditing ? (
                  <input
                    ref={inputRef}
                    type="text"
                    value={editValue}
                    onChange={handleEditChange}
                    onKeyDown={handleKeyDown}
                    onBlur={handleEditSubmit}
                    className="cell-input"
                  />
                ) : (
                  cells[cellId] || '\u00A0' // &nbsp;
                )}
              </td>
            );
          })}
        </tr>
      );
    }
    return rows;
  };

  return (
    <div className="spreadsheet-container">
      <table className="spreadsheet-table">
        <thead>{renderHeader()}</thead>
        <tbody>{renderRows()}</tbody>
      </table>
    </div>
  );
};

export default SpreadsheetGrid;
