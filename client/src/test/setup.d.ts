import "@testing-library/jest-dom";

declare module "vitest" {
  interface Assertion<T = any> extends jest.Matchers<void, T> {}
  interface AsymmetricMatchersContaining extends jest.AsymmetricMatchers {}
}

declare module "@testing-library/jest-dom/matchers" {
  export * from "@testing-library/jest-dom";
}
