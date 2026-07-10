# AsistenteIA — Plataforma de IA para Instituciones Públicas

[![Open in Bolt](https://bolt.new/static/open-in-bolt.svg)](https://bolt.new/~/sb1-g8uqddgw)

Plataforma de inteligencia artificial en español diseñada para funcionarios del sector público. Permite redactar documentos oficiales, consultar normativa legal, resumir contenido y crear formatos estandarizados, todo focalizado en el marco legal e institucional del país configurado (por defecto: **Guatemala**).

Desarrollada por **Asociación Civil Red Ciudadana**.

---

## Tabla de contenidos

- [Características principales](#características-principales)
- [Arquitectura](#arquitectura)
- [Tecnologías](#tecnologías)
- [Requisitos](#requisitos)
- [Instalación](#instalación)
- [Configuración](#configuración)
- [Base de datos](#base-de-datos)
- [Edge Function](#edge-function)
- [Sistema de roles y permisos](#sistema-de-roles-y-permisos)
- [Sistema RAG](#sistema-rag)
- [Scripts disponibles](#scripts-disponibles)
- [Estructura del proyecto](#estructura-del-proyecto)

---

## Características principales

### Asistente IA conversacional
Chat interactivo con el asistente configurable (nombre, rol, estilo de respuesta, uso de emojis, citado de fuentes). Las respuestas se focalizan automáticamente en el país definido en los ajustes.

### Alcance geográfico configurable
Desde **Ajustes → Asistente IA**, se puede definir el país de referencia (Guatemala por defecto). Todas las respuestas del asistente se contextualizan con las leyes, reglamentos, plazos e instituciones de ese país.

### Casos de uso preconfigurados
Catálogo de casos de uso especializados (redacción de oficios, análisis de plazos legales, resumen de documentos, creación de formatos) cada uno con prompts especializados y sugerencias rápidas.

### Gestión de documentos
Carga, categorización y indexación de documentos institucionales con búsqueda de texto completo en español. Los documentos indexados se inyectan automáticamente como contexto en las respuestas del asistente (RAG).

### Plantillas y flujos de trabajo
Plantillas de documentos con marcadores de posición y flujos de trabajo multi-paso para procesos institucionales repetitivos.

### Estadísticas y actividad
Panel de estadísticas que registra eventos de actividad (consultas de IA, documentos añadidos, plantillas utilizadas, flujos iniciados) con gráficos de tendencias.

### Privacidad y cumplimiento
Módulo de privacidad con configuración de retención de datos, clasificación de información y revisión humana. Incluye checklist de cumplimiento normativo (LGTAIP, LGPDPPSO, NOM-151, MAAGTIC).

### Multi-proveedor de IA
Soporta múltiples proveedores de IA: **Anthropic (Claude)**, **OpenAI**, **Groq**, **Together AI** y **Ollama** (local). Las claves de API se almacenan de forma segura en Supabase Secrets o en la base de datos, y nunca se exponen al cliente.

### Roles y permisos
Sistema de control de acceso basado en roles con tres niveles: administrador, coordinador y analista. Cada rol tiene permisos configurables por sección.

---

## Arquitectura

```
┌─────────────────────────────────────────────────────┐
│                    Frontend (React)                   │
│                                                       │
│  ┌──────────┐ ┌───────────┐ ┌──────────┐ ┌─────────┐ │
│  │ Asistente │ │ Documentos │ │  Casos   │ │ Ajustes │ │
│  │   IA     │ │   (RAG)    │ │  de uso  │ │  + Auth │ │
│  └────┬─────┘ └─────┬─────┘ └────┬─────┘ └────┬────┘ │
│       │              │            │             │      │
│       └──────────────┴────────────┴─────────────┘      │
│                          │                            │
│                   Supabase Client SDK                   │
└──────────────────────────┬────────────────────────────┘
                           │
┌──────────────────────────┴────────────────────────────┐
│                    Supabase Backend                    │
│                                                        │
│  ┌──────────┐  ┌───────────┐  ┌─────────────────────┐ │
│  │ Postgres │  │   Auth    │  │  Edge Function      │ │
│  │ (RLS)    │  │ (email/pw)│  │  (proxy IA seguro)  │ │
│  └──────────┘  └───────────┘  └──────────┬──────────┘ │
│                                          │             │
└──────────────────────────────────────────┼─────────────┘
                                           │
                    ┌──────────────────────┴──────────────┐
                    │     Proveedores de IA externos      │
                    │  Anthropic · OpenAI · Groq · Ollama │
                    └─────────────────────────────────────┘
```

El cliente nunca se comunica directamente con los proveedores de IA. Toda solicitud pasa por la Edge Function, que resuelve las claves de API desde Supabase Secrets o la base de datos y actúa como proxy seguro.

---

## Tecnologías

| Tecnología | Versión | Rol |
|---|---|---|
| React | 18.3 | Framework de UI (SPA) |
| TypeScript | 5.5 | Tipado estático |
| Vite | 5.4 | Build tool y dev server |
| Tailwind CSS | 3.4 | Estilos (paleta personalizada: navy `#0d2240`, blue `#2563eb`) |
| Supabase | — | Backend: Postgres, Auth, Edge Functions, Secrets |
| `@supabase/supabase-js` | 2.57 | SDK de cliente Supabase |
| Deno Runtime | — | Ejecución de Edge Functions |
| lucide-react | 0.344 | Librería de iconos |
| ESLint | 9.9 | Linting |
| PostCSS + Autoprefixer | — | Procesamiento CSS |

---

## Requisitos

- **Node.js** 18 o superior
- **npm** 9 o superior (incluido con Node 18+)
- Un proyecto de **Supabase** aprovisionado con las siguientes variables de entorno:
  - `SUPABASE_URL` — URL del proyecto Supabase
  - `SUPABASE_ANON_KEY` — Clave anónima del proyecto
  - `SUPABASE_SERVICE_ROLE_KEY` — Clave de servicio (solo para Edge Functions)
  - `SUPABASE_DB_URL` — URL de conexión a Postgres (opcional, para migraciones)
- Al menos un **proveedor de IA** configurado con su clave de API:
  - Anthropic: variable `ANTHROPIC_API_KEY` en Supabase Secrets
  - OpenAI: variable `OPENAI_API_KEY` en Supabase Secrets
  - Groq: variable `GROQ_API_KEY` en Supabase Secrets
  - Together AI: variable `TOGETHER_API_KEY` en Supabase Secrets
  - Ollama: sin clave (ejecución local)

---

## Instalación

### 1. Clonar el repositorio

```bash
git clone <url-del-repositorio>
cd AsistenteIA
```

### 2. Instalar dependencias

```bash
npm install
```

### 3. Configurar variables de entorno

Crea un archivo `.env` en la raíz del proyecto con las credenciales de Supabase:

```env
VITE_SUPABASE_URL=https://<tu-proyecto>.supabase.co
VITE_SUPABASE_ANON_KEY=<tu-clave-anonima>
SUPABASE_URL=https://<tu-proyecto>.supabase.co
SUPABASE_ANON_KEY=<tu-clave-anonima>
SUPABASE_SERVICE_ROLE_KEY=<tu-clave-de-servicio>
SUPABASE_DB_URL=postgresql://<usuario>:<password>@<host>:<puerto>/<base>
```

> **Importante**: Las variables con prefijo `VITE_` se exponen al cliente. Nunca incluyas `SUPABASE_SERVICE_ROLE_KEY` con prefijo `VITE_`.

### 4. Aplicar migraciones de base de datos

Las migraciones se encuentran en `supabase/migrations/`. Aplica cada archivo SQL en orden en tu proyecto de Supabase (desde el editor SQL de Supabase o mediante la herramienta de migraciones):

```bash
# Los archivos se aplican en orden cronológico:
# 20260707192936_create_documents_schema.sql
# 20260707193737_create_flows_and_templates_schema.sql
# 20260707194845_create_activity_events_schema.sql
# 20260707195334_create_privacy_security_schema.sql
# 20260707200025_create_app_settings_schema.sql
# 20260707211129_create_ai_providers_schema.sql
# 20260707211137_add_active_model_to_app_settings.sql
# 20260707213002_add_platform_config_to_app_settings.sql
# 20260707215719_add_content_to_documents.sql
# 20260708002601_add_auth_roles_and_profiles.sql
# 20260708004509_add_role_permissions_table.sql
# 20260709234134_add_openai_provider.sql
# 20260710003002_add_api_key_set_column.sql
# 20260710011758_add_search_country_to_app_settings.sql
```

### 5. Configurar claves de IA en Supabase Secrets

Desde el dashboard de Supabase → **Edge Functions → Secrets**, agrega las claves de los proveedores que vayas a utilizar:

```
ANTHROPIC_API_KEY=sk-ant-...
OPENAI_API_KEY=sk-...
GROQ_API_KEY=gsk_...
TOGETHER_API_KEY=...
```

> Las claves en Supabase Secrets tienen prioridad sobre las almacenadas en la base de datos. Ollama no requiere clave.

### 6. Desplegar la Edge Function

La Edge Function del chat se encuentra en `supabase/functions/chat/index.ts`. Despliégala desde el dashboard de Supabase o con las herramientas MCP de Supabase.

### 7. Iniciar el servidor de desarrollo

```bash
npm run dev
```

La aplicación estará disponible en `http://localhost:5173`.

### 8. Compilar para producción

```bash
npm run build
```

Los archivos generados se encuentran en `dist/`. Puedes previsualizar la build con:

```bash
npm run preview
```

---

## Configuración

### Ajustes de la aplicación

Desde la sección **Ajustes** (requiere rol de administrador), puedes configurar:

#### Institución
- Nombre de la institución pública
- Departamento o área
- Estado/región
- Sitio web oficial
- Correo de contacto institucional

#### Asistente IA
- **Nombre del asistente** — Nombre personalizado que se muestra a los usuarios
- **Rol/descripción** — Descripción de la función del asistente
- **Alcance de búsqueda (país)** — País de referencia para focalizar las respuestas (Guatemala por defecto)
- **Estilo de respuesta** — Muy formal, formal o semiformal
- **Citar fuentes normativas** — El asistente incluye referencias a leyes y artículos
- **Sugerir siguientes pasos** — El asistente añade recomendaciones de acción al final
- **Usar emojis** — Permitir emojis en las respuestas

#### Modelos de IA
- Configuración de proveedores (Anthropic, OpenAI, Groq, Together AI, Ollama)
- Claves de API por proveedor
- Modelos disponibles con nombre display, ID del modelo y parámetros
- Modelo activo seleccionado

#### Apariencia
- Modo compacto (reduce espaciado)
- Mostrar marcas de tiempo en mensajes
- Indicador de escritura animado

#### Avanzado
- Máximo de tokens de contexto (4096–32768)
- Telemetría anónima
- Información de depuración

#### Roles y Usuarios (solo administrador)
- Asignación de roles a usuarios
- Configuración de permisos por rol y sección

---

## Base de datos

El proyecto utiliza **14 migraciones** que crean **11 tablas** principales:

| Tabla | Propósito |
|---|---|
| `app_settings` | Configuración global de la aplicación (institución, IA, apariencia, país de búsqueda) |
| `ai_providers` | Proveedores de IA (Anthropic, OpenAI, Groq, Together, Ollama) con claves y URLs |
| `ai_models` | Modelos de IA disponibles por proveedor |
| `document_categories` | Categorías para organizar documentos |
| `documents` | Documentos con nombre, extensión, descripción, contenido indexado, tags y estado |
| `flow_categories` | Categorías para flujos de trabajo |
| `document_templates` | Plantillas de documentos con marcadores de posición |
| `workflow_flows` | Flujos de trabajo multi-paso con pasos definidos |
| `activity_events` | Registro de eventos para estadísticas (consultas IA, documentos, plantillas) |
| `privacy_settings` | Configuración de privacidad (retención, clasificación, revisión humana) |
| `compliance_items` | Checklist de cumplimiento normativo (LGTAIP, LGPDPPSO, NOM-151, MAAGTIC) |
| `user_roles` | Asignación de roles a usuarios (administrador, coordinador, analista) |
| `profiles` | Perfiles de usuario |
| `role_permissions` | Permisos por rol y sección |

### Seguridad (RLS)

Todas las tablas tienen **Row Level Security (RLS)** habilitado. Las políticas permiten acceso `TO anon, authenticated` para las tablas de datos compartidos (configuración, documentos, plantillas) y `TO authenticated` para tablas que requieren sesión (roles, permisos, perfiles).

---

## Edge Function

### `chat/index.ts`

Proxy seguro entre el cliente y los proveedores de IA. Recibe un POST con `{ messages, model_record_id }` y:

1. Busca el modelo y su proveedor en la base de datos usando la service role key.
2. Resuelve la clave de API con prioridad: **Supabase Secret** → **base de datos**.
3. Enruta a la API correspondiente:
   - **Anthropic**: `api.anthropic.com/v1/messages` con header `x-api-key`.
   - **OpenAI-compatible** (OpenAI, Groq, Together, Ollama): `{base_url}/chat/completions` con Bearer auth. Detecta modelos de razonamiento (serie `o1`/`o3`) para usar `max_completion_tokens` en lugar de `temperature`.
4. Devuelve `{ content, model, provider }` o un mensaje de error en español.
5. Incluye headers CORS en todas las respuestas (preflight, éxito y error).

---

## Sistema de roles y permisos

El sistema de autenticación usa **Supabase Auth** (email/contraseña) con tres roles:

| Rol | Descripción |
|---|---|
| `administrador` | Acceso completo a todas las secciones (siempre permitido) |
| `coordinador` | Acceso configurable por sección (definido en `role_permissions`) |
| `analista` | Acceso configurable por sección (definido en `role_permissions`) |

- Usuarios no autenticados solo pueden acceder a **Inicio** y **Casos de uso**.
- Los permisos se cargan al iniciar sesión y se actualizan en tiempo real desde la tabla `role_permissions`.
- El administrador puede modificar permisos desde **Ajustes → Roles**.

---

## Sistema RAG

El sistema de **Retrieval-Augmented Generation** funciona del lado del cliente (`src/lib/rag.ts`):

1. **Recuperación**: Consulta todos los documentos activos desde Supabase.
2. **Scoring por palabras clave**: Tokeniza la consulta del usuario, filtra stopwords en español y palabras de menos de 3 caracteres, y puntúa cada documento contando coincidencias en nombre, descripción, contenido y tags.
3. **Ranking**: Prioriza documentos con contenido indexado sobre los que solo tienen metadata. Toma los 3 mejores resultados.
4. **Construcción de contexto**: Incluye hasta 3000 caracteres por documento bajo un encabezado identificado.
5. **Inyección**: El contexto se añade al system prompt enviado al asistente, indicando que debe basar sus respuestas en esos documentos.

> Este sistema es basado en palabras clave, no en embeddings vectoriales. La base de datos tiene un índice GIN de búsqueda de texto completo en español (`documents_fts_idx`), pero el scoring se realiza en memoria del cliente.

---

## Scripts disponibles

| Comando | Descripción |
|---|---|
| `npm run dev` | Inicia el servidor de desarrollo (Vite) en `localhost:5173` |
| `npm run build` | Compila el proyecto para producción en `dist/` |
| `npm run preview` | Previsualiza la build de producción localmente |
| `npm run lint` | Ejecuta ESLint sobre el proyecto |
| `npm run typecheck` | Verifica tipos con `tsc --noEmit` |

---

## Estructura del proyecto

```
AsistenteIA/
├── src/
│   ├── App.tsx                      # Componente raíz con routing por sección
│   ├── main.tsx                     # Punto de entrada
│   ├── index.css                    # Estilos globales (Tailwind)
│   ├── components/
│   │   ├── Navbar.tsx               # Barra de navegación con control de acceso
│   │   ├── HomePage.tsx             # Página de inicio con tarjetas de features
│   │   ├── AssistantPanel.tsx       # Panel de chat del asistente IA
│   │   ├── ChatMessage.tsx          # Renderizado de mensajes con markdown
│   │   ├── QuickActions.tsx         # Acciones rápidas del asistente
│   │   ├── DocumentsPanel.tsx       # Panel lateral de documentos
│   │   ├── UploadDocumentModal.tsx  # Modal de carga de documentos
│   │   ├── HumanReviewNotice.tsx    # Aviso de revisión humana
│   │   ├── PrivacySelector.tsx      # Selector de nivel de privacidad
│   │   ├── auth/
│   │   │   └── LoginPage.tsx        # Página de login (email/contraseña)
│   │   ├── documents/
│   │   │   ├── DocumentsPage.tsx     # Gestión de documentos
│   │   │   ├── DocumentModal.tsx     # Modal de edición de documento
│   │   │   ├── CategorySidebar.tsx  # Sidebar de categorías
│   │   │   ├── CategoryModal.tsx    # Modal de categoría
│   │   │   ├── ConfirmDeleteModal.tsx
│   │   │   └── DocumentViews.tsx    # Vistas de documento (lista/detalle)
│   │   ├── flows/
│   │   │   ├── FlowsPage.tsx         # Gestión de flujos y plantillas
│   │   │   ├── FlowCard.tsx
│   │   │   ├── FlowModal.tsx
│   │   │   ├── FlowDetailDrawer.tsx
│   │   │   ├── TemplateCard.tsx
│   │   │   ├── TemplateModal.tsx
│   │   │   └── FlowsCategorySidebar.tsx
│   │   ├── privacy/
│   │   │   ├── PrivacyPage.tsx       # Módulo de privacidad
│   │   │   ├── PrivacySettingsTab.tsx
│   │   │   └── ComplianceTab.tsx     # Checklist de cumplimiento
│   │   ├── settings/
│   │   │   ├── SettingsPage.tsx      # Página de ajustes (7 secciones)
│   │   │   ├── InstitutionSection.tsx
│   │   │   ├── AssistantSection.tsx  # Configuración del asistente IA
│   │   │   ├── ModelsSection.tsx     # Proveedores y modelos de IA
│   │   │   ├── AppearanceSection.tsx
│   │   │   ├── AdvancedSection.tsx
│   │   │   ├── RolesSection.tsx      # Gestión de roles (admin)
│   │   │   └── UsersSection.tsx      # Gestión de usuarios (admin)
│   │   ├── stats/
│   │   │   ├── StatsPage.tsx         # Dashboard de estadísticas
│   │   │   └── Charts.tsx           # Gráficos de actividad
│   │   └── usecases/
│   │       ├── UseCasesPage.tsx      # Catálogo de casos de uso
│   │       └── UseCaseChat.tsx       # Chat especializado por caso de uso
│   ├── context/
│   │   ├── AppSettingsContext.tsx    # Provider de ajustes + buildSystemPrompt
│   │   └── AuthContext.tsx          # Provider de autenticación + permisos
│   └── lib/
│       ├── supabase.ts              # Cliente Supabase + tipos TypeScript
│       ├── rag.ts                   # Sistema RAG (recuperación de documentos)
│       ├── markdown.tsx             # Renderizado de markdown en chat
│       └── permissions.ts          # Definición de secciones y permisos
├── supabase/
│   ├── migrations/                  # 14 migraciones SQL
│   └── functions/
│       └── chat/
│           └── index.ts            # Edge Function: proxy de IA
├── public/
│   ├── favicon.svg
│   └── og-image.svg
├── index.html
├── package.json
├── vite.config.ts
├── tailwind.config.js
├── postcss.config.js
├── tsconfig.json
├── tsconfig.app.json
├── tsconfig.node.json
└── eslint.config.js
```

---

## Notas

- La aplicación es **single-tenant**: una sola fila en `app_settings` y `privacy_settings` con un ID fijo.
- Las claves de API **nunca** se exponen al cliente. La columna `api_key_set` (booleano) permite mostrar en la UI si una clave está configurada sin revelar su valor.
- El país de búsqueda por defecto es **Guatemala**. Se puede cambiar desde Ajustes → Asistente IA → Alcance de búsqueda.
- Las respuestas del asistente incluyen siempre un recordatorio de que el contenido debe ser revisado por el funcionario responsable antes de su uso oficial.
- El sistema RAG es basado en palabras clave (no en embeddings vectoriales) para mantener la simplicidad y evitar dependencias adicionales.
