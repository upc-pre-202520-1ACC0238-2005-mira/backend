#!/bin/bash

# Script completo para desplegar Xantina Backend en GCP desde cero
# Ejecuta: bash deploy-gcp-completo.sh

set -e

# Colores
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

echo -e "${BLUE}╔════════════════════════════════════════════════════╗${NC}"
echo -e "${BLUE}║  Despliegue Automático de Xantina Backend en GCP  ║${NC}"
echo -e "${BLUE}╚════════════════════════════════════════════════════╝${NC}"
echo ""

# Verificar dependencias
check_dependencies() {
    echo -e "${YELLOW}🔍 Verificando dependencias...${NC}"
    
    if ! command -v gcloud &> /dev/null; then
        echo -e "${RED}❌ gcloud CLI no está instalado${NC}"
        echo "Instala desde: https://cloud.google.com/sdk/docs/install"
        exit 1
    fi
    
    if ! command -v docker &> /dev/null; then
        echo -e "${RED}❌ Docker no está instalado${NC}"
        exit 1
    fi
    
    echo -e "${GREEN}✅ Todas las dependencias están instaladas${NC}"
    echo ""
}

# Iniciar sesión en GCP
login_gcp() {
    echo -e "${YELLOW}🔐 Verificando autenticación en Google Cloud...${NC}"
    
    # Verificar si ya está autenticado
    if gcloud auth list --filter=status:ACTIVE --format="value(account)" | grep -q .; then
        ACTIVE_ACCOUNT=$(gcloud auth list --filter=status:ACTIVE --format="value(account)" | head -n1)
        echo -e "${GREEN}✅ Ya estás autenticado como: $ACTIVE_ACCOUNT${NC}"
        read -p "¿Quieres iniciar sesión con otra cuenta? (s/n): " cambiar_cuenta
        
        if [ "$cambiar_cuenta" = "s" ] || [ "$cambiar_cuenta" = "S" ]; then
            echo -e "${YELLOW}🔐 Iniciando sesión...${NC}"
            gcloud auth login
        fi
    else
        echo -e "${YELLOW}🔐 Iniciando sesión en Google Cloud...${NC}"
        gcloud auth login
    fi
    
    # Nota: Application Default Credentials son opcionales para Cloud Build
    # Para Cloud Build y Cloud Run solo necesitamos gcloud auth, no ADC
    echo -e "${GREEN}✅ Autenticación lista para Cloud Build${NC}"
    
    echo ""
}

# Crear o seleccionar proyecto
setup_project() {
    echo -e "${YELLOW}📋 Configurando proyecto...${NC}"
    
    # Listar proyectos existentes
    echo -e "${BLUE}Proyectos existentes:${NC}"
    gcloud projects list --format="table(projectId,name)" 2>/dev/null || echo "No hay proyectos"
    echo ""
    
    read -p "¿Quieres crear un proyecto nuevo? (s/n): " crear_proyecto
    
    if [ "$crear_proyecto" = "s" ] || [ "$crear_proyecto" = "S" ]; then
        read -p "Nombre del nuevo proyecto (solo letras minúsculas, números y guiones): " PROJECT_NAME
        PROJECT_ID="xantina-backend-$(date +%s | tail -c 7)"
        
        echo -e "${YELLOW}🔨 Creando proyecto: $PROJECT_ID${NC}"
        gcloud projects create $PROJECT_ID --name="$PROJECT_NAME" || {
            echo -e "${RED}❌ Error al crear proyecto. Intentando continuar...${NC}"
            read -p "Ingresa el ID del proyecto existente: " PROJECT_ID
        }
        
        echo -e "${YELLOW}💰 Configurando facturación...${NC}"
        echo -e "${YELLOW}⚠️  Necesitas vincular una cuenta de facturación${NC}"
        read -p "ID de cuenta de facturación (BILLING_ACCOUNT_ID) o Enter para omitir: " BILLING_ACCOUNT
        
        if [ ! -z "$BILLING_ACCOUNT" ]; then
            gcloud billing projects link $PROJECT_ID --billing-account=$BILLING_ACCOUNT
        else
            echo -e "${YELLOW}⚠️  Omitiendo facturación. Recuerda vincularla después.${NC}"
        fi
    else
        read -p "Ingresa el ID del proyecto existente: " PROJECT_ID
    fi
    
    gcloud config set project $PROJECT_ID
    echo -e "${GREEN}✅ Proyecto configurado: $PROJECT_ID${NC}"
    echo ""
}

