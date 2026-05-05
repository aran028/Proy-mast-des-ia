# Configuración de n8n en Railway para Scraping de Videos

Este documento explica cómo configurar n8n en Railway para hacer scraping automático de videos de YouTube e Instagram, clasificarlos con IA y enviarlos a tu aplicación.

## Paso 1: Deploy de n8n en Railway

### 1.1 Crear cuenta en Railway

1. Ve a https://railway.app/
2. Regístrate con GitHub
3. Verifica tu email

### 1.2 Desplegar n8n

1. En Railway, haz clic en "New Project"
2. Selecciona "Deploy from Template"
3. Busca "n8n" en el marketplace
4. O usa este link directo: https://railway.app/template/n8n
5. Haz clic en "Deploy Now"

### 1.3 Configurar variables de entorno

En Railway, ve a tu proyecto n8n y añade estas variables:

```env
# Autenticación básica de n8n
N8N_BASIC_AUTH_ACTIVE=true
N8N_BASIC_AUTH_USER=admin
N8N_BASIC_AUTH_PASSWORD=tu_password_super_seguro_aqui

# URL de tu aplicación
N8N_WEBHOOK_URL=https://n8n-production-xxxx.up.railway.app

# Timezone
GENERIC_TIMEZONE=Europe/Madrid

# PostgreSQL (Railway lo configura automáticamente)
DB_TYPE=postgresdb
DB_POSTGRESDB_HOST=${{PGHOST}}
DB_POSTGRESDB_PORT=${{PGPORT}}
DB_POSTGRESDB_DATABASE=${{PGDATABASE}}
DB_POSTGRESDB_USER=${{PGUSER}}
DB_POSTGRESDB_PASSWORD=${{PGPASSWORD}}
```

### 1.4 Obtener la URL de n8n

Después del deploy, Railway te dará una URL como:
```
https://n8n-production-xxxx.up.railway.app
```

Guarda esta URL, la necesitarás.

## Paso 2: Configurar APIs externas

### 2.1 YouTube Data API

1. Ve a https://console.cloud.google.com/
2. Crea un nuevo proyecto o selecciona uno existente
3. Habilita "YouTube Data API v3"
4. Ve a "Credenciales" → "Crear credenciales" → "Clave de API"
5. Copia la API Key

**Límites gratuitos:**
- 10,000 unidades/día
- Cada búsqueda = ~100 unidades
- ~100 búsquedas/día gratis

### 2.2 OpenAI API (para clasificación con IA)

1. Ve a https://platform.openai.com/
2. Crea una cuenta
3. Ve a "API Keys"
4. Crea una nueva API Key
5. Copia la key

**Costos aproximados:**
- GPT-3.5-turbo: ~$0.002 por clasificación
- GPT-4o-mini: ~$0.0001 por clasificación (recomendado)

### 2.3 Instagram Graph API (opcional)

Instagram es más complejo y requiere:
1. Cuenta de Facebook Developer
2. App de Facebook aprobada
3. Permisos de Instagram Business

**Alternativa más simple:** Usar servicios de terceros como:
- RapidAPI Instagram scraper
- Apify Instagram scraper

## Paso 3: Configurar variables en tu aplicación Next.js

Añade estas variables a tu `.env.local` y al dashboard de Vercel:

```env
# API Key para que n8n pueda crear videos
N8N_API_KEY=genera_una_key_aleatoria_segura_aqui

# URL de n8n (opcional, si tu app necesita llamar a n8n)
N8N_WEBHOOK_URL=https://n8n-production-xxxx.up.railway.app
```

Para generar una API key segura:
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

## Paso 4: Crear Workflow en n8n - YouTube Scraper

### 4.1 Acceder a n8n

1. Ve a tu URL de n8n: `https://n8n-production-xxxx.up.railway.app`
2. Login con las credenciales que configuraste

### 4.2 Crear nuevo workflow

1. Haz clic en "New Workflow"
2. Nombra el workflow: "YouTube Video Scraper"

### 4.3 Configurar nodos

#### Nodo 1: Schedule Trigger

```
Tipo: Schedule Trigger
Configuración:
- Trigger Interval: Hours
- Hours Between Triggers: 6
- Trigger at Hour: 0, 6, 12, 18
```


#### Nodo 2: HTTP Request - Obtener Tools desde tu API
```
En lugar de "Set", añade un nodo "HTTP Request"

Configuración:

Method: GET
URL: http://localhost:3000/api/tools (o tu URL de Vercel si ya está desplegado)
Authentication: None
Options → Response Format: JSON
Ejecuta el nodo

Esto traerá todas tus tools con sus nombres y tags.
```


