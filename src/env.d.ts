declare module 'virtual:pwa-register' {
  export function registerSW(opts?: any): () => Promise<void>;
}

export {};