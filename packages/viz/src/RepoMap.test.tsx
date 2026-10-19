import { describe, expect, it } from 'vitest';
import { renderToString } from 'react-dom/server';
import { RepoMap } from './RepoMap';
import { mockFiles } from '@repometric/core';

describe('RepoMap (T3.1)', () => {
  it('renders RepoMap with controls, legend and table toggle', () => {
    const html = renderToString(<RepoMap files={mockFiles} />);
    expect(html).toContain('Size:');
    expect(html).toContain('tile area = file size in bytes');
    expect(html).toContain('Language');
    expect(html).toContain('Table');
  });
});
