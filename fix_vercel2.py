content = """{
  "outputDirectory": "dist",
  "buildCommand": "mkdir -p dist && cp -r public/. dist/",
  "installCommand": "echo skip",
  "routes": [
    {
      "src": "/api/(.*)",
      "dest": "https://smartportal-production.up.railway.app/api/$1",
      "methods": ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
      "headers": {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, PATCH, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type, Authorization"
      }
    },
    {
      "src": "/(.*)",
      "dest": "/index.html"
    }
  ]
}"""

open("artifacts/smart-portal-rt/vercel.json", "w", encoding="utf-8").write(content)
print("OK")
print(open("artifacts/smart-portal-rt/vercel.json", "r", encoding="utf-8").read())