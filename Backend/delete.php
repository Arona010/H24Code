<?php
require_once './db.php';

header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: DELETE, POST');

// Accepte DELETE ou POST pour plus de flexibilité
if (!in_array($_SERVER['REQUEST_METHOD'], ['DELETE', 'POST'])) {
    http_response_code(405);
    echo json_encode(['success' => false, 'message' => 'Méthode non autorisée']);
    exit;
}

// Récupération de l'ID depuis les paramètres GET, POST ou JSON
$id = $_GET['id'] ?? $_POST['id'] ?? null;

// Si pas dans GET/POST, vérifie le corps de la requête (pour DELETE)
if ($id === null) {
    $input = json_decode(file_get_contents('php://input'), true);
    $id = $input['id'] ?? null;
}

if (!$id) {
    http_response_code(400);
    echo json_encode(['success' => false, 'message' => 'ID manquant']);
    exit;
}

try {
    // Vérifie d'abord que le snippet existe
    $stmt = $pdo->prepare("SELECT id FROM snippets WHERE id = ?");
    $stmt->execute([$id]);
    
    if ($stmt->rowCount() === 0) {
        http_response_code(404);
        echo json_encode(['success' => false, 'message' => 'Snippet non trouvé']);
        exit;
    }

    // Suppression effective
    $stmt = $pdo->prepare("DELETE FROM snippets WHERE id = ?");
    $stmt->execute([$id]);
    
    echo json_encode([
        'success' => true,
        'message' => 'Snippet supprimé avec succès'
    ]);
} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(['success' => false, 'message' => 'Erreur de base de données']);
}
?>