// Global module fallbacks for packages without bundled types in this workspace
declare module 'jest-axe' {
  import { AxeResults } from 'axe-core';
  export function axe(node: Element | Document | string, options?: any): Promise<AxeResults>;
  export function toHaveNoViolations(results: AxeResults): any;
}

declare module '@tensorflow/tfjs' {
  const tf: any;
  export = tf;
}

export {};
