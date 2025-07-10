# Mini Spreadsheet Project Architecture

## Overview
We are building a minimal spreadsheet application with a core engine written in TypeScript and a React-based UI. The application will feature a 5x10 grid of editable cells, support for formulas with cell references, automatic propagation of changes, and circular reference detection. The entire sheet will be persisted in `localStorage`.

## Core Engine Design

### `Spreadsheet` Class
- **State**: 
  - `cells: Map<string, Cell>` where `Cell` contains:
    - `rawValue: string` (the raw input by the user)
    - `computedValue: number | string | Error` (the evaluated value, or an error for circular references)
  - `dependencies: Map<string, Set<string>>` (a graph of which cells depend on which others)

- **Methods**:
  - `set(cellId: string, rawValue: string)`: 
    - Parses the `rawValue`: if it starts with `=`, it's a formula; otherwise, it's a literal.
    - Updates the cell and triggers a recomputation of dependent cells.
    - Detects circular references during the update and marks affected cells with an error.
  - `get(cellId: string)`: returns the `computedValue` for the cell.

- **Formula Parsing**:
  - Simple tokenization and recursive descent parsing for basic arithmetic (+, -, *, /) and cell references (e.g., A1, B2).
  - The parser will build an abstract syntax tree (AST) for the formula.

- **Dependency Tracking**:
  - When a formula is set, we analyze the cell references in the formula and update the dependency graph.
  - When a cell is updated, we traverse the dependency graph (using a topological sort) to update dependent cells. If a cycle is detected, we set the cell's value to an error.

## Web UI Design

### `SpreadsheetGrid` Component
- A 5x10 grid (rows: 1-5, columns: A-J).
- Each cell is an `input` element. When focused and edited, the user can type a value or formula.
- On pressing Enter, the value is set in the engine and the grid re-renders.
- The grid displays the `computedValue` of each cell. If the value is an error, it displays an error message (e.g., "#CIRC!").

### Persistence
- The entire state of the spreadsheet (the `cells` map) will be serialized to JSON and stored in `localStorage` on every change.
- On page load, the state is loaded from `localStorage` and the engine is rehydrated.

## Testing Strategy

### Unit Tests (using Vitest)
- Test the core engine: 
  - Setting and getting literal values.
  - Setting formulas and checking computed results.
  - Testing dependency propagation (e.g., updating a cell updates dependent cells).
  - Testing circular reference detection.

### Integration Test (using React Testing Library)
- Render the `SpreadsheetGrid`.
- Simulate editing two cells and check that the grid displays the correct results.

### End-to-End Test (using Playwright)
- Launch the app in a browser.
- Edit two cells and verify the displayed results.

## Project Structure

```
src/
  engine/
    Spreadsheet.ts
    __tests__/
      Spreadsheet.test.ts
  components/
    SpreadsheetGrid.tsx
  App.tsx
  index.tsx
  storage.ts (for localStorage handling)
tests/
  integration/
    integration.test.ts
e2e/
  playwright.spec.ts
public/
  ... (static assets)
```

## Steps to Run and Test
1. Install dependencies: `npm install`
2. Start dev server: `npm run dev`
3. Run BDD tests: `npm run test`
4. Run unit tests: `npm run test:unit` **TBD**
5. Run integration tests: `npm run test:integration` **TBD**
6. Run end-to-end tests: `npm run test:e2e` **TBD**

## Implementation Log
We will log the steps taken during implementation below.
