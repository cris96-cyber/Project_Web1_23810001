const $ = (selector, scope = document) => scope.querySelector(selector);
const $$ = (selector, scope = document) => [...scope.querySelectorAll(selector)];

function renderShell() {
  const navLinks = [
    ["index.html", "Home"],
    ["about.html", "About"],
    ["gallery.html", "Gallery"],
    ["blogs.html", "Blogs"],
    ["contact.html", "Contact"],
  ];

  const auth = currentUser();
  const current = location.pathname.split("/").pop() || "index.html";

  const nav = navLinks
    .map(([href, label]) => {
      const activeClass = current === href ? "active" : "";
      return `<a href="${href}" class="${activeClass}">${label}</a>`;
    })
    .join("");

  const authLinks = auth ? renderAuthButtons() : renderGuestLinks(current);

  renderHeader(nav, authLinks);
  renderFooter(navLinks);
  renderGlobalLayers();
  bindCommonEvents();
}

function renderAuthButtons() {
  return [
    '<button class="link-btn" data-profile>Profile</button>',
    '<button class="link-btn" data-logout>Logout</button>',
  ].join("");
}

function renderGuestLinks(current) {
  const registerClass = current === "register.html" ? "active" : "";
  const loginClass = current === "login.html" ? "active" : "";

  return [
    `<a href="register.html" class="${registerClass}">Register</a>`,
    `<a href="login.html" class="${loginClass}">Login</a>`,
  ].join("");
}

function renderHeader(nav, authLinks) {
  const header = document.createElement("header");
  header.className = "site-header";

  header.innerHTML = `
    <div class="container nav-wrap">
      <a href="index.html" class="brand">
        <img src="${asset("images/logo.png")}" alt="Logo">
      </a>

      <button class="menu-btn" data-menu aria-label="Open main menu">☰</button>

      <nav class="main-nav" data-nav>
        ${nav}
        <span class="auth-links">${authLinks}</span>
      </nav>

      <button class="search-btn" data-search-open>Search</button>
    </div>
  `;

  document.body.prepend(header);
}

function renderFooter(navLinks) {
  const footer = document.createElement("footer");
  footer.className = "site-footer";

  const navItems = navLinks
    .map(([href, label]) => {
      return `<a href="${href}">${label}</a>`;
    })
    .join("");

  footer.innerHTML = `
    <div class="container footer-inner">
      <div class="footer-brand">
        <h4>Web1 Project</h4>
        <p>Web Development for everyone.</p>
      </div>

      <div class="footer-nav-col">
        <h4>Navigation</h4>

        <div class="footer-nav-links">
          ${navItems}
        </div>
      </div>
    </div>

    <div class="footer-bottom">
      Copyright © 2026 by 23810001 - Nguyễn Ngọc Thế Cường
    </div>
  `;

  document.body.append(footer);
}

function renderGlobalLayers() {
  document.body.insertAdjacentHTML(
    "beforeend",
    `
    <div class="modal" id="profileModal">
      <div class="modal-card small">
        <button class="modal-close" data-modal-close>×</button>
        <h3>Update Your Profile</h3>

        <label>
          Your email
          <input id="profileEmail" type="email">
        </label>

        <label>
          Your name
          <input id="profileName" type="text">
        </label>

        <div class="actions">
          <button class="btn" data-profile-save>Update</button>
          <button class="btn outline" data-modal-close>Cancel</button>
        </div>
      </div>
    </div>

    <div class="search-overlay" id="searchOverlay">
      <div class="search-box">
        <button class="modal-close" data-search-close>×</button>
        <h3>Search</h3>
        <input id="globalSearch" placeholder="Keyword" autocomplete="off">
        <div class="search-results" id="searchResults"></div>
      </div>
    </div>

    <div id="toast" class="toast"></div>
    `,
  );
}

