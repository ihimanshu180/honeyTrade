import requests
import os
import yfinance as yf

API_KEY = os.environ.get("ALPHA_VANTAGE_API_KEY")

# --- Alpha Vantage Fetcher ---
def price_fetcher_alpha(symbol):
    url = "https://www.alphavantage.co/query"
    params = {
        "apikey": API_KEY,
        "symbol": symbol,
        "function":"GLOBAL_QUOTE",
    }

    try:
        response = requests.get(url, params=params, timeout=10)
        data = response.json()
        return round(float(data["Global Quote"]["05. price"]), 2)
    except Exception as e:
        print(f"Error fetching {symbol}: {e}")
        return None


def price_fetcher_yahoo(symbol):
    try:
        stock = yf.Ticker(symbol)
        hist = stock.history(period="1d")
        if not hist.empty:
            price = hist["Close"].iloc[-1]
            return round(price, 2)
        else:
            print(f"No data for {symbol}")
            return None
    except Exception as e:
        print(f"Yahoo error fetching {symbol}: {e}")
        return None


def fetch_multiple_prices(symbols, source):
    result = {}
    for symbol in symbols:
        if source == "alpha":
            price = price_fetcher_alpha(symbol)
        else:
            price = price_fetcher_yahoo(symbol)
        result[symbol.upper()] = price if price else "Not found"
    return result


