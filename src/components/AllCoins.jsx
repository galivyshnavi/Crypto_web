
import React, { useEffect, useRef, useState, useCallback } from 'react'
import { getMarkets, getCoinById } from '../services/coingecko'
import useDebounce from '../hooks/useDebounce'

function SkeletonRow(){
  return (
    <tr className="border-t">
      <td className="py-3 px-4"><div className="w-6 h-4 skeleton rounded"></div></td>
      <td className="py-3 px-4"><div className="w-40 h-4 skeleton rounded"></div></td>
      <td className="py-3 px-4"><div className="w-24 h-4 skeleton rounded"></div></td>
      <td className="py-3 px-4"><div className="w-20 h-4 skeleton rounded"></div></td>
      <td className="py-3 px-4"><div className="w-28 h-4 skeleton rounded"></div></td>
      <td className="py-3 px-4"><div className="w-28 h-4 skeleton rounded"></div></td>
    </tr>
  )
}

export default function AllCoins(){
  const [coins, setCoins] = useState([])
  const [page, setPage] = useState(1)
  const [perPage, setPerPage] = useState(50)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [search, setSearch] = useState('')
  const [order, setOrder] = useState('market_cap_desc')
  const debouncedSearch = useDebounce(search, 400)
  const debouncedOrder = useDebounce(order, 250)
  const requestIdRef = useRef(0)

  const [selectedCoin, setSelectedCoin] = useState(null)
  const [detailOpen, setDetailOpen] = useState(false)

  const loadPage = useCallback(async (p)=>{
    const reqId = ++requestIdRef.current
    try{
      setLoading(true)
      setError(null)
      const data = await getMarkets({ page: p, perPage, search: debouncedSearch, order: debouncedOrder })
      if(reqId !== requestIdRef.current) return
      setCoins(data)
    } catch(err){
      console.error(err)
      setError('Failed to load market data.')
    } finally {
      if(reqId === requestIdRef.current) setLoading(false)
    }
  }, [perPage, debouncedSearch, debouncedOrder])

  useEffect(()=>{
    setPage(1)
    loadPage(1)
  }, [perPage, debouncedSearch, debouncedOrder, loadPage])

  useEffect(()=>{
    loadPage(page)
  }, [page, loadPage])

  async function openDetails(id){
    try{
      setDetailOpen(true)
      const data = await getCoinById(id)
      setSelectedCoin(data)
    } catch (err){
      console.error(err)
      setSelectedCoin(null)
    }
  }

  return (
    <div className="bg-white border rounded shadow p-4">
      <div className="flex flex-wrap items-center justify-between mb-4 gap-4">
        <div className="flex items-center gap-2">
          <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search by name or symbol" className="border px-3 py-2 rounded w-72" />
          <select value={order} onChange={e=>setOrder(e.target.value)} className="border px-2 py-2 rounded">
            <option value="market_cap_desc">Market Cap ↓</option>
            <option value="market_cap_asc">Market Cap ↑</option>
            <option value="volume_desc">Volume ↓</option>
            <option value="volume_asc">Volume ↑</option>
            <option value="price_desc">Price ↓</option>
            <option value="price_asc">Price ↑</option>
            <option value="change_desc">24h change ↓</option>
            <option value="change_asc">24h change ↑</option>
          </select>
          <select value={perPage} onChange={e=>setPerPage(Number(e.target.value))} className="border px-2 py-2 rounded">
            <option value={10}>10 / page</option>
            <option value={20}>20 / page</option>
            <option value={50}>50 / page</option>
          </select>
        </div>
        <div className="text-sm text-gray-600">Page {page}</div>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full bg-white">
          <thead>
            <tr className="bg-gray-100 text-left">
              <th className="py-2 px-4">Rank</th>
              <th className="py-2 px-4">Name</th>
              <th className="py-2 px-4">Price</th>
              <th className="py-2 px-4">24h Change</th>
              <th className="py-2 px-4">Market Cap</th>
              <th className="py-2 px-4">Volume</th>
            </tr>
          </thead>
          <tbody>
            {coins.map(coin => (
              <tr key={coin.id} className="border-t hover:bg-gray-50 cursor-pointer" onClick={()=>openDetails(coin.id)}>
                <td className="py-3 px-4">{coin.market_cap_rank}</td>
                <td className="py-3 px-4 flex items-center gap-2">
                  <img src={coin.image} alt={coin.symbol} className="w-6 h-6" />
                  <div>
                    <div className="font-medium">{coin.name}</div>
                    <div className="text-xs text-gray-500">{coin.symbol.toUpperCase()}</div>
                  </div>
                </td>
                <td className="py-3 px-4">${coin.current_price?.toLocaleString()}</td>
                <td className={`py-3 px-4 ${coin.price_change_percentage_24h >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {coin.price_change_percentage_24h?.toFixed(2)}%
                </td>
                <td className="py-3 px-4">${coin.market_cap?.toLocaleString()}</td>
                <td className="py-3 px-4">${coin.total_volume?.toLocaleString()}</td>
              </tr>
            ))}
            {loading && Array.from({length: perPage}).map((_,i)=>(<SkeletonRow key={i} />))}
          </tbody>
        </table>
      </div>

      <div className="flex justify-between items-center mt-4">
        <button disabled={page<=1 || loading} onClick={()=>setPage(p=>Math.max(1,p-1))} className="px-3 py-1 bg-gray-200 rounded disabled:opacity-50">Prev</button>
        {error && (
          <div className="text-red-600 flex items-center gap-2">
            <div>{error}</div>
            <button className="px-2 py-1 bg-gray-200 rounded" onClick={()=>{ setError(null); loadPage(page) }}>Retry</button>
          </div>
        )}
        <button disabled={loading || coins.length<perPage} onClick={()=>setPage(p=>p+1)} className="px-3 py-1 bg-gray-200 rounded disabled:opacity-50">Next</button>
      </div>

      {!loading && !error && coins.length === 0 && (
        <div className="mt-4 text-gray-600">No results. Try a different search.</div>
      )}

      {/* Detail modal */}
      {detailOpen && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50" onClick={()=> setDetailOpen(false)}>
          <div className="bg-white rounded shadow p-4 w-11/12 max-w-2xl" onClick={(e)=>e.stopPropagation()}>
            <div className="flex justify-between items-start">
              <h2 className="text-lg font-bold">{selectedCoin?.name || 'Loading...'}</h2>
              <button onClick={()=> setDetailOpen(false)} className="text-gray-600">Close</button>
            </div>
            {selectedCoin ? (
              <div className="mt-3 grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <img src={selectedCoin.image?.large} alt={selectedCoin.id} className="w-20 h-20" />
                  <div className="mt-2">Symbol: {selectedCoin.symbol?.toUpperCase()}</div>
                  <div>Rank: {selectedCoin.market_cap_rank}</div>
                </div>
                <div>
                  <div>Current Price: ${selectedCoin.market_data?.current_price?.usd?.toLocaleString()}</div>
                  <div>Market Cap: ${selectedCoin.market_data?.market_cap?.usd?.toLocaleString()}</div>
                  <div>24h Change: {selectedCoin.market_data?.price_change_percentage_24h?.toFixed(2)}%</div>
                  <div className="mt-2 text-sm text-gray-600">Description (short):</div>
                  <div className="text-xs text-gray-700 max-h-40 overflow-auto" dangerouslySetInnerHTML={{__html: selectedCoin.description?.en?.slice(0,800) || 'No description'}} />
                </div>
              </div>
            ) : (
              <div className="mt-3">Loading...</div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
