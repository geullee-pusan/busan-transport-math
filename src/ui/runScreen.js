// 운행 화면(문제 화면). SPEC 9.1·9.5c.
//   A 진행 띠(위) / B 문제와 그림(왼쪽) / C 입력(오른쪽) / D 도구 막대. 힌트는 오른쪽 서랍.
import { h, clear } from './dom.js';
import { drawFigure } from './figures.js';
import { makeInput } from './input.js';
import { brake, correctTone, speak } from './sound.js';
import { plainText } from '../content/num.js';
import { currentProblem, submit, giveUp, openHint, park } from '../engine/run.js';
import { submitExpress, submitPlacement, UNKNOWN } from '../engine/express.js';
import { stationOf, LINE1_NODES } from '../engine/world.js';
import { nodeState } from '../engine/state.js';
import { FULL, pendingText } from '../engine/mastery.js';
import { tierOf } from '../content/vehicles.js';

const MODE_LABEL = { placement: '시승 운행', express: '급행', challenge: '도전 운행', normal: null };

export function renderRun(root, app, run, { onFinish }) {
  let state = app.state;
  const setState = (s) => {
    state = s;
    app.save(s);
  };

  const screen = h('div.run-screen');
  clear(root).append(screen);

  // 화면을 떠날 때(✕) 지금 문제를 정차 중으로 저장한다.
  const exit = () => {
    if (run.mode === 'normal' || run.mode === 'challenge') setState(park(state, run));
    onFinish(null, state);
  };

  function band(cur) {
    const node = cur?.slot.node ?? run.dest;
    const st = stationOf(node);
    const ns = nodeState(state, node);
    const litCount = LINE1_NODES.filter((n) => ['lit', 'passed', 'confirmed'].includes(nodeState(state, n.id).status)).length;
    const ticks = [];
    for (let i = 0; i < 4; i++) {
      const filled = ns.halves >= (i + 1) * 2 ? 'full' : ns.halves === i * 2 + 1 ? 'half' : 'empty';
      ticks.push(h(`span.tick.${filled}`));
    }
    const tag = MODE_LABEL[run.mode] ?? (cur?.slot.kind === 'review' || cur?.slot.kind === 'redo' ? `임시 정차 · ${st?.name ?? ''}역` : run.lastRun && run.index === 0 ? '오늘의 막차예요' : null);
    return h(
      'header.band',
      h('button.icon-btn', { type: 'button', onclick: exit, 'aria-label': '운행 멈추기' }, '✕'),
      h('div.band-main', h('div.band-line', h('span.badge-1', '1'), h('span.band-dest', `${st?.name ?? ''}역 가는 길`), tag ? h('span.band-tag', tag) : null), run.mode === 'normal' || run.mode === 'challenge' ? h('div.ticks', { 'aria-label': `${Math.floor((FULL - ns.halves) / 2)}칸 남음` }, ticks) : null),
      h('div.band-side', h('div.license-chip', tierOf(state.license).short), h('div.band-progress', `40역 중 ${litCount}역 켜짐`), run.restAfter ? h('div.band-tag', '이번 운행이 끝나면 쉬어요') : h('button.parent-btn.small-btn', { type: 'button', onclick: () => restAfterRun() }, '부모')),
    );
  }

  let labelUsed = false;
  let stallTimer = null;
  function numSpan(piece) {
    if (typeof piece === 'string') return piece;
    if (piece.label !== undefined) return piece.label;
    if (piece.unknown) return h('span.unknown-num', [...piece.unknown].map((ch) => (ch === '□' ? h('span.unknown-box', ' ') : ch)));
    const virtual = piece.tag === 'virtual';
    const shown = state.settings.virtualShown ?? 0;
    const el = h(`button.num${virtual ? '.virtual' : ''}`, { type: 'button' }, String(piece.num));
    el.addEventListener('click', () => {
      const tip = h('span.num-tip', virtual ? '이 문제를 위해 만든 숫자예요' : `출처: ${piece.source ?? '확인된 값'}`);
      el.append(tip);
      setTimeout(() => tip.remove(), 2600);
    });
    // "만든 숫자" 글자는 처음 세 문제에서, 그 문제의 첫 번째 지어낸 숫자에만 붙인다.
    if (virtual && shown <= 3 && !labelUsed) {
      labelUsed = true;
      return h('span.virtual-wrap', el, h('span.virtual-label', '만든 숫자'));
    }
    return el;
  }

  function show() {
    const cur = currentProblem(run);
    if (!cur) return finish();
    const p = cur.problem;
    labelUsed = false;
    const isDiag = run.mode === 'express' || run.mode === 'placement';
    if (p.text.some((x) => typeof x === 'object' && x && x.tag === 'virtual')) {
      state = { ...state, settings: { ...state.settings, virtualShown: (state.settings.virtualShown ?? 0) + 1 } };
    }

    const feedback = h('div.feedback', { 'aria-live': 'polite' });
    const after = h('div.after');
    let estimateOk = !p.estimateFirst;
    let blankDone = false;

    const input = makeInput(p.input, { onSubmit: () => onAnswer() });
    if (!estimateOk) input.lock(true);

    const estimate = p.estimateFirst
      ? (() => {
          let val = '';
          const box = h('span.answer-box.small', ' ');
          const keys = h('div.keypad.mini', ['1', '2', '3', '4', '5', '6', '7', '8', '9', '0', '⌫'].map((k) => h('button.key', { type: 'button', onclick: () => { val = k === '⌫' ? val.slice(0, -1) : (val + k).slice(0, 5); box.textContent = val || ' '; } }, k)));
          const btn = h('button.secondary', { type: 'button', onclick: () => { if (!val) return; estimateOk = true; input.lock(false); wrap.classList.add('done'); wrap.querySelector('.est-note').textContent = `내 어림: 약 ${val}`; } }, '어림 확인');
          const wrap = h('div.estimate', h('div', '대충 몇백쯤일까요? 약 ', box), keys, btn, h('div.est-note', '어림을 먼저 써요'));
          return wrap;
        })()
      : null;

    const problemEl = h('section.problem', h('p.problem-text', p.text.map(numSpan)), drawFigure(p.figure), p.challenge ? h('div.challenge-tag', '도전 문제') : null);

    // 힌트 서랍
    const drawer = h('aside.hint-drawer', { 'aria-hidden': 'true' });
    let hintLevel = 0;
    function renderDrawer() {
      clear(drawer);
      drawer.append(h('div.drawer-head', h('strong', '힌트'), h('button.icon-btn', { type: 'button', onclick: () => drawer.classList.remove('open') }, '✕')));
      const names = ['① 노선 확인', '② 경로 안내', '③ 중간 정류장', '④ 종착역 직전'];
      for (let i = 0; i < hintLevel; i++) drawer.append(h('div.hint-card', h('div.hint-name', names[i]), h('p', p.hints[i])));
      if (hintLevel < 4 && p.hints.length) {
        if (hintLevel === 1) {
          // ② 관문: "어디까지 해 봤어요?"
          drawer.append(h('div.gate', h('div', '어디까지 해 봤어요?'), h('div.chips', ['식 세우기', '첫 계산', '모르겠어요'].map((c) => h('button.chip', { type: 'button', onclick: () => nextHint() }, c)))));
        } else drawer.append(h('button.secondary', { type: 'button', onclick: () => nextHint() }, hintLevel === 0 ? '① 노선 확인 보기' : `${names[hintLevel]} 보기`));
      }
    }
    function nextHint() {
      hintLevel = Math.min(4, hintLevel + 1);
      openHint(run, hintLevel);
      if (hintLevel === 4 && p.blank) input.setBlank(p.blank);
      renderDrawer();
    }
    renderDrawer();

    const tools = h(
      'nav.tools',
      h('button.tool', { type: 'button', onclick: () => speak(plainText(p.text)) }, '🔊 읽어 주기'),
      h('button.tool', { type: 'button', onclick: () => pad.classList.toggle('open') }, '✎ 연습장'),
      !isDiag && p.hints?.length ? h('button.tool', { type: 'button', onclick: () => { drawer.classList.add('open'); drawer.setAttribute('aria-hidden', 'false'); } }, '💡 힌트') : null,
      isDiag ? h('button.tool', { type: 'button', onclick: () => onAnswer(UNKNOWN) }, '아직 몰라요') : null,
      h('button.tool.quiet', { type: 'button', onclick: () => report() }, '🚩 이 문제 이상해요'),
    );

    const pad = scratchpad();
    // 오래 멈춰 있으면 도움 안내를 한 번(기준 시간은 화면에 없고, 저장하지 않으며, 금 도장을 말하지 않는다)
    clearTimeout(stallTimer);
    if (!isDiag && p.hints?.length) stallTimer = setTimeout(() => { if (!run.current || run.current.problem !== p) return; feedback.append(h('div.info', run.hint >= 1 ? 'ⓘ ② 길 안내를 봐도 끝까지 푼 문제로 남아요.' : 'ⓘ ① 노선 확인은 언제 봐도 괜찮아요. 잃는 건 없어요.')); }, 120000);
    clear(screen).append(band(cur), h('div.run-body', h('div.col-b', problemEl, estimate), h('div.col-c', input.el, feedback, after)), tools, drawer, pad);
    if (state.settings.readAloud === true || (state.settings.readAloud === null && cur.level <= 3 && !isDiag)) speak(plainText(p.text));

    function report() {
      const reasons = ['숫자가 이상해요', '문장이 헷갈려요', '답이 틀린 것 같아요', '그림이 이상해요'];
      clear(after).append(h('div.report', h('div', '무엇이 이상해요?'), h('div.chips', reasons.map((r) => h('button.chip', { type: 'button', onclick: () => { setState({ ...state, reports: [...state.reports, { at: new Date().toISOString(), node: cur.slot.node, template: cur.template.id, level: cur.level, seed: cur.seed, text: plainText(p.text), reason: r }] }); clear(after).append(h('div.info', '고마워요. 부모님 화면에 남겨 둘게요.')); } }, r)))));
    }

    function onAnswer(forced) {
      if (!estimateOk && forced === undefined) return;
      let response = forced ?? input.value();
      if (response && typeof response === 'object' && 'blank' in response) {
        // 힌트 ④ 빈칸: 맞게 채워야 판단 질문(또는 답)이 열린다.
        if (String(response.blank) !== String(p.blankAnswer)) {
          clear(feedback).append(h('div.wrong', '⏸ 빈칸을 다시 볼까요?'));
          return;
        }
        blankDone = true;
        input.clearBlank();
        clear(feedback).append(h('div.info', p.blankThen ? `ⓘ ${p.blankThen}` : 'ⓘ 이제 답을 써요.'));
        return;
      }
      const fn = run.mode === 'express' ? submitExpress : run.mode === 'placement' ? submitPlacement : submit;
      const out = fn(state, run, response);
      run = out.run;
      if (out.state !== state) setState(out.state);
      const r = out.result;
      clear(feedback);
      if (out.outcome === 'careless') {
        feedback.append(h('div.info', `ⓘ ${r.feedback}`));
        return;
      }
      if (out.outcome === 'correct') {
        correctTone(state.settings);
        input.lock(true);
        const ev = run.events?.at(-1);
        const msg = out.passed ? `≫ ${stationOf(out.passed)?.name}역 통과!` : ev?.type === 'lit' ? `${stationOf(ev.node)?.name}역 개통!` : '✓ 맞았어요';
        feedback.append(h('div.right', msg));
        const pend = run.events?.filter((e) => e.type === 'pending').at(-1);
        if (pend && pend === ev) feedback.append(h('div.info', pendingText(pend.code)));
        nextButtons(true, out);
        return;
      }
      // 오답(같은 문제에서 두 번째 오답이면 소리를 생략한다)
      if (run.tries !== 2) brake(state.settings);
      if (response !== UNKNOWN) feedback.append(h('div.wrong', h('s.my-answer', typeof response === 'object' ? Object.values(response).join(', ') : String(response))), h('div.wrong', '⏸ 버스가 잠깐 멈췄어요.'));
      else feedback.append(h('div.info', '괜찮아요. 이 역에서 같이 배워요.'));
      if (r.feedback) feedback.append(h('div.wrong-detail', r.feedback));
      input.reset();
      if (isDiag) {
        input.lock(true);
        if (out.stoppedAt) feedback.append(h('div.info', `${stationOf(out.stoppedAt)?.name}역에 내려요.`));
        nextButtons(false, out);
        return;
      }
      if (out.outcome === 'giveup-offer') {
        clear(after).append(
          h('button.secondary', { type: 'button', onclick: () => { clear(after); } }, '다시 해 볼래요'),
          h('button.secondary', { type: 'button', onclick: () => { const g = giveUp(state, run); run = g.run; run.givenUp = (run.givenUp ?? 0) + 1; setState(g.state); input.lock(true); clear(after); nextButtons(false, g, p.answer); } }, '임시 정차로 넘기기'),
        );
      }
    }

    function nextButtons(correct, out, answer) {
      clear(after);
      if (!correct && answer !== undefined) after.append(h('div.info', `정답: ${typeof answer === 'object' ? Object.values(answer).join(', ') : answer}`));
      if (!isDiag && p.explain) after.append(h('button.secondary', { type: 'button', onclick: () => explainSheet(p, screen) }, '왜 그런지 / 다른 풀이'));
      if (out.ask) {
        after.append(h('div.info', '여기서 내릴까요? 내려도 지나온 역은 그대로예요.'), h('button.secondary', { type: 'button', onclick: () => { run.finished = true; finish(); } }, '이번 운행 끝'), h('button.secondary', { type: 'button', onclick: () => show() }, '계속 급행'));
        return;
      }
      // 명예롭게 멈출 길(아동 심리 자문 1차 2절): 넘긴 문제가 2개이거나, 목적지에 도착했고 남은 문제가 2개 이하
      const left = run.slots.length - run.index;
      const arrived = run.events?.some((e) => e.type === 'lit');
      if (!run.finished && !isDiag && (run.givenUp === 2 || (arrived && left <= 2 && !run.offeredStop))) {
        run.offeredStop = true;
        if (run.givenUp === 2) run.givenUp = 3;
        after.append(h('div.info', arrived && run.givenUp !== 3 ? '목적지에 도착했어요! 여기서 마칠까요?' : '오늘은 어려운 구간이었어요. 여기서 쉬어 갈까요?'), h('button.secondary', { type: 'button', onclick: () => { run.finished = true; finish(); } }, '여기서 마칠래요'), h('button.secondary', { type: 'button', onclick: () => show() }, '계속 갈래요'));
        return;
      }
      after.append(h('button.primary', { type: 'button', onclick: () => (run.finished ? finish() : show()) }, run.finished ? '운행 일지 보기' : '다음 문제 →'));
    }
  }

  // 부모: "이번 운행 끝나면 쉬기" — 멈춤을 엄마의 명령이 아니라 운행 규칙으로(아동 심리 3차, 게이미피케이션 3차)
  function restAfterRun() {
    const pin = prompt('부모님 번호를 넣으면 이번 운행이 끝난 뒤 오늘 운행을 마쳐요.');
    if (!pin || pin !== state.parentPin) return;
    run.restAfter = true;
    run.lastRun = true;
    // 이 운행이 오늘의 막차가 된다. 쉬운 문제를 더 끼우지 않는다.
    run.slots = run.slots.filter((x, i) => i <= run.index || x.kind !== 'easy');
    const day = run.day;
    setState({ ...state, runDays: { ...state.runDays, [day]: Math.max(state.runDays?.[day] ?? 0, (state.settings.dailyRuns ?? 2) + (state.extraToday === day ? 1 : 0)) } });
    show();
  }

  function finish() {
    onFinish(run, state);
  }

  show();
}

