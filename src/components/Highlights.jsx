import React, { useEffect, useState } from 'react'
import { getMarkets, getTrending } from '../services/coingecko'

export default function Highlights(){
  const [topGainers, setTopGainers] = useState([])
  const [topLosers, setTopLosers] = useState([])
  const [trending, setTrending] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(()=>{
    async function load(){
      setLoading(true)
      try{
        // fetch first page (top market cap) and compute gainers/losers
        const markets = await getMarkets({ page: 1, perPage: 250 })
        const sortedByChange = [...markets].sort((a,b)=> (b.price_change_percentage_24h || 0) - (a.price_change_percentage_24h || 0))
        setTopGainers(sortedByChange.slice(0,5))
        setTopLosers(sortedByChange.slice(-5).reverse())
        const t = await getTrending()
        setTrending(t.map(item=> item.item ))
      } catch(err){
        console.error(err)
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  if(loading) return <div className="bg-white border rounded shadow p-4">Loading highlights...</div>

  return (
    <div className="space-y-4">
      <div className="bg-white border rounded shadow p-4">
        <h3 className="font-semibold mb-2">Top Gainers (24h)</h3>
        <ul className="space-y-2">
          {topGainers.map(c=> (
            <li key={c.id} className="flex items-center justify-between">
              <div className="flex items-center gap-2"><img src={c.image} className="w-6 h-6" alt="" />{c.symbol.toUpperCase()}</div>
              <div className="text-green-600">{c.price_change_percentage_24h?.toFixed(2)}%</div>
            </li>
          ))}
        </ul>
      </div>

      <div className="bg-white border rounded shadow p-4">
        <h3 className="font-semibold mb-2">Top Losers (24h)</h3>
        <ul className="space-y-2">
          {topLosers.map(c=> (
            <li key={c.id} className="flex items-center justify-between">
              <div className="flex items-center gap-2"><img src={c.image} className="w-6 h-6" alt="" />{c.symbol.toUpperCase()}</div>
              <div className="text-red-600">{c.price_change_percentage_24h?.toFixed(2)}%</div>
            </li>
          ))}
        </ul>
      </div>

      <div className="bg-white border rounded shadow p-4">
        <h3 className="font-semibold mb-2">Trending</h3>
        <ul className="space-y-2">
          {trending.map(t=> (
            <li key={t.id} className="flex items-center gap-2">
              <img src={t.small} className="w-6 h-6" alt="" />
              <div>
                <div className="font-medium">{t.name}</div>
                <div className="text-xs text-gray-500">{t.symbol.toUpperCase()}</div>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </div>
  )
}

