import { render, screen, fireEvent } from '@testing-library/react';
import SpreadsheetGrid from '../SpreadsheetGrid';
import '@testing-library/jest-dom';

describe('SpreadsheetGrid Integration Tests', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  test('edits two cells and verifies the result', async () => {
    render(<SpreadsheetGrid />);

    // Edit cell A1 using aria-label
    const a1Cell = screen.getByLabelText('A1');
    fireEvent.click(a1Cell);
    
    const input = screen.getByRole('textbox');
    fireEvent.change(input, { target: { value: '10' } });
    fireEvent.keyDown(input, { key: 'Enter' });

    // Edit cell B1 using aria-label
    const b1Cell = screen.getByLabelText('B1');
    fireEvent.click(b1Cell);
    
    const input2 = screen.getByRole('textbox');
    fireEvent.change(input2, { target: { value: '=A1 * 2' } });
    fireEvent.keyDown(input2, { key: 'Enter' });

    // Verify C1 shows the correct result
    const c1Cell = screen.getByRole('cell', { name: '20' });
    expect(c1Cell).toBeInTheDocument();
  });

  test('persists data in localStorage', () => {
    render(<SpreadsheetGrid />);

    // Edit cell A1 using aria-label
    const a1Cell = screen.getByLabelText('A1');
    fireEvent.click(a1Cell);
    
    const input = screen.getByRole('textbox');
    fireEvent.change(input, { target: { value: 'Test Value' } });
    fireEvent.keyDown(input, { key: 'Enter' });

    // Check localStorage
    const savedData = JSON.parse(localStorage.getItem('spreadsheet') || '{}');
    expect(savedData.A1).toBe('Test Value');
  });
});
