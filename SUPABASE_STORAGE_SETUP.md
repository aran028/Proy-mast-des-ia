# Configuración de Supabase Storage para Imágenes

Este documento explica cómo configurar Supabase Storage para que el sistema de upload de imágenes funcione correctamente.

## Pasos para configurar Supabase Storage

### 1. Acceder a Supabase Dashboard

1. Ve a [https://supabase.com/dashboard](https://supabase.com/dashboard)
2. Selecciona tu proyecto
3. En el menú lateral, haz clic en **Storage**

### 2. Crear el Bucket

1. Haz clic en **"New bucket"** o **"Create a new bucket"**
2. Configura el bucket con estos valores:
   - **Name**: `tools-images`
   - **Public bucket**: ✅ **Activado** (importante para que las URLs sean públicas)
   - **File size limit**: 5 MB (opcional, ya validamos en el código)
   - **Allowed MIME types**: `image/*` (opcional, ya validamos en el código)
3. Haz clic en **"Create bucket"**

### 3. Configurar Políticas de Acceso (RLS)

Por defecto, Supabase Storage tiene Row Level Security (RLS) activado. Necesitas crear políticas para permitir:

#### Política 1: Permitir subida de imágenes (solo admins)

```sql
-- En Supabase Dashboard > Storage > Policies > New Policy
-- Nombre: "Admin can upload images"
-- Operación: INSERT
-- Target roles: authenticated
-- Policy definition:
CREATE POLICY "Admin can upload images"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'tools-images' 
  AND auth.uid() IN (
    SELECT id FROM profiles WHERE role = 'admin'
  )
);
```

#### Política 2: Permitir lectura pública de imágenes

```sql
-- Nombre: "Public can view images"
-- Operación: SELECT
-- Target roles: public
-- Policy definition:
CREATE POLICY "Public can view images"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'tools-images');
```

#### Política 3: Permitir eliminación de imágenes (solo admins)

```sql
-- Nombre: "Admin can delete images"
-- Operación: DELETE
-- Target roles: authenticated
-- Policy definition:
CREATE POLICY "Admin can delete images"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'tools-images'
  AND auth.uid() IN (
    SELECT id FROM profiles WHERE role = 'admin'
  )
);
```

### 4. Verificar la configuración

1. Ve a **Storage** > **tools-images**
2. Deberías ver el bucket vacío
3. Intenta subir una imagen desde el panel admin de tu aplicación
4. Si todo está bien configurado, la imagen se subirá y verás la URL pública

### 5. Estructura de URLs

Las imágenes subidas tendrán URLs con este formato:

```
https://[tu-proyecto].supabase.co/storage/v1/object/public/images/[nombre-archivo]
```

Ejemplo:
```
https://abcdefgh.supabase.co/storage/v1/object/public/images/1234567890-abc123.jpg
```

## Solución de problemas

### Error: "new row violates row-level security policy"

**Causa**: Las políticas RLS no están configuradas correctamente.

**Solución**: Verifica que hayas creado las políticas mencionadas en el paso 3.

### Error: "Bucket not found"

**Causa**: El bucket 'tools-images' no existe.

**Solución**: Crea el bucket siguiendo el paso 2.

### Las imágenes no se ven (404)

**Causa**: El bucket no está configurado como público.

**Solución**: 
1. Ve a Storage > tools-images
2. Haz clic en el icono de configuración (⚙️)
3. Activa "Public bucket"
4. Guarda los cambios

### Error: "File size exceeds limit"

**Causa**: La imagen es mayor a 5MB.

**Solución**: Reduce el tamaño de la imagen antes de subirla o aumenta el límite en el código.

## Alternativa: Usar carpeta public/ para imágenes estáticas

Si prefieres no configurar Supabase Storage por ahora, puedes:

1. Crear una carpeta `public/images/tools/` en tu proyecto
2. Colocar las imágenes ahí manualmente
3. Usar rutas relativas en el campo de imagen: `/images/tools/mi-imagen.jpg`
4. Las imágenes se subirán a Vercel con el deploy

**Ventajas**: No necesitas configuración adicional
**Desventajas**: No puedes subir imágenes desde el admin, solo manualmente

## Resumen

✅ Crear bucket `tools-images` (público)
✅ Configurar 3 políticas RLS (upload, view, delete)
✅ Verificar que funciona subiendo una imagen de prueba

Una vez configurado, el sistema de upload funcionará automáticamente.
