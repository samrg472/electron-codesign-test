const FORCE_CODE_SIGNING = process.env.FORCE_CODE_SIGNING !== 'false';
if (FORCE_CODE_SIGNING) {
  console.log('Code signing is enforced!');
} else {
  console.log('[WARN] Code signing is not forced, builds may not be signed');
}

module.exports = {
  pluginOptions: {
    electronBuilder: {
      builderOptions: {
        artifactName: '${name}-${version}-${os}-${arch}.${ext}',
        mac: {
          forceCodeSigning: FORCE_CODE_SIGNING,
          identity: 'Electron CodeSign Test',
        },
        win: {
          forceCodeSigning: FORCE_CODE_SIGNING,
          target: [{ target: 'nsis', arch: ['ia32', 'x64'] }],
        },
        linux: {
          target: [
            { target: 'AppImage', arch: ['x64'] },
            { target: 'zip', arch: ['x64'] },
          ],
        },
      },
    },
  },
};
