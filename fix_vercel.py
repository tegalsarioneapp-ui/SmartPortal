content = """{
  "outputDirectory": "dist",
  "buildCommand": "mkdir -p dist && cp -r public/. dist/",
  "installCommand": "echo skip",
  "rewrites": [
    {
      "source": "/api/(.*)",
      "destination": "https://smartportal-production.up.railway.app/api/$1"
    }
  ]
}"""

open("artifacts/smart-portal-rt/vercel.json", "w", encoding="utf-8").write(content)
print("OK")
print(open("artifacts/smart-portal-rt/vercel.json", "r", encoding="utf-8").read())