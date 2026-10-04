// 홈, 처음 시작, 운행 일지, 차고, 부모 화면, 아이용 설정.
import { h, clear, kmText } from './dom.js';
import { drawMap } from './map.js';
import { stationSheet } from './explore.js';
import { askPin } from './pin.js';
import { chime, approach, SOUND_SOURCE } from './sound.js';
import { destination, summary } from '../engine/run.js';
import { diagnosticsFor } from '../content/index.js';
import { nodeState, exportBackup, importBackup, runsLeftToday, dayNumber, isPin } from '../engine/state.js';
import { stationOf, LINE1_NODES, LINE_NODES, NODES } from '../engine/world.js';
import { FULL, pendingText } from '../engine/mastery.js';
import { TIERS, tierOf, goldNeeded } from '../content/vehicles.js';
import { milestonesCrossed } from '../content/milestones.js';
import { icon, starPoints } from './icons.js';

// 아이가 고르는 차량 색(시각 자문 1차 결정 1): 빨강·초록(정답·오답 관습)과 1호선 주황을 뺀 6색.
// 예전에 고른 색이 이 목록에 없어도 그대로 쓴다(새로 고를 때만 이 목록).
const COLORS = [
  { c: '#1F3342', name: '남색' },
  { c: '#00798C', name: '청록' },
  { c: '#6D597A', name: '자주' },
  { c: '#9C6644', name: '갈색' },
  { c: '#4F5D75', name: '회청' },
  { c: '#B08A2E', name: '겨자' },
];
const backBtn = (onclick) => h('button.icon-btn', { type: 'button', onclick, 'aria-label': '뒤로' }, icon('back'));

export function renderSetup(root, app, { onDone }) {
  let name = app.state.profile.nickname || '';
  let color = app.state.profile.color;
  const nameBox = h('input.name-input', { type: 'text', maxlength: 8, placeholder: '이름이나 별명', value: name, autocomplete: 'off', oninput: (e) => { name = e.target.value; syncStart(); } });
  const swatches = COLORS.map(({ c, name: cname }) => h('button.swatch', { type: 'button', style: { background: c }, 'aria-label': `차량 색 ${cname}`, 'aria-pressed': c === color ? 'true' : 'false', onclick: () => { color = c; swatches.forEach((b) => { b.classList.toggle('on', b.dataset.c === c); b.setAttribute('aria-pressed', b.dataset.c === c ? 'true' : 'false'); }); } }));
  swatches.forEach((b, i) => { b.dataset.c = COLORS[i].c; b.classList.toggle('on', COLORS[i].c === color); });
  const startBtn = h('button.primary.big', { type: 'button', onclick: () => name.trim() && onDone({ nickname: name.trim(), color }) }, icon('depart'), '시승 운행 출발');
  const startWhy = h('p.why-off', '이름을 먼저 써요');
  const syncStart = () => { startBtn.disabled = !name.trim(); startWhy.hidden = Boolean(name.trim()); };
  syncStart();
  clear(root).append(
    h('main.setup',
      h('h1', '부산 교통 수학'),
      h('p.lead', '불이 꺼진 1호선을 문제를 풀며 하나씩 켜요.'),
      h('label', '내 이름', nameBox),
      h('p.small', '이름은 이 기기에만 저장돼요.'),
      h('div', h('div.label', '내 차량 색'), h('div.swatches', swatches)),
      h('div.notice', h('p', '부모님도 이 앱을 볼 수 있어요.'), h('p', '어떤 역을 켰는지, 어디가 어려웠는지 봐요.'), h('p', '같이 이야기하려고 보는 거예요. 맞힌 개수로 혼내려는 게 아니에요.')),
      h('div', startBtn, startWhy),
      h('p.small', '시승 운행은 어느 역에서 출발할지 정하는 짧은 운행이에요. 모르는 문제는 "아직 몰라요"를 눌러도 돼요.'),
    ),
  );
}

