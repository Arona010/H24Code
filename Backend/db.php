<?php
/**
 * CONFIGURATION DE LA BASE DE DONNÉES
 */
$host = 'sql200.infinityfree.com';    
$dbname = 'if0_39590430_h24code';     
$username = 'if0_39590430';           
$password = 'AD6FEjhDcgPI1Y';         
$charset = 'utf8mb4';                 // Variable manquante ajoutée

$dsn = "mysql:host=$host;dbname=$dbname;charset=$charset";
$options = [
    PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
    PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
    PDO::ATTR_EMULATE_PREPARES => false,
];

try {
    $pdo = new PDO($dsn, $username, $password, $options);
    
    // Création de la table si elle n'existe pas
    $pdo->exec("
        CREATE TABLE IF NOT EXISTS snippets (
            id INT AUTO_INCREMENT PRIMARY KEY,
            title VARCHAR(255) NOT NULL,
            description TEXT NOT NULL,
            code TEXT NOT NULL,
            category VARCHAR(50) NOT NULL,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
        )
    ");
    
} catch (PDOException $e) {
    error_log('Database error: ' . $e->getMessage());
    
    // En mode développement, afficher l'erreur détaillée
    if (isset($_GET['debug']) && $_GET['debug'] === '1') {
        header('Content-Type: application/json');
        http_response_code(500);
        echo json_encode([
            'success' => false,
            'message' => 'Erreur de connexion à la base de données',
            'error' => $e->getMessage(),
            'code' => $e->getCode()
        ]);
        exit;
    }
    
    header('Content-Type: application/json');
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'message' => 'Erreur de connexion à la base de données'
    ]);
    exit;
}
?>