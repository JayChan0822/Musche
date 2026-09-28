import assert from 'node:assert/strict';
import test from 'node:test';
import { AppSidebar } from '../app/scripts/components/app-sidebar.js';

test('EDIT task subtitle names its project rather than the recording musician', () => {
  const subtitle=AppSidebar.template.match(/<span class="text-\[9px\] opacity-50 truncate leading-tight mt-0\.5">([\s\S]*?)<\/span>/)?.[1];
  assert.ok(subtitle);
  assert.match(subtitle,/getNameById\(item.projectId, 'project'\)/);
  assert.doesNotMatch(subtitle,/musicianId/);
});
