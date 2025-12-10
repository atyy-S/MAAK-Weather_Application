<?php
// add_favorite.php
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

if (!is_array($data)) {
    echo json_encode(['success' => false, 'error' => 'Invalid JSON body.']);
    exit;
}

$id        = isset($data['id'])        ? (int)$data['id']        : null;
$name      = isset($data['name'])      ? trim($data['name'])    : '';
$latitude  = isset($data['latitude'])  ? (float)$data['latitude']  : null;
$longitude = isset($data['longitude']) ? (float)$data['longitude'] : null;
$country   = isset($data['country'])   ? trim($data['country']) : '';
$admin1    = isset($data['admin1'])    ? trim($data['admin1'])  : '';

if (!$id || $name === '' || $latitude === null || $longitude === null) {
    echo json_encode(['success' => false, 'error' => 'Missing required fields.']);
    exit;
}

$userId = (int)$_SESSION['user_id'];

try {
    // Enforce max 10 favorites per user
    $stmt = $pdo->prepare("SELECT COUNT(*) FROM favorites WHERE user_id = :uid");
    $stmt->execute([':uid' => $userId]);
    $count = (int)$stmt->fetchColumn();

    if ($count >= 10) {
        echo json_encode([
            'success' => false,
            'error'   => 'You already have 10 favorites. Remove one first.'
        ]);
        exit;
    }

    $sql = "INSERT INTO favorites
              (user_id, external_id, name, latitude, longitude, country, admin1)
            VALUES
              (:uid, :id, :name, :lat, :lon, :country, :admin1)
            ON DUPLICATE KEY UPDATE
              name      = VALUES(name),
              latitude  = VALUES(latitude),
              longitude = VALUES(longitude),
              country   = VALUES(country),
              admin1    = VALUES(admin1)";

    $stmt = $pdo->prepare($sql);
    $stmt->execute([
        ':uid'     => $userId,
        ':id'      => $id,
        ':name'    => $name,
        ':lat'     => $latitude,
        ':lon'     => $longitude,
        ':country' => $country,
        ':admin1'  => $admin1
    ]);

    echo json_encode(['success' => true]);
} catch (Throwable $e) {
    echo json_encode(['success' => false, 'error' => $e->getMessage()]);
}
