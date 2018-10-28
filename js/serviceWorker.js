if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('/sw.js').then(reg =>
    {
        reg.addEventListener('updatefound',
            () =>
            {
                const newWorker = reg.installing;
                newWorker.addEventListener('statechange',
                    () =>
                    {
                        if (newWorker.state === "installed") {
                            updServiceWorker(newWorker);
                        }
                    });
            });
    });
    navigator.serviceWorker.addEventListener('controllerchange',
        () =>
        {
            window.location.reload();
        });
}

function updServiceWorker(worker)
{
    toastr.info("<button type='button' id='refreshServiceWorker' class='btn btn-primary'>Refresh</button>",
        'New version available',
        {
            closeButton: true,
            allowHtml: true,
            timeOut: 0,
            onShown: function(toast)
            {
                $("#refreshServiceWorker").click(() =>
                {
                    worker.postMessage({ action: 'skipWaiting' });
                });
            }
        });
}