# Habilitar APIs necesarias
enable_apis() {
    echo -e "${YELLOW}🔧 Habilitando APIs necesarias...${NC}"
    gcloud services enable cloudbuild.googleapis.com \
        run.googleapis.com \
        containerregistry.googleapis.com \
        cloudresourcemanager.googleapis.com
    
    echo -e "${GREEN}✅ APIs habilitadas${NC}"
    echo ""
}

# Configurar variables de entorno
setup_env_vars() {
    echo -e "${YELLOW}⚙️  Configurando variables de entorno...${NC}"
    echo ""
    
    # Obtener directorio del script
    SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
    
    # MONGO_URI
    if [ -f "$SCRIPT_DIR/.env" ]; then
        MONGO_URI=$(grep MONGO_URI "$SCRIPT_DIR/.env" | cut -d '=' -f2 | tr -d '"' | tr -d "'" | xargs)
        if [ ! -z "$MONGO_URI" ]; then
            echo -e "${GREEN}✓ MONGO_URI encontrada en .env${NC}"
        fi
    fi
    
    if [ -z "$MONGO_URI" ]; then
        read -p "MONGO_URI (cadena de conexión de MongoDB): " MONGO_URI
    else
        read -p "MONGO_URI [Enter para usar del .env]: " MONGO_URI_INPUT
        MONGO_URI=${MONGO_URI_INPUT:-$MONGO_URI}
    fi
    
    # JWT_SECRET
    if [ -f "$SCRIPT_DIR/.env" ]; then
        JWT_SECRET=$(grep JWT_SECRET "$SCRIPT_DIR/.env" | cut -d '=' -f2 | tr -d '"' | tr -d "'" | xargs)
        if [ ! -z "$JWT_SECRET" ]; then
            echo -e "${GREEN}✓ JWT_SECRET encontrado en .env${NC}"
        fi
    fi
    
    if [ -z "$JWT_SECRET" ]; then
        read -p "JWT_SECRET (o Enter para generar uno aleatorio): " JWT_SECRET
    else
        read -p "JWT_SECRET [Enter para usar del .env]: " JWT_SECRET_INPUT
        JWT_SECRET=${JWT_SECRET_INPUT:-$JWT_SECRET}
    fi
    
    if [ -z "$JWT_SECRET" ]; then
        JWT_SECRET=$(openssl rand -base64 32)
        echo -e "${GREEN}✓ JWT_SECRET generado automáticamente${NC}"
    fi
    
    # Seleccionar región
    read -p "Región para Cloud Run [us-central1]: " REGION
    REGION=${REGION:-us-central1}
    
    echo -e "${GREEN}✅ Variables configuradas${NC}"
    echo ""
}

