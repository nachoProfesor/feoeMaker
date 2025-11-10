# Pruebas de Endpoints GET para PFI

Este documento describe cómo probar los endpoints GET para obtener información de PFI (Plan de Formación Individual) y sus detalles asociados.

## 📋 Endpoints Disponibles

### 1. GET Todos los PFIs
Obtiene una lista de todos los PFI creados.

**URL:** `GET /api/practicas/pfi`

**Respuesta exitosa:**
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
    }
  ]
}
```

### 2. GET PFI por ID
Obtiene un PFI específico con todos sus detalles asociados (PFI_detalle).

**URL:** `GET /api/practicas/pfi/{id}`

**Parámetros:**
- `id` (number): ID del PFI a consultar

**Respuesta exitosa:**
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
    // ... más detalles
  ]
}
```

**Campos del detalle:**
- `pfi_id`: ID del PFI al que pertenece
- `codigo`: Código del resultado de aprendizaje o criterio de evaluación
- `nombre_modulo`: Nombre del módulo formativo
- `empresa_o_centro`: "C" para Centro, "E" para Empresa, **"P" para Parcial**
- `criterio_evaluacion_empresa`: **NUEVO** - String con los CEs que se evalúan en la empresa, separados por comas (ej: "CE1,CE3,CE5"). Solo está relleno cuando `empresa_o_centro` es "P"
- `created_at`: Fecha de creación

### ⚠️ Importante: Cambio en el Formato de Parciales

**Anterior (DEPRECATED):** Cuando un RA era parcial, se creaban múltiples registros en PFI_detalle, uno por cada CE.

**Nuevo formato:** Cuando un RA es parcial (`empresa_o_centro = 'P'`), se crea **UN SOLO registro** con:
- El código del RA completo (ej: `0370-RA1`)
- Campo `criterio_evaluacion_empresa` con los CEs de empresa separados por comas (ej: `"CE1,CE3,CE5"`)

**Ejemplo:**
```json
{
  "pfi_id": 5,
  "codigo": "0370-RA1",
  "nombre_modulo": "PLANIFICACIÓN Y ADMINISTRACIÓN DE REDES",
  "empresa_o_centro": "P",
  "criterio_evaluacion_empresa": "CE1,CE3,CE5"
}
```

Esto significa que el RA1 se trabaja de forma parcial: CE1, CE3 y CE5 en la empresa, y el resto en el centro.

## 🧪 Métodos de Prueba

### Opción 1: Desde la Aplicación Web

1. Abre la aplicación en tu navegador: `http://localhost:4200`
2. Inicia sesión si es necesario
3. Ve a la sección "Administración"
4. Encontrarás una tarjeta llamada "Pruebas PFI (Desarrollo)" con dos botones:
   - **"Ver Todos los PFIs"**: Llama al endpoint GET de todos los PFIs
   - **"Ver Primer PFI (Detalle)"**: Llama al endpoint GET del primer PFI disponible

Los resultados se mostrarán:
- En un **alert** con un resumen de la información
- En la **consola del navegador** (F12) con todos los detalles

### Opción 2: Script de Node.js

Ejecuta el script de prueba desde la terminal:

```bash
node test-pfi-endpoints.js
```

Este script:
1. Obtiene todos los PFIs disponibles
2. Toma el ID del primer PFI
3. Obtiene los detalles completos de ese PFI
4. Muestra toda la información en la consola

### Opción 3: Herramientas HTTP (Postman, cURL, etc.)

**Obtener todos los PFIs:**
```bash
curl https://scraping-curriculos-1.onrender.com/api/practicas/pfi
```

**Obtener PFI específico:**
```bash
curl https://scraping-curriculos-1.onrender.com/api/practicas/pfi/3
```

## 📊 Resultados de la Prueba

### Prueba Exitosa

Según las pruebas realizadas:

✅ **GET Todos los PFIs**
- Endpoint funcional
- Devuelve 2 PFIs creados
- Estructura de respuesta correcta

✅ **GET PFI por ID (ID: 3)**
- Endpoint funcional
- Devuelve el PFI con sus datos básicos
- Incluye 21 detalles asociados (resultados de aprendizaje y criterios de evaluación)
- Detalles incluyen:
  - 7 RAs del módulo "PLANIFICACIÓN Y ADMINISTRACIÓN DE REDES"
  - 14 RAs/CEs del módulo "FUNDAMENTOS DE HARDWARE"

### Estructura de Datos

**PFI:**
- `id`: Identificador único
- `titulo_id`: Relación con el título formativo
- `ciclo_id`: Relación con el ciclo formativo
- `codigo_ra`: Código del PFI
- `tutor_centro_id`: Tutor asignado (nullable)
- `created_at`, `updated_at`: Timestamps

**PFI_detalle:**
- `pfi_id`: Relación con el PFI
- `codigo`: Código del RA/CE (ej: "0370-RA1")
- `nombre_modulo`: Nombre descriptivo del módulo
- `empresa_o_centro`: Indica dónde se trabajará ("E" o "C")
- `created_at`: Timestamp de creación

## 🔧 Implementación Técnica

### Servicio Angular (api.service.ts)

```typescript
// Obtener todos los PFIs
getAllPFIs(): Observable<any[]> {
  return this.http.get<any>(`${this.API_URL}/practicas/pfi`).pipe(
    map(response => response.success && response.data ? response.data : [])
  );
}

// Obtener PFI por ID con sus detalles
getPFIById(pfiId: number): Observable<any> {
  return this.http.get<any>(`${this.API_URL}/practicas/pfi/${pfiId}`).pipe(
    map(response => {
      if (response.success) {
        return {
          pfi: response.pfi,
          detalles: response.detalles || [],
          ciclo: response.ciclo,
          titulo: response.titulo
        };
      }
      return null;
    })
  );
}
```

### Componente de Prueba (administracion.component.ts)

```typescript
// Probar obtener todos los PFIs
probarGetAllPFIs() {
  this.apiService.getAllPFIs().subscribe({
    next: (pfis) => {
      console.log('✅ Todos los PFIs:', pfis);
      alert(`✅ Se encontraron ${pfis.length} PFIs`);
    }
  });
}

// Probar obtener PFI específico
probarGetPFIById(pfiId: number) {
  this.apiService.getPFIById(pfiId).subscribe({
    next: (resultado) => {
      console.log('✅ PFI obtenido:', resultado);
      // Mostrar información en alert y consola
    }
  });
}
```

## 📝 Notas Importantes

1. **Backend en Render**: El backend está alojado en Render y puede tardar 30-60 segundos en "despertar" si ha estado inactivo.

2. **Datos de Prueba**: Actualmente hay 2 PFIs creados (IDs 3 y 4), ambos para el mismo ciclo formativo.

3. **Nomenclatura**: El backend devuelve `detalles` (plural) en la respuesta, el servicio Angular lo maneja correctamente.

4. **CORS**: Los endpoints están configurados para aceptar peticiones desde el frontend de Angular.

## 🚀 Próximos Pasos

Los siguientes endpoints deberían implementarse:

- [ ] `PUT /api/practicas/pfi/{id}` - Actualizar PFI
- [ ] `DELETE /api/practicas/pfi/{id}` - Eliminar PFI
- [ ] `GET /api/practicas/pfi/ciclo/{cicloId}` - Obtener PFIs por ciclo (ya existe)
- [ ] Endpoints para gestionar detalles individuales del PFI

## 📧 Contacto

Para dudas o problemas, revisa los logs de la consola del navegador y del terminal.
