const {
  Document, Packer, Paragraph, TextRun, Table, TableRow, TableCell,
  AlignmentType, WidthType, BorderStyle, ShadingType,
  PageBreak, Header, Footer, PageNumber,
  convertMillimetersToTwip, VerticalAlign,
} = require("docx");
const fs = require("fs");
const path = require("path");

const C = {
  navy: "0C1322", navy3: "1C3178", brand: "1D4ED8",
  brand2: "3B6CF5", brand4: "93B4FD", brand5: "DBE6FE",
  brand6: "EFF4FF", white: "FFFFFF", text: "1E293B",
  muted: "64748B", border: "E2E8F0",
};
const noBorder   = { style: BorderStyle.NONE,   size: 0, color: "FFFFFF" };
const thinBorder = { style: BorderStyle.SINGLE, size: 2, color: C.border };

function cell(text, { isHeader=false, shade=null, bold=false, w=null, color=null, colspan=1, fontSize=18 } = {}) {
  const bg = isHeader ? C.navy3 : (shade || null);
  const fg = isHeader ? C.white : (color || C.text);
  return new TableCell({
    columnSpan: colspan,
    width: w ? { size: w, type: WidthType.PERCENTAGE } : undefined,
    shading: bg ? { fill: bg, type: ShadingType.CLEAR, color: "auto" } : undefined,
    verticalAlign: VerticalAlign.CENTER,
    margins: { top: 80, bottom: 80, left: 120, right: 120 },
    borders: { top: thinBorder, bottom: thinBorder, left: thinBorder, right: thinBorder },
    children: [new Paragraph({
      spacing: { before: 0, after: 0 },
      children: [new TextRun({ text, bold: bold || isHeader, size: fontSize, color: fg, font: isHeader ? "Outfit" : "DM Sans" })],
    })],
  });
}

function makeTable(headers, rows, widths = []) {
  return new Table({
    width: { size: 100, type: WidthType.PERCENTAGE },
    rows: [
      new TableRow({ tableHeader: true, children: headers.map((h, i) => cell(h, { isHeader: true, w: widths[i] || null })) }),
      ...rows.map((cols, ri) => new TableRow({
        children: cols.map((c, ci) => cell(
          typeof c === "string" ? c : (c.text || c),
          { shade: ri % 2 === 0 ? C.brand6 : null, bold: ci === 0, w: widths[ci] || null, color: typeof c === "object" ? c.color : null, fontSize: typeof c === "object" ? (c.size || 18) : 18 }
        )),
      })),
    ],
  });
}

function h(num, title) {
  return new Paragraph({
    spacing: { before: 360, after: 180 },
    border: { bottom: { style: BorderStyle.SINGLE, size: 8, color: C.brand5 } },
    children: [
      new TextRun({ text: `${num}.   `, bold: true, size: 36, color: C.brand2, font: "Outfit" }),
      new TextRun({ text: title, bold: true, size: 36, color: C.navy, font: "Outfit" }),
    ],
  });
}

function h2(title) {
  return new Paragraph({
    spacing: { before: 220, after: 100 },
    border: { left: { style: BorderStyle.SINGLE, size: 14, color: C.brand2 } },
    indent: { left: 160 },
    children: [new TextRun({ text: title, bold: true, size: 23, color: C.navy3, font: "Outfit" })],
  });
}

function p(text) {
  return new Paragraph({ spacing: { before: 60, after: 120 }, children: [new TextRun({ text, size: 19, color: C.text, font: "DM Sans" })] });
}

function b(text) {
  return new Paragraph({
    bullet: { level: 0 },
    spacing: { before: 40, after: 40 },
    indent: { left: 360, hanging: 360 },
    children: [new TextRun({ text, size: 18, color: C.text, font: "DM Sans" })],
  });
}

function code(text) {
  return new Paragraph({
    spacing: { before: 20, after: 20 },
    shading: { fill: C.navy, type: ShadingType.CLEAR, color: "auto" },
    indent: { left: 160, right: 160 },
    children: [new TextRun({ text, size: 16, color: "E2E8F0", font: "Courier New" })],
  });
}

function box(text) {
  return new Paragraph({
    spacing: { before: 120, after: 120 },
    shading: { fill: C.brand6, type: ShadingType.CLEAR, color: "auto" },
    border: { left: { style: BorderStyle.SINGLE, size: 18, color: C.brand2 } },
    indent: { left: 180 },
    children: [new TextRun({ text, size: 18, color: C.navy, font: "DM Sans" })],
  });
}

function gap() { return new Paragraph({ spacing: { before: 0, after: 140 }, children: [new TextRun("")] }); }
function pb()  { return new Paragraph({ children: [new PageBreak()] }); }

