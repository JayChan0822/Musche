import { expect, test } from '@playwright/test';

const formatDate = (date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
};

async function seedDividerScenario(page) {
    await page.addInitScript(({ today, tomorrow }) => {
        localStorage.setItem('musche_tour_seen', '1');
        localStorage.setItem('v9_data', JSON.stringify({
            settings: {
                startHour: 10,
                endHour: 22,
                lastSessionId: 'S_DEFAULT',
                sessions: [{ id: 'S_DEFAULT', name: '默认录音日程' }],
                musicians: [
                    { id: 'M1', name: 'Musician One', defaultRatio: 20, color: '#a855f7', group: '' },
                    { id: 'M2', name: 'Musician Two', defaultRatio: 20, color: '#22c55e', group: '' },
                ],
                projects: [{ id: 'P1', name: 'Project A', color: '#eab308', group: '' }],
                instruments: [{ id: 'I1', name: 'Instrument A', color: '#3b82f6', group: '' }],
                studios: [],
                engineers: [],
                operators: [],
                assistants: [],
            },
            pool: [
                {
                    id: 'T1', name: 'Cue One', sessionId: 'S_DEFAULT', musicianId: 'M1', projectId: 'P1', instrumentId: 'I1',
                    musicDuration: '03:00', estDuration: '01:00:00', ratio: 20, trackCount: 1, sectionIndex: 0,
                    records: { musician: {}, project: {}, instrument: {} },
                    splitViews: {
                        musician: { active: true, splitFromId: null, splitTag: '', musicDuration: '03:00', estDuration: '01:00:00', sectionIndex: 0 },
                        project: { active: true, splitFromId: null, splitTag: '', musicDuration: '03:00', estDuration: '01:00:00', sectionIndex: 0 },
                    },
                },
                {
                    id: 'T2', name: 'Cue Two', sessionId: 'S_DEFAULT', musicianId: 'M1', projectId: 'P1', instrumentId: 'I1',
                    musicDuration: '02:00', estDuration: '00:40:00', ratio: 20, trackCount: 1, sectionIndex: 1,
                    records: { musician: {}, project: {}, instrument: {} },
                    splitViews: {
                        musician: { active: true, splitFromId: null, splitTag: '', musicDuration: '02:00', estDuration: '00:40:00', sectionIndex: 1 },
                        project: { active: true, splitFromId: null, splitTag: '', musicDuration: '02:00', estDuration: '00:40:00', sectionIndex: 1 },
                    },
                },
                {
                    id: 'T3', name: 'Other List Cue', sessionId: 'S_DEFAULT', musicianId: 'M2', projectId: 'P1', instrumentId: 'I1',
                    musicDuration: '01:00', estDuration: '00:20:00', ratio: 20, trackCount: 1, sectionIndex: 0,
                    records: { musician: {}, project: {}, instrument: {} },
                },
            ],
            tasks: [
                { scheduleId: 'S1', templateId: 'T1', sessionId: 'S_DEFAULT', musicianId: 'M1', projectId: 'P1', instrumentId: 'I1', date: today, startTime: '10:00', estDuration: '01:00:00', musicDuration: '03:00', ratio: 20 },
                { scheduleId: 'S2', templateId: 'T2', sessionId: 'S_DEFAULT', musicianId: 'M1', projectId: 'P1', instrumentId: 'I1', date: tomorrow, startTime: '11:00', estDuration: '00:40:00', musicDuration: '02:00', ratio: 20 },
                { scheduleId: 'S3', templateId: 'T3', sessionId: 'S_DEFAULT', musicianId: 'M2', projectId: 'P1', instrumentId: 'I1', date: today, startTime: '15:30', estDuration: '00:20:00', musicDuration: '01:00', ratio: 20 },
            ],
        }));
    }, {
        today: formatDate(new Date()),
        tomorrow: formatDate(new Date(Date.now() + 86400000)),
    });
}

const getTrackOrder = (modal) => modal.locator('.track-card, [id^="sec-divider-"]').evaluateAll((elements) => (
    elements
        .filter((element) => {
            const style = getComputedStyle(element);
            return style.display !== 'none' && Number.parseFloat(style.opacity || '1') > 0;
        })
        .map((element) => element.id || element.querySelector('.truncate')?.textContent?.trim())
));

