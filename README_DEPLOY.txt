KAIRÓS - Deploy / CI (INSTRUÇÕES RÁPIDAS)

1) Criar um repositório no GitHub (ex: github.com/<your-username>/kairos)
   - No GitHub: New repository -> nome (ex: kairos)
   - NÃO marcar "create README" se você já tem arquivos locais; se marcar, vai ter conflito.

2) No seu PC, dentro de C:\Users\malak\Desktop\myapp execute:
   cd C:\Users\malak\Desktop\myapp
   git init
   git add .
   git commit -m "Initial commit: kairos v3.9.4"
   git branch -M main
   # substitua a URL abaixo pela URL do seu repo:
   git remote add origin https://github.com/<your-username>/<your-repo>.git
   git push -u origin main

3) GitHub Actions
   - O arquivo .github/workflows/ci-cd.yml foi adicionado; após o push o workflow irá rodar.
   - A job fará: npm ci, npm run smoke, build da imagem Docker e upload de artefatos.

4) Secrets recomendados (Settings → Secrets → Actions):
   - SUPABASE_URL
   - SUPABASE_SERVICE_ROLE_KEY
   - OPENAI_API_KEY
   - STRIPE_SECRET_KEY
   - OBS: GITHUB_TOKEN é provido automaticamente nas Actions.

5) Deploy sugerido (Render)
   - No Render.com: New → Web Service → Connect to GitHub → escolha seu repo.
   - Build command: npm ci --only=production
   - Start command: node server.js
   - Configure environment variables no painel do Render (não comitar .env ao repo).

6) Como verificar:
   - No Actions: veja logs do job (instalação, smoke, build)
   - Depois do deploy: curl https://<SEU-URL>/status

7) Nota de segurança:
   - Não comite segredos (.env). Use Secrets no GitHub e variáveis no Render.
