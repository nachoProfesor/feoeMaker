# Ejemplos de Respuestas de los Endpoints PFI

Este archivo contiene ejemplos reales de las respuestas de los endpoints GET de PFI.

## GET /api/practicas/pfi

### Respuesta Real (2 PFIs encontrados)

```json
{
  "success": true,
  "total": 2,
  "data": [
    {
      "id": 3,
      "titulo_id": 39,
      "ciclo_id": 6,
      "codigo_ra": "PFI-2025",
      "tutor_centro_id": null,
      "created_at": "2025-11-10T11:44:49.311477",
      "updated_at": "2025-11-10T11:44:49.311484"
    },
    {
      "id": 4,
      "titulo_id": 39,
      "ciclo_id": 6,
      "codigo_ra": "PFI-2025",
      "tutor_centro_id": null,
      "created_at": "2025-11-10T11:48:23.356837",
      "updated_at": "2025-11-10T11:48:23.356841"
    }
  ]
}
```

## GET /api/practicas/pfi/3

### Respuesta Real (PFI con 21 detalles)

```json
{
  "success": true,
  "pfi": {
    "id": 3,
    "titulo_id": 39,
    "ciclo_id": 6,
    "codigo_ra": "PFI-2025",
    "tutor_centro_id": null,
    "created_at": "2025-11-10T11:44:49.311477",
    "updated_at": "2025-11-10T11:44:49.311484"
  },
  "detalles": [
    {
      "pfi_id": 3,
      "codigo": "0370-RA1",
      "nombre_modulo": "PLANIFICACIÓN Y ADMINISTRACIÓN DE REDES",
      "empresa_o_centro": "C",
      "created_at": "2025-11-10T11:44:49.315588"
    },
    {
      "pfi_id": 3,
      "codigo": "0370-RA2",
      "nombre_modulo": "PLANIFICACIÓN Y ADMINISTRACIÓN DE REDES",
      "empresa_o_centro": "C",
      "created_at": "2025-11-10T11:44:49.315593"
    },
    {
      "pfi_id": 3,
      "codigo": "0370-RA3",
      "nombre_modulo": "PLANIFICACIÓN Y ADMINISTRACIÓN DE REDES",
      "empresa_o_centro": "C",
      "created_at": "2025-11-10T11:44:49.315596"
    },
    {
      "pfi_id": 3,
      "codigo": "0370-RA4",
      "nombre_modulo": "PLANIFICACIÓN Y ADMINISTRACIÓN DE REDES",
      "empresa_o_centro": "E",
      "created_at": "2025-11-10T11:44:49.315598"
    },
    {
      "pfi_id": 3,
      "codigo": "0370-RA5",
      "nombre_modulo": "PLANIFICACIÓN Y ADMINISTRACIÓN DE REDES",
      "empresa_o_centro": "C",
      "created_at": "2025-11-10T11:44:49.315600"
    },
    {
      "pfi_id": 3,
      "codigo": "0370-RA6",
      "nombre_modulo": "PLANIFICACIÓN Y ADMINISTRACIÓN DE REDES",
      "empresa_o_centro": "C",
      "created_at": "2025-11-10T11:44:49.315603"
    },
    {
      "pfi_id": 3,
      "codigo": "0370-RA7",
      "nombre_modulo": "PLANIFICACIÓN Y ADMINISTRACIÓN DE REDES",
      "empresa_o_centro": "C",
      "created_at": "2025-11-10T11:44:49.315605"
    },
    {
      "pfi_id": 3,
      "codigo": "0371-RA1",
      "nombre_modulo": "FUNDAMENTOS DE HARDWARE",
      "empresa_o_centro": "C",
      "created_at": "2025-11-10T11:44:49.315607"
    },
    {
      "pfi_id": 3,
      "codigo": "0371-RA2-CE1",
      "nombre_modulo": "FUNDAMENTOS DE HARDWARE - RA2 - CE1",
      "empresa_o_centro": "E",
      "created_at": "2025-11-10T11:44:49.315609"
    },
    {
      "pfi_id": 3,
      "codigo": "0371-RA2-CE2",
      "nombre_modulo": "FUNDAMENTOS DE HARDWARE - RA2 - CE2",
      "empresa_o_centro": "E",
      "created_at": "2025-11-10T11:44:49.315611"
    },
    {
      "pfi_id": 3,
      "codigo": "0371-RA2-CE3",
      "nombre_modulo": "FUNDAMENTOS DE HARDWARE - RA2 - CE3",
      "empresa_o_centro": "E",
      "created_at": "2025-11-10T11:44:49.315613"
    },
    {
      "pfi_id": 3,
      "codigo": "0371-RA2-CE4",
      "nombre_modulo": "FUNDAMENTOS DE HARDWARE - RA2 - CE4",
      "empresa_o_centro": "C",
      "created_at": "2025-11-10T11:44:49.315614"
    },
    {
      "pfi_id": 3,
      "codigo": "0371-RA2-CE5",
      "nombre_modulo": "FUNDAMENTOS DE HARDWARE - RA2 - CE5",
      "empresa_o_centro": "C",
      "created_at": "2025-11-10T11:44:49.315617"
    },
    {
      "pfi_id": 3,
      "codigo": "0371-RA2-CE6",
      "nombre_modulo": "FUNDAMENTOS DE HARDWARE - RA2 - CE6",
      "empresa_o_centro": "C",
      "created_at": "2025-11-10T11:44:49.315619"
    },
    {
      "pfi_id": 3,
      "codigo": "0371-RA2-CE7",
      "nombre_modulo": "FUNDAMENTOS DE HARDWARE - RA2 - CE7",
      "empresa_o_centro": "C",
      "created_at": "2025-11-10T11:44:49.315621"
    },
    {
      "pfi_id": 3,
      "codigo": "0371-RA2-CE8",
      "nombre_modulo": "FUNDAMENTOS DE HARDWARE - RA2 - CE8",
      "empresa_o_centro": "C",
      "created_at": "2025-11-10T11:44:49.315623"
    },
    {
      "pfi_id": 3,
      "codigo": "0371-RA2-CE9",
      "nombre_modulo": "FUNDAMENTOS DE HARDWARE - RA2 - CE9",
      "empresa_o_centro": "C",
      "created_at": "2025-11-10T11:44:49.315625"
    },
    {
      "pfi_id": 3,
      "codigo": "0371-RA3",
      "nombre_modulo": "FUNDAMENTOS DE HARDWARE",
      "empresa_o_centro": "E",
      "created_at": "2025-11-10T11:44:49.315627"
    },
    {
      "pfi_id": 3,
      "codigo": "0371-RA4",
      "nombre_modulo": "FUNDAMENTOS DE HARDWARE",
      "empresa_o_centro": "C",
      "created_at": "2025-11-10T11:44:49.315628"
    },
    {
      "pfi_id": 3,
      "codigo": "0371-RA5",
      "nombre_modulo": "FUNDAMENTOS DE HARDWARE",
      "empresa_o_centro": "C",
      "created_at": "2025-11-10T11:44:49.315630"
    },
    {
      "pfi_id": 3,
      "codigo": "0371-RA6",
      "nombre_modulo": "FUNDAMENTOS DE HARDWARE",
      "empresa_o_centro": "C",
      "created_at": "2025-11-10T11:44:49.315631"
    }
  ]
}
```

## Análisis de los Datos

### PFI ID 3
- **Ciclo Formativo ID:** 6
- **Título ID:** 39
- **Código:** PFI-2025
- **Total de detalles:** 21

#### Distribución de Resultados de Aprendizaje:

**Módulo: PLANIFICACIÓN Y ADMINISTRACIÓN DE REDES (0370)**
- 7 Resultados de Aprendizaje (RA1-RA7)
- 6 se trabajan en el Centro (C)
- 1 se trabaja en la Empresa (E) - RA4

**Módulo: FUNDAMENTOS DE HARDWARE (0371)**
- 14 elementos entre RAs y CEs
- RA1: Centro
- RA2: Desglosado en 9 Criterios de Evaluación
  - 3 CEs en la Empresa (CE1, CE2, CE3)
  - 6 CEs en el Centro (CE4-CE9)
- RA3: Empresa
- RA4-RA6: Centro

### Resumen por Ubicación

**Total en Centro (C):** 16 elementos
**Total en Empresa (E):** 5 elementos

Este PFI muestra una distribución equilibrada del aprendizaje entre centro educativo y empresa, con énfasis especial en ciertos criterios de evaluación que requieren práctica en entorno empresarial real.