# Construir y desplegar
build_and_deploy() {
    echo -e "${YELLOW}🐳 Construyendo imagen Docker desde GitHub...${NC}"
    
    # Configurar repositorio de GitHub
    GITHUB_REPO="https://github.com/upc-pre-202520-1ACC0238-2005-mira/backend"
    GITHUB_BRANCH="main"
    
    echo -e "${BLUE}📦 Repositorio: $GITHUB_REPO${NC}"
    echo -e "${BLUE}🌿 Rama: $GITHUB_BRANCH${NC}"
    echo ""
    
    # Crear cloudbuild.yaml temporal para construir desde GitHub
    echo -e "${YELLOW}🔨 Creando configuración de Cloud Build...${NC}"
    
    cat > /tmp/cloudbuild-github.yaml << EOF
steps:
  # Clonar repositorio
  - name: 'gcr.io/cloud-builders/git'
    args:
      - 'clone'
      - '--depth=1'
      - '--branch=${GITHUB_BRANCH}'
      - '${GITHUB_REPO}'
      - '/workspace/repo'
    
  # Construir la imagen Docker desde el directorio backend
  - name: 'gcr.io/cloud-builders/docker'
    args:
      - 'build'
      - '-t'
      - 'gcr.io/${PROJECT_ID}/xantina-backend:\$COMMIT_SHA'
      - '-t'
      - 'gcr.io/${PROJECT_ID}/xantina-backend:latest'
      - '/workspace/repo'
    dir: '/workspace'

  # Subir la imagen al Container Registry
  - name: 'gcr.io/cloud-builders/docker'
    args:
      - 'push'
      - 'gcr.io/${PROJECT_ID}/xantina-backend:\$COMMIT_SHA'

  - name: 'gcr.io/cloud-builders/docker'
    args:
      - 'push'
      - 'gcr.io/${PROJECT_ID}/xantina-backend:latest'

images:
  - 'gcr.io/${PROJECT_ID}/xantina-backend:\$COMMIT_SHA'
  - 'gcr.io/${PROJECT_ID}/xantina-backend:latest'

timeout: '1200s'
EOF
    
    echo -e "${YELLOW}🚀 Ejecutando Cloud Build desde GitHub...${NC}"
    gcloud builds submit --config=/tmp/cloudbuild-github.yaml
    
    echo -e "${GREEN}✅ Imagen construida y subida desde GitHub${NC}"
    echo ""
    
    echo -e "${YELLOW}🚀 Desplegando en Cloud Run...${NC}"
    gcloud run deploy xantina-backend \
        --image gcr.io/$PROJECT_ID/xantina-backend:latest \
        --region $REGION \
        --platform managed \
        --allow-unauthenticated \
        --port 8080 \
        --memory 512Mi \
        --cpu 1 \
        --min-instances 0 \
        --max-instances 10 \
        --set-env-vars "PORT=8080,MONGO_URI=$MONGO_URI,JWT_SECRET=$JWT_SECRET" \
        --quiet || {
            echo -e "${YELLOW}⚠️  Intentando actualizar servicio existente...${NC}"
            gcloud run services update xantina-backend \
                --region $REGION \
                --update-env-vars "PORT=8080,MONGO_URI=$MONGO_URI,JWT_SECRET=$JWT_SECRET" \
                --quiet
        }
    
    echo -e "${GREEN}✅ Servicio desplegado${NC}"
    echo ""
    
    # Limpiar archivo temporal
    rm -f /tmp/cloudbuild-github.yaml
}

# Mostrar resultado
show_result() {
    SERVICE_URL=$(gcloud run services describe xantina-backend \
        --region $REGION \
        --format 'value(status.url)' 2>/dev/null)
    
    echo ""
    echo -e "${GREEN}╔════════════════════════════════════════════════════╗${NC}"
    echo -e "${GREEN}║        ¡Despliegue Completado Exitosamente!       ║${NC}"
    echo -e "${GREEN}╚════════════════════════════════════════════════════╝${NC}"
    echo ""
    echo -e "${BLUE}📡 URL del servicio:${NC}"
    echo -e "${GREEN}$SERVICE_URL${NC}"
    echo ""
    echo -e "${BLUE}📡 API Endpoint:${NC}"
    echo -e "${GREEN}$SERVICE_URL/api${NC}"
    echo ""
    echo -e "${BLUE}📋 Información:${NC}"
    echo "  Proyecto: $PROJECT_ID"
    echo "  Región: $REGION"
    echo "  Servicio: xantina-backend"
    echo ""
    echo -e "${BLUE}🔗 Consola de Cloud Run:${NC}"
    echo "  https://console.cloud.google.com/run?project=$PROJECT_ID"
    echo ""
}

# Ejecutar todo
main() {
    check_dependencies
    login_gcp
    setup_project
    enable_apis
    setup_env_vars
    build_and_deploy
    show_result
}

# Ejecutar
main
