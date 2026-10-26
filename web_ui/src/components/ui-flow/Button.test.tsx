import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Button } from './Button';

describe('Button', () => {
  it('renders primary in the applift brand red', () => {
    render(<Button variant="primary">New Investigation</Button>);
    const btn = screen.getByRole('button', { name: 'New Investigation' });
    expect(btn.className).toMatch(/rounded-xl/);
    expect(btn.className).toMatch(/bg-brand/);
    expect(btn.className).not.toMatch(/translate/);
  });
});
