import httpx

url = "https://ourworldindata.org/grapher/affiliation-researchers-building-artificial-intelligence-systems-all.metadata.json?v=1&csvType=full&useColumnShortNames=false"
r = httpx.get(url, timeout=15.0, follow_redirects=True)
meta = r.json()
print("Title:", meta.get("chart", {}).get("title"))
print("Subtitle:", meta.get("chart", {}).get("subtitle"))
print("Source:", meta.get("chart", {}).get("sourceDesc"))
col_key = list(meta.get("columns", {}).keys())[-1]
print("Column name:", meta.get("columns", {}).get(col_key, {}).get("name"))
print("Description:", meta.get("columns", {}).get(col_key, {}).get("descriptionShort"))
