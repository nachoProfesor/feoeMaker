# Guía Rápida de Adaptación - PFI_detalle con Parciales

## 🎯 Resumen Ejecutivo

Se ha añadido el campo `criterio_evaluacion_empresa` a `PFI_detalle` para manejar RAs parciales de forma más eficiente. Los RAs parciales ahora se guardan en UN SOLO registro con los CEs de empresa separados por comas.

## 🔧 Backend: Cambios Necesarios

### 1. Base de Datos

```sql
-- Añadir la nueva columna (si no existe)
ALTER TABLE pfi_detalle 
ADD COLUMN criterio_evaluacion_empresa VARCHAR(255) NULL;

-- Crear índice para búsquedas
CREATE INDEX idx_pfi_detalle_parciales 
ON pfi_detalle(empresa_o_centro) 
WHERE empresa_o_centro = 'P';
```

### 2. Modelo (Python/FastAPI)

```python
from typing import Optional
from pydantic import BaseModel

class PFIDetalle(BaseModel):
    pfi_id: int
    codigo: str
    nombre_modulo: str
    empresa_o_centro: str  # 'C', 'E', o 'P'
    criterio_evaluacion_empresa: Optional[str] = None  # "a,b,f"
    
    @validator('criterio_evaluacion_empresa')
    def validate_criterios(cls, v, values):
        if values.get('empresa_o_centro') == 'P' and not v:
            raise ValueError('Los RAs parciales requieren criterio_evaluacion_empresa')
        if values.get('empresa_o_centro') != 'P' and v:
            raise ValueError('Solo los RAs parciales pueden tener criterio_evaluacion_empresa')
        # Validar formato: letras separadas por comas
        if v:
            letras = v.split(',')
            for letra in letras:
                if not letra.strip().isalpha() or len(letra.strip()) != 1:
                    raise ValueError(f'Formato inválido: debe ser letras separadas por comas (ej: "a,b,f")')
        return v
```

### 3. Endpoint POST (Crear PFI)

```python
@app.post("/api/practicas/pfi")
async def crear_pfi(pfi_data: dict):
    pfi_id = crear_pfi_en_bd(pfi_data)
    
    for modulo in pfi_data.get('modulos', []):
        detalle = PFIDetalle(
            pfi_id=pfi_id,
            codigo=modulo['codigo'],
            nombre_modulo=modulo['nombre'],
            empresa_o_centro=modulo['empresa_o_centro'],
            criterio_evaluacion_empresa=modulo.get('criterio_evaluacion_empresa')
        )
        guardar_detalle(detalle)
    
    return {"success": True, "pfi_id": pfi_id}
```

### 4. Endpoint GET (Obtener PFI)

```python
@app.get("/api/practicas/pfi/{pfi_id}")
async def obtener_pfi(pfi_id: int):
    pfi = obtener_pfi_de_bd(pfi_id)
    detalles = obtener_detalles_de_bd(pfi_id)
    
    return {
        "success": True,
        "pfi": pfi,
        "detalles": detalles  # Ya incluye criterio_evaluacion_empresa
    }
```

## 💻 Frontend: Ya Implementado ✅

### Envío de Datos (TypeScript)

```typescript
// El frontend YA envía los datos en el formato correcto:
{
  codigo: "0371-RA2",
  nombre: "FUNDAMENTOS DE HARDWARE",
  empresa_o_centro: "P",
  criterio_evaluacion_empresa: "a,b,f"  // Letras de los CEs
}
```

### Lectura de Datos (TypeScript)

```typescript
// El frontend YA maneja la lectura correctamente:
if (detalle.empresa_o_centro === 'P' && detalle.criterio_evaluacion_empresa) {
  const cesEmpresa = detalle.criterio_evaluacion_empresa.split(',');
  console.log(`CEs en empresa: ${cesEmpresa.join(', ')}`);
}
```

## 🧪 Pruebas

### 1. Crear PFI con RA Parcial

**Request:**
```json
POST /api/practicas/pfi
{
  "titulo_id": 39,
  "ciclo_id": 6,
  "codigo_ra": "PFI-2025",
  "tutor_centro_id": null,
  "modulos": [
    {
      "codigo": "0371-RA2",
      "nombre": "FUNDAMENTOS DE HARDWARE",
      "empresa_o_centro": "P",
      "criterio_evaluacion_empresa": "a,b,f"  // Letras, no números
    }
  ]
}
```

**Expected Response:**
```json
{
  "success": true,
  "pfi_id": 5
}
```

### 2. Obtener PFI con RA Parcial

**Request:**
```
GET /api/practicas/pfi/5
```

**Expected Response:**
```json
{
  "success": true,
  "pfi": {
    "id": 5,
    "titulo_id": 39,
    "ciclo_id": 6,
    "codigo_ra": "PFI-2025"
  },
  "detalles": [
    {
      "pfi_id": 5,
      "codigo": "0371-RA2",
      "nombre_modulo": "FUNDAMENTOS DE HARDWARE",
      "empresa_o_centro": "P",
      "criterio_evaluacion_empresa": "a,b,f",  // Letras de los CEs
      "created_at": "2025-11-10T12:00:00"
    }
  ]
}
```

### 3. Validaciones

✅ **Casos Válidos:**
```json
// RA completo en Centro
{"empresa_o_centro": "C", "criterio_evaluacion_empresa": null}

// RA completo en Empresa
{"empresa_o_centro": "E", "criterio_evaluacion_empresa": null}

// RA Parcial con CEs (letras)
{"empresa_o_centro": "P", "criterio_evaluacion_empresa": "a,b,f"}
```

