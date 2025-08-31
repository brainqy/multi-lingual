// src/__mocks__/lucide-react.js
// This file is used by Jest to mock the lucide-react library.
// Instead of rendering complex SVG icons, we render a simple placeholder.
const React = require('react');

const lucideReact = jest.createMockFromModule('lucide-react');

// The library uses a proxy for its icons, so we need to mock that behavior.
// We'll create a proxy that returns a simple React component for any icon name.
const iconMock = new Proxy({}, {
  get: (target, a, receiver) => {
    // The icon name is the property being accessed (e.g., 'FileText')
    const Component = (props) => React.createElement(
      'svg',
      { ...props, 'data-lucide-icon': a },
      null // No children for the SVG
    );
    Component.displayName = a;
    return Component;
  },
});

module.exports = {
  ...lucideReact,
  ...iconMock,
};
