// 부모 번호 묻기: 앱 안의 가린 입력. 맞으면 resolve(true).
import { h } from './dom.js';
import { icon } from './icons.js';
import { isPin } from '../engine/state.js';

export function askPin(state, message) {
  return new Promise((resolve) => {
    const box = h('input.name-input', { type: 'password', inputmode: 'numeric', maxlength: 4, autocomplete: 'off', 'aria-label': '부모님 번호' });
    const msg = h('p', message);
    const close = (ok) => { wrap.remove(); resolve(ok); };
    const wrap = h('div.sheet.pin-sheet',
      h('div.sheet-tabs', h('strong', '부모님 확인'), h('button.icon-btn', { type: 'button', 'aria-label': '닫기', onclick: () => close(false) }, icon('close'))),
      msg, box,
      h('button.secondary', { type: 'button', onclick: () => { if (isPin(box.value) && box.value.trim() === state.parentPin) close(true); else { msg.textContent = '번호가 달라요.'; box.value = ''; } } }, '확인'),
    );
    document.body.append(wrap);
    box.focus();
  });
}
