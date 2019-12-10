module.exports = {
  pluginOptions: {
    electronBuilder: {
      builderOptions: {
        artifactName: '${name}-${version}-${os}-${arch}.${ext}',
        mac: {
          identity: 'Electron CodeSign Test',
        },
        win: {
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