/* ═══════════════════════════════════════════
   COVER
═══════════════════════════════════════════ */
const cover = [
  new Table({
    width: { size: 100, type: WidthType.PERCENTAGE },
    rows: [new TableRow({ children: [new TableCell({
      shading: { fill: C.navy, type: ShadingType.CLEAR, color: "auto" },
      borders: { top: noBorder, bottom: noBorder, left: noBorder, right: noBorder },
      margins: { top: convertMillimetersToTwip(30), bottom: convertMillimetersToTwip(30), left: convertMillimetersToTwip(20), right: convertMillimetersToTwip(20) },
      children: [
        new Paragraph({ spacing: { before: 0, after: 400 }, children: [new TextRun("")] }),
        new Paragraph({ alignment: AlignmentType.CENTER, spacing: { before: 0, after: 200 }, children: [new TextRun({ text: "MELIOR", bold: true, size: 80, color: C.brand4, font: "Outfit" })] }),
        new Paragraph({ alignment: AlignmentType.CENTER, spacing: { before: 0, after: 100 }, children: [new TextRun({ text: "Descripción de Procesos del Sistema", bold: true, size: 42, color: C.white, font: "Outfit" })] }),
        new Paragraph({ alignment: AlignmentType.CENTER, spacing: { before: 0, after: 600 }, children: [new TextRun({ text: "Documento técnico-funcional para transferencia a sistemas de IA", size: 22, color: C.brand4, font: "DM Sans" })] }),
        new Paragraph({ alignment: AlignmentType.CENTER, spacing: { before: 0, after: 100 }, children: [new TextRun({ text: "Versión 1.0  ·  Mayo 2025", size: 19, color: C.brand4, font: "DM Sans" })] }),
        new Paragraph({ spacing: { before: 0, after: 400 }, children: [new TextRun("")] }),
      ],
    })] })] }),
  pb(),
];

/* ═══════════════════════════════════════════
   1. DESCRIPCIÓN GENERAL
═══════════════════════════════════════════ */
const s1 = [
  h("1", "Descripción General del Sistema"),
  p("Melior es un marketplace inmobiliario digital enfocado en la República Dominicana. Su propósito principal es conectar a clientes compradores o arrendatarios con agentes inmobiliarios certificados, facilitando todo el proceso desde la búsqueda de propiedades hasta el primer contacto directo con el agente."),
  p("La plataforma opera bajo el modelo de 'conexión inteligente': Melior NO realiza transacciones económicas ni interviene en el proceso legal de compraventa. Su rol es exclusivamente conectar al cliente con el agente correcto para la propiedad correcta."),
  gap(),
  h2("Principio fundamental"),
  box("Melior = Búsqueda + Conexión. El agente inmobiliario es quien gestiona todo el proceso posterior (negociación, documentación, cierre). Melior no es una agencia; es la plataforma que hace posible el encuentro."),
  gap(),
  h2("Stack tecnológico"),
  makeTable(
    ["Capa", "Tecnología", "Versión", "Propósito"],
    [
      ["Frontend", "React + TypeScript", "19.2 / 5.9", "SPA — interfaz de usuario completa"],
      ["Enrutamiento", "React Router DOM", "7.6", "Navegación SPA sin recarga"],
      ["Estilos", "Tailwind CSS", "3.4", "Diseño visual responsivo"],
      ["Build", "Vite", "7.2", "Compilación y dev server"],
      ["Backend", "Express.js + Node.js", "≥20", "API REST — lógica de negocio"],
      ["ORM", "Prisma ORM", "—", "Acceso y modelado de base de datos"],
      ["Base de datos", "PostgreSQL", "—", "Persistencia principal"],
      ["Auth", "JWT + OAuth 2.0", "—", "Autenticación y sesiones"],
      ["Deploy Frontend", "Vercel", "—", "CDN global + CI/CD automático"],
      ["Deploy Backend", "Railway / Render", "—", "Servidor API en producción"],
      ["CI/CD", "GitHub Actions", "—", "Deploy automático en cada push a main"],
    ],
    [18, 22, 12, 48]
  ),
  gap(),
];

/* ═══════════════════════════════════════════
   2. ROLES Y PERMISOS
═══════════════════════════════════════════ */
const s2 = [
  pb(),
  h("2", "Roles de Usuario y Permisos"),
  p("El sistema tiene tres roles definidos en el backend (campo `role` en la tabla User). Cada rol tiene un conjunto de permisos y vistas distintas."),
  gap(),
  makeTable(
    ["Rol", "Descripción", "Permisos principales"],
    [
      ["CLIENT", "Usuario registrado que busca propiedades", "Explorar propiedades, guardar favoritos, contactar agentes, ver historial de consultas, calificar agentes"],
      ["AGENT", "Profesional inmobiliario verificado", "Todo lo de CLIENT + publicar propiedades, gestionar sus listados, cambiar estado (ACTIVE/SOLD/RENTED/ARCHIVED), ver panel con estadísticas y citas recibidas"],
      ["ADMIN", "Administrador de la plataforma", "Acceso total: gestionar todos los usuarios, todas las propiedades, marcar destacados, ver estadísticas globales, gestionar inquiries"],
    ],
    [15, 30, 55]
  ),
  gap(),
  h2("Escalado de rol CLIENT → AGENT"),
  p("Un usuario registrado como CLIENT puede solicitar convertirse en AGENT mediante el endpoint POST /api/auth/upgrade-to-agent. Este proceso puede requerir validación manual por parte del administrador."),
  gap(),
  h2("Restricciones por rol (rutas protegidas)"),
  b("GET /publicar → Solo AGENT o ADMIN"),
  b("GET /editar/:id → Solo el agente propietario o ADMIN"),
  b("GET /mi-panel → Solo AGENT"),
  b("GET /admin → Solo ADMIN"),
  b("GET /mensajes → Cualquier usuario autenticado"),
  gap(),
];

