import '@testing-library/jest-dom';
import { vi } from 'vitest';

// Mock localStorage
const localStorageMock = {
    getItem: vi.fn(),
    setItem: vi.fn(),
    clear: vi.fn(),
    removeItem: vi.fn(),
    length: 0,
    key: vi.fn(),
};
global.localStorage = localStorageMock;

// Mock window.requestAnimationFrame
global.requestAnimationFrame = vi.fn((callback) => setTimeout(callback, 0));
global.cancelAnimationFrame = vi.fn((id) => clearTimeout(id)); 