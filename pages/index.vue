<template>
  <div class="link">
    <ul class="link-list">
      <li class="link-item">
        <nuxt-link to="/media-devices">MediaDevices</nuxt-link>
      </li>
      <li class="link-item">
        <nuxt-link to="/peer-connections">RTCPeerConnection（STUN, P2P）</nuxt-link>
      </li>
    </ul>
  </div>
</template>

<script lang="ts">
import Vue from 'vue'

export default Vue.extend({})
</script>

<style scoped>
  .link {
    margin: 60px auto;
    width: 640px;
    max-width: 100%;
  }

  .link-list {
    list-style: none;
  }

  .link-item {
    line-height: 1.6;
    text-align: center;
  }
</style>