/* ═══════════════════════════════════════════
   3. FLUJO DE AUTENTICACIÓN
═══════════════════════════════════════════ */
const s3 = [
  h("3", "Flujo de Autenticación"),
  h2("3.1  Registro con email y contraseña"),
  makeTable(
    ["Paso", "Actor", "Acción", "Endpoint"],
    [
      ["1", "Cliente", "Completa formulario con nombre, email, contraseña ≥8 chars", "POST /api/auth/register"],
      ["2", "Backend", "Crea usuario con emailVerified=false, envía código OTP al email", "—"],
      ["3", "Cliente", "Ingresa el código OTP de 6 dígitos recibido", "POST /api/auth/verify-otp"],
      ["4", "Backend", "Marca emailVerified=true, devuelve JWT de acceso", "—"],
      ["5", "Frontend", "Almacena token en localStorage (melior_token), redirige a inicio", "—"],
    ],
    [6, 12, 52, 30]
  ),
  gap(),
  h2("3.2  Login con Google OAuth 2.0"),
  makeTable(
    ["Paso", "Actor", "Acción", "Endpoint"],
    [
      ["1", "Cliente", "Click en 'Continuar con Google'", "GET /api/auth/google"],
      ["2", "Google", "Muestra selector de cuenta y pide consentimiento", "—"],
      ["3", "Backend", "Recibe código de autorización, obtiene perfil de Google, crea/actualiza usuario", "GET /oauth-callback"],
      ["4", "Frontend", "Recibe JWT por URL callback, almacena en localStorage", "—"],
    ],
    [6, 12, 52, 30]
  ),
  gap(),
  h2("3.3  Refresh y expiración de token"),
  p("El frontend almacena el JWT en localStorage bajo la clave 'melior_token'. Cada request al API incluye el token en el header Authorization: Bearer <token>. Si el token expira, el usuario es redirigido al login. Existe un refresh token almacenado en 'melior_refresh_token'."),
  gap(),
  h2("3.4  OTP — Lógica de reenvío"),
  p("El código OTP tiene una validez de 10 minutos. El botón de reenvío tiene un cooldown de 60 segundos para prevenir abuso. El backend gestiona la expiración y validez del código antes de verificar."),
  gap(),
];

/* ═══════════════════════════════════════════
   4. PROCESO: PUBLICACIÓN DE PROPIEDAD
═══════════════════════════════════════════ */
const s4 = [
  pb(),
  h("4", "Proceso: Publicación de Propiedad (Agente)"),
  p("Solo usuarios con rol AGENT o ADMIN pueden publicar propiedades. El flujo completo es:"),
  gap(),
  makeTable(
    ["Paso", "Descripción", "Dato relevante"],
    [
      ["1. Acceso", "El agente navega a /publicar desde el botón 'Publicar' en la navbar o su panel", "Requiere token JWT válido con role=AGENT"],
      ["2. Formulario", "Completa: título, descripción, precio, moneda (USD/RD$), tipo de operación (SALE/RENT), condición (NEW/USED/UNDER_CONSTRUCTION), tipo de propiedad, habitaciones, baños, m², estacionamientos, dirección", "POST /api/properties"],
      ["3. Imágenes", "Sube imágenes al servidor (pueden ser URLs externas o upload directo)", "POST /api/properties/:id/images/urls"],
      ["4. Publicación", "La propiedad queda con listingStatus=ACTIVE y es visible en el catálogo", "Visible en GET /api/properties"],
      ["5. Límite de plan", "Si el agente alcanzó el límite de propiedades de su plan, el backend retorna error 403", "El frontend muestra opción de upgrade"],
    ],
    [14, 56, 30]
  ),
  gap(),
  h2("Estados de una propiedad (listingStatus)"),
  makeTable(
    ["Estado", "Significado", "Visible en búsqueda"],
    [
      ["ACTIVE",   "Propiedad publicada y disponible", "Sí"],
      ["SOLD",     "Vendida — operación completada",   "No"],
      ["RENTED",   "Alquilada — no disponible",        "No"],
      ["ARCHIVED", "Archivada por el agente o admin",  "No"],
    ],
    [20, 50, 30]
  ),
  gap(),
  h2("Tipos de propiedad (enum backend)"),
  makeTable(
    ["Valor backend", "Display en UI", "Valor backend", "Display en UI"],
    [
      ["APARTMENT", "Apartamento", "HOUSE", "Casa"],
      ["VILLA",     "Villa",       "LAND",  "Solar / Terreno"],
      ["COMMERCIAL","Local Comercial","OFFICE","Oficina"],
    ],
    [25, 25, 25, 25]
  ),
  gap(),
];

