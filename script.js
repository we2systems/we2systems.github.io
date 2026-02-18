// ── Fluid Background ──────────────────────────────────────────────────────────
const fluidBg = document.getElementById("fluid-bg");
fluidBg.style.setProperty("--x", "50%");
fluidBg.style.setProperty("--y", "50%");

document.addEventListener("mousemove", (e) => {
    const x = (e.clientX / window.innerWidth) * 100;
    const y = (e.clientY / window.innerHeight) * 100;
    fluidBg.style.setProperty("--x", `${x}%`);
    fluidBg.style.setProperty("--y", `${y}%`);
});

// ── Mobile Menu Toggle ────────────────────────────────────────────────────────
const mobileBtn = document.getElementById("mobileMenuBtn");
const mobileMenu = document.getElementById("mobileMenu");

mobileBtn.addEventListener("click", () => {
    mobileMenu.classList.toggle("hidden");
});

// ── Parallax ──────────────────────────────────────────────────────────────────
window.addEventListener("scroll", () => {
    const scrollY = window.scrollY;
    const speed = 0.18;
    const element = document.getElementById("parallaxText");
    if (element) {
        element.style.transform = `translateY(${scrollY * speed}px)`;
    }
});

// ── Smooth Scroll ─────────────────────────────────────────────────────────────
const links = document.querySelectorAll('a[href^="#"]');
for (const link of links) {
    link.addEventListener("click", (e) => {
        e.preventDefault();
        const target = document.querySelector(link.getAttribute("href"));
        if (target) {
            target.scrollIntoView({ behavior: "smooth" });
        }
    });
}

// ── Services Slider ───────────────────────────────────────────────────────────
const tabs = document.querySelectorAll(".service-tab");
let currentIndex = 0;
const slider = document.getElementById("sliderWrapper");

function slideTo(index) {
    slider.style.transform = `translateX(-${index * 100}%)`;

    // Dynamic Glow Change
    const display = document.getElementById("serviceDisplay");
    display.classList.remove("glow-hpc", "glow-hpe", "glow-cloud", "glow-data", "glow-physical");
    switch (index) {
        case 0: display.classList.add("glow-hpc"); break;
        case 1: display.classList.add("glow-hpe"); break;
        case 2: display.classList.add("glow-cloud"); break;
        case 3: display.classList.add("glow-data"); break;
        case 4: display.classList.add("glow-physical"); break;
    }

    tabs.forEach((t) => t.classList.remove("bg-primary-blue", "text-white"));
    tabs[index].classList.add("bg-primary-blue", "text-white");
    currentIndex = index;
}

tabs.forEach((tab, idx) => {
    tab.addEventListener("click", () => {
        clearInterval(autoScrollTiles);
        slideTo(idx);
    });
});

const prevBtn = document.getElementById("prevBtn");
const nextBtn = document.getElementById("nextBtn");

if (prevBtn) {
    prevBtn.addEventListener("click", () => {
        clearInterval(autoScrollTiles);
        const prev = (currentIndex - 1 + tabs.length) % tabs.length;
        slideTo(prev);
    });
}
if (nextBtn) {
    nextBtn.addEventListener("click", () => {
        clearInterval(autoScrollTiles);
        const next = (currentIndex + 1) % tabs.length;
        slideTo(next);
    });
}

const autoScrollTiles = setInterval(() => {
    const next = (currentIndex + 1) % tabs.length;
    slideTo(next);
}, 2500);

slideTo(0);

// ── Form Submission ───────────────────────────────────────────────────────────
async function submitForm(event) {
    event.preventDefault();

    const form = event.target;

    // reCAPTCHA validation
    const captchaResponse = grecaptcha.getResponse();
    if (!captchaResponse) {
        alert("Please complete the captcha verification.");
        return;
    }

    const data = {
        name: form.name.value,
        email: form.email.value,
        service: form.service.value,
        message: form.message.value,
    };

    try {
        const url = "https://script.google.com/macros/s/AKfycbyJfyADDi8ddpwccnRH4RsLcNLIuIRsUT9iCZ8TuMLxYr0KKlonfkMymLyvcN7tJQvQ/exec";
        const formBody = new URLSearchParams();
        formBody.append("name", data.name);
        formBody.append("email", data.email);
        formBody.append("service", data.service);
        formBody.append("message", data.message);

        const res = await fetch(url, {
            method: "POST",
            headers: { "Content-Type": "application/x-www-form-urlencoded" },
            body: formBody.toString(),
        });

        if (!res.ok) {
            const txt = await res.text().catch(() => "Unable to read response text");
            console.error("Network response was not ok", res.status, res.statusText, txt);
            const debugPre = document.getElementById("serverDebugPre");
            if (debugPre) {
                debugPre.textContent = `Network response not OK: ${res.status} ${res.statusText}\n\n${txt}`;
                document.getElementById("serverDebug").classList.remove("hidden");
            }
            alert("Error submitting the form (network).");
            return;
        }

        const result = await res.json().catch(async () => {
            const txt = await res.text().catch(() => "Unable to read response text");
            throw new Error("Invalid JSON response: " + txt);
        });

        if (result.status === "success") {
            const success = document.getElementById("formSuccess");
            if (success) {
                success.classList.remove("hidden");
                setTimeout(() => success.classList.add("hidden"), 5000);
            } else {
                alert("Consultation Request saved successfully");
            }

            if (result.emailSent === false) {
                alert("Submission saved, but email delivery failed — check script deployment or permissions.");
            }

            form.reset();
            grecaptcha.reset();
        } else {
            const errMsg = result && result.message ? result.message : "Error submitting the form.";
            alert(errMsg);
        }
    } catch (err) {
        console.error(err);
        const debugPre = document.getElementById("serverDebugPre");
        if (debugPre) {
            debugPre.textContent = err && err.message ? err.message : String(err);
            document.getElementById("serverDebug").classList.remove("hidden");
        }
        alert("Error submitting the form.");
    }
}
