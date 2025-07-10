export type CellValue = number | string | Error;

export interface Cell {
  rawValue: string;
  computedValue: CellValue;
}

export class Spreadsheet {
  private cells: Map<string, Cell>;
  private dependencies: Map<string, Set<string>>;
  private dependents: Map<string, Set<string>>;

  constructor() {
    this.cells = new Map();
    this.dependencies = new Map();
    this.dependents = new Map();
  }

  set(cellId: string, rawValue: string): void {
    // Normalize cell ID to uppercase
    cellId = cellId.toUpperCase();
    
    // Remove existing dependencies for this cell
    this.removeDependencies(cellId);
    
    // Create new cell
    const cell: Cell = {
      rawValue,
      computedValue: ''
    };
    
    // Parse and compute value
    if (rawValue.startsWith('=')) {
      cell.computedValue = this.parseFormula(rawValue.slice(1), cellId);
    } else {
      cell.computedValue = rawValue;
    }
    
    // Store the cell
    this.cells.set(cellId, cell);
    
    // Update dependents
    this.updateDependents(cellId);
  }

  get(cellId: string): CellValue {
    cellId = cellId.toUpperCase();
    const cell = this.cells.get(cellId);
    return cell ? cell.computedValue : '';
  }

  private parseFormula(formula: string, currentCell: string): CellValue {
    try {
      // Simple formula parser that handles basic arithmetic and cell references
      const tokens = formula.match(/([A-Z]+\d+|\d+\.\d+|\d+|[+\-*/()]|[A-Z]+)/gi) || [];
      
      // Replace cell references with their values
      const evaluatedTokens = tokens.map(token => {
        if (/^[A-Z]+\d+$/i.test(token)) {
          return this.get(token).toString();
        }
        return token;
      });
      
      // Evaluate the expression
      const expression = evaluatedTokens.join('');
      return this.evaluateExpression(expression);
    } catch (error) {
      return new Error('#ERROR!');
    }
  }

  private evaluateExpression(expression: string): number | Error {
    try {
      // Use Function constructor for safe evaluation
      return new Function(`return (${expression})`)() as number;
    } catch (error) {
      return new Error('#ERROR!');
    }
  }

  private removeDependencies(cellId: string): void {
    // Remove this cell from all dependents' dependencies
    const currentDependencies = this.dependencies.get(cellId) || new Set();
    currentDependencies.forEach(dep => {
      const dependents = this.dependents.get(dep) || new Set();
      dependents.delete(cellId);
      if (dependents.size === 0) {
        this.dependents.delete(dep);
      }
    });
    
    // Clear dependencies for this cell
    this.dependencies.delete(cellId);
  }

  private updateDependents(cellId: string): void {
    const cell = this.cells.get(cellId);
    if (!cell) return;
    
    // Find all cell references in the formula
    if (cell.rawValue.startsWith('=')) {
      const references = new Set<string>();
      const tokens = cell.rawValue.match(/([A-Z]+\d+)/gi) || [];
      
      tokens.forEach(token => {
        const ref = token.toUpperCase();
        if (ref !== cellId) { // Avoid self-references
          references.add(ref);
          
          // Add to dependents map
          if (!this.dependents.has(ref)) {
            this.dependents.set(ref, new Set());
          }
          this.dependents.get(ref)?.add(cellId);
        }
      });
      
      // Store dependencies
      this.dependencies.set(cellId, references);
    }
    
    // Recompute all dependents
    this.recomputeDependents(cellId);
  }

  private recomputeDependents(cellId: string, visited: Set<string> = new Set()): void {
    if (visited.has(cellId)) {
      throw new Error('#CIRC!');
    }
    visited.add(cellId);
    
    const dependents = this.dependents.get(cellId) || new Set();
    dependents.forEach(dependent => {
      const cell = this.cells.get(dependent);
      if (cell && cell.rawValue.startsWith('=')) {
        try {
          cell.computedValue = this.parseFormula(cell.rawValue.slice(1), dependent);
          this.recomputeDependents(dependent, new Set(visited));
        } catch (error: any) {
          cell.computedValue = new Error(error.message);
        }
      }
    });
  }
}
