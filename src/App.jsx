import { useState } from 'react'
import Buttons from './components/Buttons'
import Header from './components/Header'
import Tables from './components/Tables'
import Manual from './components/Manual';

function App() {
  const [updatedTables, setUpdatedTables] = useState(null);

  return (
    <>
      <Header/>
      <Tables updatedTables={updatedTables}/>
      <Manual/>
      <Buttons setUpdatedTables={setUpdatedTables}/>
    </>
  )
}

export default App;
