// Content pack: 康軒八上 第 2 章 平方根與畢氏定理 (scope authority: 均一 k-m8a-c02)
import t21 from './tpl-21.js';
import t22 from './tpl-22.js';
import t23 from './tpl-23.js';
import misconceptions from './misconceptions.js';
import cards from './cards.js';

const J = 'https://www.junyiacademy.org';
const v = (id, sec, title) => ({ title, url: `${J}/video/${id}?parent-topic-id=k-m8a-c02-${sec}` });

const nodes = {
  P1: { title: '乘法公式', prereqs: [], junyi: [], hint: '回頭翻課本 1-1 乘法公式。' },
  R1: { title: '平方根的意義', prereqs: [], junyi: [v('fhINR5v_i7M', 1, '平方根的意義（素養動畫）'), v('3NXpYkSpu9k', 1, '認識平方根 1'), v('F3zknHlTbeg', 1, '正方形的面積與邊長')] },
  R7: { title: '根號的性質與比大小', prereqs: ['R1'], junyi: [v('0eSdL-CU_28', 1, '根號 a 的平方'), v('NYdTBVWjiUo', 1, '求根號 a² 的值'), v('sj461WO8Vq0', 1, '根號比大小')] },
  R2: { title: '完全平方數與標準分解', prereqs: ['R1'], junyi: [v('Pe7rX15ozZE', 1, '完全平方數'), v('qSkL7fWk174', 1, '用標準分解式求平方根'), v('Pe09PL_EhOE', 1, '求分數的平方根')] },
  R3: { title: '平方根的近似值', prereqs: ['R7', 'R2'], junyi: [v('PyXLr-Fshsc', 1, '十分逼近法（素養動畫）'), v('6V4VUhidUXc', 1, '十分逼近法求近似值')] },
  R8: { title: '根式的乘法與除法', prereqs: ['R2'], junyi: [v('omHooZdcirI', 2, '根式的表示與乘法運算'), v('jL353PKweZA', 2, '根式的除法運算')] },
  R4: { title: '最簡根式', prereqs: ['R8'], junyi: [v('0nryVtQi7TM', 2, '最簡根式'), v('4rE-CeaH47k', 2, '判斷最簡根式'), v('Z1gtXzdZwBg', 2, '化為最簡根式')] },
  R5: { title: '同類方根的加減', prereqs: ['R4'], junyi: [v('9XsR9chOviw', 2, '同類方根'), v('EqK20vZL2aE', 2, '化簡後再合併同類方根')] },
  R6: { title: '分母有理化', prereqs: ['R8', 'P1'], junyi: [v('6y639OExHOI', 2, '分母有理化的方法'), v('mgZUDlysPn0', 2, '最簡根式與有理化')] },
  R9: { title: '根式的四則運算', prereqs: ['R5', 'R6', 'P1'], junyi: [v('-BEqFnc4Lig', 2, '根式的四則運算'), v('u2HtwsEvUeQ', 2, '根式的四則運算（素養動畫）')] },
  T1: { title: '發現畢氏定理', prereqs: ['P1', 'R1'], intro: 'proof', junyi: [v('tijI0c91D7U', 3, '畢氏定理的發現（素養動畫）'), v('jBPUdTs2ywA', 3, '畢氏定理')] },
  T2: { title: '求直角三角形的邊', prereqs: ['T1', 'R4'], junyi: [v('T2VE05ou_Cw', 3, '求直角三角形的邊長'), v('_ZIJkeJ5pPs', 3, '求矩形的對角線長'), v('mdc0mn3IF4I', 3, '求正方形的對角線長')] },
  T3: { title: '常見的直角三角形', prereqs: ['T2'], junyi: [v('9xQYyNR66u4', 3, '常見的直角三角形三邊長')] },
  T4: { title: '複合圖形求邊長', prereqs: ['T2', 'P1'], junyi: [v('4I2kjM5VwQc', 3, '求複合圖形的邊長')] },
  T5: { title: '斜邊上的高', prereqs: ['T2'], junyi: [v('VPIX-gI3oM4', 3, '斜邊上的高')] },
  T6: { title: '正三角形的高與面積', prereqs: ['T2', 'R6'], junyi: [v('glKEHRVtkP4', 3, '正三角形的高和面積')] },
  T7: { title: '複合圖形面積', prereqs: ['T6', 'R5'], junyi: [v('1FHxJOk-_6o', 3, '畢氏定理的應用：基礎'), v('rvyPPh5hZF8', 3, '畢氏定理的應用：進階')] },
  T8: { title: '在數線上標出根號', prereqs: ['T2', 'R3'], junyi: [v('n-4mAqBNi7Q', 1, '根號與正方形'), { title: '利用畢氏定理求根號 a（練習）', url: `${J}/exercise/jsc-8-06-1-1d?parent-topic-id=k-m8a-c02-3` }] },
  T9: { title: '生活中的畢氏定理', prereqs: ['T2'], junyi: [v('Dk7M-BOebP8', 3, '畢氏定理在生活中的應用')] },
  T10: { title: '水平、鉛直兩點距離', prereqs: ['T2'], junyi: [v('A-_VDnBFFco', 3, '平面上兩點距離（水平與鉛直）')] },
  T11: { title: '兩點距離公式', prereqs: ['T10'], junyi: [v('oArmQ_QfGE8', 3, '直角坐標平面上兩點的距離公式'), v('0ySnFo8p9VI', 3, '兩點距離公式與應用（素養動畫）')] },
};

for (const [id, n] of Object.entries(nodes)) {
  n.id = id;
  n.templates = [...t21, ...t22, ...t23].filter((t) => t.node === id);
}

export default {
  id: 'ch8a-2',
  title: '八上 第二章 平方根與畢氏定理',
  sections: [
    { id: 'pre', title: '先備：乘法公式', nodes: ['P1'] },
    { id: '2-1', title: '2-1 平方根與近似值', nodes: ['R1', 'R7', 'R2', 'R3'] },
    { id: '2-2', title: '2-2 根式的運算', nodes: ['R8', 'R4', 'R5', 'R6', 'R9'] },
    { id: '2-3', title: '2-3 畢氏定理', nodes: ['T1', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'T8', 'T9', 'T10', 'T11'] },
  ],
  nodes,
  misconceptions,
  cards,
};
