export function createPinyinMatchLoader({ ref }) {
  if (typeof ref !== 'function') {
    throw new TypeError('createPinyinMatchLoader requires Vue ref factory');
  }

  const pinyinMatch = ref(null);
  let pinyinMatchPromise;

  const loadPinyinMatch = () => {
    if (!pinyinMatchPromise) {
      pinyinMatchPromise = import('pinyin-pro').then(({ match }) => {
        pinyinMatch.value = match;
        return match;
      });
    }
    return pinyinMatchPromise;
  };

  return {
    pinyinMatch,
    loadPinyinMatch,
  };
}
