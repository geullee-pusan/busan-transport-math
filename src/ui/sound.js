// 소리. 실제 녹음은 역 개통(열차진입 안내음)과 면허 합격(열차진입 방송)에만 쓴다(SPEC 3.9).
// 출처: 공공데이터포털 3033578 부산교통공사_부산도시철도 역사 안내방송_20250831(이용허락범위 제한 없음).
// 일반 정답과 오답 "칙" 소리는 브라우저에서 만든다.
import sounds from '../data/sounds.json' with { type: 'json' };

let ctx = null;
const audio = () => (ctx ??= new (globalThis.AudioContext || globalThis.webkitAudioContext)());

function playData(b64) {
  try {
    const a = new Audio(`data:audio/mpeg;base64,${b64}`);
    a.volume = 0.8;
    a.play().catch(() => {});
    return a;
  } catch {
    return null;
  }
}

/** 역 개통: 갈매기·파도(상행) 안내음을 짧게(2.5초) */
export function chime(settings, direction = 'up') {
  if (!settings.sound) return;
  const a = playData(sounds.chimes[direction] ?? sounds.chimes.up);
  if (a) setTimeout(() => a.pause(), 2500);
}

/** 면허 합격: 1호선 노포행 열차진입 방송 */
export function approach(settings) {
  if (!settings.sound) return;
  playData(sounds.approach['1|노포']);
}

/** 정답: 짧고 부드러운 두 음 */
export function correctTone(settings) {
  if (!settings.sound) return;
  try {
    const c = audio();
    [660, 880].forEach((f, i) => {
      const o = c.createOscillator();
      const g = c.createGain();
      o.frequency.value = f;
      o.type = 'sine';
      g.gain.setValueAtTime(0.0001, c.currentTime + i * 0.12);
      g.gain.exponentialRampToValueAtTime(0.15, c.currentTime + i * 0.12 + 0.02);
      g.gain.exponentialRampToValueAtTime(0.0001, c.currentTime + i * 0.12 + 0.18);
      o.connect(g).connect(c.destination);
      o.start(c.currentTime + i * 0.12);
      o.stop(c.currentTime + i * 0.12 + 0.2);
    });
  } catch {}
}

/** 오답: 0.25초 브레이크 "칙"(오답 소리만 따로 끌 수 있음) */
export function brake(settings) {
  if (!settings.sound || !settings.wrongSound) return;
  try {
    const c = audio();
    const len = Math.floor(c.sampleRate * 0.25);
    const buf = c.createBuffer(1, len, c.sampleRate);
    const d = buf.getChannelData(0);
    for (let i = 0; i < len; i++) d[i] = (Math.random() * 2 - 1) * (1 - i / len) * 0.25;
    const src = c.createBufferSource();
    const f = c.createBiquadFilter();
    f.type = 'highpass';
    f.frequency.value = 2500;
    src.buffer = buf;
    src.connect(f).connect(c.destination);
    src.start();
  } catch {}
}

/** 문제 읽어주기(기기 목소리). 숫자는 기기가 읽는다. */
export function speak(text) {
  try {
    const synth = globalThis.speechSynthesis;
    if (!synth) return false;
    synth.cancel();
    const u = new SpeechSynthesisUtterance(text.replace(/BGL/g, '부산김해경전철').replace(/×/g, ' 곱하기 ').replace(/÷/g, ' 나누기 ').replace(/−/g, ' 빼기 ').replace(/\+/g, ' 더하기 ').replace(/□/g, ' 네모 '));
    u.lang = 'ko-KR';
    u.rate = 0.95;
    synth.speak(u);
    return true;
  } catch {
    return false;
  }
}

export const SOUND_SOURCE = sounds._설명;
