const { Pool } = require('pg');
const { text } = require('stream/consumers');

const pool = new Pool({
    user: 'postgres',
    host: 'localhost',
    database: 'always_music',
    password: '',
    port: 5432,
});

// Función para manejar los errores de la base de datos
function handleDatabaseError(error) {
    console.error('Error de la base de datos:', error.message);
    switch (error.code) {
        case '22P02': // Error de tipo de datos no válido
            throw new Error('Uno o más campos tienen un formato incorrecto. Verifique los datos proporcionados.');
        case '23505': // Error de restricción de unicidad
            throw new Error('El estudiante ya está registrado.');
        case '23502': // Error de restricción de clave externa
            throw new Error('Uno o más campos no pueden estar vacíos. Verifique los datos proporcionados.');
        default:
            throw new Error('Hubo un problema al procesar la solicitud.');
    }
}

// Función asincrónica para registrar un nuevo estudiante en la base de datos
async function agregarEstudiante(nombre, rut, curso, nivel) {
    try {
        const query = 'INSERT INTO estudiantes (nombre, rut, curso, nivel) VALUES ($1, $2, $3, $4)';
        await pool.query(query, [nombre, rut, curso, nivel]);
        console.log(`Estudiante ${nombre} agregado con éxito`);
    } catch (error) {
        handleDatabaseError(error);
    }
}

// Función asincrónica para obtener por consola el registro de un estudiante por medio de su rut
async function consultarEstudiantePorRut(rut) {
    try {
        const query = 'SELECT * FROM estudiantes WHERE rut = $1';
        const result = await pool.query(query, [rut]);
        if (result.rows.length === 0) {
            console.log('Estudiante no encontrado');
        } else {
            console.table(result.rows);
        }
    } catch (error) {
        handleDatabaseError(error);
    }
}

// Función asincrónica para obtener por consola todos los estudiantes registrados
async function consultarEstudiantes() {
    try {
        const query = 'SELECT * FROM estudiantes';
        const result = await pool.query(query);
        console.log('Registro actual:');
        console.table(result.rows);
    } catch (error) {
        handleDatabaseError(error);
    }
}

// Función asincrónica para actualizar los datos de un estudiante en la base de datos
async function actualizarEstudiante(nombre, rut, curso, nivel) {
    try {
        const query = 'UPDATE estudiantes SET nombre = $1, curso = $2, nivel = $3 WHERE rut = $4';
        const result = await pool.query(query, [nombre, curso, nivel, rut]);
        if (result.rowCount > 0) {
            console.log(`Estudiante ${nombre} editado con éxito`);
        } else {
            console.log('Estudiante no encontrado');
        }
    } catch (error) {
        handleDatabaseError(error);
    }
}

// Función asincrónica para eliminar el registro de un estudiante de la base de datos
async function eliminarEstudiante(rut) {
    try {
        const query = 'DELETE FROM estudiantes WHERE rut = $1';
        const result = await pool.query(query, [rut]);
        if (result.rowCount > 0) {
            console.log(`Registro de estudiante con rut ${rut} eliminado`);
        } else {
            console.log('Estudiante no encontrado');
        }
    } catch (error) {
        handleDatabaseError(error);
    }
}

// Lógica para procesar los argumentos de la línea de comandos
const args = process.argv.slice(2);
const comando = args[0];

switch (comando) {
    case 'nuevo':
        if (args.length === 5) {
            agregarEstudiante(args[1], args[2], args[3], args[4]);
        } else {
            console.log('Argumentos incorrectos. Uso: nuevo <nombre> <rut> <curso> <nivel>');
        }
        break;
    case 'consulta':
        consultarEstudiantes();
        break;
    case 'rut':
        if (args.length === 2) {
            consultarEstudiantePorRut(args[1]);
        }
        else {
            console.log('Argumentos incorrectos. Uso: rut <rut>');
        }
        break;
    case 'editar':
        if (args.length === 5) {
            actualizarEstudiante(args[1], args[2], args[3], args[4]);
        }
        if (typeof args[1] !== 'string' || typeof args[2] !== 'string' || typeof args[3] !== 'string' || isNaN(parseFloat(args[4]))) {
            console.log('Ingresaste un tipo de datos incorrectos, favor verifica nuevamente los datos ingresados');
        }
        else {
            console.log('Argumentos incorrectos. Uso: editar <nombre> <rut> <curso> <nivel>');
        }
        break;
    case 'eliminar':
        if (args.length === 2) {
            eliminarEstudiante(args[1]);
        } else {
            console.log('Argumentos incorrectos. Uso: eliminar <rut>');
        }
        break;
    default:
        console.log('Comando no reconocido');
}
