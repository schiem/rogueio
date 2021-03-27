/*
 * ATTENTION: The "eval" devtool has been used (maybe by default in mode: "development").
 * This devtool is neither made for production nor for readable output files.
 * It uses "eval()" calls to create a separate source file in the browser devtools.
 * If you are trying to read the output file, select a different devtool (https://webpack.js.org/configuration/devtool/)
 * or disable the default devtool with "devtool: false".
 * If you are looking for production-ready output files, see mode: "production" (https://webpack.js.org/configuration/mode/).
 */
/******/ (() => { // webpackBootstrap
/******/ 	"use strict";
/******/ 	var __webpack_modules__ = ({

/***/ "./src/index.ts":
/*!**********************!*\
  !*** ./src/index.ts ***!
  \**********************/
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {

eval("\nObject.defineProperty(exports, \"__esModule\", ({ value: true }));\nvar ViewPort_1 = __webpack_require__(/*! ./rendering/ViewPort */ \"./src/rendering/ViewPort.ts\");\nvar SpriteSheet_1 = __webpack_require__(/*! ./rendering/SpriteSheet */ \"./src/rendering/SpriteSheet.ts\");\nvar BSP_1 = __webpack_require__(/*! ../../common/src/utils/BSP */ \"../common/src/utils/BSP.ts\");\nvar canvas = document.getElementById('viewport');\nvar spriteWidth = 14;\nvar spriteHeight = 25;\nvar spriteSheet = new SpriteSheet_1.SpriteSheet(spriteWidth, spriteHeight, '/dist/assets/img/fira_code_regular_14.png');\nvar viewport = new ViewPort_1.ViewPort({ x: 256, y: 128 }, spriteSheet, canvas);\nspriteSheet.onReady(function () {\n    var bsp = new BSP_1.RandomBSP({ x: 0, y: 0 }, { x: viewport.size.x - 1, y: viewport.size.y - 1 });\n    bsp.split(8, 16);\n    var rectangles = bsp.getChildRectangles();\n    console.log(rectangles.length);\n    rectangles.forEach(function (rectangle) {\n        spriteSheet.drawRectangle(3, rectangle, viewport.ctx);\n    });\n});\n\n\n//# sourceURL=webpack://client/./src/index.ts?");

/***/ }),

/***/ "./src/rendering/SpriteSheet.ts":
/*!**************************************!*\
  !*** ./src/rendering/SpriteSheet.ts ***!
  \**************************************/
/***/ ((__unused_webpack_module, exports) => {

eval("\nObject.defineProperty(exports, \"__esModule\", ({ value: true }));\nexports.SpriteSheet = void 0;\nvar SpriteSheet = /** @class */ (function () {\n    function SpriteSheet(spriteWidth, spriteHeight, spriteSheetSrc) {\n        var _this = this;\n        this.spriteWidth = spriteWidth;\n        this.spriteHeight = spriteHeight;\n        this.spriteSheetSrc = spriteSheetSrc;\n        this.numSprites = 0;\n        this.ready = false;\n        this.onReadyFunctions = [];\n        this.sheetElement = new Image();\n        this.sheetElement.src = spriteSheetSrc;\n        this.sheetElement.onload = function () {\n            _this.ready = true;\n            _this.numSprites = _this.sheetElement.width / _this.spriteWidth;\n            _this.onReadyFunctions.forEach(function (func) {\n                func();\n            });\n        };\n    }\n    SpriteSheet.prototype.onReady = function (func) {\n        if (this.ready) {\n            func();\n        }\n        else {\n            this.onReadyFunctions.push(func);\n        }\n    };\n    SpriteSheet.prototype.drawRectangle = function (sprite, rect, ctx, fill) {\n        var _this = this;\n        if (fill === void 0) { fill = false; }\n        if (fill) {\n            for (var x = rect.topLeft.x; x <= rect.bottomRight.x; x++) {\n                for (var y = rect.topLeft.y; y <= rect.bottomRight.y; y++) {\n                    this.drawSprite(sprite, { x: x, y: y }, ctx);\n                }\n            }\n        }\n        else {\n            [rect.topLeft.y, rect.bottomRight.y].forEach(function (y) {\n                for (var x = rect.topLeft.x; x <= rect.bottomRight.x; x++) {\n                    _this.drawSprite(sprite, { x: x, y: y }, ctx);\n                }\n            });\n            [rect.topLeft.x, rect.bottomRight.x].forEach(function (x) {\n                for (var y = rect.topLeft.y + 1; y < rect.bottomRight.y; y++) {\n                    _this.drawSprite(sprite, { x: x, y: y }, ctx);\n                }\n            });\n        }\n    };\n    SpriteSheet.prototype.drawSprite = function (sprite, location, ctx) {\n        if (!this.ready || sprite > this.numSprites) {\n            throw new Error('Could not draw the sprite, either they have not been loaded or the sprite does not exist.');\n        }\n        var x = location.x * this.spriteWidth;\n        var y = location.y * this.spriteHeight;\n        ctx.clearRect(x, y, this.spriteWidth, this.spriteHeight);\n        ctx.drawImage(this.sheetElement, this.spriteWidth * sprite, 0, this.spriteWidth, this.spriteHeight, x, y, this.spriteWidth, this.spriteHeight);\n    };\n    return SpriteSheet;\n}());\nexports.SpriteSheet = SpriteSheet;\n\n\n//# sourceURL=webpack://client/./src/rendering/SpriteSheet.ts?");

/***/ }),

/***/ "./src/rendering/ViewPort.ts":
/*!***********************************!*\
  !*** ./src/rendering/ViewPort.ts ***!
  \***********************************/
/***/ ((__unused_webpack_module, exports) => {

eval("\nObject.defineProperty(exports, \"__esModule\", ({ value: true }));\nexports.ViewPort = void 0;\nvar ViewPort = /** @class */ (function () {\n    function ViewPort(size, spriteSheet, canvas) {\n        this.size = size;\n        this.spriteSheet = spriteSheet;\n        this.canvas = canvas;\n        this.offset = { x: 0, y: 0 };\n        this.canvas.width = spriteSheet.spriteWidth * this.size.x;\n        this.canvas.height = spriteSheet.spriteHeight * this.size.y;\n        this.ctx = this.canvas.getContext('2d', { alpha: false });\n    }\n    return ViewPort;\n}());\nexports.ViewPort = ViewPort;\n\n\n//# sourceURL=webpack://client/./src/rendering/ViewPort.ts?");

/***/ }),

/***/ "../common/src/models/Rectangle.ts":
/*!*****************************************!*\
  !*** ../common/src/models/Rectangle.ts ***!
  \*****************************************/
/***/ ((__unused_webpack_module, exports) => {

eval("\nObject.defineProperty(exports, \"__esModule\", ({ value: true }));\nexports.Rectangle = void 0;\nvar Rectangle = /** @class */ (function () {\n    function Rectangle(location, size) {\n        this.location = location;\n        this.size = size;\n        this.topLeft = location;\n        this.bottomRight = { x: location.x + size.x, y: location.y + size.y };\n    }\n    Rectangle.prototype.overlapsWith = function (other) {\n        return !(this.bottomRight.x <= other.topLeft.x || this.topLeft.x >= other.bottomRight.x ||\n            this.bottomRight.y <= other.topLeft.y || this.topLeft.y >= other.bottomRight.y);\n    };\n    return Rectangle;\n}());\nexports.Rectangle = Rectangle;\n\n\n//# sourceURL=webpack://client/../common/src/models/Rectangle.ts?");

/***/ }),

/***/ "../common/src/utils/BSP.ts":
/*!**********************************!*\
  !*** ../common/src/utils/BSP.ts ***!
  \**********************************/
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {

eval("\nObject.defineProperty(exports, \"__esModule\", ({ value: true }));\nexports.RandomBSP = void 0;\nvar Rectangle_1 = __webpack_require__(/*! ../models/Rectangle */ \"../common/src/models/Rectangle.ts\");\nvar RandomBSP = /** @class */ (function () {\n    function RandomBSP(coords, size) {\n        this.children = [];\n        this.rect = new Rectangle_1.Rectangle(coords, size);\n    }\n    // returns true if it has at least one terminal leaf\n    RandomBSP.prototype.split = function (minSize, maxSize) {\n        var _this = this;\n        // this rectangle can contain a room - don't try to split it\n        if (this.rect.size.x <= maxSize && this.rect.size.x >= minSize &&\n            this.rect.size.y <= maxSize && this.rect.size.y >= minSize) {\n            return true;\n        }\n        // decide which direction to split\n        var splitCoords = { x: 0, y: 0 };\n        var splitSize;\n        var otherCoords = this.rect.location;\n        var otherSize;\n        if (this.rect.size.x > this.rect.size.y * 1.5) {\n            splitCoords.y = this.rect.location.y;\n            var xOffset = this.getSplitPoint(this.rect.size.x, minSize);\n            splitCoords.x = xOffset + this.rect.location.x;\n            splitSize = { x: this.rect.size.x - xOffset, y: this.rect.size.y };\n            otherSize = { x: this.rect.size.x - splitSize.x, y: this.rect.size.y };\n        }\n        else {\n            splitCoords.x = this.rect.location.x;\n            var yOffset = this.getSplitPoint(this.rect.size.y, minSize);\n            splitCoords.y = yOffset + this.rect.location.y;\n            splitSize = { x: this.rect.size.x, y: this.rect.size.y - yOffset };\n            otherSize = { x: this.rect.size.x, y: this.rect.size.y - splitSize.y };\n        }\n        var children = [];\n        if (splitSize.x > minSize && splitSize.y > minSize) {\n            children.push(new RandomBSP(splitCoords, splitSize));\n        }\n        if (otherSize.x > minSize && otherSize.y > minSize) {\n            children.push(new RandomBSP(otherCoords, otherSize));\n        }\n        var hasChild = false;\n        if (children.length) {\n            children.forEach(function (child) {\n                if (child.split(minSize, maxSize)) {\n                    _this.children.push(child);\n                    hasChild = true;\n                }\n            });\n        }\n        return hasChild;\n    };\n    RandomBSP.prototype.getChildRectangles = function () {\n        if (this.children.length === 0) {\n            return [this.rect];\n        }\n        var rectangles = [];\n        this.children.forEach(function (child) {\n            rectangles.push.apply(rectangles, child.getChildRectangles());\n        });\n        return rectangles;\n    };\n    RandomBSP.prototype.getSplitPoint = function (size, minSize) {\n        var floor;\n        var ceil;\n        var halfSize = size / 2;\n        if (size > minSize * 2) {\n            //we have a space larger than double the minimum size, split close to the center\n            floor = Math.floor(halfSize - (minSize / 2));\n            ceil = Math.ceil(halfSize + (minSize / 2));\n        }\n        else {\n            //we only have enough space to fit one room in here, allow it to split closer to the sides\n            floor = Math.floor(minSize / 2);\n            ceil = Math.ceil(size - minSize / 2);\n        }\n        var range = ceil - floor;\n        return Math.floor(Math.random() * range) + floor;\n    };\n    return RandomBSP;\n}());\nexports.RandomBSP = RandomBSP;\n\n\n//# sourceURL=webpack://client/../common/src/utils/BSP.ts?");

/***/ })

/******/ 	});
/************************************************************************/
/******/ 	// The module cache
/******/ 	var __webpack_module_cache__ = {};
/******/ 	
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/ 		// Check if module is in cache
/******/ 		var cachedModule = __webpack_module_cache__[moduleId];
/******/ 		if (cachedModule !== undefined) {
/******/ 			return cachedModule.exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = __webpack_module_cache__[moduleId] = {
/******/ 			// no module.id needed
/******/ 			// no module.loaded needed
/******/ 			exports: {}
/******/ 		};
/******/ 	
/******/ 		// Execute the module function
/******/ 		__webpack_modules__[moduleId](module, module.exports, __webpack_require__);
/******/ 	
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/ 	
/************************************************************************/
/******/ 	
/******/ 	// startup
/******/ 	// Load entry module and return exports
/******/ 	// This entry module can't be inlined because the eval devtool is used.
/******/ 	var __webpack_exports__ = __webpack_require__("./src/index.ts");
/******/ 	
/******/ })()
;