# Guia de Instalação do Seite2 no ZimaOS / CasaOS

Este guia fornece o passo a passo para implantar a aplicação **Seite2** no servidor **ZimaOS** (ou CasaOS).

---

## 📌 Requisitos Prévios
- ZimaOS instalado e rodando na sua rede local.
- Acesso SSH ou terminal ao ZimaOS (ou utilização do recurso de Custom App / Importar Docker Compose na interface web).

---

## 🚀 Método 1: Instalação via Terminal (Recomendado)

1. **Acessar o ZimaOS via SSH:**
   ```bash
   ssh root@<IP_DO_ZIMAOS>
   ```

2. **Clonar ou copiar o repositório na pasta AppData:**
   ```bash
   cd /DATA/AppData
   git clone <URL_DO_SEU_REPOSITORIO_GIT> seite2
   cd seite2
   ```

3. **Criar o arquivo de ambiente (.env):**
   ```bash
   cp .env.example .env
   ```

4. **Compilar e Iniciar a Aplicação:**
   ```bash
   docker compose up -d --build
   ```

5. **Acessar o Sistema:**
   - **Interface Principal (Frontend):** `http://<IP_DO_ZIMAOS>:8080`
   - **Documentação da API (FastAPI Swagger):** `http://<IP_DO_ZIMAOS>:8080/docs`
   - **Gerenciador MinIO (Arquivos):** `http://<IP_DO_ZIMAOS>:9001` (Usuário: `minioadmin` | Senha: `minioadmin`)

---

## 🖥️ Método 2: Instalação via Interface Gráfica (Dashboard ZimaOS)

1. Abra o painel do ZimaOS no seu navegador.
2. Clique no ícone `+` (Adicionar aplicativo) e escolha **Custom App** (Aplicativo Personalizado).
3. Selecione a opção **Import** no canto superior direito e cole o conteúdo do arquivo `docker-compose.yml`.
4. Garanta que o caminho do código esteja apontando para a pasta correta no ZimaOS (`/DATA/AppData/seite2`).
5. Clique em **Submit** / **Save** para construir e iniciar o aplicativo.

---

## 🛠️ Solução de Problemas Comuns

- **Porta em uso (`port is already allocated`):**
  O ZimaOS usa a porta `80` por padrão. O projeto foi configurado para usar a porta **8080** no Nginx. Se precisar alterar a porta, edite o arquivo `.env` adicionando:
  ```env
  HTTP_PORT=8085
  ```
- **Verificar Logs dos Containers:**
  ```bash
  docker compose logs -f
  ```
- **Reiniciar os serviços:**
  ```bash
  docker compose restart
  ```
