-- SupportFlow enterprise demo seed
-- Run once against a demo database containing approximately 25 tickets.
-- This adds 4 comments and 6+ timeline events per existing ticket, plus
-- 46 attachments across the 23 most recently created tickets.

WITH ticket_context AS (
  SELECT
    id,
    ticket_id,
    customer_name,
    subject,
    status,
    created_at,
    CASE mod(abs(hashtext(ticket_id)), 4)
      WHEN 0 THEN 'Maya Patel'
      WHEN 1 THEN 'Jordan Lee'
      WHEN 2 THEN 'Priya Shah'
      ELSE 'Daniel Brooks'
    END AS engineer_name
  FROM tickets
),
comment_rows AS (
  SELECT id AS ticket_id, NULL::uuid AS parent_id, customer_name AS author_name,
         'We are seeing this issue in our production workspace. It is affecting our team''s normal workflow; please let us know what additional information would be helpful.' AS content,
         created_at + interval '18 minutes' AS created_at
  FROM ticket_context
  UNION ALL
  SELECT id, NULL::uuid, engineer_name,
         'Thanks for reporting this. I have taken ownership of the case and started an initial investigation. Please send the approximate time of the most recent occurrence and any relevant browser or application logs.',
         created_at + interval '2 hours 10 minutes'
  FROM ticket_context
  UNION ALL
  SELECT id, NULL::uuid, customer_name,
         'Additional details have been provided, including the affected users, timestamps, and diagnostic output. The issue is reproducible in our production environment.',
         created_at + interval '5 hours 25 minutes'
  FROM ticket_context
  UNION ALL
  SELECT id, NULL::uuid, engineer_name,
         CASE status::text
           WHEN 'Closed' THEN 'Root cause was identified and the corrective change has been deployed. We monitored the service after the change and confirmed the reported workflow is operating normally. Thank you for confirming resolution.'
           WHEN 'In Progress' THEN 'The diagnostic data has narrowed the issue to a specific service path. The engineering team is validating the proposed fix; I will share the next update as soon as deployment timing is confirmed.'
           ELSE 'Initial investigation is complete. We have shared the recommended troubleshooting steps and will continue monitoring for any recurrence.'
         END,
         created_at + interval '1 day 3 hours 40 minutes'
  FROM ticket_context
)
INSERT INTO comments (id, ticket_id, parent_id, author_name, content, mentions, created_at)
SELECT gen_random_uuid(), ticket_id, parent_id, author_name, content, NULL, created_at
FROM comment_rows;

WITH ranked_tickets AS (
  SELECT
    id,
    ticket_id,
    created_at,
    row_number() OVER (ORDER BY created_at DESC, id) AS ticket_rank
  FROM tickets
),
attachment_templates AS (
  SELECT * FROM (VALUES
    (1, 'screenshot.png', 'image/png', 248731, 'png'),
    (2, 'error_log.txt', 'text/plain', 87421, 'txt'),
    (3, 'payment_receipt.pdf', 'application/pdf', 392184, 'pdf'),
    (4, 'invoice.pdf', 'application/pdf', 518942, 'pdf'),
    (5, 'browser_console.log', 'text/plain', 164208, 'log'),
    (6, 'crash_dump.zip', 'application/zip', 2847160, 'zip'),
    (7, 'network_trace.har', 'application/json', 728554, 'har'),
    (8, 'screen_recording.mp4', 'video/mp4', 8421096, 'mp4')
  ) AS template(template_rank, filename, mime_type, file_size, extension)
),
attachment_rows AS (
  SELECT
    ranked_tickets.id AS ticket_id,
    attachment_templates.filename,
    md5(ranked_tickets.ticket_id || '-' || attachment_templates.template_rank::text) || '.' || attachment_templates.extension AS stored_name,
    attachment_templates.mime_type,
    attachment_templates.file_size + (ranked_tickets.ticket_rank * 1031) AS file_size,
    ranked_tickets.created_at + interval '3 hours' + (attachment_templates.template_rank % 3) * interval '25 minutes' AS created_at
  FROM ranked_tickets
  JOIN attachment_templates
    ON attachment_templates.template_rank IN (
      ((ranked_tickets.ticket_rank - 1) % 8) + 1,
      (ranked_tickets.ticket_rank % 8) + 1
    )
  WHERE ranked_tickets.ticket_rank <= 23
)
INSERT INTO attachments (id, ticket_id, filename, stored_name, mime_type, file_size, created_at)
SELECT gen_random_uuid(), ticket_id, filename, stored_name, mime_type, file_size, created_at
FROM attachment_rows;

