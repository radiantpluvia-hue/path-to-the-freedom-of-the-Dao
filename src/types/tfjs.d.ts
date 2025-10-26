// Minimal ambient declaration for optional dependency `@tensorflow/tfjs`.
// This keeps TypeScript happy when TFJS is lazily loaded at runtime.
declare module '@tensorflow/tfjs' {
  // Export a loose shape — code should treat imports as `any`.
  const tf: any;
  export default tf;

  // Commonly-used helpers exported by TFJS — provide `any`-typed placeholders.
  export function tensor(...args: any[]): any;
  export function tidy<T = any>(fn: (...args: any[]) => T): T;
  export function setBackend(backend: string): Promise<void> | void;
  export function ready(): Promise<void>;
  export const version: { core?: string };
}
declare module '@tensorflow/tfjs' {
  // Minimal surface to satisfy imports in this repository. Replace with full types if needed.
  export type Tensor = any;
  export const tensor2d: (...args: any[]) => Tensor;
  export const sequential: (...args: any[]) => any;
  export const layers: any;
  export namespace train { function adam(lr?: number): any }
  export default {} as any;
}

export {};
declare module '@tensorflow/tfjs' {
  // Minimal types to allow compilation in this repository context
  export type Tensor = any;
  export type Tensor2D = any;
  export class TensorClass {
    data(): Promise<number[]>;
    dispose(): void;
  }

  export const tensor2d: (...args: any[]) => Tensor;
  export const sequential: () => any;
  export const layers: any;
  export const train: any;
  export const Tensor: any;

  export function tensor(...args: any[]): Tensor;

  export namespace layers {
    function dense(config: any): any;
  }

  export namespace train {
    function adam(lr: number): any;
  }

  export default {} as any;
}

export {};
