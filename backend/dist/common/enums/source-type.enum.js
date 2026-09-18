"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ContentStatus = exports.SourceType = exports.SearchType = void 0;
var SearchType;
(function (SearchType) {
    SearchType["WEB"] = "web";
    SearchType["NEWS"] = "news";
    SearchType["SCHOLAR"] = "scholar";
})(SearchType || (exports.SearchType = SearchType = {}));
var SourceType;
(function (SourceType) {
    SourceType["WEB"] = "web";
    SourceType["NEWS"] = "news";
    SourceType["SCHOLAR"] = "scholar";
    SourceType["COMPANY"] = "company";
    SourceType["REPORT"] = "report";
    SourceType["OTHER"] = "other";
})(SourceType || (exports.SourceType = SourceType = {}));
var ContentStatus;
(function (ContentStatus) {
    ContentStatus["PENDING"] = "pending";
    ContentStatus["EXTRACTED"] = "extracted";
    ContentStatus["FAILED"] = "failed";
    ContentStatus["SKIPPED"] = "skipped";
})(ContentStatus || (exports.ContentStatus = ContentStatus = {}));
//# sourceMappingURL=source-type.enum.js.map