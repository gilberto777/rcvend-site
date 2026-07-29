/**
 * Validação de dados - sem Zod para evitar complexidade
 * Usar isto para validações manuais simples e seguras
 */

export type ValidationError = {
  field: string;
  message: string;
};

export type ValidationResult = {
  valid: boolean;
  errors: ValidationError[];
};

export function validateProperty(data: unknown): ValidationResult {
  const errors: ValidationError[] = [];

  if (!data || typeof data !== 'object') {
    return { valid: false, errors: [{ field: 'root', message: 'Dados inválidos' }] };
  }

  const prop = data as Record<string, unknown>;

  // Validar título
  if (!prop.title || typeof prop.title !== 'string' || prop.title.trim().length === 0) {
    errors.push({ field: 'title', message: 'Título é obrigatório' });
  } else if (prop.title.length > 255) {
    errors.push({ field: 'title', message: 'Título muito longo (máx 255 caracteres)' });
  }

  // Validar slug
  if (!prop.slug || typeof prop.slug !== 'string' || prop.slug.trim().length === 0) {
    errors.push({ field: 'slug', message: 'Slug é obrigatório' });
  } else if (!/^[a-z0-9-]+$/.test(prop.slug)) {
    errors.push({ field: 'slug', message: 'Slug deve conter apenas letras minúsculas, números e hífen' });
  }

  // Validar descrição
  if (!prop.description || typeof prop.description !== 'string' || prop.description.trim().length === 0) {
    errors.push({ field: 'description', message: 'Descrição é obrigatória' });
  } else if (prop.description.length < 20) {
    errors.push({ field: 'description', message: 'Descrição muito curta (mínimo 20 caracteres)' });
  }

  // Validar tipo
  const validTypes = ['apartment', 'studio', 'house', 'penthouse', 'land', 'commercial'];
  if (!prop.type || !validTypes.includes(String(prop.type))) {
    errors.push({ field: 'type', message: 'Tipo inválido' });
  }

  // Validar propósito
  const validPurposes = ['sale', 'rent', 'launch'];
  if (!prop.purpose || !validPurposes.includes(String(prop.purpose))) {
    errors.push({ field: 'purpose', message: 'Propósito inválido' });
  }

  // Validar preço
  if (prop.price === undefined || prop.price === null) {
    errors.push({ field: 'price', message: 'Preço é obrigatório' });
  } else {
    const price = Number(prop.price);
    if (isNaN(price) || price < 0) {
      errors.push({ field: 'price', message: 'Preço deve ser um número positivo' });
    }
  }

  // Validar área
  if (prop.area === undefined || prop.area === null) {
    errors.push({ field: 'area', message: 'Área é obrigatória' });
  } else {
    const area = Number(prop.area);
    if (isNaN(area) || area <= 0) {
      errors.push({ field: 'area', message: 'Área deve ser um número positivo' });
    }
  }

  // Validar dormitórios
  if (prop.bedrooms === undefined || prop.bedrooms === null) {
    errors.push({ field: 'bedrooms', message: 'Dormitórios é obrigatório' });
  } else {
    const bedrooms = Number(prop.bedrooms);
    if (isNaN(bedrooms) || bedrooms < 0) {
      errors.push({ field: 'bedrooms', message: 'Dormitórios deve ser um número não-negativo' });
    }
  }

  // Validar banheiros
  if (prop.bathrooms === undefined || prop.bathrooms === null) {
    errors.push({ field: 'bathrooms', message: 'Banheiros é obrigatório' });
  } else {
    const bathrooms = Number(prop.bathrooms);
    if (isNaN(bathrooms) || bathrooms < 0) {
      errors.push({ field: 'bathrooms', message: 'Banheiros deve ser um número não-negativo' });
    }
  }

  // Validar bairro
  if (!prop.neighborhood_name || typeof prop.neighborhood_name !== 'string' || prop.neighborhood_name.trim().length === 0) {
    errors.push({ field: 'neighborhood_name', message: 'Bairro é obrigatório' });
  }

  // Validar cidade
  if (!prop.city || typeof prop.city !== 'string' || prop.city.trim().length === 0) {
    errors.push({ field: 'city', message: 'Cidade é obrigatória' });
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}

export function validateLead(data: unknown): ValidationResult {
  const errors: ValidationError[] = [];

  if (!data || typeof data !== 'object') {
    return { valid: false, errors: [{ field: 'root', message: 'Dados inválidos' }] };
  }

  const lead = data as Record<string, unknown>;

  // Validar nome
  if (!lead.full_name || typeof lead.full_name !== 'string' || lead.full_name.trim().length === 0) {
    errors.push({ field: 'full_name', message: 'Nome é obrigatório' });
  } else if (lead.full_name.length > 255) {
    errors.push({ field: 'full_name', message: 'Nome muito longo' });
  }

  // Validar telefone
  if (!lead.phone || typeof lead.phone !== 'string' || lead.phone.trim().length === 0) {
    errors.push({ field: 'phone', message: 'Telefone é obrigatório' });
  } else if (!/^[\d\s\-\(\)+]+$/.test(lead.phone)) {
    errors.push({ field: 'phone', message: 'Telefone inválido' });
  }

  // Validar email (opcional, mas se preenchido, deve ser válido)
  if (lead.email && typeof lead.email === 'string' && lead.email.trim().length > 0) {
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(lead.email)) {
      errors.push({ field: 'email', message: 'E-mail inválido' });
    }
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}

export function getFieldError(errors: ValidationError[], field: string): string | null {
  const error = errors.find((e) => e.field === field);
  return error?.message ?? null;
}
