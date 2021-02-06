const replacements = {
  economia: "música",
  econômico: "musical",
  econômica: "musical",
  economista: "músico",
  neoliberais: "metaleiros",
  neoliberal: "metaleiro",
  neoliberalismo: "heavy metal",
  liberais: "rockeiros",
  liberal: "rockeiro",
  liberalismo: "rock",
};

const regexes = Object.entries(replacements).flatMap(
  ([k, v]) =>
    [
      [new RegExp(`\\b${k}\\b`, "g"), v],
      [new RegExp(`\\b${k.toUpperCase()}\\b`, "g"), v.toUpperCase()],
      [
        new RegExp(`\\b${k[0]!.toUpperCase()}${k.slice(1)}\\b`, "g"),
        `${v[0]!.toUpperCase()}${v.slice(1)}`,
      ],
    ] as [RegExp, string][]
);

const replaceText = (node?: Node) => {
  if (!node) {
    return;
  }

  // Setting textContent on a node removes all of its children and replaces
  // them with a single text node. Since we don't want to alter the DOM aside
  // from substituting text, we only substitute on single text nodes.
  // @see https://developer.mozilla.org/en-US/docs/Web/API/Node/textContent
  if (node.nodeType === Node.TEXT_NODE) {
    // This node only contains text.
    // @see https://developer.mozilla.org/en-US/docs/Web/API/Node/nodeType.

    // Skip textarea nodes due to the potential for accidental submission
    // of substituted words where none was intended.
    if (node.parentNode?.nodeName === "TEXTAREA") {
      return;
    }

    if (!node.textContent) {
      return;
    }

    // Because DOM manipulation is slow, we don't want to keep setting
    // textContent after every replacement. Instead, manipulate a copy of
    // this string outside of the DOM and then perform the manipulation
    // once, at the end.
    node.textContent = regexes.reduce(
      (content, [regex, replacement]) => content.replace(regex, replacement),
      node.textContent
    );
  } else {
    // This node contains more than just text, call replaceText() on each
    // of its children.
    node.childNodes.forEach((childNode) => {
      replaceText(childNode);
    });
  }
};

// Start the recursion from the body tag.
replaceText(document.body);

// @see https://developer.mozilla.org/en-US/docs/Web/API/MutationObserver.
const observer = new MutationObserver((mutations) => {
  mutations.forEach((mutation) => {
    // This DOM change was new nodes being added. Run our substitution
    // algorithm on each newly added node.
    mutation.addedNodes.forEach((newNode) => {
      replaceText(newNode);
    });
  });
});

observer.observe(document.body, {
  childList: true,
  subtree: true,
});
