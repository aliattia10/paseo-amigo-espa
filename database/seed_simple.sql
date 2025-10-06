-- Paseo App - Simple Sample Data
-- Insert sample data for testing (using auto-generated UUIDs)

-- Insert sample users
INSERT INTO users (name, email, phone, city, postal_code, user_type) VALUES
('María García', 'maria@example.com', '+34 612 345 678', 'Madrid', '28001', 'owner'),
('Carlos López', 'carlos@example.com', '+34 623 456 789', 'Madrid', '28002', 'walker'),
('Ana Rodríguez', 'ana@example.com', '+34 634 567 890', 'Barcelona', '08001', 'owner'),
('David Martín', 'david@example.com', '+34 645 678 901', 'Barcelona', '08002', 'walker');

-- Insert sample dogs (assuming the first two users are owners)
INSERT INTO dogs (owner_id, name, age, breed, notes) 
SELECT id, 'Lucas', '3 años', 'Golden Retriever', 'Muy amigable, le gusta jugar con otros perros. Necesita ejercicio diario.'
FROM users WHERE user_type = 'owner' LIMIT 1;

INSERT INTO dogs (owner_id, name, age, breed, notes) 
SELECT id, 'Luna', '2 años', 'Border Collie', 'Muy activa, necesita paseos largos. Obediente pero puede ser tímida al principio.'
FROM users WHERE user_type = 'owner' OFFSET 1 LIMIT 1;

-- Insert sample walker profiles
INSERT INTO walker_profiles (user_id, bio, experience, hourly_rate, availability, tags, verified) 
SELECT id, 'Apasionado por los perros con más de 5 años de experiencia cuidando mascotas.', '5+ años de experiencia paseando perros de todas las razas y tamaños.', 15.00, ARRAY['lunes', 'martes', 'miércoles', 'jueves', 'viernes'], ARRAY['experiencia', 'confiable', 'amante de los perros'], true
FROM users WHERE user_type = 'walker' LIMIT 1;

INSERT INTO walker_profiles (user_id, bio, experience, hourly_rate, availability, tags, verified) 
SELECT id, 'Estudiante de veterinaria con gran amor por los animales.', '2 años paseando perros mientras estudio veterinaria.', 12.00, ARRAY['sábado', 'domingo', 'lunes', 'martes'], ARRAY['estudiante veterinaria', 'cuidado especializado', 'joven'], false
FROM users WHERE user_type = 'walker' OFFSET 1 LIMIT 1;

-- Insert sample subscription plans
INSERT INTO subscription_plans (name, price, interval, features, stripe_price_id, popular) VALUES
('Básico', 9.99, 'month', ARRAY['Hasta 5 paseos por mes', 'Soporte por email', 'Acceso a walkers locales'], 'price_basic_monthly', false),
('Premium', 19.99, 'month', ARRAY['Paseos ilimitados', 'Soporte prioritario', 'Acceso a walkers premium', 'Seguimiento en tiempo real', 'Seguro incluido'], 'price_premium_monthly', true),
('Anual', 199.99, 'year', ARRAY['Paseos ilimitados', 'Soporte prioritario', 'Acceso a walkers premium', 'Seguimiento en tiempo real', 'Seguro incluido', '2 meses gratis'], 'price_annual', false);

-- Insert sample walk requests
INSERT INTO walk_requests (owner_id, walker_id, dog_id, service_type, duration, walk_date, walk_time, location, status, price)
SELECT 
    (SELECT id FROM users WHERE user_type = 'owner' LIMIT 1),
    (SELECT id FROM users WHERE user_type = 'walker' LIMIT 1),
    (SELECT id FROM dogs LIMIT 1),
    'walk', 30, '2024-01-20', '10:00:00', 'Parque del Retiro, Madrid', 'completed', 15.00;

INSERT INTO walk_requests (owner_id, walker_id, dog_id, service_type, duration, walk_date, walk_time, location, status, price)
SELECT 
    (SELECT id FROM users WHERE user_type = 'owner' OFFSET 1 LIMIT 1),
    (SELECT id FROM users WHERE user_type = 'walker' OFFSET 1 LIMIT 1),
    (SELECT id FROM dogs OFFSET 1 LIMIT 1),
    'walk', 45, '2024-01-21', '14:30:00', 'Parc de la Ciutadella, Barcelona', 'pending', 18.00;

-- Insert sample review
INSERT INTO reviews (walk_request_id, reviewer_id, reviewed_id, rating, tags, comment)
SELECT 
    (SELECT id FROM walk_requests WHERE status = 'completed' LIMIT 1),
    (SELECT owner_id FROM walk_requests WHERE status = 'completed' LIMIT 1),
    (SELECT walker_id FROM walk_requests WHERE status = 'completed' LIMIT 1),
    5, ARRAY['puntual', 'cuidadoso', 'recomendado'], 'Carlos fue excelente con Lucas. Muy puntual y cuidadoso. Lo recomiendo totalmente.';

-- Insert sample chat messages
INSERT INTO chat_messages (request_id, sender_id, message)
SELECT 
    (SELECT id FROM walk_requests WHERE status = 'pending' LIMIT 1),
    (SELECT owner_id FROM walk_requests WHERE status = 'pending' LIMIT 1),
    'Hola David, ¿podrías pasear a Luna mañana a las 14:30?';

INSERT INTO chat_messages (request_id, sender_id, message)
SELECT 
    (SELECT id FROM walk_requests WHERE status = 'pending' LIMIT 1),
    (SELECT walker_id FROM walk_requests WHERE status = 'pending' LIMIT 1),
    '¡Hola Ana! Sí, perfecto. ¿Alguna instrucción especial para Luna?';

-- Insert sample notifications
INSERT INTO notifications (user_id, title, message, type)
SELECT 
    (SELECT walker_id FROM walk_requests WHERE status = 'pending' LIMIT 1),
    'Nueva solicitud de paseo',
    'María García ha solicitado un paseo para Lucas',
    'walk_request';

INSERT INTO notifications (user_id, title, message, type)
SELECT 
    (SELECT owner_id FROM walk_requests WHERE status = 'completed' LIMIT 1),
    'Paseo completado',
    'El paseo de Lucas ha sido completado exitosamente',
    'walk_completed';
