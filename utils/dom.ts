export function waitForElement(
  selector: string,
  opts: { root?: ParentNode; signal?: AbortSignal; timeoutMs?: number } = {},
): Promise<Element | null> {
  const root = opts.root ?? document;
  const existing = root.querySelector(selector);
  if (existing) return Promise.resolve(existing);

  return new Promise((resolve) => {
    if (opts.signal?.aborted) {
      resolve(null);
      return;
    }

    let settled = false;
    const finish = (value: Element | null) => {
      if (settled) return;
      settled = true;
      clearTimeout(timeout);
      obs.disconnect();
      opts.signal?.removeEventListener('abort', onAbort);
      resolve(value);
    };

    const onAbort = () => finish(null);

    const timeout = setTimeout(() => finish(null), opts.timeoutMs ?? 10_000);

    const obs = new MutationObserver(() => {
      const el = root.querySelector(selector);
      if (el) finish(el);
    });
    obs.observe(root === document ? document.documentElement : (root as Node), {
      childList: true,
      subtree: true,
    });

    opts.signal?.addEventListener('abort', onAbort);
  });
}

export function debounce<T extends (...args: never[]) => void>(
  fn: T,
  ms: number,
): (...args: Parameters<T>) => void {
  let t: ReturnType<typeof setTimeout> | undefined;
  return (...args: Parameters<T>) => {
    if (t !== undefined) clearTimeout(t);
    t = setTimeout(() => {
      t = undefined;
      fn(...args);
    }, ms);
  };
}
