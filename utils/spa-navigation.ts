import { debounce } from './dom';

type NavListener = (url: URL) => void;

export function onNavigation(listener: NavListener): () => void {
  let last = location.href;
  const debouncedNotify = debounce(() => {
    if (location.href === last) return;
    last = location.href;
    listener(new URL(location.href));
  }, 50);

  const onTurbo = () => debouncedNotify();

  document.addEventListener('turbo:load', onTurbo);
  document.addEventListener('turbo:render', onTurbo);
  document.addEventListener('turbo:visit', onTurbo);
  document.addEventListener('page:load', onTurbo);
  window.addEventListener('popstate', onTurbo);

  const origPush = history.pushState.bind(history);
  const origReplace = history.replaceState.bind(history);
  history.pushState = ((...args: Parameters<History['pushState']>) => {
    const ret = origPush(...args);
    queueMicrotask(onTurbo);
    return ret;
  }) as History['pushState'];
  history.replaceState = ((...args: Parameters<History['replaceState']>) => {
    const ret = origReplace(...args);
    queueMicrotask(onTurbo);
    return ret;
  }) as History['replaceState'];

  const mo = new MutationObserver(onTurbo);
  const root = document.getElementById('content-body') ?? document.body;
  if (root) mo.observe(root, { childList: true, subtree: true });

  return () => {
    history.pushState = origPush;
    history.replaceState = origReplace;
    window.removeEventListener('popstate', onTurbo);
    document.removeEventListener('turbo:load', onTurbo);
    document.removeEventListener('turbo:render', onTurbo);
    document.removeEventListener('turbo:visit', onTurbo);
    document.removeEventListener('page:load', onTurbo);
    mo.disconnect();
  };
}
