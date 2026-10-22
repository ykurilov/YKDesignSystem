// Сценарии заполненного экрана. Только локальная демонстрация, без API модели.
function writeSceneUrl(){const url=new URL(location);url.searchParams.set('state',scene);url.searchParams.set('v',variant);window.history.replaceState(null,'',url)}
function actions(){return `<div class="answer-actions"><button class="icon-button" data-action="copy" title="Копировать" aria-label="Копировать ответ">${i('copy')}</button><button class="icon-button" data-action="like" title="Хороший ответ" aria-label="Хороший ответ">${i('thumbs-up')}</button><span class="answer-meta">GPT-6.1 Sol · 2,4 с</span></div>`}
function userMessage(text,time){return `<div class="message-user">${text}<span class="user-time">${time}</span></div>`}
function agentMessage(html,step,working=false){return `<article class="agent-answer${working?' is-working':''}"><div class="agent-label"><span>Упаковщик оффера</span><span class="step-number">${step}</span></div><div class="answer-content">${html}</div>${working?'':actions()}</article>`}
function liveStep(){return `<details class="live-step" open><summary>${sphere(22)}<span>Собирает первый вариант оффера</span>${i('caret-down')}</summary><div class="step-list"><span>${i('check')}Аудитория и результат определены</span><span class="current">${i('pencil-simple')}Формулирует предложение</span></div></details>`}
function renderScene(){
 if(scene==='empty')return;
 app.classList.add('has-messages');
 const list=document.getElementById('messages');
 list.innerHTML='<div class="conversation-marker">Сегодня · тестовый диалог</div>'
 +userMessage('Я помогаю экспертам создавать онлайн-курсы. Хочу упаковать шестинедельную программу для тех, кто запускается впервые.','19:48')
 +agentMessage('<p>Начнём с результата. Шесть недель — это длительность программы, но пока не причина её купить.</p><p><strong>Что будет готово у участника к концу программы?</strong> Например, структура курса, первые уроки или запуск с набранной группой.</p>','01 / Знакомство')
 +userMessage('Участник выберет тему, проверит спрос и соберёт первую группу. Полностью записывать курс заранее не будем — занятия пройдут вживую.','19:50')
 +agentMessage(scene==='working'?liveStep()+'<p class="streaming-text">Здесь сильный результат — первая группа, а не набор записанных уроков. Я бы сделал это центром предложения.</p>':'<h2>Первый вариант оффера</h2><p>Здесь сильный результат — первая группа, а не набор записанных уроков. Я бы сделал это центром предложения.</p><blockquote class="offer-quote">Запустите свой первый онлайн-курс за 6 недель: от выбора темы и проверки спроса до набора группы — без предварительной записи всех уроков.</blockquote><dl class="offer-facts"><dt>Для кого</dt><dd>Эксперты, которые впервые запускают обучение.</dd><dt>Результат</dt><dd>Проверенная тема и первая группа участников.</dd><dt>Формат</dt><dd>Шесть недель работы с живыми занятиями.</dd></dl><p>Срок набора группы пока звучит как обещание. Прежде чем его закреплять, проверим, на какой опыт он опирается.</p><p><strong>Вы уже помогали кому-то пройти этот путь? Как быстро удалось собрать первую группу?</strong></p>','03 / Предложение',scene==='working');
 document.getElementById('prompt').placeholder='Ответьте агенту или уточните формулировку…';
 document.querySelector('.badge').innerHTML='<span class="dot"></span>'+(scene==='working'?'Агент работает':'Диалог начат');
 renderJournal(scene==='working');setBusyState(scene==='working');
 requestAnimationFrame(()=>{list.scrollTop=list.scrollHeight});
}
function renderJournal(working){
 const empty=document.getElementById('empty-log');empty.hidden=true;empty.style.display='none';
 const log=document.getElementById('log-events');log.hidden=false;
 document.querySelector('.inspector-tabs').innerHTML='<button data-log-filter="all" aria-pressed="true">Все события</button><button data-log-filter="model" aria-pressed="false">Вызовы модели</button>';
 const events=[
 ['19:48:12','Диалог начат','Тестовая сессия · Упаковщик оффера','session'],
 ['19:48:12','Сообщение эксперта','Программа для первого запуска курса.','message'],
 ['19:48:13','Вопрос о результате','GPT-6.1 Sol · 1,8 с','model'],
 ['19:50:04','Результат уточнён','Проверка спроса и набор первой группы.','message'],
 ['19:50:04','Переход к предложению','Этап 03 из 05 · flow.json','stage'],
 ['19:50:05',working?'Модель формирует ответ':'Первый оффер сформулирован',working?'GPT-6.1 Sol · ответ поступает':'GPT-6.1 Sol · 2,4 с · 386 токенов','model']
 ];
 log.innerHTML='<div class="log-summary"><div class="log-summary-top"><span>Предложение</span><span class="log-stage">03 / 05</span></div><div class="stage-steps"><span class="done"></span><span class="done"></span><span class="done"></span><span></span><span></span></div><p>Аудитория и результат определены.<br>Проверяем формулировку обещания.</p></div><div class="journal-caption">ДЕМОНСТРАЦИОННЫЕ СОБЫТИЯ</div>'+events.map(([time,title,detail,type],n)=>`<div class="event${n===events.length-1?' current':''}" data-event-type="${type}"><div class="event-top"><span>${time}</span><span>${type==='model'?'МОДЕЛЬ':type==='stage'?'ЭТАП':'СОБЫТИЕ'}</span></div><strong>${title}</strong><p>${detail}</p>${type==='model'?'<details><summary>Параметры запроса</summary><pre>Модель: GPT-6.1 Sol\nРассуждения: высоко\nРежим: демонстрация\nСценарий: flow.json</pre></details>':''}</div>`).join('');
 document.getElementById('event-count').textContent=events.length+' событий';
}
function filterLog(filter){document.querySelectorAll('[data-log-filter]').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.logFilter===filter)));document.querySelectorAll('[data-event-type]').forEach(el=>{el.hidden=filter==='model'&&el.dataset.eventType!=='model'})}
function setBusyState(value){busy=value;const button=document.getElementById('send');button.innerHTML=i(value?'stop':'arrow-up');button.setAttribute('aria-label',value?'Остановить':'Отправить');document.querySelector('.model-button').disabled=value;updateInput()}
function stopDemoReply(){clearTimeout(responseTimer);const last=document.querySelector('.agent-answer:last-child');last?.classList.remove('is-working');const live=last?.querySelector('.live-step');if(live)live.outerHTML='<div class="agent-label">Ответ остановлен</div>';last?.querySelector('.streaming-text')?.classList.remove('streaming-text');setBusyState(false);const badge=document.querySelector('.badge');badge.innerHTML='<span class="dot"></span>Остановлено';const current=document.querySelector('.event.current');if(current){current.querySelector('strong').textContent='Ответ остановлен';current.querySelector('p').textContent='Остановка пользователем · демонстрация'}renderIcons()}
function sendDemoMessage(){
 const prompt=document.getElementById('prompt');if(!prompt.value.trim())return;
 closePopover();app.classList.add('has-messages');
 const list=document.getElementById('messages');const user=document.createElement('div');user.className='message-user';user.textContent=prompt.value.trim();list.append(user);
 const answer=document.createElement('article');answer.className='agent-answer is-working';answer.innerHTML=`<div class="agent-label"><span>Упаковщик оффера</span><span class="step-number">Уточнение</span></div><div class="answer-content">${liveStep()}</div>`;list.append(answer);
 message='';prompt.value='';prompt.placeholder='Ответьте агенту или уточните формулировку…';renderJournal(true);setBusyState(true);window.YKSphere?.scan(answer);renderIcons();list.scrollTop=list.scrollHeight;
 responseTimer=setTimeout(()=>{answer.classList.remove('is-working');answer.querySelector('.answer-content').innerHTML='<p>Расскажите чуть больше о вашем продукте.</p><p><strong>Какое изменение должен получить человек после работы с вами?</strong> Например, запустить первый курс, собрать команду или привлечь клиентов. Чем точнее результат, тем легче будет сформулировать предложение.</p>';answer.insertAdjacentHTML('beforeend',actions());setBusyState(false);renderJournal(false);renderIcons();list.scrollTop=list.scrollHeight},1500);
}
