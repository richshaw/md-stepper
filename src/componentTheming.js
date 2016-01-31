(function() {
    'use strict';

    angular
        .module('material.core.theming.componentTheme', ['material.core.theming'])
        .factory('$mdComponentTheme', mdComponentThemeFactory);

    mdComponentThemeFactory.$inject = ['$mdTheming', '$mdColorPalette'];

    function mdComponentThemeFactory($mdTheming, $mdColorPalette) {

        // In memory generated CSS rules; registered by theme.name
        var GENERATED = {};

        // In memory storage of defined themes and color palettes (both loaded by CSS, and user specified)
        var PALETTES = $mdColorPalette;
        angular.extend(PALETTES, $mdTheming.PALETTES);

        //Get chosen themes
        var THEMES = $mdTheming.THEMES;

        var THEME_COLOR_TYPES = ['primary', 'accent', 'warn', 'background'];

        var rulesByType = {};

        // Whether or not themes are to be generated on-demand (vs. eagerly).
        var generateOnDemand = false;

        var defaultTheme = 'default';

        function generateComponentTheme(themeCss) {

            var head = document.head;
            var firstChild = head ? head.firstElementChild : null;

            if (!firstChild) return;
            if (themeCss.length === 0) return; // no rules, so no point in running this expensive task

            // Expose contrast colors for palettes to ensure that text is always readable
            angular.forEach(PALETTES, sanitizePalette);

            // Break the CSS into individual rules
            var rules = themeCss
                .split(/\}(?!(\}|'|"|;))/)
                .filter(function(rule) {
                    return rule && rule.length;
                })
                .map(function(rule) {
                    return rule.trim() + '}';
                });

            var ruleMatchRegex = new RegExp('md-(' + THEME_COLOR_TYPES.join('|') + ')', 'g');

            THEME_COLOR_TYPES.forEach(function(type) {
                rulesByType[type] = '';
            });

            // Sort the rules based on type, allowing us to do color substitution on a per-type basis
            rules.forEach(function(rule) {
                var match = rule.match(ruleMatchRegex);
                // First: test that if the rule has '.md-accent', it goes into the accent set of rules
                for (var i = 0, type; type = THEME_COLOR_TYPES[i]; i++) {
                    if (rule.indexOf('.md-' + type) > -1) {
                        return rulesByType[type] += rule;
                    }
                }

                // If no eg 'md-accent' class is found, try to just find 'accent' in the rule and guess from
                // there
                for (i = 0; type = THEME_COLOR_TYPES[i]; i++) {
                    if (rule.indexOf(type) > -1) {
                        return rulesByType[type] += rule;
                    }
                }

                // Default to the primary array
                return rulesByType[DEFAULT_COLOR_TYPE] += rule;
            });

            // If themes are being generated on-demand, quit here. The user will later manually
            // call generateTheme to do this on a theme-by-theme basis.
            if (generateOnDemand) return;


            angular.forEach(THEMES, function(theme) {
                if (!GENERATED[theme.name]) {
                    //$mdTheming.generateTheme(theme.name);
                    generateTheme(theme.name);
                }
            });

            // *************************
            // Internal functions
            // *************************

            // The user specifies a 'default' contrast color as either light or dark,
            // then explicitly lists which hues are the opposite contrast (eg. A100 has dark, A200 has light)
            function sanitizePalette(palette) {
                var defaultContrast = palette.contrastDefaultColor;
                var lightColors = palette.contrastLightColors || [];
                var strongLightColors = palette.contrastStrongLightColors || [];
                var darkColors = palette.contrastDarkColors || [];

                // These colors are provided as space-separated lists
                if (typeof lightColors === 'string') lightColors = lightColors.split(' ');
                if (typeof strongLightColors === 'string') strongLightColors = strongLightColors.split(' ');
                if (typeof darkColors === 'string') darkColors = darkColors.split(' ');

                // Cleanup after ourselves
                delete palette.contrastDefaultColor;
                delete palette.contrastLightColors;
                delete palette.contrastStrongLightColors;
                delete palette.contrastDarkColors;

                // Change { 'A100': '#fffeee' } to { 'A100': { value: '#fffeee', contrast:DARK_CONTRAST_COLOR }
                angular.forEach(palette, function(hueValue, hueName) {
                    if (angular.isObject(hueValue)) return; // Already converted
                    // Map everything to rgb colors
                    var rgbValue = colorToRgbaArray(hueValue);
                    if (!rgbValue) {
                        throw new Error("Color %1, in palette %2's hue %3, is invalid. Hex or rgb(a) color expected."
                            .replace('%1', hueValue)
                            .replace('%2', palette.name)
                            .replace('%3', hueName));
                    }

                    palette[hueName] = {
                        value: rgbValue,
                        contrast: getContrastColor()
                    };

                    function getContrastColor() {
                        if (defaultContrast === 'light') {
                            if (darkColors.indexOf(hueName) > -1) {
                                return DARK_CONTRAST_COLOR;
                            } else {
                                return strongLightColors.indexOf(hueName) > -1 ? STRONG_LIGHT_CONTRAST_COLOR : LIGHT_CONTRAST_COLOR;
                            }
                        } else {
                            if (lightColors.indexOf(hueName) > -1) {
                                return strongLightColors.indexOf(hueName) > -1 ? STRONG_LIGHT_CONTRAST_COLOR : LIGHT_CONTRAST_COLOR;
                            } else {
                                return DARK_CONTRAST_COLOR;
                            }
                        }
                    }
                });
            }
        } ////


        function generateTheme(name, nonce) {
            var theme = THEMES[name];
            var head = document.head;
            var firstChild = head ? head.firstElementChild : null;

            if (!GENERATED[name]) {
                // For each theme, use the color palettes specified for
                // `primary`, `warn` and `accent` to generate CSS rules.
                THEME_COLOR_TYPES.forEach(function(colorType) {
                    var styleStrings = parseRules(theme, colorType, rulesByType[colorType]);
                    while (styleStrings.length) {
                        var styleContent = styleStrings.shift();
                        if (styleContent) {
                            var style = document.createElement('style');
                            style.setAttribute('md-theme-style', '');
                            if (nonce) {
                                style.setAttribute('nonce', nonce);
                            }
                            style.appendChild(document.createTextNode(styleContent));
                            head.insertBefore(style, firstChild);
                        }
                    }
                });


                if (theme.colors.primary.name == theme.colors.accent.name) {
                    console.warn('$mdThemingProvider: Using the same palette for primary and' +
                        ' accent. This violates the material design spec.');
                }

                GENERATED[theme.name] = true;
            }

        }

        function parseRules(theme, colorType, rules) {
            checkValidPalette(theme, colorType);

            rules = rules.replace(/THEME_NAME/g, theme.name);
            var generatedRules = [];
            var color = theme.colors[colorType];

            var themeNameRegex = new RegExp('.md-' + theme.name + '-theme', 'g');
            // Matches '{{ primary-color }}', etc
            var hueRegex = new RegExp('(\'|")?{{\\s*(' + colorType + ')-(color|contrast)-?(\\d\\.?\\d*)?\\s*}}(\"|\')?', 'g');
            var simpleVariableRegex = /'?"?\{\{\s*([a-zA-Z]+)-(A?\d+|hue\-[0-3]|shadow)-?(\d\.?\d*)?(contrast)?\s*\}\}'?"?/g;
            var palette = PALETTES[color.name];

            // find and replace simple variables where we use a specific hue, not an entire palette
            // eg. "{{primary-100}}"
            //\(' + THEME_COLOR_TYPES.join('\|') + '\)'
            rules = rules.replace(simpleVariableRegex, function(match, colorType, hue, opacity, contrast) {
                if (colorType === 'foreground') {
                    if (hue == 'shadow') {
                        return theme.foregroundShadow;
                    } else {
                        return theme.foregroundPalette[hue] || theme.foregroundPalette['1'];
                    }
                }
                if (hue.indexOf('hue') === 0) {
                    hue = theme.colors[colorType].hues[hue];
                }
                return rgba((PALETTES[theme.colors[colorType].name][hue] || '')[contrast ? 'contrast' : 'value'], opacity);
            });

            // For each type, generate rules for each hue (ie. default, md-hue-1, md-hue-2, md-hue-3)
            angular.forEach(color.hues, function(hueValue, hueName) {
                var newRule = rules
                    .replace(hueRegex, function(match, _, colorType, hueType, opacity) {
                        return rgba(palette[hueValue][hueType === 'color' ? 'value' : 'contrast'], opacity);
                    });
                if (hueName !== 'default') {
                    newRule = newRule.replace(themeNameRegex, '.md-' + theme.name + '-theme.md-' + hueName);
                }

                // Don't apply a selector rule to the default theme, making it easier to override
                // styles of the base-component
                if (theme.name == 'default') {
                    var themeRuleRegex = /((?:(?:(?: |>|\.|\w|-|:|\(|\)|\[|\]|"|'|=)+) )?)((?:(?:\w|\.|-)+)?)\.md-default-theme((?: |>|\.|\w|-|:|\(|\)|\[|\]|"|'|=)*)/g;
                    newRule = newRule.replace(themeRuleRegex, function(match, prefix, target, suffix) {
                        return match + ', ' + prefix + target + suffix;
                    });
                }
                generatedRules.push(newRule);
            });

            return generatedRules;
        }


        function checkValidPalette(theme, colorType) {
            // If theme attempts to use a palette that doesnt exist, throw error
            if (!PALETTES[(theme.colors[colorType] || {}).name]) {
                throw new Error(
                    "You supplied an invalid color palette for theme %1's %2 palette. Available palettes: %3"
                    .replace('%1', theme.name)
                    .replace('%2', colorType)
                    .replace('%3', Object.keys(PALETTES).join(', '))
                );
            }
        }


        function rgba(rgbArray, opacity) {
            if (!rgbArray) return "rgb('0,0,0')";

            if (rgbArray.length == 4) {
                rgbArray = angular.copy(rgbArray);
                opacity ? rgbArray.pop() : opacity = rgbArray.pop();
            }
            return opacity && (typeof opacity == 'number' || (typeof opacity == 'string' && opacity.length)) ?
                'rgba(' + rgbArray.join(',') + ',' + opacity + ')' :
                'rgb(' + rgbArray.join(',') + ')';
        }


        return {
            generateTheme: generateComponentTheme,
        }


    }


})();