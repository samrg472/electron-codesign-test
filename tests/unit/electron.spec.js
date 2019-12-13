import { testWithSpectron } from 'vue-cli-plugin-electron-builder';

let spectron;

beforeAll(async () => {
  spectron = await testWithSpectron();
}, 2 * 60 * 1000);

afterAll(async () => {
  if (spectron) {
    await spectron.stopServe();
  }
});

beforeEach(async () => {
  if (spectron) {
    await spectron.app.restart();
  }
});

test('Window Loads Properly', async () => {
  const win = spectron.app.browserWindow;
  const client = spectron.app.client;

  // Window was created
  expect(await client.getWindowCount()).toBe(1);
  // It is not minimized
  expect(await win.isMinimized()).toBe(false);
  // Window is visible
  expect(await win.isVisible()).toBe(true);
  // Size is correct
  const { width, height } = await win.getBounds();
  expect(width).toBeGreaterThan(0);
  expect(height).toBeGreaterThan(0);
});