test('Track List divider drag is stable and undo/redo keeps the active time context', async ({ page }) => {
    await seedDividerScenario(page);
    await page.goto('/');
    await expect(page.locator('#global-loader')).toBeHidden({ timeout: 15_000 });

    await page.getByText(/10:00.*Musician One/).first().dblclick();
    const modal = page.locator('.modal-overlay').filter({ has: page.locator('#sec-divider-1') });
    await expect(modal).toBeVisible();
    await expect(modal.getByText('Musician One', { exact: true })).toBeVisible();

    const divider = modal.locator('#sec-divider-1:visible').first();
    const cards = modal.locator('.track-card');
    await expect(cards).toHaveCount(2);
    const initialOrder = await getTrackOrder(modal);
    assertDividerBetweenTracks(initialOrder);

    const dividerBox = await divider.boundingBox();
    const secondCardBox = await cards.nth(1).boundingBox();
    if (!dividerBox || !secondCardBox) throw new Error('Track List drag targets are not measurable');

    await page.mouse.move(dividerBox.x + dividerBox.width / 2, dividerBox.y + dividerBox.height / 2);
    await page.mouse.down();
    await page.mouse.move(
        secondCardBox.x + secondCardBox.width / 2,
        secondCardBox.y + secondCardBox.height + 30,
        { steps: 8 },
    );
    await page.evaluate(() => {
        window.__cardFrameSamples = [];
        window.__cardSamplingDone = false;
        let remaining = 16;
        const sample = () => {
            const modalElement = document.querySelector('.modal-overlay #sec-divider-1')?.closest('.modal-overlay');
            const cards = [...(modalElement?.querySelectorAll('.track-card') || [])];
            window.__cardFrameSamples.push(cards.map((card) => {
                const style = getComputedStyle(card);
                const rect = card.getBoundingClientRect();
                return {
                    id: card.id,
                    top: Math.round(rect.top * 100) / 100,
                    opacity: style.opacity,
                };
            }));
            remaining -= 1;
            if (remaining > 0) requestAnimationFrame(sample);
            else window.__cardSamplingDone = true;
        };
        requestAnimationFrame(sample);
    });
    await page.mouse.up();

    await expect.poll(() => page.evaluate(() => window.__cardSamplingDone)).toBe(true);
    const cardFrameSamples = await page.evaluate(() => window.__cardFrameSamples);
    const maxCardFrameJump = cardFrameSamples.slice(1).reduce((maxJump, frame, index) => {
        const previousFrame = cardFrameSamples[index];
        frame.forEach((card) => {
            const previousCard = previousFrame.find((candidate) => candidate.id === card.id);
            if (previousCard) maxJump = Math.max(maxJump, Math.abs(card.top - previousCard.top));
        });
        return maxJump;
    }, 0);
    expect(maxCardFrameJump, 'task cards should settle without a one-frame divider-height jump').toBeLessThan(20);
    expect(cardFrameSamples.flat().every((card) => card.opacity === '1')).toBe(true);

    const undoButton = page.locator('button:has(i.fa-rotate-left)');
    const redoButton = page.locator('button:has(i.fa-rotate-right)');
    await expect(undoButton).toBeEnabled();
    await expect.poll(() => getTrackOrder(modal)).not.toEqual(initialOrder);

    const opacitySamples = await modal.locator('#sec-divider-1').evaluateAll((elements) => new Promise((resolve) => {
        const samples = [];
        const sample = () => {
            samples.push(Math.max(...elements.map((element) => Number.parseFloat(getComputedStyle(element).opacity || '0'))));
            if (samples.length === 6) resolve(samples);
            else requestAnimationFrame(sample);
        };
        sample();
    }));
    expect(opacitySamples.every((opacity) => opacity === 1)).toBe(true);

    await page.keyboard.press('Meta+z');
    await expect.poll(() => getTrackOrder(modal)).toEqual(initialOrder);
    await expect(modal).toContainText('10:00');
    await expect(modal).toContainText('11:00');
    await expect(modal).not.toContainText('15:30');

    await expect(redoButton).toBeEnabled();
    await page.keyboard.press('Meta+Shift+z');
    await expect.poll(() => getTrackOrder(modal)).not.toEqual(initialOrder);
    await expect(modal).toContainText('10:00');
    await expect(modal).toContainText('11:00');
    await expect(modal).not.toContainText('15:30');
});

function assertDividerBetweenTracks(order) {
    const dividerIndex = order.indexOf('sec-divider-1');
    expect(dividerIndex).toBeGreaterThan(0);
    expect(dividerIndex).toBeLessThan(order.length - 1);
}
