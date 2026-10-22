(function () {
    'use strict';
    if (window.faDetailsCopyReady) return;
    window.faDetailsCopyReady = true;

    function fallbackCopy(text) {
        var input = document.createElement('textarea');
        input.value = text;
        input.setAttribute('readonly', '');
        input.style.cssText = 'position:fixed;left:-9999px;top:0;';
        // Keep focus inside a modal when its focus trap is active.
        var host = document.querySelector('.modal.show .modal-content') || document.body;
        var previous = document.activeElement;
        host.appendChild(input);
        try {
            input.select();
            if (!document.execCommand('copy')) throw new Error('Copy unavailable');
        } finally {
            input.remove();
            if (previous) previous.focus();
        }
    }

    document.addEventListener('click', async function (event) {
        var button = event.target.closest('[data-detail-copy]');
        if (!button || button.disabled) return;
        var value = button.closest('td').querySelector('.detail-value');
        var text = value.innerText;
        var label = button.querySelector('span');
        var original = label.textContent;
        button.disabled = true;
        try {
            try {
                await navigator.clipboard.writeText(text);
            } catch (error) {
                fallbackCopy(text);
            }
            label.textContent = button.dataset.copySuccess;
        } catch (error) {
            label.textContent = button.dataset.copyError;
        }
        window.setTimeout(function () {
            label.textContent = original;
            button.disabled = false;
        }, 1800);
    });
}());
