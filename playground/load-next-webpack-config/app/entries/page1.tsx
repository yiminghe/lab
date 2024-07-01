import React, { Suspense } from 'react';
import { createRoot } from 'react-dom/client';
import '../styles/global.css';

const Dynamic = React.lazy(() => import('./dynamic'));

const domNode = document.createElement('div');
document.body.appendChild(domNode);
const root = createRoot(domNode);

root.render(
  <>
    <div className="text-orange-500">1</div>
    <Suspense fallback={<div>Loading...</div>}>
      <Dynamic />
    </Suspense>
  </>,
);
