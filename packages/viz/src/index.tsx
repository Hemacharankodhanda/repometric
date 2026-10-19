import React from 'react';
import { CORE_VERSION } from '@repometric/core';

export interface VisualizerStubProps {
  label?: string;
}

export const VisualizerStub: React.FC<VisualizerStubProps> = ({ label = 'Visualizer' }) => {
  return (
    <div data-testid="visualizer-stub">
      <h3>{label}</h3>
      <p>Core version: {CORE_VERSION}</p>
    </div>
  );
};

export const VIZ_VERSION = '0.1.0';

export * from './colors';
export * from './RepoMap';