export function renderHome(root, app, { onStart, onExpress, onChallenge, onGarage, onParent, onSettings, onPlacement }) {
  const state = app.state;
  const dest = destination(state);
  const ns = dest ? nodeState(state, dest.id) : null;
  const leftHalves = ns ? FULL - ns.halves : 0;
  const left = `${Math.floor(leftHalves / 2) ? Math.floor(leftHalves / 2) + '칸' : ''}${leftHalves % 2 ? (Math.floor(leftHalves / 2) ? ' 반' : '반 칸') : ''}` || '0칸';
  const litCount = LINE1_NODES.filter((n) => ['lit', 'passed', 'confirmed'].includes(nodeState(state, n.id).status)).length;
  const parkedSt = state.parked ? stationOf(state.parked.node) : null;
  const tier = tierOf(state.license);
  const doneToday = runsLeftToday(state, dayNumber()) <= 0;
  const canExpress = dest && diagnosticsFor(dest.id).length > 0 && !doneToday;

  // 부모가 신고를 확인했으면 한 번 알려 준다(아이의 신고가 닿았다는 고리 닫기).
  const returning = typeof state.lastRunDay === 'number' && dayNumber() - state.lastRunDay >= 7 ? h('div.notice', '어서 와요. 켠 역은 그대로예요.') : null;
  const ackNote = state.reportAck ? h('div.notice', '부모님이 "이 문제 이상해요" 신고를 확인했어요. 고마워요!') : null;
  if (state.reportAck) app.save({ ...state, reportAck: false });
  clear(root).append(
    h('main.home',
      h('header.home-head',
        h('div.license', state.profile.nickname?.trim() ? h('span.license-sub', `${state.profile.nickname.trim()} 기관사`) : null, h('span.license-tier', tier.name), h('span.license-sub', '면허')),
        h('div.km', kmText(state.meters), h('span.km-sub', `40역 중 ${litCount}역 켜짐`)),
        h('div.head-btns', h('button.parent-btn', { type: 'button', onclick: onSettings }, icon('settings'), '설정'), h('button.parent-btn', { type: 'button', onclick: onParent }, icon('parent'), '부모')),
      ),
      ackNote,
      returning,
      h('div.map-wrap', drawMap(state, { destId: dest?.id, onAnyStation: (id) => root.querySelector('.home')?.append(stationSheet(id)) })),
      h('p.small', '역을 누르면 그 역 이야기를 볼 수 있어요.'),
      !state.placementDone && onPlacement
        ? h('section.next', h('div.next-dest', '먼저 시승 운행으로 어느 역에서 출발할지 정해요.'), h('div.next-btns', h('button.primary.big', { type: 'button', onclick: onPlacement }, icon('depart'), '시승 운행 출발'), h('button.secondary', { type: 'button', onclick: onStart }, '그냥 처음 역부터 출발')))
        : dest && doneToday
        ? h('section.next', h('div.next-dest', '오늘 운행은 끝났어요. 차량은 차고에서 쉬어요. 내일 첫차에 만나요.'), h('div.next-btns', h('button.secondary', { type: 'button', onclick: onGarage }, icon('garage'), '차고')))
        : dest
        ? h('section.next',
            h('div.next-dest', h(`span.badge-1${dest.line === 'L2' ? '.badge-2' : ''}`, dest.line === 'L2' ? '2' : '1'), ` ${stationOf(dest.id)?.name ?? ''}역까지 `, h('strong', left)),
            ns.pending ? h('div.info', pendingText(ns.pending)) : null,
            h('div.next-btns',
              h('button.primary.big', { type: 'button', onclick: onStart }, icon('depart'), parkedSt ? `${parkedSt.name}역에서 출발` : '출발'),
              canExpress ? h('button.secondary', { type: 'button', onclick: onExpress, title: '급행: 역마다 2문제를 맞히면 통과해요 · 세 번째 역은 1문제 더' }, icon('express'), '급행') : null,
              h('button.secondary', { type: 'button', onclick: onChallenge }, icon('challenge'), '도전 운행'),
              h('button.secondary', { type: 'button', onclick: onGarage }, icon('garage'), '차고'),
            ),
            canExpress ? h('p.small', '급행: 역마다 2문제를 맞히면 통과해요 · 세 번째 역은 1문제 더') : null,
          )
        : h('section.next', h('div.next-dest', '지금 열린 역을 모두 켰어요. 다음 역은 준비 중이에요.'), h('button.secondary', { type: 'button', onclick: onGarage }, icon('garage'), '차고')),
    ),
  );
}

