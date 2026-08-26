import { z } from "zod";

const phoneRegex = /^(\+57|57)?[3][0-9]{9}$/;

export const loginSchema = z.object({
  email: z.string().email("Correo electrónico inválido"),
  password: z.string().min(6, "La contraseña debe tener al menos 6 caracteres"),
});

export const registerSchema = z
  .object({
    full_name: z.string().min(2, "El nombre debe tener al menos 2 caracteres").max(100),
    email: z.string().email("Correo electrónico inválido"),
    password: z.string().min(8, "La contraseña debe tener al menos 8 caracteres"),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Las contraseñas no coinciden",
    path: ["confirmPassword"],
  });

export const addressSchema = z.object({
  full_name: z.string().min(2, "Nombre requerido").max(100),
  phone: z.string().regex(phoneRegex, "Número de teléfono colombiano inválido"),
  address_line1: z.string().min(5, "Dirección requerida").max(200),
  address_line2: z.string().max(200).optional().nullable(),
  city: z.string().min(2, "Ciudad requerida").max(100),
  department: z.string().min(1, "Departamento requerido"),
  postal_code: z.string().max(10).optional().nullable(),
  instructions: z.string().max(500).optional().nullable(),
});

export const productSchema = z.object({
  name: z.string().min(1).max(200),
  slug: z.string().min(1).max(200),
  description: z.string().max(2000).optional().nullable(),
  price: z.number().int().positive("El precio debe ser positivo"),
  category_id: z.string().uuid().optional().nullable(),
  is_active: z.boolean(),
});

export type LoginInput = z.infer<typeof loginSchema>;
export type RegisterInput = z.infer<typeof registerSchema>;
export type AddressInput = z.infer<typeof addressSchema>;
export type ProductInput = z.infer<typeof productSchema>;
