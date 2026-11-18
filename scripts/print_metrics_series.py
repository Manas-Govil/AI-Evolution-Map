import pandas as pd
import io
import httpx

# 1. Investment
u_inv = "https://ourworldindata.org/grapher/private-investment-in-artificial-intelligence.csv?v=1&csvType=full&useColumnShortNames=false"
df_inv = pd.read_csv(io.StringIO(httpx.get(u_inv, follow_redirects=True).text))
world_inv = df_inv[(df_inv['Entity'] == 'World') & (df_inv['Year'] >= 2013) & (df_inv['Year'] <= 2023)].copy()
col_inv = [c for c in world_inv.columns if 'investment' in c.lower()][0]
world_inv['usd_billions'] = world_inv[col_inv] / 1e9

print("=== World Private AI Investment (2013-2023) ===")
print(world_inv[['Year', col_inv, 'usd_billions']])

# 2. Notable AI Systems by Affiliation
u_aff = "https://ourworldindata.org/grapher/affiliation-researchers-building-artificial-intelligence-systems-all.csv?v=1&csvType=full&useColumnShortNames=false"
df_aff = pd.read_csv(io.StringIO(httpx.get(u_aff, follow_redirects=True).text))
col_aff = [c for c in df_aff.columns if 'annual' in c.lower() or 'systems' in c.lower()][0]

pivot_aff = df_aff[(df_aff['Year'] >= 2013) & (df_aff['Year'] <= 2023)].pivot(index='Year', columns='Entity', values=col_aff).fillna(0)
pivot_aff['Total_Notable_Systems'] = pivot_aff.sum(axis=1)

print("\n=== Notable AI Systems by Sector (2013-2023) ===")
print(pivot_aff[['Industry', 'Academia', 'Academia and industry collaboration', 'Total_Notable_Systems']])
