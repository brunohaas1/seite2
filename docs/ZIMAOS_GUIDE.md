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

2. **Clonar ou acessar o repositório na pasta AppData:**
   ```bash
   cd /DATA/AppData/seite2
   git pull origin master
   ```

3. **Criar o arquivo de ambiente (.env):**
   ```bash
   cp .env.example .env
   ```

4. **Definir DOCKER_CONFIG (Necessário porque a raiz `/root` do ZimaOS é read-only):**
   ```bash
   export DOCKER_CONFIG=/tmp/.docker
   mkdir -p /tmp/.docker
   ```

5. **Compilar e Iniciar a Aplicação:**
   ```bash
   DOCKER_CONFIG=/tmp/.docker docker-compose up -d --build
   ```
   *(Ou se o seu sistema usar o plugin v2: `DOCKER_CONFIG=/tmp/.docker docker compose up -d --build`)*

6. **Acessar o Sistema:**
   - **Interface Principal (Frontend):** `http://<IP_DO_ZIMAOS>:8080`
   - **Documentação da API (FastAPI Swagger):** `http://<IP_DO_ZIMAOS>:8080/docs`
   - **Gerenciador MinIO (Arquivos):** `http://<IP_DO_ZIMAOS>:9001` (Usuário: `minioadmin` | Senha: `minioadmin`)

---

## 🛠️ Solução de Erros Específicos do ZimaOS

- **`mkdir /root/.docker: read-only file system`**:
  O ZimaOS possui o sistema de arquivos da raiz como somente leitura (`read-only`). Defina a variável de ambiente executando:
  ```bash
  export DOCKER_CONFIG=/tmp/.docker
  ```


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
