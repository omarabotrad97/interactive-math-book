import test from 'node:test';
import assert from 'node:assert/strict';
import {
  isAllowedCorsOrigin,
  isStaticPagesHost,
  normalizeAiApiBase,
  parseAllowedOrigins,
  resolveAiApiUrl,
  resolveLiveWsUrl
} from './tutor-api-config';

test('normalizeAiApiBase accepts https and localhost http and strips trailing slashes', () => {
  assert.equal(normalizeAiApiBase('https://math-api.example.com/'), 'https://math-api.example.com');
  assert.equal(normalizeAiApiBase('https://math-api.example.com/v1///'), 'https://math-api.example.com/v1');
  assert.equal(normalizeAiApiBase('http://localhost:3000/'), 'http://localhost:3000');
  assert.equal(normalizeAiApiBase('http://127.0.0.1:8080'), 'http://127.0.0.1:8080');
});

test('normalizeAiApiBase rejects insecure or malformed origins', () => {
  assert.equal(normalizeAiApiBase(''), '');
  assert.equal(normalizeAiApiBase('http://insecure.example.com'), '');
  assert.equal(normalizeAiApiBase('javascript:alert(1)'), '');
  assert.equal(normalizeAiApiBase('data:text/html,hi'), '');
  assert.equal(normalizeAiApiBase('not a url'), '');
});

test('resolveAiApiUrl handles same-origin and external backend bases', () => {
  assert.equal(resolveAiApiUrl('/api/ai/chat', ''), '/api/ai/chat');
  assert.equal(resolveAiApiUrl('api/ai/health', ''), '/api/ai/health');
  assert.equal(
    resolveAiApiUrl('/api/ai/chat', 'https://tutor.example.run.app/'),
    'https://tutor.example.run.app/api/ai/chat'
  );
  assert.equal(
    resolveAiApiUrl('/api/ai/quiz', 'https://tutor.example.run.app/math/'),
    'https://tutor.example.run.app/math/api/ai/quiz'
  );
});

test('resolveLiveWsUrl derives wss/ws URL from external API base or window location', () => {
  assert.equal(
    resolveLiveWsUrl({ protocol: 'https:', host: 'omarabotrad97.github.io' }, 'https://tutor.example.run.app'),
    'wss://tutor.example.run.app/ws/live'
  );
  assert.equal(
    resolveLiveWsUrl({ protocol: 'https:', host: 'omarabotrad97.github.io' }, 'http://localhost:3000'),
    'ws://localhost:3000/ws/live'
  );
  assert.equal(
    resolveLiveWsUrl({ protocol: 'http:', host: 'localhost:3000' }, ''),
    'ws://localhost:3000/ws/live'
  );
  assert.equal(
    resolveLiveWsUrl({ protocol: 'https:', host: 'my-app.run.app' }, ''),
    'wss://my-app.run.app/ws/live'
  );
});

test('isStaticPagesHost detects GitHub Pages and static hosts without false positives', () => {
  assert.equal(isStaticPagesHost('omarabotrad97.github.io', 'https:'), true);
  assert.equal(isStaticPagesHost('demo.pages.dev', 'https:'), true);
  assert.equal(isStaticPagesHost('', 'file:'), true);
  assert.equal(isStaticPagesHost('localhost', 'http:'), false);
  assert.equal(isStaticPagesHost('my-service.europe-west1.run.app', 'https:'), false);
});

test('isAllowedCorsOrigin allows GitHub Pages, localhost, and configured ALLOWED_ORIGINS only', () => {
  assert.equal(isAllowedCorsOrigin('https://omarabotrad97.github.io'), true);
  assert.equal(isAllowedCorsOrigin('http://localhost:3000'), true);
  assert.equal(isAllowedCorsOrigin('http://127.0.0.1:3000'), true);
  assert.equal(isAllowedCorsOrigin('https://evil.example.com'), false);
  assert.equal(isAllowedCorsOrigin(undefined), false);

  const extra = 'https://school.example.edu, http://unsafe.example.com, https://math.example.org/';
  assert.equal(isAllowedCorsOrigin('https://school.example.edu', extra), true);
  assert.equal(isAllowedCorsOrigin('https://math.example.org', extra), true);
  assert.equal(isAllowedCorsOrigin('http://unsafe.example.com', extra), false);
  assert.ok(parseAllowedOrigins(extra).includes('https://math.example.org'));
});
