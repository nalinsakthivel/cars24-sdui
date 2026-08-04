export class PerfTracker {
  private marks: Record<string, number> = {};

  mark(label: string): void {
    this.marks[label] = Date.now();
  }

  measure(startLabel: string, endLabel: string): number {
    const start = this.marks[startLabel] ?? 0;
    const end = this.marks[endLabel] ?? Date.now();
    return Math.round(end - start);
  }

  report(): Record<string, number> {
    return {
      json_parse_ms: this.measure('fetch_start', 'parse_complete'),
      view_build_ms: this.measure('render_start', 'render_complete'),
      ttr_ms: this.measure('app_start', 'above_fold_visible'),
      tti_ms: this.measure('app_start', 'interactive'),
    };
  }
}

export const perf = new PerfTracker();
