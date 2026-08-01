import { feature } from '@/utils/feature';
import { isMRPage } from '@/utils/page-detect';
import { betterChangeCountsMeta } from './meta';
import { initBetterChangeCounts } from './init';

feature({
  ...betterChangeCountsMeta,
  include: [isMRPage],
  init: initBetterChangeCounts,
});