function bindCommonEvents() {
  $(`[data-menu]`)?.addEventListener("click", () => {
    $(`[data-nav]`).classList.toggle("open");
  });

  $(`[data-search-open]`)?.addEventListener("click", () => {
    $("#searchOverlay").classList.add("show");
  });

  $(`[data-search-close]`)?.addEventListener("click", () => {
    $("#searchOverlay").classList.remove("show");
  });

  $$(`[data-modal-close]`).forEach((btn) => {
    btn.addEventListener("click", () => {
      $$(".modal").forEach((modal) => modal.classList.remove("show"));
    });
  });

  $(`[data-profile]`)?.addEventListener("click", openProfile);
  $(`[data-logout]`)?.addEventListener("click", logout);
  $(`[data-profile-save]`)?.addEventListener("click", saveProfile);
  $("#globalSearch")?.addEventListener("input", renderSearch);
}

function showToast(message, type = "success") {
  const toast = $("#toast");
  toast.textContent = message;
  toast.className = `toast show ${type}`;

  setTimeout(() => {
    toast.className = "toast";
  }, 2200);
}

function currentUser() {
  return JSON.parse(localStorage.getItem("web1CurrentUser") || "null");
}

function users() {
  return JSON.parse(localStorage.getItem("web1Users") || "[]");
}

function saveUsers(list) {
  localStorage.setItem("web1Users", JSON.stringify(list));
}

function logout() {
  localStorage.removeItem("web1CurrentUser");
  showToast("You have logged out successfully.");

  setTimeout(() => {
    location.href = "index.html";
  }, 650);
}

function openProfile() {
  const user = currentUser();

  if (!user) {
    location.href = "login.html";
    return;
  }

  $("#profileEmail").value = user.email || "";
  $("#profileName").value = user.name || "";
  $("#profileModal").classList.add("show");
}

function saveProfile() {
  const user = currentUser();

  if (!user) return;

  const email = $("#profileEmail").value.trim();
  const name = $("#profileName").value.trim();

  if (!email || !name) {
    return showToast("Please enter full profile information.", "warning");
  }

  const updatedUser = { ...user, email, name };
  const updatedUsers = users().map((item) => {
    return item.email === user.email ? updatedUser : item;
  });

  localStorage.setItem("web1CurrentUser", JSON.stringify(updatedUser));
  saveUsers(updatedUsers);
  $("#profileModal").classList.remove("show");
  showToast("Profile updated successfully.");
}

function renderSearch() {
  const keyword = $("#globalSearch").value.toLowerCase().trim();
  const resultBox = $("#searchResults");

  if (!keyword) {
    resultBox.innerHTML = `
      <p class="muted">Type a keyword to search products, gallery and blogs.</p>
    `;
    return;
  }

  const results = information
    .filter((item) => {
      return [
        item.title,
        item.summary,
        stripHtml(item.description),
        categoryName(item.categoryId),
      ]
        .join(" ")
        .toLowerCase()
        .includes(keyword);
    })
    .slice(0, 10);

  resultBox.innerHTML = results.length
    ? results.map((item) => renderSearchItem(item)).join("")
    : '<p class="muted">No result found.</p>';
}

function renderSearchItem(item) {
  return `
    <a class="search-item" href="detail.html?id=${item.id}">
      <strong>${item.title}</strong>
      <span>${categoryName(item.categoryId)}</span>
      <p>${item.summary || item.description.slice(0, 100)}</p>
    </a>
  `;
}

function card(item, mode = "detail") {
  const href = getDetailLink(item, mode);
  const image = asset(item.thumb || item.image);
  const summary = item.summary || item.description.slice(0, 120);

  return `
    <article class="card" data-category="${item.categoryId}">
      <a href="${href}" class="card-img">
        <img src="${image}" alt="${item.title}">
      </a>

      <div class="card-body">
        <span class="tag">${categoryName(item.categoryId)}</span>
        <h3>${item.title}</h3>
        <p>${summary}</p>
        <a class="read-more" href="${href}">Read more...</a>
      </div>
    </article>
  `;
}

function getDetailLink(item, mode) {
  if (mode === "blog") return `blog-detail.html?id=${item.id}`;
  if (mode === "gallery") return `gallery-detail.html?id=${item.id}`;

  return `detail.html?id=${item.id}`;
}

