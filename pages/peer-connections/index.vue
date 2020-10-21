<template>
  <div class="wrap">
    <div class="title">RTCPeerConnection（STUN, P2P）</div>

    <div class="action">
      <div class="action-list">
        <div class="action-item" @click="makeOffer">makeOffer（Vanilla ICEなので時間かかる）</div>
        <div class="action-item" @click="receiveOffer">receiveOffer</div>
        <div class="action-item" @click="receiveAnswer">receiveAnswer</div>
      </div>
    </div>

    <div class="video">
      <div class="video-list">
        <div class="video-item">
          <video ref="localVideo" class="video-media" autoplay playsinline></video>
        </div>
        <div class="video-item">
          <video ref="remoteVideo" class="video-media" autoplay playsinline></video>
        </div>
      </div>
    </div>

    <div class="log">
      <div class="log-title">SDP（local）</div>
      <textarea class="log-body" v-model="sdp2Local"></textarea>
    </div>

    <div class="log">
      <div class="log-title">SDP（remote）</div>
      <textarea class="log-body" v-model="sdp2Remote"></textarea>
    </div>

  </div>
</template>

<script lang="ts">
import Vue from 'vue'

const openMediaDevices = async (constraints: MediaStreamConstraints) => {
  return await navigator.mediaDevices.getUserMedia(constraints)
}

export default Vue.extend({
  data(): {
    peerConnection?: RTCPeerConnection,
    sdp2Local?: string,
    sdp2Remote?: string,
    localVideoStream: any,
    remoteVideoStream: any,
  } {
    return {
      peerConnection: undefined,
      sdp2Local: '',
      sdp2Remote: '',
      localVideoStream: null,
      remoteVideoStream: null,
    }
  },

  mounted(): void {
    const configuration = {
      'iceServers': [{ 'urls': 'stun:stun.l.google.com:19302' } ],
    }
    this.peerConnection = new RTCPeerConnection(configuration)

    this.remoteVideoStream = new MediaStream()

    const remoteVideoElm: any = this.$refs.remoteVideo
    remoteVideoElm.srcObject = this.remoteVideoStream

    // this.peerConnection.onicecandidate = () => {
    //   console.log('onicecandidate')
    // }
    // this.peerConnection.onicegatheringstatechange = () => {
    //   console.log('onicegatheringstatechange')
    // }
    //
    // this.peerConnection.onicecandidateerror = (e) => {
    //   console.log('onicecandidateerror', e)
    // }

    this.peerConnection.addEventListener('icecandidate', (event) => {
      // console.log('icecandidate', event)
      if (event.candidate !== null) {
        // 経路の候補が見つかったとき
        // console.log(event.candidate)
      } else {
        // 全ての経路を見つけ尽くしたとき
        console.log('icecandidate all')
        if (this.peerConnection !== undefined && this.peerConnection.localDescription !== null) {
          this.sdp2Local = this.peerConnection.localDescription.sdp
        }
      }
    })

    this.peerConnection.addEventListener('connectionstatechange', (event) => {
      console.log('connectionstatechange')
      if (this.peerConnection !== undefined && this.peerConnection.connectionState === 'connected') {
        console.log('Peers connected!')
      }
    })

    this.peerConnection.addEventListener('track', (event) => {
      this.remoteVideoStream.addTrack(event.track, this.remoteVideoStream)
    })
  },

  destroyed(): void {

  },

  methods: {
    async makeOffer() {
      if (this.peerConnection === undefined) { return }

      try {
        const constraints = { 'video': true, 'audio': true }
        this.localVideoStream = await openMediaDevices(constraints)
        const videoElm: any = this.$refs.localVideo
        videoElm.srcObject = this.localVideoStream

        for (const track of this.localVideoStream.getTracks()) {
          this.peerConnection.addTrack(track, this.localVideoStream);
        }

        // TODO 取得まわりでエラーが発生するか確認
        const offer = await this.peerConnection.createOffer()
        await this.peerConnection.setLocalDescription(offer)
        // console.log('createOffer offer', offer)
        // console.log(offer.sdp)
        // this.sdp2Local = offer.sdp
      } catch(err) {
        console.error('makeOffer', err)
      }
    },

    async receiveOffer() {
      if (this.sdp2Remote === '') { return }
      if (this.peerConnection === undefined) { return }

      const remoteSDP = new RTCSessionDescription({
        type: 'offer',
        sdp: this.sdp2Remote,
      })

      try {
        const constraints = { 'video': true, 'audio': true }
        this.localVideoStream = await openMediaDevices(constraints)
        const videoElm: any = this.$refs.localVideo
        videoElm.srcObject = this.localVideoStream

        for (const track of this.localVideoStream.getTracks()) {
          this.peerConnection.addTrack(track, this.localVideoStream);
        }

        await this.peerConnection.setRemoteDescription(remoteSDP)
        const answer = await this.peerConnection.createAnswer()
        await this.peerConnection.setLocalDescription(answer)
        // console.log(typeof answer.sdp)
        // console.log('receiveOffer answer', answer)
        // this.sdp2Local = answer.sdp
      } catch(err) {
        console.error('receiveOffer', err)
      }
    },

    async receiveAnswer() {
      console.log('receiveAnswer')
      if (this.sdp2Remote === '') { return }
      if (this.peerConnection === undefined) { return }

      const remoteSDP = new RTCSessionDescription({
        type: 'answer',
        sdp: this.sdp2Remote,
      })
      console.log('receiveAnswer answer', remoteSDP)
      try {
        await this.peerConnection.setRemoteDescription(remoteSDP)
      } catch(err) {
        console.error('receiveAnswer', err)
      }
    },
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

  .video-list {
    font-size: 0;
  }

  .video-item {
    display: inline-block;
    width: 49%;
    font-size: inherit;
  }

  .video-media {
    width: 100%;
    height: auto;
  }
</style>
