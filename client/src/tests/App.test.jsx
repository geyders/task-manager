import { render, screen } from '@testing-library/react';
import { test, expect } from 'vitest';
import App from '../App';

test('displays Task Manager title', () => {
  render(<App />);
  expect(screen.getByText('Task Manager')).toBeInTheDocument();
});