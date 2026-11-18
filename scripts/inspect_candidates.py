import httpx
import pandas as pd
import io

# 1. Cumulative large-scale AI systems
url1 = "https://ourworldindata.org/grapher/cumulative-number-of-large-scale-ai-systems-by-country.csv?v=1&csvType=full&useColumnShortNames=false"
r1 = httpx.get(url1, follow_redirects=True, timeout=15.0)
df1 = pd.read_csv(io.StringIO(r1.text))
print("=== Cumulative number of large-scale AI systems by country ===")
print("Entities:", df1['Entity'].unique()[:10])
print("Years:", df1['Year'].min(), "to", df1['Year'].max())
world1 = df1[df1['Entity'].isin(['World', 'Total', 'United States', 'China'])]
print(world1.tail(15))

# Also check metadata
m1 = httpx.get("https://ourworldindata.org/grapher/cumulative-number-of-large-scale-ai-systems-by-country.metadata.json?v=1&csvType=full&useColumnShortNames=false", follow_redirects=True, timeout=15.0).json()
print("Metadata Title:", m1.get("chart", {}).get("title"))
col1 = list(m1.get("columns", {}).keys())[-1]
print("Column desc:", m1.get("columns", {}).get(col1, {}).get("descriptionShort"))
