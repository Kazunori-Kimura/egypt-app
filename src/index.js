const riot = require("riot");
const tag = require("./tags");

const observer = riot.observable();
riot.mount("*", { observer });
