const PADRON_API_URL = process.env.PADRON_API_URL; 

/**
 * Consulta el padrón electoral por número de cédula.
 * Llama al API PHP que corre en Apache/XAMPP.
 * @param {string} cedula
 * @returns {Object|null} Datos de la persona o null si no existe
 */
const consultarCedula = async (cedula) => {
    const response = await fetch(`${PADRON_API_URL}?cedula=${cedula}`);

    if (response.status === 404) {
        return null;
    }

    if (!response.ok) {
        throw new Error(`Error al consultar el padrón: ${response.status}`);
    }

    return await response.json();
};

module.exports = { consultarCedula };
