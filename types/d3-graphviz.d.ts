declare module 'd3-graphviz' {
  import { Selection } from 'd3-selection';

  export function graphviz(selection: Selection<Element, any, any, any> | Element): GraphvizRenderer;

  interface GraphvizRenderer {
    width(width: number): GraphvizRenderer;
    height(height: number): GraphvizRenderer;
    fit(fit: boolean): GraphvizRenderer;
    zoom(zoom: boolean): GraphvizRenderer;
    renderDot(dot: string, callback?: () => void): GraphvizRenderer;
  }
} 