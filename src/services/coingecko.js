
import axios from 'axios'

const BASE_URL = import.meta.env.VITE_COINGECKO_BASE_URL || 'https://api.coingecko.com/api/v3'

// Simple in-memory cache to reduce duplicate requests during a session
const cache = new Map()

async function cachedGet(key, fn){
  if(cache.has(key)) return cache.get(key)
  const res = await fn()
  cache.set(key, res)
  return res
}

// helper client-side sorters
function applyOrder(data, order){
  if(!order) return data
  const d = [...data]
  switch(order){
    case 'market_cap_desc': return d.sort((a,b)=> (b.market_cap || 0) - (a.market_cap || 0))
    case 'market_cap_asc': return d.sort((a,b)=> (a.market_cap || 0) - (b.market_cap || 0))
    case 'volume_desc': return d.sort((a,b)=> (b.total_volume || 0) - (a.total_volume || 0))
    case 'volume_asc': return d.sort((a,b)=> (a.total_volume || 0) - (b.total_volume || 0))
    case 'price_desc': return d.sort((a,b)=> (b.current_price || 0) - (a.current_price || 0))
    case 'price_asc': return d.sort((a,b)=> (a.current_price || 0) - (b.current_price || 0))
    case 'change_desc': return d.sort((a,b)=> (b.price_change_percentage_24h || 0) - (a.price_change_percentage_24h || 0))
    case 'change_asc': return d.sort((a,b)=> (a.price_change_percentage_24h || 0) - (b.price_change_percentage_24h || 0))
    default: return data
  }
}

export async function getMarkets({ page=1, perPage=30, currency='usd', search='', order='market_cap_desc' } = {}){
  const url = `${BASE_URL}/coins/markets`
  const params = {
    vs_currency: currency,
    order: 'market_cap_desc', // keep default server-side ordering stable, do client-side sorting for custom options
    per_page: perPage,
    page,
    price_change_percentage: '24h,7d',
    sparkline: false,
  }
  const key = `markets:${JSON.stringify({page,perPage,currency,search,order})}`
  return cachedGet(key, async ()=>{
    const { data } = await axios.get(url, { params })
    // client-side filter by name/symbol when search is provided
    let filtered = data
    if(search){
      const q = search.toLowerCase()
      filtered = data.filter(c => c.name.toLowerCase().includes(q) || c.symbol.toLowerCase().includes(q))
    }
    // apply client-side ordering (to avoid sending unsupported order params to CoinGecko)
    const ordered = applyOrder(filtered, order)
    return ordered
  })
}

export async function getTrending(){
  const url = `${BASE_URL}/search/trending`
  return cachedGet('trending', async ()=>{
    const { data } = await axios.get(url)
    return data.coins || []
  })
}

export async function getCoinById(id){
  const url = `${BASE_URL}/coins/${id}`
  return cachedGet(`coin:${id}`, async ()=>{
    const { data } = await axios.get(url, { params: { localization: false, tickers: false, market_data: true, community_data: false, developer_data: false, sparkline: false } })
    return data
  })
}
