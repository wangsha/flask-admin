(function () {
    'use strict';

    var root = document.documentElement;
    var preference = window.matchMedia('(prefers-color-scheme: dark)');
    var storageKey = 'flask-admin-graphite-theme';
    var selectedTheme = null;
    try {
        var saved = window.localStorage.getItem(storageKey);
        if (saved === 'light' || saved === 'dark') selectedTheme = saved;
    } catch (error) {
        // Browser storage may be unavailable; switching still works locally.
    }
    root.setAttribute('data-theme', selectedTheme || (preference.matches ? 'dark' : 'light'));

    document.addEventListener('DOMContentLoaded', function () {
        var $ = window.jQuery;
        if ($ && $.fn.select2) {
            $('.admin-form select:not([multiple]):not([data-role])').each(function () {
                var select = $(this);
                if (!select.data('select2')) {
                    select.select2({
                        width: '100%',
                        minimumResultsForSearch: 10,
                        dropdownCssClass: 'graphite-form-dropdown'
                    });
                }
            });
        }

        var button = document.querySelector('[data-theme-toggle]');
        if (!button) return;

        function update() {
            var light = root.getAttribute('data-theme') === 'light';
            button.textContent = light ? 'Dark mode' : 'Light mode';
            button.setAttribute('aria-label', 'Switch to ' + (light ? 'dark' : 'light') + ' theme');
            button.setAttribute('aria-pressed', String(light));
        }

        button.hidden = false;
        update();
        preference.addEventListener('change', function (event) {
            if (selectedTheme) return;
            root.setAttribute('data-theme', event.matches ? 'dark' : 'light');
            update();
        });
        button.addEventListener('click', function () {
            var theme = root.getAttribute('data-theme') === 'light' ? 'dark' : 'light';
            selectedTheme = theme;
            root.setAttribute('data-theme', theme);
            try {
                window.localStorage.setItem(storageKey, theme);
            } catch (error) {
                // Preserve the user's choice on this page without storage.
            }
            update();
        });
    });
}());

(() => {
    let toast;
    let dismissTimer;

    function showToast(message) {
        if (!toast) {
            toast = document.createElement('div');
            toast.className = 'cell-copy-toast';
            toast.setAttribute('role', 'status');
            toast.setAttribute('aria-live', 'polite');
            document.body.appendChild(toast);
        }
        clearTimeout(dismissTimer);
        toast.textContent = message;
        toast.classList.add('is-visible');
        dismissTimer = setTimeout(() => {
            toast.classList.remove('is-visible');
            toast.textContent = '';
        }, 1600);
    }

    document.addEventListener('dblclick', async (event) => {
        const cell = event.target.closest('.model-list tbody td[class*="col-"]');
        if (!cell || event.target.closest('a, button, input, select, textarea, [contenteditable="true"]')) return;
        const value = cell.innerText.trim();
        if (!value) return;
        try {
            await navigator.clipboard.writeText(value);
            window.getSelection()?.removeAllRanges();
            showToast('Value copied');
        } catch {
            showToast('Could not copy value');
        }
    });
})();
