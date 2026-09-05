import { useEffect, useRef } from 'react';
import liquid from '../shaders/liquid.glsl?raw';
import logo from '../shaders/logo.glsl?raw';

const black = [0, 0, 0, 1];
const logoColors = [
  black,
  [0, 152 / 255, 243 / 255, 1],
  black,
  [218 / 255, 78 / 255, 36 / 255, 1],
];
const logoUniforms = {
  angle: 20,
  bend: 0.73,
  colorBack: black,
  contour: 1,
  motionMode: 1,
  turbIter: 6,
  colors: logoColors,
};
const logoPreset = (
  image,
  fallback,
  scale,
  seed,
  speed,
  turbAmp,
  turbFreq,
  waveFreq,
) => ({
  kind: 'logo',
  image,
  fallback,
  uniforms: {
    ...logoUniforms,
    scale,
    seed,
    speed,
    turbAmp,
    turbFreq,
    waveFreq,
  },
});
const presets = {
  'framer-2c8pm2-container': {
    kind: 'liquid',
    fallback: 'kfd2lClDBkD5Ho35P520jyabM',
    uniforms: {
      colors: [
        black,
        [33 / 255, 159 / 255, 241 / 255, 1],
        black,
        [1, 81 / 255, 0, 1],
      ],
      contrast: 1.1,
      distBias: 0,
      dither: 0.05,
      ditherMode: 0,
      exposure: 1.1,
      jellify: 0,
      loop: 0,
      saturation: 1,
      scale: 0.17,
      seed: 648,
      speed: 0.5,
      turbAmp: 0.6,
      turbFreq: 0.7,
      turbIter: 6,
      waveFreq: 3.8,
    },
  },
  'framer-meh7xt-container': logoPreset(
    'B8Gfzp2iuX3zr0hXqzy5CKPjWow',
    '9YTqFHuM8NChDkE1s1hYzrNN348',
    0.58,
    6,
    0.65,
    0.74,
    1.2,
    1.8,
  ),
  'framer-16amyoj-container': logoPreset(
    'DMDrlJx19k76saWIxeHXyFGBn4',
    'jgZpfC5YLyyidHutUnAZQi0GhaE',
    0.69,
    8,
    0.64,
    0.79,
    1.09,
    2.7,
  ),
  'framer-cifcpl-container': logoPreset(
    'utuTAvbP481llxleiQFekeSGvuY',
    'eR3kBTkIWJkm3IGwQ1k5UJrO2go',
    0.59,
    8,
    0.64,
    0.74,
    1.14,
    3.8,
  ),
  'framer-1nu49vs-container': logoPreset(
    'Ru9ycpUwuwhRPUw54J9a6ZuS9I',
    'uQI7pUHkORj7Reqfwlz5RvIiME',
    0.92,
    11,
    0.64,
    0.74,
    1.14,
    1.8,
  ),
  'framer-1ypbnk5-container': logoPreset(
    '9CdEGBm2kDCgfWOVbtiVOukk1nE',
    'voeJuivo56UxnoWnMSNI8SsdfQ',
    0.9,
    18,
    0.64,
    0.74,
    1.14,
    1.8,
  ),
};
const vertex = `#version 300 es
in vec2 a_position;
in vec2 a_texCoord;
out vec2 v_uv;
void main(){v_uv=a_texCoord;gl_Position=vec4(a_position,0.0,1.0);}`;

