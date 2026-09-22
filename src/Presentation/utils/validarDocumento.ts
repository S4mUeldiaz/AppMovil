export interface ReglaDocumento {
  nombre: string;
  min: number;
  max: number;
  soloNumeros: boolean;
}

export const REGLAS_DOCUMENTO: Record<number, ReglaDocumento> = {
  1: { nombre: 'La cédula de ciudadanía', min: 6, max: 10, soloNumeros: true },
  2: { nombre: 'La cédula de extranjería', min: 6, max: 7, soloNumeros: true },
  3: { nombre: 'La tarjeta de identidad', min: 10, max: 11, soloNumeros: true },
  4: { nombre: 'El pasaporte', min: 6, max: 9, soloNumeros: false },
  5: { nombre: 'El NIT', min: 9, max: 10, soloNumeros: true },
};

export interface ResultadoValidacion {
  valido: boolean;
  mensaje: string;
}

export function validarNumeroDocumento(
  numeroDocumento: string,
  idTipoDocumento: number
): ResultadoValidacion {
  const regla = REGLAS_DOCUMENTO[idTipoDocumento];

  if (!regla) {
    return { valido: false, mensaje: 'Selecciona un tipo de documento válido' };
  }

  const patron = regla.soloNumeros ? /^\d+$/ : /^[a-zA-Z0-9]+$/;
  if (!patron.test(numeroDocumento)) {
    return {
      valido: false,
      mensaje: regla.soloNumeros
        ? `${regla.nombre} solo puede contener números`
        : `${regla.nombre} solo puede contener letras y números`,
    };
  }

  if (numeroDocumento.length < regla.min || numeroDocumento.length > regla.max) {
    return {
      valido: false,
      mensaje: `${regla.nombre} debe tener entre ${regla.min} y ${regla.max} ${
        regla.soloNumeros ? 'dígitos' : 'caracteres'
      }`,
    };
  }

  return { valido: true, mensaje: '' };
}
