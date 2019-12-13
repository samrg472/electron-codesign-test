import { testWithSpectron } from 'vue-cli-plugin-electron-builder';
import path from 'path';

jest.setTimeout(50000);

let spectron;

beforeAll(async () => {
  spectron = await testWithSpectron({
    mode: 'development',
    spectronOptions: {
      chromeDriverLogPath: path.join(__dirname, 'chromedriver.log'),
      webdriverLogPath: path.join(__dirname, 'webdriver.log')
    }
  });
});

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
