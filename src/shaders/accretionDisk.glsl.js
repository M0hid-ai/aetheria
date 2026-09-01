// AETHERIA - Accretion Disk GLSL Shaders with Relativistic Doppler Beaming

export const accretionDiskVertexShader = `
  varying vec2 vUv;
  varying vec3 vWorldPosition;
  varying vec3 vNormal;

  void main() {
    vUv = uv;
    vNormal = normalize(normalMatrix * normal);
    vec4 worldPos = modelMatrix * vec4(position, 1.0);
    vWorldPosition = worldPos.xyz;
    gl_Position = projectionMatrix * viewMatrix * worldPos;
  }
`;

export const accretionDiskFragmentShader = `
  uniform float uTime;
  uniform float uInnerRadius;
  uniform float uOuterRadius;
  uniform vec3 uPrimaryColor;
  uniform vec3 uSecondaryColor;
  uniform vec3 uAccentColor;
  uniform float uAudioEnergy;
  uniform vec3 uCameraPos;

  varying vec2 vUv;
  varying vec3 vWorldPosition;
  varying vec3 vNormal;

  // 2D Simplex/Perlin Noise functions for plasma turbulence
  vec3 mod289(vec3 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
  vec2 mod289(vec2 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
  vec3 permute(vec3 x) { return mod289(((x*34.0)+1.0)*x); }

  float snoise(vec2 v) {
    const vec4 C = vec4(0.211324865405187,  // (3.0-sqrt(3.0))/6.0
                        0.366025403784439,  // 0.5*(sqrt(3.0)-1.0)
                       -0.577350269189626,  // -1.0 + 2.0 * C.x
                        0.024390243902439); // 1.0 / 41.0
    vec2 i  = floor(v + dot(v, C.yy) );
    vec2 x0 = v -   i + dot(i, C.xx);
    vec2 i1 = (x0.x > x0.y) ? vec2(1.0, 0.0) : vec2(0.0, 1.0);
    vec4 x12 = x0.xyxy + C.xxzz;
    x12.xy -= i1;
    i = mod289(i);
    vec3 p = permute( permute( i.y + vec3(0.0, i1.y, 1.0 ))
      + i.x + vec3(0.0, i1.x, 1.0 ));
    vec3 m = max(0.5 - vec3(dot(x0,x0), dot(x12.xy,x12.xy), dot(x12.zw,x12.zw)), 0.0);
    m = m*m ;
    m = m*m ;
    vec3 x = 2.0 * fract(p * C.www) - 1.0;
    vec3 h = abs(x) - 0.5;
    vec3 ox = floor(x + 0.5);
    vec3 a0 = x - ox;
    m *= 1.79284291400159 - 0.85373472095314 * ( a0*a0 + h*h );
    vec3 g;
    g.x  = a0.x  * x0.x  + h.x  * x0.y;
    g.yz = a0.yz * x12.xz + h.yz * x12.yw;
    return 130.0 * dot(m, g);
  }

  // Fractal Brownian Motion for swirling plasma filaments
  float fbm(vec2 p) {
    float total = 0.0;
    float amp = 0.5;
    for (int i = 0; i < 4; i++) {
      total += snoise(p) * amp;
      p *= 2.1;
      amp *= 0.5;
    }
    return total;
  }

  void main() {
    // Polar coordinates from center (0,0,0) in XZ plane
    float r = length(vWorldPosition.xz);
    float theta = atan(vWorldPosition.z, vWorldPosition.x);

    // Discard outside accretion bounds
    if (r < uInnerRadius || r > uOuterRadius) {
      discard;
    }

    // Normalized radial distance [0, 1] across disk
    float normR = (r - uInnerRadius) / (uOuterRadius - uInnerRadius);

    // Differential Keplerian orbital angular velocity: omega proportional to r^(-3/2)
    float omega = 12.0 * pow(uInnerRadius / r, 1.5);
    float angle = theta + omega * (uTime * 0.4);

    // Logarithmic spiral UV coords for swirling plasma
    vec2 spiralUv = vec2(angle * 2.5, normR * 8.0 - uTime * 0.5);
    float noise1 = fbm(spiralUv);
    float noise2 = fbm(spiralUv * 2.0 + vec2(uTime * 0.8, -uTime * 0.3));
    float plasma = clamp(noise1 * 0.6 + noise2 * 0.4 + 0.3, 0.0, 1.5);

    // Relativistic Doppler Beaming:
    // Disk tangent vector in XZ plane: (-sin(theta), 0, cos(theta))
    vec3 tangent = normalize(vec3(-sin(theta), 0.0, cos(theta)));
    vec3 viewDir = normalize(uCameraPos - vWorldPosition);
    float dopplerCos = dot(tangent, viewDir);
    // Relativistic beaming factor (matter moving toward camera is amplified & blue-shifted)
    float beaming = clamp(1.0 + dopplerCos * 0.75, 0.35, 2.0);

    // Temperature & Color Gradient
    // Inner edge is hottest (white/accent), mid is primary (amber/cyan), outer is secondary/dim
    vec3 col = mix(uPrimaryColor, uSecondaryColor, normR);
    col = mix(col, uAccentColor, pow(1.0 - normR, 3.0) * 0.8);

    // Apply Doppler chromatic shift
    if (dopplerCos > 0.0) {
      col = mix(col, uAccentColor, dopplerCos * 0.4); // Blue/bright shift
    } else {
      col = mix(col, uSecondaryColor * 0.6, -dopplerCos * 0.5); // Red/dim shift
    }

    // Audio-reactive flare
    float audioBoost = 1.0 + uAudioEnergy * 1.5;
    col *= plasma * beaming * audioBoost * 1.8;

    // Edge fading (smoothstep at inner and outer boundaries)
    float innerFade = smoothstep(uInnerRadius, uInnerRadius + 1.2, r);
    float outerFade = smoothstep(uOuterRadius, uOuterRadius - 3.5, r);
    float alpha = innerFade * outerFade * clamp(plasma * 1.2, 0.0, 1.0);

    gl_FragColor = vec4(col, alpha * 0.95);
  }
`;