/** 운행 일지: 다섯 줄 이내, 가장 큰 소식 하나를 크게(SPEC 3.4, 9.5b) */
export function renderLog(root, app, run, { onAgain, onHome }) {
  const state = app.state;
  const sm = summary(state, run);
  const destName = sm.dest ? stationOf(sm.dest)?.name : null;
  const startName = run.startDone?.length ? null : null;
  const newly = sm.newlyLit.map((id) => stationOf(id)?.name).filter(Boolean);
  const passed = sm.newlyLit.filter((id) => state.nodes[id]?.status === 'passed');

  let big = null;
  if (sm.license) big = h('div.big-news.license-card', h('div.small', '면허증'), h('div.big-title', `${tierOf(sm.license).name} 운행 허가`), state.profile.nickname?.trim() ? h('div', `운전사: ${state.profile.nickname.trim()}`) : null, h('div.small', `발급일 ${new Date().toLocaleDateString('ko-KR')}`), sm.licenseEvidence.length ? h('div', `${sm.licenseEvidence.map((id) => stationOf(id)?.name).filter(Boolean).join(' · ')}역에서 이 단계 문제를 풀어서 올랐어요.`) : null, h('div', '새 카드를 받았어요. 차고에서 볼 수 있어요.'));
  else if (sm.line2Opened) big = h('div.big-news', h('div.big-title', '서면역 개통! 2호선으로 갈아탈 수 있어요'), h('div', '이제 운행마다 1호선과 2호선을 번갈아 달려요. 2호선에서는 시간과 길이를 배워요.'));
  else if (newly.length) big = h('div.big-news', h('div.big-title', passed.length === newly.length ? `${newly.join(' · ')}역 통과!` : `${newly.join(' · ')}역 개통!`));

  const lines = [];
  if (newly.length && !big?.textContent.includes(newly[0])) lines.push(`새로 켜진 역: ${newly.join(', ')}`);
  const learned = [...new Set(run.slots.slice(0, run.index).filter((x) => x.kind !== 'review' && x.kind !== 'redo').map((x) => NODES.get(x.node)?.title).filter(Boolean))];
  if (learned.length) lines.push(`오늘 푼 생각: ${learned.slice(0, 2).join(', ')}`);
  // 작은 사실들은 한 줄로 묶는다(다섯 줄 규칙)
  const facts = [sm.gold > 0 ? `금 도장 ${sm.gold}개` : null, sm.hinted > 0 ? `힌트를 보고 끝까지 푼 문제 ${sm.hinted}개` : null, sm.retried > 0 ? `다시 생각해서 맞힌 문제 ${sm.retried}개` : null].filter(Boolean);
  if (facts.length) lines.push(facts.join(' · '));
  if (sm.grewAt) lines.push(`${NODES.get(sm.grewAt)?.title}: 지난번엔 힌트와 같이 길을 찾았고, 오늘은 길을 바로 찾았어요.`);
  // 오늘 1 km 미만이면 "오늘 900 m 달렸어요", 그 위는 정수 km(운행 뒤 정수 − 운행 전 정수로 덧셈이 맞게)
  const todayM = state.meters - run.startMeters;
  const todayKm = Math.floor(state.meters / 1000) - Math.floor(run.startMeters / 1000);
  lines.push(todayKm >= 1 ? `오늘 ${todayKm} km · 모두 ${kmText(state.meters)}` : `오늘 ${Math.floor(todayM / 100) * 100} m 달렸어요 · 모두 ${kmText(state.meters)}`);
  const crossed = milestonesCrossed(run.startMeters, state.meters);
  if (crossed.length) lines[lines.length - 1] += ` — ${crossed.at(-1).text}!`;
  const noMoreToday = runsLeftToday(state, dayNumber()) <= 0;
  if (destName) lines.push(`다음 운행은 ${destName}역 앞에서 출발해요.` + (noMoreToday && sm.redo > 0 ? ' 오늘 넘긴 문제가 첫 문제로 나와요.' : ''));
  const lineName = (id) => (NODES.get(id)?.line === 'L2' ? '2호선' : '1호선');
  const title = destName && !newly.length ? `${destName}역 가는 길` : newly.length ? `${lineName(sm.newlyLit.at(-1))} ${newly.at(-1)}역 도착` : '운행 일지';

  if (newly.length) setTimeout(() => chime(state.settings), 200);
  if (sm.license) setTimeout(() => approach(state.settings), 300);

  // 부모 화면용 기록
  app.save({ ...state, runs: state.runs + 1, logs: [...state.logs, { at: new Date().toISOString(), mode: run.mode, newly: sm.newlyLit, meters: sm.meters, gold: sm.gold, tries: run.index }].slice(-60) });

  clear(root).append(
    h('main.log',
      h('h2', title),
      big,
      // 여섯 줄이 되면 '오늘 푼 생각'을 빼서 다음 출발역 줄이 잘리지 않게 한다
      h('ul.log-lines', (lines.length > 5 ? lines.filter((l) => !l.startsWith('오늘 푼 생각')) : lines).slice(0, 5).map((l) => h('li', l))),
      h('p.log-end', newly.length || run.mode !== 'placement' ? '끝까지 운행 완료!' : '시승 운행 완료!'),
      // 끝 단추는 같은 무게로, "오늘은 여기까지"를 먼저 둔다(아동 심리 자문 1차 H1).
      h('div.next-btns.even', h('button.secondary.big', { type: 'button', onclick: onHome }, '오늘은 여기까지'), sm.dest && runsLeftToday(app.state, dayNumber()) > 0 ? h('button.secondary.big', { type: 'button', onclick: onAgain }, '한 번 더 운행') : null),
      sm.dest && runsLeftToday(app.state, dayNumber()) <= 0 ? h('p.info', '오늘 운행은 여기까지예요. 내일 첫차에 만나요.') : null,
      h('p.small.eyes', '창밖 먼 곳을 20초 바라봐요.'),
    ),
  );
}

