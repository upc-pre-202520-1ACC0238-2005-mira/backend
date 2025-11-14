#!/bin/bash

# Script para configurar facturación en GCP
# Uso: ./setup-billing.sh [PROJECT_ID] [BILLING_ACCOUNT_ID]

set -e

# Colores
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

PROJECT_ID=${1:-"xantinamobileapp"}
BILLING_ACCOUNT=${2:-""}

echo -e "${GREEN}💳 Configurando facturación en GCP${NC}"
echo ""

# Verificar gcloud
if ! command -v gcloud &> /dev/null; then
    echo -e "${RED}❌ Error: gcloud CLI no está instalado${NC}"
    exit 1
fi

gcloud config set project ${PROJECT_ID}

# Listar cuentas de facturación disponibles
echo -e "${YELLOW}📋 Cuentas de facturación disponibles:${NC}"
BILLING_ACCOUNTS=$(gcloud billing accounts list --format="value(name,displayName)" 2>/dev/null || echo "")

if [ -z "$BILLING_ACCOUNTS" ]; then
    echo -e "${RED}❌ No se encontraron cuentas de facturación${NC}"
    echo ""
    echo -e "${YELLOW}💡 Para crear una cuenta de facturación:${NC}"
    echo "  1. Ve a: https://console.cloud.google.com/billing"
    echo "  2. Crea una nueva cuenta de facturación"
    echo "  3. Vincula una tarjeta de crédito"
    echo "  4. Ejecuta este script de nuevo con el BILLING_ACCOUNT_ID"
    exit 1
fi

echo "$BILLING_ACCOUNTS" | while IFS=$'\t' read -r id name; do
    echo "  ID: $id"
    echo "  Nombre: $name"
    echo ""
done

# Si no se proporcionó billing account, pedirlo
if [ -z "$BILLING_ACCOUNT" ]; then
    echo -e "${YELLOW}📝 Ingresa el ID de la cuenta de facturación (solo el ID, ej: 01ABCD-2EFGH3-4IJKL5):${NC}"
    read -r BILLING_ACCOUNT
fi

# Vincular proyecto con facturación
echo -e "${YELLOW}🔗 Vinculando proyecto con cuenta de facturación...${NC}"
if gcloud billing projects link ${PROJECT_ID} --billing-account=${BILLING_ACCOUNT}; then
    echo -e "${GREEN}✅ Facturación configurada correctamente${NC}"
    echo ""
    echo -e "${YELLOW}💡 Ahora puedes ejecutar el despliegue:${NC}"
    echo "  ./deploy.sh ${PROJECT_ID} us-central1-a xantina-server"
else
    echo -e "${RED}❌ Error al vincular facturación${NC}"
    exit 1
fi

