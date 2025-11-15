#!/bin/bash

# Script para desplegar MongoDB y Backend en una sola VM de Compute Engine
# Uso: ./deploy.sh [PROJECT_ID] [ZONE] [INSTANCE_NAME] [JWT_SECRET]

set -e

# Colores
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

PROJECT_ID=${1:-"xantinamobileapp"}
ZONE=${2:-"us-central1-a"}
INSTANCE_NAME=${3:-"xantina-server"}
JWT_SECRET=${4:-""}

echo -e "${GREEN}🚀 Desplegando Xantina (MongoDB + Backend) en Compute Engine${NC}"
echo ""

# Verificar gcloud
if ! command -v gcloud &> /dev/null; then
    echo -e "${RED}❌ Error: gcloud CLI no está instalado${NC}"
    exit 1
fi

# Validar proyecto
if ! gcloud projects describe ${PROJECT_ID} &> /dev/null; then
    echo -e "${RED}❌ Error: El proyecto '${PROJECT_ID}' no existe${NC}"
    exit 1
fi

gcloud config set project ${PROJECT_ID}

# Solicitar JWT_SECRET si no se proporcionó
if [ -z "$JWT_SECRET" ]; then
    echo -e "${YELLOW}📝 Ingresa tu JWT_SECRET (o presiona Enter para generar uno):${NC}"
    read -r JWT_SECRET
    if [ -z "$JWT_SECRET" ]; then
        JWT_SECRET=$(openssl rand -base64 32)
        echo -e "${GREEN}✅ JWT_SECRET generado: ${JWT_SECRET}${NC}"
    fi
fi

echo -e "${YELLOW}📋 Configuración:${NC}"
echo "  Project ID: ${PROJECT_ID}"
echo "  Zone: ${ZONE}"
echo "  Instance Name: ${INSTANCE_NAME}"
echo ""

# Verificar si la instancia ya existe
if gcloud compute instances describe ${INSTANCE_NAME} --zone=${ZONE} &> /dev/null; then
    echo -e "${YELLOW}⚠️  La instancia ${INSTANCE_NAME} ya existe${NC}"
    read -p "¿Deseas eliminarla y crear una nueva? (y/N): " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        echo -e "${YELLOW}🗑️  Eliminando instancia existente...${NC}"
        gcloud compute instances delete ${INSTANCE_NAME} --zone=${ZONE} --quiet
    else
        echo -e "${GREEN}✅ Usando instancia existente${NC}"
        EXTERNAL_IP=$(gcloud compute instances describe ${INSTANCE_NAME} --zone=${ZONE} --format='get(networkInterfaces[0].accessConfigs[0].natIP)')
        echo -e "${GREEN}🌐 IP Externa: ${EXTERNAL_IP}${NC}"
        echo -e "${GREEN}📡 Backend disponible en: http://${EXTERNAL_IP}:8080/api${NC}"
        exit 0
    fi
fi

# Crear script de inicio
cat > /tmp/xantina-startup.sh << EOF
#!/bin/bash
# Instalar Docker y Docker Compose
curl -fsSL https://get.docker.com -o get-docker.sh
sh get-docker.sh
sudo usermod -aG docker \$(whoami)

# Instalar Docker Compose
sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-\$(uname -s)-\$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose

# Crear directorio para la aplicación
sudo mkdir -p /opt/xantina
sudo chown -R \$(whoami):\$(whoami) /opt/xantina
cd /opt/xantina

# Crear docker-compose.yml
cat > docker-compose.yml << 'DOCKERCOMPOSE'
version: '3.8'

services:
  mongodb:
    image: mongo:7.0
    container_name: xantina-mongodb
    restart: always
    ports:
      - "27017:27017"
    environment:
      MONGO_INITDB_DATABASE: xantina
    volumes:
      - mongodb_data:/data/db
      - mongodb_config:/data/configdb
    networks:
      - xantina-network

  backend:
    build:
      context: .
      dockerfile: Dockerfile
    container_name: xantina-backend
    restart: always
    ports:
      - "8080:8080"
    environment:
      PORT: 8080
      MONGO_URI: mongodb://mongodb:27017/xantina
      JWT_SECRET: ${JWT_SECRET}
    depends_on:
      - mongodb
    networks:
      - xantina-network

