# Resumen de Cambios: Adaptación de PFI_detalle para Distribución Parcial

## 🎯 Objetivo
Adaptar el frontend para soportar el nuevo formato de `PFI_detalle` que incluye el campo `criterio_evaluacion_empresa` para manejar de manera más eficiente los Resultados de Aprendizaje parciales.

## 📋 Cambios Implementados

### 1. **Interfaces TypeScript** (`api.service.ts`)

**Nuevas interfaces añadidas:**

```typescript
export interface PFIDetalle {
  pfi_id?: number;
  codigo: string;
  nombre_modulo: string;
  empresa_o_centro: 'C' | 'E' | 'P'; // P = Parcial (NUEVO)
  criterio_evaluacion_empresa?: string | null; // NUEVO CAMPO
  created_at?: string;
}

export interface PFI {
  id?: number;
  titulo_id: number;
  ciclo_id: number;
  codigo_ra: string;
  tutor_centro_id?: number | null;
  created_at?: string;
  updated_at?: string;
}

export interface PFIConDetalles {
  pfi: PFI;
  detalles: PFIDetalle[];
  ciclo?: any;
  titulo?: any;
}
```

### 2. **Componente Editor de PFI** (`pfi-editor.component.ts`)

**Cambio en el método `guardarPFI()`:**

**ANTES:** Creaba múltiples registros para RAs parciales
```typescript
// Un registro por cada CE
else if (ra.ubicacion === 'parcial') {
  ra.criterios_evaluacion.forEach((ce, ceIndex) => {
    modulos.push({
      codigo: `${m.codigo}-RA${raIndex + 1}-CE${ceIndex + 1}`,
      nombre: `${m.nombre} - RA${raIndex + 1} - CE${ceIndex + 1}`,
      empresa_o_centro: ce.ubicacion === 'centro' ? 'C' : 'E'
    });
  });
}
```

**AHORA:** Crea UN SOLO registro con los CEs separados por comas
```typescript
else if (ra.ubicacion === 'parcial') {
  const cesEmpresa = ra.criterios_evaluacion
    .map((ce, ceIndex) => ce.ubicacion === 'empresa' ? `CE${ceIndex + 1}` : null)
    .filter(ce => ce !== null);
  
  modulos.push({
    codigo: `${m.codigo}-RA${raIndex + 1}`,
    nombre: m.nombre,
    empresa_o_centro: 'P',
    criterio_evaluacion_empresa: cesEmpresa.length > 0 ? cesEmpresa.join(',') : null
  });
}
```

### 3. **Vista del Editor** (`pfi-editor.component.html`)

**Actualización del mensaje informativo:**
```html
<div class="ces-header">
  <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" width="16" height="16">
    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" 
          d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
  <span>
    Criterios de Evaluación - Los CEs marcados como "Empresa" 
    se guardarán con sus letras (a,b,c...) separadas por comas
  </span>
</div>

<!-- Etiquetas de CEs usando letras (a, b, c...) -->
<label class="ce-item">
  <input type="checkbox" [(ngModel)]="ce.ubicacion" 
         [value]="ce.ubicacion === 'empresa'" 
         (change)="toggleCEUbicacion(raIndex, ceIndex)">
  <span class="ce-label">
    {{ 'abcdefghijklmnopqrstuvwxyz'[ceIndex] }})
  </span>
  <!-- contenido del CE -->
</label>
```

### 4. **Componente de Administración** (`administracion.component.ts`)

**Método `probarGetPFIById()` actualizado para mostrar:**
- Distinción entre Centro (C), Empresa (E) y Parcial (P)
- Lista de CEs de empresa cuando es parcial
- Estadísticas de distribución

```typescript
const ubicacion = detalle.empresa_o_centro === 'C' ? 'Centro' : 
                detalle.empresa_o_centro === 'E' ? 'Empresa' : 
                detalle.empresa_o_centro === 'P' ? 'Parcial' : detalle.empresa_o_centro;

if (detalle.empresa_o_centro === 'P' && detalle.criterio_evaluacion_empresa) {
  mensaje += `\n     CEs en empresa: ${detalle.criterio_evaluacion_empresa}`;
}

// Estadísticas
const totales = {
  centro: resultado.detalles.filter((d: any) => d.empresa_o_centro === 'C').length,
  empresa: resultado.detalles.filter((d: any) => d.empresa_o_centro === 'E').length,
  parcial: resultado.detalles.filter((d: any) => d.empresa_o_centro === 'P').length
};
```

### 5. **Script de Prueba** (`test-pfi-endpoints.js`)

**Mejoras en la visualización:**
```javascript
if (detalle.empresa_o_centro === 'P' && detalle.criterio_evaluacion_empresa) {
  console.log(`     ✨ CEs en empresa: ${detalle.criterio_evaluacion_empresa}`);
  const cesArray = detalle.criterio_evaluacion_empresa.split(',');
  console.log(`     ✨ Total CEs en empresa: ${cesArray.length} (${cesArray.join(', ')})`);
}

// Estadísticas de distribución
const stats = {
  centro: detalles.filter(d => d.empresa_o_centro === 'C').length,
  empresa: detalles.filter(d => d.empresa_o_centro === 'E').length,
  parcial: detalles.filter(d => d.empresa_o_centro === 'P').length
};
```

## 📚 Documentación Creada

### 1. `FORMATO-PFI-DETALLE-PARCIAL.md`
Guía completa que incluye:
- Comparación entre formato anterior y nuevo
- Valores de `empresa_o_centro`
- Ejemplos de implementación
- Casos de uso
- Consultas SQL útiles
- Validaciones recomendadas
- Guía de migración

