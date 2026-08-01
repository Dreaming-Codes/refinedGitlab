import { For, createResource, createSignal } from 'solid-js';
import { FEATURE_MANIFEST } from '@/features/manifest';
import { getOptions, setFeatureEnabled } from '@/utils/options';
import './App.css';

function App() {
  const [options, { refetch }] = createResource(getOptions);
  const [error, setError] = createSignal<string | null>(null);

  async function toggle(id: string, enabled: boolean) {
    setError(null);
    try {
      await setFeatureEnabled(id, enabled);
      await refetch();
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    }
  }

  return (
    <main class="popup">
      <header>
        <h1>Refined GitLab</h1>
      </header>

      <section>
        <h2>Features</h2>
        <ul class="feature-list">
          <For each={[...FEATURE_MANIFEST]}>
            {(meta) => {
              const enabled = () =>
                options()?.features[meta.id] ?? meta.defaultEnabled ?? true;
              return (
                <li>
                  <label class="feature-row">
                    <input
                      type="checkbox"
                      checked={enabled()}
                      disabled={options.loading}
                      onChange={(e) =>
                        void toggle(meta.id, e.currentTarget.checked)
                      }
                    />
                    <span>
                      <span class="feature-name">{meta.name}</span>
                      <span class="feature-desc">{meta.description}</span>
                    </span>
                  </label>
                </li>
              );
            }}
          </For>
        </ul>
      </section>

      {error() && <p class="error">{error()}</p>}
    </main>
  );
}

export default App;
