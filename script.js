document.addEventListener('DOMContentLoaded', function() {
    // Variables globales
    let currentPage = 1;
    const limit = 12;
    let isLoading = false;
    let hasMore = true;

    // Éléments DOM
    const snippetsGrid = document.getElementById('snippets');
    const loadMoreBtn = document.getElementById('load-more');
    const searchInput = document.getElementById('search');
    const categorySelect = document.getElementById('category');
    const snippetForm = document.getElementById('snippet-form');

    // Charger les snippets
    function loadSnippets(reset = false) {
        if (isLoading || !hasMore) return;
        
        isLoading = true;
        
        // Afficher l'overlay de chargement uniquement lors du premier chargement
        const loadingOverlay = document.getElementById('loading-overlay');
        if (reset && loadingOverlay) {
            loadingOverlay.style.display = 'flex';
        }
        
        if (reset) {
            currentPage = 1;
            snippetsGrid.innerHTML = '';
        }
        
        const search = searchInput ? searchInput.value : '';
        const category = categorySelect ? categorySelect.value : '';
        
        fetch(`Backend/get.php?search=${encodeURIComponent(search)}&category=${encodeURIComponent(category)}&limit=${limit}&offset=${(currentPage - 1) * limit}`)
            .then(response => {
                if (!response.ok) {
                    throw new Error('Erreur réseau');
                }
                return response.json();
            })
            .then(data => {
                if (data.success) {                    
                    if (data.data.length > 0) {
                        renderSnippets(data.data);
                        currentPage++;
                        hasMore = data.data.length === limit;
                        
                        // Masquer l'état vide s'il était affiché
                        const emptyState = document.getElementById('empty-state');
                        if (emptyState) {
                            emptyState.style.display = 'none';
                        }
                    } else {
                        hasMore = false;
                        if (reset) {
                            const emptyState = document.getElementById('empty-state');
                            if (emptyState) {
                                emptyState.style.display = 'block';
                            }
                        }
                    }
                }
            })
            .catch(error => {
                console.error('Error:', error);
                if (reset) {
                    snippetsGrid.innerHTML = '<p class="error">Erreur de chargement</p>';
                }
            })
            .finally(() => {
                isLoading = false;
                
                // Masquer l'overlay de chargement
                if (loadingOverlay) {
                    loadingOverlay.style.display = 'none';
                }
                
                if (loadMoreBtn) {
                    loadMoreBtn.style.display = hasMore ? 'block' : 'none';
                }
                
                // Masquer le second bouton "Charger plus" s'il existe
                const loadMoreBottom = document.getElementById('load-more-bottom');
                if (loadMoreBottom) {
                    loadMoreBottom.style.display = hasMore ? 'block' : 'none';
                }
            });
    }

    // Afficher les snippets
    function renderSnippets(snippets) {
        snippets.forEach(snippet => {
            const snippetEl = document.createElement('div');
            snippetEl.className = 'snippet-card';
            snippetEl.innerHTML = `
    <div class="snippet-category">${snippet.category}</div>
    <h3 class="snippet-title">${snippet.title}</h3>
    <p class="snippet-description">${snippet.description}</p>
    <pre class="snippet-code"><code>${escapeHtml(snippet.code)}</code></pre>
    <div class="snippet-footer">
        <span class="snippet-date">${formatDate(snippet.created_at)}</span>
        <div class="snippet-actions">
            <button class="copy-btn" data-code="${encodeURIComponent(snippet.code)}">
                <i class="fas fa-copy"></i> Copier
            </button>
            <button class="delete-btn" data-id="${snippet.id}">
                <i class="fas fa-trash"></i> Supprimer
            </button>
        </div>
    </div>
`;

            snippetsGrid.appendChild(snippetEl);
        });
    }

    // Formater la date
    function formatDate(dateString) {
        const options = {
            year: 'numeric', month: 'short', day: 'numeric',
            hour: '2-digit', minute: '2-digit'
        };
        return new Date(dateString).toLocaleDateString('fr-FR', options);
    }

    // Échapper le HTML
    function escapeHtml(unsafe) {
        return unsafe
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;")
            .replace(/'/g, "&#039;");
    }

    // Gestion du formulaire
    if (snippetForm) {
        snippetForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            // Afficher l'overlay de chargement
            const loadingOverlay = document.getElementById('loading-overlay');
            if (loadingOverlay) {
                loadingOverlay.style.display = 'flex';
            }
            
            const formData = {
                title: document.getElementById('title').value,
                description: document.getElementById('description').value,
                category: document.getElementById('category').value,
                code: document.getElementById('code').value
            };
            
            // Réinitialiser les erreurs
            document.querySelectorAll('.error').forEach(el => el.textContent = '');
            
            fetch('Backend/add.php', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(formData)
            })
            .then(response => {
                if (!response.ok) {
                    return response.json().then(err => { throw err; });
                }
                return response.json();
            })
            .then(data => {
                if (data.success) {
                    showToast('Snippet ajouté avec succès!', 'success');
                    setTimeout(() => {
                        window.location.href = 'index.php';
                    }, 1500);
                }
            })
            .catch(error => {
                console.error('Error:', error);
                if (error.errors) {
                    for (const [field, message] of Object.entries(error.errors)) {
                        const errorEl = document.getElementById(`${field}-error`);
                        if (errorEl) errorEl.textContent = message;
                    }
                } else {
                    showToast('Erreur: ' + (error.message || 'Une erreur est survenue'), 'error');
                }
            })
            .finally(() => {
                // Masquer l'overlay de chargement
                if (loadingOverlay) {
                    loadingOverlay.style.display = 'none';
                }
            });
        });
    }

    // Gestion des clics (suppression et copie)
    document.addEventListener('click', function(e) {
        // Gestion de la suppression
        const deleteBtn = e.target.closest('.delete-btn');
        if (deleteBtn) {
            e.preventDefault();
            const snippetId = deleteBtn.dataset.id;
            
            if (confirm('Êtes-vous sûr de vouloir supprimer ce snippet ?')) {
                fetch(`Backend/delete.php?id=${snippetId}`, {
                    method: 'DELETE'
                })
                .then(response => {
                    if (!response.ok) {
                        throw new Error('Erreur réseau');
                    }
                    return response.json();
                })
                .then(data => {
                    if (data.success) {
                        loadSnippets(true);
                    } else {
                        alert('Erreur: ' + (data.message || 'Échec de la suppression'));
                    }
                })
                .catch(error => {
                    console.error('Error:', error);
                    alert('Erreur lors de la suppression');
                });
            }
        }

        // Gestion de la copie
        const copyBtn = e.target.closest('.copy-btn');
        if (copyBtn) {
            e.preventDefault();
            const code = decodeURIComponent(copyBtn.dataset.code);
            navigator.clipboard.writeText(code)
                .then(() => {
                    copyBtn.innerHTML = '<i class="fas fa-check"></i> Copié !';
                    setTimeout(() => {
                        copyBtn.innerHTML = '<i class="fas fa-copy"></i> Copier';
                    }, 1500);
                })
                .catch(() => {
                    alert('Erreur lors de la copie');
                });
        }
    });

    // Recherche et filtres
    if (searchInput && categorySelect) {
        let searchTimeout;
        
        function handleFilterChange() {
            clearTimeout(searchTimeout);
            searchTimeout = setTimeout(() => {
                hasMore = true;
                loadSnippets(true);
            }, 300);
        }
        
        searchInput.addEventListener('input', handleFilterChange);
        categorySelect.addEventListener('change', handleFilterChange);
    }

    // Bouton "Charger plus"
    if (loadMoreBtn) {
        loadMoreBtn.addEventListener('click', () => loadSnippets());
    }
    
    // Bouton "Charger plus" du bas
    const loadMoreBottom = document.getElementById('load-more-bottom');
    if (loadMoreBottom) {
        loadMoreBottom.addEventListener('click', () => loadSnippets());
    }

    // Gestion du thème
    const themeToggle = document.getElementById('theme-toggle');
    if (themeToggle) {
        const currentTheme = localStorage.getItem('theme') || 'light';
        
        document.documentElement.classList.toggle('dark-mode', currentTheme === 'dark');
        updateThemeIcon();
        
        themeToggle.addEventListener('click', () => {
            const isDark = document.documentElement.classList.toggle('dark-mode');
            localStorage.setItem('theme', isDark ? 'dark' : 'light');
            updateThemeIcon();
        });
        
        function updateThemeIcon() {
            const icon = themeToggle.querySelector('i');
            if (document.documentElement.classList.contains('dark-mode')) {
                icon.classList.remove('fa-moon');
                icon.classList.add('fa-sun');
            } else {
                icon.classList.remove('fa-sun');
                icon.classList.add('fa-moon');
            }
        }
    }

    // Chargement initial
    if (snippetsGrid) {
        // Masquer l'overlay de chargement au début si aucun chargement n'est en cours
        const loadingOverlay = document.getElementById('loading-overlay');
        if (loadingOverlay) {
            loadingOverlay.style.display = 'none';
        }
        
        loadSnippets(true);
    }

    // Fonctionnalités pour la page d'ajout de snippets
    initializeAddPageFeatures();
    
    // Fonction pour afficher les toasts
    function showToast(message, type = 'success') {
        const toastContainer = document.getElementById('toast-container');
        if (!toastContainer) return;
        
        const toast = document.createElement('div');
        toast.className = `toast ${type}`;
        
        const icon = type === 'success' ? 'fa-check' : 
                    type === 'error' ? 'fa-exclamation-triangle' : 
                    type === 'warning' ? 'fa-exclamation' : 'fa-info';
        
        toast.innerHTML = `
            <i class="fas ${icon}"></i>
            <span>${message}</span>
        `;
        
        toastContainer.appendChild(toast);
        
        // Animer l'apparition
        setTimeout(() => toast.classList.add('show'), 100);
        
        // Supprimer après 4 secondes
        setTimeout(() => {
            toast.classList.remove('show');
            setTimeout(() => toastContainer.removeChild(toast), 300);
        }, 4000);
    }
    
    // Fonctions spécifiques à la page d'ajout
    function initializeAddPageFeatures() {
        // Compteur de caractères pour la description
        const descriptionTextarea = document.getElementById('description');
        const descCounter = document.getElementById('desc-count');
        
        if (descriptionTextarea && descCounter) {
            descriptionTextarea.addEventListener('input', function() {
                const count = this.value.length;
                descCounter.textContent = count;
                
                // Changer la couleur si proche de la limite
                if (count > 450) {
                    descCounter.style.color = 'var(--error)';
                } else if (count > 400) {
                    descCounter.style.color = 'var(--warning)';
                } else {
                    descCounter.style.color = 'var(--text-muted)';
                }
            });
        }
        
        // Gestionnaire pour l'éditeur de code
        const codeTextarea = document.getElementById('code');
        const lineNumbers = document.getElementById('line-numbers');
        const linesCount = document.getElementById('lines-count');
        const charsCount = document.getElementById('chars-count');
        
        if (codeTextarea) {
            function updateCodeStats() {
                const lines = codeTextarea.value.split('\n');
                const lineCount = lines.length;
                const charCount = codeTextarea.value.length;
                
                // Mettre à jour les numéros de ligne
                if (lineNumbers) {
                    const numbers = Array.from({length: lineCount}, (_, i) => i + 1).join('\n');
                    lineNumbers.textContent = numbers;
                }
                
                // Mettre à jour les statistiques
                if (linesCount) {
                    linesCount.textContent = `${lineCount} ligne${lineCount > 1 ? 's' : ''}`;
                }
                if (charsCount) {
                    charsCount.textContent = `${charCount} caractère${charCount > 1 ? 's' : ''}`;
                }
            }
            
            codeTextarea.addEventListener('input', updateCodeStats);
            codeTextarea.addEventListener('scroll', function() {
                if (lineNumbers) {
                    lineNumbers.scrollTop = this.scrollTop;
                }
            });
            
            updateCodeStats();
        }
        
        // Bouton formater le code
        const formatBtn = document.getElementById('format-code');
        if (formatBtn && codeTextarea) {
            formatBtn.addEventListener('click', function() {
                // Simple formatage (ajout d'indentation basique)
                const code = codeTextarea.value;
                const formatted = code
                    .split('\n')
                    .map(line => line.trim())
                    .join('\n')
                    .replace(/\{/g, '{\n  ')
                    .replace(/\}/g, '\n}')
                    .replace(/;/g, ';\n')
                    .split('\n')
                    .map(line => line.trim())
                    .filter(line => line.length > 0)
                    .map((line, index, arr) => {
                        let indent = 0;
                        for (let i = 0; i < index; i++) {
                            if (arr[i].includes('{')) indent += 2;
                            if (arr[i].includes('}')) indent -= 2;
                        }
                        return ' '.repeat(Math.max(0, indent)) + line;
                    })
                    .join('\n');
                
                codeTextarea.value = formatted;
                updateCodeStats();
                showToast('Code formaté!', 'info');
            });
        }
        
        // Bouton effacer le code
        const clearBtn = document.getElementById('clear-code');
        if (clearBtn && codeTextarea) {
            clearBtn.addEventListener('click', function() {
                if (codeTextarea.value.trim() && confirm('Êtes-vous sûr de vouloir effacer tout le code ?')) {
                    codeTextarea.value = '';
                    updateCodeStats();
                    showToast('Code effacé', 'warning');
                }
            });
        }
        
        // Bouton aperçu
        const previewBtn = document.getElementById('preview-btn');
        const previewModal = document.getElementById('preview-modal');
        const closePreview = document.getElementById('close-preview');
        const snippetPreview = document.getElementById('snippet-preview');
        
        if (previewBtn && previewModal) {
            previewBtn.addEventListener('click', function() {
                const title = document.getElementById('title').value;
                const description = document.getElementById('description').value;
                const category = document.getElementById('category').value;
                const code = document.getElementById('code').value;
                
                if (!title || !description || !category || !code) {
                    showToast('Veuillez remplir tous les champs obligatoires', 'warning');
                    return;
                }
                
                // Générer l'aperçu
                if (snippetPreview) {
                    snippetPreview.innerHTML = `
                        <div class="snippet-card">
                            <div class="snippet-header">
                                <div class="snippet-category">${category}</div>
                                <h3 class="snippet-title">${escapeHtml(title)}</h3>
                                <p class="snippet-description">${escapeHtml(description)}</p>
                            </div>
                            <div class="snippet-content">
                                <pre class="snippet-code"><code>${escapeHtml(code)}</code></pre>
                            </div>
                            <div class="snippet-footer">
                                <span class="snippet-date">Maintenant</span>
                                <div class="snippet-actions">
                                    <button class="copy-btn" disabled>
                                        <i class="fas fa-copy"></i> Copier
                                    </button>
                                </div>
                            </div>
                        </div>
                    `;
                }
                
                previewModal.style.display = 'flex';
                document.body.style.overflow = 'hidden';
            });
        }
        
        if (closePreview && previewModal) {
            closePreview.addEventListener('click', function() {
                previewModal.style.display = 'none';
                document.body.style.overflow = 'auto';
            });
        }
        
        // Fermer la modale en cliquant sur l'overlay
        if (previewModal) {
            previewModal.addEventListener('click', function(e) {
                if (e.target === previewModal) {
                    previewModal.style.display = 'none';
                    document.body.style.overflow = 'auto';
                }
            });
        }
        
        // Gestion améliorée du bouton retour
        const backBtn = document.querySelector('.back-btn');
        if (backBtn) {
            backBtn.addEventListener('click', function(e) {
                e.preventDefault();
                
                // Vérifier s'il y a des données non sauvegardées
                const title = document.getElementById('title')?.value.trim();
                const description = document.getElementById('description')?.value.trim();
                const code = document.getElementById('code')?.value.trim();
                
                const hasUnsavedData = title || description || code;
                
                if (hasUnsavedData) {
                    const shouldLeave = confirm('Vous avez des modifications non sauvegardées. Êtes-vous sûr de vouloir quitter ?');
                    if (!shouldLeave) {
                        return;
                    }
                }
                
                // Animation de sortie avant redirection
                backBtn.style.transform = 'scale(0.95)';
                showToast('Retour à l\'accueil...', 'info');
                
                setTimeout(() => {
                    window.location.href = 'index.php';
                }, 500);
            });
        }
        
        // Raccourcis clavier
        document.addEventListener('keydown', function(e) {
            // Ctrl+S pour sauvegarder
            if ((e.ctrlKey || e.metaKey) && e.key === 's') {
                e.preventDefault();
                const submitBtn = document.querySelector('.submit-btn');
                if (submitBtn) {
                    submitBtn.click();
                }
            }
            
            // Escape pour fermer la modale d'aperçu
            if (e.key === 'Escape' && previewModal && previewModal.style.display === 'flex') {
                previewModal.style.display = 'none';
                document.body.style.overflow = 'auto';
            }
        });
        
        // Auto-sauvegarde locale (optionnel)
        const autoSaveKey = 'h24code_draft_snippet';
        
        function saveToLocalStorage() {
            const draft = {
                title: document.getElementById('title')?.value || '',
                description: document.getElementById('description')?.value || '',
                category: document.getElementById('category')?.value || '',
                code: document.getElementById('code')?.value || '',
                timestamp: Date.now()
            };
            
            try {
                localStorage.setItem(autoSaveKey, JSON.stringify(draft));
            } catch (e) {
                console.warn('Impossible de sauvegarder le brouillon:', e);
            }
        }
        
        function loadFromLocalStorage() {
            try {
                const saved = localStorage.getItem(autoSaveKey);
                if (saved) {
                    const draft = JSON.parse(saved);
                    const age = Date.now() - draft.timestamp;
                    
                    // Proposer de restaurer si moins de 24h
                    if (age < 24 * 60 * 60 * 1000) {
                        const shouldRestore = confirm('Un brouillon récent a été trouvé. Voulez-vous le restaurer ?');
                        if (shouldRestore) {
                            document.getElementById('title').value = draft.title || '';
                            document.getElementById('description').value = draft.description || '';
                            document.getElementById('category').value = draft.category || '';
                            document.getElementById('code').value = draft.code || '';
                            
                            // Mettre à jour les compteurs
                            if (descCounter) descCounter.textContent = draft.description.length;
                            updateCodeStats();
                            
                            showToast('Brouillon restauré!', 'success');
                        }
                    }
                }
            } catch (e) {
                console.warn('Impossible de charger le brouillon:', e);
            }
        }
        
        // Sauvegarder automatiquement toutes les 30 secondes
        const formInputs = ['title', 'description', 'category', 'code'];
        formInputs.forEach(id => {
            const element = document.getElementById(id);
            if (element) {
                element.addEventListener('input', debounce(saveToLocalStorage, 2000));
            }
        });
        
        // Charger le brouillon au démarrage
        loadFromLocalStorage();
        
        // Nettoyer le brouillon lors de la soumission réussie
        if (snippetForm) {
            snippetForm.addEventListener('submit', function() {
                localStorage.removeItem(autoSaveKey);
            });
        }
    }
    
    // Fonction utilitaire pour debounce
    function debounce(func, wait) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    }
});