### Nodo 3 (nuevo): Code - Generar búsquedas desde tools
```

Añade un nodo "Code"
Configuración:

// Generar términos de búsqueda desde las tools
const tools = $input.all();
const searches = [];

for (const tool of tools) {
  const toolData = tool.json;
  
  // Crear búsqueda con el nombre de la tool
  searches.push({
    search_query: `${toolData.name} tutorial`,
    tool_id: toolData.id,
    tool_name: toolData.name,
    playlist_id: toolData.playlistId,
    tags: toolData.tags || []
  });
  
  // Si tiene tags, crear búsquedas adicionales
  if (toolData.tags && toolData.tags.length > 0) {
    const mainTag = toolData.tags[0];
    searches.push({
      search_query: `${mainTag} ${toolData.name}`,
      tool_id: toolData.id,
      tool_name: toolData.name,
      playlist_id: toolData.playlistId,
      tags: toolData.tags
    });
  }
}

// Limitar a 10 búsquedas para no exceder quota de YouTube
return searches.slice(0, 10).map(s => ({ json: s }));
Ejecuta el nodo
Ahora tendrás múltiples búsquedas generadas automáticamente desde tus tools.

```

#### Nodo 4: Loop Over Items (Split In Batches)
```
Añade un nodo "Split In Batches"
Configuración:
Batch Size: 1
Options → Reset: true
Esto procesará cada búsqueda una por una.
```

#### Nodo 5: Set - Añadir max_results
```
Añade un nodo "Set"
Configuración:
Keep Only Set: false
Añade un valor:
Name: max_results
Value: 3 (3 videos por búsqueda)

```


Tipo: HTTP Request
Configuración:
- Method: GET
- URL: https://www.googleapis.com/youtube/v3/search
- Query Parameters:
  - part: snippet
  - q: {{ $json.search_query }}
  - type: video
  - maxResults: {{ $json.max_results }}
  - publishedAfter: {{ $json.published_after }}
  - key: TU_YOUTUBE_API_KEY
- Response Format: JSON
```

#### Nodo 5: Loop Over Results

```
Tipo: Split In Batches
Configuración:
- Batch Size: 1
```

#### Nodo 6: OpenAI - Clasificar Video

```
Tipo: OpenAI
Configuración:
- Resource: Chat
- Model: gpt-4o-mini
- Prompt:
"""
Clasifica este video de YouTube en una de nuestras playlists y tools.

Título: {{ $json.snippet.title }}
Descripción: {{ $json.snippet.description }}

Playlists disponibles:
- Motores y Modelos de IA (id: uuid-playlist-1)
- Herramientas de Desarrollo (id: uuid-playlist-2)
- Automatización (id: uuid-playlist-3)

Tools disponibles:
- GitHub Copilot (id: uuid-tool-1, tags: ai, coding, assistant)
- ChatGPT (id: uuid-tool-2, tags: ai, chat, assistant)
- Cursor (id: uuid-tool-3, tags: ai, coding, ide)

Responde SOLO con un JSON válido:
{
  "playlist_id": "uuid",
  "tool_id": "uuid",
  "confidence": 0.95,
  "tags": ["tag1", "tag2"]
}
"""
- Temperature: 0.3
```

#### Nodo 7: Code - Parse OpenAI Response

```
Tipo: Code
Configuración:
const openaiResponse = $input.first().json.message.content;
const classification = JSON.parse(openaiResponse);

// Combinar datos del video con clasificación
return [{
  json: {
    title: $('HTTP Request').item.json.snippet.title,
    description: $('HTTP Request').item.json.snippet.description,
    thumbnail_url: $('HTTP Request').item.json.snippet.thumbnails.high.url,
    video_url: `https://www.youtube.com/watch?v=${$('HTTP Request').item.json.id.videoId}`,
    platform: 'youtube',
    platform_video_id: $('HTTP Request').item.json.id.videoId,
    author: $('HTTP Request').item.json.snippet.channelTitle,
    author_url: `https://www.youtube.com/channel/${$('HTTP Request').item.json.snippet.channelId}`,
    published_at: $('HTTP Request').item.json.snippet.publishedAt,
    playlist_id: classification.playlist_id,
    tool_id: classification.tool_id,
    tags: classification.tags,
    ai_classified: true,
    classification_confidence: classification.confidence
  }
}];
```

#### Nodo 8: IF - Filter by Confidence

```
Tipo: IF
Configuración:
- Condition: Number
- Value 1: {{ $json.classification_confidence }}
- Operation: Larger
- Value 2: 0.7
```

#### Nodo 9: HTTP Request - Send to Your API

```
Tipo: HTTP Request
Configuración:
- Method: POST
- URL: https://tu-app.vercel.app/api/videos
- Headers:
  - x-api-key: TU_N8N_API_KEY
  - Content-Type: application/json
