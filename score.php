<?php
session_start();
header('Content-Type: application/json; charset=utf-8');

function respond(array $payload, int $status = 200): never {
    http_response_code($status);
    echo json_encode($payload);
    exit;
}

$input = json_decode(file_get_contents('php://input'), true);

if (!is_array($input)) {
    respond(['error' => 'Invalid JSON'], 400);
}

$score = $input['score'] ?? null;
$time = $input['time'] ?? null;
$passed = $input['passed'] ?? null;

if (!is_int($score) || !is_int($time) || !is_int($passed)) {
    respond(['error' => 'Invalid result'], 422);
}

if (
    $score < 0 || $score > 100000000 ||
    $time < 0 || $time > 86400 ||
    $passed < 0 || $passed > 1000000
) {
    respond(['error' => 'Result out of range'], 422);
}

if (!isset($_SESSION['traffic_control'])) {
    $_SESSION['traffic_control'] = [
        'high_score' => 0,
        'best_time' => 0,
        'best_passed' => 0,
        'games_played' => 0,
    ];
}

$_SESSION['traffic_control']['high_score'] = max(
    $_SESSION['traffic_control']['high_score'],
    $score
);

$_SESSION['traffic_control']['best_time'] = max(
    $_SESSION['traffic_control']['best_time'],
    $time
);

$_SESSION['traffic_control']['best_passed'] = max(
    $_SESSION['traffic_control']['best_passed'],
    $passed
);

$_SESSION['traffic_control']['games_played']++;

respond([
    'ok' => true,
    'highScore' => $_SESSION['traffic_control']['high_score'],
    'bestTime' => $_SESSION['traffic_control']['best_time'],
    'bestPassed' => $_SESSION['traffic_control']['best_passed'],
    'gamesPlayed' => $_SESSION['traffic_control']['games_played'],
]);
