# Formato de PFI_detalle con Distribución Parcial

## 📋 Cambios Implementados

Se ha actualizado el formato de `PFI_detalle` para manejar de manera más eficiente los **Resultados de Aprendizaje Parciales**.

## 🔄 Comparación de Formatos

### ❌ Formato Anterior (DEPRECATED)

Cuando un RA se marcaba como "Parcial", se creaban múltiples registros:

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
    "codigo": "0371-RA2-CE3",
    "nombre_modulo": "FUNDAMENTOS DE HARDWARE - RA2 - CE3",
    "empresa_o_centro": "C"
  }
]
```

**Problemas:**
- Generaba muchos registros en la base de datos
- Difícil de consultar y analizar
- Redundancia de información

### ✅ Formato Nuevo (ACTUAL)

Ahora se crea **UN SOLO registro** por RA parcial:

```json
{
  "codigo": "0371-RA2",
  "nombre_modulo": "FUNDAMENTOS DE HARDWARE",
  "empresa_o_centro": "P",
  "criterio_evaluacion_empresa": "CE1,CE2"
}
```

**Ventajas:**
- Un solo registro por RA
- Fácil de consultar
- Los CEs de empresa están claramente identificados y separados por comas
- Interpretación: CE1 y CE2 se trabajan en la empresa, el resto en el centro

## 📊 Valores de `empresa_o_centro`

| Valor | Significado | Campo `criterio_evaluacion_empresa` |
|-------|-------------|-------------------------------------|
| `"C"` | Centro - Todo el RA se trabaja en el centro educativo | `null` |
| `"E"` | Empresa - Todo el RA se trabaja en la empresa | `null` |
| `"P"` | Parcial - El RA se distribuye entre centro y empresa | String con letras de CEs de empresa separadas por comas (ej: `"a,b,f"`) |

## 💻 Ejemplo de Implementación Frontend

### Guardar PFI (TypeScript)

```typescript
if (ra.ubicacion === 'parcial') {
  // Recopilar las letras de los CEs que van a la empresa
  const letras = 'abcdefghijklmnopqrstuvwxyz';
  const cesEmpresa = ra.criterios_evaluacion
    .map((ce, ceIndex) => ce.ubicacion === 'empresa' ? letras[ceIndex] : null)
    .filter(ce => ce !== null);
  
  // Crear un único registro para el RA parcial
  modulos.push({
    codigo: `${m.codigo}-RA${raIndex + 1}`,
    nombre: m.nombre,
    empresa_o_centro: 'P',
    criterio_evaluacion_empresa: cesEmpresa.length > 0 ? cesEmpresa.join(',') : null
  });
}
```

### Interpretar Respuesta (TypeScript)

```typescript
// Al leer un PFI_detalle
if (detalle.empresa_o_centro === 'P' && detalle.criterio_evaluacion_empresa) {
  const cesEmpresa = detalle.criterio_evaluacion_empresa.split(',').map(c => c.trim());
  console.log(`RAs parcial: ${cesEmpresa.length} CEs en empresa:`, cesEmpresa);
  // cesEmpresa = ["a", "b", "f"]
}
```

## 📝 Ejemplo Completo

### Escenario
Módulo: **FUNDAMENTOS DE HARDWARE (0371)**
- RA1: Todo en el Centro
- RA2: Parcial - criterios a), b), d) en Empresa; c), e) en Centro
- RA3: Todo en la Empresa

### Registros generados

```json
[
  {
    "pfi_id": 5,
    "codigo": "0371-RA1",
    "nombre_modulo": "FUNDAMENTOS DE HARDWARE",
    "empresa_o_centro": "C",
    "criterio_evaluacion_empresa": null
  },
  {
    "pfi_id": 5,
    "codigo": "0371-RA2",
    "nombre_modulo": "FUNDAMENTOS DE HARDWARE",
    "empresa_o_centro": "P",
    "criterio_evaluacion_empresa": "a,b,d"
  },
  {
    "pfi_id": 5,
    "codigo": "0371-RA3",
    "nombre_modulo": "FUNDAMENTOS DE HARDWARE",
    "empresa_o_centro": "E",
    "criterio_evaluacion_empresa": null
  }
]
```

### Interpretación
- **RA1**: Se trabaja completamente en el centro educativo
- **RA2**: Distribución parcial
  - En la empresa: criterios a), b), d)
  - En el centro: criterios c), e) (implícito, todos los no mencionados)
- **RA3**: Se trabaja completamente en la empresa

## 🔍 Consultas Útiles

### Contar RAs por ubicación
```sql
SELECT 
  empresa_o_centro,
  COUNT(*) as total
FROM pfi_detalle
WHERE pfi_id = 5
GROUP BY empresa_o_centro;
```

Resultado:
```
empresa_o_centro | total
-----------------+-------
C                | 10
E                | 5
P                | 3
```

### Obtener todos los RAs parciales con sus CEs de empresa
```sql
SELECT 
  codigo,
  nombre_modulo,
  criterio_evaluacion_empresa
FROM pfi_detalle
WHERE pfi_id = 5 AND empresa_o_centro = 'P';
```

### Contar total de CEs en empresa (parciales)
```typescript
const totalCEsEmpresa = detalles
  .filter(d => d.empresa_o_centro === 'P' && d.criterio_evaluacion_empresa)
  .reduce((total, d) => {
    return total + d.criterio_evaluacion_empresa.split(',').length;
  }, 0);
```

## 🎯 Migración

Si tienes datos en el formato anterior, necesitarás:

1. Agrupar los registros por RA (eliminar sufijo `-CE1`, `-CE2`, etc.)
2. Para cada grupo con múltiples CEs:
   - Crear un solo registro con `empresa_o_centro = 'P'`
   - Concatenar los CEs de empresa en `criterio_evaluacion_empresa`
3. Eliminar los registros individuales antiguos

## ✅ Validaciones Recomendadas

### Backend
```python
# Validar que si empresa_o_centro es 'P', criterio_evaluacion_empresa no sea null
if detalle.empresa_o_centro == 'P' and not detalle.criterio_evaluacion_empresa:
    raise ValueError("Los RAs parciales deben especificar criterio_evaluacion_empresa")

# Validar formato de CEs
if detalle.criterio_evaluacion_empresa:
    ces = detalle.criterio_evaluacion_empresa.split(',')
    for ce in ces:
        if not re.match(r'^CE\d+$', ce.strip()):
            raise ValueError(f"Formato inválido de CE: {ce}")
```

### Frontend
```typescript
// Validar que al menos un CE esté marcado como empresa
if (ra.ubicacion === 'parcial') {
  const hayEmpresa = ra.criterios_evaluacion.some(ce => ce.ubicacion === 'empresa');
  if (!hayEmpresa) {
    alert('Si el RA es parcial, debe haber al menos un CE en la empresa');
    return false;
  }
}
```

## 📚 Referencias

- Ver `src/app/components/pfi-editor/pfi-editor.component.ts` para la implementación completa
- Ver `src/app/services/api.service.ts` para las interfaces TypeScript
- Ver `test-pfi-endpoints.js` para ejemplos de consulta
