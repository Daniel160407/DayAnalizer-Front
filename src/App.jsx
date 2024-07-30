import { useState } from 'react'
import Buttons from './components/Buttons'
import Header from './components/Header'
import Tables from './components/Tables'

function App() {
  const [updatedTables, setUpdatedTables] = useState(null);

  return (
    <>
      <Header/>
      <Tables updatedTables={updatedTables}/>
      <Buttons setUpdatedTables={setUpdatedTables}/>
    </>
  )
}

export default App;