// These are the reference fragment shaders, driven by a small React-owned renderer.
function mountShader(canvas, preset) {
  const gl = canvas.getContext('webgl2', {
    alpha: true,
    antialias: false,
    premultipliedAlpha: false,
  });
  if (!gl) {
    canvas.dataset.motionState = 'fallback';
    return () => {};
  }
  const body = preset.kind === 'liquid' ? liquid : logo;
  const uniforms = {
    ...preset.uniforms,
    time: 0,
    resolution: [1, 1],
    pixelRatio: 1,
    colors_length: preset.uniforms.colors.length,
  };
  const declarations = Object.keys(uniforms)
    .map((key) =>
      key === 'colors'
        ? 'uniform vec4 u_colors[8];'
        : `uniform ${key === 'colors_length' ? 'int' : key === 'resolution' ? 'vec2' : key === 'colorBack' ? 'vec4' : 'float'} u_${key};`,
    )
    .join('\n');
  const fragment = `#version 300 es\nprecision highp float;\nprecision highp int;\nin vec2 v_uv;\nout vec4 fragColor;\n${declarations}\nuniform sampler2D u_image_heightmap;\n${body}`;
  const shaders = [];
  const compile = (type, source) => {
    const shader = gl.createShader(type);
    shaders.push(shader);
    gl.shaderSource(shader, source);
    gl.compileShader(shader);
    if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS))
      throw new Error(gl.getShaderInfoLog(shader));
    return shader;
  };
  const program = gl.createProgram();
  let buffer,
    texture,
    frame = 0,
    disposed = false,
    visible = false,
    textureReady = !preset.image,
    last = 0,
    elapsed = 0;
  try {
    gl.attachShader(program, compile(gl.VERTEX_SHADER, vertex));
    gl.attachShader(program, compile(gl.FRAGMENT_SHADER, fragment));
    gl.linkProgram(program);
    if (!gl.getProgramParameter(program, gl.LINK_STATUS))
      throw new Error(gl.getProgramInfoLog(program));
    gl.useProgram(program);
    buffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
    gl.bufferData(
      gl.ARRAY_BUFFER,
      new Float32Array([
        -1, -1, 0, 0, 1, -1, 1, 0, -1, 1, 0, 1, -1, 1, 0, 1, 1, -1, 1, 0, 1, 1,
        1, 1,
      ]),
      gl.STATIC_DRAW,
    );
    for (const [name, offset] of [
      ['a_position', 0],
      ['a_texCoord', 8],
    ]) {
      const location = gl.getAttribLocation(program, name);
      gl.enableVertexAttribArray(location);
      gl.vertexAttribPointer(location, 2, gl.FLOAT, false, 16, offset);
    }
    for (const [name, value] of Object.entries(uniforms)) {
      const location = gl.getUniformLocation(program, `u_${name}`);
      if (name === 'colors')
        gl.uniform4fv(location, new Float32Array(value.flat()));
      else if (name === 'colors_length') gl.uniform1i(location, value);
      else if (Array.isArray(value))
        gl[`uniform${value.length}fv`](location, value);
      else gl.uniform1f(location, value);
    }
  } catch (error) {
    canvas.dataset.motionState = 'fallback';
    console.error('Reference shader:', error);
    shaders.forEach((shader) => gl.deleteShader(shader));
    gl.deleteProgram(program);
    return () => {};
  }
  const preference = matchMedia('(prefers-reduced-motion: reduce)');
  const timeLocation = gl.getUniformLocation(program, 'u_time'),
    sizeLocation = gl.getUniformLocation(program, 'u_resolution'),
    ratioLocation = gl.getUniformLocation(program, 'u_pixelRatio');
  function draw(now) {
    frame = 0;
    if (disposed || !textureReady || !visible || document.hidden) return;
    const rect = canvas.getBoundingClientRect();
    if (!rect.width || !rect.height) return;
    const ratio = preset.kind === 'liquid' ? 1 : Math.min(devicePixelRatio, 2);
    const width = Math.round(rect.width * ratio),
      height = Math.round(rect.height * ratio);
    if (canvas.width !== width || canvas.height !== height) {
      canvas.width = width;
      canvas.height = height;
    }
    gl.viewport(0, 0, width, height);
    gl.useProgram(program);
    if (last && !preference.matches)
      elapsed += Math.min(now - last, 100) / 1000;
    last = now;
    gl.uniform1f(timeLocation, elapsed);
    gl.uniform2f(sizeLocation, width, height);
    gl.uniform1f(ratioLocation, ratio);
    gl.drawArrays(gl.TRIANGLES, 0, 6);
    canvas.dataset.motionState = preference.matches ? 'still' : 'playing';
    canvas.dataset.motionTime = elapsed.toFixed(2);
    if (!preference.matches) frame = requestAnimationFrame(draw);
  }
  function update() {
    cancelAnimationFrame(frame);
    frame = 0;
    last = 0;
    if (visible && !document.hidden && textureReady)
      frame = requestAnimationFrame(draw);
    else canvas.dataset.motionState = 'paused';
  }
  const observer = new IntersectionObserver((entries) => {
    visible = entries.some((entry) => entry.isIntersecting);
    update();
  });
  observer.observe(canvas);
  const resize = new ResizeObserver(update);
  resize.observe(canvas);
  document.addEventListener('visibilitychange', update);
  preference.addEventListener('change', update);
  if (preset.image) {
    texture = gl.createTexture();
    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D, texture);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    gl.uniform1i(gl.getUniformLocation(program, 'u_image_heightmap'), 0);
    const image = new Image();
    image.onload = () => {
      if (disposed) return;
      gl.bindTexture(gl.TEXTURE_2D, texture);
      gl.texImage2D(
        gl.TEXTURE_2D,
        0,
        gl.RGBA,
        gl.RGBA,
        gl.UNSIGNED_BYTE,
        image,
      );
      textureReady = true;
      update();
    };
    image.src = `/vendor/heightmaps/${preset.image}.png`;
  }
  return () => {
    disposed = true;
    cancelAnimationFrame(frame);
    observer.disconnect();
    resize.disconnect();
    document.removeEventListener('visibilitychange', update);
    preference.removeEventListener('change', update);
    if (texture) gl.deleteTexture(texture);
    gl.deleteBuffer(buffer);
    shaders.forEach((shader) => gl.deleteShader(shader));
    gl.deleteProgram(program);
  };
}
export function ShaderCanvas({ preset, style, ...props }) {
  const ref = useRef(null),
    config = presets[preset];
  useEffect(() => {
    const canvas = ref.current;
    let dispose;
    const observer = new IntersectionObserver((entries) => {
      if (
        !dispose &&
        entries.some(
          (entry) => entry.isIntersecting && entry.boundingClientRect.width > 0,
        )
      )
        dispose = mountShader(canvas, config);
    });
    observer.observe(canvas);
    return () => {
      observer.disconnect();
      dispose?.();
    };
  }, [config]);
  return (
    <canvas
      {...props}
      ref={ref}
      aria-hidden="true"
      style={{
        ...style,
        background: `url(/vendor/framer/images/${config.fallback}.png) center / 100% 100%`,
      }}
    />
  );
}

