declare module 'react';
declare module 'react-dom';
declare module 'prop-types';
declare module '@babel/core';
declare module '@babel/generator';
declare module '@babel/template';
declare module '@babel/traverse';
declare namespace JSX {
  interface IntrinsicElements {
    [elemName: string]: any;
  }
}
declare namespace React {
  interface FC<P = any> {
    (props: P): JSX.Element | null;
  }
  interface ChangeEvent<T = any> extends Event {}
  interface FormEvent<T = any> extends Event {}
}
declare module 'react' {
  export = React;
}
declare module 'react/jsx-runtime' {
  export const jsx: any;
  export const jsxs: any;
  export const Fragment: any;
}
