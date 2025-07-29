<!DOCTYPE html>
<html lang="fr">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>H24Code - Gestionnaire de Snippets</title>
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css">
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&display=swap" rel="stylesheet">
    <link rel="stylesheet" href="style.css">
</head>
<body>
    <div class="background-animation">
        <div class="floating-shapes">
            <div class="shape shape-1"></div>
            <div class="shape shape-2"></div>
            <div class="shape shape-3"></div>
            <div class="shape shape-4"></div>
            <div class="shape shape-5"></div>
        </div>
    </div>

    <div class="container">
        <header class="header">
            <div class="header-content">
                <div class="logo">
                    <i class="fas fa-code"></i>
                    <span>H24Code</span>
                    <div class="logo-pulse"></div>
                </div>
                <div class="tagline">
                    <i class="fas fa-sparkles"></i>
                    Gestionnaire de snippets de code nouvelle génération
                </div>
            </div>
            <div class="header-actions">
                <button id="load-more" class="btn load-more-btn">
                    <i class="fas fa-chevron-down"></i>
                    <span>Charger plus</span>
                    <div class="btn-glow"></div>
                </button>
                <a href="add.html" class="btn add-btn">
                    <i class="fas fa-plus"></i>
                    <span>Ajouter</span>
                    <div class="btn-glow"></div>
                </a>
                <button class="theme-toggle" id="theme-toggle">
                    <i class="fas fa-moon"></i>
                    <div class="toggle-indicator"></div>
                </button>
            </div>
        </header>

        <div class="search-section">
            <div class="search-container">
                <div class="search-box">
                    <i class="fas fa-search search-icon"></i>
                    <input type="text" id="search" placeholder="Rechercher dans vos snippets...">
                    <div class="search-suggestions" id="search-suggestions"></div>
                </div>
                <div class="category-filter">
                    <select id="category">
                        <option value="">🌟 Toutes catégories</option>
                        <option value="PHP">🐘 PHP</option>
                        <option value="HTML">🌐 HTML</option>
                        <option value="CSS">🎨 CSS</option>
                        <option value="JavaScript">⚡ JavaScript</option>
                        <option value="Python">🐍 Python</option>
                        <option value="SQL">🗄️ SQL</option>
                        <option value="React">⚛️ React</option>
                        <option value="Vue">💚 Vue.js</option>
                        <option value="Node.js">🟢 Node.js</option>
                    </select>
                    <i class="fas fa-chevron-down select-arrow"></i>
                </div>
            </div>
            
            <div class="search-stats">
                <span id="results-count">0 snippets trouvés</span>
                <div class="filter-tags" id="filter-tags"></div>
            </div>
        </div>

        <div class="snippets-section">
            <div class="section-header">
                <h2>
                    <i class="fas fa-code-branch"></i>
                    Vos Snippets
                </h2>
                <div class="view-options">
                    <button class="view-btn active" data-view="grid">
                        <i class="fas fa-th"></i>
                    </button>
                    <button class="view-btn" data-view="list">
                        <i class="fas fa-list"></i>
                    </button>
                </div>
            </div>

            <div id="snippets" class="snippets-grid"></div>

            <div class="empty-state" id="empty-state" style="display: none;">
                <div class="empty-icon">
                    <i class="fas fa-code"></i>
                </div>
                <h3>Aucun snippet trouvé</h3>
                <p>Commencez par créer votre premier snippet de code</p>
                <a href="add.php" class="btn add-btn">
                    <i class="fas fa-plus"></i>
                    Créer un snippet
                </a>
            </div>
        </div>

        <div class="load-more-container">
            <button id="load-more-bottom" class="btn load-more-btn" style="display: none;">
                <i class="fas fa-chevron-down"></i>
                <span>Charger plus de snippets</span>
                <div class="btn-glow"></div>
            </button>
        </div>
    </div>

    <!-- Notification Toast -->
    <div class="toast-container" id="toast-container"></div>

    <!-- Loading Overlay -->
    <div class="loading-overlay" id="loading-overlay">
        <div class="loading-spinner">
            <div class="spinner-ring"></div>
            <div class="spinner-ring"></div>
            <div class="spinner-ring"></div>
        </div>
        <p>Chargement des snippets...</p>
    </div>

    <script src="script.js"></script>
</body>
</html>