function explainSheet(p, screen) {
  const tabs = { why: p.explain.why ?? [], alt: p.explain.alt ?? [] };
  let tab = 'why';
  let i = 0;
  const sheet = h('div.sheet');
  const render = () => {
    clear(sheet);
    const list = tabs[tab];
    sheet.append(
      h('div.sheet-tabs', h(`button.tab${tab === 'why' ? '.on' : ''}`, { type: 'button', onclick: () => { tab = 'why'; i = 0; render(); } }, '왜 그런지'), tabs.alt.length ? h(`button.tab${tab === 'alt' ? '.on' : ''}`, { type: 'button', onclick: () => { tab = 'alt'; i = 0; render(); } }, '다른 풀이') : null, h('button.icon-btn', { type: 'button', onclick: () => sheet.remove() }, '✕')),
      h('p.sheet-text', list[i] ?? ''),
      h('div.dots', list.map((_, k) => h(`span.dot${k === i ? '.on' : ''}`))),
      h('div.sheet-nav', i > 0 ? h('button.secondary', { type: 'button', onclick: () => { i -= 1; render(); } }, '← 앞') : null, i < list.length - 1 ? h('button.primary', { type: 'button', onclick: () => { i += 1; render(); } }, '다음 →') : h('button.primary', { type: 'button', onclick: () => sheet.remove() }, '닫기')),
    );
  };
  render();
  screen.append(sheet);
}