export function AmbientVideo(props) {
  const ref = useRef(null);
  useEffect(() => {
    const video = ref.current,
      preference = matchMedia('(prefers-reduced-motion: reduce)');
    let visible = false;
    function update() {
      if (visible && !document.hidden && !preference.matches)
        video.play().catch(() => {
          video.dataset.motionState = 'paused';
        });
      else video.pause();
    }
    const observer = new IntersectionObserver((entries) => {
      visible = entries.some((entry) => entry.isIntersecting);
      update();
    });
    observer.observe(video);
    preference.addEventListener('change', update);
    document.addEventListener('visibilitychange', update);
    return () => {
      observer.disconnect();
      video.pause();
      preference.removeEventListener('change', update);
      document.removeEventListener('visibilitychange', update);
    };
  }, []);
  return (
    <video
      {...props}
      ref={ref}
      autoPlay
      muted
      playsInline
      preload="auto"
      onPlaying={(event) => {
        event.currentTarget.dataset.motionState = 'playing';
      }}
      onPause={(event) => {
        event.currentTarget.dataset.motionState = 'paused';
      }}
      onTimeUpdate={(event) => {
        event.currentTarget.dataset.motionTime =
          event.currentTarget.currentTime.toFixed(2);
      }}
    />
  );
}

const rotations = {
  'framer-vqgqpu': 1,
  'framer-1uisiv1': 1,
  'framer-1e94jvs': 1,
  'framer-1bohy80': 8,
  'framer-2ll6at': 8,
  'framer-1fzbc4w': 8,
  'framer-1ojrw3j': 8,
  'framer-1c2v5yc': 10,
  'framer-fb6u0q': 20,
  'framer-6z8ehc': 10,
};
export function useReferenceLoops() {
  useEffect(() => {
    const preference = matchMedia('(prefers-reduced-motion: reduce)'),
      animations = new Map(),
      visible = new Set();
    for (const [className, duration] of Object.entries(rotations))
      for (const node of document.querySelectorAll(`.${className}`)) {
        const animation = node.animate(
          [{ rotate: '0deg' }, { rotate: '360deg' }],
          { duration: duration * 1000, iterations: Infinity, easing: 'linear' },
        );
        animation.pause();
        animations.set(node, animation);
      }
    function update() {
      for (const [node, animation] of animations) {
        if (visible.has(node) && !document.hidden && !preference.matches)
          animation.play();
        else animation.pause();
      }
    }
    const observer = new IntersectionObserver((entries) => {
      for (const entry of entries) {
        if (entry.isIntersecting) visible.add(entry.target);
        else visible.delete(entry.target);
      }
      update();
    });
    for (const node of animations.keys()) observer.observe(node);
    preference.addEventListener('change', update);
    document.addEventListener('visibilitychange', update);
    return () => {
      observer.disconnect();
      for (const animation of animations.values()) animation.cancel();
      preference.removeEventListener('change', update);
      document.removeEventListener('visibilitychange', update);
    };
  }, []);
}

