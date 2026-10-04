// 앱 시작점: 상태를 불러오고 화면을 오간다.
import './ui/style.css';
import { load, save, createState, dayNumber, runsLeftToday, countRun } from './engine/state.js';
import { startRun } from './engine/run.js';
import { startExpress, startPlacement } from './engine/express.js';
import { renderRun } from './ui/runScreen.js';
import { renderSetup, renderHome, renderLog, renderGarage, renderParent, renderSettings } from './ui/screens.js';

const root = document.getElementById('app');

const app = {
  state: load(),
  save(s) {
    this.state = s;
    save(s);
  },
};

const seed = () => (Date.now() ^ (app.state.runs * 2654435761)) >>> 0;

function home() {
  // 이름이 없으면(처음 켰거나 "처음부터 다시") 처음 화면에서 이름부터 받는다.
  if (!app.state.profile.nickname?.trim()) return setup();
  renderHome(root, app, {
    onStart: () => {
      if (!app.state.placementDone) app.save({ ...app.state, placementDone: true });
      go(startRun(app.state, { day: dayNumber(), seed: seed() }));
    },
    onExpress: () => go(startExpress(app.state, { day: dayNumber(), seed: seed() })),
    onChallenge: () => go(startRun(app.state, { day: dayNumber(), seed: seed(), mode: 'challenge' })),
    onGarage: () => renderGarage(root, app, { onHome: home }),
    onParent: () => renderParent(root, app, { onHome: home, onReset: () => { app.save({ ...createState(), parentPin: app.state.parentPin }); home(); } }),
    onSettings: () => renderSettings(root, app, { onHome: home }),
    onPlacement: () => go(startPlacement(app.state, { day: dayNumber(), seed: seed() })),
  });
}

function setup() {
  renderSetup(root, app, {
    onDone: ({ nickname, color }) => {
      app.save({ ...app.state, profile: { ...app.state.profile, nickname, color } });
      if (app.state.placementDone) return home(); // 이미 진행이 있으면 이름만 받고 이어서
      const run = startPlacement(app.state, { day: dayNumber(), seed: seed() });
      if (run) go(run);
      else home();
    },
  });
}

function go(run) {
  if (!run) return home();
  if (run.mode !== 'placement') {
    const day = dayNumber();
    if (runsLeftToday(app.state, day) <= 0) return home();
    run.lastRun = runsLeftToday(app.state, day) === 1; // 오늘의 막차
    app.save(countRun(app.state, day));
  }
  renderRun(root, app, run, {
    onFinish: (finished, state) => {
      app.save(state);
      if (!finished) return home();
      renderLog(root, app, finished, {
        onAgain: () => go(startRun(app.state, { day: dayNumber(), seed: seed() })),
        onHome: home,
      });
    },
  });
}

home();

// 홈 화면 설치·오프라인(서비스 워커). 개발 서버에서는 등록하지 않는다.
if ('serviceWorker' in navigator && import.meta.env.PROD) {
  // 새 판이 깔리면(이미 예전 판을 쓰던 기기) 한 번 새로 열어 새 판을 바로 보여준다.
  // 운행 중이면 새로 열지 않는다(다음에 열 때 새 판).
  const hadController = Boolean(navigator.serviceWorker.controller);
  navigator.serviceWorker.addEventListener('controllerchange', () => {
    if (hadController && !document.querySelector('.run-screen')) location.reload();
  });
  navigator.serviceWorker.register('./sw.js').catch(() => {});
}
