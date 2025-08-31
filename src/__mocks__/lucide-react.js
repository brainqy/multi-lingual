// src/__mocks__/lucide-react.js
// This file is used by Jest to manually mock the lucide-react library.
// Instead of rendering complex SVG icons, we render a simple placeholder.
const React = require('react');

// The library uses a proxy for its icons, so we need to mock that behavior.
// We'll create a proxy that returns a simple React component for any icon name.
const iconMock = new Proxy({}, {
  get: (target, a) => {
    // The icon name is the property being accessed (e.g., 'FileText')
    const Component = (props) => React.createElement(
      'svg',
      { ...props, 'data-lucide-icon': a.toString() },
      null // No children for the SVG
    );
    Component.displayName = a.toString();
    return Component;
  },
});

module.exports = iconMock;
