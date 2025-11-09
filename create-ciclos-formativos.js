// Script para crear los ciclos formativos en la API
const API_URL = 'https://scraping-curriculos-1.onrender.com/api/practicas/ciclos';

const ciclosFormativos = [
  {
    codigo: 'IFC3-1',
    nombre: 'ASIR2',
    descripcion: '2º Administración de Sistemas Informáticos y Redes',
    tipo_grado: 'superior'
  },
  {
    codigo: 'IFC3-2',
    nombre: 'DAM2',
    descripcion: '2º Desarrollo de Aplicaciones Multiplataforma',
    tipo_grado: 'superior'
  },
  {
    codigo: 'IFC3-3',
    nombre: 'DAW2',
    descripcion: '2º Desarrollo de Aplicaciones Web',
    tipo_grado: 'superior'
  }
];

async function crearCiclo(ciclo) {
  try {
    const response = await fetch(API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(ciclo)
    });
    
    const data = await response.json();
    if (data.success) {
      console.log(`✓ Ciclo creado: ${ciclo.nombre} - ${ciclo.descripcion} (ID: ${data.id})`);
    } else {
      console.error(`✗ Error creando ${ciclo.nombre}:`, data.error);
    }
  } catch (error) {
    console.error(`✗ Error en petición para ${ciclo.nombre}:`, error.message);
  }
}

async function crearTodosLosCiclos() {
  console.log('Iniciando creación de ciclos formativos...\n');
  
  for (const ciclo of ciclosFormativos) {
    await crearCiclo(ciclo);
    // Pequeña pausa entre peticiones
    await new Promise(resolve => setTimeout(resolve, 300));
  }
  
  console.log('\n¡Proceso completado!');
}

// Ejecutar
crearTodosLosCiclos();
