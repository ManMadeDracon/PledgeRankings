<script setup lang="ts">
/**
 * CSS port of the Figma "Soft bloom" shader fill (node 1:2).
 * The original is WGSL/WebGPU, which most mobile browsers still lack, so the
 * gradient stack below reproduces its parameters — vertical background ramp,
 * four soft blobs, an offset warm glow, and film grain — with the same colors
 * and positions.
 */
</script>

<template>
  <div
    class="app-bg"
    aria-hidden="true"
  >
    <svg class="app-bg__grain">
      <filter id="bloom-grain">
        <feTurbulence
          type="fractalNoise"
          base-frequency="0.8"
          num-octaves="3"
          stitch-tiles="stitch"
        />
        <feColorMatrix type="saturate" values="0" />
      </filter>
      <rect width="100%" height="100%" filter="url(#bloom-grain)" />
    </svg>
  </div>
</template>

<style scoped>
.app-bg {
  position: fixed;
  inset: 0;
  z-index: -1;
  pointer-events: none;

  /* baseR in the shader: min(width, height) * 0.25 * blobSize(1.61) */
  --r: calc(min(100vw, 100dvh) * 0.4025);

  background:
    /* blob 4 */
    radial-gradient(
      circle var(--r) at 28.18% 93.87%,
      rgba(123, 156, 199, 0.6) 0%,
      rgba(123, 156, 199, 0) 72%
    ),
    /* blob 3 */
    radial-gradient(
      circle var(--r) at 83.72% 69.15%,
      rgba(123, 156, 199, 0.6) 0%,
      rgba(123, 156, 199, 0) 72%
    ),
    /* blob 2 */
    radial-gradient(
      circle var(--r) at 75.56% 15.01%,
      rgba(123, 156, 199, 0.6) 0%,
      rgba(123, 156, 199, 0) 72%
    ),
    /* blob 1 */
    radial-gradient(
      circle var(--r) at 22.96% 46.6%,
      rgba(123, 156, 199, 0.6) 0%,
      rgba(123, 156, 199, 0) 72%
    ),
    /* warm glow, offset down-right of blob 1 */
    radial-gradient(
      circle calc(var(--r) * 1.1) at
        calc(22.96% + var(--r) * 0.3) calc(46.6% + var(--r) * 0.25),
      rgba(232, 149, 90, 0.5) 0%,
      rgba(232, 149, 90, 0) 78%
    ),
    /* background ramp: top -> midpoint -> bottom */
    linear-gradient(180deg, #c5c6e8 0%, #ddc6c6 50%, #f5c5a3 100%);
  background-attachment: fixed;
}

.app-bg__grain {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  opacity: 0.16; /* grainDensity 0.4 * falloff */
  mix-blend-mode: overlay;
}
</style>
