<template>
  <div class="svg-container">
    <div class="controls">
      <button @click="instance?.zoomIn()">Zoom In</button>
      <button @click="instance?.zoomOut()">Zoom Out</button>
      <button @click="instance?.reset()">Reset</button>
      <button @click="instance?.fit()">Fit</button>
      <button @click="instance?.center()">Center</button>
    </div>

    <div ref="containerRef" class="demo">
      <svg viewBox="0 0 800 450" width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <linearGradient id="g" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0" stop-color="#60a5fa" />
            <stop offset="1" stop-color="#a78bfa" />
          </linearGradient>
        </defs>

        <g data-spz-viewport="true">
          <rect x="0" y="0" width="800" height="450" fill="#0b1220" />
          <rect x="40" y="40" width="720" height="370" rx="24" fill="url(#g)" opacity="0.35" />
          <circle cx="200" cy="220" r="70" fill="#22c55e" opacity="0.85" />
          <circle cx="580" cy="220" r="95" fill="#ef4444" opacity="0.75" />
        </g>
      </svg>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount } from 'vue';
import { createSvgPanZoom } from '@riky1/svg-panzoom';
import '@riky1/svg-panzoom/style.css';

const containerRef = ref(null);
const instance = ref(null);

onMounted(() => {
  // Crea l'istanza quando il component è montato nel DOM
  instance.value = createSvgPanZoom({
    element: containerRef.value,
    viewportSelector: '[data-spz-viewport]',
    maxZoom: 6,
    wheelZoom: true,
    panEnabled: true,
    bounds: { enabled: true, padding: 20, overflow: true },
    fitOnInit: true,
    centerOnInit: true,
    zoomStep: 0.25
  });

  // (Opzionale) Ascolta gli eventi
  instance.value.on('change', (state) => {
    console.log('State changed:', state);
  });

  instance.value.on('zoom', (e) => {
    console.log('Zoom:', e);
  });
});

onBeforeUnmount(() => {
  // Cleanup: distruggi l'istanza quando il component si smonta
  if (instance.value) {
    instance.value.destroy();
    instance.value = null;
  }
});
</script>

<style scoped>
.svg-container {
  display: flex;
  flex-direction: column;
  height: 100%;
}

.controls {
  padding: 12px 16px;
  border-bottom: 1px solid #e5e7eb;
  display: flex;
  gap: 8px;
}

.demo {
  flex: 1;
  border: 1px solid #e5e7eb;
  border-radius: 12px;
  overflow: hidden;
}

button {
  appearance: none;
  border: 1px solid #cbd5e1;
  background: #fff;
  border-radius: 8px;
  padding: 8px 10px;
  cursor: pointer;
}

button:hover {
  background: #f8fafc;
}
</style>
