"use strict";

import * as cast from "./cast";

import { onMessage } from "./messageBridge";


const global = (window as any);

if (!global.chrome) {
    global.chrome = {};
}

global.chrome.cast = cast;

/**
 * If loaded within a page via a <script> element,
 * document.currentScript should exist and we can check its
 * [src] query string for the loadCastFramework param.
 */
if (document.currentScript) {
    const currentScript = (document.currentScript as HTMLScriptElement);
    const currentScriptUrl = new URL(currentScript.src);
    const currentScriptParams = new URLSearchParams(currentScriptUrl.search);

    // Load Framework API if requested
    if (currentScriptParams.get("loadCastFramework") === "1") {
        if (!global.cast) {
            global.cast = {};
        }

        import("./framework").then(framework => {
            global.cast.framework = framework.default;
        });
    }
}


onMessage(message => {
    switch (message.subject) {
        case "shim:/initialized": {
            const bridgeInfo = message.data;

            // Call page's API loaded function if defined
            const readyFunction = global.__onGCastApiAvailable;
            if (readyFunction && typeof readyFunction === "function") {
                readyFunction(bridgeInfo && bridgeInfo.isVersionCompatible);
            }

            break;
        }
    }
});
