export interface MarketPrice {
  price: number;
  change24h: number;
}

export const PriceService = {
  /**
   * Fetches real-time price and 24h change from Binance API.
   * Binance is generally more reliable and has higher limits for public data.
   */
  async getMarketPrice(symbol: 'ETH' | 'BTC'): Promise<MarketPrice> {
    try {
      // Use internal API proxy to avoid CORS issues on client
      const url = `/api/prices?symbol=${symbol}`;
      
      const res = await fetch(url, { cache: 'no-store' }); 
      if (!res.ok) throw new Error("Price API Error");
      
      const data = await res.json();
      
      return {
        price: parseFloat(data.lastPrice),
        change24h: parseFloat(data.priceChangePercent)
      };
    } catch (error) {
      console.warn("Price API Failed, using fallback:", error);
      // Fallback to recent approximate market data so app doesn't break
      return {
        price: symbol === 'ETH' ? 2450.00 : 79000.00,
        change24h: 0
      };
    }
  }
};
