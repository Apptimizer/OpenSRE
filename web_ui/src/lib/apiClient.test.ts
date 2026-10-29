import { describe, expect, it } from 'vitest';
import { readError } from './apiClient';

describe('readError', () => {
  it('handles a plain-text proxy error', async () => {
    const res = new Response('upstream connect error or disconnect/reset before headers', { status: 503 });
    expect(await readError(res, 'Failed to save')).toBe('Failed to save (HTTP 503). Please try again.');
  });

  it('unwraps config-service validation errors passed through as a string', async () => {
    const inner = JSON.stringify({
      detail: { message: 'Agent configuration validation failed', errors: ["Cannot disable 'AWS Agent'"] },
    });
    const res = new Response(JSON.stringify({ error: inner }), { status: 400 });
    expect(await readError(res, 'Failed to save')).toBe(
      "Agent configuration validation failed: Cannot disable 'AWS Agent'",
    );
  });

  it('keeps a plain error string', async () => {
    const res = new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401 });
    expect(await readError(res, 'Failed')).toBe('Unauthorized');
  });
});
