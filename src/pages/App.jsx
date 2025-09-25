import React from 'react'
import Header from '../components/Header'
import AllCoins from '../components/AllCoins'
import Highlights from '../components/Highlights'

export default function App() {
  return (
    <div className="min-h-screen p-6">
      <Header />
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <div className="lg:col-span-3">
          <AllCoins />
        </div>
        <div className="lg:col-span-1">
          <Highlights />
        </div>
      </div>
    </div>
  )
}