volumes:
  mongodb_data:
    driver: local
  mongodb_config:
    driver: local

networks:
  xantina-network:
    driver: bridge
DOCKERCOMPOSE

# Los archivos del backend se copiarán después
EOF

# Crear instancia
echo -e "${YELLOW}🚀 Creando instancia de Compute Engine (esto toma ~1 minuto)...${NC}"
gcloud compute instances create ${INSTANCE_NAME} \
  --zone=${ZONE} \
  --machine-type=e2-medium \
  --image-family=ubuntu-2204-lts \
  --image-project=ubuntu-os-cloud \
  --boot-disk-size=30GB \
  --boot-disk-type=pd-standard \
  --tags=xantina-server \
  --metadata-from-file=startup-script=/tmp/xantina-startup.sh

echo -e "${GREEN}✅ Instancia creada${NC}"

# Esperar a que la instancia esté lista
echo -e "${YELLOW}⏳ Esperando a que la instancia inicie (instalando Docker y Docker Compose)...${NC}"
echo -e "${YELLOW}   Esto puede tomar 2-3 minutos...${NC}"
sleep 50

# Esperar a que SSH esté disponible
echo -e "${YELLOW}🔌 Esperando SSH y verificación de Docker...${NC}"
for i in {1..30}; do
    if gcloud compute ssh ${INSTANCE_NAME} --zone=${ZONE} --command="docker --version && docker-compose --version" 2>/dev/null; then
        echo -e "${GREEN}✅ Docker instalado correctamente${NC}"
        break
    fi
    echo "  Esperando... ($i/30) - Esto es normal, puede tomar varios minutos"
    sleep 10
done

# Copiar archivos del backend (usar home temporal y luego mover con sudo)
echo -e "${YELLOW}📤 Copiando archivos del backend a la VM...${NC}"
echo -e "${YELLOW}   Esto puede tomar 1-2 minutos dependiendo del tamaño de los archivos...${NC}"
gcloud compute scp --recurse \
  Dockerfile \
  package.json \
  package-lock.json \
  tsconfig.json \
  tsconfig.build.json \
  nest-cli.json \
  src \
  ${INSTANCE_NAME}:~/xantina-temp/ \
  --zone=${ZONE}

