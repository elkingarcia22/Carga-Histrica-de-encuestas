import { describe, it, expect } from 'vitest';

describe('Vitest Smoke Test', () => {
  it('can execute TypeScript test files', () => {
    expect(true).toBe(true);
  });

  it('node environment is active', () => {
    expect(typeof process !== 'undefined').toBe(true);
  });

  it('ArrayBuffer exists and works in Node 24', () => {
    const buffer = new ArrayBuffer(8);
    expect(buffer.byteLength).toBe(8);
  });
});
