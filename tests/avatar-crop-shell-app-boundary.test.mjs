import test from 'node:test';
import assert from 'node:assert/strict';
import {
  assertNoAppImport,
  assertNoAppRegistration,
  appDependenciesModule,
  appFeatureLoadersModule,
  appScript,
} from './helpers/app-boundary-assertions.mjs';

test('app bootstrap delegates avatar crop imports without the pass-through shell', () => {
  assertNoAppImport({
    modulePath: './features/avatar-crop.js',
    label: 'avatar crop feature',
  });
  assertNoAppImport({
    modulePath: './features/avatar-crop-shell.js',
    label: 'the pass-through avatar crop shell feature',
  });
  assertNoAppRegistration({
    registerPattern: /registerAvatarCropShellFeature\(/,
    label: 'the pass-through avatar crop shell feature',
  });
});

test('app bootstrap keeps Cropper support inside the avatar crop feature loader boundary', () => {
  assert.match(
    appDependenciesModule,
    /createAppFeatureLoaders\(\{[\s\S]*cropperSupport:\s*supportLoaders\.loadCropper[\s\S]*\}\)/,
    'app dependencies should inject Cropper support into the avatar crop feature loader registry',
  );
  assert.match(
    appFeatureLoadersModule,
    /createAvatarCropFeatureLoader\(\{\s*loadCropper:\s*cropperSupport\s*\}\)/,
    'app feature loader registry should pass Cropper support to the avatar crop feature loader',
  );
  assert.doesNotMatch(
    appScript,
    /\bloadCropper\b[\s\S]*=\s*createAppDependencies\(\);/,
    'app.js should not unpack avatar-crop-only Cropper support from the root dependency registry',
  );
  assert.doesNotMatch(
    appScript,
    /registerAvatarCropFeature\(\{[\s\S]*\bloadCropper\b[\s\S]*\}\)/,
    'app.js should not manually pass Cropper support into avatar crop registration',
  );
});

test('app bootstrap proxies avatar crop handlers through the shared lazy feature proxy', () => {
  assert.match(
    appScript,
    /const\s+avatarCropFeatureProxy\s*=\s*wireAvatarCropFeature\(assembly[\s\S]*const\s+onFileSelect\s*=\s*avatarCropFeatureProxy\.method\('onFileSelect'\);[\s\S]*const\s+cancelCrop\s*=\s*avatarCropFeatureProxy\.method\('cancelCrop'\);[\s\S]*const\s+confirmCrop\s*=\s*avatarCropFeatureProxy\.method\('confirmCrop'\);/,
    'app.js should use the shared lazy feature proxy for avatar crop handlers',
  );
  assert.doesNotMatch(
    appScript,
    /avatarCropFeaturePromise|getAvatarCropFeature/,
    'app.js should not keep hand-rolled avatar crop lazy proxy variables',
  );
});
