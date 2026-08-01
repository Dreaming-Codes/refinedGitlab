import { getOptions, onOptionsChanged } from './options';
import { scheduleRunFeatures } from './runner';
import { onNavigation } from './spa-navigation';
import { rgDebug, rgError } from './debug';

export async function bootstrap(): Promise<void> {
  const loadAndRun = async (reason: 'nav' | 'options' | 'boot') => {
    try {
      const opts = await getOptions();
      scheduleRunFeatures(opts.features, reason);
    } catch (err) {
      rgError('loadAndRun failed', err);
    }
  };

  rgDebug('bootstrap');
  await loadAndRun('boot');
  onNavigation(() => {
    void loadAndRun('nav');
  });
  onOptionsChanged(() => {
    void loadAndRun('options');
  });
}