/* ═══════════════════════════════════════════
   5. PROCESO: BÚSQUEDA Y FILTROS
═══════════════════════════════════════════ */
const s5 = [
  h("5", "Proceso: Búsqueda y Filtros de Propiedades"),
  p("La búsqueda es el punto de entrada principal para los clientes. El endpoint GET /api/properties soporta los siguientes parámetros de filtro:"),
  gap(),
  makeTable(
    ["Parámetro URL", "Tipo", "Descripción", "Ejemplo"],
    [
      ["search",       "string",  "Búsqueda libre en título, descripción, ciudad", "search=Santiago"],
      ["status",       "enum",    "Tipo de operación (mayúsculas)",                "status=SALE"],
      ["propertyType", "enum",    "Tipo de inmueble (mayúsculas)",                 "propertyType=APARTMENT"],
      ["minPrice",     "number",  "Precio mínimo en la moneda de la propiedad",    "minPrice=2000000"],
      ["maxPrice",     "number",  "Precio máximo",                                 "maxPrice=8000000"],
      ["beds",         "number",  "Mínimo de habitaciones",                        "beds=3"],
      ["city",         "string",  "Ciudad exacta",                                 "city=Santo Domingo"],
      ["neighborhood", "string",  "Barrio o sector",                               "neighborhood=Piantini"],
      ["page",         "number",  "Página para paginación",                        "page=2"],
      ["limit",        "number",  "Propiedades por página (default 50)",           "limit=12"],
    ],
    [22, 12, 42, 24]
  ),
  gap(),
  box("IMPORTANTE: Los valores de los filtros 'status' y 'propertyType' deben enviarse en MAYÚSCULAS en inglés (SALE, RENT, APARTMENT, HOUSE…). Si se envían en español o minúsculas, el backend no encontrará resultados."),
  gap(),
  h2("Respuesta de la API"),
  p("El endpoint retorna un objeto con data (array de propiedades mapeadas) y meta (total, page, limit, totalPages, hasNext, hasPrev). El frontend realiza un sort del lado del cliente para 'precio asc/desc'."),
  gap(),
];

/* ═══════════════════════════════════════════
   6. PROCESO: CONTACTO Y MENSAJERÍA
═══════════════════════════════════════════ */
const s6 = [
  pb(),
  h("6", "Proceso: Contacto y Mensajería"),
  p("La mensajería es el núcleo de la propuesta de valor de Melior: conectar cliente con agente de forma directa y fluida. El sistema tiene dos capas:"),
  gap(),
  h2("6.1  Inquiries (consultas formales)"),
  p("Cuando un cliente hace click en 'Agendar visita' o 'Contactar' en la página de una propiedad, se crea una inquiry formal asociada a esa propiedad. Esta inquiry queda registrada en la base de datos y es visible para el agente en su panel."),
  makeTable(
    ["Campo", "Tipo", "Descripción"],
    [
      ["firstName / lastName", "string", "Nombre del cliente que envía la consulta"],
      ["email",      "string",   "Correo de contacto del cliente"],
      ["phone",      "string?",  "Teléfono opcional"],
      ["subject",    "string?",  "Asunto de la consulta"],
      ["message",    "string",   "Mensaje del cliente"],
      ["propertyId", "string",   "ID de la propiedad sobre la que consulta"],
      ["status",     "enum",     "NEW | IN_PROGRESS | RESOLVED | CLOSED"],
    ],
    [30, 15, 55]
  ),
  gap(),
  h2("6.2  Chat / Conversaciones (mensajería en tiempo real)"),
  p("Al enviar una inquiry, el frontend crea también una conversación (POST /api/conversations) y redirige al cliente a /mensajes/:conversationId. El agente puede responder directamente desde el chat."),
  makeTable(
    ["Endpoint", "Método", "Descripción"],
    [
      ["GET  /api/conversations",                  "GET",   "Lista todas las conversaciones del usuario autenticado con último mensaje y unreadCount"],
      ["GET  /api/conversations/:id/messages",     "GET",   "Obtiene el historial completo de mensajes de una conversación"],
      ["POST /api/conversations",                  "POST",  "Inicia nueva conversación. Body: { propertyId, initialMessage }. Si ya existe una conv entre los usuarios para esa propiedad, la devuelve"],
      ["POST /api/conversations/:id/messages",     "POST",  "Envía un mensaje. Body: { content: string }"],
      ["PATCH /api/conversations/:id/read",        "PATCH", "Marca todos los mensajes de la conversación como leídos"],
      ["GET /api/conversations/unread-count",      "GET",   "Retorna { count: number } con el total de mensajes no leídos"],
    ],
    [40, 10, 50]
  ),
  gap(),
  h2("6.3  Notificaciones de mensajes"),
  p("El frontend hace polling al endpoint GET /api/conversations/unread-count cada 30 segundos para actualizar el badge de mensajes en la navbar. Dentro de una conversación activa, el polling es cada 5 segundos para simular 'tiempo real'."),
  gap(),
  h2("6.4  Flujo completo cliente → agente"),
  makeTable(
    ["Paso", "Actor", "Acción"],
    [
      ["1", "Cliente",  "Ve una propiedad, completa el formulario 'Agendar visita' y envía"],
      ["2", "Frontend", "POST /api/conversations con propertyId y mensaje inicial. Redirige a /mensajes/:id"],
      ["3", "Agente",   "Recibe notificación (badge) en navbar. Abre /mensajes y ve la conversación"],
      ["4", "Agente",   "Escribe respuesta en el chat y presiona Enter o el botón de envío"],
      ["5", "Cliente",  "Ve la respuesta del agente al abrir /mensajes. Badge se actualiza"],
      ["6", "Ambos",    "Pueden continuar la conversación bidireccional desde el chat"],
    ],
    [6, 12, 82]
  ),
  gap(),
];

