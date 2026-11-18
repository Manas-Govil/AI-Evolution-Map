import httpx
import pandas as pd
import io

url = "https://ourworldindata.org/grapher/affiliation-researchers-building-artificial-intelligence-systems-all.csv?v=1&csvType=full&useColumnShortNames=false"
r = httpx.get(url, timeout=15.0, follow_redirects=True)
print("Status:", r.status_code)
df = pd.read_csv(io.StringIO(r.text))
print("Columns:", df.columns.tolist())
print("Entities:", df['Entity'].unique().tolist())
print("Years range:", df['Year'].min(), "to", df['Year'].max())
print("\nSample (2013-2023):")
sample = df[(df['Year'] >= 2013) & (df['Year'] <= 2023)]
print(sample.head(20))
