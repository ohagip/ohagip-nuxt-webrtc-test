<template>
  <div class="wrap">
    <div class="title">MediaDevices</div>

    <div class="subTitle">MediaDevices: devicechange event</div>
    <div class="log">
      <div class="log-title">log（event.timeStamp）</div>
      <div class="log-body">
        <ul class="log-list" v-for="(item, index) in devicechangeLog">
          <li class="log-item">{{ item }}</li>
        </ul>
      </div>
    </div>
    <div class="note">
      Safari対応してない、要ブラウザチェック<br>
      Chromeでイベントが複数回飛ぶ、要挙動チェック
    </div>

    <div class="subTitle">MediaDevices.getUserMedia()</div>
    <div class="action">
      <div class="action-list">
        <div class="action-item" @click="startUserMedia">start</div>
        <div class="action-item" @click="stopUserMedia">stop</div>
      </div>
    </div>
    <div class="video">
      <video ref="video" class="video-media" autoplay playsinline></video>
    </div>

    <div class="subTitle">MediaDevices.enumerateDevices()</div>
    <div class="action">
      <div class="action-list">
        <div class="action-item" @click="getVideoDevices">getVideoDevices</div>
        <div class="action-item" @click="getAudioDevices">getAudioDevices</div>
      </div>
    </div>
    <div class="log">
      <div class="log-title">video</div>
      <div class="log-body">
        <ul class="log-list" v-for="(item, index) in videoDevices">
          <li class="log-item">
            {{ item.label }}<br>
            └ {{ item.deviceId }}
          </li>
        </ul>
      </div>
    </div>
    <div class="log">
      <div class="log-title">audio</div>
      <div class="log-body">
        <ul class="log-list" v-for="(item, index) in audioDevices">
          <li class="log-item">
            {{ item.label }}<br>
            └ {{ item.deviceId }}
          </li>
        </ul>
      </div>
    </div>
    <div class="note">
      デバイスのアクセス許可をしていないとき、<br>
      エラーは起きないがデバイスのlabel, deviceIdが空文字になっている<br>
      また、USBで接続しているWebCamは含まれない<br>
      一旦Mac Chromeのみ確認
    </div>
  </div>
</template>

<script lang="ts">
import Vue from 'vue'

const openMediaDevices = async (constraints: MediaStreamConstraints) => {
  return await navigator.mediaDevices.getUserMedia(constraints)
}

const getConnectedDevices = async (type: string) => {
  const devices = await navigator.mediaDevices.enumerateDevices()
  console.log('getConnectedDevices', devices)
  return devices.filter(device => device.kind === type)
}

export default Vue.extend({
  data(): {
    devicechangeLog: number[],
    videoDevices: { label: string, deviceId: string }[],
    audioDevices: { label: string, deviceId: string }[],
    videoStream: any,
  } {
    return {
      devicechangeLog: [],
      videoDevices: [],
      audioDevices: [],
      videoStream: null
    }
  },

  mounted(): void {
    this.setDeviceChangeEvent()
  },

  destroyed(): void {
    this.removeDeviceChangeEvent()
  },

  methods: {
    setDeviceChangeEvent(): void {
      /**
       * https://developer.mozilla.org/en-US/docs/Web/API/MediaDevices/devicechange_event
       * Safari対応してない
       * Chromeでイベントが複数回飛ぶ
       * 要ブラウザチェック
       */
      navigator.mediaDevices.addEventListener('devicechange', this.updateDeviceList)
    },

    removeDeviceChangeEvent(): void {
      navigator.mediaDevices.removeEventListener('devicechange', this.updateDeviceList)
    },

    updateDeviceList(e: Event): void {
      console.log(e)
      this.devicechangeLog.push(e.timeStamp)
    },

    async startUserMedia() {
      const constraints = { 'video': true, 'audio': true }

      try {
        this.videoStream = await openMediaDevices(constraints)
        const videoElm: any = this.$refs.video
        console.log(this.videoStream)
        console.log(videoElm)
        videoElm.srcObject = this.videoStream
        // 属性にautoplayを設定していたらいらない（要ブラウザチェック）
        // videoElm.onloadedmetadata = function() {
        //   videoElm.play()
        // }
      } catch(err) {
        console.error(err, err.name)
      }
    },

    stopUserMedia() {
      if (this.videoStream !== null) {
        const tracks = this.videoStream.getTracks()
        tracks.forEach((track: any) => {
          track.stop()
        })
      }

      const videoElm: any = this.$refs.video
      videoElm.srcObject = null
      videoElm.onloadedmetadata = null
    },

    async getVideoDevices() {
      try {
        const devices = await getConnectedDevices('videoinput')
        console.log(devices)
        this.videoDevices = devices.map(({ label, deviceId }) => {
          return { label, deviceId }
        })
      } catch(err) {
        console.error(err, err.name)
      }
    },

    async getAudioDevices() {
      try {
        const devices = await getConnectedDevices('audioinput')
        console.log(devices)
        this.audioDevices = devices.map(({ label, deviceId }) => {
          return { label, deviceId }
        })
      } catch(err) {
        console.error(err, err.name)
      }
    }
  },
})
</script>

<style scoped>
  .wrap {
    margin: 64px auto;
    width: 640px;
    max-width: 100%;
  }

  .title {
    margin: 64px 0 0;
    text-align: center;
    font-size: 24px;
    font-weight: bold;
  }

  .subTitle {
    margin: 64px 0 0;
    text-align: center;
    font-size: 16px;
    font-weight: bold;
  }

  .note {
    margin: 16px 0 0;
    font-size: 14px;
    line-height: 1.3;
  }

  .log {
    margin: 24px 0 0;
  }

  .log-title {

  }

  .log-body {
    overflow-y: scroll;
    margin: 8px 0 0;
    padding: 8px;
    width: 100%;
    height: 160px;
    background-color: black;
    font-size: 16px;
    line-height: 1.33;
    color: #fff;
  }

  .log-list {
    padding: 0;
    list-style: none;
  }

  .log-item {
    font-size: 16px;
  }

  .action {
    margin: 24px 0 0;
  }

  .action-item {
    display: inline-block;
    cursor: pointer;
  }

  .action-item + .action-item {
    margin-left: 16px;
  }

  .video {
    margin: 8px 0 0;
    background-color: #ccc;
  }

  .video-media {
    width: 100%;
    height: auto;
  }

</style>
