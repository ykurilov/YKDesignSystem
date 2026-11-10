// Название приложения в верхней строке на телефоне (375 px): короткое и длинное, светлая и тёмная тема.
import {chromium} from 'playwright';
import {mkdir} from 'node:fs/promises';
import {fileURLToPath} from 'node:url';
const baseURL=process.env.SHOWCASE_URL??'http://127.0.0.1:5173';
const shots=process.env.MOBILE_TITLE_SHOTS??fileURLToPath(new URL('../snapshots/mobile-title',import.meta.url));
await mkdir(shots,{recursive:true});
const browser=await chromium.launch();
const page=await browser.newPage({viewport:{width:375,height:700}});
const errors=[];page.on('pageerror',e=>errors.push(e.message));
await page.goto(baseURL);await page.evaluate(()=>document.fonts.ready);
const header=page.locator('.sc-app-shell__frame .yk-app-shell__header');
await header.scrollIntoViewIfNeeded();
const measure=()=>page.evaluate(()=>{
  const h=document.querySelector('.sc-app-shell__frame .yk-app-shell__header');
  const t=h.querySelector('.yk-app-shell__header-title');const b=h.querySelector('[data-probe]');
  const r=el=>el.getBoundingClientRect();
  return {text:t.textContent,truncated:t.scrollWidth>t.clientWidth,titleLeft:r(t).left,titleRight:r(t).right,probe:b?{left:r(b).left,width:r(b).width,right:r(b).right}:null,header:r(h).right,menuWidth:r(h.firstElementChild).width};
});
const results=[];
for(const theme of ['light','dark']){
  await page.evaluate(t=>{document.documentElement.dataset.theme=t},theme);
  for(const [kind,text] of [['short','Одуванчик'],['long','Очень длинное название приложения для проверки обрезки']]){
    await page.evaluate(([text])=>{
      const h=document.querySelector('.sc-app-shell__frame .yk-app-shell__header');
      h.querySelector('.yk-app-shell__header-title').textContent=text;
      if(!h.querySelector('[data-probe]')){const b=document.createElement('button');b.type='button';b.dataset.probe='1';b.textContent='Поделиться';b.style.marginLeft='auto';h.append(b);}
    },[text]);
    const m=await measure();results.push({theme,kind,...m});
    await header.locator('xpath=ancestor::div[contains(@class,"sc-app-shell__frame")]').screenshot({path:`${shots}/mobile-title-${kind}-${theme}.png`});
  }
}
await browser.close();
console.log(JSON.stringify(results,null,1));
if(errors.length)throw new Error(errors.join('\n'));
const short=results.find(r=>r.kind==='short'),long=results.find(r=>r.kind==='long');
if(short.truncated)throw new Error('Short title is truncated');
if(!long.truncated)throw new Error('Long title must be truncated');
for(const r of results){if(r.probe.width<60)throw new Error('Right button squeezed');if(r.probe.right>r.header+0.5)throw new Error('Right button overflows');if(r.titleRight>r.probe.left+0.5)throw new Error('Title overlaps right button');}
