-- Paseo App - Sample Data
-- Insert sample data for testing

-- Insert sample users
INSERT INTO users (id, name, email, phone, city, postal_code, user_type) VALUES
('11111111-1111-1111-1111-111111111111', 'María García', 'maria@example.com', '+34 612 345 678', 'Madrid', '28001', 'owner'),
('22222222-2222-2222-2222-222222222222', 'Carlos López', 'carlos@example.com', '+34 623 456 789', 'Madrid', '28002', 'walker'),
('33333333-3333-3333-3333-333333333333', 'Ana Rodríguez', 'ana@example.com', '+34 634 567 890', 'Barcelona', '08001', 'owner'),
('44444444-4444-4444-4444-444444444444', 'David Martín', 'david@example.com', '+34 645 678 901', 'Barcelona', '08002', 'walker');

-- Insert sample dogs
INSERT INTO dogs (id, owner_id, name, age, breed, notes) VALUES
('55555555-5555-5555-5555-555555555555', '11111111-1111-1111-1111-111111111111', 'Lucas', '3 años', 'Golden Retriever', 'Muy amigable, le gusta jugar con otros perros. Necesita ejercicio diario.'),
('66666666-6666-6666-6666-666666666666', '33333333-3333-3333-3333-333333333333', 'Luna', '2 años', 'Border Collie', 'Muy activa, necesita paseos largos. Obediente pero puede ser tímida al principio.');

-- Insert sample walker profiles
INSERT INTO walker_profiles (id, user_id, bio, experience, hourly_rate, availability, tags, verified) VALUES
('77777777-7777-7777-7777-777777777777', '22222222-2222-2222-2222-222222222222', 'Apasionado por los perros con más de 5 años de experiencia cuidando mascotas.', '5+ años de experiencia paseando perros de todas las razas y tamaños.', 15.00, ARRAY['lunes', 'martes', 'miércoles', 'jueves', 'viernes'], ARRAY['experiencia', 'confiable', 'amante de los perros'], true),
('88888888-8888-8888-8888-888888888888', '44444444-4444-4444-4444-444444444444', 'Estudiante de veterinaria con gran amor por los animales.', '2 años paseando perros mientras estudio veterinaria.', 12.00, ARRAY['sábado', 'domingo', 'lunes', 'martes'], ARRAY['estudiante veterinaria', 'cuidado especializado', 'joven'], false);

-- Insert sample subscription plans
INSERT INTO subscription_plans (id, name, price, interval, features, stripe_price_id, popular) VALUES
('99999999-9999-9999-9999-999999999999', 'Básico', 9.99, 'month', ARRAY['Hasta 5 paseos por mes', 'Soporte por email', 'Acceso a walkers locales'], 'price_basic_monthly', false),
('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'Premium', 19.99, 'month', ARRAY['Paseos ilimitados', 'Soporte prioritario', 'Acceso a walkers premium', 'Seguimiento en tiempo real', 'Seguro incluido'], 'price_premium_monthly', true),
('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 'Anual', 199.99, 'year', ARRAY['Paseos ilimitados', 'Soporte prioritario', 'Acceso a walkers premium', 'Seguimiento en tiempo real', 'Seguro incluido', '2 meses gratis'], 'price_annual', false);

-- Insert sample walk requests
INSERT INTO walk_requests (id, owner_id, walker_id, dog_id, service_type, duration, walk_date, walk_time, location, status, price) VALUES
('cccccccc-cccc-cccc-cccc-cccccccccccc', '11111111-1111-1111-1111-111111111111', '22222222-2222-2222-2222-222222222222', '55555555-5555-5555-5555-555555555555', 'walk', 30, '2024-01-20', '10:00:00', 'Parque del Retiro, Madrid', 'completed', 15.00),
('dddddddd-dddd-dddd-dddd-dddddddddddd', '33333333-3333-3333-3333-333333333333', '44444444-4444-4444-4444-444444444444', '66666666-6666-6666-6666-666666666666', 'walk', 45, '2024-01-21', '14:30:00', 'Parc de la Ciutadella, Barcelona', 'pending', 18.00);

-- Insert sample reviews
INSERT INTO reviews (id, walk_request_id, reviewer_id, reviewed_id, rating, tags, comment) VALUES
('eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee', 'cccccccc-cccc-cccc-cccc-cccccccccccc', '11111111-1111-1111-1111-111111111111', '22222222-2222-2222-2222-222222222222', 5, ARRAY['puntual', 'cuidadoso', 'recomendado'], 'Carlos fue excelente con Lucas. Muy puntual y cuidadoso. Lo recomiendo totalmente.');

-- Insert sample chat messages
INSERT INTO chat_messages (id, request_id, sender_id, message) VALUES
('ffffffff-ffff-ffff-ffff-ffffffffffff', 'dddddddd-dddd-dddd-dddd-dddddddddddd', '33333333-3333-3333-3333-333333333333', 'Hola David, ¿podrías pasear a Luna mañana a las 14:30?'),
('gggggggg-gggg-gggg-gggg-gggggggggggg', 'dddddddd-dddd-dddd-dddd-dddddddddddd', '44444444-4444-4444-4444-444444444444', '¡Hola Ana! Sí, perfecto. ¿Alguna instrucción especial para Luna?');

-- Insert sample notifications
INSERT INTO notifications (id, user_id, title, message, type) VALUES
('hhhhhhhh-hhhh-hhhh-hhhh-hhhhhhhhhhhh', '22222222-2222-2222-2222-222222222222', 'Nueva solicitud de paseo', 'María García ha solicitado un paseo para Lucas', 'walk_request'),
('iiiiiiii-iiii-iiii-iiii-iiiiiiiiiiii', '11111111-1111-1111-1111-111111111111', 'Paseo completado', 'El paseo de Lucas ha sido completado exitosamente', 'walk_completed');
