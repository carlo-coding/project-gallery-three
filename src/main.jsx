import React from 'react'
import ReactDOM from 'react-dom'
import App from './App';

import { Suspense } from 'react'

ReactDOM.render(
  <React.StrictMode>
    <Suspense fallback={null}>
    <App />
  </Suspense>
  </React.StrictMode>,
  document.getElementById('root')
)
