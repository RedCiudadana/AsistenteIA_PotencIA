-- Add extractable text content to documents for RAG
ALTER TABLE documents
  ADD COLUMN IF NOT EXISTS content text;

-- Add a GIN index for full-text search over name + content + description
CREATE INDEX IF NOT EXISTS documents_fts_idx ON documents
  USING gin(
    to_tsvector('spanish',
      coalesce(name, '') || ' ' ||
      coalesce(content, '') || ' ' ||
      coalesce(description, '')
    )
  );

-- Seed realistic text content for the pre-existing sample documents
-- so RAG works immediately without waiting for new uploads

UPDATE documents SET content =
'MANUAL DE PROCEDIMIENTOS ADMINISTRATIVOS

1. OBJETIVO
Establecer los procedimientos para la gestión administrativa de la institución.

2. ALCANCE
Aplica a todo el personal del área administrativa.

3. SOLICITUDES DE MATERIALES
3.1 El personal deberá llenar el formato F-001 con al menos 5 días hábiles de anticipación.
3.2 Las solicitudes se autorizan por el jefe de área.
3.3 El almacén tiene un plazo de 3 días hábiles para atender cada solicitud.

4. TRÁMITES DE PERSONAL
4.1 Incapacidades: presentar en RH dentro de las 24 horas siguientes.
4.2 Vacaciones: solicitar con 10 días hábiles de anticipación.
4.3 Permisos de ausencia: requieren visto bueno del director de área.

5. CORRESPONDENCIA OFICIAL
5.1 Todo oficio debe seguir el formato institucional vigente.
5.2 La numeración de oficios es consecutiva por área y año.
5.3 Copias al expediente y al archivo institucional.'
WHERE name = 'Manual de procedimientos administrativos';

UPDATE documents SET content =
'LEY GENERAL DE TRANSPARENCIA Y ACCESO A LA INFORMACIÓN PÚBLICA

TÍTULO PRIMERO - DISPOSICIONES GENERALES

Artículo 1. La presente Ley es de orden público y de observancia general en toda la República.

Artículo 2. Son sujetos obligados: poderes Ejecutivo, Legislativo y Judicial, organismos autónomos, partidos políticos, fideicomisos y fondos públicos.

Artículo 132. Los sujetos obligados deberán dar respuesta a las solicitudes de acceso a la información en un plazo no mayor de VEINTE DÍAS HÁBILES, contados a partir de la presentación de la solicitud.

Artículo 133. El plazo podrá ampliarse hasta por DIEZ DÍAS HÁBILES adicionales, cuando existan razones que lo justifiquen, debiendo notificarse al solicitante antes del vencimiento del plazo original.

Artículo 45. Los sujetos obligados deberán publicar en sus portales de internet la información mínima de oficio establecida en esta Ley.

Artículo 46. La información de oficio deberá mantenerse actualizada y disponible de manera permanente.'
WHERE name = 'Ley de acceso a la información pública';

UPDATE documents SET content =
'FORMATO OFICIAL DE OFICIO INSTITUCIONAL

[LUGAR Y FECHA]
[NÚMERO DE OFICIO]/[AÑO]

[NOMBRE Y CARGO DEL DESTINATARIO]
[ÁREA O DEPENDENCIA]
[DIRECCIÓN]

Asunto: [DESCRIPCIÓN BREVE DEL ASUNTO]

Por este medio me permito [hacer de su conocimiento / informar a usted / solicitar a usted] que [CUERPO DEL OFICIO].

En virtud de lo anterior, [ACCIÓN SOLICITADA O CONCLUSIÓN].

Sin más por el momento, quedo a sus apreciables órdenes.

ATENTAMENTE
[NOMBRE COMPLETO DEL FIRMANTE]
[CARGO]
[INSTITUCIÓN]
[CORREO ELECTRÓNICO]
[TELÉFONO]'
WHERE name = 'Formato de oficio estándar';

UPDATE documents SET content =
'REGLAMENTO INTERNO INSTITUCIONAL

CAPÍTULO I - DISPOSICIONES GENERALES

Artículo 1. El presente Reglamento regula la organización interna y el funcionamiento de la institución.

Artículo 3. Son atribuciones de la Dirección General: planear, organizar y supervisar las actividades institucionales; representar legalmente a la institución; suscribir convenios y contratos en nombre de la institución.

CAPÍTULO III - JORNADA LABORAL

Artículo 15. La jornada laboral es de lunes a viernes de 09:00 a 18:00 horas, con una hora de descanso para alimentos.

Artículo 16. Las horas extraordinarias deberán ser autorizadas previamente por el jefe inmediato y compensadas conforme a la legislación aplicable.

CAPÍTULO V - USO DE RECURSOS INSTITUCIONALES

Artículo 28. Los equipos de cómputo, sistemas y redes institucionales son de uso exclusivo para actividades laborales.

Artículo 30. El personal es responsable de la información institucional que maneje y deberá protegerla conforme a la normativa de transparencia y datos personales.'
WHERE name = 'Reglamento interno institucional';

UPDATE documents SET content =
'LINEAMIENTOS DE TRANSPARENCIA INSTITUCIONAL

1. OBLIGACIONES DE TRANSPARENCIA PROACTIVA

1.1 Conforme al artículo 70 de la LGTAIP, la institución debe publicar permanentemente:
- Estructura orgánica y directorio de servidores públicos
- Remuneraciones de todos los servidores públicos
- Contrataciones públicas y proveedores
- Informes de actividades y resultados
- Presupuesto asignado y ejercido

2. ATENCIÓN DE SOLICITUDES DE INFORMACIÓN

2.1 Todas las solicitudes deben registrarse en la Plataforma Nacional de Transparencia (PNT).
2.2 El plazo de respuesta es de 20 días hábiles prorrogables por 10 días más.
2.3 Las respuestas negativas deben estar debidamente fundadas y motivadas.
2.4 Se puede interponer recurso de revisión ante el INAI dentro de los 15 días hábiles siguientes.

3. CLASIFICACIÓN DE LA INFORMACIÓN

3.1 Reservada: información que de divulgarse afecte la seguridad nacional, por un plazo de hasta 5 años.
3.2 Confidencial: datos personales que requieren consentimiento para su divulgación.
3.3 Pública: toda información no clasificada como reservada o confidencial.'
WHERE name = 'Lineamientos de transparencia';
