<?php
require_once 'db.php';

header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET');

try {
    $category = $_GET['category'] ?? '';
    $search = $_GET['search'] ?? '';
    $limit = min((int)($_GET['limit'] ?? 12), 50);
    $offset = (int)($_GET['offset'] ?? 0);

    $where = [];
    $params = [];

    if (!empty($category)) {
        $where[] = 'category = :category';
        $params[':category'] = $category;
    }

    if (!empty($search)) {
        $where[] = '(title LIKE :search OR description LIKE :search OR code LIKE :search)';
        $params[':search'] = "%$search%";
    }

    $whereClause = $where ? 'WHERE ' . implode(' AND ', $where) : '';

    // Requête pour les snippets
   $stmt = $pdo->prepare("
    SELECT id, title, description, category, code, created_at
    FROM snippets
    $whereClause
    ORDER BY created_at DESC
    LIMIT :limit OFFSET :offset
");

    
    foreach ($params as $k => $v) {
        $stmt->bindValue($k, $v);
    }
    $stmt->bindValue(':limit', $limit, PDO::PARAM_INT);
    $stmt->bindValue(':offset', $offset, PDO::PARAM_INT);
    $stmt->execute();
    $snippets = $stmt->fetchAll();

    // Requête pour le total
    $countStmt = $pdo->prepare("SELECT COUNT(*) FROM snippets $whereClause");
    foreach ($params as $k => $v) {
        $countStmt->bindValue($k, $v);
    }
    $countStmt->execute();
    $total = $countStmt->fetchColumn();

    echo json_encode([
        'success' => true,
        'data' => $snippets,
        'total' => (int)$total,
        'limit' => $limit,
        'offset' => $offset
    ]);
} catch (PDOException $e) {
    error_log('Database error: ' . $e->getMessage());
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'message' => 'Erreur de base de données',
        'error' => $e->getMessage()
    ]);
}
?>