export function renderGarage(root, app, { onHome }) {
  const state = app.state;
  const cards = TIERS.map((t) => {
    const got = state.cards.includes(t.tier);
    const gold = state.cardGold[t.tier] ?? 0;
    const need = goldNeeded(t.tier);
    const golden = gold >= need;
    // 노선 색 띠는 노선이 있는 차량(lineColor)에만. 나머지 차량은 색 없이(시각 자문 1차 결정 3)
    const stripe = t.lineColor ? h('div.card-line', { style: { background: t.lineColor }, 'aria-hidden': 'true' }) : null;
    if (!got) return h('div.card.locked', h('div.card-tier', `${t.tier}단계`), h('div.card-name', t.name), h('div.card-small', `면허가 ${t.short} 단계가 되면 받아요`));
    const f = t.facts;
    return h(`div.card${golden ? '.golden' : ''}`,
      stripe,
      golden ? h('span.card-star', { 'aria-hidden': 'true', html: `<svg viewBox="0 0 24 24" width="28" height="28"><polygon points="${starPoints(12, 12.5, 10.5)}"/></svg>` }) : null,
      h('div.card-tier', `${t.tier}단계`),
      h('div.card-name', t.name),
      f.speedNow ? h('div.card-big', `지금 달리는 최고속도 ${f.speedNow} km/h`) : null,
      f.speedDesign ? h('div.card-small', `설계 속도 ${f.speedDesign} km/h`) : null,
      f.cars ? h('div.card-small', `${f.cars}량`) : null,
      f.seats ? h('div.card-small', typeof f.seats === 'number' ? `좌석 ${f.seats}석` : f.seats) : null,
      f.route ? h('div.card-small', f.route) : null,
      f.note ? h('div.card-small', f.note) : null,
      f.why ? h('div.card-why', f.why) : null,
      h('div.card-gold', golden ? '금테 카드' : `금 도장 ${Math.min(gold, need)}/${need}`),
      (state.activeCard ?? state.license) === t.tier ? h('div.card-active', '지금 운행 차량') : h('button.chip', { type: 'button', onclick: () => { app.save({ ...app.state, activeCard: t.tier }); renderGarage(root, app, { onHome }); } }, '이 차량으로 운행'),
      h('div.card-src', `출처: ${t.source}`),
    );
  });
  clear(root).append(h('main.garage', h('header.page-head', backBtn(onHome), h('h2', '차고')), h('div.garage-stats', `모두 ${kmText(state.meters)}`), h('div.cards', cards)));
}

