(function() {

    // --- Configs & Vars ---
    var BACKGROUND_COLOR = 'rgba(11, 51, 56, 1)',
        PARTICLE_RADIUS = 1,
        G_POINT_RADIUS = 10;

    var canvas = document.getElementById('c'),
        bufferCvs = document.createElement('canvas'),
        context, bufferCtx,
        screenWidth, screenHeight,
        mouse = new Vector(),
        gravities = [],
        particles = [],
        grad;

    // --- Helper Functions ---
    function addParticle(num) {
        for (var i = 0; i < num; i++) {
            var p = new Particle(
                Math.random() * screenWidth,
                Math.random() * screenHeight,
                PARTICLE_RADIUS
            );
            p.addSpeed(Vector.random());
            particles.push(p);
        }
    }

    function resize() {
        screenWidth = canvas.width = window.innerWidth;
        screenHeight = canvas.height = window.innerHeight;
        bufferCvs.width = screenWidth;
        bufferCvs.height = screenHeight;
        context = canvas.getContext('2d');
        bufferCtx = bufferCvs.getContext('2d');

        var cx = screenWidth / 2, cy = screenHeight / 2;
        grad = context.createRadialGradient(cx, cy, 0, cx, cy, Math.sqrt(cx*cx + cy*cy));
        grad.addColorStop(0, 'rgba(0,0,0,0)');
        grad.addColorStop(1, 'rgba(0,0,0,0.35)');
    }

    // --- Restart Funktion ---
    function restart() {
        particles = [];
        gravities = [];
        addParticle(control.particleNum);
    }

    // --- Event Listener ---
    window.addEventListener('resize', resize);
    resize();

    var restartBtn = document.getElementById('restartBtn');
    restartBtn.addEventListener('click', restart);

    // --- GUI ---
    var control = { particleNum: 100 };
    var gui = new dat.GUI();
    gui.add(control, 'particleNum', 0, 500).step(1).name('Particle Num').onChange(function() {
        var n = control.particleNum - particles.length;
        if (n > 0) addParticle(n);
        else if (n < 0) particles.splice(0, -n);
    });
    gui.close();

    // --- Mouse Events ---
    canvas.addEventListener('mousemove', function(e) { mouse.set(e.clientX, e.clientY); });
    canvas.addEventListener('mousedown', function(e) {
        gravities.push(new GravityPoint(e.clientX, e.clientY, G_POINT_RADIUS, {
            particles: particles,
            gravities: gravities
        }));
    });

    // --- Initial Particles ---
    addParticle(control.particleNum);

    // --- Animation Loop ---
    function loop() {
        context.fillStyle = BACKGROUND_COLOR;
        context.fillRect(0, 0, screenWidth, screenHeight);
        context.fillStyle = grad;
        context.fillRect(0, 0, screenWidth, screenHeight);

        // Gravities
        for (var i = 0; i < gravities.length; i++) gravities[i].render(context);

        // Particles
        bufferCtx.clearRect(0, 0, screenWidth, screenHeight);
        bufferCtx.fillStyle = bufferCtx.strokeStyle = '#fff';
        bufferCtx.lineCap = bufferCtx.lineJoin = 'round';
        bufferCtx.lineWidth = PARTICLE_RADIUS * 2;
        bufferCtx.beginPath();
        for (var i = 0; i < particles.length; i++) {
            var p = particles[i];
            p.update();
            bufferCtx.moveTo(p.x, p.y);
            bufferCtx.lineTo(p._latest.x, p._latest.y);
        }
        bufferCtx.stroke();
        bufferCtx.beginPath();
        for (var i = 0; i < particles.length; i++) {
            var p = particles[i];
            bufferCtx.moveTo(p.x, p.y);
            bufferCtx.arc(p.x, p.y, p.radius, 0, Math.PI*2, false);
        }
        bufferCtx.fill();

        context.drawImage(bufferCvs, 0, 0);

        requestAnimationFrame(loop);
    }

    loop();

})();
