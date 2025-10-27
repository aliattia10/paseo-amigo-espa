-- Paseo Amigo España - Comprehensive Test Data
-- Realistic Spanish profiles for thorough app testing

-- Clear existing data (optional - uncomment if needed)
-- DELETE FROM notifications;
-- DELETE FROM chat_messages;
-- DELETE FROM reviews;
-- DELETE FROM walk_requests;
-- DELETE FROM walker_profiles;
-- DELETE FROM dogs;
-- DELETE FROM users;
-- DELETE FROM subscription_plans;

-- Insert realistic Spanish users (Owners and Walkers)
INSERT INTO users (id, name, email, phone, city, postal_code, user_type) VALUES
-- Dog Owners
('11111111-1111-1111-1111-111111111111', 'María González Pérez', 'maria.gonzalez@gmail.com', '+34 612 345 678', 'Madrid', '28001', 'owner'),
('22222222-2222-2222-2222-222222222222', 'Carlos Ruiz Martínez', 'carlos.ruiz@hotmail.com', '+34 623 456 789', 'Madrid', '28015', 'owner'),
('33333333-3333-3333-3333-333333333333', 'Ana Fernández López', 'ana.fernandez@gmail.com', '+34 634 567 890', 'Barcelona', '08001', 'owner'),
('44444444-4444-4444-4444-444444444444', 'David Sánchez García', 'david.sanchez@outlook.com', '+34 645 678 901', 'Barcelona', '08015', 'owner'),
('55555555-5555-5555-5555-555555555555', 'Lucía Herrera Jiménez', 'lucia.herrera@gmail.com', '+34 656 789 012', 'Valencia', '46001', 'owner'),
('66666666-6666-6666-6666-666666666666', 'Miguel Torres Díaz', 'miguel.torres@yahoo.com', '+34 667 890 123', 'Sevilla', '41001', 'owner'),