/* ═══════════════════════════════════════════
   7. PROCESO: PANEL DEL AGENTE
═══════════════════════════════════════════ */
const s7 = [
  h("7", "Proceso: Panel del Agente (/mi-panel)"),
  p("El panel del agente es su centro de operaciones dentro de Melior. Accesible solo con role=AGENT, tiene dos secciones principales:"),
  gap(),
  h2("7.1  Mis Propiedades"),
  b("Muestra tabla de todas las propiedades publicadas por el agente con: imagen, título, ciudad, tipo, precio, conteo de visitas (viewCount), estado actual (listingStatus)"),
  b("El agente puede cambiar el listingStatus directamente desde un dropdown en la tabla (ACTIVE → SOLD → RENTED → ARCHIVED). Dispara PATCH /api/properties/:id con { listingStatus }"),
  b("Acciones por fila: Ver publicación, Editar propiedad, Eliminar (con confirmación)"),
  b("Stats cards en la parte superior: total propiedades, activas, visitas acumuladas, citas pendientes"),
  gap(),
  h2("7.2  Citas y Consultas"),
  b("Muestra las inquiries recibidas para las propiedades del agente, agrupadas por propiedad"),
  b("Cada grupo tiene encabezado con foto y título de la propiedad, más un link 'Ver publicación'"),
  b("Cada inquiry muestra: nombre del cliente, email, teléfono, asunto, mensaje, fecha y estado"),
  b("Acciones disponibles: Abrir chat (→ /mensajes), Enviar email, Marcar en proceso, Marcar resuelta, Cerrar"),
  gap(),
];

/* ═══════════════════════════════════════════
   8. PROCESO: ADMINISTRACIÓN
═══════════════════════════════════════════ */
const s8 = [
  pb(),
  h("8", "Proceso: Panel de Administración (/admin)"),
  p("El panel de administración es exclusivo para usuarios con role=ADMIN. Carga datos de GET /api/dashboard/admin."),
  gap(),
  h2("Secciones del dashboard admin"),
  makeTable(
    ["Sección", "Descripción", "API"],
    [
      ["Stats globales",    "Total propiedades (venta/alquiler), total clientes, total agentes, total inquiries, citas pendientes", "GET /api/dashboard/admin"],
      ["Top Favoritas",     "Las N propiedades con más favoritos", "GET /api/dashboard/admin → topFavorited"],
      ["Top Vistas",        "Las N propiedades con más visitas", "GET /api/dashboard/admin → topViewed"],
      ["Gestión usuarios",  "Tabla con todos los usuarios: nombre, email, rol, estado, fecha. Toggle activo/inactivo, cambio de rol", "PATCH /api/users/:id"],
      ["Gestión propiedades","Tabla con todas las propiedades: agente, estado, visitas, fecha. Toggle 'Destacada' (isFeatured)", "PATCH /api/properties/:id"],
      ["Inquiries recientes","Las últimas consultas recibidas en la plataforma con estado y datos del cliente", "GET /api/inquiries"],
      ["Tráfico",           "Gráficas de visitas diarias y por hora del día", "GET /api/analytics/traffic"],
    ],
    [22, 52, 26]
  ),
  gap(),
  h2("Propiedades destacadas"),
  p("El admin puede marcar cualquier propiedad como 'Destacada' (isFeatured=true). Las propiedades destacadas aparecen en una sección especial en la página principal (GET /api/properties/featured). El toggle está disponible en la tabla de gestión de propiedades del panel admin."),
  gap(),
];

