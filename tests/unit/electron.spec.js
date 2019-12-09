import { testWithSpectron } from 'vue-cli-plugin-electron-builder';

jest.setTimeout(50000);

let app;
let stopServe;

beforeAll(async () => {
  const spectron = await testWithSpectron();
  app = spectron.app;
  stopServe = spectron.stopServe;
  console.log('STOP SERVE:', stopServe);
});

afterAll(async () => {
  console.log('STOP SERVE:', stopServe);
  if (stopServe) {
    await stopServe();
  }
});

beforeEach(async () => {
  await app.restart();
});

test('Window Loads Properly', async () => {
  const win = app.browserWindow;
  const client = app.client;

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
