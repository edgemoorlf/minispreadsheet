import { Spreadsheet } from './Spreadsheet';

describe('Spreadsheet', () => {
  let spreadsheet: Spreadsheet;

  beforeEach(() => {
    spreadsheet = new Spreadsheet();
  });

  test('should set and get a numeric value', () => {
    spreadsheet.set('A1', '42');
    expect(spreadsheet.get('A1')).toBe('42');
  });

  test('should set and get a string value', () => {
    spreadsheet.set('B2', 'Hello');
    expect(spreadsheet.get('B2')).toBe('Hello');
  });

  test('should handle basic arithmetic formula', () => {
    spreadsheet.set('A1', '10');
    spreadsheet.set('B1', '20');
    spreadsheet.set('C1', '=A1 + B1');
    expect(spreadsheet.get('C1')).toBe(30);
  });

  test('should handle subtraction formula', () => {
    spreadsheet.set('A2', '50');
    spreadsheet.set('B2', '20');
    spreadsheet.set('C2', '=A2 - B2');
    expect(spreadsheet.get('C2')).toBe(30);
  });

  test('should handle multiplication formula', () => {
    spreadsheet.set('A3', '5');
    spreadsheet.set('B3', '6');
    spreadsheet.set('C3', '=A3 * B3');
    expect(spreadsheet.get('C3')).toBe(30);
  });

  test('should handle division formula', () => {
    spreadsheet.set('A4', '100');
    spreadsheet.set('B4', '10');
    spreadsheet.set('C4', '=A4 / B4');
    expect(spreadsheet.get('C4')).toBe(10);
  });

  test('should update dependent cells when source changes', () => {
    spreadsheet.set('A1', '10');
    spreadsheet.set('B1', '20');
    spreadsheet.set('C1', '=A1 + B1');
    
    spreadsheet.set('A1', '30');
    expect(spreadsheet.get('C1')).toBe(50);
  });

  test('should detect circular references', () => {
    spreadsheet.set('A1', '=B1');
    spreadsheet.set('B1', '=A1');
    
    expect(spreadsheet.get('A1')).toBe('#CIRC!');
    expect(spreadsheet.get('B1')).toBe('#CIRC!');
  });

  test('should handle complex formulas', () => {
    spreadsheet.set('A1', '10');
    spreadsheet.set('B1', '20');
    spreadsheet.set('C1', '5');
    spreadsheet.set('D1', '=(A1 + B1) * C1');
    expect(spreadsheet.get('D1')).toBe(150);
  });

  test('should return error for invalid formula', () => {
    spreadsheet.set('A1', '=10 + ');
    expect(spreadsheet.get('A1')).toBe('#ERROR!');
  });

  test('should handle formulas with multiple references', () => {
    spreadsheet.set('A1', '5');
    spreadsheet.set('B1', '10');
    spreadsheet.set('C1', '15');
    spreadsheet.set('D1', '=A1 + B1 + C1');
    expect(spreadsheet.get('D1')).toBe(30);
  });

  test('should ignore case in cell references', () => {
    spreadsheet.set('a1', '10');
    spreadsheet.set('b1', '20');
    spreadsheet.set('c1', '=A1 + B1');
    expect(spreadsheet.get('c1')).toBe(30);
  });
});