/* ═══════════════════════════════════════════
   9. MODELO DE DATOS
═══════════════════════════════════════════ */
const s9 = [
  h("9", "Modelo de Datos — Entidades Principales"),
  h2("User"),
  makeTable(
    ["Campo", "Tipo", "Descripción"],
    [
      ["id",            "string (UUID)",  "Identificador único"],
      ["email",         "string",         "Email único, usado para login"],
      ["firstName",     "string",         "Nombre"],
      ["lastName",      "string",         "Apellido"],
      ["passwordHash",  "string?",        "Hash bcrypt (null si usa OAuth)"],
      ["role",          "enum",           "CLIENT | AGENT | ADMIN"],
      ["avatarUrl",     "string?",        "URL de foto de perfil"],
      ["phone",         "string?",        "Teléfono de contacto"],
      ["emailVerified", "boolean",        "Si pasó la verificación OTP"],
      ["isActive",      "boolean",        "Si la cuenta está activa (admin puede desactivar)"],
      ["provider",      "enum?",          "google | facebook | null (email)"],
      ["createdAt",     "DateTime",       "Fecha de registro"],
    ],
    [22, 20, 58]
  ),
  gap(),
  h2("Property"),
  makeTable(
    ["Campo", "Tipo", "Descripción"],
    [
      ["id",            "string (UUID)",  "Identificador único"],
      ["title",         "string",         "Título de la publicación"],
      ["description",   "string",         "Descripción completa"],
      ["price",         "number",         "Precio en la moneda indicada"],
      ["currency",      "enum",           "USD | DOP"],
      ["status",        "enum",           "SALE | RENT (tipo de operación)"],
      ["listingStatus", "enum",           "ACTIVE | SOLD | RENTED | ARCHIVED"],
      ["condition",     "enum",           "NEW | USED | UNDER_CONSTRUCTION"],
      ["propertyType",  "enum",           "APARTMENT | HOUSE | VILLA | LAND | COMMERCIAL | OFFICE"],
      ["beds",          "number",         "Habitaciones"],
      ["baths",         "number",         "Baños"],
      ["size",          "number",         "Metros cuadrados"],
      ["parkingSpaces", "number",         "Estacionamientos"],
      ["isFeatured",    "boolean",        "Si aparece en la sección de destacados"],
      ["viewCount",     "number",         "Contador de visitas a la página de detalle"],
      ["agentId",       "string",         "FK → AgentProfile.id"],
      ["address",       "object",         "{ city, neighborhood, street, country, latitude?, longitude? }"],
      ["images",        "array",          "[{ url, isPrimary }]"],
      ["createdAt",     "DateTime",       "Fecha de publicación"],
    ],
    [22, 20, 58]
  ),
  gap(),
];

/* ═══════════════════════════════════════════
   10. MODELO DE DATOS (cont.)
═══════════════════════════════════════════ */
const s10 = [
  pb(),
  h2("Inquiry"),
  makeTable(
    ["Campo", "Tipo", "Descripción"],
    [
      ["id",         "string",   "Identificador único"],
      ["firstName",  "string",   "Nombre del solicitante"],
      ["lastName",   "string",   "Apellido del solicitante"],
      ["email",      "string",   "Email de contacto"],
      ["phone",      "string?",  "Teléfono opcional"],
      ["subject",    "string?",  "Asunto"],
      ["message",    "string",   "Mensaje de la consulta"],
      ["status",     "enum",     "NEW | IN_PROGRESS | RESOLVED | CLOSED"],
      ["propertyId", "string?",  "FK → Property.id (si es sobre una propiedad)"],
      ["userId",     "string?",  "FK → User.id (si el cliente está registrado)"],
      ["createdAt",  "DateTime", "Fecha de envío"],
    ],
    [18, 14, 68]
  ),
  gap(),
  h2("Conversation"),
  makeTable(
    ["Campo", "Tipo", "Descripción"],
    [
      ["id",          "string",   "Identificador único"],
      ["participants","array",    "[User.id, User.id] — los dos participantes"],
      ["propertyId",  "string?",  "FK → Property.id — propiedad que origina la conversación"],
      ["createdAt",   "DateTime", "Fecha de creación"],
      ["updatedAt",   "DateTime", "Última actividad (actualizado en cada mensaje)"],
    ],
    [18, 14, 68]
  ),
  gap(),
  h2("Message"),
  makeTable(
    ["Campo", "Tipo", "Descripción"],
    [
      ["id",             "string",   "Identificador único"],
      ["conversationId", "string",   "FK → Conversation.id"],
      ["senderId",       "string",   "FK → User.id — quién envió el mensaje"],
      ["content",        "string",   "Texto del mensaje"],
      ["isRead",         "boolean",  "Si el receptor lo leyó"],
      ["createdAt",      "DateTime", "Fecha de envío"],
    ],
    [20, 14, 66]
  ),
  gap(),
];