export function renderSettings(root, app, { onHome }) {
  const st = app.state.settings;
  const toggle = (key, ...label) => h('label.toggle', h('input', { type: 'checkbox', checked: st[key] ? true : undefined, onchange: (e) => app.save({ ...app.state, settings: { ...app.state.settings, [key]: e.target.checked } }) }), label);
  clear(root).append(h('main.settings', h('header.page-head', backBtn(onHome), h('h2', '설정')), toggle('sound', icon('soundOn'), '소리'), toggle('wrongSound', '틀렸을 때 소리'), h('label.toggle', h('input', { type: 'checkbox', checked: st.readAloud === true ? true : undefined, onchange: (e) => app.save({ ...app.state, settings: { ...app.state.settings, readAloud: e.target.checked ? true : null } }) }), icon('read'), '문제를 늘 읽어 주기'), h('p.small', `소리 출처: ${SOUND_SOURCE}`)));
}

/** 부모 화면: 부모가 정한 4자리 번호로 잠근다(아동 심리 자문 1차 H3 — 곱셈 문제는 아이가 풀 수 있음). */
export function renderParent(root, app, { onHome, onReset }) {
  const hasPin = Boolean(app.state.parentPin);
  let first = null;
  const box = h('input.name-input', { type: 'password', inputmode: 'numeric', maxlength: 4, autocomplete: 'off' });
  const msg = h('p', hasPin ? '부모님 번호 4자리를 넣어 주세요.' : '부모님만 아는 번호 4자리를 정해 주세요.');
  const go = () => {
    const v = box.value.trim();
    if (!isPin(v)) return (msg.textContent = '숫자 4자리를 넣어 주세요.');
    if (hasPin) return v === app.state.parentPin ? parentBody(root, app, { onHome, onReset }) : ((msg.textContent = '번호가 달라요.'), (box.value = ''));
    if (first === null) {
      first = v;
      box.value = '';
      return (msg.textContent = '한 번 더 넣어 주세요.');
    }
    if (v !== first) {
      first = null;
      box.value = '';
      return (msg.textContent = '두 번이 달라요. 처음부터 정해 주세요.');
    }
    app.save({ ...app.state, parentPin: v });
    parentBody(root, app, { onHome, onReset });
  };
  clear(root).append(h('main.parent', h('header.page-head', backBtn(onHome), h('h2', '부모 화면')), msg, box, h('button.secondary', { type: 'button', onclick: go }, '확인')));
  box.focus();
}

