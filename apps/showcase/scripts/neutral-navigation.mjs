import assert from 'node:assert/strict';
import { mkdir, writeFile } from 'node:fs/promises';
import { chromium, webkit } from 'playwright';
const baseURL=process.env.NAVIGATION_URL??'http://127.0.0.1:5791';
const shots=process.env.NAVIGATION_SCREENSHOTS??'snapshots/neutral-navigation';
await mkdir(shots,{recursive:true});
const results=[];
for(const [name,engine] of [['chromium',chromium],['webkit',webkit]]){
 const browser=await engine.launch({headless:true});
 try {
  for(const theme of ['light','dark']){
   const page=await browser.newPage({viewport:{width:1440,height:960}});page.setDefaultTimeout(10000);const errors=[];page.on('pageerror',e=>errors.push(e.message));
   await page.goto(`${baseURL}/?theme=${theme}`);await page.locator(`html[data-theme=${theme}]`).waitFor();
   const token=async value=>page.evaluate(value=>{const e=document.createElement('div');e.style.backgroundColor=`var(${value})`;document.body.append(e);const color=getComputedStyle(e).backgroundColor;e.remove();return color;},value);
   const surface3=await token('--yk-surface-3'),surface2=await token('--yk-surface-2'),text=await token('--yk-text');
   const style=locator=>locator.evaluate(e=>{const s=getComputedStyle(e);return {background:s.backgroundColor,color:s.color,radius:s.borderRadius,padding:s.padding,bottom:getComputedStyle(e,'::after').content};});
   const settled=async(locator,expected)=>page.waitForFunction(({element,expected})=>getComputedStyle(element).backgroundColor===expected,{element:await locator.elementHandle(),expected});
   const nav=()=>page.getByRole('navigation',{name:'Навигация приложения'}).filter({visible:true});
   const active=()=>nav().locator('[aria-current=page]');
   const assertActive=async()=>{const s=await style(active());assert.equal(s.background,surface3);assert.equal(s.color,text);assert.equal(await active().locator('svg').evaluate(e=>getComputedStyle(e).color),text);};
   const footerWidth=async()=>{
    const footer=page.locator('.yk-app-shell__footer').filter({visible:true});
    const trigger=footer.locator('.yk-menu-anchor>button');await trigger.hover();
    const item=await active().boundingBox(),account=await trigger.boundingBox();
    assert.ok(Math.abs(item.x-account.x)<=1,JSON.stringify({item,account}));assert.ok(Math.abs(item.width-account.width)<=1,JSON.stringify({item,account}));
    await trigger.click();const menu=page.getByRole('menu',{name:'Аккаунт'});await menu.waitFor();const box=await menu.boundingBox();assert.ok(box.x>=0&&box.x+box.width<=(await page.viewportSize()).width+1);await page.keyboard.press('Escape');await menu.waitFor({state:'hidden'});return {item,account};
   };
   await assertActive();await active().hover();await assertActive();
   const other=nav().getByRole('button',{name:'Проекты',exact:true});await other.hover();assert.equal((await style(other)).background,surface2);
   const tab=page.getByRole('tab',{name:'Обзор раздела',exact:true}),next=page.getByRole('tab',{name:'Параметры',exact:true});
   await settled(tab,surface3);assert.equal((await style(tab)).background,surface3);assert.equal((await style(tab)).color,text);assert.equal((await style(tab)).bottom,'none');assert.equal((await style(tab)).padding,'6px 12px');
   await next.hover();await settled(next,surface2);assert.equal((await style(next)).background,surface2);await tab.focus();await page.keyboard.press('ArrowRight');assert.equal(await next.getAttribute('aria-selected'),'true');await settled(next,surface3);assert.equal((await style(next)).background,surface3);
   await page.keyboard.press('ArrowRight');assert.equal(await tab.getAttribute('aria-selected'),'true'); // disabled skipped, wraps
   const expanded=await footerWidth();await page.screenshot({path:`${shots}/${name}-${theme}-expanded.png`});
   await page.getByRole('button',{name:'Свернуть навигацию',exact:true}).click();await page.waitForTimeout(220);await assertActive();const collapsed=await footerWidth();await page.screenshot({path:`${shots}/${name}-${theme}-collapsed.png`});
   await page.setViewportSize({width:390,height:844});await page.getByRole('button',{name:'Открыть навигацию',exact:true}).click();const dialog=page.getByRole('dialog',{name:'Навигация приложения',exact:true});await dialog.waitFor();await assertActive();const mobile=await footerWidth();await dialog.waitFor();await page.screenshot({path:`${shots}/${name}-${theme}-mobile.png`});
   await page.keyboard.press('Escape');await dialog.waitFor({state:'hidden'});assert.deepEqual(errors,[]);
   results.push({browser:name,theme,colors:{surface3,surface2,text},footer:{expanded,collapsed,mobile},checks:'selected/hover/icon/tab arrows/disabled/underline/footer edges/Menu focus/Escape: PASS'});await page.close();
  }
 } finally {await browser.close();}
 console.log(`${name}: light + dark, desktop expanded/collapsed + mobile PASS`);
}
await writeFile(`${shots}/results.json`,JSON.stringify(results,null,2));
