import React from 'react'
import Routing from './router/Routing'

// App is just a small wrapper that shows our Routing component.
// Routing decides which "page" to show based on the URL.
function App() {
  return (
    <div>
      <Routing />
    </div>
  )
}

export default App
