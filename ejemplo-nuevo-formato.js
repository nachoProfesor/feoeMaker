/**
 * Ejemplo de cómo se enviarían los datos al backend con el nuevo formato
 */

// Ejemplo 1: RA completo en Centro
const ejemplo1_Centro = {
  codigo: "0370-RA1",
  nombre: "PLANIFICACIÓN Y ADMINISTRACIÓN DE REDES",
  empresa_o_centro: "C",
  criterio_evaluacion_empresa: null
};

// Ejemplo 2: RA completo en Empresa
const ejemplo2_Empresa = {
  codigo: "0370-RA2",
  nombre: "PLANIFICACIÓN Y ADMINISTRACIÓN DE REDES",
  empresa_o_centro: "E",
  criterio_evaluacion_empresa: null
};

// Ejemplo 3: RA Parcial - Algunos CEs en empresa
const ejemplo3_Parcial = {
  codigo: "0371-RA2",
  nombre: "FUNDAMENTOS DE HARDWARE",
  empresa_o_centro: "P",
  criterio_evaluacion_empresa: "a,b,f" // Estos CEs se trabajan en la empresa
  // Interpretación: criterios a), b), f) se trabajan en la empresa
  // Los demás criterios (c, d, e, g, h...) se trabajan en el centro (implícito)
};

// Ejemplo 4: PFI completo con distribución mixta
const ejemploPFICompleto = {
  titulo_id: 39,
  ciclo_id: 6,
  codigo_ra: "PFI-2025",
  tutor_centro_id: null,
  modulos: [
    // Módulo 1: PLANIFICACIÓN Y ADMINISTRACIÓN DE REDES
    {
      codigo: "0370-RA1",
      nombre: "PLANIFICACIÓN Y ADMINISTRACIÓN DE REDES",
      empresa_o_centro: "C",
      criterio_evaluacion_empresa: null
    },
    {
      codigo: "0370-RA2",
      nombre: "PLANIFICACIÓN Y ADMINISTRACIÓN DE REDES",
      empresa_o_centro: "C",
      criterio_evaluacion_empresa: null
    },
    {
      codigo: "0370-RA3",
      nombre: "PLANIFICACIÓN Y ADMINISTRACIÓN DE REDES",
      empresa_o_centro: "E", // Todo el RA3 en la empresa
      criterio_evaluacion_empresa: null
    },
    
    // Módulo 2: FUNDAMENTOS DE HARDWARE
    {
      codigo: "0371-RA1",
      nombre: "FUNDAMENTOS DE HARDWARE",
      empresa_o_centro: "C",
      criterio_evaluacion_empresa: null
    },
    {
      codigo: "0371-RA2",
      nombre: "FUNDAMENTOS DE HARDWARE",
      empresa_o_centro: "P", // RA parcial
      criterio_evaluacion_empresa: "a,b,d" // a), b), d) en empresa; resto en centro
    },
    {
      codigo: "0371-RA3",
      nombre: "FUNDAMENTOS DE HARDWARE",
      empresa_o_centro: "E",
      criterio_evaluacion_empresa: null
    },
    {
      codigo: "0371-RA4",
      nombre: "FUNDAMENTOS DE HARDWARE",
      empresa_o_centro: "P",
      criterio_evaluacion_empresa: "b,e" // Solo b) y e) en empresa
    }
  ]
};

// Función para analizar la distribución
function analizarDistribucion(pfi) {
  console.log('\n📊 ANÁLISIS DE DISTRIBUCIÓN');
  console.log('================================');
  
  const stats = {
    centro: 0,
    empresa: 0,
    parcial: 0,
    totalCEsEmpresa: 0
  };
  
  pfi.modulos.forEach(mod => {
    if (mod.empresa_o_centro === 'C') stats.centro++;
    if (mod.empresa_o_centro === 'E') stats.empresa++;
    if (mod.empresa_o_centro === 'P') {
      stats.parcial++;
      if (mod.criterio_evaluacion_empresa) {
        stats.totalCEsEmpresa += mod.criterio_evaluacion_empresa.split(',').length;
      }
    }
  });
  
  console.log(`Total RAs: ${pfi.modulos.length}`);
  console.log(`  - Centro (C): ${stats.centro}`);
  console.log(`  - Empresa (E): ${stats.empresa}`);
  console.log(`  - Parcial (P): ${stats.parcial}`);
  console.log(`  - CEs en empresa (parciales): ${stats.totalCEsEmpresa}`);
  console.log('================================\n');
  
  // Mostrar detalles de RAs parciales
  if (stats.parcial > 0) {
    console.log('📝 DETALLES DE RAs PARCIALES:');
    pfi.modulos
      .filter(m => m.empresa_o_centro === 'P')
      .forEach(mod => {
        const ces = mod.criterio_evaluacion_empresa ? mod.criterio_evaluacion_empresa.split(',') : [];
        console.log(`\n  ${mod.codigo} - ${mod.nombre}`);
        console.log(`  CEs en empresa: ${ces.join(', ')} (${ces.length} total)`);
      });
    console.log('\n');
  }
}

// Ejecutar análisis
console.log('🧪 EJEMPLO DE PFI CON NUEVO FORMATO\n');
console.log(JSON.stringify(ejemploPFICompleto, null, 2));
analizarDistribucion(ejemploPFICompleto);

// Comparación con formato anterior
console.log('📊 COMPARACIÓN DE FORMATOS\n');
console.log('FORMATO ANTERIOR (0371-RA2 parcial con 3 CEs en empresa):');
console.log('  → Generaba 3 registros individuales (0371-RA2-CE1, 0371-RA2-CE2, 0371-RA2-CE4)');
console.log('  → Total: 3 registros en BD\n');

console.log('FORMATO NUEVO (0371-RA2 parcial con 3 CEs en empresa):');
console.log('  → Genera 1 solo registro con criterio_evaluacion_empresa: "a,b,d"');
console.log('  → Total: 1 registro en BD ✅\n');

console.log('💰 AHORRO:');
console.log('  → Si un ciclo tiene 5 RAs parciales con promedio de 4 CEs cada uno');
console.log('  → Anterior: 20 registros');
console.log('  → Nuevo: 5 registros');
console.log('  → Reducción: 75% menos registros 🎉\n');
