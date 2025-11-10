/**
 * Script de prueba para endpoints GET de PFI
 * Ejecutar con: node test-pfi-endpoints.js
 */

const API_URL = 'https://scraping-curriculos-1.onrender.com/api';

async function testGetAllPFIs() {
  console.log('\n=== 🧪 PRUEBA 1: GET Todos los PFIs ===');
  console.log(`URL: ${API_URL}/practicas/pfi`);
  
  try {
    const response = await fetch(`${API_URL}/practicas/pfi`);
    const data = await response.json();
    
    console.log('\n✅ Respuesta recibida:');
    console.log(JSON.stringify(data, null, 2));
    
    if (data.success && data.data) {
      console.log(`\n📊 Total de PFIs encontrados: ${data.data.length}`);
      
      if (data.data.length > 0) {
        console.log('\n📋 Primer PFI:');
        console.log(JSON.stringify(data.data[0], null, 2));
        return data.data[0].id; // Retornar el ID del primer PFI para la siguiente prueba
      }
    }
    
    return null;
  } catch (error) {
    console.error('\n❌ Error:', error.message);
    return null;
  }
}

async function testGetPFIById(pfiId) {
  console.log(`\n=== 🧪 PRUEBA 2: GET PFI por ID (${pfiId}) ===`);
  console.log(`URL: ${API_URL}/practicas/pfi/${pfiId}`);
  
  try {
    const response = await fetch(`${API_URL}/practicas/pfi/${pfiId}`);
    const data = await response.json();
    
    console.log('\n✅ Respuesta recibida:');
    console.log(JSON.stringify(data, null, 2));
    
    if (data.success) {
      console.log('\n📋 PFI:');
      console.log(JSON.stringify(data.pfi, null, 2));
      
      console.log('\n📝 Detalles del PFI:');
      const detalles = data.detalles || data.detalle || [];
      console.log(`Total de detalles: ${detalles.length}`);
      
      if (detalles.length > 0) {
        console.log('\nPrimeros 5 detalles:');
        detalles.slice(0, 5).forEach((detalle, index) => {
          console.log(`\n  ${index + 1}. ${detalle.codigo}`);
          console.log(`     Módulo: ${detalle.nombre_modulo}`);
          const ubicacion = detalle.empresa_o_centro === 'C' ? 'Centro' :
                          detalle.empresa_o_centro === 'E' ? 'Empresa' :
                          detalle.empresa_o_centro === 'P' ? 'Parcial' : detalle.empresa_o_centro;
          console.log(`     Ubicación: ${ubicacion}`);
          
          if (detalle.empresa_o_centro === 'P' && detalle.criterio_evaluacion_empresa) {
            console.log(`     ✨ CEs en empresa: ${detalle.criterio_evaluacion_empresa}`);
            const cesArray = detalle.criterio_evaluacion_empresa.split(',');
            console.log(`     ✨ Total CEs en empresa: ${cesArray.length} (${cesArray.join(', ')})`);
          }
        });
        
        if (detalles.length > 5) {
          console.log(`\n  ... y ${detalles.length - 5} detalles más`);
        }
        
        // Estadísticas
        const stats = {
          centro: detalles.filter(d => d.empresa_o_centro === 'C').length,
          empresa: detalles.filter(d => d.empresa_o_centro === 'E').length,
          parcial: detalles.filter(d => d.empresa_o_centro === 'P').length
        };
        
        console.log('\n📊 Distribución de RAs:');
        console.log(`   Centro (C): ${stats.centro}`);
        console.log(`   Empresa (E): ${stats.empresa}`);
        console.log(`   Parcial (P): ${stats.parcial}`);
        console.log(`   Total: ${detalles.length}`);
      }
      
      if (data.ciclo) {
        console.log('\n🎓 Ciclo Formativo:');
        console.log(JSON.stringify(data.ciclo, null, 2));
      }
      
      if (data.titulo) {
        console.log('\n📜 Título:');
        console.log(JSON.stringify(data.titulo, null, 2));
      }
    }
  } catch (error) {
    console.error('\n❌ Error:', error.message);
  }
}

async function runTests() {
  console.log('🚀 Iniciando pruebas de endpoints PFI...\n');
  console.log('⚠️  Nota: El backend puede tardar 30-60s en arrancar si está inactivo\n');
  
  // Prueba 1: Obtener todos los PFIs
  const primerPFIId = await testGetAllPFIs();
  
  // Prueba 2: Obtener detalles de un PFI específico
  if (primerPFIId) {
    await testGetPFIById(primerPFIId);
  } else {
    console.log('\n⚠️  No se encontraron PFIs para probar el endpoint GET por ID');
    console.log('💡 Crea algunos PFIs primero usando la aplicación web');
  }
  
  console.log('\n✨ Pruebas completadas\n');
}

// Ejecutar las pruebas
runTests();