- Body: {{ $json }}
- Response Format: JSON
```

#### Nodo 10: Error Handler (opcional)

```
Tipo: Error Trigger
Configuración:
- Conectar a un nodo de notificación (Slack, Email, etc.)
```

### 4.4 Activar el workflow

1. Haz clic en "Active" en la esquina superior derecha
2. El workflow se ejecutará cada 6 horas automáticamente

## Paso 5: Workflow para Instagram (Simplificado)

Instagram es más complejo. Opciones:

### Opción A: Usar RapidAPI

1. Regístrate en https://rapidapi.com/
2. Busca "Instagram" en el marketplace
3. Suscríbete a un servicio (muchos tienen plan gratuito)
4. Usa el endpoint de búsqueda en n8n

### Opción B: Usar Apify

1. Regístrate en https://apify.com/
2. Usa el actor "Instagram Scraper"
3. Configura n8n para llamar a Apify API

## Paso 6: Testing

### 6.1 Test manual del workflow

1. En n8n, abre tu workflow
2. Haz clic en "Execute Workflow"
3. Verifica que los videos se crean en tu base de datos

### 6.2 Verificar en tu aplicación

```bash
# Consultar videos en Supabase
SELECT * FROM videos ORDER BY created_at DESC LIMIT 10;

# O usar tu API
curl https://tu-app.vercel.app/api/videos
```

### 6.3 Aprobar videos

Los videos se crean con `status='pending'`. Para aprobarlos:

1. Ve al panel admin: `https://tu-app.vercel.app/admin/videos`
2. Revisa los videos pendientes
3. Aprueba o rechaza cada uno

## Paso 7: Optimizaciones

### 7.1 Mejorar la clasificación con IA

Actualiza el prompt de OpenAI con:
- Ejemplos de clasificaciones correctas
- Más contexto sobre tus playlists y tools
- Instrucciones más específicas

### 7.2 Añadir más fuentes

- TikTok (usando TikTok API o scrapers)
- Vimeo
- Twitch clips
- Twitter/X videos

### 7.3 Deduplicación

Añade un nodo que verifique si el video ya existe:

```javascript
// Nodo Code antes de crear el video
const videoId = $json.platform_video_id;
const platform = $json.platform;

// Llamar a tu API para verificar
const response = await fetch(
  `https://tu-app.vercel.app/api/videos/check?platform=${platform}&videoId=${videoId}`
);

if (response.status === 200) {
  // Video ya existe, skip
  return [];
}

return [$input.item];
```

### 7.4 Notificaciones

Añade un nodo al final para notificarte cuando se encuentren videos nuevos:
- Slack
- Discord
- Email
- Telegram

## Costos estimados

### Railway (n8n hosting)
- Plan Hobby: $5/mes
- Incluye: 500 horas de ejecución, PostgreSQL

### APIs
- YouTube Data API: Gratis (10k unidades/día)
- OpenAI GPT-4o-mini: ~$0.01/día (100 clasificaciones)
- Instagram (RapidAPI): $0-10/mes según plan

**Total estimado: $5-15/mes**

## Troubleshooting

### Error: "Unauthorized" al crear videos

Verifica que:
1. La API key en n8n coincide con `N8N_API_KEY` en Vercel
2. El header `x-api-key` se está enviando correctamente

### Error: YouTube API quota exceeded

Solución:
1. Reduce la frecuencia del workflow (cada 12h en lugar de 6h)
2. Reduce `max_results` por búsqueda
3. Crea múltiples proyectos de Google Cloud para más quota

### Videos no aparecen en la app

Verifica:
1. El video tiene `status='approved'` en la base de datos
2. El `playlist_id` o `tool_id` son correctos
3. Las políticas RLS de Supabase permiten leer videos aprobados

### OpenAI devuelve JSON inválido

Añade validación en el nodo Code:

```javascript
try {
  const classification = JSON.parse(openaiResponse);
  // ... resto del código
} catch (error) {
  // Log error y skip este video
  console.error('Invalid JSON from OpenAI:', openaiResponse);
  return [];
}
```

## Próximos pasos

1. Implementar moderación automática con IA
2. Añadir sistema de votación de usuarios
3. Crear dashboard de analytics de videos
4. Implementar recomendaciones personalizadas
5. Añadir transcripciones automáticas

## Recursos adicionales

- Documentación de n8n: https://docs.n8n.io/
- YouTube Data API: https://developers.google.com/youtube/v3
- OpenAI API: https://platform.openai.com/docs
- Railway Docs: https://docs.railway.app/
