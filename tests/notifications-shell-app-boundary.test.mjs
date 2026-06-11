import test from 'node:test';
import assert from 'node:assert/strict';
import {
  appScript,
  assertNoAppImport,
  assertNoAppRegistration,
} from './helpers/app-boundary-assertions.mjs';

test('app bootstrap delegates notification feature imports without the pass-through shell', () => {
  assertNoAppImport({
    modulePath: './features/notifications.js',
    label: 'notifications feature',
  });
  assertNoAppImport({
    modulePath: './features/notifications-shell.js',
    label: 'the pass-through notifications shell feature',
  });
  assertNoAppRegistration({
    registerPattern: /registerNotificationsShellFeature\(/,
    label: 'the pass-through notifications shell feature',
  });
});

test('app bootstrap proxies notification handlers through the shared lazy feature proxy', () => {
  assert.match(
    appScript,
    /const\s+notificationsFeatureProxy\s*=\s*wireNotificationsFeature\(assembly[\s\S]*const\s+updateTaskNotification\s*=\s*notificationsFeatureProxy\.method\('updateTaskNotification'\);[\s\S]*const\s+scheduleReminder\s*=\s*notificationsFeatureProxy\.method\('scheduleReminder'\);/,
    'app.js must expose notification handlers through the shared lazy feature proxy',
  );
  assert.doesNotMatch(
    appScript,
    /notificationsFeaturePromise|getNotificationsFeature/,
    'app.js must not keep hand-rolled notifications lazy proxy variables',
  );
});