function renderHome() {
  initHeroSlider();

  $("#products").innerHTML = information
    .filter((item) => item.categoryId === 1)
    .map((item) => card(item))
    .join("");

  $("#aboutPreview").innerHTML = card(byId(8));

  $("#news").innerHTML = information
    .filter((item) => item.categoryId === 3)
    .map((item) => card(item, "blog"))
    .join("");

  bindNewsletter();
}

function initHeroSlider() {
  const courseParts = SITE.semester.split(" - ");
  const program = courseParts[0] || "DTTX";
  const semester = courseParts[1] || "Học kỳ 2";
  const schoolYear = courseParts[2] || "Năm học 2025-2026";

  const slides = [
    {
      kicker: "Slide 01",
      title: "Web Development <span>for everyone</span>",
      desc: "",
      primary: ["about.html", "See more"],
    },
    {
      kicker: "Slide 02",
      title: [
        `<span class="hero-student-id">MSSV: ${SITE.studentId}</span>`,
        `<span class="hero-student-name">${SITE.studentName}</span>`,
      ].join(""),
      desc: "",
      primary: ["gallery.html", "See more"],
    },
    {
      kicker: "Slide 03",
      title: [
        `<span class="hero-course-line">${program}</span>`,
        `<span class="hero-course-line">${semester}</span>`,
        `<span class="hero-course-line">${schoolYear}</span>`,
      ].join(""),
      desc: "",
      primary: ["blogs.html", "See more"],
    },
  ];

  const slider = $("#heroSlider");
  const dotsBox = $("#heroDots");
  const prevBtn = $("#heroPrev");
  const nextBtn = $("#heroNext");

  if (!slider || !dotsBox) return;

  let index = 0;
  let timer = null;
  let direction = "next";

  dotsBox.innerHTML = slides.map(renderHeroDot).join("");

  function applySlide(next) {
    direction = next < index ? "back" : "next";
    index = (next + slides.length) % slides.length;

    const slide = slides[index];
    const description = $("#heroDesc");

    slider.classList.toggle("back", direction === "back");
    slider.classList.add("is-changing");

    setTimeout(() => {
      $("#heroKicker").textContent = slide.kicker;
      $("#heroTitle").innerHTML = slide.title;
      $("#heroPrimary").href = slide.primary[0];
      $("#heroPrimary").textContent = slide.primary[1];

      description.innerHTML = slide.desc;
      description.style.display = slide.desc ? "" : "none";

      $$(".hero-dot", dotsBox).forEach((dot, dotIndex) => {
        dot.classList.toggle("active", dotIndex === index);
      });

      slider.classList.remove("is-changing");
      slider.classList.remove("back");
    }, 240);
  }

  function startAutoPlay() {
    clearInterval(timer);
    timer = setInterval(() => applySlide(index + 1), 4200);
  }

  prevBtn?.addEventListener("click", () => {
    applySlide(index - 1);
    startAutoPlay();
  });

  nextBtn?.addEventListener("click", () => {
    applySlide(index + 1);
    startAutoPlay();
  });

  $$(".hero-dot", dotsBox).forEach((dot) => {
    dot.addEventListener("click", () => {
      applySlide(Number(dot.dataset.heroDot));
      startAutoPlay();
    });
  });

  applySlide(0);
  startAutoPlay();
}

function renderHeroDot(_, index) {
  const activeClass = index === 0 ? "active" : "";
  const label = `Show hero slide ${index + 1}`;

  return `
    <button
      class="hero-dot ${activeClass}"
      data-hero-dot="${index}"
      aria-label="${label}">
    </button>
  `;
}

function bindNewsletter() {
  $("#newsletterForm")?.addEventListener("submit", (event) => {
    event.preventDefault();

    const email = $("#newsletterEmail").value.trim();

    if (!/^\S+@\S+\.\S+$/.test(email)) {
      return showToast("Please, write a valid e-mail.", "warning");
    }

    const subscribers = JSON.parse(localStorage.getItem("web1Subscribers") || "[]");

    if (!subscribers.includes(email)) {
      subscribers.push(email);
    }

    localStorage.setItem("web1Subscribers", JSON.stringify(subscribers));
    event.target.reset();
    showToast("Subscribed successfully.");
  });
}