/** 연습장: 손가락·펜으로 그리기(펜이 감지되면 손가락 그리기를 꺼서 손바닥 오입력을 막음) */
function scratchpad() {
  const canvas = h('canvas.pad-canvas');
  const wrap = h('div.pad', h('div.pad-head', h('strong', '연습장'), h('button.secondary', { type: 'button', onclick: () => ctx.clearRect(0, 0, canvas.width, canvas.height) }, '지우기'), h('button.icon-btn', { type: 'button', onclick: () => wrap.classList.remove('open') }, '✕')), canvas);
  const ctx = canvas.getContext('2d');
  let drawing = false;
  let penSeen = false;
  const fit = () => {
    const r = canvas.getBoundingClientRect();
    if (r.width && (canvas.width !== Math.round(r.width) || canvas.height !== Math.round(r.height))) {
      canvas.width = Math.round(r.width);
      canvas.height = Math.round(r.height);
    }
  };
  canvas.addEventListener('pointerdown', (e) => {
    if (e.pointerType === 'pen') penSeen = true;
    if (penSeen && e.pointerType === 'touch') return;
    fit();
    drawing = true;
    ctx.lineWidth = 3;
    ctx.lineCap = 'round';
    ctx.strokeStyle = '#1F3342';
    ctx.beginPath();
    ctx.moveTo(e.offsetX, e.offsetY);
    canvas.setPointerCapture(e.pointerId);
  });
  canvas.addEventListener('pointermove', (e) => {
    if (!drawing) return;
    ctx.lineTo(e.offsetX, e.offsetY);
    ctx.stroke();
  });
  canvas.addEventListener('pointerup', () => (drawing = false));
  new ResizeObserver(fit).observe(canvas);
  return wrap;
}
