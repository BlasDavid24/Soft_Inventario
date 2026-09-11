/**
 * Extrae las iniciales para los avatares.
 * Prioriza Nombre + Apellido; si faltan, usa las primeras letras del username.
 */
export function obtenerIniciales(nombre, apellido, username) {
  if (nombre && apellido) {
    return `${nombre[0]}${apellido[0]}`.toUpperCase();
  }
  if (nombre) {
    return nombre.slice(0, 2).toUpperCase();
  }
  return (username ? username.slice(0, 2) : '??').toUpperCase();
}