function renderAbout() {
  $("#aboutMain").innerHTML = card(byId(8));

  $("#visions").innerHTML = information
    .filter((item) => item.categoryId === 4)
    .map((item) => card(item))
    .join("");

  $("#team").innerHTML = information
    .filter((item) => item.categoryId === 5)
    .map((item) => card(item))
    .join("");

  $("#testimonials").innerHTML = testimonials.map(renderTestimonial).join("");
}

function renderTestimonial(item) {
  return `
    <article class="testimonial">
      <img src="${asset(item.avatar)}" alt="${item.name}">
      <p>“${stripHtml(item.quote).slice(0, 260)}”</p>
      <strong>${item.name}</strong>
      <span>${item.role}</span>
    </article>
  `;
}

function renderGallery() {
  const categories = getCategoriesByType("gallery");
  const items = itemsByType("gallery");

  $("#galleryFilters").innerHTML = renderFilterButtons(categories, "All");
  $("#galleryGrid").innerHTML = items.map((item) => card(item, "gallery")).join("");

  bindCategoryFilter("#galleryGrid");
}

function renderBlogs() {
  const categories = getCategoriesByType("blogs");
  const items = itemsByType("blogs");

  $("#blogCategories").innerHTML = renderFilterButtons(categories, "All categories");
  $("#blogGrid").innerHTML = items.map((item) => card(item, "blog")).join("");

  bindCategoryFilter("#blogGrid");
}

function getCategoriesByType(type) {
  return categories
    .filter((category) => category.type === type)
    .sort((a, b) => a.order - b.order);
}

function renderFilterButtons(categories, allLabel) {
  const allButton = `
    <button class="filter active" data-filter="all">${allLabel}</button>
  `;

  const categoryButtons = categories
    .map((category) => {
      return `
        <button class="filter" data-filter="${category.id}">
          ${category.name}
        </button>
      `;
    })
    .join("");

  return allButton + categoryButtons;
}

function bindCategoryFilter(gridSelector) {
  $$(".filter").forEach((button) => {
    button.addEventListener("click", () => {
      const categoryId = button.dataset.filter;
      const grid = $(gridSelector);

      $$(".filter").forEach((item) => item.classList.remove("active"));
      button.classList.add("active");

      $$(".card", grid).forEach((cardItem) => {
        const isMatched =
          categoryId === "all" || cardItem.dataset.category === categoryId;
        cardItem.style.display = isMatched ? "" : "none";
      });
    });
  });
}

function renderDetail() {
  const params = new URLSearchParams(location.search);
  const item = byId(params.get("id")) || information[0];

  $("#detail").innerHTML = `
    <div class="detail-hero">
      <img src="${asset(item.image || item.thumb)}" alt="${item.title}">
    </div>

    <div class="detail-content">
      <span class="tag">${categoryName(item.categoryId)}</span>
      <h1>${item.title}</h1>
      <p class="lead">${item.summary || ""}</p>
      <div class="article-body">${item.description}</div>

      <div class="actions">
        <button class="btn" onclick="history.back()">Back</button>
        <button class="btn outline" onclick="showToast('Saved successfully.')">
          Save item
        </button>
      </div>

      ${renderComments(item)}
    </div>
  `;
}

function renderComments(item) {
  if (categoryType(item.categoryId) !== "blogs") return "";

  const blogComments = commentsByBlog(item.id);
  const commentsHtml = blogComments.length
    ? blogComments.map(renderComment).join("")
    : '<p class="muted">No comments yet.</p>';

  return `
    <section class="comments-box">
      <h2>Comments</h2>
      ${commentsHtml}
    </section>
  `;
}

function renderComment(comment) {
  const createdDate = new Date(comment.createdAt).toLocaleDateString();

  return `
    <article class="comment-item">
      <strong>${authorName(comment.authorId)}</strong>
      <time>${createdDate}</time>
      <p>${comment.message}</p>
    </article>
  `;
}