# Mover archivos a /opt/xantina con permisos correctos
echo -e "${YELLOW}📁 Moviendo archivos a /opt/xantina...${NC}"
gcloud compute ssh ${INSTANCE_NAME} --zone=${ZONE} --command="
sudo mkdir -p /opt/xantina
sudo cp -r ~/xantina-temp/* /opt/xantina/
sudo chown -R \$(whoami):\$(whoami) /opt/xantina
rm -rf ~/xantina-temp
"

echo -e "${GREEN}✅ Archivos copiados${NC}"

# Construir y levantar servicios
echo -e "${YELLOW}🏗️  Construyendo imagen del backend (esto puede tomar 3-5 minutos)...${NC}"
echo -e "${YELLOW}   Descargando dependencias de Node.js y compilando...${NC}"
gcloud compute ssh ${INSTANCE_NAME} --zone=${ZONE} --command="
cd /opt/xantina
sudo docker-compose build --progress=plain
"

echo -e "${GREEN}✅ Imagen construida${NC}"

echo -e "${YELLOW}🚀 Iniciando servicios (MongoDB y Backend)...${NC}"
gcloud compute ssh ${INSTANCE_NAME} --zone=${ZONE} --command="
cd /opt/xantina
sudo docker-compose up -d

# Crear servicio systemd para inicio automático al reiniciar
sudo tee /etc/systemd/system/xantina.service > /dev/null << 'SYSTEMD'
[Unit]
Description=Xantina Docker Compose
Requires=docker.service
After=docker.service

[Service]
Type=oneshot
RemainAfterExit=yes
WorkingDirectory=/opt/xantina
ExecStart=/usr/local/bin/docker-compose up -d
ExecStop=/usr/local/bin/docker-compose down
User=root

[Install]
WantedBy=multi-user.target
SYSTEMD

# Habilitar servicio para inicio automático
sudo systemctl daemon-reload
sudo systemctl enable xantina.service

sleep 15
sudo docker-compose ps
echo ''
echo '=== Últimos logs del backend ==='
sudo docker-compose logs --tail=30 backend
"

# Configurar firewall
echo -e "${YELLOW}🔥 Configurando firewall...${NC}"
gcloud compute firewall-rules create allow-xantina-backend \
  --allow tcp:8080 \
  --source-ranges 0.0.0.0/0 \
  --target-tags xantina-server \
  --description 'Allow Xantina Backend' \
  2>/dev/null || echo "Firewall rule ya existe"

gcloud compute firewall-rules create allow-xantina-mongodb \
  --allow tcp:27017 \
  --source-ranges 0.0.0.0/0 \
  --target-tags xantina-server \
  --description 'Allow MongoDB' \
  2>/dev/null || echo "Firewall rule ya existe"

# Limpiar
rm -f /tmp/xantina-startup.sh

# Obtener IP
EXTERNAL_IP=$(gcloud compute instances describe ${INSTANCE_NAME} --zone=${ZONE} --format='get(networkInterfaces[0].accessConfigs[0].natIP)')

echo ""
echo -e "${GREEN}✅ Despliegue completado!${NC}"
echo ""
echo -e "${YELLOW}📋 Información:${NC}"
echo "  IP Externa: ${EXTERNAL_IP}"
echo ""
echo -e "${GREEN}📡 Backend disponible en:${NC}"
echo "  http://${EXTERNAL_IP}:8080/api"
echo ""
echo -e "${GREEN}🗄️  MongoDB disponible en:${NC}"
echo "  mongodb://${EXTERNAL_IP}:27017/xantina"
echo ""
echo -e "${YELLOW}💡 Nota: Si el backend no responde inmediatamente, espera 30-60 segundos más${NC}"
echo -e "${YELLOW}   Los contenedores pueden tardar un poco en iniciar completamente${NC}"
echo ""

# Esperar un poco más y probar endpoints
echo -e "${YELLOW}🧪 Probando endpoints...${NC}"
sleep 10

# Probar endpoint del backend
echo -e "${YELLOW}   Probando GET /api...${NC}"
HTTP_CODE=$(curl -s -o /dev/null -w "%{http_code}" --max-time 10 http://${EXTERNAL_IP}:8080/api || echo "000")

if [ "$HTTP_CODE" = "200" ] || [ "$HTTP_CODE" = "404" ] || [ "$HTTP_CODE" = "401" ]; then
    echo -e "${GREEN}   ✅ Backend responde (HTTP $HTTP_CODE)${NC}"
else
    echo -e "${YELLOW}   ⚠️  Backend aún no responde (HTTP $HTTP_CODE) - espera 30 segundos más${NC}"
    sleep 30
    HTTP_CODE=$(curl -s -o /dev/null -w "%{http_code}" --max-time 10 http://${EXTERNAL_IP}:8080/api || echo "000")
    if [ "$HTTP_CODE" = "200" ] || [ "$HTTP_CODE" = "404" ] || [ "$HTTP_CODE" = "401" ]; then
        echo -e "${GREEN}   ✅ Backend responde ahora (HTTP $HTTP_CODE)${NC}"
    else
        echo -e "${YELLOW}   ⚠️  Backend aún no responde. Revisa los logs:${NC}"
        echo -e "${YELLOW}      gcloud compute ssh ${INSTANCE_NAME} --zone=${ZONE} --command='cd /opt/xantina && sudo docker-compose logs backend'${NC}"
    fi
fi

echo ""
echo -e "${YELLOW}📋 Comandos útiles:${NC}"
echo "  Ver logs: gcloud compute ssh ${INSTANCE_NAME} --zone=${ZONE} --command='cd /opt/xantina && sudo docker-compose logs -f'"
echo "  Reiniciar: gcloud compute ssh ${INSTANCE_NAME} --zone=${ZONE} --command='cd /opt/xantina && sudo docker-compose restart'"
echo "  Estado: gcloud compute ssh ${INSTANCE_NAME} --zone=${ZONE} --command='cd /opt/xantina && sudo docker-compose ps'"
echo "  Probar API: curl http://${EXTERNAL_IP}:8080/api"
