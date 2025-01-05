import React from 'react'
import ReactDOM from 'react-dom/client'
import { Offline, Online } from 'react-detect-offline'
import Alert from 'antd/es/alert/Alert'

import App from './components/app/index'

const rootElement = document.querySelector('.movie-app')
ReactDOM.createRoot(rootElement).render(
  <>
    <Online>
      <App />
    </Online>
    <Offline>
      <Alert message="Error" description="ERROR OFFLINE MODE" type="error" showIcon />
    </Offline>
  </>
)
