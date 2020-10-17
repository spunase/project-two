import {Runtime, Inspector} from "https://cdn.jsdelivr.net/npm/@observablehq/runtime@4/dist/runtime.js";
import define from "https://api.observablehq.com/@smukati/dot-plot.js?v=3";

const runtime = new Runtime();
const main = runtime.module(define, Inspector.into(document.body));
