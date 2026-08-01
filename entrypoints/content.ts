import { bootstrap } from '@/utils/bootstrap';
import '@/assets/refined-gitlab.css';
import '@/features';

export default defineContentScript({
  matches: ['*://*/*'],
  runAt: 'document_idle',
  main() {
    void bootstrap();
  },
});
