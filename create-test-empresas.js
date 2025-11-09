// Script para crear 20 empresas de prueba en la API
const API_URL = 'https://scraping-curriculos-1.onrender.com/api/practicas/empresas';

const empresasPrueba = [
  { nombre_empr: 'Tecnologías Avanzadas S.L.', cif_empr: 'B12345678', localidad_empr: 'Plasencia', provincia_empr: 'Cáceres', calle_empr: 'Av. Alfonso VIII, 32', cod_postal_empr: '10600', telefono_empr: '927123456', correo_empr: 'info@tecavanzadas.com', nombre_repr: 'Juan', apellidos_repr: 'García López', dni_repr: '12345678A', numero_convenio: 1001, fecha_firma_conv: '2024-01-15' },
  { nombre_empr: 'Informática del Valle', cif_empr: 'B23456789', localidad_empr: 'Cáceres', provincia_empr: 'Cáceres', calle_empr: 'C/ San Pedro, 15', cod_postal_empr: '10001', telefono_empr: '927234567', correo_empr: 'contacto@infovalle.es', nombre_repr: 'María', apellidos_repr: 'Rodríguez Sánchez', dni_repr: '23456789B', numero_convenio: 1002, fecha_firma_conv: '2024-02-20' },
  { nombre_empr: 'Soluciones Digitales Extremadura', cif_empr: 'B34567890', localidad_empr: 'Badajoz', provincia_empr: 'Badajoz', calle_empr: 'Plaza España, 8', cod_postal_empr: '06001', telefono_empr: '924345678', correo_empr: 'admin@soldigital.com', nombre_repr: 'Pedro', apellidos_repr: 'Martínez Ruiz', dni_repr: '34567890C', numero_convenio: 1003, fecha_firma_conv: '2024-03-10' },
  { nombre_empr: 'Desarrollo Web Ibérico', cif_empr: 'B45678901', localidad_empr: 'Mérida', provincia_empr: 'Badajoz', calle_empr: 'Av. Juan Carlos I, 45', cod_postal_empr: '06800', telefono_empr: '924456789', correo_empr: 'info@webiberico.es', nombre_repr: 'Ana', apellidos_repr: 'Fernández Gil', dni_repr: '45678901D', numero_convenio: 1004, fecha_firma_conv: '2024-01-25' },
  { nombre_empr: 'Sistemas Integrados S.A.', cif_empr: 'A56789012', localidad_empr: 'Plasencia', provincia_empr: 'Cáceres', calle_empr: 'C/ Trujillo, 23', cod_postal_empr: '10600', telefono_empr: '927567890', correo_empr: 'sistemas@integrados.com', nombre_repr: 'Carlos', apellidos_repr: 'López Moreno', dni_repr: '56789012E', numero_convenio: 1005, fecha_firma_conv: '2024-04-05' },
  { nombre_empr: 'Consultoría TIC Norte', cif_empr: 'B67890123', localidad_empr: 'Navalmoral', provincia_empr: 'Cáceres', calle_empr: 'C/ Real, 67', cod_postal_empr: '10300', telefono_empr: '927678901', correo_empr: 'consultoria@ticnorte.es', nombre_repr: 'Laura', apellidos_repr: 'Gómez Prieto', dni_repr: '67890123F', numero_convenio: 1006, fecha_firma_conv: '2024-02-14' },
  { nombre_empr: 'Innovación Digital Plus', cif_empr: 'B78901234', localidad_empr: 'Coria', provincia_empr: 'Cáceres', calle_empr: 'Plaza Mayor, 12', cod_postal_empr: '10800', telefono_empr: '927789012', correo_empr: 'digital@innovplus.com', nombre_repr: 'Miguel', apellidos_repr: 'Sánchez Vega', dni_repr: '78901234G', numero_convenio: 1007, fecha_firma_conv: '2024-03-22' },
  { nombre_empr: 'Grupo Empresarial Tech', cif_empr: 'A89012345', localidad_empr: 'Trujillo', provincia_empr: 'Cáceres', calle_empr: 'Av. Extremadura, 89', cod_postal_empr: '10200', telefono_empr: '927890123', correo_empr: 'grupo@emptech.es', nombre_repr: 'Isabel', apellidos_repr: 'Jiménez Castro', dni_repr: '89012345H', numero_convenio: 1008, fecha_firma_conv: '2024-01-30' },
  { nombre_empr: 'Software Factory Extremadura', cif_empr: 'B90123456', localidad_empr: 'Plasencia', provincia_empr: 'Cáceres', calle_empr: 'C/ Gabriel y Galán, 34', cod_postal_empr: '10600', telefono_empr: '927901234', correo_empr: 'factory@softex.com', nombre_repr: 'Francisco', apellidos_repr: 'Ruiz Delgado', dni_repr: '90123456I', numero_convenio: 1009, fecha_firma_conv: '2024-04-12' },
  { nombre_empr: 'Ciberseguridad Oeste', cif_empr: 'B01234567', localidad_empr: 'Cáceres', provincia_empr: 'Cáceres', calle_empr: 'C/ Gran Vía, 56', cod_postal_empr: '10001', telefono_empr: '927012345', correo_empr: 'seguridad@ciberoeste.es', nombre_repr: 'Elena', apellidos_repr: 'Torres Blanco', dni_repr: '01234567J', numero_convenio: 1010, fecha_firma_conv: '2024-02-28' },
  { nombre_empr: 'Aplicaciones Móviles del Sur', cif_empr: 'B11223344', localidad_empr: 'Badajoz', provincia_empr: 'Badajoz', calle_empr: 'C/ Menacho, 78', cod_postal_empr: '06001', telefono_empr: '924112233', correo_empr: 'apps@movilsur.com', nombre_repr: 'Roberto', apellidos_repr: 'Navarro Ortiz', dni_repr: '11223344K', numero_convenio: 1011, fecha_firma_conv: '2024-03-18' },
  { nombre_empr: 'Cloud Computing Iberia', cif_empr: 'A22334455', localidad_empr: 'Plasencia', provincia_empr: 'Cáceres', calle_empr: 'Paseo Estación, 21', cod_postal_empr: '10600', telefono_empr: '927223344', correo_empr: 'cloud@iberia.es', nombre_repr: 'Patricia', apellidos_repr: 'Serrano Molina', dni_repr: '22334455L', numero_convenio: 1012, fecha_firma_conv: '2024-01-08' },
  { nombre_empr: 'Inteligencia Artificial Extremeña', cif_empr: 'B33445566', localidad_empr: 'Mérida', provincia_empr: 'Badajoz', calle_empr: 'Av. Lusitania, 43', cod_postal_empr: '06800', telefono_empr: '924334455', correo_empr: 'ia@extremena.com', nombre_repr: 'David', apellidos_repr: 'Castro Romero', dni_repr: '33445566M', numero_convenio: 1013, fecha_firma_conv: '2024-04-20' },
  { nombre_empr: 'E-commerce Solutions', cif_empr: 'B44556677', localidad_empr: 'Cáceres', provincia_empr: 'Cáceres', calle_empr: 'C/ San Antón, 91', cod_postal_empr: '10001', telefono_empr: '927445566', correo_empr: 'ecommerce@solutions.es', nombre_repr: 'Cristina', apellidos_repr: 'Morales Herrera', dni_repr: '44556677N', numero_convenio: 1014, fecha_firma_conv: '2024-02-05' },
  { nombre_empr: 'Gaming Studios Península', cif_empr: 'B55667788', localidad_empr: 'Plasencia', provincia_empr: 'Cáceres', calle_empr: 'C/ Berrozanas, 12', cod_postal_empr: '10600', telefono_empr: '927556677', correo_empr: 'gaming@peninsula.com', nombre_repr: 'Javier', apellidos_repr: 'Pérez Lozano', dni_repr: '55667788O', numero_convenio: 1015, fecha_firma_conv: '2024-03-28' },
  { nombre_empr: 'Blockchain Tech Ibérica', cif_empr: 'A66778899', localidad_empr: 'Badajoz', provincia_empr: 'Badajoz', calle_empr: 'Av. Europa, 56', cod_postal_empr: '06001', telefono_empr: '924667788', correo_empr: 'blockchain@iberica.es', nombre_repr: 'Raquel', apellidos_repr: 'Díaz Campos', dni_repr: '66778899P', numero_convenio: 1016, fecha_firma_conv: '2024-01-19' },
  { nombre_empr: 'Data Analytics Extremadura', cif_empr: 'B77889900', localidad_empr: 'Plasencia', provincia_empr: 'Cáceres', calle_empr: 'C/ Talavera, 34', cod_postal_empr: '10600', telefono_empr: '927778899', correo_empr: 'data@analytics.com', nombre_repr: 'Alberto', apellidos_repr: 'Vargas Medina', dni_repr: '77889900Q', numero_convenio: 1017, fecha_firma_conv: '2024-04-08' },
  { nombre_empr: 'Robótica Industrial del Oeste', cif_empr: 'B88990011', localidad_empr: 'Cáceres', provincia_empr: 'Cáceres', calle_empr: 'Polígono Industrial, 23', cod_postal_empr: '10001', telefono_empr: '927889900', correo_empr: 'robotica@oeste.es', nombre_repr: 'Carmen', apellidos_repr: 'Iglesias Ramos', dni_repr: '88990011R', numero_convenio: 1018, fecha_firma_conv: '2024-02-17' },
  { nombre_empr: 'Internet of Things Iberia', cif_empr: 'B99001122', localidad_empr: 'Mérida', provincia_empr: 'Badajoz', calle_empr: 'Parque Tecnológico, 7', cod_postal_empr: '06800', telefono_empr: '924990011', correo_empr: 'iot@iberia.com', nombre_repr: 'Daniel', apellidos_repr: 'Flores Benítez', dni_repr: '99001122S', numero_convenio: 1019, fecha_firma_conv: '2024-03-30' },
  { nombre_empr: 'Desarrollo Sostenible Digital', cif_empr: 'A00112233', localidad_empr: 'Plasencia', provincia_empr: 'Cáceres', calle_empr: 'Av. Jerte, 78', cod_postal_empr: '10600', telefono_empr: '927001122', correo_empr: 'desarrollo@sostenible.es', nombre_repr: 'Silvia', apellidos_repr: 'Guerrero Santos', dni_repr: '00112233T', numero_convenio: 1020, fecha_firma_conv: '2024-01-12' }
];

async function crearEmpresa(empresa) {
  try {
    const response = await fetch(API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(empresa)
    });
    
    const data = await response.json();
    if (data.success) {
      console.log(`✓ Empresa creada: ${empresa.nombre_empr} (ID: ${data.id})`);
    } else {
      console.error(`✗ Error creando ${empresa.nombre_empr}:`, data.error);
    }
  } catch (error) {
    console.error(`✗ Error en petición para ${empresa.nombre_empr}:`, error.message);
  }
}

async function crearTodasLasEmpresas() {
  console.log('Iniciando creación de 20 empresas de prueba...\n');
  
  for (const empresa of empresasPrueba) {
    await crearEmpresa(empresa);
    // Pequeña pausa entre peticiones para no saturar el servidor
    await new Promise(resolve => setTimeout(resolve, 500));
  }
  
  console.log('\n¡Proceso completado!');
}

// Ejecutar
crearTodasLasEmpresas();
