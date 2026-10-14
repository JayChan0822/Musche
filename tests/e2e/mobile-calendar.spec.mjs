import { test, expect } from '@playwright/test';

test.use({ viewport: { width: 402, height: 812 }, isMobile: true, hasTouch: true, colorScheme: 'dark' });
async function boot(page, theme = 'dark') {
    await page.addInitScript(theme => { localStorage.setItem('musche_tour_seen', '1'); localStorage.setItem('theme_mode', theme); }, theme);
    await page.goto('/');
    await expect(page.locator('#global-loader')).toBeHidden({ timeout: 20000 });
    await expect(page.locator('.mc-calendar')).toBeVisible();
}
async function dateKey(page, delta = 0) {
    return page.evaluate(delta => { const d = new Date(); d.setDate(d.getDate()+delta); return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`; }, delta);
}
async function openToday(page) {
    const key = await dateKey(page);
    await page.locator(`[data-month-date="${key}"]`).click();
    await expect(page.locator('.mc-calendar')).toHaveAttribute('data-mode', 'multiday');
    await expect(page.locator('.mc-calendar')).toHaveAttribute('data-depth', '1.0000');
    return key;
}
async function changeMode(page, name) {
    await page.getByRole('button', { name: '切换日历视图' }).click();
    await page.getByRole('menuitemradio', { name, exact: false }).click();
    await expect(page.getByRole('menu')).toBeHidden();
}

test('保留原应用导航：日历表两列多日、单日、列表与返回', async ({ page }) => {
    const errors=[]; page.on('pageerror',e=>errors.push(e.message));
    await boot(page);
    await expect(page.locator('header')).toBeVisible();
    await expect(page.locator('.mobile-tab-bar')).toBeVisible();
    await expect(page.locator('.mc-toolbar,.mc-bottom-toolbar')).toHaveCount(0);
    const monthCount=await page.locator('[data-month-section]').count(); expect(monthCount).toBe(11);
    await page.screenshot({path:'/tmp/musche-fidelity-month.png'});
    const key=await openToday(page);
    await expect(page.locator('[data-active-date]')).toHaveCount(2);
    await page.screenshot({path:'/tmp/musche-fidelity-multi.png'});
    await changeMode(page,'单日');
    await expect(page.locator('[data-active-date]')).toHaveCount(1);
    await expect(page.locator(`[data-week-date="${key}"]`)).toHaveAttribute('aria-pressed','true');
    await page.screenshot({path:'/tmp/musche-fidelity-day.png'});
    await changeMode(page,'列表'); await expect(page.locator('.mc-calendar')).toHaveAttribute('data-mode','list');
    await page.getByRole('button',{name:'返回月视图'}).click();
    await expect(page.locator('.mc-calendar')).toHaveAttribute('data-mode','month');
    expect(errors).toEqual([]);
});

test('跟手分页保留时间位置；动画中再次按住并反向接管', async ({ page }) => {
    await boot(page); const key=await openToday(page); await changeMode(page,'单日');
    const scroll=page.locator('.mc-timeline-scroll'); await scroll.evaluate(el=>el.scrollTop=300);
    const top=await scroll.evaluate(el=>el.scrollTop);
    await page.mouse.move(300,620); await page.mouse.down(); await page.mouse.move(140,622,{steps:8});
    const offset=await page.locator('.mc-calendar').evaluate(el=>parseFloat(el.style.getPropertyValue('--mc-page-offset')));
    expect(offset).toBeLessThan(-402);
    await page.mouse.up();
    await page.mouse.move(230,620); await page.mouse.down();
    const before=await page.locator('.mc-calendar').evaluate(el=>parseFloat(el.style.getPropertyValue('--mc-page-offset')));
    await page.mouse.move(330,620,{steps:8});
    const after=await page.locator('.mc-calendar').evaluate(el=>parseFloat(el.style.getPropertyValue('--mc-page-offset')));
    expect(after-before).toBeCloseTo(100,0); await page.mouse.up();
    await expect.poll(()=>page.locator('.mc-calendar').evaluate(el=>parseFloat(el.style.getPropertyValue('--mc-page-offset')))).toBe(-402);
    expect(await scroll.evaluate(el=>el.scrollTop)).toBe(top);
    await expect(page.locator('[data-week-date][aria-pressed="true"]')).toHaveAttribute('data-week-date',key);
});

test('长按新建确认才持久化，取消不会创建，原搜索入口可筛选', async ({page})=>{
    await boot(page); await openToday(page);
    const createDraft=async()=>{ await page.mouse.move(310,550); await page.mouse.down(); await expect(page.locator('.mc-draft')).toBeVisible(); await page.mouse.up(); await expect(page.locator('.mc-editor-sheet')).toBeVisible(); };
    await createDraft(); await page.getByRole('textbox',{name:'日程标题'}).fill('不应保存的日程');
    await page.getByRole('button',{name:'取消编辑'}).click(); await expect(page.locator('.mc-editor-sheet')).toBeHidden();
    await createDraft(); await page.getByRole('textbox',{name:'日程标题'}).fill('Calendar motion review');
    await page.locator('.mc-form-group input[type="time"]').fill('15:00');
    await page.getByRole('textbox',{name:'结束时间'}).fill('15:30');
    await page.getByRole('button',{name:'保存日程'}).click(); await expect(page.locator('.mc-editor-sheet')).toBeHidden();
    await page.reload(); await expect(page.locator('.mc-calendar')).toBeVisible(); await openToday(page);
    await page.locator('.mobile-tab-bar').getByRole('button',{name:'搜索'}).click();
    await page.getByPlaceholder('Search...').filter({visible:true}).fill('Calendar motion review');
    await expect(page.locator('[data-active-date] .mc-event strong')).toHaveText(['Calendar motion review']);
    await page.getByPlaceholder('Search...').filter({visible:true}).fill('不应保存');
    await expect(page.locator('[data-active-date] .mc-event')).toHaveCount(0);
});

test('返回手势中途取消，长按草稿取消，拉伸取消与提交', async ({page})=>{
    await boot(page); await openToday(page);
    await page.mouse.move(10,420); await page.mouse.down(); await page.mouse.move(115,420,{steps:6});
    const depth=Number(await page.locator('.mc-calendar').getAttribute('data-depth')); expect(depth).toBeGreaterThan(0); expect(depth).toBeLessThan(1);
    await page.locator('.mc-time-panel').dispatchEvent('pointercancel',{pointerId:1}); await page.mouse.up();
    await expect(page.locator('.mc-calendar')).toHaveAttribute('data-depth','1.0000');
    await page.mouse.move(310,450); await page.mouse.down();
    await expect(page.locator('.mc-draft')).toBeVisible();
    await page.locator('.mc-time-panel').dispatchEvent('pointercancel',{pointerId:1}); await page.mouse.up();
    await expect(page.locator('.mc-draft')).toBeHidden(); await expect(page.locator('.mc-editor-sheet')).toBeHidden();
    const event=page.locator('[data-active-date] .mc-event').first(); await event.click();
    const before=await event.locator('.mc-event-range').textContent();
    let box=await event.locator('.mc-event-resize').boundingBox();
    await page.mouse.move(box.x+14,box.y+14); await page.mouse.down(); await page.mouse.move(box.x+14,box.y+61,{steps:5});
    await expect(event.locator('.mc-event-range')).not.toHaveText(before);
    await event.dispatchEvent('pointercancel',{pointerId:1}); await page.mouse.up();
    await expect(event.locator('.mc-event-range')).toHaveText(before);
    box=await event.locator('.mc-event-resize').boundingBox();
    await page.mouse.move(box.x+14,box.y+14); await page.mouse.down(); await page.mouse.move(box.x+14,box.y+61,{steps:5}); await page.mouse.up();
    await expect(event.locator('.mc-event-range')).not.toHaveText(before);
    const after=await event.locator('.mc-event-range').textContent();
    await page.reload(); await expect(page.locator('.mc-calendar')).toBeVisible(); await openToday(page);
    await expect(page.locator('[data-active-date] .mc-event-range').first()).toHaveText(after);
});

test('窄屏与减少动态效果保留可用布局', async ({page})=>{
    await page.setViewportSize({width:320,height:720}); await page.emulateMedia({reducedMotion:'reduce'});
    await boot(page); await openToday(page); await changeMode(page,'单日');
    expect(await page.locator('.mc-calendar').evaluate(el=>el.scrollWidth)).toBe(320);
    await page.getByRole('button',{name:'返回月视图'}).click();
    await expect(page.locator('.mc-calendar')).toHaveAttribute('data-mode','month');
});

test('真实触摸横向分页与纵向滚动分流', async ({page})=>{
    await boot(page); await openToday(page);
    const client=await page.context().newCDPSession(page);
    const touch=async(type,x,y)=>client.send('Input.dispatchTouchEvent',{type,touchPoints:type==='touchEnd'?[]:[{x,y,id:1}]});
    await touch('touchStart',310,450);
    for(let x=290;x>=170;x-=20) await touch('touchMove',x,450);
    expect(await page.locator('.mc-calendar').evaluate(el=>parseFloat(el.style.getPropertyValue('--mc-page-offset')))).toBeLessThan(-337);
    await touch('touchEnd');
    await expect.poll(()=>page.locator('.mc-calendar').evaluate(el=>parseFloat(el.style.getPropertyValue('--mc-page-offset')))).toBe(-337);
    const before=await page.locator('.mc-timeline-scroll').evaluate(el=>el.scrollTop);
    await touch('touchStart',300,560); for(let y=540;y>=380;y-=20) await touch('touchMove',300,y); await touch('touchEnd');
    await expect.poll(()=>page.locator('.mc-timeline-scroll').evaluate(el=>el.scrollTop)).toBeGreaterThan(before);
    await expect(page.locator('.mc-editor-sheet')).toBeHidden(); await client.detach();
});

test('浅色日历与桌面原界面切换',async({page})=>{
    await boot(page,'light');
    await expect(page.locator('.mc-calendar')).toBeVisible();
    await expect(page.locator('.mc-calendar')).toHaveCSS('background-color','rgb(245, 245, 247)');
    await page.screenshot({path:'/tmp/musche-fidelity-light.png'});
    await page.setViewportSize({width:1400,height:900});
    await expect(page.locator('.mc-calendar')).toBeHidden(); await expect(page.locator('header')).toBeVisible();
    await expect(page.locator('#tour-view-switch')).toBeVisible(); await page.locator('#tour-view-switch').click();
    await expect(page.getByText('14:00',{exact:true}).first()).toBeVisible();
});

test('原日期导航、任务详情与任务池入口继续可用',async({page})=>{
    await boot(page);
    const nav=page.locator('.mobile-header-nav'); const original=await nav.innerText();
    await nav.locator('button').last().click(); await expect(nav).not.toHaveText(original);
    await nav.locator('button').nth(1).click(); await openToday(page);
    await page.locator('[data-active-date] .mc-event').first().dblclick();
    await expect(page.locator('.modal-overlay').first()).toBeVisible();
    await expect(page.locator('.mc-editor-sheet')).toBeHidden();
    await page.keyboard.press('Escape');
    await page.locator('.mobile-tab-bar').getByRole('button',{name:'任务池'}).click();
    await expect(page.locator('.mc-calendar')).toBeHidden();
    await page.locator('.mobile-tab-bar').getByRole('button',{name:'日程表'}).click();
    await expect(page.locator('#main-content .mc-calendar')).toBeVisible();
});

test('本地化农历 day 字段不会在月历和时间轴显示 undefined',async({page})=>{
    await page.clock.setFixedTime(new Date('2026-10-18T12:00:00+08:00'));
    await page.addInitScript(()=>{
        const original=Intl.DateTimeFormat.prototype.formatToParts;
        const days=['初一','初二','初三','初四','初五','初六','初七','初八','初九','初十','十一','十二','十三','十四','十五','十六','十七','十八','十九','二十','廿一','廿二','廿三','廿四','廿五','廿六','廿七','廿八','廿九','三十'];
        Intl.DateTimeFormat.prototype.formatToParts=function(...args){
            const parts=original.apply(this,args);
            return this.resolvedOptions().calendar==='chinese' ? parts.map(part=>part.type==='day' ? {...part,value:days[Number(part.value)-1]||part.value} : part) : parts;
        };
    });
    await boot(page);
    await expect(page.locator('[data-month-date="2026-10-18"] .mc-lunar')).toHaveText('初九');
    expect(await page.locator('.mc-calendar').textContent()).not.toMatch(/undefined|NaN/);
    await openToday(page);
    await expect(page.locator('[data-heading-date="2026-10-18"] .mc-date-subtitle')).toHaveText('丙午年九月初九');
    expect(await page.locator('.mc-calendar').textContent()).not.toMatch(/undefined|NaN/);
});

test('周日期选中圆和多日范围跟手移动，取消恢复，跨周连续接续',async({page})=>{
    await page.clock.setFixedTime(new Date('2026-10-16T12:00:00+08:00'));
    await boot(page); await openToday(page);
    const marker=page.locator('.mc-week-selection'), range=page.locator('.mc-week-range');
    const start=await marker.boundingBox(), rangeStart=await range.boundingBox();
    await page.mouse.move(310,610); await page.mouse.down(); await page.mouse.move(225.75,610,{steps:6});
    const half=await marker.boundingBox(), rangeHalf=await range.boundingBox();
    expect(half.x-start.x).toBeCloseTo(402/14,0); expect(rangeHalf.x-rangeStart.x).toBeCloseTo(402/14,0);
    await page.mouse.move(268,610,{steps:4});
    expect((await marker.boundingBox()).x).toBeLessThan(half.x);
    await page.locator('.mc-time-panel').dispatchEvent('pointercancel',{pointerId:1}); await page.mouse.up();
    await expect.poll(async()=>Math.abs((await marker.boundingBox()).x-start.x)).toBeLessThan(.2);
    await page.locator('[data-week-date="2026-10-17"]').click();
    await page.mouse.move(310,610); await page.mouse.down(); await page.mouse.move(225.75,610,{steps:6});
    const track=await page.locator('.mc-calendar').evaluate(el=>parseFloat(el.style.getPropertyValue('--mc-week-track')));
    expect(track).toBeCloseTo(-603,0);
    await page.mouse.move(140,610,{steps:5}); await page.mouse.up();
    await expect(page.locator('[data-week-date][aria-pressed="true"]')).toHaveAttribute('data-week-date','2026-10-18');
    const strip=await page.locator('.mc-week-strip').boundingBox();
    await expect.poll(async()=>Math.abs((await marker.boundingBox()).x-strip.x-(402/14-20))).toBeLessThan(.2);
    await changeMode(page,'单日');
    expect(await range.count()).toBe(0);
    await page.mouse.move(300,610); await page.mouse.down(); await page.mouse.move(99,610,{steps:8});
    expect((await marker.boundingBox()).x-strip.x).toBeCloseTo(402/7-20,0);
    await page.locator('.mc-time-panel').dispatchEvent('pointercancel',{pointerId:1}); await page.mouse.up();
    await expect.poll(async()=>Math.abs((await marker.boundingBox()).x-strip.x-(402/14-20))).toBeLessThan(.2);
});

test('日程块沿用原卡片样式，触屏双击打开 TrackList', async ({page})=>{
    await boot(page); await openToday(page);
    const event=page.locator('[data-active-date] .mc-event').first();
    await expect(event).toHaveClass(/task-block/);
    const style=await event.evaluate(el=>({background:getComputedStyle(el).backgroundColor,radius:getComputedStyle(el).borderRadius}));
    expect(style.background).toBe('rgba(45, 45, 48, 0.95)');
    expect(style.radius).toBe('6px');
    await expect(event.locator('.mc-event-range > span')).toHaveCount(2);
    await event.tap();
    await expect(page.locator('.track-list-search-input')).toBeHidden();
    await event.tap();
    await expect(page.locator('.track-list-search-input')).toBeVisible();
    await expect(page.locator('.mc-editor-sheet')).toBeHidden();
    await expect(page.locator('.mc-event-handle,.mc-handle-start,.mc-handle-end')).toHaveCount(0);
    for (const width of [402,320]) {
        await page.setViewportSize({width,height:812});
        await page.locator('.track-list-search-input').focus();
        await page.getByLabel('开始时间',{exact:true}).fill('10:00');
        await page.getByLabel('结束时间',{exact:true}).fill('11:00');
        const overflow=await page.locator('.track-list-modal').evaluate(el=>{
            const bounds=el.getBoundingClientRect();
            return [...el.querySelectorAll('input,button,.track-card')].filter(node=>{
                const r=node.getBoundingClientRect();
                return r.width && (r.left<bounds.left-1 || r.right>bounds.right+1);
            }).map(node=>node.outerHTML);
        });
        expect(overflow).toEqual([]);
        await page.screenshot({path:`/tmp/musche-tracklist-${width}.png`});
    }
});
