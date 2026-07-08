(function () {
    // === FAQ Accordion ===
    (function () {
        document.querySelectorAll('.faq-btn').forEach(function (btn) {
            btn.addEventListener('click', function () {
                var item = btn.closest('.faq-item');
                var body = item.querySelector('.faq-body');
                var isOpen = item.classList.contains('open');

                // Close all open items
                document.querySelectorAll('.faq-item.open').forEach(function (openItem) {
                    openItem.classList.remove('open');
                    openItem.querySelector('.faq-body').style.maxHeight = '0';
                });

                // Open the clicked item if it was closed
                if (!isOpen) {
                    item.classList.add('open');
                    body.style.maxHeight = body.scrollHeight + 'px';
                }
            });
        });
    })();

    // === Metrics Strip Count-Up ===
    (function () {
        var els = document.querySelectorAll('.metric-value[data-count]');
        if (!els.length || !('IntersectionObserver' in window)) return;

        function animateCount(el) {
            var target = parseFloat(el.dataset.count);
            var prefix = el.dataset.prefix || '';
            var suffix = el.dataset.suffix || '';
            var isDecimal = !!el.dataset.decimal;
            var duration = 1600;
            var start = null;

            function easeOut(t) { return 1 - Math.pow(1 - t, 3); }

            function step(ts) {
                if (!start) start = ts;
                var progress = Math.min((ts - start) / duration, 1);
                var val = target * easeOut(progress);
                el.textContent = prefix + (isDecimal ? val.toFixed(1) : Math.floor(val)) + suffix;
                if (progress < 1) requestAnimationFrame(step);
                else el.textContent = prefix + (isDecimal ? target.toFixed(1) : target) + suffix;
            }
            requestAnimationFrame(step);
        }

        var obs = new IntersectionObserver(function (entries) {
            entries.forEach(function (entry) {
                if (entry.isIntersecting) {
                    animateCount(entry.target);
                    obs.unobserve(entry.target);
                }
            });
        }, { threshold: 0.5 });

        els.forEach(function (el) { obs.observe(el); });
    })();

    const btn = document.getElementById('mobile-menu-btn');
    const menu = document.getElementById('mobile-menu');
    const nav = document.getElementById('header');

    // == Smooth scrolling ==
    function scrollToAnchor(target) {
        if (!target) return;
        const headerOffset = nav ? nav.offsetHeight + 8 : 0;
        const targetTop = target.getBoundingClientRect().top + window.scrollY - headerOffset;
        window.scrollTo({ top: targetTop, behavior: 'smooth' });
    }

    document.querySelectorAll('a[href^="#"]').forEach(function (anchor) {
        var href = anchor.getAttribute('href');
        if (!href || href === '#') return;
        anchor.addEventListener('click', function (event) {
            var target = document.querySelector(href);
            if (!target) return;
            event.preventDefault();
            scrollToAnchor(target);
            window.history.replaceState(null, '', window.location.pathname + window.location.search);
        });
    });

    if (window.location.hash) {
        var initialTarget = document.querySelector(window.location.hash);
        if (initialTarget) {
            setTimeout(function () {
                scrollToAnchor(initialTarget);
                window.history.replaceState(null, '', window.location.pathname + window.location.search);
            }, 0);
        }
    }

    // === Preloader ===
    var preloader = document.getElementById('preloader');
    if (preloader) {
        preloader.classList.add('preloader-hidden');
        preloader.addEventListener('transitionend', function () {
            preloader.remove();
        });
    }

    // === Mobile menu ===
    if (btn && menu) {
        btn.addEventListener('click', function () { menu.classList.toggle('mobile-menu-open'); });
        menu.querySelectorAll('a').forEach(function (link) {
            link.addEventListener('click', function () { menu.classList.remove('mobile-menu-open'); });
        });
    }

    // === Nav shadow on scroll + header-active ===
    if (nav) {
        window.addEventListener('scroll', function () {
            if (window.scrollY > 50) {
                nav.classList.add('shadow-lg', 'shadow-black/20', 'scrolled', 'header-active');
            } else {
                nav.classList.remove('shadow-lg', 'shadow-black/20', 'scrolled', 'header-active');
            }
        }, { passive: true });
    }

    // === Scroll Progress Bar ===
    var progressBar = document.getElementById('scroll-progress');
    if (progressBar) {
        window.addEventListener('scroll', function () {
            var scrollTop = window.scrollY;
            var docHeight = document.documentElement.scrollHeight - window.innerHeight;
            progressBar.style.width = (docHeight > 0 ? (scrollTop / docHeight) * 100 : 0) + '%';
        }, { passive: true });
    }

    // === Terminal typing animation ===
    (function initTerminal() {
        var termBody = document.getElementById('terminal-body');
        if (!termBody) return;

        var lines = [
            { prompt: '$ ', cmd: 'w2s health-check --all-systems', delay: 0 },
            { output: '<span class="text-slate-500">▸ scanning infrastructure nodes...</span>', delay: 800 },
            { output: '<span class="text-green-400">✓</span> <span class="text-slate-300">Kubernetes clusters</span> <span class="text-emerald-400 font-semibold">HEALTHY</span> <span class="text-slate-600">— 24 nodes, 0 alerts</span>', delay: 1600 },
            { output: '<span class="text-green-400">✓</span> <span class="text-slate-300">Zero-trust gateway</span>  <span class="text-emerald-400 font-semibold">ACTIVE</span>  <span class="text-slate-600">— 0 policy violations</span>', delay: 2400 },
            { output: '<span class="text-green-400">✓</span> <span class="text-slate-300">Backup integrity</span>   <span class="text-emerald-400 font-semibold">VERIFIED</span> <span class="text-slate-600">— RPO 12m, last: 3m ago</span>', delay: 3200 },
            { output: '<span class="text-green-400">✓</span> <span class="text-slate-300">DR failover test</span>   <span class="text-emerald-400 font-semibold">PASSED</span> <span class="text-slate-600">— RTO 42s measured</span>', delay: 4000 },
            { prompt: '$ ', cmd: 'w2s status --summary', delay: 4800 },
            { output: '<span class="text-green-400">✓</span> <span class="text-cyan-400 font-semibold">All 142 workloads operational</span> <span class="text-slate-500">— uptime 99.997%</span>', delay: 5600 },
        ];

        var started = false;

        function runTerminal() {
            if (started) return;
            started = true;
            lines.forEach(function (line, i) {
                var div = document.createElement('div');
                div.className = 'terminal-line';
                if (line.cmd) {
                    div.innerHTML = '<span class="text-green-400">' + line.prompt + '</span><span class="text-slate-200" id="term-cmd-' + i + '"></span>';
                } else {
                    div.innerHTML = line.output;
                }
                termBody.appendChild(div);
                setTimeout(function () {
                    div.classList.add('visible');
                    if (line.cmd) typeText('term-cmd-' + i, line.cmd, 30);
                }, line.delay);
            });
            setTimeout(function () {
                var cursorLine = document.createElement('div');
                cursorLine.className = 'terminal-line';
                cursorLine.innerHTML = '<span class="text-green-400">$ </span><span class="terminal-cursor"></span>';
                termBody.appendChild(cursorLine);
                setTimeout(function () { cursorLine.classList.add('visible'); }, 100);
            }, lines[lines.length - 1].delay + 600);
        }

        function typeText(elId, text, speed) {
            var el = document.getElementById(elId);
            if (!el) return;
            var idx = 0;
            var interval = setInterval(function () {
                el.textContent += text[idx];
                idx++;
                if (idx >= text.length) clearInterval(interval);
            }, speed);
        }

        if ('IntersectionObserver' in window) {
            var termObs = new IntersectionObserver(function (entries) {
                entries.forEach(function (entry) {
                    if (entry.isIntersecting) { runTerminal(); termObs.unobserve(entry.target); }
                });
            }, { threshold: 0.3 });
            termObs.observe(termBody);
        } else {
            runTerminal();
        }
    })();

    // === Scroll-triggered animations (fade-up, fade-left) ===
    var animEls = document.querySelectorAll('.fade-up, .fade-left');
    if (animEls.length && 'IntersectionObserver' in window) {
        var animObs = new IntersectionObserver(function (entries) {
            entries.forEach(function (entry) {
                if (entry.isIntersecting) {
                    entry.target.classList.add('visible');
                    animObs.unobserve(entry.target);
                }
            });
        }, { threshold: 0.12 });
        animEls.forEach(function (el) { animObs.observe(el); });
    } else {
        animEls.forEach(function (el) { el.classList.add('visible'); });
    }

    // === Hero Word Stagger Animation ===
    (function heroStagger() {
        var words = document.querySelectorAll('.hero-word');
        var subtitle = document.querySelector('.hero-subtitle');
        var desc = document.querySelector('.hero-desc');
        if (!words.length) return;
        words.forEach(function (w, i) {
            setTimeout(function () { w.classList.add('visible'); }, 300 + i * 200);
        });
        if (subtitle) setTimeout(function () { subtitle.classList.add('visible'); }, 300 + words.length * 200);
        if (desc) setTimeout(function () { desc.classList.add('visible'); }, 300 + words.length * 200 + 200);
    })();

    // === Hero Event Stream Ticker ===
    (function heroEventStream() {
        var stream = document.getElementById('hero-event-stream');
        if (!stream) return;
        var events = [
            { color: 'bg-emerald-400', text: 'backup ok · rpo=4m · nodes=24' },
            { color: 'bg-primary',     text: 'deploy · <span class="text-primary">v2.14.1</span> → k8s prod' },
            { color: 'bg-accent',      text: 'zt-policy audit · 0 violations' },
            { color: 'bg-emerald-400', text: 'health check passed · 24/24 pods' },
            { color: 'bg-primary',     text: 'autoscale · +2 replicas · api-svc' },
            { color: 'bg-accent',      text: 'cert renewed · expiry +90d' },
            { color: 'bg-emerald-400', text: 'snapshot ok · dr-site synced' },
        ];
        var idx = events.length;
        function pad(n) { return n < 10 ? '0' + n : '' + n; }
        setInterval(function () {
            var now = new Date();
            var ts = pad(now.getHours()) + ':' + pad(now.getMinutes()) + ':' + pad(now.getSeconds());
            var ev = events[idx % events.length]; idx++;
            var rows = stream.querySelectorAll('div');
            if (rows.length >= 3) rows[rows.length - 1].remove();
            var row = document.createElement('div');
            row.className = 'flex items-center gap-2';
            row.style.cssText = 'opacity:0;transform:translateY(-6px);transition:opacity 0.3s ease,transform 0.3s ease';
            row.innerHTML = '<span class="text-slate-300 flex-shrink-0">' + ts + '</span>'
                + '<span class="w-1.5 h-1.5 rounded-full ' + ev.color + ' flex-shrink-0"></span>'
                + '<span class="text-slate-500 truncate">' + ev.text + '</span>';
            stream.insertBefore(row, stream.firstChild);
            requestAnimationFrame(function () {
                requestAnimationFrame(function () {
                    row.style.opacity = '1';
                    row.style.transform = 'translateY(0)';
                });
            });
        }, 4000);
    })();

    // === Glow Card Mouse Tracking ===
    document.querySelectorAll('.glow-card').forEach(function (card) {
        card.addEventListener('mousemove', function (e) {
            var rect = card.getBoundingClientRect();
            card.style.setProperty('--mouse-x', (e.clientX - rect.left) + 'px');
            card.style.setProperty('--mouse-y', (e.clientY - rect.top) + 'px');
        });
    });

    // === Animated Counter ===
    (function initCounters() {
        var counters = document.querySelectorAll('.stat-number');
        if (!counters.length) return;

        function easeOutExpo(t) {
            return t === 1 ? 1 : 1 - Math.pow(2, -10 * t);
        }

        function animateCounter(element, startVal, targetValue, duration) {
            var decimals = parseInt(element.dataset.decimals) || 0;
            var suffix = element.dataset.suffix || '';
            var startTime = performance.now();

            function update(now) {
                var elapsed = now - startTime;
                var progress = Math.min(elapsed / duration, 1);
                var ease = easeOutExpo(progress);
                var current = startVal + (targetValue - startVal) * ease;
                element.textContent = (decimals > 0 ? current.toFixed(decimals) : Math.floor(current)) + suffix;
                if (progress < 1) requestAnimationFrame(update);
            }
            requestAnimationFrame(update);
        }

        counters.forEach(function (element) {
            // Static counters (e.g. 24/7) — no animation
            if (element.dataset.static) {
                var observer = new IntersectionObserver(function (entries) {
                    entries.forEach(function (entry) {
                        if (entry.isIntersecting) {
                            element.textContent = element.dataset.static;
                            observer.unobserve(entry.target);
                        }
                    });
                }, { threshold: 0.3 });
                observer.observe(element);
                return;
            }

            // Animated counters
            var targetValue = parseFloat(element.dataset.target);
            var observer = new IntersectionObserver(function (entries) {
                entries.forEach(function (entry) {
                    if (entry.isIntersecting) {
                        animateCounter(element, 0, targetValue, 2000);
                        observer.unobserve(entry.target);
                    }
                });
            }, { threshold: 0.3 });
            observer.observe(element);
        });
    })();

    // === Particle Network Canvas ===
    (function initParticles() {
        var canvas = document.getElementById('particle-canvas');
        if (!canvas) return;
        var ctx = canvas.getContext('2d');
        var particles = [];
        var mouse = { x: null, y: null };
        var particleCount = Math.min(80, Math.floor(window.innerWidth / 15));
        var connectDist = 150;

        function resize() {
            var hero = canvas.parentElement;
            canvas.width = hero.offsetWidth;
            canvas.height = hero.offsetHeight;
        }
        resize();
        window.addEventListener('resize', resize);

        function Particle() {
            this.x = Math.random() * canvas.width;
            this.y = Math.random() * canvas.height;
            this.vx = (Math.random() - 0.5) * 0.4;
            this.vy = (Math.random() - 0.5) * 0.4;
            this.r = Math.random() * 1.5 + 0.5;
        }

        for (var i = 0; i < particleCount; i++) particles.push(new Particle());

        canvas.parentElement.addEventListener('mousemove', function (e) {
            var rect = canvas.getBoundingClientRect();
            mouse.x = e.clientX - rect.left;
            mouse.y = e.clientY - rect.top;
        });
        canvas.parentElement.addEventListener('mouseleave', function () {
            mouse.x = null; mouse.y = null;
        });

        function draw() {
            ctx.clearRect(0, 0, canvas.width, canvas.height);

            for (var i = 0; i < particles.length; i++) {
                var p = particles[i];
                p.x += p.vx; p.y += p.vy;
                if (p.x < 0 || p.x > canvas.width) p.vx *= -1;
                if (p.y < 0 || p.y > canvas.height) p.vy *= -1;

                // Draw particle
                ctx.beginPath();
                ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
                ctx.fillStyle = 'rgba(14, 165, 233, 0.5)';
                ctx.fill();

                // Connect to nearby particles
                for (var j = i + 1; j < particles.length; j++) {
                    var p2 = particles[j];
                    var dx = p.x - p2.x, dy = p.y - p2.y;
                    var dist = Math.sqrt(dx * dx + dy * dy);
                    if (dist < connectDist) {
                        ctx.beginPath();
                        ctx.moveTo(p.x, p.y);
                        ctx.lineTo(p2.x, p2.y);
                        ctx.strokeStyle = 'rgba(14, 165, 233, ' + (0.12 * (1 - dist / connectDist)) + ')';
                        ctx.lineWidth = 0.5;
                        ctx.stroke();
                    }
                }

                // Connect to mouse
                if (mouse.x !== null) {
                    var dmx = p.x - mouse.x, dmy = p.y - mouse.y;
                    var mdist = Math.sqrt(dmx * dmx + dmy * dmy);
                    if (mdist < 200) {
                        ctx.beginPath();
                        ctx.moveTo(p.x, p.y);
                        ctx.lineTo(mouse.x, mouse.y);
                        ctx.strokeStyle = 'rgba(99, 102, 241, ' + (0.2 * (1 - mdist / 200)) + ')';
                        ctx.lineWidth = 0.6;
                        ctx.stroke();
                    }
                }
            }
            requestAnimationFrame(draw);
        }

        // Only run particles if no reduced-motion preference
        if (!window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
            draw();
        }
    })();

    // === Scroll to Top Button ===
    var scrollTopBtn = document.getElementById('scrollTop');
    if (scrollTopBtn) {
        window.addEventListener('scroll', function () {
            if (window.scrollY > 400) {
                scrollTopBtn.classList.add('visible');
            } else {
                scrollTopBtn.classList.remove('visible');
            }
        }, { passive: true });
        scrollTopBtn.addEventListener('click', function () {
            window.scrollTo({ top: 0, behavior: 'smooth' });
        });
    }

    // === Sticky Fast-Action CTA Bar ===
    (function initFastActionBar() {
        var bar = document.getElementById('fast-action-bar');
        var hero = document.getElementById('hero');
        if (!bar || !hero) return;

        var heroObserver = new IntersectionObserver(function (entries) {
            entries.forEach(function (entry) {
                if (entry.isIntersecting) {
                    // User is in hero — hide the bar
                    bar.classList.remove('visible');
                } else {
                    // User has scrolled past hero — show the bar
                    bar.classList.add('visible');
                }
            });
        }, { threshold: 0 });

        heroObserver.observe(hero);
    })();

    // === Hero Mouse-follow Spotlight ===
    (function initHeroSpotlight() {
        var heroSection = document.getElementById('hero');
        var spotlight = document.getElementById('hero-spotlight');
        if (!heroSection || !spotlight) return;

        heroSection.addEventListener('mousemove', function (e) {
            var rect = heroSection.getBoundingClientRect();
            var x = e.clientX - rect.left;
            var y = e.clientY - rect.top;
            spotlight.style.setProperty('--hero-mouse-x', x + 'px');
            spotlight.style.setProperty('--hero-mouse-y', y + 'px');
            if (!spotlight.classList.contains('active')) {
                spotlight.classList.add('active');
            }
        });
        heroSection.addEventListener('mouseleave', function () {
            spotlight.classList.remove('active');
        });
    })();

    // === Active Nav Section Highlight (IntersectionObserver) ===
    (function initActiveNav() {
        var sectionIds = ['hero', 'focus', 'process', 'technologies', 'why', 'readiness', 'insights'];
        var navLinks = document.querySelectorAll('#header .hidden.md\\:flex a[href^="#"]:not([class*="bg-gradient"])');
        var linkMap = {};
        navLinks.forEach(function (link) {
            var href = link.getAttribute('href');
            if (href) linkMap[href.replace('#', '')] = link;
        });

        var currentActive = null;

        var observer = new IntersectionObserver(function (entries) {
            entries.forEach(function (entry) {
                var id = entry.target.id;
                if (entry.isIntersecting) {
                    navLinks.forEach(function (l) { l.classList.remove('nav-link-active'); });
                    if (linkMap[id]) {
                        linkMap[id].classList.add('nav-link-active');
                        currentActive = id;
                    }
                }
            });
        }, { rootMargin: '-20% 0px -60% 0px', threshold: 0 });

        sectionIds.forEach(function (id) {
            var sec = document.getElementById(id);
            if (sec) observer.observe(sec);
        });
    })();

    // === Contact Form Validation ===
    (function initContactForm() {
        var form = document.getElementById('contact-form');
        if (!form) return;

        var inputs = form.querySelectorAll('.form-input');

        form.addEventListener('submit', function (e) {
            e.preventDefault();
            var valid = true;

            inputs.forEach(function (input) {
                input.classList.remove('error');
                if (input.dataset.optional) return;
                var val = input.value.trim();
                if (!val) {
                    input.classList.add('error');
                    valid = false;
                }
                if (input.type === 'email' && val && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val)) {
                    input.classList.add('error');
                    valid = false;
                }
            });

            if (!valid) return;

            // Collect form data
            var name = form.querySelector('[name="name"]').value.trim();
            var company = form.querySelector('[name="company"]').value.trim();
            var email = form.querySelector('[name="email"]').value.trim();
            var challenge = form.querySelector('[name="challenge"]').value.trim();

            // Hide form, show success
            var formWrapper = document.getElementById('cta-form-wrapper');
            if (formWrapper) formWrapper.style.display = 'none';
            document.getElementById('form-success').style.display = 'block';

            // TODO: Replace with actual backend API call (e.g., POST /api/contact)
            // Mailto fallback after short delay so user sees the success message
            setTimeout(function () {
                var subject = encodeURIComponent('Talk to an Architect — ' + company);
                var body = encodeURIComponent(
                    'Name: ' + name + '\n' +
                    'Company: ' + company + '\n' +
                    'Email: ' + email + '\n\n' +
                    'Challenge:\n' + challenge
                );
                window.location.href = 'mailto:hello@we2systems.com?subject=' + subject + '&body=' + body;
            }, 600);
        });

        // Remove error + shake on input
        inputs.forEach(function (input) {
            input.addEventListener('input', function () {
                input.classList.remove('error');
            });
        });
    })();

    // === Scrollytelling: piece-by-piece SVG build animations ===
    (function initScrollytelling() {
        var triggers = document.querySelectorAll('.scrolly-trigger');
        if (!triggers.length) return;

        var observer = new IntersectionObserver(function (entries) {
            entries.forEach(function (entry) {
                if (entry.isIntersecting) {
                    var el = entry.target;
                    // Apply staggered transition-delay to each piece based on data-delay
                    var pieces = el.querySelectorAll('.scrolly-piece');
                    pieces.forEach(function (piece) {
                        var delay = parseInt(piece.getAttribute('data-delay')) || 0;
                        piece.style.transitionDelay = delay + 'ms';
                    });
                    // Trigger the animation
                    el.classList.add('active');
                    observer.unobserve(el);
                }
            });
        }, { threshold: 0.3 });

        triggers.forEach(function (t) { observer.observe(t); });
    })();

    // === Process Path — Scroll-triggered line animation ===
    (function initProcessPath() {
        var pathLine = document.getElementById('process-path');
        var processGrid = document.getElementById('process-grid');
        if (!pathLine || !processGrid) return;

        var observer = new IntersectionObserver(function (entries) {
            entries.forEach(function (entry) {
                if (entry.isIntersecting) {
                    pathLine.classList.add('active');
                    observer.unobserve(entry.target);
                }
            });
        }, { threshold: 0.25 });
        observer.observe(processGrid);
    })();

    // === Service Card 3D Tilt on Mouse Move ===
    (function initCardTilt() {
        var cards = document.querySelectorAll('.service-card');
        if (!cards.length) return;
        var maxTilt = 6; // degrees

        cards.forEach(function (card) {
            card.addEventListener('mousemove', function (e) {
                var rect = card.getBoundingClientRect();
                var x = e.clientX - rect.left;
                var y = e.clientY - rect.top;
                var centerX = rect.width / 2;
                var centerY = rect.height / 2;
                var rotateY = ((x - centerX) / centerX) * maxTilt;
                var rotateX = ((centerY - y) / centerY) * maxTilt;
                card.style.transform = 'perspective(800px) rotateX(' + rotateX + 'deg) rotateY(' + rotateY + 'deg) translateY(-6px)';
            });

            card.addEventListener('mouseleave', function () {
                card.style.transform = '';
            });
        });
    })();

    // === Live Infrastructure Status Widget ===
    (function initStatusWidget() {
        var barContainers = ['api-bars', 'infra-bars', 'auth-bars'];
        var barCount = 12;

        // Generate simulated uptime bars for each service
        barContainers.forEach(function (id) {
            var container = document.getElementById(id);
            if (!container) return;
            for (var i = 0; i < barCount; i++) {
                var bar = document.createElement('div');
                bar.className = 'status-bar';
                // Simulate realistic uptime: mostly 100%, occasional dips
                var h = Math.random() > 0.1 ? 12 + Math.random() * 4 : 6 + Math.random() * 4;
                bar.style.height = h + 'px';
                bar.style.opacity = h > 10 ? '0.7' : '0.4';
                if (h < 8) bar.style.background = '#fbbf24'; // amber for degraded
                container.appendChild(bar);
            }
        });

        // Update "last check" time every 30s
        var timeEl = document.getElementById('status-time');
        if (timeEl) {
            var seconds = 0;
            setInterval(function () {
                seconds += 30;
                if (seconds < 60) {
                    timeEl.textContent = seconds + 's ago';
                } else {
                    timeEl.textContent = Math.floor(seconds / 60) + 'm ago';
                }
            }, 30000);
        }
    })();

})();