-- Dog Walkers
('77777777-7777-7777-7777-777777777777', 'Alejandro Morales Vega', 'alejandro.morales@gmail.com', '+34 678 901 234', 'Madrid', '28002', 'walker'),
('88888888-8888-8888-8888-888888888888', 'Carmen Delgado Romero', 'carmen.delgado@hotmail.com', '+34 689 012 345', 'Madrid', '28020', 'walker'),
('99999999-9999-9999-9999-999999999999', 'Roberto Silva Mendoza', 'roberto.silva@gmail.com', '+34 690 123 456', 'Barcelona', '08002', 'walker'),
('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'Isabel Castro Ruiz', 'isabel.castro@outlook.com', '+34 601 234 567', 'Barcelona', '08020', 'walker'),
('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 'Fernando Navarro Blanco', 'fernando.navarro@gmail.com', '+34 612 345 678', 'Valencia', '46002', 'walker'),
('cccccccc-cccc-cccc-cccc-cccccccccccc', 'Patricia Jiménez Flores', 'patricia.jimenez@yahoo.com', '+34 623 456 789', 'Sevilla', '41002', 'walker');

-- Insert realistic dog profiles with authentic Spanish dog names and breeds
INSERT INTO dogs (id, owner_id, name, age, breed, notes, image_url) VALUES
-- María's dogs
('d1111111-1111-1111-1111-111111111111', '11111111-1111-1111-1111-111111111111', 'Luna', '4 años', 'Golden Retriever', 'Muy cariñosa y tranquila. Le encanta jugar con niños y otros perros. Perfecta para familias.', null),
('d2222222-2222-2222-2222-222222222222', '11111111-1111-1111-1111-111111111111', 'Max', '2 años', 'Labrador', 'Enérgico y juguetón. Necesita ejercicio diario. Muy obediente y fácil de entrenar.', null),

-- Carlos's dogs  
('d3333333-3333-3333-3333-333333333333', '22222222-2222-2222-2222-222222222222', 'Bruno', '6 años', 'Pastor Alemán', 'Muy leal y protector. Necesita paseos largos y ejercicio mental. Experto en obediencia.', null),
('d4444444-4444-4444-4444-444444444444', '22222222-2222-2222-2222-222222222222', 'Maya', '1 año', 'Beagle', 'Joven y curiosa. Le gusta explorar y seguir rastros. Requiere paciencia al principio.', null),

-- Ana's dogs
('d5555555-5555-5555-5555-555555555555', '33333333-3333-3333-3333-333333333333', 'Thor', '3 años', 'Husky Siberiano', 'Muy activo y necesita mucho ejercicio. Hermoso pelaje gris. Le encanta el frío.', null),
('d6666666-6666-6666-6666-666666666666', '33333333-3333-3333-3333-333333333333', 'Nala', '5 años', 'Border Collie', 'Extremadamente inteligente y activa. Perfecta para actividades deportivas. Muy obediente.', null),

-- David's dogs
('d7777777-7777-7777-7777-777777777777', '44444444-4444-4444-4444-444444444444', 'Rex', '7 años', 'Rottweiler', 'Perro adulto muy tranquilo y cariñoso. Excelente con niños. Muy obediente y calmado.', null),

-- Lucía's dogs
('d8888888-8888-8888-8888-888888888888', '55555555-5555-5555-5555-555555555555', 'Coco', '2 años', 'French Bulldog', 'Pequeño pero con mucha personalidad. Muy amigable y perfecto para pisos pequeños.', null),
('d9999999-9999-9999-9999-999999999999', '55555555-5555-5555-5555-555555555555', 'Zeus', '4 años', 'Mastín Español', 'Perro grande y majestuoso. Muy tranquilo y protector. Perfecto guardián familiar.', null),

-- Miguel's dogs
('daaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', '66666666-6666-6666-6666-666666666666', 'Bella', '3 años', 'Cocker Spaniel', 'Muy cariñosa y sociable. Le encanta el agua y jugar. Perfecta para familias activas.', null),
('dbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', '66666666-6666-6666-6666-666666666666', 'Rocky', '1 año', 'Bulldog Inglés', 'Joven y juguetón. Muy tranquilo en casa pero activo en el parque. Fácil de manejar.', null);

-- Insert comprehensive walker profiles with realistic Spanish backgrounds
INSERT INTO walker_profiles (id, user_id, bio, experience, hourly_rate, availability, tags, verified, rating, total_walks) VALUES
-- Alejandro - Experienced professional
('p1111111-1111-1111-1111-111111111111', '77777777-7777-7777-7777-777777777777', 
 'Profesional con más de 8 años cuidando perros. Especializado en razas grandes y perros con necesidades especiales. Certificado en primeros auxilios caninos.',
 'Más de 8 años de experiencia profesional. He cuidado más de 500 perros diferentes, desde cachorros hasta perros senior. Especialista en entrenamiento básico.',
 18.00, 
 ARRAY['lunes', 'martes', 'miércoles', 'jueves', 'viernes', 'sábado'], 
 ARRAY['experiencia', 'certificado', 'razas grandes', 'entrenamiento', 'confiable'], 
 true, 4.9, 127),

-- Carmen - Caring and gentle
('p2222222-2222-2222-2222-222222222222', '88888888-8888-8888-8888-888888888888',
 'Amante de los animales con gran experiencia en perros nerviosos y tímidos. Trabajo con mucha paciencia y cariño.',
 '6 años cuidando perros de todas las edades. Especializada en perros ansiosos y con miedo. Experiencia con perros de rescate.',
 15.00,
 ARRAY['martes', 'miércoles', 'jueves', 'viernes', 'sábado', 'domingo'],
 ARRAY['paciente', 'perros nerviosos', 'cariñosa', 'experiencia', 'flexible'],
 true, 4.8, 89),

-- Roberto - Young and energetic  
('p3333333-3333-3333-3333-333333333333', '99999999-9999-9999-9999-999999999999',
 'Estudiante de veterinaria con gran pasión por los perros. Joven, enérgico y siempre dispuesto a aprender.',
 '3 años paseando perros mientras estudio. Experiencia con perros jóvenes y activos. Conocimientos básicos de veterinaria.',
 12.00,
 ARRAY['lunes', 'martes', 'miércoles', 'jueves', 'viernes', 'sábado', 'domingo'],
 ARRAY['joven', 'estudiante veterinaria', 'energético', 'económico', 'disponible'],
 false, 4.7, 45),

-- Isabel - Professional and reliable
('p4444444-4444-4444-4444-444444444444', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
 'Profesional con amplia experiencia en cuidado canino. Puntual, responsable y muy cariñosa con todos los perros.',
 '7 años de experiencia profesional. Especializada en perros de todas las razas y tamaños. Trabajo con horarios flexibles.',
 16.00,
 ARRAY['lunes', 'martes', 'miércoles', 'jueves', 'viernes', 'sábado'],
 ARRAY['profesional', 'puntual', 'responsable', 'flexible', 'experiencia'],
 true, 4.9, 156),

-- Fernando - Weekend specialist
('p5555555-5555-5555-5555-555555555555', 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb',
 'Trabajo de lunes a viernes, pero los fines de semana me dedico completamente a pasear perros. Gran experiencia con razas deportivas.',
 '5 años paseando perros los fines de semana. Especialista en perros activos y deportivos. Experiencia con perros de caza.',
 14.00,
 ARRAY['sábado', 'domingo'],
 ARRAY['fines de semana', 'perros activos', 'deportivo', 'razas de caza'],
 true, 4.6, 78),

-- Patricia - Family-oriented
('p6666666-6666-6666-6666-666666666666', 'cccccccc-cccc-cccc-cccc-cccccccccccc',
 'Madre de familia con gran amor por los perros. Experiencia cuidando perros de familia y trabajando con niños.',
 '4 años cuidando perros de familia. Experiencia con perros y niños juntos. Muy cariñosa y responsable.',
 13.00,
 ARRAY['lunes', 'martes', 'miércoles', 'jueves', 'viernes'],
 ARRAY['familia', 'niños', 'cariñosa', 'responsable', 'perros de familia'],
 true, 4.8, 92);

-- Insert subscription plans (keeping existing ones)
INSERT INTO subscription_plans (id, name, price, interval, features, stripe_price_id, popular) VALUES
('sp111111-1111-1111-1111-111111111111', 'Básico', 9.99, 'month', ARRAY['Hasta 5 paseos por mes', 'Soporte por email', 'Acceso a walkers locales'], 'price_basic_monthly', false),
('sp222222-2222-2222-2222-222222222222', 'Premium', 19.99, 'month', ARRAY['Paseos ilimitados', 'Soporte prioritario', 'Acceso a walkers premium', 'Seguimiento en tiempo real', 'Seguro incluido'], 'price_premium_monthly', true),
('sp333333-3333-3333-3333-333333333333', 'Anual', 199.99, 'year', ARRAY['Paseos ilimitados', 'Soporte prioritario', 'Acceso a walkers premium', 'Seguimiento en tiempo real', 'Seguro incluido', '2 meses gratis'], 'price_annual', false);

-- Insert realistic walk requests with various statuses
INSERT INTO walk_requests (id, owner_id, walker_id, dog_id, service_type, duration, walk_date, walk_time, location, status, price, notes) VALUES
-- Completed walks
('wr111111-1111-1111-1111-111111111111', '11111111-1111-1111-1111-111111111111', '77777777-7777-7777-7777-777777777777', 'd1111111-1111-1111-1111-111111111111', 'walk', 30, '2024-01-15', '10:00:00', 'Parque del Retiro, Madrid', 'completed', 18.00, 'Paseo perfecto. Luna se lo pasó genial.'),
('wr222222-2222-2222-2222-222222222222', '22222222-2222-2222-2222-222222222222', '88888888-8888-8888-8888-888888888888', 'd3333333-3333-3333-3333-333333333333', 'walk', 45, '2024-01-16', '14:30:00', 'Casa de Campo, Madrid', 'completed', 22.50, 'Bruno estuvo muy contento con el paseo largo.'),

-- Pending walks
('wr333333-3333-3333-3333-333333333333', '33333333-3333-3333-3333-333333333333', '99999999-9999-9999-9999-999999999999', 'd5555555-5555-5555-5555-555555555555', 'walk', 60, '2024-01-25', '09:00:00', 'Parc de la Ciutadella, Barcelona', 'pending', 24.00, 'Thor necesita mucho ejercicio. Paseo largo por favor.'),
('wr444444-4444-4444-4444-444444444444', '44444444-4444-4444-4444-444444444444', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'd7777777-7777-7777-7777-777777777777', 'walk', 30, '2024-01-26', '16:00:00', 'Montjuïc, Barcelona', 'pending', 16.00, 'Rex es muy tranquilo, paseo corto está bien.'),

-- Accepted walks
('wr555555-5555-5555-5555-555555555555', '55555555-5555-5555-5555-555555555555', 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 'd8888888-8888-8888-8888-888888888888', 'walk', 30, '2024-01-27', '11:00:00', 'Jardines del Turia, Valencia', 'accepted', 14.00, 'Coco es pequeño pero activo.'),
('wr666666-6666-6666-6666-666666666666', '66666666-6666-6666-6666-666666666666', 'cccccccc-cccc-cccc-cccc-cccccccccccc', 'daaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'walk', 45, '2024-01-28', '15:30:00', 'Parque de María Luisa, Sevilla', 'accepted', 19.50, 'Bella necesita ejercicio moderado.');

-- Insert realistic reviews
INSERT INTO reviews (id, walk_request_id, reviewer_id, reviewed_id, rating, tags, comment) VALUES
('r1111111-1111-1111-1111-111111111111', 'wr111111-1111-1111-1111-111111111111', '11111111-1111-1111-1111-111111111111', '77777777-7777-7777-7777-777777777777', 5, ARRAY['puntual', 'cuidadoso', 'recomendado'], 'Alejandro fue excelente con Luna. Muy puntual, cuidadoso y profesional. Luna volvió muy contenta. Lo recomiendo totalmente.'),
('r2222222-2222-2222-2222-222222222222', 'wr222222-2222-2222-2222-222222222222', '22222222-2222-2222-2222-222222222222', '88888888-8888-8888-8888-888888888888', 5, ARRAY['cariñosa', 'experiencia', 'confiable'], 'Carmen tiene mucha experiencia con perros grandes. Bruno se sintió muy cómodo con ella. Muy recomendable.');

-- Insert realistic chat messages
INSERT INTO chat_messages (id, request_id, sender_id, message, created_at) VALUES
('m1111111-1111-1111-1111-111111111111', 'wr333333-3333-3333-3333-333333333333', '33333333-3333-3333-3333-333333333333', 'Hola Roberto, ¿podrías pasear a Thor mañana a las 9:00? Necesita un paseo largo porque es muy activo.', NOW() - INTERVAL '2 hours'),
('m2222222-2222-2222-2222-222222222222', 'wr333333-3333-3333-3333-333333333333', '99999999-9999-9999-9999-999999999999', '¡Hola Ana! Sí, perfecto. Me encantan los Huskies. ¿Alguna instrucción especial para Thor?', NOW() - INTERVAL '1 hour'),
('m3333333-3333-3333-3333-333333333333', 'wr333333-3333-3333-3333-333333333333', '33333333-3333-3333-3333-333333333333', 'Lleva mucha agua porque le gusta beber durante el paseo, y evita los perros agresivos. Es muy sociable pero puede ser tímido al principio.', NOW() - INTERVAL '30 minutes'),
('m4444444-4444-4444-4444-444444444444', 'wr444444-4444-4444-4444-444444444444', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'Hola David, confirmo el paseo para Rex el viernes a las 16:00. ¿Todo correcto?', NOW() - INTERVAL '1 day'),
('m5555555-5555-5555-5555-555555555555', 'wr444444-4444-4444-4444-444444444444', '44444444-4444-4444-4444-444444444444', 'Perfecto Isabel, muchas gracias. Rex es muy tranquilo, no te dará problemas.', NOW() - INTERVAL '23 hours');

-- Insert realistic notifications
INSERT INTO notifications (id, user_id, title, message, type, created_at) VALUES
('n1111111-1111-1111-1111-111111111111', '99999999-9999-9999-9999-999999999999', 'Nueva solicitud de paseo', 'Ana Fernández ha solicitado un paseo para Thor', 'walk_request', NOW() - INTERVAL '2 hours'),
('n2222222-2222-2222-2222-222222222222', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'Nueva solicitud de paseo', 'David Sánchez ha solicitado un paseo para Rex', 'walk_request', NOW() - INTERVAL '1 day'),
('n3333333-3333-3333-3333-333333333333', '11111111-1111-1111-1111-111111111111', 'Paseo completado', 'El paseo de Luna ha sido completado exitosamente', 'walk_completed', NOW() - INTERVAL '1 week'),
('n4444444-4444-4444-4444-444444444444', '77777777-7777-7777-7777-777777777777', 'Nueva reseña', 'María González ha dejado una reseña de 5 estrellas', 'review_received', NOW() - INTERVAL '1 week'),
('n5555555-5555-5555-5555-555555555555', '22222222-2222-2222-2222-222222222222', 'Paseo confirmado', 'Tu paseo con Bruno ha sido confirmado para mañana', 'walk_confirmed', NOW() - INTERVAL '2 days');
