<?php
// remove_favorite.php
session_start();
header('Content-Type: application/json');
require 'config.php';

if (!isset($pdo)) {
    exit;
}

if (!isset($_SESSION['user_id'])) {
    http_response_code(401);
    echo json_encode(['success' => false, 'error' => 'Not logged in']);
    exit;
}

// read JSON body
$raw  = file_get_contents('php://input');
$data = json_decode($raw, true);

if (!is_array($data) || !isset($data['id'])) {
    echo json_encode(['success' => false, 'error' => 'Missing id.']);
    exit;
}

$id     = (int)$data['id'];
$userId = (int)$_SESSION['user_id'];

try {
    $sql  = "DELETE FROM favorites
             WHERE user_id = :uid AND external_id = :id";
    $stmt = $pdo->prepare($sql);
    $stmt->execute([':uid' => $userId, ':id' => $id]);

    echo json_encode(['success' => true]);
} catch (Throwable $e) {
    echo json_encode(['success' => false, 'error' => $e->getMessage()]);
}
