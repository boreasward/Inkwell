// 页面底部随机蹦跳的小兔子（params.pet.enable）。纯装饰，不打扰阅读：
// 平时隔几秒随机做一件事（蹦到别处、原地跳、转身张望），眼睛跟着鼠标；点它会跳起来、眯眼并冒出爱心。
// 只在动起来的时候跑 requestAnimationFrame，落地后用定时器等下一次；页面隐藏时暂停。
// 系统开启“减弱动态效果”时安静地待在左下角，只眨眼不动。
const SIZE = 44; // 与 CSS 里 .pet 的宽度一致
const MARGIN = 12;
const GRAVITY = 2200; // px/s²

const rand = (min, max) => min + Math.random() * (max - min);
const clamp = (v, min, max) => Math.min(max, Math.max(min, v));

export function initPet() {
  const el = document.querySelector("[data-pet]");
  if (!el) return;
  const body = el.querySelector(".pet-body");
  const svg = el.querySelector(".pet-svg");
  const face = el.querySelector(".pet-face");
  const shadow = el.querySelector(".pet-shadow");
  const reduce = window.matchMedia ? window.matchMedia("(prefers-reduced-motion: reduce)") : { matches: false };

  const s = {
    x: MARGIN,
    h: 0, // 离地高度
    vx: 0,
    vy: 0,
    air: false,
    target: null, // 正在蹦向的横坐标
    facing: 1,
    pointer: null, // 最近一次指针位置
    raf: 0,
    timer: 0,
    last: 0,
  };

  const maxX = () => Math.max(MARGIN, window.innerWidth - SIZE - MARGIN);

  function render() {
    el.style.transform = `translate3d(${s.x.toFixed(1)}px, 0, 0)`;
    body.style.transform = `translate3d(0, ${(-s.h).toFixed(1)}px, 0)`;
    const k = clamp(1 - s.h / 160, 0.35, 1);
    shadow.style.transform = `scale(${k.toFixed(2)})`;
    shadow.style.opacity = (0.25 * k).toFixed(2);
    look();
  }

  // 眼睛：有指针时看向指针，否则看向前进方向
  function look() {
    let ox = s.facing * 1.4;
    let oy = 0;
    if (s.pointer && !s.target) {
      const cx = s.x + SIZE / 2;
      const cy = window.innerHeight - SIZE / 2 - s.h;
      ox = clamp((s.pointer.x - cx) / 160, -1, 1) * 1.8;
      oy = clamp((s.pointer.y - cy) / 160, -1, 1) * 1.2;
    }
    face.style.transform = `translate(${ox.toFixed(2)}px, ${oy.toFixed(2)}px)`;
  }

  function restartClass(node, name) {
    node.classList.remove(name);
    void node.getBoundingClientRect(); // 强制重排，让动画重新开始
    node.classList.add(name);
  }

  function launch(vy, vx = 0, spin = false) {
    s.vy = vy;
    s.vx = vx;
    s.air = true;
    if (vx) s.facing = Math.sign(vx);
    el.classList.add("is-air");
    if (spin) restartClass(svg, "is-spin");
    startLoop();
  }

  // 朝 target 蹦一小步：每步 18–42px，起跳速度决定滞空时间，据此算出水平速度
  function hopTowardTarget() {
    const dist = s.target - s.x;
    if (Math.abs(dist) < 2) {
      s.target = null;
      return false;
    }
    const step = Math.min(Math.abs(dist), rand(18, 42));
    const vy = rand(300, 400);
    const t = (2 * vy) / GRAVITY;
    launch(vy, (Math.sign(dist) * step) / t);
    return true;
  }

  function land() {
    s.h = 0;
    s.vy = 0;
    s.vx = 0;
    s.air = false;
    el.classList.remove("is-air");
    svg.classList.remove("is-spin");
    restartClass(svg, "is-land");
    if (s.target !== null) {
      // 连续蹦跳，中间稍作停顿
      stopLoop();
      s.timer = window.setTimeout(() => {
        if (!hopTowardTarget()) schedule();
      }, rand(60, 180));
    } else {
      stopLoop();
      schedule();
    }
  }

  function frame(now) {
    // 第一帧的时间戳可能早于 startLoop 里记下的 performance.now()，负值按 0 处理
    const dt = s.last ? clamp((now - s.last) / 1000, 0, 0.05) : 0;
    s.last = now;
    if (s.air && dt > 0) {
      s.vy -= GRAVITY * dt;
      s.h += s.vy * dt;
      s.x = clamp(s.x + s.vx * dt, MARGIN, maxX());
      if (s.h <= 0) {
        s.h = 0;
        render();
        land();
        return;
      }
    }
    render();
    s.raf = window.requestAnimationFrame(frame);
  }

  function startLoop() {
    if (s.raf) return;
    s.last = 0;
    s.raf = window.requestAnimationFrame(frame);
  }

  function stopLoop() {
    if (s.raf) window.cancelAnimationFrame(s.raf);
    s.raf = 0;
  }

  // 随机挑下一件事
  function act() {
    const r = Math.random();
    if (r < 0.5) {
      // 蹦到另一个地方
      const span = Math.min(window.innerWidth * 0.6, 420);
      s.target = clamp(s.x + rand(-span, span), MARGIN, maxX());
      if (!hopTowardTarget()) schedule();
    } else if (r < 0.75) {
      // 原地跳，偶尔转个圈
      launch(rand(480, 620), 0, Math.random() < 0.3);
    } else {
      // 转身张望
      s.facing = -s.facing;
      look();
      schedule();
    }
  }

  function schedule(ms = rand(1000, 3500)) {
    window.clearTimeout(s.timer);
    s.timer = window.setTimeout(act, ms);
  }

  function blinkLoop() {
    window.setTimeout(() => {
      restartClass(el, "is-blink");
      window.setTimeout(() => el.classList.remove("is-blink"), 160);
      blinkLoop();
    }, rand(2500, 6000));
  }

  function heart() {
    const span = document.createElement("span");
    span.className = "pet-heart";
    span.textContent = "♥";
    span.style.left = `${rand(8, SIZE - 20).toFixed(0)}px`;
    span.addEventListener("animationend", () => span.remove());
    body.appendChild(span);
  }

  let happyTimer = 0;
  body.addEventListener("click", () => {
    el.classList.add("is-happy");
    window.clearTimeout(happyTimer);
    happyTimer = window.setTimeout(() => el.classList.remove("is-happy"), 1200);
    if (reduce.matches) return;
    heart();
    if (!s.air) {
      window.clearTimeout(s.timer);
      s.target = null;
      launch(rand(640, 760), 0, Math.random() < 0.5);
    }
  });

  let lookQueued = false;
  window.addEventListener(
    "pointermove",
    (event) => {
      s.pointer = { x: event.clientX, y: event.clientY };
      if (lookQueued || s.raf) return;
      lookQueued = true;
      window.requestAnimationFrame(() => {
        lookQueued = false;
        look();
      });
    },
    { passive: true },
  );

  window.addEventListener("resize", () => {
    s.x = clamp(s.x, MARGIN, maxX());
    if (s.target !== null) s.target = clamp(s.target, MARGIN, maxX());
    render();
  });

  function pause() {
    stopLoop();
    window.clearTimeout(s.timer);
    s.target = null;
    if (s.air) {
      s.h = 0;
      s.air = false;
      el.classList.remove("is-air");
      render();
    }
  }

  function resume() {
    if (reduce.matches || document.hidden) return;
    schedule(rand(800, 2000));
  }

  document.addEventListener("visibilitychange", () => (document.hidden ? pause() : resume()));
  if (reduce.addEventListener) {
    reduce.addEventListener("change", () => (reduce.matches ? pause() : resume()));
  }

  s.x = clamp(rand(MARGIN, maxX() * 0.3), MARGIN, maxX());
  el.hidden = false;
  render();
  blinkLoop();
  resume();
}
