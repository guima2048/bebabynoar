export function slugify(str: string) {
  return str
    .normalize('NFD').replace(/\u0300-\u036f/g, '') // remove acentos
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-+|-+$/g, '');
} 