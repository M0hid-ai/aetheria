// AETHERIA - Gravitational Lensing & Spacetime Distortion Shader

export const lensingShader = {
  uniforms: {
    tDiffuse: { value: null },
    uBlackHoleScreenPos: { value: [0.5, 0.5] },
    uAspect: { value: 1.0 },
    uHorizonScreenRadius: { value: 0.05 },
    uLensingStrength: { value: 0.02 },
    uActive: { value: 1.0 },
    uTime: { value: 0.0 },
    // Shockwave ripple parameters
    uShockwaveCenter: { value: [0.5, 0.5] },
    uShockwaveTime: { value: -1.0 }, // -1 means inactive
    uShockwaveSpeed: { value: 0.8 },
    uShockwaveWidth: { value: 0.12 },
    uShockwaveStrength: { value: 0.04 }
  },

  vertexShader: `
    varying vec2 vUv;
    void main() {
      vUv = uv;
      gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    }
  `,

  fragmentShader: `
    uniform sampler2D tDiffuse;
    uniform vec2 uBlackHoleScreenPos;
    uniform float uAspect;
    uniform float uHorizonScreenRadius;
    uniform float uLensingStrength;
    uniform float uActive;
    uniform float uTime;

    uniform vec2 uShockwaveCenter;
    uniform float uShockwaveTime;
    uniform float uShockwaveSpeed;
    uniform float uShockwaveWidth;
    uniform float uShockwaveStrength;

    varying vec2 vUv;

    void main() {
      vec2 uv = vUv;

      // 1. Gravitational Lensing deflection
      if (uActive > 0.5 && uHorizonScreenRadius > 0.001) {
        // Aspect-ratio corrected displacement vector to singularity
        vec2 diff = uv - uBlackHoleScreenPos;
        diff.x *= uAspect;
        float dist = length(diff);

        // Einstein ring deflection: deflection angle ~ 1 / dist
        if (dist > uHorizonScreenRadius * 0.95) {
          float deflection = uLensingStrength / (dist + 0.0001);
          // Clamp deflection so it doesn't wrap wildly
          deflection = min(deflection, 0.15);
          vec2 dir = normalize(diff);
          dir.x /= uAspect;
          uv -= dir * deflection;
        }
      }

      // 2. Shockwave Ripple Distortion
      if (uShockwaveTime >= 0.0) {
        float waveRadius = uShockwaveTime * uShockwaveSpeed;
        vec2 swDiff = vUv - uShockwaveCenter;
        swDiff.x *= uAspect;
        float swDist = length(swDiff);

        float waveDist = abs(swDist - waveRadius);
        if (waveDist < uShockwaveWidth) {
          float waveFactor = (uShockwaveWidth - waveDist) / uShockwaveWidth;
          float sinFactor = sin(waveFactor * 3.14159);
          // Decay with time
          float decay = max(0.0, 1.0 - uShockwaveTime * 0.6);
          float offset = sinFactor * uShockwaveStrength * decay;

          vec2 normDir = normalize(swDiff);
          normDir.x /= uAspect;
          uv += normDir * offset;
        }
      }

      // Chromatic Aberration near high-deflection points
      vec2 uvR = uv;
      vec2 uvG = uv;
      vec2 uvB = uv;

      if (uShockwaveTime >= 0.0) {
        float decay = max(0.0, 1.0 - uShockwaveTime * 0.7);
        float caStrength = 0.008 * decay;
        vec2 caDir = normalize(vUv - uShockwaveCenter);
        uvR += caDir * caStrength;
        uvB -= caDir * caStrength;
      }

      float r = texture2D(tDiffuse, uvR).r;
      float g = texture2D(tDiffuse, uvG).g;
      float b = texture2D(tDiffuse, uvB).b;

      gl_FragColor = vec4(r, g, b, 1.0);
    }
  `
};