WITH activity_types AS (
  SELECT
    COALESCE(
      (SELECT enumlabel::text FROM pg_enum WHERE enumtypid = 'activity_type'::regtype AND lower(enumlabel) IN ('ticket_created', 'created') ORDER BY enumsortorder LIMIT 1),
      (SELECT enumlabel::text FROM pg_enum WHERE enumtypid = 'activity_type'::regtype ORDER BY enumsortorder LIMIT 1)
    ) AS ticket_created_type,
    COALESCE(
      (SELECT enumlabel::text FROM pg_enum WHERE enumtypid = 'activity_type'::regtype AND lower(enumlabel) IN ('assigned', 'ticket_assigned', 'assignment_changed') ORDER BY enumsortorder LIMIT 1),
      (SELECT enumlabel::text FROM pg_enum WHERE enumtypid = 'activity_type'::regtype ORDER BY enumsortorder LIMIT 1)
    ) AS assigned_type,
    COALESCE(
      (SELECT enumlabel::text FROM pg_enum WHERE enumtypid = 'activity_type'::regtype AND lower(enumlabel) IN ('priority_changed', 'ticket_updated') ORDER BY enumsortorder LIMIT 1),
      (SELECT enumlabel::text FROM pg_enum WHERE enumtypid = 'activity_type'::regtype ORDER BY enumsortorder LIMIT 1)
    ) AS priority_changed_type,
    COALESCE(
      (SELECT enumlabel::text FROM pg_enum WHERE enumtypid = 'activity_type'::regtype AND lower(enumlabel) IN ('comment_added', 'customer_replied') ORDER BY enumsortorder LIMIT 1),
      (SELECT enumlabel::text FROM pg_enum WHERE enumtypid = 'activity_type'::regtype ORDER BY enumsortorder LIMIT 1)
    ) AS comment_added_type,
    COALESCE(
      (SELECT enumlabel::text FROM pg_enum WHERE enumtypid = 'activity_type'::regtype AND lower(enumlabel) IN ('attachment_added', 'attachment_uploaded') ORDER BY enumsortorder LIMIT 1),
      (SELECT enumlabel::text FROM pg_enum WHERE enumtypid = 'activity_type'::regtype ORDER BY enumsortorder LIMIT 1)
    ) AS attachment_added_type,
    COALESCE(
      (SELECT enumlabel::text FROM pg_enum WHERE enumtypid = 'activity_type'::regtype AND lower(enumlabel) IN ('status_changed', 'ticket_resolved', 'ticket_closed') ORDER BY enumsortorder LIMIT 1),
      (SELECT enumlabel::text FROM pg_enum WHERE enumtypid = 'activity_type'::regtype ORDER BY enumsortorder LIMIT 1)
    ) AS status_changed_type
),
ticket_context AS (
  SELECT
    id,
    ticket_id,
    customer_name,
    status,
    created_at,
    row_number() OVER (ORDER BY created_at DESC, id) AS ticket_rank,
    CASE mod(abs(hashtext(ticket_id)), 4)
      WHEN 0 THEN 'Maya Patel'
      WHEN 1 THEN 'Jordan Lee'
      WHEN 2 THEN 'Priya Shah'
      ELSE 'Daniel Brooks'
    END AS engineer_name
  FROM tickets
),
activity_rows AS (
  SELECT id AS ticket_id, ticket_created_type::activity_type AS activity_type, 'Ticket created from the customer support portal.' AS description, customer_name AS actor_name, created_at AS created_at
  FROM ticket_context CROSS JOIN activity_types
  UNION ALL
  SELECT id, assigned_type::activity_type, 'Ticket assigned to ' || engineer_name || ' for investigation.', engineer_name, created_at + interval '12 minutes'
  FROM ticket_context CROSS JOIN activity_types
  UNION ALL
  SELECT id, priority_changed_type::activity_type, 'Priority reviewed and set based on reported business impact.', engineer_name, created_at + interval '35 minutes'
  FROM ticket_context CROSS JOIN activity_types
  UNION ALL
  SELECT id, comment_added_type::activity_type, 'Customer replied with additional environment and reproduction details.', customer_name, created_at + interval '5 hours 25 minutes'
  FROM ticket_context CROSS JOIN activity_types
  UNION ALL
  SELECT id, status_changed_type::activity_type,
         CASE status::text
           WHEN 'Closed' THEN 'Root cause identified; fix deployed and ticket resolved.'
           WHEN 'In Progress' THEN 'Status changed to In Progress while the engineering team validates the fix.'
           ELSE 'Investigation update recorded; ticket remains Open pending customer confirmation.'
         END,
         engineer_name,
         created_at + interval '1 day 2 hours'
  FROM ticket_context CROSS JOIN activity_types
  UNION ALL
  SELECT id, status_changed_type::activity_type,
         CASE status::text
           WHEN 'Closed' THEN 'Customer confirmed resolution and the ticket was closed.'
           WHEN 'In Progress' THEN 'Customer was notified that investigation is still in progress.'
           ELSE 'Follow-up reminder scheduled; ticket remains Open pending customer confirmation.'
         END,
         CASE WHEN status::text = 'Closed' THEN customer_name ELSE engineer_name END,
         created_at + interval '1 day 4 hours'
  FROM ticket_context CROSS JOIN activity_types
  UNION ALL
  SELECT id, attachment_added_type::activity_type, 'Attachment uploaded: diagnostic file received for investigation.', customer_name, created_at + interval '3 hours 25 minutes'
  FROM ticket_context CROSS JOIN activity_types
  WHERE ticket_rank <= 23
)
INSERT INTO activities (id, ticket_id, activity_type, description, actor_name, created_at)
SELECT gen_random_uuid(), ticket_id, activity_type, description, actor_name, created_at
FROM activity_rows;
