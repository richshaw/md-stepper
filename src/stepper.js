(function() {
    'use strict';

  angular
  .module('material.components.stepper',['material.core','material.core.theming.componentTheme'])
  .directive('mdStepper', stepperDirective)
  .directive('mdStep', stepDirective)
  .directive('mdStepCircle', stepCircleDirective)
  .directive('mdStepText', stepTextDirective)
  .constant("$MD_STEPPER_THEME_CSS", "md-stepper.md-THEME_NAME-theme md-step md-step-circle{background-color:'{{background-500}}'}md-stepper.md-THEME_NAME-theme.stepper-horizontal md-step md-step-line{border-top-color:'{{background-400}}'}md-stepper.md-THEME_NAME-theme.md-primary md-step.active md-step-circle,md-stepper.md-THEME_NAME-theme.md-primary md-step.done md-step-circle{color:'{{primary-contrast}}';background-color:'{{primary-color}}'}md-stepper.md-THEME_NAME-theme.md-primary md-step.active md-step-circle:not([disabled]) md-icon,md-stepper.md-THEME_NAME-theme.md-primary md-step.done md-step-circle:not([disabled]) md-icon{color:'{{primary-contrast}}'}md-stepper.md-THEME_NAME-theme.md-primary md-step.active md-step-circle:not([disabled]):hover,md-stepper.md-THEME_NAME-theme.md-primary md-step.done md-step-circle:not([disabled]):hover{background-color:'{{primary-color}}'}md-stepper.md-THEME_NAME-theme.md-primary md-step.active md-step-circle:not([disabled]).md-focused,md-stepper.md-THEME_NAME-theme.md-primary md-step.done md-step-circle:not([disabled]).md-focused{background-color:'{{primary-600}}'}md-stepper.md-THEME_NAME-theme.md-primary md-step.md-warn md-step-circle{color:'{{warn-contrast}}';background-color:'{{warn-color}}'}md-stepper.md-THEME_NAME-theme.md-primary md-step.md-warn md-step-circle:not([disabled]) md-icon{color:'{{warn-contrast}}'}md-stepper.md-THEME_NAME-theme.md-primary md-step.md-warn md-step-circle:not([disabled]):hover{background-color:'{{warn-color}}'}md-stepper.md-THEME_NAME-theme.md-primary md-step.md-warn md-step-circle:not([disabled]).md-focused{background-color:'{{warn-700}}'}md-stepper.md-THEME_NAME-theme.md-primary md-step.md-accent md-step-circle{color:'{{accent-contrast}}';background-color:'{{accent-color}}'}md-stepper.md-THEME_NAME-theme.md-primary md-step.md-accent md-step-circle:not([disabled]) md-icon{color:'{{accent-contrast}}'}md-stepper.md-THEME_NAME-theme.md-primary md-step.md-accent md-step-circle:not([disabled]):hover{background-color:'{{accent-color}}'}md-stepper.md-THEME_NAME-theme.md-primary md-step.md-accent md-step-circle:not([disabled]).md-focused{background-color:'{{accent-700}}'}");


  stepperDirective.$inject = ['$injector','$mdComponentTheme'];

  function stepperDirective($injector,$mdComponentTheme) {

    var themeCss = $injector.get('$MD_STEPPER_THEME_CSS');
    $mdComponentTheme.generateTheme(themeCss);

    /**
    Vertical
    <div class="stepper">
      <div class="step done">
        <div>
          <div class="circle">n</div>
          <div class="line"></div>
        </div>
        <div>
          <div class="title">Title</div>
          <div class="body">Body</div>
        </div>
      </div>
    </div>
    Horizontal
    <div class="stepper">
      <div class="step active">
        <div>
          <div class="circle">n</div>
        </div>
        <div>
          <div class="title">Title</div>
          <div class="body">Body</div>
        </div>
        <div>
          <div class="line"></div>
        </div>
      </div>
    </div>
    */
    return {
      restrict:'E',
      scope: {
        direction: '@mdDirection',
      },
      link: stepperLink
    }

  
    function stepperLink(scope, element, attr) {
      element.addClass('stepper');
      var direction = scope.direction;
      element.addClass('layout-row');
      element.addClass('stepper-' +  direction);
    }

  }

  /**
  Step
  */

  stepDirective.$inject = ['$compile'];

  function stepDirective($compile) {

    var verticalTemplate = '<div class="step layout-column"><div><div class="step-circle">{{number}}</div><div class="step-line flex"></div></div><div><div class="step-title">{{title}}</div><div class="step-text">{{text}}</div></div></div>';

    var horizontalTemplate = '<ng-transclude></ng-transclude><div class="step-line flex"></div>';

    var getTemplate = function(direction) {
        var template = '';

        switch(direction) {
            case 'vertical':
                template = verticalTemplate;
                break;
            case 'horizontal':
                template = horizontalTemplate;
                break;
        }
        return template;
    }


    return {
      restrict:'E',
      transclude: 'true',
      template: '<div class="layout-row" ng-transclude></div><md-step-line class="flex"></md-step-line>',
      scope: {},
      link: stepLink
    }

    function stepLink(scope, element, attr) {
      //element.html(getTemplate('horizontal'));
      //$compile(element.contents())(scope);
      //<div class="step layout-row flex" ng-class="{\'active\':active, \'optional\':optional, \'done\':done}">
      element.addClass('layout-row');
      element.addClass('flex');
    }

  }  


  /**
  Step circle
  */
  function stepCircleDirective() {
    return {
      restrict:'E',
    }
  } 

  /**
  Step text
  */
  function stepTextDirective() {
    return {
      restrict:'E',
      transclude: true,
      template: '<ng-transclude></ng-transclude><div ng-if="optional" class="step-optional">Optional</div>',
      scope: {
        optional: '=mdStepOptional',
      },
      link: stepTextLink
    }

    function stepTextLink(scope, element, attr) {
      if(scope.optional === true) {
        element.addClass('optional');
      }
    }

  } 
  
})();