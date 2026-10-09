# traffic-control

A browser traffic-control arcade game built with vanilla JavaScript and PHP sessions.

You manage one busy intersection. North/South and East/West traffic alternate through a single signal phase. Cars stop on red, queue behind other cars and continue when the light turns green.

A collision ends the run.

## Features

- top-down intersection
- four traffic directions
- two traffic signal phases
- switchable North/South and East/West lights
- cars stop at red lights
- simple car-following behavior
- queue formation
- faster cars
- increasing traffic intensity
- collision detection
- score
- survived time
- cars-passed counter
- pause / restart
- keyboard controls
- touch / mouse controls
- PHP session high score
- best survived time
- best cars-passed result
- no framework
- no database

## Requirements

PHP 8.1+

## Run

```bash
php -S localhost:8000
```

Open:

```text
http://localhost:8000
```

## Controls

```text
Space          switch lights
Click canvas   switch lights
Button         switch lights
P              pause
```

## Signals

Only one axis is green at a time:

```text
North / South   GREEN
East / West     RED
```

or:

```text
North / South   RED
East / West     GREEN
```

## Difficulty

Traffic intensity gradually increases.

Later in the run:

- cars spawn more often
- fast cars become more common
- queues form faster
- timing becomes more important

## Score

Score grows from:

- survived time
- cars that safely leave the map

## PHP

PHP sessions store:

- high score
- best survived time
- best number of cars passed
- games played

The actual real-time simulation runs in JavaScript because smooth vehicle movement and collision detection need frame-by-frame updates.

## Project structure

```text
traffic-control/
├── index.php
├── score.php
├── assets/
│   ├── app.js
│   └── style.css
└── README.md
```

## Hosting

GitHub can host the source code, but GitHub Pages cannot execute PHP.

Use PHP-capable hosting, a VPS, or PHP's built-in development server.

## License

MIT
