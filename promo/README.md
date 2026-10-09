# Musche 60-second product film

The film records the real local Musche web app: original month/week calendar, REC musician sidebar, task pool, schedule blocks, and track-list modal. It seeds temporary sample content in an isolated browser context, then performs the actual view switch, task-pool expansion, drag-to-schedule, and track-list open/close. The live app is placed in a layered 3D screen stage and filmed with oblique camera moves, parallax, and close-ups; no website source or user data is changed.

See `storyboard.md` for the shot plan. Start the project's Vite server, then render:

```sh
npm run dev -- --host 127.0.0.1 --configLoader runner
node promo/render.mjs                    # 1920x1080, promo/musche-film-60s.mp4
node promo/render.mjs --4k               # 3840x2160, promo/musche-film-60s-4k.mp4
```
