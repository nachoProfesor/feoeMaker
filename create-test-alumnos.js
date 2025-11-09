// Script para crear alumnos de prueba en la API
const API_URL = 'https://scraping-curriculos-1.onrender.com/api/practicas/alumnos';

const alumnosPrueba = [
  {
    nombre: 'Carlos',
    apellidos: 'Martínez González',
    dni_numero: '12345678',
    dni_letra: 'Z',
    correo: 'carlos.martinez@ejemplo.com',
    domicilio: 'C/ Mayor, 23',
    localidad: 'Plasencia',
    codigo_postal: '10600',
    telefono: '666123456',
    id_ciclo: 2 // DAM2
  },
  {
    nombre: 'Laura',
    apellidos: 'Fernández Ruiz',
    dni_numero: '87654321',
    dni_letra: 'X',
    correo: 'laura.fernandez@ejemplo.com',
    domicilio: 'Av. Alfonso VIII, 45',
    localidad: 'Plasencia',
    codigo_postal: '10600',
    telefono: '666654321',
    id_ciclo: 3 // DAW2
  }
];

async function crearAlumno(alumno) {
  try {
    const response = await fetch(API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(alumno)
    });
    
    const data = await response.json();
    if (data.success) {
      console.log(`✓ Alumno creado: ${alumno.nombre} ${alumno.apellidos} (ID: ${data.id})`);
    } else {
      console.error(`✗ Error creando ${alumno.nombre}:`, data.error);
    }
  } catch (error) {
    console.error(`✗ Error en petición para ${alumno.nombre}:`, error.message);
  }
}

async function crearTodosLosAlumnos() {
  console.log('Iniciando creación de alumnos de prueba...\n');
  
  for (const alumno of alumnosPrueba) {
    await crearAlumno(alumno);
    await new Promise(resolve => setTimeout(resolve, 300));
  }
  
  console.log('\n¡Proceso completado!');
}

// Ejecutar
crearTodosLosAlumnos();
