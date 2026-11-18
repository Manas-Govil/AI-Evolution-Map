import httpx
import json

url = "https://ourworldindata.org/grapher/private-investment-in-artificial-intelligence.metadata.json?v=1&csvType=full&useColumnShortNames=false"
resp = httpx.get(url, follow_redirects=True, timeout=15.0)
meta = resp.json()

print("Title:", meta.get("chart", {}).get("title"))
print("Subtitle:", meta.get("chart", {}).get("subtitle"))
print("Source:", meta.get("chart", {}).get("sourceDesc"))

columns = meta.get("columns", {})
for col_id, col_info in columns.items():
    print(f"Column {col_id}: {col_info.get('name')} | Unit: {col_info.get('unit')}")
    if col_info.get("descriptionShort"):
        print(f"  Short description: {col_info.get('descriptionShort')}")
    if col_info.get("descriptionKey"):
        print(f"  Key description: {col_info.get('descriptionKey')}")
