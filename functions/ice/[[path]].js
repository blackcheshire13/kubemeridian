// Vanity import path for the ICE Go module: devopstech.net/ice.
//
// The `go` tool resolves `devopstech.net/ice/<pkg>` by fetching
// https://devopstech.net/ice/<pkg>?go-get=1 and reading the go-import meta tag,
// so every subpath must answer, not only /ice. Pages serves the product pages at
// /ice/ statically; this function answers only `?go-get=1` and hands everything
// else back to the static site. Moving the repository again means changing REPO
// here — the module path in go.mod stays.
const MODULE = "devopstech.net/ice";
const REPO = "https://github.com/devopstech-net/ice";

export async function onRequest(context) {
  const url = new URL(context.request.url);
  if (url.searchParams.get("go-get") !== "1") {
    return context.next();
  }
  const body =
    "<!doctype html>\n<html><head>\n" +
    `<meta name="go-import" content="${MODULE} git ${REPO}">\n` +
    `<meta name="go-source" content="${MODULE} ${REPO} ${REPO}/tree/main{/dir} ${REPO}/blob/main{/dir}/{file}#L{line}">\n` +
    `</head><body>go get ${MODULE}</body></html>\n`;
  return new Response(body, {
    headers: {
      "content-type": "text/html; charset=utf-8",
      "cache-control": "public, max-age=300",
    },
  });
}
