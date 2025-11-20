const storageMock = (() => {
  let store = {};
  return {
    getItem: key => (key in store ? store[key] : null),
    setItem: (key, value) => {
      store[key] = value?.toString() ?? '';
    },
    removeItem: key => {
      delete store[key];
    },
    clear: () => {
      store = {};
    }
  };
})();

global.localStorage = storageMock;
global.sessionStorage = storageMock;

if (typeof beforeEach === 'function') {
  beforeEach(() => {
    storageMock.clear();
  });
}
