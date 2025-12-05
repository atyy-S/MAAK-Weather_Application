<?php
// get_favorites.php
session_start();
header('Content-Type: application/json');
require 'config.php';   // gives us $pdo

if (!isset($pdo)) {
    exit;
}

if (!isset($_SESSION['user_id'])) {
    http_response_code(401);
    echo json_encode(['success' => false, 'error' => 'Not logged in']);
    exit;
}

$userId = (int)$_SESSION['user_id'];

try {
    $sql = "SELECT external_id, name, latitude, longitude, country, admin1
            FROM favorites
            WHERE user_id = :uid
            ORDER BY name";
    $stmt = $pdo->prepare($sql);
    $stmt->execute([':uid' => $userId]);
    $rows = $stmt->fetchAll();

    echo json_encode([
        'success'   => true,
        'favorites' => $rows
    ]);
} catch (Throwable $e) {
    echo json_encode([
        'success' => false,
        'error'   => $e->getMessage()
    ]);
}
