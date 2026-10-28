import {chromium,webkit} from 'playwright';
import {fileURLToPath} from 'node:url';
const shots=process.env.NAVIGATION_SCREENSHOTS??fileURLToPath(new URL('../snapshots/navigation',import.meta.url));
const baseURL=process.env.NAVIGATION_URL??'http://127.0.0.1:5967';
import{mkdir,writeFile}from'node:fs/promises';
await mkdir(shots,{recursive:true});const results=[];
for(const [name,engine]of[['chromium',chromium],['webkit',webkit]]){
 const browser=await engine.launch({headless:true});const page=await browser.newPage({viewport:{width:1440,height:960}});page.setDefaultTimeout(10000);
 const errors=[];page.on('pageerror',e=>errors.push(e.message));await page.goto(baseURL);
 const symbol=()=>page.getByRole('navigation',{name:'Навигация приложения'}).getByRole('button',{name:'Обзор',exact:true}).locator('svg');
 const before=await symbol().boundingBox();
 await page.getByRole('button',{name:'Свернуть навигацию',exact:true}).click();await page.waitForTimeout(250);const after=await symbol().boundingBox();
 if(Math.abs(before.x-after.x)>1||Math.abs(before.y-after.y)>1)throw new Error('Icons moved: '+JSON.stringify({before,after}));
 await page.screenshot({path:`${shots}/${name}-desktop-collapsed.png`});
 await page.getByRole('button',{name:'Развернуть навигацию',exact:true}).click();await page.waitForTimeout(250);await page.screenshot({path:`${shots}/${name}-desktop-expanded.png`});
 await page.getByRole('button',{name:'Тёмная тема',exact:true}).click();await page.screenshot({path:`${shots}/${name}-desktop-dark.png`});await page.getByRole('button',{name:'Светлая тема',exact:true}).click();
 await page.setViewportSize({width:390,height:844});const trigger=page.getByRole('button',{name:'Открыть навигацию',exact:true});await trigger.click();
 const dialog=page.getByRole('dialog',{name:'Навигация приложения',exact:true});await dialog.waitFor({state:'visible'});
 await page.screenshot({path:`${shots}/${name}-mobile-open.png`});for(let i=0;i<20;i++){await page.keyboard.press(name==='webkit'?'Alt+Tab':'Tab');if(!await dialog.evaluate(e=>e.contains(document.activeElement)))throw new Error('Focus escaped modal');}await page.keyboard.press('Escape');await dialog.waitFor({state:'hidden'});
 if(!await trigger.evaluate(e=>e===document.activeElement))throw new Error('Focus not restored');await trigger.click();await dialog.getByRole('button',{name:'Проекты',exact:true}).click();await dialog.waitFor({state:'hidden'});
 await page.screenshot({path:`${shots}/${name}-mobile-closed.png`});
 await trigger.click();await page.mouse.click(375,300);await dialog.waitFor({state:'hidden'});
 await page.goto(baseURL+'/?frame=true&long=true');await page.getByRole('button',{name:'Открыть навигацию'}).click();const list=page.getByRole('dialog').getByRole('navigation');if(!await list.evaluate(e=>e.scrollHeight>e.clientHeight))throw new Error('Long list did not scroll');const footer=page.locator('.yk-app-shell__drawer .yk-app-shell__footer');const footerBefore=await footer.boundingBox();await list.evaluate(e=>e.scrollTop=e.scrollHeight);const footerAfter=await footer.boundingBox();if(footerBefore.y!==footerAfter.y||footerAfter.y+footerAfter.height>844)throw new Error('Footer moved outside viewport');
 if(errors.length)throw new Error(errors.join('\n'));results.push({browser:name,icons:{before,after},checks:'collapse/expand, light/dark, mobile open/Escape/select/backdrop/close/focus, long list/footer: PASS',keyboard:name==='webkit'?'Option+Tab (full keyboard navigation)':'Tab'});await browser.close();console.log(name+': PASS');
}
await writeFile(shots+'/browser-results.json',JSON.stringify(results,null,2));
