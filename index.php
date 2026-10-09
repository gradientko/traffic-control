<?php
session_start();

if (!isset($_SESSION['traffic_control'])) {
    $_SESSION['traffic_control'] = [
        'high_score' => 0,
        'best_time' => 0,
        'best_passed' => 0,
        'games_played' => 0,
    ];
}

$stats = $_SESSION['traffic_control'];
?>
<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width,initial-scale=1">
  <title>Traffic Control — PHP + JavaScript</title>
  <meta name="description" content="Control a busy intersection and prevent crashes.">
  <link rel="stylesheet" href="assets/style.css">
</head>
<body>
<main class="shell">
  <header class="hero">
    <div>
      <span class="eyebrow">TRAFFIC CONTROL</span>
      <h1>Keep it moving.</h1>
      <p>Switch the lights, avoid collisions and survive as traffic gets faster.</p>
    </div>
    <button id="restart" class="link-button" type="button">Restart</button>
  </header>

  <section class="stats">
    <div><span>Score</span><strong id="score">0</strong></div>
    <div><span>Best</span><strong id="best"><?= (int)$stats['high_score'] ?></strong></div>
    <div><span>Passed</span><strong id="passed">0</strong></div>
    <div><span>Time</span><strong id="time">0s</strong></div>
  </section>

  <section class="layout">
    <div class="game-wrap">
      <canvas id="game" width="860" height="720" aria-label="Traffic Control game canvas"></canvas>

      <div class="overlay" id="overlay">
        <span class="eyebrow" id="overlay-kicker">READY</span>
        <h2 id="overlay-title">Control the intersection.</h2>
        <p id="overlay-copy">North/South starts green. Switch before traffic blocks or crashes.</p>
        <button id="start" type="button">Start game</button>
      </div>
    </div>

    <aside class="side">
      <section class="panel signal-panel">
        <span class="eyebrow">SIGNALS</span>

        <div class="signal-row">
          <div>
            <span>North / South</span>
            <strong id="ns-label">GREEN</strong>
          </div>
          <i id="ns-light" class="light green"></i>
        </div>

        <div class="signal-row">
          <div>
            <span>East / West</span>
            <strong id="ew-label">RED</strong>
          </div>
          <i id="ew-light" class="light red"></i>
        </div>
      </section>

      <button id="switch" class="primary" type="button">SWITCH LIGHTS</button>

      <section class="panel">
        <span class="eyebrow">STATUS</span>
        <strong class="status-title" id="status-title">Ready</strong>
        <p id="status-copy">Cars stop at red lights and continue on green.</p>
      </section>

      <section class="legend">
        <div><i class="car-mark normal"></i><span>Car</span></div>
        <div><i class="car-mark fast"></i><span>Fast car</span></div>
        <div><i class="danger-mark"></i><span>Collision</span></div>
      </section>

      <button id="pause" class="secondary" type="button">Pause</button>
    </aside>
  </section>

  <footer>
    <span>Canvas simulation · traffic AI · PHP sessions</span>
    <span>traffic-control</span>
  </footer>
</main>

<script>
window.TRAFFIC_STATS = <?= json_encode([
  'highScore' => (int)$stats['high_score'],
  'bestTime' => (int)$stats['best_time'],
  'bestPassed' => (int)$stats['best_passed'],
  'gamesPlayed' => (int)$stats['games_played']
]) ?>;
</script>
<script src="assets/app.js"></script>
</body>
</html>
