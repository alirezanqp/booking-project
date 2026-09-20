type Listener = () => void;

const listeners = new Set<Listener>();

export function onAuthChange(fn: Listener): () => void {
  listeners.add(fn);
  return () => {
    listeners.delete(fn);
  };
}

export function notifyAuthChange() {
  listeners.forEach((fn) => fn());
}
