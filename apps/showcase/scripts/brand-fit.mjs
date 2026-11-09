// Название приложения из двух коротких слов помещается в стандартной панели 264 px (кнопка поиска не передана).
import {chromium} from 'playwright';
import {mkdir} from 'node:fs/promises';
import {fileURLToPath} from 'node:url';
const baseURL=process.env.NAVIGATION_URL??'http://127.0.0.1:5967';
const shots=process.env.BRAND_SHOTS??fileURLToPath(new URL('../snapshots/brand',import.meta.url));
const stage=process.env.BRAND_STAGE??'after';
await mkdir(shots,{recursive:true});
const browser=await chromium.launch({executablePath:process.env.CHROME_FOR_TESTING});
const page=await browser.newPage({viewport:{width:1440,height:960}});
await page.goto(baseURL);await page.evaluate(()=>document.fonts.ready);
const result=await page.evaluate(()=>{
  const brand=document.querySelector('.yk-app-shell__sidebar .yk-app-shell__brand');
  brand.closest('.yk-app-shell__nav-header').querySelector('[aria-label="Поиск"]')?.remove();
  const label=brand.lastElementChild;
  const fit=(text)=>{label.textContent=text;return {text,scrollWidth:label.scrollWidth,clientWidth:label.clientWidth,sidebar:document.querySelector('.yk-app-shell__sidebar').offsetWidth}};
  return {short:fit('Живые лидмагниты'),long:fit('Очень длинное название приложения для проверки'),again:fit('Живые лидмагниты')};
});
await page.screenshot({path:`${shots}/brand-${stage}.png`,clip:{x:0,y:0,width:420,height:120}});
await browser.close();
console.log(JSON.stringify(result));
if(result.short.sidebar!==264)throw new Error('Sidebar width must stay 264');
if(result.short.scrollWidth>result.short.clientWidth)throw new Error('Short brand is truncated');
if(result.long.scrollWidth<=result.long.clientWidth)throw new Error('Long brand must still be truncated with an ellipsis');