/* ═══════════════════════════════════════════
   11. API REFERENCE COMPLETA
═══════════════════════════════════════════ */
const s11 = [
  h("10", "Referencia Completa de API"),
  h2("Autenticación"),
  makeTable(
    ["Endpoint", "Método", "Auth", "Descripción"],
    [
      ["POST /api/auth/register",          "POST",  "No",  "Registro con email/password"],
      ["POST /api/auth/login",             "POST",  "No",  "Login, retorna JWT"],
      ["POST /api/auth/verify-otp",        "POST",  "No",  "Verificar código OTP del email"],
      ["POST /api/auth/resend-otp",        "POST",  "No",  "Reenviar código OTP (con cooldown)"],
      ["GET  /api/auth/google",            "GET",   "No",  "Iniciar flujo OAuth con Google"],
      ["POST /api/auth/upgrade-to-agent",  "POST",  "JWT", "Cambiar rol CLIENT → AGENT"],
      ["PATCH /api/auth/profile",          "PATCH", "JWT", "Actualizar perfil del usuario"],
    ],
    [38, 10, 8, 44]
  ),
  gap(),
  h2("Propiedades"),
  makeTable(
    ["Endpoint", "Método", "Auth", "Descripción"],
    [
      ["GET  /api/properties",              "GET",    "No",     "Listado con filtros y paginación"],
      ["GET  /api/properties/featured",     "GET",    "No",     "Propiedades destacadas (isFeatured=true)"],
      ["GET  /api/properties/mine",         "GET",    "AGENT",  "Propiedades del agente autenticado"],
      ["GET  /api/properties/:id",          "GET",    "No",     "Detalle de una propiedad"],
      ["GET  /api/properties/:id/similar",  "GET",    "No",     "Propiedades similares recomendadas"],
      ["POST /api/properties",              "POST",   "AGENT",  "Publicar nueva propiedad"],
      ["PATCH /api/properties/:id",         "PATCH",  "AGENT",  "Editar propiedad (incluye listingStatus)"],
      ["DELETE /api/properties/:id",        "DELETE", "AGENT",  "Eliminar propiedad"],
      ["POST /api/properties/:id/images/urls", "POST", "AGENT", "Agregar imágenes por URL"],
      ["PUT  /api/properties/:id/images/urls", "PUT",  "AGENT", "Reemplazar todas las imágenes"],
    ],
    [38, 10, 10, 42]
  ),
  gap(),
  h2("Inquiries y Mensajería"),
  makeTable(
    ["Endpoint", "Método", "Auth", "Descripción"],
    [
      ["POST /api/inquiries",                      "POST",  "No",   "Crear inquiry (consulta de cliente)"],
      ["GET  /api/inquiries",                      "GET",   "AGENT","Inquiries de las propiedades del agente (role-filtered)"],
      ["GET  /api/inquiries/mine",                 "GET",   "JWT",  "Inquiries enviadas por el usuario actual"],
      ["PATCH /api/inquiries/:id",                 "PATCH", "JWT",  "Actualizar status: NEW|IN_PROGRESS|RESOLVED|CLOSED"],
      ["DELETE /api/inquiries/:id",                "DELETE","ADMIN","Eliminar inquiry"],
      ["GET  /api/conversations",                  "GET",   "JWT",  "Lista de conversaciones del usuario"],
      ["POST /api/conversations",                  "POST",  "JWT",  "Iniciar conversación con agente para una propiedad"],
      ["GET  /api/conversations/:id/messages",     "GET",   "JWT",  "Historial de mensajes de la conversación"],
      ["POST /api/conversations/:id/messages",     "POST",  "JWT",  "Enviar mensaje en conversación"],
      ["PATCH /api/conversations/:id/read",        "PATCH", "JWT",  "Marcar conversación como leída"],
      ["GET  /api/conversations/unread-count",     "GET",   "JWT",  "Número total de mensajes no leídos"],
    ],
    [42, 10, 8, 40]
  ),
  gap(),
  pb(),
  h2("Analytics y Admin"),
  makeTable(
    ["Endpoint", "Método", "Auth", "Descripción"],
    [
      ["GET  /api/dashboard/admin",     "GET",   "ADMIN", "Dashboard completo: stats, topViewed, allProperties, allUsers, recentInquiries"],
      ["GET  /api/analytics/traffic",   "GET",   "ADMIN", "Tráfico diario y por hora del sitio"],
      ["POST /api/analytics/view",      "POST",  "No",    "Registrar visita de página (pageTracking)"],
      ["GET  /api/favorites",           "GET",   "JWT",   "Propiedades guardadas como favoritas"],
      ["POST /api/favorites/:id",       "POST",  "JWT",   "Toggle favorito de una propiedad"],
      ["GET  /api/favorites/:id/check", "GET",   "JWT",   "Verificar si una propiedad es favorita"],
      ["GET  /api/site/founders",       "GET",   "No",    "Lista de fundadores para la página 'Acerca de'"],
      ["PATCH /api/site/founders/:id",  "PATCH", "ADMIN", "Editar información de un fundador"],
    ],
    [38, 10, 10, 42]
  ),
  gap(),
];

