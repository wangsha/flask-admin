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