export function useReferenceScroll() {
  useEffect(() => {
    const preference = matchMedia('(prefers-reduced-motion: reduce)');
    const title = document.querySelector('.framer-e8yuf3');
    const first = document.querySelector('.framer-vlwtxv-container');
    const second = document.querySelector('.framer-1uxps4w-container');
    const third = document.querySelector('.framer-1uvu7qf-container');
    const nodes = [title, first, second].filter(Boolean);
    let frame = 0;
    const clamp = (value) => Math.max(0, Math.min(1, value));
    function draw() {
      frame = 0;
      if (preference.matches) {
        for (const node of nodes) {
          node.style.translate = '';
          node.style.scale = '';
        }
        return;
      }
      if (title) {
        const y =
          title.getBoundingClientRect().top -
          (parseFloat(title.style.translate?.split(' ')[1]) || 0);
        title.style.translate = `0 ${200 * (1 - clamp((innerHeight - y) / (innerHeight * 0.35)))}px`;
      }
      // The reference compresses each pinned desktop card as the next arrives.
      if (innerWidth >= 1200) {
        if (first && second)
          first.style.scale = String(
            1 -
              0.4 *
                clamp(
                  (innerHeight * 0.5 +
                    120 -
                    second.getBoundingClientRect().top) /
                    (innerHeight * 0.5),
                ),
          );
        if (second && third)
          second.style.scale = String(
            1 -
              0.4 *
                clamp(
                  (innerHeight * 0.5 +
                    140 -
                    third.getBoundingClientRect().top) /
                    (innerHeight * 0.5),
                ),
          );
      } else {
        if (first) first.style.scale = '';
        if (second) second.style.scale = '';
      }
    }
    function update() {
      if (!frame) frame = requestAnimationFrame(draw);
    }
    addEventListener('scroll', update, { passive: true });
    addEventListener('resize', update);
    preference.addEventListener('change', update);
    update();
    return () => {
      cancelAnimationFrame(frame);
      removeEventListener('scroll', update);
      removeEventListener('resize', update);
      preference.removeEventListener('change', update);
      for (const node of nodes) {
        node.style.translate = '';
        node.style.scale = '';
      }
    };
  }, []);
}