function parentBody(root, app, { onHome, onReset }) {
  const state = app.state;
  const touched = [...LINE1_NODES, ...LINE_NODES.L2].filter((n) => state.nodes[n.id]);
  const lit = touched.filter((n) => ['lit', 'passed', 'confirmed'].includes(state.nodes[n.id].status));
  const hard = touched
    .map((n) => ({ n, ns: state.nodes[n.id] }))
    .filter(({ ns }) => ns.attempts.length >= 3)
    .map(({ n, ns }) => ({ n, rate: ns.attempts.filter((x) => x.c).length / ns.attempts.length, hinted: ns.attempts.filter((x) => x.h >= 2).length }))
    .sort((a, b) => a.rate - b.rate)
    .slice(0, 2);
  const weekAgo = Date.now() - 7 * 86400000;
  const week = state.logs.filter((l) => new Date(l.at).getTime() >= weekAgo);
  const lateDays = new Set(week.filter((l) => new Date(l.at).getHours() >= 21).map((l) => l.at.slice(0, 10))).size;
  const rows = touched.map((n) => {
    const ns = state.nodes[n.id];
    const tries = ns.attempts.length;
    const right = ns.attempts.filter((x) => x.c).length;
    const hinted = ns.attempts.filter((x) => x.h >= 2).length;
    return h('tr', h('td', stationOf(n.id).name), h('td', n.title), h('td', (n.codes ?? []).join(' ')), h('td', { open: '진행 중', lit: '개통', passed: '통과', confirmed: '확정' }[ns.status] ?? ns.status), h('td', `${right}/${tries}`), h('td', String(hinted)));
  });
  const backup = h('textarea.backup', { readonly: true }, exportBackup(state));
  const restore = h('textarea.backup', { placeholder: '백업 글자를 붙여 넣고 복원을 누르세요' });
  const ack = (i) => {
    const reports = state.reports.map((r, k) => (k === i ? { ...r, seen: true } : r));
    app.save({ ...app.state, reports, reportAck: true });
    parentBody(root, app, { onHome, onReset });
  };
  clear(root).append(
    h('main.parent',
      h('header.page-head', backBtn(onHome), h('h2', '부모 화면')),
      h('section.guide',
        h('h3', '이번 주'),
        h('p', week.length ? `이번 주에 ${new Set(week.map((l) => l.at.slice(0, 10))).size}일 운행했고, 지금까지 ${lit.length}개 역을 켰어요.` : '이번 주에는 아직 운행하지 않았어요.'),
        state.dateWentBack ? h('p', '기기 날짜가 뒤로 바뀐 적이 있어요. 하루 운행 수는 기기 날짜로 세요.') : null,
        lateDays ? h('p', `저녁 9시 넘어 운행한 날이 ${lateDays}일 있었어요. 잠자는 시간을 지켜 주세요.`) : null,
      ),
      hard.length ? h('section.guide', h('h3', '같이 보면 좋은 곳'), hard.map(({ n, hinted }) => h('p', `${stationOf(n.id).name}역 — ${n.title}. ${hinted ? '힌트를 보고 끝까지 풀었어요. ' : ''}"이 문제 어떻게 풀었는지 보여 줄래?"라고 물어봐 주세요.`))) : null,
      h('details.guide', h('summary', '부모님께 드리는 안내'),
        h('p', '같은 때에 타면 쉬워요(예: 저녁 먹고 나서 첫차). 일주일에 사흘쯤이면 충분해요.'),
        h('p', '처음 2~3주가 지나면 아이가 덜 찾는 게 자연스러워요. 꾸준히 조금씩이 목표예요.'),
        h('p', '이 앱을 상이나 벌로 쓰지 말아 주세요("숙제 다 하면 운행", "말 안 들으면 운행 금지").'),
        h('p', '정답보다 "어떻게 풀었어?"를 먼저 물어봐 주세요. 수학이 자신 없으시면 아이에게 설명을 부탁해 보세요.'),
        h('p', '아이가 앞서가는 것(학교 진도보다 위)은 괜찮아요. 다른 아이나 형제와 비교하지는 말아 주세요.'),
      ),
      h('p.guide', '이 화면의 숫자로 꾸짖지 마세요. "이 문제 같이 풀어 볼까?"라고 말해 보세요. 아이가 지쳐 보이면(한숨, 찍기, 화면을 오래 멍하게 봄) 그날은 쉬게 해 주세요.'),
      h('section.guide', h('h3', '아이 이름'), (() => { const box = h('input.name-input', { type: 'text', maxlength: 8, value: state.profile.nickname?.trim() ?? '' }); return h('div', box, h('button.secondary', { type: 'button', onclick: () => { if (!box.value.trim()) return; app.save({ ...app.state, profile: { ...app.state.profile, nickname: box.value.trim() } }); parentBody(root, app, { onHome, onReset }); } }, '이름 바꾸기')); })()),
      h('section.guide', h('h3', '하루 운행 수'), h('p', `하루에 ${state.settings.dailyRuns ?? 2}번(한 번에 약 10분). 마지막 운행을 시작할 때만 "오늘의 막차예요"라고 알려요. 못 한 운행은 다음 날로 쌓이지 않아요.`),
        h('div.chips', [1, 2, 3, 4].map((k) => h(`button.chip${(state.settings.dailyRuns ?? 2) === k ? '.chosen' : ''}`, { type: 'button', onclick: () => { app.save({ ...app.state, settings: { ...app.state.settings, dailyRuns: k } }); parentBody(root, app, { onHome, onReset }); } }, `${k}번`))),
        h('button.secondary', { type: 'button', onclick: () => { app.save({ ...app.state, extraToday: dayNumber() }); parentBody(root, app, { onHome, onReset }); } }, state.extraToday === dayNumber() ? '오늘 한 번 더 허락함' : '오늘만 한 번 더 허락하기')),
      h('section', h('h3', `"이 문제 이상해요" 신고 ${state.reports.length}건`), h('ul', state.reports.slice(-20).map((r, k, arr) => h('li', `${r.at.slice(0, 10)} ${stationOf(r.node)?.name ?? r.node} ${r.template} 단계 ${r.level}: ${r.reason} — ${r.text} `, r.seen ? '(확인함)' : h('button.chip', { type: 'button', onclick: () => ack(state.reports.length - arr.length + k) }, '확인했어요'))))),
      h('details', h('summary', '자세히(역별 숫자, 성취기준)'), h('table.grid', h('tr', ['역', '개념', '성취기준', '상태', '맞힘/푼 수', '힌트 ②~④'].map((x) => h('th', x))), rows), h('p.small', '성취기준 코드는 2022 개정 교육과정(교육부 고시 제2022-33호)이에요. 학년은 아이 화면에 보이지 않아요. 아이가 학교 진도보다 앞서가면 담임 선생님과 이야기해 보세요.')),
      h('section', h('h3', '백업'),
        h('p.small', '백업 파일을 저장해 두면, 기기를 바꾸거나 브라우저 기록이 지워져도 이어서 할 수 있어요. 파일은 이 기기에만 저장되고 어디로도 보내지 않아요.'),
        h('div.next-btns',
          h('button.secondary', { type: 'button', onclick: () => { const blob = new Blob([exportBackup(app.state)], { type: 'application/json' }); const a = h('a', { href: URL.createObjectURL(blob), download: `부산교통수학-백업-${new Date().toISOString().slice(0, 10)}.json` }); document.body.append(a); a.click(); setTimeout(() => { URL.revokeObjectURL(a.href); a.remove(); }, 1000); } }, '백업 파일로 저장'),
          (() => { const file = h('input', { type: 'file', accept: 'application/json,.json', style: { display: 'none' }, onchange: async (e) => { const f = e.target.files?.[0]; if (!f) return; try { const next = importBackup(await f.text()); if (!confirm('이 백업으로 바꿀까요? 지금 진행은 이 기기에 자동으로 백업돼요.')) return; try { localStorage.setItem('busan-transport-math:backup-before-restore', exportBackup(app.state)); } catch {} app.save({ ...next, parentPin: app.state.parentPin }); onHome(); } catch (err) { alert(err.message); } } }); return h('span', file, h('button.secondary', { type: 'button', onclick: () => file.click() }, '파일에서 복원')); })(),
        ),
        h('details', h('summary', '글자로 백업·복원(파일을 못 쓸 때)'), backup, restore, h('button.secondary', { type: 'button', onclick: () => { try { app.save({ ...importBackup(restore.value), parentPin: app.state.parentPin }); onHome(); } catch (e) { alert(e.message); } } }, '복원'),
        h('button.secondary.danger', { type: 'button', onclick: async () => {
          if (!(await askPin(app.state, '처음부터 다시 하려면 번호를 한 번 더 넣어 주세요. 지금 진행은 이 기기에 자동으로 백업돼요.'))) return;
          try { localStorage.setItem('busan-transport-math:backup-before-reset', exportBackup(app.state)); } catch {}
          onReset();
        } }, '처음부터 다시'))),
    ),
  );
}
