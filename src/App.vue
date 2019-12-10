<template>
  <div id="app">
    <div>Current version: {{version}}</div>
    <div>
      <div>Checking for update: {{ checkingUpdate }}</div>
      <button @click="checkForUpdate">Check for updates</button>
    </div>
    <div v-if="hasUpdate">
      <div>New updates are available!</div>
      <div v-if="downloadProgress === null">
        <button v-if="!updateReady" @click="downloadUpdate">Download update</button>
        <button v-else @click="installUpdate">Install update</button>
      </div>
    </div>
    <div v-else>No new update available</div>
    <div v-if="downloadProgress !== null">Update download progress: {{ downloadProgress }}</div>
  </div>
</template>

<script>
import { ipcRenderer } from 'electron';

export default {
  name: 'app',
  components: {},
  data: function() {
    return {
      version: '',
      checkingUpdate: false,
      hasUpdate: false,
      newVersion: '',
      downloadProgress: null,
      updateReady: false,
    };
  },
  mounted: function() {
    console.log('App mounted');

    ipcRenderer.on('version-info', (_, versionInfo) => {
      this.version = versionInfo.version;
      this.checkingUpdate = versionInfo.checkingUpdate;
      this.hasUpdate = versionInfo.hasUpdate;
    });

    ipcRenderer.on('update-progress', (_, progress) => {
      this.downloadProgress = Math.floor(progress);
    });

    ipcRenderer.on('update-ready-for-install', () => {
      this.updateReady = true;
      this.downloadProgress = null;
    });
  },
  methods: {
    checkForUpdate() {
      ipcRenderer.send('check-for-update');
    },
    downloadUpdate() {
      ipcRenderer.send('download-update');
    },
    installUpdate() {
      if (this.updateReady) {
        ipcRenderer.send('install-update');
      }
    }
  }
}
</script>

<style>
#app {
  font-family: 'Avenir', Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
  margin-top: 60px;
}
</style>