/* ═══════════════════════════════════════════
   12. NOTAS CRÍTICAS PARA IMPLEMENTACIÓN
═══════════════════════════════════════════ */
const s12 = [
  h("11", "Notas Críticas para Implementación"),
  gap(),
  h2("Sobre el sistema de mensajería"),
  box("El frontend de Melior ya tiene implementado el cliente de chat completo (MessagesPage, ConversationList, ChatView con polling de 5s). El backend DEBE implementar los 6 endpoints de /api/conversations descritos en la sección 10 para que el chat funcione. El frontend maneja errores graciosamente si el endpoint no existe."),
  gap(),
  h2("Sobre los valores enum"),
  box("CRÍTICO: El frontend filtra propiedades enviando los valores enum en mayúsculas inglesas. Si el backend usa valores distintos (minúsculas, español, etc.), los filtros no funcionarán. Mantener consistencia: APARTMENT, HOUSE, VILLA, LAND, COMMERCIAL, OFFICE / SALE, RENT / NEW, IN_PROGRESS, RESOLVED, CLOSED"),
  gap(),
  h2("Sobre el conteo de visitas"),
  p("El hook usePageTracking() envía POST /api/analytics/view en cada cambio de ruta. Esto registra tráfico global. Para el conteo de visitas por propiedad (viewCount), el backend debe incrementar este campo en GET /api/properties/:id."),
  gap(),
  h2("Sobre el rol AGENT y el sistema de límites"),
  p("El backend impone un límite de propiedades activas según el plan del agente. Al intentar publicar más allá del límite, la API retorna 403. El frontend muestra un mensaje de 'límite alcanzado' con opción de upgrade. El campo relevante en AgentProfile es propertyCount vs. el límite del plan."),
  gap(),
  h2("CI/CD y despliegue"),
  p("Cada push a la rama main en GitHub dispara automáticamente el deploy en Vercel para el frontend. El backend se despliega en Railway/Render. Las variables de entorno críticas son:"),
  code("VITE_API_URL=https://api.melior.com     (frontend)"),
  code("DATABASE_URL=postgresql://...           (backend)"),
  code("JWT_SECRET=...                          (backend)"),
  code("GOOGLE_CLIENT_ID=...                    (backend OAuth)"),
  code("GOOGLE_CLIENT_SECRET=...               (backend OAuth)"),
  gap(),
];

/* ═══════════════════════════════════════════
   ASSEMBLE
═══════════════════════════════════════════ */
const doc = new Document({
  styles: { default: { document: { run: { font: "DM Sans", size: 19, color: C.text } } } },
  sections: [{
    properties: {
      page: {
        margin: {
          top:    convertMillimetersToTwip(25), bottom: convertMillimetersToTwip(25),
          left:   convertMillimetersToTwip(22), right:  convertMillimetersToTwip(22),
        },
      },
    },
    headers: {
      default: new Header({
        children: [new Paragraph({
          border: { bottom: { style: BorderStyle.SINGLE, size: 6, color: C.border } },
          spacing: { before: 0, after: 120 },
          children: [
            new TextRun({ text: "Melior — Descripción de Procesos del Sistema", size: 16, color: C.muted, font: "DM Sans" }),
            new TextRun({ text: "        v1.0  |  Mayo 2025", size: 16, color: C.brand4, font: "DM Sans" }),
          ],
        })],
      }),
    },
    footers: {
      default: new Footer({
        children: [new Paragraph({
          alignment: AlignmentType.CENTER,
          border: { top: { style: BorderStyle.SINGLE, size: 6, color: C.border } },
          spacing: { before: 80, after: 0 },
          children: [
            new TextRun({ text: "Página ", size: 16, color: C.muted, font: "DM Sans" }),
            new TextRun({ children: [PageNumber.CURRENT], size: 16, color: C.muted, font: "DM Sans" }),
            new TextRun({ text: " de ", size: 16, color: C.muted, font: "DM Sans" }),
            new TextRun({ children: [PageNumber.TOTAL_PAGES], size: 16, color: C.muted, font: "DM Sans" }),
          ],
        })],
      }),
    },
    children: [
      ...cover,
      ...s1, ...s2, ...s3, ...s4, ...s5,
      ...s6, ...s7, ...s8, ...s9, ...s10, ...s11, ...s12,
    ],
  }],
});

Packer.toBuffer(doc).then(buf => {
  fs.writeFileSync(path.join(__dirname, "..", "PROCESOS_SISTEMA.docx"), buf);
  console.log("✓ PROCESOS_SISTEMA.docx generado correctamente");
});
