// Minimal ambient declaration for optional dependency `react-window`.
// Keeps TypeScript happy when `react-window` is not installed.
declare module 'react-window' {
  import * as React from 'react';

  export interface ListChildComponentProps {
    index: number;
    style?: React.CSSProperties;
    data?: any;
  }

  export interface FixedSizeListProps {
    height: number;
    width: number | string;
    itemCount: number;
    itemSize: number;
    children: React.ComponentType<ListChildComponentProps> | React.ReactNode;
    style?: React.CSSProperties;
    className?: string;
    onItemsRendered?: (...args: any[]) => void;
    outerElementType?: any;
    innerElementType?: any;
  }

  export class FixedSizeList extends React.Component<FixedSizeListProps> {}

  export default FixedSizeList;
}
