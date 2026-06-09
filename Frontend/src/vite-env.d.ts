/// <reference types="vite/client" />

interface Eip1193Provider {
  isMetaMask?: boolean;
  isRabby?: boolean;
  providers?: Eip1193Provider[];
  request: (args: { method: string; params?: unknown[] }) => Promise<unknown>;
  on?: (event: string, handler: (...args: unknown[]) => void) => void;
  removeListener?: (event: string, handler: (...args: unknown[]) => void) => void;
}

interface Window {
  ethereum?: Eip1193Provider;
  rabby?: Eip1193Provider;
}
