<?php
require_once './db.php';

header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST');

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['success' => false, 'message' => 'Méthode non autorisée']);
    exit;
}

$data = json_decode(file_get_contents('php://input'), true);

// Validation
$errors = [];
$required = ['title', 'description', 'category', 'code'];
$categories = ['PHP', 'HTML', 'CSS', 'JavaScript', 'Python', 'SQL'];

foreach ($required as $field) {
    if (empty($data[$field])) {
        $errors[$field] = 'Ce champ est requis';
    }
}

if (!in_array($data['category'], $categories)) {
    $errors['category'] = 'Catégorie invalide';
}

if (!empty($errors)) {
    http_response_code(422);
    echo json_encode(['success' => false, 'errors' => $errors]);
    exit;
}

// Insertion
try {
    $stmt = $pdo->prepare("
        INSERT INTO snippets (title, description, category, code)
        VALUES (:title, :description, :category, :code)
    ");
    
    $stmt->execute([
        ':title' => htmlspecialchars($data['title']),
        ':description' => htmlspecialchars($data['description']),
        ':category' => $data['category'],
        ':code' => $data['code']
    ]);
    
    $id = $pdo->lastInsertId();
    
    http_response_code(201);
    echo json_encode([
        'success' => true,
        'id' => $id,
        'message' => 'Snippet ajouté avec succès'
    ]);
} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(['success' => false, 'message' => 'Erreur de base de données']);
}
?>