❌ **Casos Inválidos:**
```json
// Parcial sin CEs
{"empresa_o_centro": "P", "criterio_evaluacion_empresa": null}
→ Error: "Los RAs parciales requieren criterio_evaluacion_empresa"

// No parcial con CEs
{"empresa_o_centro": "C", "criterio_evaluacion_empresa": "a"}
→ Error: "Solo los RAs parciales pueden tener criterio_evaluacion_empresa"

// Formato inválido (números en lugar de letras)
{"empresa_o_centro": "P", "criterio_evaluacion_empresa": "CE1,CE3"}
→ Error: "Formato debe ser letras: a,b,f"
```

## 📊 Consultas Útiles

### Contar RAs por tipo

```sql
SELECT 
    empresa_o_centro,
    COUNT(*) as total
FROM pfi_detalle
WHERE pfi_id = ?
GROUP BY empresa_o_centro;
```

### Obtener RAs parciales con CEs

```sql
SELECT 
    codigo,
    nombre_modulo,
    criterio_evaluacion_empresa,
    LENGTH(criterio_evaluacion_empresa) - LENGTH(REPLACE(criterio_evaluacion_empresa, ',', '')) + 1 as num_ces_empresa
FROM pfi_detalle
WHERE pfi_id = ? AND empresa_o_centro = 'P';
```

### Listar todos los CEs en empresa

```python
# Backend Python
def obtener_ces_empresa(pfi_id):
    detalles = query("SELECT * FROM pfi_detalle WHERE pfi_id = ? AND empresa_o_centro = 'P'", pfi_id)
    
    ces_totales = []
    for detalle in detalles:
        if detalle.criterio_evaluacion_empresa:
            letras = detalle.criterio_evaluacion_empresa.split(',')
            ces_totales.extend([(detalle.codigo, letra.strip()) for letra in letras])
    
    return ces_totales

# Resultado: [('0371-RA2', 'a'), ('0371-RA2', 'b'), ('0371-RA4', 'c')]
```

## 🔄 Migración de Datos Existentes

Si tienes PFIs con el formato anterior:

```python
# Script de migración
def migrar_pfi_antiguo_a_nuevo(pfi_id):
    # 1. Obtener detalles parciales (con -CE1, -CE2, etc)
    detalles = query("""
        SELECT * FROM pfi_detalle 
        WHERE pfi_id = ? AND codigo LIKE '%-CE%'
        ORDER BY codigo
    """, pfi_id)
    
    # 2. Agrupar por RA
    ras_parciales = {}
    for det in detalles:
        ra_codigo = det.codigo.rsplit('-CE', 1)[0]  # 0371-RA2
        if ra_codigo not in ras_parciales:
            ras_parciales[ra_codigo] = {
                'nombre': det.nombre_modulo.split(' - RA')[0],
                'ces_empresa': [],
                'ces_centro': []
            }
        
        ce_num = det.codigo.split('-CE')[1]
        if det.empresa_o_centro == 'E':
            ras_parciales[ra_codigo]['ces_empresa'].append(f'CE{ce_num}')
        else:
            ras_parciales[ra_codigo]['ces_centro'].append(f'CE{ce_num}')
    
    # 3. Crear nuevos registros
    for ra_codigo, data in ras_parciales.items():
        nuevo_detalle = {
            'pfi_id': pfi_id,
            'codigo': ra_codigo,
            'nombre_modulo': data['nombre'],
            'empresa_o_centro': 'P',
            'criterio_evaluacion_empresa': ','.join(sorted(data['ces_empresa']))
        }
        insertar_detalle(nuevo_detalle)
    
    # 4. Eliminar registros antiguos
    query("DELETE FROM pfi_detalle WHERE pfi_id = ? AND codigo LIKE '%-CE%'", pfi_id)
```

## 🚀 Checklist de Implementación

### Backend
- [ ] Añadir columna `criterio_evaluacion_empresa` a la tabla
- [ ] Actualizar modelo/schema para incluir el nuevo campo
- [ ] Añadir validaciones (P debe tener CEs, C/E no deben tenerlos)
- [ ] Actualizar endpoint POST para guardar el nuevo campo
- [ ] Actualizar endpoint GET para devolver el nuevo campo
- [ ] Crear tests unitarios
- [ ] Migrar datos existentes (si aplica)

### Frontend (Ya Hecho ✅)
- [✓] Actualizar interfaces TypeScript
- [✓] Modificar lógica de guardado
- [✓] Actualizar UI con información
- [✓] Actualizar pruebas y validaciones
- [✓] Crear documentación

### Testing
- [ ] Probar crear PFI con RA completo en Centro
- [ ] Probar crear PFI con RA completo en Empresa
- [ ] Probar crear PFI con RA Parcial
- [ ] Verificar validaciones de formato
- [ ] Probar GET de PFIs con formato nuevo
- [ ] Verificar retrocompatibilidad con PFIs antiguos

## 📧 Soporte

Para dudas sobre la implementación:
- Ver `FORMATO-PFI-DETALLE-PARCIAL.md` para detalles técnicos
- Ver `RESUMEN-CAMBIOS-PFI-DETALLE.md` para contexto completo
- Ejecutar `node ejemplo-nuevo-formato.js` para ver ejemplos

---

**Última actualización:** 10 de Noviembre de 2025