function renderContact() {
  $("#address").innerHTML = SITE.address.map((item) => `<p>${item}</p>`).join("");
  $("#phones").innerHTML = SITE.phones.map((item) => `<p>${item}</p>`).join("");
  $("#email").textContent = SITE.email;

  $("#contactForm").addEventListener("submit", (event) => {
    event.preventDefault();

    const data = Object.fromEntries(new FormData(event.target));

    if (!data.name || !data.email || !data.subject || !data.message) {
      return showToast("All fields with an * are required.", "warning");
    }

    if (!/^\S+@\S+\.\S+$/.test(data.email)) {
      return showToast("Please enter a valid email.", "warning");
    }

    const messages = JSON.parse(localStorage.getItem("web1Messages") || "[]");
    messages.push({ ...data, createdAt: new Date().toISOString() });

    localStorage.setItem("web1Messages", JSON.stringify(messages));
    event.target.reset();
    showToast("Message sent successfully.");
  });
}

function bindRegister() {
    const registerForm = document.getElementById("registerForm");

    if (!registerForm) {
        return;
    }

    registerForm.addEventListener("submit", (event) => {
        event.preventDefault();

        const email = document.getElementById("registerEmail").value.trim();
        const name = document.getElementById("registerName").value.trim();
        const password = document.getElementById("registerPassword").value.trim();

        const confirmPassword = document
            .getElementById("registerConfirmPassword")
            .value
            .trim();

        const acceptTerms = document.getElementById("acceptTerms").checked;

        const errorMessage = validateRegisterForm({
            email,
            name,
            password,
            confirmPassword,
            acceptTerms,
        });

        if (errorMessage) {
            return showToast(errorMessage, "warning");
        }

        const userList = users();

        const existedUser = userList.some((user) => {
            return user.email.toLowerCase() === email.toLowerCase();
        });

        if (existedUser) {
            return showToast("This email already exists.", "warning");
        }

        const newUser = {
            id: Date.now(),
            email,
            name,
            password,
            createdAt: new Date().toISOString(),
        };

        userList.push(newUser);
        saveUsers(userList);

        localStorage.setItem(
            "web1CurrentUser",
            JSON.stringify(newUser),
        );

        showToast("Account created successfully.");

        setTimeout(() => {
            location.href = "index.html";
        }, 900);
    });
}

function validateRegisterForm(data) {
    if (!data.email || !data.name || !data.password || !data.confirmPassword) {
        return "Please fill all required fields.";
    }

    if (!/^\S+@\S+\.\S+$/.test(data.email)) {
        return "Please enter a valid email.";
    }

    if (data.password.length < 6) {
        return "Password must contain at least 6 characters.";
    }

    if (data.password !== data.confirmPassword) {
        return "Password and confirm password do not match.";
    }

    if (!data.acceptTerms) {
        return "Please accept the Terms and Conditions.";
    }

    return "";
}

function bindLogin() {
    const loginForm = document.getElementById("loginForm");

    if (!loginForm) {
        return;
    }

    loginForm.addEventListener("submit", (event) => {
        event.preventDefault();

        const email = document.getElementById("loginEmail").value.trim();
        const password = document.getElementById("loginPassword").value.trim();

        const remember = document.getElementById("rememberMe")?.checked || false;

        if (!email || !password) {
            return showToast("Please enter your email and password.", "warning");
        }

        const matchedUser = users().find((user) => {
            return (
                user.email.toLowerCase() === email.toLowerCase() &&
                user.password === password
            );
        });

        if (!matchedUser) {
            return showToast("Invalid email or password.", "warning");
        }

        const currentLoginUser = {
            ...matchedUser,
            remember,
            loggedAt: new Date().toISOString(),
        };

        localStorage.setItem(
            "web1CurrentUser",
            JSON.stringify(currentLoginUser),
        );

        showToast("Login successful. Redirecting...");

        setTimeout(() => {
            location.href = "index.html";
        }, 900);
    });
}

document.addEventListener("DOMContentLoaded", () => {
    renderShell();

    bindRegister();
    bindLogin();
});