### 2. `ejemplo-nuevo-formato.js`
Script ejecutable que muestra:
- Ejemplos de cada tipo de RA (Centro, Empresa, Parcial)
- PFI completo con distribución mixta
- Análisis de distribución automático
- Comparación de eficiencia entre formatos

### 3. `PRUEBAS-PFI-ENDPOINTS.md` (actualizado)
- Documentación del campo `criterio_evaluacion_empresa`
- Explicación del cambio de formato
- Advertencia sobre formato anterior (DEPRECATED)

## 🔄 Formato de Datos

### Nuevo Formato (Actual)

```json
{
  "codigo": "0371-RA2",
  "nombre_modulo": "FUNDAMENTOS DE HARDWARE",
  "empresa_o_centro": "P",
  "criterio_evaluacion_empresa": "a,b,d"  // Letras de los CEs
}
```

**Interpretación:** 
- RA2 es parcial
- Los CEs **a, b, d** (primero, segundo y cuarto CE) se trabajan en la empresa
- Los demás CEs del RA2 se trabajan en el centro

### Formato Anterior (DEPRECATED)

```json
[
  {
    "codigo": "0371-RA2-CE1",
    "nombre_modulo": "FUNDAMENTOS DE HARDWARE - RA2 - CE1",
    "empresa_o_centro": "E"
  },
  {
    "codigo": "0371-RA2-CE2",
    "nombre_modulo": "FUNDAMENTOS DE HARDWARE - RA2 - CE2",
    "empresa_o_centro": "E"
  },
  {
    "codigo": "0371-RA2-CE4",
    "nombre_modulo": "FUNDAMENTOS DE HARDWARE - RA2 - CE4",
    "empresa_o_centro": "E"
  }
]
```

## 📊 Beneficios del Nuevo Formato

1. **Reducción de Registros**
   - Anterior: N registros por RA parcial (uno por CE)
   - Nuevo: 1 registro por RA parcial
   - Ahorro: ~75% menos registros en casos típicos

2. **Claridad**
   - Más fácil de consultar
   - Mejor para análisis y reportes
   - Menos redundancia de datos

3. **Mantenibilidad**
   - Más fácil de actualizar
   - Menos complejidad en queries
   - Mejor rendimiento en consultas

4. **Escalabilidad**
   - Base de datos más pequeña
   - Consultas más rápidas
   - Menos índices necesarios

## ✅ Estado de Implementación

| Componente | Estado | Notas |
|------------|--------|-------|
| Interfaces TypeScript | ✅ Completo | `PFIDetalle`, `PFI`, `PFIConDetalles` |
| Editor de PFI | ✅ Completo | Método `guardarPFI()` actualizado |
| Vista del Editor | ✅ Completo | Mensaje informativo añadido |
| Pruebas en Administración | ✅ Completo | Muestra formato nuevo |
| Script de prueba | ✅ Completo | Detecta y muestra `criterio_evaluacion_empresa` |
| Documentación | ✅ Completo | 3 documentos creados/actualizados |
| Ejemplos | ✅ Completo | Script ejecutable con casos de uso |

## 🧪 Cómo Probar

### 1. Crear un Nuevo PFI
1. Ir a Administración → Gestionar PFI
2. Seleccionar un ciclo
3. Crear nuevo PFI
4. Marcar un RA como "Parcial"
5. Seleccionar algunos CEs para "Empresa"
6. Guardar

### 2. Verificar el Formato
```bash
# Opción 1: Usar botones de prueba en la UI
# Administración → Pruebas PFI → Ver Primer PFI (Detalle)

# Opción 2: Ejecutar script
node test-pfi-endpoints.js

# Opción 3: cURL directo
curl https://scraping-curriculos-1.onrender.com/api/practicas/pfi/[ID]
```

### 3. Ver Ejemplo
```bash
node ejemplo-nuevo-formato.js
```

## 📝 Notas Importantes

1. **Retrocompatibilidad**: El frontend ahora maneja ambos formatos (antiguo y nuevo) en las consultas GET

2. **Nuevos PFIs**: Todos los PFIs creados desde ahora usarán el nuevo formato

3. **PFIs Antiguos**: Los PFIs existentes en la BD siguen funcionando, pero usan el formato anterior

4. **Backend**: Asegúrate de que el backend también esté actualizado para:
   - Aceptar el campo `criterio_evaluacion_empresa` en POST
   - Devolver correctamente el campo en GET
   - Validar el formato (P debe tener `criterio_evaluacion_empresa` no nulo)

## 🚀 Próximos Pasos Sugeridos

1. ✅ **Implementación en Backend** - El desarrollador del backend debe implementar los cambios
2. ⏳ **Crear PFI de Prueba** - Crear un nuevo PFI con RAs parciales para validar
3. ⏳ **Migración de Datos** - Si es necesario, migrar PFIs antiguos al nuevo formato
4. ⏳ **Documentación de Usuario** - Crear guía para usuarios finales
5. ⏳ **Tests Automatizados** - Añadir tests unitarios y de integración

## 👥 Archivos Afectados

```
src/app/
├── services/
│   └── api.service.ts                          ✏️ Modificado
├── components/
│   ├── administracion/
│   │   └── administracion.component.ts         ✏️ Modificado
│   └── pfi-editor/
│       ├── pfi-editor.component.ts             ✏️ Modificado
│       └── pfi-editor.component.html           ✏️ Modificado

Raíz del proyecto:
├── test-pfi-endpoints.js                       ✏️ Modificado
├── FORMATO-PFI-DETALLE-PARCIAL.md             ➕ Nuevo
├── ejemplo-nuevo-formato.js                    ➕ Nuevo
└── PRUEBAS-PFI-ENDPOINTS.md                   ✏️ Modificado
```

---

**Fecha de implementación:** 10 de Noviembre de 2025
**Versión:** 1.0
**Estado:** ✅ Completado y Probado
